// --- Core Type Definitions ---
export type TimeEntry = {
  EntryID: number;
  EmployeeID: number;
  Date: string; // YYYY-MM-DD
  TaskID: number | null;
  HoursWorked: number;
  AmountBorrowed: number;
};

export const projectTypes = [
  'Commercial',
  'Industrial',
  'Residential',
  'Institutional',
  'Luxury',
  'Renovation',
] as const;

export type ProjectType = (typeof projectTypes)[number];

export type ProjectStatus =
  | 'In Progress'
  | 'Active'
  | 'Not Started'
  | 'Completed'
  | 'On Hold'
  | 'Planned'; // Added 'Planned' here for consistency with the component logic

export type TaskStatus =
  | 'Completed'
  | 'In Progress'
  | 'Active'
  | 'Not Started';

export type ChangeOrderStatus = 'Open' | 'Closed' | 'In Review' | 'Approved' | 'Pending';


// --- Entity Interfaces (Explicitly Defined) ---

export interface Project {
  ProjectID: number;
  ClientID: number;
  ProjectName: string;
  ProjectType: ProjectType;
  Description: string;
  QuotedCost: number;
  Status: ProjectStatus;
  QuoteDate: string;
  StartDate: string;
  EndDate: string;
}

export interface Job {
  ProjectID: number;
  JobID: number;
  JobName: string;
  JobBudget: number;
  Status: ProjectStatus; // Using ProjectStatus for consistency
  PlannedStartDate: string;
  PlannedEndDate: string;
  ActualStartDate: string | null;
  ActualEndDate: string | null;
}

export type Task = {
  TaskID: number;
  JobID: number;
  TaskName: string;
  TaskBudget?: number;
  Status: 'Completed' | 'In Progress' | 'Active' | 'Not Started';
  PlannedStartDate: string;
  PlannedEndDate: string;
  ActualStartDate: string | null;
  ActualEndDate: string | null;
  TaskProgress?: number;
  DueDate?: string;
  QuotationRef?: string | null;  // ← Add this line (optional string for quotation number)
  category?: string;
  InvoiceRefs?: string [];
  AssignedEmployees: number[]; // EmployeeIDs
  Budget: number;
  EstimatedHours: number;
  ActualHours?: number;
};

export interface ChangeOrder {
  ChangeOrderID: number;
  ProjectID: number;
  Description: string;
  CostImpact: number;
  DateIssued: string;
  Status: ChangeOrderStatus;
}

export interface Client {
  ClientID: number;
  ClientName: string;
  ContactPerson: string;
  Email: string;
  Phone: string;
  Address?: string;
  BillingAddress?: string;
}

// --- Placeholder Definitions for Referenced Types ---

export interface Employee {
  EmployeeID: number;
  Name: string;
  Position: 'General Worker' | 'Skilled Labor' | 'Bricklayer' | 'Experienced';
  HourlyRate: number;
  DailyRate?: number;
  ContactInfo: string;
  projects: number[];
}

export interface ResourceAssignment {
  AssignmentID: number;
  TaskID: number;
  EmployeeID: number;
  Date: string;
  Hours: number;
}

export interface TaskActual {
  ActualID: number;
  TaskID: number;
  Date: string;
  Cost: number;
  Notes: string;
}

export type Invoice = {
  InvoiceID: string; // e.g. "INV-2025-0001"
  QuotationRef: string;
  ProjectID: number;
  TaskIDs: number[];
  Amount: number;
  Status: 'Paid' | 'Partial' | 'Outstanding';
  CreatedAt: string;
};

export type JobWithTasks = Job & {
  Tasks: Task[];
  JobProgress: number;
  ActualCost: number;
};

export interface DailyTimeEntry {
  date: string; // YYYY-MM-DD
  worked: boolean;
  taskId: number | null; // Changed to number to match TaskID type
  borrowed: number; // Amount borrowed
}

export interface EmployeeTimeCard {
  employeeId: number; // Changed to number to match EmployeeID type
  entries: DailyTimeEntry[];
}
// Component-specific type definitions
export interface TimeCardData {
  projectId: string;
  startDate: string; 
  tasks: Task[];
  employees: Employee[];
  employeeTimeCards: EmployeeTimeCard[];
}

export interface TimeCardCellProps {
  entry: DailyTimeEntry;
  employee: Employee;
  projectTasks: Task[];
  date: string;
  onUpdate: (date: string, field: 'worked' | 'taskId' | 'borrowed', value: boolean | number | null) => void;
}