const sections = document.querySelectorAll('.section-reveal');
const workItems = Array.from(document.querySelectorAll('.work-item'));
const project01Media = document.getElementById('project01Media');
const project02Media = document.querySelector('#project-02 .media-embed');
const project03Media = document.getElementById('project03Media');
const project04Media = document.getElementById('project04Media');
const project05Media = document.getElementById('project05Media');
const project06Media = document.getElementById('project06Media');
const project07Media = document.getElementById('project07Media');
const projectPlayButtons = Array.from(document.querySelectorAll('[data-open-project]'));
const nextThreeBtn = document.getElementById('nextThreeBtn');
const playerOverlay = document.getElementById('playerOverlay');
const playerFrame = document.getElementById('playerFrame');
const playerVideo = document.getElementById('playerVideo');
const playerCloseBtn = document.getElementById('playerCloseBtn');
const inquiryForm = document.querySelector('form.inquiry-form');
const whatsappLink = document.querySelector('a[href^="https://wa.me/"]');
const countrySelect = document.getElementById('countrySelect');
const projectLocationSelect = document.getElementById('projectLocationSelect');
const phoneInput = document.getElementById('phoneInput');
const localPreviewVideos = Array.from(
  document.querySelectorAll(
    '#project-03 .media-still video, #project-04 .media-still video, #project-05 .media-still video, #project-06 .media-still video'
  )
);
const portfolioCards = Array.from(document.querySelectorAll('.work-item'));
const cardsPerPage = 3;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const heroSlideEls = Array.from(document.querySelectorAll('.hero-slide'));
const heroBtsImages = [
  "https://images.pixieset.com/443758701/dbaaa1319f44656b22e2d46608f8a2c2-xxlarge.jpg",
  "https://images.pixieset.com/443758701/da1f1a97ebe986f1a70476a15413e135-xxlarge.jpg",
  "https://images.pixieset.com/443758701/f42eb2e99894a30990a85529b2edc08b-xxlarge.jpg",
  "https://images.pixieset.com/443758701/01b88df056310d4e7958d2d047bb05c5-xxlarge.jpg",
  "https://images.pixieset.com/443758701/a76d64efc01d11cda17c95e37876da88-xxlarge.jpg",
  "https://images.pixieset.com/443758701/FnSa3tuGX8_t1767909644-9eefd635701016ab79e7aa77d8b9c33f.jpg",
  "https://images.pixieset.com/443758701/53ced2d7f457532be49620791576e6f7-xxlarge.jpg",
  "https://images.pixieset.com/443758701/c6834bcff9d3d557540383641a013eaf-xxlarge.jpg"
];
let currentPage = 0;

function resetHeroDolly(slide) {
  if (!slide) return;
  slide.style.animation = 'none';
  // force reflow so the dolly animation restarts on each new slide
  void slide.offsetWidth;
  slide.style.animation = '';
}

function startHeroSlideshow() {
  if (!heroSlideEls.length || !heroBtsImages.length) return;

  const first = heroSlideEls[0];
  const second = heroSlideEls[1];
  first.src = heroBtsImages[0];
  first.classList.add('is-active');
  resetHeroDolly(first);
  if (second) second.src = heroBtsImages[1 % heroBtsImages.length];

  if (prefersReducedMotion.matches || heroSlideEls.length < 2 || heroBtsImages.length < 2) return;

  let activeSlot = 0;
  let nextImageIndex = 1;

  window.setInterval(() => {
    const nextSlot = activeSlot === 0 ? 1 : 0;
    const currentSlide = heroSlideEls[activeSlot];
    const nextSlide = heroSlideEls[nextSlot];
    nextImageIndex = (nextImageIndex + 1) % heroBtsImages.length;
    nextSlide.src = heroBtsImages[nextImageIndex];
    nextSlide.classList.add('is-active');
    resetHeroDolly(nextSlide);
    currentSlide.classList.remove('is-active');
    activeSlot = nextSlot;
  }, 9000);
}

