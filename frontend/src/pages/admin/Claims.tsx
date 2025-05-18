import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
  FileQuestion,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Loader2,
} from "lucide-react"; // Added Loader2
import {
  claimsAPI,
  Claim as ClaimType,
  User as UserType,
  Policy as PolicyType,
} from "@/lib/api"; // Added UserType, PolicyType
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom"; // Added useNavigate

const AdminClaims = () => {
  const { toast } = useToast();
  const navigate = useNavigate(); // Initialize navigate
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedClaimForRejection, setSelectedClaimForRejection] =
    useState<ClaimType | null>(null);

  const {
    data: claims,
    isLoading,
    isError, // Added isError
    error, // Added error
  } = useQuery<ClaimType[], Error>({
    // v5 Syntax
    queryKey: ["adminAllClaims"],
    queryFn: () => claimsAPI.getAllClaims().then((res) => res.data),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      claimId,
      status,
      reason,
    }: {
      claimId: string;
      status: "Approved" | "Rejected";
      reason?: string;
    }) => claimsAPI.updateClaimStatus(claimId, status, reason),
    onSuccess: (data) => {
      toast({
        title: "Status Updated",
        description: `Claim #${(
          data.data.claim_number || data.data.id
        ).substring(0, 8)} status changed to ${data.data.status}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["adminAllClaims"] });
      queryClient.invalidateQueries({
        queryKey: ["adminViewClaim", data.data.id],
      });
      if (selectedClaimForRejection) setSelectedClaimForRejection(null);
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
    if (isError && error) {
      // Check isError
      toast({
        title: "Error loading claims",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  const handleApproveClaim = (claimId: string) => {
    updateStatusMutation.mutate({ claimId, status: "Approved" });
  };

  const handleOpenRejectDialog = (claim: ClaimType) => {
    setSelectedClaimForRejection(claim);
    setShowRejectDialog(true); // Make sure this state exists if you manage dialog visibility manually
  };

  const [showRejectDialog, setShowRejectDialog] = useState(false); // State for reject dialog

  const handleRejectClaim = () => {
    if (selectedClaimForRejection) {
      updateStatusMutation.mutate({
        claimId: selectedClaimForRejection.id,
        status: "Rejected",
        reason: rejectionReason || undefined,
      });
    }
  };

  const filteredClaims =
    claims?.filter((claim) => {
      const user =
        claim.policyholder_id && typeof claim.policyholder_id === "object"
          ? (claim.policyholder_id as UserType)
          : null;
      const policy =
        claim.policy_id && typeof claim.policy_id === "object"
          ? (claim.policy_id as PolicyType)
          : null;

      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (claim.claim_number?.toLowerCase() || claim.id.toLowerCase()).includes(
          searchLower
        ) ||
        (user?.firstName?.toLowerCase() || "").includes(searchLower) ||
        (user?.lastName?.toLowerCase() || "").includes(searchLower) ||
        (user?.email?.toLowerCase() || "").includes(searchLower) ||
        (policy?.policy_type?.toLowerCase() || "").includes(searchLower);

      const matchesFilter =
        filterStatus === "all" ||
        claim.status.toLowerCase() === filterStatus.toLowerCase();

      return matchesSearch && matchesFilter;
    }) || [];

  const renderStatusBadge = (status: ClaimType["status"] | undefined) => {
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
      <MainLayout>
        <div className="p-8 animate-pulse space-y-4">
          <div className="h-10 w-1/3 bg-secondary/20 rounded"></div>
          <div className="h-12 bg-secondary/20 rounded-md"></div>
          <div className="h-64 bg-secondary/20 rounded-md"></div>
        </div>
      </MainLayout>
    );
  }
  if (isError) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] p-4 text-center">
          <FileQuestion className="h-16 w-16 text-destructive mb-4" />
          <h3 className="text-xl font-semibold mb-2">Error Loading Claims</h3>
          <p className="text-muted-foreground mb-6">
            {error?.message || "Could not fetch claims data at this time."}
          </p>
          <Button
            variant="outline"
            onClick={() =>
              queryClient.refetchQueries({ queryKey: ["adminAllClaims"] })
            }
          >
            {" "}
            Try Again{" "}
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Reject Claim #
              {selectedClaimForRejection?.claim_number?.substring(0, 8) ||
                selectedClaimForRejection?.id?.substring(0, 8)}
              ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this claim. This reason may
              be visible to the policyholder. (Optional)
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Enter rejection reason (optional)..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="min-h-[100px]"
          />
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setRejectionReason("");
                setShowRejectDialog(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectClaim}
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

      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Manage Claims</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Claims</CardTitle>
            <CardDescription>
              {" "}
              View and manage insurance claims submitted by users{" "}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Claim ID, User, Policy..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center w-full md:w-auto">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filteredClaims.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Claim ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Policy Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date Filed</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right min-w-[220px]">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClaims.map((claim) => {
                      const user =
                        claim.policyholder_id &&
                        typeof claim.policyholder_id === "object"
                          ? (claim.policyholder_id as UserType)
                          : null;
                      const policy =
                        claim.policy_id && typeof claim.policy_id === "object"
                          ? (claim.policy_id as PolicyType)
                          : null;
                      const isProcessing =
                        updateStatusMutation.isPending &&
                        updateStatusMutation.variables?.claimId === claim.id;
                      return (
                        <TableRow key={claim.id}>
                          <TableCell className="font-medium">
                            {claim.claim_number?.substring(0, 8) ||
                              claim.id.substring(0, 8)}
                          </TableCell>
                          <TableCell>
                            {user
                              ? `${user.firstName} ${user.lastName}`
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            {policy ? policy.policy_type : "N/A"}
                          </TableCell>
                          <TableCell>
                            ${claim.claim_amount?.toLocaleString() || "N/A"}
                          </TableCell>
                          <TableCell>
                            {claim.claim_date
                              ? new Date(claim.claim_date).toLocaleDateString()
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            {renderStatusBadge(claim.status)}
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            {(claim.status === "Pending" ||
                              claim.status === "Under Review") && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:border-green-500 dark:hover:bg-green-700/30"
                                  onClick={() => handleApproveClaim(claim.id)}
                                  disabled={isProcessing}
                                >
                                  <ThumbsUp className="mr-1 h-3 w-3" /> Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:border-red-500 dark:hover:bg-red-700/30"
                                  onClick={() => handleOpenRejectDialog(claim)}
                                  disabled={isProcessing}
                                >
                                  <ThumbsDown className="mr-1 h-3 w-3" /> Reject
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                navigate(`/admin/claims/${claim.id}`)
                              }
                            >
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileQuestion className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <h3 className="text-lg font-semibold mb-1">No claims found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterStatus !== "all"
                    ? "Try adjusting your search or filter"
                    : "There are no claims to manage at this time."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminClaims;
