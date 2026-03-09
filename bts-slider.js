(() => {
  const sliders = Array.from(document.querySelectorAll('[data-bts-slider]'));
  if (!sliders.length) return;

  const hasGsap = typeof window.gsap !== 'undefined';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function waitForImages(track) {
    const cards = Array.from(track.children);
    const tasks = cards.map((card) => {
      const img = card.querySelector('img');
      if (!img || img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });
    });

    return Promise.race([
      Promise.all(tasks),
      new Promise((resolve) => window.setTimeout(resolve, 1200))
    ]);
  }

  function setupSlider(slider) {
    const track = slider.querySelector('[data-bts-track]');
    if (!track) return null;

    const originalCards = Array.from(track.children);
    if (!originalCards.length) return null;

    const cloneFragment = document.createDocumentFragment();
    originalCards.forEach((card) => cloneFragment.appendChild(card.cloneNode(true)));
    track.appendChild(cloneFragment);

    const state = {
      slider,
      track,
      setSize: originalCards.length,
      tween: null,
      observer: null,
      resizeTimer: 0,
      cleanupFns: []
    };

    const speed = Number(slider.getAttribute('data-bts-speed')) || 60;

    const build = () => {
      const firstCard = track.children[0];
      const firstClone = track.children[state.setSize];
      if (!firstCard || !firstClone) return;

      const distance = Math.max(0, firstClone.offsetLeft - firstCard.offsetLeft);
      if (!distance) return;

      const duration = Math.max(16, distance / speed);
      track.style.opacity = '1';

      if (!hasGsap || prefersReducedMotion.matches) {
        if (state.tween) {
          state.tween.kill();
          state.tween = null;
        }
        track.style.animation = `btsScrollLeft ${duration}s linear infinite`;
        return;
      }

      track.style.animation = 'none';
      if (state.tween) state.tween.kill();
      window.gsap.set(track, { x: 0 });
      state.tween = window.gsap.to(track, {
        x: -distance,
        duration,
        ease: 'none',
        repeat: -1,
        overwrite: true
      });
    };

    const setPaused = (paused) => {
      if (prefersReducedMotion.matches) {
        track.style.animationPlayState = 'paused';
        return;
      }
      if (!state.tween) return;
      if (paused) {
        state.tween.pause();
        return;
      }
      state.tween.play();
    };

    const onMouseEnter = () => setPaused(true);
    const onMouseLeave = () => setPaused(false);
    const onFocusIn = () => setPaused(true);
    const onFocusOut = () => setPaused(false);
    const onResize = () => {
      window.clearTimeout(state.resizeTimer);
      state.resizeTimer = window.setTimeout(build, 120);
    };

    slider.addEventListener('mouseenter', onMouseEnter);
    slider.addEventListener('mouseleave', onMouseLeave);
    slider.addEventListener('focusin', onFocusIn);
    slider.addEventListener('focusout', onFocusOut);
    window.addEventListener('resize', onResize);

    state.cleanupFns.push(() => slider.removeEventListener('mouseenter', onMouseEnter));
    state.cleanupFns.push(() => slider.removeEventListener('mouseleave', onMouseLeave));
    state.cleanupFns.push(() => slider.removeEventListener('focusin', onFocusIn));
    state.cleanupFns.push(() => slider.removeEventListener('focusout', onFocusOut));
    state.cleanupFns.push(() => window.removeEventListener('resize', onResize));

    if (typeof IntersectionObserver !== 'undefined') {
      state.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => setPaused(!entry.isIntersecting));
        },
        { threshold: 0.1 }
      );
      state.observer.observe(slider);
    }

    waitForImages(track).then(build).catch(build);
    return state;
  }

  const states = sliders.map(setupSlider).filter(Boolean);

  if (typeof prefersReducedMotion.addEventListener === 'function') {
    prefersReducedMotion.addEventListener('change', () => {
      states.forEach((state) => {
        if (!state) return;
        const firstCard = state.track.children[0];
        const firstClone = state.track.children[state.setSize];
        if (!firstCard || !firstClone) return;
        const distance = Math.max(0, firstClone.offsetLeft - firstCard.offsetLeft);
        const speed = Number(state.slider.getAttribute('data-bts-speed')) || 60;
        const duration = Math.max(16, distance / speed);
        if (prefersReducedMotion.matches) {
          if (state.tween) {
            state.tween.kill();
            state.tween = null;
          }
          state.track.style.animation = `btsScrollLeft ${duration}s linear infinite`;
          state.track.style.animationPlayState = 'paused';
          return;
        }
        state.track.style.animation = 'none';
        state.track.style.animationPlayState = 'running';
        if (hasGsap) {
          if (state.tween) state.tween.kill();
          window.gsap.set(state.track, { x: 0 });
          state.tween = window.gsap.to(state.track, {
            x: -distance,
            duration,
            ease: 'none',
            repeat: -1,
            overwrite: true
          });
        }
      });
    });
  }
})();
