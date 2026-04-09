// // src/pages/Dashboard/components/SharedFormsTab
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { api } from '@/lib/api';
// import { Button } from '@/components/ui/button';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import {
//   Search,
//   Funnel,
//   LayoutGrid,
//   List,
//   FileText,
//   Inbox,
//   ExternalLink,
//   Pencil,
// } from 'lucide-react';
// import type { SharedFormHeader, LayoutMode } from '../dashboard.types';
// import {
//   formatDate,
//   getCreatorLabel,
//   matchesDateFilter,
// } from '../dashboard.utils';

// const LIST_COLUMNS =
//   'grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,0.8fr)]';

// interface Props {
//   sharedForms: SharedFormHeader[];
//   onReload: () => Promise<void>;
// }

// export default function SharedFormsTab({ sharedForms, onReload }: Props) {
//   const navigate = useNavigate();
//   const [layout, setLayout] = useState<LayoutMode>('grid');
//   const [query, setQuery] = useState('');
//   const [roleFilter, setRoleFilter] = useState<'all' | 'editor' | 'reviewer'>(
//     'all'
//   );
//   const [editedFilter, setEditedFilter] = useState<
//     'all' | 'last7' | 'last30' | 'older'
//   >('all');
//   const [activeId, setActiveId] = useState<string | null>(null);

//   const getSharedRoleLabel = (form: SharedFormHeader) => {
//     const roles = form.sharedRoles?.length
//       ? form.sharedRoles
//       : [form.sharedRole];
//     if (roles.includes('editor') && roles.includes('reviewer'))
//       return 'Editor + Reviewer';
//     if (roles.includes('editor')) return 'Editor';
//     return 'Reviewer';
//   };

//   const canEdit = (form: SharedFormHeader) => {
//     const roles = form.sharedRoles?.length
//       ? form.sharedRoles
//       : [form.sharedRole];
//     return roles.includes('editor');
//   };

//   const handleRename = async (formId: string, currentTitle: string) => {
//     const nextTitle = window.prompt('Rename form', currentTitle);
//     if (!nextTitle) return;
//     try {
//       await api.patch(`/api/forms/${formId}`, { title: nextTitle });
//       await onReload();
//     } catch (err) {
//       window.alert((err as Error).message || 'Failed to rename form');
//     }
//   };

//   const normalizedQuery = query.trim().toLowerCase();
//   const filtered = sharedForms.filter((form) => {
//     const matchesSearch =
//       !normalizedQuery ||
//       form.title.toLowerCase().includes(normalizedQuery) ||
//       getCreatorLabel(form).toLowerCase().includes(normalizedQuery);

//     const roles = form.sharedRoles?.length
//       ? form.sharedRoles
//       : [form.sharedRole];
//     const matchesRole = roleFilter === 'all' || roles.includes(roleFilter);
//     const matchesEdited = matchesDateFilter(form.updatedAt, editedFilter);

//     return matchesSearch && matchesRole && matchesEdited;
//   });

//   return (
//     <>
//       <div className="mb-5 flex min-h-[1.75rem] items-center gap-1.5">
//         <div className="relative max-w-xl min-w-0 flex-1">
//           <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3 w-3 -translate-y-1/2 text-muted-foreground/70" />
//           <input
//             type="search"
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             placeholder="Search shared forms..."
//             className="h-7 w-full rounded-full border border-border/70 bg-muted/20 py-0 pr-3 pl-8 text-xs outline-none focus:border-primary/60 focus:bg-background"
//           />
//         </div>

//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button
//               variant="outline"
//               size="sm"
//               className="h-7 w-7 rounded-full p-0"
//             >
//               <Funnel className="h-3 w-3" />
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align="start" className="w-64 p-3">
//             <div className="space-y-3">
//               <select
//                 value={roleFilter}
//                 onChange={(e) =>
//                   setRoleFilter(
//                     e.target.value as React.SetStateAction<
//                       'all' | 'editor' | 'reviewer'
//                     >
//                   )
//                 }
//                 className="h-9 w-full border bg-background px-2 text-sm"
//               >
//                 <option value="all">All roles</option>
//                 <option value="editor">Editor</option>
//                 <option value="reviewer">Reviewer</option>
//               </select>
//               <select
//                 value={editedFilter}
//                 onChange={(e) =>
//                   setEditedFilter(
//                     e.target.value as React.SetStateAction<
//                       'all' | 'last7' | 'last30' | 'older'
//                     >
//                   )
//                 }
//                 className="h-9 w-full border bg-background px-2 text-sm"
//               >
//                 <option value="all">All edited dates</option>
//                 <option value="last7">Last 7 days</option>
//                 <option value="last30">Last 30 days</option>
//                 <option value="older">Older than 30 days</option>
//               </select>
//             </div>
//           </DropdownMenuContent>
//         </DropdownMenu>

