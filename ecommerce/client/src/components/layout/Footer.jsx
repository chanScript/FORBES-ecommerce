import { Building2 } from 'lucide-react';

export default function Footer() {
  const mainSiteBase = window.location.hostname === 'localhost'
    ? 'http://localhost:8080'
    : `http://${window.location.hostname}:8080`;

  return (
    <footer className="bg-primary-header text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="mb-3 flex items-center gap-2">
           
              <span className="text-lg font-bold text-primary-on-dark">Ecommerce</span>
            </div>
            <p className="text-sm text-gray-400">
              Your trusted marketplace. Buy and sell quality vehicles and properties with confidence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-primary-on-dark">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="/" className="hover:text-white transition-colors">Browse Listings</a></li>
              <li><a href="/sell" className="hover:text-white transition-colors">Sell Your Listing</a></li>
              <li><a href="/register" className="hover:text-white transition-colors">Create Account</a></li>
            </ul>
          </div>

          {/* Back to Main Site */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-primary-on-dark">Main Site</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href={mainSiteBase} className="hover:text-white transition-colors">Back to Home</a></li>
              <li><a href={`${mainSiteBase}/about.html`} className="hover:text-white transition-colors">About Us</a></li>
              <li><a href={`${mainSiteBase}/contact.html`} className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} Ecommerce. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
