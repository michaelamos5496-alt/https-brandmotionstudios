const rootElement = document.documentElement;
const topbar = document.querySelector('.topbar');
const heroSection = document.querySelector('.hero');
const heroImage = document.querySelector('.hero-media img');
const heroScrim = document.querySelector('.hero-scrim');
const heroCopy = document.querySelector('.hero-copy');
const heroScroll = document.querySelector('.hero-scroll');
const featuredSection = document.getElementById('featured');
const themeToggles = Array.from(document.querySelectorAll('[data-theme-toggle]'));
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const mobileMenuBackdrop = document.getElementById('mobileMenuBackdrop');
const mobileMenuLinks = Array.from(document.querySelectorAll('.mobile-menu-links a'));
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const hasGsap = typeof window.gsap !== 'undefined';
const hasScrollTrigger = hasGsap && typeof window.ScrollTrigger !== 'undefined';
const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
const sectionReveals = Array.from(document.querySelectorAll('.section-reveal'));
const portfolioSection = document.getElementById('portfolio');
const portfolioCards = Array.from(document.querySelectorAll('.project-card'));
const filterChips = Array.from(document.querySelectorAll('.filter-chip'));
const filterJumpButtons = Array.from(document.querySelectorAll('[data-filter-jump]'));
const caseStudyButtons = Array.from(document.querySelectorAll('[data-open-case-study]'));
const caseStudyModal = document.getElementById('caseStudyModal');
const caseStudyFilm = document.getElementById('caseStudyFilm');
const caseStudyStills = document.getElementById('caseStudyStills');
const caseStudyType = document.getElementById('caseStudyType');
const caseStudyTitle = document.getElementById('caseStudyTitle');
const caseStudySummary = document.getElementById('caseStudySummary');
const caseStudyOverview = document.getElementById('caseStudyOverview');
const caseStudyDirection = document.getElementById('caseStudyDirection');
const caseStudyProcess = document.getElementById('caseStudyProcess');
const caseStudyDelivery = document.getElementById('caseStudyDelivery');
const caseStudyMeta = document.getElementById('caseStudyMeta');
const caseStudyPlayBtn = document.getElementById('caseStudyPlayBtn');
const playerOverlay = document.getElementById('playerOverlay');
const playerFrame = document.getElementById('playerFrame');
const playerVideo = document.getElementById('playerVideo');
const playerCloseBtn = document.getElementById('playerCloseBtn');
const portraitSection = document.getElementById('portrait-works');
const portraitStack = document.getElementById('portraitStack');
const portraitCards = Array.from(document.querySelectorAll('.portrait-card'));
const portraitPrevBtn = document.getElementById('portraitPrevBtn');
const portraitNextBtn = document.getElementById('portraitNextBtn');
const portraitPlayBtn = document.getElementById('portraitPlayBtn');
const portraitDetailIndex = document.getElementById('portraitDetailIndex');
const portraitDetailTitle = document.getElementById('portraitDetailTitle');
const portraitDetailType = document.getElementById('portraitDetailType');
const portraitDetailDescription = document.getElementById('portraitDetailDescription');
const btsTracks = Array.from(document.querySelectorAll('.bts-track'));
const inquiryForm = document.querySelector('form.inquiry-form');
const countrySelect = document.getElementById('countrySelect');
const projectLocationSelect = document.getElementById('projectLocationSelect');
const phoneInput = document.getElementById('phoneInput');
const themeStorageKey = 'bms-theme';
let activeFilter = 'all';
let activeCaseStudyCard = null;
let lastCaseStudyTrigger = null;
let portraitActiveIndex = 0;
let portraitInView = false;
let portraitPreviewCard = null;
let lastModalTrigger = null;
let projectPreviewObserver = null;
let portfolioPreviewSyncFrame = 0;
let portraitPreviewMountTimer = 0;
let portfolioFilterTimeline = null;
const portfolioPreviewVisibility = new Map();
const revealedPortfolioCards = new WeakSet();

function readStoredTheme() {
  try {
    const stored = localStorage.getItem(themeStorageKey);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {}
  return null;
}

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function updateThemeMeta(theme) {
  if (!themeColorMeta) return;
  themeColorMeta.setAttribute('content', theme === 'dark' ? '#090909' : '#F6F3EC');
}

function updateThemeToggleA11y(theme) {
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  themeToggles.forEach((toggle) => {
    toggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    toggle.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
  });
}

function applyTheme(theme, { persist = true } = {}) {
  if (theme !== 'light' && theme !== 'dark') return;
  rootElement.setAttribute('data-theme', theme);
  rootElement.style.colorScheme = theme;
  updateThemeMeta(theme);
  updateThemeToggleA11y(theme);
  if (!persist) return;
  try {
    localStorage.setItem(themeStorageKey, theme);
  } catch {}
}

function initThemeToggle() {
  const initialTheme = rootElement.getAttribute('data-theme') || readStoredTheme() || getSystemTheme();
  applyTheme(initialTheme, { persist: false });

  themeToggles.forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const currentTheme = rootElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });

    toggle.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        applyTheme('light');
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        applyTheme('dark');
      }
    });
  });

  const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleThemeChange = (event) => {
    if (readStoredTheme()) return;
    applyTheme(event.matches ? 'dark' : 'light', { persist: false });
  };

  if (typeof colorSchemeQuery.addEventListener === 'function') {
    colorSchemeQuery.addEventListener('change', handleThemeChange);
  } else if (typeof colorSchemeQuery.addListener === 'function') {
    colorSchemeQuery.addListener(handleThemeChange);
  }

  requestAnimationFrame(() => rootElement.classList.add('theme-ready'));
}

function isMobileMenuOpen() {
  return menuToggle?.getAttribute('aria-expanded') === 'true';
}

function setMobileMenuOpen(open) {
  if (!menuToggle || !mobileMenu || !mobileMenuBackdrop) return;
  menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  menuToggle.setAttribute('aria-label', open ? 'Close mobile menu' : 'Open mobile menu');
  mobileMenu.hidden = !open;
  mobileMenuBackdrop.hidden = !open;
  document.body.classList.toggle('mobile-menu-open', open);
}

