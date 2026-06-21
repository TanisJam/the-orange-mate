import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius)] font-body font-medium transition-colors duration-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground disabled:border-border disabled:shadow-none cursor-pointer [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-neutral-black border-2 border-ink shadow-[var(--stroke-width)_var(--stroke-width)_0px_0px_hsl(var(--ink))] hover:bg-primary-light active:bg-primary-light active:shadow-none active:translate-x-[var(--stroke-width)] active:translate-y-[var(--stroke-width)]",
        secondary:
          "bg-secondary text-neutral-black border-2 border-ink shadow-[var(--stroke-width)_var(--stroke-width)_0px_0px_hsl(var(--ink))] hover:bg-secondary-light active:bg-secondary-light active:shadow-none active:translate-x-[var(--stroke-width)] active:translate-y-[var(--stroke-width)]",
        accent:
          "bg-accent text-white dark:text-neutral-black border-2 border-ink shadow-[var(--stroke-width)_var(--stroke-width)_0px_0px_hsl(var(--ink))] hover:bg-accent-light active:bg-accent-light active:shadow-none active:translate-x-[var(--stroke-width)] active:translate-y-[var(--stroke-width)]",
        outline:
          "bg-neutral-white text-neutral-black border-2 border-ink shadow-[var(--stroke-width)_var(--stroke-width)_0px_0px_hsl(var(--ink))] hover:text-secondary active:text-secondary active:shadow-none active:translate-x-[var(--stroke-width)] active:translate-y-[var(--stroke-width)]",
        destructive:
          "bg-error text-white border-2 border-ink shadow-[var(--stroke-width)_var(--stroke-width)_0px_0px_hsl(var(--ink))] hover:bg-error active:bg-error active:shadow-none active:translate-x-[var(--stroke-width)] active:translate-y-[var(--stroke-width)]",
        ghost: 
          "bg-transparent text-neutral-black dark:text-neutral-white border-none hover:bg-neutral-light hover:text-neutral-black dark:hover:bg-accent dark:hover:text-accent-foreground active:bg-neutral-gray active:text-white dark:active:bg-accent-light dark:active:text-neutral-black",
        link: 
          "bg-transparent text-primary border-none underline-offset-4 hover:underline active:text-primary-dark",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        default: "h-11 px-6 text-base",
        lg: "h-12 px-8 text-lg",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
