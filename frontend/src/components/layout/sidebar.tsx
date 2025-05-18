
import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import {
  Home,
  FileText,
  CreditCard,
  BarChart2,
  FileQuestion,
  Settings,
  Users,
} from "lucide-react";

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === "admin";
  const basePathPrefix = isAdmin ? "/admin" : "";

  useEffect(() => {
    // GSAP animation for sidebar
    gsap.from(".sidebar", {
      x: -50,
      opacity: 0,
      duration: 0.5,
      ease: "power3.out"
    });
  }, []);

  const navItems = isAdmin
    ? [
        {
          name: "Dashboard",
          href: `${basePathPrefix}/dashboard`,
          icon: Home,
        },
        {
          name: "Policies",
          href: `${basePathPrefix}/policies`,
          icon: FileText,
        },
        {
          name: "Claims",
          href: `${basePathPrefix}/claims`,
          icon: FileQuestion,
        },
        {
          name: "Payments",
          href: `${basePathPrefix}/payments`,
          icon: CreditCard,
        },
        {
          name: "Users",
          href: `${basePathPrefix}/users`,
          icon: Users,
        },
        {
          name: "Settings",
          href: `${basePathPrefix}/settings`,
          icon: Settings,
        },
      ]
    : [
        {
          name: "Dashboard",
          href: `${basePathPrefix}/dashboard`,
          icon: Home,
        },
        {
          name: "Policies",
          href: `${basePathPrefix}/policies`,
          icon: FileText,
        },
        {
          name: "Claims",
          href: `${basePathPrefix}/claims`,
          icon: FileQuestion,
        },
        {
          name: "Payments",
          href: `${basePathPrefix}/payments`,
          icon: CreditCard,
        },
      ];

  return (
    <aside className="sidebar w-64 hidden md:block border-r shrink-0 h-screen sticky top-0 bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">Insurance Portal</span>
        </div>
      </div>
      
      <nav className="flex flex-col gap-1 p-4">
        {navItems.map((item, index) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "sidebar-item flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive
                  ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                  : "text-foreground"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
