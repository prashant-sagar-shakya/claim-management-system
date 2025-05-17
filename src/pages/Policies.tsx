
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
import { policiesAPI, Policy } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const Policies = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch user policies
  const {
    data: policies,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userPolicies"],
    queryFn: () => policiesAPI.getUserPolicies().then((res) => res.data),
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading policies",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">My Policies</h1>
          <Button onClick={() => navigate("/policies/new")}>
            <Plus className="mr-2 h-4 w-4" /> New Policy
          </Button>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="shadow-sm">
                <CardContent className="p-6">
                  <div className="h-24 bg-secondary/20 animate-pulse rounded-md"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : policies?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {policies.map((policy: Policy) => (
              <Card 
                key={policy.id} 
                className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/policies/${policy.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-primary/10 p-2 rounded-full mr-2">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{policy.policy_type}</CardTitle>
                        <CardDescription>Policy #{policy.id.substring(0, 8)}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Coverage:</span>
                      <span className="font-medium">${policy.coverage_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Premium:</span>
                      <span className="font-medium">${policy.premium_amount}/month</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-3 pt-3 border-t">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Expires: {new Date(policy.end_date).toLocaleDateString()}</span>
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
              <p className="text-muted-foreground mb-4">You don't have any active insurance policies.</p>
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
