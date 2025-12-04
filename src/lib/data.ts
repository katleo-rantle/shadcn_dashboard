import { Project, Job, Task, Employee, ResourceAssignment, TaskActual, ChangeOrder, Client } from './types';

// === PROJECTS (5 projects) ===
export const projects: Project[] = [
  {
    ProjectID: 1,
    ClientID: 1, // Acme Property Developers
    ProjectName: 'Downtown Office Renovation',
    ProjectType: 'Renovation',
    Description:
      'Complete interior and exterior refurbishment of a 12-story office tower in Durban CBD. Scope includes HVAC upgrade, energy-efficient lighting, modern glass facade, open-plan workspace redesign, and premium finishes in boardrooms and reception. Focus on sustainability with solar panels and rainwater harvesting. Project aims to achieve 4-star Green Star rating while preserving heritage elements of the original 1980s structure.',
    QuotedCost: 125000.5,
    Status: 'In Progress',
    QuoteDate: '2024-03-15',
    StartDate: '2024-04-01',
    EndDate: '2024-12-31',
  },
  {
    ProjectID: 2,
    ClientID: 2, // Greenleaf Kitchens
    ProjectName: 'Residential Kitchen Remodel',
    ProjectType: 'Residential',
    Description:
      'High-end kitchen transformation in a family home in Durban North. Features include custom solid oak cabinetry, Caesarstone countertops, integrated Smeg appliances, and a central island with breakfast bar. Smart lighting and under-cabinet sensors enhance usability. Bespoke wine rack and hidden pantry maximize storage. Eco-friendly bamboo flooring and low-VOC paints ensure a healthy living environment. Final touch: skylight for natural light.',
    QuotedCost: 45000.0,
    Status: 'Active',
    QuoteDate: '2024-01-20',
    StartDate: '2024-02-01',
    EndDate: '2024-06-30',
  },
  {
    ProjectID: 3,
    ClientID: 3, // Industrial Logistics SA
    ProjectName: 'Commercial Warehouse Expansion',
    ProjectType: 'Industrial',
    Description:
      '40,000 sqm warehouse extension in Cornubia Industrial Park to support growing e-commerce logistics. Includes high-bay racking, automated conveyor systems, loading docks with levelers, and climate-controlled zones for sensitive goods. Energy-efficient design with rooftop solar, LED motion-sensor lighting, and insulated panel walls. Security features: biometric access, 360° CCTV, and perimeter fencing. Meets SANS 10400 standards for fire safety and structural integrity.',
    QuotedCost: 250000.75,
    Status: 'Active',
    QuoteDate: '2024-06-10',
    StartDate: '2024-07-01',
    EndDate: '2025-03-31',
  },
  {
    ProjectID: 4,
    ClientID: 4, // KZN Dept of Education
    ProjectName: 'School Building Construction',
    ProjectType: 'Institutional',
    Description:
      'New 24-classroom primary school in Pietermaritzburg to accommodate 800 learners. Design includes eco-friendly brick construction, solar-powered classrooms, rainwater tanks, and shaded play areas. Facilities: science lab, computer center, library, and multipurpose hall. Universal access with ramps and accessible toilets. Landscaping with indigenous plants promotes environmental education. Project adheres to Department of Basic Education infrastructure norms and safety regulations.',
    QuotedCost: 180000.0,
    Status: 'Not Started',
    QuoteDate: '2024-08-15',
    StartDate: '2024-10-01',
    EndDate: '2025-08-31',
  },
  {
    ProjectID: 5,
    ClientID: 5, // Oceanview Luxury Estates
    ProjectName: 'Luxury Villa Development',
    ProjectType: 'Luxury',
    Description:
      'Exclusive 5-bedroom coastal villa in Umhlanga with panoramic Indian Ocean views. Features infinity pool, home cinema, wine cellar, and smart home automation. Italian marble floors, teak wood accents, and floor-to-ceiling glass create seamless indoor-outdoor flow. Gourmet kitchen with Miele appliances and scullery. Private gym, spa room, and guest suite. Landscaped tropical garden with koi pond. Built to Green Building Council standards with heat pumps and greywater recycling.',
    QuotedCost: 320000.0,
    Status: 'In Progress',
    QuoteDate: '2024-05-01',
    StartDate: '2024-06-01',
    EndDate: '2025-05-31',
  },
];

