import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-none border px-1.5 py-0.5 font-departure text-[11px] leading-none tracking-wide uppercase whitespace-nowrap transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-muted text-foreground border-border [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        secondary: "bg-card text-muted-foreground border-border [a&]:hover:bg-muted",
        destructive: "bg-destructive/10 text-destructive border-destructive/30 [a&]:hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:bg-destructive/20",
        outline: "bg-transparent text-foreground border-border [a&]:hover:bg-muted",
        ghost: "border-transparent text-muted-foreground [a&]:hover:bg-muted [a&]:hover:text-foreground",
        link: "border-transparent text-primary underline-offset-4 [a&]:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
