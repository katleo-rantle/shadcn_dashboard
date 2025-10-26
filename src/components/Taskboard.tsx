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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import NewForms, {
  NewColumnForm,
  NewJobForm,
  NewTaskForm,
} from '@/components/TaskboardSheets';
// new: collapsible UI and chevron icon
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';

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
      {...attributes}
      {...listeners}
      className='mb-2 p-2 bg-white dark:bg-slate-800 rounded shadow-sm flex items-center justify-between'
      id={id}
    >
      <div>
        <div className='text-sm font-medium'>{task.TaskName}</div>
        {task.DueDate && (
          <div className='text-xs text-muted-foreground'>
            Due {task.DueDate}
          </div>
        )}
      </div>
      <div className='text-sm font-semibold'>
        R {(task.TaskBudget ?? 0).toLocaleString()}
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className='mb-3'
      id={id}
    >
      <AppCard
        title={job.JobName}
        description={
          <span>
            {jobTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        }
      >
        <div className='space-y-2'>
          {/* Use JobDroppable so dropping works even when tasks.length === 0 */}
          <JobDroppable jobId={job.JobID}>
            {tasks.map((t: any) => (
              <TaskDroppableWrapper key={t.TaskID} task={t} jobId={job.JobID} />
            ))}
          </JobDroppable>
        </div>
      </AppCard>
    </div>
  );
}

function Column({
  id,
  jobs,
  jobsMap,
  label,
}: {
  id: ColumnId;
  jobs: JobType[];
  jobsMap: Record<string, JobType>;
  label?: string;
}) {
  const droppableId = `column-${id}`;
  const { isOver, setNodeRef } = useDroppable({
    id: droppableId,
  });

  const columnTotal = jobs.reduce((s, j) => s + sumJobTasks(j), 0);

  return (
    <Collapsible defaultOpen>
      <div
        ref={setNodeRef}
        className={`w-full min-h-[120px] bg-white dark:bg-slate-900 border rounded p-3 flex flex-col ${
          isOver ? 'ring-2 ring-indigo-400' : ''
        }`}
        id={droppableId}
      >
        <CollapsibleTrigger asChild>
          <button className='w-full flex items-center justify-between mb-3 text-left'>
            <div className='flex items-center gap-2'>
              <h3 className='text-sm font-semibold'>
                {label ?? COLUMN_LABELS[id]}
              </h3>
            </div>
            <div className='flex items-center gap-2'>
              <div className='text-sm font-medium'>
                R {columnTotal.toLocaleString()}
              </div>
              <ChevronDown className='h-4 w-4 transition-transform data-[state=open]:-rotate-180' />
            </div>
          </button>
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

  // sheet open state
  const [openNewColumn, setOpenNewColumn] = React.useState(false);
  const [openNewJob, setOpenNewJob] = React.useState(false);
  const [openNewTask, setOpenNewTask] = React.useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

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

  return (
    <div className='w-full'>
      {/* Action bar */}
      <div className='flex items-center gap-2 mb-4'>
        <Button onClick={() => setOpenNewColumn(true)}>+ New Column</Button>
        <Button onClick={() => setOpenNewJob(true)}>+ New Job Card</Button>
        <Button onClick={() => setOpenNewTask(true)}>+ New Task</Button>
      </div>

      {/* New Column Sheet */}
      <Sheet open={openNewColumn} onOpenChange={setOpenNewColumn}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Add Column</SheetTitle>
            <SheetDescription>Create a new board column.</SheetDescription>
          </SheetHeader>
          <NewColumnForm
            onCancel={() => setOpenNewColumn(false)}
            onCreate={(label) => handleCreateColumn(label)}
          />
          <SheetFooter />
        </SheetContent>
      </Sheet>

      {/* New Job Sheet */}
      <Sheet open={openNewJob} onOpenChange={setOpenNewJob}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>New Job Card</SheetTitle>
            <SheetDescription>Add a job and choose a column.</SheetDescription>
          </SheetHeader>
          <NewJobForm
            columns={Object.keys(columns)}
            onCancel={() => setOpenNewJob(false)}
            onCreate={(job, colId) => handleCreateJob(job, colId)}
          />
          <SheetFooter />
        </SheetContent>
      </Sheet>

      {/* New Task Sheet */}
      <Sheet open={openNewTask} onOpenChange={setOpenNewTask}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>New Task</SheetTitle>
            <SheetDescription>Add a task and select job.</SheetDescription>
          </SheetHeader>
          <NewTaskForm
            jobs={Object.values(jobsById)}
            onCancel={() => setOpenNewTask(false)}
            onCreate={(task, jobId) => handleCreateTask(task, String(jobId))}
          />
          <SheetFooter />
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
                id={colId as ColumnId}
                jobs={jobs}
                jobsMap={jobsById}
                label={label}
              />
            );
          })}
        </div>
      </DndContext>
    </div>
  );
};

export default Taskboard;
