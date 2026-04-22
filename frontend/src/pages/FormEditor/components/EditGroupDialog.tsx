import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { Group } from '@/form/store/group.store';
import { EmailChipsField } from '@/components/EmailChipsField';

interface EditGroupDialogProps {
  group: Group;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    id: string,
    updates: { name?: string; sharedWith?: string[]; isPublic?: boolean }
  ) => void;
}

export function EditGroupDialog({
  group,
  open,
  onOpenChange,
  onSave,
}: EditGroupDialogProps) {
  const [name, setName] = useState(group.name);
  const [isPublic, setIsPublic] = useState(group.isPublic);
  const [sharedEmails, setSharedEmails] = useState<string[]>(
    group.sharedWith || []
  );

  const handleSave = () => {
    onSave(group.id, {
      name,
      isPublic,
      sharedWith: sharedEmails,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Component Group</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Group Name"
            />
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="public-setting">Public</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Allow everyone to use this component group
              </p>
            </div>
            <Switch
              id="public-setting"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          <div className="mt-2 grid gap-2">
            <Label>Shared With (Emails)</Label>
            <div className={isPublic ? 'pointer-events-none opacity-50' : ''}>
              <EmailChipsField
                entries={sharedEmails.map((email) => ({ email }))}
                onChange={(entries) =>
                  setSharedEmails(entries.map((e) => e.email))
                }
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Add emails of users to share with.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
