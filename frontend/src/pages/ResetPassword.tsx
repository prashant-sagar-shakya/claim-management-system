import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ArrowLeft, BarChart2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
// You'll need to create this API function in lib/api.ts
// import { authAPI } from "@/lib/api";

// Placeholder until authAPI.resetPassword is defined
const mockResetPasswordAPI = async (token: string, password: string) => {
  console.log(
    `Simulating password reset for token: ${token} with new password: ${password}`
  );
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay
  // Simulate success, or throw error for testing
  // throw new Error("Simulated token invalid or expired.");
  return {
    data: { success: true, message: "Password has been reset successfully." },
  };
};

const formSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

const ResetPassword = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null); // null: initial, true: valid, false: invalid
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );

  // You'll need an API endpoint to verify the token first (optional but good practice)
  // Or, resetPassword API itself can verify and return error if token is invalid/expired.
  // For this example, we'll assume resetPassword API handles token verification.
  // useEffect(() => {
  //   const verifyToken = async () => {
  //     if (!token) {
  //       setIsTokenValid(false);
  //       setVerificationError("Reset token is missing.");
  //       return;
  //     }
  //     try {
  //       // const response = await authAPI.verifyResetToken(token); // API call to verify token
  //       // setIsTokenValid(response.data.valid);
  //       // For now, assume token is valid for UI rendering
  //       setIsTokenValid(true);
  //     } catch (error: any) {
  //       setIsTokenValid(false);
  //       setVerificationError(error.response?.data?.message || error.message || "Invalid or expired token.");
  //     }
  //   };
  //   verifyToken();
  // }, [token]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!token) {
      toast({
        title: "Error",
        description: "Password reset token is missing.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      // Replace with actual API call: const response = await authAPI.resetPassword(token, values.password);
      const response = await mockResetPasswordAPI(token, values.password);

      if (response.data.success) {
        toast({ title: "Success", description: response.data.message });
        navigate("/login");
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Could not reset password.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          error.message ||
          "Failed to reset password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // UI when token validity is being checked or is invalid (optional step, remove if not needed)
  // if (isTokenValid === null && token) { // Still checking
  //   return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></div>;
  // }
  // if (isTokenValid === false || !token) {
  //   return (
  //     <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
  //       <AlertCircle className="h-12 w-12 text-destructive mb-4" />
  //       <h1 className="text-2xl font-bold mb-2">Invalid Link</h1>
  //       <p className="text-muted-foreground mb-6">{verificationError || "This password reset link is invalid or has expired."}</p>
  //       <Button asChild><Link to="/forgot-password">Request a new link</Link></Button>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="absolute top-4 right-4">
        {" "}
        <ThemeToggle />{" "}
      </div>
      <div className="mb-6 flex justify-center">
        <Link to="/" className="flex items-center">
          <BarChart2 className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-2xl font-bold">Insurance Portal</h1>
        </Link>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Your Password</CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Processing...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-primary hover:text-primary/80"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPassword;
