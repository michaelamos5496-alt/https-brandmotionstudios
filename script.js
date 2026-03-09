const sections = document.querySelectorAll('.section-reveal');
const workItems = Array.from(document.querySelectorAll('.work-item'));
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const mobileMenuBackdrop = document.getElementById('mobileMenuBackdrop');
const mobileMenuLinks = Array.from(document.querySelectorAll('.mobile-menu a'));
const themeToggles = Array.from(document.querySelectorAll('[data-theme-toggle]'));
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const rootElement = document.documentElement;
const project01Media = document.getElementById('project01Media');
const project02Media = document.getElementById('project02Media');
const project03Media = document.getElementById('project03Media');
const project04Media = document.getElementById('project04Media');
const project05Media = document.getElementById('project05Media');
const project06Media = document.getElementById('project06Media');
const project07Media = document.getElementById('project07Media');
const project08Media = document.getElementById('project08Media');
const project09Media = document.getElementById('project09Media');
const projectPlayButtons = Array.from(document.querySelectorAll('[data-open-project]'));
const nextThreeBtn = document.getElementById('nextThreeBtn');
const playerOverlay = document.getElementById('playerOverlay');
const playerFrame = document.getElementById('playerFrame');
const playerVideo = document.getElementById('playerVideo');
const playerCloseBtn = document.getElementById('playerCloseBtn');
const pageMorphTransition = document.getElementById('pageMorphTransition');
const pageMorphBlob = document.getElementById('pageMorphBlob');
const inquiryForm = document.querySelector('form.inquiry-form');
const whatsappLink = document.querySelector('a[href^="https://wa.me/"]');
const countrySelect = document.getElementById('countrySelect');
const projectLocationSelect = document.getElementById('projectLocationSelect');
const phoneInput = document.getElementById('phoneInput');
const portraitStack = document.getElementById('portraitStack');
const portraitPrevBtn = document.getElementById('portraitPrevBtn');
const portraitNextBtn = document.getElementById('portraitNextBtn');
const portraitPlayBtn = document.getElementById('portraitPlayBtn');
const localPreviewVideos = Array.from(
  document.querySelectorAll(
    '#project-03 .media-still video, #project-04 .media-still video, #project-05 .media-still video, #project-06 .media-still video'
  )
);
const portfolioCards = Array.from(document.querySelectorAll('.work-item'));
const cardsPerPage = 3;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const hasGsap = typeof window.gsap !== 'undefined';
const hasScrollTrigger = hasGsap && typeof window.ScrollTrigger !== 'undefined';
const hasObserverPlugin = hasGsap && typeof window.Observer !== 'undefined';
const hasSplitText = hasGsap && typeof window.SplitText !== 'undefined';
const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
const pinPanelsMinWidth = 760;
const enablePortfolioPanelPinning = false;
let currentPage = 0;
let isMorphTransitionRunning = false;
let swipeCooldownUntil = 0;
let pinnedPanelTriggers = [];
let pinnedPanelResizeTimer = 0;
let pinnedPanelRefreshTimer = 0;
const themeStorageKey = 'bms-theme';

function trackEvent(name, params = {}) {
  if (!name) return;
  if (typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  }
  if (typeof window.va === 'function') {
    try {
      window.va('event', { name, data: params });
    } catch {}
  }
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: name, ...params });
  }
}

function readStoredTheme() {
  try {
    const stored = localStorage.getItem(themeStorageKey);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {}
  return null;
}

function getSystemTheme() {
  if (!window.matchMedia) return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function updateThemeMeta(theme) {
  if (!themeColorMeta) return;
  themeColorMeta.setAttribute('content', theme === 'dark' ? '#0A0A0A' : '#FFFFFF');
}

function updateToggleA11y(theme) {
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  themeToggles.forEach((button) => {
    button.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    button.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
  });
}

function applyTheme(theme, { persist = true } = {}) {
  if (theme !== 'light' && theme !== 'dark') return;
  rootElement.setAttribute('data-theme', theme);
  rootElement.style.colorScheme = theme;
  updateThemeMeta(theme);
  updateToggleA11y(theme);
  if (!persist) return;
  try {
    localStorage.setItem(themeStorageKey, theme);
  } catch {}
}

function initThemeToggle() {
  const initialTheme = rootElement.getAttribute('data-theme') || readStoredTheme() || getSystemTheme();
  applyTheme(initialTheme, { persist: false });

  if (themeToggles.length) {
    themeToggles.forEach((button) => {
      button.addEventListener('click', () => {
        const currentTheme = rootElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
      });

      button.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          applyTheme('light');
          return;
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          applyTheme('dark');
        }
      });
    });
  }

  if (window.matchMedia) {
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSchemeChange = (event) => {
      if (readStoredTheme()) return;
      applyTheme(event.matches ? 'dark' : 'light', { persist: false });
    };
    if (typeof colorSchemeQuery.addEventListener === 'function') {
      colorSchemeQuery.addEventListener('change', handleSchemeChange);
    } else if (typeof colorSchemeQuery.addListener === 'function') {
      colorSchemeQuery.addListener(handleSchemeChange);
    }
  }

  requestAnimationFrame(() => rootElement.classList.add('theme-ready'));
}

