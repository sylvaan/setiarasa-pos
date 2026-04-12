import { AnimatePresence, motion } from 'framer-motion'
import { CATEGORIES } from '../../api/mockData'
import type { Product, CartItem } from '../../types'
import { ProductCard } from './ProductCard'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface POSSectionProps {
  selectedCategory: string
  setSelectedCategory: (cat: string) => void
  filteredProducts: Product[]
  items: CartItem[]
  onProductClick: (product: Product) => void
}

export const POSSection = ({ 
  selectedCategory, 
  setSelectedCategory, 
  filteredProducts, 
  items, 
  onProductClick 
}: POSSectionProps) => {
  return (
    <div className="space-y-6 !mt-4">
      {/* Category Navigation */}
      <div className="flex justify-center gap-6 my-6 scrollbar-hide -mx-5 px-5 snap-x snap-mandatory !mb-4">
        {CATEGORIES.map(cat => {
          const isActive = selectedCategory === cat.id
          const isManis = cat.id === 'manis'
          
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "flex-none flex items-center gap-4 !p-[10px] rounded-[2.5rem] font-bold transition-all duration-500 border-2 snap-start min-w-[130px] justify-center flex-col shadow-sm relative group outline-none",
                isActive 
                  ? isManis
                    ? "!bg-emerald-500 !text-white !border-emerald-400 !shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)] !scale-110"
                    : "!bg-amber-500 !text-white !border-amber-400 !shadow-[0_20px_40px_-10px_rgba(245,158,11,0.4)] !scale-110"
                  : "!bg-white/40 !border-white/60 !text-slate-400 hover:!bg-white/70"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="category-glow"
                  className={cn(
                    "absolute inset-0 rounded-[2.5rem] blur-xl opacity-30 -z-10",
                    isManis ? "bg-emerald-400" : "bg-amber-400"
                  )}
                />
              )}
              
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-500 shadow-sm",
                isActive ? "bg-white/20 !scale-110" : "bg-white/90"
              )}>
                {isManis ? '🍰' : '🍳'}
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-black">{cat.name}</span>
            </button>
          )
        })}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-5 px-1">
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product, idx) => {
            const totalQty = items
              .filter(i => i.id === product.id)
              .reduce((acc, curr) => acc + curr.quantity, 0)
            
            return (
              <ProductCard 
                key={product.id}
                product={product}
                isBestSeller={idx < 2 && (product.salesCount || 0) > 0}
                cartItem={totalQty > 0 ? { quantity: totalQty } : undefined}
                onClick={() => onProductClick(product)}
              />
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
