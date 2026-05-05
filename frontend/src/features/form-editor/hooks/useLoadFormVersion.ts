import { useEffect, useState } from 'react';
import { useFormStore } from '@/features/form';
import { loadFormVersion } from '@/services/api';
import { useLogicStore } from '@/features/form';

export function useLoadFormVersion(formId: string | undefined) {
  const [formLoaded, setFormLoaded] = useState(false);
  const loadForm = useFormStore((s) => s.loadForm);
  const initForm = useFormStore((s) => s.initForm);
  const setCurrentVersionInStore = useFormStore((s) => s.setCurrentVersion);

  useEffect(() => {
    if (!formId) return;
    let cancelled = false;

    // Clear the old form immediately so stale data doesn't flash
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormLoaded(false);
    loadForm(
      {
        id: formId,
        name: '',
        metadata: { createdAt: '', updatedAt: '' },
        theme: null,
        access: {
          visibility: 'private',
          editors: [],
          reviewers: [],
          viewers: [],
        },
        settings: {
          submissionLimit: null,
          closeDate: null,
          collectEmailMode: 'none',
          submissionPolicy: 'none',
          canViewOwnSubmission: false,
          confirmationMessage: 'Thank you for your response!',
        },
        pages: [],
      },
      [],
      [],
      1
    );

    loadFormVersion(formId)
      .then(
        ({
          form,
          pages,
          components,
          version,
          logicRules,
          logicFormulas,
          logicShuffleStacks,
        }) => {
          if (cancelled) return;
          loadForm(form, pages, components, version);
          // Hydrate logic store
          useLogicStore
            .getState()
            .loadRules(logicRules, logicFormulas, logicShuffleStacks);
          setFormLoaded(true);
        }
      )
      .catch(() => {
        if (cancelled) return;
        // Form just created — init locally
        initForm(formId, 'Untitled Form');
        setCurrentVersionInStore(1);
        setFormLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [formId, initForm, loadForm, setCurrentVersionInStore]);

  return { formLoaded };
}
