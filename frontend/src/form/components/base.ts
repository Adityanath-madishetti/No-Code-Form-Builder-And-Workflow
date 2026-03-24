// src/form/components/base.ts
/**
 * Form Component System - Base Types
 * ------------------------------------------------------------------------------------------------
 * This file defines the foundational type system for a schema-driven form builder.
 *
 * Design Goals:
 * - Strongly typed component registry
 * - Serializable form structure (for storage, transport, versioning)
 * - Decoupled rendering (UI) from data model
 * - Support for dynamic / nested components
 * - Extensible for new component types without modifying core logic
 *
 * Architecture Overview:
 * - A `Form` contains multiple `FormPage`s
 * - Each `FormPage` contains an ordered list of component `InstanceID`s
 * - Each component is represented by a `BaseFormComponent` instance
 * - Rendering is handled separately via `RendererProps`
 *
 * Key Concepts:
 * - `ComponentID`: Identifies the type of component (Input, Checkbox, etc.)
 * - `InstanceID`: Unique identifier for a specific instance in the form tree
 * - `props`: Strongly-typed configuration specific to each component
 * - `children`: Enables composition / nesting of components
 *
 * ------------------------------------------------------------------------------------------------
 * Typical Flow:
 *
 * 1. Define component types (via `ComponentIDs`)
 * 2. Store instances as `BaseFormComponent<P>`
 * 3. Maintain layout using `FormPage.children`
 * 4. Render via a component registry using `RendererProps`
 *
 * ------------------------------------------------------------------------------------------------
 * Notes:
 * - This layer is purely structural (no UI logic)
 * - Designed to work with state stores (e.g., Zustand) and renderer registries
 * - Enables features like persistence, undo/redo, and collaborative editing
 *
 * ------------------------------------------------------------------------------------------------
 */

// ------------------------------------------------------------------------------------------------
//
// Component Model
//
// ------------------------------------------------------------------------------------------------

/**
 * Enum-like mapping of all supported component types.
 *
 * Extend this object to introduce new components into the system.
 * Acts as the canonical source of truth for component type IDs.
 */
export const ComponentIDs = {
  Dummy: 'Dummy',
  TextBox: 'TextBox',
  Input: 'Input',
  Radio: 'Radio',
  Checkbox: 'Checkbox',
  Dropdown: 'Dropdown',
} as const;

export type ComponentID = (typeof ComponentIDs)[keyof typeof ComponentIDs];
export type InstanceID = string;

export interface ComponentMetadata {
  label: string;
  description?: string;
  // isLocked?: boolean;
  // group: 'layout' | 'input' | 'selection';
}

/**
 * Props passed to a renderer for a specific component instance.
 *
 * Separates rendering concerns from the underlying data model.
 */
export interface RendererProps<P> {
  metadata: ComponentMetadata;
  props: P;
  instanceId: InstanceID;
}

export interface BaseFormComponent<P = unknown> {
  readonly id: ComponentID;
  readonly instanceId: InstanceID;
  readonly name: string;
  metadata: ComponentMetadata;
  children: InstanceID[];
  props: P; // Component-specific props (e.g., placeholder, min/max)
}

// ------------------------------------------------------------------------------------------------
//
// Page Model
//
// ------------------------------------------------------------------------------------------------

export type PageID = string;

/**
 * Represents a single page in a multi-step form.
 */
export interface FormPage {
  readonly id: PageID;
  children: InstanceID[];
  isTerminal: boolean; // True if this is the last page (default)
}

// ------------------------------------------------------------------------------------------------
//
// Form Model
//
// ------------------------------------------------------------------------------------------------

export type FormID = string;
export type ThemeID = string;

export interface FormMetadata {
  description?: string;
  createdAt: string;
  updatedAt: string;
  authorId?: string;
  version?: number;
}

/**
 * The root container for a form.
 * Manages form-level settings, metadata, and the ordered list of pages.
 */
export interface Form {
  readonly id: FormID;
  name: string;
  themeID: ThemeID | null;
  metadata: FormMetadata;
  pages: PageID[];
}
