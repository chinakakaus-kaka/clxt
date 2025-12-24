import { 
  TravelRequest, 
  RequestStatus, 
  RequestType, 
  Role, 
  Urgency,
  FlightRequestData,
  HotelRequestData,
  User,
  Comment,
  UserProfile
} from '../types';

// --- Seed Data ---

let users: User[] = [
  { id: 'u1', name: '王员工 (Alice)', email: 'alice@corp.com', role: Role.USER },
  { id: 'u2', name: '李销售 (Bob)', email: 'bob@corp.com', role: Role.USER },
  { id: 'u3', name: '张技术 (Charlie)', email: 'charlie@corp.com', role: Role.USER },
  { id: 'u4', name: '赵市场 (David)', email: 'david@corp.com', role: Role.USER },
  { id: 'admin', name: '系统管理员', email: 'admin', role: Role.ADMIN },
];

const profiles: Record<string, UserProfile> = {
  'u1': {
    chineseName: '王员工',
    englishName: 'WANG / YUAN GONG',
    nationality: '中国大陆',
    gender: '女',
    birthday: '1995-05-20',
    birthPlace: '上海',
    phone: '13800138000',
    email: 'alice@corp.com',
    documents: [
      { type: '身份证', number: '310101199505201234', expiryDate: '2035-05-20' },
    ],
    contacts: []
  },
  // ... other profiles would go here in a real app
};