function initMobileMenu() {
  if (!menuToggle || !mobileMenu || !mobileMenuBackdrop) return;
  setMobileMenuOpen(false);

  menuToggle.addEventListener('click', () => {
    setMobileMenuOpen(!isMobileMenuOpen());
  });

  mobileMenuBackdrop.addEventListener('click', () => {
    setMobileMenuOpen(false);
  });

  mobileMenuLinks.forEach((link) => {
    link.addEventListener('click', () => setMobileMenuOpen(false));
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 920 && isMobileMenuOpen()) setMobileMenuOpen(false);
  });
}

function initTopbarScroll() {
  if (!topbar) return;
  const updateState = () => {
    topbar.classList.toggle('is-scrolled', window.scrollY > 24);
  };
  updateState();
  window.addEventListener('scroll', updateState, { passive: true });
}

function createIframe(url, title) {
  const iframe = document.createElement('iframe');
  if (url) iframe.src = url;
  iframe.title = title;
  iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media; clipboard-write; web-share';
  iframe.allowFullscreen = true;
  iframe.loading = 'eager';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.tabIndex = -1;
  return iframe;
}

function deferIframeSource(iframe, url) {
  if (!iframe || !url) return;
  requestAnimationFrame(() => {
    if (!iframe.isConnected) return;
    iframe.src = url;
  });
}

function buildPlayerUrl(url) {
  if (!url) return '';

  let parsedUrl;
  try {
    parsedUrl = new URL(url, window.location.origin);
  } catch {
    return url;
  }

  const host = parsedUrl.hostname.toLowerCase();

  if (host.includes('youtu.be') || host.includes('youtube.com') || host.includes('youtube-nocookie.com')) {
    let videoId = '';
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);

    if (host.includes('youtu.be')) {
      videoId = pathParts[0] || '';
    } else if (pathParts[0] === 'shorts') {
      videoId = pathParts[1] || '';
    } else if (pathParts[0] === 'embed') {
      videoId = pathParts[1] || '';
    } else {
      videoId = parsedUrl.searchParams.get('v') || '';
    }

    const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
    parsedUrl.searchParams.forEach((value, key) => {
      if (key === 'v' || key === 'si') return;
      embedUrl.searchParams.set(key, value);
    });
    embedUrl.searchParams.set('autoplay', '1');
    embedUrl.searchParams.set('controls', '1');
    embedUrl.searchParams.set('rel', '0');
    embedUrl.searchParams.set('playsinline', '1');
    embedUrl.searchParams.set('mute', '0');
    if (videoId) {
      embedUrl.searchParams.set('loop', embedUrl.searchParams.get('loop') || '1');
      embedUrl.searchParams.set('playlist', embedUrl.searchParams.get('playlist') || videoId);
    }
    embedUrl.searchParams.delete('background');
    return embedUrl.toString();
  }

  if (host.includes('vimeo.com')) {
    parsedUrl.searchParams.set('autoplay', '1');
    parsedUrl.searchParams.set('muted', '0');
    parsedUrl.searchParams.set('background', '0');
    parsedUrl.searchParams.set('title', '0');
    parsedUrl.searchParams.set('byline', '0');
    parsedUrl.searchParams.set('portrait', '0');
    return parsedUrl.toString();
  }

  return parsedUrl.toString();
}

function openPlayer(url) {
  if (!playerOverlay || !playerFrame || !playerVideo || !url) return;
  closeCaseStudy({ restoreFocus: false, immediate: true });
  playerOverlay.hidden = false;
  const isMp4 = /\.mp4($|\?)/i.test(url);
  if (isMp4) {
    playerFrame.hidden = true;
    playerFrame.src = '';
    playerVideo.hidden = false;
    playerVideo.src = url;
    playerVideo.currentTime = 0;
    playerVideo.play().catch(() => {});
  } else {
    playerVideo.pause();
    playerVideo.hidden = true;
    playerVideo.src = '';
    playerFrame.hidden = false;
    playerFrame.src = 'about:blank';
    requestAnimationFrame(() => {
      let playerUrl = buildPlayerUrl(url);
      try {
        const fresh = new URL(playerUrl);
        fresh.searchParams.set('_cb', String(Date.now()));
        playerUrl = fresh.toString();
      } catch {}
      playerFrame.src = playerUrl;
    });
  }
  document.body.classList.add('player-open');
  requestAnimationFrame(() => playerOverlay.classList.add('is-open'));
}

function closePlayer() {
  if (!playerOverlay || !playerFrame || !playerVideo) return;
  playerOverlay.classList.remove('is-open');
  document.body.classList.remove('player-open');
  window.setTimeout(() => {
    playerOverlay.hidden = true;
    playerFrame.src = '';
    playerFrame.hidden = false;
    playerVideo.pause();
    playerVideo.src = '';
    playerVideo.hidden = true;
  }, 260);
}

function clearProjectPreview(card) {
  if (!card) return;
  const preview = card.querySelector('.project-card-preview');
  if (preview) preview.remove();
  card.classList.remove('has-preview');
}

function mountProjectPreview(card) {
  if (!card || prefersReducedMotion.matches) return;
  if (card.hidden || card.classList.contains('is-hidden')) return;
  if (card.querySelector('.project-card-preview')) {
    card.classList.add('has-preview');
    return;
  }
  const media = card.querySelector('.project-card-media');
  const previewUrl = card.dataset.previewUrl;
  if (!media || !previewUrl) return;
  const previewShell = document.createElement('div');
  previewShell.className = 'project-card-preview';
  previewShell.setAttribute('aria-hidden', 'true');
  const iframe = createIframe('', `${card.dataset.title || 'Project'} preview`);
  previewShell.append(iframe);
  media.append(previewShell);
  card.classList.add('has-preview');
  deferIframeSource(iframe, previewUrl);
}

