import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface TypographyProps {
  children: React.ReactNode
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'
}

export const Heading = ({ children, className, as: Component = 'h2' }: TypographyProps) => (
  <Component className={cn("!text-lg !font-bold !text-slate-900 uppercase italic tracking-widest", className)}>
    {children}
  </Component>
)

export const Subheading = ({ children, className, as: Component = 'p' }: TypographyProps) => (
  <Component className={cn("!text-[10px] !font-bold !text-slate-400 uppercase tracking-[0.2em]", className)}>
    {children}
  </Component>
)

export const Label = ({ children, className, as: Component = 'span' }: TypographyProps) => (
  <Component className={cn("!text-[9px] !font-bold !text-slate-500 uppercase tracking-widest", className)}>
    {children}
  </Component>
)
