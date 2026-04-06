import { type LucideIcon } from 'lucide-react'
import Card from '../ui/Card'
import { Label, Heading } from '../ui/Typography'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface StatCardProps {
  label: string
  value: string
  icon: LucideIcon
  trend?: string
  variant?: 'emerald' | 'amber' | 'blue'
  className?: string
}

const StatCard = ({
  label,
  value,
  icon: Icon,
  trend,
  variant = 'emerald',
  className
}: StatCardProps) => {
  const iconVariants = {
    emerald: "!bg-emerald-50 !text-emerald-600 !border-emerald-100/50",
    amber: "!bg-amber-50 !text-amber-600 !border-amber-100/50",
    blue: "!bg-sky-50 !text-sky-600 !border-sky-100/50"
  }

  return (
    <Card className={cn("flex flex-col !gap-6 group hoverScale !p-4", className)} hoverScale>
      <div className="flex justify-between items-start">
        <div className={cn("!w-14 !h-14 !rounded-2xl !flex !items-center !justify-center !border !shadow-sm !transition-transform group-hover:rotate-6", iconVariants[variant])}>
          <Icon size={28} strokeWidth={1.5} />
        </div>
        {trend && (
          <div className={cn(
            "!px-3 !py-1 !rounded-full !text-[9px] font-black tracking-widest border",
            trend.startsWith('+') ? "!bg-emerald-50 !text-emerald-600 !border-emerald-100" : "!bg-rose-50 !text-rose-600 !border-rose-100"
          )}>
            {trend}
          </div>
        )}
      </div>
      <div className="!space-y-1.5 text-left">
        <Label className="opacity-70 group-hover:opacity-100 transition-opacity">{label}</Label>
        <Heading as="p" className="group-hover:translate-x-1 transition-transform">{value}</Heading>
      </div>
    </Card>
  )
}

export default StatCard
