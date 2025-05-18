import axios from "axios";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "user" | "admin";
  phone?: string;
  address?: string;
  profileImageUrl?: string;
  themePreference?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Policy {
  id: string;
  policy_number: string;
  policyholder_id: string;
  policy_type: string;
  coverage_amount: number;
  premium_amount: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  description?: string;
  policy_document_url?: string;
  user?: { id?: string; firstName: string; lastName: string; email?: string }; // Added optional id to user
  createdAt: string;
  updatedAt?: string;
}

export interface Claim {
  id: string;
  claim_number: string;
  policy_id: string | Policy;
  policyholder_id: string | User;
  user?: { id?: string; firstName: string; lastName: string; email?: string }; // Added optional id to user
  claim_amount: number;
  claim_date: string;
  incident_date: string;
  status: "Pending" | "Under Review" | "Approved" | "Rejected" | "Paid";
  processed_at?: string;
  description: string;
  rejection_reason?: string;
  supporting_documents?: Array<{
    document_type?: string;
    document_url: string;
    uploaded_at?: string;
  }>;
}

export interface Payment {
  id: string;
  payment_number: string;
  policy_id: string | Policy;
  policyholder_id: string | User;
  user?: { id?: string; firstName: string; lastName: string; email?: string }; // Added optional id to user
  amount: number;
  payment_type: string;
  payment_date: string;
  status: "Pending" | "Completed" | "Failed" | "Refunded";
  processed_at?: string;
  description?: string;
  receipt_url?: string;
}

export interface AppSettings {
  id: string;
  siteName: string;
  maintenanceMode: boolean;
  recordsPerPage: number;
  createdAt: string;
  updatedAt: string;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("insurance_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string): Promise<{ data: AuthResponse }> => {
    return api.post("/auth/login", { email, password });
  },
  register: (userData: any): Promise<{ data: AuthResponse }> => {
    return api.post("/auth/register", userData);
  },
  getCurrentUser: (): Promise<{ data: User }> => {
    return api.get("/auth/me");
  },
  updateUserProfile: (userData: Partial<User>): Promise<{ data: User }> => {
    return api.put(`/users/profile`, userData);
  },
  forgotPassword: (email: string): Promise<{ data: { message: string } }> => {
    return api.post("/auth/forgot-password", { email });
  },
  resetPassword: (
    token: string,
    password: string
  ): Promise<{ data: { success: boolean; message: string } }> => {
    return api.post("/auth/reset-password", { token, password });
  },
  getAllUsers: (): Promise<{ data: User[] }> => {
    return api.get("/admin/users");
  },
  adminGetUserById: (userId: string): Promise<{ data: User }> => {
    return api.get(`/admin/users/${userId}`);
  },
  adminDeleteUser: (
    userId: string
  ): Promise<{ data: { success: boolean; message: string } }> => {
    return api.delete(`/admin/users/${userId}`);
  },
};

export const policiesAPI = {
  getUserPolicies: (): Promise<{ data: Policy[] }> => {
    return api.get("/policies/user");
  },
  getAllPolicies: (): Promise<{ data: Policy[] }> => {
    return api.get("/policies");
  },
  getPolicy: (id: string): Promise<{ data: Policy }> => {
    if (!id || id === "undefined" || id.trim() === "") {
      return Promise.reject(
        new Error("Invalid policy ID provided to API call.")
      );
    }
    return api.get(`/policies/${id}`);
  },
  createPolicy: (
    policyData: Partial<
      Omit<
        Policy,
        | "id"
        | "createdAt"
        | "updatedAt"
        | "user"
        | "is_active"
        | "policy_number"
      >
    > & { user_id: string }
  ): Promise<{ data: Policy }> => {
    return api.post("/policies", policyData);
  },
};

export const claimsAPI = {
  getUserClaims: (): Promise<{ data: Claim[] }> => {
    return api.get("/claims/user");
  },
  getAllClaims: (): Promise<{ data: Claim[] }> => {
    return api.get("/claims");
  },
  getClaim: (id: string): Promise<{ data: Claim }> => {
    if (!id || id === "undefined" || id.trim() === "") {
      return Promise.reject(
        new Error("Invalid claim ID provided to API call.")
      );
    }
    return api.get(`/claims/${id}`);
  },
  createClaim: (
    claimData: FormData | Partial<Claim>
  ): Promise<{ data: Claim }> => {
    if (claimData instanceof FormData) {
      return api.post("/claims", claimData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }
    return api.post("/claims", claimData);
  },
  updateClaimStatus: (
    claimId: string,
    status: "Approved" | "Rejected",
    rejection_reason?: string
  ): Promise<{ data: Claim }> => {
    return api.put(`/claims/${claimId}/status`, { status, rejection_reason });
  },
};

export const paymentsAPI = {
  getUserPayments: (): Promise<{ data: Payment[] }> => {
    return api.get("/payments/user");
  },
  getAllPayments: (): Promise<{ data: Payment[] }> => {
    return api.get("/payments");
  },
  makePayment: (paymentData: Partial<Payment>): Promise<{ data: Payment }> => {
    return api.post("/payments", paymentData);
  },
};

export const settingsAPI = {
  getSettings: (): Promise<{ data: AppSettings }> => {
    return api.get("/settings");
  },
  updateSettings: (
    settingsData: Partial<Omit<AppSettings, "id" | "createdAt" | "updatedAt">>
  ): Promise<{ data: AppSettings }> => {
    return api.put("/settings", settingsData);
  },
};

export default api;
