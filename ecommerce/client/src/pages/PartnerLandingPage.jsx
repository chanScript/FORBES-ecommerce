import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SERVICE_CATEGORIES } from '../data/services';
import ApplyNowModal from '../components/ui/ApplyNowModal';
import {
  ArrowRight, ChevronRight, ChevronDown, ChevronUp,
  Handshake, CreditCard, RefreshCw, ArrowRightLeft, Shield, Package,
  Users, TrendingUp, HeadphonesIcon, Award, BarChart3, Globe,
  Phone, Mail, MapPin,
} from 'lucide-react';

const PARTNER_SERVICES = SERVICE_CATEGORIES['Partner With Us'] || [];

const PRODUCTS = [
  { icon: CreditCard, title: 'Used Car Financing', text: 'Providing financing options helps customers afford their dream cars, making it easier for them to purchase while increasing your sales volume.' },
  { icon: RefreshCw, title: 'Refinancing', text: 'Allow customers to unlock cash quickly while keeping their vehicle, providing financial flexibility when they need it most.' },
  { icon: ArrowRightLeft, title: 'Title Transfer', text: 'Streamline the title transfer process for smooth transactions that encourage customer referrals.' },
  { icon: RefreshCw, title: 'OR/CR Renewal', text: 'Assist with OR/CR renewals to ensure compliance and demonstrate your commitment to customer needs.' },
  { icon: Shield, title: 'Car Insurance', text: 'Offer comprehensive coverage by choosing from our partner insurance providers, adding value and peace of mind.' },
  { icon: Package, title: 'Inventory Funding', text: 'Access funding to maintain a diverse vehicle selection, attracting more buyers and boosting sales potential.' },
];

const BENEFITS = [
  { icon: Globe, title: 'Access to Our Services', text: 'Partner dealers gain access to our comprehensive suite of services, including financing, insurance, documentation support and more.' },
  { icon: HeadphonesIcon, title: 'Hassle-Free Loan Processing', text: 'Enjoy a smoother loan experience with a dedicated Sales Officer guiding you through every step, ensuring a seamless process.' },
  { icon: TrendingUp, title: 'Higher Approval Rates', text: 'With over 10 trusted financing partners, you and your customers benefit from more choices and better chances of securing loan approval.' },
  { icon: Award, title: 'Attractive Dealer Incentives', text: 'Earn more with our Dealer Loyalty Rewards, offering monthly, quarterly, and annual bonuses — plus the chance to win exciting trips!' },
  { icon: Users, title: 'Dedicated Relationship Manager', text: 'Our team is always available to assist you, providing prompt help and support from your dedicated relationship manager.' },
  { icon: Globe, title: 'Maximize Inventory Exposure', text: 'Get your vehicles in front of more buyers effortlessly! List on our marketplace, showcase your inventory, and drive more sales.' },
  { icon: BarChart3, title: 'Receive Quality Leads', text: 'We connect you with serious buyers actively searching for vehicles, ensuring genuine interest and higher conversion rates.' },
  { icon: Package, title: 'Lead Management System', text: 'Our platform streamlines the process, allowing you to view, organize, and follow up on potential buyers efficiently.' },
];

const TESTIMONIALS = [
  { name: 'AutoMax Motors', location: 'Makati', text: 'The partnership has been transformative for our dealership. The leads we receive are high quality and the support is outstanding.' },
  { name: 'Prime Auto Hub', location: 'Quezon City', text: 'Thanks to the financing options, our sales have increased by 40%. The dedicated relationship manager makes everything seamless.' },
  { name: 'Metro Car Gallery', location: 'Las Piñas', text: 'Unmatched support and quality leads made a huge impact on our dealership\'s success. Highly recommend partnering up.' },
];

const CONTACT = [
  { icon: Phone, label: 'Phone', value: '+63 917 XXX XXXX', href: 'tel:+639170000000' },
  { icon: Mail, label: 'Email', value: 'support@ecommerce.com', href: 'mailto:support@ecommerce.com' },
  { icon: MapPin, label: 'Address', value: 'Metro Manila, Philippines', href: null },
];

const FAQS = [
  { q: 'What are the benefits of partnering as a dealer?', a: 'As a partner dealer, you\'ll enjoy hassle-free loan processing with a dedicated Sales Officer, higher approval rates through our network of financing partners, and attractive dealer incentives including bonuses and rewards.' },
  { q: 'How does the loan processing assistance work?', a: 'Once you refer a customer needing financing, our dedicated Sales Officer handles the entire loan process — from document collection to bank coordination — so you can focus on closing the deal.' },
  { q: 'What kind of incentives can dealers earn?', a: 'We offer monthly, quarterly, and annual performance bonuses. Top-performing dealers can earn up to significant rewards and even qualify for exclusive trips and experiences.' },
  { q: 'What products and services do you offer to Partner Dealers?', a: 'We offer used car financing, refinancing (Sangla OR/CR), title transfer assistance, OR/CR renewal, car insurance from multiple providers, and inventory funding to help you stock more vehicles.' },
  { q: 'How can partnering improve my loan approval rates?', a: 'We work with over 10 trusted financing partners, giving your customers access to multiple lenders. More options mean better chances of approval, even for customers with varying credit profiles.' },
];