function isMobileMenuOpen() {
  return Boolean(menuToggle && menuToggle.getAttribute('aria-expanded') === 'true');
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
    link.addEventListener('click', () => {
      setMobileMenuOpen(false);
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 760 && isMobileMenuOpen()) {
      setMobileMenuOpen(false);
    }
  });
}

function initGsapAnimations() {
  if (!hasGsap || prefersReducedMotion.matches) return false;
  const gsap = window.gsap;

  if (hasScrollTrigger) {
    gsap.registerPlugin(window.ScrollTrigger);
  }

  document.querySelectorAll('.hero .section-reveal').forEach((el) => el.classList.add('visible'));

  gsap.from('.topbar', {
    y: -20,
    autoAlpha: 0,
    duration: 0.8,
    ease: 'power3.out'
  });

  gsap.from('.menu a', {
    y: -10,
    autoAlpha: 0,
    duration: 0.55,
    stagger: 0.08,
    ease: 'power2.out',
    delay: 0.12
  });

  const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  heroTl
    .from('.hero .kicker', { y: 22, autoAlpha: 0, duration: 0.62 })
    .from('.hero h1', { y: 36, autoAlpha: 0, duration: 0.82 }, '-=0.32')
    .from('.hero .scroll-link', { y: 16, autoAlpha: 0, duration: 0.55 }, '-=0.34');

  if (!hasScrollTrigger) {
    sections.forEach((section) => section.classList.add('visible'));
    return true;
  }

  gsap.utils.toArray('.section-reveal').forEach((section, index) => {
    if (section.closest('.hero')) return;
    const direction = index % 2 === 0 ? 18 : -18;
    gsap.fromTo(
      section,
      { autoAlpha: 0, xPercent: direction, y: 0 },
      {
        autoAlpha: 1,
        xPercent: 0,
        duration: 0.85,
        ease: 'power2.out',
        onStart: () => section.classList.add('visible'),
        scrollTrigger: {
          trigger: section,
          start: 'top 84%',
          once: true
        }
      }
    );
  });

  return true;
}

function clearPinnedPanelTriggers() {
  if (!pinnedPanelTriggers.length) return;
  pinnedPanelTriggers.forEach((trigger) => {
    if (trigger && typeof trigger.kill === 'function') trigger.kill();
  });
  pinnedPanelTriggers = [];
  document.querySelectorAll('.portfolio .work-item.is-pinned').forEach((panel) => {
    panel.classList.remove('is-pinned');
  });
}

function getVisiblePinnedPanels() {
  return Array.from(document.querySelectorAll('.portfolio .work-item')).filter((panel) => {
    if (!(panel instanceof HTMLElement)) return false;
    if (panel.classList.contains('page-hidden')) return false;
    if (panel.offsetParent === null) return false;
    return true;
  });
}

function initPinnedPanelsWithOverscroll() {
  if (!enablePortfolioPanelPinning) {
    clearPinnedPanelTriggers();
    return;
  }

  if (!hasScrollTrigger || prefersReducedMotion.matches) {
    clearPinnedPanelTriggers();
    return;
  }

  if (window.innerWidth < pinPanelsMinWidth) {
    clearPinnedPanelTriggers();
    return;
  }

  clearPinnedPanelTriggers();

  const gsap = window.gsap;
  const { ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  const panels = getVisiblePinnedPanels();

  panels.forEach((panel) => {
    const media = panel.querySelector('.work-media');
    const meta = panel.querySelector('.work-meta');

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: panel,
        start: 'top top+=72',
        end: () => `+=${Math.max(window.innerHeight * 0.58, panel.offsetHeight * 0.42)}`,
        pin: true,
        pinSpacing: true,
        scrub: 0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        fastScrollEnd: true,
        onToggle: (self) => panel.classList.toggle('is-pinned', self.isActive)
      }
    });

    if (media) tl.to(media, { yPercent: -2.5 }, 0);
    if (meta) tl.to(meta, { yPercent: 2.5 }, 0);

    if (tl.scrollTrigger) {
      pinnedPanelTriggers.push(tl.scrollTrigger);
    }
  });

  if (panels.length) {
    ScrollTrigger.refresh();
  }
}

function schedulePinnedPanelsRebuild(delay = 0) {
  if (!hasScrollTrigger) return;
  window.clearTimeout(pinnedPanelRefreshTimer);
  pinnedPanelRefreshTimer = window.setTimeout(() => {
    initPinnedPanelsWithOverscroll();
    if (window.ScrollTrigger) {
      window.ScrollTrigger.refresh();
    }
  }, delay);
}

