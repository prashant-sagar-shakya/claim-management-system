import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Search,
  Filter,
  Eye,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { policiesAPI, Policy as PolicyType, User as UserType } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const AdminPolicies = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const {
    data: policies,
    isLoading,
    error,
    isError,
  } = useQuery<PolicyType[], Error>({
    queryKey: ["adminAllPolicies"],
    queryFn: () => policiesAPI.getAllPolicies().then((res) => res.data),
  });

  useEffect(() => {
    if (isError && error) {
      toast({
        title: "Error loading policies",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  const filteredPolicies =
    policies?.filter((policy) => {
      const user = policy.user;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (
          policy.policy_number?.toLowerCase() || policy.id.toLowerCase()
        ).includes(searchLower) ||
        (policy.policy_type?.toLowerCase() || "").includes(searchLower) ||
        (user?.firstName?.toLowerCase() || "").includes(searchLower) ||
        (user?.lastName?.toLowerCase() || "").includes(searchLower) ||
        (user?.email?.toLowerCase() || "").includes(searchLower);

      const matchesFilter =
        filterType === "all" || policy.policy_type === filterType;

      return matchesSearch && matchesFilter;
    }) || [];

  const policyTypes = policies
    ? [...new Set(policies.map((p) => p.policy_type).filter(Boolean))]
    : [];

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
          <FileText className="h-16 w-16 text-destructive mb-4" />
          <h3 className="text-xl font-semibold mb-2">Error Loading Policies</h3>
          <p className="text-muted-foreground mb-6">
            {error?.message || "Could not fetch policies data."}
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Manage Policies</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Insurance Policies</CardTitle>
            <CardDescription>
              View and manage all insurance policies in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Policy ID, Type, User..."
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
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filteredPolicies.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Policy No.</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Policyholder</TableHead>
                      <TableHead>Coverage</TableHead>
                      <TableHead>Premium</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPolicies.map((policy) => {
                      const user = policy.user;
                      return (
                        <TableRow key={policy.id}>
                          <TableCell className="font-mono text-xs">
                            {policy.policy_number?.substring(0, 12) ||
                              policy.id.substring(0, 8)}
                          </TableCell>
                          <TableCell>{policy.policy_type}</TableCell>
                          <TableCell>
                            {user
                              ? `${user.firstName} ${user.lastName}`
                              : "N/A"}
                            {user?.email && (
                              <span className="block text-xs text-muted-foreground">
                                {user.email}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            ${policy.coverage_amount?.toLocaleString()}
                          </TableCell>
                          <TableCell>${policy.premium_amount}/mo</TableCell>
                          <TableCell>
                            <Badge
                              variant={policy.is_active ? "default" : "outline"}
                              className={
                                policy.is_active
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }
                            >
                              {policy.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                navigate(`/admin/policies/${policy.id}`)
                              }
                              title="View Policy Details"
                            >
                              <Eye className="h-4 w-4" /> View
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
                <FileText className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <h3 className="text-lg font-semibold mb-1">
                  No policies found
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterType !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "There are currently no policies in the system."}
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
