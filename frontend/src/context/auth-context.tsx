import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { authAPI, User, AuthResponse } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean; // This tells if any auth operation (login, register, reload) is in progress
  isInitializing: boolean; // This tells if the initial user load is happening
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User | void>;
  register: (
    userData: Omit<User, "id" | "role" | "createdAt" | "updatedAt"> & {
      password?: string;
    }
  ) => Promise<User | void>;
  logout: () => void;
  updateProfile: (
    userData: Partial<
      Omit<
        User,
        | "id"
        | "email"
        | "role"
        | "createdAt"
        | "updatedAt"
        | "profileImageUrl"
        | "themePreference"
      >
    >,
    showToast?: boolean
  ) => Promise<User | void>;
  forgotPassword: (email: string) => Promise<void>;
  // reloadUser can be removed from context value if only used internally
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const LOCAL_STORAGE_TOKEN_KEY = "insurance_token";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For login/register/update operations
  const [isInitializing, setIsInitializing] = useState(true); // For initial load
  const { toast } = useToast();

  const handleAuthResponse = useCallback((response: AuthResponse) => {
    localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, response.token);
    setUser(response.user);
    return response.user;
  }, []);

  const logout = useCallback(
    (shouldToast: boolean = true) => {
      localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY);
      setUser(null);
      if (shouldToast) {
        toast({
          title: "Logged Out",
          description: "You have been successfully logged out.",
        });
      }
    },
    [toast]
  );

  useEffect(() => {
    const attemptReloadUser = async () => {
      const token = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY);
      if (token) {
        try {
          // No need to set setIsLoading here, isInitializing handles it
          const response = await authAPI.getCurrentUser();
          if (response && response.data) {
            setUser(response.data);
          } else {
            logout(false);
          }
        } catch (error: any) {
          console.error(
            "AuthContext: Failed to reload user on mount:",
            error.message || error
          );
          logout(false);
        }
      }
      setIsInitializing(false); // Done initializing whether token found or not
    };
    attemptReloadUser();
  }, [logout]); // logout is stable due to its own useCallback with [toast]

  const login = async (
    email: string,
    password: string
  ): Promise<User | void> => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(email, password);
      return handleAuthResponse(response.data);
    } catch (error: any) {
      toast({
        title: "Login Error",
        description:
          error.response?.data?.message || error.message || "Failed to login",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    userData: Omit<User, "id" | "role" | "createdAt" | "updatedAt"> & {
      password?: string;
    }
  ): Promise<User | void> => {
    setIsLoading(true);
    try {
      const response = await authAPI.register(userData);
      return handleAuthResponse(response.data);
    } catch (error: any) {
      toast({
        title: "Registration Error",
        description:
          error.response?.data?.message ||
          error.message ||
          "Failed to register",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (
    userData: Partial<
      Omit<
        User,
        | "id"
        | "email"
        | "role"
        | "createdAt"
        | "updatedAt"
        | "profileImageUrl"
        | "themePreference"
      >
    >,
    showToast: boolean = true
  ): Promise<User | void> => {
    setIsLoading(true);
    try {
      const payload = { ...userData };
      if (user?.id && !(payload as any).id && !(payload as any).userId) {
        (payload as any).userId = user.id;
      }
      const updatedUserResponse = await authAPI.updateUserProfile(
        payload as Partial<User>
      );
      setUser(updatedUserResponse.data);
      if (showToast)
        toast({
          title: "Profile Updated",
          description: "Your profile information has been updated.",
        });
      return updatedUserResponse.data;
    } catch (error: any) {
      if (showToast)
        toast({
          title: "Update Error",
          description:
            error.response?.data?.message ||
            error.message ||
            "Failed to update profile",
          variant: "destructive",
        });
      else
        console.error(
          "Silent profile update failed:",
          error.response?.data?.message || error.message
        );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authAPI.forgotPassword(email);
      toast({
        title: "Password Reset Initiated",
        description: response.data.message,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          error.message ||
          "Failed to process request",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    isInitializing,
    isAuthenticated: !!user, // Keep this simple: if user object exists, they are considered authenticated on client
    login,
    register,
    logout,
    updateProfile,
    forgotPassword,
    // reloadUser not exposed if only internal
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
