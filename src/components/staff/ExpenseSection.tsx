import { Wallet, History, ReceiptText, Trash2 } from 'lucide-react'
import type { Expense } from '../../types'

interface ExpenseSectionProps {
  expenses: Expense[]
  addExpense: (title: string, amount: number, category: string) => void
  removeExpense: (id: string) => void
}

export const ExpenseSection = ({ expenses, addExpense, removeExpense }: ExpenseSectionProps) => {
  return (
    <div className="max-w-[440px] mx-auto w-full !space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 !pb-20">
      <div className="!space-y-4 text-center">
        <div className="w-20 h-20 !mt-3 !bg-emerald-50 !rounded-[2rem] flex items-center justify-center text-emerald-600 !mx-auto shadow-sm !border !border-emerald-100/50">
          <Wallet size={36} strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="!text-2xl !font-bold !text-slate-900 italic uppercase">Laporan Belanja</h2>
          <p className="!text-slate-500 !text-xs !font-medium !mt-1">Catat pengeluaran bahan harian Anda</p>
        </div>
      </div>

      {/* Expense Form */}
      <div className="!bg-white !p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 !space-y-6">
        <div className="!space-y-4">
          <div className="!space-y-2">
            <label className="!text-[10px] font-bold text-slate-400 uppercase tracking-widest !ml-1">Nama Barang</label>
            <input 
              type="text" 
              id="expense-title"
              placeholder="Contoh: Telur 10kg, Plastik, Mentega" 
              className="w-full !bg-slate-50 !border-none !p-4 !rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-300"
            />
          </div>
          <div className="!space-y-2">
            <label className="!text-[10px] font-bold text-slate-400 uppercase tracking-widest !ml-1">Nominal (Rp)</label>
            <input 
              type="number" 
              id="expense-amount"
              placeholder="Contoh: 150000" 
              className="w-full !bg-slate-50 !border-none !p-4 !rounded-2xl text-sm font-bold text-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-300"
            />
          </div>
        </div>
        <button 
          onClick={() => {
            const titleInput = document.getElementById('expense-title') as HTMLInputElement
            const amountInput = document.getElementById('expense-amount') as HTMLInputElement
            if (titleInput.value && amountInput.value) {
              addExpense(titleInput.value, parseInt(amountInput.value), 'bahan')
              titleInput.value = ''
              amountInput.value = ''
            }
          }}
          className="w-full !bg-emerald-600 !text-white !py-4 !rounded-3xl font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
        >
          Simpan Belanja
        </button>
      </div>

      {/* Recent Expenses List */}
      <div className="!space-y-6 !px-2">
        <h3 className="!text-xs !font-bold !text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <History size={14} /> Pengeluaran Terakhir
        </h3>
        <div className="!space-y-3">
          {expenses.length === 0 ? (
            <div className="!py-20 text-center text-slate-400 !border-2 !border-dashed border-slate-200 rounded-[2.5rem] bg-white/30 backdrop-blur-sm">
              <p className="!text-[10px] font-bold uppercase tracking-widest italic">Belum ada catatan belanja</p>
            </div>
          ) : (
            expenses.slice(0, 10).map((ex) => (
              <div key={ex.id} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100 flex justify-between items-center group active:scale-[0.98] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                     <ReceiptText size={18} />
                  </div>
                  <div>
                    <p className="!font-bold !text-sm !text-slate-900 group-hover:text-emerald-600 transition-colors uppercase italic">{ex.title}</p>
                    <p className="!text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">
                      {new Date(ex.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • {new Date(ex.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center !gap-4">
                  <p className="font-bold text-sm text-rose-500 italic">Rp {(ex.amount / 1000).toFixed(0)}k</p>
                  <button 
                    onClick={() => removeExpense(ex.id)}
                    className="p-2 text-slate-300 hover:text-rose-500 active:scale-75 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
