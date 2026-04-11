import { Clock, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { isToday, format } from "date-fns";
import { useCartStore } from "../../../store/useCartStore";
import { Heading, Label } from "../../ui/Typography";
import Card from "../../ui/Card";
import Badge from "../../ui/Badge";
import SectionHeader from "../../shared/SectionHeader";

const StaffHistory = () => {
  const { orders } = useCartStore();

  // Filter only for today's orders
  const todayOrders = orders
    .filter((order) => isToday(new Date(order.timestamp)))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="!py-6 animate-in fade-in slide-in-from-bottom-4 duration-500 !space-y-8 max-w-[440px] !mx-auto w-full px-2">
      <SectionHeader
        title="Riwayat Hari Ini"
        subtitle={`Total ${todayOrders.length} transaksi berhasil`}
      />

      <div className="space-y-4">
        {todayOrders.length === 0 ? (
          <Card className="!py-20 !text-center !space-y-4 !bg-slate-50/50 !border-dashed">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center !mx-auto shadow-sm text-slate-300">
              <ShoppingBag size={24} />
            </div>
            <div className="space-y-1">
              <Heading as="h3" className="!text-slate-400">
                Belum ada transaksi
              </Heading>
              <p className="text-[10px] text-slate-400 font-medium px-10">
                Transaksi yang kamu selesaikan hari ini akan muncul di sini.
              </p>
            </div>
          </Card>
        ) : (
          todayOrders.map((order, idx) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="!p-5 !space-y-4 relative overflow-hidden group border-slate-100 hover:border-emerald-100 transition-colors">
                {/* Header: ID & Time */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <Label className="!text-[9px] !text-slate-400 !tracking-widest !uppercase">
                      #{order.id.slice(-6).toUpperCase()}
                    </Label>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock size={12} className="text-emerald-500" />
                      <span className="text-[11px] font-bold">
                        {format(new Date(order.timestamp), "HH:mm")}
                      </span>
                    </div>
                  </div>
                  <Badge variant="emerald" className="!px-3 !py-1 !rounded-lg !text-[10px]">
                    Rp {order.totalAmount.toLocaleString()}
                  </Badge>
                </div>

                {/* Items Summary */}
                <div className="bg-slate-50/80 rounded-xl p-3 space-y-2">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-600 font-medium">
                        {item.quantity}x {item.name}
                      </span>
                      <span className="text-[9px] text-slate-400">
                        {item.category === "manis" ? "Manis" : "Telor"}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default StaffHistory;
