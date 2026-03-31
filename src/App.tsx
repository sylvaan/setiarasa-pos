import { useState, useMemo, useEffect, useCallback } from 'react'
import { Plus, ShoppingCart, LayoutDashboard, UtensilsCrossed, ChevronRight, TrendingUp, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { MOCK_PRODUCTS, CATEGORIES, DOUGH_OPTIONS } from './api/mockData'
import type { Product, Order } from './types'
import { useCartStore } from './store/useCartStore'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'staff' | 'owner'>('staff')
  const [selectedCategory, setSelectedCategory] = useState<string>('manis')
  const [selectedProductForDough, setSelectedProductForDough] = useState<Product | null>(null)
  const [selectedDoughId, setSelectedDoughId] = useState<string>('original')
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [pinInput, setPinInput] = useState<string>('')
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState(false)
  const [analyticsRange, setAnalyticsRange] = useState<'today' | 'week' | 'month'>('today')
  
  const { items, orders, addItem, removeItem, getTotal, checkout } = useCartStore()

  const handlePinInput = useCallback((num: string) => {
    setPinInput(prev => {
      if (prev.length < 6) {
        const newPin = prev + num
        if (newPin === '591161') {
          setTimeout(() => setIsOwnerAuthenticated(true), 300)
        } else if (newPin.length === 6) {
          setTimeout(() => setPinInput(''), 500)
        }
        return newPin
      }
      return prev
    })
  }, [])

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
      <header className="py-5 flex justify-between items-center bg-white/70 -mx-5 px-5 sticky top-0 z-30 backdrop-blur-xl border-b border-white/40">
        <div className="text-left">
          <h1 className="text-2xl font-black text-emerald-600 leading-none tracking-tight">SetiaRasa</h1>
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Martabak POS • v1.0</p>
        </div>
        <div className="flex bg-slate-200/50 p-1.5 rounded-2xl border border-white/50 shadow-inner gap-3 my-6">
           <button 
             onClick={() => setActiveTab('staff')}
             className={cn(
               "flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300", 
               activeTab === 'staff' 
                ? "bg-white text-emerald-600 shadow-sm border border-white/60 scale-105" 
                : "text-slate-500 hover:text-slate-900"
             )}
           >
             <UtensilsCrossed size={16} />
             <span className="text-xs font-black uppercase tracking-wider">Staff</span>
           </button>
           <button 
             onClick={() => setActiveTab('owner')}
             className={cn(
               "flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300", 
               activeTab === 'owner' 
                ? "bg-white text-amber-600 shadow-sm border border-white/60 scale-105" 
                : "text-slate-500 hover:text-slate-900"
             )}
           >
             <LayoutDashboard size={16} />
             <span className="text-xs font-black uppercase tracking-wider">Owner</span>
           </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mt-8 !mb-10">
        {activeTab === 'staff' ? (
          <div className="space-y-6 !mt-4">
            {/* Category Navigation - Neutral Sky Style */}
            <div className="flex justify-center gap-6 my-6 scrollbar-hide -mx-5 px-5 snap-x snap-mandatory !mb-4">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "flex-none flex items-center gap-4 !p-[10px] rounded-[2.5rem] font-black transition-all duration-300 border-2 snap-start min-w-[120px] justify-center flex-col shadow-sm",
                    selectedCategory === cat.id 
                      ? cat.id === 'manis'
                        ? "bg-emerald-500 text-white border-emerald-400 shadow-xl scale-105"
                        : "bg-amber-500 text-white border-amber-400 shadow-xl scale-105"
                      : "bg-white/50 border-white/40 text-slate-500 hover:bg-white/80"
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

            {/* Product Grid */}
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
                      className="relative glass-card bg-white/60 text-left flex flex-col justify-between min-h-[160px] group border-white/80 shadow-md hover:shadow-lg transition-all p-4 rounded-[2rem] active:scale-95 cursor-pointer"
                    >
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-start">
                          <p className="text-slate-500 text-[9px] uppercase font-black tracking-widest opacity-60">
                            {product.category === 'telor' ? product.eggType : product.category}
                          </p>
                          {product.level && (
                            <span className="bg-amber-100 text-amber-700 text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                              {product.level}
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm font-black leading-snug group-hover:text-emerald-600 transition-colors uppercase italic text-slate-900 line-clamp-2">
                          {product.name}
                        </h3>
                      </div>
                      
                      <div className="flex justify-between items-end mt-4 pt-3 border-t border-slate-200/50">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-400 uppercase opacity-70">Mulai</span>
                          <p className="font-black text-amber-600 text-lg leading-none">Rp {(product.basePrice / 1000).toFixed(0)}k</p>
                        </div>
                        
                        <div className="bg-emerald-600 text-white !p-[10px] rounded-xl shadow-lg">
                           <Plus size={16} strokeWidth={3} />
                        </div>
                      </div>

                      {/* Badge for Qty if in cart */}
                      {cartItem && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-3 -right-3 bg-emerald-600 text-white w-8 h-8 flex items-center justify-center rounded-full text-xs font-black shadow-lg border-4 border-sky-100 z-10"
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
          /* Owner Dashboard */
          <div className="max-w-[440px] mx-auto w-full">
            {!isOwnerAuthenticated ? (
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-2">
                  <div className="mx-auto w-20 h-20 bg-white/80 rounded-3xl flex items-center justify-center text-amber-600 border border-white shadow-xl mb-2">
                     <LayoutDashboard size={40} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">Owner Access</h2>
                  <p className="text-slate-500 text-sm font-medium">Input Security PIN to continue</p>
                </div>

                {/* PIN Dots */}
                <div className="flex gap-4 justify-center py-2">
                   {[...Array(6)].map((_, i) => (
                     <div 
                        key={i} 
                        className={cn(
                          "w-4 h-4 rounded-full border-2 border-white transition-all shadow-inner",
                          pinInput.length > i ? "bg-amber-500 scale-110" : "bg-slate-200/50"
                        )} 
                      />
                   ))}
                </div>

                <div className="grid grid-cols-3 gap-4 w-full max-w-[320px] px-4">
                   {[1,2,3,4,5,6,7,8,9].map(n => (
                     <button 
                      key={n} 
                      onClick={() => handlePinInput(n.toString())}
                      className="aspect-square bg-white shadow-sm flex items-center justify-center rounded-[2rem] font-black text-2xl text-slate-800 border border-slate-100 hover:bg-slate-50 active:scale-95 transition-all"
                     >
                       {n}
                     </button>
                   ))}
                   <button 
                    onClick={() => setPinInput('')}
                    className="aspect-square flex items-center justify-center rounded-[2rem] font-black text-[10px] text-slate-400 hover:text-slate-900 uppercase tracking-widest"
                   >
                     Clear
                   </button>
                   <button 
                    onClick={() => handlePinInput('0')}
                    className="aspect-square bg-white shadow-sm flex items-center justify-center rounded-[2rem] font-black text-2xl text-slate-800 border border-slate-100 hover:bg-slate-50 active:scale-95 transition-all"
                   >
                     0
                   </button>
                   <button className="aspect-square flex items-center justify-center rounded-[2rem] font-black text-amber-500 hover:text-amber-600 transition-colors">
                      <ChevronRight size={32} strokeWidth={3} />
                   </button>
                </div>
              </div>
            ) : (
              <div className="space-y-12 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-6 !mt-4">
                  <div className="bg-white !p-2 rounded-[10px] border border-white shadow-sm text-left">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 opacity-70">Sales (Hari Ini)</p>
                    <p className="text-lg font-black text-emerald-600 italic leading-none">
                      Rp {(todayOrders.reduce((acc: number, o: Order) => acc + o.totalAmount, 0) / 1000).toFixed(0)}k
                    </p>
                  </div>
                  <div className="bg-white !p-2 rounded-[10px] border border-white shadow-sm text-left">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 opacity-70">Order (Hari Ini)</p>
                    <p className="text-lg font-black text-slate-900 italic leading-none">
                      {todayOrders.length} <span className="text-[8px] not-italic text-slate-400">nota</span>
                    </p>
                  </div>
                </div>

                {/* Sales Trend Chart (Custom SVG) */}
                <div className="bg-white p-8 !rounded-[10px] border border-white shadow-sm space-y-6 !mt-2">
                  <div className="flex items-center gap-3 px-1">
                    <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600">
                      <TrendingUp size={16} />
                    </div>
                    <h3 className="text-xs font-black text-slate-900 uppercase italic tracking-widest">Tren Penjualan</h3>
                  </div>
                  
                  <div className="h-32 w-full relative group">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                      {/* Grid Lines */}
                      <line x1="0" y1="40" x2="100" y2="40" stroke="#f1f5f9" strokeWidth="0.5" />
                      
                      {/* Path Gradient */}
                      <defs>
                        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      {/* Area & Line */}
                      {(() => {
                        const max = Math.max(...salesTrend.map((t) => t.amount), 1000)
                        const points = salesTrend.map((t, i) => `${(i / (salesTrend.length - 1)) * 100},${40 - (t.amount / max) * 35}`).join(' ')
                        return (
                          <>
                            <path
                              d={`M 0,40 ${points} L 100,40 Z`}
                              fill="url(#gradient)"
                              className="transition-all duration-1000"
                            />
                            <polyline
                              fill="none"
                              stroke="#10b981"
                              strokeWidth={analyticsRange === 'month' ? "1.5" : "2"}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              points={points}
                              className="transition-all duration-1000"
                            />
                            {/* Points - Hidden in month view for cleanliness */}
                            {analyticsRange !== 'month' && salesTrend.map((t, i) => (
                              <circle
                                key={i}
                                cx={(i / (salesTrend.length - 1)) * 100}
                                cy={40 - (t.amount / max) * 35}
                                r="1.5"
                                fill="white"
                                stroke="#10b981"
                                strokeWidth="1"
                              />
                            ))}
                          </>
                        )
                      })()}
                    </svg>
                    
                    {/* X-Axis Labels */}
                    <div className="flex justify-between mt-4">
                      {salesTrend.filter((_, i) => {
                        if (analyticsRange === 'today') return i % 2 === 0 || i === salesTrend.length - 1
                        if (analyticsRange === 'week') return true
                        return i % 5 === 0 || i === salesTrend.length - 1
                      }).map((t, i) => (
                        <span 
                          key={i} 
                          className={cn(
                            "text-[8px] font-black uppercase tracking-tighter",
                            t.isToday ? "text-emerald-600" : "text-slate-500"
                          )}
                        >
                          {t.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top Products */}
                <div className="bg-white !p-1 rounded-[10px] border border-white shadow-sm space-y-8 !mt-3">
                  <div className="flex justify-between items-center px-1">
                    <div className="flex items-center gap-3">
                      <div className="bg-amber-50 p-2 rounded-xl text-amber-600">
                        <Star size={16} />
                      </div>
                      <h3 className="text-xs font-black text-slate-900 uppercase italic tracking-widest">Menu Terlaris</h3>
                    </div>
                  </div>

                  {/* Range Switcher */}
                  <div className="flex bg-slate-50 p-1 rounded-xl gap-1">
                    {(['today', 'week', 'month'] as const).map(range => (
                      <button
                        key={range}
                        onClick={() => setAnalyticsRange(range)}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all",
                          analyticsRange === range ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"
                        )}
                      >
                        {range === 'today' ? 'Hari' : range === 'week' ? 'Minggu' : 'Bulan'}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-5">
                    {topProducts.length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic py-4 text-center">Data belum tersedia</p>
                    ) : (
                      topProducts.map((p, i) => {
                        const maxCount = topProducts[0].count
                        const percent = (p.count / maxCount) * 100
                        return (
                          <div key={i} className="space-y-2">
                            <div className="flex justify-between items-end">
                              <div>
                                <p className="text-[10px] font-black text-slate-900 uppercase italic leading-none">{p.name}</p>
                                {p.dough && <p className="text-[8px] font-black text-emerald-600 leading-none mt-1 uppercase">{p.dough}</p>}
                              </div>
                              <p className="text-[10px] font-black text-slate-500 uppercase">{p.count}x</p>
                            </div>
                            <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${percent}%` }}
                                className="h-full bg-amber-500 rounded-full"
                              />
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                  <h3 className="text-base font-black text-slate-900 uppercase italic tracking-widest px-2">Order History</h3>
                  <div className="space-y-3">
                    {todayOrders.length === 0 ? (
                      <div className="py-20 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-[2.5rem]">
                        Belum ada pesanan masuk hari ini
                      </div>
                    ) : (
                      todayOrders.map(order => (
                        <div key={order.id} className="bg-white p-6 rounded-[8px] border border-white shadow-sm flex justify-between items-center group !my-1">
                          <div className="text-left space-y-1">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              {new Date(order.timestamp).toLocaleTimeString('id-ID', {day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })} • #{order.id.split('-').slice(-1)}
                            </p>
                            <p className="font-black text-sm text-[12px] text-slate-900 italic">
                              {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                            </p>
                          </div>
                          <div className="text-right !pr-[5px]">
                             <p className="font-black text-[15px] text-emerald-600 italic">Rp {(order.totalAmount / 1000).toFixed(0)}k</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setIsOwnerAuthenticated(false)
                    setPinInput('')
                  }}
                  className="w-full py-4 text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] hover:text-slate-900 transition-colors"
                >
                  Logout Owner Mode
                </button>
              </div>
            )}
          </div>
        )}
      </main>

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
              className="fixed top-1/2 left-1/2 w-[90%] max-w-[400px] bg-white rounded-[1.5rem] shadow-2xl z-50 p-10 pt-12 pb-12 border border-white/60 text-center"
            >
              <div className="mb-10">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-2 italic">Varian Martabak</p>
                <h3 className="text-2xl font-black text-slate-900 leading-tight uppercase italic tracking-tight">{selectedProductForDough.name}</h3>
              </div>

              <div className="space-y-6 mb-12">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Pilih Adonan</p>
                <div className="grid grid-cols-2 gap-3">
                  {DOUGH_OPTIONS.map(dough => (
                    <button
                      key={dough.id}
                      onClick={() => setSelectedDoughId(dough.id)}
                      className={cn(
                        "flex flex-col items-center justify-center !p-4 rounded-2xl font-black text-[10px] transition-all border gap-1",
                        selectedDoughId === dough.id
                          ? "bg-emerald-600 text-white border-emerald-500 shadow-lg scale-105"
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
                className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-xs shadow-xl shadow-emerald-500/20 uppercase tracking-[0.1em] flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <span>Tambahkan</span>
                <ChevronRight size={14} strokeWidth={3} />
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
                className="fixed top-1/2 left-1/2 w-[92%] max-w-[440px] bg-white rounded-[1.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.3)] z-50 p-10 pt-12 pb-10 border border-white/60 overflow-hidden"
              >
                {/* Header */}
                <div className="relative text-center mb-10">
                  <h3 className="text-lg font-black text-slate-900 italic uppercase tracking-[0.3em]">Detail Pesanan</h3>
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
                             <p className="font-black text-xs text-slate-900 uppercase italic leading-tight truncate tracking-tight">
                              {item.name}
                            </p>
                            {item.selectedDough && (
                              <p className="text-[10px] text-emerald-600 font-black uppercase mt-0.5 tracking-wider">
                                {item.selectedDough.label}
                              </p>
                            )}
                          </div>
                          <p className="text-[11px] font-black text-amber-600 uppercase tracking-wide">
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
                          <span className="font-black text-xs w-6 text-center text-slate-900">{item.quantity}</span>
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
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-80">Total Bayar</p>
                    <p className="text-lg font-black text-slate-900 tracking-tight italic">
                      Rp {getTotal().toLocaleString('id-ID')}
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      checkout()
                      setIsCartOpen(false)
                    }}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-[10px] shadow-xl shadow-slate-900/20 uppercase tracking-[0.2em] hover:bg-slate-800 active:scale-95 transition-all"
                  >
                    Bayar Sekarang
                  </button>
                </div>
              </motion.div>
            )}

            <motion.footer 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-6 left-0 right-0 px-6 z-40"
            >
              <button 
                onClick={() => setIsCartOpen(!isCartOpen)}
                className={cn(
                  "w-full !max-w-[75%] mx-auto bg-slate-900 text-white rounded-[2rem] flex justify-between items-center shadow-[0_20px_40px_rgba(0,0,0,0.2)] relative overflow-hidden group border border-white/10 transition-all duration-300",
                  isCartOpen ? "p-6" : "p-4"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("bg-emerald-500 rounded-xl transition-all", isCartOpen ? "p-3" : "p-2")}>
                    <ShoppingCart size={isCartOpen ? 24 : 18} strokeWidth={2.5} />
                  </div>
                  <div className="text-left flex items-baseline gap-2">
                    <p className={cn("font-black tracking-tight leading-none transition-all", isCartOpen ? "text-base" : "text-sm")}>
                      {items.reduce((acc, item) => acc + item.quantity, 0)} Menu
                    </p>
                    <span className="text-white/30 font-black">—</span>
                    <p className={cn("font-black tracking-tight leading-none transition-all text-amber-400", isCartOpen ? "text-base" : "text-sm")}>
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
