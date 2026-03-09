(() => {
  const galleries = Array.from(document.querySelectorAll('#bts .gallery'));
  if (!galleries.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  galleries.forEach((gallery) => {
    const cardsTrack = gallery.querySelector('.cards');
    const cards = Array.from(cardsTrack?.children || []);
    const prevBtn = gallery.querySelector('.prev');
    const nextBtn = gallery.querySelector('.next');
    if (!cardsTrack || cards.length < 2) return;

    let index = 0;
    let step = 0;
    let currentTranslate = 0;
    let dragging = false;
    let startX = 0;
    let dragStartTranslate = 0;
    let activePointerId = null;

    const getClientX = (event) => {
      if (typeof event.clientX === 'number') return event.clientX;
      if (event.touches && event.touches[0]) return event.touches[0].clientX;
      return 0;
    };

    const wrapIndex = (nextIndex) => {
      const total = cards.length;
      if (nextIndex < 0) return total - 1;
      if (nextIndex >= total) return 0;
      return nextIndex;
    };

    const applyTranslate = (value, animate = true) => {
      if (!prefersReducedMotion.matches && animate) {
        cardsTrack.style.transition = 'transform 0.48s cubic-bezier(0.22, 0.61, 0.36, 1)';
      } else {
        cardsTrack.style.transition = 'none';
      }
      currentTranslate = value;
      cardsTrack.style.transform = `translate3d(${value}px, 0, 0)`;
    };

    const moveTo = (nextIndex, animate = true) => {
      index = wrapIndex(nextIndex);
      applyTranslate(-index * step, animate);
    };

    const recalcStep = () => {
      const first = cards[0];
      const second = cards[1];
      if (!first) return;
      if (!second) {
        step = first.getBoundingClientRect().width;
      } else {
        const firstRect = first.getBoundingClientRect();
        const secondRect = second.getBoundingClientRect();
        step = Math.max(1, secondRect.left - firstRect.left);
      }
      moveTo(index, false);
    };

    const endDrag = (clientX) => {
      if (!dragging) return;
      dragging = false;
      cardsTrack.classList.remove('is-dragging');

      const deltaX = clientX - startX;
      const threshold = Math.max(26, step * 0.16);

      if (Math.abs(deltaX) >= threshold) {
        moveTo(index + (deltaX < 0 ? 1 : -1), true);
      } else {
        moveTo(index, true);
      }
    };

    cardsTrack.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      dragging = true;
      startX = getClientX(event);
      dragStartTranslate = currentTranslate;
      activePointerId = event.pointerId;
      cardsTrack.classList.add('is-dragging');
      cardsTrack.style.transition = 'none';
      if (cardsTrack.setPointerCapture) {
        cardsTrack.setPointerCapture(event.pointerId);
      }
    });

    cardsTrack.addEventListener('pointermove', (event) => {
      if (!dragging || event.pointerId !== activePointerId) return;
      const deltaX = getClientX(event) - startX;
      applyTranslate(dragStartTranslate + deltaX, false);
    });

    const handlePointerEnd = (event) => {
      if (!dragging || event.pointerId !== activePointerId) return;
      endDrag(getClientX(event));
      activePointerId = null;
    };

    cardsTrack.addEventListener('pointerup', handlePointerEnd);
    cardsTrack.addEventListener('pointercancel', handlePointerEnd);

    prevBtn?.addEventListener('click', () => moveTo(index - 1, true));
    nextBtn?.addEventListener('click', () => moveTo(index + 1, true));

    gallery.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        moveTo(index + 1, true);
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        moveTo(index - 1, true);
      }
    });

    let resizeTimer = 0;
    window.addEventListener('resize', () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(recalcStep, 120);
    });

    recalcStep();
  });
})();
