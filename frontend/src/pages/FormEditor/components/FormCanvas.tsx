// src/pages/FormEditor/components/FormCanvas.tsx
import { FormModeProvider } from '@/form/context/FormModeContext';
import { RenderForm } from '@/form/renderer/editRenderer/RenderForm';
import { FormThemeProvider } from '@/form/theme/FormThemeProvider';

export function FormCanvas() {
  return (
    <FormThemeProvider>
      <FormModeProvider value="edit">
        <div className="min-h-full w-full bg-accent/5 p-6 md:p-12">
          <RenderForm />
        </div>
      </FormModeProvider>
    </FormThemeProvider>
  );
}
