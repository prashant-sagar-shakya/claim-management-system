
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  CalendarIcon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { claimsAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const Claim = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    data: claim,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["claim", id],
    queryFn: () => claimsAPI.getClaim(id!).then((res) => res.data),
    enabled: !!id,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading claim",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Helper for status badges and colors
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "Approved":
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          color: "text-green-500",
          bgColor: "bg-green-500",
          lightBgColor: "bg-green-50",
          border: "border-green-200",
          badge: (
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
              <CheckCircle className="mr-1 h-3 w-3" /> Approved
            </span>
          )
        };
      case "Rejected":
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          color: "text-red-500",
          bgColor: "bg-red-500",
          lightBgColor: "bg-red-50",
          border: "border-red-200",
          badge: (
            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-100">
              <AlertCircle className="mr-1 h-3 w-3" /> Rejected
            </span>
          )
        };
      default:
        return {
          icon: <Clock className="h-5 w-5" />,
          color: "text-yellow-500",
          bgColor: "bg-yellow-500",
          lightBgColor: "bg-yellow-50",
          border: "border-yellow-200",
          badge: (
            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
              <Clock className="mr-1 h-3 w-3" /> Pending
            </span>
          )
        };
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-secondary/20 rounded-md w-1/4"></div>
          <div className="h-64 bg-secondary/20 rounded-md"></div>
        </div>
      </MainLayout>
    );
  }

  if (!claim) {
    return (
      <MainLayout>
        <div className="space-y-4">
          <Button variant="outline" onClick={() => navigate('/claims')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Claims
          </Button>
          <Card>
            <CardContent className="py-10 flex flex-col items-center justify-center text-center">
              <FileQuestion className="h-10 w-10 text-muted-foreground/50 mb-2" />
              <h3 className="text-lg font-semibold mb-1">Claim not found</h3>
              <p className="text-muted-foreground">The requested claim could not be found.</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const statusInfo = getStatusInfo(claim.status);

  return (
    <MainLayout>
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate('/claims')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Claims
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <div className={`h-1 ${statusInfo.bgColor}`}></div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Claim #{id?.substring(0, 8)}</CardTitle>
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
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Claim Information</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Amount:</dt>
                      <dd className="text-sm font-medium">${claim.claim_amount.toLocaleString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Claim Date:</dt>
                      <dd className="text-sm font-medium">{new Date(claim.claim_date).toLocaleDateString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Policy Type:</dt>
                      <dd className="text-sm font-medium">{claim.policy?.policy_type || "N/A"}</dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Status Information</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Status:</dt>
                      <dd>{statusInfo.badge}</dd>
                    </div>
                    {claim.processed_at && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-muted-foreground">Processed On:</dt>
                        <dd className="text-sm font-medium">{new Date(claim.processed_at).toLocaleDateString()}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium mb-2">Claim Description</h3>
                <p className="text-sm text-muted-foreground">{claim.description}</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Claim Timeline</CardTitle>
              </CardHeader>
              <CardContent className="relative pb-6">
                <div className="absolute left-4 top-0 bottom-0 border-l-2 border-dashed border-muted-foreground/20"></div>
                
                <div className="relative pl-10 pb-8">
                  <div className="absolute left-0 rounded-full bg-primary/20 p-1">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                  </div>
                  <h4 className="text-sm font-medium">Claim Filed</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(claim.claim_date).toLocaleString()}
                  </p>
                </div>
                
                {claim.status !== "Pending" && (
                <div className="relative pl-10 pb-8">
                  <div className="absolute left-0 rounded-full bg-primary/20 p-1">
                    <div className={`p-1 rounded-full ${claim.status === "Approved" ? "bg-green-100" : "bg-red-100"}`}>
                      {claim.status === "Approved" ? (
                        <CheckCircle className="h-3 w-3 text-green-700" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-red-700" />
                      )}
                    </div>
                  </div>
                  <h4 className="text-sm font-medium">Claim {claim.status}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {claim.processed_at ? new Date(claim.processed_at).toLocaleString() : "Date not available"}
                  </p>
                </div>
                )}
                
                {claim.status === "Pending" && (
                <div className="relative pl-10">
                  <div className="absolute left-0 rounded-full bg-yellow-100 p-1">
                    <Clock className="h-4 w-4 text-yellow-700" />
                  </div>
                  <h4 className="text-sm font-medium">Awaiting Review</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your claim is being reviewed by our team
                  </p>
                </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  If you have questions about your claim or need to provide additional information, please contact our support team.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Claim;
