import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import SERVICES, { SERVICE_CATEGORIES } from '../data/services';
import ApplyNowModal from '../components/ui/ApplyNowModal';
import {
  CheckCircle, ArrowRight, FileText, ChevronRight, ChevronDown, ChevronUp,
} from 'lucide-react';

export default function ServiceLandingPage() {
  const { slug } = useParams();
  const service = SERVICES[slug];
  const [modalOpen, setModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  if (!service) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <FileText className="mx-auto h-16 w-16 text-gray-300" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Service Not Found</h1>
        <p className="mt-2 text-secondary-muted">The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary mt-6 inline-block">Back to Home</Link>
      </div>
    );
  }

  const Icon = service.icon;

  // Sibling services in the same category (for sidebar / related)
  const siblings = (SERVICE_CATEGORIES[service.category] || []).filter(
    (s) => s.slug !== service.slug,
  );

  // FAQ data derived from service content
  const faqs = [
    { q: `What are the required documents for ${service.title}?`, a: service.requirements.join(', ') + '.' },
    { q: `How long does ${service.title} take?`, a: `The process typically follows ${service.steps.length} steps. Our team will guide you through each stage for the fastest turnaround.` },
    { q: 'Are there any hidden fees?', a: 'No hidden fees. The price you are quoted is the price you pay — straightforward and transparent.' },
  ];

  return (
    <>
      {/* Hero Banner — clean, light gradient */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-blue to-primary-header">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(245,197,24,0.08),transparent_60%)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-14 text-center lg:flex-row lg:py-20 lg:text-left">
          <div className="flex-1">
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-on-dark">
              {service.category}
            </span>
            <h1 className="mt-4 text-3xl font-extrabold text-white lg:text-5xl leading-tight">
              {service.title}
            </h1>
            <p className="mt-4 max-w-xl text-base text-gray-300 lg:text-lg">
              {service.description}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <button
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary-accent px-7 py-3 font-semibold text-white shadow-lg transition hover:bg-red-700"
              >
                Apply Now <ArrowRight className="h-5 w-5" />
              </button>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-7 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Learn More
              </a>
            </div>
          </div>
          {/* Decorative icon card */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="flex h-44 w-44 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-sm shadow-xl">
              <Icon className="h-20 w-20 text-primary-on-dark" />
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
            <span className="text-gray-700 font-medium">{service.category}</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary-accent font-medium">{service.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Content — Two Column Layout */}
      <div className="mx-auto max-w-6xl px-4 py-10 lg:py-14">
        <div className="flex flex-col gap-10 lg:flex-row">

          {/* Left Column — Main content */}
          <div className="flex-1 space-y-10">

            {/* Overview Card */}
            <div className="rounded-2xl border border-gray-100 bg-surface-light p-6 shadow-sm lg:p-8">
              <h2 className="text-xl font-bold text-gray-900">About This Service</h2>
              <p className="mt-4 text-base leading-relaxed text-gray-600">{service.overview}</p>
            </div>

            {/* Benefits Card Grid */}
            <div>
              <h2 className="mb-6 text-xl font-bold text-gray-900">Key Benefits</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {service.benefits.map((b, i) => (
                  <div
                    key={b.title}
                    className="group rounded-2xl border border-gray-100 bg-surface-light p-5 shadow-sm transition-all hover:shadow-md hover:border-primary-accent/30"
                  >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-status-success/10 text-status-success">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{b.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-secondary-muted">{b.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* How It Works — Steps Card */}
            <div id="how-it-works" className="rounded-2xl border border-gray-100 bg-surface-light p-6 shadow-sm lg:p-8">
              <h2 className="text-xl font-bold text-gray-900">How It Works</h2>
              <div className="mt-6 space-y-0">
                {service.steps.map((step, i) => (
                  <div key={step.title} className="relative flex gap-4 pb-8 last:pb-0">
                    {/* Connector line */}
                    {i < service.steps.length - 1 && (
                      <div className="absolute left-5 top-10 h-full w-0.5 bg-gray-200" />
                    )}
                    {/* Step number */}
                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-accent text-sm font-bold text-white shadow">
                      {i + 1}
                    </div>
                    <div className="pt-1.5">
                      <h3 className="font-semibold text-gray-900">{step.title}</h3>
                      <p className="mt-1 text-sm text-secondary-muted">{step.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements Card */}
            <div className="rounded-2xl border border-gray-100 bg-surface-light p-6 shadow-sm lg:p-8">
              <h2 className="text-xl font-bold text-gray-900">Requirements</h2>
              <ul className="mt-5 space-y-3">
                {service.requirements.map((req) => (
                  <li key={req} className="flex items-start gap-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-accent" />
                    <span className="text-sm text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* FAQ Accordion Card */}
            <div className="rounded-2xl border border-gray-100 bg-surface-light p-6 shadow-sm lg:p-8">
              <h2 className="text-xl font-bold text-gray-900">Frequently Asked Questions</h2>
              <div className="mt-5 divide-y divide-gray-100">
                {faqs.map((faq, i) => (
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
            </div>
          </div>

          {/* Right Column — Sidebar */}
          <aside className="w-full space-y-6 lg:w-72 lg:shrink-0">
            {/* Apply CTA Card */}
            <div className="sticky top-20 space-y-6">
              <div className="rounded-2xl border border-primary-accent/20 bg-gradient-to-b from-primary-accent/5 to-surface-light p-6 shadow-sm text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-accent/10">
                  <Icon className="h-7 w-7 text-primary-accent" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Apply for {service.title}</h3>
                <p className="mt-2 text-sm text-secondary-muted">
                  Fill out our quick form and our team will reach out within 24 hours.
                </p>
                <button
                  onClick={() => setModalOpen(true)}
                  className="mt-5 w-full rounded-lg bg-primary-accent px-6 py-3 font-semibold text-white shadow transition hover:bg-red-700"
                >
                  Apply Now
                </button>
              </div>

              {/* Related Services */}
              {siblings.length > 0 && (
                <div className="rounded-2xl border border-gray-100 bg-surface-light p-5 shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-secondary-muted">
                    Other {service.category} Services
                  </h3>
                  <ul className="mt-4 space-y-2">
                    {siblings.map((s) => {
                      const SibIcon = s.icon;
                      return (
                        <li key={s.slug}>
                          <Link
                            to={`/services/${s.slug}`}
                            className="flex items-center gap-3 rounded-lg p-2 text-sm text-gray-700 transition hover:bg-surface-card hover:text-primary-accent"
                          >
                            <SibIcon className="h-4 w-4 shrink-0 text-secondary-muted" />
                            {s.title}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <section className="bg-gradient-to-r from-primary-blue to-primary-header">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-12 text-center lg:flex-row lg:text-left">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">Ready to Get Started?</h2>
            <p className="mt-2 text-gray-300">
              Apply now and our team will get back to you within 24 hours.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary-accent px-8 py-3 font-semibold text-white shadow-lg transition hover:bg-red-700"
          >
            Apply Now <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      <ApplyNowModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        serviceType={service.slug}
      />
    </>
  );
}
