import { motion } from 'framer-motion'
import { LayoutDashboard, ChevronRight } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface OwnerAuthProps {
  pinInput: string
  isPinError: boolean
  onPinInput: (num: string) => void
  onClear: () => void
}

export const OwnerAuth = ({ pinInput, isPinError, onPinInput, onClear }: OwnerAuthProps) => {
  return (
    <div className="!flex !flex-col items-center justify-center !py-6 text-center !space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[440px] mx-auto w-full">
      <div className="!space-y-1">
        <div className="!mx-auto !my-2 w-20 h-20 bg-white/80 rounded-[1.5rem] flex items-center justify-center text-amber-600 border border-white shadow-xl">
           <LayoutDashboard size={40} />
        </div>
        <div>
          <h2 className="!text-xl !font-bold !text-slate-700 tracking-tight italic uppercase !my-0.75">Akses Owner</h2>
          <p className="!text-slate-500 !text-[10px] !font-bold !uppercase !tracking-[0.2em] !my-2 !opacity-60">Masukkan PIN untuk melanjutkan</p>
        </div>
      </div>

      <div className="!space-y-2">
        <motion.div 
          animate={isPinError ? { x: [-8, 8, -8, 8, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex gap-4 justify-center py-2"
        >
           {[...Array(6)].map((_, i) => (
             <div 
                key={i} 
                className={cn(
                  "w-4 h-4 rounded-full border-2 transition-all shadow-inner",
                  isPinError 
                    ? "bg-rose-500 border-rose-300" 
                    : pinInput.length > i 
                      ? "bg-amber-500 border-white scale-110" 
                      : "bg-slate-200/50 border-white"
                )} 
              />
           ))}
        </motion.div>
        {isPinError && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-rose-600 text-[10px] font-bold uppercase tracking-[0.2em] !my-1.5"
          >
            PIN Salah! Coba Lagi
          </motion.p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 w-full max-w-[320px] px-4">
         {[1,2,3,4,5,6,7,8,9].map(n => (
           <button 
            key={n} 
            onClick={() => onPinInput(n.toString())}
            className="aspect-square bg-white shadow-sm flex items-center justify-center rounded-[2rem] font-bold text-2xl text-slate-800 border border-slate-100 hover:bg-slate-50 active:scale-95 transition-all"
           >
             {n}
           </button>
         ))}
         <button 
          onClick={onClear}
          className="aspect-square flex items-center justify-center rounded-[2rem] font-bold text-[10px] text-slate-400 hover:text-slate-900 uppercase tracking-widest"
         >
           Clear
         </button>
         <button 
          onClick={() => onPinInput('0')}
          className="aspect-square bg-white shadow-sm flex items-center justify-center rounded-[2rem] font-bold text-2xl text-slate-800 border border-slate-100 hover:bg-slate-50 active:scale-95 transition-all"
         >
           0
         </button>
         <button className="aspect-square flex items-center justify-center rounded-[2rem] font-bold text-amber-500 hover:text-amber-600 transition-colors">
            <ChevronRight size={32} strokeWidth={3} />
         </button>
      </div>
    </div>
  )
}
