import { motion, AnimatePresence } from 'framer-motion'
import { X, UtensilsCrossed, Wallet, LayoutDashboard, PieChart, History } from 'lucide-react'
import type { StaffView, OwnerView } from '../../types'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface SideNavigationProps {
  isOpen: boolean
  onClose: () => void
  activeTab: 'staff' | 'owner'
  setActiveTab: (tab: 'staff' | 'owner') => void
  activeStaffView: StaffView
  setActiveStaffView: (view: StaffView) => void
  activeOwnerView: OwnerView
  setActiveOwnerView: (view: OwnerView) => void
  isOwnerAuthenticated: boolean
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
  isOwnerAuthenticated
}: SideNavigationProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-[60]"
          />
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-[280px] bg-white shadow-2xl z-[70] !pt-14 !px-8 !pb-8 flex flex-col justify-between border-r border-slate-100"
          >
            <div className="space-y-12">
              <div className="flex justify-between items-center pr-2">
                <div className="text-left py-1">
                  <h1 className="text-2xl font-bold text-emerald-600 leading-none tracking-tight">SetiaRasa</h1>
                  <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.25em] mt-2 opacity-80">POS System Martabak V1</p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 bg-slate-50 rounded-xl text-slate-400 active:scale-90 transition-all"
                >
                  <X size={18} strokeWidth={3} />
                </button>
              </div>

              <div className="space-y-4 !mt-5">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em] px-2 mb-4 opacity-60">Mode Akses</p>
                
                {/* Role Switcher */}
                <div className="flex gap-2 !my-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/50">
                  <button 
                    onClick={() => setActiveTab('staff')}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                      activeTab === 'staff' 
                        ? "!bg-emerald-600 !text-white !shadow-lg !shadow-emerald-500/20" 
                        : "!text-slate-400 !hover:text-slate-600"
                    )}
                  >
                    Staff
                  </button>
                  <button 
                    onClick={() => setActiveTab('owner')}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                      activeTab === 'owner' 
                        ? "!bg-amber-600 !text-white !shadow-lg !shadow-amber-500/20" 
                        : "!text-slate-400 !hover:text-slate-600"
                    )}
                  >
                    Owner
                  </button>
                </div>

                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em] px-2 !mb-2 opacity-60">Navigasi Utama</p>

                <div className="space-y-2 ">
                  {activeTab === 'staff' ? (
                    <>
                      <button 
                        onClick={() => { setActiveStaffView('pos'); onClose(); }}
                        className={cn(
                          "w-full flex items-center gap-4 !px-5 !py-4 !rounded-2xl transition-all group relative overflow-hidden",
                          activeStaffView === 'pos' 
                            ? "!bg-emerald-50 !text-emerald-600 !border !border-emerald-100 font-bold" 
                            : "text-slate-500 hover:bg-slate-50"
                        )}
                      >
                        <UtensilsCrossed size={18} strokeWidth={2.5} />
                        <span className="text-xs uppercase tracking-[0.2em]">Kasir (POS)</span>
                      </button>
                      <button 
                        onClick={() => { setActiveStaffView('expenses'); onClose(); }}
                        className={cn(
                          "w-full flex items-center gap-4 !px-5 !py-4 !rounded-2xl transition-all group relative overflow-hidden",
                          activeStaffView === 'expenses' 
                            ? "!bg-emerald-50 !text-emerald-600 !border !border-emerald-100 font-bold" 
                            : "!text-slate-500 hover:bg-slate-50"
                        )}
                      >
                        <Wallet size={18} strokeWidth={2.5} />
                        <span className="text-xs uppercase tracking-[0.2em]">Belanja Bahan</span>
                      </button>
                    </>
                  ) : (
                    <>
                      {!isOwnerAuthenticated ? (
                        <div className="!py-10 !text-center !space-y-3">
                          <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center !mx-auto text-slate-300">
                            <LayoutDashboard size={20} />
                          </div>
                          <p className="text-[10px] text-slate-400 italic font-medium px-4">Menu Owner terkunci. Silakan input PIN di layar utama.</p>
                        </div>
                      ) : (
                        <>
                          <button 
                            onClick={() => { setActiveOwnerView('overview'); onClose(); }}
                            className={cn(
                              "w-full flex items-center gap-4 !px-5 !py-4 !rounded-2xl transition-all group relative overflow-hidden",
                              activeOwnerView === 'overview' 
                                ? "!bg-amber-50 !text-amber-700 !border !border-amber-100 font-bold" 
                                : "!text-slate-500 hover:bg-slate-50"
                            )}
                          >
                            <LayoutDashboard size={18} strokeWidth={2.5} />
                            <span className="text-xs uppercase tracking-[0.2em]">Overview</span>
                          </button>
                          <button 
                            onClick={() => { setActiveOwnerView('sales'); onClose(); }}
                            className={cn(
                              "w-full flex items-center gap-4 !px-5 !py-4 !rounded-2xl transition-all group relative overflow-hidden",
                              activeOwnerView === 'sales' 
                                ? "!bg-amber-50 !text-amber-700 !border !border-amber-100 font-bold" 
                                : "!text-slate-500 hover:bg-slate-50"
                            )}
                          >
                            <PieChart size={18} strokeWidth={2.5} />
                            <span className="text-xs uppercase tracking-[0.2em]">Sales Performa</span>
                          </button>
                          <button 
                            onClick={() => { setActiveOwnerView('history'); onClose(); }}
                            className={cn(
                              "w-full flex items-center gap-4 !px-5 !py-4 !rounded-2xl transition-all group relative overflow-hidden",
                              activeOwnerView === 'history' 
                                ? "!bg-amber-50 !text-amber-700 !border !border-amber-100 font-bold" 
                                : "!text-slate-500 hover:bg-slate-50"
                            )}
                          >
                            <History size={18} strokeWidth={2.5} />
                            <span className="text-xs uppercase tracking-[0.2em]">Riwayat Nota</span>
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
