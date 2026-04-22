import { useState, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/react';
import { useGroupStore } from '@/form/store/group.store';
import type { Group } from '@/form/store/group.store';
import { DRAG_CATALOG_GROUP_ID } from '@/form/utils/DndUtils';
import { Layers, Edit2, Shield } from 'lucide-react';
import type { CatalogGroupDragData } from '@/form/store/form.store';
import { EditGroupDialog } from './EditGroupDialog';
import { useAuth } from '@/contexts/AuthContext';

function GroupItem({ group, onEdit }: { group: Group; onEdit: (g: Group) => void }) {
  const { ref, isDragging } = useDraggable({
    id: `catalog-group-${group.id}`,
    type: DRAG_CATALOG_GROUP_ID,
    data: {
      type: DRAG_CATALOG_GROUP_ID,
      group,
    } as CatalogGroupDragData,
  });

  const { removeGroup } = useGroupStore.getState();
  const { user } = useAuth();
  
  const isOwner = user?.uid === group.createdBy;

  return (
    <div
      ref={ref}
      className={`group relative flex cursor-grab items-center gap-3 rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/50 ${
        isDragging ? 'opacity-50 ring-2 ring-primary' : 'opacity-100'
      }`}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
        {isOwner ? <Layers className="h-4 w-4" /> : <Shield className="h-4 w-4 text-emerald-500" title="Shared with you" />}
      </div>
      <div className="flex flex-1 flex-col overflow-hidden text-left">
        <span className="truncate text-sm font-medium text-foreground">
          {group.name}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {group.components.length} component
          {group.components.length !== 1 ? 's' : ''}
        </span>
      </div>
      {isOwner && (
        <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100">
          <button
            className="mr-1 rounded p-1 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(group);
            }}
            title="Edit group"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            className="mr-1 rounded p-3 text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              removeGroup(group.id);
            }}
            title="Remove group"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

export function GroupCatalogPanel() {
  const groups = useGroupStore((state) => state.groups);
  const { loadGroups, updateGroup } = useGroupStore.getState();
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4 space-y-1">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Groups
        </h2>
        <p className="text-xs text-muted-foreground">
          Drag and drop custom grouped components onto your form.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        {groups.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center space-y-2 rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center">
            <Layers className="h-6 w-6 text-muted-foreground/60" />
            <p className="text-sm font-medium text-muted-foreground">
              No groups yet
            </p>
            <p className="text-xs text-muted-foreground/80">
              Select one or more components on the canvas, right-click, and
              group them to save as a quick template.
            </p>
          </div>
        ) : (
          <div className="grid gap-2">
            {groups.map((group) => (
              <GroupItem key={group.id} group={group} onEdit={setEditingGroup} />
            ))}
          </div>
        )}
      </div>

      {editingGroup && (
        <EditGroupDialog
          group={editingGroup}
          open={!!editingGroup}
          onOpenChange={(open) => !open && setEditingGroup(null)}
          onSave={updateGroup}
        />
      )}
    </div>
  );
}
