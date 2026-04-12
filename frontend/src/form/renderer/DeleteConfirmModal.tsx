import { useState } from 'react';

export function useDeleteConfirm() {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [skipDeleteConfirm, setSkipDeleteConfirm] = useState(() => {
    try {
      if (typeof window === 'undefined') return false;
      return (
        window.localStorage.getItem('form-builder:skipDeleteConfirm') === '1'
      );
    } catch {
      return false;
    }
  });

  const handleDeleteRequest = (onExecuteDelete: () => void) => {
    if (skipDeleteConfirm) {
      onExecuteDelete();
    } else {
      setDeleteConfirmOpen(true);
    }
  };

  const handleConfirm = (doNotAskAgain: boolean, onExecuteDelete: () => void) => {
    if (doNotAskAgain) {
      try {
        window.localStorage.setItem('form-builder:skipDeleteConfirm', '1');
        setSkipDeleteConfirm(true);
      } catch {
        // ignore errors
      }
    }
    onExecuteDelete();
    setDeleteConfirmOpen(false);
  };

  return {
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    handleDeleteRequest,
    handleConfirm,
  };
}

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (doNotAskAgain: boolean) => void;
  componentName: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  componentName,
}: DeleteConfirmModalProps) {
  const [deleteDoNotAskAgain, setDeleteDoNotAskAgain] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className="w-full max-w-sm border border-border bg-background p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        draggable={false}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-foreground">
              Delete component?
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              This will remove{' '}
              <span className="font-medium">{componentName}</span> from the
              form.
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="flex h-7 w-7 items-center justify-center rounded-none border border-border bg-background text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Close delete confirmation"
          >
            ×
          </button>
        </div>

        <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={deleteDoNotAskAgain}
            onChange={(e) => setDeleteDoNotAskAgain(e.target.checked)}
          />
          Do this for every delete (don't ask again)
        </label>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="flex h-8 items-center justify-center rounded-none border border-border bg-background px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConfirm(deleteDoNotAskAgain);
            }}
            className="flex h-8 items-center justify-center rounded-none border border-destructive/50 bg-destructive/10 px-3 text-sm text-destructive transition-colors hover:bg-destructive/15"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
