import { useState } from "react";
import {
  Plus,
  Search,
  ChevronLeft,
  Package,
  Tag,
  Edit3,
} from "lucide-react";
import type { Product, ToppingOption, OwnerView } from "../../../types";
import { Heading, Subheading } from "../../ui/Typography";
import Card from "../../ui/Card";
import CatalogEditorModal from "./CatalogEditorModal";
import { useCartStore } from "../../../store/useCartStore";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";
import { formatNumber } from "../../../utils/format";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface OwnerCatalogProps {
  setActiveOwnerView: (view: OwnerView) => void;
  showNotification: (message: string, type?: "success" | "error") => void;
}

const OwnerCatalog = ({ setActiveOwnerView, showNotification }: OwnerCatalogProps) => {
  const {
    products,
    toppingOptions,
    upsertProduct,
    deleteProduct,
    upsertTopping,
    deleteTopping,
  } = useCartStore();

  const [tab, setTab] = useState<"products" | "toppings">("products");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    "all" | "manis" | "telor"
  >("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredToppings = toppingOptions.filter((t) =>
    t.label.toLowerCase().includes(search.toLowerCase()),
  );

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  return (
    <div className="!space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 !pb-20">
      {/* Header Navigation */}
      <div className="flex items-center justify-between !px-2">
        <button
          onClick={() => setActiveOwnerView("overview")}
          className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm active:scale-95 transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <Heading as="h2" className="!text-xl">
            Manajemen Katalog
          </Heading>
          <Subheading className="!text-[10px] uppercase tracking-widest opacity-60">
            Atur Menu & Topping
          </Subheading>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Main Tabs */}
      <div className="flex !bg-white/60 !p-1.5 !rounded-[2rem] !border !border-white shadow-xl !mx-2">
        <button
          onClick={() => setTab("products")}
          className={cn(
            "!flex-1 !py-3 !rounded-[1.5rem] flex items-center justify-center gap-2 transition-all font-black text-[10px] uppercase tracking-wider",
            tab === "products"
              ? "!bg-emerald-600 !text-white !shadow-lg"
              : "!text-slate-400",
          )}
        >
          <Package size={14} /> Menu Martabak
        </button>
        <button
          onClick={() => setTab("toppings")}
          className={cn(
            "!flex-1 !py-3 rounded-[1.5rem] flex items-center justify-center gap-2 transition-all font-black text-[10px] uppercase tracking-wider",
            tab === "toppings"
              ? "!bg-amber-600 !text-white !shadow-lg"
              : "!text-slate-400",
          )}
        >
          <Tag size={14} /> Topping Ekstra
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="!px-2 !space-y-4">
        <div className="relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder={`Cari ${tab === "products" ? "nama menu" : "nama topping"}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full !p-4 !pl-12 !rounded-2xl !bg-white border border-slate-100 shadow-sm focus:border-emerald-500 outline-none transition-all font-bold text-slate-600"
          />
        </div>

        {tab === "products" && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-2 px-2">
            {(["all", "manis", "telor"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setCategoryFilter(f)}
                className={cn(
                  "!px-4 !py-2 !rounded-xl !text-[9px] !font-black uppercase tracking-widest border transition-all whitespace-nowrap",
                  categoryFilter === f
                    ? "!bg-slate-800 !border-slate-700 !text-white !shadow-md"
                    : "!bg-white !border-slate-100 !text-slate-400",
                )}
              >
                {f === "all"
                  ? "Semua"
                  : f === "manis"
                    ? "Martabak Manis"
                    : "Martabak Telor"}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* List Content */}
      <div className="!px-2 !space-y-4">
        <AnimatePresence mode="popLayout">
          {(tab === "products" ? filteredProducts : filteredToppings).map(
            (item, i) => (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.02 }}
              >
                <Card
                  padding="md"
                  className="!rounded-[2rem] !flex !items-center !justify-between group hover:border-emerald-200 transition-all border-slate-100 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-inner",
                        tab === "products"
                          ? (item as Product).category === "manis"
                            ? "bg-emerald-500"
                            : "bg-amber-500"
                          : "bg-slate-700",
                      )}
                    >
                      {tab === "products" ? (
                        (item as Product).category === "manis" ? (
                          "🍰"
                        ) : (
                          "🍳"
                        )
                      ) : (
                        <Tag size={18} />
                      )}
                    </div>
                    <div className="text-left">
                      <Heading
                        as="h4"
                        className="!text-sm !mb-0.5 line-clamp-1"
                      >
                        {tab === "products" ? (item as Product).name : (item as ToppingOption).label}
                      </Heading>
                      <p className="text-[10px] font-black text-emerald-600">
                        Rp{" "}
                        {formatNumber(
                          Math.round((tab === "products" ? (item as Product).basePrice : (item as ToppingOption).price) /
                          1000)
                        )}
                        k
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleEdit(item)}
                    className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all active:scale-95 border border-slate-100"
                  >
                    <Edit3 size={16} />
                  </button>
                </Card>
              </motion.div>
            ),
          )}
        </AnimatePresence>

        {/* Empty State */}
        {(tab === "products" ? filteredProducts : filteredToppings).length ===
          0 && (
          <div className="!py-20 text-center opacity-30 !space-y-4">
            <Search size={48} className="mx-auto" />
            <p className="text-xs font-black uppercase tracking-widest">
              Tidak ada hasil ditemukan
            </p>
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <div className="fixed bottom-24 right-4 z-[90]">
        <button
          onClick={handleAdd}
          className={cn(
            "w-16 h-16 rounded-[2rem] flex items-center justify-center text-white shadow-2xl active:scale-90 transition-all border-4 border-white",
            tab === "products"
              ? "bg-emerald-600 shadow-emerald-500/40"
              : "bg-amber-600 shadow-amber-500/40",
          )}
        >
          <Plus size={32} />
        </button>
      </div>

      {/* Editor Modal */}
      <CatalogEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={tab === "products" ? "product" : "topping"}
        initialData={editingItem}
        onSave={async (data) => {
          try {
            if (tab === "products") await upsertProduct(data);
            else await upsertTopping(data);
            showNotification("Data berhasil disimpan!");
          } catch (error: any) {
            showNotification(error.message || "Gagal menyimpan data", "error");
            throw error; // Rethrow to prevent modal close
          }
        }}
        onDelete={async (id) => {
          try {
            if (tab === "products") await deleteProduct(id);
            else await deleteTopping(id);
            showNotification("Data berhasil dihapus!");
          } catch (error: any) {
            showNotification(error.message || "Gagal menghapus data", "error");
            throw error; // Rethrow to prevent modal close
          }
        }}
      />
    </div>
  );
};

export default OwnerCatalog;
