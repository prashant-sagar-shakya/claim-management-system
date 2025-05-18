import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { claimsAPI, Claim as ClaimType } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel, // <<< FormLabel IMPORT KARNA HAI
  FormMessage,
} from "@/components/ui/form";
import { Loader } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/auth-context";
import { MainLayout } from "@/components/layout/main-layout";

const formSchema = z.object({
  policy_id: z.string().min(1, {
    message: "Policy ID is required.",
  }),
  claim_amount: z.coerce.number().gt(0, {
    message: "Claim amount must be greater than 0.",
  }),
  incident_date: z.string().min(1, {
    // Added incident_date
    message: "Incident date is required.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  // Add supporting_documents field later if needed for file upload
});

const NewClaim = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const policyIdFromQuery = searchParams.get("policyId");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      policy_id: policyIdFromQuery || "",
      claim_amount: 0,
      incident_date: "",
      description: "",
    },
  });

  useEffect(() => {
    if (policyIdFromQuery) {
      form.setValue("policy_id", policyIdFromQuery);
    }
  }, [policyIdFromQuery, form]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    if (!isAuthenticated || !user?.id) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to file a claim.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      navigate("/login");
      return;
    }

    try {
      const claimPayload: Partial<ClaimType> = {
        ...values,
        user_id: user.id, // Corresponds to policyholder_id in backend
        claim_date: new Date().toISOString(),
        // If your backend expects status, set a default:
        // status: "Pending",
      };
      await claimsAPI.createClaim(claimPayload); // Removed `any` cast if CreateClaimData matches
      toast({
        title: "Claim Submitted",
        description: "Your claim has been submitted successfully.",
        variant: "default",
      });
      navigate("/claims");
    } catch (error: any) {
      console.error("Submit Claim Error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to submit claim. Please try again.";
      toast({
        title: "Error Submitting Claim",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="container max-w-2xl mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>File a New Claim</CardTitle>
            <CardDescription>
              Please provide the details for your insurance claim.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="policy_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Policy ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter the Policy ID for this claim"
                          disabled={isSubmitting || !!policyIdFromQuery} // Disable if pre-filled
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="claim_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Claim Amount ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 500.00"
                          step="0.01"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="incident_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Incident</FormLabel>
                      <FormControl>
                        <Input type="date" disabled={isSubmitting} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description of Incident</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide a detailed description of the incident and the reason for the claim."
                          rows={5}
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Submitting Claim...
                    </>
                  ) : (
                    "Submit Claim"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default NewClaim;
