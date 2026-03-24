import { FormModeProvider } from '@/form/context/FormModeContext';
import { RenderForm } from '@/form/renderer/editRenderer/RenderForm';

export function FormCanvas() {
  return (
    <FormModeProvider value="edit">
      <RenderForm />
    </FormModeProvider>
  );
}
