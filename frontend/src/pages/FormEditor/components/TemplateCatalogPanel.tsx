// src/pages/FormEditor/components/TemplateCatalogPanel.tsx
import { useEffect, useMemo, useState } from 'react';
import {
  Layers,
  Search,
  Eye,
  Upload,
  Globe2,
  Pencil,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTemplateStore } from '@/form/store/template.store';
import { useFormStore } from '@/form/store/form.store';
import { useLogicStore } from '@/form/logic/logic.store';
import { useWorkflowStore } from '@/form/workflow/workflowStore';
import {
  buildSnapshotFromEditor,
  getFormTemplate,
  parseTemplateSnapshotToEditor,
} from '@/lib/formTemplateApi';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { EmailChipsField } from '@/components/EmailChipsField';
import {
  DeleteTemplateDialog,
  DONT_ASK_DELETE_TEMPLATE_KEY,
} from './DeleteTemplateDialog';

function TemplateEditorDialog({
  open,
  onOpenChange,
  title,
  initialName,
  initialDescription,
  initialIsPublic,
  initialSharedWith,
  submitText,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialName: string;
  initialDescription: string;
  initialIsPublic: boolean;
  initialSharedWith: string[];
  submitText: string;
  onSubmit: (payload: {
    name: string;
    description: string;
    isPublic: boolean;
    sharedWith: string[];
  }) => Promise<void>;
}) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [sharedEmails, setSharedEmails] = useState<string[]>(initialSharedWith);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setName(initialName);
      setDescription(initialDescription);
      setIsPublic(initialIsPublic);
      setSharedEmails(initialSharedWith);
    }
    onOpenChange(nextOpen);
  };

  const handleSubmit = async () => {
    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      isPublic,
      sharedWith: sharedEmails,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid gap-1.5">
            <Label htmlFor="template-name">Template name</Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Customer Intake Form"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="template-description">Description</Label>
            <Input
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional short description"
            />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="template-public">Public</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Allow everyone to view and use this template.
              </p>
            </div>
            <Switch
              id="template-public"
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
                  setSharedEmails(entries.map((entry) => entry.email))
                }
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Add emails of users to share this template with.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>
            {submitText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TemplateCatalogPanel() {
  const { user } = useAuth();
  const templates = useTemplateStore((state) => state.templates);
  const loadTemplates = useTemplateStore((state) => state.loadTemplates);
  const addTemplate = useTemplateStore((state) => state.addTemplate);
  const updateTemplate = useTemplateStore((state) => state.updateTemplate);
  const removeTemplate = useTemplateStore((state) => state.removeTemplate);

  const form = useFormStore((state) => state.form);
  const pages = useFormStore((state) => state.pages);
  const components = useFormStore((state) => state.components);
  const loadForm = useFormStore((state) => state.loadForm);
  const clearSelectedComponents = useFormStore(
    (state) => state.clearSelectedComponents
  );

  const logicRules = useLogicStore((state) => state.rules);
  const logicFormulas = useLogicStore((state) => state.formulas);
  const logicShuffleStacks = useLogicStore(
    (state) => state.componentShuffleStacks
  );
  const loadRules = useLogicStore((state) => state.loadRules);
  const clearLogic = useLogicStore((state) => state.clearAll);

  const workflow = useWorkflowStore((state) => state.workflow);
  const loadWorkflow = useWorkflowStore((state) => state.loadWorkflow);
  const resetWorkflow = useWorkflowStore((state) => state.resetWorkflow);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortType, setSortType] = useState('newest');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [editTemplateId, setEditTemplateId] = useState<string | null>(null);
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(
    null
  );

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const filteredTemplates = useMemo(() => {
    let result = [...templates];
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      result = result.filter((template) =>
        template.name.toLowerCase().includes(search)
      );
    }
    if (filterType === 'personal') {
      result = result.filter((template) => template.createdBy === user?.uid);
    } else if (filterType === 'shared') {
      result = result.filter((template) => template.createdBy !== user?.uid);
    }
    if (sortType === 'newest') {
      result.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
    } else if (sortType === 'oldest') {
      result.sort(
        (a, b) =>
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime()
      );
    } else if (sortType === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      result.sort((a, b) => b.name.localeCompare(a.name));
    }
    return result;
  }, [filterType, searchTerm, sortType, templates, user?.uid]);

  const handleSaveCurrentAsTemplate = async (payload: {
    name: string;
    description: string;
    isPublic: boolean;
    sharedWith: string[];
  }) => {
    if (!form) return;
    const snapshot = buildSnapshotFromEditor({
      form,
      pages,
      components,
      logicRules,
      logicFormulas,
      logicShuffleStacks,
      workflow,
      createdBy: user?.uid,
    });
    await addTemplate(payload.name, snapshot, payload.description);
    const latest = useTemplateStore.getState().templates[0];
    if (latest) {
      await updateTemplate(latest.templateId, {
        isPublic: payload.isPublic,
        sharedWith: payload.sharedWith,
      });
    }
    toast.success('Template saved');
  };

  const handleApplyTemplate = async (templateId: string) => {
    const shouldReplace = window.confirm(
      'Apply this template and replace the current form in editor?'
    );
    if (!shouldReplace) return;
    const template = await getFormTemplate(templateId);
    const parsed = parseTemplateSnapshotToEditor(template);
    if (form) {
      parsed.form = {
        ...parsed.form,
        id: form.id,
        metadata: {
          ...parsed.form.metadata,
          authorId: form.metadata.authorId,
        },
      };
    }
    loadForm(parsed.form, parsed.pages, parsed.components);
    clearSelectedComponents();
    loadRules(
      parsed.logicRules,
      parsed.logicFormulas,
      parsed.logicShuffleStacks
    );
    if (parsed.workflow) {
      loadWorkflow(parsed.workflow);
    } else {
      resetWorkflow();
    }
    if (
      !parsed.logicRules.length &&
      !parsed.logicFormulas.length &&
      !parsed.logicShuffleStacks.length
    ) {
      clearLogic();
    }
    toast.success('Template applied. Save to persist changes.');
  };

  const editingTemplate = editTemplateId
    ? templates.find((template) => template.templateId === editTemplateId) ||
      null
    : null;
  const deletingTemplate = deletingTemplateId
    ? templates.find(
        (template) => template.templateId === deletingTemplateId
      ) || null
    : null;

  const handleDeleteRequest = (templateId: string) => {
    if (localStorage.getItem(DONT_ASK_DELETE_TEMPLATE_KEY) === 'true') {
      void removeTemplate(templateId);
      return;
    }
    setDeletingTemplateId(templateId);
  };

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4 space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">Templates</h2>
        <p className="text-xs text-muted-foreground">
          Save and reuse complete form blueprints.
        </p>
      </div>

      <Button
        className="mb-3"
        onClick={() => setSaveDialogOpen(true)}
        disabled={!form}
      >
        Save Current Form as Template
      </Button>

      <div className="mb-4 space-y-2">
        <div className="relative">
          <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            className="pl-8"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="shared">Shared</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortType} onValueChange={setSortType}>
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {filteredTemplates.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center text-muted-foreground">
            <Layers className="h-6 w-6 opacity-60" />
            <p className="text-sm font-medium">No templates yet</p>
            <p className="text-xs">
              Save your current form and reuse it anytime.
            </p>
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <div
              key={template.templateId}
              className="rounded-lg border bg-card p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{template.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {template.description || 'No description'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {template.isPublic && (
                    <Globe2 className="h-4 w-4 text-emerald-600" />
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Template actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem
                        onClick={() =>
                          window.open(
                            `/forms/templates/${template.templateId}/preview`,
                            '_blank'
                          )
                        }
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleApplyTemplate(template.templateId)}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Apply
                      </DropdownMenuItem>
                      {template.createdBy === user?.uid && (
                        <DropdownMenuItem
                          onClick={() => setEditTemplateId(template.templateId)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {template.createdBy === user?.uid && (
                        <DropdownMenuItem
                          onClick={() =>
                            handleDeleteRequest(template.templateId)
                          }
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground">
                Shared with {template.sharedWith.length} email
                {template.sharedWith.length === 1 ? '' : 's'}
              </div>
            </div>
          ))
        )}
      </div>

      <TemplateEditorDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        title="Save Form as Template"
        initialName={form?.name || ''}
        initialDescription={form?.metadata.description || ''}
        initialIsPublic={false}
        initialSharedWith={[]}
        submitText="Save Template"
        onSubmit={handleSaveCurrentAsTemplate}
      />

      {editingTemplate && (
        <TemplateEditorDialog
          open={!!editingTemplate}
          onOpenChange={(open) => !open && setEditTemplateId(null)}
          title="Edit Template Sharing"
          initialName={editingTemplate.name}
          initialDescription={editingTemplate.description || ''}
          initialIsPublic={editingTemplate.isPublic}
          initialSharedWith={editingTemplate.sharedWith || []}
          submitText="Update Template"
          onSubmit={async (payload) => {
            await updateTemplate(editingTemplate.templateId, payload);
            toast.success('Template updated');
          }}
        />
      )}

      {deletingTemplate && (
        <DeleteTemplateDialog
          open={!!deletingTemplate}
          onOpenChange={(open) => !open && setDeletingTemplateId(null)}
          onConfirm={() => {
            void removeTemplate(deletingTemplate.templateId);
          }}
          templateName={deletingTemplate.name}
        />
      )}
    </div>
  );
}
