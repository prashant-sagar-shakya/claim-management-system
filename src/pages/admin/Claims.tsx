
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
import { Badge } from "@/components/ui/badge";
import { FileQuestion, Search, Filter, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { claimsAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const AdminClaims = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Fetch all claims
  const {
    data: claims,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["adminClaims"],
    queryFn: () => claimsAPI.getAllClaims().then((res) => res.data),
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading claims",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Filter and search claims
  const filteredClaims = claims?.filter((claim: any) => {
    const matchesSearch = 
      claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (claim.user?.firstName + ' ' + claim.user?.lastName).toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesFilter = filterStatus === "all" || claim.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  }) || [];

  // Helper for status badges
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="mr-1 h-3 w-3" /> Approved
          </Badge>
        );
      case "Rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
            <AlertCircle className="mr-1 h-3 w-3" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="mr-1 h-3 w-3" /> Pending
          </Badge>
        );
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Manage Claims</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>All Claims</CardTitle>
            <CardDescription>
              View and manage insurance claims submitted by users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search claims..."
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
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
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
            ) : filteredClaims.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Claim ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date Filed</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClaims.map((claim: any) => (
                      <TableRow key={claim.id}>
                        <TableCell className="font-medium">
                          {claim.id.substring(0, 8)}
                        </TableCell>
                        <TableCell>
                          {claim.user?.firstName} {claim.user?.lastName}
                        </TableCell>
                        <TableCell>${claim.claim_amount.toLocaleString()}</TableCell>
                        <TableCell>
                          {new Date(claim.claim_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {renderStatusBadge(claim.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" onClick={() => window.location.href = `/admin/claims/${claim.id}`}>
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
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
                    : "There are no claims in the system yet"}
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
