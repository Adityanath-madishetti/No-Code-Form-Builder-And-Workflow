import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { ComponentPropertiesPanel } from './components/ComponentPropertiesPanel';
import { Separator } from '@/components/ui/separator';

export default function ComponentsSidePanel() {
  return (
    <Tabs defaultValue="properties" className="h-full w-full p-4">
      <TabsList className="bg-transparent gap-2">
        <TabsTrigger
          value="properties"
          className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none! dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-primary/20 dark:data-[state=active]:text-primary"
        >
          Properties
        </TabsTrigger>
        <TabsTrigger
          value="logic"
          className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-none! dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-primary/20 dark:data-[state=active]:text-primary"
        >
          Logic
        </TabsTrigger>
      </TabsList>
      <Separator />
      <TabsContent value="properties">
        <ComponentPropertiesPanel />
      </TabsContent>
      <TabsContent value="logic">Coming soon</TabsContent>
    </Tabs>
  );
}
