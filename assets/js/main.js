/* ============================================================
   TBA India — site interactions
   ============================================================ */

/* ------------------------------------------------------------
   LATEST NEWS — drives the floating pop-up on every page.
   When you publish a new story on tba-news.html, update these
   values (and bump `id` so visitors who closed the old pop-up
   see the new one).
   ------------------------------------------------------------ */
const LATEST_NEWS = {
  id: "launch-of-tba-india",
  label: "Latest news",
  title: "Launch of TBA India",
  image: "assets/images/news-tba-india-launch.webp",
  href: "tba-news.html#latest",
};

document.documentElement.classList.add("js");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const store = {
  get(key) {
    try { return window.sessionStorage.getItem(key); } catch { return null; }
  },
  set(key, value) {
    try { window.sessionStorage.setItem(key, value); } catch { /* storage unavailable */ }
  },
};

const ICON_ARROW =
  '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
const ICON_CLOSE =
  '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

/* ---- Mobile menu ------------------------------------------ */
(function initMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-mobile-menu]");
  if (!toggle || !menu) return;

  const label = toggle.querySelector("[data-menu-label]");
  const setOpen = (open) => {
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    if (label) label.textContent = open ? "Close" : "Menu";
    menu.toggleAttribute("inert", !open);
  };

  setOpen(false);
  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.body.classList.contains("menu-open")) {
      setOpen(false);
      toggle.focus();
    }
  });
  window.matchMedia("(min-width: 1024px)").addEventListener("change", (event) => {
    if (event.matches) setOpen(false);
  });
})();

/* ---- Header elevation on scroll ---------------------------- */
(function initHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
})();

/* ---- Scroll reveal ----------------------------------------- */
(function initReveal() {
  const targets = document.querySelectorAll("[data-reveal]");
  if (!targets.length) return;
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-in"));
    return;
  }
  // Stagger siblings that share a [data-reveal-group] parent.
  document.querySelectorAll("[data-reveal-group]").forEach((group) => {
    group.querySelectorAll(":scope > [data-reveal]").forEach((el, i) => el.style.setProperty("--i", String(i)));
  });
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );
  targets.forEach((el) => observer.observe(el));
})();

/* ---- Count-up figures -------------------------------------- */
(function initCounters() {
  const figures = document.querySelectorAll("[data-count]");
  if (!figures.length || prefersReducedMotion || !("IntersectionObserver" in window)) return;

  const run = (el) => {
    const match = /^(\d+)(.*)$/.exec(el.textContent.trim());
    if (!match) return;
    const target = parseInt(match[1], 10);
    const suffix = match[2];
    const started = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - started) / 1200);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        run(entry.target);
      });
    },
    { threshold: 0.5 }
  );
  figures.forEach((el) => observer.observe(el));
})();

/* ---- Leadership: "Read more" on long bios ------------------ */
(function initBios() {
  document.querySelectorAll("[data-bio]").forEach((bio) => {
    const button = bio.parentElement.querySelector("[data-bio-toggle]");
    if (!button) return;
    bio.classList.add("is-clamped");
    // Only offer "Read more" when the text is actually cut off.
    if (bio.scrollHeight <= bio.clientHeight + 2) {
      bio.classList.remove("is-clamped");
      return;
    }
    button.hidden = false;
    button.addEventListener("click", () => {
      const expanded = bio.classList.toggle("is-clamped") === false;
      button.textContent = expanded ? "Show less" : "Read more";
      button.setAttribute("aria-expanded", String(expanded));
    });
  });
})();

/* ---- Legal pages: highlight the section in view ------------ */
(function initToc() {
  const links = document.querySelectorAll("[data-toc] a");
  if (!links.length || !("IntersectionObserver" in window)) return;
  const byId = new Map();
  links.forEach((a) => byId.set(a.getAttribute("href").slice(1), a));
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.remove("is-active"));
        byId.get(entry.target.id)?.classList.add("is-active");
      });
    },
    { rootMargin: "-20% 0px -70% 0px" }
  );
  byId.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });
})();

