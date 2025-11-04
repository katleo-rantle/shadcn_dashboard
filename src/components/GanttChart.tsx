// @/components/GanttChart.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { gantt } from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import { useProject } from '@/context/ProjectContext';

const GanttChart: React.FC = () => {
  const { jobsForSelectedProject, selectedProject } = useProject();
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!containerRef.current || initialized.current) return;

    // Gantt Config
    gantt.config.date_format = '%Y-%m-%d';
    gantt.config.scale_unit = 'day';
    gantt.config.date_scale = '%d %M';
    gantt.config.subscales = [{ unit: 'month', step: 1, date: '%F %Y' }];
    gantt.config.fit_tasks = true;
    gantt.config.show_progress = true;

    gantt.templates.progress_text = (start, end, task) => {
      if (task && typeof task.progress === 'number') {
        return `${Math.round(task.progress * 100)}%`;
      }
      return '';
    };

    gantt.init(containerRef.current);
    initialized.current = true;

    return () => {
      gantt.clearAll();
    };
  }, []);

  useEffect(() => {
    if (!initialized.current || jobsForSelectedProject.length === 0) return;

    const tasks = jobsForSelectedProject.map((job) => ({
      id: job.JobID,
      text: job.JobName,
      start_date: job.StartDate,
      duration: job.Duration,
      progress: job.Progress,
      open: true,
    }));

    const links = jobsForSelectedProject
      .filter((job) => job.PredecessorJobID)
      .map((job) => ({
        id: `link-${job.JobID}`,
        source: job.PredecessorJobID!,
        target: job.JobID,
        type: '0' as const, // finish-to-start
      }));

    gantt.clearAll();
    gantt.parse({ data: tasks, links });
  }, [jobsForSelectedProject]);

  if (!selectedProject) {
    return (
      <div className='flex h-96 items-center justify-center rounded-lg border bg-muted/50'>
        <p className='text-muted-foreground'>
          Select a project to view the Gantt chart
        </p>
      </div>
    );
  }

  if (jobsForSelectedProject.length === 0) {
    return (
      <div className='flex h-96 items-center justify-center rounded-lg border bg-muted/50'>
        <p className='text-muted-foreground'>No jobs for this project</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '500px' }}
      className='rounded-lg border bg-white dark:bg-slate-900'
    />
  );
};

export default GanttChart;
