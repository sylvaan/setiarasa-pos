import { useState, useMemo, useEffect, useCallback } from 'react'
import { App as CapApp } from '@capacitor/app'
import { MOCK_PRODUCTS } from './api/mockData'
import type { Product, StaffView, OwnerView, DoughOption } from './types'
import { useCartStore } from './store/useCartStore'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Components
import { Header } from './components/common/Header'
import { SideNavigation } from './components/common/SideNavigation'
import { POSSection } from './components/staff/POSSection'
import { ExpenseSection } from './components/staff/ExpenseSection'
import { OwnerAuth } from './components/owner/OwnerAuth'
import { OwnerDashboard } from './components/owner/OwnerDashboard'
import { DoughSelectorModal } from './components/staff/DoughSelectorModal'
import { CartModal } from './components/staff/CartModal'

// Utils
import { getTodayOrders, getTopProducts, getSalesTrend } from './utils/analytics'

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
  const todayOrders = useMemo(() => getTodayOrders(orders), [orders])
  const topProductsList = useMemo(() => getTopProducts(orders, analyticsRange), [orders, analyticsRange])
  const salesTrendList = useMemo(() => getSalesTrend(orders, analyticsRange), [orders, analyticsRange])

  const filteredProducts = useMemo(() => 
    MOCK_PRODUCTS.filter(p => p.category === selectedCategory),
    [selectedCategory]
  )


  const handleProductClick = (product: Product) => {
    if (product.category === 'manis') {
      setSelectedProductForDough(product)
      setSelectedDoughId('original')
    } else {
      addItem(product)
    }
  }

  const handleAddWithDough = (product: Product, dough: DoughOption) => {
    addItem(product, dough)
    setSelectedProductForDough(null)
  }

  return (
    <div className={cn(
      "container min-h-screen pb-56 overflow-hidden transition-colors duration-500 bg-linear-to-b",
      selectedCategory === 'manis' ? "from-emerald-50/30 to-sky-50" : "from-amber-50/30 to-sky-50"
    )}>
      {/* Optimized Ambience Layers */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Manis Layer */}
        <div className={cn(
          "absolute -top-24 -left-24 w-96 h-96 rounded-full blur-[100px] bg-emerald-400/20 transition-opacity duration-500 will-change-opacity transform-gpu translate-z-0",
          selectedCategory === 'manis' ? "opacity-100" : "opacity-0"
        )} />
        
        {/* Telor Layer */}
        <div className={cn(
          "absolute -bottom-24 -right-24 w-[450px] h-[450px] rounded-full blur-[120px] bg-amber-400/15 transition-opacity duration-500 will-change-opacity transform-gpu translate-z-0",
          selectedCategory === 'telor' ? "opacity-100" : "opacity-0"
        )} />

        {/* Global Accent layer */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-sky-400/5 blur-[150px] opacity-10" />
      </div>

      <Header 
        onMenuClick={() => setIsSideNavOpen(true)} 
        activeTab={activeTab} 
        selectedCategory={selectedCategory}
      />

      <main className="mt-10 !mb-10 min-h-[calc(100vh-200px)]">
        {activeTab === 'staff' ? (
          activeStaffView === 'pos' ? (
            <POSSection 
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              filteredProducts={filteredProducts}
              items={items}
              onProductClick={handleProductClick}
            />
          ) : (
            <ExpenseSection 
              expenses={expenses}
              addExpense={addExpense}
              removeExpense={removeExpense}
            />
          )
        ) : (
          !isOwnerAuthenticated ? (
            <OwnerAuth 
              pinInput={pinInput}
              isPinError={isPinError}
              onPinInput={handlePinInput}
              onClear={() => setPinInput('')}
            />
          ) : (
            <OwnerDashboard 
              activeOwnerView={activeOwnerView}
              setActiveOwnerView={setActiveOwnerView}
              todayOrders={todayOrders}
              orders={orders}
              expenses={expenses}
              topProducts={topProductsList}
              salesTrend={salesTrendList}
              analyticsRange={analyticsRange}
              setAnalyticsRange={setAnalyticsRange}
              onLogout={() => {
                setIsOwnerAuthenticated(false)
                setPinInput('')
              }}
            />
          )
        )}
      </main>

      <SideNavigation 
        isOpen={isSideNavOpen}
        onClose={() => setIsSideNavOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeStaffView={activeStaffView}
        setActiveStaffView={setActiveStaffView}
        activeOwnerView={activeOwnerView}
        setActiveOwnerView={setActiveOwnerView}
        isOwnerAuthenticated={isOwnerAuthenticated}
      />

      <DoughSelectorModal 
        product={selectedProductForDough}
        selectedDoughId={selectedDoughId}
        setSelectedDoughId={setSelectedDoughId}
        onClose={() => setSelectedProductForDough(null)}
        onAdd={handleAddWithDough}
      />

      {activeTab === 'staff' && activeStaffView === 'pos' && (
        <CartModal 
          items={items}
          isCartOpen={isCartOpen}
          setIsCartOpen={setIsCartOpen}
          removeItem={removeItem}
          addItem={addItem}
          getTotal={getTotal}
          checkout={checkout}
        />
      )}
    </div>
  )
}
