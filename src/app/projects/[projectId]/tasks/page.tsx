// src/components/JobTaskBoard.tsx (Corrected Version)
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FileText } from 'lucide-react'; 
import { format } from 'date-fns';
import { useRouter } from 'next/navigation'; 

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox'; 

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// NOTE: Assuming '@/lib/data' and '@/context/ProjectContext' exist in your environment
import { jobs, tasks as rawTasks, projects, clients } from '@/lib/data'; 
import { useProject } from '@/context/ProjectContext';
import type { Job } from '@/lib/types'; 
// NOTE: Removed 'import QuotationPDF from '@/components/QuotationPDF';'

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  createColumnHelper,
  CellContext,
  ColumnDef,
} from '@tanstack/react-table';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export type Task = {
  TaskID: number;
  JobID: number;
  TaskName: string;
  TaskBudget?: number;
  TaskProgress?: number;
  Status: 'Completed' | 'In Progress' | 'Active' | 'Not Started';
  PlannedStartDate: string;
  PlannedEndDate: string;
  ActualStartDate: string | null;
  ActualEndDate: string | null;
  DueDate?: string; 
  QuotationRef?: string; // Added for quotation linking
};

export type JobWithTasks = Job & { 
    Tasks: Task[];
    JobProgress: number;
    ActualCost: number;
};

const initialTasks = rawTasks as unknown as Task[];

// ─────────────────────────────────────────────────────────────────────────────
// Job Action Components (Dialogs) - (Omitted for brevity)
// ─────────────────────────────────────────────────────────────────────────────

