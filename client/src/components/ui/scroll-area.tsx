import * as React from "react"
import { cn } from "@/lib/utils"

// @ts-expect-error: simplified scroll area component
const ScrollArea = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    // @ts-expect-error: ref forwarding issue
    ref={ref}
    className={cn("overflow-auto", className)}
    {...props}
  >
    {children}
  </div>
))
ScrollArea.displayName = "ScrollArea"

export { ScrollArea }
