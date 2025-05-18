import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // useLocation removed if not used
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
  CheckCircle,
  AlertCircle,
  Clock,
  FileQuestion,
  CalendarIcon as LucideCalendarIcon,
  Loader2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { claimsAPI, Claim as ClaimType, Policy as PolicyType } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

// These interfaces might be better in a shared types file or in api.ts if consistently used
interface PopulatedPolicyInClaim
  extends Omit<PolicyType, "policyholder_id" | "created_by" | "_id" | "id"> {
  // Assuming PolicyType has id and not _id
  _id: string; // Backend might send _id for populated sub-docs, or id if transformed. Adjust as per actual API response.
  id: string; // Ensure 'id' is here if you expect it from backend transformation.
}

// This type is now complex. Ensure it matches exactly what your API returns for a claim
// when policy_id is populated. Your base ClaimType from api.ts already allows policy_id to be Policy.
// We can use ClaimType directly from api.ts if it's accurate.
// interface PopulatedClaim extends Omit<ClaimType, 'policy_id'> {
//     policy_id: PopulatedPolicyInClaim | string;
// }

const ClaimContent: React.FC<{ claimId: string }> = ({ claimId }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    data: claim,
    isLoading,
    error,
    isError,
    isFetching,
  } = useQuery<ClaimType, Error>({
    // V5: Single object argument
    queryKey: ["claim", claimId],
    queryFn: async () => {
      if (!claimId || claimId === "undefined" || claimId.trim() === "") {
        throw new Error("Invalid Claim ID for fetching.");
      }
      const response = await claimsAPI.getClaim(claimId);
      return response.data;
    },
    enabled: !!claimId && claimId !== "undefined" && claimId.trim() !== "",
    retry: 1,
  });

  useEffect(() => {
    if (isError && error && !!claimId) {
      toast({
        title: "Error loading claim",
        description: error.message || "Claim data could not be fetched.",
        variant: "destructive",
      });
    }
  }, [isError, error, toast, claimId]);

  const getStatusInfo = (status: ClaimType["status"] | undefined) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          color: "text-green-500",
          badge: (
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-700/20 dark:text-green-300">
              <CheckCircle className="mr-1 h-3 w-3" /> Approved
            </span>
          ),
        };
      case "rejected":
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          color: "text-red-500",
          badge: (
            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-700/20 dark:text-red-300">
              <AlertCircle className="mr-1 h-3 w-3" /> Rejected
            </span>
          ),
        };
      case "paid":
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          color: "text-blue-500",
          badge: (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-700/20 dark:text-blue-300">
              <CheckCircle className="mr-1 h-3 w-3" /> Paid
            </span>
          ),
        };
      default:
        return {
          icon: <Clock className="h-5 w-5" />,
          color: "text-yellow-500",
          badge: (
            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-700/20 dark:text-yellow-300">
              <Clock className="mr-1 h-3 w-3" /> {status || "Pending"}
            </span>
          ),
        };
    }
  };

  if (isLoading || isFetching) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !claim) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] p-8 text-center">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h3 className="text-xl font-semibold mb-2">Claim Not Found</h3>
        <p className="text-muted-foreground mb-6">
          {error?.message || "The requested claim could not be found."}
        </p>
        <Button variant="outline" onClick={() => navigate("/claims")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Claims
        </Button>
      </div>
    );
  }

  const statusInfo = getStatusInfo(claim.status);
  const policyDetails =
    claim.policy_id && typeof claim.policy_id === "object"
      ? claim.policy_id
      : null;

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate("/claims")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Claims
      </Button>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">
                  Claim #
                  {claim.claim_number?.substring(0, 8) ||
                    claim.id.substring(0, 8)}
                </CardTitle>
                <CardDescription>
                  Filed on {new Date(claim.claim_date).toLocaleDateString()}
                </CardDescription>
              </div>
              <div>{statusInfo.badge}</div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Claim Information
                </h3>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Amount:</dt>
                    <dd className="text-sm font-medium">
                      ${claim.claim_amount.toLocaleString()}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">
                      Claim Date:
                    </dt>
                    <dd className="text-sm font-medium">
                      {new Date(claim.claim_date).toLocaleDateString()}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">
                      Incident Date:
                    </dt>
                    <dd className="text-sm font-medium">
                      {new Date(claim.incident_date).toLocaleDateString()}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">
                      Policy Type:
                    </dt>
                    <dd className="text-sm font-medium">
                      {policyDetails?.policy_type || "N/A"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">
                      Policy No:
                    </dt>
                    <dd className="text-sm font-medium">
                      {policyDetails?.policy_number || "N/A"}
                    </dd>
                  </div>
                </dl>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Status Information
                </h3>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Status:</dt>
                    <dd>{statusInfo.badge}</dd>
                  </div>
                  {claim.processed_at && (
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">
                        Processed On:
                      </dt>
                      <dd className="text-sm font-medium">
                        {new Date(claim.processed_at).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                  {claim.status === "Rejected" && claim.rejection_reason && (
                    <div className="mt-2">
                      <dt className="text-sm text-muted-foreground">
                        Rejection Reason:
                      </dt>
                      <dd className="text-sm font-medium mt-1 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                        {claim.rejection_reason}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="text-sm font-medium mb-2">Claim Description</h3>
              <p className="text-sm text-muted-foreground">
                {claim.description}
              </p>
            </div>
          </CardContent>
        </Card>
        <div className="space-y-6"></div>
      </div>
    </div>
  );
};

const ClaimPageWrapper = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (id === undefined || id === "undefined" || id.trim() === "") {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] p-4 text-center">
          <FileQuestion className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            Invalid or Missing Claim ID
          </h3>
          <p className="text-muted-foreground mb-6">
            Please ensure you are accessing a valid claim.
          </p>
          <Button variant="outline" onClick={() => navigate("/claims")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Claims
          </Button>
        </div>
      </MainLayout>
    );
  }
  return (
    <MainLayout>
      <div className="p-4 md:p-6 lg:p-8">
        <ClaimContent claimId={id} />
      </div>
    </MainLayout>
  );
};

export default ClaimPageWrapper;