function syncPortfolioAutoPreviews() {
  portfolioCards.forEach((card) => {
    if (card.hidden || card.classList.contains('is-hidden')) {
      clearProjectPreview(card);
      return;
    }

    const ratio = Number(portfolioPreviewVisibility.get(card) || 0);
    if (ratio >= 0.18) {
      mountProjectPreview(card);
      return;
    }

    const rect = card.getBoundingClientRect();
    const visibleHeight = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
    const visibleWidth = Math.max(0, Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0));
    const area = rect.width * rect.height || 1;
    const score = (visibleHeight * visibleWidth) / area;

    if (score >= 0.18) {
      mountProjectPreview(card);
    } else {
      clearProjectPreview(card);
    }
  });
}

function requestPortfolioPreviewSync() {
  if (portfolioPreviewSyncFrame) return;
  portfolioPreviewSyncFrame = window.requestAnimationFrame(() => {
    portfolioPreviewSyncFrame = 0;
    syncPortfolioAutoPreviews();
  });
}

function initPortfolioAutoPreviews() {
  if (!portfolioCards.length || prefersReducedMotion.matches) return;

  if ('IntersectionObserver' in window) {
    projectPreviewObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const card = entry.target;
          if (!(card instanceof HTMLElement)) return;
          if (card.hidden || card.classList.contains('is-hidden')) {
            portfolioPreviewVisibility.set(card, 0);
            clearProjectPreview(card);
            return;
          }
          portfolioPreviewVisibility.set(card, entry.isIntersecting ? entry.intersectionRatio : 0);
        });
        requestPortfolioPreviewSync();
      },
      {
        threshold: [0, 0.22, 0.5],
        rootMargin: '10% 0px 10% 0px'
      }
    );

    portfolioCards.forEach((card) => projectPreviewObserver.observe(card));
    window.addEventListener('scroll', requestPortfolioPreviewSync, { passive: true });
    window.addEventListener('resize', requestPortfolioPreviewSync);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        portfolioCards.forEach((card) => clearProjectPreview(card));
        return;
      }
      requestPortfolioPreviewSync();
    });
    requestPortfolioPreviewSync();
    return;
  }

  window.addEventListener('scroll', requestPortfolioPreviewSync, { passive: true });
  window.addEventListener('resize', requestPortfolioPreviewSync);
  requestPortfolioPreviewSync();
}

function updatePortfolioFilterChips(filter) {
  activeFilter = filter;
  filterChips.forEach((chip) => {
    const isActive = chip.dataset.filter === filter;
    chip.classList.toggle('is-active', isActive);
    chip.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

function setPortfolioCardVisibility(card, shouldShow) {
  card.hidden = !shouldShow;
  card.classList.toggle('is-hidden', !shouldShow);
  if (!shouldShow) {
    portfolioPreviewVisibility.set(card, 0);
    clearProjectPreview(card);
  }
}

function setActiveFilter(filter, { animate = true } = {}) {
  if (!portfolioCards.length) return;
  if (filter === activeFilter && animate) {
    requestPortfolioPreviewSync();
    return;
  }

  updatePortfolioFilterChips(filter);

  if (!animate || !hasGsap || prefersReducedMotion.matches) {
    portfolioCards.forEach((card) => {
      const shouldShow = filter === 'all' || card.dataset.category === filter;
      setPortfolioCardVisibility(card, shouldShow);
    });

    requestAnimationFrame(() => {
      requestPortfolioPreviewSync();
      if (hasScrollTrigger) window.ScrollTrigger.refresh();
    });
    return;
  }

  const gsap = window.gsap;
  const outgoingCards = portfolioCards.filter((card) => !card.hidden && filter !== 'all' && card.dataset.category !== filter);
  const incomingCards = portfolioCards.filter((card) => card.hidden && (filter === 'all' || card.dataset.category === filter));

  portfolioFilterTimeline?.kill();
  gsap.killTweensOf([...outgoingCards, ...incomingCards]);

  portfolioFilterTimeline = gsap.timeline({
    defaults: { ease: 'power2.out' },
    onComplete: () => {
      portfolioFilterTimeline = null;
      if (hasScrollTrigger) window.ScrollTrigger.refresh();
      requestPortfolioPreviewSync();
    }
  });

  if (outgoingCards.length) {
    portfolioFilterTimeline.to(outgoingCards, {
      autoAlpha: 0,
      y: 16,
      scale: 0.985,
      duration: 0.26,
      stagger: 0.035,
      overwrite: 'auto'
    });

    portfolioFilterTimeline.add(() => {
      outgoingCards.forEach((card) => {
        setPortfolioCardVisibility(card, false);
        gsap.set(card, { clearProps: 'opacity,transform' });
      });
    });
  }

  portfolioFilterTimeline.add(() => {
    incomingCards.forEach((card) => {
      setPortfolioCardVisibility(card, true);
      gsap.set(card, { autoAlpha: 0, y: 28, scale: 0.985 });
    });

    requestPortfolioPreviewSync();
    if (hasScrollTrigger) window.ScrollTrigger.refresh();
  });

  if (incomingCards.length) {
    portfolioFilterTimeline.to(incomingCards, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 0.72,
      stagger: 0.07,
      ease: 'power3.out',
      overwrite: 'auto',
      onStart: () => incomingCards.forEach((card) => revealedPortfolioCards.add(card)),
      onComplete: () => incomingCards.forEach((card) => gsap.set(card, { clearProps: 'opacity,transform' }))
    }, outgoingCards.length ? '+=0.02' : 0);
  }
}

function findProjectCard(projectId) {
  return portfolioCards.find((card) => card.dataset.projectId === projectId) || null;
}

function populateCaseStudy(card) {
  if (!card || !caseStudyFilm || !caseStudyStills || !caseStudyType || !caseStudyTitle) return;
  activeCaseStudyCard = card;

  caseStudyType.textContent = card.dataset.type || 'Case Study';
  caseStudyTitle.textContent = card.dataset.title || 'Project';
  caseStudySummary.textContent = card.dataset.summary || '';
  caseStudyOverview.textContent = card.dataset.overview || '';
  caseStudyDirection.textContent = card.dataset.direction || '';
  caseStudyProcess.textContent = card.dataset.process || '';
  caseStudyDelivery.textContent = card.dataset.delivery || '';

  caseStudyFilm.innerHTML = '';
  caseStudyFilm.append(createIframe(card.dataset.previewUrl || card.dataset.playUrl || '', `${card.dataset.title || 'Project'} film preview`));

  caseStudyStills.innerHTML = '';
  ['still1', 'still2', 'still3'].forEach((key) => {
    const value = card.dataset[key];
    if (!value) return;
    const img = document.createElement('img');
    img.src = value;
    img.alt = `${card.dataset.title || 'Project'} still`;
    img.loading = 'lazy';
    caseStudyStills.append(img);
  });

  caseStudyMeta.innerHTML = '';
  [card.dataset.type, card.dataset.year, card.dataset.location].filter(Boolean).forEach((item) => {
    const pill = document.createElement('span');
    pill.textContent = item;
    caseStudyMeta.append(pill);
  });
}

function openCaseStudy(projectId, trigger) {
  if (!caseStudyModal) return;
  const card = findProjectCard(projectId);
  if (!card) return;
  populateCaseStudy(card);
  lastCaseStudyTrigger = trigger || document.activeElement;
  caseStudyModal.hidden = false;
  document.body.classList.add('modal-open');
  requestAnimationFrame(() => caseStudyModal.classList.add('is-open'));
}

function closeCaseStudy({ restoreFocus = true, immediate = false } = {}) {
  if (!caseStudyModal || caseStudyModal.hidden) return;
  const finish = () => {
    caseStudyModal.hidden = true;
    document.body.classList.remove('modal-open');
    if (caseStudyFilm) caseStudyFilm.innerHTML = '';
    if (caseStudyStills) caseStudyStills.innerHTML = '';
    if (restoreFocus && lastCaseStudyTrigger instanceof HTMLElement) {
      lastCaseStudyTrigger.focus({ preventScroll: true });
    }
  };

  caseStudyModal.classList.remove('is-open');
  if (immediate) {
    finish();
    return;
  }
  window.setTimeout(finish, 220);
}

function initPortfolioCards() {
  if (!portfolioCards.length) return;

  portfolioCards.forEach((card) => {
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `${card.dataset.title || 'Project'}. Play project.`);
    card.addEventListener('click', () => openPlayer(card.dataset.playUrl || ''));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openPlayer(card.dataset.playUrl || '');
      }
    });
  });

  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => setActiveFilter(chip.dataset.filter || 'all'));
  });

  filterJumpButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetFilter = button.dataset.filterJump || 'all';
      setActiveFilter(targetFilter);
      document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  setActiveFilter('all', { animate: false });
}

