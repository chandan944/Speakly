import { type ReactNode } from "react";

export function Title({ children }: { children: ReactNode }) {
  return <h2>{children}</h2>;
}
