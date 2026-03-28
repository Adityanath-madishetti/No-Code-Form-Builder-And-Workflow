// src/form/components/dropdown.ts
/**
 * Dropdown Component
 * ------------------------------------------------------------------------------------------------
 * A single-select input component that allows users to choose one option
 * from a list via a dropdown menu.
 *
 * Features:
 * - Single selection (`defaultValue`)
 * - Customizable placeholder text
 * - Configurable options (label + value pairs)
 * - Optional rich-text question/description (`questionText`)
 *
 * Notes:
 * - Only one value can be selected at a time
 * - `value` is used for storage/submission, `label` is shown to users
 * - If `defaultValue` is undefined, no option is pre-selected
 * - Rendering is handled separately via `DropdownComponentRenderer`
 *
 * ------------------------------------------------------------------------------------------------
 */

import type { ComponentMetadata } from './base';
import { ComponentIDs } from './base';
import type { FormComponent } from '@/form/components/base';

export interface DropdownOption {
  id: string;
  label: string;
  value: string;
}

export interface DropdownProps {
  questionText?: string;
  placeholder?: string;
  options: DropdownOption[];
  defaultValue?: string;
}

export interface DropdownValidation {
  requred: boolean;
}

export const createDropdownComponent = (
  instanceId: string,
  metadata: ComponentMetadata,
  props: DropdownProps,
  validation: DropdownValidation
): FormComponent<'Dropdown', DropdownProps, DropdownValidation> => ({
  id: ComponentIDs.Dropdown,
  instanceId,
  metadata,
  children: [],
  props,
  validation
});

export type DropdownComponent = ReturnType<typeof createDropdownComponent>;