function initBtsImageResilience() {
  const btsImages = Array.from(document.querySelectorAll('#bts .bts-page-card img'));
  if (!btsImages.length) return;

  btsImages.forEach((img, index) => {
    if (!(img instanceof HTMLImageElement)) return;

    if (index < 3) {
      img.loading = 'eager';
      img.decoding = 'async';
      if (index === 0) img.setAttribute('fetchpriority', 'high');
    }

    const fallbackSrc = img.dataset.fallbackSrc;
    if (!fallbackSrc) return;

    img.addEventListener('error', () => {
      if (img.dataset.fallbackAttempted === '1') {
        img.classList.add('is-bts-broken');
        return;
      }
      img.dataset.fallbackAttempted = '1';
      img.src = fallbackSrc;
    });
  });
}

function initPortraitCardStack() {
  if (!portraitStack) return;
  const stage = portraitStack.querySelector('.portrait-stage');
  if (!stage) return;

  const cards = Array.from(stage.querySelectorAll('.portrait-card'));
  if (!cards.length) return;

  const canAnimate = hasGsap && !prefersReducedMotion.matches;
  let order = [...cards];
  let isAnimating = false;

  const syncPlayA11y = () => {
    if (!portraitPlayBtn) return;
    const title = order[0]?.dataset.title || 'selected portrait work';
    portraitPlayBtn.setAttribute('aria-label', `Play ${title}`);
  };

  const renderStack = ({ immediate = false } = {}) => {
    order.forEach((card, index) => {
      const visible = index < 5;
      const vars = {
        xPercent: -50,
        yPercent: -50,
        x: index * 26,
        y: index * 14,
        rotate: index * 1.35,
        scale: 1 - index * 0.045,
        zIndex: order.length - index,
        autoAlpha: visible ? 1 : 0,
        duration: immediate ? 0 : 0.45,
        ease: 'power3.out'
      };

      card.classList.toggle('is-active', index === 0);
      if (canAnimate) {
        window.gsap.to(card, vars);
      } else {
        card.style.transform = `translate(-50%, -50%) translate(${vars.x}px, ${vars.y}px) rotate(${vars.rotate}deg) scale(${vars.scale})`;
        card.style.zIndex = String(vars.zIndex);
        card.style.opacity = visible ? '1' : '0';
      }
    });
    syncPlayA11y();
  };

  const moveTopToBack = () => {
    if (isAnimating || order.length < 2) return;
    isAnimating = true;
    const first = order.shift();
    order.push(first);
    renderStack();
    window.setTimeout(() => {
      isAnimating = false;
    }, 480);
  };

  const moveBackToTop = () => {
    if (isAnimating || order.length < 2) return;
    isAnimating = true;
    const last = order.pop();
    order.unshift(last);
    renderStack();
    window.setTimeout(() => {
      isAnimating = false;
    }, 480);
  };

  const openTopCard = () => {
    const url = order[0]?.dataset.playUrl;
    if (!url) return;
    trackEvent('play_video_click', { project_id: 'portrait_stack' });
    openPlayer(buildPopupUrlFromPreview(url));
    requestPlayerFullscreen();
  };

  if (portraitNextBtn) {
    portraitNextBtn.addEventListener('click', moveTopToBack);
  }
  if (portraitPrevBtn) {
    portraitPrevBtn.addEventListener('click', moveBackToTop);
  }
  if (portraitPlayBtn) {
    portraitPlayBtn.addEventListener('click', openTopCard);
  }

  stage.addEventListener('click', (event) => {
    const card = event.target instanceof Element ? event.target.closest('.portrait-card') : null;
    if (!card) return;
    const clickedIndex = order.indexOf(card);
    if (clickedIndex === -1) return;
    if (clickedIndex === 0) {
      openTopCard();
      return;
    }
    order.splice(clickedIndex, 1);
    order.unshift(card);
    renderStack();
  });

  portraitStack.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      moveTopToBack();
      return;
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      moveBackToTop();
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openTopCard();
    }
  });

  renderStack({ immediate: true });
}

function getSwipeSections() {
  return Array.from(document.querySelectorAll('main > section, main > .portfolio')).filter((section) => {
    if (!(section instanceof HTMLElement)) return false;
    if (section.offsetParent === null) return false;
    return true;
  });
}

function getClosestSectionIndex(sectionList) {
  const viewportMid = window.innerHeight / 2;
  let bestIndex = 0;
  let bestDistance = Infinity;

  sectionList.forEach((section, index) => {
    const rect = section.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const distance = Math.abs(center - viewportMid);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });

  return bestIndex;
}

function isSwipeEligibleSection(section) {
  if (!section) return false;
  const rect = section.getBoundingClientRect();
  const visibleTop = Math.max(rect.top, 0);
  const visibleBottom = Math.min(rect.bottom, window.innerHeight);
  const visibleHeight = Math.max(0, visibleBottom - visibleTop);
  const visibleRatio = visibleHeight / Math.max(1, Math.min(rect.height, window.innerHeight));
  const compactEnough = section.scrollHeight <= window.innerHeight * 1.35;
  return compactEnough && visibleRatio >= 0.42;
}

function getSectionHash(section) {
  if (!section) return '#home';
  if (section.id) return `#${section.id}`;
  return '#home';
}

