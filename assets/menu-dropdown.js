"use strict";

(function initSharedCategoryDropdowns() {
  const ensureFavoritesDropdown = () => {
    document.querySelectorAll(".hero-menu").forEach((menu) => {
      const favoriteLink = Array.from(menu.querySelectorAll('a[href="/perfil/favoritos/"], a[href="/perfil/favoritos"]')).find(
        (link) => link.parentElement === menu && !link.closest(".hero-menu-dropdown")
      );
      if (!favoriteLink) return;

      const dropdown = document.createElement("div");
      dropdown.className = "hero-menu-dropdown hero-favorites-dropdown";

      const button = document.createElement("button");
      button.type = "button";
      button.className = "hero-menu-cat-btn hero-favorites-btn";
      button.setAttribute("aria-haspopup", "true");
      button.setAttribute("aria-expanded", "false");
      button.innerHTML = 'Favoritos <span class="hero-menu-cat-caret" aria-hidden="true">&#9662;</span>';

      const panel = document.createElement("div");
      panel.className = "hero-menu-cat-panel hero-favorites-panel";
      panel.setAttribute("role", "menu");
      panel.setAttribute("aria-label", "Favoritos");
      panel.hidden = true;

      const openFavorites = document.createElement("a");
      openFavorites.href = "/perfil/favoritos/";
      openFavorites.setAttribute("role", "menuitem");
      openFavorites.textContent = "Ver favoritos";

      const openSaved = document.createElement("a");
      openSaved.href = "/perfil/favoritos/#salvos";
      openSaved.setAttribute("role", "menuitem");
      openSaved.textContent = "Itens salvos";

      panel.append(openFavorites, openSaved);
      dropdown.append(button, panel);
      favoriteLink.replaceWith(dropdown);
    });
  };

  ensureFavoritesDropdown();

  const dropdowns = Array.from(document.querySelectorAll(".hero-menu-dropdown")).filter(
    (el) => el.id !== "hero-category-dropdown"
  );

  const closeDropdown = (dropdown) => {
    const button = dropdown.querySelector(".hero-menu-cat-btn");
    const panel = dropdown.querySelector(".hero-menu-cat-panel");
    if (!button || !panel) return;
    dropdown.classList.remove("open");
    button.setAttribute("aria-expanded", "false");
    panel.hidden = true;
  };

  const openDropdown = (dropdown) => {
    const button = dropdown.querySelector(".hero-menu-cat-btn");
    const panel = dropdown.querySelector(".hero-menu-cat-panel");
    if (!button || !panel) return;
    dropdown.classList.add("open");
    button.setAttribute("aria-expanded", "true");
    panel.hidden = false;
    panel.removeAttribute("hidden");
  };

  const closeAllDropdowns = () => {
    dropdowns.forEach((dropdown) => closeDropdown(dropdown));
  };

  dropdowns.forEach((dropdown) => {
    const button = dropdown.querySelector(".hero-menu-cat-btn");
    const panel = dropdown.querySelector(".hero-menu-cat-panel");
    if (!button || !panel) return;

    closeDropdown(dropdown);

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const isOpen = dropdown.classList.contains("open");
      closeAllDropdowns();
      if (!isOpen) openDropdown(dropdown);
    });

    dropdown.addEventListener("mouseenter", () => openDropdown(dropdown));
    dropdown.addEventListener("mouseleave", () => closeDropdown(dropdown));

    dropdown.addEventListener("focusin", () => openDropdown(dropdown));
    dropdown.addEventListener("focusout", (event) => {
      if (!dropdown.contains(event.relatedTarget)) closeDropdown(dropdown);
    });
  });

  document.addEventListener("click", (event) => {
    const clickedInsideAny = dropdowns.some((dropdown) => dropdown.contains(event.target));
    if (!clickedInsideAny) closeAllDropdowns();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeAllDropdowns();
  });

  window.addEventListener("blur", closeAllDropdowns);
  window.addEventListener("resize", closeAllDropdowns);
  document.addEventListener("scroll", closeAllDropdowns, true);

  const bindForcedNav = (selector, flagName) => {
    document.querySelectorAll(selector).forEach((link) => {
      if (link.dataset[flagName] === "1") return;
      link.dataset[flagName] = "1";
      link.addEventListener(
        "click",
        (event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          const href = String(link.getAttribute("href") || "").trim();
          if (!href || href.startsWith("javascript:")) return;
          if (event.cancelable) event.preventDefault();
          event.stopPropagation();
          closeAllDropdowns();
          window.location.assign(link.href);
        },
        true
      );
    });
  };

  bindForcedNav("a.notify-top[href]", "notifyNavBound");
  bindForcedNav(".hero-menu > a[href]", "menuNavBound");

  document.addEventListener(
    "click",
    (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target.closest('a[href="/perfil/favoritos/"], a[href="/perfil/favoritos"]') : null;
      if (!target) return;
      const href = String(target.getAttribute("href") || "").trim();
      if (!href || href.startsWith("javascript:")) return;
      if (event.cancelable) event.preventDefault();
      event.stopPropagation();
      closeAllDropdowns();
      window.location.assign(target.href);
    },
    true
  );
})();
