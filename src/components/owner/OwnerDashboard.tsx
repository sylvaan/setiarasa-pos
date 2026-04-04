import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  PieChart, 
  ChevronRight, 
  X, 
  DollarSign, 
  ShoppingCart, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingDown
} from 'lucide-react'
import type { Order, OwnerView, Expense } from '../../types'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { calculateRevenue, calculateExpenses } from '../../utils/analytics'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface OwnerDashboardProps {
  activeOwnerView: OwnerView
  setActiveOwnerView: (view: OwnerView) => void
  todayOrders: Order[]
  orders: Order[]
  expenses: Expense[]
  topProducts: { name: string, count: number, dough?: string }[]
  salesTrend: { label: string, timestamp: number, amount: number, isToday?: boolean }[]
  analyticsRange: 'today' | 'week' | 'month'
  setAnalyticsRange: (range: 'today' | 'week' | 'month') => void
  onLogout: () => void
}

export const OwnerDashboard = ({
  activeOwnerView,
  setActiveOwnerView,
  todayOrders,
  orders,
  expenses,
  topProducts,
  salesTrend,
  analyticsRange,
  setAnalyticsRange,
  onLogout
}: OwnerDashboardProps) => {
  
  // Financial Calculations
  const currentRevenue = calculateRevenue(orders, analyticsRange)
  const currentExpenses = calculateExpenses(expenses, analyticsRange)
  const netProfit = currentRevenue - currentExpenses

  return (
    <div className="!py-6 animate-in fade-in slide-in-from-bottom-4 duration-500 !space-y-8 max-w-[440px] !mx-auto w-full px-2">
      {activeOwnerView === 'overview' && (
        <div className="!space-y-8">
          {/* Main Key Stats */}
          <div className="grid grid-cols-2 gap-5">
            <div className="!bg-white !p-5 !rounded-[2rem] border border-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] text-left !space-y-3 relative overflow-hidden group">
              <div className="w-10 h-10 !bg-emerald-50 !rounded-xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100/50">
                <DollarSign size={20} strokeWidth={2.5} />
              </div>
              <div>
                <p className="!text-[9px] !font-bold text-slate-400 uppercase tracking-widest opacity-80">Sales Hari Ini</p>
                <p className="!text-xl !font-bold text-slate-900 italic leading-none !mt-1">
                  Rp {(todayOrders.reduce((acc, o) => acc + o.totalAmount, 0) / 1000).toFixed(0)}k
                </p>
              </div>
            </div>

            <div className="!bg-white !p-5 !rounded-[2rem] border border-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] text-left !space-y-3 relative overflow-hidden group">
              <div className="w-10 h-10 !bg-sky-50 !rounded-xl flex items-center justify-center text-sky-600 shadow-sm border border-sky-100/50">
                <ShoppingCart size={20} strokeWidth={2.5} />
              </div>
              <div>
                <p className="!text-[9px] !font-bold text-slate-400 uppercase tracking-widest opacity-80">Nota Masuk</p>
                <p className="!text-xl !font-bold text-slate-900 italic leading-none !mt-1">
                  {todayOrders.length} <span className="!text-[9px] !font-bold uppercase not-italic text-slate-400 ml-1">pcs</span>
                </p>
              </div>
            </div>
          </div>

          {/* Profit & Loss Card */}
          <div className="!bg-white !p-7 !rounded-[2.5rem] border border-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] !space-y-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 !p-8 opacity-5">
                {netProfit >= 0 ? <TrendingUp size={120} /> : <TrendingDown size={120} />}
             </div>
             
             <div className="flex justify-between items-center relative z-10">
                <div className="space-y-1">
                   <h3 className="!text-xs !font-bold text-slate-900 uppercase italic tracking-widest">Ringkasan Laba Rugi</h3>
                   <p className="!text-[9px] font-bold text-slate-400 uppercase tracking-widest">Periode {analyticsRange}</p>
                </div>
                <div className={cn(
                  "!px-3 !py-1 !rounded-full !text-[8px] !font-bold uppercase tracking-widest border",
                  netProfit >= 0 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                )}>
                  {netProfit >= 0 ? 'Surplus' : 'Defisit'}
                </div>
             </div>

             <div className="grid grid-cols-2 gap-10 relative z-10 border-b border-slate-50 pb-8">
                <div className="space-y-2">
                   <div className="flex items-center gap-1.5 opacity-60">
                      <ArrowUpRight size={10} className="text-emerald-500" />
                      <span className="!text-[9px] font-bold text-slate-400 uppercase tracking-widest">Revenue</span>
                   </div>
                   <p className="!text-sm !font-bold text-slate-900 italic">Rp {(currentRevenue / 1000).toLocaleString('id-ID')}k</p>
                </div>
                <div className="space-y-2 text-right">
                   <div className="flex items-center gap-1.5 justify-end opacity-60">
                      <span className="!text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pengeluaran</span>
                      <ArrowDownRight size={10} className="text-rose-500" />
                   </div>
                   <p className="!text-sm !font-bold text-slate-900 italic">Rp {(currentExpenses / 1000).toLocaleString('id-ID')}k</p>
                </div>
             </div>

             <div className="pt-2 flex justify-between items-center relative z-10 px-2 pb-1">
                <p className="!text-[10px] !font-bold text-slate-500 uppercase italic tracking-wider">Laba Bersih</p>
                <p className={cn(
                  "!text-2xl !font-bold italic tracking-tight leading-none",
                  netProfit >= 0 ? "!text-emerald-600" : "!text-rose-600"
                )}>
                  Rp {(netProfit / 1000).toLocaleString('id-ID')}k
                </p>
             </div>
          </div>

          {/* Chart Card */}
          <div className="!bg-white !p-8 !rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/40 !space-y-10">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="!bg-emerald-50 !p-2.5 !rounded-xl text-emerald-600 shadow-sm border border-emerald-100">
                  <TrendingUp size={18} />
                </div>
                <h3 className="!text-sm !font-bold text-slate-900 uppercase italic tracking-widest">Analitik Tren</h3>
              </div>
              <div className="flex bg-slate-50 p-1 rounded-xl gap-1 border border-slate-100">
                {(['today', 'week', 'month'] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setAnalyticsRange(range)}
                    className={cn(
                      "!px-3 !py-1.5 !rounded-lg !text-[8px] !font-bold uppercase tracking-widest transition-all",
                      analyticsRange === range ? "!bg-white !text-slate-900 shadow-sm border border-slate-100" : "text-slate-400"
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

                {/* Grid Lines */}
                <line x1="0" y1="0" x2="100" y2="0" stroke="#f1f5f9" strokeWidth="0.5" />
                <line x1="0" y1="20" x2="100" y2="20" stroke="#f1f5f9" strokeWidth="0.5" />
                <line x1="0" y1="40" x2="100" y2="40" stroke="#f1f5f9" strokeWidth="0.5" />

                {(() => {
                  const max = Math.max(...salesTrend.map((t) => t.amount), 1000)
                  const points = salesTrend.map((t, i) => `${(i / (salesTrend.length - 1)) * 100},${40 - (t.amount / max) * 35}`).join(' ')
                  return (
                    <>
                      <path d={`M 0,40 ${points} L 100,40 Z`} fill="url(#chart-grad)" />
                      <polyline fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
                      {/* Interaction dots */}
                      {salesTrend.filter((_, i) => i === 0 || i === salesTrend.length - 1 || salesTrend[i].isToday).map((t, i) => {
                         const idx = salesTrend.indexOf(t)
                         const x = (idx / (salesTrend.length -1)) * 100
                         const y = 40 - (t.amount / max) * 35
                         return <circle key={i} cx={x} cy={y} r="2" fill="#10b981" stroke="white" strokeWidth="1" />
                      })}
                    </>
                  )
                })()}
              </svg>
              
              <div className="flex justify-between !mt-4 px-1">
                {salesTrend.filter((_, i) => analyticsRange === 'month' ? i % 7 === 0 : true).map((t, i) => (
                  <span key={i} className={cn("!text-[9px] !font-bold uppercase tracking-tighter opacity-60", t.isToday ? "!text-emerald-600 opacity-100" : "!text-slate-400")}>
                    {t.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Navigation Card */}
          <div className="!p-6 !bg-amber-50 !rounded-[2.5rem] border border-amber-100/50 flex items-center justify-between group active:scale-95 transition-all cursor-pointer shadow-sm shadow-amber-500/5" onClick={() => setActiveOwnerView('sales')}>
             <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm !border !border-amber-100">
                   <PieChart size={22} />
                </div>
                <div>
                  <p className="!font-bold !text-sm !text-amber-900 uppercase italic leading-none">Lihat Performa Menu</p>
                  <p className="!text-[10px] !text-amber-600 !font-medium !opacity-70 !mt-1.5">Cek martabak mana yang paling cuan</p>
                </div>
             </div>
             <ChevronRight size={20} className="text-amber-300 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      )}

      {activeOwnerView === 'sales' && (
        <div className="!space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="flex items-center justify-between !px-4">
             <div className="flex items-center !gap-4">
                <button onClick={() => setActiveOwnerView('overview')} className="!p-2.5 !bg-white !rounded-xl !text-slate-400 shadow-sm border border-slate-100 active:scale-90 transition-all">
                  <X size={18} className="rotate-90" />
                </button>
                <h3 className="!text-lg !font-bold !text-slate-900 uppercase italic tracking-widest">Produk Terlaris</h3>
             </div>
          </div>

          <div className="!bg-white !p-8 rounded-[2.5rem] !shadow-xl !shadow-slate-200/50 border border-slate-100 !space-y-10">
            <div className="!flex !bg-slate-50 !p-1.5 !rounded-2xl !gap-1 !border !border-slate-100">
              {(['today', 'week', 'month'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setAnalyticsRange(range)}
                  className={cn(
                    "flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                    analyticsRange === range ? "bg-white text-slate-900 shadow-lg shadow-slate-200 border border-slate-50" : "text-slate-400 hover:text-slate-600 font-medium"
                  )}
                >
                  {range === 'today' ? 'Hari' : range === 'week' ? 'Minggu' : 'Bulan'}
                </button>
              ))}
            </div>

            <div className="!space-y-10">
              {topProducts.length === 0 ? (
                <div className="!py-24 text-center space-y-4">
                   <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto border-2 border-dashed border-slate-100">
                      <PieChart size={32} />
                   </div>
                   <p className="text-slate-300 italic font-bold uppercase tracking-widest text-[9px] opacity-80">Data Belum Tersedia</p>
                </div>
              ) : (
                topProducts.map((p, i) => {
                  const percent = (p.count / topProducts[0].count) * 100
                  return (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      key={i} 
                      className="space-y-4"
                    >
                      <div className="flex justify-between items-end px-1">
                        <div className="space-y-1.5">
                          <p className="text-sm font-bold text-slate-900 uppercase italic tracking-tight">{p.name}</p>
                          <div className="flex items-center gap-2">
                             <span className="!px-2 !py-0.5 !bg-emerald-50 !text-emerald-600 !text-[8px] font-bold !uppercase tracking-widest !rounded-md border border-emerald-100">
                                {p.dough || 'Standar'}
                             </span>
                          </div>
                        </div>
                        <div className="text-right">
                           <p className="text-xs font-bold text-slate-900 tabular-nums">{p.count} <span className="text-[9px] text-slate-400 uppercase tracking-widest ml-0.5">Terjual</span></p>
                        </div>
                      </div>
                      <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50 p-0.5">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} className="h-full bg-linear-to-r from-amber-400 to-amber-500 rounded-full shadow-sm" />
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}

      {activeOwnerView === 'history' && (
        <div className="!space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 !pb-20">
          <div className="flex items-center justify-between !px-4">
             <div className="flex items-center !gap-4">
                <button onClick={() => setActiveOwnerView('overview')} className="!p-2.5 !bg-white !rounded-xl !text-slate-400 shadow-sm border border-slate-100 active:scale-90 transition-all">
                  <X size={18} className="rotate-90" />
                </button>
                <h3 className="!text-lg !font-bold !text-slate-900 uppercase italic tracking-widest">Riwayat Nota</h3>
             </div>
          </div>

          <div className="!space-y-5">
            {orders.length === 0 ? (
              <div className="!py-24 text-center space-y-4 border-2 border-dashed border-slate-200 rounded-[3rem] bg-white/30 backdrop-blur-sm mx-2">
                 <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mx-auto border-2 border-white shadow-sm">
                    <Wallet size={32} />
                 </div>
                 <p className="text-slate-400 italic font-bold uppercase tracking-widest text-[10px]">Data nota masih kosong</p>
              </div>
            ) : (
              orders.map((order, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={order.id} 
                  className="!bg-white !p-7 rounded-[2rem] border border-white shadow-[0_10px_20px_rgba(0,0,0,0.02)] flex flex-col gap-6 group active:scale-[0.99] transition-all"
                >
                   <div className="!flex justify-between items-center border-b border-slate-50 !pb-5">
                      <div className="!space-y-1.5 text-left">
                         <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                           <p className="!text-[9px] !font-bold !text-slate-400 !uppercase !tracking-widest opacity-80">
                             {new Date(order.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}
                           </p>
                         </div>
                         <p className="!text-xs !font-bold !text-slate-900 !uppercase !tracking-tight opacity-90">Nota #{order.id.split('-').slice(-1)}</p>
                      </div>
                      <p className="!text-lg !font-bold !text-emerald-600 !italic tracking-tight">Rp {(order.totalAmount/1000).toFixed(0)}k</p>
                   </div>
                   <div className="!flex flex-wrap !gap-2.5">
                      {order.items.map((it, idx) => (
                        <span key={idx} className="!bg-slate-50 !text-slate-500 !text-[8.5px] !font-bold !px-3 !py-1.5 !rounded-xl !border !border-slate-100 !uppercase !tracking-tight flex items-center gap-1.5">
                          <span className="w-4 h-4 bg-white rounded-md flex items-center justify-center text-emerald-600 border border-slate-100">{it.quantity}</span>
                          {it.name} {it.selectedDough ? `(${it.selectedDough.label})` : ''}
                        </span>
                      ))}
                   </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}

      <button 
        onClick={onLogout}
        className="!w-full !py-6 !bg-white !text-slate-400 !font-bold !text-[10px] !uppercase !tracking-[0.3em] hover:text-rose-500 transition-all flex items-center justify-center !gap-3 !rounded-[2rem] border border-white shadow-sm active:scale-95 mt-4"
      >
        <X size={14} className="opacity-50" /> Keluar Mode Owner
      </button>
    </div>
  )
}