function scrollToSectionSmooth(section, hash = '') {
  if (!section) return;
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  updateHashWithoutJump(hash);
}

function handleSwipeNavigation(delta, observerEvent) {
  if (Date.now() < swipeCooldownUntil) return;
  if (isMorphTransitionRunning || document.body.classList.contains('player-open')) return;

  const eventTarget = observerEvent?.event?.target;
  if (
    eventTarget instanceof Element &&
    eventTarget.closest('input, textarea, select, button, iframe, video, .control-btn, .player-overlay')
  ) {
    return;
  }

  const sectionList = getSwipeSections();
  if (sectionList.length < 2) return;

  const currentIndex = getClosestSectionIndex(sectionList);
  const currentSection = sectionList[currentIndex];
  if (!isSwipeEligibleSection(currentSection)) return;

  const nextIndex = Math.max(0, Math.min(sectionList.length - 1, currentIndex + delta));
  if (nextIndex === currentIndex) return;

  const nextSection = sectionList[nextIndex];
  swipeCooldownUntil = Date.now() + 700;
  scrollToSectionSmooth(nextSection, getSectionHash(nextSection));
}

function initGsapSwipeSlider() {
  if (!hasObserverPlugin || prefersReducedMotion.matches || !isCoarsePointer) return;
  const gsap = window.gsap;
  gsap.registerPlugin(window.Observer);

  window.Observer.create({
    target: window,
    type: 'touch,pointer',
    tolerance: 36,
    preventDefault: false,
    onDown: (self) => handleSwipeNavigation(1, self),
    onUp: (self) => handleSwipeNavigation(-1, self)
  });
}

function initAboutSplitAnimation() {
  if (!hasSplitText || prefersReducedMotion.matches) return;
  const gsap = window.gsap;
  const aboutSplitTargets = gsap.utils.toArray('#about .split');
  if (!aboutSplitTargets.length) return;

  aboutSplitTargets.forEach((target) => {
    const split = window.SplitText.create(target, { type: 'words, chars' });
    if (!split || !split.chars || !split.chars.length) return;

    const tweenVars = {
      duration: 1,
      y: 100,
      autoAlpha: 0,
      stagger: 0.05,
      ease: 'power3.out'
    };

    if (hasScrollTrigger) {
      tweenVars.scrollTrigger = {
        trigger: target,
        start: 'top 85%',
        once: true
      };
    }

    gsap.from(split.chars, tweenVars);
  });
}

function randomMorphRadius() {
  const part = () => Math.round(35 + Math.random() * 30);
  return `${part()}% ${part()}% ${part()}% ${part()}% / ${part()}% ${part()}% ${part()}% ${part()}%`;
}

function resolveHashTarget(hash) {
  if (!hash || hash === '#') return null;
  try {
    return document.querySelector(hash);
  } catch {
    return null;
  }
}

function updateHashWithoutJump(hash) {
  if (!hash || hash === '#') return;
  if (history.pushState) {
    history.pushState(null, '', hash);
  } else {
    location.hash = hash;
  }
}

function runMorphTransitionTo(target, hash = '') {
  if (!target) return;

  const canAnimateMorph =
    hasGsap && !prefersReducedMotion.matches && pageMorphTransition && pageMorphBlob;

  if (!canAnimateMorph) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    updateHashWithoutJump(hash);
    return;
  }

  if (isMorphTransitionRunning) return;
  isMorphTransitionRunning = true;

  const gsap = window.gsap;
  document.body.classList.add('page-transitioning');

  gsap.killTweensOf(pageMorphBlob);
  gsap.set(pageMorphTransition, { autoAlpha: 1, visibility: 'visible' });
  gsap.set(pageMorphBlob, {
    left: '50%',
    top: '50%',
    xPercent: -50,
    yPercent: -50,
    scale: 0,
    rotation: 0,
    autoAlpha: 1,
    borderRadius: randomMorphRadius()
  });

  const morphTl = gsap.timeline({
    defaults: { ease: 'power3.inOut' },
    onComplete: () => {
      isMorphTransitionRunning = false;
      document.body.classList.remove('page-transitioning');
      gsap.set(pageMorphTransition, { autoAlpha: 0, visibility: 'hidden' });
    }
  });

  morphTl
    .to(pageMorphBlob, {
      duration: 0.36,
      scale: 12,
      rotation: 95,
      borderRadius: randomMorphRadius()
    })
    .add(() => {
      target.scrollIntoView({ behavior: 'auto', block: 'start' });
      updateHashWithoutJump(hash);
    })
    .to(pageMorphBlob, {
      duration: 0.42,
      scale: 0,
      rotation: 180,
      autoAlpha: 0,
      borderRadius: randomMorphRadius()
    }, '+=0.02');
}

