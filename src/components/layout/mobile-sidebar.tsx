
import { NavLink } from "react-router-dom";
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
import { ScrollArea } from "../ui/scroll-area";

export default function MobileSidebar() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const basePathPrefix = isAdmin ? "/admin" : "";

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
        {
          name: "Profile",
          href: `${basePathPrefix}/profile`,
          icon: Settings,
        },
      ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">Insurance Portal</span>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}