function clearPortraitPreview(card) {
  if (!card) return;
  const preview = card.querySelector('.portrait-card-preview');
  if (preview) preview.remove();
  card.classList.remove('has-preview');
  if (portraitPreviewCard === card) portraitPreviewCard = null;
}

function mountPortraitPreview(card) {
  if (!card || !portraitInView || prefersReducedMotion.matches) return;
  if (portraitPreviewCard && portraitPreviewCard !== card) clearPortraitPreview(portraitPreviewCard);
  if (card.querySelector('.portrait-card-preview')) {
    portraitPreviewCard = card;
    card.classList.add('has-preview');
    return;
  }
  const previewUrl = card.dataset.previewUrl;
  if (!previewUrl) return;
  const previewShell = document.createElement('div');
  previewShell.className = 'portrait-card-preview';
  previewShell.setAttribute('aria-hidden', 'true');
  const iframe = createIframe('', `${card.dataset.title || 'Portrait work'} preview`);
  previewShell.append(iframe);
  card.append(previewShell);
  card.classList.add('has-preview');
  portraitPreviewCard = card;
  deferIframeSource(iframe, previewUrl);
}

function getPortraitMetrics(distance) {
  const narrow = window.innerWidth <= 640;
  const compact = window.innerWidth <= 920;
  const xStep = narrow ? 12 : compact ? 18 : 32;
  const yStep = narrow ? 10 : compact ? 14 : 18;
  const rotateStep = narrow ? 0.8 : compact ? 1.4 : 1.8;
  const scaleStep = narrow ? 0.03 : compact ? 0.045 : 0.05;
  return {
    x: `${distance * xStep}px`,
    y: `${distance * yStep}px`,
    rotate: `${distance * rotateStep}deg`,
    scale: `${Math.max(narrow ? 0.86 : 0.78, 1 - distance * scaleStep)}`,
    opacity: `${Math.max(narrow ? 0.34 : 0.26, 1 - distance * 0.08)}`
  };
}

function updatePortraitStack() {
  if (!portraitCards.length) return;
  const total = portraitCards.length;

  portraitCards.forEach((card, index) => {
    const distance = (index - portraitActiveIndex + total) % total;
    const metrics = getPortraitMetrics(distance);
    const isActive = distance === 0;

    card.classList.toggle('is-active', isActive);
    card.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    card.style.setProperty('--portrait-x', metrics.x);
    card.style.setProperty('--portrait-y', metrics.y);
    card.style.setProperty('--portrait-rotate', metrics.rotate);
    card.style.setProperty('--portrait-scale', metrics.scale);
    card.style.setProperty('--portrait-opacity', metrics.opacity);
    card.style.setProperty('--portrait-z', String(total - distance));
  });

  const activeCard = portraitCards[portraitActiveIndex];
  if (!activeCard) return;

  if (portraitDetailIndex) portraitDetailIndex.textContent = activeCard.dataset.index || '01';
  if (portraitDetailTitle) portraitDetailTitle.textContent = activeCard.dataset.title || '';
  if (portraitDetailType) portraitDetailType.textContent = activeCard.dataset.type || '';
  if (portraitDetailDescription) portraitDetailDescription.textContent = activeCard.dataset.description || '';

  portraitCards.forEach((card) => {
    if (card !== activeCard) clearPortraitPreview(card);
  });

  window.clearTimeout(portraitPreviewMountTimer);
  if (portraitInView) {
    portraitPreviewMountTimer = window.setTimeout(() => {
      const latestActiveCard = portraitCards[portraitActiveIndex];
      if (!latestActiveCard || !portraitInView) return;
      mountPortraitPreview(latestActiveCard);
    }, 80);
  }
}

