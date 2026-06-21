import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-[--radius] border-2 px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-primary-light",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-neutral-black dark:bg-primary-light dark:text-neutral-black",
        secondary:
          "border-transparent bg-secondary text-neutral-black dark:bg-secondary-light dark:text-neutral-black",
        destructive:
          "border-transparent bg-error text-white",
        outline: 
          "border-ink text-neutral-black dark:border-neutral-light dark:text-neutral-white",
        accent:
          "border-transparent bg-accent text-white dark:bg-accent-light dark:text-neutral-black",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
