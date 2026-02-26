"use strict";

(function initSharedCategoryDropdowns() {
  const HIDE_NOTIFY_TEXTS = true;

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

  const styleNotifyPanelLink = (link) => {
    link.style.display = "grid";
    link.style.gap = "0.18rem";
    link.style.padding = "0.5rem 0.58rem";
    link.style.borderRadius = "8px";
    link.style.color = "#2f2824";
    link.style.textDecoration = "none";
    link.style.fontSize = "0.92rem";
    link.style.fontStyle = "normal";
    link.style.fontWeight = "700";
    link.style.lineHeight = "1.22";
    link.addEventListener("mouseenter", () => {
      link.style.background = "#f0dfd1";
      link.style.color = "#6e3b27";
    });
    link.addEventListener("mouseleave", () => {
      link.style.background = "transparent";
      link.style.color = "#2f2824";
    });
    link.addEventListener("focus", () => {
      link.style.background = "#f0dfd1";
      link.style.color = "#6e3b27";
    });
    link.addEventListener("blur", () => {
      link.style.background = "transparent";
      link.style.color = "#2f2824";
    });
  };

  const ensureNotifyDropdown = () => {
    document.querySelectorAll("a.notify-top[href]").forEach((notifyLink) => {
      if (notifyLink.closest(".hero-menu-dropdown")) return;

      const dropdown = document.createElement("div");
      dropdown.className = "hero-menu-dropdown hero-notify-dropdown";

      const button = document.createElement("button");
      button.type = "button";
      button.className = "hero-menu-cat-btn hero-notify-btn";
      button.setAttribute("aria-haspopup", "true");
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-label", "Alertas do site");
      const svgHtml =
        notifyLink.querySelector("svg")?.outerHTML ||
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22zm7-6V11a7 7 0 1 0-14 0v5l-2 2v1h18v-1l-2-2z"></path></svg>';
      button.innerHTML = `${svgHtml}<span class="hero-menu-cat-caret" aria-hidden="true">&#9662;</span>`;
      button.style.gap = "0.26rem";
      button.style.width = "auto";
      button.style.height = "auto";
      button.style.padding = "0";
      button.style.display = "inline-flex";
      button.style.alignItems = "center";
      button.style.justifyContent = "center";

      const btnSvg = button.querySelector("svg");
      if (btnSvg) {
        btnSvg.style.width = "18px";
        btnSvg.style.height = "18px";
        btnSvg.style.fill = "currentColor";
        btnSvg.style.display = "block";
      }

      const btnCaret = button.querySelector(".hero-menu-cat-caret");
      if (btnCaret) {
        btnCaret.style.opacity = "0";
        btnCaret.style.pointerEvents = "none";
      }

      const panel = document.createElement("div");
      panel.className = "hero-menu-cat-panel hero-notify-panel";
      panel.setAttribute("role", "menu");
      panel.setAttribute("aria-label", "Alertas do site");
      panel.hidden = true;
      panel.style.left = "auto";
      panel.style.right = "0";
      panel.style.minWidth = "290px";
      panel.style.maxWidth = "320px";

      const header = document.createElement("div");
      header.textContent = "Alertas do site";
      header.style.fontSize = "0.86rem";
      header.style.fontWeight = "900";
      header.style.color = "#6e3b27";
      header.style.padding = "0.42rem 0.58rem";
      if (HIDE_NOTIFY_TEXTS) {
        header.style.color = "transparent";
      }

      const notifyHref = String(notifyLink.getAttribute("href") || "/notificacoes/").trim() || "/notificacoes/";
      const alerts = [
        { href: notifyHref, title: "Ver todas notificacoes", detail: "Abrir central de avisos" },
        { href: "/descontos/", title: "Promocao do dia", detail: "Novos descontos ja disponiveis" },
        { href: "/cupons/", title: "Novo cupom ativo", detail: "Confira seus cupons na loja" },
        { href: "/perfil/processando/", title: "Atualizacao de pedidos", detail: "Acompanhe rastreio e entrega" }
      ];

      panel.append(header);
      alerts.forEach((alert) => {
        const item = document.createElement("a");
        item.href = alert.href;
        item.setAttribute("role", "menuitem");
        item.innerHTML = `<span>${alert.title}</span><small style="font-size:0.76rem;color:#6f635c;font-weight:700;">${alert.detail}</small>`;
        styleNotifyPanelLink(item);
        if (HIDE_NOTIFY_TEXTS) {
          item.style.color = "transparent";
          const small = item.querySelector("small");
          if (small) small.style.color = "transparent";
        }
        panel.append(item);
      });

      dropdown.append(button, panel);
      notifyLink.replaceWith(dropdown);
    });
  };

  ensureNotifyDropdown();

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
