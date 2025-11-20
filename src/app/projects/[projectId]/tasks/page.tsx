// src/components/JobTaskBoard.tsx (Final Version with Project Switch Fix)
'use client';

import React, { useMemo, useState } from 'react';

import { Plus, Edit, Trash2 } from 'lucide-react';
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

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// NOTE: Assuming '@/lib/data' and '@/context/ProjectContext' exist in your environment
import { jobs, tasks as rawTasks } from '@/lib/data'; 
import { useProject } from '@/context/ProjectContext';
import type { Job } from '@/lib/types'; 

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
};

export type JobWithTasks = Job & { 
    Tasks: Task[];
    JobProgress: number;
    ActualCost: number;
};

const initialTasks = rawTasks as unknown as Task[];

// ─────────────────────────────────────────────────────────────────────────────
// Job Action Components (Dialogs)
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
  
  // Sync state with props when initialJob changes
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
// Task Action Components (Dialogs)
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

  // FIX: Synchronize local state with props when initialTask changes
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
// Sub-Component: Task Sub Table
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
    const subTable = useReactTable({
        data: tasks,
        columns: taskListColumns.map(col => {
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
                            <TableHead key={header.id}>
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

  const [projectJobs, setProjectJobs] = useState<Job[]>(initialJobs);

  // FIX: Synchronize local state when the project changes (initialJobs updates)
  React.useEffect(() => {
      // 1. Update projectJobs state with new jobs from the selected project
      setProjectJobs(initialJobs);
      
      // 2. Automatically select the first job of the new project, if available
      if (initialJobs.length > 0) {
          setSelectedJobId(initialJobs[0].JobID);
      } else {
          setSelectedJobId(null);
      }
      
  }, [initialJobs]); // Dependency: Runs whenever the selected project's jobs change

  const [selectedJobId, setSelectedJobId] = useState<number | null>(
    projectJobs.length > 0 ? projectJobs[0].JobID : null
  );
  const [localTasks, setLocalTasks] = useState<Task[]>(initialTasks);

  // Dialog States
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<
    (Partial<Task> & { JobID: number }) | null
  >(null);
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [currentJob, setCurrentJob] = useState<Partial<Job> | null>(null);

  // --- JOB CRUD Handlers ---
  const handleOpenJobDialog = (job: Partial<Job>) => {
    setCurrentJob(job);
    setIsJobDialogOpen(true);
  };
  
  const handleSaveJob = (job: Job) => {
    if (projectJobs.find((j) => j.JobID === job.JobID)) {
      setProjectJobs(
        projectJobs.map((j) => (j.JobID === job.JobID ? job : j))
      );
    } else {
      setProjectJobs([...projectJobs, job]);
      setSelectedJobId(job.JobID);
    }
    setIsJobDialogOpen(false); 
  };
  
  const handleDeleteJob = (jobID: number) => {
    setProjectJobs(projectJobs.filter(j => j.JobID !== jobID));
    setLocalTasks(localTasks.filter(t => t.JobID !== jobID));
    
    if (selectedJobId === jobID) {
      const nextJob = projectJobs.find(j => j.JobID !== jobID);
      setSelectedJobId(nextJob?.JobID || null);
    }
  };

  // --- TASK CRUD Handlers ---
  const handleOpenTaskDialog = (task: Partial<Task> & { JobID: number }) => {
    setCurrentTask(task);
    setIsTaskDialogOpen(true);
  };

  const handleSaveTask = (task: Task) => {
    if (localTasks.find((t) => t.TaskID === task.TaskID)) {
      setLocalTasks(
        localTasks.map((t) => (t.TaskID === task.TaskID ? task : t))
      );
    } else {
      setLocalTasks([...localTasks, task]);
    }
    setIsTaskDialogOpen(false); 
  };

  const handleDeleteTask = (taskID: number) => {
    setLocalTasks(localTasks.filter((t) => t.TaskID !== taskID));
  };

  // Combine jobs with their tasks and calculate derived metrics
  const jobsWithTasks: JobWithTasks[] = useMemo(() => {
    return projectJobs.map((job) => {
        const tasks = localTasks.filter((t) => t.JobID === job.JobID);
        
        // Calculate Job Progress (Average of all task progresses)
        const totalProgressWeight = tasks.reduce((sum, t) => sum + (t.TaskProgress ?? 0), 0);
        const jobProgress = tasks.length > 0 ? Math.round(totalProgressWeight / tasks.length) : 0;

        // Calculate Actual Cost (Sum of Task Budget only for tasks where Progress is 100)
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
// Column definitions (Task Table)
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
      {/* Job Dialog Component */}
      {currentJob && (
        <JobDialog
          initialJob={currentJob}
          onSave={handleSaveJob}
          open={isJobDialogOpen}
          onOpenChange={setIsJobDialogOpen}
        />
      )}
      
      {/* Task Dialog Component */}
      {currentTask && (
        <TaskDialog
          initialTask={currentTask}
          onSave={handleSaveTask}
          open={isTaskDialogOpen}
          onOpenChange={setIsTaskDialogOpen}
        />
      )}

      {/* Left: Job Selector */}
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

      {/* Right: Selected Job & Tasks Detail View */}
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