import { motion } from 'framer-motion'
import { Heading, Subheading } from '../ui/Typography'

const LoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center !py-40 !space-y-8 animate-in fade-in duration-700">
      <div className="relative">
        {/* Outer Glow */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-x-[-1.5rem] inset-y-[-1.5rem] bg-emerald-400/20 blur-2xl rounded-full"
        />
        
        {/* Main Spinner */}
        <div className="relative w-20 h-20">
           <svg className="w-full h-full animate-spin" viewBox="0 0 100 100">
              <circle 
                cx="50" cy="50" r="45" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="8" 
                className="text-slate-100"
              />
              <circle 
                cx="50" cy="50" r="45" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="8" 
                strokeDasharray="180"
                strokeLinecap="round"
                className="text-emerald-600"
              />
           </svg>
           
           {/* Center Icon/Logo - Minimalist */}
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
           </div>
        </div>
      </div>

      <div className="text-center space-y-2">
        <Heading as="h3" className="!text-sm !tracking-[0.2em]">SetiaRasa POS</Heading>
        <Subheading className="!text-[9px] !opacity-80 animate-pulse">Menyiapkan Pengalaman Premium</Subheading>
      </div>
    </div>
  )
}

export default LoadingState
