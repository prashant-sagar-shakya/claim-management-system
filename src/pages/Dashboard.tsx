
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatsCard from "@/components/dashboard/stats-card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  FileQuestion,
  CreditCard,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { policiesAPI, claimsAPI, paymentsAPI } from "@/lib/api";
import { useAuth } from "@/context/auth-context";

const Dashboard = () => {
  const statsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch user policies
  const {
    data: policies,
    isLoading: isPoliciesLoading,
    error: policiesError,
  } = useQuery({
    queryKey: ["userPolicies"],
    queryFn: () => policiesAPI.getUserPolicies().then((res) => res.data),
    retry: 1,
  });

  // Fetch user claims
  const {
    data: claims,
    isLoading: isClaimsLoading,
    error: claimsError,
  } = useQuery({
    queryKey: ["userClaims"],
    queryFn: () => claimsAPI.getUserClaims().then((res) => res.data),
    retry: 1,
  });

  // Fetch user payments
  const {
    data: payments,
    isLoading: isPaymentsLoading,
    error: paymentsError,
  } = useQuery({
    queryKey: ["userPayments"],
    queryFn: () => paymentsAPI.getUserPayments().then((res) => res.data),
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

    // Recent items cards staggered animation
    gsap.from(".recent-card", {
      opacity: 0,
      y: 20,
      stagger: 0.15,
      duration: 0.5,
      ease: "power2.out",
      scrollTrigger: {
        trigger: cardsRef.current,
        start: "top 80%",
      },
    });

    return () => {
      tl.kill();
    };
  }, []);

  // Mock data for demonstration (would be replaced by real API data)
  const activePolicies = policies?.length || 0;
  const pendingClaims = claims?.filter((claim: any) => claim.status === "Pending")?.length || 0;
  const recentPayments = payments?.length || 0;

  const recentPolicies = policies?.slice(0, 3) || [];
  const recentClaims = claims?.slice(0, 3) || [];
  const recentPaymentData = payments?.slice(0, 3) || [];

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome section */}
        <div className="welcome-text">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.firstName || "User"}!
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your insurance policies and recent activity.
          </p>
        </div>

        {/* Stats overview */}
        <div ref={statsRef} className="grid gap-4 md:grid-cols-3">
          <div className="stat-card">
            <StatsCard
              title="Active Policies"
              value={activePolicies}
              icon={<FileText className="h-4 w-4" />}
              colorClass="bg-primary/10 text-primary"
              description="Total active insurance policies"
            />
          </div>
          <div className="stat-card">
            <StatsCard
              title="Pending Claims"
              value={pendingClaims}
              icon={<FileQuestion className="h-4 w-4" />}
              colorClass="bg-amber-500/10 text-amber-500"
              description="Claims awaiting approval"
            />
          </div>
          <div className="stat-card">
            <StatsCard
              title="Recent Payments"
              value={recentPayments}
              icon={<CreditCard className="h-4 w-4" />}
              colorClass="bg-green-500/10 text-green-500"
              description="Payments made in the last 30 days"
            />
          </div>
        </div>

        {/* Recent activity section */}
        <div ref={cardsRef} className="grid gap-6">
          {/* Recent Policies */}
          <Card className="recent-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Policies</CardTitle>
              <Link to="/policies">
                <Button variant="ghost" size="sm" className="gap-1">
                  View all <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isPoliciesLoading ? (
                <p className="text-sm text-muted-foreground">Loading policies...</p>
              ) : recentPolicies.length > 0 ? (
                <div className="space-y-4">
                  {recentPolicies.map((policy: any) => (
                    <div
                      key={policy.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {policy.policy_type}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Coverage: ${policy.coverage_amount.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="text-sm font-medium">
                          ${policy.premium_amount}/mo
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Expires: {new Date(policy.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">
                    No policies found
                  </p>
                  <Button asChild size="sm">
                    <Link to="/policies">View Policies</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Claims */}
          <Card className="recent-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Claims</CardTitle>
              <Link to="/claims">
                <Button variant="ghost" size="sm" className="gap-1">
                  View all <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isClaimsLoading ? (
                <p className="text-sm text-muted-foreground">Loading claims...</p>
              ) : recentClaims.length > 0 ? (
                <div className="space-y-4">
                  {recentClaims.map((claim: any) => (
                    <div
                      key={claim.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Claim #{claim.id.substring(0, 8)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Filed: {new Date(claim.claim_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {claim.status === "Approved" ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                            <CheckCircle className="mr-1 h-3 w-3" /> Approved
                          </span>
                        ) : claim.status === "Rejected" ? (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-100">
                            <AlertCircle className="mr-1 h-3 w-3" /> Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                            <Clock className="mr-1 h-3 w-3" /> Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileQuestion className="h-10 w-10 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">
                    No claims found
                  </p>
                  <Button asChild size="sm">
                    <Link to="/claims">View Claims</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card className="recent-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Payments</CardTitle>
              <Link to="/payments">
                <Button variant="ghost" size="sm" className="gap-1">
                  View all <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {isPaymentsLoading ? (
                <p className="text-sm text-muted-foreground">Loading payments...</p>
              ) : recentPaymentData.length > 0 ? (
                <div className="space-y-4">
                  {recentPaymentData.map((payment: any) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Premium Payment
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {payment.payment_type}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="text-sm font-medium">
                          ${payment.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CreditCard className="h-10 w-10 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">
                    No payment history found
                  </p>
                  <Button asChild size="sm">
                    <Link to="/payments">View Payments</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
