// src/components/layout/ProtectedLayout.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

import { Loader2 } from 'lucide-react';

export default function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* <header className="flex items-center justify-between px-6 py-4 border-b">
        <h1 className="text-lg font-semibold tracking-tight">App Name</h1>

        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {user.email}
          </span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </header> */}

      {/* <main className="flex-1 p-4 md:p-6"> */}
      <Outlet />
      {/* </main> */}
    </div>
  );
}
