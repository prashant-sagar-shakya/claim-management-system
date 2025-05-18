import { useEffect, useState, useRef } from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { gsap } from "gsap";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { theme, setAppTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && buttonRef.current) {
      gsap.from(buttonRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 0.5,
        ease: "back.out(1.7)",
      });
    }
  }, [mounted, buttonRef]);

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    if (theme === newTheme) return;

    if (typeof setAppTheme !== "function") {
      console.error(
        "setAppTheme is not available or not a function in ThemeToggle"
      );
      return;
    }

    setAppTheme(newTheme);

    if (buttonRef.current) {
      const iconsToAnimate =
        buttonRef.current.querySelectorAll<SVGElement>(".theme-icon");
      if (iconsToAnimate.length > 0) {
        gsap.to(iconsToAnimate, {
          rotate: "+=360",
          duration: 0.5,
          ease: "back.out(1.7)",
          stagger: 0.05,
        });
      }
    }
  };

  if (!mounted) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          ref={buttonRef}
          variant="ghost"
          size="icon"
          className="theme-toggle fixed bottom-6 right-6 rounded-full shadow-lg z-50 bg-background"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 theme-icon" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 theme-icon" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleThemeChange("light")}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("dark")}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange("system")}>
          <Laptop className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
