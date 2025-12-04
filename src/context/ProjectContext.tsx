// @/context/ProjectContext.tsx
'use client';

import React from 'react';
import { projects, jobs, tasks as allTasks } from '@/lib/data';
import type { Project, Job, Task } from '@/lib/types';

export type ProjectContextType = {
  readonly projects: readonly Project[];
  selectedProjectId: number | null;
  setSelectedProjectId: (id: number | null) => void;
  selectedProject: Project | undefined;
  jobsForSelectedProject: Job[];
  tasksForSelectedJob: Task[];
};

const ProjectContext = React.createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // This is the ONLY line you needed to change
  const [selectedProjectId, setSelectedProjectId] = React.useState<number | null>(null);

  const selectedProject = projects.find((p) => p.ProjectID === selectedProjectId);

  const jobsForSelectedProject = React.useMemo(() => {
    if (!selectedProjectId) return [];
    return jobs.filter((job) => job.ProjectID === selectedProjectId);
  }, [selectedProjectId]);

  // FIXED: Tasks are linked via JobID → Job → ProjectID
  const tasksForSelectedJob = React.useMemo(() => {
    if (!selectedProjectId) return [];

    // First get all JobIDs for this project
    const projectJobIds = jobsForSelectedProject.map(job => job.JobID);

    // Then filter tasks that belong to any of those jobs
    return allTasks.filter((task) => 
      task.JobID && projectJobIds.includes(task.JobID)
    );
  }, [selectedProjectId, jobsForSelectedProject]);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        selectedProjectId,
        setSelectedProjectId,
        selectedProject,
        jobsForSelectedProject,
        tasksForSelectedJob, // Placeholder, implement as needed
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = (): ProjectContextType => {
  const context = React.useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};