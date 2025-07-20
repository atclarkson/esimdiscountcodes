document.addEventListener("DOMContentLoaded", function () {
  const copyButtons = document.querySelectorAll(".copy-code-btn");

  copyButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const code = this.dataset.code;

      // Copy to clipboard
      navigator.clipboard
        .writeText(code)
        .then(() => {
          // Show success state
          this.classList.add("copied");
          const originalText = this.innerHTML;
          this.innerHTML = code + " <span>✓ Copied!</span>";

          // Reset after 2 seconds
          setTimeout(() => {
            this.classList.remove("copied");
            this.innerHTML = originalText;
          }, 2000);
        })
        .catch(() => {
          // Fallback for older browsers
          const textArea = document.createElement("textarea");
          textArea.value = code;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);

          // Show success state
          this.classList.add("copied");
          const originalText = this.innerHTML;
          this.innerHTML = code + " <span>✓ Copied!</span>";

          setTimeout(() => {
            this.classList.remove("copied");
            this.innerHTML = originalText;
          }, 2000);
        });
    });
  });
});

// Feedback button functionality
document.addEventListener("DOMContentLoaded", function () {
  // Existing copy button code...

  // Feedback buttons
  const feedbackButtons = document.querySelectorAll(".feedback-btn");

  feedbackButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.stopPropagation();
      const feedback = this.dataset.feedback;
      const rect = this.getBoundingClientRect();
      const couponCard = this.closest(".coupon-card");

      // Get all feedback buttons in this card
      const cardButtons = couponCard.querySelectorAll(".feedback-btn");

      // Remove selected state from all buttons in this card
      cardButtons.forEach((btn) => btn.classList.remove("selected"));

      // Add selected state to clicked button
      this.classList.add("selected");

      // Get the center of the button relative to the viewport
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      if (feedback === "up") {
        // Thumbs up - fireworks effect
        this.classList.add("active-up");
        createFireworks(centerX, centerY);

        setTimeout(() => {
          this.classList.remove("active-up");
        }, 600);
      } else if (feedback === "down") {
        // Thumbs down - poop effect
        this.classList.add("active-down");
        createPoopEffect(centerX, centerY);

        setTimeout(() => {
          this.classList.remove("active-down");
        }, 600);
      }
    });
  });

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

      setTimeout(() => {
        firework.remove();
      }, 800);
    }
  }

  function createPoopEffect(x, y) {
    const poopEmojis = ["💩", "🤮", "🚫"];

    // Only create 3 emojis with better spacing
    for (let i = 0; i < 3; i++) {
      const poop = document.createElement("div");
      poop.className = "poop-particle";
      poop.textContent = poopEmojis[i];

      // Spread them out more horizontally and vertically
      const offsetX = (i - 1) * 25; // -25, 0, 25
      const offsetY = Math.random() * 10 - 5; // Random small vertical offset

      poop.style.left = x + offsetX + "px";
      poop.style.top = y + offsetY + "px";

      document.body.appendChild(poop);

      setTimeout(() => {
        poop.remove();
      }, 1000);
    }
  }
});
// Mobile menu toggle
document.addEventListener("DOMContentLoaded", function () {
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const navMenu = document.querySelector(".nav-menu");

  if (mobileMenuBtn && navMenu) {
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
});

// Dropdown functionality
document.addEventListener("DOMContentLoaded", function () {
  // Existing code...

  // Dropdown toggle
  const dropdown = document.querySelector(".dropdown");
  const dropdownToggle = document.querySelector(".dropdown-toggle");

  if (dropdown && dropdownToggle) {
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

  // Existing mobile menu code...
});
