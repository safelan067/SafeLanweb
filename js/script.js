(() => {
  document.documentElement.classList.add('js');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

  document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('is-loaded');

    injectMotionElements();
    initNavbar();
    initScrollProgress();
    initActiveLinks();
    initRevealAnimations();
    initSliders();
    initAssessmentDropdown();
    initBackToTop();
    initButtonRipples();
    initCardTilt();
    initHeroParallax();
    initCursorGlow();
    initContactForm();
    initDynamicYear();
  });

  function injectMotionElements() {
    if (!qs('.page-scroll-progress')) {
      const progress = document.createElement('div');
      progress.className = 'page-scroll-progress';
      progress.setAttribute('aria-hidden', 'true');
      document.body.prepend(progress);
    }

    if (!prefersReducedMotion && !qs('.cyber-particles')) {
      const particleLayer = document.createElement('div');
      particleLayer.className = 'cyber-particles';
      particleLayer.setAttribute('aria-hidden', 'true');

      for (let i = 0; i < 26; i += 1) {
        const particle = document.createElement('span');
        particle.style.setProperty('--x', `${Math.random() * 100}%`);
        particle.style.setProperty('--delay', `${Math.random() * 7}s`);
        particle.style.setProperty('--duration', `${8 + Math.random() * 10}s`);
        particle.style.setProperty('--size', `${2 + Math.random() * 4}px`);
        particleLayer.appendChild(particle);
      }

      document.body.appendChild(particleLayer);
    }

    if (!prefersReducedMotion && !qs('.cursor-glow')) {
      const cursorGlow = document.createElement('div');
      cursorGlow.className = 'cursor-glow';
      cursorGlow.setAttribute('aria-hidden', 'true');
      document.body.appendChild(cursorGlow);
    }
  }

  function initNavbar() {
    const navbar = qs('.navbar');
    const navToggle = qs('.nav-toggle');
    const navLinks = qs('.nav-links');
    let lastScrollY = window.scrollY;

    const updateNavbar = () => {
      if (!navbar) return;
      const currentY = window.scrollY;
      navbar.classList.toggle('scrolled', currentY > 12);

      const menuOpen = navLinks?.classList.contains('open');
      const scrollingDown = currentY > lastScrollY && currentY > 180;
      navbar.classList.toggle('nav-hidden', scrollingDown && !menuOpen);
      lastScrollY = Math.max(currentY, 0);
    };

    updateNavbar();
    window.addEventListener('scroll', updateNavbar, { passive: true });

    if (navToggle && navLinks) {
      navToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('open');
        navToggle.classList.toggle('active', isOpen);
        navToggle.setAttribute('aria-expanded', String(isOpen));
        document.body.classList.toggle('nav-open', isOpen);
      });

      qsa('a', navLinks).forEach((link) => {
        link.addEventListener('click', () => {
          navLinks.classList.remove('open');
          navToggle.classList.remove('active');
          navToggle.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('nav-open');
        });
      });
    }
  }

  function initScrollProgress() {
    const progress = qs('.page-scroll-progress');
    if (!progress) return;

    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progressValue = scrollable <= 0 ? 0 : (window.scrollY / scrollable) * 100;
      progress.style.width = `${Math.min(100, Math.max(0, progressValue))}%`;
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
  }

  function initActiveLinks() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    qsa('.nav-links a, .footer-nav a').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('mailto')) return;
      const linkPage = href.split('/').pop();
      link.classList.toggle('active-link', linkPage === currentPage);
    });
  }

  function initRevealAnimations() {
    const animatedSelectors = [
      '.hero-text',
      '.hero-panel',
      '.section-title',
      '.page-title',
      '.page-lead',
      '.about-intro',
      '.feature-box',
      '.content-section',
      '.dashboard-shell',
      '.doc-card',
      '.slide-card-v2',
      '.assessment-container',
      '.profile-card-v3',
      '.contact-info-card',
      '.contact-form-container',
      '.footer-brand',
      '.footer-nav',
      '.footer-bottom'
    ].join(',');

    const revealItems = qsa(animatedSelectors);
    revealItems.forEach((item, index) => {
      item.classList.add('reveal');
      item.style.setProperty('--reveal-delay', `${Math.min(index % 8, 7) * 70}ms`);
    });

    if (prefersReducedMotion) {
      revealItems.forEach((item) => item.classList.add('visible'));
      return;
    }

    if ('IntersectionObserver' in window && revealItems.length) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

      revealItems.forEach((item) => observer.observe(item));
    } else {
      revealItems.forEach((item) => item.classList.add('visible'));
    }
  }

  function initSliders() {
    qsa('[data-slider]').forEach((slider) => {
      const slides = qsa('.slide', slider);
      const prevBtn = qs('.prev', slider);
      const nextBtn = qs('.next', slider);
      const dots = qsa('.dot', slider.parentElement || document);
      let current = slides.findIndex((slide) => slide.classList.contains('active'));
      let autoplayId = null;
      let touchStartX = 0;

      if (current < 0) current = 0;

      if (!qs('.slider-progress', slider)) {
        const bar = document.createElement('div');
        bar.className = 'slider-progress';
        bar.setAttribute('aria-hidden', 'true');
        slider.appendChild(bar);
      }

      const restartProgress = () => {
        const bar = qs('.slider-progress', slider);
        if (!bar || prefersReducedMotion) return;
        bar.classList.remove('is-running');
        void bar.offsetWidth;
        bar.classList.add('is-running');
      };

      const showSlide = (index) => {
        if (!slides.length) return;
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, i) => {
          slide.classList.toggle('active', i === current);
          slide.setAttribute('aria-hidden', String(i !== current));
        });
        dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
        restartProgress();
      };

      const stopAutoplay = () => {
        if (autoplayId) window.clearInterval(autoplayId);
        autoplayId = null;
      };

      const startAutoplay = () => {
        stopAutoplay();
        if (slides.length > 1 && !prefersReducedMotion) {
          autoplayId = window.setInterval(() => showSlide(current + 1), 5600);
        }
      };

      prevBtn?.addEventListener('click', () => showSlide(current - 1));
      nextBtn?.addEventListener('click', () => showSlide(current + 1));
      dots.forEach((dot, index) => dot.addEventListener('click', () => showSlide(index)));

      slider.addEventListener('mouseenter', stopAutoplay);
      slider.addEventListener('mouseleave', startAutoplay);
      slider.addEventListener('focusin', stopAutoplay);
      slider.addEventListener('focusout', startAutoplay);

      slider.addEventListener('touchstart', (event) => {
        touchStartX = event.touches[0].clientX;
      }, { passive: true });

      slider.addEventListener('touchend', (event) => {
        const touchEndX = event.changedTouches[0].clientX;
        const distance = touchEndX - touchStartX;
        if (Math.abs(distance) > 45) showSlide(current + (distance < 0 ? 1 : -1));
      }, { passive: true });

      slider.setAttribute('tabindex', '0');
      slider.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') showSlide(current - 1);
        if (event.key === 'ArrowRight') showSlide(current + 1);
      });

      showSlide(current);
      startAutoplay();
    });
  }

  function initAssessmentDropdown() {
    const assessmentData = {
      'proposal-report': {
        title: 'Proposal Report Submission',
        date: '15th August 2025',
        marks: '6%',
        status: 'Completed',
        desc: 'A Group report explaining how each specific component of the system will be developed over the year. It clearly describes the approach and planned methodology, and explains how the individual component contributes to the final system.',
      },
      'proposal-presentation': {
        title: 'Proposal Presentation',
        date: 'September 2025',
        marks: '6%',
        status: 'Completed',
        desc: 'In this stage, the group presented the initial project proposal to an academic panel, highlighting the research problem and project objectives, explaining the methodology behind the SafeLAN secure file system. Presented between 8th and 12th September 2025 and worth 6%.',
      },
      'progress-presentation-1': {
        title: 'Progress Presentation 1',
        date: 'January 2026',
        marks: '15%',
        status: 'Completed',
        desc: 'At this stage, the project was approximately 50% completed. The team demonstrated current progress and the percentage of completion, explained work completed so far alongside remaining tasks, and provided evidence of development through a live demo, simulation, or partial system walkthrough.',
      },
      'progress-presentation-2': {
        title: 'Progress Presentation 2',
        date: 'March 2026',
        marks: '18%',
        status: 'Completed',
        desc: 'By this point, the project was close to completion and ready for a nearly finished demonstration. All four security components had been integrated into the unified SafeLAN system, with the overall build at least 90% complete, and a working solution was presented to the panel.',
      },
      'checklist-submissions': {
        title: 'Checklist Submissions',
        date: 'January 2026 and April2026',
        marks: '2%',
        status: 'Completed',
        desc: 'Checklist submissions confirm project management evidence and development tracking for the research project.',
      },
      'final-thesis': {
        title: 'Final Thesis Submissions',
        date: 'May 2026',
        marks: 'Individual 15% + Group 4%',
        status: 'Upcoming',
        desc: 'Final individual and group thesis submissions cover the complete research project, including introduction, methodology, results, and findings. Draft versions were required by 26th April 2026, with the individual thesis worth 15% and the group thesis worth 4%.',
      },
      'final-presentation': {
        title: 'Final Presentation',
        date: 'May 2026',
        marks: '10%',
        status: 'Completed',
        desc: 'The complete research project was fully finished for this presentation. The team clearly explained the entire system, walked through the implementation approach, and presented the final results achieved across all four security components.',
      },
    };

    const assessmentSelect = qs('#assessment-select');
    if (!assessmentSelect) return;

    const title = qs('#content-title');
    const date = qs('#content-date');
    const marks = qs('#content-marks');
    const status = qs('#content-status');
    const desc = qs('#content-desc');
    const content = qs('#assessment-content');

    const updateContent = (key) => {
      const data = assessmentData[key];
      if (!data || !title || !date || !marks || !status || !desc || !content) return;

      content.classList.add('is-switching');
      window.setTimeout(() => {
        title.textContent = data.title;
        date.textContent = data.date;
        marks.textContent = data.marks;
        status.textContent = data.status;
        desc.textContent = data.desc;
        content.classList.remove('is-switching');
        content.classList.add('just-updated');
        window.setTimeout(() => content.classList.remove('just-updated'), 420);
      }, 180);
    };

    assessmentSelect.addEventListener('change', (event) => updateContent(event.target.value));
  }

  function initBackToTop() {
    const backToTop = qs('[data-back-to-top]');
    if (!backToTop) return;

    const toggleButton = () => {
      backToTop.classList.toggle('is-visible', window.scrollY > 450);
    };

    toggleButton();
    window.addEventListener('scroll', toggleButton, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  function initButtonRipples() {
    qsa('.btn, .btn-download, .btn-send, .view-link, .back-to-top').forEach((button) => {
      button.addEventListener('click', (event) => {
        if (prefersReducedMotion) return;

        const rect = button.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.left = `${event.clientX - rect.left}px`;
        ripple.style.top = `${event.clientY - rect.top}px`;
        button.appendChild(ripple);

        window.setTimeout(() => ripple.remove(), 650);
      });
    });
  }

  function initCardTilt() {
    if (prefersReducedMotion || window.matchMedia('(pointer: coarse)').matches) return;

    const cards = qsa('.feature-box, .doc-card, .slide-card-v2, .profile-card-v3, .content-section, .contact-info-card, .contact-form-container');

    cards.forEach((card) => {
      card.classList.add('tilt-card');

      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const rotateX = ((y / rect.height) - 0.5) * -6;
        const rotateY = ((x / rect.width) - 0.5) * 6;

        card.style.setProperty('--tilt-x', `${rotateX}deg`);
        card.style.setProperty('--tilt-y', `${rotateY}deg`);
        card.style.setProperty('--glow-x', `${x}px`);
        card.style.setProperty('--glow-y', `${y}px`);
      });

      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
      });
    });
  }

  function initHeroParallax() {
    if (prefersReducedMotion || window.matchMedia('(pointer: coarse)').matches) return;

    const hero = qs('.hero');
    const panel = qs('.hero-panel');
    if (!hero || !panel) return;

    hero.addEventListener('pointermove', (event) => {
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      panel.style.setProperty('--hero-x', `${x * 18}px`);
      panel.style.setProperty('--hero-y', `${y * 18}px`);
    });

    hero.addEventListener('pointerleave', () => {
      panel.style.setProperty('--hero-x', '0px');
      panel.style.setProperty('--hero-y', '0px');
    });
  }

  function initCursorGlow() {
    if (prefersReducedMotion || window.matchMedia('(pointer: coarse)').matches) return;

    const glow = qs('.cursor-glow');
    if (!glow) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    window.addEventListener('pointermove', (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      glow.classList.add('active');
    }, { passive: true });

    const animate = () => {
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      requestAnimationFrame(animate);
    };

    animate();
  }

  function initContactForm() {
    const contactForm = qs('#contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const btn = qs('#submit-btn');
      const overlay = qs('#success-overlay');
      const formData = new FormData();
      formData.append('name', qs('#name')?.value || '');
      formData.append('email', qs('#email')?.value || '');
      formData.append('_replyto', qs('#email')?.value || '');
      formData.append('contact', qs('#contact_number')?.value || '');
      formData.append('message', qs('#message')?.value || '');

      btn?.classList.add('btn-loading');
      if (btn) btn.disabled = true;

      try {
        const response = await fetch('https://formspree.io/f/mpqbpvle', {
          method: 'POST',
          body: formData,
          headers: { Accept: 'application/json' },
        });

        if (!response.ok) throw new Error('Submission failed. Please check the network connection.');
        contactForm.reset();
        overlay?.classList.add('active');
        overlay?.setAttribute('aria-hidden', 'false');
      } catch (error) {
        alert(error.message || 'Error connecting to server.');
      } finally {
        btn?.classList.remove('btn-loading');
        if (btn) btn.disabled = false;
      }
    });
  }

  function initDynamicYear() {
    const yearEl = qs('#current-year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  }
})();

function closeSuccess() {
  const overlay = document.getElementById('success-overlay');
  overlay?.classList.remove('active');
  overlay?.setAttribute('aria-hidden', 'true');
}
