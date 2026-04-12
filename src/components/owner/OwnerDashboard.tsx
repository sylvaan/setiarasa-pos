import { X } from 'lucide-react'
import type { Order, OwnerView, Expense } from '../../types'
import { calculateRevenue, calculateExpenses } from '../../utils/analytics'
import Button from '../ui/Button'

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

const OwnerDashboard = ({
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
  
  // High-level Financial Calculations
  const currentRevenue = calculateRevenue(orders, analyticsRange)
  const currentExpenses = calculateExpenses(expenses, analyticsRange)
  const netProfit = currentRevenue - currentExpenses

  return (
    <div className="!py-6 animate-in fade-in slide-in-from-bottom-4 duration-500 !space-y-8 max-w-[440px] !mx-auto w-full px-2">
      
      {activeOwnerView === 'overview' && (
        <OwnerOverview 
          todayOrders={todayOrders}
          analyticsRange={analyticsRange}
          setAnalyticsRange={setAnalyticsRange}
          currentRevenue={currentRevenue}
          currentExpenses={currentExpenses}
          netProfit={netProfit}
          salesTrend={salesTrend}
          setActiveOwnerView={setActiveOwnerView}
        />
      )}

      {activeOwnerView === 'sales' && (
        <OwnerSales 
          topProducts={topProducts}
          analyticsRange={analyticsRange}
          setAnalyticsRange={setAnalyticsRange}
          setActiveOwnerView={setActiveOwnerView}
        />
      )}

      {activeOwnerView === 'history' && (
        <OwnerHistory 
          setActiveOwnerView={setActiveOwnerView}
        />
      )}

      {activeOwnerView === 'catalog' && (
        <OwnerCatalog 
          setActiveOwnerView={setActiveOwnerView}
        />
      )}

      {/* Global Logout Button */}
      <Button 
        variant="white"
        fullWidth
        size="lg"
        onClick={onLogout}
        className="!text-slate-400 !text-[10px] !gap-3 !rounded-[2rem] border-white shadow-sm mt-4"
      >
        <X size={14} className="opacity-50" /> Keluar Mode Owner
      </Button>
    </div>
  )
}

// Sub-sections
import OwnerOverview from './sections/OwnerOverview'
import OwnerSales from './sections/OwnerSales'
import OwnerHistory from './sections/OwnerHistory'
import OwnerCatalog from './sections/OwnerCatalog'

export default OwnerDashboard
