# Martabak SetiaRasa POS App (v1.0.5)

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=vercel)](https://setiarasa-pos.vercel.app)

A mobile-first Point of Sale (POS) application and business dashboard built for **Martabak SetiaRasa Lebaksiu**, focusing on operational efficiency, cloud-synced financial reporting, and owner-centric analytics.

## 🥯 Core Features (V1.0.5)

### Staff Mode

- **Order Management**: Interface for quick product selection and smart cart management.
- **Dynamic Pricing Engine**: Support for dough options (Original, Pandan, etc.) with automatic price calculation rules.
- **Cloud Awareness**: Real-time synchronization status (Online/Offline) directly in the sidebar footer.
- **Popularity Tracking**: Visual badges and popularity sorting to identify best-selling martabak varieties.

### Owner Mode (Business Intelligence)

- **Professional Reporting**: Export transaction history into categorized Excel (.xlsx) files with one tap, optimized for accounting.
- **Security Hardening**: Authentication via 6-digit PIN with auto-logout.
- **Sales Analytics & Trends**: Revenue tracking, order volume, and profit analysis over daily, weekly, and monthly ranges.
- **Expense Control**: Real-time expense logging and categorization for accurate net profit calculations.

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite 6
- **Styling**: Tailwind CSS v4
- **Backend & Database**: Supabase
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Reporting Engine**: XLSX (Professional Spreadsheet Generation)
- **Mobile Bridge**: Capacitor (Cross-Platform Mobile Integration)

## 🚀 Deployment

### 1. Public Showcase (Vercel)

This project is configured for easy deployment on **Vercel** as a public-facing demo.

- **Mode**: Automated to `demo` (Mock Data).
- **Setup**:
  1. Connect your Github Repository to Vercel.
  2. Set `VITE_APP_MODE=demo` in Vercel Environment Variables.
  3. The `vercel.json` ensures smooth SPA routing.

### 2. Private Production (Tablet/Physical Shop)

For real business use, the build is performed locally to ensure maximum data privacy.

- **Mode**: `production` (Real Database/Supabase).
- **Setup**:
  1. Build locally with `VITE_APP_MODE=production`.
  2. Distribute via APK or local network hosting.

## 🚀 Local Development

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run in development mode:
   ```bash
   npm run dev
   ```

---

_Developed for Martabak SetiaRasa Lebaksiu._
