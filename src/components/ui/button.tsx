import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-[600] rounded-[6px] transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[#22c55e]/20 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[#4CAF72] text-white hover:bg-[#45b368]",
        destructive:
          "bg-white text-[#dc2626] border border-[#fecaca] hover:bg-[#fef2f2]",
        outline:
          "bg-white text-[#475569] border border-[#e2e8f0] hover:bg-[#f8fafc]",
        secondary:
          "bg-white text-[#475569] border border-[#e2e8f0] hover:bg-[#f8fafc]",
        ghost:
          "text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]",
        link:
          "text-[#4CAF72] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[36px] px-[16px] py-[8px]",
        sm: "h-[32px] px-[12px] text-[12px]",
        lg: "h-[40px] px-[20px]",
        icon: "h-[36px] w-[36px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
