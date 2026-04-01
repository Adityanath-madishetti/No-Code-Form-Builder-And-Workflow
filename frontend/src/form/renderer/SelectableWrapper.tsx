// src/form/renderer/SelectableWrapper.tsx
import { useFormStore } from '@/form/store/formStore';
import type { PageID } from '@/form/components/base';
import { TEMP_PAGE_PLACEHOLDER_ID } from '@/form/utils/DndUtils';

import { GripVertical, Trash2, Copy } from 'lucide-react';
import { useSortable } from '@dnd-kit/react/sortable';
import type { AnyFormComponent } from '../registry/componentRegistry';

import {
  DRAG_CATALOG_COMPONENT_ID,
  DRAG_CATALOG_PAGE_ID,
  DRAG_COMPONENT_ID,
  DRAG_PAGE_ID,
  DRAG_PAGE_GROUP_ID,
} from '@/form/utils/DndUtils';

interface Props {
  component: AnyFormComponent;
  pageId: PageID;
  index: number;
  children: React.ReactNode;
}

export const SelectableComponent = ({
  component,
  pageId,
  index,
  children,
}: Props) => {
  const selectedId = useFormStore((s) => s.activeComponentId);
  const setActiveComponent = useFormStore((s) => s.setActiveComponent);
  const removeComponent = useFormStore((s) => s.removeComponent);
  const setActivePage = useFormStore((s) => s.setActivePage);
  const duplicateComponent = useFormStore((s) => s.duplicateComponent);

  const isSelected = selectedId === component.instanceId;

  const { ref, isDragging } = useSortable({
    id: component.instanceId,
    index: index,
    group: pageId,
    type: DRAG_COMPONENT_ID,
    accept: [DRAG_COMPONENT_ID, DRAG_CATALOG_COMPONENT_ID],
    data: {
      type: DRAG_COMPONENT_ID,
      pageId: pageId,
      instanceId: component.instanceId,
    },
  });

  return (
    <div
      ref={ref}
      onClick={(e) => {
        e.stopPropagation();
        setActiveComponent(component.instanceId);
        setActivePage(null);
      }}
      className={`form-component group relative transition-all duration-100 ${
        isDragging ? 'opacity-40' : 'opacity-100'
      } ${
        isSelected
          ? 'ring-2 ring-primary/50 ring-offset-1 ring-offset-background'
          : 'hover:ring-1 hover:ring-border'
      }`}
    >
      {/* Content — fully interactive, no pointer-events-none */}
      <div className="w-full">{children}</div>

      {/* Toolbar — appears on hover or selection */}
      <div
        className={`absolute -top-8 right-0 z-30 flex items-center gap-0.5 rounded-sm border border-border bg-background px-0.5 py-0.5 shadow-sm transition-opacity ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        {/* Drag handle */}
        <div
          className="flex h-6 w-6 cursor-grab items-center justify-center text-muted-foreground hover:text-foreground"
          data-dnd-kit-drag-handle
        >
          <GripVertical className="h-3.5 w-3.5" />
        </div>

        {/* Duplicate */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            const newId = duplicateComponent(component.instanceId);
            if (newId) setActiveComponent(newId);
          }}
          className="flex h-6 w-6 cursor-pointer items-center justify-center text-muted-foreground hover:text-foreground"
          aria-label="Duplicate"
        >
          <Copy className="h-3 w-3" />
        </button>

        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            removeComponent(component.instanceId);
          }}
          className="flex h-6 w-6 cursor-pointer items-center justify-center text-muted-foreground hover:text-destructive"
          aria-label="Delete"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};

interface SelectablePageProps {
  pageId: PageID;
  index: number;
  children: React.ReactNode;
}

export const SelectablePage = ({
  pageId,
  index,
  children,
}: SelectablePageProps) => {
  const setActivePage = useFormStore((s) => s.setActivePage);
  const setActiveComponent = useFormStore((s) => s.setActiveComponent);
  const removePage = useFormStore((s) => s.removePage);

  const { ref, isDragging } = useSortable({
    id: pageId,
    index: index,
    group: DRAG_PAGE_GROUP_ID,
    type: DRAG_PAGE_ID,
    accept: [DRAG_PAGE_ID, DRAG_CATALOG_PAGE_ID],
    data: {
      type: DRAG_PAGE_ID,
      pageId: pageId,
    },
  });

  return (
    <div
      ref={ref}
      onClick={(e) => {
        e.stopPropagation();
        setActivePage(pageId);
        setActiveComponent(null);
      }}
      className={`group relative !overflow-visible transition-all duration-100 ${
        isDragging ? 'opacity-40' : 'opacity-100'
      }`}
    >
      {/* Drag handle — top center */}
      <div
        className="absolute -top-3 left-1/2 z-20 -translate-x-1/2 cursor-grab border border-border bg-background p-0.5 opacity-0 transition-opacity group-hover:opacity-100"
        data-dnd-kit-drag-handle
      >
        <GripVertical className="h-3 w-3 rotate-90 text-muted-foreground" />
      </div>

      {/* Delete page */}
      {pageId !== TEMP_PAGE_PLACEHOLDER_ID && (
        <div className="absolute top-1 -right-8 z-20 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              removePage(pageId);
            }}
            className="p-1 text-muted-foreground/60 hover:text-destructive"
            aria-label="Remove page"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {children}
    </div>
  );
};