//         <div className="ml-auto inline-flex h-7 items-center border bg-muted/20 p-0.5">
//           <Button
//             size="sm"
//             variant={layout === 'grid' ? 'secondary' : 'ghost'}
//             onClick={() => setLayout('grid')}
//             className="h-6 px-1.5"
//           >
//             <LayoutGrid className="h-3 w-3" />
//           </Button>
//           <Button
//             size="sm"
//             variant={layout === 'list' ? 'secondary' : 'ghost'}
//             onClick={() => setLayout('list')}
//             className="h-6 px-1.5"
//           >
//             <List className="h-3 w-3" />
//           </Button>
//         </div>
//       </div>

//       {filtered.length === 0 ? (
//         <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12 text-center">
//           <FileText className="mb-3 h-8 w-8 text-muted-foreground/40" />
//           <p className="text-sm text-muted-foreground">
//             {sharedForms.length === 0
//               ? 'No forms shared with you yet.'
//               : 'No shared forms match your search.'}
//           </p>
//         </div>
//       ) : (
//         <div
//           className={
//             layout === 'grid'
//               ? 'grid gap-10 sm:grid-cols-2 lg:grid-cols-3'
//               : 'flex flex-col'
//           }
//         >
//           {layout === 'list' && (
//             <div
//               className={`mb-2 grid ${LIST_COLUMNS} px-3 text-[11px] font-medium text-muted-foreground uppercase`}
//             >
//               <span>Form</span>
//               <span>Creator</span>
//               <span>Last Edited</span>
//               <span>Role</span>
//             </div>
//           )}
//           {filtered.map((form) => (
//             <div
//               key={form.formId}
//               className={`border bg-neutral-50 dark:bg-neutral-900/70 ${layout === 'grid' ? 'aspect-[1.6/1] p-2.5' : `grid ${LIST_COLUMNS} items-center p-3`}`}
//             >
//               <div
//                 role="button"
//                 tabIndex={0}
//                 onClick={() =>
//                   setActiveId((prev) =>
//                     prev === form.formId ? null : form.formId
//                   )
//                 }
//                 onKeyDown={(e) => {
//                   if (e.key === 'Enter' || e.key === ' ') {
//                     e.preventDefault();
//                     setActiveId((prev) =>
//                       prev === form.formId ? null : form.formId
//                     );
//                   }
//                 }}
//                 className={`cursor-pointer ${layout === 'grid' ? '' : 'truncate text-sm font-medium'}`}
//               >
//                 {layout === 'grid' ? (
//                   <>
//                     <div className="flex w-full items-start justify-between">
//                       <h3 className="text-sm font-medium">{form.title}</h3>
//                       <span className="ml-2 shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
//                         {getSharedRoleLabel(form)}
//                       </span>
//                     </div>
//                     <p className="mt-2 text-xs text-muted-foreground">
//                       {getCreatorLabel(form)}
//                     </p>
//                     <p className="mt-1 text-xs text-muted-foreground">
//                       {formatDate(form.updatedAt)}
//                     </p>
//                     <p className="mt-1 text-xs text-muted-foreground">
//                       {form.submissionCount} submission
//                       {form.submissionCount === 1 ? '' : 's'}
//                     </p>
//                     <p className="mt-2 text-[11px] text-muted-foreground">
//                       Click to view actions
//                     </p>
//                   </>
//                 ) : (
//                   form.title
//                 )}
//               </div>

//               {layout === 'list' && (
//                 <>
//                   <p className="truncate text-xs text-muted-foreground">
//                     {getCreatorLabel(form)}
//                   </p>
//                   <p className="text-xs text-muted-foreground">
//                     {formatDate(form.updatedAt)}
//                   </p>
//                   <span className="text-[10px] text-muted-foreground">
//                     {getSharedRoleLabel(form)}
//                   </span>
//                 </>
//               )}

