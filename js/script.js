/**
 * =========================================================
 *  Forbes Financial Consultancy Corporation — Main Script
 * =========================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Lucide Icons ---------- */
  if (window.lucide) lucide.createIcons();

  /* ---------- DOM References ---------- */
  const navbar           = document.getElementById('navbar');
  const mobileMenuBtn    = document.getElementById('mobile-menu-btn');
  const mobileMenu       = document.getElementById('mobile-menu');
  const menuIconOpen     = document.getElementById('menu-icon-open');
  const menuIconClose    = document.getElementById('menu-icon-close');
  const backToTopBtn     = document.getElementById('back-to-top');
  const footerYear       = document.getElementById('footer-year');

  /* ---------- Footer Year ---------- */
  if (footerYear) footerYear.textContent = new Date().getFullYear();

  /* ---------- Mobile Menu Toggle ---------- */
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      menuIconOpen?.classList.toggle('hidden');
      menuIconClose?.classList.toggle('hidden');
    });
  }

  /* Mobile dropdown sub-menus */
  document.querySelectorAll('.mobile-dropdown-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const content = btn.nextElementSibling;
      if (content) content.classList.toggle('hidden');
      const icon = btn.querySelector('.mobile-dropdown-icon');
      if (icon) icon.classList.toggle('rotate-180');
    });
  });

  /* ---------- Navbar Scroll Effect ---------- */
  const SCROLL_THRESHOLD = 40;
  function handleNavScroll() {
    if (!navbar) return;
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('nav-scrolled');
    } else {
      navbar.classList.remove('nav-scrolled');
    }
  }
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  /* ---------- Desktop Dropdown Click Toggle ---------- */
  document.querySelectorAll('.dropdown > button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const parent = btn.closest('.dropdown');
      // Close other open dropdowns
      document.querySelectorAll('.dropdown.active').forEach(d => {
        if (d !== parent) d.classList.remove('active');
      });
      parent.classList.toggle('active');
    });
  });
  // Close dropdowns when clicking outside
  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown.active').forEach(d => d.classList.remove('active'));
  });

  /* ---------- Back-to-Top Button ---------- */
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTopBtn.classList.remove('opacity-0', 'pointer-events-none');
        backToTopBtn.classList.add('opacity-100');
      } else {
        backToTopBtn.classList.add('opacity-0', 'pointer-events-none');
        backToTopBtn.classList.remove('opacity-100');
      }
    }, { passive: true });
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Scroll Reveal ---------- */
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length > 0 && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('active'));
  }

  /* ---------- Typewriter Effect (index.html) ---------- */
  const typewriterEl = document.getElementById('typewriter');
  if (typewriterEl) {
    const words = [
      'Credit Intelligence',
      'Business Intelligence',
      'Financial Consulting',
      'Recovery Management'
    ];
    let wordIdx = 0, charIdx = 0, deleting = false;
    const TYPE_SPEED = 100, DELETE_SPEED = 50, PAUSE = 2000;

    function typeLoop() {
      const current = words[wordIdx];
      if (!deleting) {
        typewriterEl.textContent = current.substring(0, charIdx + 1);
        charIdx++;
        if (charIdx === current.length) {
          deleting = true;
          setTimeout(typeLoop, PAUSE);
          return;
        }
      } else {
        typewriterEl.textContent = current.substring(0, charIdx - 1);
        charIdx--;
        if (charIdx === 0) {
          deleting = false;
          wordIdx = (wordIdx + 1) % words.length;
        }
      }
      setTimeout(typeLoop, deleting ? DELETE_SPEED : TYPE_SPEED);
    }
    typeLoop();
  }

  /* ---------- Stat Counter Animation (index.html & about.html) ---------- */
  const statCounters = document.querySelectorAll('[data-count]');
  if (statCounters.length > 0 && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    statCounters.forEach(el => counterObserver.observe(el));
  }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const duration = 2000;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuad
      const ease = 1 - (1 - progress) * (1 - progress);
      el.textContent = Math.floor(ease * target);
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target;
      }
    }
    requestAnimationFrame(tick);
  }

  /* ---------- About Carousel (about.html) ---------- */
  const carousel = document.getElementById('about-carousel');
  if (carousel) {
    const slides = carousel.querySelectorAll('.carousel-slide');
    const carouselSection = carousel.closest('section') || document;
    const prevBtn = document.getElementById('carousel-prev') || carouselSection.querySelector('.carousel-prev');
    const nextBtn = document.getElementById('carousel-next') || carouselSection.querySelector('.carousel-next');
    const dots = carouselSection.querySelectorAll('.carousel-dot');
    let currentSlide = 0;
    let autoplayTimer;

    function goToSlide(idx) {
      slides.forEach(s => s.classList.remove('active'));
      dots.forEach(d => d.classList.remove('bg-accent'));
      dots.forEach(d => d.classList.add('bg-gray-400'));
      currentSlide = (idx + slides.length) % slides.length;
      slides[currentSlide].classList.add('active');
      if (dots[currentSlide]) {
        dots[currentSlide].classList.add('bg-accent');
        dots[currentSlide].classList.remove('bg-gray-400');
      }
    }

    function startAutoplay() {
      autoplayTimer = setInterval(() => goToSlide(currentSlide + 1), 5000);
    }

    function resetAutoplay() {
      clearInterval(autoplayTimer);
      startAutoplay();
    }

    if (prevBtn) prevBtn.addEventListener('click', () => { goToSlide(currentSlide - 1); resetAutoplay(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { goToSlide(currentSlide + 1); resetAutoplay(); });
    dots.forEach((dot, i) => dot.addEventListener('click', () => { goToSlide(i); resetAutoplay(); }));

    goToSlide(0);
    startAutoplay();
  }

  /* ---------- Hero Carousel (index.html) ---------- */
  const heroCarousel = document.getElementById('hero-carousel');
  if (heroCarousel) {
    const heroSlides = heroCarousel.querySelectorAll('.hero-slide');
    const heroDots   = heroCarousel.querySelectorAll('.hero-dot');
    let heroIdx = 0;
    let heroTimer;

    function heroGoTo(idx) {
      heroSlides.forEach(s => s.classList.remove('active'));
      heroDots.forEach(d => { d.classList.remove('bg-white/80'); d.classList.add('bg-white/30'); });
      heroIdx = (idx + heroSlides.length) % heroSlides.length;
      heroSlides[heroIdx].classList.add('active');
      if (heroDots[heroIdx]) {
        heroDots[heroIdx].classList.add('bg-white/80');
        heroDots[heroIdx].classList.remove('bg-white/30');
      }
    }

    function heroAutoplay() { heroTimer = setInterval(() => heroGoTo(heroIdx + 1), 5000); }
    function heroResetAutoplay() { clearInterval(heroTimer); heroAutoplay(); }

    heroDots.forEach((dot, i) => dot.addEventListener('click', () => { heroGoTo(i); heroResetAutoplay(); }));

    heroGoTo(0);
    heroAutoplay();
  }

  /* ---------- Loan Calculator (calculator.html) ---------- */
  const calcBtn = document.getElementById('calc-btn');
  if (calcBtn) {
    const productType   = document.getElementById('product_type');
    const loanPriceEl   = document.getElementById('loan_price');
    const downPaymentEl = document.getElementById('down_payment');
    const loanTermEl    = document.getElementById('loan_term');
    const interestEl    = document.getElementById('interest_rate');

    // Interest rate options per product type
    const ratesMap = {
      generic:     [2.5, 3.0, 3.5],
      ofw:         [2.5, 3.0, 3.5],
      real_estate: [1.0, 1.5, 2.0],
    };

    function populateRates() {
      const rates = ratesMap[productType.value] || ratesMap.generic;
      interestEl.innerHTML = '';
      rates.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r;
        opt.textContent = r.toFixed(1) + '% / month';
        interestEl.appendChild(opt);
      });
    }

    productType.addEventListener('change', populateRates);
    populateRates(); // Initialise on load

    calcBtn.addEventListener('click', () => {
      const loanPrice = parseFloat(loanPriceEl.value) || 0;
      const downPayment = parseFloat(downPaymentEl.value) || 0;
      const termMonths = parseInt(loanTermEl.value, 10) || 12;
      const rate = parseFloat(interestEl.value) || 0;

      if (loanPrice <= 0) {
        loanPriceEl.focus();
        loanPriceEl.classList.add('border-error');
        setTimeout(() => loanPriceEl.classList.remove('border-error'), 2000);
        return;
      }

      const financed = Math.max(loanPrice - downPayment, 0);
      const rateDecimal = rate / 100;
      const totalInterest = financed * rateDecimal * termMonths;
      const totalPayable = financed + totalInterest;
      const monthlyPayment = termMonths > 0 ? totalPayable / termMonths : 0;

      const productLabels = { generic: 'Generic Loan Marketing', ofw: 'OFW Loan', real_estate: 'Real Estate Mortgage' };
      const fmt = v => '₱' + v.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      document.getElementById('monthly-payment').textContent   = fmt(monthlyPayment);
      document.getElementById('result-loan-price').textContent  = fmt(loanPrice);
      document.getElementById('result-down-payment').textContent = fmt(downPayment);
      document.getElementById('result-financed').textContent    = fmt(financed);
      document.getElementById('result-product').textContent     = productLabels[productType.value] || productType.value;
      document.getElementById('result-rate').textContent        = rate.toFixed(1) + '% / month';
      document.getElementById('result-term').textContent        = termMonths + ' Months';
      document.getElementById('result-interest').textContent    = fmt(totalInterest);
    });
  }

  /* ---------- Contact Form Validation (contact.html) ---------- */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateContactForm()) return;

      const formData = new FormData(contactForm);
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> Sending...';
      if (window.lucide) lucide.createIcons();

      try {
        const response = await fetch('php/contact.php', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (data.success) {
          showToast('Message sent successfully!', 'success');
          contactForm.reset();
          clearErrors(contactForm);
        } else {
          showToast(data.message || 'Something went wrong. Please try again.', 'error');
        }
      } catch {
        showToast('Could not send message. Please try again later.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        if (window.lucide) lucide.createIcons();
      }
    });
  }

  function validateContactForm() {
    let valid = true;
    const form = document.getElementById('contact-form');
    if (!form) return false;
    clearErrors(form);

    const name    = form.querySelector('#full_name');
    const email   = form.querySelector('#email');
    const message = form.querySelector('#message');

    if (!name.value.trim()) { showFieldError(name, 'Full name is required.'); valid = false; }
    if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { showFieldError(email, 'A valid email is required.'); valid = false; }
    if (!message.value.trim() || message.value.trim().length < 10) { showFieldError(message, 'Message must be at least 10 characters.'); valid = false; }

    return valid;
  }

  /* ---------- Career Form Validation (career.html) ---------- */
  const careerForm = document.getElementById('career-form');
  if (careerForm) {
    // Resume file name display
    const resumeInput = careerForm.querySelector('#resume');
    const fileNameDisplay = careerForm.querySelector('#file-name');
    if (resumeInput && fileNameDisplay) {
      resumeInput.addEventListener('change', () => {
        if (resumeInput.files.length > 0) {
          fileNameDisplay.textContent = resumeInput.files[0].name;
          fileNameDisplay.classList.remove('hidden');
        } else {
          fileNameDisplay.textContent = '';
          fileNameDisplay.classList.add('hidden');
        }
      });
    }

    careerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!validateCareerForm()) return;

      const formData = new FormData(careerForm);
      const submitBtn = careerForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> Submitting...';
      if (window.lucide) lucide.createIcons();

      try {
        const response = await fetch('php/career.php', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (data.success) {
          showToast('Application submitted! We\'ll be in touch.', 'success');
          careerForm.reset();
          clearErrors(careerForm);
          if (fileNameDisplay) { fileNameDisplay.textContent = ''; fileNameDisplay.classList.add('hidden'); }
        } else {
          showToast(data.message || 'Something went wrong. Please try again.', 'error');
        }
      } catch {
        showToast('Could not submit application. Please try again later.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        if (window.lucide) lucide.createIcons();
      }
    });
  }

  function validateCareerForm() {
    let valid = true;
    const form = document.getElementById('career-form');
    if (!form) return false;
    clearErrors(form);

    const firstName = form.querySelector('#first_name');
    const lastName  = form.querySelector('#last_name');
    const email     = form.querySelector('#email');
    const phone     = form.querySelector('#phone');

    if (!firstName.value.trim()) { showFieldError(firstName, 'First name is required.'); valid = false; }
    if (!lastName.value.trim())  { showFieldError(lastName, 'Last name is required.'); valid = false; }
    if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { showFieldError(email, 'A valid email is required.'); valid = false; }
    if (!phone.value.trim()) { showFieldError(phone, 'Phone number is required.'); valid = false; }

    return valid;
  }

  /* ---------- Form Helpers ---------- */
  function showFieldError(input, msg) {
    input.classList.add('border-error');
    const errEl = input.parentElement.querySelector('.error-message');
    if (errEl) {
      errEl.textContent = msg;
      errEl.classList.remove('hidden');
    }
  }

  function clearErrors(form) {
    form.querySelectorAll('.border-error').forEach(el => el.classList.remove('border-error'));
    form.querySelectorAll('.error-message').forEach(el => { el.textContent = ''; el.classList.add('hidden'); });
  }

  /* ---------- Toast Notification ---------- */
  function showToast(message, type) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    const colors = { success: 'bg-success', error: 'bg-error', warning: 'bg-warning' };
    const icons  = { success: 'check-circle', error: 'x-circle', warning: 'alert-triangle' };
    const bg = colors[type] || colors.success;

    toast.className = `fixed top-24 right-6 z-50 ${bg} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 transition-all transform translate-x-0`;
    toast.innerHTML = `<i data-lucide="${icons[type] || 'info'}" class="w-5 h-5 flex-shrink-0"></i><span class="text-sm font-medium">${escapeHtml(message)}</span>`;
    if (window.lucide) lucide.createIcons();

    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 5000);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }
});
