import { useState, useCallback } from 'react';
import { useFormStore } from '@/form/store/form.store';
import { saveFormVersion, createNewVersion } from '@/lib/formApi';
import { useLogicStore } from '@/form/logic/logic.store';
import { useAuth } from '@/contexts/AuthContext';

export function useSaveForm(formId: string | undefined) {
  const [saving, setSaving] = useState(false);
  const form = useFormStore((s) => s.form);
  const pages = useFormStore((s) => s.pages);
  const components = useFormStore((s) => s.components);
  const setCurrentVersionInStore = useFormStore((s) => s.setCurrentVersion);
  const { user } = useAuth();

  const handleSave = useCallback(async () => {
    if (!formId || !form) return false;
    setSaving(true);
    try {
      // Always create a new version on save
      const newVersionNum = await createNewVersion(formId);
      setCurrentVersionInStore(newVersionNum);

      // Save current editor state to the new version
      const logicState = useLogicStore.getState();

      await saveFormVersion(
        formId,
        newVersionNum,
        form,
        pages,
        components,
        user?.uid || 'unknown',
        logicState.rules,
        logicState.formulas,
        logicState.componentShuffleStacks
      );
      return true;
    } catch (err) {
      console.error('Save failed:', err);
      return false;
    } finally {
      setSaving(false);
    }
  }, [components, form, formId, pages, setCurrentVersionInStore, user?.uid]);

  return { saving, handleSave };
}
