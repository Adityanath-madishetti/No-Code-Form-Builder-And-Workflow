// src/form/context/FormModeContext.tsx
import { createContext, useContext } from 'react';

export type FormMode = 'view' | 'edit';

const FormModeContext = createContext<FormMode>('view');

export const FormModeProvider = FormModeContext.Provider;
// eslint-disable-next-line react-refresh/only-export-components
export const useFormMode = () => useContext(FormModeContext);
