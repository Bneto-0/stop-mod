const ADS_LEFT_IMAGES_KEY = "stopmod_ads_left_images";
const ADS_RIGHT_IMAGES_KEY = "stopmod_ads_right_images";
const ADS_LEFT_TARGET_KEY = "stopmod_ads_left_target";
const ADS_RIGHT_TARGET_KEY = "stopmod_ads_right_target";
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

function parseImages(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, MAX_ADS);
}

function loadArray(key) {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(raw) ? raw.map((x) => String(x || "").trim()).filter(Boolean).slice(0, MAX_ADS) : [];
  } catch {
    return [];
  }
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

fillFields();
