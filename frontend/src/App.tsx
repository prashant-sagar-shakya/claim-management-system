// frontend/src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/auth-context";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword"; // Import ResetPassword page
import Dashboard from "./pages/Dashboard";
import Policies from "./pages/Policies";
import Policy from "./pages/Policy";
import NewPolicy from "./pages/NewPolicy";
import Claims from "./pages/Claims";
import Claim from "./pages/Claim";
import NewClaim from "./pages/NewClaim";
import Payments from "./pages/Payments";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminPolicies from "./pages/admin/Policies";
import AdminViewPolicy from "./pages/admin/AdminViewPolicy";
import AdminClaims from "./pages/admin/Claims";
import AdminViewClaim from "./pages/admin/AdminViewClaim";
import AdminPayments from "./pages/admin/Payments";
import AdminUsers from "./pages/admin/Users";
import AdminViewUser from "./pages/admin/AdminViewUser";
import { ProtectedRoute } from "./components/protected-route";
import { AdminRoute } from "./components/admin-route";
import AdminSettings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider defaultTheme="system" storageKey="insurance-theme">
        <TooltipProvider>
          <BrowserRouter>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="/reset-password/:token"
                element={<ResetPassword />}
              />{" "}
              {/* <<< NAYA ROUTE */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    {" "}
                    <Dashboard />{" "}
                  </ProtectedRoute>
                }
              />
              {/* ... baaki user routes ... */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    {" "}
                    <Profile />{" "}
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    {" "}
                    <Navigate to="/admin/dashboard" replace />{" "}
                  </AdminRoute>
                }
              />
              {/* ... baaki admin routes ... */}
              <Route
                path="/admin/users/:userId"
                element={
                  <AdminRoute>
                    {" "}
                    <AdminViewUser />{" "}
                  </AdminRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
