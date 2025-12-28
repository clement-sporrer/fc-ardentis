import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-sport font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        // Primary - Electric Purple with glow
        default: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-lg hover:shadow-xl hover:shadow-primary/25",
        
        // Destructive
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg",
        
        // Outline - Clean border with hover fill
        outline: "border-2 border-primary/30 text-foreground bg-transparent hover:border-primary hover:bg-primary hover:text-primary-foreground",
        
        // Secondary - Deep navy
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover shadow-lg hover:shadow-xl",
        
        // Ghost - Subtle hover
        ghost: "hover:bg-muted hover:text-foreground",
        
        // Link - Underline on hover
        link: "text-primary underline-offset-4 hover:underline",
        
        // ===== PREMIUM VARIANTS =====
        
        // Gold - Championship CTA with shimmer
        gold: "relative overflow-hidden bg-gradient-to-r from-gold to-gold-dark text-gold-foreground font-bold shadow-lg hover:shadow-gold/40 hover:shadow-2xl before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700",
        
        // Glass - Glassmorphism effect
        glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:border-white/30 shadow-lg",
        
        // Glow - Purple with pulsing glow
        glow: "bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 animate-pulse-purple",
        
        // Premium - Dark with gold accent line
        premium: "relative bg-secondary text-secondary-foreground overflow-hidden after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:bg-gradient-to-r after:from-gold after:to-gold-dark hover:after:h-[4px] hover:shadow-xl",
        
        // Hero - Gradient background
        hero: "bg-gradient-to-r from-primary to-accent text-white font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02]",
        
        // CTA - Bold action button
        cta: "bg-gradient-to-r from-primary via-primary-hover to-accent text-white font-bold text-lg px-8 py-4 shadow-xl hover:shadow-2xl hover:scale-[1.02] animate-gradient bg-[length:200%_auto]",
        
        // CTA White - White button with accent hover
        ctaWhite: "bg-white text-secondary font-bold shadow-xl hover:bg-accent hover:text-white hover:shadow-2xl hover:scale-[1.02]",
        
        // Outline Glow - Border with glow effect
        outlineGlow: "border-2 border-primary text-primary bg-transparent hover:bg-primary/10 shadow-glow",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-4 text-sm",
        lg: "h-13 rounded-xl px-8 py-3 text-base",
        xl: "h-14 rounded-2xl px-10 py-4 text-lg",
        icon: "h-11 w-11",
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
