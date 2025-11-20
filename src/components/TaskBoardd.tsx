// src/components/TaskBoardd.tsx
'use client';

import React, { useMemo, useState } from 'react';

import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

import { tasks as rawTasks } from '@/lib/data';
import { useProject } from '@/context/ProjectContext';
import type { Job } from '@/lib/types';

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  createColumnHelper,
  CellContext,
  AccessorFnColumnDef,
  DisplayColumnDef,
  Header, // Import Header type for explicit annotation
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
  DueDate?: string;
};

export type JobWithTasks = Job & { Tasks: Task[] };

// Safe cast from readonly literal → mutable array
const tasks = rawTasks as unknown as Task[];

// ─────────────────────────────────────────────────────────────────────────────
// Task Action Components (Placeholders)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: Task = {
      ...initialTask,
      TaskID: initialTask.TaskID || Date.now(), // Simple ID generation
      TaskName: taskName,
      TaskBudget: parseFloat(budget) || 0,
      TaskProgress: parseFloat(progress) || 0,
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
// Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function TaskBoardd() {
  const { jobsForSelectedProject } = useProject();
  const [selectedCategory, setSelectedCategory] =
    useState<string>('site-preparation');
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<
    (Partial<Task> & { JobID: number }) | null
  >(null);

  const handleOpenDialog = (task: Partial<Task> & { JobID: number }) => {
    setCurrentTask(task);
    setIsDialogOpen(true);
  };

  const handleSaveTask = (task: Task) => {
    if (localTasks.find((t) => t.TaskID === task.TaskID)) {
      // Edit
      setLocalTasks(
        localTasks.map((t) => (t.TaskID === task.TaskID ? task : t))
      );
    } else {
      // Add
      setLocalTasks([...localTasks, task]);
    }
  };

  const handleDeleteTask = (taskID: number) => {
    setLocalTasks(localTasks.filter((t) => t.TaskID !== taskID));
  };

  const jobsWithTasks: JobWithTasks[] = useMemo(() => {
    return jobsForSelectedProject.map((job) => ({
      ...job,
      Tasks: localTasks.filter((t) => t.JobID === job.JobID),
    }));
  }, [jobsForSelectedProject, localTasks]);

  const getCategoryForJob = (name: string) => {
    const n = name.toLowerCase();
    if (
      n.includes('site') ||
      n.includes('demolition') ||
      n.includes('excavate')
    )
      return 'site-preparation';
    if (n.includes('foundation')) return 'foundation';
    if (n.includes('steel') || n.includes('struct')) return 'superstructure';
    if (n.includes('roof')) return 'roof';
    if (n.includes('interior') || n.includes('cabinet')) return 'interior';
    return 'finishing';
  };

  const categories = [
    { id: 'site-preparation', label: 'Site Preparation', color: 'bg-blue-500' },
    { id: 'foundation', label: 'Foundation', color: 'bg-yellow-500' },
    { id: 'superstructure', label: 'Superstructure', color: 'bg-green-500' },
    { id: 'roof', label: 'Roof', color: 'bg-red-500' },
    { id: 'interior', label: 'Interior', color: 'bg-purple-500' },
    { id: 'finishing', label: 'Finishing', color: 'bg-orange-500' },
  ];

  const jobsInCategory = jobsWithTasks.filter(
    (j) => getCategoryForJob(j.JobName) === selectedCategory
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Column definitions
  // ─────────────────────────────────────────────────────────────────────────────
  const jobColumnHelper = createColumnHelper<JobWithTasks>();
  const taskColumnHelper = createColumnHelper<Task>();

  const jobColumns = [
    jobColumnHelper.accessor((row) => row.JobName, {
      id: 'jobName',
      header: 'Job Name',
      cell: ({ row }) => (
        <span className='font-medium'>{row.original.JobName}</span>
      ),
    }),
    jobColumnHelper.display({
      id: 'budget',
      header: 'Total Budget',
      cell: ({ row }) => {
        const total = row.original.Tasks.reduce(
          (s, t) => s + (t.TaskBudget ?? 0),
          0
        );
        return (
          <span className='font-semibold'>R {total.toLocaleString()}</span>
        );
      },
    }),
    jobColumnHelper.display({
      id: 'taskCount',
      header: 'Tasks',
      cell: ({ row }) => (
        <Badge variant='secondary'>{row.original.Tasks.length} tasks</Badge>
      ),
    }),
    jobColumnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          size='sm'
          onClick={() =>
            handleOpenDialog({
              JobID: row.original.JobID,
            })
          }
        >
          <Plus className='h-4 w-4 mr-2' />
          Add Task
        </Button>
      ),
    }),
  ];

  // We still need the definition for the nested task list
  const taskListColumns = [
    taskColumnHelper.accessor((row) => row.TaskName, {
      id: 'taskName',
      header: 'Task Name',
    }),
    taskColumnHelper.accessor((row) => row.TaskBudget, {
      id: 'taskBudget',
      header: 'Budget',
      cell: (info) =>
        info.getValue() != null
          ? `R ${info.getValue()!.toLocaleString()}`
          : '—',
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
    taskColumnHelper.accessor((row) => row.DueDate, {
      id: 'dueDate',
      header: 'Due Date',
      cell: (info) => info.getValue() ?? '—',
    }),
    taskColumnHelper.display({
      id: 'taskActions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className='flex gap-2'>
          {/* Edit Button */}
          <Button
            variant='outline'
            size='icon'
            onClick={() => handleOpenDialog(row.original)}
            title='Edit Task'
          >
            <Edit className='h-4 w-4' />
          </Button>

          {/* Delete Dialog */}
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
                  This action cannot be undone. This will permanently delete the
                  task: **{row.original.TaskName}**.
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
    }),
  ];

  const table = useReactTable({
    data: jobsInCategory,
    columns: jobColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const taskTable = useReactTable({
    data: [], // Empty data is fine, we only need the column definitions
    columns: taskListColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className='flex h-screen bg-background'>
      {/* Task Dialog Component */}
      {currentTask && (
        <TaskDialog
          initialTask={currentTask}
          onSave={handleSaveTask}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}

      {/* Left: Categories (No change here) */}
      <div className='w-80 border-r bg-muted/40 p-6 overflow-y-auto'>
        <div className='flex items-center justify-between mb-8'>
          <h2 className='text-2xl font-bold'>Stages</h2>
          <Button size='sm'>
            <Plus className='h-4 w-4 mr-2' />
            New
          </Button>
        </div>

        <div className='space-y-3'>
          {categories.map((cat) => {
            const count = jobsWithTasks.filter(
              (j) => getCategoryForJob(j.JobName) === cat.id
            ).length;
            return (
              <div
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-5 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'border-transparent bg-card hover:border-accent hover:shadow-md'
                }`}
              >
                <div className='flex items-center gap-4'>
                  <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                  <div>
                    <div className='font-semibold text-lg'>{cat.label}</div>
                    <div className='text-sm text-muted-foreground'>
                      {count} jobs
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Jobs Table */}
      <div className='flex-1 p-8 overflow-auto'>
        <div className='max-w-6xl mx-auto'>
          <h1 className='text-3xl font-bold mb-8'>
            {categories.find((c) => c.id === selectedCategory)?.label}
          </h1>

          {jobsInCategory.length === 0 ? (
            <p className='text-center py-20 text-muted-foreground'>
              No jobs in this stage.
            </p>
          ) : (
            <div className='space-y-6'>
              {table.getRowModel().rows.map((jobRow) => {
                // Get the main job header group for context lookup
                const jobHeaderGroup = table.getHeaderGroups()[0];

                return (
                  <div key={jobRow.id} className='rounded-md border bg-card'>
                    {/* Job Header Row */}
                    <Table className='border-b'>
                      <TableHeader>
                        <TableRow className='bg-muted/50 hover:bg-muted/50'>
                          {jobRow.getVisibleCells().map((jobCell) => {
                            // Find the corresponding header object
                            const header = jobHeaderGroup.headers.find(
                              (h: Header<JobWithTasks, unknown>) =>
                                h.id === jobCell.column.id
                            );

                            return (
                              <TableHead key={jobCell.id}>
                                {/* FIX 1 & 2: Use the Header's context if the header exists */}
                                {header
                                  ? flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )
                                  : null}
                              </TableHead>
                            );
                          })}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow className='hover:bg-transparent'>
                          {jobRow.getVisibleCells().map((jobCell) => (
                            <TableCell
                              key={jobCell.id}
                              className='font-semibold'
                            >
                              {flexRender(
                                jobCell.column.columnDef.cell,
                                jobCell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableBody>
                    </Table>

                    {/* Task List (Nested) */}
                    {jobRow.original.Tasks.length > 0 && (
                      <div className='p-4'>
                        <Table>
                          <TableHeader>
                            {taskTable
                              .getHeaderGroups()
                              .map((taskHeaderGroup) => (
                                <TableRow
                                  key={taskHeaderGroup.id}
                                  className='bg-muted/30 hover:bg-muted/30'
                                >
                                  {taskHeaderGroup.headers.map((taskHeader) => (
                                    <TableHead key={taskHeader.id}>
                                      {taskHeader.isPlaceholder
                                        ? null
                                        : flexRender(
                                            taskHeader.column.columnDef.header,
                                            taskHeader.getContext()
                                          )}
                                    </TableHead>
                                  ))}
                                </TableRow>
                              ))}
                          </TableHeader>

                          <TableBody>
                            {/* The row of tasks */}
                            {jobRow.original.Tasks.map((task, index) => {
                              return (
                                <TableRow key={task.TaskID}>
                                  {/* FIX: Start the column map loop here to define 'col' */}
                                  {taskListColumns.map((col) => {
                                    // 1. Get the typed Column object from the task table model
                                    const taskColumn = taskTable.getColumn(
                                      col.id!
                                    )!;

                                    // 2. Safely retrieve the accessorFn from the Column object
                                    const accessor = (
                                      taskColumn.columnDef as AccessorFnColumnDef<
                                        Task,
                                        any
                                      >
                                    ).accessorFn;

                                    // 3. Get the raw value by calling the accessor function
                                    const rawValue =
                                      typeof accessor === 'function'
                                        ? accessor(task, index)
                                        : undefined;

                                    // 4. Manually construct the CellContext
                                    const cellContext: CellContext<Task, any> =
                                      {
                                        row: { original: task } as any,
                                        getValue: () => rawValue,
                                        column: taskColumn as any,
                                        table: taskTable as any,
                                        cell: {
                                          getValue: () => rawValue,
                                          getContext: () => cellContext,
                                        } as any,
                                        renderValue: () => rawValue,
                                      };

                                    return (
                                      <TableCell key={col.id}>
                                        {flexRender(col.cell, cellContext)}
                                      </TableCell>
                                    );
                                  })}{' '}
                                  {/* End of taskListColumns.map */}
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                    {jobRow.original.Tasks.length === 0 && (
                      <div className='p-6 text-center text-muted-foreground'>
                        No tasks assigned yet. Click "Add Task" above.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
