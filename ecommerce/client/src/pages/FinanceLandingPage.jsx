import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SERVICES, { SERVICE_CATEGORIES } from '../data/services';
import ApplyNowModal from '../components/ui/ApplyNowModal';
import {
  ArrowRight, ChevronRight, ChevronDown, ChevronUp, CheckCircle,
  DollarSign, ShieldCheck, Clock, Banknote, Calculator,
} from 'lucide-react';

const FINANCE_SERVICES = SERVICE_CATEGORIES['Finance'] || [];

const WHY_CHOOSE = [
  { icon: Clock, title: 'Quick Loan Processing', text: 'Experience a fast and hassle-free process. Get your loan approved in as little as 1–3 business days.' },
  { icon: DollarSign, title: 'Competitive Interest Rates', text: 'We partner with multiple banks and lenders to offer you the lowest rates available in the market.' },
  { icon: Banknote, title: 'Multiple Partner Options', text: 'Choose from our network of trusted financing partners to find the terms that suit your needs.' },
  { icon: ShieldCheck, title: 'Up to 70% Vehicle Value', text: 'Borrow up to 70% of your vehicle\'s appraised value — quick and substantial funds when you need them.' },
];

const HOW_IT_WORKS = [
  { title: 'Initial Application', text: 'Fill out our online application form and receive a call from our officer within 24 hours.' },
  { title: 'Submit Requirements', text: 'Provide the required documents — our team will guide you on what\'s needed.' },
  { title: 'Credit Check & Review', text: 'Our financing partners evaluate your application and perform due diligence.' },
  { title: 'Approval & Disbursement', text: 'Once approved, funds are released to your account within 1–5 business days.' },
];

const ELIGIBILITY = {
  borrower: [
    'Filipino citizen',
    '21–65 years old',
    'With documented source of income',
  ],
  coBorrower: [
    'Immediate family (parents, siblings)',
    '21–65 years old',
    'With documented source of income',
  ],
  employed: [
    '2 valid government-issued IDs',
    'Copy of vehicle OR/CR',
    'Proof of income (3 months payslip, COE, or bank statement)',
    'Proof of residency (electric or water bill)',
  ],
  business: [
    '2 valid government-issued IDs',
    'Copy of vehicle OR/CR',
    'Proof of income (3 months)',
    'Proof of residency',
    'Business papers (DTI, Business Permit, SEC, GIS, AFS)',
  ],
};

const TESTIMONIALS = [
  { name: 'Maria Santos', vehicle: 'Honda City', text: 'I got the funds I needed fast, and I can still use my car. Great service!' },
  { name: 'Juan Dela Cruz', vehicle: 'Toyota Vios', text: 'Very smooth process. The officers were helpful and the rates were competitive.' },
  { name: 'Ana Reyes', vehicle: 'Mitsubishi Montero', text: 'Quick approval and the funds were in my account within 3 days. Highly recommended!' },
];

const FAQS = [
  { q: 'What is Sangla OR/CR?', a: 'It is a type of loan where a vehicle is used as collateral to secure financing. The lender holds the vehicle\'s OR/CR as security until the loan is fully repaid. You continue using your car as usual.' },
  { q: 'How much of my car\'s value can I borrow against?', a: 'You can typically borrow up to 50–70% of your vehicle\'s appraised market value, depending on the financing partner and the condition of your vehicle.' },
  { q: 'What documents do I need to apply?', a: 'You\'ll need 2 valid IDs, copy of your vehicle OR/CR, proof of income for the last 3 months, and proof of residency. Business owners will also need business registration documents.' },
  { q: 'How long does it take to receive loan approval?', a: 'Most applications are processed within 1–3 business days. Funds are typically released within 1–5 days after approval.' },
  { q: 'Can I still use my vehicle while it\'s used as collateral?', a: 'Yes! You keep driving your vehicle as usual. Only the documents (OR/CR) are held by the lender until the loan is fully repaid.' },
];

