const header = document.getElementById("siteHeader");
const revealEls = Array.from(document.querySelectorAll(".reveal"));

function updateHeaderState() {
  if (!header) return;
  const scrolled = window.scrollY > 24;
  header.classList.toggle("is-solid", scrolled);
}

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: "0px 0px -8% 0px",
  }
);

revealEls.forEach((el) => observer.observe(el));
