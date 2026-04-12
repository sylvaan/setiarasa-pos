export interface DoughOption {
  id: string;
  label: string;
  extraPrice: number;
}

export interface Product {
  id: string;
  name: string;
  basePrice: number;
  category: "manis" | "telor";
  isSpecialExtra?: boolean;
  eggType?: "Ayam" | "Bebek";
  level?: string;
  salesCount?: number;
}

export interface ToppingOption {
  id: string;
  label: string;
  price: number;
}

export interface CartItem extends Product {
  quantity: number;
  selectedDough?: DoughOption;
  selectedToppings?: ToppingOption[];
  totalItemPrice: number;
}

export interface Order {
  id: string;
  timestamp: string;
  items: CartItem[];
  totalAmount: number;
}

export interface CATEGORY {
  id: string;
  name: string;
  icon: string;
}

export interface Expense {
  id: string;
  timestamp: string;
  title: string;
  amount: number;
  category: string;
}

export type StaffView = "pos" | "expenses" | "history";
export type OwnerView = "overview" | "sales" | "history" | "catalog";