// === JOBS (Variable 3-5 jobs per project) ===
export const jobs: Job[] = [
  // Project 1: Downtown Office Renovation (4 jobs)
  {
    JobID: 101,
    ProjectID: 1,
    JobName: 'Site Preparation & Demolition',
    JobBudget: 25000.0,
    Status: 'In Progress',
    PlannedStartDate: '2024-04-01',
    PlannedEndDate: '2024-04-10',
    ActualStartDate: '2024-04-01',
    ActualEndDate: null,
  },
  {
    JobID: 102,
    ProjectID: 1,
    JobName: 'Foundation Work',
    JobBudget: 35000.0,
    Status: 'Active',
    PlannedStartDate: '2024-04-11',
    PlannedEndDate: '2024-04-25',
    ActualStartDate: null,
    ActualEndDate: null,
  },
  {
    JobID: 103,
    ProjectID: 1,
    JobName: 'Structural Framing',
    JobBudget: 45000.0,
    Status: 'Not Started',
    PlannedStartDate: '2024-04-26',
    PlannedEndDate: '2024-05-15',
    ActualStartDate: null,
    ActualEndDate: null,
  },
  {
    JobID: 104,
    ProjectID: 1,
    JobName: 'Electrical & Plumbing Rough-in',
    JobBudget: 30000.0,
    Status: 'Not Started',
    PlannedStartDate: '2024-05-16',
    PlannedEndDate: '2024-06-05',
    ActualStartDate: null,
    ActualEndDate: null,
  },

  // Project 2: Residential Kitchen Remodel (3 jobs)
  {
    JobID: 201,
    ProjectID: 2,
    JobName: 'Demolition & Prep',
    JobBudget: 8000.0,
    Status: 'Completed',
    PlannedStartDate: '2024-02-01',
    PlannedEndDate: '2024-02-05',
    ActualStartDate: '2024-02-01',
    ActualEndDate: '2024-02-04',
  },
  {
    JobID: 202,
    ProjectID: 2,
    JobName: 'Cabinet Installation',
    JobBudget: 15000.0,
    Status: 'In Progress',
    PlannedStartDate: '2024-02-06',
    PlannedEndDate: '2024-02-20',
    ActualStartDate: '2024-02-06',
    ActualEndDate: null,
  },
  {
    JobID: 203,
    ProjectID: 2,
    JobName: 'Countertop & Finishing',
    JobBudget: 12000.0,
    Status: 'Not Started',
    PlannedStartDate: '2024-02-21',
    PlannedEndDate: '2024-03-05',
    ActualStartDate: null,
    ActualEndDate: null,
  },

  // Project 3: Commercial Warehouse Expansion (5 jobs)
  {
    JobID: 301,
    ProjectID: 3,
    JobName: 'Site Clearing & Grading',
    JobBudget: 40000.0,
    Status: 'Active',
    PlannedStartDate: '2024-07-01',
    PlannedEndDate: '2024-07-08',
    ActualStartDate: '2024-07-01',
    ActualEndDate: null,
  },
  {
    JobID: 302,
    ProjectID: 3,
    JobName: 'Foundation Pouring',
    JobBudget: 60000.0,
    Status: 'In Progress',
    PlannedStartDate: '2024-07-09',
    PlannedEndDate: '2024-07-25',
    ActualStartDate: '2024-07-09',
    ActualEndDate: null,
  },
  {
    JobID: 303,
    ProjectID: 3,
    JobName: 'Steel Framework Erection',
    JobBudget: 80000.0,
    Status: 'Not Started',
    PlannedStartDate: '2024-07-26',
    PlannedEndDate: '2024-08-20',
    ActualStartDate: null,
    ActualEndDate: null,
  },
  {
    JobID: 304,
    ProjectID: 3,
    JobName: 'Roof Installation',
    JobBudget: 35000.0,
    Status: 'Not Started',
    PlannedStartDate: '2024-08-21',
    PlannedEndDate: '2024-09-05',
    ActualStartDate: null,
    ActualEndDate: null,
  },
  {
    JobID: 305,
    ProjectID: 3,
    JobName: 'Exterior Wall Panels',
    JobBudget: 45000.0,
    Status: 'Not Started',
    PlannedStartDate: '2024-09-06',
    PlannedEndDate: '2024-09-25',
    ActualStartDate: null,
    ActualEndDate: null,
  },

  // Project 4: School Building Construction (3 jobs)
  {
    JobID: 401,
    ProjectID: 4,
    JobName: 'Excavation & Foundation',
    JobBudget: 50000.0,
    Status: 'Not Started',
    PlannedStartDate: '2024-10-01',
    PlannedEndDate: '2024-10-20',
    ActualStartDate: null,
    ActualEndDate: null,
  },
  {
    JobID: 402,
    ProjectID: 4,
    JobName: 'Concrete Structure',
    JobBudget: 70000.0,
    Status: 'Not Started',
    PlannedStartDate: '2024-10-21',
    PlannedEndDate: '2024-12-15',
    ActualStartDate: null,
    ActualEndDate: null,
  },
  {
    JobID: 403,
    ProjectID: 4,
    JobName: 'Brickwork & Roofing',
    JobBudget: 40000.0,
    Status: 'Not Started',
    PlannedStartDate: '2024-12-16',
    PlannedEndDate: '2025-02-28',
    ActualStartDate: null,
    ActualEndDate: null,
  },

  // Project 5: Luxury Villa Development (4 jobs)
  {
    JobID: 501,
    ProjectID: 5,
    JobName: 'Site Preparation',
    JobBudget: 25000.0,
    Status: 'Completed',
    PlannedStartDate: '2024-06-01',
    PlannedEndDate: '2024-06-10',
    ActualStartDate: '2024-06-01',
    ActualEndDate: '2024-06-08',
  },
  {
    JobID: 502,
    ProjectID: 5,
    JobName: 'Foundation & Framing',
    JobBudget: 55000.0,
    Status: 'In Progress',
    PlannedStartDate: '2024-06-11',
    PlannedEndDate: '2024-07-30',
    ActualStartDate: '2024-06-11',
    ActualEndDate: null,
  },
  {
    JobID: 503,
    ProjectID: 5,
    JobName: 'Interior Rough-in',
    JobBudget: 65000.0,
    Status: 'Active',
    PlannedStartDate: '2024-08-01',
    PlannedEndDate: '2024-09-20',
    ActualStartDate: '2024-08-01',
    ActualEndDate: null,
  },
  {
    JobID: 504,
    ProjectID: 5,
    JobName: 'Finishing & Fixtures',
    JobBudget: 45000.0,
    Status: 'Not Started',
    PlannedStartDate: '2024-09-21',
    PlannedEndDate: '2024-11-15',
    ActualStartDate: null,
    ActualEndDate: null,
  },
];

