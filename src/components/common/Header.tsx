import { Menu } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Heading, Subheading } from '../ui/Typography'
import Button from '../ui/Button'
import Badge from '../ui/Badge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface HeaderProps {
  onMenuClick: () => void
  activeTab: 'staff' | 'owner'
  selectedCategory?: string
}

export const Header = ({ onMenuClick, activeTab, selectedCategory }: HeaderProps) => {
  const isManis = selectedCategory === 'manis' || !selectedCategory
  
  return (
    <header className={cn(
      "!pt-5 !pb-6 !px-7 flex justify-between items-center w-full sticky top-0 z-30 border-b shadow-sm transition-all duration-300",
      isManis ? "!bg-emerald-50 border-emerald-100/50" : "!bg-amber-50 border-amber-100/50"
    )}>
      <div className="flex items-center !gap-5">
        <Button 
          variant="white"
          size="sm"
          onClick={onMenuClick}
          className="!p-2.5 !bg-white !rounded-2xl shadow-sm border border-slate-100 text-slate-600 hover:bg-slate-50 h-11 w-11"
        >
          <Menu size={22} strokeWidth={2.5} />
        </Button>
        <div className="!text-left !py-1">
          <Heading as="h1" className={cn(
            "!text-2xl transition-colors duration-1000",
            isManis ? "!text-emerald-600" : "!text-amber-600"
          )}>SetiaRasa</Heading>
          <Subheading className="!mt-1.5 opacity-80 pl-0.5">POS System Martabak</Subheading>
        </div>
      </div>
      <div className="flex items-center !gap-3">
        <Badge variant={activeTab === 'staff' ? 'emerald' : 'amber'} className="!px-4 !py-2 !rounded-full shadow-sm text-[9px] font-black uppercase tracking-widest transition-all">
          {activeTab === 'owner' ? 'Owner Mode' : 'Kasir Melayani'}
        </Badge>
      </div>
    </header>
  )
}
