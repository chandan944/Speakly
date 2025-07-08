import clsx from "clsx";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
}

export const LoadingSpinner = ({ size = "md", color = "white" }: LoadingSpinnerProps) => {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-4",
  };

  return (
    <div
      className={clsx(
        "border-t-transparent border-solid rounded-full animate-spin",
        sizes[size]
      )}
      style={{ borderColor: `${color} transparent transparent transparent` }}
    />
  );
};
