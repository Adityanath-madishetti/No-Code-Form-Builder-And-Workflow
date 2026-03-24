// src/form/components/InputRenderer.tsx
import type { RendererProps } from './base';
import type { InputProps } from './input';
import { useFormStore } from '../store/formStore';
import { Input } from '@/components/ui/input';
import { ComponentPropTitle } from './ComponentRender.Helper';

export const InputComponentRenderer = ({
  props,
}: RendererProps<InputProps>) => {
  return (
    <Input
      type="text"
      placeholder={props.placeholder}
      defaultValue={props.defaultValue}
      className="px-4"
    />
  );
};

export const InputComponentPropsRenderer = ({
  props,
  instanceId,
}: RendererProps<InputProps>) => {
  const updateComponentProps = useFormStore((s) => s.updateComponentProps);

  return (
    <div className="w-full">
      <ComponentPropTitle title="Placeholder" />
      <Input
        type="text"
        value={props.placeholder || ''}
        onChange={(e) =>
          updateComponentProps(instanceId, { placeholder: e.target.value })
        }
        placeholder="Enter placeholder text"
      />

      <ComponentPropTitle title="Default Value" />
      <Input
        type="text"
        value={props.defaultValue || ''}
        onChange={(e) =>
          updateComponentProps(instanceId, { defaultValue: e.target.value })
        }
        placeholder="Enter default value"
      />
    </div>
  );
};
