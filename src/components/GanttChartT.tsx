// src/components/GanttChartT.tsx
'use client';

import React, { useMemo, useState, useCallback } from 'react';
import { Gantt, Task, ViewMode, TaskOrEmpty } from '@wamra/gantt-task-react';
import '@wamra/gantt-task-react/dist/style.css';
import { useProject } from '@/context/ProjectContext';
import {
  projects,
  jobs,
  tasks,
  employees,
  resourceAssignments,
  taskActuals,
} from '@/lib/data';
import type { Project, Job, Task as AppTask } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

/* ------------------------------------------------- */
/* 1. Extend library Task                              */
/* ------------------------------------------------- */
interface EnhancedTask extends Task {
  budget?: number;
  actual_cost?: number;
  projected_cost?: number;
  budget_overrun?: boolean;
  resources?: string;
  actual_start?: Date | null;
  actual_end?: Date | null;
}

/* ------------------------------------------------- */
/* 2. Helpers                                          */
/* ------------------------------------------------- */
const toDate = (s: string | null | undefined): Date | null => {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
};

const dailyCost = (
  assigns: readonly (typeof resourceAssignments)[number][],
  emps: typeof employees
): number =>
  assigns.reduce((sum, a) => {
    const emp = emps.find((e) => e.EmployeeID === a.EmployeeID);
    return sum + (emp ? emp.DailyRate * (a.Hours / 8) : 0);
  }, 0);

