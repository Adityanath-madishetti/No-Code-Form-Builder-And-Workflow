// src/form/renderer/TextBoxComponentRenderer.tsx
import type { RendererProps } from './base';
import type { TextBoxProps } from './textBox';
import { Card, CardContent } from '@/components/ui/card';
import { useFormStore } from '../store/formStore';

import { ComponentPropTitle } from './ComponentRender.Helper';

import {
  RichTextEditor,
  sharedProseClasses,
} from '@/components/RichTextEditor';

export const TextBoxComponentRenderer = ({
  props,
}: RendererProps<TextBoxProps>) => {
  return (
    <Card className="w-full">
      <CardContent className="">
        <div
          className={sharedProseClasses}
          dangerouslySetInnerHTML={{ __html: props.text }}
        />
      </CardContent>
    </Card>
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