export default function PartnerLandingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalService, setModalService] = useState('partner-dealer');
  const [openFaq, setOpenFaq] = useState(null);

  const openModal = (slug) => {
    setModalService(slug);
    setModalOpen(true);
  };

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-blue to-primary-header">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(245,197,24,0.08),transparent_60%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-16 text-center lg:flex-row lg:py-24 lg:text-left">
          <div className="flex-1">
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-on-dark">
              Partner With Us
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight text-white lg:text-5xl">
              Become a Partner &amp;<br />Grow Your Business
            </h1>
            <p className="mt-4 max-w-xl text-base text-gray-300 lg:text-lg">
              Accelerate your business growth. Access our suite of services and reach thousands of potential buyers on our marketplace.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <button
                onClick={() => openModal('partner-dealer')}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-accent px-7 py-3 font-semibold text-white shadow-lg transition hover:bg-red-700"
              >
                Apply Now <ArrowRight className="h-5 w-5" />
              </button>
              <a
                href="#benefits"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-7 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Learn More
              </a>
            </div>
          </div>
          <div className="hidden lg:flex items-center justify-center">
            <div className="flex h-44 w-44 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-sm shadow-xl">
              <Handshake className="h-20 w-20 text-primary-on-dark" />
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="border-b bg-surface-card">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <nav className="flex items-center gap-1.5 text-xs text-secondary-muted">
            <Link to="/" className="hover:text-primary-accent transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary-accent font-medium">Partner With Us</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 lg:py-14 space-y-14">
        {/* Products & Services */}
        <section>
          <h2 className="text-center text-2xl font-bold text-gray-900">Products &amp; Services</h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-secondary-muted">
            As a partner dealer, you open yourself to more possibilities to earn and help more customers achieve their goals.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl border border-gray-100 bg-surface-light p-6 shadow-sm transition hover:shadow-md hover:border-primary-accent/30">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-accent/10">
                    <Icon className="h-6 w-6 text-primary-accent" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-secondary-muted">{item.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Benefits */}
        <section id="benefits">
          <h2 className="text-center text-2xl font-bold text-gray-900">Benefits of Working With Us</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl border border-gray-100 bg-surface-light p-5 shadow-sm transition hover:shadow-md hover:border-primary-accent/30 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-status-success/10">
                    <Icon className="h-6 w-6 text-status-success" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-1.5 text-xs text-secondary-muted">{item.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Testimonials */}
        <section>
          <h2 className="text-center text-2xl font-bold text-gray-900">What Our Partners Say</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-2xl border border-gray-100 bg-surface-light p-6 shadow-sm">
                <p className="text-sm italic text-gray-600">"{t.text}"</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-header text-primary-on-dark font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-secondary-muted">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Get In Touch */}
        <section className="rounded-2xl border border-gray-100 bg-surface-light p-6 shadow-sm lg:p-10">
          <h2 className="text-center text-2xl font-bold text-gray-900">Get In Touch</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {CONTACT.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex flex-col items-center rounded-xl border border-gray-100 bg-surface-card p-6 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-accent/10">
                    <Icon className="h-6 w-6 text-primary-accent" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                  {item.href ? (
                    <a href={item.href} className="mt-1 text-sm text-primary-accent hover:underline">{item.value}</a>
                  ) : (
                    <p className="mt-1 text-sm text-secondary-muted">{item.value}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Partner Type Cards */}
        <section>
          <h2 className="text-center text-2xl font-bold text-gray-900">Partnership Options</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {PARTNER_SERVICES.map((svc) => {
              const SvcIcon = svc.icon;
              return (
                <div key={svc.slug} className="group rounded-2xl border border-gray-100 bg-surface-light p-6 shadow-sm transition hover:shadow-md hover:border-primary-accent/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-accent/10">
                      <SvcIcon className="h-6 w-6 text-primary-accent" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{svc.title}</h3>
                  </div>
                  <p className="text-sm text-secondary-muted">{svc.description}</p>
                  <div className="mt-4 space-y-2">
                    {svc.benefits.map((b) => (
                      <div key={b.title} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-status-success" />
                        <span><strong>{b.title}:</strong> {b.text}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => openModal(svc.slug)}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    Apply Now <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section className="rounded-2xl border border-gray-100 bg-surface-light p-6 shadow-sm lg:p-10">
          <h2 className="text-2xl font-bold text-gray-900">Have Any Questions?</h2>
          <div className="mt-6 divide-y divide-gray-100">
            {FAQS.map((faq, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-gray-900 hover:text-primary-accent transition-colors"
                >
                  {faq.q}
                  {openFaq === i ? <ChevronUp className="h-4 w-4 shrink-0 text-secondary-muted" /> : <ChevronDown className="h-4 w-4 shrink-0 text-secondary-muted" />}
                </button>
                {openFaq === i && (
                  <p className="pb-4 text-sm leading-relaxed text-secondary-muted">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Bottom CTA */}
      <section className="bg-gradient-to-r from-primary-blue to-primary-header">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-12 text-center lg:flex-row lg:text-left">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">Sign Up for Success Today</h2>
            <p className="mt-2 text-gray-300">Become a partner and accelerate your business growth with our platform.</p>
          </div>
          <button
            onClick={() => openModal('partner-dealer')}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary-accent px-8 py-3 font-semibold text-white shadow-lg transition hover:bg-red-700"
          >
            Apply Now <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      <ApplyNowModal isOpen={modalOpen} onClose={() => setModalOpen(false)} serviceType={modalService} />
    </>
  );
}
