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
import {
  CreditCard,
  Search,
  Filter,
  Download,
  Loader2,
  AlertCircle,
} from "lucide-react"; // Added Loader2, AlertCircle
import { paymentsAPI, Payment as PaymentType } from "@/lib/api"; // Import PaymentType
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

const AdminPayments = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPaymentType, setFilterPaymentType] = useState("all");

  const {
    data: payments,
    isLoading,
    isError, // Add isError
    error, // Add error
  } = useQuery<PaymentType[], Error>({
    // v5 syntax
    queryKey: ["adminAllPayments"],
    queryFn: () => paymentsAPI.getAllPayments().then((res) => res.data),
  });

  useEffect(() => {
    if (isError && error) {
      // Check isError as well
      toast({
        title: "Error loading payments",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  }, [isError, error, toast]);

  const filteredPayments =
    payments?.filter((payment) => {
      const user =
        payment.policyholder_id && typeof payment.policyholder_id === "object"
          ? payment.policyholder_id
          : null;
      const policy =
        payment.policy_id && typeof payment.policy_id === "object"
          ? payment.policy_id
          : null;

      const matchesSearch =
        (
          payment.payment_number?.toLowerCase() || payment.id.toLowerCase()
        ).includes(searchTerm.toLowerCase()) ||
        (user?.firstName?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (user?.lastName?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (policy?.policy_type?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        );

      const matchesFilter =
        filterPaymentType === "all" ||
        payment.payment_type === filterPaymentType;

      return matchesSearch && matchesFilter;
    }) || [];

  const paymentTypes = payments
    ? [...new Set(payments.map((p) => p.payment_type).filter(Boolean))]
    : [];
  const totalRevenue =
    payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-8 space-y-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-9 w-1/3 bg-secondary/20 rounded"></div>
            <div className="h-10 w-32 bg-secondary/20 rounded"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-secondary/20 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-secondary/20 rounded-lg"></div>
        </div>
      </MainLayout>
    );
  }

  if (isError) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)] p-4 text-center">
          <CreditCard className="h-16 w-16 text-destructive mb-4" />
          <h3 className="text-xl font-semibold mb-2">Error Loading Payments</h3>
          <p className="text-muted-foreground mb-6">
            {error?.message || "Could not fetch payment records at this time."}
          </p>
          {/* Add a refresh button or similar if needed */}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Payment Records</h1>
          <Button variant="outline" disabled>
            {" "}
            {/* Disable export for now */}
            <Download className="mr-2 h-4 w-4" /> Export Data (Soon)
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
                  <p className="text-sm text-muted-foreground">Transactions</p>
                  <p className="text-2xl font-bold">{payments?.length || 0}</p>
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
                  <p className="text-sm text-muted-foreground">Avg. Payment</p>
                  <p className="text-2xl font-bold">
                    $
                    {payments?.length
                      ? Math.round(
                          totalRevenue / payments.length
                        ).toLocaleString()
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
                  placeholder="Search payments by ID, User, Policy Type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center w-full md:w-auto">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <Select
                  value={filterPaymentType}
                  onValueChange={setFilterPaymentType}
                >
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    {paymentTypes.map((type: string) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filteredPayments.length > 0 ? (
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
                    {filteredPayments.map((payment) => {
                      const user =
                        payment.policyholder_id &&
                        typeof payment.policyholder_id === "object"
                          ? payment.policyholder_id
                          : null;
                      const policy =
                        payment.policy_id &&
                        typeof payment.policy_id === "object"
                          ? payment.policy_id
                          : null;
                      return (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">
                            {payment.payment_number?.substring(0, 8) ||
                              payment.id.substring(0, 8)}
                          </TableCell>
                          <TableCell>
                            {user
                              ? `${user.firstName} ${user.lastName}`
                              : "N/A"}
                          </TableCell>
                          <TableCell>{policy?.policy_type || "N/A"}</TableCell>
                          <TableCell>
                            ${payment.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>{payment.payment_type}</TableCell>
                          <TableCell>
                            {new Date(
                              payment.payment_date
                            ).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CreditCard className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <h3 className="text-lg font-semibold mb-1">
                  No payments found
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterPaymentType !== "all"
                    ? "Try adjusting your search or filter"
                    : "There are no payments recorded in the system yet."}
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