function initMorphPageTransitions() {
  const hasAnchors = document.querySelector('a[href^="#"]');
  if (!hasAnchors) return;

  document.addEventListener('click', (event) => {
    if (event.defaultPrevented) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const el = getEventElementTarget(event);
    if (!el) return;

    const link = el.closest('a[href^="#"]');
    if (!link) return;

    const hash = link.getAttribute('href');
    const target = resolveHashTarget(hash);
    if (!target) return;

    event.preventDefault();
    runMorphTransitionTo(target, hash);
  });

  if (hasGsap && !prefersReducedMotion.matches && pageMorphTransition && pageMorphBlob) {
    const gsap = window.gsap;
    gsap.set(pageMorphTransition, { autoAlpha: 1, visibility: 'visible' });
    gsap.set(pageMorphBlob, {
      left: '50%',
      top: '50%',
      xPercent: -50,
      yPercent: -50,
      scale: 13,
      rotation: 0,
      autoAlpha: 1,
      borderRadius: randomMorphRadius()
    });
    gsap.to(pageMorphBlob, {
      duration: 0.78,
      delay: 0.06,
      scale: 0,
      rotation: 125,
      autoAlpha: 0,
      borderRadius: randomMorphRadius(),
      ease: 'power4.inOut',
      onComplete: () => gsap.set(pageMorphTransition, { autoAlpha: 0, visibility: 'hidden' })
    });
  }
}

const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina",
  "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados",
  "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana",
  "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon",
  "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
  "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia",
  "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini",
  "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana",
  "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras",
  "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos",
  "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands",
  "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro",
  "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand",
  "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan",
  "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland",
  "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia",
  "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe",
  "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia",
  "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain",
  "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania",
  "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey",
  "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom",
  "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen", "Zambia", "Zimbabwe"
];

const projectLocationsByCountry = {
  Ghana: ["Accra", "Kumasi", "Tamale", "Takoradi", "Cape Coast", "Ho", "Koforidua", "Multiple Locations"],
  "United States": ["New York", "Los Angeles", "Atlanta", "Houston", "Chicago", "Miami", "Multiple Locations"],
  "United Kingdom": ["London", "Manchester", "Birmingham", "Liverpool", "Glasgow", "Edinburgh", "Multiple Locations"],
  Nigeria: ["Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan", "Enugu", "Multiple Locations"],
  "South Africa": ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth", "Multiple Locations"],
  Canada: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Edmonton", "Multiple Locations"],
  Kenya: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Multiple Locations"],
  France: ["Paris", "Lyon", "Marseille", "Toulouse", "Bordeaux", "Multiple Locations"],
  Germany: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Multiple Locations"],
  India: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Multiple Locations"]
};

const dialCodeByCountry = {
  Afghanistan: "+93",
  Albania: "+355",
  Algeria: "+213",
  Andorra: "+376",
  Angola: "+244",
  Argentina: "+54",
  Armenia: "+374",
  Australia: "+61",
  Austria: "+43",
  Azerbaijan: "+994",
  Bahamas: "+1",
  Bahrain: "+973",
  Bangladesh: "+880",
  Belgium: "+32",
  Benin: "+229",
  Bolivia: "+591",
  "Bosnia and Herzegovina": "+387",
  Botswana: "+267",
  Brazil: "+55",
  Bulgaria: "+359",
  "Burkina Faso": "+226",
  Burundi: "+257",
  Cambodia: "+855",
  Cameroon: "+237",
  Canada: "+1",
  Chad: "+235",
  Chile: "+56",
  China: "+86",
  Colombia: "+57",
  Comoros: "+269",
  Congo: "+242",
  "Congo (Congo-Brazzaville)": "+242",
  Croatia: "+385",
  Cuba: "+53",
  Cyprus: "+357",
  Czechia: "+420",
  "Democratic Republic of the Congo": "+243",
  Denmark: "+45",
  Djibouti: "+253",
  Ecuador: "+593",
  Egypt: "+20",
  Estonia: "+372",
  Ethiopia: "+251",
  Finland: "+358",
  France: "+33",
  Gabon: "+241",
  Gambia: "+220",
  Georgia: "+995",
  Germany: "+49",
  Ghana: "+233",
  Greece: "+30",
  Guinea: "+224",
  Haiti: "+509",
  Honduras: "+504",
  Hungary: "+36",
  Iceland: "+354",
  India: "+91",
  Indonesia: "+62",
  Iran: "+98",
  Iraq: "+964",
  Ireland: "+353",
  Israel: "+972",
  Italy: "+39",
  Jamaica: "+1",
  Japan: "+81",
  Jordan: "+962",
  Kazakhstan: "+7",
  Kenya: "+254",
  Kuwait: "+965",
  Kyrgyzstan: "+996",
  Latvia: "+371",
  Lebanon: "+961",
  Liberia: "+231",
  Libya: "+218",
  Lithuania: "+370",
  Luxembourg: "+352",
  Madagascar: "+261",
  Malawi: "+265",
  Malaysia: "+60",
  Mali: "+223",
  Malta: "+356",
  Mauritania: "+222",
  Mauritius: "+230",
  Mexico: "+52",
  Moldova: "+373",
  Monaco: "+377",
  Mongolia: "+976",
  Montenegro: "+382",
  Morocco: "+212",
  Mozambique: "+258",
  Myanmar: "+95",
  Namibia: "+264",
  Nepal: "+977",
  Netherlands: "+31",
  "New Zealand": "+64",
  Niger: "+227",
  Nigeria: "+234",
  Norway: "+47",
  Oman: "+968",
  Pakistan: "+92",
  Panama: "+507",
  Paraguay: "+595",
  Peru: "+51",
  Philippines: "+63",
  Poland: "+48",
  Portugal: "+351",
  Qatar: "+974",
  Romania: "+40",
  Russia: "+7",
  Rwanda: "+250",
  "Saudi Arabia": "+966",
  Senegal: "+221",
  Serbia: "+381",
  Singapore: "+65",
  Slovakia: "+421",
  Slovenia: "+386",
  Somalia: "+252",
  "South Africa": "+27",
  "South Korea": "+82",
  Spain: "+34",
  "Sri Lanka": "+94",
  Sudan: "+249",
  Suriname: "+597",
  Sweden: "+46",
  Switzerland: "+41",
  Syria: "+963",
  Tanzania: "+255",
  Thailand: "+66",
  Togo: "+228",
  Tunisia: "+216",
  Turkey: "+90",
  Turkmenistan: "+993",
  Uganda: "+256",
  Ukraine: "+380",
  "United Arab Emirates": "+971",
  "United Kingdom": "+44",
  "United States": "+1",
  Uruguay: "+598",
  Uzbekistan: "+998",
  Venezuela: "+58",
  Vietnam: "+84",
  Yemen: "+967",
  Zambia: "+260",
  Zimbabwe: "+263"
};

