import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { GlitchChar } from "@/components/atoms/Ascii/Scramble"

type AlertVariant = "info" | "warning" | "danger" | "tip" | "note"

const VARIANTS: Record<AlertVariant, { marker: string; label: string; className: string }> = {
  info: { marker: "[i]", label: "info", className: "ascii-dashed-info bg-blue-500/5" },
  warning: { marker: "[!]", label: "warn", className: "ascii-dashed-warn bg-amber-500/5" },
  danger: { marker: "[!!]", label: "danger", className: "ascii-dashed-danger bg-red-500/5" },
  tip: { marker: "[*]", label: "tip", className: "ascii-dashed-tip bg-green-500/5" },
  note: { marker: "[#]", label: "note", className: "ascii-dashed-note bg-muted/40" },
}

const LABEL_COLORS: Record<AlertVariant, string> = {
  info: "text-blue-400",
  warning: "text-amber-400",
  danger: "text-red-400",
  tip: "text-green-400",
  note: "text-muted-foreground",
}

const CORNER_COLORS: Record<AlertVariant, string> = {
  info: "text-blue-400/60",
  warning: "text-amber-400/60",
  danger: "text-red-400/60",
  tip: "text-green-400/60",
  note: "text-muted-foreground/40",
}

function AlertCorner({ corner, variant }: { corner: "tl" | "tr" | "bl" | "br"; variant: AlertVariant }) {
  const pos: Record<typeof corner, React.CSSProperties> = {
    tl: { top: 0, left: 0, transform: "translate(-50%, -50%)" },
    tr: { top: 0, right: 0, transform: "translate(50%, -50%)" },
    bl: { bottom: 0, left: 0, transform: "translate(-50%, 50%)" },
    br: { bottom: 0, right: 0, transform: "translate(50%, 50%)" },
  }
  return (
    <span aria-hidden className={cn("absolute pointer-events-none", CORNER_COLORS[variant])} style={{ ...pos[corner], lineHeight: "1lh" }}>
      <GlitchChar target="+" />
    </span>
  )
}

const AlertContext = React.createContext<AlertVariant>("note")

const alertVariants = cva(
  "not-prose relative my-6 px-4 py-3.5 text-sm [&>div>p]:my-0",
  {
    variants: {
      variant: {
        info: VARIANTS.info.className,
        warning: VARIANTS.warning.className,
        danger: VARIANTS.danger.className,
        tip: VARIANTS.tip.className,
        note: VARIANTS.note.className,
        default: VARIANTS.note.className,
        destructive: VARIANTS.danger.className,
      },
    },
    defaultVariants: {
      variant: "note",
    },
  }
)

function Alert({
  className,
  variant = "note",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants> & { variant?: AlertVariant | "default" | "destructive" }) {
  // map default/destructive to note/danger for corner/label
  const v = (variant === "default" ? "note" : variant === "destructive" ? "danger" : variant) as AlertVariant
  return (
    <AlertContext.Provider value={v}>
      <div data-slot="alert" role="alert" className={cn(alertVariants({ variant }), className)} {...props}>
        <AlertCorner corner="tl" variant={v} />
        <AlertCorner corner="tr" variant={v} />
        <AlertCorner corner="bl" variant={v} />
        <AlertCorner corner="br" variant={v} />
        {props.children}
      </div>
    </AlertContext.Provider>
  )
}

function AlertTitle({ className, children, ...props }: React.ComponentProps<"div">) {
  const v = React.useContext(AlertContext)
  const { marker, label } = VARIANTS[v] ?? VARIANTS.note
  // children is the title after // — if no children, just marker row
  return (
    <div data-slot="alert-title" className={cn("font-departure text-ascii-sm uppercase tracking-widest", LABEL_COLORS[v], className)} {...props}>
      {marker} {label}
      {children ? <span className="font-mono normal-case tracking-normal text-foreground"> // {children}</span> : null}
    </div>
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-description" className={cn("mt-2 font-inter text-pretty leading-relaxed text-foreground", className)} {...props} />
}

export { Alert, AlertTitle, AlertDescription }
