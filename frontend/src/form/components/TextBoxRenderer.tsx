// src/form/renderer/TextBoxComponentRenderer.tsx
import type { RendererProps } from './base';
import type { TextBoxProps } from './textBox';
// import { Card, CardContent } from '@/components/ui/card';
import { useFormStore } from '../store/formStore';
import { Card as HeroCard } from '@heroui/react';

import { ComponentPropTitle } from './ComponentRender.Helper';

import {
  RichTextEditor,
  sharedProseClasses,
} from '@/components/RichTextEditor';
import { FormThemeProvider } from '@/form/theme/FormThemeProvider';

export const TextBoxComponentRenderer = ({
  props,
}: RendererProps<TextBoxProps>) => {
  return (
    <FormThemeProvider>
      <HeroCard className="w-full">
        <HeroCard.Content className="">
          <div
            className={sharedProseClasses}
            dangerouslySetInnerHTML={{ __html: props.text }}
          />
        </HeroCard.Content>
      </HeroCard>
    </FormThemeProvider>
  );
};

export const TextBoxComponentPropsRenderer = ({
  props,
  instanceId,
}: RendererProps<TextBoxProps>) => {
  const updateComponentProps = useFormStore((s) => s.updateComponentProps);

  return (
    <div className="w-full space-y-2">
      <ComponentPropTitle title="Text Content" />
      <RichTextEditor
        value={props.text || ''}
        onChange={(newHTML) =>
          updateComponentProps(instanceId, { text: newHTML })
        }
      />
    </div>
  );
};