function setPortraitActive(index) {
  if (!portraitCards.length) return;
  const total = portraitCards.length;
  portraitActiveIndex = ((index % total) + total) % total;
  updatePortraitStack();
}

function initPortraitStack() {
  if (!portraitCards.length || !portraitStack) return;

  portraitCards.forEach((card, index) => {
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    card.addEventListener('click', () => {
      if (index === portraitActiveIndex) {
        const activeUrl = portraitCards[portraitActiveIndex]?.dataset.playUrl;
        if (activeUrl) openPlayer(activeUrl);
        return;
      }
      setPortraitActive(index);
    });

    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (index === portraitActiveIndex) {
          const activeUrl = portraitCards[portraitActiveIndex]?.dataset.playUrl;
          if (activeUrl) openPlayer(activeUrl);
          return;
        }
        setPortraitActive(index);
      }
    });
  });

  portraitPrevBtn?.addEventListener('click', () => setPortraitActive(portraitActiveIndex - 1));
  portraitNextBtn?.addEventListener('click', () => setPortraitActive(portraitActiveIndex + 1));
  portraitPlayBtn?.addEventListener('click', () => {
    const activeUrl = portraitCards[portraitActiveIndex]?.dataset.playUrl;
    if (activeUrl) openPlayer(activeUrl);
  });

  portraitStack.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      setPortraitActive(portraitActiveIndex + 1);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setPortraitActive(portraitActiveIndex - 1);
    }
  });

  if (portraitSection) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          portraitInView = entry.isIntersecting && entry.intersectionRatio > 0.2;
          if (portraitInView) {
            updatePortraitStack();
          } else if (portraitPreviewCard) {
            clearPortraitPreview(portraitPreviewCard);
          }
        });
      },
      { threshold: [0, 0.2, 0.5] }
    );
    observer.observe(portraitSection);
  }

  let portraitResizeFrame = 0;
  window.addEventListener('resize', () => {
    if (portraitResizeFrame) window.cancelAnimationFrame(portraitResizeFrame);
    portraitResizeFrame = window.requestAnimationFrame(() => {
      portraitResizeFrame = 0;
      updatePortraitStack();
    });
  });
  updatePortraitStack();
}

function initPlayButtons() {
  document.querySelectorAll('button[data-play-url], a[data-play-url]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      openPlayer(trigger.dataset.playUrl || '');
    });
  });

  playerCloseBtn?.addEventListener('click', closePlayer);
  playerOverlay?.addEventListener('click', (event) => {
    if (event.target === playerOverlay) closePlayer();
  });
}

function initBtsTracks() {
  if (!btsTracks.length) return;
  btsTracks.forEach((track) => {
    if (track.dataset.duplicated === 'true') return;
    const items = Array.from(track.children);
    items.forEach((item) => {
      track.append(item.cloneNode(true));
    });
    track.dataset.duplicated = 'true';
  });

  const fallbackSources = [
    'https://drive.google.com/thumbnail?id=1wFOqZziPPigdY1DwMJLKRPv6eYCdVMoK&sz=w1600',
    'https://drive.google.com/thumbnail?id=1NIxEU31tkqn3pJG2qN1USAL2FbxbdgVk&sz=w1600',
    'https://drive.google.com/thumbnail?id=1nV78iG50IJt8-OziWIUeZgqVAQ-cOaTe&sz=w1600',
    'https://drive.google.com/thumbnail?id=176exgHMKfAWhNQIqDDXd6vUIb4Kbgqbo&sz=w1600',
    'https://drive.google.com/thumbnail?id=1eYBh9xzX_Sqw9F2j4roupoRuS66FBshC&sz=w1600',
    'https://drive.google.com/thumbnail?id=1FWsGSh2Rr8Ytks1aD_AOTAkFKsVUuuyS&sz=w1600',
    'https://drive.google.com/thumbnail?id=1ZeHIWvyk_Tx3XGl0zGSqMuuadx0FX5jR&sz=w1600',
    'https://drive.google.com/thumbnail?id=1eVGVVDzvu9ApOpVY1KLvHWTdoa80WJ_8&sz=w1600'
  ];

  document.querySelectorAll('.bts-frame img').forEach((image, index) => {
    image.referrerPolicy = 'no-referrer';
    image.dataset.fallbackIndex = String(index);
    image.addEventListener('error', () => {
      if (image.dataset.fallbackApplied === 'true') {
        const frame = image.closest('.bts-frame');
        if (frame) frame.style.display = 'none';
        return;
      }

      const fallbackIndex = Number(image.dataset.fallbackIndex || 0);
      image.dataset.fallbackApplied = 'true';
      image.src = fallbackSources[fallbackIndex % fallbackSources.length];
    });
  });
}

