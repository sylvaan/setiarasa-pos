import {
  useState,
  useMemo,
  useEffect,
  useCallback,
  lazy,
  Suspense,
} from "react";
import { App as CapApp } from "@capacitor/app";
import type {
  Product,
  StaffView,
  OwnerView,
  DoughOption,
  ToppingOption,
} from "./types";
import { useCartStore } from "./store/useCartStore";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Components
import { Header } from "./components/common/Header";
import { SideNavigation } from "./components/common/SideNavigation";
import { POSSection } from "./components/staff/POSSection";
import { DoughSelectorModal } from "./components/staff/DoughSelectorModal";
import { CartModal } from "./components/staff/CartModal";
import NotificationToast from "./components/shared/NotificationToast";
import type { NotificationType } from "./components/shared/NotificationToast";
import { IS_DEMO } from "./lib/config";
import LoadingState from "./components/common/LoadingState";

// Lazy loaded components
const ExpenseSection = lazy(() => import("./components/staff/ExpenseSection"));
const StaffHistory = lazy(() => import("./components/staff/sections/StaffHistory"));
const OwnerAuth = lazy(() => import("./components/owner/OwnerAuth"));
const OwnerDashboard = lazy(() => import("./components/owner/OwnerDashboard"));

// Utils
import {
  getTodayOrders,
  getTopProducts,
  getSalesTrend,
} from "./utils/analytics";

