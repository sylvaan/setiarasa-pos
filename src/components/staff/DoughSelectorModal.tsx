import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import type { Product, DoughOption } from '../../types'
import { DOUGH_OPTIONS } from '../../api/mockData'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface DoughSelectorModalProps {
  product: Product | null
  selectedDoughId: string
  setSelectedDoughId: (id: string) => void
  onClose: () => void
  onAdd: (product: Product, dough: DoughOption) => void
}

export const DoughSelectorModal = ({
  product,
  selectedDoughId,
  setSelectedDoughId,
  onClose,
  onAdd
}: DoughSelectorModalProps) => {
  if (!product) return null

  const activeDough = DOUGH_OPTIONS.find(d => d.id === selectedDoughId) || DOUGH_OPTIONS[0]

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-md z-50" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: '-45%', x: '-50%' }}
        animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
        exit={{ opacity: 0, scale: 0.9, y: '-45%', x: '-50%' }}
        className="fixed top-1/2 left-1/2 w-[90%] max-w-[400px] bg-white rounded-[1.5rem] shadow-2xl z-50 !p-7 !pb-3 !pt-3 border border-white/60 text-center"
      >
        <div className="mb-10">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.3em] mb-2 italic">Varian Martabak</p>
          <h3 className="text-2xl font-bold text-slate-900 leading-tight uppercase italic tracking-tight">{product.name}</h3>
        </div>

        <div className="space-y-6 mb-12">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Pilih Adonan</p>
          <div className="grid grid-cols-2 gap-3">
            {DOUGH_OPTIONS.map(dough => (
              <button
                key={dough.id}
                onClick={(e) => { e.stopPropagation(); setSelectedDoughId(dough.id); }}
                className={cn(
                  "flex flex-col items-center justify-center !p-4 rounded-2xl font-bold text-[10px] transition-all border gap-1",
                  selectedDoughId === dough.id
                    ? "!bg-emerald-600 !text-white !border-emerald-500 !shadow-lg scale-105"
                    : "bg-slate-50 text-slate-500 border-slate-100 hover:bg-white"
                )}
              >
                <span className="text-xs">{dough.label}</span>
                <span className="opacity-60 text-[8px]">{dough.extraPrice > 0 ? `+${dough.extraPrice/1000}k` : 'Free'}</span>
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={() => onAdd(product, activeDough)}
          className="w-full !bg-emerald-600 !text-white !py-4 rounded-[2rem] font-bold text-xs shadow-xl shadow-emerald-500/20 uppercase tracking-[0.2em] relative flex items-center justify-center transition-all active:scale-95 !mt-4"
        >
          <span className="relative z-10">Tambahkan</span>
          <ChevronRight size={16} strokeWidth={3} className="absolute right-8 opacity-80" />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
