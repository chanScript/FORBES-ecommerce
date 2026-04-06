# Forbes Financial Digital Handbook — Complete Content & Implementation Guide

---

## 1. Library / Extension Used

| Item | Value |
|------|-------|
| **React package** | `react-pageflip` v2.0.3 |
| **Underlying JS library** | `page-flip` by Nodlik (StPageFlip) |
| **NPM (React)** | `npm install react-pageflip` |
| **NPM (Vanilla JS)** | `npm install page-flip` |
| **CDN (Vanilla JS)** | `https://unpkg.com/page-flip@2.0.7/dist/js/page-flip.browser.js` |
| **GitHub** | https://github.com/Nodlik/StPageFlip |

Other supporting packages used in the FFCC project:

- `framer-motion` — entrance animations
- `react-intersection-observer` — trigger animation when section scrolls into view
- `react-icons` — icon set (FaBook, FaChevronLeft, FaChevronRight, etc.)

---

## 2. How to Implement in Another Project (Plain HTML + JS)

### Step 1 — Create your HTML file

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Digital Handbook</title>
  <style>
    /* ── Reset ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #0f172a;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    /* ── Flipbook wrapper ── */
    #flipbook-wrapper {
      max-width: 900px;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
    }

    /* ── Each page ── */
    .page {
      background: linear-gradient(135deg, #eef1f3 0%, #f8f6f6 100%);
      overflow: hidden;
      padding: 32px;
      display: flex;
      flex-direction: column;
    }

    /* ── Cover page ── */
    .page-cover {
      background: linear-gradient(135deg, #2e1e42 0%, #241558 50%, #070c16 100%);
      position: relative;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: white;
    }
    .page-cover h1 { font-size: 1.1rem; font-weight: 700; color: #fbbf24; margin-bottom: 8px; }
    .page-cover h2 { font-size: 1.25rem; font-weight: 300; margin-bottom: 8px; }
    .page-cover .tagline { font-size: 0.75rem; color: #9ca3af; font-style: italic; }
    .cover-divider { width: 64px; height: 2px; background: rgba(251,191,36,0.5); margin: 12px auto; }

    /* ── Content page ── */
    .section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .icon-box {
      width: 34px; height: 34px; border-radius: 8px;
      background: linear-gradient(135deg, #fbbf24, #d97706);
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; flex-shrink: 0;
    }
    .section-title { font-size: 1rem; font-weight: 600; color: #92400e; }
    .divider { width: 100%; height: 2px; background: linear-gradient(to right, rgba(251,191,36,0.5), transparent); margin-bottom: 12px; }
    .sub-heading { font-size: 0.875rem; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
    p.bt { font-size: 0.75rem; line-height: 1.6; color: #475569; margin-bottom: 8px; text-align: justify; }

    /* ── Control bar ── */
    .controls {
      display: flex; align-items: center; gap: 16px; margin-top: 8px;
    }
    .controls button {
      padding: 8px 20px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.2);
      background: rgba(255,255,255,0.1); color: white; cursor: pointer;
      font-size: 0.875rem; transition: background 0.2s;
    }
    .controls button:hover { background: #fbbf24; color: #1e293b; }
    .controls button:disabled { opacity: 0.3; cursor: not-allowed; }
    .page-counter { color: #fbbf24; font-weight: 600; font-size: 0.875rem; }
  </style>
</head>
<body>

<div id="flipbook-wrapper">
  <!-- The flipbook container — page-flip reads direct children as pages -->
  <div id="book">

    <!-- PAGE 1: Cover -->
    <div class="page page-cover">
      <h1>FORBES FINANCIAL CONSULTANCY CORPORATION</h1>
      <div class="cover-divider"></div>
      <h2>Digital Handbook</h2>
      <p>Est. 2003</p>
      <p class="tagline">Your Trusted Partner in Financial Solutions</p>
    </div>

    <!-- PAGE 2: About Us -->
    <div class="page">
      <div class="section-header">
        <div class="icon-box">📖</div>
        <span class="section-title">About Us</span>
      </div>
      <div class="divider"></div>
      <p class="sub-heading">Our Story</p>
      <p class="bt">Established in 2003, Forbes Financial Consultancy Corporation (FFCC) was built on a single, unwavering foundation: INTEGRITY. This core value continues to guide our governance, operations, and client relationships more than two decades later.</p>
      <p class="bt">Over the past 22 years, FFCC has evolved into one of the country's fastest-growing Credit Information Agencies, expanding its services to include comprehensive business intelligence solutions, credit investigation, risk assessment support, and financial consulting.</p>
      <p class="bt">Today, FFCC is undergoing strategic modernization — integrating advanced data analytics, automation tools, and AI-assisted systems to improve reporting accuracy, turnaround time, and risk analysis capabilities.</p>
    </div>

    <!-- Add more pages here following the same pattern -->

    <!-- LAST PAGE: Back Cover -->
    <div class="page page-cover">
      <h3 style="color:white; font-size:1.1rem; margin-bottom:8px;">Thank you for exploring our Digital Handbook</h3>
      <p style="color:#fbbf24; font-size:0.875rem;">Building Trust Since 2003</p>
      <p style="color:#9ca3af; font-size:0.75rem; margin-top:8px;">Contact us to learn more</p>
    </div>

  </div><!-- /#book -->

  <!-- Controls -->
  <div class="controls">
    <button id="prev-btn" disabled>&#8592; Previous</button>
    <span class="page-counter" id="page-counter">1 / ?</span>
    <button id="next-btn">Next &#8594;</button>
  </div>
</div>

<!-- page-flip CDN -->
<script src="https://unpkg.com/page-flip@2.0.7/dist/js/page-flip.browser.js"></script>
<script>
  const pageFlip = new St.PageFlip(document.getElementById('book'), {
    width:  400,
    height: 550,
    size: 'stretch',
    minWidth:  280,
    maxWidth:  500,
    minHeight: 400,
    maxHeight: 600,
    showCover: true,
    mobileScrollSupport: true,
    maxShadowOpacity: 0.5,
    drawShadow: true,
    flippingTime: 1000,
    usePortrait: true,
    startZIndex: 0,
    autoSize: true,
    swipeDistance: 30,
    clickEventForward: true,
    useMouseEvents: true,
    disableFlipByClick: false
  });

  // Load pages from element
  pageFlip.loadFromHTML(document.querySelectorAll('#book .page'));

  // Update counter
  function updateCounter() {
    const total = pageFlip.getPageCount();
    const current = pageFlip.getCurrentPageIndex() + 1;
    document.getElementById('page-counter').textContent = current + ' / ' + total;
    document.getElementById('prev-btn').disabled = current === 1;
    document.getElementById('next-btn').disabled = current >= total;
  }
  pageFlip.on('flip', updateCounter);
  pageFlip.on('init', updateCounter);

  document.getElementById('prev-btn').addEventListener('click', () => pageFlip.flipPrev());
  document.getElementById('next-btn').addEventListener('click', () => pageFlip.flipNext());
</script>
</body>
</html>
```

### Step 2 — Key page-flip constructor options

```js
new St.PageFlip(element, {
  width:  400,          // fixed page width (px)
  height: 550,          // fixed page height (px)
  size: 'stretch',      // 'fixed' | 'stretch' — stretch scales to screen
  minWidth:  280,
  maxWidth:  500,
  minHeight: 400,
  maxHeight: 600,
  showCover: true,      // first and last pages get hard-cover treatment
  flippingTime: 1000,   // animation duration in ms
  usePortrait: true,    // single-page mode on small screens
  drawShadow: true,
  maxShadowOpacity: 0.5,
  mobileScrollSupport: true,
  swipeDistance: 30,    // px — minimum swipe distance to trigger flip
  clickEventForward: true,
  useMouseEvents: true,
  disableFlipByClick: false
});
```

### Step 3 — API methods

```js
pageFlip.loadFromHTML(nodeList); // load pages from DOM nodes
pageFlip.flipNext();             // flip to next page
pageFlip.flipPrev();             // flip to previous page
pageFlip.flip(pageIndex);        // jump to specific page (0-based)
pageFlip.getCurrentPageIndex();  // current page number (0-based)
pageFlip.getPageCount();         // total page count
pageFlip.on('flip', callback);   // event: fires on every flip
pageFlip.on('init', callback);   // event: fires after init
```

---

## 3. Full Handbook Content (All Pages)

### Page 1 — Cover

- **Title:** FORBES FINANCIAL CONSULTANCY CORPORATION
- **Subtitle:** Digital Handbook
- **Badge:** Est. 2003
- **Tagline:** Your Trusted Partner in Financial Solutions

---

### Page 2 — About Us: Our Story

**Section:** About Us

**Heading:** Our Story

Established in 2003, Forbes Financial Consultancy Corporation (FFCC) was built on a single, unwavering foundation: INTEGRITY. This core value continues to guide our governance, operations, and client relationships more than two decades later. Our commitment to precision, confidentiality, and ethical standards has earned the confidence of institutions across multiple industries.

From the outset, FFCC positioned itself as a trusted partner of businesses, financial institutions, and key stakeholders by delivering accurate, reliable, and professionally prepared financial and credit information reports. Our dedication to excellence has strengthened long-term partnerships and reinforced our reputation for credibility and professionalism.

Over the past 22 years, FFCC has evolved into one of the country's fastest-growing Credit Information Agencies, expanding its services to include comprehensive business intelligence solutions, credit investigation, risk assessment support, and financial consulting. Through continuous operational refinement and technology adoption, we have strengthened our ability to provide timely, data-driven insights that enable sound credit and investment decisions.

Today, FFCC is undergoing strategic modernization. We are actively enhancing our digital infrastructure by integrating advanced data analytics, automation tools, and AI-assisted systems to improve reporting accuracy, turnaround time, and risk analysis capabilities. Our focus is on strengthening data security, compliance frameworks, and system efficiency to meet the growing demands of financial institutions and corporate clients in a rapidly evolving regulatory and economic environment.

FFCC is expanding into integrated credit intelligence and recovery management solutions, bridging information services with innovative collection strategies. This synergy enables us to offer end-to-end credit lifecycle support—from evaluation to recovery.

As we move forward, our commitment remains clear: to combine Integrity, Innovation, and Intelligence in delivering value-driven financial information services.

With a strong legacy, strengthened leadership, and a technology-focused future, FFCC continues to grow—adaptive, resilient, and ready for the next era of financial intelligence.

---

### Page 3 — Our Commitment

**Section:** Our Commitment

**Heading:** Strategic Modernization

Today, FFCC is undergoing strategic modernization. We are actively enhancing our digital infrastructure, integrating advanced data analytics, automation tools and AI-assisted systems to improve reporting accuracy, turnaround time and risk analysis capabilities.

Our focus is on strengthening data security, compliance frameworks, and system efficiency to meet the growing demands of financial institutions and corporate clients in a rapidly evolving regulatory and economic environment.

With a strong legacy, strengthened leadership, and a technology-focused future, FFCC continues to grow—adaptive, resilient, and ready for the next era of financial intelligence.

---

### Page 4 — Vision & Mission

**Our Vision**

To be the premier source of accurate Comprehensive Credit & Business Solutions enabling businesses to thrive with trust, confidence and integrity.

**Our Mission**

We facilitate Business Intelligence and Recovery Solutions with precision, professionalism and transparency, enabling our clients to make informed financial decisions and achieve sustainable growth.

---

### Page 5 — Our Purpose

**Our Purpose**

To provide reliable intelligence and strategic solutions that safeguard investments, mitigate risks and reinforce financial stability of our clients and their business partners.

---

### Page 6 — Values (T-I-T-A-N)

**Values**

| Letter | Word | Description |
|--------|------|-------------|
| T | Teamwork | Collaboration that drives success |
| I | Integrity | Honesty in everything we do |
| T | Trust | Building lasting relationships |
| A | Adaptability | Embracing change and innovation |
| N | New Leaders | Nurturing future excellence |

---

### Page 7 — Services Overview

**Our Services**

| Service | Description |
|---------|-------------|
| Credit Investigation | Comprehensive credit investigation services designed to support informed, risk-aware lending and business decisions with structured verification processes. |
| Background Investigation | Reliable, fact-based insights on individuals and corporate entities through structured due diligence processes to mitigate risk and prevent fraud. |
| Appraisal Services | Professional and independent appraisal services for accurate asset valuation with objectivity, technical competence, and adherence to recognized standards. |
| Loan Marketing | Comprehensive loan marketing and client acquisition services connecting borrowers with suitable financing solutions across various financial products. |
| Liaison Services | Professional liaison services for smooth processing of regulatory and documentation requirements for mortgage and motor vehicle transactions. |

---

### Page 8 — Credit Investigation (Detailed)

**Section:** Credit Investigation

FFCC provides comprehensive and systematic credit investigation services designed to support informed, risk-aware lending and business decisions. Our structured verification processes help financial institutions, lenders, and corporate clients assess credibility, capacity, and character with accuracy and confidence.

Through thorough field and data validation, we ensure that critical borrower and business information is properly authenticated, reducing exposure to fraud, misrepresentation, and credit risk.

**Key Features:**

- **Business Verification** — Validation of business existence, operations, legitimacy, ownership structure, and operational capacity to ensure accuracy of declared information.
- **Employment Verification** — Confirmation of employment status, tenure, position, and compensation details to assess income stability and repayment capability.
- **Residence Verification** — Physical or documented confirmation of residential address and occupancy status to validate identity and borrower traceability.

---

### Page 9 — Background Investigation (Detailed)

**Section:** Background Investigation

FFCC delivers comprehensive background investigation services designed to provide reliable, fact-based insights on individuals and corporate entities. Our structured due diligence processes help financial institutions, corporations, and decision-makers mitigate risk, prevent fraud, and maintain regulatory compliance.

By combining verified data sources, field validation, and systematic analysis, we provide clear and actionable intelligence that supports sound credit, investment, partnership, and employment decisions.

**Key Features:**

- **Consumer Report** — A detailed credit and background profile of an individual, including financial standing, credit behavior, and relevant public records, to support responsible lending and risk evaluation.
- **Individual Background Report** — Comprehensive verification of personal history, affiliations, reputation checks, and other relevant information for employment, partnership, or credit assessment purposes.
- **Corporate Background Report** — In-depth due diligence on corporate entities, including registration status, ownership structure, operational legitimacy, financial standing, and potential risk indicators.
- **Express Corporate Validation** — A streamlined verification service providing rapid confirmation of a company's existence, registration details, and basic operational legitimacy for time-sensitive transactions.

---

### Page 10 — Appraisal Services (Detailed)

**Section:** Appraisal Services

Professional and independent appraisal services to support accurate asset valuation for lending, investment, acquisition, and risk management purposes. Our appraisal process is conducted with objectivity, technical competence, and adherence to recognized valuation standards to ensure credible and defensible results.

By delivering well-documented and market-supported valuations, we assist financial institutions, corporations, and individual clients in making informed collateral and financial decisions.

**Key Features:**

- **Real Estate Appraisal** — Comprehensive valuation of residential, commercial, industrial, agricultural, and special-use properties. Assessment considers market comparables, property condition, location, legal documentation, highest and best use analysis, and prevailing market trends.
- **Vehicle Appraisal** — Professional evaluation of motor vehicles for loan collateral, resale, insurance, asset verification, or financial reporting purposes. Assessment includes physical condition, mileage, depreciation factors, market demand, and documentation validation.

---

### Page 11 — Liaison Services (Detailed)

**Section:** Liaison Services

FFCC provides professional and reliable liaison services to facilitate smooth, accurate, and timely processing of regulatory and documentation requirements related to mortgage and motor vehicle transactions. Our team coordinates directly with government agencies and relevant offices to ensure compliance, proper documentation, and efficient transaction handling.

We assist clients in navigating procedural requirements, minimizing delays, and ensuring that all submissions meet regulatory standards.

**Key Features:**

- **REM Mortgage Annotation** — Processing and facilitation of Real Estate Mortgage (REM) annotation with the appropriate Registry of Deeds, ensuring proper recording of mortgage liens and compliance with documentary requirements.
- **LTO Encumbrance & Registration Renewal** — Assistance in processing motor vehicle encumbrance registration, cancellation (when applicable), and annual registration renewal with the Land Transportation Office (LTO), ensuring accurate documentation and timely compliance.

---

### Page 12 — Loan Marketing (Detailed)

**Section:** Loan Marketing

FFCC provides comprehensive loan marketing and client acquisition services designed to connect borrowers with suitable financing solutions across a wide range of financial products. Through strategic partnerships with banks and financing institutions, we facilitate responsible lending by matching clients with competitive, structured loan programs tailored to their needs.

Our team supports clients throughout the application process—from initial assessment and documentation guidance to submission and coordination—ensuring efficiency, transparency, and compliance with partner lending institutions' credit standards.

**Loan Products:**

- **Auto Loans**
  - Car Loan (Brand New, Pre-Owned, Refinancing)
  - Truck Loan (Brand New, Pre-Owned, Refinancing)
  - Structured financing solutions for personal and commercial vehicle acquisition or refinancing requirements.
- **Motorcycle Loan**
  - Brand New, Pre-Owned, Refinancing
  - Accessible financing options for individual and business mobility needs.
- **Appliance & Gadget Loan** — Consumer financing programs for essential household appliances, electronics, and technology purchases.
- **Real Estate Mortgage (REM) Loan** — Financing solutions secured by real property for acquisition, refinancing, or equity take-out purposes.
- **OFW & Seaman's Loan** — Specialized financing programs tailored to Overseas Filipino Workers and seafarers, aligned with documented income streams and contract-based employment.
- **Business Loan** — Working capital and expansion financing solutions designed to support operational growth, asset acquisition, and business sustainability.

---

### Page 13 — Management / Team

**Section:** Management

| Name | Role |
|------|------|
| Noel J. Domingo | Chief Executive Officer |
| Joebert Grey Reyes | President |
| Ruch Salas | Vice President |
| Jan Kris Ann Fernandez | Chief Financial Officer |
| Aubrey Lim | Operations Manager |
| Nikki | Management |
| Jane | Management |

---

### Page 14 — CEO Profile (Noel J. Domingo)

**Name:** Noel J. Domingo  
**Title:** Chief Executive Officer  
**Company:** Forbes Financial Consultancy Corporation

---

### Page 15 — CEO Statement / Story

"When I joined Forbes Financial Consultancy Corporation (FFCC) in the last quarter of 2023 as Assistant General Manager, I saw more than a company, I saw potential. In the first quarter of 2025, I was honored to serve as General Manager and by June 2025, I accepted the responsibility of leading FFCC as Chief Executive Officer.

This journey has not just been a progression of titles, but a deep commitment to transformation, discipline and purposeful growth.

FFCC was built on Integrity, and that foundation remains non-negotiable. However, integrity alone is not enough in today's rapidly evolving financial landscape. We must also lead with courage, innovation, and vision.

Our vision for FFCC is clear: To build a future-ready financial intelligence organization that empowers institutions, uplifts professionals and creates sustainable value for generations.

We are investing in modernization: integrating digital systems, analytics and tech-driven solutions to strengthen the accuracy, speed and security of our services. But technology is only one part of our transformation. The true strength of FFCC lies in its people.

We are committed to cultivating a culture where employee growth is intentional, career progression is structured, and leadership is developed from within. I believe that when individuals grow, the organization grows. When careers advance, excellence becomes the standard. And when our people succeed, financial growth naturally follows.

Financial growth for us, is not merely about revenue expansion. It is about building a stable, disciplined and scalable institution—one that creates opportunities, sustains livelihoods and earns the long-term trust of clients, partners and stakeholders.

We are building more than services. We are building systems. We are building leaders. We are building legacy.

The next chapter of FFCC will be defined by innovation, operational excellence, and courageous leadership always anchored in integrity.

The future is not something we wait for. It is something we build."

— **Noel J. Domingo**, Chief Executive Officer, Forbes Financial Consultancy Corporation

---

### Page 16 — Team Photo (Full-bleed image)

Full team photo: `images/about_us/20260118_151802.png`

---

### Back Cover

- Thank you for exploring our Digital Handbook
- Building Trust Since 2003
- Contact us to learn more

---

## 4. Complete Working HTML+JS Example (All Pages)

Below is the complete ready-to-use standalone HTML file with all handbook pages:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>FFCC Digital Handbook</title>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: 'Segoe UI', Arial, sans-serif;
  background: #0f172a;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

/* ── Wrapper ── */
#flipbook-wrapper {
  max-width: 900px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

/* ── Page Base ── */
.page {
  background: linear-gradient(135deg, #eef1f3 0%, #f8f6f6 100%);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 32px;
}

/* ── Cover ── */
.page-cover {
  background: linear-gradient(135deg, #2e1e42 0%, #070c16 100%);
  align-items: center;
  justify-content: center;
  text-align: center;
}
.cover-title { font-size: 1rem; font-weight: 800; color: #fbbf24; line-height: 1.3; padding: 0 16px; }
.cover-rule { width: 56px; height: 2px; background: rgba(251,191,36,0.5); margin: 12px auto; }
.cover-sub { font-size: 1.1rem; font-weight: 300; color: #fff; }
.cover-year { font-size: 0.75rem; color: #fbbf24; font-weight: 600; margin-top: 8px; }
.cover-tagline { font-size: 0.7rem; color: #9ca3af; margin-top: 10px; font-style: italic; }

/* ── Back Cover ── */
.back-cover-title { font-size: 1rem; font-weight: 600; color: #fff; margin-bottom: 8px; line-height: 1.4; }
.back-cover-sub { font-size: 0.875rem; color: #fbbf24; font-weight: 600; }
.back-cover-contact { font-size: 0.75rem; color: #9ca3af; margin-top: 8px; }

/* ── Content Header ── */
.ch { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.icon-box {
  width: 34px; height: 34px; border-radius: 8px;
  background: linear-gradient(135deg, #fbbf24, #d97706);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; flex-shrink: 0;
}
.section-title { font-size: 0.9rem; font-weight: 700; color: #92400e; }
.divider { width: 100%; height: 2px; background: linear-gradient(to right, rgba(251,191,36,0.6), transparent); margin-bottom: 10px; }
.sub-heading { font-size: 0.8rem; font-weight: 600; color: #1e293b; margin-bottom: 8px; }
p.bt { font-size: 0.7rem; line-height: 1.7; color: #374151; margin-bottom: 6px; text-align: justify; }

/* ── Vision / Mission ── */
.vm-page { background: #f8fafc; padding: 40px; justify-content: center; }
.vm-card {
  background: rgba(245,158,11,.07); border: 1px solid rgba(245,158,11,.2);
  border-radius: 10px; padding: 20px; margin-bottom: 16px;
}
.vm-card h3 { font-size: 0.85rem; font-weight: 700; color: #92400e; margin-bottom: 7px; }
.vm-card p { font-size: 0.7rem; line-height: 1.8; color: #475569; }

/* ── Highlight (Purpose) ── */
.highlight-page {
  background: #f8fafc; align-items: center; justify-content: center; text-align: center; padding: 48px;
}
.hl-icon {
  width: 52px; height: 52px; border-radius: 50%;
  background: linear-gradient(135deg, #fbbf24, #d97706);
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; margin-bottom: 16px;
}
.highlight-page h3 { font-size: 1rem; font-weight: 700; color: #92400e; margin-bottom: 12px; }
.highlight-page p { font-size: 0.8rem; line-height: 1.8; color: #475569; max-width: 340px; }

/* ── Values ── */
.values-page { background: #f8fafc; padding: 40px; justify-content: center; }
.values-page h2 { font-size: 1.25rem; font-weight: 800; color: #92400e; text-align: center; margin-bottom: 6px; }
.values-rule { width: 60px; height: 3px; background: #f59e0b; margin: 0 auto 22px; border-radius: 2px; }
.value-row {
  display: flex; align-items: center; gap: 16px;
  background: #fff; border-radius: 10px; padding: 14px 18px;
  border-left: 5px solid #f59e0b; box-shadow: 0 1px 4px rgba(0,0,0,.06); margin-bottom: 14px;
}
.vl {
  width: 44px; height: 44px; border-radius: 8px;
  background: linear-gradient(135deg, #fbbf24, #d97706);
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; font-weight: 900; color: #fff; flex-shrink: 0;
}
.vw { font-size: 0.875rem; font-weight: 700; color: #0f172a; }
.vd { font-size: 0.7rem; color: #64748b; margin-top: 2px; }

/* ── Services Overview ── */
.svc-row {
  display: flex; align-items: flex-start; gap: 12px;
  background: #fff; border-radius: 8px; padding: 11px 14px;
  border-left: 4px solid #f59e0b; margin-bottom: 8px;
}
.svc-row h4 { font-size: 0.75rem; font-weight: 700; color: #0f172a; margin-bottom: 3px; }
.svc-row p { font-size: 0.65rem; line-height: 1.5; color: #475569; }

/* ── Detail Pages ── */
.detail-page { padding: 32px; }
.feature-item {
  display: flex; align-items: flex-start; gap: 10px;
  background: #f8fafc; border-radius: 8px; padding: 8px 12px;
  border-left: 3px solid #f59e0b; margin-bottom: 7px;
}
.fdot { width: 6px; height: 6px; background: #f59e0b; border-radius: 50%; margin-top: 4px; flex-shrink: 0; }
.ft { font-size: 0.65rem; line-height: 1.6; color: #374151; }
.ft strong { color: #0f172a; }

/* ── Team ── */
.team-page { padding: 32px; }
.team-grid { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 14px; justify-content: center; }
.team-card { width: 110px; text-align: center; }
.team-photo {
  width: 72px; height: 72px; border-radius: 50%;
  border: 3px solid #f59e0b; object-fit: cover; display: block; margin: 0 auto 6px;
}
.team-initial {
  width: 72px; height: 72px; border-radius: 50%;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  display: flex; align-items: center; justify-content: center;
  font-size: 26px; font-weight: 900; color: #fff; margin: 0 auto 6px;
}
.tname { font-size: 0.6rem; font-weight: 700; color: #0f172a; }
.trole { font-size: 0.55rem; color: #64748b; margin-top: 2px; }

/* ── CEO Profile ── */
.profile-page {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  align-items: center; justify-content: center; text-align: center; padding: 48px;
}
.profile-photo-wrap {
  width: 140px; height: 140px; border-radius: 50%;
  border: 5px solid #f59e0b; overflow: hidden; margin: 0 auto 18px;
}
.profile-photo-wrap img { width: 100%; height: 100%; object-fit: cover; }
.profile-name { font-size: 1.1rem; font-weight: 800; color: #fff; }
.profile-role-lbl { font-size: 0.75rem; color: #f59e0b; font-weight: 600; margin-top: 5px; letter-spacing: 1px; }
.profile-rule { width: 48px; height: 3px; background: #f59e0b; border-radius: 2px; margin: 14px auto 0; }

/* ── CEO Story ── */
.story-page { padding: 32px; background: linear-gradient(135deg, #eef1f3 0%, #f8f6f6 100%); }
p.story-text { font-size: 0.65rem; line-height: 1.8; color: #374151; margin-bottom: 5px; text-align: justify; }
.story-footer { margin-top: auto; padding-top: 10px; border-top: 1px solid rgba(245,158,11,.3); }
.sfn { font-size: 0.75rem; font-weight: 700; color: #0f172a; }
.sfr { font-size: 0.65rem; color: #64748b; }
.sfc { font-size: 0.6rem; color: #94a3b8; }

/* ── Controls ── */
.controls { display: flex; align-items: center; gap: 16px; }
.controls button {
  padding: 8px 22px; border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.1); color: white;
  cursor: pointer; font-size: 0.875rem; transition: all 0.2s;
}
.controls button:hover:not(:disabled) { background: #fbbf24; color: #1e293b; border-color: #fbbf24; }
.controls button:disabled { opacity: 0.3; cursor: not-allowed; }
.page-counter { color: #fbbf24; font-weight: 600; font-size: 0.875rem; min-width: 60px; text-align: center; }
</style>
</head>
<body>

<div id="flipbook-wrapper">
  <div id="book">

    <!-- PAGE 1: COVER -->
    <div class="page page-cover" data-density="hard">
      <div style="position:absolute;inset:0;background:linear-gradient(155deg,rgba(0,0,0,.76),rgba(15,23,42,.90));z-index:0;"></div>
      <div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center;">
        <span style="border:1.5px solid #f59e0b;color:#f59e0b;font-size:8px;letter-spacing:3px;text-transform:uppercase;padding:4px 16px;border-radius:99px;">Est. 2003</span>
        <p class="cover-title">FORBES FINANCIAL CONSULTANCY CORPORATION</p>
        <div class="cover-rule"></div>
        <p class="cover-sub">Digital Handbook</p>
        <p class="cover-tagline">Your Trusted Partner in Financial Solutions</p>
      </div>
    </div>

    <!-- PAGE 2: ABOUT US - OUR STORY -->
    <div class="page">
      <div class="ch"><div class="icon-box">📖</div><span class="section-title">About Us</span></div>
      <div class="divider"></div>
      <p class="sub-heading">Our Story</p>
      <p class="bt">Established in 2003, Forbes Financial Consultancy Corporation (FFCC) was built on a single, unwavering foundation: INTEGRITY. This core value continues to guide our governance, operations, and client relationships more than two decades later.</p>
      <p class="bt">From the outset, FFCC positioned itself as a trusted partner of businesses, financial institutions, and key stakeholders by delivering accurate, reliable, and professionally prepared financial and credit information reports.</p>
      <p class="bt">Over the past 22 years, FFCC has evolved into one of the country's fastest-growing Credit Information Agencies, expanding its services to include comprehensive business intelligence solutions, credit investigation, risk assessment support, and financial consulting.</p>
      <p class="bt">Today, FFCC is undergoing strategic modernization. We are actively enhancing our digital infrastructure by integrating advanced data analytics, automation tools, and AI-assisted systems to improve reporting accuracy, turnaround time, and risk analysis capabilities.</p>
      <p class="bt">FFCC is expanding into integrated credit intelligence and recovery management solutions, bridging information services with innovative collection strategies.</p>
      <p class="bt">As we move forward, our commitment remains clear: to combine Integrity, Innovation, and Intelligence in delivering value-driven financial information services.</p>
      <p class="bt">With a strong legacy, strengthened leadership, and a technology-focused future, FFCC continues to grow—adaptive, resilient, and ready for the next era of financial intelligence.</p>
    </div>

    <!-- PAGE 3: OUR COMMITMENT -->
    <div class="page">
      <div class="ch"><div class="icon-box">💡</div><span class="section-title">Our Commitment</span></div>
      <div class="divider"></div>
      <p class="sub-heading">Strategic Modernization</p>
      <p class="bt">Today, FFCC is undergoing strategic modernization. We are actively enhancing our digital infrastructure, integrating advanced data analytics, automation tools and AI-assisted systems to improve reporting accuracy, turnaround time and risk analysis capabilities.</p>
      <p class="bt">Our focus is on strengthening data security, compliance frameworks, and system efficiency to meet the growing demands of financial institutions and corporate clients in a rapidly evolving regulatory and economic environment.</p>
      <p class="bt">With a strong legacy, strengthened leadership, and a technology-focused future, FFCC continues to grow—adaptive, resilient, and ready for the next era of financial intelligence.</p>
    </div>

    <!-- PAGE 4: VISION & MISSION -->
    <div class="page vm-page">
      <div class="vm-card"><h3>👁 Our Vision</h3><p>To be the premier source of accurate Comprehensive Credit &amp; Business Solutions enabling businesses to thrive with trust, confidence and integrity.</p></div>
      <div class="vm-card"><h3>🎯 Our Mission</h3><p>We facilitate Business Intelligence and Recovery Solutions with precision, professionalism and transparency, enabling our clients to make informed financial decisions and achieve sustainable growth.</p></div>
    </div>

    <!-- PAGE 5: PURPOSE -->
    <div class="page highlight-page">
      <div class="hl-icon">🛡</div>
      <h3>Our Purpose</h3>
      <p>To provide reliable intelligence and strategic solutions that safeguard investments, mitigate risks and reinforce financial stability of our clients and their business partners.</p>
    </div>

    <!-- PAGE 6: VALUES (T-I-T-A-N) -->
    <div class="page values-page">
      <h2>Values</h2>
      <div class="values-rule"></div>
      <div class="value-row"><div class="vl">T</div><div><div class="vw">Teamwork</div><div class="vd">Collaboration that drives success</div></div></div>
      <div class="value-row"><div class="vl">I</div><div><div class="vw">Integrity</div><div class="vd">Honesty in everything we do</div></div></div>
      <div class="value-row"><div class="vl">T</div><div><div class="vw">Trust</div><div class="vd">Building lasting relationships</div></div></div>
      <div class="value-row"><div class="vl">A</div><div><div class="vw">Adaptability</div><div class="vd">Embracing change and innovation</div></div></div>
      <div class="value-row"><div class="vl">N</div><div><div class="vw">New Leaders</div><div class="vd">Nurturing future excellence</div></div></div>
    </div>

    <!-- PAGE 7: SERVICES OVERVIEW -->
    <div class="page" style="padding:32px;">
      <div class="ch"><div class="icon-box">🗂</div><span class="section-title">Our Services</span></div>
      <div class="divider"></div>
      <div class="svc-row"><div class="icon-box" style="flex-shrink:0">🔍</div><div><h4>Credit Investigation</h4><p>Comprehensive credit investigation services designed to support informed, risk-aware lending and business decisions with structured verification processes.</p></div></div>
      <div class="svc-row"><div class="icon-box" style="flex-shrink:0">✔</div><div><h4>Background Investigation</h4><p>Reliable, fact-based insights on individuals and corporate entities through structured due diligence processes to mitigate risk and prevent fraud.</p></div></div>
      <div class="svc-row"><div class="icon-box" style="flex-shrink:0">📋</div><div><h4>Appraisal Services</h4><p>Professional and independent appraisal services for accurate asset valuation with objectivity, technical competence, and adherence to recognized standards.</p></div></div>
      <div class="svc-row"><div class="icon-box" style="flex-shrink:0">💰</div><div><h4>Loan Marketing</h4><p>Comprehensive loan marketing and client acquisition services connecting borrowers with suitable financing solutions across various financial products.</p></div></div>
      <div class="svc-row"><div class="icon-box" style="flex-shrink:0">📄</div><div><h4>Liaison Services</h4><p>Professional liaison services for smooth processing of regulatory and documentation requirements for mortgage and motor vehicle transactions.</p></div></div>
    </div>

    <!-- PAGE 8: CREDIT INVESTIGATION DETAILS -->
    <div class="page detail-page">
      <div class="ch"><div class="icon-box">🔍</div><span class="section-title">Credit Investigation</span></div>
      <div class="divider"></div>
      <p class="bt">FFCC provides comprehensive and systematic credit investigation services designed to support informed, risk-aware lending and business decisions. Our structured verification processes help financial institutions, lenders, and corporate clients assess credibility, capacity, and character with accuracy and confidence.</p>
      <p class="bt">Through thorough field and data validation, we ensure that critical borrower and business information is properly authenticated, reducing exposure to fraud, misrepresentation, and credit risk.</p>
      <p class="sub-heading" style="margin-top:8px">Key Features:</p>
      <div class="feature-item"><div class="fdot"></div><div class="ft"><strong>Business Verification</strong> — Validation of business existence, operations, legitimacy, ownership structure, and operational capacity.</div></div>
      <div class="feature-item"><div class="fdot"></div><div class="ft"><strong>Employment Verification</strong> — Confirmation of employment status, tenure, position, and compensation details to assess income stability.</div></div>
      <div class="feature-item"><div class="fdot"></div><div class="ft"><strong>Residence Verification</strong> — Physical or documented confirmation of residential address and occupancy status.</div></div>
    </div>

    <!-- PAGE 9: BACKGROUND INVESTIGATION DETAILS -->
    <div class="page detail-page">
      <div class="ch"><div class="icon-box">✔</div><span class="section-title">Background Investigation</span></div>
      <div class="divider"></div>
      <p class="bt">FFCC delivers comprehensive background investigation services designed to provide reliable, fact-based insights on individuals and corporate entities.</p>
      <p class="bt">By combining verified data sources, field validation, and systematic analysis, we provide clear and actionable intelligence.</p>
      <p class="sub-heading" style="margin-top:8px">Key Features:</p>
      <div class="feature-item"><div class="fdot"></div><div class="ft"><strong>Consumer Report</strong> — A detailed credit and background profile of an individual including financial standing, credit behavior, and relevant public records.</div></div>
      <div class="feature-item"><div class="fdot"></div><div class="ft"><strong>Individual Background Report</strong> — Comprehensive verification of personal history, affiliations, reputation checks.</div></div>
      <div class="feature-item"><div class="fdot"></div><div class="ft"><strong>Corporate Background Report</strong> — In-depth due diligence on corporate entities including registration status, ownership structure, operational legitimacy.</div></div>
      <div class="feature-item"><div class="fdot"></div><div class="ft"><strong>Express Corporate Validation</strong> — Streamlined verification providing rapid confirmation of a company's existence and registration details.</div></div>
    </div>

    <!-- PAGE 10: APPRAISAL SERVICES DETAILS -->
    <div class="page detail-page">
      <div class="ch"><div class="icon-box">📋</div><span class="section-title">Appraisal Services</span></div>
      <div class="divider"></div>
      <p class="bt">Professional and independent appraisal services to support accurate asset valuation for lending, investment, acquisition, and risk management purposes. Conducted with objectivity, technical competence, and adherence to recognized valuation standards.</p>
      <p class="bt">By delivering well-documented and market-supported valuations, we assist financial institutions, corporations, and individual clients in making informed collateral and financial decisions.</p>
      <p class="sub-heading" style="margin-top:8px">Key Features:</p>
      <div class="feature-item"><div class="fdot"></div><div class="ft"><strong>Real Estate Appraisal</strong> — Comprehensive valuation of residential, commercial, industrial, agricultural, and special-use properties. Considers market comparables, property condition, location, legal documentation, and prevailing market trends.</div></div>
      <div class="feature-item"><div class="fdot"></div><div class="ft"><strong>Vehicle Appraisal</strong> — Professional evaluation of motor vehicles for loan collateral, resale, insurance, or asset verification. Includes physical condition, mileage, depreciation factors, and documentation validation.</div></div>
    </div>

    <!-- PAGE 11: LIAISON SERVICES DETAILS -->
    <div class="page detail-page">
      <div class="ch"><div class="icon-box">📄</div><span class="section-title">Liaison Services</span></div>
      <div class="divider"></div>
      <p class="bt">FFCC provides professional liaison services to facilitate smooth, accurate, and timely processing of regulatory and documentation requirements related to mortgage and motor vehicle transactions. Our team coordinates directly with government agencies and relevant offices.</p>
      <p class="bt">We assist clients in navigating procedural requirements, minimizing delays, and ensuring all submissions meet regulatory standards.</p>
      <p class="sub-heading" style="margin-top:8px">Key Features:</p>
      <div class="feature-item"><div class="fdot"></div><div class="ft"><strong>REM Mortgage Annotation</strong> — Processing and facilitation of Real Estate Mortgage annotation with the Registry of Deeds, ensuring proper recording of mortgage liens.</div></div>
      <div class="feature-item"><div class="fdot"></div><div class="ft"><strong>LTO Encumbrance &amp; Registration Renewal</strong> — Assistance in processing motor vehicle encumbrance registration, cancellation (when applicable), and annual registration renewal with the LTO.</div></div>
    </div>

    <!-- PAGE 12: LOAN MARKETING DETAILS -->
    <div class="page detail-page">
      <div class="ch"><div class="icon-box">💰</div><span class="section-title">Loan Marketing</span></div>
      <div class="divider"></div>
      <p class="bt">FFCC provides comprehensive loan marketing and client acquisition services connecting borrowers with suitable financing solutions across a wide range of financial products. Through strategic partnerships with banks and financing institutions, we facilitate responsible lending.</p>
      <p class="sub-heading" style="margin-top:6px">Loan Products:</p>
      <div class="feature-item"><div class="fdot"></div><div class="ft"><strong>Auto Loans</strong> — Car &amp; Truck Loans (Brand New, Pre-Owned, Refinancing). Structured financing for personal and commercial vehicle acquisition.</div></div>
      <div class="feature-item"><div class="fdot"></div><div class="ft"><strong>Motorcycle Loan</strong> — Brand New, Pre-Owned, Refinancing. Accessible financing options for individual and business mobility needs.</div></div>
      <div class="feature-item"><div class="fdot"></div><div class="ft"><strong>Appliance &amp; Gadget Loan</strong> — Consumer financing for essential household appliances, electronics, and technology purchases.</div></div>
      <div class="feature-item"><div class="fdot"></div><div class="ft"><strong>Real Estate Mortgage (REM) Loan</strong> — Financing secured by real property for acquisition, refinancing, or equity take-out purposes.</div></div>
      <div class="feature-item"><div class="fdot"></div><div class="ft"><strong>OFW &amp; Seaman's Loan</strong> — Specialized financing tailored to Overseas Filipino Workers and seafarers, aligned with documented income streams.</div></div>
      <div class="feature-item"><div class="fdot"></div><div class="ft"><strong>Business Loan</strong> — Working capital and expansion financing to support operational growth, asset acquisition, and business sustainability.</div></div>
    </div>

    <!-- PAGE 13: MANAGEMENT TEAM -->
    <div class="page team-page">
      <div class="ch"><div class="icon-box">👥</div><span class="section-title">Management</span></div>
      <div class="divider"></div>
      <div class="team-grid">
        <div class="team-card">
          <img class="team-photo" src="images/Picture20.png" alt="Noel J. Domingo" onerror="this.outerHTML='<div class=\'team-initial\'>N</div>'">
          <div class="tname">Noel J. Domingo</div><div class="trole">Chief Executive Officer</div>
        </div>
        <div class="team-card">
          <img class="team-photo" src="images/Picture5-removebg-preview.png" alt="Joebert Grey Reyes" onerror="this.outerHTML='<div class=\'team-initial\'>J</div>'">
          <div class="tname">Joebert Grey Reyes</div><div class="trole">President</div>
        </div>
        <div class="team-card">
          <img class="team-photo" src="images/0a74a348d8764f4c9c518f091a0c520b4fa33f6c-removebg-preview.png" alt="Ruch Salas" onerror="this.outerHTML='<div class=\'team-initial\'>R</div>'">
          <div class="tname">Ruch Salas</div><div class="trole">Vice President</div>
        </div>
        <div class="team-card">
          <img class="team-photo" src="images/Picture3-removebg-preview.png" alt="Jan Kris Ann Fernandez" onerror="this.outerHTML='<div class=\'team-initial\'>J</div>'">
          <div class="tname">Jan Kris Ann Fernandez</div><div class="trole">Chief Financial Officer</div>
        </div>
        <div class="team-card">
          <img class="team-photo" src="images/Picture4-removebg-preview.png" alt="Aubrey Lim" onerror="this.outerHTML='<div class=\'team-initial\'>A</div>'">
          <div class="tname">Aubrey Lim</div><div class="trole">Operations Manager</div>
        </div>
        <div class="team-card">
          <img class="team-photo" src="images/about_us/nikki.png" alt="Nikki" onerror="this.outerHTML='<div class=\'team-initial\'>N</div>'">
          <div class="tname">Nikki</div><div class="trole">Management</div>
        </div>
        <div class="team-card">
          <img class="team-photo" src="images/about_us/jane.png" alt="Jane" onerror="this.outerHTML='<div class=\'team-initial\'>J</div>'">
          <div class="tname">Jane</div><div class="trole">Management</div>
        </div>
      </div>
    </div>

    <!-- PAGE 14: CEO PROFILE PICTURE -->
    <div class="page profile-page">
      <div class="profile-photo-wrap">
        <img src="images/Picture20.png" alt="Noel J. Domingo" onerror="this.style.display='none'">
      </div>
      <div class="profile-name">Noel J. Domingo</div>
      <div class="profile-role-lbl">Chief Executive Officer</div>
      <div class="profile-rule"></div>
    </div>

    <!-- PAGE 15: CEO STORY -->
    <div class="page story-page">
      <div class="divider"></div>
      <p class="story-text">"When I joined Forbes Financial Consultancy Corporation (FFCC) in the last quarter of 2023 as Assistant General Manager, I saw more than a company, I saw potential. In the first quarter of 2025, I was honored to serve as General Manager and by June 2025, I accepted the responsibility of leading FFCC as Chief Executive Officer.</p>
      <p class="story-text">This journey has not just been a progression of titles, but a deep commitment to transformation, discipline and purposeful growth.</p>
      <p class="story-text">FFCC was built on Integrity, and that foundation remains non-negotiable. However, integrity alone is not enough in today's rapidly evolving financial landscape. We must also lead with courage, innovation, and vision.</p>
      <p class="story-text">Our vision for FFCC is clear: To build a future-ready financial intelligence organization that empowers institutions, uplifts professionals and creates sustainable value for generations.</p>
      <p class="story-text">We are investing in modernization: integrating digital systems, analytics and tech-driven solutions to strengthen the accuracy, speed and security of our services.</p>
      <p class="story-text">We are committed to cultivating a culture where employee growth is intentional, career progression is structured, and leadership is developed from within.</p>
      <p class="story-text">Financial growth for us, is not merely about revenue expansion. It is about building a stable, disciplined and scalable institution—one that creates opportunities, sustains livelihoods and earns the long-term trust of clients, partners and stakeholders.</p>
      <p class="story-text">We are building more than services. We are building systems. We are building leaders. We are building legacy.</p>
      <p class="story-text">The future is not something we wait for. It is something we build."</p>
      <div class="story-footer">
        <div class="sfn">Noel J. Domingo</div>
        <div class="sfr">Chief Executive Officer</div>
        <div class="sfc">Forbes Financial Consultancy Corporation</div>
      </div>
    </div>

    <!-- PAGE 16: BACK COVER -->
    <div class="page page-cover" data-density="hard">
      <div style="position:absolute;inset:0;background:linear-gradient(155deg,rgba(0,0,0,.76),rgba(15,23,42,.90));z-index:0;"></div>
      <div style="position:relative;z-index:1;text-align:center;">
        <p class="back-cover-title">Thank you for exploring our Digital Handbook</p>
        <p class="back-cover-sub">Building Trust Since 2003</p>
        <p class="back-cover-contact">Contact us to learn more</p>
      </div>
    </div>

  </div><!-- /#book -->

  <!-- Controls -->
  <div class="controls">
    <button id="prev-btn" disabled>&#8592; Previous</button>
    <span class="page-counter" id="page-counter">1 / 16</span>
    <button id="next-btn">Next &#8594;</button>
  </div>
</div>

<!-- page-flip JS CDN -->
<script src="https://unpkg.com/page-flip@2.0.7/dist/js/page-flip.browser.js"></script>
<script>
  const pageFlip = new St.PageFlip(document.getElementById('book'), {
    width: 400,
    height: 550,
    size: 'stretch',
    minWidth: 280,
    maxWidth: 500,
    minHeight: 400,
    maxHeight: 600,
    showCover: true,
    mobileScrollSupport: true,
    maxShadowOpacity: 0.5,
    drawShadow: true,
    flippingTime: 1000,
    usePortrait: true,
    startZIndex: 0,
    autoSize: true,
    swipeDistance: 30,
    clickEventForward: true,
    useMouseEvents: true,
    disableFlipByClick: false
  });

  pageFlip.loadFromHTML(document.querySelectorAll('#book .page'));

  function updateCounter() {
    const total = pageFlip.getPageCount();
    const current = pageFlip.getCurrentPageIndex() + 1;
    document.getElementById('page-counter').textContent = current + ' / ' + total;
    document.getElementById('prev-btn').disabled = current === 1;
    document.getElementById('next-btn').disabled = current >= total;
  }

  pageFlip.on('flip', updateCounter);
  pageFlip.on('init', updateCounter);

  document.getElementById('prev-btn').addEventListener('click', () => pageFlip.flipPrev());
  document.getElementById('next-btn').addEventListener('click', () => pageFlip.flipNext());
</script>
</body>
</html>
```

---

## 5. Quick Reference

### Install for React project
```bash
npm install react-pageflip
```

### Install for Vanilla JS project
```bash
npm install page-flip
```

### CDN (no build tool needed)
```html
<script src="https://unpkg.com/page-flip@2.0.7/dist/js/page-flip.browser.js"></script>
```

### Key difference: React vs Vanilla
| | React (`react-pageflip`) | Vanilla JS (`page-flip`) |
|--|--|--|
| Import | `import HTMLFlipBook from 'react-pageflip'` | `<script>` CDN or `import { PageFlip } from 'page-flip'` |
| Usage | `<HTMLFlipBook ref={bookRef} ...><Page /></HTMLFlipBook>` | `new St.PageFlip(el, opts).loadFromHTML(nodeList)` |
| Page children | React components using `forwardRef` | Regular HTML elements with class `.page` |
| Cover pages | `data-density="hard"` prop on the page component | `data-density="hard"` attribute on the element |

---

*Generated: April 6, 2026*
