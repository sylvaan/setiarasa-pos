import { X, Save, Trash2, Package, Tag } from 'lucide-react'
import { useState, useEffect } from 'react'
import Button from '../../ui/Button'
import { Heading, Subheading, Label } from '../../ui/Typography'
import { motion } from 'framer-motion'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useCartStore } from '../../../store/useCartStore'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface CatalogEditorModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  type: 'product' | 'topping'
  initialData?: any
}

const CatalogEditorModal = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  type,
  initialData
}: CatalogEditorModalProps) => {
  const [formData, setFormData] = useState<any>({})
  const isSyncing = useCartStore(state => state.isSyncing)

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      setFormData(type === 'product' ? {
        name: '',
        basePrice: 0,
        category: 'manis',
        isSpecialExtra: false
      } : {
        label: '',
        price: 0
      })
    }
  }, [initialData, type, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onSave(formData)
      onClose()
    } catch (err) {
      // Error is handled by the parent's notification
      console.error("Save failed:", err)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center px-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <motion.div 
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        className="relative bg-white w-full max-w-[440px] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden glass-card !p-0"
      >
        {/* Header */}
        <div className="!p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              {type === 'product' ? <Package size={24} /> : <Tag size={24} />}
            </div>
            <div>
              <Heading as="h3" className="!text-lg">
                {initialData ? 'Edit' : 'Tambah'} {type === 'product' ? 'Menu' : 'Topping'}
              </Heading>
              <Subheading className="!text-[10px] uppercase tracking-wider opacity-60">
                {type === 'product' ? 'Martabak & Telor' : 'Ekstra Topping'}
              </Subheading>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="!p-8 !space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
          
          {type === 'product' ? (
            <>
              {/* Product Fields */}
              <div className="space-y-2">
                <Label className="!ml-1 opacity-60">Nama Produk</Label>
                <input 
                  autoFocus
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full !p-4 !rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all font-bold text-slate-700"
                  placeholder="Contoh: Martabak Coklat Keju"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="!ml-1 opacity-60">Harga Dasar (Rp)</Label>
                  <input 
                    type="number"
                    required
                    value={formData.basePrice || ''}
                    onChange={(e) => setFormData({...formData, basePrice: Number(e.target.value)})}
                    className="w-full !p-4 !rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold text-slate-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="!ml-1 opacity-60">Kategori</Label>
                  <select 
                    value={formData.category || 'manis'}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full !p-4 !rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold text-slate-700 appearance-none"
                  >
                    <option value="manis">Manis</option>
                    <option value="telor">Telor</option>
                  </select>
                </div>
              </div>

              {formData.category === 'telor' && (
                <div className="space-y-2">
                  <Label className="!ml-1 opacity-60">Jenis Telor</Label>
                  <div className="flex gap-4">
                    {['Ayam', 'Bebek'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormData({...formData, eggType: t})}
                        className={cn(
                          "flex-1 p-3 rounded-xl border-2 font-black uppercase text-[10px] tracking-widest transition-all",
                          formData.eggType === t 
                            ? "bg-emerald-500 border-emerald-400 text-white shadow-lg"
                            : "bg-white border-slate-50 text-slate-400"
                        )}
                      >
                        Telor {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* COMMENTED: M7 Price Regulation - Uncomment if promo logic is needed */}
              {/* <div className="!pt-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, isSpecialExtra: !formData.isSpecialExtra})}
                  className={cn(
                    "w-full !p-4 rounded-2xl border-2 flex items-center justify-between transition-all",
                    formData.isSpecialExtra 
                      ? "bg-emerald-50 border-emerald-200" 
                      : "bg-white border-slate-100 opacity-60"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Layers size={20} className={formData.isSpecialExtra ? "text-emerald-600" : "text-slate-400"} />
                    <div className="text-left">
                      <p className={cn("text-xs font-bold", formData.isSpecialExtra ? "text-emerald-700" : "text-slate-600")}>Regulasi Harga M7</p>
                      <Subheading className="!p-0 !text-[9px]">Otomatis potong harga adonan (Promo Keju Susu)</Subheading>
                    </div>
                  </div>
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                    formData.isSpecialExtra ? "bg-emerald-500 text-white" : "bg-slate-100 text-transparent"
                  )}>
                    <CheckCircle size={14} />
                  </div>
                </button>
              </div> */}
            </>
          ) : (
            <>
              {/* Topping Fields */}
              <div className="space-y-2">
                <Label className="!ml-1 opacity-60">Nama Topping</Label>
                <input 
                  autoFocus
                  required
                  value={formData.label || ''}
                  onChange={(e) => setFormData({...formData, label: e.target.value})}
                  className="w-full !p-4 !rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold text-slate-700"
                  placeholder="Contoh: Ekstra Keju"
                />
              </div>

              <div className="space-y-2">
                <Label className="!ml-1 opacity-60">Harga Topping (Rp)</Label>
                <input 
                  type="number"
                  required
                  value={formData.price || ''}
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  className="w-full !p-4 !rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-emerald-500 outline-none transition-all font-bold text-slate-700"
                />
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="!pt-6 !space-y-3">
            <Button 
               type="submit"
               fullWidth
               size="xl"
               className="!rounded-[1.5rem]"
               disabled={isSyncing}
            >
              <Save size={18} className="mr-2" /> {isSyncing ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>

            {initialData && onDelete && (
              <button
                type="button"
                disabled={isSyncing}
                onClick={async () => {
                  if(confirm('Hapus item ini permanen?')) {
                    try {
                      await onDelete(initialData.id)
                      onClose()
                    } catch (err) {
                      console.error("Delete failed:", err)
                    }
                  }
                }}
                className="w-full p-4 flex items-center justify-center gap-2 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 disabled:opacity-50 rounded-2xl transition-all"
              >
                <Trash2 size={14} /> Hapus Item
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default CatalogEditorModal
