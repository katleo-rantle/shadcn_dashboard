export const projects = [
  {
    ProjectID: 1,
    ProjectName: 'Downtown Office Renovation',
    QuotedCost: 125000.5,
    Status: 'Active',
    QuoteDate: '2024-03-15',
    Jobs: [
      {
        JobID: 101,
        JobName: 'Electrical Wiring',
        StartDate: '2024-04-01',
      },
      {
        JobID: 102,
        JobName: 'Plumbing Installation',
        StartDate: '2024-04-10',
      },
    ],
    ChangeOrders: [
      {
        ChangeOrderID: 201,
        Description: 'Additional Lighting Fixtures',
        CostAdjustment: 5000.0,
        Date: '2024-05-01',
      },
    ],
  },
  {
    ProjectID: 2,
    ProjectName: 'Residential Kitchen Remodel',
    QuotedCost: 45000.0,
    Status: 'Completed',
    QuoteDate: '2024-01-20',
    Jobs: [
      {
        JobID: 103,
        JobName: 'Cabinet Installation',
        StartDate: '2024-02-15',
      },
    ],
    ChangeOrders: [],
  },
  {
    ProjectID: 3,
    ProjectName: 'Commercial Warehouse Expansion',
    QuotedCost: 250000.75,
    Status: 'In Progress',
    QuoteDate: '2024-06-10',
    Jobs: [
      {
        JobID: 104,
        JobName: 'Foundation Work',
        StartDate: '2024-07-01',
      },
      {
        JobID: 105,
        JobName: 'Structural Steel',
        StartDate: '2024-07-15',
      },
    ],
    ChangeOrders: [
      {
        ChangeOrderID: 202,
        Description: 'Extended Roof Area',
        CostAdjustment: 15000.0,
        Date: '2024-08-05',
      },
    ],
  },
  {
    ProjectID: 4,
    ProjectName: 'Commercial Office Renovation',
    QuotedCost: 480000.75,
    Status: 'Not started',
    QuoteDate: '2024-06-10',
    Jobs: [
      {
        JobID: 104,
        JobName: 'Foundation Work',
        StartDate: '2024-07-01',
      },
      {
        JobID: 105,
        JobName: 'Structural Steel',
        StartDate: '2024-07-15',
      },
    ],
    ChangeOrders: [
      {
        ChangeOrderID: 202,
        Description: 'Extended Roof Area',
        CostAdjustment: 15000.0,
        Date: '2024-08-05',
      },
    ],
  },
];