export default function FinanceLandingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalService, setModalService] = useState('used-car-finance');
  const [openFaq, setOpenFaq] = useState(null);

  // EMI Calculator state
  const [loanAmount, setLoanAmount] = useState(400000);
  const [interestRate, setInterestRate] = useState(1.35);
  const [tenure, setTenure] = useState(36);

  const emi = useMemo(() => {
    const monthlyRate = interestRate / 100;
    const totalInterest = loanAmount * monthlyRate * tenure;
    const totalAmount = loanAmount + totalInterest;
    const monthlyEmi = totalAmount / tenure;
    return { monthly: monthlyEmi, interest: totalInterest, total: totalAmount };
  }, [loanAmount, interestRate, tenure]);

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
              Finance Services
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight text-white lg:text-5xl">
              Get Quick Cash With<br />Your Vehicle — Keep Driving It
            </h1>
            <p className="mt-4 max-w-xl text-base text-gray-300 lg:text-lg">
              Get up to 70% value of your car. Quick and hassle-free process — get your loan in just 5 days.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <button
                onClick={() => openModal('used-car-finance')}
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
          <div className="hidden lg:flex items-center justify-center">
            <div className="flex h-44 w-44 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-sm shadow-xl">
              <DollarSign className="h-20 w-20 text-primary-on-dark" />
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
            <span className="text-primary-accent font-medium">Finance</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 lg:py-14 space-y-14">
        {/* Why Choose Us */}
        <section>
          <h2 className="text-center text-2xl font-bold text-gray-900">Why Choose Us?</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_CHOOSE.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl border border-gray-100 bg-surface-light p-6 text-center shadow-sm transition hover:shadow-md hover:border-primary-accent/30">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-accent/10">
                    <Icon className="h-7 w-7 text-primary-accent" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-secondary-muted">{item.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* EMI Calculator */}
        <section className="rounded-2xl border border-gray-100 bg-surface-light p-6 shadow-sm lg:p-10">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Calculator className="h-6 w-6 text-primary-accent" /> Calculate Your EMI
          </h2>
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            {/* Sliders */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">Loan Amount</span>
                  <span className="font-bold text-primary-accent">₱ {loanAmount.toLocaleString()}</span>
                </div>
                <input
                  type="range" min={100000} max={5000000} step={50000}
                  value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="mt-2 w-full accent-primary-accent"
                />
                <div className="flex justify-between text-xs text-secondary-muted">
                  <span>₱100,000</span><span>₱5,000,000</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">Interest Rate (Monthly)</span>
                  <span className="font-bold text-primary-accent">{interestRate}%</span>
                </div>
                <input
                  type="range" min={1} max={2} step={0.05}
                  value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="mt-2 w-full accent-primary-accent"
                />
                <div className="flex justify-between text-xs text-secondary-muted">
                  <span>1.00%</span><span>2.00%</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">Loan Tenure (Months)</span>
                  <span className="font-bold text-primary-accent">{tenure} Mo</span>
                </div>
                <input
                  type="range" min={12} max={48} step={6}
                  value={tenure} onChange={(e) => setTenure(Number(e.target.value))}
                  className="mt-2 w-full accent-primary-accent"
                />
                <div className="flex justify-between text-xs text-secondary-muted">
                  <span>12 Mo</span><span>48 Mo</span>
                </div>
              </div>
            </div>

            {/* EMI Results */}
            <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-primary-blue to-primary-header p-8 text-center text-white">
              <p className="text-sm text-gray-300">Estimated Monthly EMI</p>
              <p className="mt-1 text-4xl font-extrabold">₱ {Math.round(emi.monthly).toLocaleString()}</p>
              <div className="mt-6 grid w-full grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-gray-300">Interest You Pay</p>
                  <p className="mt-1 font-bold text-primary-on-dark">₱ {Math.round(emi.interest).toLocaleString()}</p>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-gray-300">Total Amount</p>
                  <p className="mt-1 font-bold text-primary-on-dark">₱ {Math.round(emi.total).toLocaleString()}</p>
                </div>
              </div>
              <button
                onClick={() => openModal('used-car-finance')}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-accent px-6 py-3 font-semibold text-white shadow transition hover:bg-red-700"
              >
                Apply Now <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="rounded-2xl border border-gray-100 bg-surface-light p-6 shadow-sm lg:p-10">
          <h2 className="text-2xl font-bold text-gray-900">How It Works</h2>
          <div className="mt-8 space-y-0">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.title} className="relative flex gap-4 pb-8 last:pb-0">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="absolute left-5 top-10 h-full w-0.5 bg-gray-200" />
                )}
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
        </section>

        {/* Testimonials */}
        <section>
          <h2 className="text-center text-2xl font-bold text-gray-900">What Our Customers Say</h2>
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
                    <p className="text-xs text-secondary-muted">{t.vehicle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Eligibility & Documents */}
        <section className="rounded-2xl border border-gray-100 bg-surface-light p-6 shadow-sm lg:p-10">
          <h2 className="text-2xl font-bold text-gray-900">Eligibility &amp; Documents Required</h2>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* Eligibility */}
            <div className="rounded-xl border border-gray-100 bg-surface-card p-6">
              <h3 className="text-lg font-bold text-gray-900">Loan Eligibility 👍</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Primary Borrower</p>
                  <ul className="mt-2 space-y-1">
                    {ELIGIBILITY.borrower.map((r) => (
                      <li key={r} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-accent" />{r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Co-Borrower</p>
                  <ul className="mt-2 space-y-1">
                    {ELIGIBILITY.coBorrower.map((r) => (
                      <li key={r} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-accent" />{r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            {/* Documents */}
            <div className="rounded-xl border border-gray-100 bg-surface-card p-6">
              <h3 className="text-lg font-bold text-gray-900">Documents Required 📃</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Employed</p>
                  <ul className="mt-2 space-y-1">
                    {ELIGIBILITY.employed.map((r) => (
                      <li key={r} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-accent" />{r}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Business Owner</p>
                  <ul className="mt-2 space-y-1">
                    {ELIGIBILITY.business.map((r) => (
                      <li key={r} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-accent" />{r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Finance Services Cards */}
        <section>
          <h2 className="text-center text-2xl font-bold text-gray-900">Our Finance Services</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {FINANCE_SERVICES.map((svc) => {
              const SvcIcon = svc.icon;
              return (
                <div key={svc.slug} className="group rounded-2xl border border-gray-100 bg-surface-light p-6 shadow-sm transition hover:shadow-md hover:border-primary-accent/30">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-accent/10">
                    <SvcIcon className="h-6 w-6 text-primary-accent" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{svc.title}</h3>
                  <p className="mt-2 text-sm text-secondary-muted">{svc.description}</p>
                  <Link
                    to={`/services/${svc.slug}`}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-accent hover:underline"
                  >
                    Learn More <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* FAQ */}
        <section className="rounded-2xl border border-gray-100 bg-surface-light p-6 shadow-sm lg:p-10">
          <h2 className="text-2xl font-bold text-gray-900">Got Questions?</h2>
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
            <h2 className="text-2xl font-bold text-white">Ready to Get Started?</h2>
            <p className="mt-2 text-gray-300">Apply now and our team will get back to you within 24 hours.</p>
          </div>
          <button
            onClick={() => openModal('used-car-finance')}
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
