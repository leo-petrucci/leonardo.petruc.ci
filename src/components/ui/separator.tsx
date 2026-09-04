import * as React from "react"
import { cn } from "@/lib/utils"

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<"div"> & {
  orientation?: "horizontal" | "vertical"
  decorative?: boolean
}) {
  if (orientation === "vertical") {
    return (
      <div
        role={decorative ? "none" : "separator"}
        aria-orientation="vertical"
        data-slot="separator"
        data-orientation="vertical"
        className={cn(
          "shrink-0 w-[3px] self-stretch min-h-[24px] ascii-dashed-left relative",
          className
        )}
        {...props}
      >
        <span
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2 bg-black px-[2px] font-departure text-[14px] leading-none text-border pointer-events-none select-none"
          style={{ top: "-7px" }}
        >
          +
        </span>
        <span
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2 bg-black px-[2px] font-departure text-[14px] leading-none text-border pointer-events-none select-none"
          style={{ bottom: "-7px" }}
        >
          +
        </span>
      </div>
    )
  }

  return (
    <div
      role={decorative ? "none" : "separator"}
      aria-orientation="horizontal"
      data-slot="separator"
      data-orientation="horizontal"
      className={cn(
        "shrink-0 h-[3px] w-full ascii-dashed-bottom relative",
        className
      )}
      {...props}
    >
      <span
        aria-hidden
        className="absolute top-1/2 -translate-y-1/2 bg-black px-[2px] font-departure text-[14px] leading-none text-border pointer-events-none select-none"
        style={{ left: "-4.5px" }}
      >
        +
      </span>
      <span
        aria-hidden
        className="absolute top-1/2 -translate-y-1/2 bg-black px-[2px] font-departure text-[14px] leading-none text-border pointer-events-none select-none"
        style={{ right: "-4.5px" }}
      >
        +
      </span>
    </div>
  )
}

export { Separator }
