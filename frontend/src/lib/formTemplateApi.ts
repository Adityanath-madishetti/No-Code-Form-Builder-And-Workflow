import { api } from './api';
import type {
  AccessIdentity,
  Form,
  FormAccess,
  FormPage,
  FormSettings,
  FormTheme,
} from '@/form/components/base';
import type { AnyFormComponent } from '@/form/registry/componentRegistry';
import type {
  ComponentShuffleStack,
  FormulaRule,
  LogicRule,
} from '@/form/logic/logicTypes';
import type { Workflow } from '@/form/workflow/workflowTypes';
import type { ComponentID } from '@/form/components/base';
import {
  backendToFrontend,
  frontendToBackend,
} from './frontendBackendCompArray';
import { deserializeComponent } from '@/form/registry/componentRegistry';

export interface FormTemplateSnapshot {
  meta: {
    name: string;
    description?: string;
    createdBy?: string;
    isDraft?: boolean;
  };
  theme: FormTheme | null;
  settings: FormSettings;
  access: FormAccess;
  pages: Array<Record<string, unknown>>;
  logic?: {
    rules?: LogicRule[];
    formulas?: FormulaRule[];
    componentShuffleStacks?: ComponentShuffleStack[];
  };
  workflow?: Workflow | null;
}

export interface FormTemplateData {
  templateId: string;
  name: string;
  description?: string;
  createdBy: string;
  sharedWith: string[];
  isPublic: boolean;
  snapshot: FormTemplateSnapshot;
  createdAt?: string;
  updatedAt?: string;
  creatorEmail?: string;
}

function normalizeIdentityList(list: unknown): AccessIdentity[] {
  if (!Array.isArray(list)) return [];
  const output: AccessIdentity[] = [];
  const seen = new Set<string>();
  for (const row of list) {
    const uid =
      typeof (row as AccessIdentity)?.uid === 'string'
        ? (row as AccessIdentity).uid
        : '';
    const email =
      typeof (row as AccessIdentity)?.email === 'string'
        ? (row as AccessIdentity).email.trim().toLowerCase()
        : '';
    if (!email) continue;
    const key = uid || email;
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(uid ? { uid, email } : { email });
  }
  return output;
}

function normalizeAccess(raw: Partial<FormAccess> | undefined): FormAccess {
  const visibility =
    raw?.visibility === 'public' ||
    raw?.visibility === 'private' ||
    raw?.visibility === 'link-only'
      ? raw.visibility
      : 'private';
  return {
    visibility,
    editors: normalizeIdentityList(raw?.editors),
    reviewers: normalizeIdentityList(raw?.reviewers),
    viewers: normalizeIdentityList(raw?.viewers),
  };
}

function normalizeSettings(
  raw: Partial<FormSettings> | undefined
): FormSettings {
  return {
    submissionLimit:
      typeof raw?.submissionLimit === 'number' ? raw.submissionLimit : null,
    closeDate: raw?.closeDate || null,
    collectEmailMode: raw?.collectEmailMode || 'none',
    submissionPolicy: raw?.submissionPolicy || 'none',
    canViewOwnSubmission: raw?.canViewOwnSubmission === true,
    confirmationMessage:
      raw?.confirmationMessage || 'Thank you for your response!',
  };
}

export function buildSnapshotFromEditor(params: {
  form: Form;
  pages: Record<string, FormPage>;
  components: Record<string, AnyFormComponent>;
  logicRules?: LogicRule[];
  logicFormulas?: FormulaRule[];
  logicShuffleStacks?: ComponentShuffleStack[];
  workflow?: Workflow | null;
  createdBy?: string;
}): FormTemplateSnapshot {
  const {
    form,
    pages: pagesById,
    components: componentsById,
    logicRules = [],
    logicFormulas = [],
    logicShuffleStacks = [],
    workflow = null,
    createdBy = '',
  } = params;

  const pages = form.pages.map((pageId, pageNo) => {
    const page = pagesById[pageId];
    const components = (page?.children || []).map((childId, order) => {
      const component = componentsById[childId];
      if (!component) {
        return {
          componentId: childId,
          componentType: 'custom',
          label: 'Unknown',
          props: {},
          validation: {},
          order,
        };
      }
      return {
        componentId: component.instanceId,
        componentType:
          frontendToBackend[component.id] || component.id.toLowerCase(),
        label: component.metadata?.label || component.id,
        description: '',
        required:
          ((component.validation as unknown as Record<string, unknown>)
            ?.required as boolean) === true,
        group: 'input',
        props: component.props as unknown as Record<string, unknown>,
        validation: component.validation as unknown as Record<string, unknown>,
        order,
      };
    });

    return {
      pageId,
      pageNo: pageNo + 1,
      title: page?.title || `Page ${pageNo + 1}`,
      description: page?.description || '',
      components,
      isTerminal: page?.isTerminal || false,
      defaultPreviousPageId: page?.defaultPreviousPageId,
      defaultNextPageId: page?.defaultNextPageId,
    };
  });

  return {
    meta: {
      createdBy,
      name: form.name,
      description: form.metadata.description || '',
      isDraft: true,
    },
    theme: form.theme,
    settings: normalizeSettings(form.settings),
    access: normalizeAccess(form.access),
    pages,
    logic: {
      rules: logicRules,
      formulas: logicFormulas,
      componentShuffleStacks: logicShuffleStacks,
    },
    workflow,
  };
}

