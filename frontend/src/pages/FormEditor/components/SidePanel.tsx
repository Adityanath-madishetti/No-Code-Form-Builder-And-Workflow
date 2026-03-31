// src/pages/FormEditor/components/SidePanel.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFormStore } from '@/form/store/formStore';

import { ComponentPropertiesPanel } from './ComponentPropertiesPanel';
import { ComponentCatalogPanel } from './ComponentCatalogPanel';
import { FormOverviewPanel } from './FormOverviewPanel';

import { printFormJSON } from '@/form/store/formStore';
import { Button } from '@/components/ui/button';

export function SidePanel() {
  const activeTab = useFormStore((s) => s.activeSidePanelTab);
  const setActiveTab = useFormStore((s) => s.setActiveSidePanelTab);

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="flex h-full w-full flex-col gap-4"
    >
      <TabsList className="w-full justify-start">
        <TabsTrigger
          value="overview"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground"
        >
          Overview
        </TabsTrigger>
        <TabsTrigger
          value="properties"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground"
        >
          Properties
        </TabsTrigger>
        <TabsTrigger
          value="components"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-primary dark:data-[state=active]:text-primary-foreground"
        >
          Components
        </TabsTrigger>
      </TabsList>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden overflow-y-auto rounded-xl no-scrollbar">
        <TabsContent value="overview" className='pt-1'>
          {/* Overview content */}
          <Button
            variant="outline"
            onClick={() => printFormJSON()}
          >
            Click to log json
          </Button>
          <FormOverviewPanel />
        </TabsContent>

        <TabsContent value="properties" className='pt-1'>
          <ComponentPropertiesPanel />
        </TabsContent>

        <TabsContent value="components" className='pt-1'>
          <ComponentCatalogPanel />
        </TabsContent>
      </div>
    </Tabs>
  );
}
