import { motion, type HTMLMotionProps } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ReactNode } from 'react'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface BadgeProps extends Omit<HTMLMotionProps<"span">, "children"> {
  variant?: 'emerald' | 'amber' | 'blue' | 'rose' | 'slate' | 'white'
  children?: ReactNode
  className?: string
}

const Badge = ({ 
  variant = 'emerald', 
  className, 
  children,
  ...props 
}: BadgeProps) => {
  const variants = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    blue: "bg-sky-50 text-sky-600 border-sky-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    slate: "bg-slate-50 text-slate-500 border-slate-100",
    white: "bg-white text-slate-900 border-slate-100 shadow-sm"
  }

  return (
    <motion.span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-[0.15em] border",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.span>
  )
}

export default Badge
