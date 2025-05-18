import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Shield, CheckCircle, ArrowRight, BarChart2 } from "lucide-react";

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP animations
    const timeline = gsap.timeline();

    // Hero section animation
    timeline.from(heroRef.current, {
      opacity: 0,
      y: 50,
      duration: 0.8,
      ease: "power3.out",
    });

    // Features animation
    gsap.from(".feature-card", {
      opacity: 0,
      y: 30,
      stagger: 0.2,
      duration: 0.6,
      scrollTrigger: {
        trigger: featuresRef.current,
        start: "top 80%",
      },
    });

    return () => {
      timeline.kill();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <header className="w-full h-16 border-b flex items-center justify-between px-4 md:px-8 bg-background">
        <div className="flex items-center">
          <BarChart2 className="h-6 w-6 text-primary mr-2" />
          <h1 className="text-lg font-bold">Insurance Portal</h1>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link to="/login">
            <Button variant="outline" size="sm">
              Login
            </Button>
          </Link>
          <Link to="/register">
            <Button size="sm">Register</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="flex flex-col md:flex-row items-center justify-between py-12 px-4 md:px-12 lg:px-24 gap-8 md:min-h-[500px]"
      >
        <div className="flex-1 space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Secure Your Future with Our Insurance Solutions
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg">
            Our comprehensive insurance management system provides peace of mind
            with transparent policies, easy claims, and instant support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Log In
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg transform rotate-3"></div>
            <Card className="relative transform -rotate-3 transition-all hover:rotate-0 duration-300">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Health Insurance</h3>
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Policy ID
                      </span>
                      <span className="text-sm font-medium">PL-12345</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Coverage
                      </span>
                      <span className="text-sm font-medium">$500,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Premium
                      </span>
                      <span className="text-sm font-medium">$200/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Status
                      </span>
                      <span className="inline-flex items-center text-sm font-medium text-green-500">
                        <CheckCircle className="h-3 w-3 mr-1" /> Active
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        ref={featuresRef}
        className="py-16 px-4 md:px-12 lg:px-24 bg-secondary/50"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Comprehensive Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our insurance management system provides everything you need to
            manage your policies, make claims, and track payments in one secure
            platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="feature-card">
            <CardContent className="p-6 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Policy Management</h3>
              <p className="text-muted-foreground">
                View and manage all your insurance policies in one place with
                detailed information and documentation.
              </p>
            </CardContent>
          </Card>

          <Card className="feature-card">
            <CardContent className="p-6 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <FileCheckIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Easy Claims</h3>
              <p className="text-muted-foreground">
                Submit claims quickly and track their status throughout the
                entire process with real-time updates.
              </p>
            </CardContent>
          </Card>

          <Card className="feature-card">
            <CardContent className="p-6 space-y-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <CreditCardIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Payment Tracking</h3>
              <p className="text-muted-foreground">
                Keep track of all your premium payments and get reminders for
                upcoming due dates.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 md:px-12 border-t">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <BarChart2 className="h-5 w-5 text-primary mr-2" />
            <span className="font-semibold">Insurance Portal &copy; 2025</span>
          </div>

          <div className="flex space-x-6">
            <a
              href="#"
              className="text-sm hover:text-primary transition-colors"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-sm hover:text-primary transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-sm hover:text-primary transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Custom Icon Components
function FileCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="m9 15 2 2 4-4" />
    </svg>
  );
}

function CreditCardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

export default Index;