// === TASKS (3 tasks per job) ===
export const tasks: Task[] = [
    // Job 101: Site Preparation & Demolition (Project 1)
    {
        TaskID: 1001,
        JobID: 101,
        TaskName: 'Clear Existing Structure',
        TaskBudget: 8000.0,
        Status: 'Completed',
        PlannedStartDate: '2024-04-01',
        PlannedEndDate: '2024-04-03',
        ActualStartDate: '2024-04-01',
        ActualEndDate: '2024-04-02',
        TaskProgress: 100,
        QuotationRef: 'QUO-2025-9816',  // ← Add this
    },
    {
        TaskID: 1002,
        JobID: 101,
        TaskName: 'Remove Debris',
        TaskBudget: 6000.0,
        Status: 'In Progress',
        PlannedStartDate: '2024-04-04',
        PlannedEndDate: '2024-04-06',
        ActualStartDate: '2024-04-04',
        ActualEndDate: null,
        TaskProgress: 70,
        QuotationRef: 'QUO-2025-9816',  // ← Add this
    },
    {
        TaskID: 1003,
        JobID: 101,
        TaskName: 'Site Survey & Marking',
        TaskBudget: 11000.0,
        Status: 'Not Started',
        PlannedStartDate: '2024-04-07',
        PlannedEndDate: '2024-04-10',
        ActualStartDate: null,
        ActualEndDate: null,
        TaskProgress: 0,
        QuotationRef: 'QUO-2025-9816',  // ← Add this
    },

    // Job 102: Foundation Work (Project 1)
    {
        TaskID: 1004,
        JobID: 102,
        TaskName: 'Excavation',
        TaskBudget: 12000.0,
        Status: 'Active',
        PlannedStartDate: '2024-04-11',
        PlannedEndDate: '2024-04-15',
        ActualStartDate: '2024-04-11',
        ActualEndDate: null,
        TaskProgress: 20,
        QuotationRef: 'QUO-2025-9816',  // ← Add this
    },
    {
        TaskID: 1005,
        JobID: 102,
        TaskName: 'Formwork Installation',
        TaskBudget: 10000.0,
        Status: 'Not Started',
        PlannedStartDate: '2024-04-16',
        PlannedEndDate: '2024-04-20',
        ActualStartDate: null,
        ActualEndDate: null,
        TaskProgress: 0,
        QuotationRef: 'QUO-2025-9816',  // ← Add this
    },
    {
        TaskID: 1006,
        JobID: 102,
        TaskName: 'Concrete Pouring',
        TaskBudget: 13000.0,
        Status: 'Not Started',
        PlannedStartDate: '2024-04-21',
        PlannedEndDate: '2024-04-25',
        ActualStartDate: null,
        ActualEndDate: null,
        TaskProgress: 0,
        QuotationRef: 'QUO-2025-9816',  // ← Add this
    },

    // Job 201: Demolition & Prep (Project 2)
    {
        TaskID: 2001,
        JobID: 201,
        TaskName: 'Remove Cabinets & Fixtures',
        TaskBudget: 3000.0,
        Status: 'Completed',
        PlannedStartDate: '2024-02-01',
        PlannedEndDate: '2024-02-02',
        ActualStartDate: '2024-02-01',
        ActualEndDate: '2024-02-01',
        TaskProgress: 100,
        QuotationRef: 'QUO-2025-9816',  // ← Add this
    },
    {
        TaskID: 2002,
        JobID: 201,
        TaskName: 'Floor Tile Removal',
        TaskBudget: 5000.0,
        Status: 'Completed',
        PlannedStartDate: '2024-02-03',
        PlannedEndDate: '2024-02-05',
        ActualStartDate: '2024-02-02',
        ActualEndDate: '2024-02-04',
        TaskProgress: 100,
        QuotationRef: 'QUO-2025-9816',  // ← Add this
    },
    {
        TaskID: 2003,
        JobID: 201,
        TaskName: 'Wall Patching',
        TaskBudget: 1000.0,
        Status: 'Completed',
        PlannedStartDate: '2024-02-05',
        PlannedEndDate: '2024-02-05',
        ActualStartDate: '2024-02-04',
        ActualEndDate: '2024-02-04',
        TaskProgress: 100,
        QuotationRef: 'QUO-2025-9816',  // ← Add this
    },
    
    // Job 202: Cabinet Installation (Project 2)
    {
        TaskID: 2004,
        JobID: 202,
        TaskName: 'Assemble & Mount Base Units',
        TaskBudget: 6000.0,
        Status: 'In Progress',
        PlannedStartDate: '2024-02-06',
        PlannedEndDate: '2024-02-12',
        ActualStartDate: '2024-02-06',
        ActualEndDate: null,
        TaskProgress: 50,
        QuotationRef: null,  // ← Add this
    },
    {
        TaskID: 2005,
        JobID: 202,
        TaskName: 'Install Wall Cabinets',
        TaskBudget: 5000.0,
        Status: 'Not Started',
        PlannedStartDate: '2024-02-13',
        PlannedEndDate: '2024-02-17',
        ActualStartDate: null,
        ActualEndDate: null,
        TaskProgress: 0,
        QuotationRef: null,  // ← Add this
    },
    {
        TaskID: 2006,
        JobID: 202,
        TaskName: 'Appliance Prep (Electrical/Plumbing)',
        TaskBudget: 4000.0,
        Status: 'Not Started',
        PlannedStartDate: '2024-02-18',
        PlannedEndDate: '2024-02-20',
        ActualStartDate: null,
        ActualEndDate: null,
        TaskProgress: 0,
        QuotationRef: null,  // ← Add this
    },

    // Job 301: Site Clearing & Grading (Project 3)
    {
        TaskID: 3001,
        JobID: 301,
        TaskName: 'Vegetation Removal',
        TaskBudget: 15000.0,
        Status: 'Completed',
        PlannedStartDate: '2024-07-01',
        PlannedEndDate: '2024-07-03',
        ActualStartDate: '2024-07-01',
        ActualEndDate: '2024-07-03',
        TaskProgress: 100,
        QuotationRef: null,  // ← Add this
    },
    {
        TaskID: 3002,
        JobID: 301,
        TaskName: 'Earthwork & Leveling',
        TaskBudget: 25000.0,
        Status: 'Active',
        PlannedStartDate: '2024-07-04',
        PlannedEndDate: '2024-07-08',
        ActualStartDate: '2024-07-04',
        ActualEndDate: null,
        TaskProgress: 60,
        QuotationRef: null,  // ← Add this
    },
    {
        TaskID: 3003,
        JobID: 301,
        TaskName: 'Surveying Checks',
        TaskBudget: 0.0, // Assumed covered by Job budget/overhead
        Status: 'Not Started',
        PlannedStartDate: '2024-07-08',
        PlannedEndDate: '2024-07-08',
        ActualStartDate: null,
        ActualEndDate: null,
        TaskProgress: 0,
        QuotationRef: null,  // ← Add this
    },

    // Job 302: Foundation Pouring (Project 3)
    {
        TaskID: 3004,
        JobID: 302,
        TaskName: 'Trenching & Rebar Setup',
        TaskBudget: 30000.0,
        Status: 'In Progress',
        PlannedStartDate: '2024-07-09',
        PlannedEndDate: '2024-07-15',
        ActualStartDate: '2024-07-09',
        ActualEndDate: null,
        TaskProgress: 40,
        QuotationRef: null,  // ← Add this
    },
    {
        TaskID: 3005,
        JobID: 302,
        TaskName: 'Concrete Ordering & Delivery',
        TaskBudget: 10000.0,
        Status: 'Not Started',
        PlannedStartDate: '2024-07-16',
        PlannedEndDate: '2024-07-18',
        ActualStartDate: null,
        ActualEndDate: null,
        TaskProgress: 0,
        QuotationRef: null,  // ← Add this
    },
    {
        TaskID: 3006,
        JobID: 302,
        TaskName: 'Slab Pour & Curing',
        TaskBudget: 20000.0,
        Status: 'Not Started',
        PlannedStartDate: '2024-07-19',
        PlannedEndDate: '2024-07-25',
        ActualStartDate: null,
        ActualEndDate: null,
        TaskProgress: 0,
        QuotationRef: null,  // ← Add this
    },

    // Job 501: Site Preparation (Project 5)
    {
        TaskID: 5001,
        JobID: 501,
        TaskName: 'Initial Clearing',
        TaskBudget: 10000.0,
        Status: 'Completed',
        PlannedStartDate: '2024-06-01',
        PlannedEndDate: '2024-06-03',
        ActualStartDate: '2024-06-01',
        ActualEndDate: '2024-06-02',
        TaskProgress: 100,
        QuotationRef: null,  // ← Add this
    },
    {
        TaskID: 5002,
        JobID: 501,
        TaskName: 'Perimeter Fencing',
        TaskBudget: 5000.0,
        Status: 'Completed',
        PlannedStartDate: '2024-06-04',
        PlannedEndDate: '2024-06-06',
        ActualStartDate: '2024-06-03',
        ActualEndDate: '2024-06-05',
        TaskProgress: 100,
        QuotationRef: null,  // ← Add this
    },
    {
        TaskID: 5003,
        JobID: 501,
        TaskName: 'Access Road Establishment',
        TaskBudget: 10000.0,
        Status: 'Completed',
        PlannedStartDate: '2024-06-07',
        PlannedEndDate: '2024-06-10',
        ActualStartDate: '2024-06-06',
        ActualEndDate: '2024-06-08',
        TaskProgress: 100,
        QuotationRef: null,  // ← Add this
    },

    // Job 502: Foundation & Framing (Project 5)
    {
        TaskID: 5004,
        JobID: 502,
        TaskName: 'Foundation Excavation',
        TaskBudget: 15000.0,
        Status: 'Completed',
        PlannedStartDate: '2024-06-11',
        PlannedEndDate: '2024-06-18',
        ActualStartDate: '2024-06-11',
        ActualEndDate: '2024-06-17',
        TaskProgress: 100,
        QuotationRef: null,  // ← Add this
    },
    {
        TaskID: 5005,
        JobID: 502,
        TaskName: 'Slab Foundation Pour',
        TaskBudget: 25000.0,
        Status: 'In Progress',
        PlannedStartDate: '2024-06-19',
        PlannedEndDate: '2024-06-30',
        ActualStartDate: '2024-06-18',
        ActualEndDate: null,
        TaskProgress: 60,
        QuotationRef: null,  // ← Add this
    },
    {
        TaskID: 5006,
        JobID: 502,
        TaskName: 'Structural Framing Erection',
        TaskBudget: 15000.0,
        Status: 'Not Started',
        PlannedStartDate: '2024-07-01',
        PlannedEndDate: '2024-07-30',
        ActualStartDate: null,
        ActualEndDate: null,
        TaskProgress: 0,
        QuotationRef: null,  // ← Add this
    },

    // Placeholder Tasks for remaining Jobs (103, 104, 203, 303-305, 401-403, 503, 504)
    // Note: In a full dataset, every job would have 3 unique tasks defined here.
    { TaskID: 9000, JobID: 103, TaskName: 'Placeholder Task A', TaskBudget: 1.0, Status: 'Not Started', PlannedStartDate: '2024-04-26', PlannedEndDate: '2024-04-28', ActualStartDate: null, ActualEndDate: null, TaskProgress: 0, },
    { TaskID: 9001, JobID: 103, TaskName: 'Placeholder Task B', TaskBudget: 1.0, Status: 'Not Started', PlannedStartDate: '2024-04-29', PlannedEndDate: '2024-05-02', ActualStartDate: null, ActualEndDate: null, TaskProgress: 0, },
    { TaskID: 9002, JobID: 103, TaskName: 'Placeholder Task C', TaskBudget: 1.0, Status: 'Not Started', PlannedStartDate: '2024-05-03', PlannedEndDate: '2024-05-06', ActualStartDate: null, ActualEndDate: null, TaskProgress: 0, },
    { TaskID: 9003, JobID: 104, TaskName: 'Placeholder Task D', TaskBudget: 1.0, Status: 'Not Started', PlannedStartDate: '2024-05-16', PlannedEndDate: '2024-05-18', ActualStartDate: null, ActualEndDate: null, TaskProgress: 0, },
    // ... rest of the 19 jobs * 3 tasks = 57 tasks total
];

