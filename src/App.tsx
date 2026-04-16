import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

// Auth
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

// User
import Home from './pages/user/Home'
import ProductDetail from './pages/user/ProductDetail'
import MyOrders from './pages/user/MyOrders'
import MyTickets from './pages/user/MyTickets'
import BuyFollowers from './pages/user/BuyFollowers'
import PrivacyPolicy from './pages/legal/PrivacyPolicy'
import TermsAndConditions from './pages/legal/TermsAndConditions'

// Admin
import AdminLogin from './pages/admin/AdminLogin'
import Dashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import AdminTickets from './pages/admin/AdminTickets'
import AdminCoupons from './pages/admin/AdminCoupons'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* USER ROUTES — with Navbar */}
          <Route path="/" element={<><Navbar /><Home /></>} />
          <Route path="/login" element={<><Navbar /><Login /></>} />
          <Route path="/signup" element={<><Navbar /><Signup /></>} />
          <Route path="/forgot-password" element={<><Navbar /><ForgotPassword /></>} />
          <Route path="/reset-password" element={<><Navbar /><ResetPassword /></>} />
          <Route path="/product/:id" element={<><Navbar /><ProductDetail /></>} />
          <Route path="/followers" element={<><Navbar /><BuyFollowers /></>} />
          <Route path="/privacy-policy" element={<><Navbar /><PrivacyPolicy /></>} />
          <Route path="/terms" element={<><Navbar /><TermsAndConditions /></>} />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Navbar />
                <MyOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support"
            element={
              <ProtectedRoute>
                <Navbar />
                <MyTickets />
              </ProtectedRoute>
            }
          />

          {/* ADMIN ROUTES — no Navbar */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route
            path="/admin/dashboard"
            element={<AdminRoute><Dashboard /></AdminRoute>}
          />
          <Route
            path="/admin/products"
            element={<AdminRoute><AdminProducts /></AdminRoute>}
          />
          <Route
            path="/admin/orders"
            element={<AdminRoute><AdminOrders /></AdminRoute>}
          />
          <Route
            path="/admin/tickets"
            element={<AdminRoute><AdminTickets /></AdminRoute>}
          />
          <Route
            path="/admin/coupons"
            element={<AdminRoute><AdminCoupons /></AdminRoute>}
          />

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
