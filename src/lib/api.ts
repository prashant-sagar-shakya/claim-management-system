import axios from 'axios';

// Define types for our API responses
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Policy {
  id: string;
  policy_type: string;
  coverage_amount: number;
  premium_amount: number;
  start_date: string;
  end_date: string;
  description: string;
  user_id: string;
  user?: { firstName: string; lastName: string };
  createdAt: string;
  updatedAt?: string;
}

export interface Claim {
  id: string;
  policy_id: string;
  policy?: { policy_type: string };
  user_id: string;
  user?: { firstName: string; lastName: string };
  claim_amount: number;
  claim_date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  processed_at?: string;
  description: string;
}

export interface Payment {
  id: string;
  policy_id: string;
  policy?: { policy_type: string };
  user_id: string;
  user?: { firstName: string; lastName: string };
  amount: number;
  payment_type: string;
  payment_date: string;
  processed_at: string;
  description: string;
}

// Create axios instance with base URL and default config
const api = axios.create({
  baseURL: '/api', // This would be your API base URL
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('insurance_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Mock API responses for development
const mockResponse = <T>(data: T, delay = 500): Promise<{ data: T }> => {
  return new Promise(resolve => {
    setTimeout(() => resolve({ data }), delay);
  });
};

// Auth API
export const authAPI = {
  login: (email: string, password: string): Promise<{ data: AuthResponse }> => {
    // In development, we'll return mock data
    // In production, this would be: return api.post('/auth/login', { email, password });
    return mockResponse<AuthResponse>({
      token: 'mock-jwt-token',
      user: {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: email,
        role: email.includes('admin') ? 'admin' : 'user'
      }
    });
  },
  register: (userData: any): Promise<{ data: AuthResponse }> => {
    // In production: return api.post('/auth/register', userData);
    return mockResponse<AuthResponse>({
      token: 'mock-jwt-token',
      user: {
        id: '1',
        ...userData,
        role: 'user'
      }
    });
  },
  getCurrentUser: (): Promise<{ data: User }> => {
    // In production: return api.get('/auth/me');
    return mockResponse<User>({
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'user'
    });
  },
  getAllUsers: (): Promise<{ data: User[] }> => {
    // In production: return api.get('/admin/users');
    return mockResponse<User[]>([
      {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'user',
        createdAt: '2023-01-15T10:00:00Z'
      },
      {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        role: 'user',
        createdAt: '2023-02-20T11:00:00Z'
      },
      {
        id: '3',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        role: 'admin',
        createdAt: '2023-01-01T09:00:00Z'
      }
    ]);
  }
};

// Policies API
export const policiesAPI = {
  getUserPolicies: (): Promise<{ data: Policy[] }> => {
    // In production: return api.get('/policies');
    return mockResponse<Policy[]>([
      {
        id: '1a2b3c4d5e',
        policy_type: 'Health Insurance',
        coverage_amount: 500000,
        premium_amount: 200,
        start_date: '2023-01-01T00:00:00Z',
        end_date: '2024-01-01T00:00:00Z',
        description: 'Comprehensive health coverage for individuals',
        user_id: '1',
        createdAt: '2023-01-01T10:00:00Z'
      },
      {
        id: '2b3c4d5e6f',
        policy_type: 'Auto Insurance',
        coverage_amount: 100000,
        premium_amount: 150,
        start_date: '2023-02-15T00:00:00Z',
        end_date: '2024-02-15T00:00:00Z',
        description: 'Comprehensive auto insurance with collision coverage',
        user_id: '1',
        createdAt: '2023-02-15T10:00:00Z'
      }
    ]);
  },
  getAllPolicies: (): Promise<{ data: Policy[] }> => {
    // In production: return api.get('/admin/policies');
    return mockResponse<Policy[]>([
      {
        id: '1a2b3c4d5e',
        policy_type: 'Health Insurance',
        coverage_amount: 500000,
        premium_amount: 200,
        start_date: '2023-01-01T00:00:00Z',
        end_date: '2024-01-01T00:00:00Z',
        description: 'Comprehensive health coverage for individuals',
        user_id: '1',
        user: { firstName: 'John', lastName: 'Doe' },
        createdAt: '2023-01-01T10:00:00Z'
      },
      {
        id: '2b3c4d5e6f',
        policy_type: 'Auto Insurance',
        coverage_amount: 100000,
        premium_amount: 150,
        start_date: '2023-02-15T00:00:00Z',
        end_date: '2024-02-15T00:00:00Z',
        description: 'Comprehensive auto insurance with collision coverage',
        user_id: '1',
        user: { firstName: 'John', lastName: 'Doe' },
        createdAt: '2023-02-15T10:00:00Z'
      },
      {
        id: '3c4d5e6f7g',
        policy_type: 'Home Insurance',
        coverage_amount: 350000,
        premium_amount: 175,
        start_date: '2023-03-10T00:00:00Z',
        end_date: '2024-03-10T00:00:00Z',
        description: 'Comprehensive home insurance coverage',
        user_id: '2',
        user: { firstName: 'Jane', lastName: 'Smith' },
        createdAt: '2023-03-10T10:00:00Z'
      }
    ]);
  },
  getPolicy: (id: string): Promise<{ data: Policy }> => {
    // In production: return api.get(`/policies/${id}`);
    return mockResponse<Policy>({
      id,
      policy_type: 'Health Insurance',
      coverage_amount: 500000,
      premium_amount: 200,
      start_date: '2023-01-01T00:00:00Z',
      end_date: '2024-01-01T00:00:00Z',
      description: 'Comprehensive health coverage for individuals including emergency care, hospitalization, outpatient services, and preventive care. This policy provides a wide range of health benefits with a low deductible and affordable co-payments.',
      user_id: '1',
      createdAt: '2023-01-01T10:00:00Z'
    });
  },
  createPolicy: (policyData: Partial<Policy>): Promise<{ data: Policy }> => {
    // In production: return api.post('/policies', policyData);
    return mockResponse<Policy>({
      id: '4d5e6f7g8h',
      ...policyData as Policy,
      user_id: '1',
      createdAt: new Date().toISOString()
    });
  },
  updatePolicy: (id: string, policyData: Partial<Policy>): Promise<{ data: Policy }> => {
    // In production: return api.put(`/policies/${id}`, policyData);
    return mockResponse<Policy>({
      id,
      ...policyData as Policy,
      createdAt: '2023-01-01T10:00:00Z',
      updatedAt: new Date().toISOString()
    });
  },
  deletePolicy: (id: string): Promise<{ data: { success: boolean } }> => {
    // In production: return api.delete(`/policies/${id}`);
    return mockResponse({ success: true });
  }
};

// Claims API
export const claimsAPI = {
  getUserClaims: (): Promise<{ data: Claim[] }> => {
    // In production: return api.get('/claims');
    return mockResponse<Claim[]>([
      {
        id: '1a2b3c4d5e',
        policy_id: '1a2b3c4d5e',
        user_id: '1',
        claim_amount: 5000,
        claim_date: '2023-06-15T10:00:00Z',
        status: 'Approved',
        processed_at: '2023-06-20T14:30:00Z',
        description: 'Hospital visit for emergency treatment',
      },
      {
        id: '2b3c4d5e6f',
        policy_id: '1a2b3c4d5e',
        user_id: '1',
        claim_amount: 1200,
        claim_date: '2023-07-10T09:00:00Z',
        status: 'Pending',
        description: 'Prescription medication coverage',
      },
      {
        id: '3c4d5e6f7g',
        policy_id: '2b3c4d5e6f',
        user_id: '1',
        claim_amount: 3500,
        claim_date: '2023-08-05T11:00:00Z',
        status: 'Rejected',
        processed_at: '2023-08-10T13:45:00Z',
        description: 'Car repair after minor accident',
      }
    ]);
  },
  getAllClaims: (): Promise<{ data: Claim[] }> => {
    // In production: return api.get('/admin/claims');
    return mockResponse<Claim[]>([
      {
        id: '1a2b3c4d5e',
        policy_id: '1a2b3c4d5e',
        user_id: '1',
        user: { firstName: 'John', lastName: 'Doe' },
        claim_amount: 5000,
        claim_date: '2023-06-15T10:00:00Z',
        status: 'Approved',
        processed_at: '2023-06-20T14:30:00Z',
        description: 'Hospital visit for emergency treatment',
      },
      {
        id: '2b3c4d5e6f',
        policy_id: '1a2b3c4d5e',
        user_id: '1',
        user: { firstName: 'John', lastName: 'Doe' },
        claim_amount: 1200,
        claim_date: '2023-07-10T09:00:00Z',
        status: 'Pending',
        description: 'Prescription medication coverage',
      },
      {
        id: '3c4d5e6f7g',
        policy_id: '2b3c4d5e6f',
        user_id: '1',
        user: { firstName: 'John', lastName: 'Doe' },
        claim_amount: 3500,
        claim_date: '2023-08-05T11:00:00Z',
        status: 'Rejected',
        processed_at: '2023-08-10T13:45:00Z',
        description: 'Car repair after minor accident',
      },
      {
        id: '4d5e6f7g8h',
        policy_id: '3c4d5e6f7g',
        user_id: '2',
        user: { firstName: 'Jane', lastName: 'Smith' },
        claim_amount: 8000,
        claim_date: '2023-07-25T10:30:00Z',
        status: 'Approved',
        processed_at: '2023-07-30T15:20:00Z',
        description: 'Home damage due to water leak',
      }
    ]);
  },
  getClaim: (id: string): Promise<{ data: Claim }> => {
    // In production: return api.get(`/claims/${id}`);
    return mockResponse<Claim>({
      id,
      policy_id: '1a2b3c4d5e',
      policy: { policy_type: 'Health Insurance' },
      user_id: '1',
      claim_amount: 5000,
      claim_date: '2023-06-15T10:00:00Z',
      status: 'Approved',
      processed_at: '2023-06-20T14:30:00Z',
      description: 'Hospital visit for emergency treatment. Required overnight stay due to high fever and dehydration. Doctor prescribed medication and follow-up visit in two weeks.',
    });
  },
  createClaim: (claimData: Partial<Claim>): Promise<{ data: Claim }> => {
    // In production: return api.post('/claims', claimData);
    return mockResponse<Claim>({
      id: '4d5e6f7g8h',
      ...claimData as Claim,
      user_id: '1',
      status: 'Pending',
      claim_date: new Date().toISOString()
    });
  },
  updateClaimStatus: (id: string, status: string): Promise<{ data: { id: string; status: string; processed_at: string } }> => {
    // In production: return api.put(`/claims/${id}/status`, { status });
    return mockResponse({
      id,
      status,
      processed_at: new Date().toISOString()
    });
  }
};

// Payments API
export const paymentsAPI = {
  getUserPayments: (): Promise<{ data: Payment[] }> => {
    // In production: return api.get('/payments');
    return mockResponse<Payment[]>([
      {
        id: '1a2b3c4d5e',
        policy_id: '1a2b3c4d5e',
        user_id: '1',
        amount: 200,
        payment_type: 'Credit Card',
        payment_date: '2023-01-01T10:00:00Z',
        processed_at: '2023-01-01T10:05:00Z',
        description: 'Monthly premium payment',
      },
      {
        id: '2b3c4d5e6f',
        policy_id: '1a2b3c4d5e',
        user_id: '1',
        amount: 200,
        payment_type: 'Credit Card',
        payment_date: '2023-02-01T10:00:00Z',
        processed_at: '2023-02-01T10:03:00Z',
        description: 'Monthly premium payment',
      },
      {
        id: '3c4d5e6f7g',
        policy_id: '2b3c4d5e6f',
        user_id: '1',
        amount: 150,
        payment_type: 'Bank Transfer',
        payment_date: '2023-02-15T10:00:00Z',
        processed_at: '2023-02-15T10:10:00Z',
        description: 'Monthly premium payment',
      }
    ]);
  },
  getAllPayments: (): Promise<{ data: Payment[] }> => {
    // In production: return api.get('/admin/payments');
    return mockResponse<Payment[]>([
      {
        id: '1a2b3c4d5e',
        policy_id: '1a2b3c4d5e',
        policy: { policy_type: 'Health Insurance' },
        user_id: '1',
        user: { firstName: 'John', lastName: 'Doe' },
        amount: 200,
        payment_type: 'Credit Card',
        payment_date: '2023-01-01T10:00:00Z',
        processed_at: '2023-01-01T10:05:00Z',
        description: 'Monthly premium payment',
      },
      {
        id: '2b3c4d5e6f',
        policy_id: '1a2b3c4d5e',
        policy: { policy_type: 'Health Insurance' },
        user_id: '1',
        user: { firstName: 'John', lastName: 'Doe' },
        amount: 200,
        payment_type: 'Credit Card',
        payment_date: '2023-02-01T10:00:00Z',
        processed_at: '2023-02-01T10:03:00Z',
        description: 'Monthly premium payment',
      },
      {
        id: '3c4d5e6f7g',
        policy_id: '2b3c4d5e6f',
        policy: { policy_type: 'Auto Insurance' },
        user_id: '1',
        user: { firstName: 'John', lastName: 'Doe' },
        amount: 150,
        payment_type: 'Bank Transfer',
        payment_date: '2023-02-15T10:00:00Z',
        processed_at: '2023-02-15T10:10:00Z',
        description: 'Monthly premium payment',
      },
      {
        id: '4d5e6f7g8h',
        policy_id: '3c4d5e6f7g',
        policy: { policy_type: 'Home Insurance' },
        user_id: '2',
        user: { firstName: 'Jane', lastName: 'Smith' },
        amount: 175,
        payment_type: 'PayPal',
        payment_date: '2023-03-10T10:00:00Z',
        processed_at: '2023-03-10T10:02:00Z',
        description: 'Monthly premium payment',
      }
    ]);
  },
  makePayment: (paymentData: Partial<Payment>): Promise<{ data: Payment }> => {
    // In production: return api.post('/payments', paymentData);
    return mockResponse<Payment>({
      id: '5e6f7g8h9i',
      ...paymentData as Payment,
      user_id: '1',
      payment_date: new Date().toISOString(),
      processed_at: new Date().toISOString()
    });
  }
};

export default api;
