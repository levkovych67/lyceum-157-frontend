import type { FormHTMLAttributes } from "react";
import { cn } from "@/shared/lib";
export function Form({ className, ...rest }: FormHTMLAttributes<HTMLFormElement>) {
  return <form noValidate className={cn("space-y-5", className)} {...rest} />;
}
