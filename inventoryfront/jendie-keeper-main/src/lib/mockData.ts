// Mock Users
export const mockUsers = [
  {
    id: '1',
    email: 'admin@jendie.com',
    password: 'admin123',
    role: 'admin' as const,
    name: 'Admin User'
  },
  {
    id: '2',
    email: 'dealer@jendie.com',
    password: 'dealer123',
    role: 'dealer' as const,
    name: 'Dealer User'
  }
];

// Mock Dealers
export const mockDealers = [
  {
    id: '1',
    name: 'Nairobi Motors',
    contact: '+254 712 345 678',
    location: 'Nairobi',
    defaultPrice: 35000,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Mombasa Auto Parts',
    contact: '+254 723 456 789',
    location: 'Mombasa',
    defaultPrice: 33000,
    createdAt: '2024-02-10'
  },
  {
    id: '3',
    name: 'Kisumu Speed Solutions',
    contact: '+254 734 567 890',
    location: 'Kisumu',
    defaultPrice: 32000,
    createdAt: '2024-03-05'
  }
];

// Mock Inventory
export const mockInventory = [
  {
    id: '1',
    serialNumber: 'JSG-2024-001',
    simCardNumber: '254700123456',
    model: 'JSG-Pro-X',
    status: 'available',
    dealerId: null,
    clientName: null,
    sellingPrice: 35000,
    dateAdded: '2024-10-01'
  },
  {
    id: '2',
    serialNumber: 'JSG-2024-002',
    simCardNumber: '254700123457',
    model: 'JSG-Pro-X',
    status: 'sold',
    dealerId: '1',
    clientName: 'Direct Client - John Doe',
    sellingPrice: 36000,
    dateAdded: '2024-10-02',
    dateSold: '2024-10-15'
  },
  {
    id: '3',
    serialNumber: 'JSG-2024-003',
    simCardNumber: '254700123458',
    model: 'JSG-Standard',
    status: 'available',
    dealerId: '2',
    clientName: null,
    sellingPrice: 30000,
    dateAdded: '2024-10-05'
  },
  {
    id: '4',
    serialNumber: 'JSG-2024-004',
    simCardNumber: '254700123459',
    model: 'JSG-Pro-X',
    status: 'sold',
    dealerId: null,
    clientName: 'Jane Smith',
    sellingPrice: 35000,
    dateAdded: '2024-10-08',
    dateSold: '2024-10-18'
  },
  {
    id: '5',
    serialNumber: 'JSG-2024-005',
    simCardNumber: '254700123460',
    model: 'JSG-Standard',
    status: 'available',
    dealerId: null,
    clientName: null,
    sellingPrice: 32000,
    dateAdded: '2024-10-10'
  }
];

// Mock Sales
export const mockSales = [
  {
    id: '1',
    serialNumber: 'JSG-2024-002',
    simCardNumber: '254700123457',
    model: 'JSG-Pro-X',
    dealerName: 'Nairobi Motors',
    clientName: 'Direct Client - John Doe',
    sellingPrice: 36000,
    dateSold: '2024-10-15',
    soldBy: 'Admin User'
  },
  {
    id: '2',
    serialNumber: 'JSG-2024-004',
    simCardNumber: '254700123459',
    model: 'JSG-Pro-X',
    dealerName: null,
    clientName: 'Jane Smith',
    sellingPrice: 35000,
    dateSold: '2024-10-18',
    soldBy: 'Admin User'
  }
];

// Local storage helpers
const STORAGE_KEYS = {
  INVENTORY: 'jendie_inventory',
  DEALERS: 'jendie_dealers',
  SALES: 'jendie_sales'
};

export const initializeMockData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.INVENTORY)) {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(mockInventory));
  }
  if (!localStorage.getItem(STORAGE_KEYS.DEALERS)) {
    localStorage.setItem(STORAGE_KEYS.DEALERS, JSON.stringify(mockDealers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SALES)) {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(mockSales));
  }
};

export const getMockInventory = () => {
  const data = localStorage.getItem(STORAGE_KEYS.INVENTORY);
  return data ? JSON.parse(data) : mockInventory;
};

export const setMockInventory = (inventory: any[]) => {
  localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
};

export const getMockDealers = () => {
  const data = localStorage.getItem(STORAGE_KEYS.DEALERS);
  return data ? JSON.parse(data) : mockDealers;
};

export const setMockDealers = (dealers: any[]) => {
  localStorage.setItem(STORAGE_KEYS.DEALERS, JSON.stringify(dealers));
};

export const getMockSales = () => {
  const data = localStorage.getItem(STORAGE_KEYS.SALES);
  return data ? JSON.parse(data) : mockSales;
};

export const setMockSales = (sales: any[]) => {
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
};