let lastAutoDialCode = "";

function applyDialCodeForCountry(country) {
  if (!phoneInput) return;
  const dialCode = dialCodeByCountry[country];
  const currentValue = phoneInput.value.trim();
  const isEmpty = currentValue.length === 0;
  const hadPreviousAutoPrefix = lastAutoDialCode && currentValue.startsWith(lastAutoDialCode);

  if (!dialCode) {
    // Don't overwrite typed values for countries without a mapped dial code.
    phoneInput.placeholder = "+...";
    lastAutoDialCode = "";
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

if (countrySelect && projectLocationSelect) {
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
      if (phoneInput && !phoneInput.value.trim()) phoneInput.placeholder = "+...";
      lastAutoDialCode = "";
      return;
    }
    setProjectLocationOptions(selectedCountry);
    applyDialCodeForCountry(selectedCountry);
  });
}

sections.forEach((section, index) => {
  section.style.setProperty('--reveal-delay', `${Math.min(index * 70, 420)}ms`);
});

workItems.forEach((item, index) => {
  item.style.setProperty('--item-delay', `${(index % cardsPerPage) * 90}ms`);
});

function syncPreviewPlaybackForVisibleCards() {
  localPreviewVideos.forEach((video) => {
    const card = video.closest('.work-item');
    if (!card || card.classList.contains('page-hidden')) {
      try {
        video.pause();
      } catch {}
      return;
    }

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  });
}

function renderPortfolioPage(pageIndex) {
  const totalPages = Math.max(1, Math.ceil(portfolioCards.length / cardsPerPage));
  currentPage = ((pageIndex % totalPages) + totalPages) % totalPages;
  const start = currentPage * cardsPerPage;
  const end = start + cardsPerPage;

  portfolioCards.forEach((card, index) => {
    const inPage = index >= start && index < end;
    card.classList.toggle('page-hidden', !inPage);
  });

  syncPreviewPlaybackForVisibleCards();
  applyWorkParallax();
  schedulePinnedPanelsRebuild(50);
}

function pauseLocalPreviews() {
  localPreviewVideos.forEach((video) => {
    try {
      video.pause();
    } catch {}
  });
}

function resumeLocalPreviews() {
  localPreviewVideos.forEach((video) => {
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  });
}

function applyWorkParallax() {
  if (prefersReducedMotion.matches) return;
  if (window.innerWidth <= 1024) {
    workItems.forEach((item) => {
      item.style.setProperty('--media-shift', '0px');
      item.style.setProperty('--meta-shift', '0px');
    });
    return;
  }
  const viewportMid = window.innerHeight / 2;
  workItems.forEach((item) => {
    if (item.classList.contains('page-hidden')) {
      item.style.setProperty('--media-shift', '0px');
      item.style.setProperty('--meta-shift', '0px');
      return;
    }

    const rect = item.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const distance = (center - viewportMid) / window.innerHeight;
    const clamped = Math.max(-1, Math.min(1, distance));
    item.style.setProperty('--media-shift', `${clamped * -16}px`);
    item.style.setProperty('--meta-shift', `${clamped * 8}px`);
  });
}

function requestPlayerFullscreen() {
  const target = playerVideo && !playerVideo.hidden ? playerVideo : document.querySelector('.player-shell');
  if (!target) return;
  if (target.requestFullscreen) {
    target.requestFullscreen().catch(() => {});
    return;
  }
  if (target.webkitRequestFullscreen) {
    target.webkitRequestFullscreen();
    return;
  }
  if (target.msRequestFullscreen) {
    target.msRequestFullscreen();
  }
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
    resumeLocalPreviews();
  }, 280);
}

