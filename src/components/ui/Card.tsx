import { motion, type HTMLMotionProps } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ReactNode } from 'react'

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

const Card = ({ 
  variant = 'white', 
  padding = 'md', 
  className, 
  children,
  hoverScale = false,
  ...props 
}: CardProps) => {
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
      whileHover={undefined}
      className={cn(
        "relative !rounded-[2rem] border transition-all duration-200",
        variants[variant],
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default Card
