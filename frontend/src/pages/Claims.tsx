import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileQuestion,
  Plus,
} from "lucide-react";
import { claimsAPI, Claim as ClaimType } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const Claims = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    data: claims,
    isLoading,
    error,
  } = useQuery<ClaimType[], Error>({
    queryKey: ["userClaims"],
    queryFn: () => claimsAPI.getUserClaims().then((res) => res.data),
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading claims",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
            <CheckCircle className="mr-1 h-3 w-3" /> Approved
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-100">
            <AlertCircle className="mr-1 h-3 w-3" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
            <Clock className="mr-1 h-3 w-3" /> {status || "Pending"}
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-4 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="p-6">
                <div className="h-20 bg-secondary/20 rounded-md"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">My Claims</h1>
          <Button onClick={() => navigate("/claims/new")}>
            <Plus className="mr-2 h-4 w-4" /> File New Claim
          </Button>
        </div>

        {claims && claims.length > 0 ? (
          <div className="space-y-4">
            {claims.map((claim: ClaimType) => (
              <Card
                key={claim.id}
                className="shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
                onClick={() => navigate(`/claims/${claim.id}`)}
              >
                <div
                  className={`h-1 ${
                    claim.status === "Approved"
                      ? "bg-green-500"
                      : claim.status === "Rejected"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                  }`}
                ></div>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="space-y-1 mb-4 md:mb-0">
                      <p className="text-lg font-medium">
                        Claim #
                        {claim.claim_number
                          ? claim.claim_number.substring(0, 12)
                          : claim.id.substring(0, 8)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Filed on{" "}
                        {claim.claim_date
                          ? new Date(claim.claim_date).toLocaleDateString()
                          : "N/A"}{" "}
                        • ${claim.claim_amount?.toLocaleString() || "N/A"}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      {renderStatusBadge(claim.status)}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hidden md:flex"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-10 flex flex-col items-center justify-center text-center">
              <FileQuestion className="h-10 w-10 text-muted-foreground/50 mb-2" />
              <h3 className="text-lg font-semibold mb-1">No claims found</h3>
              <p className="text-muted-foreground mb-4">
                You haven't filed any insurance claims yet.
              </p>
              <Button onClick={() => navigate("/claims/new")}>
                File Your First Claim
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default Claims;
