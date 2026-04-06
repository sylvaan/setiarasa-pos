import { motion } from 'framer-motion'
import { LayoutDashboard, ChevronRight } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Heading, Subheading } from '../ui/Typography'
import Card from '../ui/Card'
import Button from '../ui/Button'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface OwnerAuthProps {
  pinInput: string
  isPinError: boolean
  onPinInput: (num: string) => void
  onClear: () => void
}

const OwnerAuth = ({ pinInput, isPinError, onPinInput, onClear }: OwnerAuthProps) => {
  return (
    <div className="!flex !flex-col items-center justify-center !py-6 text-center !space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[440px] mx-auto w-full">
      <div className="!space-y-1">
        <Card variant="white" padding="none" className="!mx-auto !my-2 w-20 h-20 rounded-[1.5rem] flex items-center justify-center text-amber-600 border border-white shadow-xl">
           <LayoutDashboard size={40} />
        </Card>
        <div>
          <Heading as="h2" className="!text-xl !my-0.75">Akses Owner</Heading>
          <Subheading className="!my-2 !opacity-60">Masukkan PIN untuk melanjutkan</Subheading>
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
           <Button 
            key={n} 
            variant="white"
            size="xl"
            onClick={() => onPinInput(n.toString())}
            className="aspect-square !bg-white shadow-sm !text-2xl !text-slate-800 !rounded-[2rem] border border-slate-100 !p-0"
           >
             {n}
           </Button>
         ))}
         <Button 
          variant="ghost"
          size="md"
          onClick={onClear}
          className="aspect-square !text-slate-400 hover:text-slate-900 border-none shadow-none"
         >
           Clear
         </Button>
         <Button 
          variant="white"
          size="xl"
          onClick={() => onPinInput('0')}
          className="aspect-square !bg-white shadow-sm !text-2xl !text-slate-800 !rounded-[2rem] border border-slate-100 !p-0"
         >
           0
         </Button>
         <div className="aspect-square flex items-center justify-center">
            <ChevronRight size={32} strokeWidth={3} className="text-amber-500 opacity-20" />
         </div>
      </div>
    </div>
  )
}

export default OwnerAuth
