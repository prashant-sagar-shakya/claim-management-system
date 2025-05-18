import { useState } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/auth-context";
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
import { ThemeToggle } from "@/components/theme-toggle";
import { BarChart2, Loader, ArrowLeft } from "lucide-react";
import { useEffect } from "react";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { forgotPassword } = useAuth();

  useEffect(() => {
    // GSAP animation for forgot password card
    gsap.from(".forgot-password-card", {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out",
    });
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      await forgotPassword(values.email);
      setIsSubmitted(true);

      // Animate
      gsap.to(".form-container", {
        opacity: 0,
        y: -20,
        duration: 0.5,
        onComplete: () => {
          gsap.to(".success-message", {
            opacity: 1,
            y: 0,
            duration: 0.5,
          });
        },
      });
    } catch (error) {
      // Error handling is done in the auth context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="mb-6 flex justify-center">
          <div className="flex items-center">
            <BarChart2 className="h-6 w-6 text-primary mr-2" />
            <h1 className="text-2xl font-bold">Insurance Portal</h1>
          </div>
        </div>

        <Card className="forgot-password-card">
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your
              password.
            </CardDescription>
          </CardHeader>

          {!isSubmitted ? (
            <div className="form-container">
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="your.email@example.com"
                              type="email"
                              autoComplete="email"
                              disabled={isLoading}
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
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />{" "}
                          Processing
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </div>
          ) : (
            <div className="success-message opacity-0 transform translate-y-4">
              <CardContent className="text-center py-8">
                <div className="bg-green-100 dark:bg-green-900/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-600 dark:text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Check your email</h3>
                <p className="text-muted-foreground mb-4">
                  We've sent a password reset link to your email address.
                </p>
              </CardContent>
            </div>
          )}

          <CardFooter className="flex justify-center border-t pt-4">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-primary hover:text-primary/80"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
