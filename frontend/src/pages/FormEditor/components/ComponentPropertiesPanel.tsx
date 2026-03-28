// src/pages/FormEditor/components/ComponentPropertiesPanel.tsx

import { useFormStore, formSelectors } from '@/form/store/formStore';
import { getComponentPropsRenderer } from '@/form/registry/componentRegistry';

export function ComponentPropertiesPanel() {
  const selectedComponent = useFormStore(formSelectors.selectedComponent);

  const PropsRenderer = selectedComponent
    ? getComponentPropsRenderer(selectedComponent.id)
    : null;

  if (!selectedComponent) {
    return (
      <div className="flex h-40 flex-col items-center justify-center text-center text-muted-foreground">
        <p className="text-sm">
          Select a component on the canvas to edit its properties.
        </p>
      </div>
    );
  }

  return (
    <div className="">
      {/* <h3 className="border-b pb-2 text-lg font-semibold">
        Editing: {selectedComponent.id}
      </h3> */}

      {PropsRenderer ? (
        // eslint-disable-next-line react-hooks/static-components
        <PropsRenderer
          props={selectedComponent.props as never}
          instanceId={selectedComponent.instanceId}
          metadata={selectedComponent.metadata}
        />
      ) : (
        <p className="text-sm text-muted-foreground italic">
          No properties panel available for {selectedComponent.id}.
        </p>
      )}
    </div>
  );
}