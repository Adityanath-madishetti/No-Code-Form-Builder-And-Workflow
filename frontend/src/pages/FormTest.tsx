import { FormModeProvider } from '@/form/context/FormModeContext';
import { RenderForm } from '@/form/renderer/editRenderer/RenderForm';

export function FormTest() {
  return (
    <div className="h-auto w-screen items-center justify-center pt-10 pb-20">
      {/* <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose"> */}

      <FormModeProvider value="view">
        <RenderForm />
      </FormModeProvider>

      {/* </div> */}
    </div>
  );
}

export default FormTest;
