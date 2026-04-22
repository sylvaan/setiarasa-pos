import type { Product, DoughOption, ToppingOption } from "../types";

export const DOUGH_OPTIONS: DoughOption[] = [
  { id: "original", label: "Original", extraPrice: 0 },
  { id: "pandan", label: "Pandan", extraPrice: 2000 },
  { id: "red_velvet", label: "Red Velvet", extraPrice: 2000 },
  { id: "black_forest", label: "Black Forest", extraPrice: 2000 }
];

export const MOCK_TOPPINGS: ToppingOption[] = [
  { id: "t_keju", label: "Keju", price: 3000 },
  { id: "t_cokelat", label: "Cokelat", price: 2000 },
  { id: "t_kacang", label: "Kacang", price: 2000 },
  { id: "t_wijen", label: "Wijen", price: 2000 },
];

export const MOCK_PRODUCTS: Product[] = [
  // MANIS
  { id: "m1", name: "Kacang Susu", basePrice: 15000, category: "manis" },
  { id: "m2", name: "Coklat Susu", basePrice: 15000, category: "manis" },
  { id: "m3", name: "Pisang Susu", basePrice: 15000, category: "manis" },
  { id: "m4", name: "Ketan Susu", basePrice: 18000, category: "manis" },
  { id: "m5", name: "Oreo Susu", basePrice: 18000, category: "manis" },
  { id: "m6", name: "Cokelat Kacang", basePrice: 20000, category: "manis" },
  { id: "m7", name: "Keju Susu", basePrice: 23000, category: "manis", isSpecialExtra: false },
  { id: "m8", name: "Keju Coklat", basePrice: 25000, category: "manis" },
  { id: "m9", name: "Keju Kacang", basePrice: 25000, category: "manis" },
  { id: "m10", name: "Keju Pisang", basePrice: 25000, category: "manis" },
  { id: "m11", name: "Keju Kacang Coklat", basePrice: 28000, category: "manis" },
  { id: "m12", name: "Keju Oreo", basePrice: 28000, category: "manis" },
  { id: "m13", name: "Keju Ketan", basePrice: 28000, category: "manis" },
  { id: "m14", name: "Keju Pisang Coklat", basePrice: 28000, category: "manis" },
  { id: "m15", name: "Keju Kacang Pisang", basePrice: 28000, category: "manis" },
  { id: "m16", name: "Keju Pisang Kacang", basePrice: 28000, category: "manis" },
  { id: "m17", name: "Keju Pisang Oreo", basePrice: 30000, category: "manis" },
  { id: "m18", name: "Keju Komplit", basePrice: 33000, category: "manis" },
  
  // TELOR
  { id: "t1", name: "Ayam Biasa", eggType: "Ayam", level: "Biasa", basePrice: 18000, category: "telor" },
  { id: "t2", name: "Ayam Spesial", eggType: "Ayam", level: "Spesial", basePrice: 25000, category: "telor" },
  { id: "t3", name: "Ayam Istimewa", eggType: "Ayam", level: "Istimewa", basePrice: 30000, category: "telor" },
  { id: "t4", name: "Ayam Super", eggType: "Ayam", level: "Super", basePrice: 35000, category: "telor" },
  { id: "t5", name: "Ayam Lapis", eggType: "Ayam", level: "Lapis", basePrice: 45000, category: "telor" },
  { id: "t6", name: "Bebek Biasa", eggType: "Bebek", level: "Biasa", basePrice: 20000, category: "telor" },
  { id: "t7", name: "Bebek Spesial", eggType: "Bebek", level: "Spesial", basePrice: 25000, category: "telor" },
  { id: "t8", name: "Bebek Istimewa", eggType: "Bebek", level: "Istimewa", basePrice: 35000, category: "telor" },
  { id: "t9", name: "Bebek Super", eggType: "Bebek", level: "Super", basePrice: 35000, category: "telor" },
  { id: "t10", name: "Bebek Lapis", eggType: "Bebek", level: "Lapis", basePrice: 55000, category: "telor" },
];

export const CATEGORIES = [
  { id: "manis", name: "Manis", icon: "Cake" },
  { id: "telor", name: "Telor", icon: "Egg" },
];
