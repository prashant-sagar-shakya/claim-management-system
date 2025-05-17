
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { useAuth } from "@/context/auth-context";
import Navbar from "./navbar";
import Sidebar from "./sidebar";
import { ThemeToggle } from "../theme-toggle";
import { Button } from "../ui/button";
import { User, LogOut } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // GSAP animation for page elements
    const tl = gsap.timeline();
    tl.from(".main-content", {
      opacity: 0,
      y: 20,
      duration: 0.5,
      ease: "power2.out"
    });

    // Staggered animation for sidebar items
    gsap.from(".sidebar-item", {
      opacity: 0,
      x: -20,
      duration: 0.5,
      stagger: 0.1,
      ease: "power2.out"
    });

    return () => {
      tl.kill();
    };
  }, []);

  const handleLogout = () => {
    // GSAP animation for logout
    gsap.to(".main-content", {
      opacity: 0,
      y: -20,
      duration: 0.3,
      onComplete: () => {
        logout();
        navigate("/login");
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Navbar>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium hidden md:block">
                {user?.firstName} {user?.lastName}
              </span>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </Navbar>
        
        <ScrollArea className="flex-1 p-4 md:p-8 main-content">
          {children}
        </ScrollArea>
      </div>
    </div>
  );
}
