// frontend/src/routes/publicRoutes.tsx
import Login from '@/pages/login-page/Login';
import EmbedForm from '@/shared/components/EmbedForm';
import EmbedSubmissionView from '@/shared/components/EmbedSubmissionView';
import EmbedSubmissionViewHardcodedTest from '@/shared/components/EmbedSubmissionViewHardcodedTest';
import { RouteErrorFallback } from '@/shared/components/ErrorFallback';
import LandingPage from '@/pages/landing-page/LandingPage';
import FormRunPage from '@/pages/FormRunPage';

export const publicRoutes = [
  {
    errorElement: <RouteErrorFallback />,
    children: [
      {
        path: '/',
        element: <LandingPage />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/forms/:formId',
        element: <FormRunPage />,
      },
      {
        path: '/embed/forms/:formId',
        element: <EmbedForm />,
      },
      {
        path: '/embed/submission-view',
        element: <EmbedSubmissionView />,
      },
      {
        path: '/embed/submission-view/test',
        element: <EmbedSubmissionViewHardcodedTest />,
      },
    ],
  },
];
