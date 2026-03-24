// src/form/components/textBox.ts
/**
 * TextBox Component
 * ------------------------------------------------------------------------------------------------
 * A read-only content component used to display static or formatted text
 * within a form.
 *
 * Features:
 * - Rich text support (HTML via RichTextEditor)
 * - Fully customizable content (headings, lists, links, etc.)
 * - Styled consistently using shared prose classes
 *
 * Notes:
 * - This is a **view-only** component (no user input)
 * - Content is stored as sanitized HTML
 * - Ideal for improving form clarity and UX without adding interactivity
 * - Rendering is handled via `TextBoxComponentRenderer`
 *
 * ------------------------------------------------------------------------------------------------
 */

import { createBaseFormComponent } from './base.factories';
import type { ComponentMetadata } from './base';
import { ComponentIDs } from './base';

export interface TextBoxProps {
  text: string;
}

export const createTextBoxComponent = (
  instanceId: string,
  metadata: ComponentMetadata,
  props: TextBoxProps
) => {
  return createBaseFormComponent(
    ComponentIDs.TextBox,
    instanceId,
    'TextBoxComponent',
    metadata,
    props
  );
};

export type TextBoxComponent = ReturnType<typeof createTextBoxComponent>;