//               {activeId === form.formId && (
//                 <div
//                   className={`space-y-2 border-t pt-3 ${layout === 'grid' ? 'mt-3' : 'col-span-full mt-1'}`}
//                 >
//                   {canEdit(form) && (
//                     <Button
//                       className="w-full"
//                       size="sm"
//                       variant="outline"
//                       onClick={() => navigate(`/form-builder/${form.formId}`)}
//                     >
//                       Edit Form
//                     </Button>
//                   )}
//                   <div className="flex items-center gap-1">
//                     <Button
//                       size="sm"
//                       variant="ghost"
//                       className="h-7 w-7 p-0"
//                       onClick={() => navigate(`/reviews/${form.formId}`)}
//                     >
//                       <Inbox className="h-3.5 w-3.5" />
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="ghost"
//                       className="h-7 w-7 p-0"
//                       onClick={() => navigate(`/forms/${form.formId}/preview`)}
//                     >
//                       <ExternalLink className="h-3.5 w-3.5" />
//                     </Button>
//                     {canEdit(form) && (
//                       <Button
//                         size="sm"
//                         variant="ghost"
//                         className="h-7 w-7 p-0"
//                         onClick={() => handleRename(form.formId, form.title)}
//                       >
//                         <Pencil className="h-3.5 w-3.5" />
//                       </Button>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </>
//   );
// }


import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

// shadcn components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Icons
import {
  Search,
  LayoutGrid,
  List as ListIcon,
  FileText,
  Inbox,
  ExternalLink,
  Pencil,
} from 'lucide-react';

import type { SharedFormHeader, LayoutMode } from '../dashboard.types';
import {
  formatDate,
  getCreatorLabel,
  matchesDateFilter,
} from '../dashboard.utils';

// Adjusted to fit the extra actions
const LIST_COLUMNS =
  'grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1.5fr)_minmax(0,1fr)_auto]';

interface Props {
  sharedForms: SharedFormHeader[];
  onReload: () => Promise<void>;
}