function openPlayer(url) {
  if (!playerOverlay || !playerFrame || !playerVideo || !url) return;
  pauseLocalPreviews();
  playerOverlay.hidden = false;
  const isMp4 = url.endsWith('.mp4');
  if (isMp4) {
    playerFrame.src = '';
    playerFrame.hidden = true;
    playerVideo.hidden = false;
    playerVideo.muted = false;
    playerVideo.src = url;
    playerVideo.play().catch(() => {});
  } else {
    playerVideo.pause();
    playerVideo.src = '';
    playerVideo.hidden = true;
    playerFrame.hidden = false;
    playerFrame.src = url;
  }
  document.body.classList.add('player-open');
  requestAnimationFrame(() => playerOverlay.classList.add('is-open'));
}

function buildPopupUrlFromPreview(previewUrl) {
  if (!previewUrl) return '';

  let parsed;
  try {
    parsed = new URL(previewUrl, window.location.origin);
  } catch {
    return previewUrl;
  }

  const host = parsed.hostname.toLowerCase();

  // Keep the same video, but ensure popup playback controls are available.
  if (host.includes('youtube.com') || host.includes('youtu.be')) {
    parsed.searchParams.set('autoplay', '1');
    parsed.searchParams.set('controls', '1');
    parsed.searchParams.set('rel', '0');
    parsed.searchParams.delete('background');
    return parsed.toString();
  }

  if (host.includes('vimeo.com')) {
    parsed.searchParams.set('autoplay', '1');
    parsed.searchParams.set('muted', '0');
    parsed.searchParams.set('background', '0');
    parsed.searchParams.set('title', '0');
    parsed.searchParams.set('byline', '0');
    parsed.searchParams.set('portrait', '0');
    return parsed.toString();
  }

  return parsed.toString();
}

function openProjectFromCard(projectId, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  if (!projectId) return false;

  const article = document.getElementById(`project-${projectId}`);
  if (!article) return false;

  const previewIframe = article.querySelector('.media-still iframe');
  if (previewIframe && previewIframe.src) {
    openPlayer(buildPopupUrlFromPreview(previewIframe.src));
    requestPlayerFullscreen();
    return true;
  }

  const previewVideo = article.querySelector('.media-still video');
  const videoSrc = previewVideo?.currentSrc || previewVideo?.src || '';
  if (videoSrc) {
    openPlayer(videoSrc);
    requestPlayerFullscreen();
    return true;
  }

  return false;
}

function openProject02Popup(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  openPlayer(
    'https://www.youtube.com/embed/5_SDB5Ozl20?autoplay=1&mute=1&loop=1&playlist=5_SDB5Ozl20&controls=1&rel=0'
  );
  requestPlayerFullscreen();
}

window.openProject02Popup = openProject02Popup;

function openProject01Popup(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  openPlayer(
    'https://www.youtube.com/embed/o_P-qo9fI00?autoplay=1&mute=1&loop=1&playlist=o_P-qo9fI00&controls=1&rel=0'
  );
  requestPlayerFullscreen();
}

function openProject03Popup(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  openPlayer('https://player.vimeo.com/video/1164505617?autoplay=1&title=0&byline=0&portrait=0');
  requestPlayerFullscreen();
}

function openProject04Popup(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  openPlayer('https://player.vimeo.com/video/834062800?autoplay=1&title=0&byline=0&portrait=0');
  requestPlayerFullscreen();
}

function openProject05Popup(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  openPlayer(
    'https://player.vimeo.com/video/1123537845?h=1015681fcb&autoplay=1&title=0&byline=0&portrait=0'
  );
  requestPlayerFullscreen();
}

function openProject06Popup(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  openPlayer('https://player.vimeo.com/video/1164509809?fl=tl&fe=ec&autoplay=1&title=0&byline=0&portrait=0');
  requestPlayerFullscreen();
}

function openProject07Popup(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  openPlayer('https://player.vimeo.com/video/1164506458?fl=tl&fe=ec&autoplay=1&title=0&byline=0&portrait=0');
  requestPlayerFullscreen();
}

function openProject08Popup(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  openPlayer('https://player.vimeo.com/video/1091937617?autoplay=1&title=0&byline=0&portrait=0');
  requestPlayerFullscreen();
}

function openProject09Popup(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  openPlayer('https://player.vimeo.com/video/1118476418?autoplay=1&title=0&byline=0&portrait=0');
  requestPlayerFullscreen();
}

function openProjectById(projectId, event) {
  trackEvent('play_video_click', { project_id: projectId || 'unknown' });
  return openProjectFromCard(projectId, event);
}

window.openProjectById = openProjectById;

