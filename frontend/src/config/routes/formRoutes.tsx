import { FormEditorPage, FormPreviewPage, FormReview } from '@/pages';

export const formRoutes = [
  {
    path: 'form-builder/:formId',
    element: <FormEditorPage />,
  },
  {
    path: 'forms/:formId/preview',
    element: <FormPreviewPage />,
  },
  {
    path: 'forms/templates/:templateId/preview',
    element: <FormPreviewPage />,
  },
  {
    path: 'reviews/:formId',
    element: <FormReview />,
  },
];
