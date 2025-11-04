// @/lib/types.ts
import {
  projects,
  jobs,
  tasks,
  invoices,
  payments,
  changeOrders,
  taskCatalogue,
} from './data';

export type Project = (typeof projects)[number];
export type Job = (typeof jobs)[number];
export type Task = (typeof tasks)[number];
export type Invoice = (typeof invoices)[number];
export type Payment = (typeof payments)[number];
export type ChangeOrder = (typeof changeOrders)[number];
export type CatalogueItem = (typeof taskCatalogue)[number];
