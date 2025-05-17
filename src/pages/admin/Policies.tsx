
import { useEffect, useState } from "react";
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
import { FileText, Search, Plus, Filter } from "lucide-react";
import { policiesAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const AdminPolicies = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  
  // Fetch all policies
  const {
    data: policies,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["adminPolicies"],
    queryFn: () => policiesAPI.getAllPolicies().then((res) => res.data),
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

  // Filter and search policies
  const filteredPolicies = policies?.filter((policy: any) => {
    const matchesSearch = 
      policy.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.policy_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (policy.user?.firstName + ' ' + policy.user?.lastName).toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesFilter = filterType === "all" || policy.policy_type === filterType;
    
    return matchesSearch && matchesFilter;
  }) || [];

  // Unique policy types for filter
  const policyTypes = policies ? [...new Set(policies.map((p: any) => p.policy_type))] : [];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Manage Policies</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Policy
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>All Policies</CardTitle>
            <CardDescription>
              View and manage all insurance policies in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search policies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center w-full md:w-auto">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {policyTypes.map((type: string) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-secondary/20 animate-pulse rounded-md"></div>
                ))}
              </div>
            ) : filteredPolicies.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Policy ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Coverage</TableHead>
                      <TableHead>Premium</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPolicies.map((policy: any) => (
                      <TableRow key={policy.id}>
                        <TableCell className="font-medium">
                          {policy.id.substring(0, 8)}
                        </TableCell>
                        <TableCell>{policy.policy_type}</TableCell>
                        <TableCell>
                          {policy.user?.firstName} {policy.user?.lastName}
                        </TableCell>
                        <TableCell>${policy.coverage_amount.toLocaleString()}</TableCell>
                        <TableCell>${policy.premium_amount}/mo</TableCell>
                        <TableCell>
                          {new Date(policy.end_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => window.location.href = `/admin/policies/${policy.id}`}>
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <h3 className="text-lg font-semibold mb-1">No policies found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterType !== "all"
                    ? "Try adjusting your search or filter"
                    : "There are no policies in the system yet"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminPolicies;