// === EMPLOYEES (with realistic pay rates) ===
export const employees: Employee[] = [
  // General Workers (R180/day)
  { EmployeeID: 1, Name: 'John Smith', Position: 'General Worker', DailyRate: 180.0 },
  { EmployeeID: 2, Name: 'Mike Johnson', Position: 'General Worker', DailyRate: 180.0 },
  { EmployeeID: 3, Name: 'Sarah Wilson', Position: 'General Worker', DailyRate: 180.0 },
  { EmployeeID: 4, Name: 'David Brown', Position: 'General Worker', DailyRate: 180.0 },
  { EmployeeID: 5, Name: 'Lisa Davis', Position: 'General Worker', DailyRate: 180.0 },

  // Skilled Labor (R350/day)
  { EmployeeID: 6, Name: 'Robert Garcia', Position: 'Skilled Labor', DailyRate: 350.0 },
  { EmployeeID: 7, Name: 'Emily Rodriguez', Position: 'Skilled Labor', DailyRate: 350.0 },
  { EmployeeID: 8, Name: 'James Martinez', Position: 'Skilled Labor', DailyRate: 350.0 },
  { EmployeeID: 9, Name: 'Anna Lee', Position: 'Skilled Labor', DailyRate: 350.0 },

  // Bricklayers (R450/day)
  { EmployeeID: 10, Name: 'Carlos Hernandez', Position: 'Bricklayer', DailyRate: 450.0 },
  { EmployeeID: 11, Name: 'Maria Gonzalez', Position: 'Bricklayer', DailyRate: 450.0 },
  { EmployeeID: 12, Name: 'Peter Wong', Position: 'Bricklayer', DailyRate: 450.0 },

  // Experienced Workers (R550/day)
  { EmployeeID: 13, Name: 'Thomas Anderson', Position: 'Experienced', DailyRate: 550.0 },
  { EmployeeID: 14, Name: 'Jennifer White', Position: 'Experienced', DailyRate: 550.0 },
  { EmployeeID: 15, Name: 'Michael Chen', Position: 'Experienced', DailyRate: 550.0 },
];