const Jobs = [
  {
    JobID: 101,
    ProjectID: 1,
    JobName: 'Electrical Wiring',
    JobBudget: 25000.0,
    Status: 'In Progress',
    TASKs: [
      {
        TaskID: 1001,
        TaskName: 'Install Main Panel',
        DueDate: '2024-04-15',
      },
      {
        TaskID: 1002,
        TaskName: 'Wire Outlets',
        DueDate: '2024-04-20',
      },
    ],
    INVOICEs: [
      {
        InvoiceID: 3001,
        Amount: 8000.0,
        Date: '2024-04-05',
      },
    ],
  },
  {
    JobID: 102,
    ProjectID: 1,
    JobName: 'Plumbing Installation',
    JobBudget: 18000.0,
    Status: 'Active',
    TASKs: [
      {
        TaskID: 1003,
        TaskName: 'Lay Pipes',
        DueDate: '2024-04-25',
      },
      {
        TaskID: 1004,
        TaskName: 'Install Fixtures',
        DueDate: '2024-05-01',
      },
    ],
    INVOICEs: [
      {
        InvoiceID: 3002,
        Amount: 5000.0,
        Date: '2024-04-12',
      },
    ],
  },
  {
    JobID: 103,
    ProjectID: 2,
    JobName: 'Cabinet Installation',
    JobBudget: 12000.0,
    Status: 'Completed',
    TASKs: [
      {
        TaskID: 1005,
        TaskName: 'Measure and Cut',
        DueDate: '2024-02-20',
      },
      {
        TaskID: 1006,
        TaskName: 'Assemble and Install',
        DueDate: '2024-02-28',
      },
    ],
    INVOICEs: [
      {
        InvoiceID: 3003,
        Amount: 12000.0,
        Date: '2024-03-01',
      },
    ],
  },
  {
    JobID: 104,
    ProjectID: 3,
    JobName: 'Foundation Work',
    JobBudget: 60000.0,
    Status: 'In Progress',
    TASKs: [
      {
        TaskID: 1007,
        TaskName: 'Excavate Site',
        DueDate: '2024-07-10',
      },
      {
        TaskID: 1008,
        TaskName: 'Pour Concrete',
        DueDate: '2024-07-20',
      },
    ],
    INVOICEs: [
      {
        InvoiceID: 3004,
        Amount: 20000.0,
        Date: '2024-07-05',
      },
    ],
  },
  {
    JobID: 105,
    ProjectID: 3,
    JobName: 'Structural Steel',
    JobBudget: 45000.0,
    Status: 'Active',
    TASKs: [
      {
        TaskID: 1009,
        TaskName: 'Fabricate Beams',
        DueDate: '2024-07-25',
      },
      {
        TaskID: 1010,
        TaskName: 'Erect Framework',
        DueDate: '2024-08-10',
      },
    ],
    INVOICEs: [
      {
        InvoiceID: 3005,
        Amount: 15000.0,
        Date: '2024-07-18',
      },
    ],
  },
];