export default function App() {
  const [activeTab, setActiveTab] = useState<"staff" | "owner">("staff");
  const [activeStaffView, setActiveStaffView] = useState<StaffView>("pos");
  const [activeOwnerView, setActiveOwnerView] = useState<OwnerView>("overview");
  const [selectedCategory, setSelectedCategory] = useState<string>("manis");
  const [selectedProductForDough, setSelectedProductForDough] =
    useState<Product | null>(null);
  const [selectedDoughId, setSelectedDoughId] = useState<string>("original");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [pinInput, setPinInput] = useState<string>("");
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState(false);
  const [analyticsRange, setAnalyticsRange] = useState<
    "today" | "week" | "month"
  >("today");
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const [notification, setNotification] = useState<{
    visible: boolean;
    message: string;
    type: NotificationType;
  }>({
    visible: false,
    message: "",
    type: "success",
  });
  const [isPinError, setIsPinError] = useState(false);
  const [ownerAuthTime, setOwnerAuthTime] = useState<number | null>(null);

  const {
    items,
    orders,
    expenses,
    products,
    doughOptions,
    toppingOptions,
    addItem,
    removeItem,
    getTotal,
    checkout,
    addExpense,
    removeExpense,
    fetchInitialData,
    verifyOwnerPin,
    isSyncing,
    lastRemovedItem,
    undoRemoveItem,
  } = useCartStore();

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);


  // Security: Auto logout owner after 1 hour
  useEffect(() => {
    if (!isOwnerAuthenticated || !ownerAuthTime) return;

    const CHECK_INTERVAL = 60000; // Check every 1 minute
    const TIMEOUT_MS = 3600000; // 1 hour

    const interval = setInterval(() => {
      const now = Date.now();
      if (now - ownerAuthTime >= TIMEOUT_MS) {
        setIsOwnerAuthenticated(false);
        setOwnerAuthTime(null);
        setPinInput("");
        setActiveTab("staff");
      }
    }, CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [isOwnerAuthenticated, ownerAuthTime]);

  const handlePinInput = useCallback(
    async (num: string) => {
      if (isPinError) return;
      
      // Update local UI state
      const nextPin = pinInput + num;
      setPinInput(nextPin);

      if (nextPin.length === 6) {
        const isValid = await verifyOwnerPin(nextPin);
        
        if (isValid) {
          setOwnerAuthTime(Date.now());
          setIsOwnerAuthenticated(true);
        } else {
          setIsPinError(true);
          setTimeout(() => {
            setPinInput("");
            setIsPinError(false);
          }, 1500);
        }
      }
    },
    [isPinError, pinInput, verifyOwnerPin],
  );

  // Keyboard PIN Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab === "owner" && !isOwnerAuthenticated) {
        if (/^[0-9]$/.test(e.key)) {
          handlePinInput(e.key);
        } else if (e.key === "Backspace") {
          setPinInput((prev) => prev.slice(0, -1));
        } else if (e.key === "Escape") {
          setPinInput("");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, isOwnerAuthenticated, handlePinInput]);

  // Hardware Back Button Support (Android)
  useEffect(() => {
    const handleBackButton = async () => {
      if (isCartOpen) {
        setIsCartOpen(false);
      } else if (selectedProductForDough) {
        setSelectedProductForDough(null);
      } else if (activeTab === "owner") {
        setActiveTab("staff");
        setIsOwnerAuthenticated(false);
        setPinInput("");
      }
    };

    const listener = CapApp.addListener("backButton", handleBackButton);
    return () => {
      listener.then((l) => l.remove());
    };
  }, [isCartOpen, selectedProductForDough, activeTab]);

  // Analytics Helpers
  const todayOrders = useMemo(() => getTodayOrders(orders), [orders]);
  const topProductsList = useMemo(
    () => getTopProducts(orders, analyticsRange),
    [orders, analyticsRange],
  );
  const salesTrendList = useMemo(
    () => getSalesTrend(orders, analyticsRange),
    [orders, analyticsRange],
  );

  const filteredProducts = useMemo(
    () => products.filter((p) => p.category === selectedCategory),
    [selectedCategory, products],
  );

  const handleProductClick = (product: Product) => {
    if (product.category === "manis") {
      setSelectedProductForDough(product);
      setSelectedDoughId("original");
    } else {
      addItem(product);
    }
  };

  const handleAddWithDough = (
    product: Product,
    dough: DoughOption,
    toppings: ToppingOption[],
  ) => {
    addItem(product, dough, toppings);
    setSelectedProductForDough(null);
  };

  const showNotification = (message: string, type: NotificationType = 'success') => {
    setNotification({ visible: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  const handleCheckout = async () => {
    try {
      await checkout();
      showNotification("Pesanan Berhasil Disimpan!");
      // After checkout is successful, refresh data to update popularity
      setTimeout(() => {
        fetchInitialData();
      }, 500);
    } catch (error) {
      showNotification("Gagal menyimpan pesanan. Coba lagi.", "error");
    }
  };

  return (
    <div
      className={cn(
        "container min-h-screen pb-56 overflow-hidden transition-colors duration-500 bg-linear-to-b",
        selectedCategory === "manis"
          ? "from-emerald-50 to-sky-50"
          : "from-amber-50 to-sky-50",
      )}
    >
      {/* Demo Mode Badge */}
      {IS_DEMO && (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <div className="!bg-amber-100/80 !border-b !border-x !border-amber-200/50 text-amber-800 text-[10px] font-bold !px-4 !py-1.5 !rounded-b-2xl tracking-[0.2em] uppercase shadow-sm animate-in slide-in-from-top duration-700">
            Demo Mode
          </div>
        </div>
      )}

      {/* Optimized Ambience Layers */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-white/50">
        {/* Manis Layer */}
        <div
          className={cn(
            "absolute -top-24 -left-24 w-80 h-80 rounded-full blur-[60px] bg-emerald-400/20 transition-opacity duration-500 will-change-opacity transform-gpu translate-z-0",
            selectedCategory === "manis" ? "opacity-100" : "opacity-0",
          )}
        />

        {/* Telor Layer */}
        <div
          className={cn(
            "absolute -bottom-24 -right-24 w-[350px] h-[350px] rounded-full blur-[60px] bg-amber-400/20 transition-opacity duration-500 will-change-opacity transform-gpu translate-z-0",
            selectedCategory === "telor" ? "opacity-100" : "opacity-0",
          )}
        />

        {/* Global Accent layer */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-sky-400/10 blur-[60px] opacity-10" />
      </div>

      <Header
        onMenuClick={() => setIsSideNavOpen(true)}
        activeTab={activeTab}
        selectedCategory={selectedCategory}
      />

      <main className="mt-10 !mb-10 min-h-[calc(100vh-200px)]">
        <Suspense fallback={<LoadingState />}>
          {activeTab === "staff" ? (
            activeStaffView === "pos" ? (
              <POSSection
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                filteredProducts={filteredProducts}
                items={items}
                onProductClick={handleProductClick}
              />
            ) : activeStaffView === "expenses" ? (
              <ExpenseSection
                expenses={expenses}
                addExpense={addExpense}
                removeExpense={removeExpense}
                showNotification={showNotification}
                isSyncing={isSyncing}
              />
            ) : (
              <StaffHistory />
            )
          ) : !isOwnerAuthenticated ? (
            <OwnerAuth
              pinInput={pinInput}
              isPinError={isPinError}
              onPinInput={handlePinInput}
              onClear={() => setPinInput("")}
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
                setIsOwnerAuthenticated(false);
                setPinInput("");
              }}
            />
          )}
        </Suspense>
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
        doughOptions={doughOptions}
        toppingOptions={toppingOptions}
        selectedDoughId={selectedDoughId}
        setSelectedDoughId={setSelectedDoughId}
        onClose={() => setSelectedProductForDough(null)}
        onAdd={handleAddWithDough}
      />

      {activeTab === "staff" && activeStaffView === "pos" && (
        <CartModal
          items={items}
          isCartOpen={isCartOpen}
          setIsCartOpen={setIsCartOpen}
          removeItem={removeItem}
          addItem={addItem}
          getTotal={getTotal}
          checkout={handleCheckout}
          isSyncing={isSyncing}
          lastRemovedItem={lastRemovedItem}
          undoRemoveItem={undoRemoveItem}
        />
      )}

      <NotificationToast
        isVisible={notification.visible}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification((prev) => ({ ...prev, visible: false }))}
      />
    </div>
  );
}
