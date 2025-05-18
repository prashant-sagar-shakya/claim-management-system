import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
// ScrollTrigger yahaan se import karne ki zaroorat nahi agar main.tsx mein globally registered hai.
// Lekin agar aapko ScrollTrigger ke specific methods (jaise ScrollTrigger.getAll()) access karne hain,
// toh import karna padega: import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollTrigger } from "gsap/ScrollTrigger"; // Import if using ScrollTrigger.getAll()
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
import {
  policiesAPI,
  claimsAPI,
  paymentsAPI,
  Policy as PolicyType,
  Claim as ClaimType,
  Payment as PaymentType,
} from "@/lib/api";
import { useAuth } from "@/context/auth-context";

const Dashboard = () => {
  const statsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const welcomeRef = useRef<HTMLDivElement>(null); // Ref for welcome text

  const { toast } = useToast();
  const { user } = useAuth();

  const {
    data: policies,
    isLoading: isPoliciesLoading,
    error: policiesError,
  } = useQuery<PolicyType[], Error>({
    queryKey: ["userDashboardPolicies"],
    queryFn: () => policiesAPI.getUserPolicies().then((res) => res.data),
    retry: 1,
  });

  const {
    data: claims,
    isLoading: isClaimsLoading,
    error: claimsError,
  } = useQuery<ClaimType[], Error>({
    queryKey: ["userDashboardClaims"],
    queryFn: () => claimsAPI.getUserClaims().then((res) => res.data),
    retry: 1,
  });

  const {
    data: payments,
    isLoading: isPaymentsLoading,
    error: paymentsError,
  } = useQuery<PaymentType[], Error>({
    queryKey: ["userDashboardPayments"],
    queryFn: () => paymentsAPI.getUserPayments().then((res) => res.data),
    retry: 1,
  });

  useEffect(() => {
    if (policiesError) {
      toast({
        title: "Error loading policies",
        description: policiesError.message || "Please try again later.",
        variant: "destructive",
      });
    }
    if (claimsError) {
      toast({
        title: "Error loading claims",
        description: claimsError.message || "Please try again later.",
        variant: "destructive",
      });
    }
    if (paymentsError) {
      toast({
        title: "Error loading payments",
        description: paymentsError.message || "Please try again later.",
        variant: "destructive",
      });
    }
  }, [policiesError, claimsError, paymentsError, toast]);

  useEffect(() => {
    const allDataLoaded =
      !isPoliciesLoading && !isClaimsLoading && !isPaymentsLoading;
    let tl: gsap.core.Timeline | null = null;
    const stAnimations: gsap.core.Tween[] = [];

    if (allDataLoaded) {
      tl = gsap.timeline();
      if (welcomeRef.current) {
        // Use ref for welcome text
        tl.from(welcomeRef.current, {
          // Target ref directly
          opacity: 0,
          y: 20,
          duration: 0.6,
          ease: "power3.out",
        });
      }

      if (statsRef.current) {
        const statsCards = statsRef.current.querySelectorAll(".stat-card");
        if (statsCards.length > 0) {
          const anim = gsap.fromTo(
            statsCards,
            { opacity: 0, y: 30 },
            {
              opacity: 1,
              y: 0,
              stagger: 0.1,
              duration: 0.6,
              ease: "power3.out",
              scrollTrigger: { trigger: statsRef.current, start: "top 80%" },
            }
          );
          stAnimations.push(anim);
        }
      }

      if (cardsRef.current) {
        const recentCards = cardsRef.current.querySelectorAll(".recent-card");
        if (recentCards.length > 0) {
          const anim = gsap.fromTo(
            recentCards,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              stagger: 0.15,
              duration: 0.5,
              ease: "power2.out",
              scrollTrigger: { trigger: cardsRef.current, start: "top 80%" },
            }
          );
          stAnimations.push(anim);
        }
      }
    }

    return () => {
      if (tl) {
        tl.kill();
      }
      // Kill individual ScrollTrigger instances associated with specific animations
      stAnimations.forEach((anim) => {
        if (anim.scrollTrigger) {
          anim.scrollTrigger.kill();
        }
      });
      // Or, more globally but might affect other pages if not careful:
      // ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [isPoliciesLoading, isClaimsLoading, isPaymentsLoading]);

  const activePoliciesCount = policies?.length || 0;
  const pendingClaimsCount =
    claims?.filter((claim) => claim.status === "Pending")?.length || 0;
  const recentPaymentsCount = payments?.length || 0;

  const recentPolicies = policies?.slice(0, 3) || [];
  const recentClaimsData = claims?.slice(0, 3) || [];
  const recentPaymentData = payments?.slice(0, 3) || [];

  return (
    <MainLayout>
      <div className="space-y-8 p-4 md:p-6 lg:p-8">
        <div ref={welcomeRef} className="welcome-text">
          {" "}
          {/* Add ref here */}
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.firstName || "User"}!
          </h1>
          <p className="text-muted-foreground">
            Here's an overview of your insurance policies and recent activity.
          </p>
        </div>

        <div ref={statsRef} className="grid gap-4 md:grid-cols-3">
          {/* GSAP targets elements with "stat-card" class INSIDE this div */}
          <div className="stat-card">
            <StatsCard
              title="Active Policies"
              value={activePoliciesCount}
              icon={<FileText className="h-4 w-4" />}
              colorClass="bg-primary/10 text-primary"
              description="Total active insurance policies"
            />
          </div>
          <div className="stat-card">
            <StatsCard
              title="Pending Claims"
              value={pendingClaimsCount}
              icon={<FileQuestion className="h-4 w-4" />}
              colorClass="bg-amber-500/10 text-amber-500"
              description="Claims awaiting approval"
            />
          </div>
          <div className="stat-card">
            <StatsCard
              title="Recent Payments"
              value={recentPaymentsCount}
              icon={<CreditCard className="h-4 w-4" />}
              colorClass="bg-green-500/10 text-green-500"
              description="Payments activity overview"
            />
          </div>
        </div>

        <div ref={cardsRef} className="grid gap-6">
          {/* GSAP targets elements with "recent-card" class INSIDE this div */}
          <Card className="recent-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Policies</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/policies" className="flex items-center gap-1">
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isPoliciesLoading ? (
                <p className="text-sm text-muted-foreground">
                  Loading policies...
                </p>
              ) : recentPolicies.length > 0 ? (
                <div className="space-y-4">
                  {recentPolicies.map((policy) => (
                    <div
                      key={policy.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {policy.policy_type}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Coverage: ${policy.coverage_amount?.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="text-sm font-medium">
                          ${policy.premium_amount}/mo
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Expires:{" "}
                          {new Date(policy.end_date).toLocaleDateString()}
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
                    <Link to="/policies/new">Create New Policy</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="recent-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Claims</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/claims" className="flex items-center gap-1">
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isClaimsLoading ? (
                <p className="text-sm text-muted-foreground">
                  Loading claims...
                </p>
              ) : recentClaimsData.length > 0 ? (
                <div className="space-y-4">
                  {recentClaimsData.map((claim) => (
                    <div
                      key={claim.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Claim #
                          {claim.claim_number
                            ? claim.claim_number.substring(0, 8)
                            : claim.id.substring(0, 8)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Filed:{" "}
                          {new Date(claim.claim_date).toLocaleDateString()}
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
                            <Clock className="mr-1 h-3 w-3" />{" "}
                            {claim.status || "Pending"}
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
                    <Link to="/claims/new">File a Claim</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="recent-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Payments</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link to="/payments" className="flex items-center gap-1">
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isPaymentsLoading ? (
                <p className="text-sm text-muted-foreground">
                  Loading payments...
                </p>
              ) : recentPaymentData.length > 0 ? (
                <div className="space-y-4">
                  {recentPaymentData.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {payment.policy_id &&
                          typeof payment.policy_id === "object"
                            ? payment.policy_id.policy_type
                            : "Premium"}{" "}
                          Payment
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {payment.payment_type}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="text-sm font-medium">
                          ${payment.amount?.toFixed(2)}
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
