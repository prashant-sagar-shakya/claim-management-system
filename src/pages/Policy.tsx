
import { useEffect } from "react";
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
import { ArrowLeft, DownloadIcon, FileText, Calendar, DollarSign } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { policiesAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const Policy = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    data: policy,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["policy", id],
    queryFn: () => policiesAPI.getPolicy(id!).then((res) => res.data),
    enabled: !!id,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading policy",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

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

  if (!policy) {
    return (
      <MainLayout>
        <div className="space-y-4">
          <Button variant="outline" onClick={() => navigate('/policies')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Policies
          </Button>
          <Card>
            <CardContent className="py-10 flex flex-col items-center justify-center text-center">
              <FileText className="h-10 w-10 text-muted-foreground/50 mb-2" />
              <h3 className="text-lg font-semibold mb-1">Policy not found</h3>
              <p className="text-muted-foreground">The requested policy could not be found.</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <Button variant="outline" onClick={() => navigate('/policies')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Policies
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-2xl">Policy Details</CardTitle>
              <CardDescription>
                Policy #{id?.substring(0, 8)} - {policy.policy_type}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Coverage Information</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Type:</dt>
                      <dd className="text-sm font-medium">{policy.policy_type}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Coverage Amount:</dt>
                      <dd className="text-sm font-medium">${policy.coverage_amount.toLocaleString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Premium:</dt>
                      <dd className="text-sm font-medium">${policy.premium_amount}/month</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Status:</dt>
                      <dd>
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                          Active
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Date Information</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Start Date:</dt>
                      <dd className="text-sm font-medium">{new Date(policy.start_date).toLocaleDateString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">End Date:</dt>
                      <dd className="text-sm font-medium">{new Date(policy.end_date).toLocaleDateString()}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">Issued On:</dt>
                      <dd className="text-sm font-medium">{new Date(policy.createdAt).toLocaleDateString()}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">{policy.description}</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Policy Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" onClick={() => navigate(`/claims/new?policy=${id}`)}>
                  File a Claim
                </Button>
                <Button variant="outline" className="w-full">
                  <DownloadIcon className="mr-2 h-4 w-4" /> Download Policy
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Payment Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex justify-between items-center border-b last:border-0 pb-2 last:pb-0">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">${policy.premium_amount}</span>
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
