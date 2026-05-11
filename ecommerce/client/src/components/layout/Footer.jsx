import { Link } from 'react-router-dom';
import { SERVICE_CATEGORIES } from '../../data/services';

export default function Footer() {
  const mainSiteBase = window.location.hostname === 'localhost'
    ? 'http://localhost:8080'
    : `http://${window.location.hostname}:8080`;

  return (
    <footer className="border-t border-gray-200 bg-surface-card">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <span className="text-lg font-bold text-primary-accent">Ecommerce</span>
            <p className="mt-3 text-sm leading-relaxed text-secondary-muted">
              Your trusted marketplace. Buy and sell quality vehicles and properties with confidence.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-900">Services</h4>
            <ul className="space-y-2 text-sm text-secondary-muted">
              {Object.entries(SERVICE_CATEGORIES).map(([cat, items]) => (
                <li key={cat}>
                  <Link
                    to={`/services/${items[0].slug}`}
                    className="hover:text-primary-accent transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-900">Quick Links</h4>
            <ul className="space-y-2 text-sm text-secondary-muted">
              <li><Link to="/marketplace/vehicle" className="hover:text-primary-accent transition-colors">Browse Vehicles</Link></li>
              <li><Link to="/browse?category=RealEstate" className="hover:text-primary-accent transition-colors">Browse Properties</Link></li>
              <li><Link to="/sell" className="hover:text-primary-accent transition-colors">Sell Your Listing</Link></li>
           
            </ul>
          </div>

          {/* Main Site */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-900">Company</h4>
            <ul className="space-y-2 text-sm text-secondary-muted">
              <li><a href={mainSiteBase} className="hover:text-primary-accent transition-colors">Back to Home</a></li>
              <li><a href={`${mainSiteBase}/about.html`} className="hover:text-primary-accent transition-colors">About Us</a></li>
              <li><a href={`${mainSiteBase}/contact.html`} className="hover:text-primary-accent transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-6 text-center text-xs text-secondary-muted">
          &copy; {new Date().getFullYear()} Ecommerce. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
