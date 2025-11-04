// @/context/ProjectContext.tsx
'use client';

import React from 'react';
import { projects, jobs } from '@/lib/data';
import type { Project, Job } from '@/lib/types';

export type ProjectContextType = {
  readonly projects: readonly Project[];
  selectedProjectId: number | null;
  setSelectedProjectId: (id: number | null) => void;
  selectedProject: Project | undefined;
  jobsForSelectedProject: Job[];
};

const ProjectContext = React.createContext<ProjectContextType | undefined>(
  undefined
);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedProjectId, setSelectedProjectId] = React.useState<
    number | null
  >(projects.length > 0 ? projects[0].ProjectID : null);

  const selectedProject = projects.find(
    (p) => p.ProjectID === selectedProjectId
  );

  const jobsForSelectedProject = React.useMemo(() => {
    if (!selectedProjectId) return [];
    return jobs.filter((job) => job.ProjectID === selectedProjectId);
  }, [selectedProjectId]);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        selectedProjectId,
        setSelectedProjectId,
        selectedProject,
        jobsForSelectedProject,
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
