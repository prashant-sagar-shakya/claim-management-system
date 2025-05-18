import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { Loader2 as Loader } from "lucide-react"; // Using Loader2 for consistency

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isInitializing } = useAuth(); // Use isInitializing

  if (isInitializing) {
    // If still initializing session, show loader
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // If not authenticated AFTER initialization, redirect
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// AdminRoute ko bhi similar tareeke se update karein agar zaroorat ho
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    // If user is not admin OR simply not logged in, redirect to user dashboard or login
    // Depending on desired behavior. Redirecting to user dashboard seems reasonable if they are logged in but not admin.
    // If !user (not logged in at all), ProtectedRoute would have already caught it for login redirection
    // but an explicit check for !user is safer if AdminRoute can be accessed without ProtectedRoute nesting.
    const redirectPath = user
      ? user.role === "user"
        ? "/dashboard"
        : "/login"
      : "/login";
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};