function initHeroMotion() {
  if (!heroSection || !heroImage || !heroScrim) return;

  heroSection.classList.add('visible');

  const heroWords = hasGsap ? window.gsap.utils.toArray('.hero-word') : [];
  const heroSecondary = [
    document.querySelector('.hero-subcopy'),
    document.querySelector('.hero-actions'),
    ...Array.from(document.querySelectorAll('.hero-proof-item')),
    heroScroll
  ].filter(Boolean);

  if (!hasGsap || prefersReducedMotion.matches) {
    heroCopy?.classList.add('visible');
    heroScroll?.classList.add('visible');
    heroImage.style.setProperty('--hero-scale', '1');
    heroImage.style.setProperty('--hero-y-offset', '0px');
    heroImage.style.setProperty('--hero-blur', '0px');
    heroImage.style.setProperty('--hero-brightness', '1');
    heroScrim.style.setProperty('--hero-scrim-opacity', '1');
    if (heroCopy) {
      heroCopy.style.opacity = '1';
      heroCopy.style.transform = 'none';
    }
    if (heroScroll) {
      heroScroll.style.opacity = '1';
      heroScroll.style.transform = 'none';
    }
    return;
  }

  const gsap = window.gsap;
  if (hasScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

  gsap.set([heroScroll].filter(Boolean), {
    autoAlpha: 0,
    y: 0
  });
  if (heroWords.length) {
    gsap.set(heroWords, {
      yPercent: 120,
      autoAlpha: 0
    });
  }
  if (heroSecondary.length) {
    gsap.set(heroSecondary, {
      y: 28,
      autoAlpha: 0
    });
  }

  gsap.set(heroImage, {
    autoAlpha: 0,
    '--hero-scale': 1.08,
    '--hero-y-offset': '0px',
    '--hero-blur': '7px',
    '--hero-brightness': 0.9
  });
  gsap.set(heroScrim, { '--hero-scrim-opacity': 0.82 });

  let heroSceneStarted = false;
  const startHeroScene = () => {
    if (heroSceneStarted) return;
    heroSceneStarted = true;
    heroCopy?.classList.add('visible');
    heroScroll?.classList.add('visible');

    const loadTimeline = gsap.timeline({
      defaults: { ease: 'power3.out' }
    });

    loadTimeline.to(heroImage, {
      autoAlpha: 1,
      '--hero-scale': 1,
      '--hero-blur': '0px',
      '--hero-brightness': 1,
      duration: 1.8
    }, 0);

    loadTimeline.to(heroScrim, {
      '--hero-scrim-opacity': 1,
      duration: 1.45,
      ease: 'power2.out'
    }, 0.08);

    if (heroWords.length) {
      loadTimeline.to(heroWords, {
        yPercent: 0,
        autoAlpha: 1,
        duration: 1.02,
        stagger: 0.05,
        ease: 'power4.out',
        clearProps: 'opacity,transform'
      }, 0.18);
    }

    if (heroSecondary.length) {
      loadTimeline.to(heroSecondary, {
        y: 0,
        autoAlpha: 1,
        duration: 0.82,
        stagger: 0.08,
        ease: 'power3.out',
        clearProps: 'opacity,transform'
      }, 0.58);
    }
  };

  const queueHeroScene = () => {
    if (heroImage.complete && heroImage.naturalWidth > 0) {
      if (typeof heroImage.decode === 'function') {
        heroImage.decode().catch(() => {}).finally(startHeroScene);
        return;
      }
      startHeroScene();
      return;
    }

    const onReady = () => {
      heroImage.removeEventListener('load', onReady);
      heroImage.removeEventListener('error', onReady);
      startHeroScene();
    };

    heroImage.addEventListener('load', onReady, { once: true });
    heroImage.addEventListener('error', onReady, { once: true });
    window.setTimeout(startHeroScene, 1600);
  };

  queueHeroScene();

  if (!hasScrollTrigger) return;

  gsap.to(heroImage, {
    '--hero-y-offset': '48px',
    '--hero-brightness': 0.84,
    ease: 'none',
    scrollTrigger: {
      trigger: heroSection,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.8
    }
  });

  gsap.to(heroScrim, {
    '--hero-scrim-opacity': 1.08,
    ease: 'none',
    scrollTrigger: {
      trigger: heroSection,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.8
    }
  });

  if (featuredSection) {
    gsap.to([heroCopy, heroScroll].filter(Boolean), {
      y: -56,
      autoAlpha: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: featuredSection,
        start: 'top 72%',
        end: 'top 36%',
        scrub: 0.8
      }
    });

    gsap.to(heroImage, {
      '--hero-scale': 0.985,
      ease: 'none',
      scrollTrigger: {
        trigger: featuredSection,
        start: 'top 74%',
        end: 'top 30%',
        scrub: 0.8
      }
    });
  }
}

