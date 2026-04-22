import type { AccessIdentity } from '@/form/components/base';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function EmailChipsField({
  entries,
  onChange,
}: {
  entries: AccessIdentity[];
  onChange: (entries: AccessIdentity[]) => void;
}) {
  const [draft, setDraft] = useState('');

  const addEmail = (raw: string) => {
    const email = normalizeEmail(raw);
    if (!email) return;
    if (entries.some((entry) => normalizeEmail(entry.email) === email)) return;
    onChange([...entries, { email }]);
  };

  return (
    <>
      <div className="rounded-md border border-border p-2">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {entries.map((entry) => (
            <span
              key={entry.uid || entry.email}
              className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1 text-xs"
            >
              {entry.email}
              <button
                type="button"
                onClick={() =>
                  onChange(entries.filter((item) => item.email !== entry.email))
                }
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addEmail(draft);
                setDraft('');
              }
            }}
            placeholder="Type email and press Enter"
            className="text-sm"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              addEmail(draft);
              setDraft('');
            }}
          >
            Add
          </Button>
        </div>
      </div>
    </>
  );
}
