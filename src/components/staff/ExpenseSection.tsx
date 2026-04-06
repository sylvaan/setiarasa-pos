import { motion } from 'framer-motion'
import { Wallet, History, ReceiptText, Trash2 } from 'lucide-react'
import type { Expense } from '../../types'
import { Heading, Subheading, Label } from '../ui/Typography'
import Card from '../ui/Card'
import Button from '../ui/Button'

interface ExpenseSectionProps {
  expenses: Expense[]
  addExpense: (title: string, amount: number, category: string) => void
  removeExpense: (id: string) => void
}

const ExpenseSection = ({ expenses, addExpense, removeExpense }: ExpenseSectionProps) => {
  return (
    <div className="max-w-[440px] mx-auto w-full !space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 !pb-20">
      <div className="!space-y-4 text-center">
        <div className="w-20 h-20 !mt-3 !bg-emerald-50 !rounded-[2rem] flex items-center justify-center text-emerald-600 !mx-auto shadow-sm !border !border-emerald-100/50">
          <Wallet size={36} strokeWidth={1.5} />
        </div>
        <div>
          <Heading as="h2" className="!text-2xl">Laporan Belanja</Heading>
          <Subheading className="!mt-1">Catat pengeluaran bahan harian Anda</Subheading>
        </div>
      </div>

      {/* Expense Form */}
      <Card variant="white" padding="xl" className="shadow-xl shadow-slate-200/50 !space-y-6">
        <div className="!space-y-4">
          <div className="!space-y-2">
            <Label className="!ml-1 opacity-70">Nama Barang</Label>
            <input 
              type="text" 
              id="expense-title-input"
              placeholder="Contoh: Telur 10kg, Plastik, Mentega" 
              className="w-full !bg-slate-50 !border-none !p-4 !rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-300 outline-none"
            />
          </div>
          <div className="!space-y-2">
            <Label className="!ml-1 opacity-70">Nominal (Rp)</Label>
            <input 
              type="number" 
              id="expense-amount-input"
              placeholder="Contoh: 150000" 
              className="w-full !bg-slate-50 !border-none !p-4 !rounded-2xl text-sm font-bold text-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-300 outline-none"
            />
          </div>
        </div>
        <Button 
          variant="emerald"
          fullWidth
          size="lg"
          onClick={() => {
            const titleInput = document.getElementById('expense-title-input') as HTMLInputElement
            const amountInput = document.getElementById('expense-amount-input') as HTMLInputElement
            if (titleInput.value && amountInput.value) {
              addExpense(titleInput.value, parseInt(amountInput.value), 'bahan')
              titleInput.value = ''
              amountInput.value = ''
            }
          }}
        >
          Simpan Belanja
        </Button>
      </Card>

      {/* Recent Expenses List */}
      <div className="!space-y-6 !px-2">
        <Subheading className="flex items-center gap-2">
          <History size={14} /> Pengeluaran Terakhir
        </Subheading>
        <div className="!space-y-3">
          {expenses.length === 0 ? (
            <Card variant="glass" className="!py-20 text-center border-2 border-dashed border-slate-200">
              <Label className="opacity-80 italic">Belum ada catatan belanja</Label>
            </Card>
          ) : (
            expenses.slice(0, 10).map((ex) => (
              <motion.div 
                key={ex.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100 flex justify-between items-center group active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                     <ReceiptText size={18} />
                  </div>
                  <div>
                    <Heading as="p" className="!text-sm group-hover:text-emerald-600 transition-colors">
                      {ex.title}
                    </Heading>
                    <Label className="mt-0.5 opacity-60">
                      {new Date(ex.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} • {new Date(ex.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                    </Label>
                  </div>
                </div>
                <div className="flex items-center !gap-4">
                  <Heading as="span" className="!text-sm text-rose-500">Rp {Number((ex.amount / 1000).toFixed(1))}k</Heading>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="!p-2 hover:bg-rose-50 hover:text-rose-500 rounded-xl"
                    onClick={() => removeExpense(ex.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ExpenseSection
