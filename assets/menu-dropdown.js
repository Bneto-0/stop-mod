"use strict";

(function initSharedCategoryDropdowns() {
  const dropdowns = Array.from(document.querySelectorAll(".hero-menu-dropdown"))
    .filter((el) => el.id !== "hero-category-dropdown");

  dropdowns.forEach((dropdown) => {
    const button = dropdown.querySelector(".hero-menu-cat-btn");
    const panel = dropdown.querySelector(".hero-menu-cat-panel");
    if (!button || !panel) return;

    const open = () => {
      dropdown.classList.add("open");
      button.setAttribute("aria-expanded", "true");
      panel.hidden = false;
      panel.removeAttribute("hidden");
    };

    const close = () => {
      dropdown.classList.remove("open");
      button.setAttribute("aria-expanded", "false");
      panel.hidden = true;
    };

    close();

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const isOpen = dropdown.classList.contains("open");
      if (isOpen) close();
      else open();
    });

    dropdown.addEventListener("mouseenter", open);
    dropdown.addEventListener("mouseleave", close);

    dropdown.addEventListener("focusin", open);
    dropdown.addEventListener("focusout", (event) => {
      if (!dropdown.contains(event.relatedTarget)) close();
    });

    document.addEventListener("click", (event) => {
      if (!dropdown.contains(event.target)) close();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
    });
  });
})();

