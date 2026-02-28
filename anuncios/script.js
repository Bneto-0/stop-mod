const ADS_LEFT_IMAGES_KEY = "stopmod_ads_left_images";
const ADS_RIGHT_IMAGES_KEY = "stopmod_ads_right_images";
const ADS_LEFT_TARGET_KEY = "stopmod_ads_left_target";
const ADS_RIGHT_TARGET_KEY = "stopmod_ads_right_target";
const CART_KEY = "stopmod_cart";
const SHIP_KEY = "stopmod_ship_to";
const PROFILE_KEY = "stopmod_profile";
const MAX_ADS = 10;

const leftTarget = document.getElementById("left-target");
const rightTarget = document.getElementById("right-target");
const leftImages = document.getElementById("left-images");
const rightImages = document.getElementById("right-images");
const leftPreview = document.getElementById("left-preview");
const rightPreview = document.getElementById("right-preview");
const leftMsg = document.getElementById("left-msg");
const rightMsg = document.getElementById("right-msg");

const saveLeftBtn = document.getElementById("save-left");
const saveRightBtn = document.getElementById("save-right");
const clearLeftBtn = document.getElementById("clear-left");
const clearRightBtn = document.getElementById("clear-right");

const cartCount = document.getElementById("cart-count");
const menuLocation = document.getElementById("menu-location");
const profileTopLink = document.getElementById("profile-top-link");
const profileTopName = document.getElementById("profile-top-name");
const profileTopPhoto = document.getElementById("profile-top-photo");
const searchInput = document.getElementById("search-input");

function loadJson(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "");
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function parseImages(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, MAX_ADS);
}

function loadArray(key) {
  const raw = loadJson(key, []);
  return Array.isArray(raw) ? raw.map((x) => String(x || "").trim()).filter(Boolean).slice(0, MAX_ADS) : [];
}

function fillFields() {
  const leftList = loadArray(ADS_LEFT_IMAGES_KEY);
  const rightList = loadArray(ADS_RIGHT_IMAGES_KEY);
  if (leftImages) leftImages.value = leftList.join("\n");
  if (rightImages) rightImages.value = rightList.join("\n");
  if (leftTarget) leftTarget.value = String(localStorage.getItem(ADS_LEFT_TARGET_KEY) || "");
  if (rightTarget) rightTarget.value = String(localStorage.getItem(ADS_RIGHT_TARGET_KEY) || "");
  if (leftPreview) leftPreview.src = leftList[0] || "";
  if (rightPreview) rightPreview.src = rightList[0] || "";
}

function saveSide(imagesKey, targetKey, imagesText, targetText, msgEl, previewEl) {
  const list = parseImages(imagesText);
  localStorage.setItem(imagesKey, JSON.stringify(list));
  localStorage.setItem(targetKey, String(targetText || "").trim());
  if (previewEl) previewEl.src = list[0] || "";
  if (msgEl) msgEl.textContent = `Anuncio salvo (${list.length}/${MAX_ADS}).`;
}

function clearSide(imagesKey, targetKey, imagesEl, targetEl, msgEl, previewEl) {
  localStorage.removeItem(imagesKey);
  localStorage.removeItem(targetKey);
  if (imagesEl) imagesEl.value = "";
  if (targetEl) targetEl.value = "";
  if (previewEl) previewEl.src = "";
  if (msgEl) msgEl.textContent = "Limpo.";
}

function updateCartCount() {
  if (!cartCount) return;
  const ids = loadJson(CART_KEY, []);
  if (Array.isArray(ids) && ids.length) {
    cartCount.textContent = String(ids.length);
    cartCount.style.display = "inline-flex";
  } else {
    cartCount.textContent = "0";
    cartCount.style.display = "none";
  }
}

function renderMenuLocation() {
  if (!menuLocation) return;
  const to = loadJson(SHIP_KEY, {});
  const street = String(to?.street || "").trim();
  const number = String(to?.number || "").trim();
  const city = String(to?.city || "").trim();
  const cep = String(to?.cep || "").trim();

  if (street) {
    menuLocation.textContent = [street, number].filter(Boolean).join(", ");
    return;
  }

  if (city || cep) {
    menuLocation.textContent = [city, cep].filter(Boolean).join(" ");
    return;
  }

  menuLocation.textContent = "Rua nao informada";
}

function renderTopProfile() {
  if (!profileTopLink || !profileTopName) return;
  const profile = loadJson(PROFILE_KEY, null);
  if (!profile || typeof profile !== "object") {
    profileTopName.textContent = "Perfil";
    profileTopLink.classList.remove("logged");
    if (profileTopPhoto) {
      profileTopPhoto.hidden = true;
      profileTopPhoto.removeAttribute("src");
      profileTopPhoto.alt = "";
    }
    return;
  }

  const displayName = String(profile.name || "").trim() || "Perfil";
  const picture = String(profile.picture || "").trim();
  profileTopName.textContent = displayName;
  profileTopLink.classList.add("logged");
  if (profileTopPhoto) {
    profileTopPhoto.hidden = false;
    profileTopPhoto.src = picture || "../assets/icons/user-solid.svg";
    profileTopPhoto.alt = `Foto de ${displayName}`;
  }
}

saveLeftBtn?.addEventListener("click", () => {
  saveSide(ADS_LEFT_IMAGES_KEY, ADS_LEFT_TARGET_KEY, leftImages?.value, leftTarget?.value, leftMsg, leftPreview);
});

saveRightBtn?.addEventListener("click", () => {
  saveSide(ADS_RIGHT_IMAGES_KEY, ADS_RIGHT_TARGET_KEY, rightImages?.value, rightTarget?.value, rightMsg, rightPreview);
});

clearLeftBtn?.addEventListener("click", () => {
  clearSide(ADS_LEFT_IMAGES_KEY, ADS_LEFT_TARGET_KEY, leftImages, leftTarget, leftMsg, leftPreview);
});

clearRightBtn?.addEventListener("click", () => {
  clearSide(ADS_RIGHT_IMAGES_KEY, ADS_RIGHT_TARGET_KEY, rightImages, rightTarget, rightMsg, rightPreview);
});

searchInput?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  const query = String(searchInput.value || "").trim();
  const target = query ? `../index.html?q=${encodeURIComponent(query)}#produtos` : "../index.html#produtos";
  window.location.href = target;
});

window.addEventListener("storage", (event) => {
  if (event.key === CART_KEY) updateCartCount();
  if (event.key === SHIP_KEY) renderMenuLocation();
  if (event.key === PROFILE_KEY) renderTopProfile();
});

fillFields();
updateCartCount();
renderMenuLocation();
renderTopProfile();
