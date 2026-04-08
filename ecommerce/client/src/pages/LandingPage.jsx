import { Link } from 'react-router-dom';
import { SERVICE_CATEGORIES } from '../data/services';
import {
  ArrowRight, Shield, CreditCard, RefreshCw, Handshake, Car, Home,
  ChevronRight, CheckCircle,
} from 'lucide-react';

const CATEGORY_ICONS = {
  Insurance: Shield,
  Finance: CreditCard,
  'OR/CR Services': RefreshCw,
  'Partner With Us': Handshake,
};

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-blue to-primary-header">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(245,197,24,0.1),transparent_50%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 lg:py-28">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-on-dark">
              Your Trusted Marketplace
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight text-white lg:text-5xl">
              Buy, Sell &amp; Protect
              <span className="block text-primary-on-dark">All in One Place</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-gray-300">
              Browse vehicles and properties, get insured, apply for financing, and handle your OR/CR services — all from a single platform.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/browse"
                className="inline-flex items-center gap-2 rounded-lg bg-primary-accent px-7 py-3.5 font-semibold text-white shadow-lg transition hover:bg-red-700"
              >
                Browse Marketplace <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/sell"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-7 py-3.5 font-semibold text-white transition hover:bg-white/10"
              >
                Sell Your Listing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Marketplace Cards */}
      <section className="mx-auto max-w-6xl px-4 py-14 lg:py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 lg:text-3xl">Explore the Marketplace</h2>
          <p className="mt-3 text-secondary-muted">Find quality vehicles and properties with ease.</p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {/* Vehicle Card */}
          <Link
            to="/marketplace/vehicle"
            className="group relative flex flex-col items-center rounded-2xl border border-gray-100 bg-surface-light p-8 shadow-sm transition-all hover:shadow-lg hover:border-primary-accent/30"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-accent/10 text-primary-accent transition group-hover:bg-primary-accent group-hover:text-white">
              <Car className="h-8 w-8" />
            </div>
            <h3 className="mt-5 text-xl font-bold text-gray-900">Vehicles</h3>
            <p className="mt-2 text-center text-sm text-secondary-muted">
              Browse cars, motorcycles, trucks and more from trusted sellers.
            </p>
            <span className="mt-4 flex items-center gap-1 text-sm font-medium text-primary-accent">
              Browse Vehicles <ChevronRight className="h-4 w-4" />
            </span>
          </Link>

          {/* Property Card */}
          <Link
            to="/browse?category=RealEstate"
            className="group relative flex flex-col items-center rounded-2xl border border-gray-100 bg-surface-light p-8 shadow-sm transition-all hover:shadow-lg hover:border-primary-accent/30"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-blue/10 text-primary-blue transition group-hover:bg-primary-blue group-hover:text-white">
              <Home className="h-8 w-8" />
            </div>
            <h3 className="mt-5 text-xl font-bold text-gray-900">Properties</h3>
            <p className="mt-2 text-center text-sm text-secondary-muted">
              Find houses, lots, and commercial properties across the Philippines.
            </p>
            <span className="mt-4 flex items-center gap-1 text-sm font-medium text-primary-blue">
              Browse Properties <ChevronRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </section>

      {/* Services Overview */}
      <section className="bg-surface-card">
        <div className="mx-auto max-w-6xl px-4 py-14 lg:py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 lg:text-3xl">Our Services</h2>
            <p className="mt-3 text-secondary-muted">
              From insurance to financing — everything you need in one platform.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(SERVICE_CATEGORIES).map(([category, services]) => {
              const CatIcon = CATEGORY_ICONS[category] || Shield;
              return (
                <div
                  key={category}
                  className="rounded-2xl border border-gray-100 bg-surface-light p-6 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-accent/10 text-primary-accent">
                    <CatIcon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{category}</h3>
                  <ul className="mt-3 space-y-2">
                    {services.map((s) => (
                      <li key={s.slug}>
                        <Link
                          to={`/services/${s.slug}`}
                          className="flex items-center gap-2 text-sm text-secondary-muted hover:text-primary-accent transition-colors"
                        >
                          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                          {s.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="mx-auto max-w-6xl px-4 py-14 lg:py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 lg:text-3xl">Why Choose Us</h2>
          <p className="mt-3 text-secondary-muted">A reliable platform backed by trusted partners.</p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: 'Trusted Partners', text: 'We work with verified dealers, insurers, and lending institutions.' },
            { title: 'Transparent Pricing', text: 'No hidden fees — the price you see is the price you pay.' },
            { title: 'Fast & Easy Process', text: 'Simple online applications with quick processing turnarounds.' },
            { title: 'Nationwide Coverage', text: 'Services available across the Philippines.' },
            { title: 'Customer Support', text: 'Dedicated support team ready to help you every step of the way.' },
            { title: 'Secure Transactions', text: 'Your data and payments are protected with industry-standard security.' },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-surface-light p-5 shadow-sm">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-status-success/10">
                <CheckCircle className="h-4 w-4 text-status-success" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-1 text-sm text-secondary-muted">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-primary-blue to-primary-header">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-14 text-center lg:flex-row lg:text-left">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white lg:text-3xl">Ready to Get Started?</h2>
            <p className="mt-3 text-gray-300">
              Create an account and explore everything our platform has to offer.
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-primary-accent px-7 py-3 font-semibold text-white shadow-lg transition hover:bg-red-700"
            >
              Create Account
            </Link>
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-7 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Browse Listings
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
