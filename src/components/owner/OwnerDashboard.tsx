import { X } from 'lucide-react'
import type { Order, OwnerView, Expense, Product, CartItem } from '../../types'
import { calculateRevenue, calculateExpenses } from '../../utils/analytics'
import Button from '../ui/Button'
import { useCartStore } from '../../store/useCartStore'

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
  showNotification: (message: string, type?: "success" | "error") => void
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
  onLogout,
  showNotification
}: OwnerDashboardProps) => {
  const { products, manualInjectOrder, manualInjectExpense, isSyncing } = useCartStore()
  
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
          showNotification={showNotification}
        />
      )}

      {activeOwnerView === 'manual-entry' && (
        <ManualEntry 
          setActiveOwnerView={setActiveOwnerView}
          products={products}
          manualInjectOrder={manualInjectOrder}
          manualInjectExpense={manualInjectExpense}
          isSyncing={isSyncing}
          showNotification={showNotification}
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
import ManualEntry from './sections/ManualEntry'

export default OwnerDashboard
