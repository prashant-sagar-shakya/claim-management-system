import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Clock,
  FileQuestion,
  CalendarIcon as LucideCalendarIcon,
  UserCircle as UserIcon,
  Briefcase,
  ThumbsUp,
  ThumbsDown,
  Loader2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  claimsAPI,
  Claim as ClaimType,
  Policy as PolicyType,
  User as UserType,
} from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

interface PopulatedPolicyInAdminClaim
  extends Omit<PolicyType, "_id" | "id" | "policyholder_id" | "created_by"> {
  _id: string;
  id: string;
}
interface PopulatedUserInAdminClaim extends Omit<UserType, "_id" | "id"> {
  _id: string;
  id: string;
}
interface AdminViewClaimType
  extends Omit<ClaimType, "policy_id" | "policyholder_id" | "user"> {
  policy_id: PopulatedPolicyInAdminClaim | string;
  policyholder_id: PopulatedUserInAdminClaim | string;
}

const AdminViewClaimContent: React.FC<{ claimId: string }> = ({ claimId }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const {
    data: claim,
    isLoading,
    error,
    isError,
  } = useQuery<AdminViewClaimType, Error>({
    queryKey: ["adminViewClaim", claimId],
    queryFn: async () => {
      if (!claimId || claimId === "undefined" || claimId.trim() === "") {
        throw new Error("Invalid Claim ID for fetching.");
      }
      const response = await claimsAPI.getClaim(claimId); // This should fetch populated data if backend sends it
      return response.data as AdminViewClaimType; // Cast if your ClaimType isn't specific enough for admin view
    },
    enabled: !!claimId && claimId !== "undefined" && claimId.trim() !== "",
    retry: 1,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      currentClaimId,
      status,
      reason,
    }: {
      currentClaimId: string;
      status: "Approved" | "Rejected";
      reason?: string;
    }) => claimsAPI.updateClaimStatus(currentClaimId, status, reason),
    onSuccess: (data) => {
      toast({
        title: "Status Updated",
        description: `Claim #${(
          data.data.claim_number || data.data.id
        ).substring(0, 8)} status changed to ${data.data.status}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["adminAllClaims"] });
      queryClient.invalidateQueries({ queryKey: ["adminViewClaim", claimId] });
      setShowRejectDialog(false);
      setRejectionReason("");
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Could not update claim status.",
        variant: "destructive",
      });
    },
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

  const handleApproveClaim = () => {
    if (claim)
      updateStatusMutation.mutate({
        currentClaimId: claim.id,
        status: "Approved",
      });
  };

  const handleConfirmRejectClaim = () => {
    if (claim) {
      updateStatusMutation.mutate({
        currentClaimId: claim.id,
        status: "Rejected",
        reason: rejectionReason || undefined,
      });
    }
  };

  const getStatusBadge = (status: ClaimType["status"] | undefined) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 border-green-200 dark:bg-green-700/30 dark:text-green-300 dark:border-green-600"
          >
            {" "}
            <CheckCircle className="mr-1 h-3 w-3" /> Approved{" "}
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-200 dark:bg-red-700/30 dark:text-red-300 dark:border-red-600"
          >
            {" "}
            <AlertCircle className="mr-1 h-3 w-3" /> Rejected{" "}
          </Badge>
        );
      case "paid":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-700/30 dark:text-blue-300 dark:border-blue-600"
          >
            {" "}
            <CheckCircle className="mr-1 h-3 w-3" /> Paid{" "}
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-700/30 dark:text-yellow-300 dark:border-yellow-600"
          >
            {" "}
            <Clock className="mr-1 h-3 w-3" /> {status || "Pending"}{" "}
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  if (isError || !claim) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-4 text-xl font-semibold">Claim Not Found</h2>
        <p className="mt-2 text-muted-foreground">
          {error?.message || "The requested claim could not be found."}
        </p>
        <Button onClick={() => navigate("/admin/claims")} className="mt-6">
          {" "}
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Claims List{" "}
        </Button>
      </div>
    );
  }

  const policyDetails =
    claim.policy_id && typeof claim.policy_id === "object"
      ? (claim.policy_id as PopulatedPolicyInAdminClaim)
      : null;
  const userDetails =
    claim.policyholder_id && typeof claim.policyholder_id === "object"
      ? (claim.policyholder_id as PopulatedUserInAdminClaim)
      : null;

  return (
    <div className="space-y-6">
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Reject Claim #
              {claim.claim_number?.substring(0, 8) || claim.id.substring(0, 8)}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this claim. This may be
              visible to the policyholder.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Rejection reason (optional)..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="min-h-[100px]"
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRejectionReason("")}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRejectClaim}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Confirm Reject"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button variant="outline" onClick={() => navigate("/admin/claims")}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Claims List
      </Button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">
                  Claim Details: #
                  {claim.claim_number?.substring(0, 8) ||
                    claim.id.substring(0, 8)}
                </CardTitle>
                <CardDescription>
                  Filed on {new Date(claim.claim_date).toLocaleDateString()} by{" "}
                  {userDetails
                    ? `${userDetails.firstName} ${userDetails.lastName}`
                    : "N/A"}
                </CardDescription>
              </div>
              {getStatusBadge(claim.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Claimed Amount
                </h4>
                <p className="font-semibold">
                  ${claim.claim_amount.toLocaleString()}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Incident Date
                </h4>
                <p className="font-semibold">
                  {new Date(claim.incident_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Policy Type
                </h4>
                <p className="font-semibold">
                  {policyDetails?.policy_type || "N/A"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Policy Number
                </h4>
                <p className="font-semibold">
                  {policyDetails?.policy_number || "N/A"}
                </p>
              </div>
              <div className="md:col-span-2">
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Policyholder
                </h4>
                <p className="font-semibold">
                  {userDetails
                    ? `${userDetails.firstName} ${userDetails.lastName} (${userDetails.email})`
                    : "N/A"}
                </p>
              </div>
            </div>
            <Separator />
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                Description
              </h4>
              <p>{claim.description}</p>
            </div>
            {claim.status === "Rejected" && claim.rejection_reason && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Rejection Reason
                </h4>
                <p className="p-2 bg-red-50 dark:bg-red-900/20 rounded text-red-700 dark:text-red-300">
                  {claim.rejection_reason}
                </p>
              </div>
            )}
            {claim.processed_at && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Processed On
                </h4>
                <p>{new Date(claim.processed_at).toLocaleDateString()}</p>
              </div>
            )}
          </CardContent>
          {(claim.status === "Pending" || claim.status === "Under Review") && (
            <CardFooter className="border-t pt-4 flex justify-end space-x-2">
              <Button
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setShowRejectDialog(true)}
                disabled={updateStatusMutation.isPending}
              >
                <ThumbsDown className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button
                variant="outline"
                className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
                onClick={handleApproveClaim}
                disabled={updateStatusMutation.isPending}
              >
                <ThumbsUp className="mr-2 h-4 w-4" />
                Approve
              </Button>
            </CardFooter>
          )}
        </Card>
        <div className="space-y-6">
          {/* Supporting Documents Card can be added here */}
        </div>
      </div>
    </div>
  );
};

const AdminClaimPageWrapper = () => {
  const { claimId } = useParams<{ claimId: string }>(); // Changed from 'id'
  const navigate = useNavigate();

  if (
    claimId === undefined ||
    claimId === "undefined" ||
    claimId.trim() === ""
  ) {
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
          <Button variant="outline" onClick={() => navigate("/admin/claims")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Claims List
          </Button>
        </div>
      </MainLayout>
    );
  }
  return (
    <MainLayout>
      <div className="p-4 md:p-6 lg:p-8">
        <AdminViewClaimContent claimId={claimId} />
      </div>
    </MainLayout>
  );
};

export default AdminClaimPageWrapper;
