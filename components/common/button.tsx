import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white shadow-sm shadow-blue-600/20 hover:bg-blue-500",
  secondary:
    "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-white",
  ghost: "text-slate-500 hover:bg-white hover:text-slate-900",
  danger: "bg-rose-600 text-white shadow-sm hover:bg-rose-500",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 rounded-lg px-3 text-xs",
  md: "h-10 gap-2 rounded-xl px-4 text-sm",
  icon: "h-9 w-9 rounded-xl p-0",
};

export function Button({
  children,
  className = "",
  icon,
  size = "md",
  variant = "secondary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
