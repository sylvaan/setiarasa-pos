import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'

export type NotificationType = 'success' | 'error'

interface NotificationToastProps {
  isVisible: boolean
  message: string
  type: NotificationType
  onClose: () => void
}

const NotificationToast = ({ isVisible, message, type, onClose }: NotificationToastProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm"
        >
          <div className={`
            glass-card !p-4 flex items-center gap-4 shadow-2xl border 
            ${type === 'success' ? '!border-emerald-500/50 bg-emerald-50/90' : '!border-amber-500/50 bg-amber-50/90'}
          `}>
            {type === 'success' ? (
              <div className="bg-emerald-500 rounded-full p-1 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
            ) : (
              <div className="bg-amber-500 rounded-full p-1 shadow-lg shadow-amber-500/20">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
            )}
            
            <div className="flex-1">
              <p className={`text-sm font-bold tracking-tight ${type === 'success' ? 'text-emerald-900' : 'text-amber-900'}`}>
                {message}
              </p>
            </div>

            <button 
              onClick={onClose}
              className="p-1 hover:bg-black/5 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default NotificationToast
