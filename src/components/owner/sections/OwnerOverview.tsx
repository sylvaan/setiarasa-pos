import { LayoutDashboard, Wallet, TrendingUp, PieChart, History } from 'lucide-react'
import type { Order, OwnerView } from '../../../types'
import { Heading, Label } from '../../ui/Typography'
import StatCard from '../../shared/StatCard'
import SalesTrendChart from '../../shared/SalesTrendChart'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface OwnerOverviewProps {
  todayOrders: Order[]
  analyticsRange: 'today' | 'week' | 'month'
  setAnalyticsRange: (range: 'today' | 'week' | 'month') => void
  currentRevenue: number
  currentExpenses: number
  netProfit: number
  salesTrend: { label: string, timestamp: number, amount: number, isToday?: boolean }[]
  setActiveOwnerView: (view: OwnerView) => void
}

const OwnerOverview = ({
  todayOrders,
  analyticsRange,
  setAnalyticsRange,
  currentRevenue,
  currentExpenses,
  netProfit,
  salesTrend,
  setActiveOwnerView
}: OwnerOverviewProps) => {

  return (
    <div className="!space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 !pb-10">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 !gap-5 !px-2">
        <StatCard 
          label="Total Omzet" 
          value={`Rp ${Number((currentRevenue/1000).toFixed(1))}k`} 
          icon={TrendingUp} 
          trend="+12%"
        />
        <StatCard 
          label="Pengeluaran" 
          value={`Rp ${Number((currentExpenses/1000).toFixed(1))}k`} 
          icon={Wallet} 
          variant="amber"
          trend="-5%"
        />
        <StatCard 
          label="Total Pesanan" 
          value={todayOrders.length.toString()} 
          icon={LayoutDashboard}
          variant="blue"
        />
        <StatCard 
          label="Profit Bersih" 
          value={`Rp ${Number((netProfit/1000).toFixed(1))}k`} 
          icon={TrendingUp} 
        />
      </div>

      {/* Analytics Graph Section */}
      <div className="!px-2 !space-y-4">
        {/* Range Selector */}
        <div className="flex bg-slate-100/50 p-1 rounded-2xl border border-slate-200/40">
           {(['today', 'week', 'month'] as const).map((r) => (
             <button
               key={r}
               onClick={() => setAnalyticsRange(r)}
               className={cn(
                 "!flex-1 !py-2 !text-[10px] !font-black uppercase tracking-widest rounded-xl transition-all",
                 analyticsRange === r 
                   ? "!bg-white !text-emerald-600 !shadow-sm !border !border-white" 
                   : "!text-slate-400 !opacity-60"
               )}
             >
               {r === 'today' ? 'Hari' : r === 'week' ? 'Minggu' : 'Bulan'}
             </button>
           ))}
        </div>

        <SalesTrendChart 
          data={salesTrend}
          range={analyticsRange}
        />
      </div>

      {/* Main Navigation Cards */}
      <div className="!space-y-5 !px-2">
        <Label className="!ml-2 !opacity-60 !mb-2 block uppercase tracking-[0.2em] font-black">Manajemen Data</Label>
        
        <div 
          onClick={() => setActiveOwnerView('sales')}
          className={cn(
            "group relative !p-8 !rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden cursor-pointer active:scale-95 transition-all"
          )}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
          <div className="relative flex items-center gap-6">
            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
               <PieChart size={32} />
            </div>
            <div className="text-left">
               <Heading as="h3" className="!text-lg !mb-1">Analitik Produk</Heading>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Lihat Menu Terlaris</p>
            </div>
          </div>
        </div>

        <div 
          onClick={() => setActiveOwnerView('history')}
          className={cn(
            "group relative !p-8 !rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden cursor-pointer active:scale-95 transition-all"
          )}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
          <div className="relative flex items-center gap-6">
            <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
               <History size={32} />
            </div>
            <div className="text-left">
               <Heading as="h3" className="!text-lg !mb-1">Riwayat Transaksi</Heading>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Cari Transaksi Lama</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OwnerOverview
