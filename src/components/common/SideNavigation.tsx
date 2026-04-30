import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  UtensilsCrossed,
  Wallet,
  LayoutDashboard,
  PieChart,
  History,
  Cloud,
  CloudOff,
  Loader2,
  Package,
} from "lucide-react";
import { useCartStore } from "../../store/useCartStore";
import { IS_PROD } from "../../lib/config";
import type { StaffView, OwnerView } from "../../types";
import { Heading, Subheading, Label } from "../ui/Typography";
import Button from "../ui/Button";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SideNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: "staff" | "owner";
  setActiveTab: (tab: "staff" | "owner") => void;
  activeStaffView: StaffView;
  setActiveStaffView: (view: StaffView) => void;
  activeOwnerView: OwnerView;
  setActiveOwnerView: (view: OwnerView) => void;
  isOwnerAuthenticated: boolean;
}

export const SideNavigation = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  activeStaffView,
  setActiveStaffView,
  activeOwnerView,
  setActiveOwnerView,
  isOwnerAuthenticated,
}: SideNavigationProps) => {
  const { isSyncing } = useCartStore();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 !bg-slate-900/40 z-[60] will-change-[opacity]"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.25, ease: "circOut" }}
            className="fixed inset-y-0 left-0 w-[280px] bg-white shadow-2xl z-[70] !pt-14 !px-8 !pb-8 flex flex-col justify-between border-r border-slate-100 will-change-transform"
          >
            <div className="space-y-12">
              <div className="flex justify-between items-center pr-2">
                <div className="text-left py-1">
                  <Heading
                    as="h1"
                    className="!text-2xl !text-emerald-600 !tracking-tight"
                  >
                    SetiaRasa
                  </Heading>
                  <Subheading className="!mt-2 !opacity-80">
                    POS System Martabak V1.3.0
                  </Subheading>
                </div>
                <Button
                  variant="white"
                  size="sm"
                  onClick={onClose}
                  className="!p-2.5 !bg-slate-50 !rounded-xl !text-slate-400 border-none shadow-none"
                >
                  <X size={18} strokeWidth={3} />
                </Button>
              </div>

              <div className="space-y-4 !mt-5">
                <Label className="!px-2 !mb-4 opacity-60 block">
                  Mode Akses
                </Label>

                {/* Role Switcher */}
                <div className="!flex gap-2 !my-2 !bg-slate-50 !p-1.5 !rounded-2xl !border !border-slate-200/50">
                  <Button
                    variant={activeTab === "staff" ? "emerald" : "ghost"}
                    size="md"
                    fullWidth
                    onClick={() => setActiveTab("staff")}
                    className={cn(
                      "!py-3 !text-[10px] !rounded-xl !border-none !shadow-none",
                      activeTab !== "staff" && "!text-slate-400",
                    )}
                  >
                    Staff
                  </Button>
                  <Button
                    variant={activeTab === "owner" ? "amber" : "ghost"}
                    size="md"
                    fullWidth
                    onClick={() => setActiveTab("owner")}
                    className={cn(
                      "!py-3 !text-[10px] !rounded-xl !border-none !shadow-none",
                      activeTab !== "owner" && "!text-slate-400",
                    )}
                  >
                    Owner
                  </Button>
                </div>

                <Label className="!px-2 !mb-2 opacity-60 block">
                  Navigasi Utama
                </Label>

                <div className="!space-y-2">
                  {activeTab === "staff" ? (
                    <>
                      <button
                        onClick={() => {
                          setActiveStaffView("pos");
                          onClose();
                        }}
                        className={cn(
                          "w-full flex items-center gap-4 !px-5 !py-4 !rounded-2xl transition-all group relative overflow-hidden active:scale-[0.98]",
                          activeStaffView === "pos"
                            ? "!bg-emerald-50 !text-emerald-600 !border !border-emerald-100 !font-bold"
                            : "!text-slate-500 !hover:bg-slate-50",
                        )}
                      >
                        <UtensilsCrossed size={18} strokeWidth={2.5} />
                        <span className="text-[10px] uppercase tracking-[0.1em] whitespace-nowrap">
                          Kasir (POS)
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveStaffView("expenses");
                          onClose();
                        }}
                        className={cn(
                          "w-full flex items-center gap-4 !px-5 !py-4 !rounded-2xl transition-all group relative overflow-hidden active:scale-[0.98]",
                          activeStaffView === "expenses"
                            ? "!bg-emerald-50 !text-emerald-600 !border !border-emerald-100 !font-bold"
                            : "!text-slate-500 !hover:bg-slate-50",
                        )}
                      >
                        <Wallet size={18} strokeWidth={2.5} />
                        <span className="text-[10px] uppercase tracking-[0.1em] whitespace-nowrap">
                          Belanja Bahan
                        </span>
                      </button>
                      <button
                        onClick={() => {
                          setActiveStaffView("history");
                          onClose();
                        }}
                        className={cn(
                          "w-full flex items-center gap-4 !px-5 !py-4 !rounded-2xl transition-all group relative overflow-hidden active:scale-[0.98]",
                          activeStaffView === "history"
                            ? "!bg-emerald-50 !text-emerald-600 !border !border-emerald-100 !font-bold"
                            : "!text-slate-500 !hover:bg-slate-50",
                        )}
                      >
                        <History size={18} strokeWidth={2.5} />
                        <span className="text-[10px] uppercase tracking-[0.1em] whitespace-nowrap">
                          Riwayat Hari Ini
                        </span>
                      </button>
                    </>
                  ) : (
                    <>
                      {!isOwnerAuthenticated ? (
                        <div className="!py-10 !text-center !space-y-3">
                          <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center !mx-auto text-slate-300">
                            <LayoutDashboard size={20} />
                          </div>
                          <p className="text-[10px] text-slate-400 italic font-medium px-4">
                            Menu Owner terkunci. Silakan input PIN di layar
                            utama.
                          </p>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setActiveOwnerView("overview");
                              onClose();
                            }}
                            className={cn(
                              "w-full flex items-center gap-4 !px-5 !py-4 !rounded-2xl transition-all group relative overflow-hidden active:scale-[0.98]",
                              activeOwnerView === "overview"
                                ? "!bg-amber-50 !text-amber-700 !border !border-amber-100 !font-bold"
                                : "!text-slate-500 !hover:bg-slate-50",
                            )}
                          >
                            <LayoutDashboard size={18} strokeWidth={2.5} />
                            <span className="text-[10px] uppercase tracking-[0.1em] whitespace-nowrap">
                              Overview
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveOwnerView("sales");
                              onClose();
                            }}
                            className={cn(
                              "w-full flex items-center gap-4 !px-5 !py-4 !rounded-2xl transition-all group relative overflow-hidden active:scale-[0.98]",
                              activeOwnerView === "sales"
                                ? "!bg-amber-50 !text-amber-700 !border !border-amber-100 !font-bold"
                                : "!text-slate-500 !hover:bg-slate-50",
                            )}
                          >
                            <PieChart size={18} strokeWidth={2.5} />
                            <span className="text-[10px] uppercase tracking-[0.1em] whitespace-nowrap">
                              Penjualan
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveOwnerView("history");
                              onClose();
                            }}
                            className={cn(
                              "w-full flex items-center gap-4 !px-5 !py-4 !rounded-2xl transition-all group relative overflow-hidden active:scale-[0.98]",
                              activeOwnerView === "history"
                                ? "!bg-amber-50 !text-amber-700 !border !border-amber-100 !font-bold"
                                : "!text-slate-500 !hover:bg-slate-50",
                            )}
                          >
                            <History size={18} strokeWidth={2.5} />
                            <span className="text-[10px] uppercase tracking-[0.1em] whitespace-nowrap">
                              Riwayat Transaksi
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              setActiveOwnerView("catalog");
                              onClose();
                            }}
                            className={cn(
                              "w-full flex items-center gap-4 !px-5 !py-4 !rounded-2xl transition-all group relative overflow-hidden active:scale-[0.98]",
                              activeOwnerView === "catalog"
                                ? "!bg-amber-50 !text-amber-700 !border !border-amber-100 !font-bold"
                                : "!text-slate-500 !hover:bg-slate-50",
                            )}
                          >
                            <Package size={18} strokeWidth={2.5} />
                            <span className="text-[10px] uppercase tracking-[0.1em] whitespace-nowrap">
                              Katalog Menu
                            </span>
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Sync Footer Status */}
            <div className="!mt-auto !pt-8 border-t border-slate-100">
              {IS_PROD ? (
                isSyncing ? (
                  <div className="flex items-center gap-3 px-4 py-3 bg-sky-50 text-sky-600 rounded-2xl border border-sky-100 animate-pulse">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">
                      Menyinkronkan Data...
                    </span>
                  </div>
                ) : (
                  <div className="!flex !items-center !gap-3 !px-4 !py-3 !bg-emerald-50 !text-emerald-600 !rounded-2xl !border !border-emerald-100">
                    <Cloud
                      size={16}
                      fill="currentColor"
                      className="!opacity-80"
                    />
                    <span className="!text-[9px] !font-bold !uppercase !tracking-wider">
                      Terhubung ke Cloud
                    </span>
                  </div>
                )
              ) : (
                <div className="!flex !items-center !gap-3 !px-4 !py-3 !bg-slate-50 !text-slate-400 !rounded-2xl !border !border-slate-200">
                  <CloudOff size={16} className="!opacity-60" />
                  <span className="!text-[9px] !font-bold !uppercase !tracking-wider">
                    Mode Demo (Offline)
                  </span>
                </div>
              )}
              <p className="!text-center !text-[8px] !text-slate-300 !mt-4 !uppercase !tracking-[0.2em] !font-medium">
                Martabak SetiaRasa &bull; v1.3.0
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
