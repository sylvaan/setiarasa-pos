import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ShoppingCart, ChevronRight } from 'lucide-react'
import { useEffect } from 'react'
import type { Product, CartItem, DoughOption, ToppingOption } from '../../types'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { Heading } from '../ui/Typography'
import ProgressLoader from '../shared/ProgressLoader'
import { formatCurrency } from "../../utils/format"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface CartModalProps {
  items: CartItem[]
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
  removeItem: (id: string) => void
  addItem: (product: Product, dough?: DoughOption, toppings?: ToppingOption[]) => void
  getTotal: () => number
  checkout: () => void
  isSyncing?: boolean
  lastRemovedItem: any | null
  undoRemoveItem: () => void
  setLastRemovedItem: (item: any | null) => void // Add this prop
}

export const CartModal = ({
  items,
  isCartOpen,
  setIsCartOpen,
  removeItem,
  addItem,
  getTotal,
  checkout,
  isSyncing = false,
  lastRemovedItem,
  undoRemoveItem,
  setLastRemovedItem
}: CartModalProps) => {
  useEffect(() => {
    if (lastRemovedItem) {
      const timer = setTimeout(() => {
        setLastRemovedItem(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [lastRemovedItem, setLastRemovedItem])

  return (
    <AnimatePresence>
      {items.length > 0 && (
        <div key="cart-container">
          {isCartOpen && (
            <motion.div 
              key="cart-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 !bg-slate-900/40 z-40"
            />
          )}

          {isCartOpen && (
            <Card 
              key="cart-modal-content"
              initial={{ opacity: 0, scale: 0.98, x: '-50%', y: '-50%' }}
              animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
              exit={{ opacity: 0, scale: 0.98, x: '-50%', y: '-50%' }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed top-1/2 left-1/2 w-[92%] max-w-[440px] !bg-white rounded-[1.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.3)] z-50 !p-7 !pb-3 !pt-7 !border border-white/60 overflow-hidden"
            >
              <ProgressLoader isVisible={isSyncing} />
              {/* Header */}
              <div className="relative text-center !mb-10">
                <Heading as="h3" className="!text-lg">Detail Pesanan</Heading>
                <Button 
                  variant="white"
                  size="sm"
                  onClick={() => setIsCartOpen(false)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 !p-2 !bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 shadow-none border-none"
                >
                  <Plus className="rotate-45" size={20} strokeWidth={3} />
                </Button>
              </div>

              {/* Items List */}
              <div className="!space-y-6 max-h-[40vh] overflow-y-auto scrollbar-hide !pr-2 !mb-10">
                {items.map(item => {
                  const doughId = item.selectedDough?.id || 'none'
                  const toppingIds = item.selectedToppings?.map(t => t.id).sort().join(',') || 'no-extra'
                  const itemId = `${item.id}-${doughId}-${toppingIds}`
                  
                  return (
                    <div key={itemId} className="!flex !justify-between !items-center group !pb-6 !border-b border-slate-50 last:border-0 last:pb-0">
                      <div className="!space-y-2 flex-1 min-w-0">
                        <div>
                           <Heading as="p" className="!text-xs !not-italic !tracking-normal !line-clamp-2">
                            {item.name}
                          </Heading>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.selectedDough && (
                              <Badge variant="emerald" className="!px-2 !py-0.5 !rounded-md tracking-wider">
                                {item.selectedDough.label}
                              </Badge>
                            )}
                            {item.selectedToppings?.map(topping => (
                              <Badge key={topping.id} variant="white" className="!bg-amber-100 !text-amber-800 !border-amber-200 !px-2 !py-0.5 !rounded-md tracking-wider">
                                +{topping.label}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Heading as="p" className="!text-[11px] !text-amber-600">
                          {formatCurrency(item.totalItemPrice * item.quantity)}
                        </Heading>
                      </div>

                      <div className="flex items-center !gap-3 !bg-slate-50 !p-1.5 !rounded-2xl !border border-slate-100/50">
                        <Button 
                          variant="white"
                          size="sm"
                          onClick={() => removeItem(itemId)}
                          className="!w-8 !h-8 !bg-white border-slate-200 !rounded-xl !p-0 shadow-none"
                        >
                          <Plus className="rotate-45" size={14} strokeWidth={3} />
                        </Button>
                        <span className="font-bold text-xs !w-6 text-center text-slate-900">{item.quantity}</span>
                        <Button 
                          variant="emerald"
                          size="sm"
                          onClick={() => addItem(item, item.selectedDough, item.selectedToppings)}
                          className="!w-8 !h-8 !rounded-xl !p-0 shadow-emerald-500/10"
                        >
                          <Plus size={14} strokeWidth={3} />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Undo Notification */}
              <AnimatePresence>
                {lastRemovedItem && (
                  <motion.div 
                    key="undo-notification"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="!mb-6 !p-3 !bg-slate-900 !text-white !rounded-xl !flex !justify-between !items-center !shadow-lg"
                  >
                    <span className="!text-[10px] font-medium opacity-90">
                      Item dihapus: {lastRemovedItem.item.name}
                    </span>
                    <button 
                      onClick={undoRemoveItem}
                      className="!text-[10px] !bg-emerald-500 !px-3 !py-1 !rounded-lg font-bold !uppercase tracking-wider"
                    >
                      Undo
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer Section */}
              <div className="!pt-8 border-t-2 border-slate-50 flex flex-col items-center !gap-6">
                <div className="flex justify-between items-center w-full">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Total Pembayaran</span>
                  <span className="text-lg font-black text-emerald-600">
                    {formatCurrency(getTotal())}
                  </span>
                </div>
                <Button 
                  variant="emerald"
                  fullWidth
                  size="lg"
                  disabled={isSyncing}
                  onClick={async () => {
                    await checkout()
                  }}
                  className="!py-7 !rounded-[2rem] !text-xs !gap-3 relative"
                >
                  {isSyncing ? "Memproses..." : "Bayar Sekarang"}
                  {!isSyncing && <ChevronRight size={16} strokeWidth={3} className="absolute right-8 opacity-80" />}
                </Button>
              </div>
            </Card>
          )}

          <motion.footer 
            key="cart-floating-footer"
            initial={{ y: 100, opacity: 0 }}
            animate={{ 
              y: isCartOpen ? 120 : 0, 
              opacity: isCartOpen ? 0 : 1,
              pointerEvents: isCartOpen ? 'none' : 'auto' 
            }}
            transition={{ duration: 0.4, ease: "circOut" }}
            className="fixed left-0 right-0 px-6 z-40"
            style={{ bottom: 'calc(2.5rem + var(--safe-area-inset-bottom))' }}
          >
            <button 
              onClick={() => setIsCartOpen(!isCartOpen)}
              className={cn(
                "w-full !max-w-[52%] mx-auto !bg-emerald-500 !text-white rounded-[2rem] flex justify-between items-center !shadow-[0_20px_40px_rgba(0,0,0,0.2)] relative overflow-hidden group border border-white/10 transition-all duration-300",
                isCartOpen ? "p-6" : "p-2.5 px-4"
              )}
            >
              <div className="!flex !items-center !gap-3">
                <div className={cn("rounded-xl transition-all !p-1", isCartOpen ? "p-3" : "p-1.5")}>
                  <ShoppingCart size={isCartOpen ? 24 : 18} strokeWidth={2.5} />
                </div>
                <div className="!text-left !flex !items-baseline !gap-2">
                  <p className={cn("!font-bold !tracking-tight !leading-none !transition-all", isCartOpen ? "text-base" : "text-sm")}>
                    {items.reduce((acc, item) => acc + item.quantity, 0)} Menu
                  </p>
                  <span className="!text-white/30 !font-bold">—</span>
                  <p className={cn("!font-bold !tracking-tight !leading-none !transition-all", isCartOpen ? "text-base" : "text-sm")}>
                    Rp {getTotal().toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
              <div className="!flex !items-center !bg-white/10 !p-2 !rounded-full !border !border-white/5 !transition-transform !duration-300">
                <ChevronRight size={16} strokeWidth={3} className={cn("!transition-transform", isCartOpen && "rotate-270")} />
              </div>
            </button>
          </motion.footer>
        </div>
      )}
    </AnimatePresence>
  )
}