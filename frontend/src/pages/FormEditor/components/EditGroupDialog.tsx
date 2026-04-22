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

interface EditGroupDialogProps {
  group: Group;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: { name?: string; sharedWith?: string[]; isPublic?: boolean }) => void;
}

export function EditGroupDialog({ group, open, onOpenChange, onSave }: EditGroupDialogProps) {
  const [name, setName] = useState(group.name);
  const [isPublic, setIsPublic] = useState(group.isPublic);
  const [sharedEmailsStr, setSharedEmailsStr] = useState(group.sharedWith ? group.sharedWith.join(', ') : '');

  const handleSave = () => {
    const sharedWith = sharedEmailsStr
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    onSave(group.id, {
      name,
      isPublic,
      sharedWith
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
          
          <div className="flex items-center justify-between mt-2">
            <div className="space-y-0.5">
              <Label htmlFor="public-setting">Public</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Allow everyone to use this component group
              </p>
            </div>
            <Switch
              id="public-setting"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          <div className="grid gap-2 mt-2">
            <Label htmlFor="shared-emails">Shared With (Emails)</Label>
            <Input
              id="shared-emails"
              value={sharedEmailsStr}
              onChange={(e) => setSharedEmailsStr(e.target.value)}
              placeholder="user1@example.com, user2@example.com"
              disabled={isPublic}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Comma-separated list of emails of users to share with.
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
