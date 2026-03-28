import { FormModeProvider } from '@/form/context/FormModeContext';
import { RenderForm } from '@/form/renderer/editRenderer/RenderForm';

import { FormThemeProvider } from '@/form/theme/FormThemeProvider';

export function FormTest() {
  return (
    <div className="h-auto w-screen items-center justify-center">
      {/* <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose"> */}
      <FormThemeProvider>
        <FormModeProvider value="view">
          <RenderForm />
        </FormModeProvider>
      </FormThemeProvider>
      {/* </div> */}
    </div>
  );
}

export default FormTest;
