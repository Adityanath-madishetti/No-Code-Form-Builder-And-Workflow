// src/pages/FormEditor/FormEditor.tsx
import { useState, useEffect, useCallback } from 'react';
import { useFormStore } from '@/form/store/formStore';
import { DragDropProvider, DragOverlay } from '@dnd-kit/react';
import { componentRenderers } from '@/form/registry/componentRegistry';
import { useFormDragHandlers } from '@/form/hooks/useFormDragHandlers';
import {
  DRAG_CATALOG_COMPONENT_ID,
  DRAG_COMPONENT_ID,
  DRAG_CATALOG_PAGE_ID,
} from '@/form/utils/DndUtils';

import { Allotment } from 'allotment';
import 'allotment/dist/style.css';

import { EditorSidebar, type SidebarPanelId } from './components/EditorSidebar';
import { ComponentCatalogPanel } from './components/ComponentCatalogPanel';
import { TemplateCatalogPanel } from './components/TemplateCatalogPanel';
import { ThemePanel } from './components/ThemePanel';
import { LogicPanel } from './components/LogicPanel';
import { WorkflowPanel } from './components/WorkflowPanel';
import { AIPanel } from './components/AIPanel';
import { PreviewPublishPanel } from './components/PreviewPublishPanel';
import { FormPropertiesPanel } from './components/FormPropertiesPanel';
import { FormCanvas } from './components/FormCanvas';
import { PageNavigator } from './components/PageNavigator';
import { DebugPanel } from './components/DebugPanel';
import { ComponentPropertiesPanel } from './components/ComponentPropertiesPanel';
import { Bug, PanelRightOpen, PanelLeftClose, PanelRightClose } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';

const PANEL_TITLES: Record<SidebarPanelId, string> = {
  components: 'Components',
  form: 'Form Properties',
  templates: 'Templates',
  theme: 'Theme',
  logic: 'Logic',
  workflow: 'Workflow',
  ai: 'AI Assistant',
  preview: 'Preview & Publish',
};

function PanelContent({ panelId }: { panelId: SidebarPanelId }) {
  switch (panelId) {
    case 'components': return <ComponentCatalogPanel />;
    case 'form': return <FormPropertiesPanel />;
    case 'templates': return <TemplateCatalogPanel />;
    case 'theme': return <ThemePanel />;
    case 'logic': return <LogicPanel />;
    case 'workflow': return <WorkflowPanel />;
    case 'ai': return <AIPanel />;
    case 'preview': return <PreviewPublishPanel />;
  }
}

