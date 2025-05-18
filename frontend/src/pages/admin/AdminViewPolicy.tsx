import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FileText,
  Calendar,
  DollarSign,
  UserCircle,
  ShieldCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { policiesAPI, Policy as PolicyType, User as UserType } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

// Interface for populated policyholder in admin view if backend sends it
interface AdminViewPolicyType extends Omit<PolicyType, "user"> {
  user?: UserType; // Assuming backend might populate 'user' which is policyholder_id
}

const AdminViewPolicyContent: React.FC<{ policyId: string }> = ({
  policyId,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    data: policy,
    isLoading,
    error,
    isError,
  } = useQuery<AdminViewPolicyType, Error>({
    queryKey: ["adminViewPolicy", policyId],
    queryFn: async () => {
      if (!policyId || policyId === "undefined" || policyId.trim() === "") {
        throw new Error("Invalid Policy ID for fetching.");
      }
      // Backend needs GET /api/policies/:id that also populates user for admin if needed
      // Assuming policiesAPI.getPolicy can be used and returns necessary info including populated user.
      // Or a new adminGetPolicyById might be needed in api.ts for this specific admin view.
      const response = await policiesAPI.getPolicy(policyId);
      return response.data as AdminViewPolicyType;
    },
    enabled: !!policyId && policyId !== "undefined" && policyId.trim() !== "",
    retry: 1,
  });

  useEffect(() => {
    if (isError && error && !!policyId) {
      toast({
        title: "Error loading policy",
        description: error.message || "Policy data could not be fetched.",
        variant: "destructive",
      });
    }
  }, [isError, error, toast, policyId]);

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (isError || !policy) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-4 text-xl font-semibold">Policy Not Found</h2>
        <p className="mt-2 text-muted-foreground">
          {error?.message || "The requested policy could not be found."}
        </p>
        <Button onClick={() => navigate("/admin/policies")} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Policies
        </Button>
      </div>
    );
  }

  const policyholder = policy.user; // Already typed in AdminViewPolicyType

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate("/admin/policies")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Policies
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl">
                Policy: {policy.policy_type}
              </CardTitle>
            </div>
            <CardDescription>
              Policy Number:{" "}
              {policy.policy_number || policy.id.substring(0, 12)}
            </CardDescription>
            {getStatusBadge(policy.is_active)}
          </CardHeader>
          <CardContent className="space-y-4">
            <Separator />
            <div className="pt-2">
              <h3 className="text-md font-semibold text-muted-foreground mb-2">
                Policyholder Details
              </h3>
              {policyholder ? (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-md">
                  <UserCircle className="h-10 w-10 text-primary" />
                  <div>
                    <p className="font-medium">
                      {policyholder.firstName} {policyholder.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {policyholder.email}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Policyholder details not available.
                </p>
              )}
            </div>
            <Separator />
            <h3 className="text-md font-semibold text-muted-foreground mb-2">
              Coverage & Terms
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Coverage Amount</p>
                <p className="font-medium">
                  ${policy.coverage_amount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Premium</p>
                <p className="font-medium">${policy.premium_amount}/month</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium">
                  {new Date(policy.start_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="font-medium">
                  {new Date(policy.end_date).toLocaleDateString()}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-muted-foreground">Issued On</p>
                <p className="font-medium">
                  {new Date(policy.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                Description
              </h3>
              <p className="text-sm">
                {policy.description || "No description provided."}
              </p>
            </div>
            {/* Admin specific actions could be here: e.g., edit policy, deactivate */}
          </CardContent>
        </Card>
        <div className="space-y-6">
          {/* Could show related claims or payments for this policy */}
        </div>
      </div>
    </div>
  );
};

const getStatusBadge = (isActive: boolean) => {
  return isActive ? (
    <Badge
      variant="outline"
      className="border-green-600 text-green-700 dark:border-green-400 dark:text-green-300"
    >
      Active
    </Badge>
  ) : (
    <Badge variant="destructive">Inactive</Badge>
  );
};

const AdminViewPolicyPageWrapper = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (id === undefined || id === "undefined" || id.trim() === "") {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] p-4 text-center">
          <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            Invalid or Missing Policy ID
          </h3>
          <p className="text-muted-foreground mb-6">
            Please ensure you are accessing a valid policy.
          </p>
          <Button variant="outline" onClick={() => navigate("/admin/policies")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Policies
          </Button>
        </div>
      </MainLayout>
    );
  }
  return (
    <MainLayout>
      <div className="p-4 md:p-6 lg:p-8">
        <AdminViewPolicyContent policyId={id} />
      </div>
    </MainLayout>
  );
};

export default AdminViewPolicyPageWrapper;