/* ------------------------------------------------- */
/* 3. Component                                        */
/* ------------------------------------------------- */
const GanttChartT: React.FC = () => {
  const { jobsForSelectedProject, selectedProject } = useProject();
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day);

  /* ------------------- Build Tasks ------------------- */
  const ganttTasks: EnhancedTask[] = useMemo(() => {
    if (!selectedProject || jobsForSelectedProject.length === 0) return [];

    const result: EnhancedTask[] = [];

    jobsForSelectedProject.forEach((job) => {
      const jobTasks = tasks.filter((t) => t.JobID === job.JobID);

      // ---------- JOB (parent) ----------
      const jobStart = toDate(job.PlannedStartDate)!;
      const jobEnd = toDate(job.PlannedEndDate)!;

      const jobActual = taskActuals
        .filter((a) => jobTasks.some((t) => t.TaskID === a.TaskID))
        .reduce((s, a) => s + a.Cost, 0);

      let jobProjected = 0;
      jobTasks.forEach((t) => {
        const assigns = resourceAssignments.filter(
          (a) => a.TaskID === t.TaskID
        );
        const dc = dailyCost(assigns as any, employees);
        const days = Math.ceil(
          (toDate(t.PlannedEndDate)!.getTime() -
            toDate(t.PlannedStartDate)!.getTime()) /
            86400000
        );
        jobProjected += dc * days;
      });

      result.push({
        start: jobStart,
        end: jobEnd,
        name: `Folder ${job.JobName} (R${job.JobBudget.toLocaleString()})`,
        id: `job-${job.JobID}`,
        type: 'project',
        progress:
          jobTasks.reduce((s, t) => s + (t.TaskProgress ?? 0), 0) /
          (jobTasks.length || 1),
        isDisabled: true,
        styles: {
          barBackgroundColor: '#4F46E5',
          barProgressColor: '#6366F1',
        },
        budget: job.JobBudget,
        actual_cost: jobActual,
        projected_cost: jobProjected,
        budget_overrun: jobProjected > job.JobBudget,
        resources: `${jobTasks.length} tasks`,
      });

      // ---------- TASKS (children) ----------
      jobTasks.forEach((taskItem) => {
        const start = toDate(taskItem.PlannedStartDate)!;
        const end = toDate(taskItem.PlannedEndDate)!;
        const assigns = resourceAssignments.filter(
          (a) => a.TaskID === taskItem.TaskID
        );
        const dc = dailyCost(assigns as any, employees);
        const plannedDays = Math.ceil(
          (end.getTime() - start.getTime()) / 86400000
        );
        const projectedDays =
          dc > 0 ? Math.ceil(taskItem.TaskBudget / dc) : plannedDays;
        const projectedEnd = new Date(
          start.getTime() + projectedDays * 86400000
        );

        const actual = taskActuals
          .filter((a) => a.TaskID === taskItem.TaskID)
          .reduce((s, a) => s + a.Cost, 0);

        const resSummary =
          assigns.length > 0
            ? `${assigns.length} workers (R${
                employees.find((e) => e.EmployeeID === assigns[0].EmployeeID)
                  ?.DailyRate ?? 0
              }/day)`
            : 'No resources';

        const overrun = dc * projectedDays > taskItem.TaskBudget;

        result.push({
          start,
          end: projectedEnd,
          name: `  • ${taskItem.TaskName} (${resSummary})`,
          id: `task-${taskItem.TaskID}`,
          type: 'task',
          progress: (taskItem.TaskProgress ?? 0) / 100,
          parent: `job-${job.JobID}`,
          styles: {
            barBackgroundColor:
              taskItem.TaskProgress === 100 ? '#10B981' : '#3B82F6',
            barProgressColor: overrun ? '#EF4444' : '#10B981',
          },
          budget: taskItem.TaskBudget,
          actual_cost: actual,
          projected_cost: dc * projectedDays,
          budget_overrun: overrun,
          resources: resSummary,
          actual_start: toDate(taskItem.ActualStartDate),
          actual_end: toDate(taskItem.ActualEndDate),
        });
      });
    });

    return result;
  }, [jobsForSelectedProject, selectedProject]);

  /* ------------------- Handlers ------------------- */
  const onDateChange = useCallback((task: TaskOrEmpty) => {
    if ('id' in task) console.log('Date changed:', task);
  }, []);

  const onProgressChange = useCallback((task: TaskOrEmpty) => {
    if ('id' in task) console.log('Progress changed:', task);
  }, []);

  const onClick = useCallback((task: TaskOrEmpty) => {
    if ('id' in task && task.type === 'project') {
      console.log('Job expander clicked:', task);
    }
  }, []);

  /* ------------------- Render ------------------- */
  if (!selectedProject) {
    return (
      <Card>
        <CardContent className='p-6 text-center text-muted-foreground'>
          Select a project to view the Gantt chart
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Header */}
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div>
            <CardTitle>{selectedProject.ProjectName}</CardTitle>
            <p className='text-sm text-muted-foreground'>
              Budget: R{selectedProject.QuotedCost.toLocaleString()} | Status:{' '}
              {selectedProject.Status}
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setViewMode(ViewMode.Day)}
            >
              Day
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setViewMode(ViewMode.Week)}
            >
              Week
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setViewMode(ViewMode.Month)}
            >
              Month
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Gantt */}
      <Card>
        <CardContent className='p-0'>
          <Gantt
            tasks={ganttTasks}
            viewMode={viewMode}
            onDateChange={onDateChange}
            onProgressChange={onProgressChange}
            onClick={onClick}
            //columnWidth={120}
            //rowHeight={50}
          />
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className='p-4'>
          <div className='flex flex-wrap gap-6 text-xs text-muted-foreground'>
            <div className='flex items-center gap-2'>
              <div className='w-4 h-2 rounded-full bg-indigo-600'></div>
              <span>Job (Container)</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-4 h-2 rounded-full bg-blue-600'></div>
              <span>Active Task</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-4 h-2 rounded-full bg-green-600'></div>
              <span>Completed Task</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-4 h-2 rounded-full bg-red-600'></div>
              <span>Budget Overrun</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Summary */}
      {ganttTasks.length > 0 && (
        <Card>
          <CardContent className='p-4 space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span>Total Budget:</span>
              <Badge variant='secondary'>
                R{selectedProject.QuotedCost.toLocaleString()}
              </Badge>
            </div>
            <div className='flex justify-between'>
              <span>Projected Cost:</span>
              <Badge
                variant={
                  ganttTasks.some((t) => t.budget_overrun)
                    ? 'destructive'
                    : 'default'
                }
              >
                R
                {ganttTasks
                  .reduce((s, t) => s + (t.projected_cost ?? 0), 0)
                  .toLocaleString()}
              </Badge>
            </div>
            {ganttTasks.some((t) => t.budget_overrun) && (
              <div className='flex items-center gap-2 text-destructive'>
                <AlertCircle className='h-4 w-4' />
                <span>
                  Overrun in {ganttTasks.filter((t) => t.budget_overrun).length}{' '}
                  item(s)
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GanttChartT;
