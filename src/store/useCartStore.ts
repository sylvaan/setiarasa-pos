import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Product,
  DoughOption,
  ToppingOption,
  CartItem,
  Order,
  Expense,
} from "../types";
import { IS_PROD } from "../lib/config";
import { supabase, syncOrder, syncExpense } from "../lib/supabase";
import { MOCK_PRODUCTS, DOUGH_OPTIONS, MOCK_TOPPINGS } from "../api/mockData";

interface CartStore {
  items: CartItem[];
  orders: Order[];
  expenses: Expense[];
  products: Product[];
  doughOptions: DoughOption[];
  toppingOptions: ToppingOption[];
  isSyncing: boolean;
  lastSyncFailed: boolean;
  addItem: (
    product: Product,
    selectedDough?: DoughOption,
    selectedToppings?: ToppingOption[],
  ) => void;
  removeItem: (itemId: string) => void; // itemId is productId + doughId + toppingIds
  clearCart: () => void;
  getTotal: () => number;
  checkout: () => Promise<void>;
  addExpense: (
    title: string,
    amount: number,
    category: string,
  ) => Promise<void>;
  removeExpense: (expenseId: string) => void;
  fetchInitialData: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  fetchDoughOptions: () => Promise<void>;
  fetchToppingOptions: () => Promise<void>;
  fetchOwnerData: () => Promise<void>;
  verifyOwnerPin: (pin: string) => Promise<boolean>;
  upsertProduct: (product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  upsertTopping: (topping: Partial<ToppingOption>) => Promise<void>;
  deleteTopping: (id: string) => Promise<void>;
  lastRemovedItem: { item: CartItem; index: number } | null;
  undoRemoveItem: () => void;
  manualInjectOrder: (
    items: CartItem[],
    totalAmount: number,
    timestamp: string,
  ) => Promise<void>;
  manualInjectExpense: (
    title: string,
    amount: number,
    timestamp: string,
    category?: string,
  ) => Promise<void>;
  setLastRemovedItem: (item: { item: CartItem; index: number } | null) => void;
}

const calculateItemPrice = (
  product: Product,
  selectedDough?: DoughOption,
  selectedToppings?: ToppingOption[],
) => {
  const basePrice = product.basePrice;
  const doughPrice = selectedDough?.extraPrice || 0;
  const toppingsPrice =
    selectedToppings?.reduce((sum, t) => sum + t.price, 0) || 0;

  let finalBasePlusDough = basePrice + doughPrice;

  /* COMMENTED: M7 Price Regulation 
  if (product.isSpecialExtra && doughPrice > 0) {
    // Kalau Keju Susu (m7) dan bukan Original, cuma tambah 1000 untuk adonan
    finalBasePlusDough = basePrice + 1000
  }
  */

  return finalBasePlusDough + toppingsPrice;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      orders: [],
      expenses: [],
      products: MOCK_PRODUCTS, // Default to Mock
      doughOptions: DOUGH_OPTIONS, // Default to Mock
      toppingOptions: MOCK_TOPPINGS,
      isSyncing: false,
      lastSyncFailed: false,
      lastRemovedItem: null,
      addItem: (product, selectedDough, selectedToppings = []) =>
        set((state) => {
          const doughId = selectedDough?.id || "none";
          const toppingIds = selectedToppings
            .map((t) => t.id)
            .sort()
            .join(",");
          const itemId = `${product.id}-${doughId}-${toppingIds || "no-extra"}`;

          const existing = state.items.find((i) => {
            const iDoughId = i.selectedDough?.id || "none";
            const iToppingIds =
              i.selectedToppings
                ?.map((t) => t.id)
                .sort()
                .join(",") || "no-extra";
            return (
              i.id === product.id &&
              iDoughId === doughId &&
              iToppingIds === (toppingIds || "no-extra")
            );
          });

          const price = calculateItemPrice(
            product,
            selectedDough,
            selectedToppings,
          );

          if (existing) {
            return {
              items: state.items.map((i) => {
                const iDoughId = i.selectedDough?.id || "none";
                const iToppingIds =
                  i.selectedToppings
                    ?.map((t) => t.id)
                    .sort()
                    .join(",") || "no-extra";
                const currentId = `${i.id}-${iDoughId}-${iToppingIds}`;

                return currentId === itemId
                  ? { ...i, quantity: i.quantity + 1, totalItemPrice: price }
                  : i;
              }),
            };
          }

          const newItem: CartItem = {
            ...product,
            selectedDough,
            selectedToppings,
            quantity: 1,
            totalItemPrice: price,
          };
          return { items: [...state.items, newItem] };
        }),
      removeItem: (itemId) => {
        set((state) => {
          const existing = state.items.find((i) => {
            const iDoughId = i.selectedDough?.id || "none";
            const iToppingIds =
              i.selectedToppings
                ?.map((t) => t.id)
                .sort()
                .join(",") || "no-extra";
            return `${i.id}-${iDoughId}-${iToppingIds}` === itemId;
          });

          if (existing && existing.quantity > 1) {
            return {
              items: state.items.map((i) => {
                const iDoughId = i.selectedDough?.id || "none";
                const iToppingIds =
                  i.selectedToppings
                    ?.map((t) => t.id)
                    .sort()
                    .join(",") || "no-extra";
                const currentId = `${i.id}-${iDoughId}-${iToppingIds}`;

                return currentId === itemId
                  ? { ...i, quantity: i.quantity - 1 }
                  : i;
              }),
            };
          }

          // Final removal from list
          const removedItem = state.items.find((i) => {
            const iDoughId = i.selectedDough?.id || "none";
            const iToppingIds =
              i.selectedToppings
                ?.map((t) => t.id)
                .sort()
                .join(",") || "no-extra";
            return `${i.id}-${iDoughId}-${iToppingIds}` === itemId;
          });

          const removedIndex = state.items.findIndex((i) => {
            const iDoughId = i.selectedDough?.id || "none";
            const iToppingIds =
              i.selectedToppings
                ?.map((t) => t.id)
                .sort()
                .join(",") || "no-extra";
            return `${i.id}-${iDoughId}-${iToppingIds}` === itemId;
          });

          return {
            lastRemovedItem: removedItem
              ? { item: removedItem, index: removedIndex }
              : null,
            items: state.items.filter((i) => {
              const iDoughId = i.selectedDough?.id || "none";
              const iToppingIds =
                i.selectedToppings
                  ?.map((t) => t.id)
                  .sort()
                  .join(",") || "no-extra";
              return `${i.id}-${iDoughId}-${iToppingIds}` !== itemId;
            }),
          };
        });
      },
      undoRemoveItem: () =>
        set((state) => {
          if (!state.lastRemovedItem) return state;
          const { item, index } = state.lastRemovedItem;
          const newItems = [...state.items];
          newItems.splice(index, 0, item);
          return { items: newItems, lastRemovedItem: null };
        }),
      clearCart: () => set({ items: [] }),
      getTotal: () =>
        get().items.reduce(
          (acc, item) => acc + item.totalItemPrice * item.quantity,
          0,
        ),
      checkout: async () => {
        const { items, getTotal } = get();
        if (items.length === 0) return;

        const newOrder: Order = {
          id: `OR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          timestamp: new Date().toISOString(),
          items: [...items],
          totalAmount: getTotal(),
        };

        set({ isSyncing: true });

        // Sync if Production
        if (IS_PROD && supabase) {
          const { error: orderError } = await syncOrder(newOrder);
          if (orderError) {
            set({ isSyncing: false });
            throw new Error(orderError.message);
          }

          // Increment sales count for each product in the order
          for (const item of items) {
            const { error: rpcError } = await supabase.rpc("increment_sales", {
              prod_id: item.id,
              qty: item.quantity,
            });

            // Fallback if RPC doesn't exist
            if (rpcError) {
              const { data, error: selectError } = await supabase
                .from("products")
                .select("sales_count")
                .eq("id", item.id)
                .single();

              if (selectError) {
                console.error("Error fetching sales count:", selectError);
                continue;
              }

              if (data) {
                const { error: updateError } = await supabase
                  .from("products")
                  .update({
                    sales_count: (data.sales_count || 0) + item.quantity,
                  })
                  .eq("id", item.id);
                
                if (updateError) console.error("Error updating sales count:", updateError);
              }
            }
          }
        } else {
          // Artificial delay for Demo mode to show loading states
          await new Promise((resolve) => setTimeout(resolve, 800));
        }

        set((state) => ({
          orders: [newOrder, ...state.orders],
          items: [],
          isSyncing: false,
          lastSyncFailed: false,
        }));
      },
      addExpense: async (title, amount, category) => {
        const newExpense: Expense = {
          id: `EX-${Date.now()}`,
          timestamp: new Date().toISOString(),
          title,
          amount,
          category,
        };

        set({ isSyncing: true });
        if (IS_PROD) {
          const { error } = await syncExpense(newExpense);
          if (error) {
            set({ isSyncing: false });
            throw new Error(error.message);
          }
        } else {
          // Artificial delay for Demo mode
          await new Promise((resolve) => setTimeout(resolve, 800));
        }

        set((state) => ({
          expenses: [newExpense, ...state.expenses],
          isSyncing: false,
          lastSyncFailed: false,
        }));
      },
      removeExpense: (expenseId) =>
        set((state) => ({
          expenses: state.expenses.filter((ex) => ex.id !== expenseId),
        })),
      fetchInitialData: async () => {
        if (!IS_PROD || !supabase) return;

        get().fetchProducts();
        get().fetchDoughOptions();
        get().fetchToppingOptions();
        // REMOVED: No more fetching orders/expenses here for security
      },
      fetchOwnerData: async () => {
        if (!IS_PROD || !supabase) return;

        const { data: ords } = await supabase
          .from("orders")
          .select("*")
          .order("timestamp", { ascending: false })
          .limit(100);
        const { data: exps } = await supabase
          .from("expenses")
          .select("*")
          .order("timestamp", { ascending: false })
          .limit(100);

        if (ords) {
          set({
            orders: ords.map((o) => ({
              ...o,
              totalAmount: o.total_amount, // Remap snake_case to camelCase
            })),
            lastSyncFailed: false,
          });
        }
        if (exps) set({ expenses: exps, lastSyncFailed: false });
      },
      fetchProducts: async () => {
        if (!IS_PROD || !supabase) {
          set({ products: MOCK_PRODUCTS });
          return;
        }

        const { data, error } = await supabase
          .from("products")
          .select("*")
          .order("sales_count", { ascending: false }); // NEW: Sort by popularity

        if (error) {
          set({ lastSyncFailed: true });
          console.error("Fetch products error:", error);
          return;
        }

        if (data) {
          set({
            products: data.map((p) => ({
              id: p.id,
              name: p.name,
              basePrice: Number(p.base_price),
              category: p.category,
              eggType: p.egg_type,
              level: p.level,
              isSpecialExtra: p.is_special_extra,
              salesCount: p.sales_count, // NEW: Map from DB
            })),
            lastSyncFailed: false,
          });
        }
      },
      fetchDoughOptions: async () => {
        if (!IS_PROD || !supabase) {
          set({ doughOptions: DOUGH_OPTIONS });
          return;
        }

        const { data, error } = await supabase
          .from("dough_options")
          .select("*");
        
        if (error) {
          set({ lastSyncFailed: true });
          set({ doughOptions: DOUGH_OPTIONS }); // Fallback
          return;
        }

        if (data) {
          set({
            doughOptions: data.map((d) => ({
              id: d.id,
              label: d.label,
              extraPrice: Number(d.extra_price),
            })),
            lastSyncFailed: false,
          });
        }
      },
      fetchToppingOptions: async () => {
        if (!IS_PROD || !supabase) {
          set({ toppingOptions: MOCK_TOPPINGS });
          return;
        }

        const { data, error } = await supabase
          .from("topping_options")
          .select("*");

        if (error) {
          set({ lastSyncFailed: true });
          return;
        }

        if (data) {
          set({
            toppingOptions: data.map((t) => ({
              id: t.id,
              label: t.label,
              price: Number(t.price),
            })),
            lastSyncFailed: false,
          });
        }
      },
      verifyOwnerPin: async (pin: string) => {
        // Mode Demo: Use 123456 as requested
        if (!IS_PROD) return pin === "123456";

        // Mode Produksi: Mandatory Database Check
        if (!supabase) return false;

        const { data: isValid } = await supabase.rpc("verify_owner_pin", {
          input_pin: pin,
        });

        if (isValid) {
          await get().fetchOwnerData();
          return true;
        }
        return false;
      },
      upsertProduct: async (product) => {
        set({ isSyncing: true });
        const productId = product.id || `m-${Date.now()}`;

        const dbProduct = {
          id: productId,
          name: product.name,
          base_price: product.basePrice,
          category: product.category,
          egg_type: product.eggType,
          is_special_extra: product.isSpecialExtra,
          level: product.level,
        };

        if (IS_PROD && supabase) {
          const { error } = await supabase.from("products").upsert(dbProduct);
          if (error) {
            set({ isSyncing: false });
            throw new Error(error.message);
          }
        } else {
          await new Promise((resolve) => setTimeout(resolve, 800));
        }

        // Update local state
        set((state) => {
          const newProducts = [...state.products];
          const existingIdx = newProducts.findIndex((p) => p.id === productId);

          const fullProduct: Product = {
            id: productId,
            name: product.name || "",
            basePrice: product.basePrice || 0,
            category: product.category || "manis",
            eggType: product.eggType,
            isSpecialExtra: product.isSpecialExtra,
            level: product.level,
            salesCount: product.salesCount || 0,
          };

          if (existingIdx > -1) {
            newProducts[existingIdx] = fullProduct;
          } else {
            newProducts.push(fullProduct);
          }

          return { products: newProducts, isSyncing: false, lastSyncFailed: false };
        });
      },
      deleteProduct: async (id) => {
        set({ isSyncing: true });
        if (IS_PROD && supabase) {
          const { error } = await supabase
            .from("products")
            .delete()
            .eq("id", id);
          if (error) {
            set({ isSyncing: false });
            throw new Error(error.message);
          }
        } else {
          await new Promise((resolve) => setTimeout(resolve, 800));
        }

        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
          isSyncing: false,
          lastSyncFailed: false,
        }));
      },
      upsertTopping: async (topping) => {
        set({ isSyncing: true });
        const toppingId = topping.id || `t-${Date.now()}`;

        const dbTopping = {
          id: toppingId,
          label: topping.label,
          price: topping.price,
        };

        if (IS_PROD && supabase) {
          const { error } = await supabase
            .from("topping_options")
            .upsert(dbTopping);
          if (error) {
            set({ isSyncing: false });
            throw new Error(error.message);
          }
        } else {
          await new Promise((resolve) => setTimeout(resolve, 800));
        }

        set((state) => {
          const newToppings = [...state.toppingOptions];
          const existingIdx = newToppings.findIndex((t) => t.id === toppingId);
          const fullTopping: ToppingOption = {
            id: toppingId,
            label: topping.label || "",
            price: topping.price || 0,
          };

          if (existingIdx > -1) {
            newToppings[existingIdx] = fullTopping;
          } else {
            newToppings.push(fullTopping);
          }

          return { toppingOptions: newToppings, isSyncing: false, lastSyncFailed: false };
        });
      },
      deleteTopping: async (id) => {
        set({ isSyncing: true });
        if (IS_PROD && supabase) {
          const { error } = await supabase
            .from("topping_options")
            .delete()
            .eq("id", id);
          if (error) {
            set({ isSyncing: false });
            throw new Error(error.message);
          }
        } else {
          await new Promise((resolve) => setTimeout(resolve, 800));
        }

        set((state) => ({
          toppingOptions: state.toppingOptions.filter((t) => t.id !== id),
          isSyncing: false,
          lastSyncFailed: false,
        }));
      },
      manualInjectOrder: async (items, totalAmount, timestamp) => {
        const newOrder: Order = {
          id: `OR-MAN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          timestamp,
          items: [...items],
          totalAmount,
        };

        set({ isSyncing: true });
        if (IS_PROD && supabase) {
          const { error } = await syncOrder(newOrder);
          if (error) {
            set({ isSyncing: false });
            throw new Error(error.message);
          }
        } else {
          await new Promise((resolve) => setTimeout(resolve, 800));
        }

        set((state) => ({
          orders: [newOrder, ...state.orders],
          isSyncing: false,
          lastSyncFailed: false,
        }));
      },
      manualInjectExpense: async (title, amount, timestamp, category = "bahan") => {
        const newExpense: Expense = {
          id: `EX-MAN-${Date.now()}`,
          timestamp,
          title,
          amount,
          category,
        };

        set({ isSyncing: true });
        if (IS_PROD && supabase) {
          const { error } = await syncExpense(newExpense);
          if (error) {
            set({ isSyncing: false });
            throw new Error(error.message);
          }
        } else {
          await new Promise((resolve) => setTimeout(resolve, 800));
        }

        set((state) => ({
          expenses: [newExpense, ...state.expenses],
          isSyncing: false,
          lastSyncFailed: false,
        }));
      },
      setLastRemovedItem: (item) => set({ lastRemovedItem: item }),
    }),
    { name: "setiarasa-cart-v3" }, // Bump version due to structural change
  ),
);
