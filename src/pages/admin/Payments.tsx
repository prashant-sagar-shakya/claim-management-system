
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, Search, Filter, Download } from "lucide-react";
import { paymentsAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

const AdminPayments = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPaymentType, setFilterPaymentType] = useState("all");
  
  // Fetch all payments
  const {
    data: payments,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["adminPayments"],
    queryFn: () => paymentsAPI.getAllPayments().then((res) => res.data),
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading payments",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Filter and search payments
  const filteredPayments = payments?.filter((payment: any) => {
    const matchesSearch = 
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.user?.firstName + ' ' + payment.user?.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.policy?.policy_type || "").toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesFilter = filterPaymentType === "all" || payment.payment_type === filterPaymentType;
    
    return matchesSearch && matchesFilter;
  }) || [];

  // Unique payment types for filter
  const paymentTypes = payments ? [...new Set(payments.map((p: any) => p.payment_type))] : [];

  // Calculate total revenue
  const totalRevenue = payments?.reduce((sum: number, payment: any) => sum + payment.amount, 0) || 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Payment Records</h1>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export Data
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    ${totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-100 p-2 rounded-full text-green-700">
                  <CreditCard className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                  <p className="text-2xl font-bold">
                    {payments?.length || 0}
                  </p>
                </div>
                <div className="bg-blue-100 p-2 rounded-full text-blue-700">
                  <CreditCard className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold">
                    ${(totalRevenue * 0.35).toLocaleString()}
                  </p>
                </div>
                <div className="bg-yellow-100 p-2 rounded-full text-yellow-700">
                  <CreditCard className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Premium</p>
                  <p className="text-2xl font-bold">
                    $
                    {payments?.length
                      ? Math.round(totalRevenue / payments.length)
                      : 0}
                  </p>
                </div>
                <div className="bg-purple-100 p-2 rounded-full text-purple-700">
                  <CreditCard className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>All Payments</CardTitle>
            <CardDescription>
              View all premium payments made in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center w-full md:w-auto">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <Select value={filterPaymentType} onValueChange={setFilterPaymentType}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    {paymentTypes.map((type: string) => (
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
            ) : filteredPayments.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Policy</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment: any) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.id.substring(0, 8)}
                        </TableCell>
                        <TableCell>
                          {payment.user?.firstName} {payment.user?.lastName}
                        </TableCell>
                        <TableCell>{payment.policy?.policy_type || "N/A"}</TableCell>
                        <TableCell>${payment.amount.toLocaleString()}</TableCell>
                        <TableCell>{payment.payment_type}</TableCell>
                        <TableCell>
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CreditCard className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <h3 className="text-lg font-semibold mb-1">No payments found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterPaymentType !== "all"
                    ? "Try adjusting your search or filter"
                    : "There are no payments in the system yet"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminPayments;
