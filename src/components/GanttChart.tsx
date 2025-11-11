// src/components/GanttChart.tsx
'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { gantt } from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import { useProject } from '@/context/ProjectContext';
import {
  projects,
  jobs,
  tasks,
  employees,
  resourceAssignments,
  taskActuals,
} from '@/lib/data';
import type { Project, Job, Task } from '@/lib/types';

interface GanttTask {
  id: number;
  text: string;
  start_date: Date;
  end_date: Date;
  duration: number;
  progress: number;
  open: boolean;
  parent?: number;
  type?: string;
  actual_start?: Date | null;
  actual_end?: Date | null;
  budget?: number;
  actual_cost?: number;
  projected_cost?: number;
  projected_duration?: number;
  budget_overrun?: boolean;
  resources?: string;
  color?: string;
}

/* ------------------------------------------------- */
/* Helpers                                            */
/* ------------------------------------------------- */
const toDate = (s: string | null | undefined): Date | null => {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
};

const dateFormatter = gantt.date.date_to_str('%d %b');

const fmt = (date: Date | null): string => {
  return date ? dateFormatter(date) : '';
};



/* ------------------------------------------------- */
/* Component                                          */
/* ------------------------------------------------- */
const GanttChart: React.FC = () => {
  const { jobsForSelectedProject, selectedProject } = useProject();
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  /* ------------------------------------------------- */
  /* Initialise Gantt (once)                           */
  /* ------------------------------------------------- */
  useEffect(() => {
    if (!containerRef.current || initialized.current) return;

    // ... existing config ...
        gantt.config.date_format = '%Y-%m-%d';
        gantt.config.scale_unit = 'day';
        gantt.config.date_scale = '%d %M';
        gantt.config.subscales = [
          { unit: 'week', step: 1, date: 'W%W' },
          { unit: 'month', step: 1, date: '%M %Y' },
        ];
        gantt.config.fit_tasks = true;
        gantt.config.show_progress = true;

    gantt.config.grid_width = 360; // give more room

    /* === 1. DISTINCT JOB ROWS === */
    gantt.templates.grid_row_class = (start, end, task) => {
      return task.type === 'project' ? 'job-row' : 'task-row';
    };

    gantt.templates.task_class = (start, end, task) => {
      const level = task.$level ?? 0;
      const base = level % 2 === 0 ? 'even' : 'odd';
      return task.type === 'project' ? `job-bar ${base}` : `task-bar ${base}`;
    };

    /* === 2. CLEAN BAR TEXT (no overlap) === */
    gantt.templates.task_text = (
      start: Date,
      end: Date,
      task: GanttTask & { $level?: number }
    ): string => {
      const isJob = task.type === 'project';

      const actual =
        task.actual_start && task.actual_end
          ? `Actual: ${fmt(task.actual_start)} - ${fmt(task.actual_end)}`
          : task.actual_start
          ? `Started: ${fmt(task.actual_start)}`
          : '';

      const projected =
        task.projected_duration && task.projected_duration !== task.duration
          ? `Proj: ${task.projected_duration}d`
          : '';

      const overrun = task.budget_overrun
        ? `<span class="overrun">Warning Budget Overrun</span>`
        : '';

      const lines = [
        isJob
          ? `<strong style="font-size:1.1em;">${task.text}</strong>`
          : `<strong>${task.text}</strong>`,
        actual && `<div class="actual">${actual}</div>`,
        projected && `<div class="proj">${projected}</div>`,
        overrun,
      ].filter(Boolean);

      return `<div style="line-height:1.4; padding:4px 6px; max-width:100%; overflow:hidden;">${lines.join(
        ''
      )}</div>`;
    };

    /* === 3. PROGRESS TEXT (clean) === */
    gantt.templates.progress_text = (
      start: Date,
      end: Date,
      task: GanttTask
    ): string => {
      const prog = Math.round((task.progress ?? 0) * 100);
      const actual = task.actual_cost?.toLocaleString() ?? '0';
      const budget = task.budget?.toLocaleString() ?? '0';
      return `<span style="font-weight:600; font-size:0.9em;">${prog}%</span><br><small>R${actual}/R${budget}</small>`;
    };

    /* === 4. RIGHT-SIDE TEXT (resource) === */
    gantt.templates.rightside_text = (
      start: Date,
      end: Date,
      task: GanttTask
    ): string => {
      if (task.type === 'project') return `<strong>${task.resources}</strong>`;
      return `<small>${task.resources}</small>`;
    };

    gantt.init(containerRef.current);
    initialized.current = true;

    return () => gantt.clearAll();
  }, []);

  /* ------------------------------------------------- */
  /* Build Gantt data (jobs → tasks)                    */
  /* ------------------------------------------------- */
  const ganttData = useMemo(() => {
    if (!selectedProject || jobsForSelectedProject.length === 0) {
      return { tasks: [], links: [] };
    }

    const gTasks: GanttTask[] = [];
    const links: {
      id: string;
      source: number;
      target: number;
      type: string;
    }[] = [];

    jobsForSelectedProject.forEach((job: Job) => {
      const jobId = job.JobID; // number
      const jobTasks = tasks.filter((t: Task) => t.JobID === job.JobID);

      /* ---------- Job (parent) ---------- */
      const jobStart = toDate(job.PlannedStartDate)!;
      const jobEnd = toDate(job.PlannedEndDate)!;
      const jobDuration = gantt.calculateDuration({
        start_date: jobStart,
        end_date: jobEnd,
      });

      const jobActualCost = taskActuals
        .filter((a) => jobTasks.some((t) => t.TaskID === a.TaskID))
        .reduce((sum, a) => sum + a.Cost, 0);

      const jobGantt: GanttTask = {
        id: jobId,
        text: `${job.JobName} (R${job.JobBudget.toLocaleString()})`,
        start_date: jobStart,
        end_date: jobEnd,
        duration: jobDuration,
        progress:
          jobTasks.reduce((s, t) => s + (t.TaskProgress ?? 0), 0) /
          jobTasks.length,
        open: true,
        type: 'project',
        budget: job.JobBudget,
        actual_cost: jobActualCost,
        projected_cost: 0,
        resources: `${jobTasks.length} tasks`,
        color: '#4F46E5', // indigo
      };

      /* ---------- Projected cost for whole job ---------- */
      let jobProjected = 0;
      jobTasks.forEach((task: Task) => {
        const taskAssignments = resourceAssignments.filter(
          (a) => a.TaskID === task.TaskID
        );
        const dailyCost = taskAssignments.reduce((sum, a) => {
          const emp = employees.find((e) => e.EmployeeID === a.EmployeeID);
          return sum + (emp ? emp.DailyRate * (a.Hours / 8) : 0);
        }, 0);

        const plannedDays = gantt.calculateDuration({
          start_date: toDate(task.PlannedStartDate)!,
          end_date: toDate(task.PlannedEndDate)!,
        });
        jobProjected += dailyCost * plannedDays;
      });
      jobGantt.projected_cost = jobProjected;
      jobGantt.budget_overrun = jobProjected > job.JobBudget;

      gTasks.push(jobGantt);

      /* ---------- Tasks (children) ---------- */
      jobTasks.forEach((task: Task, idx) => {
        const taskId = task.TaskID; // number
        const taskStart = toDate(task.PlannedStartDate)!;
        const taskEnd = toDate(task.PlannedEndDate)!;
        const taskDuration = gantt.calculateDuration({
          start_date: taskStart,
          end_date: taskEnd,
        });

        const taskAssignments = resourceAssignments.filter(
          (a) => a.TaskID === task.TaskID
        );
        const dailyCost = taskAssignments.reduce((sum, a) => {
          const emp = employees.find((e) => e.EmployeeID === a.EmployeeID);
          return sum + (emp ? emp.DailyRate * (a.Hours / 8) : 0);
        }, 0);

        const projectedDays =
          dailyCost > 0 ? Math.ceil(task.TaskBudget / dailyCost) : taskDuration;
        const projectedEnd = gantt.calculateEndDate({
          start_date: taskStart,
          duration: projectedDays,
        });

        const taskActualCost = taskActuals
          .filter((a) => a.TaskID === task.TaskID)
          .reduce((sum, a) => sum + a.Cost, 0);

        const resourceSummary =
          taskAssignments.length > 0
            ? `${taskAssignments.length} workers (R${
                employees.find(
                  (e) => e.EmployeeID === taskAssignments[0].EmployeeID
                )?.DailyRate ?? 0
              }/day avg)`
            : 'No resources';

        const taskGantt: GanttTask = {
          id: taskId,
          text: `${task.TaskName} (${resourceSummary})`,
          start_date: taskStart,
          end_date: taskEnd,
          duration: taskDuration,
          progress: (task.TaskProgress ?? 0) / 100,
          open: false,
          parent: jobId,
          type: String(gantt.config.types.task), // correct type
          actual_start: toDate(task.ActualStartDate),
          actual_end: toDate(task.ActualEndDate),
          budget: task.TaskBudget,
          actual_cost: taskActualCost,
          projected_cost: dailyCost * projectedDays,
          projected_duration: projectedDays,
          budget_overrun: dailyCost * projectedDays > task.TaskBudget,
          resources: resourceSummary,
          color:
            task.TaskProgress === 100
              ? '#10B981' // green
              : dailyCost * projectedDays > task.TaskBudget
              ? '#EF4444' // red
              : '#3B82F6', // blue
        };

        gTasks.push(taskGantt);

        /* Link first task of job to job start */
        if (idx === 0) {
          links.push({
            id: `link-job-${jobId}-first`,
            source: jobId,
            target: taskId,
            type: '0',
          });
        }
      });
    });

    return { tasks: gTasks, links };
  }, [jobsForSelectedProject, selectedProject]);


  /* ------------------------------------------------- */
  /* Refresh when data changes                          */
  /* ------------------------------------------------- */
  useEffect(() => {
    if (!initialized.current) return;
    gantt.clearAll();
    gantt.parse({ data: ganttData.tasks, links: ganttData.links });
    gantt.render();
  }, [ganttData]);

  /* ------------------------------------------------- */
  /* Render                                             */
  /* ------------------------------------------------- */
  if (!selectedProject) {
    return (
      <div className='flex h-96 items-center justify-center rounded-lg border bg-muted/50'>
        <p className='text-muted-foreground'>
          Select a project to view the Gantt chart
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Project Header */}
      <div className='flex justify-between items-center p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg'>
        <div>
          <h2 className='text-xl font-bold'>{selectedProject.ProjectName}</h2>
          <p className='text-sm text-muted-foreground'>
            Budget: R{selectedProject.QuotedCost.toLocaleString()} | Status:{' '}
            {selectedProject.Status}
          </p>
        </div>
        <div className='text-right'>
          <p className='text-sm font-medium'>
            Planned: {selectedProject.StartDate} - {selectedProject.EndDate}
          </p>
        </div>
      </div>

      {/* Gantt */}
      <div
        ref={containerRef}
        style={{ width: '100%', height: '640px' }}
        className='rounded-lg border bg-white dark:bg-slate-900 overflow-hidden'
      />

      {/* Legend */}
      <div className='flex gap-6 text-xs text-muted-foreground'>
        <div className='flex items-center gap-1'>
          <div className='w-3 h-3 rounded bg-indigo-500'></div>
          <span>Job (Container)</span>
        </div>
        <div className='flex items-center gap-1'>
          <div className='w-3 h-3 rounded bg-blue-500'></div>
          <span>Active Task</span>
        </div>
        <div className='flex items-center gap-1'>
          <div className='w-3 h-3 rounded bg-green-500'></div>
          <span>Completed Task</span>
        </div>
        <div className='flex items-center gap-1'>
          <div className='w-3 h-3 rounded bg-red-500'></div>
          <span>Budget Overrun</span>
        </div>
      </div>
    </div>
  );
};



export default GanttChart;