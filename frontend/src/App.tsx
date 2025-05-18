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
import ResetPassword from "./pages/ResetPassword";

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
import AdminSettings from "./pages/admin/Settings";

import { ProtectedRoute } from "./components/protected-route";
import { AdminRoute } from "./components/admin-route";

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
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route
                path="/reset-password/:token"
                element={<ResetPassword />}
              />

              {/* Protected User Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    {" "}
                    <Dashboard />{" "}
                  </ProtectedRoute>
                }
              />
              <Route
                path="/policies"
                element={
                  <ProtectedRoute>
                    {" "}
                    <Policies />{" "}
                  </ProtectedRoute>
                }
              />
              <Route
                path="/policies/new"
                element={
                  <ProtectedRoute>
                    {" "}
                    <NewPolicy />{" "}
                  </ProtectedRoute>
                }
              />
              <Route
                path="/policies/:id"
                element={
                  <ProtectedRoute>
                    {" "}
                    <Policy />{" "}
                  </ProtectedRoute>
                }
              />
              <Route
                path="/claims"
                element={
                  <ProtectedRoute>
                    {" "}
                    <Claims />{" "}
                  </ProtectedRoute>
                }
              />
              <Route
                path="/claims/new"
                element={
                  <ProtectedRoute>
                    {" "}
                    <NewClaim />{" "}
                  </ProtectedRoute>
                }
              />
              <Route
                path="/claims/:id"
                element={
                  <ProtectedRoute>
                    {" "}
                    <Claim />{" "}
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payments"
                element={
                  <ProtectedRoute>
                    {" "}
                    <Payments />{" "}
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    {" "}
                    <Profile />{" "}
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    {" "}
                    <Navigate to="/admin/dashboard" replace />{" "}
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    {" "}
                    <AdminDashboard />{" "}
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/policies"
                element={
                  <AdminRoute>
                    {" "}
                    <AdminPolicies />{" "}
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/policies/:id"
                element={
                  <AdminRoute>
                    {" "}
                    <AdminViewPolicy />{" "}
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/claims"
                element={
                  <AdminRoute>
                    {" "}
                    <AdminClaims />{" "}
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/claims/:claimId"
                element={
                  <AdminRoute>
                    {" "}
                    <AdminViewClaim />{" "}
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <AdminRoute>
                    {" "}
                    <AdminSettings />{" "}
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/payments"
                element={
                  <AdminRoute>
                    {" "}
                    <AdminPayments />{" "}
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    {" "}
                    <AdminUsers />{" "}
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/users/:userId"
                element={
                  <AdminRoute>
                    {" "}
                    <AdminViewUser />{" "}
                  </AdminRoute>
                }
              />

              {/* Fallback Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
