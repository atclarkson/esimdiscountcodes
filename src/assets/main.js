// Main application functionality
document.addEventListener("DOMContentLoaded", function () {
  // Copy to clipboard functionality
  initCopyButtons();

  // Feedback buttons (thumbs up/down)
  initFeedbackButtons();

  // Mobile menu toggle
  initMobileMenu();

  // Dropdown functionality
  initDropdown();

  // Article "On this page" sidebar
  initArticleToc();

  // Homepage provider search/filter
  initProviderFilter();
});

// Build the sticky "On this page" list from the article's own H2s, and
// highlight the section currently in view while scrolling.
function initArticleToc() {
  const list = document.querySelector(".article-toc-list");
  const article = document.querySelector(".article-content");
  if (!list || !article) return;

  const headings = Array.from(article.querySelectorAll("h2"));
  if (headings.length < 2) {
    const toc = document.querySelector(".article-toc");
    if (toc) toc.remove();
    return;
  }

  const usedIds = new Set();
  const links = headings.map((h) => {
    if (!h.id) {
      let slug = h.textContent
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
      let unique = slug;
      let n = 2;
      while (usedIds.has(unique) || document.getElementById(unique)) {
        unique = `${slug}-${n++}`;
      }
      usedIds.add(unique);
      h.id = unique;
    }
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `#${h.id}`;
    a.textContent = h.textContent;
    li.appendChild(a);
    list.appendChild(li);
    return a;
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = links.find((a) => a.getAttribute("href") === `#${entry.target.id}`);
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach((a) => a.classList.remove("active"));
          link.classList.add("active");
        }
      });
    },
    { rootMargin: "-100px 0px -70% 0px" }
  );
  headings.forEach((h) => observer.observe(h));
}

// Homepage provider grid: filter cards as you type. No backend, just a
// real client-side match against the provider name/description already
// on the page.
function initProviderFilter() {
  const input = document.getElementById("providerSearch");
  const cards = Array.from(document.querySelectorAll(".provider-card-link"));
  const emptyState = document.querySelector(".providers-empty");
  if (!input || !cards.length) return;

  input.addEventListener("input", function () {
    const query = input.value.trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach((card) => {
      const haystack = card.dataset.search || "";
      const matches = query === "" || haystack.includes(query);
      card.hidden = !matches;
      if (matches) visibleCount++;
    });

    if (emptyState) {
      emptyState.classList.toggle("active", visibleCount === 0);
    }
  });
}

// Copy button functionality
function initCopyButtons() {
  const copyButtons = document.querySelectorAll(".copy-code-btn");

  copyButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const code = this.dataset.code;

      navigator.clipboard
        .writeText(code)
        .then(() => {
          showCopySuccess(this, code);
        })
        .catch(() => {
          // Fallback for older browsers
          fallbackCopyToClipboard(code);
          showCopySuccess(this, code);
        });
    });
  });
}

function showCopySuccess(button, code) {
  button.classList.add("copied");
  const originalText = button.innerHTML;
  button.innerHTML = code + ' <span><i class="fas fa-check"></i> Copied!</span>';

  setTimeout(() => {
    button.classList.remove("copied");
    button.innerHTML = originalText;
  }, 2000);
}

function fallbackCopyToClipboard(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
}

// Feedback button functionality
function initFeedbackButtons() {
  const feedbackButtons = document.querySelectorAll(".feedback-btn");

  feedbackButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation();
      handleFeedback(this);
    });
  });
}

function handleFeedback(button) {
  const feedback = button.dataset.feedback;
  const rect = button.getBoundingClientRect();
  const couponCard = button.closest(".coupon-card");

  // Reset all buttons in this card
  const cardButtons = couponCard.querySelectorAll(".feedback-btn");
  cardButtons.forEach((btn) => btn.classList.remove("selected"));

  // Mark this button as selected
  button.classList.add("selected");

  // Get button center position
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  if (feedback === "up") {
    button.classList.add("active-up");
    createFireworks(centerX, centerY);
    setTimeout(() => button.classList.remove("active-up"), 600);
  } else if (feedback === "down") {
    button.classList.add("active-down");
    createDownEffect(centerX, centerY);
    setTimeout(() => button.classList.remove("active-down"), 600);
  }
}