const task = [
  {
    TaskID: 1001,
    JobID: 101,
    TaskName: 'Install Main Panel',
    TaskBudget: 5000.0,
    Status: 'In Progress',
    TASK_PROGRESS: [
      {
        ProgressID: 4001,
        Date: '2024-04-10',
        Percentage: 50,
        Notes: 'Panel mounted and wired halfway',
      },
    ],
    MATERIALS: [
      {
        MaterialID: 5001,
        Name: 'Electrical Panel',
        Quantity: 1,
        Cost: 1200.0,
      },
      {
        MaterialID: 5002,
        Name: 'Wires',
        Quantity: 100,
        Cost: 500.0,
      },
    ],
    TASK_PHOTOs: [
      {
        PhotoID: 6001,
        Url: 'https://example.com/photos/task1001_01.jpg',
        DateTaken: '2024-04-10',
      },
    ],
  },
  {
    TaskID: 1002,
    JobID: 101,
    TaskName: 'Wire Outlets',
    TaskBudget: 3000.0,
    Status: 'Not Started',
    TASK_PROGRESS: [],
    MATERIALS: [
      {
        MaterialID: 5003,
        Name: 'Outlet Boxes',
        Quantity: 20,
        Cost: 200.0,
      },
    ],
    TASK_PHOTOs: [],
  },
  {
    TaskID: 1003,
    JobID: 102,
    TaskName: 'Lay Pipes',
    TaskBudget: 4000.0,
    Status: 'Completed',
    TASK_PROGRESS: [
      {
        ProgressID: 4002,
        Date: '2024-04-20',
        Percentage: 100,
        Notes: 'All pipes laid and tested',
      },
    ],
    MATERIALS: [
      {
        MaterialID: 5004,
        Name: 'PVC Pipes',
        Quantity: 50,
        Cost: 800.0,
      },
    ],
    TASK_PHOTOs: [
      {
        PhotoID: 6002,
        Url: 'https://example.com/photos/task1003_01.jpg',
        DateTaken: '2024-04-20',
      },
    ],
  },
  {
    TaskID: 1004,
    JobID: 102,
    TaskName: 'Install Fixtures',
    TaskBudget: 2500.0,
    Status: 'In Progress',
    TASK_PROGRESS: [
      {
        ProgressID: 4003,
        Date: '2024-04-28',
        Percentage: 70,
        Notes: 'Sinks installed, faucets pending',
      },
    ],
    MATERIALS: [
      {
        MaterialID: 5005,
        Name: 'Sinks',
        Quantity: 5,
        Cost: 750.0,
      },
    ],
    TASK_PHOTOs: [
      {
        PhotoID: 6003,
        Url: 'https://example.com/photos/task1004_01.jpg',
        DateTaken: '2024-04-28',
      },
    ],
  },
  {
    TaskID: 1005,
    JobID: 103,
    TaskName: 'Measure and Cut',
    TaskBudget: 2000.0,
    Status: 'Completed',
    TASK_PROGRESS: [
      {
        ProgressID: 4004,
        Date: '2024-02-18',
        Percentage: 100,
        Notes: 'All measurements taken and cuts made',
      },
    ],
    MATERIALS: [
      {
        MaterialID: 5006,
        Name: 'Measuring Tape',
        Quantity: 2,
        Cost: 50.0,
      },
    ],
    TASK_PHOTOs: [],
  },
  {
    TaskID: 1006,
    JobID: 103,
    TaskName: 'Assemble and Install',
    TaskBudget: 3500.0,
    Status: 'Completed',
    TASK_PROGRESS: [
      {
        ProgressID: 4005,
        Date: '2024-02-25',
        Percentage: 100,
        Notes: 'Cabinets fully installed',
      },
    ],
    MATERIALS: [
      {
        MaterialID: 5007,
        Name: 'Cabinets',
        Quantity: 10,
        Cost: 2000.0,
      },
    ],
    TASK_PHOTOs: [
      {
        PhotoID: 6004,
        Url: 'https://example.com/photos/task1006_01.jpg',
        DateTaken: '2024-02-25',
      },
    ],
  },
  {
    TaskID: 1007,
    JobID: 104,
    TaskName: 'Excavate Site',
    TaskBudget: 10000.0,
    Status: 'In Progress',
    TASK_PROGRESS: [
      {
        ProgressID: 4006,
        Date: '2024-07-08',
        Percentage: 40,
        Notes: 'Excavation ongoing',
      },
    ],
    MATERIALS: [
      {
        MaterialID: 5008,
        Name: 'Excavation Tools',
        Quantity: 5,
        Cost: 1500.0,
      },
    ],
    TASK_PHOTOs: [
      {
        PhotoID: 6005,
        Url: 'https://example.com/photos/task1007_01.jpg',
        DateTaken: '2024-07-08',
      },
    ],
  },
  {
    TaskID: 1008,
    JobID: 104,
    TaskName: 'Pour Concrete',
    TaskBudget: 15000.0,
    Status: 'Not Started',
    TASK_PROGRESS: [],
    MATERIALS: [
      {
        MaterialID: 5009,
        Name: 'Concrete Mix',
        Quantity: 200,
        Cost: 8000.0,
      },
    ],
    TASK_PHOTOs: [],
  },
  {
    TaskID: 1009,
    JobID: 105,
    TaskName: 'Fabricate Beams',
    TaskBudget: 8000.0,
    Status: 'Active',
    TASK_PROGRESS: [
      {
        ProgressID: 4007,
        Date: '2024-07-20',
        Percentage: 60,
        Notes: 'Beams partially fabricated',
      },
    ],
    MATERIALS: [
      {
        MaterialID: 5010,
        Name: 'Steel Beams',
        Quantity: 15,
        Cost: 3000.0,
      },
    ],
    TASK_PHOTOs: [],
  },
  {
    TaskID: 1010,
    JobID: 105,
    TaskName: 'Erect Framework',
    TaskBudget: 12000.0,
    Status: 'Not Started',
    TASK_PROGRESS: [],
    MATERIALS: [
      {
        MaterialID: 5011,
        Name: 'Bolts and Nuts',
        Quantity: 500,
        Cost: 1000.0,
      },
    ],
    TASK_PHOTOs: [],
  },
  {
    TaskID: 1011,
    JobID: 101,
    TaskName: 'Test Electrical System',
    TaskBudget: 1500.0,
    Status: 'Not Started',
    TASK_PROGRESS: [],
    MATERIALS: [
      {
        MaterialID: 5012,
        Name: 'Testing Equipment',
        Quantity: 1,
        Cost: 800.0,
      },
    ],
    TASK_PHOTOs: [],
  },
  {
    TaskID: 1012,
    JobID: 102,
    TaskName: 'Pressure Test Pipes',
    TaskBudget: 1000.0,
    Status: 'Completed',
    TASK_PROGRESS: [
      {
        ProgressID: 4008,
        Date: '2024-04-22',
        Percentage: 100,
        Notes: 'All tests passed',
      },
    ],
    MATERIALS: [],
    TASK_PHOTOs: [
      {
        PhotoID: 6006,
        Url: 'https://example.com/photos/task1012_01.jpg',
        DateTaken: '2024-04-22',
      },
    ],
  },
];