export default function SharedFormsTab({ sharedForms, onReload }: Props) {
  const navigate = useNavigate();
  const [layout, setLayout] = useState<LayoutMode>('grid');
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'editor' | 'reviewer'>(
    'all'
  );
  const [editedFilter, setEditedFilter] = useState<
    'all' | 'last7' | 'last30' | 'older'
  >('all');

  const getSharedRoleLabel = (form: SharedFormHeader) => {
    const roles = form.sharedRoles?.length
      ? form.sharedRoles
      : [form.sharedRole];
    if (roles.includes('editor') && roles.includes('reviewer'))
      return 'Editor + Reviewer';
    if (roles.includes('editor')) return 'Editor';
    return 'Reviewer';
  };

  const canEdit = (form: SharedFormHeader) => {
    const roles = form.sharedRoles?.length
      ? form.sharedRoles
      : [form.sharedRole];
    return roles.includes('editor');
  };

  const handleRename = async (formId: string, currentTitle: string) => {
    const nextTitle = window.prompt('Rename form', currentTitle);
    if (!nextTitle) return;
    try {
      await api.patch(`/api/forms/${formId}`, { title: nextTitle });
      await onReload();
    } catch (err) {
      window.alert((err as Error).message || 'Failed to rename form');
    }
  };

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = sharedForms.filter((form) => {
    const matchesSearch =
      !normalizedQuery ||
      form.title.toLowerCase().includes(normalizedQuery) ||
      getCreatorLabel(form).toLowerCase().includes(normalizedQuery);

    const roles = form.sharedRoles?.length
      ? form.sharedRoles
      : [form.sharedRole];
    const matchesRole = roleFilter === 'all' || roles.includes(roleFilter);
    const matchesEdited = matchesDateFilter(form.updatedAt, editedFilter);

    return matchesSearch && matchesRole && matchesEdited;
  });

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search shared forms..."
            className="bg-background pl-9"
          />
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <Select
            value={roleFilter}
            onValueChange={(val) =>
              setRoleFilter(val as 'all' | 'editor' | 'reviewer')
            }
          >
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="reviewer">Reviewer</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={editedFilter}
            onValueChange={(val) =>
              setEditedFilter(val as 'all' | 'last7' | 'last30' | 'older')
            }
          >
            <SelectTrigger className="w-[160px] bg-background">
              <SelectValue placeholder="Edited Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="last7">Last 7 days</SelectItem>
              <SelectItem value="last30">Last 30 days</SelectItem>
              <SelectItem value="older">Older than 30 days</SelectItem>
            </SelectContent>
          </Select>

          <div className="ml-auto flex items-center rounded-md border bg-background p-0.5 sm:ml-2">
            <Button
              variant={layout === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setLayout('grid')}
              className="h-[26px] w-[26px]"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={layout === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setLayout('list')}
              className="h-[26px] w-[26px]"
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 bg-background/50 py-24 text-center">
          <div className="mb-4 rounded-full bg-muted p-3">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground">
            No shared forms found
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {sharedForms.length === 0
              ? 'No one has shared forms with you yet.'
              : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : (
        <>
          {layout === 'grid' ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((form) => (
                <Card
                  key={form.formId}
                  className="group flex flex-col transition-colors hover:border-primary/50"
                >
                  <CardHeader className="p-5 pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="truncate text-base font-semibold">
                          <button
                            onClick={() =>
                              navigate(
                                canEdit(form)
                                  ? `/form-builder/${form.formId}`
                                  : `/reviews/${form.formId}`
                              )
                            }
                            className="hover:underline focus:outline-none"
                          >
                            {form.title}
                          </button>
                        </CardTitle>
                        <CardDescription className="mt-1.5 truncate text-xs">
                          {getCreatorLabel(form)}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={canEdit(form) ? 'default' : 'secondary'}
                        className="pointer-events-none whitespace-nowrap"
                      >
                        {getSharedRoleLabel(form)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="mt-auto p-5 pt-0 text-xs text-muted-foreground">
                    <p>Edited {formatDate(form.updatedAt)}</p>
                    <p className="mt-1">
                      {form.submissionCount} submission
                      {form.submissionCount === 1 ? '' : 's'}
                    </p>
                  </CardContent>
                  <CardFooter className="flex items-center justify-end gap-1 border-t bg-muted/20 p-3">
                    {canEdit(form) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mr-auto h-8 px-2.5 text-xs"
                        onClick={() => navigate(`/form-builder/${form.formId}`)}
                      >
                        Edit Form
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => navigate(`/reviews/${form.formId}`)}
                    >
                      <Inbox className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => navigate(`/forms/${form.formId}/preview`)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    {canEdit(form) && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleRename(form.formId, form.title)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="overflow-hidden">
              <div
                className={`grid ${LIST_COLUMNS} border-b bg-muted/50 px-4 py-3 text-xs font-medium tracking-wider text-muted-foreground uppercase`}
              >
                <span>Form Name</span>
                <span>Creator</span>
                <span>Last Edited</span>
                <span>Role</span>
                <span className="text-right">Actions</span>
              </div>
              <div className="divide-y">
                {filtered.map((form) => (
                  <div
                    key={form.formId}
                    className={`grid ${LIST_COLUMNS} items-center px-4 py-3 transition-colors hover:bg-muted/30 gap-4`}
                  >
                    <button
                      onClick={() =>
                        navigate(
                          canEdit(form)
                            ? `/form-builder/${form.formId}`
                            : `/reviews/${form.formId}`
                        )
                      }
                      className="truncate text-left text-sm font-medium hover:underline"
                    >
                      {form.title}
                    </button>
                    <span className="truncate text-sm text-muted-foreground">
                      {getCreatorLabel(form)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(form.updatedAt)}
                    </span>
                    <div>
                      <Badge
                        variant={canEdit(form) ? 'default' : 'secondary'}
                        className="pointer-events-none"
                      >
                        {getSharedRoleLabel(form)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-end gap-1">
                      {canEdit(form) && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mr-2 h-8 px-2.5 text-xs hidden sm:flex"
                          onClick={() =>
                            navigate(`/form-builder/${form.formId}`)
                          }
                        >
                          Edit Form
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => navigate(`/reviews/${form.formId}`)}
                      >
                        <Inbox className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() =>
                          navigate(`/forms/${form.formId}/preview`)
                        }
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      {canEdit(form) && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleRename(form.formId, form.title)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}