interface JobDialogProps {
  initialJob: Partial<Job>;
  onSave: (job: Job) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const JobDialog: React.FC<JobDialogProps> = ({
  initialJob,
  onSave,
  open,
  onOpenChange,
}) => {
  const [jobName, setJobName] = useState(initialJob.JobName || '');
  const [budget, setBudget] = useState(initialJob.JobBudget?.toString() || '');
  const isEdit = !!initialJob.JobID;
  
  React.useEffect(() => {
    setJobName(initialJob.JobName || '');
    setBudget(initialJob.JobBudget?.toString() || '');
  }, [initialJob]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newJob: Job = {
      ProjectID: initialJob.ProjectID || 1, 
      JobID: initialJob.JobID || Date.now(), 
      JobName: jobName,
      JobBudget: parseFloat(budget) || 0,
      Status: initialJob.Status || 'Not Started',
      PlannedStartDate: initialJob.PlannedStartDate || new Date().toISOString().split('T')[0],
      PlannedEndDate: initialJob.PlannedEndDate || new Date().toISOString().split('T')[0],
    } as Job;
    onSave(newJob);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Job' : 'Add New Job'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Update details for job ID: ${initialJob.JobID}`
              : 'Create a new job for the current project.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='jobName' className='text-right'>
                Name
              </Label>
              <Input
                id='jobName'
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
                className='col-span-3'
                required
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='budget' className='text-right'>
                Budget (R)
              </Label>
              <Input
                id='budget'
                type='number'
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className='col-span-3'
              />
            </div>
          </div>
          <DialogFooter>
            <Button type='submit'>
              {isEdit ? 'Save Changes' : 'Create Job'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// Task Action Components (Dialogs) - (Omitted for brevity)
// ─────────────────────────────────────────────────────────────────────────────

interface TaskDialogProps {
  initialTask: Partial<Task> & { JobID: number };
  onSave: (task: Task) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TaskDialog: React.FC<TaskDialogProps> = ({
  initialTask,
  onSave,
  open,
  onOpenChange,
}) => {
  const [taskName, setTaskName] = useState(initialTask.TaskName || '');
  const [budget, setBudget] = useState(
    initialTask.TaskBudget?.toString() || ''
  );
  const [progress, setProgress] = useState(
    initialTask.TaskProgress?.toString() || '0'
  );
  const isEdit = !!initialTask.TaskID;

  React.useEffect(() => {
    setTaskName(initialTask.TaskName || '');
    setBudget(initialTask.TaskBudget?.toString() || '');
    setProgress(initialTask.TaskProgress?.toString() || '0');
  }, [initialTask]); 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: Task = {
      ...initialTask,
      TaskID: initialTask.TaskID || Date.now(), 
      TaskName: taskName,
      TaskBudget: parseFloat(budget) || 0,
      TaskProgress: parseFloat(progress) || 0,
      Status: initialTask.Status || 'Not Started',
      PlannedStartDate: initialTask.PlannedStartDate || new Date().toISOString().split('T')[0],
      PlannedEndDate: initialTask.PlannedEndDate || new Date().toISOString().split('T')[0],
      ActualStartDate: initialTask.ActualStartDate || null,
      ActualEndDate: initialTask.ActualEndDate || null,
      QuotationRef: initialTask.QuotationRef || undefined, 
    } as Task;
    onSave(newTask);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Task' : 'Add New Task'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Update details for task: ${initialTask.TaskName}`
              : `Create a new task for Job ID: ${initialTask.JobID}`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='grid gap-4 py-4'>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='taskName' className='text-right'>
                Name
              </Label>
              <Input
                id='taskName'
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className='col-span-3'
                required
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='budget' className='text-right'>
                Budget (R)
              </Label>
              <Input
                id='budget'
                type='number'
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className='col-span-3'
              />
            </div>
            <div className='grid grid-cols-4 items-center gap-4'>
              <Label htmlFor='progress' className='text-right'>
                Progress (%)
              </Label>
              <Input
                id='progress'
                type='number'
                min='0'
                max='100'
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                className='col-span-3'
              />
            </div>
          </div>
          <DialogFooter>
            <Button type='submit'>
              {isEdit ? 'Save Changes' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// Sub-Component: Task Sub Table - (Omitted for brevity)
// ─────────────────────────────────────────────────────────────────────────────

interface TaskSubTableProps {
    tasks: Task[];
    taskListColumns: ColumnDef<Task, any>[]; 
    handleOpenDialog: (task: Partial<Task> & { JobID: number }) => void;
    handleDeleteTask: (taskID: number) => void;
}

const TaskSubTable: React.FC<TaskSubTableProps> = ({ 
    tasks, 
    taskListColumns, 
    handleOpenDialog, 
    handleDeleteTask 
}) => {
    // Modify column definitions to display QuotationRef
    const columnsWithQuotationRef = [...taskListColumns];
    const actionsIndex = columnsWithQuotationRef.findIndex(col => col.id === 'taskActions');

    const quotationRefColumn: ColumnDef<Task, any> = {
        id: 'quotationRef',
        header: 'Quoted',
        cell: (info: CellContext<Task, unknown>) => {
            const task = info.row.original;
            return task.QuotationRef ? (
                <Badge variant="secondary">{task.QuotationRef}</Badge>
            ) : (
                <span className="text-muted-foreground">—</span>
            );
        },
    };

    // Insert QuotationRef column before Actions
    if (actionsIndex !== -1) {
        columnsWithQuotationRef.splice(actionsIndex, 0, quotationRefColumn);
    } else {
        columnsWithQuotationRef.push(quotationRefColumn);
    }
    
    // Create the table instance
    const subTable = useReactTable({
        data: tasks,
        columns: columnsWithQuotationRef.map(col => {
             if (col.id === 'taskActions' && (col as ColumnDef<Task, any>).cell) {
                return {
                    ...col,
                    cell: ({ row }: CellContext<Task, unknown>) => (
                        <div className='flex gap-2 justify-end'>
                          <Button
                            variant='outline'
                            size='icon'
                            onClick={() => handleOpenDialog(row.original)}
                            title='Edit Task'
                          >
                            <Edit className='h-4 w-4' />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant='destructive' size='icon' title='Delete Task'>
                                <Trash2 className='h-4 w-4' />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the task: **{row.original.TaskName}**.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteTask(row.original.TaskID)}
                                  className='bg-destructive hover:bg-destructive/90 text-primary-foreground'
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                    ),
                } as ColumnDef<Task, any>;
            }
            return col;
        }),
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <Table>
            <TableHeader>
                {subTable.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                            <TableHead key={header.id} className={header.column.id === 'taskActions' ? 'text-right' : ''}>
                                {header.isPlaceholder
                                    ? null
                                    : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                        ))}
                    </TableRow>
                ))}
            </TableHeader>
            <TableBody>
                {subTable.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className='hover:bg-muted/50'>
                        {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className='py-2'>
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
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function JobTaskBoard() { 
  const { 
      jobsForSelectedProject: initialJobs = jobs.filter(j => j.ProjectID === 1) 
  }: { jobsForSelectedProject: Job[] } = useProject() as any; 

  // --- Router for Navigation ---
  const router = useRouter();
  // -----------------------------
  
  const [projectJobs, setProjectJobs] = useState<Job[]>(initialJobs);

  useEffect(() => { 
      setProjectJobs(initialJobs);
      
      if (initialJobs.length > 0) {
          setSelectedJobId(initialJobs[0].JobID);
      } else {
          setSelectedJobId(null);
      }
      // Reset quotation selection when project changes
      setShowQuotationModal(false);
      setSelectedJobsForQuote([]);
      setSelectedTasksForQuote(new Set());
      
  }, [initialJobs]); 

  const [selectedJobId, setSelectedJobId] = useState<number | null>(
    projectJobs.length > 0 ? projectJobs[0].JobID : null
  );
  const [localTasks, setLocalTasks] = useState<Task[]>(initialTasks);

  // --- Quotation State --- 
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [selectedJobsForQuote, setSelectedJobsForQuote] = useState<number[]>([]);
  const [selectedTasksForQuote, setSelectedTasksForQuote] = useState<Set<number>>(new Set());
  const quotationNumber = `QUO-${format(new Date(), 'yyyy')}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;


  // Dialog States
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<
    (Partial<Task> & { JobID: number }) | null
  >(null);
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [currentJob, setCurrentJob] = useState<Partial<Job> | null>(null);

  // --- JOB CRUD Handlers --- (Omitted for brevity)
  const handleOpenJobDialog = (job: Partial<Job>) => {
    setCurrentJob({ ...job, ProjectID: job.ProjectID || (initialJobs.length > 0 ? initialJobs[0].ProjectID : 1) });
    setIsJobDialogOpen(true);
  };
  
  const handleSaveJob = (job: Job) => {
    setProjectJobs(prev => 
        prev.some((j) => j.JobID === job.JobID)
        ? prev.map((j) => (j.JobID === job.JobID ? job : j))
        : [...prev, job]
    );
    if (!projectJobs.some((j) => j.JobID === job.JobID)) {
        setSelectedJobId(job.JobID);
    }
    setIsJobDialogOpen(false); 
  };
  
  const handleDeleteJob = (jobID: number) => {
    setProjectJobs(prev => prev.filter(j => j.JobID !== jobID));
    setLocalTasks(prev => prev.filter(t => t.JobID !== jobID));
    
    if (selectedJobId === jobID) {
      const nextJob = projectJobs.find(j => j.JobID !== jobID);
      setSelectedJobId(nextJob?.JobID || null);
    }
  };

  // --- TASK CRUD Handlers --- (Omitted for brevity)
  const handleOpenTaskDialog = (task: Partial<Task> & { JobID: number }) => {
    setCurrentTask(task);
    setIsTaskDialogOpen(true);
  };

  const handleSaveTask = (task: Task) => {
    setLocalTasks(prev => 
        prev.some((t) => t.TaskID === task.TaskID)
        ? prev.map((t) => (t.TaskID === task.TaskID ? task : t))
        : [...prev, task]
    );
    setIsTaskDialogOpen(false); 
  };

  const handleDeleteTask = (taskID: number) => {
    setLocalTasks(localTasks.filter((t) => t.TaskID !== taskID));
  };

  const jobsWithTasks: JobWithTasks[] = useMemo(() => {
    return projectJobs.map((job) => {
        const tasks = localTasks.filter((t) => t.JobID === job.JobID);
        
        const totalProgressWeight = tasks.reduce((sum, t) => sum + (t.TaskProgress ?? 0), 0);
        const jobProgress = tasks.length > 0 ? Math.round(totalProgressWeight / tasks.length) : 0;

        const actualCost = tasks.reduce((sum, t) => {
            if (t.TaskProgress === 100) { 
                return sum + (t.TaskBudget ?? 0);
            }
            return sum;
        }, 0);

        return {
          ...job,
          Tasks: tasks,
          JobProgress: jobProgress,
          ActualCost: actualCost,
        };
    });
  }, [projectJobs, localTasks]); 

  const selectedJob = jobsWithTasks.find(j => j.JobID === selectedJobId);
  
// ─────────────────────────────────────────────────────────────────────────────
// Quotation Handlers - FIXED selectAllInJob
// ─────────────────────────────────────────────────────────────────────────────

  const handleNavigateToQuotation = () => {
    if (selectedTasksForQuote.size === 0) {
        alert("Please select at least one task to create a quotation.");
        return;
    }

    const projectId = projectJobs[0]?.ProjectID || 1; // Get the current project ID
    const serializedTaskIds = Array.from(selectedTasksForQuote).join(',');

    // Navigate to the new page, passing the project ID and selected task IDs
    router.push(`/projects/${projectId}/quote?taskIds=${serializedTaskIds}`);

    // Optionally reset modal state
    setShowQuotationModal(false);
    setSelectedJobsForQuote([]);
    setSelectedTasksForQuote(new Set());
  };

  const toggleJob = (jobId: number) => {
    setSelectedJobsForQuote(prev => {
      if (prev.includes(jobId)) {
        const job = jobsWithTasks.find(j => j.JobID === jobId);
        if (job) {
            setSelectedTasksForQuote(prevTasks => {
                const next = new Set(prevTasks);
                job.Tasks.forEach(t => next.delete(t.TaskID));
                return next;
            });
        }
        return prev.filter(id => id !== jobId);
      } else {
        return [...prev, jobId];
      }
    });
  };

  const toggleTask = (taskId: number, jobId: number) => {
    setSelectedTasksForQuote(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
        if (!selectedJobsForQuote.includes(jobId)) {
            setSelectedJobsForQuote(prevJobs => [...prevJobs, jobId]);
        }
      }
      return next;
    });
  };

  const selectAllInJob = (jobId: number) => {
    const job = jobsWithTasks.find(j => j.JobID === jobId);
    if (!job) return;
    
    if (!selectedJobsForQuote.includes(jobId)) {
         setSelectedJobsForQuote(prevJobs => [...prevJobs, jobId]);
    }
    
    setSelectedTasksForQuote(prevTasks => {
        const next = new Set(prevTasks);
        const allSelected = job.Tasks.every(t => prevTasks.has(t.TaskID));
        
        // FIX APPLIED HERE: Changed job.Tasks.Tasks.forEach to job.Tasks.forEach
        job.Tasks.forEach(t => 
            allSelected ? next.delete(t.TaskID) : next.add(t.TaskID)
        );
        return next;
    });
  };


// ─────────────────────────────────────────────────────────────────────────────
// Column definitions (Task Table) - (Omitted for brevity)
// ─────────────────────────────────────────────────────────────────────────────
  
  const taskColumnHelper = createColumnHelper<Task>();

  const taskListColumns: ColumnDef<Task, any>[] = [
    taskColumnHelper.accessor((row) => row.TaskName, {
      id: 'taskName',
      header: 'Task Name',
    }),
    taskColumnHelper.accessor((row) => row.TaskProgress ?? 0, {
      id: 'progress',
      header: 'Progress',
      cell: (info) => {
        const progress = Math.min(Math.max(info.getValue()!, 0), 100);
        return (
          <div className='flex items-center gap-2 w-32'>
            <div className='flex-1 h-2 bg-secondary rounded-full overflow-hidden'>
              <div
                className='h-full bg-primary transition-all'
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className='text-xs font-medium'>{progress}%</span>
          </div>
        );
      },
    }),
    taskColumnHelper.accessor((row) => row.PlannedEndDate, {
      id: 'plannedEndDate',
      header: 'Planned End',
      cell: (info) => info.getValue() ?? '—',
    }),
    taskColumnHelper.accessor((row) => row.TaskBudget, {
      id: 'taskBudget',
      header: 'Budget',
      cell: (info) =>
        info.getValue() != null
          ? `R ${info.getValue()!.toLocaleString()}`
          : '—',
    }),
    taskColumnHelper.display({
      id: 'taskActions',
      header: 'Actions',
      cell: () => null, 
    }),
  ];
  
  const renderJobStatus = (status: Job['Status']) => {
    let colorClass = 'bg-secondary text-secondary-foreground';
    switch (status) {
      case 'Completed':
        colorClass = 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200';
        break;
      case 'In Progress':
        colorClass = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200';
        break;
      case 'Active':
        colorClass = 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200';
        break;
    }
    return <Badge className={colorClass}>{status}</Badge>;
  };

  const formatCurrency = (amount: number) => `R ${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`;


  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className='flex h-screen bg-background'>
      {/* Job Dialog Component (Omitted for brevity) */}
      {currentJob && (
        <JobDialog
          initialJob={currentJob}
          onSave={handleSaveJob}
          open={isJobDialogOpen}
          onOpenChange={setIsJobDialogOpen}
        />
      )}
      
      {/* Task Dialog Component (Omitted for brevity) */}
      {currentTask && (
        <TaskDialog
          initialTask={currentTask}
          onSave={handleSaveTask}
          open={isTaskDialogOpen}
          onOpenChange={setIsTaskDialogOpen}
        />
      )}
      
      {/* Quotation Selection Modal - ACTION IS NOW NAVIGATION */} 
      <Dialog open={showQuotationModal} onOpenChange={setShowQuotationModal}>
        <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Quotation</DialogTitle>
            <DialogDescription>
                Select the jobs and tasks to include in the quotation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="bg-primary/5 rounded-lg p-4">
              <p className="font-semibold text-lg">Quotation #: <span className="text-primary">{quotationNumber}</span></p>
              <p className="text-sm text-muted-foreground">Date: {format(new Date(), 'dd MMMM yyyy')}</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Select Jobs & Tasks</h3>
              <div className="space-y-4">
                {jobsWithTasks.map(job => (
                  <div key={job.JobID} className="border rounded-lg p-4 bg-card">
                    <div className="flex items-center gap-3 mb-3">
                      <Checkbox
                        checked={selectedJobsForQuote.includes(job.JobID)}
                        onCheckedChange={() => toggleJob(job.JobID)}
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{job.JobName}</p>
                        <p className="text-sm text-muted-foreground">{job.Tasks.length} tasks • {formatCurrency(job.JobBudget)}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => selectAllInJob(job.JobID)}>
                        {job.Tasks.every(t => selectedTasksForQuote.has(t.TaskID)) ? 'Deselect All' : 'Select All'}
                      </Button>
                    </div>

                    {selectedJobsForQuote.includes(job.JobID) && (
                      <div className="ml-8 space-y-2 border-l-4 border-primary/20 pl-4">
                        {job.Tasks.map(task => (
                          <div key={task.TaskID} className="flex items-center gap-3">
                            <Checkbox
                              checked={selectedTasksForQuote.has(task.TaskID)}
                              onCheckedChange={() => toggleTask(task.TaskID, job.JobID)}
                            />
                            <div className="flex-1">
                              <p className="text-sm">{task.TaskName}</p>
                              <p className="text-xs text-muted-foreground">{formatCurrency(task.TaskBudget || 0)}</p>
                            </div>
                            {task.QuotationRef && <Badge variant="secondary" className="text-xs">In {task.QuotationRef}</Badge>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <p><strong>{selectedTasksForQuote.size}</strong> tasks selected</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQuotationModal(false)}>Cancel</Button>
            <Button 
                onClick={handleNavigateToQuotation} 
                disabled={selectedTasksForQuote.size === 0}
            >
              <FileText className="h-4 w-4 mr-2" />
              Proceed to Editor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Left: Job Selector (Omitted for brevity) */}
      <div className='w-80 border-r bg-muted/40 p-6 overflow-y-auto'>
        <div className='flex items-center justify-between mb-8'>
          <h2 className='text-2xl font-bold'>Jobs</h2>
          <Button 
            size='sm' 
            onClick={() => 
                handleOpenJobDialog({ 
                    ProjectID: jobsWithTasks[0]?.ProjectID || 1, 
                })
            }
          >
            <Plus className='h-4 w-4 mr-2' />
            New Job
          </Button>
        </div>

        <div className='space-y-3'>
          {jobsWithTasks.map((job) => {
            const isSelected = selectedJobId === job.JobID;
            return (
              <div
                key={job.JobID}
                onClick={() => setSelectedJobId(job.JobID)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'border-transparent bg-card hover:border-accent hover:shadow-md'
                }`}
              >
                <div className='flex items-center justify-between'>
                  <div className='truncate max-w-[120px]'>
                    <div className='font-semibold text-base truncate'>{job.JobName}</div>
                    <div className='text-sm text-muted-foreground'>
                      {job.Tasks.length} tasks
                    </div>
                  </div>
                  {renderJobStatus(job.Status)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Selected Job & Tasks Detail View (Omitted for brevity) */}
      <div className='flex-1 p-8 overflow-auto'>
        <div className='max-w-7xl mx-auto'>
          
          {selectedJob ? (
            <>
              {/* Job Header (Detail View) */}
              <div className='rounded-xl border bg-card p-6 shadow-lg mb-8'>
                <div className='flex items-start justify-between'>
                    <div>
                        <h1 className='text-3xl font-bold mb-1'>{selectedJob.JobName}</h1>
                        <p className='text-sm text-muted-foreground'>
                            Job ID: {selectedJob.JobID} | Project: {selectedJob.ProjectID}
                        </p>
                    </div>
                    <div className='flex gap-2'>
                        {/* Create Quotation Button (Integrated) */}
                        <Button onClick={() => setShowQuotationModal(true)} title='Create Quotation'>
                            <FileText className="h-4 w-4 mr-2" />
                            Create Quotation
                        </Button>
                        
                        {/* Edit Job Button */}
                        <Button
                            variant='outline'
                            size='icon'
                            onClick={() => handleOpenJobDialog(selectedJob)}
                            title='Edit Job'
                        >
                            <Edit className='h-4 w-4' />
                        </Button>
                        
                        {/* Delete Job Dialog */}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant='destructive' size='icon' title='Delete Job'>
                                    <Trash2 className='h-4 w-4' />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Job: {selectedJob.JobName}?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently delete this job and **all {selectedJob.Tasks.length} associated tasks**.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => handleDeleteJob(selectedJob.JobID)}
                                        className='bg-destructive hover:bg-destructive/90 text-primary-foreground'
                                    >
                                        Delete Job
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
                
                {/* Job Progress */}
                <div className='mt-4'>
                    <div className='flex justify-between font-medium text-sm'>
                        <span>Progress</span>
                        <span>{selectedJob.JobProgress}%</span>
                    </div>
                    <Progress value={selectedJob.JobProgress} className='mt-1 h-3' />
                </div>

                {/* Budget Summary */}
                <div className='mt-4 pt-4 border-t border-dashed border-border grid grid-cols-3 gap-4 text-center'>
                    <div className='border-r'>
                        <p className='text-muted-foreground text-sm'>Total Budget</p>
                        <p className='font-bold text-lg text-green-600 dark:text-green-400'>
                            {formatCurrency(selectedJob.JobBudget)}
                        </p>
                    </div>
                    <div className='border-r'>
                        <p className='text-muted-foreground text-sm'>Actual Cost (Completed)</p>
                        <p className='font-bold text-lg'>
                            {formatCurrency(selectedJob.ActualCost)}
                        </p>
                    </div>
                    <div>
                        <p className='text-muted-foreground text-sm'>Remaining Budget</p>
                        <p className={`font-bold text-lg ${
                            (selectedJob.JobBudget - selectedJob.ActualCost) < 0 ? 'text-red-600 dark:text-red-400' : 'text-primary'
                        }`}>
                            {formatCurrency(selectedJob.JobBudget - selectedJob.ActualCost)}
                        </p>
                    </div>
                </div>

                {/* Task Add Button */}
                <div className='mt-4 pt-4 border-t border-dashed border-border flex justify-end'>
                    <Button
                        size='sm'
                        onClick={() =>
                            handleOpenTaskDialog({ 
                                JobID: selectedJob.JobID,
                                Status: 'Not Started', 
                                PlannedStartDate: selectedJob.PlannedStartDate,
                                PlannedEndDate: selectedJob.PlannedEndDate,
                            })
                        }
                    >
                        <Plus className='h-4 w-4 mr-2' />
                        Add New Task
                    </Button>
                </div>
              </div>
              
              {/* Task List (Detail Content) */}
              <h2 className='text-2xl font-semibold mb-4'>
                Tasks ({selectedJob.Tasks.length})
              </h2>

              {selectedJob.Tasks.length > 0 ? (
                  <TaskSubTable 
                      tasks={selectedJob.Tasks} 
                      taskListColumns={taskListColumns} 
                      handleOpenDialog={handleOpenTaskDialog}
                      handleDeleteTask={handleDeleteTask}
                  />
              ) : (
                <div className='p-8 rounded-xl border bg-card text-center text-muted-foreground'>
                  No tasks defined for **{selectedJob.JobName}**. Click "Add New Task" above to start.
                </div>
              )}
            </>
          ) : (
            <p className='text-center py-20 text-muted-foreground text-xl'>
              No jobs found for the current project. Click "New Job" to create one.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}