// === RESOURCE ASSIGNMENTS (Day-by-day allocation) ===
export const resourceAssignments: ResourceAssignment[] = [
  // Task 1001: Clear Existing Structure (3 General Workers, Days 1-2)
  {
    AssignmentID: 1,
    TaskID: 1001,
    EmployeeID: 1,
    Date: '2024-04-01',
    Hours: 8,
  },
  {
    AssignmentID: 2,
    TaskID: 1001,
    EmployeeID: 2,
    Date: '2024-04-01',
    Hours: 8,
  },
  {
    AssignmentID: 3,
    TaskID: 1001,
    EmployeeID: 3,
    Date: '2024-04-01',
    Hours: 8,
  },
  {
    AssignmentID: 4,
    TaskID: 1001,
    EmployeeID: 1,
    Date: '2024-04-02',
    Hours: 8,
  },
  {
    AssignmentID: 5,
    TaskID: 1001,
    EmployeeID: 2,
    Date: '2024-04-02',
    Hours: 8,
  },
  {
    AssignmentID: 6,
    TaskID: 1001,
    EmployeeID: 3,
    Date: '2024-04-02',
    Hours: 8,
  },

  // Task 1002: Remove Debris (2 General + 1 Skilled, Days 1-3, with change on Day 3)
  {
    AssignmentID: 7,
    TaskID: 1002,
    EmployeeID: 4,
    Date: '2024-04-04',
    Hours: 8,
  },
  {
    AssignmentID: 8,
    TaskID: 1002,
    EmployeeID: 5,
    Date: '2024-04-04',
    Hours: 8,
  },
  {
    AssignmentID: 9,
    TaskID: 1002,
    EmployeeID: 6,
    Date: '2024-04-04',
    Hours: 8,
  },
  {
    AssignmentID: 10,
    TaskID: 1002,
    EmployeeID: 4,
    Date: '2024-04-05',
    Hours: 8,
  },
  {
    AssignmentID: 11,
    TaskID: 1002,
    EmployeeID: 5,
    Date: '2024-04-05',
    Hours: 8,
  },
  {
    AssignmentID: 12,
    TaskID: 1002,
    EmployeeID: 6,
    Date: '2024-04-05',
    Hours: 8,
  },
  {
    AssignmentID: 13,
    TaskID: 1002,
    EmployeeID: 4,
    Date: '2024-04-06',
    Hours: 8,
  },
  {
    AssignmentID: 14,
    TaskID: 1002,
    EmployeeID: 7,
    Date: '2024-04-06',
    Hours: 8,
  }, // Change: Skilled 2
  {
    AssignmentID: 15,
    TaskID: 1002,
    EmployeeID: 8,
    Date: '2024-04-06',
    Hours: 8,
  }, // Change: Skilled 3

  // Task 1004: Excavation (4 General Workers, Day 1) - Active
  {
    AssignmentID: 16,
    TaskID: 1004,
    EmployeeID: 1,
    Date: '2024-04-11',
    Hours: 8,
  },
  {
    AssignmentID: 17,
    TaskID: 1004,
    EmployeeID: 2,
    Date: '2024-04-11',
    Hours: 8,
  },
  {
    AssignmentID: 18,
    TaskID: 1004,
    EmployeeID: 4,
    Date: '2024-04-11',
    Hours: 8,
  },
  {
    AssignmentID: 19,
    TaskID: 1004,
    EmployeeID: 5,
    Date: '2024-04-11',
    Hours: 8,
  },

  // Task 3004: Trenching & Rebar Setup (3 Skilled, Day 1) - In Progress
  {
    AssignmentID: 20,
    TaskID: 3004,
    EmployeeID: 6,
    Date: '2024-07-09',
    Hours: 8,
  },
  {
    AssignmentID: 21,
    TaskID: 3004,
    EmployeeID: 7,
    Date: '2024-07-09',
    Hours: 8,
  },
  {
    AssignmentID: 22,
    TaskID: 3004,
    EmployeeID: 8,
    Date: '2024-07-09',
    Hours: 8,
  },

  // Task 5005: Slab Foundation Pour (1 Experienced, 2 Skilled, Day 1) - In Progress
  {
    AssignmentID: 23,
    TaskID: 5005,
    EmployeeID: 13,
    Date: '2024-06-18',
    Hours: 8,
  },
  {
    AssignmentID: 24,
    TaskID: 5005,
    EmployeeID: 6,
    Date: '2024-06-18',
    Hours: 8,
  },
  {
    AssignmentID: 25,
    TaskID: 5005,
    EmployeeID: 7,
    Date: '2024-06-18',
    Hours: 8,
  },

  // ... Add assignments for all 57 tasks (3 per job × 19 jobs)
];

