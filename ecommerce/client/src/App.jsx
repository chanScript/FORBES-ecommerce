import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import CarDetailsPage from './pages/CarDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SellerDashboard from './pages/SellerDashboard';
import SellerSubmitPage from './pages/SellerSubmitPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminListingsPage from './pages/AdminListingsPage';
import AdminSellerRequestsPage from './pages/AdminSellerRequestsPage';
import AdminInquiriesPage from './pages/AdminInquiriesPage';
import FavoritesPage from './pages/FavoritesPage';
import ProtectedRoute from './routes/ProtectedRoute';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/cars/:slug" element={<CarDetailsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Authenticated — Favorites */}
          <Route element={<ProtectedRoute roles={['User', 'Seller', 'Admin', 'Super Admin']} />}>
            <Route path="/favorites" element={<FavoritesPage />} />
          </Route>

          {/* Seller Dashboard — also accessible by regular users (for seller request flow) */}
          <Route element={<ProtectedRoute roles={['User', 'Seller', 'Admin', 'Super Admin']} />}>
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
          </Route>

          {/* Seller Submit — only actual sellers */}
          <Route element={<ProtectedRoute roles={['Seller', 'Admin', 'Super Admin']} />}>
            <Route path="/seller/submit" element={<SellerSubmitPage />} />
          </Route>

          {/* Admin */}
          <Route element={<ProtectedRoute roles={['Admin', 'Super Admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/listings" element={<AdminListingsPage />} />
            <Route path="/admin/seller-requests" element={<AdminSellerRequestsPage />} />
            <Route path="/admin/inquiries" element={<AdminInquiriesPage />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
