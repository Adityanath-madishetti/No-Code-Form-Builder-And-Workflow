// frontend/src/routes/protectedRoutes.tsx
import ProtectedLayout from '@/layouts/ProtectedLayout';
import {
  KeyboardShortcutsPage,
  DashboardPage,
  FluxorisMfeDryRunPage,
  FluxorisRunDetailsPage,
} from '@/pages';
import { RouteErrorFallback } from '@/shared/components/ErrorFallback';

import { settingsRoutes } from './settingsRoutes';
import { formRoutes } from './formRoutes';

export const protectedRoutes = {
  element: <ProtectedLayout />,
  errorElement: <RouteErrorFallback />,
  children: [
    {
      path: 'dashboard',
      element: <DashboardPage />,
    },
    {
      path: 'keyboard-shortcuts',
      element: <KeyboardShortcutsPage />,
    },
    {
      path: 'integrations/fluxoris-mfe-dry-run',
      element: <FluxorisMfeDryRunPage />,
    },
    {
      path: 'integrations/fluxoris-run-details',
      element: <FluxorisRunDetailsPage />,
    },
    ...settingsRoutes,
    ...formRoutes,
  ],
};
