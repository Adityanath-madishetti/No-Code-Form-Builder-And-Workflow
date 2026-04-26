export interface TemplateIdentity {
  uid?: string;
  email?: string;
}

export interface FormTemplateSnapshot {
  meta: Record<string, unknown>;
  theme: Record<string, unknown> | null;
  settings: Record<string, unknown>;
  access?: {
    visibility?: 'public' | 'private' | 'link-only';
    editors?: TemplateIdentity[];
    reviewers?: TemplateIdentity[];
    viewers?: TemplateIdentity[];
    roles?: Record<string, unknown>;
  };
  pages: Record<string, unknown>[];
  logic?: Record<string, unknown>;
  workflow?: Record<string, unknown> | null;
}

export interface FormTemplateCreate {
  name: string;
  description?: string;
  isPublic?: boolean;
  sharedWith?: string[];
  snapshot: FormTemplateSnapshot;
}

export interface FormTemplateUpdate {
  name?: string;
  description?: string;
  isPublic?: boolean;
  sharedWith?: string[];
  snapshot?: FormTemplateSnapshot;
}
