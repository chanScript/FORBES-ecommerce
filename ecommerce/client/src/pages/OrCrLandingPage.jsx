import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SERVICE_CATEGORIES } from '../data/services';
import ApplyNowModal from '../components/ui/ApplyNowModal';
import {
  ArrowRight, ChevronRight, ChevronDown, ChevronUp,
  Clock, ShieldCheck, FileText, DollarSign, RefreshCw, ArrowRightLeft,
} from 'lucide-react';

const ORCR_SERVICES = SERVICE_CATEGORIES['OR/CR Services'] || [];

const TABS = [
  { key: 'title-transfer', label: 'Title Transfer' },
  { key: 'or-cr-renewal', label: 'OR/CR Renewal' },
];

const BENEFITS = {
  'title-transfer': [
    { icon: ShieldCheck, title: 'Expert Handling', text: 'Our team knows the LTO process inside out — no mistakes, no delays.' },
    { icon: FileText, title: 'Complete Service', text: 'From deed of sale to new OR/CR — we handle every step of the transfer process.' },
    { icon: Clock, title: 'Avoid Penalties', text: 'Timely processing to avoid late transfer penalties and LTO surcharges.' },
    { icon: DollarSign, title: 'Transparent Pricing', text: 'Fixed service fee with no hidden charges — the price you\'re quoted is the price you pay.' },
  ],
  'or-cr-renewal': [
    { icon: Clock, title: 'Quick & Easy Renewal', text: 'Experience a quick renewal process — proven record of same-day processing within Metro Manila.' },
    { icon: DollarSign, title: 'No Hidden Fees', text: 'The price you\'re quoted is the price you pay — straightforward and transparent service.' },
    { icon: ShieldCheck, title: 'Hassle-Free Process', text: 'Minimal paperwork and quick processing — our service is designed to be straightforward.' },
    { icon: FileText, title: 'Starts at ₱6,500', text: 'Get premium service at the best rates in the market. Prices may vary based on case complexity.' },
  ],
};

const FAQS = [
  { q: 'What are the required documents?', a: 'The requirements may vary per case. Our team will advise on the specific set of documents required for your transfer or renewal after initial assessment.' },
  { q: 'How long does it take to process a vehicle title transfer?', a: 'Processing time varies depending on the LTO office and completeness of documents. Typically, it takes 3–10 business days. Our team handles everything to ensure the fastest turnaround.' },
  { q: 'What is OR/CR renewal and why is it necessary?', a: 'OR/CR renewal is the annual registration of your vehicle with the LTO. It\'s required by law to keep your vehicle road-legal. Driving with expired registration may result in fines and impoundment.' },
  { q: 'Can you handle title transfers for vehicles from other provinces?', a: 'Yes! We can process title transfers regardless of the original LTO office of registration, though processing times may vary for inter-regional transfers.' },
];

export default function OrCrLandingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalService, setModalService] = useState('or-cr-renewal');
  const [activeTab, setActiveTab] = useState('or-cr-renewal');
  const [openFaq, setOpenFaq] = useState(null);

  const openModal = (slug) => {
    setModalService(slug);
    setModalOpen(true);
  };

  const activeBenefits = BENEFITS[activeTab] || BENEFITS['or-cr-renewal'];

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-blue to-primary-header">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(245,197,24,0.08),transparent_60%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-16 text-center lg:flex-row lg:py-24 lg:text-left">
          <div className="flex-1">
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-on-dark">
              OR/CR Services
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight text-white lg:text-5xl">
              Skip the Hassle of<br />LTO Lines &amp; Delays
            </h1>
            <p className="mt-4 max-w-xl text-base text-gray-300 lg:text-lg">
              Save your time with our Title Transfer &amp; OR/CR Renewal assistance. We handle the paperwork so you don't have to.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <button
                onClick={() => openModal('title-transfer')}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-accent px-7 py-3 font-semibold text-white shadow-lg transition hover:bg-red-700"
              >
                <ArrowRightLeft className="h-5 w-5" /> Apply for Title Transfer
              </button>
              <button
                onClick={() => openModal('or-cr-renewal')}
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-7 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                <RefreshCw className="h-5 w-5" /> Apply for OR/CR Renewal
              </button>
            </div>
          </div>
          <div className="hidden lg:flex items-center justify-center">
            <div className="flex h-44 w-44 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-sm shadow-xl">
              <FileText className="h-20 w-20 text-primary-on-dark" />
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
            <span className="text-primary-accent font-medium">OR/CR Services</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 lg:py-14 space-y-14">
        {/* Key Benefits with Tab Switcher */}
        <section>
          <h2 className="text-center text-2xl font-bold text-gray-900">Our Key Benefits</h2>
          <div className="mt-6 flex justify-center">
            <div className="inline-flex rounded-xl border border-gray-200 bg-surface-card p-1">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-lg px-5 py-2.5 text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-primary-accent text-white shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {activeBenefits.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl border border-gray-100 bg-surface-light p-6 text-center shadow-sm transition hover:shadow-md hover:border-primary-accent/30">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-status-success/10">
                    <Icon className="h-7 w-7 text-status-success" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-secondary-muted">{item.text}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => openModal(activeTab)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-accent px-7 py-3 font-semibold text-white shadow-lg transition hover:bg-red-700"
            >
              Apply for {activeTab === 'title-transfer' ? 'Title Transfer' : 'OR/CR Renewal'} <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </section>

        {/* How It Works — Steps */}
        <section className="rounded-2xl border border-gray-100 bg-surface-light p-6 shadow-sm lg:p-10">
          <h2 className="text-2xl font-bold text-gray-900">How It Works</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            {ORCR_SERVICES.map((svc) => {
              const SvcIcon = svc.icon;
              return (
                <div key={svc.slug} className="rounded-xl border border-gray-100 bg-surface-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-accent/10">
                      <SvcIcon className="h-5 w-5 text-primary-accent" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{svc.title}</h3>
                  </div>
                  <div className="space-y-0">
                    {svc.steps.map((step, i) => (
                      <div key={step.title} className="relative flex gap-3 pb-6 last:pb-0">
                        {i < svc.steps.length - 1 && (
                          <div className="absolute left-4 top-8 h-full w-0.5 bg-gray-200" />
                        )}
                        <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-accent text-xs font-bold text-white">
                          {i + 1}
                        </div>
                        <div className="pt-0.5">
                          <h4 className="text-sm font-semibold text-gray-900">{step.title}</h4>
                          <p className="mt-0.5 text-xs text-secondary-muted">{step.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Requirements */}
        <section>
          <h2 className="text-center text-2xl font-bold text-gray-900">Requirements</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {ORCR_SERVICES.map((svc) => (
              <div key={svc.slug} className="rounded-2xl border border-gray-100 bg-surface-light p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900">{svc.title}</h3>
                <ul className="mt-4 space-y-2">
                  {svc.requirements.map((req) => (
                    <li key={req} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-accent" />
                      {req}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => openModal(svc.slug)}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-accent hover:underline"
                >
                  Apply Now <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
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
            <h2 className="text-2xl font-bold text-white">Save Your Time Today</h2>
            <p className="mt-2 text-gray-300">Skip the trouble of long lines and delays. Let us handle your OR/CR needs.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => openModal('title-transfer')}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary-accent px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-red-700"
            >
              Title Transfer
            </button>
            <button
              onClick={() => openModal('or-cr-renewal')}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              OR/CR Renewal
            </button>
          </div>
        </div>
      </section>

      <ApplyNowModal isOpen={modalOpen} onClose={() => setModalOpen(false)} serviceType={modalService} />
    </>
  );
}