export default function FormEditor() {
  const store = useFormStore();
  const initForm = store.initForm;
  const addPage = store.addPage;
  const setActiveComponent = store.setActiveComponent;

  const { onDragStart, onDragOver, onDragEnd } = useFormDragHandlers();
  const activeDragData = store.activeDragData;
  const activeComponentId = useFormStore((s) => s.activeComponentId);
  const activePageId = useFormStore((s) => s.activePageId);

  const pageIds = useFormStore(useShallow((s) => s.form?.pages ?? []));
  const totalPages = pageIds.length;

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [activePanel, setActivePanel] = useState<SidebarPanelId | null>('components');
  const [showDebug, setShowDebug] = useState(false);
  const [showProperties, setShowProperties] = useState(true);

  // Auto-init form
  useEffect(() => {
    if (!store.form) {
      initForm('form-' + crypto.randomUUID(), 'Untitled Form');
    }
  }, []);

  // Clamp page index
  useEffect(() => {
    if (totalPages > 0 && currentPageIndex >= totalPages) {
      setCurrentPageIndex(totalPages - 1);
    }
  }, [totalPages]);

  // Auto-show properties when a component is selected
  useEffect(() => {
    if (activeComponentId || activePageId) {
      setShowProperties(true);
    }
  }, [activeComponentId, activePageId]);

  const handleAddPage = useCallback(() => {
    addPage();
    setCurrentPageIndex(totalPages);
  }, [addPage, totalPages]);

  const handleNavigate = (page: number) => {
    setCurrentPageIndex(page - 1);
  };

  const handleCanvasClick = () => {
    setActiveComponent(null);
  };

  const hasSelection = !!activeComponentId || !!activePageId;

  return (
    <DragDropProvider
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex h-screen w-full overflow-hidden bg-neutral-50 dark:bg-neutral-950">
        {/* ── Left icon rail ── */}
        <EditorSidebar activePanel={activePanel} onPanelChange={setActivePanel} />

        {/* ── Main area with allotment resizable panels ── */}
        <Allotment proportionalLayout={false}>
          {/* ── Left fly-out panel ── */}
          {activePanel && (
            <Allotment.Pane
              preferredSize={300}
              minSize={240}
              maxSize={500}
              snap
            >
              <div className="flex h-full flex-col border-r border-border bg-background">
                <div className="flex h-10 shrink-0 items-center border-b border-border px-3 gap-2">
                  <span className="flex-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    {PANEL_TITLES[activePanel]}
                  </span>
                  <button
                    onClick={() => setActivePanel(null)}
                    title="Collapse Sidebar"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <PanelLeftClose className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3">
                  <PanelContent panelId={activePanel} />
                </div>
              </div>
            </Allotment.Pane>
          )}

          {/* ── Canvas (centre, fills remaining) ── */}
          <Allotment.Pane minSize={400}>
            <div
              className="relative flex h-full min-h-0 flex-col overflow-y-auto bg-neutral-100 dark:bg-neutral-900"
              onClick={handleCanvasClick}
            >
              <FormCanvas currentPageIndex={currentPageIndex} />

              {totalPages > 0 && (
                <PageNavigator
                  currentPage={currentPageIndex + 1}
                  totalPages={totalPages}
                  onNavigate={handleNavigate}
                  onAddPage={handleAddPage}
                />
              )}

              {totalPages === 0 && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <button
                    className="pointer-events-auto border border-dashed border-border bg-background px-5 py-2.5 text-sm text-muted-foreground shadow-sm transition-colors hover:border-primary/50 hover:text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddPage();
                    }}
                  >
                    + Add your first page
                  </button>
                </div>
              )}
            </div>
          </Allotment.Pane>

          {/* ── Right properties panel ── */}
          {showProperties && hasSelection && (
            <Allotment.Pane
              preferredSize={280}
              minSize={220}
              maxSize={450}
              snap
            >
              <div className="flex h-full flex-col border-l border-border bg-background">
                <div className="flex h-10 shrink-0 items-center border-b border-border px-3">
                  <span className="flex-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Properties
                  </span>
                  <button
                    onClick={() => setShowProperties(false)}
                    title="Collapse Properties"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <PanelRightClose className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                  <ComponentPropertiesPanel />
                </div>
              </div>
            </Allotment.Pane>
          )}

          {/* ── Debug panel ── */}
          {showDebug && (
            <Allotment.Pane
              preferredSize={350}
              minSize={280}
              maxSize={600}
              snap
            >
              <div className="flex h-full flex-col border-l border-border bg-background">
                <div className="flex h-10 shrink-0 items-center border-b border-border px-3">
                  <Bug className="mr-1.5 h-3 w-3 text-amber-500" />
                  <span className="flex-1 text-xs font-semibold uppercase tracking-widest text-amber-500">
                    Debug
                  </span>
                  <button
                    onClick={() => setShowDebug(false)}
                    title="Collapse Debug Panel"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <PanelRightClose className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-3">
                  <DebugPanel />
                </div>
              </div>
            </Allotment.Pane>
          )}
        </Allotment>

        {/* ── Bottom-right floating buttons ── */}
        <div className="fixed bottom-4 right-4 z-50 flex gap-1.5">
          {!showProperties && (
            <button
              onClick={() => setShowProperties(true)}
              title="Show properties panel"
              className="flex h-8 w-8 items-center justify-center border border-border bg-background text-muted-foreground shadow-sm hover:text-foreground"
            >
              <PanelRightOpen className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={() => setShowDebug((p) => !p)}
            title="Toggle debug panel"
            className={`flex h-8 w-8 items-center justify-center border shadow-sm transition-colors ${showDebug
                ? 'border-amber-400/60 bg-amber-400/10 text-amber-500'
                : 'border-border bg-background text-muted-foreground hover:text-amber-500'
              }`}
          >
            <Bug className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Drag overlay ── */}
      <DragOverlay dropAnimation={null}>
        {activeDragData?.type === DRAG_CATALOG_COMPONENT_ID &&
          (() => {
            const entry = activeDragData.entry;
            const Renderer = componentRenderers[entry.id as keyof typeof componentRenderers];
            const previewData = entry.create('__preview__');
            return Renderer ? (
              <div className="w-[400px] opacity-80">
                <Renderer
                  instanceId={previewData.instanceId}
                  metadata={previewData.metadata}
                  // @ts-expect-error type union
                  props={previewData.props}
                  // @ts-expect-error type union
                  validation={previewData.validation}
                />
              </div>
            ) : null;
          })()}

        {activeDragData?.type === DRAG_COMPONENT_ID &&
          (() => {
            const existing = store.components[activeDragData.instanceId];
            if (!existing) return null;
            const Renderer = componentRenderers[existing.id as keyof typeof componentRenderers];
            return Renderer ? (
              <div className="w-[400px] opacity-80">
                <Renderer
                  instanceId={existing.instanceId}
                  metadata={existing.metadata}
                  // @ts-expect-error type union
                  props={existing.props}
                  // @ts-expect-error type union
                  validation={existing.validation}
                />
              </div>
            ) : null;
          })()}

        {activeDragData?.type === DRAG_CATALOG_PAGE_ID && (
          <div className="pointer-events-none w-64 border-2 border-dashed border-primary bg-card p-4 text-center text-sm text-primary opacity-80">
            New Page
          </div>
        )}
      </DragOverlay>
    </DragDropProvider>
  );
}
