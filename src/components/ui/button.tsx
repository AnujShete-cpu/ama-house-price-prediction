import type { ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-display text-sm font-semibold transition-[background-color,box-shadow,color,transform,opacity] duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50 active:not-disabled:scale-[0.96]",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-fg shadow-sm hover:bg-primary-dark",
        navy: "bg-navy text-navy-fg hover:bg-navy-mid",
        outline:
          "bg-card text-fg shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]",
        ghost: "bg-transparent text-fg hover:bg-fg/6",
        danger: "bg-danger text-primary-fg hover:opacity-90",
        success: "bg-success text-primary-fg hover:opacity-90",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-11 px-4",
        lg: "h-12 px-5 text-[0.95rem]",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    staticPress?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  staticPress,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), staticPress && "active:scale-100", className)}
      {...props}
    />
  );
}

export { buttonVariants };
