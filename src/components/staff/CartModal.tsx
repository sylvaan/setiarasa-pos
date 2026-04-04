import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ShoppingCart, ChevronRight } from 'lucide-react'
import type { Product, CartItem, DoughOption } from '../../types'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface CartModalProps {
  items: CartItem[]
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
  removeItem: (id: string) => void
  addItem: (item: Product | CartItem, dough?: DoughOption) => void
  getTotal: () => number
  checkout: () => void
}

export const CartModal = ({
  items,
  isCartOpen,
  setIsCartOpen,
  removeItem,
  addItem,
  getTotal,
  checkout
}: CartModalProps) => {
  if (items.length === 0) return null

  return (
    <AnimatePresence>
      <>
        {isCartOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-md z-40"
          />
        )}

        {/* Cart Detail Modal */}
        {isCartOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: '-45%', x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
            exit={{ opacity: 0, scale: 0.9, y: '-45%', x: '-50%' }}
            className="fixed top-1/2 left-1/2 w-[92%] max-w-[440px] bg-white rounded-[1.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.3)] z-50 !p-7 !pb-3 !pt-3 border border-white/60 overflow-hidden"
          >
            {/* Header */}
            <div className="relative text-center mb-10">
              <h3 className="text-lg font-bold text-slate-900 italic uppercase tracking-[0.3em]">Detail Pesanan</h3>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-all active:scale-90"
              >
                <Plus className="rotate-45" size={20} strokeWidth={3} />
              </button>
            </div>

            {/* Items List */}
            <div className="space-y-6 max-h-[40vh] overflow-y-auto scrollbar-hide pr-2 mb-10">
              {items.map(item => {
                const doughId = item.selectedDough?.id || 'none'
                const itemId = `${item.id}-${doughId}`
                return (
                  <div key={itemId} className="flex justify-between items-center group pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                    <div className="space-y-2 flex-1 min-w-0">
                      <div>
                         <p className="font-bold text-xs text-slate-900 uppercase italic leading-tight truncate tracking-tight">
                          {item.name}
                        </p>
                        {item.selectedDough && (
                          <p className="text-[10px] text-emerald-600 font-bold uppercase mt-0.5 tracking-wider">
                            {item.selectedDough.label}
                          </p>
                        )}
                      </div>
                      <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wide">
                        Rp {(item.totalItemPrice / 1000).toFixed(0)}.000
                      </p>
                    </div>

                    <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-100/50">
                      <button 
                        onClick={() => removeItem(itemId)}
                        className="w-8 h-8 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-900 shadow-sm transition-all active:scale-75"
                      >
                        <Plus className="rotate-45" size={14} strokeWidth={3} />
                      </button>
                      <span className="font-bold text-xs w-6 text-center text-slate-900">{item.quantity}</span>
                      <button 
                        onClick={() => addItem(item, item.selectedDough)}
                        className="w-8 h-8 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-all active:scale-75"
                      >
                        <Plus size={14} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer Section */}
            <div className="pt-8 border-t-2 border-slate-50 flex flex-col items-center gap-6">
              <div className="text-center space-y-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] opacity-80">Total Bayar</p>
                <p className="text-lg font-bold text-slate-900 tracking-tight italic">
                  Rp {getTotal().toLocaleString('id-ID')}
                </p>
              </div>
              <button 
                onClick={() => {
                  checkout()
                  setIsCartOpen(false)
                }}
                className="w-full !bg-emerald-600 !text-white !py-4 rounded-[2rem] font-bold text-xs shadow-xl shadow-emerald-500/20 uppercase tracking-[0.2em] relative flex items-center justify-center transition-all active:scale-95"
              >
                <span className="relative z-10">Bayar Sekarang</span>
                <ChevronRight size={16} strokeWidth={3} className="absolute right-8 opacity-80" />
              </button>
            </div>
          </motion.div>
        )}

        <motion.footer 
          initial={{ y: 100, opacity: 0 }}
          animate={{ 
            y: isCartOpen ? 120 : 0, 
            opacity: isCartOpen ? 0 : 1,
            pointerEvents: isCartOpen ? 'none' : 'auto' 
          }}
          transition={{ duration: 0.4, ease: "circOut" }}
          className="fixed bottom-6 left-0 right-0 px-6 z-40"
        >
          <button 
            onClick={() => setIsCartOpen(!isCartOpen)}
            className={cn(
              "w-full !max-w-[55%] mx-auto !bg-emerald-500 !text-white rounded-[2rem] flex justify-between items-center !shadow-[0_20px_40px_rgba(0,0,0,0.2)] relative overflow-hidden group border border-white/10 transition-all duration-300",
              isCartOpen ? "p-6" : "p-4"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn("rounded-xl transition-all !p-1", isCartOpen ? "p-3" : "p-2")}>
                <ShoppingCart size={isCartOpen ? 24 : 18} strokeWidth={2.5} />
              </div>
              <div className="text-left flex items-baseline gap-2">
                <p className={cn("font-bold tracking-tight leading-none transition-all", isCartOpen ? "text-base" : "text-sm")}>
                  {items.reduce((acc, item) => acc + item.quantity, 0)} Menu
                </p>
                <span className="text-white/30 font-bold">—</span>
                <p className={cn("font-bold tracking-tight leading-none transition-all", isCartOpen ? "text-base" : "text-sm")}>
                  Rp {getTotal().toLocaleString('id-ID')}
                </p>
              </div>
            </div>
            <div className="flex items-center bg-white/10 p-2 rounded-full border border-white/5 transition-transform duration-300">
              <ChevronRight size={16} strokeWidth={3} className={cn("transition-transform", isCartOpen && "rotate-270")} />
            </div>
          </button>
        </motion.footer>
      </>
    </AnimatePresence>
  )
}
