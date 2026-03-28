// src/form/renderer/editRenderer/RenderPage.tsx
import { useFormMode } from '@/form/context/FormModeContext';
import { SelectablePage } from '@/form/renderer/SelectableWrapper';
import type { PageID } from '@/form/components/base';
import { useShallow } from 'zustand/react/shallow';
import { useFormStore } from '@/form/store/formStore';
// import { Card as HeroCard } from '@heroui/react';
import { useDroppable } from '@dnd-kit/react';
import {
  DRAG_CATALOG_PAGE_ID,
  TEMP_PAGE_PLACEHOLDER_ID,
  DRAG_CATALOG_COMPONENT_ID,
  DRAG_COMPONENT_ID,
  DRAG_PAGE_ID,
} from '@/form/utils/DndUtils';
import { RenderComponent } from './RenderComponent';

export const RenderPage = ({
  pageId,
  index,
}: {
  pageId: PageID;
  index: number;
}) => {
  const mode = useFormMode();
  const componentIds = useFormStore(
    useShallow((s) => s.pages[pageId]?.children ?? [])
  );
  const components = useFormStore(
    useShallow((s) =>
      componentIds.map((id) => s.components[id]).filter(Boolean)
    )
  );

  const pageTitle = useFormStore(
    useShallow((s) => s.pages[pageId]?.title ?? '')
  );

  const { ref: contentDropRef } = useDroppable({
    id: `content-drop-${pageId}`,
    accept: [DRAG_COMPONENT_ID, DRAG_CATALOG_COMPONENT_ID],
    data: { type: DRAG_PAGE_ID, pageId: pageId },
  });

  const { ref: pagePlaceholderRef } = useDroppable({
    id: `page-placeholder-drop`,
    accept: [DRAG_CATALOG_PAGE_ID],
    data: { type: DRAG_PAGE_ID, pageId: TEMP_PAGE_PLACEHOLDER_ID },
  });

  if (pageId === TEMP_PAGE_PLACEHOLDER_ID) {
    return (
      <div
        ref={mode === 'edit' ? pagePlaceholderRef : undefined}
        className="m-6 flex h-6 items-center justify-center rounded-lg"
      >
        <span className="text-primary">Drop New Page Here</span>
      </div>
    );
  }

  const rendered = (
    <div ref={mode === 'edit' ? contentDropRef : undefined}>
      <div
        className={`relative flex min-h-[50px] flex-col gap-3 bg-transparent ${mode === 'edit' ? '-mx-12 rounded-xl border px-12 pt-12 pb-4' : ''}`}
      >
        {pageId !== TEMP_PAGE_PLACEHOLDER_ID && (
          <div className="pointer-events-none top-4 z-20">
            <span className="text-5xl">{pageTitle}</span>
          </div>
        )}

        <div
          className={`text-default-500 pointer-events-none absolute inset-0 flex items-center justify-center text-sm transition-opacity duration-200 ${
            componentIds.length === 0 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          Empty Page
        </div>

        <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
          {components.map((component, idx) => (
            <RenderComponent
              key={component.instanceId}
              component={component}
              pageId={pageId}
              index={idx}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return mode === 'edit' ? (
    <SelectablePage pageId={pageId} index={index}>
      {rendered}
    </SelectablePage>
  ) : (
    rendered
  );
};

// TODO
export const RenderPageProps = () => {};
