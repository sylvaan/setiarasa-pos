import { useState, useMemo, useEffect, useCallback } from 'react'
import { Plus, ShoppingCart, LayoutDashboard, UtensilsCrossed, ChevronRight, TrendingUp, Menu, X, ReceiptText, History, PieChart, Wallet, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { MOCK_PRODUCTS, CATEGORIES, DOUGH_OPTIONS } from './api/mockData'
import type { Product, StaffView, OwnerView } from './types'
import { useCartStore } from './store/useCartStore'
import { App as CapApp } from '@capacitor/app'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'staff' | 'owner'>('staff')
  const [activeStaffView, setActiveStaffView] = useState<StaffView>('pos')
  const [activeOwnerView, setActiveOwnerView] = useState<OwnerView>('overview')
  const [selectedCategory, setSelectedCategory] = useState<string>('manis')
  const [selectedProductForDough, setSelectedProductForDough] = useState<Product | null>(null)
  const [selectedDoughId, setSelectedDoughId] = useState<string>('original')
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [pinInput, setPinInput] = useState<string>('')
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState(false)
  const [analyticsRange, setAnalyticsRange] = useState<'today' | 'week' | 'month'>('today')
  const [isSideNavOpen, setIsSideNavOpen] = useState(false)
  const [isPinError, setIsPinError] = useState(false)
  
  const { items, orders, expenses, addItem, removeItem, getTotal, checkout, addExpense, removeExpense } = useCartStore()

  const handlePinInput = useCallback((num: string) => {
    if (isPinError) return
    setPinInput(prev => {
      if (prev.length < 6) {
        const newPin = prev + num
        if (newPin === '591161') {
          setTimeout(() => setIsOwnerAuthenticated(true), 300)
        } else if (newPin.length === 6) {
          setIsPinError(true)
          setTimeout(() => {
            setPinInput('')
            setIsPinError(false)
          }, 1500)
        }
        return newPin
      }
      return prev
    })
  }, [isPinError])

  // Keyboard PIN Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab === 'owner' && !isOwnerAuthenticated) {
        if (/^[0-9]$/.test(e.key)) {
          handlePinInput(e.key)
        } else if (e.key === 'Backspace') {
          setPinInput(prev => prev.slice(0, -1))
        } else if (e.key === 'Escape') {
          setPinInput('')
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTab, isOwnerAuthenticated, handlePinInput])

  // Hardware Back Button Support (Android)
  useEffect(() => {
    const handleBackButton = async () => {
      if (isCartOpen) {
        setIsCartOpen(false)
      } else if (selectedProductForDough) {
        setSelectedProductForDough(null)
      } else if (activeTab === 'owner') {
        setActiveTab('staff')
        setIsOwnerAuthenticated(false)
        setPinInput('')
      }
    }

    const listener = CapApp.addListener('backButton', handleBackButton)
    return () => {
      listener.then(l => l.remove())
    }
  }, [isCartOpen, selectedProductForDough, activeTab])

  // Analytics Helpers
  const todayOrders = useMemo(() => {
    const today = new Date().toDateString()
    return orders.filter(o => new Date(o.timestamp).toDateString() === today)
  }, [orders])

  const topProducts = useMemo(() => {
    let filtered = orders
    const now = new Date()
    
    if (analyticsRange === 'today') {
      const today = now.toDateString()
      filtered = orders.filter(o => new Date(o.timestamp).toDateString() === today)
    } else if (analyticsRange === 'week') {
      const weekAgo = new Date()
      weekAgo.setDate(now.getDate() - 7)
      filtered = orders.filter(o => new Date(o.timestamp).getTime() >= weekAgo.getTime())
    } else if (analyticsRange === 'month') {
      const monthAgo = new Date()
      monthAgo.setMonth(now.getMonth() - 1)
      filtered = orders.filter(o => new Date(o.timestamp).getTime() >= monthAgo.getTime())
    }

    const counts: Record<string, { name: string, count: number, dough?: string }> = {}
    filtered.forEach(order => {
      order.items.forEach(item => {
        const key = `${item.id}-${item.selectedDough?.id || 'none'}`
        if (!counts[key]) {
          counts[key] = { name: item.name, count: 0, dough: item.selectedDough?.label }
        }
        counts[key].count += item.quantity
      })
    })
    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [orders, analyticsRange])

  const salesTrend = useMemo(() => {
    let buckets: { label: string, timestamp: number, amount: number, isToday?: boolean }[] = []
    const now = new Date()

    if (analyticsRange === 'today') {
      // Last 8 Hours
      buckets = [...Array(8)].map((_, i) => {
        const d = new Date(now)
        d.setHours(now.getHours() - (7 - i), 0, 0, 0)
        return {
          label: i === 7 ? 'Sekarang' : d.getHours() + ':00',
          timestamp: d.getTime(),
          amount: 0,
          isToday: i === 7
        }
      })
    } else if (analyticsRange === 'week') {
      // Last 7 Days
      buckets = [...Array(7)].map((_, i) => {
        const d = new Date(now)
        d.setDate(now.getDate() - (6 - i))
        d.setHours(0, 0, 0, 0)
        const isToday = d.toDateString() === now.toDateString()
        return {
          label: isToday ? 'Hari Ini' : d.toLocaleDateString('id-ID', { weekday: 'short' }),
          timestamp: d.getTime(),
          amount: 0,
          isToday
        }
      })
    } else if (analyticsRange === 'month') {
      // Last 30 Days
      buckets = [...Array(30)].map((_, i) => {
        const d = new Date(now)
        d.setDate(now.getDate() - (29 - i))
        d.setHours(0, 0, 0, 0)
        const isToday = d.toDateString() === now.toDateString()
        return {
          label: d.getDate().toString(),
          timestamp: d.getTime(),
          amount: 0,
          isToday
        }
      })
    }

    orders.forEach(order => {
      const orderTime = new Date(order.timestamp).getTime()
      const bucket = buckets.find((h, i) => {
        const nextTime = buckets[i + 1]?.timestamp || Infinity
        return orderTime >= h.timestamp && orderTime < nextTime
      })
      if (bucket) bucket.amount += order.totalAmount
    })

    return buckets
  }, [orders, analyticsRange])

  const filteredProducts = MOCK_PRODUCTS.filter(p => p.category === selectedCategory)
  const activeDough = DOUGH_OPTIONS.find(d => d.id === selectedDoughId) || DOUGH_OPTIONS[0]

  return (
    <div className="container min-h-screen pb-56 overflow-hidden bg-bg-color text-text-primary">
      {/* Top Header */}
      <header className="pt-10 pb-6 flex justify-between items-center bg-white/85 w-full sticky top-0 z-30 backdrop-blur-2xl border-b border-white/40 shadow-sm px-7">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => setIsSideNavOpen(true)}
            className="p-2.5 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-600 active:scale-95 transition-all hover:bg-slate-50"
          >
            <Menu size={22} strokeWidth={2.5} />
          </button>
          <div className="text-left py-1">
            <h1 className="text-2xl font-bold text-emerald-600 leading-none tracking-tight">SetiaRasa</h1>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.25em] mt-1.5 opacity-80">PoS System Martabak</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn(
            "!px-4 !py-1.5 !mr-1 rounded-full text-[9px] font-bold uppercase tracking-widest border shadow-sm transition-all",
            activeTab === 'staff' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
          )}>
            {activeTab === 'owner' ? 'Owner Mode' : 'Kasir Melayani'}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mt-10 !mb-10 min-h-[calc(100vh-200px)]">
        {activeTab === 'staff' ? (
          activeStaffView === 'pos' ? (
            /* POS View - The existing cashier interface */
            <div className="space-y-6 !mt-4">
              <div className="flex justify-center gap-6 my-6 scrollbar-hide -mx-5 px-5 snap-x snap-mandatory !mb-4">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "flex-none flex items-center gap-4 !p-[10px] rounded-[2.5rem] font-bold transition-all duration-300 border-2 snap-start min-w-[120px] justify-center flex-col shadow-sm",
                      selectedCategory === cat.id 
                        ? cat.id === 'manis'
                          ? "!bg-emerald-500 !text-white !border-emerald-400 !shadow-xl !scale-105"
                          : "!bg-amber-500 !text-white !border-amber-400 !shadow-xl !scale-105"
                        : "!bg-white/50 !border-white/40 !text-slate-500 !hover:bg-white/80"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-colors duration-300 shadow-sm",
                      selectedCategory === cat.id ? "bg-white/20" : "bg-white"
                    )}>
                      {cat.id === 'manis' ? '🍰' : '🍳'}
                    </div>
                    <span className="text-[9px] uppercase tracking-[0.15em]">{cat.name}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-5 px-1">
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product, idx) => {
                    const doughSuffix = selectedCategory === 'manis' ? (selectedDoughId || 'original') : 'none'
                    const itemId = `${product.id}-${doughSuffix}`
                    const cartItem = items.find(i => `${i.id}-${i.selectedDough?.id || 'none'}` === itemId)
                    
                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={product.id}
                        onClick={() => {
                          if (product.category === 'manis') {
                            setSelectedProductForDough(product)
                            setSelectedDoughId('original')
                          } else {
                            addItem(product)
                          }
                        }}
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
                  })}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            /* Expense Section - Staff can log expenses */
            <div className="max-w-[440px] mx-auto w-full space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
              <div className="space-y-4 text-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-emerald-600 mx-auto shadow-sm border border-emerald-100/50">
                  <Wallet size={36} strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 italic uppercase">Laporan Belanja</h2>
                  <p className="text-slate-500 text-xs font-medium mt-1">Catat pengeluaran bahan harian Anda</p>
                </div>
              </div>

              {/* Expense Form */}
              <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Barang</label>
                    <input 
                      type="text" 
                      id="expense-title"
                      placeholder="Contoh: Telur 10kg, Plastik, Mentega" 
                      className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nominal (Rp)</label>
                    <input 
                      type="number" 
                      id="expense-amount"
                      placeholder="Contoh: 150000" 
                      className="w-full bg-slate-50 border-none p-4 rounded-2xl text-sm font-bold text-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>
                <button 
                  onClick={() => {
                    const titleInput = document.getElementById('expense-title') as HTMLInputElement
                    const amountInput = document.getElementById('expense-amount') as HTMLInputElement
                    if (titleInput.value && amountInput.value) {
                      addExpense(titleInput.value, parseInt(amountInput.value), 'bahan')
                      titleInput.value = ''
                      amountInput.value = ''
                    }
                  }}
                  className="w-full bg-emerald-600 text-white py-4 rounded-3xl font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  Simpan Belanja
                </button>
              </div>

              {/* Recent Expenses List */}
              <div className="space-y-6 px-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <History size={14} /> Pengeluaran Terakhir
                </h3>
                <div className="space-y-3">
                  {expenses.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-white/30 backdrop-blur-sm">
                      <p className="text-[10px] font-bold uppercase tracking-widest italic">Belum ada catatan belanja</p>
                    </div>
                  ) : (
                    expenses.slice(0, 10).map((ex) => (
                      <div key={ex.id} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100 flex justify-between items-center group active:scale-[0.98] transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                             <ReceiptText size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-900 group-hover:text-emerald-600 transition-colors uppercase italic">{ex.title}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                              {new Date(ex.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • {new Date(ex.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-bold text-sm text-rose-500 italic">Rp {(ex.amount / 1000).toFixed(0)}k</p>
                          <button 
                            onClick={() => removeExpense(ex.id)}
                            className="p-2 text-slate-300 hover:text-rose-500 active:scale-75 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )
        ) : (
          /* Owner Dashboard - Segmented Views */
          <div className="max-w-[440px] mx-auto w-full">
            {!isOwnerAuthenticated ? (
              /* PIN Login Screen */
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-4">
                  <div className="!mx-auto !my-2 w-20 h-20 bg-white/80 rounded-[1.5rem] flex items-center justify-center text-amber-600 border border-white shadow-xl">
                     <LayoutDashboard size={40} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-700 tracking-tight italic uppercase !my-0.75">Akses Owner</h2>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] !my-2 opacity-60">Masukkan PIN untuk melanjutkan</p>
                  </div>
                </div>

                <div className="space-y-4">
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
                      onClick={() => handlePinInput(n.toString())}
                      className="aspect-square bg-white shadow-sm flex items-center justify-center rounded-[2rem] font-bold text-2xl text-slate-800 border border-slate-100 hover:bg-slate-50 active:scale-95 transition-all"
                     >
                       {n}
                     </button>
                   ))}
                   <button 
                    onClick={() => setPinInput('')}
                    className="aspect-square flex items-center justify-center rounded-[2rem] font-bold text-[10px] text-slate-400 hover:text-slate-900 uppercase tracking-widest"
                   >
                     Clear
                   </button>
                   <button 
                    onClick={() => handlePinInput('0')}
                    className="aspect-square bg-white shadow-sm flex items-center justify-center rounded-[2rem] font-bold text-2xl text-slate-800 border border-slate-100 hover:bg-slate-50 active:scale-95 transition-all"
                   >
                     0
                   </button>
                   <button className="aspect-square flex items-center justify-center rounded-[2rem] font-bold text-amber-500 hover:text-amber-600 transition-colors">
                      <ChevronRight size={32} strokeWidth={3} />
                   </button>
                </div>
              </div>
            ) : (
              /* Authenticated Owner Views */
              <div className="py-6 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
                {activeOwnerView === 'overview' && (
                  <div className="space-y-10">
                    {/* Stats Summary */}
                    <div className="grid grid-cols-2 gap-6 px-1">
                      <div className="bg-white p-5 rounded-[1.5rem] border border-white shadow-sm text-left space-y-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest opacity-70">Sales Hari Ini</p>
                        <p className="text-xl font-bold text-emerald-600 italic leading-none">
                          Rp {(todayOrders.reduce((acc, o) => acc + o.totalAmount, 0) / 1000).toFixed(0)}k
                        </p>
                      </div>
                      <div className="bg-white p-5 rounded-[1.5rem] border border-white shadow-sm text-left space-y-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest opacity-70">Nota Masuk</p>
                        <p className="text-xl font-bold text-slate-900 italic leading-none">
                          {todayOrders.length} <span className="text-[9px] font-bold uppercase not-italic text-slate-400 ml-1">pcs</span>
                        </p>
                      </div>
                    </div>

                    {/* Chart Card */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/40 space-y-8">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-600 shadow-sm border border-emerald-100">
                            <TrendingUp size={18} />
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 uppercase italic tracking-widest">Analitik Tren</h3>
                        </div>
                        {/* Range Switcher Mini */}
                        <div className="flex bg-slate-50 p-1 rounded-xl gap-1 border border-slate-100">
                          {(['today', 'week', 'month'] as const).map(range => (
                            <button
                              key={range}
                              onClick={() => setAnalyticsRange(range)}
                              className={cn(
                                "px-3 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-widest transition-all",
                                analyticsRange === range ? "bg-white text-slate-900 shadow-sm border border-slate-100" : "text-slate-400"
                              )}
                            >
                              {range === 'today' ? 'Day' : range === 'week' ? 'Week' : 'Month'}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="h-40 w-full relative">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                          <defs>
                            <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                            </linearGradient>
                          </defs>

                          {(() => {
                            const max = Math.max(...salesTrend.map((t) => t.amount), 1000)
                            const points = salesTrend.map((t, i) => `${(i / (salesTrend.length - 1)) * 100},${40 - (t.amount / max) * 35}`).join(' ')
                            return (
                              <>
                                <path d={`M 0,40 ${points} L 100,40 Z`} fill="url(#chart-grad)" />
                                <polyline fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
                              </>
                            )
                          })()}
                        </svg>
                        
                        <div className="flex justify-between mt-6">
                          {salesTrend.filter((_, i) => analyticsRange === 'month' ? i % 7 === 0 : true).map((t, i) => (
                            <span key={i} className={cn("text-[9px] font-bold uppercase", t.isToday ? "text-emerald-600" : "text-slate-400")}>
                              {t.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100/50 flex items-center justify-between group active:scale-95 transition-all cursor-pointer" onClick={() => setActiveOwnerView('sales')}>
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm border border-amber-100">
                             <PieChart size={22} />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-amber-900 uppercase italic">Lihat Performa Menu</p>
                            <p className="text-[10px] text-amber-600 font-medium opacity-70">Cek martabak mana yang paling cuan</p>
                          </div>
                       </div>
                       <ChevronRight size={20} className="text-amber-300" />
                    </div>
                  </div>
                )}

                {activeOwnerView === 'sales' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center gap-3 px-2">
                       <button onClick={() => setActiveOwnerView('overview')} className="p-2 bg-slate-50 rounded-xl text-slate-400">
                         <X size={18} className="rotate-90" />
                       </button>
                       <h3 className="text-lg font-bold text-slate-900 uppercase italic tracking-widest">Produk Terlaris</h3>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8">
                       {/* Range Switcher High Detail */}
                      <div className="flex bg-slate-50 p-1.5 rounded-2xl gap-1 border border-slate-100">
                        {(['today', 'week', 'month'] as const).map(range => (
                          <button
                            key={range}
                            onClick={() => setAnalyticsRange(range)}
                            className={cn(
                              "flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                              analyticsRange === range ? "bg-white text-slate-900 shadow-lg shadow-slate-200" : "text-slate-400 hover:text-slate-600"
                            )}
                          >
                            {range === 'today' ? 'Hari' : range === 'week' ? 'Minggu' : 'Bulan'}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-8">
                        {topProducts.length === 0 ? (
                          <div className="py-20 text-center text-slate-300 italic font-medium uppercase tracking-widest text-[10px]">Data Belum Tersedia</div>
                        ) : (
                          topProducts.map((p, i) => {
                            const percent = (p.count / topProducts[0].count) * 100
                            return (
                              <div key={i} className="space-y-4">
                                <div className="flex justify-between items-end">
                                  <div className="space-y-1">
                                    <p className="text-xs font-bold text-slate-900 uppercase italic">{p.name}</p>
                                    <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">{p.dough || 'Standar'}</p>
                                  </div>
                                  <div className="text-right">
                                     <p className="text-xs font-bold text-slate-900">{p.count} <span className="text-[9px] text-slate-400 uppercase">Terjual</span></p>
                                  </div>
                                </div>
                                <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} className="h-full bg-linear-to-r from-amber-400 to-amber-500 rounded-full" />
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeOwnerView === 'history' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
                    <div className="flex items-center gap-3 px-2">
                       <button onClick={() => setActiveOwnerView('overview')} className="p-2 bg-slate-50 rounded-xl text-slate-400">
                         <X size={18} className="rotate-90" />
                       </button>
                       <h3 className="text-lg font-bold text-slate-900 uppercase italic tracking-widest">Riwayat Nota</h3>
                    </div>

                    <div className="space-y-3">
                      {orders.length === 0 ? (
                        <div className="py-20 text-center text-slate-400 italic font-bold uppercase tracking-widest border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-white/30 backdrop-blur-sm">
                           Data nota masih kosong
                        </div>
                      ) : (
                        orders.map((order) => (
                          <div key={order.id} className="bg-white p-7 rounded-[1.5rem] border border-white shadow-sm flex flex-col gap-4 group active:scale-[0.98] transition-all">
                             <div className="flex justify-between items-start border-b border-slate-50 pb-4">
                                <div className="space-y-1">
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-80">
                                     {new Date(order.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                                   </p>
                                   <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">Nota #{order.id.split('-').slice(-1)}</p>
                                </div>
                                <p className="text-base font-bold text-emerald-600 italic">Rp {(order.totalAmount/1000).toFixed(0)}k</p>
                             </div>
                             <div className="flex flex-wrap gap-2">
                                {order.items.map((it, idx) => (
                                  <span key={idx} className="bg-slate-50 text-slate-500 text-[9px] font-bold px-3 py-1.5 rounded-lg border border-slate-100 uppercase tracking-tight">
                                    {it.quantity}x {it.name} {it.selectedDough ? `(${it.selectedDough.label})` : ''}
                                  </span>
                                ))}
                             </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => {
                    setIsOwnerAuthenticated(false)
                    setPinInput('')
                  }}
                  className="w-full py-5 text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] hover:text-rose-500 transition-colors flex items-center justify-center gap-2"
                >
                  <X size={14} /> Keluar Mode Owner
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Side Navigation Drawer */}
      <AnimatePresence>
        {isSideNavOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSideNavOpen(false)}
              className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-white shadow-2xl z-[70] !pt-14 !px-8 !pb-8 flex flex-col justify-between border-r border-slate-100"
            >
              <div className="space-y-12">
                <div className="flex justify-between items-center pr-2">
                  <div className="text-left py-1">
                    <h1 className="text-2xl font-bold text-emerald-600 leading-none tracking-tight">SetiaRasa</h1>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.25em] mt-2 opacity-80">POS System Martabak V1</p>
                  </div>
                  <button 
                    onClick={() => setIsSideNavOpen(false)}
                    className="p-2 bg-slate-50 rounded-xl text-slate-400 active:scale-90 transition-all"
                  >
                    <X size={18} strokeWidth={3} />
                  </button>
                </div>

                <div className="space-y-4 !mt-5">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em] px-2 mb-4 opacity-60">Mode Akses</p>
                  
                  {/* Role Switcher */}
                  <div className="flex gap-2 !my-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/50">
                    <button 
                      onClick={() => setActiveTab('staff')}
                      className={cn(
                        "flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                        activeTab === 'staff' 
                          ? "!bg-emerald-600 !text-white !shadow-lg !shadow-emerald-500/20" 
                          : "!text-slate-400 !hover:text-slate-600"
                      )}
                    >
                      Staff
                    </button>
                    <button 
                      onClick={() => setActiveTab('owner')}
                      className={cn(
                        "flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                        activeTab === 'owner' 
                          ? "!bg-amber-600 !text-white !shadow-lg !shadow-amber-500/20" 
                          : "!text-slate-400 !hover:text-slate-600"
                      )}
                    >
                      Owner
                    </button>
                  </div>

                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em] px-2 !mb-2 opacity-60">Navigasi Utama</p>

                  <div className="space-y-2 ">
                    {activeTab === 'staff' ? (
                      <>
                        <button 
                          onClick={() => { setActiveStaffView('pos'); setIsSideNavOpen(false); }}
                          className={cn(
                            "w-full flex items-center gap-4 !px-5 !py-4 !rounded-2xl transition-all group relative overflow-hidden",
                            activeStaffView === 'pos' 
                              ? "!bg-emerald-50 !text-emerald-600 !border !border-emerald-100 font-bold" 
                              : "text-slate-500 hover:bg-slate-50"
                          )}
                        >
                          <UtensilsCrossed size={18} strokeWidth={2.5} />
                          <span className="text-xs uppercase tracking-[0.2em]">Kasir (POS)</span>
                        </button>
                        <button 
                          onClick={() => { setActiveStaffView('expenses'); setIsSideNavOpen(false); }}
                          className={cn(
                            "w-full flex items-center gap-4 !px-5 !py-4 !rounded-2xl transition-all group relative overflow-hidden",
                            activeStaffView === 'expenses' 
                              ? "!bg-emerald-50 !text-emerald-600 !border !border-emerald-100 font-bold" 
                              : "!text-slate-500 !hover:bg-slate-50"
                          )}
                        >
                          <Wallet size={18} strokeWidth={2.5} />
                          <span className="text-xs uppercase tracking-[0.2em]">Belanja Bahan</span>
                        </button>
                      </>
                    ) : (
                      <>
                        {!isOwnerAuthenticated ? (
                          <div className="!py-10 !text-center !space-y-3">
                            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center !mx-auto text-slate-300">
                              <LayoutDashboard size={20} />
                            </div>
                            <p className="text-[10px] text-slate-400 italic font-medium px-4">Menu Owner terkunci. Silakan input PIN di layar utama.</p>
                          </div>
                        ) : (
                          <>
                            <button 
                              onClick={() => { setActiveOwnerView('overview'); setIsSideNavOpen(false); }}
                              className={cn(
                                "w-full flex items-center gap-4 !px-5 !py-4 !rounded-2xl transition-all group relative overflow-hidden",
                                activeOwnerView === 'overview' 
                                  ? "!bg-amber-50 !text-amber-700 !border !border-amber-100 font-bold" 
                                  : "!text-slate-500 !hover:bg-slate-50"
                              )}
                            >
                              <LayoutDashboard size={18} strokeWidth={2.5} />
                              <span className="text-xs uppercase tracking-[0.2em]">Overview</span>
                            </button>
                            <button 
                              onClick={() => { setActiveOwnerView('sales'); setIsSideNavOpen(false); }}
                              className={cn(
                                "w-full flex items-center gap-4 !px-5 !py-4 !rounded-2xl transition-all group relative overflow-hidden",
                                activeOwnerView === 'sales' 
                                  ? "!bg-amber-50 !text-amber-700 !border !border-amber-100 font-bold" 
                                  : "!text-slate-500 !hover:bg-slate-50"
                              )}
                            >
                              <PieChart size={18} strokeWidth={2.5} />
                              <span className="text-xs uppercase tracking-[0.2em]">Produk Terlaris</span>
                            </button>
                            <button 
                              onClick={() => { setActiveOwnerView('history'); setIsSideNavOpen(false); }}
                              className={cn(
                                "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group relative overflow-hidden",
                                activeOwnerView === 'history' 
                                  ? "bg-amber-50 text-amber-700 border border-amber-100 font-bold" 
                                  : "text-slate-500 hover:bg-slate-50"
                              )}
                            >
                              <History size={18} strokeWidth={2.5} />
                              <span className="text-xs uppercase tracking-[0.2em]">Riwayat Nota</span>
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-5 bg-sky-50 rounded-2xl border border-sky-100">
                   <p className="text-[8px] font-bold text-sky-600 uppercase mb-2 tracking-widest">Dukungan Teknis</p>
                   <p className="text-[10px] text-sky-900/60 leading-relaxed font-medium">Bantuan penggunaan & update sistem hubungi admin.</p>
                </div>
                <button 
                  onClick={() => setIsSideNavOpen(false)}
                  className="w-full py-4 text-slate-400 font-bold text-[9px] uppercase tracking-[0.3em] hover:text-slate-900 transition-colors border-t border-slate-50 pt-8"
                >
                  Tutup Menu
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Variant Selection Sheet */}
      <AnimatePresence>
        {selectedProductForDough && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProductForDough(null)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-md z-50"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: '-45%', x: '-50%' }}
              animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
              exit={{ opacity: 0, scale: 0.9, y: '-45%', x: '-50%' }}
              className="fixed top-1/2 left-1/2 w-[90%] max-w-[400px] bg-white rounded-[1.5rem] shadow-2xl z-50 !p-7 !pb-3 !pt-3 border border-white/60 text-center"
            >
              <div className="mb-10">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.3em] mb-2 italic">Varian Martabak</p>
                <h3 className="text-2xl font-bold text-slate-900 leading-tight uppercase italic tracking-tight">{selectedProductForDough.name}</h3>
              </div>

              <div className="space-y-6 mb-12">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Pilih Adonan</p>
                <div className="grid grid-cols-2 gap-3">
                  {DOUGH_OPTIONS.map(dough => (
                    <button
                      key={dough.id}
                      onClick={() => setSelectedDoughId(dough.id)}
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
                onClick={() => {
                  addItem(selectedProductForDough, activeDough)
                  setSelectedProductForDough(null)
                }}
                className="w-full !bg-emerald-600 !text-white !py-4 rounded-[2rem] font-bold text-xs shadow-xl shadow-emerald-500/20 uppercase tracking-[0.2em] relative flex items-center justify-center transition-all active:scale-95 !mt-4"
              >
                <span className="relative z-10">Tambahkan</span>
                <ChevronRight size={16} strokeWidth={3} className="absolute right-8 opacity-80" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {items.length > 0 && activeTab === 'staff' && (
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
        )}
      </AnimatePresence>
    </div>
  )
}
