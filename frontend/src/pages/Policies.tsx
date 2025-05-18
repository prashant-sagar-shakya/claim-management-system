import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Plus, ShieldCheck, Calendar } from "lucide-react";
import { policiesAPI, Policy as PolicyType } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const Policies = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    data: policies,
    isLoading,
    error,
    isError,
  } = useQuery<PolicyType[], Error>({
    // Correct v5 syntax
    queryKey: ["userPolicies"],
    queryFn: () => policiesAPI.getUserPolicies().then((res) => res.data),
  });

  useEffect(() => {
    if (isError && error) {
      toast({
        title: "Error loading policies",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  const handlePolicyClick = (policyId: string | undefined) => {
    if (policyId && policyId.trim() !== "" && policyId !== "undefined") {
      navigate(`/policies/${policyId}`);
    } else {
      console.error("Attempted to navigate with invalid policy ID:", policyId);
      toast({
        title: "Navigation Error",
        description:
          "Cannot view details for this policy due to an invalid ID.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-4 md:p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="h-9 w-48 bg-secondary/30 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-secondary/30 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card
                key={`loading-policy-${i}`}
                className="shadow-sm animate-pulse"
              >
                <CardHeader className="pb-2">
                  <div className="h-6 w-3/4 bg-secondary/20 rounded"></div>
                  <div className="h-4 w-1/2 bg-secondary/20 rounded mt-1"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mt-2">
                    <div className="h-5 w-full bg-secondary/20 rounded"></div>
                    <div className="h-5 w-full bg-secondary/20 rounded"></div>
                    <div className="h-5 w-2/3 bg-secondary/20 rounded"></div>
                    <div className="h-4 w-1/2 bg-secondary/20 rounded mt-3 pt-3 border-t border-transparent"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (isError) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] p-4 text-center">
          <FileText className="h-16 w-16 text-destructive mb-4" />
          <h3 className="text-xl font-semibold mb-2">Error Loading Policies</h3>
          <p className="text-muted-foreground mb-6">
            {error?.message || "Could not fetch your policies at this time."}
          </p>
          <Button variant="outline" onClick={() => navigate(0)}>
            {" "}
            Try Again{" "}
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">My Policies</h1>
          <Button onClick={() => navigate("/policies/new")}>
            <Plus className="mr-2 h-4 w-4" /> New Policy
          </Button>
        </div>

        {policies && policies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {policies.map((policy: PolicyType) => (
              <Card
                key={policy.id}
                className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handlePolicyClick(policy.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-primary/10 p-2 rounded-full mr-2">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {policy.policy_type}
                        </CardTitle>
                        <CardDescription>
                          Policy #
                          {policy.policy_number
                            ? policy.policy_number.substring(0, 12)
                            : policy.id
                            ? policy.id.substring(0, 8)
                            : "N/A"}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Coverage:</span>
                      <span className="font-medium">
                        ${policy.coverage_amount?.toLocaleString() || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Premium:</span>
                      <span className="font-medium">
                        ${policy.premium_amount?.toLocaleString() || "N/A"}
                        /month
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          policy.is_active
                            ? "bg-green-100 text-green-800 dark:bg-green-700/20 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-700/20 dark:text-red-300"
                        }`}
                      >
                        {policy.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-3 pt-3 border-t">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>
                          Expires:{" "}
                          {policy.end_date
                            ? new Date(policy.end_date).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-10 flex flex-col items-center justify-center text-center">
              <FileText className="h-10 w-10 text-muted-foreground/50 mb-2" />
              <h3 className="text-lg font-semibold mb-1">No policies found</h3>
              <p className="text-muted-foreground mb-4">
                You don't have any active insurance policies.
              </p>
              <Button onClick={() => navigate("/policies/new")}>
                Get Your First Policy
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default Policies;
