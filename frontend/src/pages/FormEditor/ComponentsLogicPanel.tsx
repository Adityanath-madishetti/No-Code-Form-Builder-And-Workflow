import {
  Zap,
  Calculator,
  Trash2,
  Search,
  MoreHorizontal,
  ArrowRightCircle,
  PlayCircle,
  AlertCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLogicStore } from '@/form/logic/logic.store';
import type { Condition, RuleAction } from '@/form/logic/logicTypes';
import { useFormStore } from '@/form/store/form.store';

export function ComponentLogicPanel() {
  // ── Store State ──
  const activeComponentId = useFormStore((s) => s.activeComponentId);
  const rules = useLogicStore((s) => s.rules);
  const formulas = useLogicStore((s) => s.formulas);

  // ── Store Actions ──
  const removeRule = useLogicStore((s) => s.removeRule);
  //   const updateRule = useLogicStore((s) => s.updateRule);
  const setActiveRule = useLogicStore((s) => s.setActiveRule);
  const setActiveFormula = useLogicStore((s) => s.setActiveFormula);

  const openPopoutRule = useLogicStore((s) => s.openPopoutRule);

  const [contextMenu, setContextMenu] = useState<{
    kind: 'rule' | 'formula';
    id: string;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [contextMenu]);

  // ── Helpers ──
  const { sourceRules, targetRules, sourceFormulas, targetFormulas } =
    useMemo(() => {
      if (!activeComponentId) {
        return {
          sourceRules: [],
          targetRules: [],
          sourceFormulas: [],
          targetFormulas: [],
        };
      }

      // ── Helpers (Moved inside useMemo) ──

      /** Recursive check if component is used in conditions */
      const isInCondition = (condition: Condition): boolean => {
        if (condition.type === 'leaf') {
          return condition.instanceId === activeComponentId;
        }
        return condition.conditions.some(isInCondition);
      };

      /** Recursive check if component is a target in standard or nested actions */
      const isTargetInActions = (actions: RuleAction[]): boolean => {
        return actions.some((action) => {
          if (action.type === 'CONDITIONAL') {
            return (
              (action.thenActions && isTargetInActions(action.thenActions)) ||
              (action.elseActions && isTargetInActions(action.elseActions))
            );
          }
          return action.targetId === activeComponentId;
        });
      };

      // ── Filtering ──

      return {
        sourceRules: rules.filter((r) => isInCondition(r.condition)),
        targetRules: rules.filter(
          (r) =>
            isTargetInActions(r.thenActions) || isTargetInActions(r.elseActions)
        ),
        sourceFormulas: formulas.filter((f) =>
          f.referencedFields.includes(activeComponentId)
        ),
        targetFormulas: formulas.filter(
          (f) => f.targetId === activeComponentId
        ),
      };
    }, [activeComponentId, rules, formulas]);

  const hasAnyLogic =
    sourceRules.length > 0 ||
    targetRules.length > 0 ||
    sourceFormulas.length > 0 ||
    targetFormulas.length > 0;

  // ── Render Helpers ──

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderRuleItem = (rule: any) => (
    <div
      key={rule.ruleId}
      onClick={() => {
        // 1. Open synchronously to bypass browser popup blockers!
        window.open(
          '',
          `logic_portal_${rule.ruleId}`,
          'width=800,height=600,left=200,top=200'
        );
        // 2. Dispatch to store to mount the Portal
        openPopoutRule(rule.ruleId);
      }}
      className={`group mb-1 cursor-pointer rounded-md border px-2.5 py-1.5 transition-all ${!rule.enabled ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-1.5">
        <Zap className={`h-3 w-3 shrink-0 text-amber-500`} />
        <span className="min-w-0 flex-1 truncate text-[11px] font-medium">
          {rule.name}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setContextMenu({
              kind: 'rule',
              id: rule.ruleId,
              x: e.clientX,
              y: e.clientY,
            });
          }}
          className="rounded p-0.5 text-muted-foreground hover:text-foreground"
        >
          <MoreHorizontal className="h-2.5 w-2.5" />
        </button>
      </div>
    </div>
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderFormulaItem = (formula: any) => (
    <div
      key={formula.ruleId}
      onClick={() => {
        // Same here for formulas
        window.open(
          '',
          `logic_portal_${formula.ruleId}`,
          'width=800,height=600,left=200,top=200'
        );
        openPopoutRule(formula.ruleId);
      }}
      className={`group mb-1 cursor-pointer rounded-md border px-2.5 py-1.5 transition-all ${!formula.enabled ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center gap-1.5">
        <Calculator className={`h-3 w-3 shrink-0 text-violet-500`} />
        <span className="min-w-0 flex-1 truncate text-[11px] font-medium">
          {formula.name}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setContextMenu({
              kind: 'formula',
              id: formula.ruleId,
              x: e.clientX,
              y: e.clientY,
            });
          }}
          className="rounded p-0.5 text-muted-foreground hover:text-foreground"
        >
          <MoreHorizontal className="h-2.5 w-2.5" />
        </button>
      </div>
    </div>
  );

  if (!activeComponentId) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
        <AlertCircle className="h-6 w-6 opacity-20" />
        <p className="text-[10px]">Select a component to see its logic.</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative no-scrollbar flex h-full flex-col gap-4 overflow-y-auto p-4">
        {!hasAnyLogic && (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
            <Zap className="h-8 w-8 opacity-10" />
            <p className="text-[10px]">No logic connected to this field.</p>
          </div>
        )}

        {/* SECTION: TRIGGER / SOURCE */}
        {(sourceRules.length > 0 || sourceFormulas.length > 0) && (
          <section>
            <div className="mb-2 flex items-center gap-1.5 px-1">
              <PlayCircle className="h-3 w-3 text-blue-500" />
              <h4 className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase">
                Used as Trigger
              </h4>
            </div>
            {sourceRules.map((r) => renderRuleItem(r))}
            {sourceFormulas.map((f) => renderFormulaItem(f))}
          </section>
        )}

        {/* SECTION: TARGET / AFFECTED */}
        {(targetRules.length > 0 || targetFormulas.length > 0) && (
          <section>
            <div className="mb-2 flex items-center gap-1.5 px-1">
              <ArrowRightCircle className="h-3 w-3 text-green-500" />
              <h4 className="text-[9px] font-bold tracking-widest text-muted-foreground uppercase">
                Affected by Logic
              </h4>
            </div>
            {targetRules.map((r) => renderRuleItem(r))}
            {targetFormulas.map((f) => renderFormulaItem(f))}
          </section>
        )}

        {/* Context Menu */}
        {contextMenu && (
          <div
            className="fixed z-[9999] min-w-[140px] rounded border border-border bg-popover p-1 shadow-md"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button
              className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs hover:bg-muted"
              onClick={() => {
                if (contextMenu.kind === 'rule') setActiveRule(contextMenu.id);
                else setActiveFormula(contextMenu.id);
              }}
            >
              <Search className="h-3 w-3" /> Open
            </button>
            <button
              className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs text-destructive hover:bg-muted"
              onClick={() => {
                if (contextMenu.kind === 'rule') removeRule(contextMenu.id);
                else useLogicStore.getState().removeFormula(contextMenu.id);
              }}
            >
              <Trash2 className="h-3 w-3" /> Delete
            </button>
          </div>
        )}
      </div>
    </>
  );
}
