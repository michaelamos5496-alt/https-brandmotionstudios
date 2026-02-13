const sections = document.querySelectorAll('.section-reveal');
const workItems = Array.from(document.querySelectorAll('.work-item'));
const project01Media = document.getElementById('project01Media');
const project02Media = document.querySelector('#project-02 .media-embed');
const project03Media = document.getElementById('project03Media');
const project04Media = document.getElementById('project04Media');
const project05Media = document.getElementById('project05Media');
const project06Media = document.getElementById('project06Media');
const projectPlayButtons = Array.from(document.querySelectorAll('[data-open-project]'));
const nextThreeBtn = document.getElementById('nextThreeBtn');
const playerOverlay = document.getElementById('playerOverlay');
const playerFrame = document.getElementById('playerFrame');
const playerVideo = document.getElementById('playerVideo');
const playerCloseBtn = document.getElementById('playerCloseBtn');
const localPreviewVideos = Array.from(
  document.querySelectorAll(
    '#project-03 .media-still video, #project-04 .media-still video, #project-05 .media-still video, #project-06 .media-still video'
  )
);
const portfolioCards = Array.from(document.querySelectorAll('.work-item'));
const cardsPerPage = 3;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let currentPage = 0;

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
  openPlayer(
    'https://player.vimeo.com/video/1123537845?h=1015681fcb&autoplay=1&title=0&byline=0&portrait=0'
  );
  requestPlayerFullscreen();
}

window.openProject02Popup = openProject02Popup;

function openProject01Popup(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  openPlayer('https://player.vimeo.com/video/834062800?autoplay=1&title=0&byline=0&portrait=0');
  requestPlayerFullscreen();
}

function openProject03Popup(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  openPlayer('https://player.vimeo.com/video/1164509809?fl=tl&fe=ec&autoplay=1&title=0&byline=0&portrait=0');
  requestPlayerFullscreen();
}

function openProject04Popup(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  openPlayer('https://player.vimeo.com/video/1164506458?fl=tl&fe=ec&autoplay=1&title=0&byline=0&portrait=0');
  requestPlayerFullscreen();
}

function openProject05Popup(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  openPlayer('https://player.vimeo.com/video/1091937617?autoplay=1&title=0&byline=0&portrait=0');
  requestPlayerFullscreen();
}

function openProject06Popup(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  openPlayer('https://player.vimeo.com/video/1118476418?autoplay=1&title=0&byline=0&portrait=0');
  requestPlayerFullscreen();
}

function openProjectById(projectId, event) {
  if (projectId === '01') return openProject01Popup(event);
  if (projectId === '02') return openProject02Popup(event);
  if (projectId === '03') return openProject03Popup(event);
  if (projectId === '04') return openProject04Popup(event);
  if (projectId === '05') return openProject05Popup(event);
  if (projectId === '06') return openProject06Popup(event);
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