const TASK_CATALOGUE = [
  {
    CatalogueItemID: 1,
    ItemDescription: 'Installation of standard wooden door',
    DefaultRate: 950,
    UnitOfMeasure: 'per item',
    Category: 'Carpentry',
  },
  {
    CatalogueItemID: 2,
    ItemDescription: 'Basic electrical wiring for outlets',
    DefaultRate: 150,
    UnitOfMeasure: 'per outlet',
    Category: 'Electrical',
  },
  {
    CatalogueItemID: 3,
    ItemDescription: 'PVC pipe laying and jointing',
    DefaultRate: 80,
    UnitOfMeasure: 'per meter',
    Category: 'Plumbing',
  },
  {
    CatalogueItemID: 4,
    ItemDescription: 'Concrete pouring for foundation',
    DefaultRate: 1200,
    UnitOfMeasure: 'per cubic meter',
    Category: 'Masonry',
  },
  {
    CatalogueItemID: 5,
    ItemDescription: 'Cabinet assembly and installation',
    DefaultRate: 450,
    UnitOfMeasure: 'per unit',
    Category: 'Carpentry',
  },
  {
    CatalogueItemID: 6,
    ItemDescription: 'Structural steel beam fabrication',
    DefaultRate: 2500,
    UnitOfMeasure: 'per beam',
    Category: 'Metalwork',
  },
  {
    CatalogueItemID: 7,
    ItemDescription: 'Site excavation for foundation',
    DefaultRate: 300,
    UnitOfMeasure: 'per cubic meter',
    Category: 'Earthworks',
  },
  {
    CatalogueItemID: 8,
    ItemDescription: 'Electrical panel installation and testing',
    DefaultRate: 2000,
    UnitOfMeasure: 'per panel',
    Category: 'Electrical',
  },
  {
    CatalogueItemID: 9,
    ItemDescription: 'Plumbing fixture installation (sinks)',
    DefaultRate: 350,
    UnitOfMeasure: 'per fixture',
    Category: 'Plumbing',
  },
  {
    CatalogueItemID: 10,
    ItemDescription: 'Pressure testing of pipe systems',
    DefaultRate: 500,
    UnitOfMeasure: 'per system',
    Category: 'Plumbing',
  },
  {
    CatalogueItemID: 11,
    ItemDescription: 'Painting and finishing walls',
    DefaultRate: 25,
    UnitOfMeasure: 'per square meter',
    Category: 'Finishing',
  },
  {
    CatalogueItemID: 12,
    ItemDescription: 'Roofing sheet installation',
    DefaultRate: 180,
    UnitOfMeasure: 'per square meter',
    Category: 'Roofing',
  },
  {
    CatalogueItemID: 13,
    ItemDescription: 'Tile laying for floors',
    DefaultRate: 120,
    UnitOfMeasure: 'per square meter',
    Category: 'Finishing',
  },
  {
    CatalogueItemID: 14,
    ItemDescription: 'Window frame installation',
    DefaultRate: 750,
    UnitOfMeasure: 'per window',
    Category: 'Carpentry',
  },
  {
    CatalogueItemID: 15,
    ItemDescription: 'Lighting fixture mounting',
    DefaultRate: 200,
    UnitOfMeasure: 'per fixture',
    Category: 'Electrical',
  },
];

