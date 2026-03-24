// src/pages/FormEditor/components/SidePanel.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFormStore, formSelectors } from '@/form/store/formStore';
import { getComponentPropsRenderer } from '@/form/registry/componentRegistry';

import { ComponentCatalog } from './ComponentCatalog';


export function SidePanel() {

  const selectedComponent = useFormStore(formSelectors.selectedComponent);

  const PropsRenderer = selectedComponent
    ? getComponentPropsRenderer(selectedComponent.id)
    : null;

  const activeTab = useFormStore((s) => s.activeSidePanelTab);
  const setActiveTab = useFormStore((s) => s.setActiveSidePanelTab);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList variant="line" className="w-full justify-start">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="properties">Properties</TabsTrigger>
        <TabsTrigger value="components">Components</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">{/* Overview content */}</TabsContent>

      <TabsContent value="properties" className="p-4">
        {selectedComponent ? (
          <div className="space-y-4">
            <h3 className="border-b pb-2 text-lg font-semibold">
              Editing:{' '}
              {/* {selectedComponent.metadata?.label || selectedComponent.id} */}
              {selectedComponent.id}
            </h3>

            {PropsRenderer ? (
              // eslint-disable-next-line react-hooks/static-components
              <PropsRenderer
                props={selectedComponent.props as never}
                instanceId={selectedComponent.instanceId}
                metadata={selectedComponent.metadata}
              />
            ) : (
              <p className="text-sm text-gray-500 italic">
                No properties panel available for {selectedComponent.id}.
              </p>
            )}
          </div>
        ) : (
          <div className="flex h-40 flex-col items-center justify-center text-center text-gray-500">
            <p className="text-sm">
              Select a component on the canvas to edit its properties.
            </p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="components" className="">
        <ComponentCatalog />
      </TabsContent>
    </Tabs>
  );
}
