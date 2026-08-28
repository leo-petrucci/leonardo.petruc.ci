import * as React from "react"

import { cn } from "@/lib/utils"

function AsciiBorder({
  className,
  withCorners = true,
  flush = false,
  ...props
}: React.ComponentProps<"div"> & { withCorners?: boolean; flush?: boolean }) {
  return (
    <div
      data-slot="ascii-border"
      className={cn(
        flush ? "ascii-border-flush p-6" : "ascii-border p-6",
        withCorners && "ascii-plus",
        className
      )}
      {...props}
    />
  )
}

export { AsciiBorder }
