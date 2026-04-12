import { motion, type HTMLMotionProps } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ReactNode } from 'react'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: 'emerald' | 'amber' | 'white' | 'ghost' | 'slate'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
  children?: ReactNode
  className?: string
}

const Button = ({ 
  variant = 'emerald', 
  size = 'md', 
  fullWidth = false, 
  className, 
  children,
  ...props 
}: ButtonProps) => {
  const variants = {
    emerald: "!bg-emerald-600 !text-white !shadow-lg !shadow-emerald-500/20 !hover:bg-emerald-700 !border-emerald-500",
    amber: "!bg-amber-600 !text-white !shadow-lg !shadow-amber-500/20 !hover:bg-amber-700 !border-amber-500",
    white: "!bg-white !text-slate-700 !shadow-sm !hover:bg-slate-50 !border-slate-100",
    ghost: "!bg-transparent !text-slate-500 !hover:bg-slate-50 !border-transparent !shadow-none",
    slate: "!bg-slate-800 !text-white !shadow-lg !shadow-slate-900/10 !hover:bg-slate-900 !border-slate-700"
  }

  const sizes = {
    sm: "!px-4 !py-2 !text-[10px]",
    md: "!px-6 !py-3 !text-xs",
    lg: "!px-8 !py-4 !text-sm",
    xl: "!px-10 !py-5 !text-base"
  }

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={cn(
        "inline-flex items-center justify-center rounded-2xl font-bold uppercase tracking-widest transition-all border outline-none disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        fullWidth ? "w-full" : "",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
}

export default Button
