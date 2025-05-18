import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  policiesAPI,
  claimsAPI,
  paymentsAPI,
  authAPI,
  Policy as PolicyType,
  Claim as ClaimType,
  Payment as PaymentType,
  User as UserType,
} from "@/lib/api";

const AdminDashboard = () => {
  const welcomeRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    data: policies,
    isLoading: isPoliciesLoading,
    isError: isPoliciesError,
    error: policiesError,
  } = useQuery<PolicyType[], Error>({
    queryKey: ["adminDashboardPolicies"],
    queryFn: () => policiesAPI.getAllPolicies().then((res) => res.data),
    retry: 1,
  });

  const {
    data: claims,
    isLoading: isClaimsLoading,
    isError: isClaimsError,
    error: claimsError,
  } = useQuery<ClaimType[], Error>({
    queryKey: ["adminDashboardClaims"],
    queryFn: () => claimsAPI.getAllClaims().then((res) => res.data),
    retry: 1,
  });

  const {
    data: payments,
    isLoading: isPaymentsLoading,
    isError: isPaymentsError,
    error: paymentsError,
  } = useQuery<PaymentType[], Error>({
    queryKey: ["adminDashboardPayments"],
    queryFn: () => paymentsAPI.getAllPayments().then((res) => res.data),
    retry: 1,
  });

  const {
    data: allUsers,
    isLoading: isUsersLoading,
    isError: isUsersError,
    error: usersError,
  } = useQuery<UserType[], Error>({
    queryKey: ["adminDashboardAllUsers"],
    queryFn: () => authAPI.getAllUsers().then((res) => res.data),
    retry: 1,
  });

  useEffect(() => {
    if (policiesError)
      toast({
        title: "Error loading policies",
        description: policiesError.message || "Could not load policies.",
        variant: "destructive",
      });
    if (claimsError)
      toast({
        title: "Error loading claims",
        description: claimsError.message || "Could not load claims.",
        variant: "destructive",
      });
    if (paymentsError)
      toast({
        title: "Error loading payments",
        description: paymentsError.message || "Could not load payments.",
        variant: "destructive",
      });
    if (usersError)
      toast({
        title: "Error loading users",
        description: usersError.message || "Could not load users.",
        variant: "destructive",
      });
  }, [policiesError, claimsError, paymentsError, usersError, toast]);

  useEffect(() => {
    const allDataLoaded =
      !isPoliciesLoading &&
      !isClaimsLoading &&
      !isPaymentsLoading &&
      !isUsersLoading;
    let tl: gsap.core.Timeline | null = null;
    const stAnimations: gsap.core.Tween[] = [];

    if (allDataLoaded) {
      tl = gsap.timeline();
      if (welcomeRef.current) {
        tl.from(welcomeRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.6,
          ease: "power3.out",
        });
      }

      if (statsRef.current) {
        const anim = gsap.fromTo(
          statsRef.current.querySelectorAll(".stat-card"),
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.6,
            ease: "power3.out",
            scrollTrigger: { trigger: statsRef.current, start: "top 85%" },
          }
        );
        stAnimations.push(anim);
      }
      if (chartsRef.current) {
        const anim = gsap.fromTo(
          chartsRef.current.querySelectorAll(".chart-card"),
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.15,
            duration: 0.5,
            ease: "power2.out",
            scrollTrigger: { trigger: chartsRef.current, start: "top 85%" },
          }
        );
        stAnimations.push(anim);
      }
    }
    return () => {
      if (tl) tl.kill();
      stAnimations.forEach((anim) => anim.scrollTrigger?.kill());
    };
  }, [isPoliciesLoading, isClaimsLoading, isPaymentsLoading, isUsersLoading]);

  const totalUsersCount = allUsers?.length || 0;
  const totalPoliciesCount = policies?.length || 0;
  const pendingClaimsCount =
    claims?.filter(
      (claim) => claim.status === "Pending" || claim.status === "Under Review"
    )?.length || 0;
  const totalRevenue =
    payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

  const recentUsers = allUsers?.slice(0, 3) || []; // Show actual recent users
  const pendingClaimsForDashboard =
    claims
      ?.filter(
        (claim) => claim.status === "Pending" || claim.status === "Under Review"
      )
      .slice(0, 3) || [];

  if (
    isPoliciesLoading ||
    isClaimsLoading ||
    isPaymentsLoading ||
    isUsersLoading
  ) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-12 w-12 animate-spin" />
        </div>
      </MainLayout>
    );
  }
  if (isPoliciesError || isClaimsError || isPaymentsError || isUsersError) {
    return (
      <MainLayout>
        <div className="p-8 text-center text-red-500">
          Error loading dashboard data. Please try refreshing.
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8 p-4 md:p-6 lg:p-8">
        <div ref={welcomeRef} className="welcome-text">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            System-wide overview and key metrics.
          </p>
        </div>

        <div
          ref={statsRef}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          <div className="stat-card">
            <StatsCard
              title="Total Users"
              value={totalUsersCount}
              icon={<Users className="h-4 w-4" />}
              colorClass="bg-blue-500/10 text-blue-500"
              description="Registered system users"
            />
          </div>
          <div className="stat-card">
            <StatsCard
              title="Total Policies"
              value={totalPoliciesCount}
              icon={<FileText className="h-4 w-4" />}
              colorClass="bg-primary/10 text-primary"
              description="All active & inactive policies"
            />
          </div>
          <div className="stat-card">
            <StatsCard
              title="Pending Claims"
              value={pendingClaimsCount}
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
              description="From all payments"
            />
          </div>
        </div>

        <div ref={chartsRef} className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <Card className="chart-card">
            <CardHeader className="pb-2">
              <CardTitle>Recently Joined Users</CardTitle>
            </CardHeader>
            <CardContent>
              {recentUsers.length > 0 ? (
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-center text-muted-foreground py-4">
                  No recent users.
                </p>
              )}
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={() => navigate("/admin/users")}
              >
                View All Users
              </Button>
            </CardContent>
          </Card>

          <Card className="chart-card">
            <CardHeader className="pb-2">
              <CardTitle>Awaiting Claim Review</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingClaimsForDashboard.length > 0 ? (
                <div className="space-y-4">
                  {pendingClaimsForDashboard.map((claim) => (
                    <div
                      key={claim.id}
                      className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Claim #
                          {claim.claim_number
                            ? claim.claim_number.substring(0, 8)
                            : claim.id.substring(0, 8)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ${claim.claim_amount.toLocaleString()} -{" "}
                          {new Date(claim.claim_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/admin/claims/${claim.id}`)}
                      >
                        Review
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => navigate("/admin/claims")}
                  >
                    View All Claims
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileQuestion className="h-10 w-10 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">
                    No claims are currently pending review.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/admin/claims")}
                  >
                    View All Claims
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="chart-card col-span-1 lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle>System Stats (Placeholder)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-secondary/10 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium">Active Policies Trend</p>
                    <div className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center">
                      <ChevronUp className="h-3 w-3 mr-0.5" />
                      10%
                    </div>
                  </div>
                  <p className="text-2xl font-bold">
                    {policies?.filter((p) => p.is_active).length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Vs last month
                  </p>
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
                  <p className="text-xs text-muted-foreground mt-1">
                    This month (Sample)
                  </p>
                </div>
                <div className="bg-secondary/10 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium">New Users This Month</p>
                    <div className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center">
                      <ChevronDown className="h-3 w-3 mr-0.5" />
                      3%
                    </div>
                  </div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    (Sample Data)
                  </p>
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
