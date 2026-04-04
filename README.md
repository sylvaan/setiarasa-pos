# Martabak SetiaRasa Lebaksiu

A mobile-first Point of Sale (POS) application built for **Martabak SetiaRasa Lebaksiu**, with a focus on ease of use and real-time sales tracking.

## Core Features

### Staff Mode
- **Order Management**: Interface for quick product selection and cart management.
- **Product Variants**: Support for different dough options (Original, Pandan, etc.) with automatic price adjustments.
- **Persistent Cart**: Local state persistence and order handling using Zustand.
- **Checkout Workflow**: Step-by-step process for completing transactions and recording sales.

### Owner Mode
- **Access Control**: Authentication via a 6-digit PIN for sensitive data access.
- **Sales Analytics**: Overview of daily revenue, order counts, and net profit (Gross Sales - Expenses).
- **Trends & Charts**: Visual representation of sales trends and product popularity over Day, Week, and Month periods.
- **Record Keeping**: Transaction history and expense logging for basic business accounting.

## Tech Stack
- **Frontend**: React 19 + Vite 6
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand (with Persist Middleware)
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

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
4. Build for production:
   ```bash
   npm run build
   ```

## Design and Architecture
- **Component-Based**: Modular structure separating POS, Expenses, and Dashboard logic.
- **Responsive Design**: Designed specifically for small-screen mobile devices.
- **State Persistence**: Uses browser's local storage for data durability across sessions.

---
*Developed for Martabak SetiaRasa Lebaksiu.*
