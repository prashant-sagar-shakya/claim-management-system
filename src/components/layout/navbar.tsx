
import { useState, useEffect } from "react";
import { gsap } from "gsap";
import { Menu } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import MobileSidebar from "./mobile-sidebar";

interface NavbarProps {
  children?: React.ReactNode;
  className?: string;
}

export default function Navbar({ children, className }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    // GSAP animation for navbar
    gsap.from("nav", {
      y: -50,
      opacity: 0,
      duration: 0.6,
      ease: "power3.out"
    });

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  return (
    <nav
      className={cn(
        "sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4 transition-all duration-200",
        scrolled && "shadow-sm",
        className
      )}
    >
      <div className="flex items-center gap-2 md:gap-4">
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0 sm:max-w-xs">
            <MobileSidebar />
          </SheetContent>
        </Sheet>

        <div className="hidden md:block text-xl font-bold">
          Insurance Portal
        </div>
      </div>
      
      {children}
    </nav>
  );
}
