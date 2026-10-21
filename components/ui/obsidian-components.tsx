import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SystemStatusTagProps {
  label?: string;
  pulseColor?: string;
  className?: string;
}

export function SystemStatusTag({
  label = "SYSTEM: FLIGHT CORRIDORS ACTIVE",
  pulseColor = "bg-[#ccff00]",
  className,
}: SystemStatusTagProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#ebebeb]/70",
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", pulseColor)} />
      <span>{label}</span>
    </div>
  );
}

interface NeonPulseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  children: React.ReactNode;
  className?: string;
}

export function NeonPulseButton({
  href,
  children,
  className,
  ...props
}: NeonPulseButtonProps) {
  const baseClasses = cn(
    "inline-flex items-center justify-center bg-[#ccff00] text-black font-bold font-sans rounded-full px-8 py-4 text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(204,255,0,0.3)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer",
    className
  );

  if (href) {
    return (
      <Link href={href} className={baseClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button className={baseClasses} {...props}>
      {children}
    </button>
  );
}

interface GlassFloatingCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: "normal" | "delayed" | "slow";
}

export function GlassFloatingCard({
  children,
  className,
  delay = "normal",
}: GlassFloatingCardProps) {
  const animationClass =
    delay === "delayed"
      ? "animate-float-delayed"
      : delay === "slow"
      ? "animate-float-slow"
      : "animate-float";

  return (
    <div
      className={cn(
        "bg-white/[0.03] backdrop-blur-[16px] border border-white/10 rounded-[1.5rem] p-6 shadow-2xl transition-all duration-300",
        animationClass,
        className
      )}
      style={{
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      {children}
    </div>
  );
}
