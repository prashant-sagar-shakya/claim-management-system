import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  CalendarIcon,
  CheckCircle,
  ArrowDownIcon,
  ArrowUpIcon,
} from "lucide-react";
import { paymentsAPI, Payment as PaymentType } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

const Payments = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    data: payments,
    isLoading,
    error,
  } = useQuery<PaymentType[], Error>({
    queryKey: ["userPayments"],
    queryFn: () => paymentsAPI.getUserPayments().then((res) => res.data),
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error loading payments",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const currentDate = new Date();
  const upcomingPayments =
    payments?.filter(
      (payment: PaymentType) =>
        payment.payment_date && new Date(payment.payment_date) > currentDate
    ) || [];
  const pastPayments =
    payments?.filter(
      (payment: PaymentType) =>
        payment.payment_date && new Date(payment.payment_date) <= currentDate
    ) || [];

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-1/3 bg-secondary/20 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <div className="h-6 w-1/2 bg-secondary/20 rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-12 bg-secondary/20 rounded-md"></div>
                  <div className="h-12 mt-4 bg-secondary/20 rounded-md"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <Button onClick={() => navigate("/policies")}>View Policies</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <ArrowUpIcon className="mr-2 h-4 w-4 text-amber-500" />
                Upcoming Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingPayments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingPayments.map((payment: PaymentType) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <CreditCard className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {payment.policy &&
                            typeof payment.policy_id === "object"
                              ? payment.policy_id.policy_type
                              : "Premium"}{" "}
                            Payment
                          </p>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {payment.payment_date
                              ? new Date(
                                  payment.payment_date
                                ).toLocaleDateString()
                              : "N/A"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${payment.amount?.toFixed(2) || "0.00"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {payment.payment_type || "N/A"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <CalendarIcon className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No upcoming payments scheduled
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <ArrowDownIcon className="mr-2 h-4 w-4 text-green-500" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pastPayments.length > 0 ? (
                <div className="space-y-4">
                  {pastPayments.map((payment: PaymentType) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                          <CheckCircle className="h-4 w-4 text-green-700 dark:text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {payment.policy &&
                            typeof payment.policy_id === "object"
                              ? payment.policy_id.policy_type
                              : "Premium"}{" "}
                            Payment
                          </p>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {payment.payment_date
                              ? new Date(
                                  payment.payment_date
                                ).toLocaleDateString()
                              : "N/A"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${payment.amount?.toFixed(2) || "0.00"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {payment.payment_type || "N/A"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <CreditCard className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No payment history found
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Add a payment method</p>
                  <p className="text-sm text-muted-foreground">
                    Set up automatic payments for your policies
                  </p>
                </div>
              </div>
              <Button variant="outline">Add Payment Method</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Payments;
