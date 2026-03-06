(() => {
  const slider = document.querySelector("[data-bts-slider]");
  const track = document.querySelector("[data-bts-track]");
  if (!slider || !track || typeof window.gsap === "undefined") return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const seedCards = Array.from(track.children).map((card) => card.cloneNode(true));
  let loopTween = null;
  let resizeTimer = 0;

  function cardGapPx() {
    const styles = window.getComputedStyle(track);
    const gap = styles.gap || styles.columnGap || "0px";
    const parsed = Number.parseFloat(gap);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function buildTrackCards() {
    track.innerHTML = "";
    const fragment = document.createDocumentFragment();
    seedCards.forEach((card) => fragment.appendChild(card.cloneNode(true)));
    seedCards.forEach((card) => fragment.appendChild(card.cloneNode(true)));
    track.appendChild(fragment);
  }

  function singleSetWidthPx() {
    const cards = Array.from(track.children);
    const oneSetCount = seedCards.length;
    const firstCard = cards[0];
    const firstDuplicateCard = cards[oneSetCount];
    if (!firstCard || !firstDuplicateCard) return 0;

    // Exact loop distance from set A start to set B start (includes real gap).
    const distance = firstDuplicateCard.offsetLeft - firstCard.offsetLeft;
    if (distance > 0) return distance;

    // Fallback measurement.
    const gap = cardGapPx();
    let width = 0;
    for (let i = 0; i < oneSetCount; i += 1) {
      const card = cards[i];
      if (!card) continue;
      width += card.getBoundingClientRect().width;
      if (i < oneSetCount - 1) width += gap;
    }
    return width + gap;
  }

  function buildLoop() {
    buildTrackCards();
    if (loopTween) loopTween.kill();

    window.gsap.set(track, { x: 0 });
    const distance = singleSetWidthPx();
    if (!distance) return;

    const speed = Number(slider.getAttribute("data-bts-speed")) || 60;
    const duration = Math.max(14, distance / speed);
    const wrapX = window.gsap.utils.wrap(-distance, 0);

    loopTween = window.gsap.to(track, {
      x: `-=${distance}`,
      duration,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: (value) => `${wrapX(Number.parseFloat(value) || 0)}px`
      }
    });

    if (prefersReducedMotion.matches) {
      loopTween.pause(0);
    }
  }

  function setPaused(paused) {
    if (!loopTween) return;
    if (paused) {
      loopTween.pause();
      return;
    }
    if (prefersReducedMotion.matches) return;
    loopTween.play();
  }

  function rebuildOnResize() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(buildLoop, 180);
  }

  const visibilityObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        setPaused(!entry.isIntersecting);
      });
    },
    { threshold: 0.12 }
  );

  visibilityObserver.observe(slider);
  slider.addEventListener("mouseenter", () => setPaused(true));
  slider.addEventListener("mouseleave", () => setPaused(false));
  slider.addEventListener("focusin", () => setPaused(true));
  slider.addEventListener("focusout", () => setPaused(false));
  window.addEventListener("resize", rebuildOnResize);
  window.addEventListener("load", buildLoop);

  if (typeof prefersReducedMotion.addEventListener === "function") {
    prefersReducedMotion.addEventListener("change", () => {
      if (prefersReducedMotion.matches) {
        setPaused(true);
        return;
      }
      setPaused(false);
    });
  }

  if (document.fonts && typeof document.fonts.ready?.then === "function") {
    document.fonts.ready.then(buildLoop).catch(() => {});
  }

  buildLoop();
})();
