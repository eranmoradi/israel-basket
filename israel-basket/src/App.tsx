import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'

declare const gtag: (...args: unknown[]) => void
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import chainPricesData from './data/chain_prices.json'

const priceUpdatedAt = new Date((chainPricesData as { fetched_at: string }).fetched_at)
  .toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric', year: 'numeric' })

function AppFooter() {
  return (
    <footer className="max-w-3xl mx-auto px-4 py-6 mb-2 text-center space-y-1.5">
      <div className="text-2xl">🛒</div>
      <p className="text-xs text-gray-600">מחירים עודכנו: {priceUpdatedAt} · מקור הנתונים: משרד הכלכלה</p>
      <p className="text-xs text-gray-700">נבנה בעזרת Claude Code AI · לא שייך לקרפור</p>
    </footer>
  )
}
import BasketBar from './components/BasketBar'
import BasketPageBot from './components/BasketPageBot'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import BasketPage from './pages/BasketPage'
import BranchesPage from './pages/BranchesPage'
import ComparePage from './pages/ComparePage'
import AdminPage from './pages/AdminPage'
import { useBasketStore } from './store/basketStore'

function AppInner() {
  const count = useBasketStore((s) => s.count)
  const { pathname } = useLocation()
  const [botOpen, setBotOpen] = useState(false)

  useEffect(() => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', { page_path: pathname })
    }
  }, [pathname])

  const showPageBot = pathname === '/basket' || pathname === '/products' || pathname === '/compare' || pathname === '/branches'
  const isAdmin = pathname === '/analytics'

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/analytics" element={<AdminPage />} />
      </Routes>
    )
  }

  return (
    <>
      {/* Desktop blocker — only shown on screens wider than mobile */}
      <div
        className="hidden md:flex fixed inset-0 z-[200] flex-col items-center justify-center bg-gray-950 text-center px-8 gap-6"
        dir="rtl"
      >
        <h1 className="text-white font-black text-2xl">האפליקציה זמינה למובייל בלבד</h1>
        <div className="rounded-2xl p-4 bg-white">
          <QRCodeSVG value="https://israelbasket.app" size={180} bgColor="#ffffff" fgColor="#0f172a" />
        </div>
        <p className="text-gray-400 text-sm leading-relaxed">
          סרקו את הברקוד עם הטלפון<br />
          <span className="text-blue-400 font-medium">israelbasket.app</span>
        </p>
      </div>

    <div
      className="min-h-screen bg-gray-950"
      style={{ paddingBottom: count > 0 ? 'calc(8rem + env(safe-area-inset-bottom, 0px))' : 'calc(4rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <Header onBotOpen={showPageBot ? () => setBotOpen(true) : undefined} />
      {showPageBot && (
        <BasketPageBot externalOpen={botOpen} onExternalClose={() => setBotOpen(false)} />
      )}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/basket" element={<BasketPage />} />
        <Route path="/branches" element={<BranchesPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AppFooter />
      <BasketBar />
      <BottomNav />
    </div>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  )
}
