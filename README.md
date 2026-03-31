# 🥯 SetiaRasa POS (Mobile-First Modern UI)

SetiaRasa POS is a high-performance, mobile-first Point of Sale application designed for artisanal food businesses like "Martabak Setia Rasa". Built with a focus on an elegant **Sky Blue Aesthetic** and a seamless **"Klik-Klik" (One-Tap)** workflow, it allows staff to record sales instantly while providing owners with real-time analytics.

## ✨ Key Features

### 🛒 Staff Mode (Sales Workflow)
- **Ultra-Fast Ordering**: Optimized for touch inputs with large, beautiful cards.
- **Dynamic Variants**: Support for dough selection (Original, Pandan, Black Forest) with immediate pricing updates.
- **Smart Cart**: Persistent shopping cart powered by **Zustand** that remembers orders even if the page is refreshed.
- **Animated Checkout**: Smooth transitions and clear feedback for every action.

### 🛡️ Owner Mode (Business Intelligence)
- **PIN Protected Access**: Secure owner-only dashboard guarded by a 6-digit PIN.
- **Real-Time Stats**: Daily sales revenue and total order count at a glance.
- **Sales Trends**: Animated SVG charts showing sales velocity over the last 8 hours.
- **Menu Popularity**: Visual ranking of best-selling items (Today, This Week, This Month).
- **History Viewer**: Detailed record of daily transactions with unique order IDs.

## 🚀 Tech Stack
- **Frontend**: React 19 + Vite 6
- **Styling**: Tailwind CSS v4 (Glassmorphism & Custom UI)
- **State Management**: Zustand (with Persist Middleware)
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation
1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run in development mode:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

## 🎨 Design Philosophy
The UI is built on a **"Sky Blue & Glass"** aesthetic:
- **Translucent Overlays**: Utilizing backdrop-blur for a modern, depth-focused feel.
- **High-Contrast Typography**: Using bold, black italic accents for a premium, fast-paced brand vibe.
- **Tactile Feedback**: Responsive hover and active states for a "native app" experience on mobile.

---
*Built with ❤️ for SetiaRasa Martabak.*
