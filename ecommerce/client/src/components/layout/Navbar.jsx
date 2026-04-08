import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { inquiriesAPI } from '../../api/inquiries';
import NotificationBell from '../ui/NotificationBell';
import { SERVICE_CATEGORIES } from '../../data/services';
import {
  Menu, X, User, ChevronDown, LogOut, LayoutDashboard, Plus,
  Heart, Shield, Send, MessageSquare, Car, Home,
} from 'lucide-react';

const CATEGORY_LINKS = {
  'Finance': '/services/finance',
  'OR/CR Services': '/services/orcr',
  'Partner With Us': '/services/partner',
};

const NAV_MENUS = [
  ...Object.entries(SERVICE_CATEGORIES).map(([label, items]) => ({
    label,
    categoryLink: CATEGORY_LINKS[label] || null,
    items: items.map((s) => ({ title: s.title, to: `/services/${s.slug}` })),
  })),
  {
    label: 'Marketplace',
    categoryLink: null,
    items: [
      { title: 'Vehicle', to: '/marketplace/vehicle' },
      { title: 'Property', to: '/browse?category=RealEstate' },
    ],
  },
];

export default function Navbar() {
  const { user, isAuthenticated, isSeller, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const navRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenDropdown(null);
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const { data: inquiryCountData } = useQuery({
    queryKey: ['inquiryCount'],
    queryFn: () => inquiriesAPI.adminCount().then((r) => r.data),
    enabled: isAdmin,
    refetchInterval: 30000,
  });

  const newInquiryCount = inquiryCountData?.count || 0;

  const toggleDropdown = (label) => {
    setOpenDropdown((prev) => (prev === label ? null : label));
    setUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-surface-light shadow-sm" ref={navRef}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2" onClick={() => { setOpenDropdown(null); setMobileOpen(false); }}>
          <span className="text-xl font-bold text-primary-accent">Ecommerce</span>
        </Link>

        {/* Desktop Nav — Dropdown Menus */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_MENUS.map((menu) => (
            <div key={menu.label} className="relative">
              <button
                onClick={() => toggleDropdown(menu.label)}
                className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  openDropdown === menu.label
                    ? 'bg-surface-card text-primary-accent'
                    : 'text-gray-700 hover:bg-surface-card hover:text-primary-accent'
                }`}
              >
                {menu.label}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openDropdown === menu.label ? 'rotate-180' : ''}`} />
              </button>

              {openDropdown === menu.label && (
                <div className="absolute left-0 top-full mt-1 min-w-[200px] rounded-lg bg-surface-light py-2 shadow-xl ring-1 ring-black/5">
                  {menu.categoryLink && (
                    <Link
                      to={menu.categoryLink}
                      onClick={() => setOpenDropdown(null)}
                      className="block border-b border-gray-100 px-4 py-2 text-sm font-semibold text-primary-accent hover:bg-surface-card"
                    >
                      View All {menu.label} →
                    </Link>
                  )}
                  {menu.items.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpenDropdown(null)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-surface-card hover:text-primary-accent"
                    >
                      {item.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Seller links */}
          {isSeller && (
            <Link to="/seller/submit" className="btn-primary ml-2 flex items-center gap-1.5 !py-2 !px-4 text-sm">
              <Plus className="h-4 w-4" /> New Listing
            </Link>
          )}

          {/* Admin link + notifications */}
          {isAdmin && (
            <>
              <NotificationBell />
              <Link
                to="/admin/dashboard"
                onClick={() => setOpenDropdown(null)}
                className="ml-1 flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-surface-card hover:text-primary-accent transition-colors"
              >
                <Shield className="h-4 w-4" /> Admin
              </Link>
            </>
          )}
        </nav>

        {/* Desktop User Area */}
        <div className="hidden items-center gap-4 lg:flex">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => { setUserMenuOpen(!userMenuOpen); setOpenDropdown(null); }}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-surface-card px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
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
                    <Link to="/seller/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-surface-card">
                      <LayoutDashboard className="h-4 w-4" /> My Listings
                    </Link>
                  )}
                  <Link to="/favorites" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-surface-card">
                    <Heart className="h-4 w-4" /> Favorites
                  </Link>
                  {isAdmin && (
                    <Link to="/admin/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-surface-card">
                      <Shield className="h-4 w-4" /> Admin Panel
                    </Link>
                  )}
                  {isAdmin && (
                    <Link to="/admin/inquiries" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-surface-card">
                      <MessageSquare className="h-4 w-4" /> Inquiries
                      {newInquiryCount > 0 && (
                        <span className="ml-auto rounded-full bg-primary-accent px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {newInquiryCount}
                        </span>
                      )}
                    </Link>
                  )}
                  <button onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-status-error hover:bg-surface-card">
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-surface-card transition-colors">
              Login
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-gray-700 lg:hidden">
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-gray-200 bg-surface-light px-4 pb-4 lg:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            {/* Service Dropdowns */}
            {NAV_MENUS.map((menu) => (
              <div key={menu.label}>
                <button
                  onClick={() => setMobileExpanded((prev) => (prev === menu.label ? null : menu.label))}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-surface-card"
                >
                  {menu.label}
                  <ChevronDown className={`h-4 w-4 transition-transform ${mobileExpanded === menu.label ? 'rotate-180' : ''}`} />
                </button>
                {mobileExpanded === menu.label && (
                  <div className="ml-4 flex flex-col gap-1 pb-1">
                    {menu.items.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setMobileOpen(false)}
                        className="rounded-lg px-3 py-1.5 text-sm text-secondary-muted hover:bg-surface-card hover:text-primary-accent"
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="my-1 border-t border-gray-200" />

            {/* Seller / Admin / Auth links */}
            {isSeller && (
              <>
                <Link to="/seller/dashboard" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-surface-card">
                  My Listings
                </Link>
                <Link to="/seller/submit" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-primary-accent hover:bg-surface-card">
                  + New Listing
                </Link>
              </>
            )}
            {isAdmin && (
              <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-surface-card">
                Admin Panel
              </Link>
            )}
            {isAuthenticated ? (
              <button onClick={handleLogout} className="rounded-lg px-3 py-2 text-left text-sm font-medium text-status-error hover:bg-surface-card">
                Logout ({user.name})
              </button>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-surface-card">
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
