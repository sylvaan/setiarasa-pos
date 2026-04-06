import { motion } from 'framer-motion'
import { PieChart } from 'lucide-react'
import type { OwnerView } from '../../../types'
import { Heading, Subheading } from '../../ui/Typography'
import Card from '../../ui/Card'
import Badge from '../../ui/Badge'
import SectionHeader from '../../shared/SectionHeader'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface OwnerSalesProps {
  topProducts: { name: string, count: number, dough?: string }[]
  analyticsRange: 'today' | 'week' | 'month'
  setAnalyticsRange: (range: 'today' | 'week' | 'month') => void
  setActiveOwnerView: (view: OwnerView) => void
}

const OwnerSales = ({
  topProducts,
  analyticsRange,
  setAnalyticsRange,
  setActiveOwnerView
}: OwnerSalesProps) => {
  return (
    <div className="!space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <SectionHeader 
        title="Produk Terlaris"
        onBack={() => setActiveOwnerView('overview')}
      />

      <Card variant="white" padding="xl" className="!shadow-xl !shadow-slate-200/50 !space-y-10">
        <div className="!flex !bg-slate-50 !p-1.5 !rounded-2xl !gap-1 !border !border-slate-100">
          {(['today', 'week', 'month'] as const).map(range => (
            <button
              key={range}
              onClick={() => setAnalyticsRange(range)}
              className={cn(
                "!flex-1 !py-3 !rounded-xl !text-[10px] !font-bold !uppercase !tracking-widest !transition-all",
                analyticsRange === range ? "!bg-emerald-500 !text-white !shadow-lg !shadow-slate-200 !border !border-slate-50" : "!text-slate-400 !font-medium"
              )}
            >
              {range === 'today' ? 'Hari' : range === 'week' ? 'Minggu' : 'Bulan'}
            </button>
          ))}
        </div>

        <div className="!space-y-10 !mx-3 !py-2 !pb-4">
          {topProducts.length === 0 ? (
            <div className="!py-24 text-center !space-y-4">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 !mx-auto border-2 border-dashed border-slate-100">
                  <PieChart size={32} />
               </div>
               <Subheading className="italic opacity-80">Data Belum Tersedia</Subheading>
            </div>
          ) : (
            topProducts.map((p, i) => {
              const percent = (p.count / topProducts[0].count) * 100
              return (
                <div key={i} className="!space-y-4">
                  <div className="!flex !justify-between items-end !px-1">
                    <div className="!space-y-1.5">
                      <Heading as="p" className="!text-sm">{p.name}</Heading>
                      <div className="flex items-center gap-2">
                         <Badge variant={p.dough === 'Manis' ? 'emerald' : 'amber'}>
                            {p.dough || 'Standar'}
                         </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                       <Heading as="p" className="!text-xs tabular-nums !text-slate-900">
                         {p.count} <Label className="ml-0.5 opacity-60">Terjual</Label>
                       </Heading>
                    </div>
                  </div>
                  <div className="!h-3 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50 p-0.5">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} className="h-full bg-linear-to-r from-amber-400 to-amber-500 rounded-full shadow-sm" />
                  </div>
                </div>
              )
            })
          )}
        </div>
      </Card>
    </div>
  )
}

// Importing Label here because it's used inside the map
import { Label } from '../../ui/Typography'

export default OwnerSales
