import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import ListingDetailsPage from './pages/ListingDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SellerDashboard from './pages/SellerDashboard';
import SellerSubmitPage from './pages/SellerSubmitPage';
import SellerSubmissionPage from './pages/SellerSubmissionPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminListingsPage from './pages/AdminListingsPage';
import AdminSubmissionsPage from './pages/AdminSubmissionsPage';
import AdminSubmissionDetailPage from './pages/AdminSubmissionDetailPage';
import AdminInquiriesPage from './pages/AdminInquiriesPage';
import AdminApplicationsPage from './pages/AdminApplicationsPage';
import FavoritesPage from './pages/FavoritesPage';
import ServiceLandingPage from './pages/ServiceLandingPage';
import VehicleLandingPage from './pages/VehicleLandingPage';
import FinanceLandingPage from './pages/FinanceLandingPage';
import OrCrLandingPage from './pages/OrCrLandingPage';
import PartnerLandingPage from './pages/PartnerLandingPage';
import AdminSellerRequestsPage from './pages/AdminSellerRequestsPage';
import SellerProfilePage from './pages/SellerProfilePage';
import ProtectedRoute from './routes/ProtectedRoute';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/browse" element={<HomePage />} />
          <Route path="/listings/:slug" element={<ListingDetailsPage />} />
          <Route path="/sell" element={<SellerSubmissionPage />} />
          <Route path="/services/finance" element={<FinanceLandingPage />} />
          <Route path="/services/orcr" element={<OrCrLandingPage />} />
          <Route path="/services/partner" element={<PartnerLandingPage />} />
          <Route path="/services/:slug" element={<ServiceLandingPage />} />
          <Route path="/marketplace/vehicle" element={<VehicleLandingPage />} />
          <Route path="/sellers/:sellerId" element={<SellerProfilePage />} />
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
            <Route path="/admin/submissions" element={<AdminSubmissionsPage />} />
            <Route path="/admin/submissions/:id" element={<AdminSubmissionDetailPage />} />
            <Route path="/admin/inquiries" element={<AdminInquiriesPage />} />
            <Route path="/admin/applications" element={<AdminApplicationsPage />} />
            <Route path="/admin/seller-requests" element={<AdminSellerRequestsPage />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
