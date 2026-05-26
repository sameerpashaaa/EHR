import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "px-[8px] py-[2px] rounded-[4px] text-[11px] font-[600] border inline-flex items-center",
  {
    variants: {
      variant: {
        // Semantic ERP status variants
        default:
          "bg-[#f0fdf4] text-[#16a34a] border-[#dcfce7]",
        success:
          "bg-[#f0fdf4] text-[#16a34a] border-[#dcfce7]",
        warning:
          "bg-[#fffbeb] text-[#b45309] border-[#fef3c7]",
        destructive:
          "bg-[#fef2f2] text-[#dc2626] border-[#fecaca]",
        danger:
          "bg-[#fef2f2] text-[#dc2626] border-[#fecaca]",
        info:
          "bg-[#eff6ff] text-[#2563eb] border-[#dbeafe]",
        secondary:
          "bg-[#f8fafc] text-[#64748b] border-[#e2e8f0]",
        neutral:
          "bg-[#f8fafc] text-[#64748b] border-[#e2e8f0]",
        outline:
          "bg-transparent text-[#475569] border-[#e2e8f0]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
