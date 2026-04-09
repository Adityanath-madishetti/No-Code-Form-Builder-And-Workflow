// import { useState } from 'react';
// import { API_BASE } from '@/lib/api';
// import { Button } from '@/components/ui/button';
// import { Download, Loader2 } from 'lucide-react';
// import type { MySubmission } from '../dashboard.types';
// import { formatDate, formatResponseValue } from '../dashboard.utils';

// export default function SubmissionDetails({
//   submission,
// }: {
//   submission: MySubmission;
// }) {
//   const [exporting, setExporting] = useState(false);
//   const [error, setError] = useState('');

//   const handleExport = async () => {
//     setExporting(true);
//     setError('');
//     try {
//       const token = localStorage.getItem('auth_token');
//       const res = await fetch(
//         `${API_BASE}/api/forms/${submission.formId}/submissions/export.csv`,
//         {
//           headers: token ? { Authorization: `Bearer ${token}` } : {},
//         }
//       );
//       if (!res.ok) throw new Error('Export failed');
//       const blob = await res.blob();
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `form-${submission.formId}.csv`;
//       a.click();
//       window.URL.revokeObjectURL(url);
//     } catch (err) {
//       setError((err as Error).message);
//     } finally {
//       setExporting(false);
//     }
//   };

//   return (
//     <section className="mt-6 rounded-lg border bg-neutral-50 ml-2 p-4 dark:bg-neutral-900/70">
//       <div className="flex items-start justify-between gap-3">
//         <div>
//           <h3 className="text-sm font-semibold">Submission Details</h3>
//           <p className="mt-1 text-xs text-muted-foreground">
//             {submission.formTitle} • {formatDate(submission.submittedAt)}
//           </p>
//         </div>
//         <Button
//           size="sm"
//           variant="outline"
//           onClick={handleExport}
//           disabled={exporting}
//         >
//           {exporting ? (
//             <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
//           ) : (
//             <Download className="mr-1.5 h-3.5 w-3.5" />
//           )}
//           Export CSV
//         </Button>
//       </div>
//       {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
//       <div className="mt-4 space-y-3">
//         {(submission.pages || []).length === 0 ? (
//           <p className="text-xs text-muted-foreground">
//             No responses available.
//           </p>
//         ) : (
//           submission.pages!.map((page) => (
//             <div key={page.pageNo} className="rounded border p-3">
//               <p className="mb-2 text-xs font-medium text-muted-foreground">
//                 Page {page.pageNo}
//               </p>
//               <div className="space-y-2">
//                 {page.responses.map((item) => (
//                   <div key={`${page.pageNo}-${item.componentId}`}>
//                     <p className="text-xs font-medium text-muted-foreground">
//                       {item.componentId}
//                     </p>
//                     <pre className="mt-1 overflow-auto rounded bg-muted/30 p-2 text-xs whitespace-pre-wrap">
//                       {formatResponseValue(item.response)}
//                     </pre>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </section>
//   );
// }

import { useState } from 'react';
import { API_BASE } from '@/lib/api';

// shadcn components
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Icons
import { Download, Loader2, FileText } from 'lucide-react';

import type { MySubmission } from '../dashboard.types';
import { formatDate, formatResponseValue } from '../dashboard.utils';

export default function SubmissionDetails({
  submission,
}: {
  submission: MySubmission;
}) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  const handleExport = async () => {
    setExporting(true);
    setError('');
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(
        `${API_BASE}/api/forms/${submission.formId}/submissions/export.csv`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `form-${submission.formId}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card className="mt-6 border-primary/10 shadow-sm ml-3 py-4">
      <CardHeader className="flex flex-col items-start justify-between gap-4 pb-4  sm:flex-row sm:items-center">
        <div>
          <CardTitle className="text-lg font-semibold">
            Submission Details
          </CardTitle>
          <CardDescription className="mt-1.5 flex items-center gap-2">
            <span className="font-medium text-foreground">
              {submission.formTitle}
            </span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
            <span>{formatDate(submission.submittedAt)}</span>
          </CardDescription>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleExport}
          disabled={exporting}
          className="w-full sm:w-auto"
        >
          {exporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {exporting ? 'Exporting...' : 'Export CSV'}
        </Button>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-6 rounded-md bg-destructive/10 p-3 text-sm font-medium text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-8">
          {(submission.pages || []).length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25 bg-background/50 py-16 text-center">
              <div className="mb-4 rounded-full bg-muted p-3">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                No response data available.
              </p>
            </div>
          ) : (
            submission.pages!.map((page) => (
              <div key={page.pageNo} className="space-y-4">
                {/* Page Divider / Header */}
                <div className="flex items-center gap-3 border-b pb-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {page.pageNo}
                  </span>
                  <h4 className="text-sm font-semibold tracking-tight text-foreground">
                    Page {page.pageNo}
                  </h4>
                </div>

                {/* Responses Grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {page.responses.map((item) => (
                    <div
                      key={`${page.pageNo}-${item.componentId}`}
                      className="flex flex-col space-y-1.5"
                    >
                      <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                        {item.componentId}
                      </p>
                      <div className="flex-1 rounded-md border bg-muted/20 p-3">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-foreground">
                          {formatResponseValue(item.response) || (
                            <span className="italic text-muted-foreground/60">
                              No answer provided
                            </span>
                          )}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}