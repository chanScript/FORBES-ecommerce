/**
 * =========================================================
 *  Forbes Financial Consultancy Corporation — App Components
 *  Reusable Navbar, Footer, Back-to-Top, and Toast
 * =========================================================
 *
 *  Usage (in each HTML page):
 *    <div id="navbar-container"></div>
 *    ... page content ...
 *    <div id="footer-container"></div>
 *    <script src="js/app.js"></script>
 *    <script src="js/script.js"></script>
 *
 *  For transparent nav (index.html hero):
 *    <div id="navbar-container" data-transparent="true"></div>
 */

(function () {
  'use strict';

  /* ============================
   *  NAVBAR
   * ============================ */
  function renderNavbar() {
    const container = document.getElementById('navbar-container');
    if (!container) return;

    const isTransparent = container.getAttribute('data-transparent') === 'true';

    // Nav wrapper classes differ: transparent (index) vs solid (other pages)
    const navClasses = isTransparent
      ? 'fixed top-0 left-0 right-0 z-50 bg-white/97 backdrop-blur-md transition-all duration-300 border-b border-gray-100'
      : 'fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md transition-all duration-300 border-b border-gray-100';

    // Link color classes
    const brandClass = isTransparent ? 'nav-brand text-primary-900' : 'text-primary-900';
    const accentClass = isTransparent ? 'nav-accent text-accent' : 'text-accent';
    const linkClass = isTransparent
      ? 'nav-link text-gray-600 hover:text-primary-900'
      : 'text-gray-600 hover:text-primary-900';
    const ctaClass = isTransparent
      ? 'nav-cta ml-4 bg-primary-900 hover:bg-primary-800 text-white border border-primary-900 shadow-md'
      : 'ml-4 bg-primary-900 hover:bg-primary-800 text-white shadow-md';
    const mobileBtnClass = isTransparent
      ? 'nav-mobile-btn lg:hidden text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors'
      : 'lg:hidden text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors';
    const transitionDuration = isTransparent ? 'transition-colors duration-500' : 'transition-colors';
    const aboutBtnClass = isTransparent
      ? `${linkClass} px-4 py-3 text-sm font-medium tracking-wide uppercase ${transitionDuration} flex items-center gap-1`
      : 'text-primary-900 font-semibold px-4 py-2 text-sm tracking-wide uppercase transition-colors flex items-center gap-1';

    container.innerHTML = `
    <nav id="navbar" class="${navClasses}">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-24">
          <!-- Logo -->
          <a href="index.html" class="flex items-center space-x-3 flex-shrink-0">
           <img src="images/logo.png" alt="FFCC Logo" class="w-[82px] h-[78px] object-contain" />
            <div class="hidden sm:block">
              <span class="${brandClass} font-bold text-lg leading-tight block ${transitionDuration}">FORBES FINANCIAL</span>
              <span class="${accentClass} text-xs tracking-widest uppercase ${transitionDuration}">Consultancy Corporation</span>
            </div>
          </a>
          <!-- Desktop Menu -->
          <div class="hidden lg:flex items-center space-x-${isTransparent ? '2' : '1'}">
            <div class="dropdown relative">
              <button class="${aboutBtnClass}">About <i data-lucide="chevron-down" class="w-4 h-4"></i></button>
              <div class="dropdown-menu absolute left-0 top-full mt-${isTransparent ? '2' : '1'} w-52 bg-white border border-gray-100 rounded-xl shadow-${isTransparent ? 'xl' : 'lg'} py-2">
                <a href="about.html" class="block px-4 py-2.5 text-sm text-gray-600 hover:text-primary-900 hover:bg-gray-50 transition-colors">Our Organization</a>
                <a href="career.html" class="block px-4 py-2.5 text-sm text-gray-600 hover:text-primary-900 hover:bg-gray-50 transition-colors">Career</a>
                <a href="news.html" class="block px-4 py-2.5 text-sm text-gray-600 hover:text-primary-900 hover:bg-gray-50 transition-colors">News</a>
              </div>
            </div>
            <div class="dropdown relative">
              <button class="${linkClass} px-4 py-${isTransparent ? '3' : '2'} text-sm font-medium tracking-wide uppercase ${transitionDuration} flex items-center gap-1">Services <i data-lucide="chevron-down" class="w-4 h-4"></i></button>
              <div class="dropdown-menu absolute left-0 top-full mt-${isTransparent ? '2' : '1'} w-56 bg-white border border-gray-100 rounded-xl shadow-${isTransparent ? 'xl' : 'lg'} py-2">
                <a href="services.html#credit-investigation" class="block px-4 py-2.5 text-sm text-gray-600 hover:text-primary-900 hover:bg-gray-50 transition-colors">Credit Investigation</a>
                <a href="services.html#background-investigation" class="block px-4 py-2.5 text-sm text-gray-600 hover:text-primary-900 hover:bg-gray-50 transition-colors">Background Investigation</a>
                <a href="services.html#appraisal-services" class="block px-4 py-2.5 text-sm text-gray-600 hover:text-primary-900 hover:bg-gray-50 transition-colors">Appraisal Services</a>
                <a href="services.html#liaison-services" class="block px-4 py-2.5 text-sm text-gray-600 hover:text-primary-900 hover:bg-gray-50 transition-colors">Liaison Services</a>
                <a href="services.html#loan-marketing" class="block px-4 py-2.5 text-sm text-gray-600 hover:text-primary-900 hover:bg-gray-50 transition-colors">Loan Marketing</a>
                <a href="services.html#collection-services" class="block px-4 py-2.5 text-sm text-gray-600 hover:text-primary-900 hover:bg-gray-50 transition-colors">Collection Services</a>
              </div>
            </div>
            <a href="calculator.html" class="${linkClass} px-4 py-${isTransparent ? '3' : '2'} text-sm font-medium tracking-wide uppercase ${transitionDuration}">Calculator</a>
            <a href="http://192.168.34.86:5173" class="${linkClass} px-4 py-${isTransparent ? '3' : '2'} text-sm font-medium tracking-wide uppercase ${transitionDuration} flex items-center gap-1"> Ecommerce</a>
            <a href="https://negrec.forbesfinancial.mweeb.com/signin" target="_blank" rel="noopener noreferrer" class="${linkClass} px-4 py-${isTransparent ? '3' : '2'} text-sm font-medium tracking-wide uppercase ${transitionDuration} flex items-center gap-1">Login <i data-lucide="external-link" class="w-3.5 h-3.5"></i></a>
            <a href="contact.html" class="${ctaClass} px-6 py-2.5 rounded-lg text-sm font-semibold tracking-wide uppercase transition-all">Book an Appointment</a>
          </div>
          <!-- Mobile Toggle -->
          <button id="mobile-menu-btn" class="${mobileBtnClass}" aria-label="Toggle mobile menu">
            <i data-lucide="menu" class="w-7 h-7" id="menu-icon-open"></i>
            <i data-lucide="x" class="w-7 h-7 hidden" id="menu-icon-close"></i>
          </button>
        </div>
      </div>
      <!-- Mobile Menu -->
      <div id="mobile-menu" class="mobile-menu lg:hidden bg-white border-t border-gray-100">
        <div class="px-4 py-4 space-y-1">
          <div>
            <button class="mobile-dropdown-btn w-full text-left text-gray-600 hover:text-primary-900 px-4 py-3 text-sm font-medium uppercase flex items-center justify-between">About <i data-lucide="chevron-down" class="w-4 h-4 mobile-dropdown-icon transition-transform"></i></button>
            <div class="hidden pl-4 space-y-1">
              <a href="about.html" class="block px-4 py-2 text-sm text-gray-500 hover:text-primary-900">Our Organization</a>
              <a href="career.html" class="block px-4 py-2 text-sm text-gray-500 hover:text-primary-900">Career</a>
              <a href="news.html" class="block px-4 py-2 text-sm text-gray-500 hover:text-primary-900">News</a>
            </div>
          </div>
          <div>
            <button class="mobile-dropdown-btn w-full text-left text-gray-600 hover:text-primary-900 px-4 py-3 text-sm font-medium uppercase flex items-center justify-between">Services <i data-lucide="chevron-down" class="w-4 h-4 mobile-dropdown-icon transition-transform"></i></button>
            <div class="hidden pl-4 space-y-1">
              <a href="services.html#credit-investigation" class="block px-4 py-2 text-sm text-gray-500 hover:text-primary-900">Credit Investigation</a>
              <a href="services.html#background-investigation" class="block px-4 py-2 text-sm text-gray-500 hover:text-primary-900">Background Investigation</a>
              <a href="services.html#appraisal-services" class="block px-4 py-2 text-sm text-gray-500 hover:text-primary-900">Appraisal Services</a>
              <a href="services.html#liaison-services" class="block px-4 py-2 text-sm text-gray-500 hover:text-primary-900">Liaison Services</a>
              <a href="services.html#loan-marketing" class="block px-4 py-2 text-sm text-gray-500 hover:text-primary-900">Loan Marketing</a>
              <a href="services.html#collection-services" class="block px-4 py-2 text-sm text-gray-500 hover:text-primary-900">Collection Services</a>
            </div>
          </div>
          <a href="calculator.html" class="block text-gray-600 hover:text-primary-900 px-4 py-3 text-sm font-medium uppercase">Calculator</a>
          <a href="http://localhost:5173" class="block text-gray-600 hover:text-primary-900 px-4 py-3 text-sm font-medium uppercase flex items-center gap-2"><i data-lucide="car" class="w-4 h-4"></i> Ecommerce</a>
          <a href="https://negrec.forbesfinancial.mweeb.com/signin" target="_blank" rel="noopener noreferrer" class="block text-gray-600 hover:text-primary-900 px-4 py-3 text-sm font-medium uppercase">Login</a>
          <div class="pt-2"><a href="contact.html" class="block bg-primary-900 hover:bg-primary-800 text-white px-4 py-3 rounded-lg text-sm font-semibold text-center uppercase">Book an Appointment</a></div>
        </div>
      </div>
    </nav>`;
  }

  /* ============================
   *  FOOTER
   * ============================ */
  function renderFooter() {
    const container = document.getElementById('footer-container');
    if (!container) return;

    container.innerHTML = `
    <footer class="bg-gray-50 border-t border-gray-100 pt-16 pb-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          <div class="lg:col-span-1">
            <div class="flex items-center space-x-3 mb-6">
              <img src="images/logo.png" alt="FFCC Logo" class="w-12 h-12 rounded-lg object-contain" />
              <div>
                <span class="text-primary-900 font-bold text-lg block leading-tight">FORBES FINANCIAL</span>
                <span class="text-accent text-xs tracking-widest uppercase">Consultancy Corporation</span>
              </div>
            </div>
            <p class="text-gray-400 text-sm leading-relaxed mb-6">Established in 2003, built on INTEGRITY. Your trusted partner in credit information and financial consulting for over 22 years.</p>
            <div class="flex gap-3">
              <a href="https://facebook.com/profile.php?id=61584665866351" target="_blank" rel="noopener noreferrer" class="w-9 h-9 bg-primary-800 hover:bg-accent rounded-lg flex items-center justify-center transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" class="w-9 h-9 bg-primary-800 hover:bg-accent rounded-lg flex items-center justify-center transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a href="mailto:rsalas@forbesfinancial.com.ph" class="w-9 h-9 bg-primary-800 hover:bg-accent rounded-lg flex items-center justify-center transition-colors"><i data-lucide="mail" class="w-4 h-4 text-white"></i></a>
              <a href="https://tiktok.com/@ffcc.ortigas" target="_blank" rel="noopener noreferrer" class="w-9 h-9 bg-primary-800 hover:bg-accent rounded-lg flex items-center justify-center transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.2 8.2 0 0 0 4.79 1.52V6.75a4.85 4.85 0 0 1-1.02-.06z"/></svg>
              </a>
            </div>
          </div>
          <div>
            <h4 class="text-primary-900 font-semibold mb-6">Company</h4>
            <ul class="space-y-3">
              <li><a href="about.html" class="text-gray-500 hover:text-primary-900 text-sm transition-colors">About Us</a></li>
              <li><a href="about.html#team" class="text-gray-500 hover:text-primary-900 text-sm transition-colors">Our Team</a></li>
              <li><a href="career.html" class="text-gray-500 hover:text-primary-900 text-sm transition-colors">Careers</a></li>
              <li><a href="contact.html" class="text-gray-500 hover:text-primary-900 text-sm transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-primary-900 font-semibold mb-6">Services</h4>
            <ul class="space-y-3">
              <li><a href="services.html#credit-investigation" class="text-gray-500 hover:text-primary-900 text-sm transition-colors">Credit Investigation</a></li>
              <li><a href="services.html#background-investigation" class="text-gray-500 hover:text-primary-900 text-sm transition-colors">Background Investigation</a></li>
              <li><a href="services.html#appraisal-services" class="text-gray-500 hover:text-primary-900 text-sm transition-colors">Appraisal Services</a></li>
              <li><a href="services.html#liaison-services" class="text-gray-500 hover:text-primary-900 text-sm transition-colors">Liaison Services</a></li>
              <li><a href="services.html#loan-marketing" class="text-gray-500 hover:text-primary-900 text-sm transition-colors">Loan Marketing</a></li>
              <li><a href="services.html#collection-services" class="text-gray-500 hover:text-primary-900 text-sm transition-colors">Collection Services</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-primary-900 font-semibold mb-6">Contact Info</h4>
            <ul class="space-y-4">
              <li class="flex items-start gap-3"><i data-lucide="map-pin" class="w-5 h-5 text-accent flex-shrink-0 mt-0.5"></i><span class="text-gray-400 text-sm">Philippines</span></li>
              <li class="flex items-start gap-3"><i data-lucide="phone" class="w-5 h-5 text-accent flex-shrink-0 mt-0.5"></i><span class="text-gray-400 text-sm">Contact for inquiry</span></li>
              <li class="flex items-start gap-3"><i data-lucide="mail" class="w-5 h-5 text-accent flex-shrink-0 mt-0.5"></i><a href="mailto:rsalas@forbesfinancial.com.ph" class="text-gray-500 hover:text-primary-900 text-sm transition-colors">rsalas@forbesfinancial.com.ph</a></li>
              <li class="flex items-start gap-3"><i data-lucide="clock" class="w-5 h-5 text-accent flex-shrink-0 mt-0.5"></i><span class="text-gray-400 text-sm">Mon-Fri: 8AM-5PM</span></li>
            </ul>
          </div>
          <div>
              <div class="flex items-center space-x-3 mb-6">
              <img src="images/dpo.png" alt="FFCC Logo" class="w-25 h-25 object-contain" />
             
            </div>
          </div>
        </div>
        <div class="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p class="text-gray-400 text-sm">&copy; <span id="footer-year"></span> Forbes Financial Consultancy Corporation. All rights reserved.</p>
          <div class="flex gap-6">
            <a href="#" class="text-gray-500 hover:text-accent text-sm transition-colors">Privacy Policy</a>
            <a href="#" class="text-gray-500 hover:text-accent text-sm transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>`;
  }

  /* ============================
   *  BACK-TO-TOP BUTTON
   * ============================ */
  function renderBackToTop() {
    // Avoid duplicates
    if (document.getElementById('back-to-top')) return;

    const btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.className = 'fixed bottom-6 right-6 bg-primary-900 hover:bg-primary-800 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center opacity-0 pointer-events-none transition-all z-40';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '<i data-lucide="chevron-up" class="w-5 h-5"></i>';
    document.body.appendChild(btn);
  }

  /* ============================
   *  TOAST CONTAINER
   * ============================ */
  function renderToast() {
    if (document.getElementById('toast')) return;

    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'hidden fixed top-24 right-6 bg-success text-white px-6 py-4 rounded-xl shadow-xl z-50 flex items-center gap-3 max-w-sm';
    document.body.appendChild(toast);
  }

  /* ============================
   *  INITIALIZE
   * ============================ */
  function initApp() {
    renderNavbar();
    renderFooter();
    renderBackToTop();
    renderToast();
  }

  // Run as soon as DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
