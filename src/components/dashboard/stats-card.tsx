
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  colorClass?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatsCard({
  title,
  value,
  description,
  icon,
  colorClass = "text-primary",
  trend,
}: StatsCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.from(cardRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: "power3.out",
      });
    }
  }, []);

  return (
    <Card ref={cardRef} className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn("rounded-full p-2", colorClass)}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <span
              className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-green-500" : "text-red-500"
              )}
            >
              {trend.isPositive ? "+" : "-"}
              {trend.value}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
