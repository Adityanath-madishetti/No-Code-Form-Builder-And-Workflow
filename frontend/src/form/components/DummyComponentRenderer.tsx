// src/form/components/DummyComponentRenderer.tsx
import { useFormStore } from '../store/formStore';
import type { RendererProps } from './base';
import type { DummyProps } from './dummy';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

import { Input } from '@/components/ui/input';

import { ComponentPropTitle } from './ComponentRender.Helper';

export const DummyComponentRenderer = ({
  metadata,
  props,
}: RendererProps<DummyProps>) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{metadata.label}</CardTitle>

        {metadata.description && (
          <CardDescription>{metadata.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent>
        <p>{props.text}</p>
      </CardContent>
    </Card>
  );
};

export const DummyComponentPropsRenderer = ({
  props,
  instanceId,
}: RendererProps<DummyProps>) => {
  const updateComponentProps = useFormStore((s) => s.updateComponentProps);

  return (
    <div className="w-full">
      <ComponentPropTitle title="Text" />
      <Input
        type="text"
        value={props.text || ''}
        onChange={(e) =>
          updateComponentProps(instanceId, { text: e.target.value })
        }
        placeholder="Enter some text"
      />
    </div>
  );
};
