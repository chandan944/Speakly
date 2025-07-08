import { type InputHTMLAttributes } from "react";
import clsx from "clsx";

interface CustomInputProps extends InputHTMLAttributes<HTMLInputElement> {
  size?: "sm" | "md" | "lg";
  variant?: "outline" | "filled";
}

// ✨ Styled input
export const CustomInput = ({
  size = "md",
  variant = "outline",
  className,
  ...props
}: CustomInputProps) => {
  const base =
    "rounded-lg block w-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500";

  const variants = {
    outline: "border border-gray-300 bg-white text-black",
    filled: "bg-gray-100 border-none text-black",
  };

  const sizes = {
    sm: "text-sm px-3 py-1.5",
    md: "text-md px-4 py-2",
    lg: "text-lg px-5 py-3",
  };

  return (
    <input
      className={clsx(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
};
