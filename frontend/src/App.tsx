import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { router } from './config/routes';
import { ErrorBoundary } from 'react-error-boundary';

import '@/shared/styles/index.css';
import { ThemeProvider } from '@/shared/components/theme-provider';
import { TooltipProvider } from '@/shared/components/ui/tooltip';
import { Toaster } from '@/shared/components/ui/sonner';
import { ErrorFallback } from '@/shared/components/ErrorFallback';

export default function App() {
  return (
    <>
      <ThemeProvider>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <TooltipProvider delayDuration={100}>
            <AuthProvider>
              <RouterProvider router={router} />
            </AuthProvider>
          </TooltipProvider>
        </ErrorBoundary>
      </ThemeProvider>
      <Toaster />
    </>
  );
}
