import { forwardRef, type ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  variant?: 'white' | 'glass' | 'slate'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  children?: ReactNode
  className?: string
  hoverScale?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(({ 
  variant = 'white', 
  padding = 'md', 
  className, 
  children,
  hoverScale = false,
  ...props 
}, ref) => {
  const variants = {
    white: "!bg-white !border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)]",
    glass: "!bg-white/80 !border-white shadow-xl",
    slate: "!bg-slate-50 !border-slate-200"
  }

  const paddings = {
    none: "!p-0",
    sm: "!p-3",
    md: "!p-5",
    lg: "!p-7",
    xl: "!p-10"
  }

  return (
    <motion.div
      ref={ref}
      {...props}
      whileHover={undefined}
      className={cn(
        "relative !rounded-[2rem] border transition-all duration-200",
        variants[variant],
        paddings[padding],
        className
      )}
    >
      {children}
    </motion.div>
  )
})

Card.displayName = 'Card'

export default Card
