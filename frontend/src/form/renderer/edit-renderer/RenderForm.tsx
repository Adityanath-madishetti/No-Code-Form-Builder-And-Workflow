// src/form/renderer/editRenderer/RenderForm.tsx
import { useFormStore, formSelectors } from '@/form/store/form.store';

import { RenderPage } from './RenderPage';
import { ComponentPropTitle } from '@/form/components/ComponentRender.Helper';
import {
  RichTextEditor,
  sharedProseClasses,
} from '@/components/RichTextEditor';
import { Input as ShadInput } from '@/components/ui/input';



export const RenderForm = () => {
  const form = useFormStore(formSelectors.form);
  if (!form) {
    return (
      <div className="w-full border border-border bg-card shadow-sm p-4 text-center">
        <h3 className="text-lg font-semibold text-muted-foreground">No form loaded.</h3>
      </div>
    );
  }

  return (
    <form className="mx-auto flex h-auto min-h-screen w-full flex-col gap-6 bg-background p-6 text-foreground">
      {/* 1. The Isolated White Header Region */}
      <div className="bg-background mx-auto w-full max-w-3xl border border-border shadow-sm">
        <div className="flex flex-col items-start gap-3 p-6 border-b border-border">
          <h2 className="text-4xl font-semibold tracking-tight text-foreground">
            {form.name}
          </h2>
        </div>
        {form.metadata.description && (
          <div className="p-6">
            <div
              className={sharedProseClasses}
              dangerouslySetInnerHTML={{ __html: form.metadata.description }}
            />
          </div>
        )}
      </div>

      {/* 2. The Rendered Pages */}
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        {form.pages.map((page, index) => (
          <RenderPage key={page} pageId={page} index={index} />
        ))}
      </div>
    </form>
  );
};

// // TODO
// export const RenderFormOverview = () => {
//   const updateFormMetadata = useFormStore((s) => s.updateFormMetadata);
//   const formMetadata = useFormStore(formSelectors.formMetadata);
//   const formName = useFormStore((s) => s.form?.name);
//   const updateFormName = useFormStore((s) => s.updateFormName);

//   return (
//     <div className="w-full space-y-2">
//       <ComponentPropTitle title="Form Name" />
//       <ShadInput
//         value={formName}
//         onChange={(e) => updateFormName(e.target.value)}
//       />

//       <ComponentPropTitle title="Form Description" />
//       <RichTextEditor
//         value={formMetadata?.description || ''}
//         onChange={(newHTML) => updateFormMetadata({ description: newHTML })}
//       />
//     </div>
//   );
// };

export const RenderFormOverview = () => {
  const updateFormMetadata = useFormStore((s) => s.updateFormMetadata);
  const formMetadata = useFormStore(formSelectors.formMetadata);
  const formName = useFormStore((s) => s.form?.name);
  const updateFormName = useFormStore((s) => s.updateFormName);

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <ComponentPropTitle title="Form Name" />
        <ShadInput
          value={formName || ''}
          onChange={(e) => updateFormName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <ComponentPropTitle title="Form Description" />
        <RichTextEditor
          value={formMetadata?.description || ''}
          onChange={(newHTML) => updateFormMetadata({ description: newHTML })}
        />
      </div>

    </div>
  );
};
