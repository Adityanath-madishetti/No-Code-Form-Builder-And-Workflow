import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Group } from '@/form/store/group.store';

interface InfoGroupDialogProps {
  group: Group;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InfoGroupDialog({
  group,
  open,
  onOpenChange,
}: InfoGroupDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Component Group Information</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Name</span>
            <span className="text-sm text-muted-foreground">{group.name}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Created By</span>
            <span className="text-sm text-muted-foreground">
              {group.creatorEmail || 'Unknown'} (UID: {group.createdBy})
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Created At</span>
            <span className="text-sm text-muted-foreground">
              {group.createdAt
                ? new Date(group.createdAt).toLocaleString()
                : 'Unknown'}
            </span>
          </div>
          <div className="flex max-h-40 flex-col gap-1 overflow-y-auto">
            <span className="text-sm font-semibold">
              Components ({group.components.length})
            </span>
            <ul className="mt-1 list-disc pl-5 text-sm text-muted-foreground">
              {group.components.map((comp, i) => (
                <li key={i}>{comp.metadata?.label || comp.id}</li>
              ))}
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