/* ---- News: reading progress + copy link -------------------- */
(function initStory() {
  const bar = document.querySelector("[data-read-progress]");
  const story = document.querySelector("[data-story]");
  if (bar && story) {
    const update = () => {
      const rect = story.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const progress = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      bar.style.transform = "scaleX(" + progress + ")";
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  document.querySelectorAll("[data-copy-link]").forEach((button) => {
    const label = button.querySelector("span");
    button.addEventListener("click", async () => {
      const url = button.getAttribute("data-copy-link");
      try {
        await navigator.clipboard.writeText(url);
        if (label) label.textContent = "Copied";
      } catch {
        window.prompt("Copy this link:", url);
      }
      setTimeout(() => { if (label) label.textContent = "Copy link"; }, 2000);
    });
  });
})();

/* ---- Floating "latest news" pop-up on every page ----------- */
(function initNewsPop() {
  if (!LATEST_NEWS || !LATEST_NEWS.title) return;
  if (document.body.hasAttribute("data-no-news-pop")) return;     // the news page itself
  const dismissKey = "tba-news-pop-dismissed:" + LATEST_NEWS.id;
  if (store.get(dismissKey)) return;

  const pop = document.createElement("aside");
  pop.className = "news-pop";
  pop.setAttribute("aria-label", "Latest news");
  pop.innerHTML =
    '<a class="news-pop__link" href="' + LATEST_NEWS.href + '">' +
      '<img class="news-pop__thumb" src="' + LATEST_NEWS.image + '" alt="" width="64" height="64" loading="lazy" />' +
      '<span class="news-pop__text">' +
        '<span class="news-pop__label"><span class="pulse" aria-hidden="true"></span>' + LATEST_NEWS.label + "</span>" +
        '<span class="news-pop__title">' + LATEST_NEWS.title + "</span>" +
        '<span class="news-pop__cta">Read the story ' + ICON_ARROW + "</span>" +
      "</span>" +
    "</a>" +
    '<button class="news-pop__close" type="button" aria-label="Dismiss latest news">' + ICON_CLOSE + "</button>";

  document.body.appendChild(pop);

  const show = () => pop.classList.add("is-visible");
  setTimeout(show, prefersReducedMotion ? 0 : 1400);

  pop.querySelector(".news-pop__close").addEventListener("click", () => {
    store.set(dismissKey, "1");
    pop.classList.add("is-leaving");
    pop.classList.remove("is-visible");
    setTimeout(() => pop.remove(), 300);
  });

  // Keep the pop-up out of the way while the mobile menu is open.
  const observer = new MutationObserver(() => {
    pop.style.visibility = document.body.classList.contains("menu-open") ? "hidden" : "";
  });
  observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
})();

/* ---- Website forms (contact + advisor application) --------- */
/*  Works for every [data-contact-form] on the page. Each form carries its
    own Apps Script endpoint (data-sheet-endpoint), submit button and error
    line; the page's one success modal is shared.                           */
const modal = document.querySelector("[data-success-modal]");
const closeModal = document.querySelector("[data-close-modal]");

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

document.querySelectorAll("[data-contact-form]").forEach((form) => {
  const errorMessage = form.querySelector("[data-form-error]");
  const submitButton = form.querySelector("[data-submit-button]");
  const submitLabel = submitButton?.querySelector("[data-submit-label]") || submitButton;
  const originalLabel = submitLabel ? submitLabel.textContent : "Submit";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorMessage?.classList.add("hidden");

    const data = new FormData(form);
    const sheetEndpoint = form.getAttribute("data-sheet-endpoint") || "";
    const sheetToken = form.getAttribute("data-sheet-token") || "";
    const sheetReady = sheetEndpoint && !sheetEndpoint.startsWith("PASTE_");

    if (submitButton) {
      submitButton.disabled = true;
      submitLabel.textContent = "Sending...";
    }

    let delivered = false;

    // 1) Primary: Google Sheet via Apps Script. Sent as text/plain so the
    //    browser issues a simple request and skips the CORS preflight.
    if (sheetReady) {
      const payload = Object.fromEntries(data.entries());
      payload.token = sheetToken;
      payload.page = window.location.pathname;
      try {
        const response = await fetch(sheetEndpoint, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          const result = await response.json().catch(() => ({ ok: true }));
          delivered = result.ok !== false;
        }
      } catch {
        delivered = false;
      }
    }

    // 2) Fallback: Netlify Forms, so a submission is never lost if the
    //    Apps Script endpoint is unreachable.
    if (!delivered && form.hasAttribute("data-netlify")) {
      const netlifyData = new FormData(form);
      if (form.name) netlifyData.set("form-name", form.name);
      try {
        const response = await fetch(form.getAttribute("data-endpoint") || "/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(netlifyData).toString(),
        });
        delivered = response.ok;
      } catch {
        delivered = false;
      }
    }

    if (delivered) {
      form.reset();
      modal?.classList.remove("hidden");
      modal?.querySelector("button")?.focus();
    } else {
      errorMessage?.classList.remove("hidden");
    }

    if (submitButton) {
      submitButton.disabled = false;
      submitLabel.textContent = originalLabel;
    }
  });
});
