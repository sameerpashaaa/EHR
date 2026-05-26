import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-[38px] w-full rounded-[6px] border-[1.5px] border-[#e2e8f0] bg-white px-[12px] py-2 text-[13.5px] text-[#0f172a] placeholder:text-[#94a3b8] transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium focus:outline-none focus:border-[#22c55e] focus:ring-[3px] focus:ring-[#22c55e]/10 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
