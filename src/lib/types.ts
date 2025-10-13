
// ...existing code...
export type Job = {
  JobID: number;
  JobName: string;
  StartDate: string; // e.g. '2024-04-01'
};

export type ChangeOrder = {
  ChangeOrderID: number;
  Description: string;
  CostAdjustment: number;
  Date: string; // e.g. '2024-05-01'
};

export type Project = {
  ProjectID: number;
  ProjectName: string;
  QuotedCost: number;
  Status: string;
  QuoteDate: string; // e.g. '2024-03-15'
  Jobs: Job[];
  ChangeOrders: ChangeOrder[];
};

export const projects: Project[] = [
  {
    ProjectID: 1,
    ProjectName: "Downtown Office Renovation",
    QuotedCost: 125000.5,
    Status: "Active",
    QuoteDate: "2024-03-15",
    Jobs: [
      { JobID: 1, JobName: "Demolition", StartDate: "2024-04-01" },
      { JobID: 2, JobName: "Framing", StartDate: "2024-04-15" }
    ],
    ChangeOrders: [
      { ChangeOrderID: 1, Description: "Add pendant lights", CostAdjustment: 1200, Date: "2024-05-01" }
    ]
  },
  {
    ProjectID: 2,
    ProjectName: "Residential Kitchen Remodel",
    QuotedCost: 45000.0,
    Status: "Completed",
    QuoteDate: "2024-01-20",
    Jobs: [
      { JobID: 3, JobName: "Cabinet demo", StartDate: "2024-02-01" }
    ],
    ChangeOrders: []
  },
  {
    ProjectID: 3,
    ProjectName: "Commercial Warehouse Expansion",
    QuotedCost: 250000.75,
    Status: "In Progress",
    QuoteDate: "2024-06-10",
    Jobs: [
      { JobID: 4, JobName: "Site prep", StartDate: "2024-06-15" },
      { JobID: 5, JobName: "Foundation", StartDate: "2024-07-01" }
    ],
    ChangeOrders: [
      { ChangeOrderID: 2, Description: "Extra slab reinforcement", CostAdjustment: 5000, Date: "2024-07-10" }
    ]
  }
];