export const APP_VERSION = '1.2.0'

/**
 * Application Modes:
 * - 'demo': Uses local mock data for portfolio/recruitment showcases.
 * - 'production': Uses real-time Supabase database for the actual business.
 */
export const APP_MODE = (import.meta.env.VITE_MODE || 'demo') as 'demo' | 'production'

export const IS_DEMO = APP_MODE === 'demo'
export const IS_PROD = APP_MODE === 'production'

export const CONFIG = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  mode: APP_MODE,
  version: APP_VERSION,
}

if (IS_PROD && (!CONFIG.supabaseUrl || !CONFIG.supabaseKey)) {
  console.warn('⚠️ Supabase credentials missing in Production mode. Falling back to local/demo logic.')
}
