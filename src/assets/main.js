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
});

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
  button.innerHTML = code + " <span>✓ Copied!</span>";

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
    createPoopEffect(centerX, centerY);
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

function createPoopEffect(x, y) {
  const poopEmojis = ["💩", "🤮", "🚫"];

  for (let i = 0; i < 3; i++) {
    const poop = document.createElement("div");
    poop.className = "poop-particle";
    poop.textContent = poopEmojis[i];

    const offsetX = (i - 1) * 25; // -25, 0, 25
    const offsetY = Math.random() * 10 - 5;

    poop.style.left = x + offsetX + "px";
    poop.style.top = y + offsetY + "px";

    document.body.appendChild(poop);

    setTimeout(() => poop.remove(), 1000);
  }
}

// Mobile menu functionality
function initMobileMenu() {
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const navMenu = document.querySelector(".nav-menu");

  if (!mobileMenuBtn || !navMenu) return;

  mobileMenuBtn.addEventListener("click", function () {
    navMenu.classList.toggle("active");
  });

  // Close menu when clicking outside
  document.addEventListener("click", function (e) {
    if (!mobileMenuBtn.contains(e.target) && !navMenu.contains(e.target)) {
      navMenu.classList.remove("active");
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
