import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { inquiriesAPI } from '../../api/inquiries';
import { Car, Menu, X, User, ChevronDown, LogOut, LayoutDashboard, Plus, Heart, Shield, UserPlus, MessageSquare } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isSeller, isAdmin, isUser, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const { data: inquiryCountData } = useQuery({
    queryKey: ['inquiryCount'],
    queryFn: () => inquiriesAPI.adminCount().then(r => r.data),
    enabled: isAdmin,
    refetchInterval: 30000,
  });

  const newInquiryCount = inquiryCountData?.count || 0;

  return (
    <header className="sticky top-0 z-50 bg-primary-header shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
        
          <span className="text-xl font-bold text-primary-on-dark">Ecommerce</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 lg:flex">
          <Link to="/" className="text-sm font-medium text-white hover:text-primary-on-dark transition-colors">
            Browse Cars
          </Link>
          {isAuthenticated && !isSeller && (
            <Link to="/seller/dashboard" className="text-sm font-medium text-primary-on-dark hover:text-white transition-colors flex items-center gap-1">
              <UserPlus className="h-4 w-4" /> Become a Seller
            </Link>
          )}
          {isSeller && (
            <>
              <Link to="/seller/dashboard" className="text-sm font-medium text-white hover:text-primary-on-dark transition-colors">
                My Listings
              </Link>
              <Link to="/seller/submit" className="btn-primary flex items-center gap-1.5 !py-2 !px-4 text-sm">
                <Plus className="h-4 w-4" /> Sell a Car
              </Link>
            </>
          )}
          {isAdmin && (
            <Link to="/admin/dashboard" className="relative text-sm font-medium text-white hover:text-primary-on-dark transition-colors flex items-center gap-1">
              <Shield className="h-4 w-4" /> Admin
              {newInquiryCount > 0 && (
                <span className="absolute -right-3 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-primary-accent px-1 text-[10px] font-bold text-white">
                  {newInquiryCount}
                </span>
              )}
            </Link>
          )}
        </nav>

        {/* Desktop User Area */}
        <div className="hidden items-center gap-4 lg:flex">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-lg bg-primary-blue/50 px-3 py-2 text-sm font-medium text-white hover:bg-primary-blue transition-colors"
              >
                <User className="h-4 w-4" />
                {user.name}
                <ChevronDown className={`h-4 w-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-surface-light py-2 shadow-xl ring-1 ring-black/5">
                  <div className="border-b px-4 py-2">
                    <p className="text-xs text-secondary-muted">{user.role}</p>
                  </div>
                  {isSeller && (
                    <Link
                      to="/seller/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-surface-card"
                    >
                      <LayoutDashboard className="h-4 w-4" /> My Listings
                    </Link>
                  )}
                  <Link
                    to="/favorites"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-surface-card"
                  >
                    <Heart className="h-4 w-4" /> Favorites
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-surface-card"
                    >
                      <Shield className="h-4 w-4" /> Admin Panel
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      to="/admin/inquiries"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-surface-card"
                    >
                      <MessageSquare className="h-4 w-4" /> Inquiries
                      {newInquiryCount > 0 && (
                        <span className="ml-auto rounded-full bg-primary-accent px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {newInquiryCount}
                        </span>
                      )}
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-status-error hover:bg-surface-card"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-white hover:text-primary-on-dark transition-colors">
                Login
              </Link>
              <Link to="/register" className="btn-primary !py-2 !px-4 text-sm">
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white lg:hidden"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-primary-header px-4 pb-4 lg:hidden">
          <nav className="flex flex-col gap-2 pt-2">
            <Link to="/" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-white hover:bg-primary-blue/50">
              Browse Cars
            </Link>
            {isAuthenticated && !isSeller && (
              <Link to="/seller/dashboard" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-primary-on-dark hover:bg-primary-blue/50">
                Become a Seller
              </Link>
            )}
            {isSeller && (
              <>
                <Link to="/seller/dashboard" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-white hover:bg-primary-blue/50">
                  My Listings
                </Link>
                <Link to="/seller/submit" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-primary-on-dark hover:bg-primary-blue/50">
                  + Sell a Car
                </Link>
              </>
            )}
            {isAdmin && (
              <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-white hover:bg-primary-blue/50">
                Admin Panel
              </Link>
            )}
            {isAuthenticated ? (
              <button onClick={handleLogout} className="rounded-lg px-3 py-2 text-left text-sm font-medium text-status-error hover:bg-primary-blue/50">
                Logout ({user.name})
              </button>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-white hover:bg-primary-blue/50">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary text-center text-sm">
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
