/**
 * ComponentListPanel — shows a scrollable tree of all components on the current page.
 * Clicking a component selects it; the active component is highlighted.
 */

import { useState } from 'react';
import { useFormStore } from '@/form/store/form.store';
import { useShallow } from 'zustand/react/shallow';
import { COMPONENT_ICONS } from '../ComponentCatalogWindow';
import { AlignLeft, GripVertical, Trash2 } from 'lucide-react';
import { getComponentDisplayName } from '@/form/registry/componentRegistry.helpers';

interface ComponentListPanelProps {
  pageId: string | null;
  pageIndex?: number;
}

interface DraggableItemProps {
  instanceId: string;
  comp: any;
  isActive: boolean;
  removeComponent: (id: string) => void;
  setActiveComponent: (id: string) => void;
  setActivePage: (id: string | null) => void;
  displayName: string;
  Icon: React.ElementType;
  
  isDragged: boolean;
  isDragOverTop: boolean;
  isDragOverBottom: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDrop: (e: React.DragEvent, id: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

function DraggableComponentItem({
  instanceId,
  isActive,
  removeComponent,
  setActiveComponent,
  setActivePage,
  displayName,
  Icon,
  isDragged,
  isDragOverTop,
  isDragOverBottom,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: DraggableItemProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteDoNotAskAgain, setDeleteDoNotAskAgain] = useState(false);
  const [skipDeleteConfirm, setSkipDeleteConfirm] = useState(() => {
    try {
      if (typeof window === 'undefined') return false;
      return (
        window.localStorage.getItem('form-builder:skipDeleteConfirm') === '1'
      );
    } catch {
      return false;
    }
  });

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, instanceId)}
      onDragOver={(e) => onDragOver(e, instanceId)}
      onDrop={(e) => onDrop(e, instanceId)}
      onDragEnd={onDragEnd}
      onClick={() => {
        setActiveComponent(instanceId);
        setActivePage(null);
      }}
      className={`group relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-all ${
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      } ${isDragged ? 'opacity-30' : 'opacity-100'} ${
        isDragOverTop ? 'border-t-2 border-t-primary' : ''
      } ${isDragOverBottom ? 'border-b-2 border-b-primary' : ''}`}
    >
      <div
        className="cursor-grab rounded p-0.5 opacity-40 hover:bg-black/5 hover:opacity-100 text-foreground"
        title="Drag to reorder"
      >
        <GripVertical className="h-3 w-3 shrink-0" />
      </div>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className="flex-1 truncate">{displayName}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (skipDeleteConfirm) {
            removeComponent(instanceId);
            return;
          }
          setDeleteDoNotAskAgain(false);
          setDeleteConfirmOpen(true);
        }}
        className="relative z-20 flex h-4 w-4 shrink-0 items-center justify-center rounded opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
      >
        <Trash2 className="h-3 w-3" />
      </button>

      {/* Delete confirmation modal */}
      {deleteConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
          onClick={(e) => {
            e.stopPropagation();
            setDeleteConfirmOpen(false);
          }}
        >
          <div
            className="w-full max-w-sm border border-border bg-background p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            draggable={false}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-foreground">
                  Delete component?
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  This will remove{' '}
                  <span className="font-medium">{displayName}</span> from the
                  form.
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteConfirmOpen(false);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-none border border-border bg-background text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Close delete confirmation"
              >
                ×
              </button>
            </div>

            <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={deleteDoNotAskAgain}
                onChange={(e) => setDeleteDoNotAskAgain(e.target.checked)}
              />
              Do this for every delete (don't ask again)
            </label>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteConfirmOpen(false);
                }}
                className="flex h-8 items-center justify-center rounded-none border border-border bg-background px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (deleteDoNotAskAgain) {
                    try {
                      window.localStorage.setItem(
                        'form-builder:skipDeleteConfirm',
                        '1'
                      );
                      setSkipDeleteConfirm(true);
                    } catch {}
                  }
                  removeComponent(instanceId);
                  setDeleteConfirmOpen(false);
                }}
                className="flex h-8 items-center justify-center rounded-none border border-destructive/50 bg-destructive/10 px-3 text-sm text-destructive transition-colors hover:bg-destructive/15"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ComponentListPanel({
  pageId,
  pageIndex,
}: ComponentListPanelProps) {
  const form = useFormStore((s) => s.form);
  const resolvedPageId =
    pageId ?? (pageIndex != null ? (form?.pages[pageIndex] ?? null) : null);

  const page = useFormStore(
    useShallow((s) => (resolvedPageId ? s.pages[resolvedPageId] : null))
  );

  const components = useFormStore((s) => s.components);
  const activeComponentId = useFormStore((s) => s.activeComponentId);
  const setActiveComponent = useFormStore((s) => s.setActiveComponent);
  const setActivePage = useFormStore((s) => s.setActivePage);
  const removeComponent = useFormStore((s) => s.removeComponent);
  const moveComponent = useFormStore((s) => s.moveComponent);

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragOverDirection, setDragOverDirection] = useState<'top' | 'bottom' | null>(null);

  if (!resolvedPageId) return null;

  if (!page || page.children.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-1.5 p-4 text-center">
        <p className="text-[11px] text-muted-foreground/40">
          No components yet
        </p>
      </div>
    );
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault(); // Necessary to allow dropping
    if (id === draggedId) return;
    
    // Determine the direction the user is hovering over
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const isTopHalf = e.clientY < rect.top + rect.height / 2;
    
    setDragOverId(id);
    setDragOverDirection(isTopHalf ? 'top' : 'bottom');
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
    setDragOverDirection(null);
  };

  const handleDrop = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === id || !resolvedPageId || !page) {
      handleDragEnd();
      return;
    }

    const oldIndex = page.children.indexOf(draggedId);
    let newIndex = page.children.indexOf(id);

    if (dragOverDirection === 'bottom' && oldIndex > newIndex) {
      newIndex += 1;
    } else if (dragOverDirection === 'top' && oldIndex < newIndex) {
      newIndex -= 1;
    }

    if (oldIndex !== -1 && newIndex !== -1) {
      moveComponent(resolvedPageId, oldIndex, resolvedPageId, newIndex);
    }

    handleDragEnd();
  };

  return (
    <div className="flex flex-col gap-0.5 p-1.5">
      {page.children.map((instanceId) => {
        const comp = components[instanceId];
        if (!comp) return null;

        const isActive = activeComponentId === instanceId;
        const Icon = COMPONENT_ICONS[comp.id] ?? AlignLeft;
        const displayName =
          comp.metadata.label || getComponentDisplayName(comp.id);

        const isDragged = draggedId === instanceId;
        const isDragOverTop = dragOverId === instanceId && dragOverDirection === 'top';
        const isDragOverBottom = dragOverId === instanceId && dragOverDirection === 'bottom';

        return (
          <DraggableComponentItem
            key={instanceId}
            instanceId={instanceId}
            comp={comp}
            isActive={isActive}
            removeComponent={removeComponent}
            setActiveComponent={setActiveComponent}
            setActivePage={setActivePage}
            displayName={displayName}
            Icon={Icon}
            isDragged={isDragged}
            isDragOverTop={isDragOverTop}
            isDragOverBottom={isDragOverBottom}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
          />
        );
      })}
    </div>
  );
}
