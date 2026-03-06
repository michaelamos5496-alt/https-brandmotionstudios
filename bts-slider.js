(() => {
  const slider = document.querySelector("[data-bts-slider]");
  const track = document.querySelector("[data-bts-track]");
  if (!slider || !track || typeof window.gsap === "undefined") return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const seedCards = Array.from(track.children).map((card) => card.cloneNode(true));
  let loopTween = null;
  let resizeTimer = 0;
  let rebuildRetryCount = 0;

  function buildTrackCards(copyCount) {
    track.innerHTML = "";
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < copyCount; i += 1) {
      seedCards.forEach((card) => fragment.appendChild(card.cloneNode(true)));
    }
    track.appendChild(fragment);
  }

  function singleSetWidthPx() {
    const cards = Array.from(track.children);
    const oneSetCount = seedCards.length;
    const firstCard = cards[0];
    const firstDuplicateCard = cards[oneSetCount];
    if (!firstCard || !firstDuplicateCard) return 0;

    const distance = firstDuplicateCard.offsetLeft - firstCard.offsetLeft;
    return distance > 0 ? distance : 0;
  }

  function buildLoop() {
    buildTrackCards(2);
    if (loopTween) loopTween.kill();

    window.gsap.set(track, { x: 0 });
    const distance = singleSetWidthPx();
    if (!distance) {
      rebuildRetryCount += 1;
      if (rebuildRetryCount <= 6) {
        window.setTimeout(buildLoop, 120);
      }
      return;
    }

    rebuildRetryCount = 0;
    const minCopies = Math.max(3, Math.ceil(slider.clientWidth / distance) + 2);
    buildTrackCards(minCopies);

    const speed = Number(slider.getAttribute("data-bts-speed")) || 60;
    const duration = Math.max(14, distance / speed);

    loopTween = window.gsap.fromTo(track, { x: 0 }, {
      x: -distance,
      duration,
      ease: "none",
      repeat: -1
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