function openProjectFromElement(element, event) {
  if (!element || typeof element.closest !== 'function') return false;
  const directUrl = element.getAttribute('data-play-url');
  if (directUrl) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    openPlayer(buildPopupUrlFromPreview(directUrl));
    requestPlayerFullscreen();
    return true;
  }
  const article = element.closest('.work-item');
  if (!article || !article.id || !article.id.startsWith('project-')) return false;
  const projectId = article.id.replace('project-', '');
  if (!projectId) return false;
  return openProjectById(projectId, event);
}

function getEventElementTarget(event) {
  const target = event.target;
  if (target instanceof Element) return target;
  if (target && target.parentElement) return target.parentElement;
  return null;
}

function clickedMediaNext(event) {
  const el = getEventElementTarget(event);
  return Boolean(el && el.closest('a.media-next'));
}

function clickedInteractiveInsideMedia(event) {
  const el = getEventElementTarget(event);
  if (!el) return false;
  return Boolean(el.closest('a, button, input, textarea, select, label'));
}

[
  project01Media,
  project02Media,
  project03Media,
  project04Media,
  project05Media,
  project06Media,
  project07Media,
  project08Media,
  project09Media
]
  .filter(Boolean)
  .forEach((mediaEl) => {
    mediaEl.addEventListener('click', (event) => {
      if (clickedMediaNext(event) || clickedInteractiveInsideMedia(event)) return;
      openProjectFromElement(mediaEl, event);
    });
  });

if (projectPlayButtons.length) {
  projectPlayButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
      if (openProjectFromElement(button, event)) return;
      const projectId = button.dataset.openProject;
      openProjectById(projectId, event);
    });
  });
}

if (nextThreeBtn && portfolioCards.length > cardsPerPage) {
  nextThreeBtn.addEventListener('click', () => {
    renderPortfolioPage(currentPage + 1);
    document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

if (portfolioCards.length > cardsPerPage) {
  renderPortfolioPage(0);
} else if (nextThreeBtn) {
  nextThreeBtn.hidden = true;
}

// Delegated fallback so controls keep working even if direct listeners miss.
document.addEventListener('click', (event) => {
  const el = getEventElementTarget(event);
  if (!el) return;
  const trigger = el.closest('[data-open-project]');
  if (!trigger) return;
  if (openProjectFromElement(trigger, event)) return;
  const projectId = trigger.getAttribute('data-open-project');
  openProjectById(projectId, event);
});

if (playerCloseBtn) {
  playerCloseBtn.addEventListener('click', closePlayer);
}

if (whatsappLink) {
  whatsappLink.addEventListener('click', () => {
    trackEvent('whatsapp_click', { location: 'contact_section' });
  });
}

if (inquiryForm) {
  inquiryForm.addEventListener('submit', () => {
    trackEvent('inquiry_submit', { form: 'project-inquiry' });
  });
}

if (playerOverlay) {
  playerOverlay.addEventListener('click', (event) => {
    if (event.target === playerOverlay) closePlayer();
  });
}

window.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (playerOverlay && !playerOverlay.hidden) closePlayer();
  if (isMobileMenuOpen()) setMobileMenuOpen(false);
});

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

window.addEventListener('pageshow', () => {
  if (location.hash) {
    history.replaceState(null, '', `${location.pathname}${location.search}`);
  }
  window.scrollTo(0, 0);
});

initThemeToggle();
initMobileMenu();
initMorphPageTransitions();
initGsapSwipeSlider();
initAboutSplitAnimation();
initBtsImageResilience();
initPortraitCardStack();
schedulePinnedPanelsRebuild(30);

window.addEventListener(
  'load',
  () => {
    schedulePinnedPanelsRebuild(0);
  },
  { once: true }
);

window.addEventListener('resize', () => {
  if (!hasScrollTrigger) return;
  window.clearTimeout(pinnedPanelResizeTimer);
  pinnedPanelResizeTimer = window.setTimeout(() => {
    schedulePinnedPanelsRebuild(0);
  }, 140);
});

const gsapAnimationsReady = initGsapAnimations();

if (!gsapAnimationsReady) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  sections.forEach((section) => observer.observe(section));
}

if (!prefersReducedMotion.matches) {
  let ticking = false;
  const onScrollMotion = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      applyWorkParallax();
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScrollMotion, { passive: true });
  window.addEventListener('resize', onScrollMotion);
  applyWorkParallax();
}

if (workItems.length) {
  let activeItem = null;
  const workObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.dataset.ratio = entry.intersectionRatio.toString();
        if (entry.isIntersecting) entry.target.classList.add('in-view');
      });

      let bestItem = null;
      let bestRatio = 0;
      workItems.forEach((item) => {
        const ratio = Number(item.dataset.ratio || 0);
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestItem = item;
        }
      });

      if (activeItem && activeItem !== bestItem) activeItem.classList.remove('is-active');
      if (bestItem && bestRatio >= 0.2) {
        bestItem.classList.add('is-active');
        activeItem = bestItem;
      } else {
        activeItem = null;
      }
    },
    {
      threshold: [0, 0.2, 0.4, 0.6, 0.8, 1],
      rootMargin: "-10% 0px -20% 0px",
    }
  );

  workItems.forEach((item) => workObserver.observe(item));
}
