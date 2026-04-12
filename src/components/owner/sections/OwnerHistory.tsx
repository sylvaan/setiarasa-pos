import { Search, Calendar, Wallet, FileDown } from "lucide-react";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import type { Order, OwnerView } from "../../../types";
import { Heading, Subheading, Label } from "../../ui/Typography";
import Card from "../../ui/Card";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";
import SectionHeader from "../../shared/SectionHeader";
import { exportBusinessReportToExcel } from "../../../utils/excelExport";
import { useCartStore } from "../../../store/useCartStore";

interface OwnerHistoryProps {
  setActiveOwnerView: (view: OwnerView) => void;
}

const OwnerHistory = ({ setActiveOwnerView }: OwnerHistoryProps) => {
  const { orders, expenses } = useCartStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);

  // Optimized & Grouped History Logic
  const groupedOrders = useMemo(() => {
    // 1. Filter by Search Query
    const filtered = orders.filter((order) => {
      const matchesId = order.id
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesProduct = order.items.some((it) =>
        it.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      return matchesId || matchesProduct;
    });

    // 2. Sort by newest first
    const sorted = [...filtered].sort((a, b) => {
      const aTime =
        typeof a.timestamp === "string"
          ? new Date(a.timestamp).getTime()
          : a.timestamp;
      const bTime =
        typeof b.timestamp === "string"
          ? new Date(b.timestamp).getTime()
          : b.timestamp;
      return bTime - aTime;
    });

    // 3. Slice by visibility
    const sliced = sorted.slice(0, visibleCount);

    // 4. Group by Date
    const groups: { [key: string]: Order[] } = {};
    sliced.forEach((order) => {
      const date = new Date(order.timestamp).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(order);
    });

    return {
      groups: Object.entries(groups),
      totalFiltered: filtered.length,
    };
  }, [orders, searchQuery, visibleCount]);

  return (
    <div className="!space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 !pb-20">
      <div className="flex justify-between items-center px-2">
        <SectionHeader
          title="Riwayat Transaksi"
          onBack={() => setActiveOwnerView("overview")}
        />
      </div>

      {/* Optimized Search Bar */}
      <div className="!px-2">
        <div className="relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Cari ID Transaksi atau Produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="!w-full !py-5 !pl-14 !pr-6 !bg-white !rounded-[2rem] border border-white shadow-[0_10px_30px_rgba(0,0,0,0.03)] !text-sm !font-bold text-slate-900 outline-none focus:border-emerald-100/50 transition-all"
          />
        </div>
      </div>

      <div className="!space-y-10">
        {groupedOrders.groups.length === 0 ? (
          <Card
            variant="glass"
            className="!py-24 !text-center !space-y-4 !border-2 border-dashed border-slate-200 mx-2"
          >
            <div className="w-16 h-16 bg-slate-100 rounded-full flex !items-center !justify-center !text-slate-300 !mx-auto border-2 border-white shadow-sm">
              <Wallet size={32} />
            </div>
            <Subheading className="italic opacity-80">
              Data tidak ditemukan
            </Subheading>
          </Card>
        ) : (
          groupedOrders.groups.map(([date, items]) => (
            <div key={date} className="!space-y-5">
              <div className="flex items-center !gap-3 !px-6">
                <div className="w-8 h-8 !bg-white rounded-lg flex items-center justify-center text-slate-400 shadow-sm border border-slate-50">
                  <Calendar size={14} />
                </div>
                <Label>{date}</Label>
              </div>
              <div className="!space-y-4">
                {items.map((order) => (
                  <Card
                    key={order.id}
                    className="!p-7 flex flex-col gap-6 group hoverScale mx-2"
                    hoverScale
                  >
                    <div className="!flex justify-between items-center border-b border-slate-50 !pb-5">
                      <div className="!space-y-1.5 text-left">
                        <Label className="opacity-80">
                          {" "}
                          #{order.id.split("-").slice(-1)}
                        </Label>
                        <Heading
                          as="p"
                          className="!text-xs !not-italic !tracking-normal opacity-90"
                        >
                          {new Date(order.timestamp).toLocaleTimeString(
                            "id-ID",
                            { hour: "2-digit", minute: "2-digit" },
                          )}{" "}
                          WIB
                        </Heading>
                      </div>
                      <Heading className="!text-lg !text-emerald-600">
                        Rp {Number((order.totalAmount / 1000).toFixed(1))}k
                      </Heading>
                    </div>
                    <div className="!flex flex-col !gap-3">
                      {order.items.map((it, idx) => (
                        <div
                          key={idx}
                          className="!flex flex-col gap-1 items-start"
                        >
                          <Badge
                            variant="slate"
                            className="!bg-slate-50 !border-slate-100 !px-3 !py-1.5 !w-auto"
                          >
                            <span className="w-5 h-5 bg-white rounded-md flex items-center justify-center text-emerald-600 border border-slate-100 mr-2 text-[10px] font-black">
                              {it.quantity}
                            </span>
                            <span className="font-bold text-slate-700">
                              {it.name}{" "}
                              {it.selectedDough
                                ? `(${it.selectedDough.label})`
                                : ""}
                            </span>
                          </Badge>
                          {it.selectedToppings &&
                            it.selectedToppings.length > 0 && (
                              <div className="!pl-10 flex flex-wrap gap-1">
                                {it.selectedToppings.map((top, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className="text-[10px] text-slate-400 font-medium bg-slate-50/50 px-2 py-0.5 rounded-full border border-slate-100"
                                  >
                                    + {top.label}
                                  </span>
                                ))}
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}

        {/* Load More Button */}
        {groupedOrders.totalFiltered > visibleCount && (
          <div className="!px-2 !pb-10">
            <Button
              variant="white"
              fullWidth
              onClick={() => setVisibleCount((prev) => prev + 10)}
              className="!py-6 !text-slate-400 !text-[9px] !gap-3 !rounded-[2rem]"
            >
              <Search size={14} className="rotate-90 opacity-50" /> Muat
              Transaksi Lainnya ({groupedOrders.totalFiltered - visibleCount})
            </Button>
          </div>
        )}
      </div>

      {/* Floating Action Button for Download */}
      <motion.button
        initial={{ scale: 0, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => exportBusinessReportToExcel(orders, expenses)}
        className="!fixed !bottom-6 !right-6 !bg-indigo-600 !text-white !px-6 !py-4 !rounded-full !shadow-2xl !flex !items-center !gap-3 !z-50 !border !border-indigo-400/30 !backdrop-blur-sm"
      >
        <FileDown size={18} strokeWidth={3} />
        <span className="whitespace-nowrap font-black text-[10px] tracking-wider uppercase">Export ke Excel</span>
      </motion.button>
    </div>
  );
};

export default OwnerHistory;