function initPortfolioGalleryMotion() {
  if (!portfolioSection || !portfolioCards.length) return;

  portfolioSection.classList.add('visible');

  if (!hasGsap || prefersReducedMotion.matches) return;

  const gsap = window.gsap;
  if (hasScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

  const portfolioIntro = portfolioSection.querySelector('.portfolio-intro');
  const introHeading = portfolioIntro?.querySelector('.section-head > div');
  const introDescription = portfolioIntro?.querySelector('.section-intro');
  const introFilters = portfolioIntro ? Array.from(portfolioIntro.querySelectorAll('.filter-chip')) : [];
  const portfolioGrid = portfolioSection.querySelector('.portfolio-grid');

  if (portfolioIntro && hasScrollTrigger) {
    const introTimeline = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: {
        trigger: portfolioIntro,
        start: 'top 82%',
        once: true
      }
    });

    if (introHeading) {
      introTimeline.from(introHeading, {
        y: 34,
        autoAlpha: 0,
        duration: 0.8
      });
    }

    if (introDescription) {
      introTimeline.from(introDescription, {
        y: 26,
        autoAlpha: 0,
        duration: 0.7
      }, '-=0.42');
    }

    if (introFilters.length) {
      introTimeline.from(introFilters, {
        y: 18,
        autoAlpha: 0,
        duration: 0.48,
        stagger: 0.06
      }, '-=0.28');
    }

    gsap.matchMedia().add('(min-width: 961px)', () => {
      window.ScrollTrigger.create({
        trigger: portfolioSection,
        start: 'top top+=92',
        end: () => `+=${Math.min(170, Math.max(120, (portfolioGrid?.offsetHeight || 0) * 0.18))}`,
        pin: portfolioIntro,
        pinSpacing: false,
        scrub: false,
        anticipatePin: 1
      });
    });
  }

  const cardsToReveal = portfolioCards.filter((card) => !card.hidden);
  if (cardsToReveal.length && hasScrollTrigger) {
    gsap.set(cardsToReveal, { autoAlpha: 0, y: 34, scale: 0.986 });
  }

  if (hasScrollTrigger) {
    window.ScrollTrigger.batch(portfolioCards, {
      start: 'top 88%',
      once: true,
      onEnter: (batch) => {
        const revealBatch = batch.filter((card) => !card.hidden && !revealedPortfolioCards.has(card));
        if (!revealBatch.length) return;
        revealBatch.forEach((card) => revealedPortfolioCards.add(card));
        gsap.to(revealBatch, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.78,
          stagger: 0.08,
          ease: 'power3.out',
          overwrite: 'auto',
          clearProps: 'opacity,transform'
        });
      }
    });
  }

  if (!isCoarsePointer) {
    portfolioCards.forEach((card) => {
      const poster = card.querySelector('.project-card-media img');
      const overlay = card.querySelector('.project-card-sheen');
      const badge = card.querySelector('.project-card-badge');
      const title = card.querySelector('.project-card-copy h3');
      const kicker = card.querySelector('.project-card-kicker');
      const summary = card.querySelector('.project-card-copy p:last-child');

      if (overlay) gsap.set(overlay, { opacity: 0.56 });

      const enter = () => {
        if (poster) gsap.to(poster, { scale: 1.055, duration: 0.7, ease: 'power3.out', overwrite: 'auto' });
        if (overlay) gsap.to(overlay, { opacity: 0.9, duration: 0.45, ease: 'power2.out', overwrite: 'auto' });
        if (badge) gsap.to(badge, { y: -5, duration: 0.45, ease: 'power2.out', overwrite: 'auto' });
        if (title) gsap.to(title, { y: -2, color: '#ffffff', duration: 0.45, ease: 'power2.out', overwrite: 'auto' });
        if (kicker) gsap.to(kicker, { y: -1, color: 'rgba(245, 241, 232, 0.92)', duration: 0.45, ease: 'power2.out', overwrite: 'auto' });
        if (summary) gsap.to(summary, { color: 'rgba(245, 241, 232, 0.88)', duration: 0.45, ease: 'power2.out', overwrite: 'auto' });
      };

      const leave = () => {
        if (poster) gsap.to(poster, { scale: 1.01, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
        if (overlay) gsap.to(overlay, { opacity: 0.56, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
        if (badge) gsap.to(badge, { y: 0, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
        if (title) gsap.to(title, { y: 0, color: 'rgba(255, 255, 255, 0.96)', duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
        if (kicker) gsap.to(kicker, { y: 0, color: 'rgba(245, 241, 232, 0.72)', duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
        if (summary) gsap.to(summary, { color: 'rgba(220, 221, 225, 0.78)', duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
      };

      card.addEventListener('pointerenter', enter);
      card.addEventListener('pointerleave', leave);
      card.addEventListener('focusin', enter);
      card.addEventListener('focusout', leave);
    });
  }
}

function initSectionReveals() {
  if (!sectionReveals.length) return;

  if (hasGsap && !prefersReducedMotion.matches) {
    const gsap = window.gsap;
    if (hasScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

    gsap.utils.toArray('.section-reveal').forEach((section) => {
      if (section.closest('.hero') || section.id === 'portfolio') return;
      gsap.fromTo(
        section,
        { y: 48, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.9,
          ease: 'power3.out',
          onStart: () => section.classList.add('visible'),
          scrollTrigger: hasScrollTrigger
            ? {
                trigger: section,
                start: 'top 84%',
                once: true
              }
            : undefined
        }
      );
    });

    const btsFrames = document.querySelectorAll('.bts-frame');
    if (btsFrames.length && hasScrollTrigger) {
      gsap.from('.bts-frame', {
        y: 18,
        autoAlpha: 0,
        duration: 0.65,
        stagger: 0.05,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#bts',
          start: 'top 78%',
          once: true
        }
      });
    }

    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.18 }
  );

  sectionReveals.forEach((section) => {
    if (section.closest('.hero')) {
      section.classList.add('visible');
      return;
    }
    observer.observe(section);
  });
}

const countries = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina',
  'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados',
  'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana',
  'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon',
  'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros',
  'Congo (Congo-Brazzaville)', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czechia',
  'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic',
  'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini',
  'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana',
  'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras',
  'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
  'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos',
  'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands',
  'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro',
  'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand',
  'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan',
  'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland',
  'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia',
  'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe',
  'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia',
  'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain',
  'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Tajikistan', 'Tanzania',
  'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey',
  'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom',
  'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
  'Yemen', 'Zambia', 'Zimbabwe'
];

const projectLocationsByCountry = {
  Ghana: ['Accra', 'Kumasi', 'Tamale', 'Takoradi', 'Cape Coast', 'Ho', 'Koforidua', 'Multiple Locations'],
  'United States': ['New York', 'Los Angeles', 'Atlanta', 'Houston', 'Chicago', 'Miami', 'Multiple Locations'],
  'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Glasgow', 'Edinburgh', 'Multiple Locations'],
  Nigeria: ['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Enugu', 'Multiple Locations'],
  'South Africa': ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Multiple Locations'],
  Canada: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Edmonton', 'Multiple Locations'],
  Kenya: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Multiple Locations'],
  France: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Bordeaux', 'Multiple Locations'],
  Germany: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Multiple Locations'],
  India: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Multiple Locations']
};

const dialCodeByCountry = {
  Afghanistan: '+93', Albania: '+355', Algeria: '+213', Andorra: '+376', Angola: '+244', Argentina: '+54',
  Armenia: '+374', Australia: '+61', Austria: '+43', Azerbaijan: '+994', Bahamas: '+1', Bahrain: '+973',
  Bangladesh: '+880', Belgium: '+32', Benin: '+229', Bolivia: '+591', 'Bosnia and Herzegovina': '+387',
  Botswana: '+267', Brazil: '+55', Bulgaria: '+359', 'Burkina Faso': '+226', Burundi: '+257', Cambodia: '+855',
  Cameroon: '+237', Canada: '+1', Chad: '+235', Chile: '+56', China: '+86', Colombia: '+57', Comoros: '+269',
  Congo: '+242', 'Congo (Congo-Brazzaville)': '+242', Croatia: '+385', Cuba: '+53', Cyprus: '+357', Czechia: '+420',
  'Democratic Republic of the Congo': '+243', Denmark: '+45', Djibouti: '+253', Ecuador: '+593', Egypt: '+20',
  Estonia: '+372', Ethiopia: '+251', Finland: '+358', France: '+33', Gabon: '+241', Gambia: '+220', Georgia: '+995',
  Germany: '+49', Ghana: '+233', Greece: '+30', Guinea: '+224', Haiti: '+509', Honduras: '+504', Hungary: '+36',
  Iceland: '+354', India: '+91', Indonesia: '+62', Iran: '+98', Iraq: '+964', Ireland: '+353', Israel: '+972',
  Italy: '+39', Jamaica: '+1', Japan: '+81', Jordan: '+962', Kazakhstan: '+7', Kenya: '+254', Kuwait: '+965',
  Kyrgyzstan: '+996', Latvia: '+371', Lebanon: '+961', Liberia: '+231', Libya: '+218', Lithuania: '+370',
  Luxembourg: '+352', Madagascar: '+261', Malawi: '+265', Malaysia: '+60', Mali: '+223', Malta: '+356',
  Mauritania: '+222', Mauritius: '+230', Mexico: '+52', Moldova: '+373', Monaco: '+377', Mongolia: '+976',
  Montenegro: '+382', Morocco: '+212', Mozambique: '+258', Myanmar: '+95', Namibia: '+264', Nepal: '+977',
  Netherlands: '+31', 'New Zealand': '+64', Niger: '+227', Nigeria: '+234', Norway: '+47', Oman: '+968',
  Pakistan: '+92', Panama: '+507', Paraguay: '+595', Peru: '+51', Philippines: '+63', Poland: '+48', Portugal: '+351',
  Qatar: '+974', Romania: '+40', Russia: '+7', Rwanda: '+250', 'Saudi Arabia': '+966', Senegal: '+221', Serbia: '+381',
  Singapore: '+65', Slovakia: '+421', Slovenia: '+386', Somalia: '+252', 'South Africa': '+27', 'South Korea': '+82',
  Spain: '+34', 'Sri Lanka': '+94', Sudan: '+249', Suriname: '+597', Sweden: '+46', Switzerland: '+41', Syria: '+963',
  Tanzania: '+255', Thailand: '+66', Togo: '+228', Tunisia: '+216', Turkey: '+90', Turkmenistan: '+993', Uganda: '+256',
  Ukraine: '+380', 'United Arab Emirates': '+971', 'United Kingdom': '+44', 'United States': '+1', Uruguay: '+598',
  Uzbekistan: '+998', Venezuela: '+58', Vietnam: '+84', Yemen: '+967', Zambia: '+260', Zimbabwe: '+263'
};

let lastAutoDialCode = '';

function applyDialCodeForCountry(country) {
  if (!phoneInput) return;
  const dialCode = dialCodeByCountry[country];
  const currentValue = phoneInput.value.trim();
  const isEmpty = currentValue.length === 0;
  const hadPreviousAutoPrefix = lastAutoDialCode && currentValue.startsWith(lastAutoDialCode);

  if (!dialCode) {
    phoneInput.placeholder = '+...';
    lastAutoDialCode = '';
    return;
  }

  phoneInput.placeholder = `${dialCode} ...`;
  if (isEmpty || hadPreviousAutoPrefix) {
    phoneInput.value = `${dialCode} `;
  }
  lastAutoDialCode = dialCode;
}

function setProjectLocationOptions(country) {
  if (!projectLocationSelect) return;
  const predefined = projectLocationsByCountry[country];
  const locations = predefined || [
    `Capital City (${country})`,
    `Primary City (${country})`,
    `Secondary City (${country})`,
    `Multiple Locations (${country})`
  ];

  projectLocationSelect.innerHTML = '<option value="">Select project location</option>';
  locations.forEach((location) => {
    const option = document.createElement('option');
    option.value = location;
    option.textContent = location;
    projectLocationSelect.append(option);
  });
  projectLocationSelect.disabled = false;
}

function initInquiryForm() {
  if (!countrySelect || !projectLocationSelect) return;

  countries.forEach((country) => {
    const option = document.createElement('option');
    option.value = country;
    option.textContent = country;
    countrySelect.append(option);
  });

  countrySelect.addEventListener('change', () => {
    const selectedCountry = countrySelect.value;
    if (!selectedCountry) {
      projectLocationSelect.innerHTML = '<option value="">Select country first</option>';
      projectLocationSelect.disabled = true;
      if (phoneInput && !phoneInput.value.trim()) phoneInput.placeholder = '+...';
      lastAutoDialCode = '';
      return;
    }

    setProjectLocationOptions(selectedCountry);
    applyDialCodeForCountry(selectedCountry);
  });
}

window.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (playerOverlay && !playerOverlay.hidden) closePlayer();
  if (caseStudyModal && !caseStudyModal.hidden) closeCaseStudy();
  if (isMobileMenuOpen()) setMobileMenuOpen(false);
});

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

function isReloadNavigation() {
  const navigationEntry = performance.getEntriesByType?.('navigation')?.[0];
  if (navigationEntry && navigationEntry.type === 'reload') return true;
  return typeof performance.navigation !== 'undefined' && performance.navigation.type === 1;
}

function forceHomeOnRefresh() {
  if (!document.getElementById('home')) return;

  if (location.hash) {
    history.replaceState(null, '', `${location.pathname}${location.search}`);
  }

  window.scrollTo(0, 0);
  requestAnimationFrame(() => {
    window.scrollTo(0, 0);
  });
  window.setTimeout(() => {
    window.scrollTo(0, 0);
  }, 80);
}

window.addEventListener('pageshow', (event) => {
  if (event.persisted || isReloadNavigation()) {
    forceHomeOnRefresh();
    return;
  }

  if (!location.hash && document.getElementById('home')) {
    window.scrollTo(0, 0);
  }
});

window.addEventListener('load', () => {
  if (isReloadNavigation()) {
    forceHomeOnRefresh();
  }
});

initThemeToggle();
initMobileMenu();
initTopbarScroll();
initPlayButtons();
initPortfolioCards();
initPortfolioAutoPreviews();
initHeroMotion();
initPortfolioGalleryMotion();
initPortraitStack();
initBtsTracks();
initInquiryForm();
initSectionReveals();
