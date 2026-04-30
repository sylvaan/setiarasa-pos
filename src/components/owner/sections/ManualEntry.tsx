import { useState } from "react";
import { Calendar, Package, Receipt, Plus, ChevronLeft } from "lucide-react";
import type { Product, CartItem } from "../../../types";
import { Heading, Subheading, Label } from "../../ui/Typography";
import Card from "../../ui/Card";
import Button from "../../ui/Button";
import ProgressLoader from "../../shared/ProgressLoader";
import { formatCurrency } from "../../../utils/format";

interface ManualEntryProps {
  setActiveOwnerView: (view: any) => void;
  products: Product[];
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
  isSyncing: boolean;
  showNotification: (message: string, type?: "success" | "error") => void;
}

const ManualEntry = ({
  setActiveOwnerView,
  products,
  manualInjectOrder,
  manualInjectExpense,
  isSyncing,
  showNotification,
}: ManualEntryProps) => {
  const [mode, setMode] = useState<"order" | "expense">("order");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // Order State
  const [selectedProductId, setSelectedProductId] = useState("");
  const [qty, setQty] = useState(1);
  const [customTotal, setCustomTotal] = useState<number | null>(null);
  const [orderNote, setOrderNote] = useState("");
  const [orderItems, setOrderItems] = useState<CartItem[]>([]);

  // Expense State
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const calculatedTotal = selectedProduct ? selectedProduct.basePrice * qty : 0;

  const addToBucket = () => {
    if (!selectedProduct) return;

    const newItem: CartItem = {
      ...selectedProduct,
      quantity: qty,
      totalItemPrice: selectedProduct.basePrice,
    };

    setOrderItems([...orderItems, newItem]);
    // Reset selection for next item
    setSelectedProductId("");
    setQty(1);
  };

  const removeLastItem = () => {
    setOrderItems(orderItems.slice(0, -1));
  };

  const handleOrderSubmit = async () => {
    if (orderItems.length === 0) return;

    const timestamp = new Date(date);
    const now = new Date();
    timestamp.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

    const totalAmount =
      customTotal !== null
        ? customTotal
        : orderItems.reduce(
            (acc, item) => acc + item.basePrice * item.quantity,
            0,
          );

    try {
      await manualInjectOrder(orderItems, totalAmount, timestamp.toISOString());
      showNotification("Satu nota transaksi berhasil di-inject!");
      setOrderItems([]);
      setCustomTotal(null);
      setOrderNote("");
    } catch (e) {
      showNotification("Gagal inject data", "error");
    }
  };

  const handleExpenseSubmit = async () => {
    if (!expenseTitle || !expenseAmount) return;

    const timestamp = new Date(date);
    const now = new Date();
    timestamp.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

    try {
      await manualInjectExpense(
        expenseTitle,
        parseInt(expenseAmount),
        timestamp.toISOString(),
        "bahan",
      );
      showNotification("Data pengeluaran berhasil di-inject!");
      setExpenseTitle("");
      setExpenseAmount("");
    } catch (e) {
      showNotification("Gagal inject data", "error");
    }
  };

  const currentOrderTotal = orderItems.reduce(
    (acc, item) => acc + item.basePrice * item.quantity,
    0,
  );

  return (
    <div className="!space-y-6">
      <div className="!flex !items-center !gap-4">
        <Button
          variant="white"
          size="sm"
          onClick={() => setActiveOwnerView("overview")}
          className="!p-2 !rounded-xl !border-none !shadow-none !bg-slate-100"
        >
          <ChevronLeft size={20} />
        </Button>
        <div>
          <Heading as="h2" className="!text-xl">
            Input Manual
          </Heading>
          <Subheading>Inject data ke database</Subheading>
        </div>
      </div>

      <div className="!flex !gap-2 !p-1 !bg-slate-100 !rounded-2xl">
        <button
          onClick={() => setMode("order")}
          className={`!flex-1 !flex items-center justify-center !gap-2 !py-3 !rounded-xl !text-xs !font-bold !transition-all ${mode === "order" ? "!bg-white !shadow-sm !text-emerald-600" : "!text-slate-400"}`}
        >
          <Package size={14} /> Pesanan
        </button>
        <button
          onClick={() => setMode("expense")}
          className={`!flex-1 !flex items-center justify-center !gap-2 !py-3 !rounded-xl !text-xs !font-bold !transition-all ${mode === "expense" ? "!bg-white !shadow-sm !text-rose-600" : "!text-slate-400"}`}
        >
          <Receipt size={14} /> Belanja
        </button>
      </div>

      <Card padding="lg" className="relative !space-y-6">
        <ProgressLoader isVisible={isSyncing} />

        <div className="!space-y-2">
          <Label>Tanggal Transaksi</Label>
          <div className="relative">
            <input
              type="date"
              value={date}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDate(e.target.value)}
              className="w-full !bg-slate-50 !p-4 !rounded-2xl text-sm font-bold outline-none border-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <Calendar
              size={18}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"
            />
          </div>
        </div>

        {mode === "order" ? (
          <div className="!space-y-6">
            <div className="!p-4 !bg-emerald-50/50 !border !border-emerald-100 !rounded-2xl !space-y-4">
              <div className="!space-y-2">
                <Label>Pilih Menu</Label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full !bg-white !p-3 !rounded-xl text-sm font-bold outline-none border border-emerald-100 focus:ring-2 focus:ring-emerald-500/20 appearance-none"
                >
                  <option value="">-- Tambah Menu --</option>
                  {products
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({formatCurrency(p.basePrice)})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex gap-4 items-end">
                <div className="flex-1 !space-y-2">
                  <Label>Jumlah</Label>
                  <input
                    type="number"
                    value={qty}
                    min="1"
                    onChange={(e) => setQty(parseInt(e.target.value) || 1)}
                    className="w-full !bg-white !p-3 !rounded-xl text-sm font-bold outline-none border border-emerald-100 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <Button
                  variant="white"
                  className="!h-[46px] !px-4 !bg-emerald-600 !text-white border-none shadow-md shadow-emerald-500/20"
                  onClick={addToBucket}
                  disabled={!selectedProductId}
                >
                  <Plus size={18} />
                </Button>
              </div>
            </div>

            {/* Bucket List */}
            {orderItems.length > 0 && (
              <div className="!space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="flex justify-between items-center px-1">
                  <Label className="uppercase tracking-widest !text-[10px] font-black opacity-40">
                    Isi Nota Sementara
                  </Label>
                  <button
                    onClick={removeLastItem}
                    className="text-[10px] font-bold text-rose-500 hover:underline"
                  >
                    Hapus Terakhir
                  </button>
                </div>
                <div className="!space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {orderItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100"
                    >
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-800">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Qty: {item.quantity} x{" "}
                          {formatCurrency(item.basePrice)}
                        </p>
                      </div>
                      <p className="text-xs font-black text-slate-600">
                        {formatCurrency(item.basePrice * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="!mt-4 !bg-slate-500 !rounded-[24px] !p-5 !text-white shadow-xl shadow-slate-700/20">
                  <div className="!flex !justify-between !items-center !mb-4 !pb-4 !border-b !border-white/10">
                    <div className="!text-left">
                      <p className="!text-[10px] !font-black !uppercase tracking-[0.2em] !text-white/40 !mb-1">
                        Total Pesanan
                      </p>
                      <p className="!text-2xl !font-black !tabular-nums">
                        {formatCurrency(currentOrderTotal)}
                      </p>
                    </div>
                    <div className="!text-right">
                      <p className="!text-[10px] !font-black !uppercase tracking-[0.2em] text-emerald-400/60 mb-1">
                        Penyesuaian Harga
                      </p>
                      <div className="!flex !items-center !gap-2 !bg-white/5 !p-2 !px-3 !rounded-xl !border !border-white/10 !focus-within:border-emerald-500/50 transition-all">
                        <span className="!text-[10px] !font-bold !text-white/30">
                          Rp
                        </span>
                        <input
                          type="number"
                          value={customTotal || ""}
                          placeholder={currentOrderTotal.toString()}
                          onChange={(e) =>
                            setCustomTotal(parseInt(e.target.value) || null)
                          }
                          className="w-20 bg-transparent text-right text-sm font-black text-emerald-400 outline-none placeholder:text-white/10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-[11px] font-bold text-white/50 italic">
                      {customTotal
                        ? "* Menggunakan harga manual"
                        : "* Harga otomatis dari menu"}
                    </p>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                        Total Akhir
                      </p>
                      <p className="text-lg font-black text-emerald-400">
                        {formatCurrency(customTotal || currentOrderTotal)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="!space-y-2">
                  <Label>Keterangan Nota (Opsional)</Label>
                  <textarea
                    placeholder="Contoh: Pesanan Pak Haji, Acara Kantor, dll"
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                    className="w-full !bg-slate-50 !p-4 !rounded-2xl text-sm font-bold outline-none border-none focus:ring-2 focus:ring-emerald-500/20 min-h-[60px]"
                  />
                </div>

                <Button
                  variant="emerald"
                  fullWidth
                  size="lg"
                  disabled={isSyncing}
                  onClick={handleOrderSubmit}
                  className="!shadow-emerald-500/30"
                >
                  {isSyncing ? "Injecting..." : "Simpan Nota ke Database"}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="!space-y-6">
            <div className="!space-y-2">
              <Label>Nama Barang / Judul</Label>
              <input
                type="text"
                placeholder="Contoh: Belanja Minyak, Listrik, dll"
                value={expenseTitle}
                onChange={(e) => setExpenseTitle(e.target.value)}
                className="w-full !bg-slate-50 !p-4 !rounded-2xl text-sm font-bold outline-none border-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div className="!space-y-2">
              <Label>Nominal (Rp)</Label>
              <input
                type="number"
                placeholder="0"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                className="w-full !bg-slate-50 !p-4 !rounded-2xl text-sm font-bold text-rose-600 outline-none border-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <Button
              variant="rose"
              fullWidth
              size="lg"
              disabled={!expenseTitle || !expenseAmount || isSyncing}
              onClick={handleExpenseSubmit}
            >
              {isSyncing ? "Injecting..." : "Simpan Data Belanja"}
            </Button>
          </div>
        )}
      </Card>

      <div className="!p-4 !bg-amber-50 !border !border-amber-100 !rounded-2xl !flex !gap-3">
        <Plus className="!text-amber-600 !shrink-0 !rotate-45" size={20} />
        <p className="!text-[11px] !text-amber-800 !leading-relaxed !font-medium">
          <strong>Perhatian:</strong> Fitur manual injection akan langsung
          menambah data ke laporan keuangan. Gunakan hanya untuk memperbaiki
          selisih atau mencatat data yang terlewat.
        </p>
      </div>
    </div>
  );
};

export default ManualEntry;
