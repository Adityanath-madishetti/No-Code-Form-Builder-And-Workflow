// src/form/renderer/viewRenderer/FormRunner.tsx

import { useEffect, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { runtimeFormSelector, useRuntimeFormStore } from './runtimeForm.store';
import { useShallow } from 'zustand/react/shallow';
import { backendToFrontend } from '@/lib/frontendBackendCompArray';
import { getComponentRenderer } from '@/form/registry/componentRegistry';
import type { ComponentID } from '@/form/components/base';
import { FormLogicEngine } from '@/form/logic/formLogicEngine';
import { Button } from '@/components/ui/button';

let globalGetValues: ((instanceId: string) => unknown) | null = null;

// eslint-disable-next-line react-refresh/only-export-components
export const getGlobalFieldValue = (instanceId: string): unknown => {
  if (!globalGetValues) {
    console.warn(
      `FormRunner is not mounted. Cannot read value for: ${instanceId}`
    );
    return undefined;
  }
  return globalGetValues(instanceId);
};

export function FormRunner() {
  const methods = useForm<Record<string, unknown>>({
    shouldUnregister: false,
    defaultValues: {},
  });

  const formData = useRuntimeFormStore((state) => state.formData);

  const logicEngineRef = useRef<FormLogicEngine | null>(null);

  // --- CIRCUIT BREAKER REF ---
  const cascadeCount = useRef(0);
  const cascadeResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const componentsData = useRuntimeFormStore(
    useShallow(runtimeFormSelector.currentPageComponentData)
  );

  const componentsStates = useRuntimeFormStore(
    useShallow(runtimeFormSelector.currentPageComponentStates)
  );

  const currentPageId = useRuntimeFormStore(runtimeFormSelector.currentPageId);
  const renderState = useRuntimeFormStore(runtimeFormSelector.renderState);
  const setActivePage = useRuntimeFormStore((s) => s.setActivePage);

  useEffect(() => {
    const rules = formData?.version.logic?.rules || [];
    const formulas = formData?.version.logic?.formulas || [];
    if (rules?.length > 0 || formulas?.length > 0) {
      logicEngineRef.current = new FormLogicEngine(rules, formulas);
      triggerLogicEvaluation(methods.getValues());
    }
  }, [formData, methods]);

  const triggerLogicEvaluation = async (
    currentValues: Record<string, unknown>
  ) => {
    if (!logicEngineRef.current) return;

    // --- 1. CIRCUIT BREAKER CHECK ---
    if (cascadeCount.current > 10) {
      console.error(
        'Logic Circuit Breaker Tripped! Infinite loop detected and aborted.'
      );
      return;
    }

    cascadeCount.current++;
    if (cascadeResetTimer.current) clearTimeout(cascadeResetTimer.current);
    cascadeResetTimer.current = setTimeout(() => {
      cascadeCount.current = 0; // Reset after things settle down
    }, 100);
    // --------------------------------

    const { actions, computedValues } =
      await logicEngineRef.current.evaluate(currentValues);

    // --- 2. ACTION DEDUPLICATION (The "Partial Ordering") ---
    const visibilityPatch: Record<string, boolean> = {};
    const enabledPatch: Record<string, boolean> = {};
    const valuePatch: Record<string, unknown> = {};

    actions.forEach((action) => {
      // If multiple rules target the same component, the last one evaluated wins.
      switch (action.type) {
        case 'SHOW':
          visibilityPatch[action.targetId] = true;
          break;
        case 'HIDE':
          visibilityPatch[action.targetId] = false;
          break;
        case 'ENABLE':
          enabledPatch[action.targetId] = true;
          break;
        case 'DISABLE':
          enabledPatch[action.targetId] = false;
          break;
        case 'SET_VALUE':
          valuePatch[action.targetId] = action.value;
          break;
        case 'SKIP_PAGE':
          // store.addSkippedPage(action.targetId);
          break;
      }
    });

    // Formulas take precedence over standard SET_VALUE actions
    Object.entries(computedValues).forEach(([targetId, computedValue]) => {
      valuePatch[targetId] = computedValue;
    });

    // --- 3. APPLY PATCHES CLEANLY ---
    const store = useRuntimeFormStore.getState();

    Object.entries(visibilityPatch).forEach(([targetId, isVisible]) => {
      store.setComponentVisibility(targetId, isVisible);
    });

    Object.entries(enabledPatch).forEach(([targetId, isEnabled]) => {
      store.setComponentEnabled(targetId, isEnabled);
    });

    // Apply values to React Hook Form (Strictly checking to prevent trigger loops)
    Object.entries(valuePatch).forEach(([targetId, newValue]) => {
      if (currentValues[targetId] !== newValue) {
        methods.setValue(targetId, newValue, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    });
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/incompatible-library
    const subscription = methods.watch((value) => {
      triggerLogicEvaluation(value as Record<string, unknown>);
    });

    return () => subscription.unsubscribe();
  }, [methods, methods.watch]);

  useEffect(() => {
    globalGetValues = methods.getValues;
    return () => {
      globalGetValues = null;
    };
  }, [methods.getValues]);

  const onSubmit = (data: unknown) => {
    console.log('Valid Form Data:', data);
  };

  const currentPageState =
    currentPageId && renderState ? renderState.PageStates[currentPageId] : null;

  const hasPrevious = !!currentPageState?.previousPageId;
  const hasNext = !!currentPageState?.nextPageId;

  const handleNext = async () => {
    const currentInstanceIds = componentsData.map((comp) => comp.componentId);
    const isPageValid = await methods.trigger(currentInstanceIds);
    if (!isPageValid) {
      console.log('Validation failed. Staying on current page.');
      return;
    }

    if (currentPageState?.nextPageId) {
      setActivePage(currentPageState.nextPageId);
    }
  };

  const handleBack = () => {
    if (currentPageState?.previousPageId) {
      setActivePage(currentPageState.previousPageId);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        {/* Render the components for the active page */}
        <div className="space-y-4">
          {componentsData.length === 0 ? (
            <p className="text-gray-500">
              No components to display on this page.
            </p>
          ) : (
            componentsData.map((comp) => {
              const frontendId = backendToFrontend[comp.componentType];
              const Renderer = getComponentRenderer(frontendId as ComponentID);

              const isHidden =
                componentsStates[comp.componentId]?.isHidden ?? false;
              if (isHidden) {
                return null;
              }

              if (!Renderer) {
                return (
                  <div
                    key={comp.componentId}
                    className="border bg-red-50 p-4 text-red-500"
                  >
                    Unknown component type: {comp.componentType}
                  </div>
                );
              }

              return (
                <div
                  key={comp.componentId}
                  className="rounded-md border bg-gray-50 p-4 shadow-sm"
                >
                  <p className="text-sm font-medium text-gray-700">
                    Label: <span className="font-bold">{comp.label}</span>
                  </p>
                  <p className="mb-4 text-xs text-gray-500">
                    Instance ID: {comp.componentId} | Type: {comp.componentType}
                  </p>
                  <Renderer
                    key={comp.componentId}
                    metadata={null}
                    props={comp.props}
                    validation={comp.validation}
                    instanceId={comp.componentId}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* --- Pagination Controls --- */}
        <div className="mt-8 flex items-center justify-between border-t pt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={handleBack}
            disabled={!hasPrevious}
          >
            Back
          </Button>

          {hasNext ? (
            <Button
              type="button"
              onClick={handleNext}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              className="bg-green-600 text-white hover:bg-green-700"
            >
              Submit
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}

/**
 *  
// src/logic/ast-evaluator.ts
import { getGlobalFieldValue } from '@/form/renderer/viewRenderer/RenderForm';

export function evaluateCondition(targetId: string, expectedValue: string) {
  // Grab the value directly from the active RHF instance
  const currentValue = getGlobalFieldValue(targetId);
  
  return currentValue === expectedValue;
}
 */