// Helper to generate random requests
const generateMockHistory = (): TravelRequest[] => {
  const requests: TravelRequest[] = [];
  const now = new Date();
  const types = [RequestType.FLIGHT, RequestType.HOTEL, RequestType.CAR_RENTAL, RequestType.CHARTER, RequestType.OTHER];
  const statuses = [
    RequestStatus.SUCCESS, RequestStatus.SUCCESS, RequestStatus.SUCCESS, // More success for stats
    RequestStatus.FAILED, RequestStatus.CANCELLED, 
    RequestStatus.SUBMITTED, RequestStatus.BOOKING
  ];
  const purposes = ['客户拜访', '年度会议', '项目交付', '技术交流', '团建活动', '供应商考察'];

  for (let i = 0; i < 60; i++) {
    const user = users[Math.floor(Math.random() * 4)]; // Random user u1-u4
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Random date within last 6 months
    const date = new Date(now.getTime() - Math.random() * 180 * 24 * 60 * 60 * 1000);
    
    let price = 0;
    if (status === RequestStatus.SUCCESS) {
      // Generate price based on type
      if (type === RequestType.FLIGHT) price = 1000 + Math.random() * 5000;
      else if (type === RequestType.HOTEL) price = 500 + Math.random() * 3000;
      else if (type === RequestType.CAR_RENTAL) price = 200 + Math.random() * 1000;
      else price = 100 + Math.random() * 2000;
      price = Math.floor(price);
    }

    requests.push({
      id: `REQ-${date.getFullYear()}${String(date.getMonth()+1).padStart(2, '0')}-${String(Math.floor(Math.random()*1000)).padStart(3,'0')}`,
      userId: user.id,
      userName: user.name,
      type: type,
      status: status,
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
      data: {
        purpose: purposes[Math.floor(Math.random() * purposes.length)],
        urgency: Math.random() > 0.8 ? Urgency.URGENT : Urgency.NORMAL,
        travelers: [],
        budgetCap: price * 1.2
      } as any, // Simplified data for mock stats
      comments: [],
      history: [],
      bookingResult: status === RequestStatus.SUCCESS ? {
        orderId: `ORD-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        price: price,
        platform: 'Ctrip',
        currency: 'CNY'
      } : undefined
    });
  }
  return requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

const INITIAL_REQUESTS: TravelRequest[] = generateMockHistory();

// --- Service Logic ---

let requests = [...INITIAL_REQUESTS];

export const mockService = {
  login: async (identifier: string, password?: string): Promise<User | null> => {
    // Specific check for Admin credentials as requested
    if (identifier === 'admin') {
      if (password === '12345678910') {
        return users.find(u => u.id === 'admin') || null;
      } else {
        return null; // Invalid password
      }
    }

    // Normal user (password check mocked/skipped for demo simplicity unless it's admin)
    return users.find(u => u.email === identifier) || null;
  },

  register: async (name: string, email: string): Promise<User> => {
    // Check if email exists
    if (users.find(u => u.email === email)) {
      throw new Error("邮箱已被注册");
    }
    const newUser: User = {
      id: `u${Date.now()}`,
      name,
      email,
      role: Role.USER // Default to normal user
    };
    users.push(newUser);
    // Initialize empty profile
    profiles[newUser.id] = {
      chineseName: name,
      englishName: '',
      nationality: '中国大陆',
      gender: '男',
      birthday: '',
      birthPlace: '',
      phone: '',
      email: email,
      documents: [],
      contacts: []
    };
    return newUser;
  },

  getUserProfile: async (userId: string): Promise<UserProfile> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return profiles[userId] || {
      chineseName: '',
      englishName: '',
      nationality: '',
      gender: '男',
      birthday: '',
      birthPlace: '',
      phone: '',
      email: '',
      documents: [],
      contacts: []
    };
  },

  updateUserProfile: async (userId: string, profile: UserProfile): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    profiles[userId] = profile;
  },

  getRequests: async (user?: User): Promise<TravelRequest[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    if (user?.role === Role.ADMIN) {
      return [...requests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return requests.filter(r => r.userId === user?.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getRequestById: async (id: string): Promise<TravelRequest | undefined> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return requests.find(r => r.id === id);
  },

  createRequest: async (user: User, type: RequestType, data: any): Promise<TravelRequest> => {
    const newReq: TravelRequest = {
      id: `REQ-${new Date().getFullYear()}${Math.floor(Math.random() * 10000)}`,
      userId: user.id,
      userName: user.name,
      type,
      status: RequestStatus.SUBMITTED,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data,
      comments: [],
      history: [{
        id: Math.random().toString(36).substr(2, 9),
        action: 'CREATED',
        actor: user.name,
        timestamp: new Date().toISOString()
      }]
    };
    requests.unshift(newReq);
    return newReq;
  },

  updateStatus: async (reqId: string, status: RequestStatus, user: User, note?: string): Promise<TravelRequest> => {
    const reqIndex = requests.findIndex(r => r.id === reqId);
    if (reqIndex === -1) throw new Error("Request not found");

    const updatedReq = { ...requests[reqIndex] };
    updatedReq.status = status;
    updatedReq.updatedAt = new Date().toISOString();
    
    // Assign if admin picks it up
    if (status === RequestStatus.ACCEPTED && user.role === Role.ADMIN && !updatedReq.assignedTo) {
      updatedReq.assignedTo = user.id;
    }

    updatedReq.history.push({
      id: Math.random().toString(36).substr(2, 9),
      action: `STATUS_CHANGE_TO_${status}`,
      actor: user.name,
      timestamp: new Date().toISOString(),
      details: note
    });

    requests[reqIndex] = updatedReq;
    return updatedReq;
  },

  addComment: async (reqId: string, user: User, content: string): Promise<Comment> => {
     const reqIndex = requests.findIndex(r => r.id === reqId);
     if (reqIndex === -1) throw new Error("Request not found");
     
     const newComment: Comment = {
       id: Math.random().toString(36).substr(2, 9),
       author: user.name,
       role: user.role,
       content,
       createdAt: new Date().toISOString()
     };
     
     requests[reqIndex].comments.push(newComment);
     return newComment;
  },

  completeBooking: async (reqId: string, user: User, resultData: any): Promise<TravelRequest> => {
    const reqIndex = requests.findIndex(r => r.id === reqId);
    if (reqIndex === -1) throw new Error("Request not found");

    const updatedReq = { ...requests[reqIndex] };
    updatedReq.status = RequestStatus.SUCCESS;
    updatedReq.updatedAt = new Date().toISOString();
    updatedReq.bookingResult = {
      ...resultData,
      files: ['https://picsum.photos/400/600'] // Mock file attachment
    };

    updatedReq.history.push({
      id: Math.random().toString(36).substr(2, 9),
      action: 'BOOKING_COMPLETED',
      actor: user.name,
      timestamp: new Date().toISOString()
    });

    requests[reqIndex] = updatedReq;
    return updatedReq;
  },

  failBooking: async (reqId: string, user: User, reason: string): Promise<TravelRequest> => {
    const reqIndex = requests.findIndex(r => r.id === reqId);
    if (reqIndex === -1) throw new Error("Request not found");

    const updatedReq = { ...requests[reqIndex] };
    updatedReq.status = RequestStatus.FAILED;
    updatedReq.updatedAt = new Date().toISOString();
    updatedReq.bookingResult = { failureReason: reason };

    updatedReq.history.push({
      id: Math.random().toString(36).substr(2, 9),
      action: 'BOOKING_FAILED',
      actor: user.name,
      timestamp: new Date().toISOString(),
      details: reason
    });

    requests[reqIndex] = updatedReq;
    return updatedReq;
  },

  deleteRequests: async (ids: string[]): Promise<void> => {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const idsSet = new Set(ids);
    requests = requests.filter(r => !idsSet.has(r.id));
  }
};
