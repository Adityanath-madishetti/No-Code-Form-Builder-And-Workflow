import { create } from 'zustand';
import {
  createFormTemplate,
  deleteFormTemplate,
  fetchFormTemplates,
  updateFormTemplate,
  type FormTemplateData,
  type FormTemplateSnapshot,
} from '@/lib/formTemplateApi';

interface TemplateStore {
  templates: FormTemplateData[];
  isLoading: boolean;
  error: string | null;
  loadTemplates: () => Promise<void>;
  addTemplate: (
    name: string,
    snapshot: FormTemplateSnapshot,
    description?: string
  ) => Promise<void>;
  updateTemplate: (
    templateId: string,
    updates: Partial<
      Pick<FormTemplateData, 'name' | 'description' | 'sharedWith' | 'isPublic'>
    >
  ) => Promise<void>;
  removeTemplate: (templateId: string) => Promise<void>;
}

export const useTemplateStore = create<TemplateStore>((set) => ({
  templates: [],
  isLoading: false,
  error: null,

  loadTemplates: async () => {
    set({ isLoading: true, error: null });
    try {
      const templates = await fetchFormTemplates();
      set({ templates, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addTemplate: async (name, snapshot, description) => {
    const created = await createFormTemplate({ name, snapshot, description });
    set((state) => ({ templates: [created, ...state.templates] }));
  },

  updateTemplate: async (templateId, updates) => {
    const updated = await updateFormTemplate(templateId, updates);
    set((state) => ({
      templates: state.templates.map((template) =>
        template.templateId === templateId ? updated : template
      ),
    }));
  },

  removeTemplate: async (templateId) => {
    await deleteFormTemplate(templateId);
    set((state) => ({
      templates: state.templates.filter(
        (template) => template.templateId !== templateId
      ),
    }));
  },
}));
