"use strict";

(function initSharedCategoryDropdowns() {
  const HIDE_NOTIFY_TEXTS = false;
  const NOTES_KEY = "stopmod_notifications";
  const COUPON_KEY = "stopmod_coupons";
  const ORDERS_KEY = "stopmod_orders";
  const PROFILE_KEY = "stopmod_profile";
  const FAVORITES_KEY = "stopmod_favorites";

  const loadJson = (key, fallback) => {
    try {
      const raw = JSON.parse(localStorage.getItem(key) || "null");
      return raw == null ? fallback : raw;
    } catch {
      return fallback;
    }
  };

  const saveJson = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore storage errors
    }
  };

  const normalizeText = (value) =>
    String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

  const nowIso = () => new Date().toISOString();
  const parseTime = (value) => {
    const ts = Date.parse(String(value || ""));
    return Number.isFinite(ts) ? ts : 0;
  };

  const activeProfile = () => {
    const profile = loadJson(PROFILE_KEY, null);
    return profile && typeof profile === "object" ? profile : null;
  };

  const activeUserKey = () => {
    const email = normalizeText(activeProfile()?.email || "");
    return email || "";
  };

  const paymentLabel = (value) => {
    const key = normalizeText(value);
    if (key.includes("credito")) return "Cartao de credito";
    if (key.includes("debito")) return "Cartao de debito";
    if (key.includes("boleto")) return "Boleto";
    return "Pix";
  };

  const orderBucket = (order) => {
    const status = normalizeText(order?.tracking?.status || order?.status || "");
    if (order?.cancelled === true || status.includes("cancel")) return "cancelled";
    if (status.includes("entreg")) return "delivered";
    if (
      status.includes("prepar") ||
      status.includes("process") ||
      status.includes("envi") ||
      status.includes("transit") ||
      status.includes("transito") ||
      status.includes("rota") ||
      status.includes("saiu")
    ) {
      return "in-progress";
    }
    return "in-progress";
  };

  const orderStatusLabel = (order) => {
    const raw = String(order?.tracking?.status || order?.status || "").trim();
    if (raw) return raw;
    return orderBucket(order) === "delivered" ? "Entregue" : "Em andamento";
  };

  const upsertNotification = (list, incoming) => {
    const id = String(incoming?.id || "").trim();
    if (!id) return;

    const next = {
      id,
      scope: String(incoming.scope || "general"),
      type: String(incoming.type || "aviso"),
      title: String(incoming.title || "Notificacao"),
      text: String(incoming.text || ""),
      href: String(incoming.href || "/notificacoes/"),
      userKey: String(incoming.userKey || "").trim(),
      date: String(incoming.date || "Hoje"),
      createdAt: String(incoming.createdAt || nowIso())
    };

    const idx = list.findIndex((n) => String(n?.id || "") === id);
    if (idx === -1) {
      list.push(next);
      return;
    }

    const prev = list[idx] || {};
    list[idx] = {
      ...prev,
      ...next,
      createdAt: String(prev.createdAt || next.createdAt || nowIso())
    };
  };

  const removeNotification = (list, id) => {
    const key = String(id || "").trim();
    if (!key) return;
    const idx = list.findIndex((n) => String(n?.id || "") === key);
    if (idx >= 0) list.splice(idx, 1);
  };

  const syncNotifications = () => {
    const notes = loadJson(NOTES_KEY, []);
    const list = Array.isArray(notes) ? notes.filter(Boolean) : [];
    const userKey = activeUserKey();

    const generalSeeds = [
      {
        id: "general-discounts",
        scope: "general",
        type: "desconto",
        title: "Descontos ativos na loja",
        text: "Novos produtos em promocao foram publicados.",
        href: "/descontos/",
        date: "Hoje"
      },
      {
        id: "general-coupons",
        scope: "general",
        type: "cupom",
        title: "Cupons disponiveis",
        text: "Confira e ative seu cupom na aba Cupons.",
        href: "/cupons/",
        date: "Hoje"
      },
      {
        id: "general-new-products",
        scope: "general",
        type: "novo",
        title: "Produtos novos na colecao",
        text: "A loja recebeu novas pecas para voce.",
        href: "/index.html#produtos",
        date: "Hoje"
      },
      {
        id: "general-promotions",
        scope: "general",
        type: "promo",
        title: "Promocoes gerais atualizadas",
        text: "Ofertas relampago e campanhas da semana ativas.",
        href: "/descontos/",
        date: "Hoje"
      }
    ];

    generalSeeds.forEach((seed) => upsertNotification(list, seed));

    const coupons = loadJson(COUPON_KEY, []);
    const activeCoupon = Array.isArray(coupons) ? String(coupons[0] || "").trim().toUpperCase() : "";
    const couponPrefix = `coupon-active-${userKey || "guest"}-`;
    for (let i = list.length - 1; i >= 0; i -= 1) {
      const noteId = String(list[i]?.id || "");
      if (noteId.startsWith(couponPrefix)) list.splice(i, 1);
    }
    if (activeCoupon) {
      upsertNotification(list, {
        id: `${couponPrefix}${activeCoupon}`,
        scope: "individual",
        type: "cupom",
        userKey,
        title: `Cupom ativo: ${activeCoupon}`,
        text: "Use este cupom no carrinho antes de finalizar a compra.",
        href: "/carrinho/",
        date: "Agora"
      });
    }

    const favoriteIds = loadJson(FAVORITES_KEY, []);
    const favoriteCount = Array.isArray(favoriteIds) ? favoriteIds.length : 0;
    const favId = `favorites-count-${userKey || "guest"}`;
    if (favoriteCount > 0) {
      upsertNotification(list, {
        id: favId,
        scope: "individual",
        type: "favorito",
        userKey,
        title: `${favoriteCount} produto(s) nos favoritos`,
        text: "Seus favoritos estao salvos no perfil.",
        href: "/perfil/favoritos/",
        date: "Agora"
      });
    } else {
      removeNotification(list, favId);
    }

    const orders = loadJson(ORDERS_KEY, []);
    if (Array.isArray(orders)) {
      orders.forEach((order) => {
        const id = String(order?.id || "").trim();
        if (!id) return;

        const owner = normalizeText(order?.ownerEmail || "");
        const noteUserKey = owner || userKey || "";
        const bucket = orderBucket(order);
        ["in-progress", "delivered", "cancelled"].forEach((candidate) => {
          if (candidate === bucket) return;
          removeNotification(list, `order-${id}-${candidate}`);
        });
        const status = orderStatusLabel(order);
        const total = Number(order?.totals?.total || 0).toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });

        let title = `Pedido ${id} atualizado`;
        if (bucket === "in-progress") title = `Pedido ${id} em andamento`;
        if (bucket === "delivered") title = `Pedido ${id} entregue`;
        if (bucket === "cancelled") title = `Pedido ${id} cancelado`;

        upsertNotification(list, {
          id: `order-${id}-${bucket}`,
          scope: "individual",
          type: "pedido",
          userKey: noteUserKey,
          title,
          text: `Status: ${status}. Total: R$ ${total}. Pagamento: ${paymentLabel(order?.payment)}.`,
          href: "/perfil/pedidos/",
          date: "Agora",
          createdAt: String(order?.createdAt || nowIso())
        });
      });
    }

    list.sort((a, b) => parseTime(b?.createdAt) - parseTime(a?.createdAt));
    const capped = list.slice(0, 500);
    saveJson(NOTES_KEY, capped);
    return capped;
  };

  const isVisibleNote = (note, userKey) => {
    if (!note || typeof note !== "object") return false;
    const scope = String(note.scope || "general");
    if (scope !== "individual") return true;
    const owner = normalizeText(note.userKey || "");
    if (!owner) return !!userKey;
    if (!userKey) return false;
    return owner === userKey;
  };

  const listVisibleNotifications = (limit) => {
    const userKey = activeUserKey();
    const notes = syncNotifications().filter((note) => isVisibleNote(note, userKey));
    if (Number.isFinite(limit) && limit > 0) return notes.slice(0, limit);
    return notes;
  };

  const addNotification = (payload) => {
    const list = loadJson(NOTES_KEY, []);
    const arr = Array.isArray(list) ? list : [];
    upsertNotification(arr, {
      ...payload,
      createdAt: String(payload?.createdAt || nowIso())
    });
    arr.sort((a, b) => parseTime(b?.createdAt) - parseTime(a?.createdAt));
    saveJson(NOTES_KEY, arr.slice(0, 500));
    return arr;
  };

  window.StopModNotifications = {
    sync: syncNotifications,
    listVisible: listVisibleNotifications,
    add: addNotification
  };

  syncNotifications();

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
      button.style.position = "relative";

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

      const visibleCount = listVisibleNotifications(99).length;
      if (visibleCount > 0) {
        const badge = document.createElement("span");
        badge.textContent = String(Math.min(visibleCount, 99));
        badge.style.minWidth = "16px";
        badge.style.height = "16px";
        badge.style.padding = "0 4px";
        badge.style.borderRadius = "999px";
        badge.style.background = "#c9512b";
        badge.style.color = "#fff";
        badge.style.fontSize = "0.62rem";
        badge.style.fontWeight = "900";
        badge.style.display = "inline-flex";
        badge.style.alignItems = "center";
        badge.style.justifyContent = "center";
        badge.style.lineHeight = "1";
        badge.style.position = "absolute";
        badge.style.top = "-7px";
        badge.style.right = "-9px";
        badge.style.pointerEvents = "none";
        button.append(badge);
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
      panel.style.maxHeight = "340px";
      panel.style.overflowY = "auto";
      panel.style.pointerEvents = "auto";

      const header = document.createElement("div");
      header.textContent = "Alertas do site";
      header.style.fontSize = "0.86rem";
      header.style.fontWeight = "900";
      header.style.color = "#6e3b27";
      header.style.padding = "0.42rem 0.58rem";
      if (HIDE_NOTIFY_TEXTS) header.style.color = "transparent";

      const notifyHref = String(notifyLink.getAttribute("href") || "/notificacoes/").trim() || "/notificacoes/";
      const alerts = listVisibleNotifications(8);

      panel.append(header);
      if (!alerts.length) {
        const empty = document.createElement("div");
        empty.style.padding = "0.5rem 0.58rem";
        empty.style.fontSize = "0.84rem";
        empty.style.fontWeight = "800";
        empty.style.color = "#6f635c";
        empty.textContent = "Sem alertas no momento.";
        panel.append(empty);
      }

      alerts.forEach((alert) => {
        const item = document.createElement("a");
        item.href = String(alert.href || notifyHref);
        item.setAttribute("role", "menuitem");
        item.style.pointerEvents = "auto";
        const title = String(alert.title || "Notificacao");
        const detail = String(alert.text || "Abrir central de avisos");
        item.innerHTML = `
          <span style="display:flex;align-items:center;justify-content:space-between;gap:.45rem;">
            <strong style="font-size:.9rem;font-weight:900;line-height:1.15;">${title}</strong>
            <span style="font-size:.72rem;font-weight:900;color:#c9512b;">Abrir</span>
          </span>
          <small style="font-size:0.76rem;color:#6f635c;font-weight:700;">${detail}</small>
        `;
        styleNotifyPanelLink(item);
        if (HIDE_NOTIFY_TEXTS) {
          item.style.color = "transparent";
          const small = item.querySelector("small");
          if (small) small.style.color = "transparent";
        }
        item.addEventListener("click", (event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          if (event.cancelable) event.preventDefault();
          event.stopPropagation();
          closeAllDropdowns();
          window.location.assign(item.href);
        });
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
    const isNotifyDropdown = dropdown.classList.contains("hero-notify-dropdown");

    closeDropdown(dropdown);

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const isOpen = dropdown.classList.contains("open");
      closeAllDropdowns();
      if (!isOpen) openDropdown(dropdown);
    });

    if (!isNotifyDropdown) {
      dropdown.addEventListener("mouseenter", () => openDropdown(dropdown));
      dropdown.addEventListener("mouseleave", () => closeDropdown(dropdown));
    }
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
      const target =
        event.target instanceof Element ? event.target.closest('a[href="/perfil/favoritos/"], a[href="/perfil/favoritos"]') : null;
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
