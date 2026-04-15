// src/pages/FormEditor/components/ActionRow.tsx
/**
 * A single action row: [Action Type ▾] [Target ▾] [Value?]
 */
import { Trash2 } from 'lucide-react';
import type { RuleAction, ActionType } from '@/form/logic/logicTypes';
import {
  ACTION_TYPES,
  ACTION_TYPE_LABELS,
  ACTION_TYPE_COLORS,
} from '@/form/logic/logicTypes';

interface TargetOption {
  id: string;
  label: string;
  type: 'component' | 'page';
}

interface ActionRowProps {
  action: RuleAction;
  targets: TargetOption[];
  onChange: (updated: RuleAction) => void;
  onRemove?: () => void;
}

export function ActionRow({
  action,
  targets,
  onChange,
  onRemove,
}: ActionRowProps) {
  const needsValue = action.type === 'SET_VALUE';
  const isPageAction = action.type === 'SKIP_PAGE';

  const pageTargets = targets.filter((t) => t.type === 'page');
  const componentTargets = targets.filter((t) => t.type === 'component');

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as ActionType;
    const updated = { ...action, type: newType };

    // Clean up specific target fields when switching contexts
    if (newType === 'SKIP_PAGE') {
      updated.targetId = ''; // Will hold the 'From' page
      updated.toPageId = ''; // Will hold the 'To' page
    } else {
      delete updated.toPageId; // Clean up page target entirely
      updated.targetId = ''; // Reset component target
    }

    onChange(updated);
  };

  return (
    <div className="flex items-center gap-1.5 rounded-md border border-border bg-muted/30 px-2 py-2">
      {/* Action type */}
      <select
        value={action.type}
        onChange={handleTypeChange}
        className={`h-7 min-w-0 rounded border border-input bg-background px-1.5 text-xs font-medium ${ACTION_TYPE_COLORS[action.type]}`}
      >
        {ACTION_TYPES.map((t) => (
          <option key={t} value={t}>
            {ACTION_TYPE_LABELS[t]}
          </option>
        ))}
      </select>

      {/* Target selectors */}
      {isPageAction ? (
        <>
          {/* Skip FROM Page */}
          <select
            value={action.targetId || ''}
            onChange={(e) => onChange({ ...action, targetId: e.target.value })}
            className="h-7 min-w-0 flex-1 rounded border border-input bg-background px-1.5 text-xs"
          >
            <option value="">Skip page…</option>
            {pageTargets.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>

          <span className="px-1 text-xs font-medium text-muted-foreground">
            to
          </span>

          {/* Go TO Page */}
          <select
            value={action.toPageId || ''}
            onChange={(e) => onChange({ ...action, toPageId: e.target.value })}
            className="h-7 min-w-0 flex-1 rounded border border-input bg-background px-1.5 text-xs"
          >
            <option value="">Destination…</option>
            {pageTargets.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </>
      ) : (
        /* Standard Component Target */
        <select
          value={action.targetId || ''}
          onChange={(e) => {
            const updated = { ...action, targetId: e.target.value };
            delete updated.toPageId;
            onChange(updated);
          }}
          className="h-7 min-w-0 flex-1 rounded border border-input bg-background px-1.5 text-xs"
        >
          <option value="">Select field…</option>
          {componentTargets.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      )}

      {/* Value input (only for SET_VALUE) */}
      {needsValue && (
        <input
          type="text"
          value={String(action.value ?? '')}
          onChange={(e) => onChange({ ...action, value: e.target.value })}
          placeholder="value"
          className="h-7 w-24 min-w-0 rounded border border-input bg-background px-1.5 text-xs"
        />
      )}

      {/* Remove */}
      {onRemove && (
        <button
          onClick={onRemove}
          className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
          title="Remove action"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
