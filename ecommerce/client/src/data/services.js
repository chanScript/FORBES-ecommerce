import {
  Shield, Car, Truck, Bike, FileText, CreditCard, Banknote,
  RefreshCw, ArrowRightLeft, Handshake, Users, DollarSign,
} from 'lucide-react';

/** All service definitions keyed by URL slug. */
const SERVICES = {
  // ──────────────── Insurance ────────────────
  'car-insurance': {
    slug: 'car-insurance',
    title: 'Car Insurance',
    category: 'Insurance',
    icon: Car,
    description: 'Protect your vehicle with comprehensive car insurance coverage at competitive rates.',
    overview:
      'Our car insurance plans give you peace of mind on the road. Whether you need third-party liability or full comprehensive coverage, we partner with the top insurers in the Philippines to find you the best deal.',
    benefits: [
      { title: 'Comprehensive Coverage', text: 'Protection against theft, accidents, natural disasters, and third-party liability.' },
      { title: 'Fast Claims Processing', text: 'Streamlined claims process with quick turnaround for repairs and payouts.' },
      { title: 'Affordable Premiums', text: 'Competitive rates from our network of trusted insurance partners.' },
      { title: 'Hassle-Free Application', text: 'Simple online application — no paperwork, no branch visits required.' },
    ],
    requirements: [
      'Valid government-issued ID',
      'Copy of vehicle OR/CR',
      'Vehicle photos (front, back, sides)',
      'Proof of address',
    ],
    steps: [
      { title: 'Apply Online', text: 'Fill out the application form with your details.' },
      { title: 'Get a Quote', text: 'Receive personalized quotes from our partner insurers.' },
      { title: 'Choose a Plan', text: 'Select the coverage that best fits your needs and budget.' },
      { title: 'Get Covered', text: 'Receive your policy and enjoy peace of mind on the road.' },
    ],
  },
  'truck-insurance': {
    slug: 'truck-insurance',
    title: 'Truck Insurance',
    category: 'Insurance',
    icon: Truck,
    description: 'Comprehensive insurance solutions for commercial trucks and heavy vehicles.',
    overview:
      'Keep your business moving with reliable truck insurance. Our policies cover commercial vehicles of all sizes, from light-duty pickups to heavy freight trucks, ensuring your fleet is always protected.',
    benefits: [
      { title: 'Fleet Coverage', text: 'Flexible plans for single trucks or entire fleets with volume discounts.' },
      { title: 'Cargo Protection', text: 'Optional coverage for goods in transit — protect your shipments.' },
      { title: 'Roadside Assistance', text: '24/7 emergency support for breakdowns anywhere in the country.' },
      { title: 'Trusted Partners', text: 'Work with insurers who understand commercial vehicle needs.' },
    ],
    requirements: [
      'Valid government-issued ID',
      'LTO vehicle registration (OR/CR)',
      'Business permit (for commercial vehicles)',
      'Vehicle photos',
    ],
    steps: [
      { title: 'Submit Application', text: 'Provide your truck and business details.' },
      { title: 'Assessment', text: 'Our team evaluates your vehicle and coverage needs.' },
      { title: 'Custom Quote', text: 'Receive a tailored insurance quote for your fleet.' },
      { title: 'Activate Policy', text: 'Pay and activate your coverage immediately.' },
    ],
  },
  'motorcycle-insurance': {
    slug: 'motorcycle-insurance',
    title: 'Motorcycle Insurance',
    category: 'Insurance',
    icon: Bike,
    description: 'Affordable motorcycle insurance with comprehensive coverage options.',
    overview:
      'Ride with confidence knowing your motorcycle is fully protected. From daily commuters to weekend riders, our insurance plans cover theft, accidents, and third-party damages at budget-friendly rates.',
    benefits: [
      { title: 'Low Premiums', text: 'Motorcycle-specific rates that won\'t break the bank.' },
      { title: 'Theft Protection', text: 'Full coverage against motorcycle theft and attempted theft.' },
      { title: 'Accident Coverage', text: 'Medical and repair costs covered in case of accidents.' },
      { title: 'Quick Enrollment', text: 'Get insured in minutes with our fast online process.' },
    ],
    requirements: [
      'Valid driver\'s license with motorcycle restriction',
      'Vehicle OR/CR',
      'Photo of the motorcycle',
      'Valid ID',
    ],
    steps: [
      { title: 'Apply Online', text: 'Fill out the quick application form.' },
      { title: 'Instant Quote', text: 'Get a quote in minutes based on your motorcycle details.' },
      { title: 'Choose Coverage', text: 'Pick comprehensive or basic coverage.' },
      { title: 'Ride Protected', text: 'Your policy is active — ride with peace of mind.' },
    ],
  },
  'ctpl-insurance': {
    slug: 'ctpl-insurance',
    title: 'CTPL Insurance',
    category: 'Insurance',
    icon: Shield,
    description: 'Compulsory Third-Party Liability insurance — required by law for all motor vehicles.',
    overview:
      'CTPL (Compulsory Third-Party Liability) insurance is mandatory for all registered vehicles in the Philippines. It covers bodily injury and death of third parties in case of motor vehicle accidents. We make renewal fast and hassle-free.',
    benefits: [
      { title: 'Legal Compliance', text: 'Meet LTO requirements for vehicle registration and renewal.' },
      { title: 'Instant Issuance', text: 'Receive your CTPL certificate immediately after payment.' },
      { title: 'Affordable Rates', text: 'Government-regulated premiums — no hidden charges.' },
      { title: 'Wide Acceptance', text: 'Accepted at all LTO offices nationwide.' },
    ],
    requirements: [
      'Vehicle OR/CR (current or expired)',
      'Valid government-issued ID',
    ],
    steps: [
      { title: 'Submit Details', text: 'Provide your vehicle registration information.' },
      { title: 'Pay Premium', text: 'Pay the regulated CTPL premium.' },
      { title: 'Get Certificate', text: 'Receive your CTPL insurance certificate instantly.' },
      { title: 'Register Vehicle', text: 'Use the certificate for your LTO registration.' },
    ],
  },
  'three-wheeler-insurance': {
    slug: 'three-wheeler-insurance',
    title: 'Three-Wheeler Insurance',
    category: 'Insurance',
    icon: Car,
    description: 'Specialized insurance for tricycles, trikes, and three-wheeled vehicles.',
    overview:
      'Tricycles and three-wheelers are the backbone of local transportation. Our insurance plans are designed specifically for these vehicles, offering affordable and reliable protection for operators and passengers alike.',
    benefits: [
      { title: 'Operator-Friendly', text: 'Designed for the unique needs of tricycle operators and owners.' },
      { title: 'Passenger Coverage', text: 'Includes protection for passengers riding in your vehicle.' },
      { title: 'Budget-Friendly', text: 'Low premiums that fit the budget of daily operators.' },
      { title: 'Fast Processing', text: 'Quick application and claims — no long waiting periods.' },
    ],
    requirements: [
      'Franchise permit or motorized tricycle operator\'s permit (MTOP)',
      'Vehicle OR/CR',
      'Valid government-issued ID',
      'Barangay clearance (if applicable)',
    ],
    steps: [
      { title: 'Apply', text: 'Submit your vehicle and operator details.' },
      { title: 'Get a Quote', text: 'Receive an affordable premium quote.' },
      { title: 'Pay & Activate', text: 'Complete payment to activate your policy.' },
      { title: 'Stay Protected', text: 'Ride and operate with full insurance coverage.' },
    ],
  },

  // ──────────────── Finance ────────────────
  'used-car-finance': {
    slug: 'used-car-finance',
    title: 'Used Car Finance',
    category: 'Finance',
    icon: CreditCard,
    description: 'Flexible financing options for pre-owned vehicles with competitive interest rates.',
    overview:
      'Dreaming of owning a car? Our used car financing makes it possible with low down payments and flexible repayment terms. We work with multiple lending partners to find the loan that best matches your budget.',
    benefits: [
      { title: 'Low Down Payment', text: 'Start with as low as 20% down payment on qualified vehicles.' },
      { title: 'Flexible Terms', text: 'Choose repayment periods from 12 to 60 months.' },
      { title: 'Competitive Rates', text: 'Interest rates starting from 6% per annum.' },
      { title: 'Fast Approval', text: 'Loan approvals within 24-48 business hours.' },
    ],
    requirements: [
      'Valid government-issued ID (2 copies)',
      'Proof of income (payslips, ITR, or bank statements)',
      'Proof of billing/address',
      'TIN number',
      'Co-maker documents (if applicable)',
    ],
    steps: [
      { title: 'Choose a Vehicle', text: 'Browse our marketplace and find your ideal car.' },
      { title: 'Apply for Financing', text: 'Submit your loan application with required documents.' },
      { title: 'Get Approved', text: 'Receive loan approval within 24-48 hours.' },
      { title: 'Drive Home', text: 'Complete payment and drive your new car home.' },
    ],
  },
  'sangla-or-cr': {
    slug: 'sangla-or-cr',
    title: 'Sangla OR/CR',
    category: 'Finance',
    icon: Banknote,
    description: 'Get quick cash loans using your vehicle\'s OR/CR as collateral — keep driving your car.',
    overview:
      'Need cash fast? Use your vehicle\'s Official Receipt and Certificate of Registration (OR/CR) as collateral to get an affordable loan. You keep your car while we help you access the funds you need.',
    benefits: [
      { title: 'Keep Your Vehicle', text: 'Continue using your car while paying off the loan.' },
      { title: 'Quick Release', text: 'Funds released within 1-3 business days after approval.' },
      { title: 'High Loan Value', text: 'Borrow up to 50-70% of your vehicle\'s appraised value.' },
      { title: 'No Hidden Fees', text: 'Transparent terms with no surprise charges.' },
    ],
    requirements: [
      'Original OR/CR of the vehicle',
      'Valid government-issued ID',
      'Proof of income',
      'Proof of billing/address',
      'Vehicle must be under your name',
    ],
    steps: [
      { title: 'Apply with OR/CR', text: 'Submit your vehicle documents for assessment.' },
      { title: 'Vehicle Appraisal', text: 'We appraise your vehicle to determine loan value.' },
      { title: 'Loan Approval', text: 'Get approved and review your loan terms.' },
      { title: 'Receive Funds', text: 'Cash is released — keep driving your vehicle.' },
    ],
  },
  'personal-loans': {
    slug: 'personal-loans',
    title: 'Personal Loans',
    category: 'Finance',
    icon: DollarSign,
    description: 'Unsecured personal loans for any purpose — fast approval with minimal requirements.',
    overview:
      'Whether it\'s for home renovation, education, medical bills, or personal needs, our personal loan partners offer flexible amounts and repayment terms tailored to your financial capacity.',
    benefits: [
      { title: 'No Collateral Required', text: 'Unsecured loans — no need to pledge any assets.' },
      { title: 'Flexible Amounts', text: 'Loan amounts from ₱20,000 up to ₱2,000,000.' },
      { title: 'Quick Disbursement', text: 'Funds deposited to your bank account within 1-5 days.' },
      { title: 'Simple Application', text: 'Minimal documentary requirements for faster processing.' },
    ],
    requirements: [
      'Valid government-issued ID',
      'Proof of income (latest payslip or ITR)',
      'Bank statements (last 3 months)',
      'Proof of billing/address',
    ],
    steps: [
      { title: 'Submit Application', text: 'Complete the online form with your details.' },
      { title: 'Document Review', text: 'Our partner reviews your application and documents.' },
      { title: 'Approval', text: 'Receive your loan offer with clear terms.' },
      { title: 'Money Released', text: 'Accept the offer and receive funds in your account.' },
    ],
  },

  // ──────────────── OR/CR Services ────────────────
  'or-cr-renewal': {
    slug: 'or-cr-renewal',
    title: 'OR/CR Renewal',
    category: 'OR/CR Services',
    icon: RefreshCw,
    description: 'Hassle-free LTO registration renewal — we handle the lines and paperwork for you.',
    overview:
      'Skip the long lines at the LTO. Our OR/CR renewal service handles the entire vehicle registration renewal process on your behalf — from document preparation to LTO submission and pickup.',
    benefits: [
      { title: 'Save Time', text: 'No need to visit the LTO — we handle everything for you.' },
      { title: 'Door-to-Door', text: 'Document pickup and delivery right at your location.' },
      { title: 'Transparent Pricing', text: 'Fixed service fee — no hidden charges on top of LTO fees.' },
      { title: 'Nationwide Coverage', text: 'Service available across Metro Manila and key provinces.' },
    ],
    requirements: [
      'Expired or current OR/CR',
      'Valid CTPL insurance',
      'Payment for LTO fees + service fee',
      'Authorization letter (if vehicle is not under your name)',
    ],
    steps: [
      { title: 'Book Service', text: 'Submit your renewal request with vehicle details.' },
      { title: 'Document Pickup', text: 'We collect your OR/CR and required documents.' },
      { title: 'LTO Processing', text: 'We process the renewal at the LTO on your behalf.' },
      { title: 'Delivery', text: 'Your renewed OR/CR is delivered back to you.' },
    ],
  },
  'title-transfer': {
    slug: 'title-transfer',
    title: 'Title Transfer',
    category: 'OR/CR Services',
    icon: ArrowRightLeft,
    description: 'Seamless vehicle ownership transfer — we manage the entire LTO title transfer process.',
    overview:
      'Buying or selling a vehicle? The title transfer process at the LTO can be complex and time-consuming. Let our team handle the entire process, ensuring all documents are properly filed and the transfer is completed smoothly.',
    benefits: [
      { title: 'Expert Handling', text: 'Our team knows the LTO process inside out — no mistakes.' },
      { title: 'Complete Service', text: 'From deed of sale to new OR/CR — we handle every step.' },
      { title: 'Avoid Penalties', text: 'Timely processing to avoid late transfer penalties.' },
      { title: 'Peace of Mind', text: 'Know that the transfer is done legally and correctly.' },
    ],
    requirements: [
      'Original OR/CR under seller\'s name',
      'Deed of absolute sale (notarized)',
      'Valid IDs of both buyer and seller',
      'Insurance certificate (CTPL)',
      'Clearance from PNP-HPG',
    ],
    steps: [
      { title: 'Submit Documents', text: 'Provide all required ownership transfer documents.' },
      { title: 'Verification', text: 'We verify all documents and check for encumbrances.' },
      { title: 'LTO Filing', text: 'Documents are filed at the LTO for transfer processing.' },
      { title: 'New OR/CR Issued', text: 'Receive the new OR/CR under the buyer\'s name.' },
    ],
  },

  // ──────────────── Partner With Us ────────────────
  'partner-dealer': {
    slug: 'partner-dealer',
    title: 'Partner Dealer',
    category: 'Partner With Us',
    icon: Handshake,
    description: 'Join our dealer network and reach thousands of potential buyers on our marketplace.',
    overview:
      'Are you a car dealer or real estate broker? Partner with us to list your inventory on our marketplace and gain access to a large pool of qualified buyers. Our platform handles marketing, inquiries, and lead management — so you can focus on closing deals.',
    benefits: [
      { title: 'Expanded Reach', text: 'Showcase your listings to thousands of active buyers daily.' },
      { title: 'Lead Generation', text: 'Receive qualified buyer inquiries directly to your dashboard.' },
      { title: 'Marketing Support', text: 'Your listings are promoted across our marketing channels.' },
      { title: 'Seller Dashboard', text: 'Manage all your listings and inquiries from one place.' },
    ],
    requirements: [
      'Valid business permit / SEC registration',
      'DTI or SEC company name registration',
      'Authorized representative ID',
      'List of available inventory',
    ],
    steps: [
      { title: 'Apply', text: 'Submit your dealer partnership application.' },
      { title: 'Verification', text: 'Our team verifies your business credentials.' },
      { title: 'Onboarding', text: 'Get access to your seller dashboard and start listing.' },
      { title: 'Start Selling', text: 'Your inventory goes live — inquiries start coming in.' },
    ],
  },
  'loan-consultant': {
    slug: 'loan-consultant',
    title: 'Loan Consultant',
    category: 'Partner With Us',
    icon: Users,
    description: 'Become a loan consultant and earn commissions by referring clients to our financing services.',
    overview:
      'Know people who need financing? Become a loan consultant partner and earn commissions for every successful loan referral. No capital needed — just your network and our tools.',
    benefits: [
      { title: 'Earn Commissions', text: 'Attractive commission rates for every approved referral.' },
      { title: 'No Capital Required', text: 'Zero investment — use your network to earn.' },
      { title: 'Training Provided', text: 'We provide product training and marketing materials.' },
      { title: 'Flexible Schedule', text: 'Work on your own time — no fixed office hours.' },
    ],
    requirements: [
      'Valid government-issued ID',
      'NBI or police clearance',
      'TIN number',
      'Bank account for commission payouts',
    ],
    steps: [
      { title: 'Register', text: 'Submit your consultant application online.' },
      { title: 'Training', text: 'Complete our quick product knowledge orientation.' },
      { title: 'Start Referring', text: 'Share our services with your network.' },
      { title: 'Earn', text: 'Receive commissions for every successful referral.' },
    ],
  },
};

/** Group services by category for navbar menus. */
export const SERVICE_CATEGORIES = {
  Insurance: [
    SERVICES['car-insurance'],
    SERVICES['truck-insurance'],
    SERVICES['motorcycle-insurance'],
    SERVICES['ctpl-insurance'],
    SERVICES['three-wheeler-insurance'],
  ],
  Finance: [
    SERVICES['used-car-finance'],
    SERVICES['sangla-or-cr'],
    SERVICES['personal-loans'],
  ],
  'OR/CR Services': [
    SERVICES['or-cr-renewal'],
    SERVICES['title-transfer'],
  ],
  'Partner With Us': [
    SERVICES['partner-dealer'],
    SERVICES['loan-consultant'],
  ],
};

export default SERVICES;
