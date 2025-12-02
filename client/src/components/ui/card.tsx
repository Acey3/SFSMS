import React from "react";
import { cn } from "@/lib/utils";

export const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={cn("bg-white shadow-md rounded-2xl p-4", className)}>{children}</div>
);

export const CardHeader = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <div className={cn("border-b pb-2 mb-3", className)}>
    <h2 className="text-lg font-semibold">{children}</h2>
  </div>
);

export const CardContent = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => <div className={cn("text-gray-700", className)}>{children}</div>;

export const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xl font-bold mb-2">{children}</h2>
);
