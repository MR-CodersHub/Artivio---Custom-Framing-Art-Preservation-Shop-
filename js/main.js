// Apply saved theme and direction immediately to prevent flash
(function() {
  const savedTheme = localStorage.getItem('artivio_theme') || localStorage.getItem('lartisan_theme');
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  const savedDir = localStorage.getItem('artivio_direction') || localStorage.getItem('lartisan_direction');
  if (savedDir === 'rtl') {
    document.documentElement.setAttribute('dir', 'rtl');
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initRtlToggle();
  initStickyHeader();
  initMobileDrawer();
  initActiveNav();
  initBackToTop();
  initCurrentYear();
});

/**
 * Dark / Light Theme Toggle with LocalStorage persistence
 */
function initThemeToggle() {
  const themeBtns = document.querySelectorAll('.theme-toggle-btn, .theme-toggle-btn-mobile');
  if (!themeBtns.length) return;

  const updateThemeUI = (theme) => {
    themeBtns.forEach(btn => {
      const moon = btn.querySelector('.theme-icon-moon');
      const sun = btn.querySelector('.theme-icon-sun');
      const label = btn.querySelector('.theme-label-mobile');
      if (moon && sun) {
        if (theme === 'dark') {
          moon.style.display = 'none';
          sun.style.display = 'block';
        } else {
          moon.style.display = 'block';
          sun.style.display = 'none';
        }
      }
      if (label) {
        label.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
      }
    });
  };

  const currentTheme = localStorage.getItem('artivio_theme') || localStorage.getItem('lartisan_theme') || 'light';
  updateThemeUI(currentTheme);

  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      
      if (newTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      
      localStorage.setItem('artivio_theme', newTheme);
      localStorage.setItem('lartisan_theme', newTheme);
      updateThemeUI(newTheme);
    });
  });
}

/**
 * RTL / LTR Direction Toggle with LocalStorage persistence
 */
function initRtlToggle() {
  const rtlBtns = document.querySelectorAll('.rtl-toggle-btn, .rtl-toggle-btn-mobile');
  if (!rtlBtns.length) return;

  const updateRtlUI = (dir) => {
    rtlBtns.forEach(btn => {
      const textSpan = btn.querySelector('.rtl-toggle-text');
      const mobileLabel = btn.querySelector('.rtl-label-mobile');
      if (textSpan) {
        textSpan.textContent = dir === 'rtl' ? 'LTR' : 'RTL';
      }
      if (mobileLabel) {
        mobileLabel.textContent = dir === 'rtl' ? '⇄ Switch to LTR' : '⇄ Switch to RTL';
      }
    });
  };

  const currentDir = localStorage.getItem('artivio_direction') || localStorage.getItem('lartisan_direction') || 'ltr';
  updateRtlUI(currentDir);

  rtlBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const activeDir = document.documentElement.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr';
      const newDir = activeDir === 'rtl' ? 'ltr' : 'rtl';
      
      if (newDir === 'rtl') {
        document.documentElement.setAttribute('dir', 'rtl');
      } else {
        document.documentElement.setAttribute('dir', 'ltr');
      }
      
      localStorage.setItem('artivio_direction', newDir);
      localStorage.setItem('lartisan_direction', newDir);
      updateRtlUI(newDir);
    });
  });
}

/**
 * Sticky Header Scroll State
 */
function initStickyHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/**
 * Responsive Mobile Menu Drawer
 */
function initMobileDrawer() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  const backdrop = document.querySelector('.drawer-backdrop');
  const closeBtn = document.querySelector('.drawer-close');

  if (!toggleBtn || !drawer || !backdrop) return;

  const openDrawer = () => {
    toggleBtn.classList.add('active');
    toggleBtn.setAttribute('aria-expanded', 'true');
    drawer.classList.add('open');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    toggleBtn.classList.remove('active');
    toggleBtn.setAttribute('aria-expanded', 'false');
    drawer.classList.remove('open');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  };

  toggleBtn.addEventListener('click', () => {
    if (drawer.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', closeDrawer);
  }

  backdrop.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  // Close drawer on desktop resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 992 && drawer.classList.contains('open')) {
      closeDrawer();
    }
  }, { passive: true });

  // Close drawer when a link is clicked
  const drawerLinks = drawer.querySelectorAll('a');
  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

/**
 * Active Navigation Highlight based on current file
 */
function initActiveNav() {
  const path = window.location.pathname;
  const page = path.split('/').pop() || 'index.html';

  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * Back to Top Button
 */
function initBackToTop() {
  const backToTopBtn = document.querySelector('.back-to-top');
  if (!backToTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }, { passive: true });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/**
 * Update Current Year in Footer
 */
function initCurrentYear() {
  const yearSpans = document.querySelectorAll('.current-year');
  const currentYear = new Date().getFullYear();
  yearSpans.forEach(span => {
    span.textContent = currentYear;
  });
}
