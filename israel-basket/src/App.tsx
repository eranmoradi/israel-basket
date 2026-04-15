import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import BasketBar from './components/BasketBar'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import BasketPage from './pages/BasketPage'
import BranchesPage from './pages/BranchesPage'
import ComparePage from './pages/ComparePage'
import { useBasketStore } from './store/basketStore'

export default function App() {
  const count = useBasketStore((s) => s.count)

  return (
    <BrowserRouter>
      <div className={`min-h-screen bg-gray-950 ${count > 0 ? 'pb-32' : 'pb-16'}`}>
        <Header />
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
    </BrowserRouter>
  )
}
