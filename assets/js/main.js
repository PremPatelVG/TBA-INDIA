/* ============================================================
   TBA India — site interactions
   ============================================================ */

/* ---- Mobile navigation --------------------------------- */
const navToggle = document.querySelector("[data-nav-toggle]");
const navMenu = document.querySelector("[data-nav-menu]");

function closeNav() {
  if (!navToggle || !navMenu) return;
  navMenu.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
}

function openNav() {
  if (!navToggle || !navMenu) return;
  navMenu.classList.add("is-open");
  navToggle.setAttribute("aria-expanded", "true");
}

if (navToggle && navMenu) {
  navToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    if (navMenu.classList.contains("is-open")) closeNav();
    else openNav();
  });
  navMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNav));
  document.addEventListener("click", (event) => {
    if (!navMenu.classList.contains("is-open")) return;
    if (!navMenu.contains(event.target) && !navToggle.contains(event.target)) closeNav();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNav();
  });
}

/* ---- Sticky header shadow / promo collapse ------------- */
const siteHeader = document.querySelector(".site-header");
if (siteHeader) {
  const onScroll = () => {
    siteHeader.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ---- Scroll reveal (progressive enhancement) ----------- */
(function initReveal() {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const targets = document.querySelectorAll(
    ".home-hero .hero-copy, .split-services .service-card, .metric-strip > div, " +
      ".feature-section > *, .section-heading, .service-grid > *, .cta-band > *, " +
      ".about-global-section > *, .about-history-copy > *, .about-detail-section > *, " +
      ".leader-card, .contact-intro, .contact-form, .legal-section, .inner-hero > div, " +
      ".news-intro, .news-list > *"
  );
  if (!targets.length) return;

  if (prefersReduced || !("IntersectionObserver" in window)) return;

  targets.forEach((el) => el.classList.add("reveal"));

  // Light stagger for items inside the same grid/row.
  document
    .querySelectorAll(
      ".split-services, .metric-strip, .service-grid, .team-grid, .about-history-copy, .news-list"
    )
    .forEach((group) => {
      Array.prototype.slice.call(group.children, 0, 5).forEach((child, i) => {
        if (child.classList.contains("reveal")) child.classList.add("reveal-" + (i + 1));
      });
    });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );

  targets.forEach((el) => observer.observe(el));
})();

/* ---- Contact form (Netlify Forms) ---------------------- */
const form = document.querySelector("[data-contact-form]");
const modal = document.querySelector("[data-success-modal]");
const closeModal = document.querySelector("[data-close-modal]");
const errorMessage = document.querySelector("[data-form-error]");
const submitButton = document.querySelector("[data-submit-button]");

function hideModal() {
  modal?.classList.add("hidden");
}

closeModal?.addEventListener("click", hideModal);
modal?.addEventListener("click", (event) => {
  if (event.target === modal) hideModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") hideModal();
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorMessage?.classList.add("hidden");
  const endpoint = form.getAttribute("data-endpoint") || form.action;
  const data = new FormData(form);
  const isNetlifyForm = form.hasAttribute("data-netlify");
  if (isNetlifyForm && form.name) data.set("form-name", form.name);

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Sending...";
  }

  try {
    const requestOptions = isNetlifyForm
      ? {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(data).toString(),
        }
      : {
          method: "POST",
          headers: { Accept: "application/json" },
          body: data,
        };
    const response = await fetch(endpoint, {
      ...requestOptions,
    });
    if (!response.ok) throw new Error("Submission failed");
    form.reset();
    modal?.classList.remove("hidden");
  } catch {
    errorMessage?.classList.remove("hidden");
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Submit Enquiry";
    }
  }
});
