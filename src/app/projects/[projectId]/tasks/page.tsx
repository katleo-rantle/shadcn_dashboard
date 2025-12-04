// app/projects/[projectId]/tasks/page.tsx
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FileText, Receipt } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { jobs, tasks as rawTasks } from '@/lib/data';
import { useProject } from '@/context/ProjectContext';
import type { Job, Task, JobWithTasks } from '@/lib/types';

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  createColumnHelper,
  ColumnDef,
} from '@tanstack/react-table';

const initialTasks = rawTasks as unknown as Task[];

// ─────────────────────────────────────────────────────────────────────────────
// Dialogs
// ─────────────────────────────────────────────────────────────────────────────
const JobDialog = ({ initialJob, onSave, open, onOpenChange }: any) => {
  const [name, setName] = useState(initialJob.JobName || '');
  const [budget, setBudget] = useState(initialJob.JobBudget?.toString() || '');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{initialJob.JobID ? 'Edit' : 'New'} Job</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); onSave({ ...initialJob, JobName: name, JobBudget: parseFloat(budget) || 0, JobID: initialJob.JobID || Date.now() }); onOpenChange(false); }} className="space-y-4">
          <div><Label>Job Name</Label><Input value={name} onChange={e => setName(e.target.value)} required /></div>
          <div><Label>Budget (R)</Label><Input type="number" value={budget} onChange={e => setBudget(e.target.value)} /></div>
          <DialogFooter><Button type="submit">Save Job</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const TaskDialog = ({ initialTask, onSave, open, onOpenChange }: any) => {
  const [name, setName] = useState(initialTask.TaskName || '');
  const [budget, setBudget] = useState(initialTask.TaskBudget?.toString() || '');
  const [progress, setProgress] = useState(initialTask.TaskProgress?.toString() || '0');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{initialTask.TaskID ? 'Edit' : 'Add'} Task</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); onSave({ ...initialTask, TaskName: name, TaskBudget: parseFloat(budget) || 0, TaskProgress: parseFloat(progress) || 0, TaskID: initialTask.TaskID || Date.now() }); onOpenChange(false); }} className="space-y-4">
          <div><Label>Task Name</Label><Input value={name} onChange={e => setName(e.target.value)} required /></div>
          <div><Label>Budget (R)</Label><Input type="number" value={budget} onChange={e => setBudget(e.target.value)} /></div>
          <div><Label>Progress (%)</Label><Input type="number" min="0" max="100" value={progress} onChange={e => setProgress(e.target.value)} /></div>
          <DialogFooter><Button type="submit">Save Task</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Task Table
