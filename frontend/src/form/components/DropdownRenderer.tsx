// src/form/components/DropdownRenderer.tsx
import { useFormStore } from '../store/formStore';
import type { RendererProps } from './base';
import type { DropdownProps, DropdownOption } from './dropdown';
import { ComponentPropTitle } from './ComponentRender.Helper';
import { RichTextEditor } from '@/components/RichTextEditor';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';

export const DropdownComponentRenderer = ({
  // metadata,
  props,
}: RendererProps<DropdownProps>) => {
  return (
    <Card className="w-full">
      {/* <CardHeader>
        <CardTitle>{metadata.label}</CardTitle>
        {metadata.description && (
          <CardDescription>{metadata.description}</CardDescription>
        )}
      </CardHeader> */}

      <CardContent className="space-y-6">
        {props.questionText && (
          <div
            className="prose prose-sm dark:prose-invert max-w-none break-words"
            dangerouslySetInnerHTML={{ __html: props.questionText }}
          />
        )}

        <Select defaultValue={props.defaultValue}>
          <SelectTrigger className="w-full sm:w-[300px]">
            <SelectValue placeholder={props.placeholder || "Select an option..."} />
          </SelectTrigger>
          <SelectContent>
            {(props.options || []).map((option) => (
              <SelectItem key={option.id} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

export const DropdownComponentPropsRenderer = ({
  props,
  instanceId,
}: RendererProps<DropdownProps>) => {
  const updateComponentProps = useFormStore((s) => s.updateComponentProps);

  const handleAddOption = () => {
    const newOption: DropdownOption = {
      id: crypto.randomUUID(),
      label: `Option ${(props.options?.length || 0) + 1}`,
      value: `option-${(props.options?.length || 0) + 1}`,
    };
    updateComponentProps(instanceId, {
      options: [...(props.options || []), newOption],
    });
  };

  const handleUpdateOption = (id: string, key: keyof DropdownOption, val: string) => {
    const updated = (props.options || []).map((opt) =>
      opt.id === id ? { ...opt, [key]: val } : opt
    );
    updateComponentProps(instanceId, { options: updated });
  };

  const handleRemoveOption = (id: string) => {
    const updated = (props.options || []).filter((opt) => opt.id !== id);
    updateComponentProps(instanceId, { options: updated });
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <ComponentPropTitle title="Question Text" />
        <RichTextEditor
          value={props.questionText || ''}
          onChange={(html) => updateComponentProps(instanceId, { questionText: html })}
        />
      </div>

      <div className="space-y-2">
        <ComponentPropTitle title="Placeholder Text" />
        <Input
          value={props.placeholder || ''}
          onChange={(e) => updateComponentProps(instanceId, { placeholder: e.target.value })}
          placeholder="Select an option..."
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <ComponentPropTitle title="Dropdown Options" />
          <Button type="button" variant="outline" size="sm" onClick={handleAddOption}>
            <Plus className="mr-1 h-4 w-4" /> Add Option
          </Button>
        </div>

        <div className="space-y-2">
          {(props.options || []).map((option) => (
            <div key={option.id} className="flex items-center gap-2">
              <Input
                placeholder="Label"
                value={option.label}
                onChange={(e) => handleUpdateOption(option.id, 'label', e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Value"
                value={option.value}
                onChange={(e) => handleUpdateOption(option.id, 'value', e.target.value)}
                className="flex-1"
              />
              <Button
                type="button" variant="ghost" size="icon"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => handleRemoveOption(option.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <ComponentPropTitle title="Default Value" />
        <Select 
          value={props.defaultValue || 'none'} 
          onValueChange={(val) => updateComponentProps(instanceId, { defaultValue: val === 'none' ? undefined : val })}
        >
          <SelectTrigger><SelectValue placeholder="Select default..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {(props.options || []).map((opt) => (
              <SelectItem key={opt.id} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};