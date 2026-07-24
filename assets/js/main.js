const navToggle = document.querySelector("[data-nav-toggle]");
const navMenu = document.querySelector("[data-nav-menu]");
let navTimer;

function closeNav() {
  if (!navToggle || !navMenu) return;
  navMenu.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  if (navTimer) window.clearTimeout(navTimer);
}

function openNav() {
  if (!navToggle || !navMenu) return;
  navMenu.classList.add("is-open");
  navToggle.setAttribute("aria-expanded", "true");
  if (navTimer) window.clearTimeout(navTimer);
  navTimer = window.setTimeout(closeNav, 5000);
}

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    if (navMenu.classList.contains("is-open")) closeNav();
    else openNav();
  });
  navMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNav));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNav();
  });
}

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

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorMessage?.classList.add("hidden");
  const endpoint = form.getAttribute("data-endpoint") || form.action;
  const data = new FormData(form);
  data.set("_subject", "New website enquiry - TBA India");
  data.set("_template", "table");
  data.set("_captcha", "false");

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Sending...";
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: data,
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