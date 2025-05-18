import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { policiesAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/auth-context";

const formSchema = z.object({
  policy_type: z.string().min(2, {
    message: "Policy type must be at least 2 characters.",
  }),
  coverage_amount: z.coerce.number().min(1, {
    message: "Coverage amount must be greater than 0.",
  }),
  premium_amount: z.coerce.number().min(1, {
    message: "Premium amount must be greater than 0.",
  }),
  start_date: z.string().min(1, {
    message: "Start date must be selected.",
  }),
  end_date: z.string().min(1, {
    message: "End date must be selected.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
});

const NewPolicy = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      policy_type: "",
      coverage_amount: 0,
      premium_amount: 0,
      start_date: "",
      end_date: "",
      description: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    if (!isAuthenticated || !user?.id) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to create a policy.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      navigate("/login");
      return;
    }

    try {
      const policyPayload = {
        ...values,
        user_id: user.id,
      };
      await policiesAPI.createPolicy(policyPayload);
      toast({
        title: "Success",
        description: "Your policy has been created successfully.",
        variant: "default",
      });
      navigate("/policies");
    } catch (error: any) {
      console.error("Create Policy Error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create policy. Please try again.";
      toast({
        title: "Error Creating Policy",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create a New Policy</CardTitle>
          <CardDescription>
            Fill out the form below to create a new insurance policy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="policy_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Type</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Health, Auto, Home"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="coverage_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coverage Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 100000"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="premium_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Premium Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the policy coverage details"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Creating Policy
                  </>
                ) : (
                  "Create Policy"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewPolicy;