export function parseTemplateSnapshotToEditor(template: FormTemplateData): {
  form: Form;
  pages: FormPage[];
  components: AnyFormComponent[];
  logicRules: LogicRule[];
  logicFormulas: FormulaRule[];
  logicShuffleStacks: ComponentShuffleStack[];
  workflow: Workflow | null;
} {
  const snapshot = template.snapshot;
  const backendPages = Array.isArray(snapshot.pages) ? snapshot.pages : [];

  const form: Form = {
    id: 'template-applied',
    name: snapshot.meta?.name || template.name,
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: snapshot.meta?.description || template.description || '',
      authorId: template.createdBy,
      version: 1,
    },
    theme: snapshot.theme || null,
    access: normalizeAccess(snapshot.access),
    settings: normalizeSettings(snapshot.settings),
    pages: backendPages.map((p) =>
      String((p as { pageId?: string }).pageId || '')
    ),
  };

  const pages: FormPage[] = [];
  const components: AnyFormComponent[] = [];

  for (const rawPage of backendPages) {
    const page = rawPage as {
      pageId: string;
      title?: string;
      description?: string;
      components?: Array<Record<string, unknown>>;
      isTerminal?: boolean;
      defaultPreviousPageId?: string;
      defaultNextPageId?: string;
    };
    const children: string[] = [];
    for (const rawComp of page.components || []) {
      const component = rawComp as {
        componentId: string;
        componentType: string;
        label?: string;
        props?: Record<string, unknown>;
        validation?: Record<string, unknown>;
      };
      const frontendId = (backendToFrontend[component.componentType] ||
        component.componentType) as ComponentID;
      const deserialized = deserializeComponent({
        id: frontendId,
        instanceId: component.componentId,
        metadata: { label: component.label || frontendId },
        props: (component.props || {}) as never,
        validation: (component.validation || {}) as never,
      });
      children.push(component.componentId);
      components.push(deserialized as unknown as AnyFormComponent);
    }
    pages.push({
      id: page.pageId,
      title: page.title || '',
      description: page.description || '',
      children,
      isTerminal: page.isTerminal === true,
      defaultPreviousPageId: page.defaultPreviousPageId,
      defaultNextPageId: page.defaultNextPageId,
    });
  }

  return {
    form,
    pages,
    components,
    logicRules: snapshot.logic?.rules || [],
    logicFormulas: snapshot.logic?.formulas || [],
    logicShuffleStacks: snapshot.logic?.componentShuffleStacks || [],
    workflow: snapshot.workflow || null,
  };
}

export async function fetchFormTemplates(): Promise<FormTemplateData[]> {
  const response = await api.get<{ templates: FormTemplateData[] }>(
    '/api/form-templates'
  );
  return response.templates;
}

export async function createFormTemplate(payload: {
  name: string;
  description?: string;
  snapshot: FormTemplateSnapshot;
}): Promise<FormTemplateData> {
  const response = await api.post<{ template: FormTemplateData }>(
    '/api/form-templates',
    payload
  );
  return response.template;
}

export async function updateFormTemplate(
  templateId: string,
  updates: Partial<
    Pick<FormTemplateData, 'name' | 'description' | 'sharedWith' | 'isPublic'>
  >
): Promise<FormTemplateData> {
  const response = await api.patch<{ template: FormTemplateData }>(
    `/api/form-templates/${templateId}`,
    updates
  );
  return response.template;
}

export async function deleteFormTemplate(templateId: string): Promise<void> {
  await api.delete(`/api/form-templates/${templateId}`);
}

export async function getFormTemplate(
  templateId: string
): Promise<FormTemplateData> {
  const response = await api.get<{ template: FormTemplateData }>(
    `/api/form-templates/${templateId}`
  );
  return response.template;
}

export async function previewFormTemplate(
  templateId: string
): Promise<FormTemplateData> {
  const response = await api.get<{ preview: FormTemplateData }>(
    `/api/form-templates/${templateId}/preview`
  );
  const preview = response.preview;
  return {
    templateId: preview.templateId,
    name: preview.name,
    description: preview.description,
    createdBy: '',
    sharedWith: [],
    isPublic: false,
    snapshot: preview.snapshot,
  };
}

export async function createFormFromTemplate(
  templateId: string
): Promise<{ formId: string }> {
  const template = await getFormTemplate(templateId);
  const created = await api.post<{ form: { formId: string } }>('/api/forms', {
    title: template.snapshot.meta?.name || template.name,
    description: template.snapshot.meta?.description || '',
  });

  const formId = created.form.formId;
  await api.put(`/api/forms/${formId}/versions/1`, {
    meta: {
      createdBy: template.snapshot.meta?.createdBy || 'unknown',
      name: template.snapshot.meta?.name || template.name,
      description: template.snapshot.meta?.description || '',
      isDraft: true,
    },
    theme: template.snapshot.theme,
    settings: template.snapshot.settings,
    access: template.snapshot.access,
    pages: template.snapshot.pages,
    logic: template.snapshot.logic || {},
  });
  await api.patch(`/api/forms/${formId}`, {
    title: template.snapshot.meta?.name || template.name,
  });
  return { formId };
}
