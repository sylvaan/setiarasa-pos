import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import type { Product } from '../../types'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface ProductCardProps {
  product: Product
  idx: number
  cartItem?: { quantity: number }
  onClick: () => void
}

export const ProductCard = ({ product, idx, cartItem, onClick }: ProductCardProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      onClick={onClick}
      className={cn(
        "relative glass-card text-left flex flex-col justify-between min-h-[160px] group shadow-md hover:shadow-lg transition-all p-4 rounded-[2rem] active:scale-95 cursor-pointer border",
        cartItem 
          ? product.category === 'manis' 
            ? "!bg-emerald-100/90 !border-none" 
            : "!bg-amber-100/90 !border-none"
          : "bg-white/60 border-white/80"
      )}
    >
      <div className="space-y-1.5">
        <p className="text-slate-500 text-[9px] uppercase font-bold tracking-widest opacity-60">
          {product.category === 'telor' ? product.eggType : product.category}
        </p>
        <h3 className="text-sm font-bold leading-snug group-hover:text-emerald-600 transition-colors uppercase italic text-slate-900 line-clamp-2">
          {product.name}
        </h3>
      </div>
      
      <div className="flex justify-between items-end mt-4 pt-3 border-t border-slate-200/50">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase opacity-70">Mulai</span>
          <p className="font-bold text-amber-600 text-lg leading-none">Rp {(product.basePrice / 1000).toFixed(0)}k</p>
        </div>
        <div className="bg-emerald-600 text-white !p-[10px] rounded-xl shadow-lg transition-transform group-active:scale-90">
           <Plus size={16} strokeWidth={3} />
        </div>
      </div>

      {cartItem && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-3 -right-3 bg-emerald-600 text-white w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold shadow-lg border-4 border-sky-100 z-10"
        >
          {cartItem.quantity}
        </motion.div>
      )}
    </motion.div>
  )
}