// ─────────────────────────────────────────────────────────────────────────────
const TaskSubTable = ({ tasks, onEdit, onDelete }: { tasks: Task[]; onEdit: (task: Task) => void; onDelete: (id: number) => void }) => {
  const columnHelper = createColumnHelper<Task>();

  const columns: ColumnDef<Task, any>[] = [
    columnHelper.accessor('TaskName', { header: 'Task' }),
    columnHelper.display({
      id: 'quoted',
      header: 'Quoted',
      cell: info => info.row.original.QuotationRef ? <Badge variant="secondary">{info.row.original.QuotationRef}</Badge> : '—',
    }),
    columnHelper.display({
      id: 'invoiced',
      header: 'Invoiced',
      cell: ({ row }) => {
        const refs = row.original.InvoiceRefs ?? [];
        return refs.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {refs.map(ref => <Badge key={ref} variant="outline">{ref}</Badge>)}
          </div>
        ) : '—';
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button size="icon" variant="ghost" onClick={() => onEdit(row.original)}>
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Delete Task?</AlertDialogTitle></AlertDialogHeader>
              <AlertDialogDescription>Delete {row.original.TaskName}?</AlertDialogDescription>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(row.original.TaskID)}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    }),
  ];

  const table = useReactTable({ data: tasks, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map(headerGroup => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <TableHead key={header.id}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map(row => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map(cell => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Page — NOW GROUPED BY JOB NAME
// ─────────────────────────────────────────────────────────────────────────────
export default function JobTaskBoard() {
  const router = useRouter();
  const { projectId } = useParams<{ projectId: string }>();
  const { jobsForSelectedProject = [] } = useProject() as any;

  const [projectJobs, setProjectJobs] = useState<Job[]>(jobsForSelectedProject);
  const [localTasks, setLocalTasks] = useState<Task[]>(initialTasks);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedTasksForQuote, setSelectedTasksForQuote] = useState<Set<number>>(new Set());
  const [selectedQuotationRef, setSelectedQuotationRef] = useState<string>('');
  const [selectedTasksForInvoice, setSelectedTasksForInvoice] = useState<Set<number>>(new Set());

  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [currentJob, setCurrentJob] = useState<Partial<Job> | null>(null);
  const [currentTask, setCurrentTask] = useState<Partial<Task> | null>(null);

  useEffect(() => {
    setProjectJobs(jobsForSelectedProject);
    if (jobsForSelectedProject.length > 0) setSelectedJobId(jobsForSelectedProject[0].JobID);
  }, [jobsForSelectedProject]);

const jobsWithTasks: JobWithTasks[] = useMemo(() => {
  return projectJobs.map(job => {
    const tasks = localTasks.filter(t => t.JobID === job.JobID);
    const progress = tasks.length > 0 
      ? Math.round(tasks.reduce((s, t) => s + (t.TaskProgress || 0), 0) / tasks.length) 
      : 0;

    // This line was missing → ActualCost is REQUIRED in JobWithTasks
    const actualCost = tasks
      .filter(t => t.TaskProgress === 100)
      .reduce((sum, t) => sum + (t.TaskBudget || 0), 0);

    return {
      ...job,
      Tasks: tasks,
      JobProgress: progress,
      ActualCost: actualCost, // ← THIS WAS MISSING
    };
  });
}, [projectJobs, localTasks]);
  const selectedJob = jobsWithTasks.find(j => j.JobID === selectedJobId);
  const quotationRefs = Array.from(new Set(localTasks.map(t => t.QuotationRef).filter(Boolean))) as string[];

  // ── INVOICE: Group by JOB NAME (the correct way)
  const invoicableTasks = localTasks.filter(t => t.QuotationRef === selectedQuotationRef);
  const eligibleTasks = useMemo(() => 
    invoicableTasks.filter(t => !(t.InvoiceRefs ?? []).length), 
    [invoicableTasks]
  );

  const groupedEligibleTasks = useMemo(() => {
    const groups: Record<string, Task[]> = {};

    eligibleTasks.forEach(task => {
      const job = projectJobs.find(j => j.JobID === task.JobID);
      const groupName = job?.JobName || 'Unknown Job';

      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(task);
    });

    // Sort alphabetically
    return Object.fromEntries(
      Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
    );
  }, [eligibleTasks, projectJobs]);

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const existing = localTasks.flatMap(t => t.InvoiceRefs || []).filter(r => r.startsWith(`INV-${year}`));
    return `INV-${year}-${String(existing.length + 1).padStart(4, '0')}`;
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Dialogs */}
      {currentJob && <JobDialog initialJob={currentJob} open={jobDialogOpen} onOpenChange={setJobDialogOpen} onSave={(j: Job) => setProjectJobs(p => p.some(x => x.JobID === j.JobID) ? p.map(x => x.JobID === j.JobID ? j : x) : [...p, j])} />}
      {currentTask && <TaskDialog initialTask={currentTask} open={taskDialogOpen} onOpenChange={setTaskDialogOpen} onSave={(t: Task) => setLocalTasks(p => p.some(x => x.TaskID === t.TaskID) ? p.map(x => x.TaskID === t.TaskID ? t : x) : [...p, t])} />}

      {/* Quotation Modal */}
      <Dialog open={showQuotationModal} onOpenChange={setShowQuotationModal}>
        <DialogContent className="max-w-5xl max-h-screen overflow-y-auto">
          <DialogHeader><DialogTitle>Create Quotation</DialogTitle></DialogHeader>
          <div className="space-y-6">
            {jobsWithTasks.map(job => {
              const jobTasks = job.Tasks;
              const allSelected = jobTasks.every(t => selectedTasksForQuote.has(t.TaskID));
              const someSelected = jobTasks.some(t => selectedTasksForQuote.has(t.TaskID));

              return (
                <div key={job.JobID} className="border rounded-xl p-5 bg-card">
                  <div className="flex items-center gap-3 mb-4">
                    <Checkbox checked={allSelected} indeterminate={someSelected && !allSelected} onCheckedChange={() => {
                      const next = new Set(selectedTasksForQuote);
                      jobTasks.forEach(t => allSelected ? next.delete(t.TaskID) : next.add(t.TaskID));
                      setSelectedTasksForQuote(next);
                    }} />
                    <h4 className="font-bold text-lg">{job.JobName}</h4>
                  </div>
                  <div className="ml-8 space-y-2">
                    {jobTasks.map(task => (
                      <div key={task.TaskID} className="flex items-center gap-3">
                        <Checkbox checked={selectedTasksForQuote.has(task.TaskID)} onCheckedChange={() => {
                          const next = new Set(selectedTasksForQuote);
                          next.has(task.TaskID) ? next.delete(task.TaskID) : next.add(task.TaskID);
                          setSelectedTasksForQuote(next);
                        }} />
                        <div className="flex-1">
                          <span>{task.TaskName}</span>
                        </div>
                        <span className="text-sm font-medium">R {(task.TaskBudget || 0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button onClick={() => {
              const ids = Array.from(selectedTasksForQuote).join(',');
              router.push(`/projects/${projectId}/quote?taskIds=${ids}`);
              setShowQuotationModal(false);
            }} disabled={selectedTasksForQuote.size === 0}>
              <FileText className="h-4 w-4 mr-2" /> Proceed to Quote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Modal — NOW GROUPED BY JOB */}
      <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
        <DialogContent className="max-w-5xl max-h-screen overflow-y-auto">
          <DialogHeader><DialogTitle>Create Invoice</DialogTitle></DialogHeader>

          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-5 text-center">
              <p className="text-2xl font-bold text-amber-900">{generateInvoiceNumber()}</p>
              <p className="text-sm text-amber-700">Auto-generated on creation</p>
            </div>

            <div>
              <Label>Select Quotation</Label>
              <select className="w-full mt-2 border rounded-lg px-4 py-2.5" value={selectedQuotationRef} onChange={e => setSelectedQuotationRef(e.target.value)}>
                <option value="">Choose quotation...</option>
                {quotationRefs.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {selectedQuotationRef && eligibleTasks.length > 0 && (
              <>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <Checkbox
                    checked={selectedTasksForInvoice.size === eligibleTasks.length}
                    indeterminate={selectedTasksForInvoice.size > 0 && selectedTasksForInvoice.size < eligibleTasks.length}
                    onCheckedChange={(c) => {
                      const next = new Set<number>();
                      if (c) eligibleTasks.forEach(t => next.add(t.TaskID));
                      setSelectedTasksForInvoice(next);
                    }}
                  />
                  <span className="font-semibold">
                    Select all ({eligibleTasks.length} available)
                  </span>
                </div>

                {Object.entries(groupedEligibleTasks).map(([jobName, tasks]) => {
                  const allInJob = tasks.every(t => selectedTasksForInvoice.has(t.TaskID));
                  const someInJob = tasks.some(t => selectedTasksForInvoice.has(t.TaskID));

                  return (
                    <div key={jobName} className="border rounded-xl p-5 bg-card shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                        <Checkbox
                          checked={allInJob}
                          indeterminate={someInJob && !allInJob}
                          onCheckedChange={() => {
                            const next = new Set(selectedTasksForInvoice);
                            tasks.forEach(t => allInJob ? next.delete(t.TaskID) : next.add(t.TaskID));
                            setSelectedTasksForInvoice(next);
                          }}
                        />
                        <h4 className="text-lg font-bold">{jobName}</h4>
                        <Badge>{tasks.length} items</Badge>
                      </div>

                      <div className="ml-8 space-y-3">
                        {tasks.map(task => (
                          <div key={task.TaskID} className="flex items-center gap-4 py-2">
                            <Checkbox
                              checked={selectedTasksForInvoice.has(task.TaskID)}
                              onCheckedChange={(c) => {
                                const next = new Set(selectedTasksForInvoice);
                                if (c) next.add(task.TaskID);
                                else next.delete(task.TaskID);
                                setSelectedTasksForInvoice(next);
                              }}
                            />
                            <div className="flex-1">
                              <p className="font-medium">{task.TaskName}</p>
                            </div>
                            <span className="font-semibold">R {(task.TaskBudget || 0).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {selectedQuotationRef && eligibleTasks.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                All tasks from this quotation have already been invoiced.
              </div>
            )}
          </div>

          <DialogFooter className="mt-8">
            <Button
              size="lg"
              className="bg-amber-600 hover:bg-amber-700 text-white"
              disabled={selectedTasksForInvoice.size === 0}
              onClick={() => {
                const inv = generateInvoiceNumber();
                const taskIds = Array.from(selectedTasksForInvoice).join(',');

                setLocalTasks(prev => prev.map(task =>
                  selectedTasksForInvoice.has(task.TaskID)
                    ? { ...task, InvoiceRefs: [...(task.InvoiceRefs || []), inv] }
                    : task
                ));

                router.push(`/projects/${projectId}/invoice?invoiceRef=${inv}&quotationRef=${selectedQuotationRef}&tasks=${taskIds}`);
              }}
            >
              <Receipt className="h-5 w-5 mr-2" />
              Create Invoice ({selectedTasksForInvoice.size} items)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Layout */}
      <div className="w-80 border-r bg-muted/40 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Jobs</h2>
          <Button size="sm" onClick={() => { setCurrentJob({ ProjectID: Number(projectId) }); setJobDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> New Job
          </Button>
        </div>
        {jobsWithTasks.map(job => (
          <div key={job.JobID} onClick={() => setSelectedJobId(job.JobID)} className={`p-4 rounded-lg border-2 cursor-pointer mb-3 transition-all ${selectedJobId === job.JobID ? 'border-primary bg-primary/5' : 'border-transparent hover:border-accent'}`}>
            <div className="font-semibold">{job.JobName}</div>
            <div className="text-sm text-muted-foreground">{job.Tasks.length} tasks</div>
          </div>
        ))}
      </div>

      <div className="flex-1 p-8 overflow-auto">
        {selectedJob && (
          <>
            <div className="bg-card rounded-xl border p-6 shadow-lg mb-8">
              <div className="flex justify-between items-start mb-6">
                <h1 className="text-3xl font-bold">{selectedJob.JobName}</h1>
                <div className="flex gap-3">
                  <Button onClick={() => setShowQuotationModal(true)}><FileText className="h-4 w-4 mr-2" /> Create Quotation</Button>
                  <Button onClick={() => setShowInvoiceModal(true)} variant="outline" className="border-amber-600 text-amber-700 hover:bg-amber-50"><Receipt className="h-4 w-4 mr-2" /> Create Invoice</Button>
                </div>
              </div>
              <Progress value={selectedJob.JobProgress} className="h-3 mb-4" />
              <div className="flex justify-end">
                <Button size="sm" onClick={() => { setCurrentTask({ JobID: selectedJob.JobID }); setTaskDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" /> Add Task
                </Button>
              </div>
            </div>
            <TaskSubTable tasks={selectedJob.Tasks} onEdit={(task) => { setCurrentTask(task); setTaskDialogOpen(true); }} onDelete={id => setLocalTasks(p => p.filter(t => t.TaskID !== id))} />
          </>
        )}
      </div>
    </div>
  );
}