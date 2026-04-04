import { Menu } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

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
      "!pt-5 !pb-6 flex justify-between items-center w-full sticky top-0 z-30 backdrop-blur-2xl border-b shadow-sm !px-7 transition-all duration-1000",
      isManis ? "!bg-emerald-50/80 border-emerald-100/50" : "!bg-amber-50/80 border-amber-100/50"
    )}>
      <div className="flex items-center !gap-5">
        <button 
          onClick={onMenuClick}
          className="!p-2.5 !bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-600 active:scale-95 transition-all hover:bg-slate-50"
        >
          <Menu size={22} strokeWidth={2.5} />
        </button>
        <div className="!text-left !py-1">
          <h1 className={cn(
            "!text-2xl !font-bold leading-none tracking-tight transition-colors duration-1000",
            isManis ? "!text-emerald-600" : "!text-amber-600"
          )}>SetiaRasa</h1>
          <p className="!text-[8px] !font-bold !text-slate-500 !uppercase !tracking-[0.25em] !mt-1.5 !opacity-80">PoS System Martabak</p>
        </div>
      </div>
      <div className="flex items-center !gap-3">
        <div className={cn(
          "!px-4 !py-1.5 !mr-1 rounded-full text-[9px] font-bold uppercase tracking-widest border shadow-sm transition-all",
          activeTab === 'staff' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
        )}>
          {activeTab === 'owner' ? 'Owner Mode' : 'Kasir Melayani'}
        </div>
      </div>
    </header>
  )
}