const CHANGE_ORDER = [
  {
    ChangeOrderID: 201,
    ProjectID: 1,
    Description: 'Additional Lighting Fixtures',
    CostImpact: 5000.0,
  },
  {
    ChangeOrderID: 202,
    ProjectID: 3,
    Description: 'Extended Roof Area',
    CostImpact: 15000.0,
  },
  {
    ChangeOrderID: 203,
    ProjectID: 1,
    Description: 'Upgrade to LED Lighting System',
    CostImpact: 3000.0,
  },
  {
    ChangeOrderID: 204,
    ProjectID: 2,
    Description: 'Change to Quartz Countertops',
    CostImpact: 2500.0,
  },
  {
    ChangeOrderID: 205,
    ProjectID: 3,
    Description: 'Additional Structural Supports',
    CostImpact: 8000.0,
  },
  {
    ChangeOrderID: 206,
    ProjectID: 1,
    Description: 'Extra Electrical Outlets',
    CostImpact: 1200.0,
  },
];

const invoice = [
  {
    InvoiceID: 3001,
    JobID: 101,
    AmountDue: 8000.0,
    PaymentStatus: 'Partially Paid',
    PAYMENTs: [
      {
        PaymentID: 7001,
        Amount: 4000.0,
        PaymentDate: '2024-04-15',
        Method: 'Bank Transfer',
      },
      {
        PaymentID: 7002,
        Amount: 2000.0,
        PaymentDate: '2024-05-01',
        Method: 'Credit Card',
      },
    ],
  },
  {
    InvoiceID: 3002,
    JobID: 102,
    AmountDue: 5000.0,
    PaymentStatus: 'Paid',
    PAYMENTs: [
      {
        PaymentID: 7003,
        Amount: 5000.0,
        PaymentDate: '2024-04-20',
        Method: 'Bank Transfer',
      },
    ],
  },
  {
    InvoiceID: 3003,
    JobID: 103,
    AmountDue: 12000.0,
    PaymentStatus: 'Paid',
    PAYMENTs: [
      {
        PaymentID: 7004,
        Amount: 6000.0,
        PaymentDate: '2024-03-05',
        Method: 'Check',
      },
      {
        PaymentID: 7005,
        Amount: 6000.0,
        PaymentDate: '2024-03-10',
        Method: 'Bank Transfer',
      },
    ],
  },
  {
    InvoiceID: 3004,
    JobID: 104,
    AmountDue: 20000.0,
    PaymentStatus: 'Unpaid',
    PAYMENTs: [],
  },
  {
    InvoiceID: 3005,
    JobID: 105,
    AmountDue: 15000.0,
    PaymentStatus: 'Partially Paid',
    PAYMENTs: [
      {
        PaymentID: 7006,
        Amount: 7500.0,
        PaymentDate: '2024-07-25',
        Method: 'Bank Transfer',
      },
    ],
  },
  {
    InvoiceID: 3006,
    JobID: 101,
    AmountDue: 3500.0,
    PaymentStatus: 'Unpaid',
    PAYMENTs: [],
  },
  {
    InvoiceID: 3007,
    JobID: 103,
    AmountDue: 2500.0,
    PaymentStatus: 'Paid',
    PAYMENTs: [
      {
        PaymentID: 7007,
        Amount: 2500.0,
        PaymentDate: '2024-03-15',
        Method: 'Credit Card',
      },
    ],
  },
  {
    InvoiceID: 3008,
    JobID: 104,
    AmountDue: 10000.0,
    PaymentStatus: 'Partially Paid',
    PAYMENTs: [
      {
        PaymentID: 7008,
        Amount: 5000.0,
        PaymentDate: '2024-07-30',
        Method: 'Check',
      },
    ],
  },
];
