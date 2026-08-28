import * as React from "react"

import { cn } from "@/lib/utils"

function AsciiBorder({
  className,
  withCorners = true,
  ...props
}: React.ComponentProps<"div"> & { withCorners?: boolean }) {
  return (
    <div
      data-slot="ascii-border"
      className={cn(
        "ascii-border p-6",
        withCorners && "ascii-plus",
        className
      )}
      {...props}
    />
  )
}

export { AsciiBorder }