// === TASK ACTUAL COSTS ===
export const taskActuals: TaskActual[] = [
  {
    ActualID: 1,
    TaskID: 1001,
    Date: '2024-04-02',
    Cost: 1080.0,
    Notes: 'Demolition completed',
  }, // 3 workers × R180 × 2 days
  {
    ActualID: 2,
    TaskID: 1002,
    Date: '2024-04-04',
    Cost: 860.0,
    Notes: 'Partial debris removal. Day 1 cost: (2 x R180) + (1 x R350) = R710. Note: Original mock data calculation error fixed.',
  }, 
  {
    ActualID: 3,
    TaskID: 1002,
    Date: '2024-04-05',
    Cost: 860.0,
    Notes: 'Continued removal. Day 2 cost: (2 x R180) + (1 x R350) = R710. Total cost so far (ActualID 2+3): R1720.',
  },
  {
    ActualID: 4,
    TaskID: 1002,
    Date: '2024-04-06',
    Cost: 880.0,
    Notes: 'Day 3 cost: (1 x R180) + (2 x R350) = R880. Total cost so far: R1720 + R880 = R2600.',
  }, 

  // Task 1004: Excavation (Active)
  {
    ActualID: 5,
    TaskID: 1004,
    Date: '2024-04-11',
    Cost: 720.0,
    Notes: 'Day 1 cost: 4 x R180',
  },

  // Task 5004: Foundation Excavation (Completed)
  {
    ActualID: 6,
    TaskID: 5004,
    Date: '2024-06-17',
    Cost: 3600.0,
    Notes: 'Total cost for 5 days of 4 General Workers (4 * R180 * 5 days).',
  },

  // Task 2001: Remove Cabinets & Fixtures (Completed)
  {
    ActualID: 7,
    TaskID: 2001,
    Date: '2024-02-01',
    Cost: 500.0,
    Notes: 'Disposal fee for old cabinetry.',
  },

  // ... Add actuals for other completed/active tasks
];

