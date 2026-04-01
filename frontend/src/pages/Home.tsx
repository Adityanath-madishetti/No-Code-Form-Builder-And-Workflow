// src/pages/Home.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus, FileText, LogOut, Loader2 } from 'lucide-react';

interface FormHeader {
  formId: string;
  title: string;
  currentVersion: number;
  isActive: boolean;
  updatedAt: string;
  createdAt: string;
}

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [forms, setForms] = useState<FormHeader[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api
      .get<{ forms: FormHeader[] }>('/forms')
      .then((res) => setForms(res.forms))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await api.post<{ form: FormHeader }>('/forms', {
        title: 'Untitled Form',
      });
      navigate(`/form-builder/${res.form.formId}`);
    } catch {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50 dark:bg-neutral-950">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-border bg-background px-6 py-3">
        <h1 className="text-lg font-semibold tracking-tight">Form Builder</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{user?.email}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-1.5 h-3.5 w-3.5" />
            Logout
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">My Forms</h2>
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-1.5 h-4 w-4" />
            )}
            Create Form
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : forms.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border py-20 text-center">
            <FileText className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              No forms yet. Create your first one!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {forms.map((form) => (
              <button
                key={form.formId}
                onClick={() => navigate(`/form-builder/${form.formId}`)}
                className="group flex flex-col items-start gap-2 rounded-lg border border-border bg-background p-4 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex w-full items-start justify-between">
                  <h3 className="text-sm font-medium group-hover:text-primary transition-colors">
                    {form.title}
                  </h3>
                  <span className="ml-2 shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    v{form.currentVersion}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Updated {formatDate(form.updatedAt)}
                </p>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      form.isActive ? 'bg-green-500' : 'bg-neutral-300'
                    }`}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {form.isActive ? 'Active' : 'Draft'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
