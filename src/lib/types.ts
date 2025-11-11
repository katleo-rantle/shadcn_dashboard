// @/lib/types.ts

export const projectTypes = [
  'Commercial',
  'Industrial',
  'Residential',
  'Institutional',
  'Luxury',
  'Renovation',
] as const;

export type ProjectType = (typeof projectTypes)[number];

import {
  projects,
  jobs,
  tasks,
  employees,
  resourceAssignments,
  taskActuals,
} from './data';

export interface ChnageOrder {
  ChangeOrderID: number;
  ProjectID: number;
  Description: string;
  CostImpact : number;
  DateIssued: string;
  Status: 'Open' | 'Closed' | 'In Review';
}

export type Project = (typeof projects)[number];
export type Job = (typeof jobs)[number];
export type Task = (typeof tasks)[number];
export type Employee = (typeof employees)[number];
export type ResourceAssignment = (typeof resourceAssignments)[number];
export type TaskActual = (typeof taskActuals)[number];
