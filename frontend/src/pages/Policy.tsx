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
  DownloadIcon,
  FileText,
  Calendar,
  DollarSign,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { policiesAPI, Policy as PolicyType } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const Policy = () => {
  const params = useParams<{ id: string }>();
  const policyId = params.id;

  const navigate = useNavigate();
  const { toast } = useToast();
  const [downloadingPolicy, setDownloadingPolicy] = useState(false);

  const queryEnabled =
    !!policyId && policyId !== "undefined" && policyId.trim() !== "";

  const {
    data: policy,
    isLoading,
    error,
    isError,
    isFetching,
  } = useQuery<PolicyType, Error>({
    // Single object argument
    queryKey: ["policy", policyId],
    queryFn: async () => {
      if (!policyId || policyId === "undefined" || policyId.trim() === "") {
        throw new Error("Invalid Policy ID for fetching.");
      }
      const response = await policiesAPI.getPolicy(policyId);
      return response.data;
    },
    enabled: queryEnabled,
    retry: 1,
  });

  useEffect(() => {
    if (isError && error && queryEnabled) {
      toast({
        title: "Error loading policy",
        description: error.message || "Policy data could not be fetched.",
        variant: "destructive",
      });
    }
  }, [isError, error, toast, queryEnabled]);

  const handleDownload = () => {
    if (!policy) return;
    setDownloadingPolicy(true);
    setTimeout(() => {
      try {
        const policyDetails = `
INSURANCE POLICY DOCUMENT
POLICY NUMBER: ${policy.policy_number || policy.id}
POLICY TYPE: ${policy.policy_type}
COVERAGE AMOUNT: $${policy.coverage_amount.toLocaleString()}
PREMIUM: $${policy.premium_amount} per month
DATES:
- Start Date: ${new Date(policy.start_date).toLocaleDateString()}
- End Date: ${new Date(policy.end_date).toLocaleDateString()}
- Issue Date: ${new Date(policy.createdAt).toLocaleDateString()}
DESCRIPTION:
${policy.description || "N/A"}
TERMS AND CONDITIONS:
[Default Terms and Conditions...]`;

        const blob = new Blob([policyDetails], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Policy-${
          policy.policy_number || policy.id.substring(0, 8)
        }.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast({ title: "Success", description: "Policy details downloaded." });
      } catch (err) {
        toast({ title: "Download failed", variant: "destructive" });
      } finally {
        setDownloadingPolicy(false);
      }
    }, 1500);
  };

  if (!policyId || policyId === "undefined" || policyId.trim() === "") {
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
          <Button variant="outline" onClick={() => navigate("/policies")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Policies
          </Button>
        </div>
      </MainLayout>
    );
  }

  if (isLoading || isFetching) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)] p-4 md:p-6 lg:p-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (isError || !policy) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] p-4 md:p-6 lg:p-8 text-center">
          <AlertCircle className="h-16 w-16 text-destructive mb-4" />
          <h3 className="text-xl font-semibold mb-2">Policy Not Found</h3>
          <p className="text-muted-foreground mb-6">
            {error?.message ||
              "The requested policy could not be found or there was an error loading it."}
          </p>
          <Button variant="outline" onClick={() => navigate("/policies")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Policies
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        <Button variant="outline" onClick={() => navigate("/policies")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Policies
        </Button>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-2xl">Policy Details</CardTitle>
              <CardDescription>
                Policy #{policy.policy_number || policy.id.substring(0, 8)} -{" "}
                {policy.policy_type}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Coverage Information
                  </h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Type:</dt>
                      <dd className="text-sm font-medium">
                        {policy.policy_type}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">
                        Coverage Amount:
                      </dt>
                      <dd className="text-sm font-medium">
                        ${policy.coverage_amount.toLocaleString()}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">
                        Premium:
                      </dt>
                      <dd className="text-sm font-medium">
                        ${policy.premium_amount}/month
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Status:</dt>
                      <dd>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            policy.is_active
                              ? "bg-green-100 text-green-800 dark:bg-green-700/20 dark:text-green-300"
                              : "bg-red-100 text-red-800 dark:bg-red-700/20 dark:text-red-300"
                          }`}
                        >
                          {policy.is_active ? "Active" : "Inactive"}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Date Information
                  </h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">
                        Start Date:
                      </dt>
                      <dd className="text-sm font-medium">
                        {new Date(policy.start_date).toLocaleDateString()}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">
                        End Date:
                      </dt>
                      <dd className="text-sm font-medium">
                        {new Date(policy.end_date).toLocaleDateString()}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">
                        Issued On:
                      </dt>
                      <dd className="text-sm font-medium">
                        {new Date(policy.createdAt).toLocaleDateString()}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="text-sm font-medium mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">
                  {policy.description || "No description provided."}
                </p>
              </div>
            </CardContent>
          </Card>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Policy Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="w-full"
                  onClick={() => navigate(`/claims/new?policyId=${policy.id}`)}
                >
                  File a Claim
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleDownload}
                  disabled={downloadingPolicy}
                >
                  <DownloadIcon className="mr-2 h-4 w-4" />{" "}
                  {downloadingPolicy ? "Preparing..." : "Download Policy"}
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Payment Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center border-b last:border-0 pb-2 last:pb-0"
                  >
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(
                          Date.now() + i * 30 * 24 * 60 * 60 * 1000
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        ${policy.premium_amount}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Policy;
