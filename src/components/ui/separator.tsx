"use client"

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
  const vRef = React.useRef<HTMLDivElement>(null);
  const [showPlus, setShowPlus] = React.useState(false);
  const [showDouble, setShowDouble] = React.useState(false);
  React.useEffect(() => {
    if (orientation !== "vertical") return;
    const el = vRef.current;
    if (!el) return;
    const upd = () => {
      const h = el.clientHeight;
      setShowPlus(h >= 64);
      setShowDouble(h >= 120);
    };
    upd();
    const ro = new ResizeObserver(upd);
    ro.observe(el);
    return () => ro.disconnect();
  }, [orientation]);

  if (orientation === "vertical") {
    return (
      <div
        ref={vRef}
        role={decorative ? "none" : "separator"}
        aria-orientation="vertical"
        data-slot="separator"
        data-orientation="vertical"
        className={cn(
          "shrink-0 w-[1ch] self-stretch relative overflow-hidden font-departure text-[14px] leading-[24px] text-border select-none whitespace-pre",
          "min-h-[24px]",
          className
        )}
        {...props}
      >
        <span aria-hidden className="absolute inset-0 flex flex-col items-center overflow-hidden">
          {showPlus && <span className="shrink-0 leading-none text-[14px] flex items-center justify-center" style={{ height: '1lh' }}>+</span>}
          {showDouble && <span className="shrink-0 leading-none text-[14px] flex items-center justify-center" style={{ height: '1lh' }}>+</span>}
          <span
            className="flex-1 min-h-0 w-full grid overflow-hidden justify-items-center content-start"
            style={{ gridAutoRows: '1lh' }}
          >
            {Array.from({ length: 40 }).map((_, i) => (
              <span key={i} className="leading-[24px] text-[14px] flex items-center justify-center" style={{ height: '1lh' }}>|</span>
            ))}
          </span>
          {showPlus && <span className="shrink-0 leading-none text-[14px] flex items-center justify-center" style={{ height: '1lh' }}>+</span>}
          {showDouble && <span className="shrink-0 leading-none text-[14px] flex items-center justify-center" style={{ height: '1lh' }}>+</span>}
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
        "shrink-0 w-full overflow-hidden font-departure text-border whitespace-pre select-none",
        "text-[14px] leading-[24px] tracking-[0px]",
        className
      )}
      {...props}
    >
      {/* plus line-height tight to glyph, dash fill stays 1lh */}
      <span aria-hidden className="flex w-full items-center">
        <span className="leading-none">+</span>
        <span className="flex-1 overflow-hidden leading-[24px]">{"-".repeat(300)}</span>
        <span className="leading-none">+</span>
      </span>
    </div>
  )
}

export { Separator }
