import React from 'react';
import {
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Folder,
  Component as ComponentIcon,
  Zap,
  Settings2,
  ListTree,
} from 'lucide-react';
import { useFormStore } from '@/form/store/form.store';
import { cn } from '@/lib/utils';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';

import { ComponentPropertiesPanel } from './components/ComponentPropertiesPanel';
import { ComponentLogicPanel } from './ComponentsLogicPanel';

export function FormFileExplorer() {
  const form = useFormStore((s) => s.form);
  const pages = useFormStore((s) => s.pages);
  const components = useFormStore((s) => s.components);

  const activePageId = useFormStore((s) => s.activePageId);
  const activeComponentId = useFormStore((s) => s.activeComponentId);
  const setActivePage = useFormStore((s) => s.setActivePage);
  const setActiveComponent = useFormStore((s) => s.setActiveComponent);


  // --- UI STATE: EXPLORER ---
  const isExplorerOpen = useFormStore((s) => s.isFormExplorerRightPanelOpen);
  const setIsExplorerOpen = useFormStore((s) => s.setIsFormExplorerRightPanelOpen);
  const expandedPages = useFormStore((s) => s.expandedPages);
  const setPageExpanded = useFormStore((s) => s.setPageExpanded);

  // --- UI STATE: PROPERTIES ---
  const isPropertiesOpen = useFormStore((s) => s.isPropertyRightPanelOpen);
  const setIsPropertiesOpen = useFormStore((s) => s.setIsPropertyRightPanelOpen);
  const propertiesHeight = useFormStore((s) => s.propertyRightPanelHeight);
  const setPropertiesHeight = useFormStore((s) => s.setPropertyHeight);

  // --- UI STATE: LOGIC ---
  const isLogicOpen = useFormStore((s) => s.isLogicRightPanelOpen);
  const setIsLogicOpen = useFormStore((s) => s.setIsLogicRightPanelOpen);
  const logicHeight = useFormStore((s) => s.logicRightPanelHeight);
  const setLogicHeight = useFormStore((s) => s.setLogicHeight);

  // Generic Resize Handler
  const createResizeHandler = (currentHeight: number, setter: (h: number) => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = currentHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = startY - moveEvent.clientY;
      // You can adjust the 80 to whatever minimum pixel height you want the panel to be before it stops shrinking
      setter(Math.max(80, startHeight + delta));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.removeProperty('cursor');
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'row-resize';
  };

  const handlePageClick = (pageId: string, isCurrentlyExpanded: boolean) => {
    setActivePage(pageId);
    setActiveComponent(null);
    if (!isCurrentlyExpanded) setPageExpanded(pageId, true);
  };

  if (!form) return <div className="p-4 text-sm text-muted-foreground">No active schema</div>;

  return (
    <div className="flex flex-col h-full w-full bg-background border-r text-sm select-none">
      
      {/* 1. EXPLORER PANEL */}
      <Collapsible
        open={isExplorerOpen}
        onOpenChange={setIsExplorerOpen}
        // ADDED min-h-0 HERE
        className={cn('flex flex-col', isExplorerOpen ? 'flex-1 min-h-0' : 'shrink-0')}
      >
        <PanelHeader label="Explorer" isOpen={isExplorerOpen} icon={<ListTree size={12} className='mr-1'/>}/>
        <CollapsibleContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="flex flex-col py-1">
              {form.pages.map((pageId) => {
                const page = pages[pageId];
                if (!page) return null;
                const isExpanded = !!expandedPages[pageId];
                return (
                  <Collapsible key={pageId} open={isExpanded} onOpenChange={(open) => setPageExpanded(pageId, open)}>
                    <CollapsibleTrigger
                      onClick={() => handlePageClick(pageId, isExpanded)}
                      className={cn(
                        'flex items-center w-full px-2 py-1.5 cursor-pointer hover:bg-accent/50 outline-none',
                        activePageId === pageId && 'bg-accent text-accent-foreground'
                      )}
                    >
                      <div className="w-4 h-4 mr-1 flex items-center justify-center">
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </div>
                      <span className="mr-2 text-muted-foreground">{isExpanded ? <FolderOpen size={14} /> : <Folder size={14} />}</span>
                      <span className="truncate">{page.title || '[UNNAMED PAGE]'}</span>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="flex flex-col relative before:absolute before:left-[19px] before:top-0 before:bottom-0 before:w-px before:bg-border/50">
                        {page.children.map((id) => (
                          <div
                            key={id}
                            onClick={() => { setActiveComponent(id); setActivePage(null); }}
                            className={cn(
                              'flex items-center pl-8 pr-2 py-1.5 cursor-pointer hover:bg-accent/50',
                              activeComponentId === id ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                            )}
                          >
                            <ComponentIcon size={13} className="mr-2 shrink-0 opacity-70" />
                            <span className="truncate">{components[id]?.metadata.label}</span>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>

      {/* 2. PROPERTIES PANEL */}
      <ResizeHandle isVisible={isExplorerOpen && isPropertiesOpen} onMouseDown={createResizeHandler(propertiesHeight, setPropertiesHeight)} />
      <Collapsible
        open={isPropertiesOpen}
        onOpenChange={setIsPropertiesOpen}
        className={cn('flex flex-col border-t bg-background/50', isPropertiesOpen && !isExplorerOpen ? 'flex-1 min-h-0' : 'shrink-0')}
        style={isPropertiesOpen && isExplorerOpen ? { height: `${propertiesHeight}px` } : undefined}
      >
        <PanelHeader label="Properties" isOpen={isPropertiesOpen} icon={<Settings2 size={12} className='mr-1'/>}/>
        <CollapsibleContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <ComponentPropertiesPanel />
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>

      {/* 3. LOGIC PANEL */}
      <ResizeHandle isVisible={(isExplorerOpen || isPropertiesOpen) && isLogicOpen} onMouseDown={createResizeHandler(logicHeight, setLogicHeight)} />
      <Collapsible
        open={isLogicOpen}
        onOpenChange={setIsLogicOpen}
        className={cn('flex flex-col border-t bg-background/50', isLogicOpen && !isExplorerOpen && !isPropertiesOpen ? 'flex-1 min-h-0' : 'shrink-0')}
        style={isLogicOpen && (isExplorerOpen || isPropertiesOpen) ? { height: `${logicHeight}px` } : undefined}
      >
        <PanelHeader label="Logic" isOpen={isLogicOpen} icon={<Zap size={12} className="mr-1" />} />
        <CollapsibleContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <ComponentLogicPanel/>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// Internal Helper Components
function PanelHeader({ label, isOpen, icon }: { label: string; isOpen: boolean; icon?: React.ReactNode }) {
  return (
    <CollapsibleTrigger className="bg-muted flex items-center w-full px-2 py-1.5 text-[10px] font-bold tracking-widest uppercase text-muted-foreground hover:bg-accent hover:text-accent-foreground group outline-none shrink-0">
      {isOpen ? <ChevronDown className="w-3.5 h-3.5 mr-1" /> : <ChevronRight className="w-3.5 h-3.5 mr-1" />}
      {icon}
      {label}
    </CollapsibleTrigger>
  );
}

function ResizeHandle({ isVisible, onMouseDown }: { isVisible: boolean; onMouseDown: (e: React.MouseEvent) => void }) {
  if (!isVisible) return null;
  return (
    <div
      className="h-[1px] w-full cursor-row-resize bg-border/40 hover:bg-primary/50 active:bg-primary/80 transition-colors shrink-0 z-10"
      onMouseDown={onMouseDown}
    />
  );
}