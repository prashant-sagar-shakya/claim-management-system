
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { useAuth } from "@/context/auth-context";
import Navbar from "./navbar";
import Sidebar from "./sidebar";
import { ThemeToggle } from "../theme-toggle";
import { Button } from "../ui/button";
import { User, LogOut, UserCircle } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Navbar>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <UserCircle className="h-5 w-5" />
                  <span className="sr-only">Open profile menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-2 py-1.5 text-sm font-medium">
                  {user?.firstName} {user?.lastName}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfileClick}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Navbar>
        
        <ScrollArea className="flex-1 p-4 md:p-8 main-content">
          {children}
        </ScrollArea>
      </div>
      
      <ThemeToggle />
    </div>
  );
}
