import { type ButtonHTMLAttributes } from "react";
import clsx from "clsx"; // for class merging
import { LoadingSpinner } from "../loader/LoadingSpinner";
// import { LoadingSpinner } from "./LoadingSpinner";

// 🧠 Define props (extending native button attributes)
interface CustomButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "secondary" | "primary";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

// 🎯 Component
export const CustomButton = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  className,
  ...props
}: CustomButtonProps) => {
  const base =
    "rounded-xl font-semibold transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-black hover:bg-gray-300",
  };

  const sizes = {
    sm: "text-sm px-3 py-1.5",
    md: "text-md px-4 py-2",
    lg: "text-lg px-5 py-3",
  };

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <LoadingSpinner size="sm" /> : children}
    </button>
  );
};
