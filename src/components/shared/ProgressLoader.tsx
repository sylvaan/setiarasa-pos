import { motion } from 'framer-motion'

interface ProgressLoaderProps {
  isVisible: boolean
}

const ProgressLoader = ({ isVisible }: ProgressLoaderProps) => {
  if (!isVisible) return null

  return (
    <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden z-[60] bg-emerald-500/10">
      <motion.div
        initial={{ left: '-100%' }}
        animate={{ left: '100%' }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="absolute h-full w-1/3 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
      />
    </div>
  )
}

export default ProgressLoader
