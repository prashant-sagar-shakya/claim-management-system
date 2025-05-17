import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI, User } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('insurance_token');
    if (token) {
      authAPI.getCurrentUser()
        .then(response => {
          setUser(response.data);
        })
        .catch(() => {
          localStorage.removeItem('insurance_token');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await authAPI.login(email, password);
      localStorage.setItem('insurance_token', response.data.token);
      setUser(response.data.user);
    } catch (error: any) {
      toast({
        title: "Login Error",
        description: error.response?.data?.message || "Failed to login",
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (userData: any): Promise<void> => {
    try {
      const response = await authAPI.register(userData);
      localStorage.setItem('insurance_token', response.data.token);
      setUser(response.data.user);
    } catch (error: any) {
      toast({
        title: "Registration Error",
        description: error.response?.data?.message || "Failed to register",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('insurance_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