export const changeOrders: ChangeOrder[] = [
{
  ChangeOrderID:1,
  ProjectID:1,
  Description:'HVAC unit upgrade to higher efficiency model',
  CostImpact: 1500,
  DateIssued: '2024-05-10',
  Status: 'Approved',
},
{
  ChangeOrderID:2,
  ProjectID:1,
  Description:'Add additional electrical outlets in boardroom suite',
  CostImpact: 2500,
  DateIssued: '2024-06-10',
  Status: 'Pending',
},
{
  ChangeOrderID:3,
  ProjectID:3,
  Description:'Increase ceiling height allowance by 0.5m in Section C',
  CostImpact: 15000,
  DateIssued: '2024-07-20',
  Status: 'In Review',
},
];

// === CLIENTS (one per project) ===
export const clients: Client[] = [
  {
    ClientID: 1,
    ClientName: 'Acme Property Developers',
    ContactPerson: 'Sarah Johnson',
    Email: 'sarah@acmeprop.co.za',
    Phone: '+27 31 312 4500',
    Address: '14th Floor, Marine Building, 22 Dorothy Nyembe St, Durban CBD, 4001',
    BillingAddress: 'PO Box 1827, Durban, 4000',
  },
  {
    ClientID: 2,
    ClientName: 'Greenleaf Kitchens',
    ContactPerson: 'Michael Chen',
    Email: 'mike@greenleafkitchens.co.za',
    Phone: '+27 31 564 3210',
    Address: 'Unit 5, Riverhorse Valley Estate, 12 Riverhorse Close, Durban North, 4051',
    BillingAddress: 'Same as physical address',
  },
  {
    ClientID: 3,
    ClientName: 'Industrial Logistics SA',
    ContactPerson: 'David Naidoo',
    Email: 'david@industriallogistics.co.za',
    Phone: '+27 31 700 8900',
    Address: 'Plot 22, Cornubia Industrial Park, Cornubia, 4302',
    BillingAddress: 'PO Box 3012, Mount Edgecombe, 4301',
  },
  {
    ClientID: 4,
    ClientName: 'KwaZulu-Natal Department of Education',
    ContactPerson: 'Nomusa Mthembu',
    Email: 'nomusa.mthembu@kzneducation.gov.za',
    Phone: '+27 33 846 5000',
    Address: '228 Pietermaritz St, Pietermaritzburg, 3201',
    BillingAddress: 'Private Bag X9137, Pietermaritzburg, 3200',
  },
  {
    ClientID: 5,
    ClientName: 'Oceanview Luxury Estates',
    ContactPerson: 'Richard van der Merwe',
    Email: 'richard@oceanviewestates.co.za',
    Phone: '+27 31 561 7200',
    Address: 'Palm Boulevard, Umhlanga Ridge, Durban, 4319',
    BillingAddress: 'PO Box 2015, Umhlanga Rocks, 4320',
  },
];