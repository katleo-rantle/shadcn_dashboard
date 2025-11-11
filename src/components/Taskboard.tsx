// src/components/Taskboard.tsx
'use client';

import React from 'react';
import AppCard from '@/components/AppCard';
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  closestCenter,
  DragEndEvent,
} from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { tasks } from '@/lib/data';
import { useProject } from '@/context/ProjectContext';
import type { Job } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  NewColumnForm,
  NewJobForm,
  NewTaskForm,
} from '@/components/TaskboardSheets';

import {
  ChevronDown,
  SquarePen,
  Trash2,
  GripVertical,
  Search,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';

/* ------------------------------------------------- */
/* Types & Helpers                                    */
/* ------------------------------------------------- */
type JobWithTasks = Job & { Tasks: any[] };
type ColumnId =
  | 'site-preparation'
  | 'foundation'
  | 'superstructure'
  | 'roof'
  | 'interior'
  | 'finishing';

const COLUMN_ORDER: ColumnId[] = [
  'site-preparation',
  'foundation',
  'superstructure',
  'roof',
  'interior',
  'finishing',
];

const COLUMN_LABELS: Record<ColumnId, string> = {
  'site-preparation': 'Site Preparation',
  foundation: 'Foundation',
  superstructure: 'Superstructure',
  roof: 'Roof',
  interior: 'Interior',
  finishing: 'Finishing',
};

const tasksForJob = (jobId: number) => tasks.filter((t) => t.JobID === jobId);
const sumJobTasks = (job: JobWithTasks) =>
  job.Tasks.reduce((s, t: any) => s + (t.TaskBudget ?? 0), 0);

/* ------------------------------------------------- */
/* Draggable Task (with progress bar)                */
/* ------------------------------------------------- */
function DraggableTask({ task, jobId }: { task: any; jobId: number }) {
  const id = `task-${task.TaskID}-job-${jobId}`;
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    zIndex: isDragging ? 50 : undefined,
  };

  const progress = Math.min(Math.max(task.TaskProgress ?? 0, 0), 100);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className='mb-2 p-0 rounded shadow-sm flex items-start justify-between bg-transparent'
      id={id}
    >
      <div className='flex items-center w-full'>
        {/* drag handle */}
        <button
          {...attributes}
          {...listeners}
          aria-label='Drag task'
          className='flex items-center justify-center w-8 h-12 mr-3 rounded-l-md bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-300'
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className='h-4 w-4' />
        </button>

        {/* card body */}
        <div className='flex-1 p-2 bg-gray-50 dark:bg-slate-800 rounded-r-md flex flex-col gap-1'>
          <div className='flex items-center justify-between'>
            <div className='text-sm font-medium'>{task.TaskName}</div>
            <div className='flex items-center gap-1'>
              <button
                className='p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800'
                onClick={(e) => {
                  e.stopPropagation();
                  window.dispatchEvent(
                    new CustomEvent('task-edit', {
                      detail: {
                        taskId: String(task.TaskID),
                        jobId: String(jobId),
                      },
                    })
                  );
                }}
              >
                <SquarePen className='h-4 w-4 text-xs' />
              </button>
              <button
                className='p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800'
                onClick={(e) => {
                  e.stopPropagation();
                  window.dispatchEvent(
                    new CustomEvent('task-delete', {
                      detail: {
                        taskId: String(task.TaskID),
                        jobId: String(jobId),
                      },
                    })
                  );
                }}
              >
                <Trash2 className='h-4 w-4 text-xs' />
              </button>
            </div>
          </div>

          {task.DueDate && (
            <div className='text-xs text-muted-foreground'>
              Due {task.DueDate}
            </div>
          )}

          {/* progress bar */}
          <div className='flex items-center gap-2 mt-1'>
            <div className='flex-1 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden'>
              <div
                className='h-full bg-indigo-500 transition-all duration-300'
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className='text-xs text-muted-foreground'>{progress}%</span>
          </div>

          <div className='text-sm font-semibold'>
            R {(task.TaskBudget ?? 0).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------- */
/* Droppable wrappers                                 */
/* ------------------------------------------------- */
function TaskDroppableWrapper({ task, jobId }: { task: any; jobId: number }) {
  const droppableId = `task-${task.TaskID}-job-${jobId}`;
  const { isOver, setNodeRef } = useDroppable({ id: droppableId });
  return (
    <div
      ref={setNodeRef}
      className={`${isOver ? 'ring-2 ring-indigo-300 rounded' : ''}`}
    >
      <DraggableTask task={task} jobId={jobId} />
    </div>
  );
}

function JobDroppable({
  jobId,
  children,
}: {
  jobId: number;
  children: React.ReactNode;
}) {
  const droppableId = `job-drop-${jobId}`;
  const { isOver, setNodeRef } = useDroppable({ id: droppableId });
  return (
    <div
      ref={setNodeRef}
      className={`space-y-2 min-h-[48px] ${
        isOver ? 'ring-2 ring-indigo-300 rounded' : ''
      }`}
    >
      {children}
      <div className='h-2' />
    </div>
  );
}

/* ------------------------------------------------- */
/* Draggable Job Card                                 */
/* ------------------------------------------------- */
function DraggableCard({
  job,
  id,
  tasks,
}: {
  job: JobWithTasks;
  id: string;
  tasks: any[];
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    zIndex: isDragging ? 50 : undefined,
  };

  const jobTotal = sumJobTasks(job);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className='mb-3 flex items-stretch'
      id={id}
    >
      <button
        {...attributes}
        {...listeners}
        aria-label='Drag job'
        className='w-3 rounded-l-md bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center px-1 focus:outline-none focus:ring-2 focus:ring-indigo-300'
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className='h-4 w-4 text-muted-foreground' />
      </button>

      <div className='flex-1'>
        <AppCard
          title={job.JobName}
          description={`R ${jobTotal.toLocaleString()}`}
          actions={
            <div className='flex items-center gap-1'>
              <button
                className='p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800'
                onClick={(e) => {
                  e.stopPropagation();
                  window.dispatchEvent(
                    new CustomEvent('job-edit', {
                      detail: { jobId: String(job.JobID) },
                    })
                  );
                }}
              >
                <SquarePen className='h-4 w-4 text-xs' />
              </button>
              <button
                className='p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800'
                onClick={(e) => {
                  e.stopPropagation();
                  window.dispatchEvent(
                    new CustomEvent('job-delete', {
                      detail: { jobId: String(job.JobID) },
                    })
                  );
                }}
              >
                <Trash2 className='h-4 w-4 text-xs' />
              </button>
            </div>
          }
        >
          <JobDroppable jobId={job.JobID}>
            {tasks.map((t) => (
              <TaskDroppableWrapper key={t.TaskID} task={t} jobId={job.JobID} />
            ))}
          </JobDroppable>
        </AppCard>
      </div>
    </div>
  );
}

/* ------------------------------------------------- */
/* Column                                            */
/* ------------------------------------------------- */
function Column({
  id,
  jobs,
  label,
  isOpen,
  onToggle,
}: {
  id: string;
  jobs: JobWithTasks[];
  label: string;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}) {
  const droppableId = `column-${id}`;
  const { isOver, setNodeRef } = useDroppable({ id: droppableId });
  const columnTotal = jobs.reduce((s, j) => s + sumJobTasks(j), 0);

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <div
        ref={setNodeRef}
        className={`w-full min-h-[120px] bg-white dark:bg-slate-900 border rounded p-3 flex flex-col ${
          isOver ? 'ring-2 ring-indigo-400' : ''
        }`}
      >
        <CollapsibleTrigger asChild>
          <div
            className='w-full flex items-center justify-between mb-3 text-left cursor-pointer'
            role='button'
            tabIndex={0}
          >
            <div className='flex items-center gap-2'>
              <h3 className='text-sm font-semibold'>{label}</h3>
              <div className='ml-2 flex items-center gap-1'>
                <button
                  className='p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800'
                  onClick={(e) => {
                    e.stopPropagation();
                    window.dispatchEvent(
                      new CustomEvent('column-edit', {
                        detail: { columnId: id },
                      })
                    );
                  }}
                >
                  <SquarePen className='h-4 w-4 text-xs' />
                </button>
                <button
                  className='p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800'
                  onClick={(e) => {
                    e.stopPropagation();
                    window.dispatchEvent(
                      new CustomEvent('column-delete', {
                        detail: { columnId: id },
                      })
                    );
                  }}
                >
                  <Trash2 className='h-4 w-4 text-xs' />
                </button>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <div className='text-sm font-medium'>
                R {columnTotal.toLocaleString()}
              </div>
              <ChevronDown className='h-4 w-4 transition-transform data-[state=open]:-rotate-180' />
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className='flex-1 space-y-3'>
            {jobs.map((job) => (
              <DraggableCard
                key={job.JobID}
                job={job}
                id={`job-${job.JobID}`}
                tasks={job.Tasks}
              />
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

/* ------------------------------------------------- */
/* Column distribution                               */
/* ------------------------------------------------- */
const distributeInitial = (
  jobs: JobWithTasks[]
): Record<ColumnId, string[]> => {
  const cols: Partial<Record<ColumnId, string[]>> = {};
  COLUMN_ORDER.forEach((c) => (cols[c] = []));

  for (const job of jobs) {
    const name = (job.JobName || '').toLowerCase();
    let assigned = false;
    for (const col of COLUMN_ORDER) {
      if (
        (col === 'site-preparation' &&
          (name.includes('excavate') || name.includes('site'))) ||
        (col === 'foundation' && name.includes('foundation')) ||
        (col === 'superstructure' &&
          (name.includes('steel') || name.includes('struct'))) ||
        (col === 'roof' && name.includes('roof')) ||
        (col === 'interior' &&
          (name.includes('cabinet') || name.includes('interior'))) ||
        (col === 'finishing' && !assigned)
      ) {
        cols[col]!.push(String(job.JobID));
        assigned = true;
        break;
      }
    }
    if (!assigned) cols['finishing']!.push(String(job.JobID));
  }
  return cols as Record<ColumnId, string[]>;
};

/* ------------------------------------------------- */
/* Main Taskboard Component                          */
/* ------------------------------------------------- */
const Taskboard = () => {
  const { jobsForSelectedProject } = useProject();

  /* ---- Join jobs + tasks ---- */
  const [jobsWithTasks, setJobsWithTasks] = React.useState<JobWithTasks[]>(() =>
    jobsForSelectedProject.map((job) => ({
      ...job,
      Tasks: tasksForJob(job.JobID),
    }))
  );

  React.useEffect(() => {
    setJobsWithTasks(
      jobsForSelectedProject.map((job) => ({
        ...job,
        Tasks: tasksForJob(job.JobID),
      }))
    );
  }, [jobsForSelectedProject]);

  const [jobsById, setJobsById] = React.useState<Record<string, JobWithTasks>>(
    () => {
      const map: Record<string, JobWithTasks> = {};
      jobsWithTasks.forEach((j) => (map[String(j.JobID)] = { ...j }));
      return map;
    }
  );

  const [columns, setColumns] = React.useState<Record<string, string[]>>(() =>
    distributeInitial(jobsWithTasks)
  );

  const [extraColumnLabels, setExtraColumnLabels] = React.useState<
    Record<string, string>
  >({});

  /* ---- Search / filter ---- */
  const [searchTerm, setSearchTerm] = React.useState('');
  const lowerSearch = searchTerm.trim().toLowerCase();

  const filteredJobs = React.useMemo(() => {
    if (!lowerSearch) return Object.values(jobsById);

    return Object.values(jobsById).filter((job) => {
      const jobMatch = job.JobName.toLowerCase().includes(lowerSearch);
      const taskMatch = job.Tasks.some((t: any) =>
        t.TaskName.toLowerCase().includes(lowerSearch)
      );
      return jobMatch || taskMatch;
    });
  }, [jobsById, lowerSearch]);

  const filteredColumns = React.useMemo(() => {
    const map: Record<string, string[]> = {};
    Object.keys(columns).forEach((col) => (map[col] = []));

    filteredJobs.forEach((job) => {
      const col = Object.keys(columns).find((c) =>
        columns[c].includes(String(job.JobID))
      );
      if (col) map[col].push(String(job.JobID));
    });
    return map;
  }, [filteredJobs, columns]);

  /* ---- Dialog state ---- */
  const [openColumnDialog, setOpenColumnDialog] = React.useState(false);
  const [openJobDialog, setOpenJobDialog] = React.useState(false);
  const [openTaskDialog, setOpenTaskDialog] = React.useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);

  const [editingColumn, setEditingColumn] = React.useState<{
    columnId: string;
    label?: string;
  } | null>(null);
  const [editingJob, setEditingJob] = React.useState<{
    jobId: string;
    initial?: any;
    columnId?: string;
  } | null>(null);
  const [editingTask, setEditingTask] = React.useState<{
    taskId: string;
    jobId: string;
    initial?: any;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<{
    type: 'column' | 'job' | 'task';
    id: string;
    parentId?: string;
  } | null>(null);

  const [openColumns, setOpenColumns] = React.useState<Record<string, boolean>>(
    () => {
      const map: Record<string, boolean> = {};
      Object.keys(columns).forEach((k) => (map[k] = true));
      return map;
    }
  );

  React.useEffect(() => {
    setOpenColumns((prev) => {
      const next = { ...prev };
      Object.keys(columns).forEach((k) => (next[k] ??= true));
      Object.keys(next).forEach((k) => {
        if (!(k in columns)) delete next[k];
      });
      return next;
    });
  }, [columns]);

  React.useEffect(() => {
    const map: Record<string, JobWithTasks> = {};
    jobsWithTasks.forEach((j) => (map[String(j.JobID)] = { ...j }));
    setJobsById(map);
    setColumns(distributeInitial(jobsWithTasks));
  }, [jobsWithTasks]);

  const sensors = useSensors(useSensor(PointerSensor));

  /* ---- Event listeners (edit / delete) ---- */
  React.useEffect(() => {
    const listeners = [
      [
        'job-edit',
        (e: Event) => {
          const { jobId } = (e as CustomEvent).detail;
          const job = jobsById[jobId];
          const col = Object.keys(columns).find((k) =>
            columns[k].includes(jobId)
          );
          setEditingJob({ jobId, initial: job, columnId: col });
          setOpenJobDialog(true);
        },
      ],
      [
        'job-delete',
        (e: Event) => {
          setDeleteTarget({ type: 'job', id: (e as CustomEvent).detail.jobId });
          setOpenDeleteDialog(true);
        },
      ],
      [
        'task-edit',
        (e: Event) => {
          const { taskId, jobId } = (e as CustomEvent).detail;
          const task = jobsById[jobId]?.Tasks.find(
            (t: any) => String(t.TaskID) === taskId
          );
          if (task) {
            setEditingTask({ taskId, jobId, initial: task });
            setOpenTaskDialog(true);
          }
        },
      ],
      [
        'task-delete',
        (e: Event) => {
          const { taskId, jobId } = (e as CustomEvent).detail;
          setDeleteTarget({ type: 'task', id: taskId, parentId: jobId });
          setOpenDeleteDialog(true);
        },
      ],
      [
        'column-edit',
        (e: Event) => {
          const { columnId } = (e as CustomEvent).detail;
          setEditingColumn({
            columnId,
            label: extraColumnLabels[columnId] ?? columnId,
          });
          setOpenColumnDialog(true);
        },
      ],
      [
        'column-delete',
        (e: Event) => {
          setDeleteTarget({
            type: 'column',
            id: (e as CustomEvent).detail.columnId,
          });
          setOpenDeleteDialog(true);
        },
      ],
    ] as const;

    listeners.forEach(([name, handler]) =>
      window.addEventListener(name, handler as EventListener)
    );
    return () =>
      listeners.forEach(([name, handler]) =>
        window.removeEventListener(name, handler as EventListener)
      );
  }, [jobsById, columns, extraColumnLabels]);

  /* ---- Drag & Drop ---- */
  const findContainerOfJob = (jobId: string): string | null => {
    for (const col of Object.keys(columns)) {
      if (columns[col].includes(jobId)) return col;
    }
    return null;
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId.startsWith('job-')) {
      const jobId = activeId.replace('job-', '');
      const srcCol = findContainerOfJob(jobId);
      if (!srcCol) return;

      if (overId.startsWith('column-')) {
        const destCol = overId.replace('column-', '');
        setColumns((prev) => ({
          ...prev,
          [srcCol]: prev[srcCol].filter((id) => id !== jobId),
          [destCol]: [...prev[destCol], jobId],
        }));
      }
    }

    if (activeId.startsWith('task-')) {
      const [, taskId, , srcJobId] = activeId.split('-');
      if (overId.startsWith('job-drop-')) {
        const destJobId = overId.replace('job-drop-', '');
        if (srcJobId === destJobId) return;

        setJobsById((prev) => {
          const task = prev[srcJobId].Tasks.find(
            (t: any) => String(t.TaskID) === taskId
          );
          if (!task) return prev;
          return {
            ...prev,
            [srcJobId]: {
              ...prev[srcJobId],
              Tasks: prev[srcJobId].Tasks.filter(
                (t: any) => String(t.TaskID) !== taskId
              ),
            },
            [destJobId]: {
              ...prev[destJobId],
              Tasks: [...(prev[destJobId].Tasks || []), task],
            },
          };
        });
      }
    }
  };

  /* ---- CRUD Handlers ---- */
  const handleCreateColumn = (label: string) => {
    const slug = label.toLowerCase().replace(/\s+/g, '-');
    let id = slug;
    let i = 1;
    while (columns[id]) id = `${slug}-${i++}`;
    setColumns((prev) => ({ ...prev, [id]: [] }));
    setExtraColumnLabels((prev) => ({ ...prev, [id]: label }));
    setOpenColumnDialog(false);
  };

  const handleUpdateColumn = (columnId: string, label: string) => {
    setExtraColumnLabels((prev) => ({ ...prev, [columnId]: label }));
    setEditingColumn(null);
    setOpenColumnDialog(false);
  };

  const handleCreateJob = (job: any, columnId: string) => {
    const id = String(job.JobID);
    setJobsById((prev) => ({
      ...prev,
      [id]: { ...job, Tasks: job.Tasks || [] },
    }));
    setColumns((prev) => ({ ...prev, [columnId]: [...prev[columnId], id] }));
    setOpenJobDialog(false);
  };

  const handleUpdateJob = (job: any, columnId: string) => {
    const id = String(job.JobID);
    setJobsById((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...job, Tasks: job.Tasks || prev[id]?.Tasks || [] },
    }));
    setColumns((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        next[k] = next[k].filter((v) => v !== id);
      });
      next[columnId] = [...next[columnId], id];
      return next;
    });
    setEditingJob(null);
    setOpenJobDialog(false);
  };

  const handleCreateTask = (task: any, jobId: string) => {
    setJobsById((prev) => ({
      ...prev,
      [jobId]: {
        ...prev[jobId],
        Tasks: [...(prev[jobId].Tasks || []), task],
      },
    }));
    setOpenTaskDialog(false);
  };

  const handleUpdateTask = (task: any, jobId: string) => {
    const taskId = String(task.TaskID);
    setJobsById((prev) => ({
      ...prev,
      [jobId]: {
        ...prev[jobId],
        Tasks: (prev[jobId].Tasks || []).map((t: any) =>
          String(t.TaskID) === taskId ? { ...t, ...task } : t
        ),
      },
    }));
    setEditingTask(null);
    setOpenTaskDialog(false);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'job') {
      setJobsById((prev) => {
        const next = { ...prev };
        delete next[deleteTarget.id];
        return next;
      });
      setColumns((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => {
          next[k] = next[k].filter((v) => v !== deleteTarget.id);
        });
        return next;
      });
    } else if (deleteTarget.type === 'task') {
      setJobsById((prev) => ({
        ...prev,
        [deleteTarget.parentId!]: {
          ...prev[deleteTarget.parentId!],
          Tasks: (prev[deleteTarget.parentId!].Tasks || []).filter(
            (t: any) => String(t.TaskID) !== deleteTarget.id
          ),
        },
      }));
    } else if (
      deleteTarget.type === 'column' &&
      !columns[deleteTarget.id].length
    ) {
      setColumns((prev) => {
        const next = { ...prev };
        delete next[deleteTarget.id];
        return next;
      });
      setExtraColumnLabels((prev) => {
        const next = { ...prev };
        delete next[deleteTarget.id];
        return next;
      });
    }
    setDeleteTarget(null);
    setOpenDeleteDialog(false);
  };

  /* ------------------------------------------------- */
  /* Render                                            */
  /* ------------------------------------------------- */
  return (
    <div className='w-full p-4'>
      {/* ---- Action bar + search ---- */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6'>
        <div className='flex items-center gap-2 flex-1'>
          <Button
            onClick={() => {
              setEditingColumn(null);
              setOpenColumnDialog(true);
            }}
          >
            + New Column
          </Button>
          <Button
            onClick={() => {
              setEditingJob(null);
              setOpenJobDialog(true);
            }}
          >
            + New Job Card
          </Button>
          <Button
            onClick={() => {
              setEditingTask(null);
              setOpenTaskDialog(true);
            }}
          >
            + New Task
          </Button>
        </div>

        {/* search input */}
        <div className='relative w-full sm:w-64'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search jobs or tasks...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>

        {/* collapse all */}
        <div className='flex items-center gap-3'>
          <span className='text-sm text-muted-foreground'>Collapse all</span>
          <Switch
            checked={Object.values(openColumns).every(Boolean)}
            onCheckedChange={(isChecked) => {
              const next: Record<string, boolean> = {};
              Object.keys(columns).forEach((k) => (next[k] = isChecked));
              setOpenColumns(next);
            }}
          />
        </div>
      </div>

      {/* ---- Centered Dialogs ---- */}
      <Dialog
        open={openColumnDialog}
        onOpenChange={(isOpen: boolean) => {
          if (!isOpen) setEditingColumn(null);
          setOpenColumnDialog(isOpen);
        }}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>
              {editingColumn ? 'Edit Column' : 'Add Column'}
            </DialogTitle>
            <DialogDescription>
              {editingColumn
                ? 'Edit column label.'
                : 'Create a new board column.'}
            </DialogDescription>
          </DialogHeader>
          <NewColumnForm
            initial={editingColumn ? { label: editingColumn.label } : undefined}
            onCancel={() => {
              setOpenColumnDialog(false);
              setEditingColumn(null);
            }}
            onCreate={(label) =>
              editingColumn
                ? handleUpdateColumn(editingColumn.columnId, label)
                : handleCreateColumn(label)
            }
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={openJobDialog}
        onOpenChange={(isOpen: boolean) => {
          if (!isOpen) setEditingJob(null);
          setOpenJobDialog(isOpen);
        }}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>
              {editingJob ? 'Edit Job' : 'New Job Card'}
            </DialogTitle>
            <DialogDescription>
              {editingJob
                ? 'Edit job details.'
                : 'Add a job and choose a column.'}
            </DialogDescription>
          </DialogHeader>
          <NewJobForm
            columns={Object.keys(columns)}
            initial={
              editingJob
                ? {
                    JobID: Number(editingJob.jobId),
                    JobName: editingJob.initial?.JobName,
                    Tasks: editingJob.initial?.Tasks,
                    columnId: editingJob.columnId,
                  }
                : undefined
            }
            onCancel={() => {
              setOpenJobDialog(false);
              setEditingJob(null);
            }}
            onCreate={(job, colId) =>
              editingJob
                ? handleUpdateJob(job, colId)
                : handleCreateJob(job, colId)
            }
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={openTaskDialog}
        onOpenChange={(isOpen: boolean) => {
          if (!isOpen) setEditingTask(null);
          setOpenTaskDialog(isOpen);
        }}
      >
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>{editingTask ? 'Edit Task' : 'New Task'}</DialogTitle>
            <DialogDescription>
              {editingTask
                ? 'Edit task details.'
                : 'Add a task and select job.'}
            </DialogDescription>
          </DialogHeader>
          <NewTaskForm
            jobs={Object.values(jobsById)}
            initial={
              editingTask
                ? {
                    TaskID: Number(editingTask.taskId),
                    TaskName: editingTask.initial?.TaskName,
                    TaskBudget: editingTask.initial?.TaskBudget,
                    TaskProgress: editingTask.initial?.TaskProgress,
                    jobId: editingTask.jobId,
                    DueDate: editingTask.initial?.DueDate,
                  }
                : undefined
            }
            onCancel={() => {
              setOpenTaskDialog(false);
              setEditingTask(null);
            }}
            onCreate={(task, jobId) =>
              editingTask
                ? handleUpdateTask(task, String(jobId))
                : handleCreateTask(task, String(jobId))
            }
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={openDeleteDialog}
        onOpenChange={(isOpen: boolean) => {
          if (!isOpen) setDeleteTarget(null);
          setOpenDeleteDialog(isOpen);
        }}
      >
        <DialogContent className='sm:max-w-sm'>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {deleteTarget?.type}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant='ghost'
              onClick={() => {
                setOpenDeleteDialog(false);
                setDeleteTarget(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className='bg-destructive text-destructive-foreground'
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ---- Board ---- */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3'>
          {Object.keys(filteredColumns).map((colId) => {
            const jobIds = filteredColumns[colId] || [];
            const jobs = jobIds.map((id) => jobsById[id]).filter(Boolean);
            const label =
              COLUMN_LABELS[colId as ColumnId] ??
              extraColumnLabels[colId] ??
              colId;
            return (
              <Column
                key={colId}
                id={colId}
                jobs={jobs}
                label={label}
                isOpen={!!openColumns[colId]}
                onToggle={(isOpen: boolean) =>
                  setOpenColumns((prev) => ({ ...prev, [colId]: isOpen }))
                }
              />
            );
          })}
        </div>
      </DndContext>
    </div>
  );
};

export default Taskboard;
