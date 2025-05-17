
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatsCard from "@/components/dashboard/stats-card";
import { Button } from "@/components/ui/button";
import {
  Users,
  FileText,
  FileQuestion,
  CreditCard,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { policiesAPI, claimsAPI, paymentsAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const AdminDashboard = () => {
  const statsRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch all policies
  const {
    data: policies,
    isLoading: isPoliciesLoading,
    error: policiesError,
  } = useQuery({
    queryKey: ["adminPolicies"],
    queryFn: () => policiesAPI.getAllPolicies().then((res) => res.data),
    retry: 1,
  });

  // Fetch all claims
  const {
    data: claims,
    isLoading: isClaimsLoading,
    error: claimsError,
  } = useQuery({
    queryKey: ["adminClaims"],
    queryFn: () => claimsAPI.getAllClaims().then((res) => res.data),
    retry: 1,
  });

  // Fetch all payments
  const {
    data: payments,
    isLoading: isPaymentsLoading,
    error: paymentsError,
  } = useQuery({
    queryKey: ["adminPayments"],
    queryFn: () => paymentsAPI.getAllPayments().then((res) => res.data),
    retry: 1,
  });

  useEffect(() => {
    // Display any API errors
    if (policiesError) {
      toast({
        title: "Error loading policies",
        description: "Please try again later.",
        variant: "destructive",
      });
    }

    if (claimsError) {
      toast({
        title: "Error loading claims",
        description: "Please try again later.",
        variant: "destructive",
      });
    }

    if (paymentsError) {
      toast({
        title: "Error loading payments",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  }, [policiesError, claimsError, paymentsError, toast]);

  useEffect(() => {
    // GSAP animations
    const tl = gsap.timeline();

    // Welcome text animation
    tl.from(".welcome-text", {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: "power3.out",
    });

    // Stats cards staggered animation
    gsap.from(".stat-card", {
      opacity: 0,
      y: 30,
      stagger: 0.1,
      duration: 0.6,
      ease: "power3.out",
      scrollTrigger: {
        trigger: statsRef.current,
        start: "top 80%",
      },
    });

    // Charts animation
    gsap.from(".chart-card", {
      opacity: 0,
      y: 20,
      stagger: 0.15,
      duration: 0.5,
      ease: "power2.out",
      scrollTrigger: {
        trigger: chartsRef.current,
        start: "top 80%",
      },
    });

    return () => {
      tl.kill();
    };
  }, []);

  // Stats calculations
  const totalUsers = 124; // Mock data
  const totalPolicies = policies?.length || 0;
  const pendingClaims = claims?.filter((claim: any) => claim.status === "Pending")?.length || 0;
  const totalRevenue = payments?.reduce((sum: number, payment: any) => sum + payment.amount, 0) || 0;

  // Mock data for demonstration
  const recentUsers = [
    { id: "u1", name: "John Doe", email: "john@example.com", joinedAt: new Date().toISOString() },
    { id: "u2", name: "Jane Smith", email: "jane@example.com", joinedAt: new Date(Date.now() - 86400000).toISOString() },
    { id: "u3", name: "Mike Johnson", email: "mike@example.com", joinedAt: new Date(Date.now() - 172800000).toISOString() },
  ];

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome section */}
        <div className="welcome-text">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of the entire insurance management system
          </p>
        </div>

        {/* Stats overview */}
        <div ref={statsRef} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="stat-card">
            <StatsCard
              title="Total Users"
              value={totalUsers}
              icon={<Users className="h-4 w-4" />}
              colorClass="bg-blue-500/10 text-blue-500"
              description="Registered users"
            />
          </div>
          <div className="stat-card">
            <StatsCard
              title="Active Policies"
              value={totalPolicies}
              icon={<FileText className="h-4 w-4" />}
              colorClass="bg-primary/10 text-primary"
              description="Total active policies"
            />
          </div>
          <div className="stat-card">
            <StatsCard
              title="Pending Claims"
              value={pendingClaims}
              icon={<FileQuestion className="h-4 w-4" />}
              colorClass="bg-amber-500/10 text-amber-500"
              description="Claims awaiting review"
            />
          </div>
          <div className="stat-card">
            <StatsCard
              title="Total Revenue"
              value={`$${totalRevenue.toLocaleString()}`}
              icon={<CreditCard className="h-4 w-4" />}
              colorClass="bg-green-500/10 text-green-500"
              description="From premium payments"
            />
          </div>
        </div>

        {/* Recent activity and charts */}
        <div ref={chartsRef} className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Recent Users */}
          <Card className="chart-card">
            <CardHeader className="pb-2">
              <CardTitle>Recent Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(user.joinedAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => window.location.href = "/admin/users"}>
                View All Users
              </Button>
            </CardContent>
          </Card>

          {/* Recent Claims */}
          <Card className="chart-card">
            <CardHeader className="pb-2">
              <CardTitle>Pending Claims</CardTitle>
            </CardHeader>
            <CardContent>
              {isClaimsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-secondary/20 animate-pulse rounded-md"></div>
                  ))}
                </div>
              ) : claims?.filter((claim: any) => claim.status === "Pending").slice(0, 3).length > 0 ? (
                <div className="space-y-4">
                  {claims
                    ?.filter((claim: any) => claim.status === "Pending")
                    .slice(0, 3)
                    .map((claim: any) => (
                      <div
                        key={claim.id}
                        className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            Claim #{claim.id.substring(0, 8)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            ${claim.claim_amount} - {new Date(claim.claim_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => window.location.href = `/admin/claims/${claim.id}`}>
                          Review
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full mt-4" onClick={() => window.location.href = "/admin/claims"}>
                      View All Claims
                    </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileQuestion className="h-10 w-10 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">
                    No pending claims
                  </p>
                  <Button variant="outline" onClick={() => window.location.href = "/admin/claims"}>
                    View All Claims
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Revenue Trend */}
          <Card className="chart-card col-span-1 lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle>System Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-secondary/10 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium">Active Users</p>
                    <div className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center">
                      <ChevronUp className="h-3 w-3 mr-0.5" />
                      12%
                    </div>
                  </div>
                  <p className="text-2xl font-bold">98</p>
                  <p className="text-xs text-muted-foreground mt-1">From 124 total</p>
                </div>
                
                <div className="bg-secondary/10 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium">Claims Approval Rate</p>
                    <div className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center">
                      <ChevronUp className="h-3 w-3 mr-0.5" />
                      5%
                    </div>
                  </div>
                  <p className="text-2xl font-bold">78%</p>
                  <p className="text-xs text-muted-foreground mt-1">This month</p>
                </div>
                
                <div className="bg-secondary/10 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium">Policy Renewals</p>
                    <div className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center">
                      <ChevronDown className="h-3 w-3 mr-0.5" />
                      3%
                    </div>
                  </div>
                  <p className="text-2xl font-bold">92%</p>
                  <p className="text-xs text-muted-foreground mt-1">Renewal rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