startHeroSlideshow();

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
  Croatia: "+385",
  Cuba: "+53",
  Cyprus: "+357",
  Czechia: "+420",
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
  const dialCode = dialCodeByCountry[country] || "+";
  const currentValue = phoneInput.value.trim();
  const isEmpty = currentValue.length === 0;
  const hadPreviousAutoPrefix = lastAutoDialCode && currentValue.startsWith(lastAutoDialCode);

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

function openProject02Popup(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  openPlayer('https://player.vimeo.com/video/834062800?autoplay=1&title=0&byline=0&portrait=0');
  requestPlayerFullscreen();
}

window.openProject02Popup = openProject02Popup;

function openProject01Popup(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  openPlayer('https://player.vimeo.com/video/1164505617?autoplay=1&title=0&byline=0&portrait=0');
  requestPlayerFullscreen();
}

function openProject03Popup(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  openPlayer(
    'https://player.vimeo.com/video/1123537845?h=1015681fcb&autoplay=1&title=0&byline=0&portrait=0'
  );
  requestPlayerFullscreen();
}

function openProject04Popup(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  openPlayer('https://player.vimeo.com/video/1164509809?fl=tl&fe=ec&autoplay=1&title=0&byline=0&portrait=0');
  requestPlayerFullscreen();
}

function openProject05Popup(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  openPlayer('https://player.vimeo.com/video/1164506458?fl=tl&fe=ec&autoplay=1&title=0&byline=0&portrait=0');
  requestPlayerFullscreen();
}

function openProject06Popup(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  openPlayer('https://player.vimeo.com/video/1091937617?autoplay=1&title=0&byline=0&portrait=0');
  requestPlayerFullscreen();
}

function openProject07Popup(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  openPlayer('https://player.vimeo.com/video/1118476418?autoplay=1&title=0&byline=0&portrait=0');
  requestPlayerFullscreen();
}

function openProjectById(projectId, event) {
  trackEvent('play_video_click', { project_id: projectId || 'unknown' });
  if (projectId === '01') return openProject01Popup(event);
  if (projectId === '02') return openProject02Popup(event);
  if (projectId === '03') return openProject03Popup(event);
  if (projectId === '04') return openProject04Popup(event);
  if (projectId === '05') return openProject05Popup(event);
  if (projectId === '06') return openProject06Popup(event);
  if (projectId === '07') return openProject07Popup(event);
}

window.openProjectById = openProjectById;

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

if (project02Media) {
  project02Media.addEventListener('click', (event) => {
    if (clickedMediaNext(event) || clickedInteractiveInsideMedia(event)) return;
    openProject02Popup(event);
  });
}

if (project01Media) {
  project01Media.addEventListener('click', (event) => {
    if (clickedMediaNext(event) || clickedInteractiveInsideMedia(event)) return;
    openProject01Popup(event);
  });
}

if (project03Media) {
  project03Media.addEventListener('click', (event) => {
    if (clickedMediaNext(event) || clickedInteractiveInsideMedia(event)) return;
    openProject03Popup(event);
  });
}

if (project04Media) {
  project04Media.addEventListener('click', (event) => {
    if (clickedMediaNext(event) || clickedInteractiveInsideMedia(event)) return;
    openProject04Popup(event);
  });
}

if (project05Media) {
  project05Media.addEventListener('click', (event) => {
    if (clickedMediaNext(event) || clickedInteractiveInsideMedia(event)) return;
    openProject05Popup(event);
  });
}

if (project06Media) {
  project06Media.addEventListener('click', (event) => {
    if (clickedMediaNext(event) || clickedInteractiveInsideMedia(event)) return;
    openProject06Popup(event);
  });
}

if (project07Media) {
  project07Media.addEventListener('click', (event) => {
    if (clickedMediaNext(event) || clickedInteractiveInsideMedia(event)) return;
    openProject07Popup(event);
  });
}

if (projectPlayButtons.length) {
  projectPlayButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
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
  if (event.key === 'Escape' && playerOverlay && !playerOverlay.hidden) closePlayer();
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