function createFireworks(x, y) {
  const colors = ["#ffd700", "#ff6b6b", "#4ecdc4", "#45b7d1", "#f9ca24"];

  for (let i = 0; i < 12; i++) {
    const firework = document.createElement("div");
    firework.className = "firework";
    firework.style.left = x + "px";
    firework.style.top = y + "px";
    firework.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];

    const angle = (i * 30 * Math.PI) / 180;
    const distance = 50 + Math.random() * 30;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    firework.style.setProperty("--dx", dx + "px");
    firework.style.setProperty("--dy", dy + "px");

    document.body.appendChild(firework);

    setTimeout(() => firework.remove(), 800);
  }
}

function createDownEffect(x, y) {
  for (let i = 0; i < 6; i++) {
    const particle = document.createElement("div");
    particle.className = "down-particle";
    particle.style.left = x + "px";
    particle.style.top = y + "px";

    const angle = (i * 60 * Math.PI) / 180;
    const distance = 20 + Math.random() * 15;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    particle.style.setProperty("--dx", dx + "px");
    particle.style.setProperty("--dy", dy + "px");

    document.body.appendChild(particle);

    setTimeout(() => particle.remove(), 600);
  }
}

// Mobile menu functionality
function initMobileMenu() {
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const navMenu = document.querySelector(".nav-menu");

  if (!mobileMenuBtn || !navMenu) return;

  mobileMenuBtn.addEventListener("click", function () {
    navMenu.classList.toggle("active");
    mobileMenuBtn.classList.toggle("active");
  });

  // Close menu when clicking outside
  document.addEventListener("click", function (e) {
    if (!mobileMenuBtn.contains(e.target) && !navMenu.contains(e.target)) {
      navMenu.classList.remove("active");
      mobileMenuBtn.classList.remove("active");
    }
  });
}

// Dropdown functionality
function initDropdown() {
  const dropdown = document.querySelector(".dropdown");
  const dropdownToggle = document.querySelector(".dropdown-toggle");

  if (!dropdown || !dropdownToggle) return;

  dropdownToggle.addEventListener("click", function (e) {
    e.preventDefault();
    dropdown.classList.toggle("active");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function (e) {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove("active");
    }
  });
}

// Handle proof thumbnail clicks
document.querySelectorAll(".proof-thumbnail").forEach((thumbnail) => {
  thumbnail.addEventListener("click", function () {
    const img = this.querySelector("img");

    // Only open modal if image is visible (not in fallback state)
    if (img && img.style.display !== "none") {
      const provider = this.dataset.provider;
      const code = this.dataset.code;
      const isInvalid = this.dataset.invalid === "true";

      const modal = document.getElementById("proofModal");
      const modalImage = document.getElementById("modalImage");
      const modalTitle = document.getElementById("modalTitle");

      modalImage.src = img.src;
      modalImage.alt = img.alt;

      if (isInvalid) {
        modalTitle.textContent = `${code} - Confirmed Not Working`;
      } else {
        modalTitle.textContent = `${code} - Confirmed Working`;
      }

      modal.classList.add("active");
    }
  });
});

// Close modal function
function closeProofModal() {
  const modal = document.getElementById("proofModal");
  if (modal) modal.classList.remove("active");
}

// Close modal when clicking outside (only on pages that have the modal)
const proofModalEl = document.getElementById("proofModal");
if (proofModalEl) {
  proofModalEl.addEventListener("click", function (e) {
    if (e.target === this) {
      closeProofModal();
    }
  });
}

// Close modal with ESC key
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeProofModal();
  }
});
