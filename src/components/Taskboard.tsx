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
import { Jobs as initialJobs } from '@/lib/data';
import * as Data from '@/lib/data';

// added imports
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  NewColumnForm,
  NewJobForm,
  NewTaskForm,
} from '@/components/TaskboardSheets';
// icons
import { ChevronDown, SquarePen, Trash2, GripVertical } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';

type JobType = any;
type TaskType = any;
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

function sumJobTasks(job: JobType) {
  return (job.Tasks || []).reduce(
    (s: number, t: any) => s + (t.TaskBudget ?? 0),
    0
  );
}

/* Task (draggable) */
function DraggableTask({
  task,
  jobId,
}: {
  task: TaskType;
  jobId: number | string;
}) {
  const id = `task-${task.TaskID}-job-${jobId}`;
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className='mb-2 p-0 rounded shadow-sm flex items-start justify-between bg-transparent'
      id={id}
    >
      {/* left handle + content row */}
      <div className='flex items-center w-full'>
        {/* drag handle - visually integrated, larger hit area */}
        <button
          {...attributes}
          {...listeners}
          aria-label='Drag task'
          className='flex items-center justify-center w-8 h-12 mr-3 rounded-l-md bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-300'
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className='h-4 w-4' />
        </button>

        <div className='flex-1 p-2 bg-gray-50 dark:bg-slate-800 rounded-r-md flex items-center justify-between'>
          <div>
            <div className='text-sm font-medium'>{task.TaskName}</div>
            {task.DueDate && (
              <div className='text-xs text-muted-foreground'>
                Due {task.DueDate}
              </div>
            )}
          </div>

          <div className='flex items-center gap-2 ml-4'>
            <div className='text-sm font-semibold'>
              R {(task.TaskBudget ?? 0).toLocaleString()}
            </div>

            {/* small edit/delete buttons for task */}
            <button
              className='p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800'
              title='Edit task'
              onClick={(e) => {
                e.stopPropagation();
                const ev = new CustomEvent('task-edit', {
                  detail: { taskId: String(task.TaskID), jobId: String(jobId) },
                });
                window.dispatchEvent(ev);
              }}
            >
              <SquarePen className='h-4 w-4 text-xs' />
            </button>

            <button
              className='p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800'
              title='Delete task'
              onClick={(e) => {
                e.stopPropagation();
                const ev = new CustomEvent('task-delete', {
                  detail: { taskId: String(task.TaskID), jobId: String(jobId) },
                });
                window.dispatchEvent(ev);
              }}
            >
              <Trash2 className='h-4 w-4 text-xs' />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Task droppable wrapper (so we can drop before a task) */
function TaskDroppableWrapper({
  task,
  jobId,
}: {
  task: TaskType;
  jobId: number | string;
}) {
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

/* NEW: droppable wrapper for entire job (so you can drop onto empty job) */
function JobDroppable({
  jobId,
  children,
}: {
  jobId: number | string;
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
      id={droppableId}
    >
      {children}
      {/* placeholder to ensure area is droppable even when empty */}
      <div className='h-2' />
    </div>
  );
}

/* Draggable job card with a droppable area for tasks (id: job-drop-<JobID>) */
function DraggableCard({
  job,
  id,
  tasks,
}: {
  job: JobType;
  id: string;
  tasks: TaskType[];
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
    });

  const style: React.CSSProperties = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    zIndex: isDragging ? 50 : undefined,
  };

  const jobTotal = sumJobTasks(job);

  // actions for AppCard (edit/delete)
  const actions = (
    <div className='flex items-center gap-1'>
      <button
        className='p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800'
        title='Edit job'
        onClick={(e) => {
          e.stopPropagation();
          const ev = new CustomEvent('job-edit', {
            detail: { jobId: String(job.JobID) },
          });
          window.dispatchEvent(ev);
        }}
      >
        <SquarePen className='h-4 w-4 text-xs' />
      </button>
      <button
        className='p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800'
        title='Delete job'
        onClick={(e) => {
          e.stopPropagation();
          const ev = new CustomEvent('job-delete', {
            detail: { jobId: String(job.JobID) },
          });
          window.dispatchEvent(ev);
        }}
      >
        <Trash2 className='h-4 w-4 text-xs' />
      </button>
    </div>
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className='mb-3 flex items-stretch'
      id={id}
    >
      {/* vertical handle visually integrated with the card */}
      <div className='flex-shrink-0'>
        <button
          {...attributes}
          {...listeners}
          aria-label='Drag job'
          className='w-3 rounded-l-md bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center px-1 focus:outline-none focus:ring-2 focus:ring-indigo-300'
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className='h-4 w-4 text-muted-foreground' />
        </button>
      </div>

      <div className='flex-1'>
        <AppCard
          title={job.JobName}
          description={
            <span>
              {jobTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          }
          actions={actions}
        >
          <div className='space-y-2'>
            {/* Use JobDroppable so dropping works even when tasks.length === 0 */}
            <JobDroppable jobId={job.JobID}>
              {tasks.map((t: any) => (
                <TaskDroppableWrapper
                  key={t.TaskID}
                  task={t}
                  jobId={job.JobID}
                />
              ))}
            </JobDroppable>
          </div>
        </AppCard>
      </div>
    </div>
  );
}

function Column({
  id,
  jobs,
  jobsMap,
  label,
  isOpen,
  onToggle,
}: {
  id: string;
  jobs: JobType[];
  jobsMap: Record<string, JobType>;
  label?: string;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
}) {
  const droppableId = `column-${id}`;
  const { isOver, setNodeRef } = useDroppable({
    id: droppableId,
  });

  const columnTotal = jobs.reduce((s, j) => s + sumJobTasks(j), 0);

  // safe lookup for built-in labels — `id` may be a dynamic string so cast to a
  // string-indexable type. This avoids the TS error about indexing COLUMN_LABELS.
  const builtinLabel = (COLUMN_LABELS as Record<string, string>)[id];

  return (
    <Collapsible open={isOpen} onOpenChange={(v) => onToggle?.(v)}>
      <div
        ref={setNodeRef}
        className={`w-full min-h-[120px] bg-white dark:bg-slate-900 border rounded p-3 flex flex-col ${
          isOver ? 'ring-2 ring-indigo-400' : ''
        }`}
        id={droppableId}
      >
        <CollapsibleTrigger asChild>
          {/* Use a non-button element as the trigger so inner edit/delete buttons can be real <button>s */}
          <div
            className='w-full flex items-center justify-between mb-3 text-left cursor-pointer'
            role='button'
            tabIndex={0}
          >
            <div className='flex items-center gap-2'>
              <h3 className='text-sm font-semibold'>
                {label ?? builtinLabel ?? id}
              </h3>
              <div className='ml-2 flex items-center gap-1'>
                <button
                  className='p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800'
                  title='Edit column'
                  onClick={(e) => {
                    e.stopPropagation();
                    const ev = new CustomEvent('column-edit', {
                      detail: { columnId: id },
                    });
                    window.dispatchEvent(ev);
                  }}
                >
                  <SquarePen className='h-4 w-4 text-xs' />
                </button>
                <button
                  className='p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800'
                  title='Delete column'
                  onClick={(e) => {
                    e.stopPropagation();
                    const ev = new CustomEvent('column-delete', {
                      detail: { columnId: id },
                    });
                    window.dispatchEvent(ev);
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
                tasks={job.Tasks || []}
              />
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

const distributeInitial = (jobs: JobType[]) => {
  const cols: Record<string, string[]> = {};
  for (const c of COLUMN_ORDER) cols[c] = [];

  for (const job of jobs) {
    const name = (job.JobName || '').toLowerCase();
    if (
      name.includes('excavate') ||
      name.includes('site') ||
      name.includes('prep')
    ) {
      cols['site-preparation'].push(String(job.JobID));
    } else if (name.includes('foundation')) {
      cols['foundation'].push(String(job.JobID));
    } else if (name.includes('steel') || name.includes('struct')) {
      cols['superstructure'].push(String(job.JobID));
    } else if (name.includes('roof')) {
      cols['roof'].push(String(job.JobID));
    } else if (
      name.includes('cabinet') ||
      name.includes('interior') ||
      name.includes('install')
    ) {
      cols['interior'].push(String(job.JobID));
    } else {
      cols['finishing'].push(String(job.JobID));
    }
  }
  return cols as Record<ColumnId, string[]>;
};

const Taskboard = () => {
  // jobsById to hold job objects and allow updating Tasks lists
  const [jobsById, setJobsById] = React.useState<Record<string, JobType>>(
    () => {
      const map: Record<string, JobType> = {};
      initialJobs.forEach((j: any) => {
        map[String(j.JobID)] = {
          ...j,
          Tasks: (j.Tasks || []).map((t: any) => ({ ...t })),
        };
      });
      return map;
    }
  );

  // allow arbitrary column keys now
  const [columns, setColumns] = React.useState<Record<string, string[]>>(() =>
    distributeInitial(initialJobs)
  );

  // store any added column labels
  const [extraColumnLabels, setExtraColumnLabels] = React.useState<
    Record<string, string>
  >({});

  // sheet open state (create or edit reuse)
  const [openNewColumn, setOpenNewColumn] = React.useState(false);
  const [openNewJob, setOpenNewJob] = React.useState(false);
  const [openNewTask, setOpenNewTask] = React.useState(false);

  // editing state: hold the item being edited (used to prefill forms)
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

  // delete confirmation
  const [openDeleteConfirm, setOpenDeleteConfirm] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<{
    type: 'column' | 'job' | 'task';
    id: string;
    parentId?: string;
  } | null>(null);

  // track open state per column so we can "collapse all / open all"
  const [openColumns, setOpenColumns] = React.useState<Record<string, boolean>>(
    () => {
      const map: Record<string, boolean> = {};
      Object.keys(columns).forEach((k) => (map[k] = true));
      return map;
    }
  );

  // keep openColumns in sync when columns change (new columns added)
  React.useEffect(() => {
    setOpenColumns((prev) => {
      const next = { ...prev };
      Object.keys(columns).forEach((k) => {
        if (!(k in next)) next[k] = true;
      });
      // remove keys that no longer exist
      Object.keys(next).forEach((k) => {
        if (!(k in columns)) delete next[k];
      });
      return next;
    });
  }, [columns]);

  const sensors = useSensors(useSensor(PointerSensor));

  // Set up global listeners for edit/delete custom events dispatched by buttons
  React.useEffect(() => {
    const onJobEdit = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const jobId = String(detail.jobId);
      const job = jobsById[jobId];
      // find column containing job
      const col = Object.keys(columns).find((k) =>
        (columns[k] || []).includes(jobId)
      );
      setEditingJob({ jobId, initial: job, columnId: col });
      setOpenNewJob(true);
    };

    const onJobDelete = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setDeleteTarget({ type: 'job', id: String(detail.jobId) });
      setOpenDeleteConfirm(true);
    };

    const onTaskEdit = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const jobId = String(detail.jobId);
      const taskId = String(detail.taskId);
      const task = (jobsById[jobId]?.Tasks || []).find(
        (t: any) => String(t.TaskID) === taskId
      );
      if (!task) return;
      setEditingTask({ taskId, jobId, initial: task });
      setOpenNewTask(true);
    };

    const onTaskDelete = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setDeleteTarget({
        type: 'task',
        id: String(detail.taskId),
        parentId: String(detail.jobId),
      });
      setOpenDeleteConfirm(true);
    };

    const onColumnEdit = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const colId = String(detail.columnId);
      setEditingColumn({
        columnId: colId,
        label: extraColumnLabels[colId] ?? colId,
      });
      setOpenNewColumn(true);
    };

    const onColumnDelete = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setDeleteTarget({ type: 'column', id: String(detail.columnId) });
      setOpenDeleteConfirm(true);
    };

    window.addEventListener('job-edit', onJobEdit as EventListener);
    window.addEventListener('job-delete', onJobDelete as EventListener);
    window.addEventListener('task-edit', onTaskEdit as EventListener);
    window.addEventListener('task-delete', onTaskDelete as EventListener);
    window.addEventListener('column-edit', onColumnEdit as EventListener);
    window.addEventListener('column-delete', onColumnDelete as EventListener);

    return () => {
      window.removeEventListener('job-edit', onJobEdit as EventListener);
      window.removeEventListener('job-delete', onJobDelete as EventListener);
      window.removeEventListener('task-edit', onTaskEdit as EventListener);
      window.removeEventListener('task-delete', onTaskDelete as EventListener);
      window.removeEventListener('column-edit', onColumnEdit as EventListener);
      window.removeEventListener(
        'column-delete',
        onColumnDelete as EventListener
      );
    };
  }, [jobsById, columns, extraColumnLabels]);

  const findContainerOfJob = (jobId: string) => {
    for (const col of Object.keys(columns)) {
      if (columns[col as ColumnId].includes(jobId)) return col as ColumnId;
    }
    return null;
  };

  const findContainerOfTask = (taskId: string) => {
    for (const jobId of Object.keys(jobsById)) {
      const tasks = jobsById[jobId].Tasks || [];
      if (tasks.some((t: any) => String(t.TaskID) === taskId)) return jobId;
    }
    return null;
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overIdRaw = String(over.id);

    // JOB drag (existing behavior): job-<JobID>
    if (activeId.startsWith('job-')) {
      const activeJobId = activeId.replace(/^job-/, '');
      if (overIdRaw.startsWith('column-')) {
        const destCol = overIdRaw.replace(/^column-/, '') as ColumnId;
        const srcCol = findContainerOfJob(activeJobId);
        if (!srcCol) return;
        setColumns((prev) => {
          const next = { ...prev };
          next[srcCol] = next[srcCol].filter((i) => i !== activeJobId);
          next[destCol] = [...next[destCol], activeJobId];
          return next;
        });
        return;
      }
      if (overIdRaw.startsWith('job-')) {
        const overJobId = overIdRaw.replace(/^job-/, '');
        const srcCol = findContainerOfJob(activeJobId);
        const destCol = findContainerOfJob(overJobId);
        if (!srcCol || !destCol) return;

        setColumns((prev) => {
          const next = { ...prev };
          next[srcCol] = next[srcCol].filter((i) => i !== activeJobId);
          const destArr = Array.from(next[destCol]);
          const idx = destArr.indexOf(overJobId);
          destArr.splice(idx >= 0 ? idx : destArr.length, 0, activeJobId);
          next[destCol] = destArr;
          return next;
        });
        return;
      }
    }

    // TASK drag: id format task-<TaskID>-job-<JobID>
    if (activeId.startsWith('task-')) {
      const [, taskPart, , srcJobPart] = activeId.split('-'); // ["task","<TaskID>","job","<JobID>"]
      const activeTaskId = taskPart;
      const srcJobId = srcJobPart;
      // dropped on a column (append to first job in that column) - prefer job-drop or job-xxx targets
      if (overIdRaw.startsWith('job-drop-')) {
        const destJobId = overIdRaw.replace(/^job-drop-/, '');
        if (srcJobId === destJobId) return; // same job, no-op
        setJobsById((prev) => {
          const next = { ...prev };
          const taskObj = next[srcJobId].Tasks.find(
            (t: any) => String(t.TaskID) === activeTaskId
          );
          if (!taskObj) return prev;
          // remove from src
          next[srcJobId] = {
            ...next[srcJobId],
            Tasks: next[srcJobId].Tasks.filter(
              (t: any) => String(t.TaskID) !== activeTaskId
            ),
          };
          // append to dest
          next[destJobId] = {
            ...next[destJobId],
            Tasks: [...(next[destJobId].Tasks || []), taskObj],
          };
          // also update module data export
          try {
            const dataJobSrc = Data.Jobs.find(
              (j: any) => String(j.JobID) === srcJobId
            );
            const dataJobDest = Data.Jobs.find(
              (j: any) => String(j.JobID) === destJobId
            );
            if (dataJobSrc && dataJobDest) {
              const moved = {
                ...(dataJobSrc.Tasks.find(
                  (t: any) => String(t.TaskID) === activeTaskId
                ) as {
                  TaskID: number;
                  TaskName: string;
                  DueDate: string;
                  TaskBudget: number;
                }),
                TaskBudget: 0,
              };
              dataJobDest.Tasks = dataJobDest.Tasks || [];
              dataJobDest.Tasks.push(moved);
            }
          } catch (e) {
            // ignore module mutation errors
          }
          return next;
        });
        return;
      }

      // dropped on a task (insert before the target task)
      if (overIdRaw.startsWith('task-')) {
        // overIdRaw example: task-1003-job-102
        const [, overTaskPart, , overJobPart] = overIdRaw.split('-');
        const overTaskId = overTaskPart;
        const destJobId = overJobPart;

        setJobsById((prev) => {
          const next = { ...prev };
          const srcTasks = next[srcJobId].Tasks || [];
          const taskIndex = srcTasks.findIndex(
            (t: any) => String(t.TaskID) === activeTaskId
          );
          if (taskIndex === -1) return prev;
          const [taskObj] = srcTasks.splice(taskIndex, 1); // remove from source
          // if moving within same job and target index is after removal adjust index accordingly
          if (srcJobId === destJobId) {
            const destTasks = next[destJobId].Tasks || [];
            const insertIdx = destTasks.findIndex(
              (t: any) => String(t.TaskID) === overTaskId
            );
            destTasks.splice(
              insertIdx >= 0 ? insertIdx : destTasks.length,
              0,
              taskObj
            );
            next[destJobId] = { ...next[destJobId], Tasks: destTasks };
          } else {
            const destTasks = next[destJobId].Tasks
              ? [...next[destJobId].Tasks]
              : [];
            const insertIdx = destTasks.findIndex(
              (t: any) => String(t.TaskID) === overTaskId
            );
            destTasks.splice(
              insertIdx >= 0 ? insertIdx : destTasks.length,
              0,
              taskObj
            );
            next[srcJobId] = { ...next[srcJobId], Tasks: srcTasks };
            next[destJobId] = { ...next[destJobId], Tasks: destTasks };
          }

          // update module data export
          try {
            const dataJobSrc = Data.Jobs.find(
              (j: any) => String(j.JobID) === srcJobId
            );
            const dataJobDest = Data.Jobs.find(
              (j: any) => String(j.JobID) === destJobId
            );
            if (dataJobSrc) {
              const moved = dataJobSrc.Tasks.splice(
                dataJobSrc.Tasks.findIndex(
                  (t: any) => String(t.TaskID) === activeTaskId
                ),
                1
              )[0];
              if (dataJobDest) {
                dataJobDest.Tasks = dataJobDest.Tasks || [];
                const insertIdx = dataJobDest.Tasks.findIndex(
                  (t: any) => String(t.TaskID) === overTaskId
                );
                dataJobDest.Tasks.splice(
                  insertIdx >= 0 ? insertIdx : dataJobDest.Tasks.length,
                  0,
                  moved
                );
              }
            }
          } catch (e) {
            // ignore
          }

          return next;
        });
        return;
      }
    }
  };

  // create column handler
  const handleCreateColumn = (label: string) => {
    const base = label.trim().toLowerCase().replace(/\s+/g, '-');
    let slug = base;
    let i = 1;
    while (columns[slug]) {
      slug = `${base}-${i++}`;
    }
    setColumns((prev) => ({ ...prev, [slug]: [] }));
    setExtraColumnLabels((prev) => ({ ...prev, [slug]: label }));
    setOpenNewColumn(false);
  };

  // update column (rename label only)
  const handleUpdateColumn = (columnId: string, label: string) => {
    setExtraColumnLabels((prev) => ({ ...prev, [columnId]: label }));
    setEditingColumn(null);
    setOpenNewColumn(false);
  };

  // create job handler
  const handleCreateJob = (
    job: { JobID: number; JobName: string; Tasks?: any[] },
    columnId: string
  ) => {
    const id = String(job.JobID);
    setJobsById((prev) => ({
      ...prev,
      [id]: { ...(job as any), Tasks: job.Tasks || [] },
    }));
    setColumns((prev) => ({
      ...prev,
      [columnId]: [...(prev[columnId] || []), id],
    }));
    // update module data (in-memory)
    try {
      //  Data.Jobs = Data.Jobs || [];
      //Data.Jobs.push({ ...job, Tasks: job.Tasks || [] });
    } catch (e) {}
    setOpenNewJob(false);
  };

  // update job handler
  const handleUpdateJob = (
    job: { JobID: number; JobName: string; Tasks?: any[] },
    columnId: string
  ) => {
    const id = String(job.JobID);
    setJobsById((prev) => {
      const next = { ...prev };
      next[id] = {
        ...(next[id] || {}),
        ...job,
        Tasks: job.Tasks || next[id]?.Tasks || [],
      };
      return next;
    });
    // move between columns if needed
    setColumns((prev) => {
      const next = { ...prev };
      // remove from any column that contains it
      Object.keys(next).forEach((k) => {
        next[k] = next[k].filter((v) => v !== id);
      });
      next[columnId] = [...(next[columnId] || []), id];
      return next;
    });
    // update Data.Jobs if present
    try {
      const idx = Data.Jobs.findIndex((j: any) => String(j.JobID) === id);
      if (idx >= 0)
        Data.Jobs[idx] = {
          ...Data.Jobs[idx],
          ...job,
          Tasks: job.Tasks || Data.Jobs[idx].Tasks || [],
        };
    } catch (e) {}
    setEditingJob(null);
    setOpenNewJob(false);
  };

  // create task handler
  const handleCreateTask = (task: any, targetJobId: string) => {
    setJobsById((prev) => {
      const next = { ...prev };
      const j = next[targetJobId];
      if (!j) return prev;
      next[targetJobId] = { ...j, Tasks: [...(j.Tasks || []), task] };
      // update module export
      try {
        const dj = Data.Jobs.find(
          (x: any) => String(x.JobID) === String(targetJobId)
        );
        if (dj) {
          dj.Tasks = dj.Tasks || [];
          dj.Tasks.push(task);
        }
      } catch (e) {}
      return next;
    });
    setOpenNewTask(false);
  };

  // update task handler
  const handleUpdateTask = (task: any, targetJobId: string) => {
    const taskId = String(task.TaskID);
    setJobsById((prev) => {
      const next = { ...prev };
      const j = next[targetJobId];
      if (!j) return prev;
      next[targetJobId] = {
        ...j,
        Tasks: (j.Tasks || []).map((t: any) =>
          String(t.TaskID) === taskId ? { ...t, ...task } : t
        ),
      };
      return next;
    });
    // update Data.Jobs
    try {
      const dj = Data.Jobs.find(
        (x: any) => String(x.JobID) === String(targetJobId)
      );
      if (dj) {
        dj.Tasks = dj.Tasks || [];
        const tIdx = dj.Tasks.findIndex(
          (t: any) => String(t.TaskID) === taskId
        );
        if (tIdx >= 0) dj.Tasks[tIdx] = { ...dj.Tasks[tIdx], ...task };
      }
    } catch (e) {}
    setEditingTask(null);
    setOpenNewTask(false);
  };

  // delete handler (job/task/column)
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'job') {
      const id = deleteTarget.id;
      // remove job
      setJobsById((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setColumns((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => {
          next[k] = next[k].filter((v) => v !== id);
        });
        return next;
      });
      try {
        const idx = Data.Jobs.findIndex((j: any) => String(j.JobID) === id);
        if (idx >= 0) Data.Jobs.splice(idx, 1);
      } catch (e) {}
    } else if (deleteTarget.type === 'task') {
      const { id, parentId } = deleteTarget;
      setJobsById((prev) => {
        const next = { ...prev };
        const j = next[parentId!];
        if (!j) return prev;
        next[parentId!] = {
          ...j,
          Tasks: (j.Tasks || []).filter((t: any) => String(t.TaskID) !== id),
        };
        return next;
      });
      try {
        const dj = Data.Jobs.find(
          (j: any) => String(j.JobID) === String(parentId)
        );
        if (dj)
          dj.Tasks = (dj.Tasks || []).filter(
            (t: any) => String(t.TaskID) !== id
          );
      } catch (e) {}
    } else if (deleteTarget.type === 'column') {
      const colId = deleteTarget.id;
      // only delete empty columns to avoid accidental loss
      if ((columns[colId] || []).length === 0) {
        setColumns((prev) => {
          const next = { ...prev };
          delete next[colId];
          return next;
        });
        setExtraColumnLabels((prev) => {
          const next = { ...prev };
          delete next[colId];
          return next;
        });
      } else {
        // could show toast - not deleting non-empty column
      }
    }
    setDeleteTarget(null);
    setOpenDeleteConfirm(false);
  };

  return (
    <div className='w-full'>
      {/* Action bar */}
      <div className='flex items-center gap-2 mb-4'>
        <Button
          onClick={() => {
            setEditingColumn(null);
            setOpenNewColumn(true);
          }}
        >
          + New Column
        </Button>
        <Button
          onClick={() => {
            setEditingJob(null);
            setOpenNewJob(true);
          }}
        >
          + New Job Card
        </Button>
        <Button
          onClick={() => {
            setEditingTask(null);
            setOpenNewTask(true);
          }}
        >
          + New Task
        </Button>

        {/* Collapse / Open all switch */}
        <div className='ml-auto flex items-center gap-3'>
          <span className='text-sm text-muted-foreground'>Collapse all</span>
          <Switch
            checked={Object.values(openColumns).every(Boolean)}
            onCheckedChange={(v: boolean) => {
              // set every column open state to the switch value
              const next: Record<string, boolean> = {};
              Object.keys(columns).forEach((k) => (next[k] = v));
              setOpenColumns(next);
            }}
            aria-label='Open or collapse all columns'
          />
        </div>
      </div>

      {/* New Column Sheet */}
      <Sheet
        open={openNewColumn}
        onOpenChange={(v) => {
          if (!v) {
            setEditingColumn(null);
          }
          setOpenNewColumn(v);
        }}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {editingColumn ? 'Edit Column' : 'Add Column'}
            </SheetTitle>
            <SheetDescription>
              {editingColumn
                ? 'Edit column label.'
                : 'Create a new board column.'}
            </SheetDescription>
          </SheetHeader>
          <NewColumnForm
            initial={editingColumn ? { label: editingColumn.label } : undefined}
            onCancel={() => {
              setOpenNewColumn(false);
              setEditingColumn(null);
            }}
            onCreate={(label) => {
              if (editingColumn)
                handleUpdateColumn(editingColumn.columnId, label);
              else handleCreateColumn(label);
            }}
          />
          <SheetFooter />
        </SheetContent>
      </Sheet>

      {/* New Job Sheet */}
      <Sheet
        open={openNewJob}
        onOpenChange={(v) => {
          if (!v) setEditingJob(null);
          setOpenNewJob(v);
        }}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingJob ? 'Edit Job' : 'New Job Card'}</SheetTitle>
            <SheetDescription>
              {editingJob
                ? 'Edit job details.'
                : 'Add a job and choose a column.'}
            </SheetDescription>
          </SheetHeader>
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
              setOpenNewJob(false);
              setEditingJob(null);
            }}
            onCreate={(job, colId) => {
              if (editingJob) handleUpdateJob(job, colId);
              else handleCreateJob(job, colId);
            }}
          />
          <SheetFooter />
        </SheetContent>
      </Sheet>

      {/* New Task Sheet */}
      <Sheet
        open={openNewTask}
        onOpenChange={(v) => {
          if (!v) setEditingTask(null);
          setOpenNewTask(v);
        }}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingTask ? 'Edit Task' : 'New Task'}</SheetTitle>
            <SheetDescription>
              {editingTask
                ? 'Edit task details.'
                : 'Add a task and select job.'}
            </SheetDescription>
          </SheetHeader>
          <NewTaskForm
            jobs={Object.values(jobsById)}
            initial={
              editingTask
                ? {
                    TaskID: Number(editingTask.taskId),
                    TaskName: editingTask.initial?.TaskName,
                    TaskBudget: editingTask.initial?.TaskBudget,
                    jobId: editingTask.jobId,
                    DueDate: editingTask.initial?.DueDate,
                  }
                : undefined
            }
            onCancel={() => {
              setOpenNewTask(false);
              setEditingTask(null);
            }}
            onCreate={(task, jobId) => {
              if (editingTask) handleUpdateTask(task, String(jobId));
              else handleCreateTask(task, String(jobId));
            }}
          />
          <SheetFooter />
        </SheetContent>
      </Sheet>

      {/* Delete confirmation sheet */}
      <Sheet
        open={openDeleteConfirm}
        onOpenChange={(v) => {
          if (!v) setDeleteTarget(null);
          setOpenDeleteConfirm(v);
        }}
      >
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Confirm delete</SheetTitle>
            <SheetDescription>
              Are you sure you want to delete this{' '}
              {deleteTarget?.type ?? 'item'}?
            </SheetDescription>
          </SheetHeader>
          <div className='p-4 flex justify-end gap-2'>
            <Button
              variant='ghost'
              onClick={() => {
                setOpenDeleteConfirm(false);
                setDeleteTarget(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmDelete} className='bg-destructive'>
              Delete
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          {Object.keys(columns).map((colId) => {
            const jobIds = columns[colId] || [];
            const jobs = jobIds.map((id) => jobsById[id]).filter(Boolean);
            // label fallback: known labels or extraColumnLabels
            const label =
              (COLUMN_LABELS as any)[colId] ??
              extraColumnLabels[colId] ??
              colId;
            return (
              <Column
                key={colId}
                id={colId}
                jobs={jobs}
                jobsMap={jobsById}
                label={label}
                isOpen={!!openColumns[colId]}
                onToggle={(open) =>
                  setOpenColumns((prev) => ({ ...prev, [colId]: open }))
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
