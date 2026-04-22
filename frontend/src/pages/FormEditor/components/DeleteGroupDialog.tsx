import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export const DONT_ASK_DELETE_GROUP_KEY = 'dontAskAgainDeleteGroup';

interface DeleteGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  groupName: string;
}

export function DeleteGroupDialog({
  open,
  onOpenChange,
  onConfirm,
  groupName,
}: DeleteGroupDialogProps) {
  const [dontAskAgain, setDontAskAgain] = useState(false);

  const handleConfirm = () => {
    if (dontAskAgain) {
      localStorage.setItem(DONT_ASK_DELETE_GROUP_KEY, 'true');
    }
    setDontAskAgain(false);
    onConfirm();
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setDontAskAgain(false);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Group</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the component group "{groupName}"?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-2 py-4">
          <Checkbox
            id="dont-ask-delete-group"
            checked={dontAskAgain}
            onCheckedChange={(checked) => setDontAskAgain(checked === true)}
          />
          <label
            htmlFor="dont-ask-delete-group"
            className="cursor-pointer text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Don't ask again
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
