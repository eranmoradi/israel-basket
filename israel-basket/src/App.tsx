import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import BasketBar from './components/BasketBar'
import BasketPageBot from './components/BasketPageBot'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import BasketPage from './pages/BasketPage'
import BranchesPage from './pages/BranchesPage'
import ComparePage from './pages/ComparePage'
import { useBasketStore } from './store/basketStore'

function AppInner() {
  const count = useBasketStore((s) => s.count)
  const { pathname } = useLocation()
  const [botOpen, setBotOpen] = useState(false)

  const showPageBot = pathname === '/basket' || pathname === '/products' || pathname === '/compare' || pathname === '/branches'

  return (
    <div className={`min-h-screen bg-gray-950 ${count > 0 ? 'pb-32' : 'pb-16'}`}>
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
      <BasketBar />
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  )
}
