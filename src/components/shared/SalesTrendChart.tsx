import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { Heading, Subheading } from '../ui/Typography'
import Card from '../ui/Card'

interface SalesTrendPoint {
  label: string
  timestamp: number
  amount: number
  isToday?: boolean
}

interface SalesTrendChartProps {
  data: SalesTrendPoint[]
  range: 'today' | 'week' | 'month'
}

const SalesTrendChart = ({ data, range }: SalesTrendChartProps) => {
  const height = 160
  const width = 400 // Reference width for SVG coordinate space
  
  const chartData = useMemo(() => {
    if (data.length === 0) return null
    
    const realMax = Math.max(...data.map(d => d.amount), 0)
    const maxAmount = realMax === 0 ? 10000 : realMax * 1.1 // Dynamic ceiling with 10% padding
    const padding = 20
    const chartHeight = height - padding * 2
    
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - padding - (d.amount / maxAmount) * chartHeight
      return { x, y, ...d }
    })
    
    // Generate SVG Path
    const linePath = points.map((p, i) => 
      `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    ).join(' ')
    
    const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`
    
    return { points, linePath, areaPath, maxAmount, realMax }
  }, [data])

  if (!chartData) return null

  return (
    <Card variant="white" padding="lg" className="!pt-8 !pb-6 shadow-xl shadow-slate-200/40 relative overflow-hidden">
      <div className="flex justify-between items-start mb-6 px-2">
        <div className="text-left">
           <Subheading className="!text-emerald-600 !mb-1 !tracking-widest">Garis Tren</Subheading>
           <Heading as="h3" className="!text-xl capitalize">Penjualan {range === 'today' ? 'Hari Ini' : range === 'week' ? 'Minggu Ini' : 'Bulan Ini'}</Heading>
        </div>
        <div className="text-right">
           <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Puncak</p>
           <p className="text-sm font-bold text-slate-900">Rp {(chartData.realMax/1000).toFixed(0)}k</p>
        </div>
      </div>

      <div className="relative h-[160px] w-full">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <motion.path 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            d={chartData.areaPath}
            fill="url(#chartGradient)"
          />

          {/* Main Line */}
          <motion.path 
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            d={chartData.linePath}
            fill="none"
            stroke="#10b981"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Dots Group */}
          {chartData.points.map((p, i) => (
            <motion.circle 
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + (i * 0.05) }}
              cx={p.x}
              cy={p.y}
              r="4"
              className="fill-white stroke-emerald-600 stroke-[3px] shadow-sm cursor-pointer"
              whileHover={{ r: 6 }}
            />
          ))}
        </svg>

        {/* Labels Layer (Minimalist) */}
        <div className="flex justify-between mt-4 px-1">
           {data.length > 2 && [0, Math.floor(data.length / 2), data.length - 1].map((idx) => (
             <span key={idx} className="text-[9px] font-bold text-slate-310 uppercase tracking-widest text-slate-400">
               {data[idx].label}
             </span>
           ))}
        </div>
      </div>
    </Card>
  )
}

export default SalesTrendChart
