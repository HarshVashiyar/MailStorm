// Dummy data utility for MailStorm admin when no real data is available

export const generateDummyUsers = () => [
  {
    _id: 'dummy-user-1',
    fullName: 'Alexandra Chen',
    userName: 'alexchen',
    email: 'alexandra.chen@techcorp.com',
    role: 'User',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    _id: 'dummy-user-2',
    fullName: 'Marcus Rodriguez',
    userName: 'mrodriguez',
    email: 'marcus.rodriguez@innovate.io',
    role: 'User',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-15'),
  },
  {
    _id: 'dummy-user-3',
    fullName: 'Sarah Kim',
    userName: 'sarahkim',
    email: 'sarah.kim@startup.dev',
    role: 'Admin',
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-03-10'),
  },
  {
    _id: 'dummy-user-4',
    fullName: 'David Thompson',
    userName: 'dthompson',
    email: 'david.thompson@enterprise.com',
    role: 'User',
    createdAt: new Date('2024-03-20'),
    updatedAt: new Date('2024-03-25'),
  }
];

export const generateDummyCompanies = () => [
  {
    _id: 'dummy-company-1',
    companyName: 'TechFlow Innovations',
    companyAddress: '1200 Tech Hub Drive, Austin',
    companyCountry: 'United States',
    companyEmail: 'hello@techflow.io',
    companyPhone: '+1-512-555-0100',
    companyContactPersonName: 'Emma Richardson',
    companyContactPersonPhone: '+1-512-555-0101',
    companyWebsite: 'https://techflow.io',
    companyProductGroup: ['SaaS Platforms', 'API Development', 'Cloud Infrastructure'],
    companyNotes: 'Leading B2B SaaS company specializing in workflow automation and API integrations. Key client in the enterprise segment.',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    _id: 'dummy-company-2',
    companyName: 'GreenTech Solutions',
    companyAddress: '500 Sustainable Way, Portland',
    companyCountry: 'United States',
    companyEmail: 'contact@greentech-solutions.com',
    companyPhone: '+1-503-555-0200',
    companyContactPersonName: 'Michael Zhang',
    companyContactPersonPhone: '+1-503-555-0201',
    companyWebsite: 'https://greentech-solutions.com',
    companyProductGroup: ['Solar Energy', 'Smart Grid Tech', 'Battery Systems', 'IoT Sensors'],
    companyNotes: 'Innovative green technology company focused on renewable energy solutions. Strong growth potential and environmentally conscious.',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-25'),
  },
  {
    _id: 'dummy-company-3',
    companyName: 'DataVault Analytics',
    companyAddress: '750 Data Center Blvd, Seattle',
    companyCountry: 'United States',
    companyEmail: 'info@datavault.tech',
    companyPhone: '+1-206-555-0300',
    companyContactPersonName: 'Lisa Park',
    companyContactPersonPhone: '+1-206-555-0301',
    companyWebsite: 'https://datavault.tech',
    companyProductGroup: ['Big Data Analytics', 'Machine Learning', 'Data Visualization', 'Business Intelligence'],
    companyNotes: 'Data analytics powerhouse serving Fortune 500 companies. Expertise in ML/AI solutions and real-time data processing.',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-10'),
  },
  {
    _id: 'dummy-company-4',
    companyName: 'CreativeStudio Pro',
    companyAddress: '300 Design District Ave, Los Angeles',
    companyCountry: 'United States',
    companyEmail: 'team@creativestudiopro.com',
    companyPhone: '+1-323-555-0400',
    companyContactPersonName: 'Jordan Williams',
    companyContactPersonPhone: '+1-323-555-0401',
    companyWebsite: 'https://creativestudiopro.com',
    companyProductGroup: ['Brand Design', 'Digital Marketing', 'Video Production', 'Web Development'],
    companyNotes: 'Full-service creative agency with impressive portfolio. Works with entertainment industry and tech startups.',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-20'),
  },
  {
    _id: 'dummy-company-5',
    companyName: 'FinanceEdge Consulting',
    companyAddress: '800 Wall Street Plaza, New York',
    companyCountry: 'United States',
    companyEmail: 'contact@financeedge.pro',
    companyPhone: '+1-212-555-0500',
    companyContactPersonName: 'Robert Anderson',
    companyContactPersonPhone: '+1-212-555-0501',
    companyWebsite: 'https://financeedge.pro',
    companyProductGroup: ['Financial Planning', 'Investment Advisory', 'Risk Management', 'Compliance Solutions'],
    companyNotes: 'Premier financial consulting firm serving high-net-worth clients and institutional investors. Strong regulatory compliance focus.',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-05'),
  },
  {
    _id: 'dummy-company-6',
    companyName: 'HealthBridge Medical',
    companyAddress: '450 Medical Center Dr, Boston',
    companyCountry: 'United States',
    companyEmail: 'info@healthbridge.med',
    companyPhone: '+1-617-555-0600',
    companyContactPersonName: 'Dr. Patricia Lee',
    companyContactPersonPhone: '+1-617-555-0601',
    companyWebsite: 'https://healthbridge.med',
    companyProductGroup: ['Telemedicine', 'Medical Devices', 'Health Software', 'Clinical Research'],
    companyNotes: 'Healthcare technology innovator bridging traditional medicine with digital solutions. FDA-approved medical devices.',
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-03-15'),
  }
];

export const generateDummySavedLists = () => [
  {
    _id: 'dummy-list-1',
    listName: 'Tech Innovators',
    listItems: [
      {
        email: 'hello@techflow.io',
        contactName: 'Emma Richardson'
      },
      {
        email: 'info@datavault.tech',
        contactName: 'Lisa Park'
      }
    ],
    createdAt: new Date('2024-01-20'),
  },
  {
    _id: 'dummy-list-2',
    listName: 'Green & Sustainable',
    listItems: [
      {
        email: 'contact@greentech-solutions.com',
        contactName: 'Michael Zhang'
      }
    ],
    createdAt: new Date('2024-02-05'),
  },
  {
    _id: 'dummy-list-3',
    listName: 'Creative Services',
    listItems: [
      {
        email: 'team@creativestudiopro.com',
        contactName: 'Jordan Williams'
      },
      {
        email: 'contact@financeedge.pro',
        contactName: 'Robert Anderson'
      }
    ],
    createdAt: new Date('2024-02-20'),
  }
];

export const isDummyData = (data) => {
  if (!data || data.length === 0) return false;
  // Check if data contains dummy IDs
  return data.some(item => item._id && item._id.startsWith('dummy-'));
};

export const showDummyDataMessage = () => {
  return "🎭 Demo Mode Active: Displaying sample data to showcase MailStorm's powerful admin features.";
};

export const getDummyDataStats = (data) => {
  if (!isDummyData(data)) return null;
  
  return {
    message: "You're viewing curated sample data",
    suggestion: "Connect your backend to see real user and company data",
    features: [
      "Full CRUD operations work in demo mode",
      "Email composition and scheduling",
      "List management and organization",
      "Advanced search and filtering"
    ]
  };
};