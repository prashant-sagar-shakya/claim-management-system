
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
import Dashboard from "./pages/Dashboard";
import Policies from "./pages/Policies";
import Policy from "./pages/Policy";
import Claims from "./pages/Claims";
import Claim from "./pages/Claim";
import Payments from "./pages/Payments";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminPolicies from "./pages/admin/Policies";
import AdminClaims from "./pages/admin/Claims";
import AdminPayments from "./pages/admin/Payments";
import AdminUsers from "./pages/admin/Users";
import { ProtectedRoute } from "./components/protected-route";
import { AdminRoute } from "./components/admin-route";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="insurance-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected User Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/policies" element={<ProtectedRoute><Policies /></ProtectedRoute>} />
              <Route path="/policies/:id" element={<ProtectedRoute><Policy /></ProtectedRoute>} />
              <Route path="/claims" element={<ProtectedRoute><Claims /></ProtectedRoute>} />
              <Route path="/claims/:id" element={<ProtectedRoute><Claim /></ProtectedRoute>} />
              <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminRoute><Navigate to="/admin/dashboard" replace /></AdminRoute>} />
              <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/policies" element={<AdminRoute><AdminPolicies /></AdminRoute>} />
              <Route path="/admin/claims" element={<AdminRoute><AdminClaims /></AdminRoute>} />
              <Route path="/admin/payments" element={<AdminRoute><AdminPayments /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
