const seatInput = document.getElementById("seatInput");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");
const toastOk = document.getElementById("toastOk");
const plateDrop = document.getElementById("plateDrop");
const plateItems = document.getElementById("plateItems");
const plateImage = plateDrop ? plateDrop.querySelector(".plate-img") : null;
const plateChips = document.getElementById("plateChips");
const submitOrder = document.getElementById("submitOrder");
const resetPlate = document.getElementById("resetPlate");
const submitMain = document.getElementById("submitMain");
const mainCourse = document.getElementById("mainCourse");
const mainCards = [...document.querySelectorAll(".main-card")];
const dessertCourse = document.getElementById("dessertCourse");
const dessertDrop = document.getElementById("dessertDrop");
const dessertItems = document.getElementById("dessertItems");
const dessertImage = dessertDrop ? dessertDrop.querySelector(".plate-img") : null;
const submitDessert = document.getElementById("submitDessert");
const resetDessert = document.getElementById("resetDessert");
const dessertChips = document.getElementById("dessertChips");
const dessertCards = [...document.querySelectorAll(".dessert-card")];

const counts = new Map();
const dessertCounts = new Map();
const STORAGE_KEY = "kaserol_orders";
let toastOnClose = null;
const MEZE_LABELS = {
  "1": "Sushi",
  "2": "Shrimp",
  "3": "Pizza",
};

function showToast(message, onClose) {
  if (!toast) return;
  if (message && toastMessage) toastMessage.textContent = message;
  toastOnClose = typeof onClose === "function" ? onClose : null;
  toast.hidden = false;
}

function validateSeatValue(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return { ok: false, message: "Önce koltuk numarası gir." };
  }

  const match = trimmed.match(/^(\d{1,2})\s*([a-zA-Z])?$/);
  if (!match) {
    return { ok: false, message: "Uçağımızda böyle bir koltuk bulunmamaktadır." };
  }

  const number = Number.parseInt(match[1], 10);
  if (Number.isNaN(number) || number < 1 || number > 55) {
    return { ok: false, message: "Uçağımızda böyle bir koltuk bulunmamaktadır." };
  }

  if (match[2]) {
    const letter = match[2].toLowerCase();
    const allowed = new Set(["a", "b", "c", "d", "e", "f", "g", "h", "j", "k"]);
    if (!allowed.has(letter)) {
      return { ok: false, message: "Uçağımızda böyle bir koltuk bulunmamaktadır." };
    }
  }

  return { ok: true };
}

function getNormalizedSeat(value) {
  const match = value.trim().match(/^(\d{1,2})\s*([a-zA-Z])?$/);
  if (!match) return value.trim().toLowerCase();
  const number = Number.parseInt(match[1], 10);
  const letter = match[2] ? match[2].toUpperCase() : "";
  return `${number}${letter}`;
}

function focusMainCourse() {
  if (!mainCourse) return;
  mainCourse.classList.remove("is-hidden");
  mainCourse.scrollIntoView({ behavior: "smooth", block: "start" });
}

function focusDessertCourse() {
  if (!dessertCourse) return;
  dessertCourse.classList.remove("is-hidden");
  dessertCourse.scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateMainSelection(selected) {
  mainCards.forEach((card) => {
    card.classList.toggle("selected", card === selected);
  });
}

function loadOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveOrders(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function serializePlate() {
  return [...counts.entries()].map(([item, count]) => ({ item, count }));
}

function serializeDessert() {
  return [...dessertCounts.entries()].map(([item, count]) => ({ item, count }));
}

function clearPlate() {
  counts.clear();
  renderPlate();
}

function clearDessert() {
  dessertCounts.clear();
  renderDessert();
}

function setDragData(event, payload) {
  event.dataTransfer.setData("text/plain", JSON.stringify(payload));
  event.dataTransfer.effectAllowed = "move";
}

function getDragData(event) {
  const raw = event.dataTransfer.getData("text/plain");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function adjustChipScale(container, chipCount) {
  if (!container) return;
  let scale = 1;
  if (chipCount >= 9) scale = 0.6;
  else if (chipCount >= 7) scale = 0.7;
  else if (chipCount >= 5) scale = 0.8;
  else if (chipCount >= 4) scale = 0.9;
  container.style.setProperty("--chip-scale", String(scale));
}

function updatePlateImage() {
  if (!plateImage) return;
  const items = [...counts.keys()].sort();
  const key = items.join(",");
  const imageMap = {
    "1": { src: "sushi-only.png", alt: "Sushi tabağı" },
    "2": { src: "shrimp-only.png", alt: "Shrimp tabağı" },
    "3": { src: "pizza-only.png", alt: "Pizza tabağı" },
    "1,2": { src: "sushi-shrimp.png", alt: "Sushi ve shrimp tabağı" },
    "1,3": { src: "sushi-pizza.png", alt: "Sushi ve pizza tabağı" },
    "2,3": { src: "shrimp-pizza.png", alt: "Shrimp ve pizza tabağı" },
    "1,2,3": {
      src: "sushi-shrimp-pizza.png",
      alt: "Sushi, shrimp ve pizza tabağı",
    },
  };
  const match = imageMap[key];
  if (match) {
    plateImage.src = match.src;
    plateImage.alt = match.alt;
    return;
  }
  plateImage.src = "servis.png";
  plateImage.alt = "Servis tabağı";
}

function renderPlate() {
  plateItems.innerHTML = "";
  if (plateChips) plateChips.innerHTML = "";
  updatePlateImage();

  [...counts.entries()]
    .sort()
    .filter(([, count]) => count > 1)
    .forEach(([item, count]) => {
      if (!plateChips) return;
      const chip = document.createElement("div");
      chip.className = "plate-item";
      const label = MEZE_LABELS[item] || item;
      chip.textContent = label;
      const sup = document.createElement("span");
      sup.className = "chip-sup";
      sup.textContent = `x${count}`;
      chip.appendChild(sup);
      plateChips.appendChild(chip);
    });
}

function renderDessert() {
  dessertItems.innerHTML = "";
  if (dessertChips) dessertChips.innerHTML = "";
  updateDessertImage();

  [...dessertCounts.entries()]
    .sort()
    .filter(([, count]) => count > 1)
    .forEach(([item, count]) => {
      if (!dessertChips) return;
      const chip = document.createElement("div");
      chip.className = "plate-item";
      const labelMap = {
        "1": "Baklava",
        "2": "Browni",
        "3": "Cheesecake",
      };
      chip.textContent = labelMap[item] || item;
      const sup = document.createElement("span");
      sup.className = "chip-sup";
      sup.textContent = `x${count}`;
      chip.appendChild(sup);
      dessertChips.appendChild(chip);
    });
}

function incrementItem(item) {
  const current = counts.get(item) || 0;
  counts.set(item, current + 1);
  renderPlate();
}

function incrementDessert(item) {
  const current = dessertCounts.get(item) || 0;
  dessertCounts.set(item, current + 1);
  renderDessert();
}

function decrementItem(item) {
  const current = counts.get(item) || 0;
  if (current <= 1) {
    counts.delete(item);
  } else {
    counts.set(item, current - 1);
  }
  renderPlate();
}

function decrementDessert(item) {
  const current = dessertCounts.get(item) || 0;
  if (current <= 1) {
    dessertCounts.delete(item);
  } else {
    dessertCounts.set(item, current - 1);
  }
  renderDessert();
}

function updateDessertImage() {
  if (!dessertImage) return;
  const items = [...dessertCounts.keys()].sort();
  const key = items.join(",");
  const imageMap = {
    "1": { src: "baklava-only.png", alt: "Baklava tabağı" },
    "2": { src: "browni-only.png", alt: "Browni tabağı" },
    "3": { src: "cheesecake-only.png", alt: "Cheesecake tabağı" },
    "1,2": { src: "baklava-browni.png", alt: "Baklava ve browni tabağı" },
    "1,3": { src: "baklava-cheesecake.png", alt: "Baklava ve cheesecake tabağı" },
    "2,3": { src: "cheesecake-browni.png", alt: "Browni ve cheesecake tabağı" },
    "1,2,3": {
      src: "browni-cheesecake-baklava.png",
      alt: "Browni, cheesecake ve baklava tabağı",
    },
  };
  const match = imageMap[key];
  if (match) {
    dessertImage.src = match.src;
    dessertImage.alt = match.alt;
    return;
  }
  dessertImage.src = "servis.png";
  dessertImage.alt = "Tatlı tabağı";
}

function handleDropToPlate(event) {
  event.preventDefault();
  plateDrop.classList.remove("drag-over");
  const validation = validateSeatValue(seatInput.value);
  if (!validation.ok) {
    showToast(validation.message);
    return;
  }
  const data = getDragData(event);
  if (!data || data.source !== "tray") return;
  incrementItem(data.item);
}

function handleDropToDessert(event) {
  event.preventDefault();
  dessertDrop.classList.remove("drag-over");
  const validation = validateSeatValue(seatInput.value);
  if (!validation.ok) {
    showToast(validation.message);
    return;
  }
  const data = getDragData(event);
  if (!data || data.source !== "dessert-tray") return;
  incrementDessert(data.item);
}

function handleDropToTray(event) {
  event.preventDefault();
  const data = getDragData(event);
  if (!data || data.source !== "plate") return;
  decrementItem(data.item);
}

function handleDropToDessertTray(event) {
  event.preventDefault();
  const data = getDragData(event);
  if (!data || data.source !== "dessert-plate") return;
  decrementDessert(data.item);
}

function enableTrayDrag(card) {
  card.addEventListener("dragstart", (event) => {
    setDragData(event, { source: "tray", item: card.dataset.item });
  });
  card.addEventListener("dragover", (event) => {
    event.preventDefault();
  });
  card.addEventListener("drop", handleDropToTray);
}

function enableDessertDrag(card) {
  card.addEventListener("dragstart", (event) => {
    setDragData(event, { source: "dessert-tray", item: card.dataset.dessert });
  });
  card.addEventListener("dragover", (event) => {
    event.preventDefault();
  });
  card.addEventListener("drop", handleDropToDessertTray);
}

plateDrop.addEventListener("dragover", (event) => {
  event.preventDefault();
  plateDrop.classList.add("drag-over");
});

plateDrop.addEventListener("dragleave", () => {
  plateDrop.classList.remove("drag-over");
});

plateDrop.addEventListener("drop", handleDropToPlate);

dessertDrop.addEventListener("dragover", (event) => {
  event.preventDefault();
  dessertDrop.classList.add("drag-over");
});

dessertDrop.addEventListener("dragleave", () => {
  dessertDrop.classList.remove("drag-over");
});

dessertDrop.addEventListener("drop", handleDropToDessert);

seatInput.addEventListener("input", () => {
  if (!toast) return;
  toast.hidden = true;
  toastOnClose = null;
});

if (toast) {
  toast.addEventListener("click", (event) => {
    if (event.target === toast || event.target === toastOk) {
      toast.hidden = true;
      if (toastOnClose) {
        const cb = toastOnClose;
        toastOnClose = null;
        cb();
      }
    }
  });
}

submitOrder.addEventListener("click", () => {
  const validation = validateSeatValue(seatInput.value);
  if (!validation.ok) {
    showToast(validation.message);
    return;
  }
  if (counts.size === 0) {
    showToast("Tabak boş, lütfen seçim yap.");
    return;
  }

  const seatKey = getNormalizedSeat(seatInput.value);
  const orders = loadOrders();
  const existing = orders[seatKey];
  const payload = Array.isArray(existing) ? { meze: existing } : existing || {};
  orders[seatKey] = {
    ...payload,
    meze: serializePlate(),
  };
  saveOrders(orders);
  showToast(
    "Meze tercihleriniz şefimize iletildi. Lütfen ana yemek seçimine ilerleyin.",
    focusMainCourse
  );
  clearPlate();
});

if (resetPlate) {
  resetPlate.addEventListener("click", () => {
    clearPlate();
  });
}

mainCards.forEach((card) => {
  card.addEventListener("click", () => updateMainSelection(card));
});

submitMain.addEventListener("click", () => {
  const validation = validateSeatValue(seatInput.value);
  if (!validation.ok) {
    showToast(validation.message);
    return;
  }
  const selected = mainCards.find((card) => card.classList.contains("selected"));
  if (!selected) {
    showToast("Lütfen bir ana yemek seç.");
    return;
  }

  const seatKey = getNormalizedSeat(seatInput.value);
  const orders = loadOrders();
  const existing = orders[seatKey];
  const payload = Array.isArray(existing) ? { meze: existing } : existing || {};
  orders[seatKey] = {
    ...payload,
    main: selected.dataset.main,
  };
  saveOrders(orders);
  showToast("Ana yemek tercihiniz kaydedildi. Lütfen tatlıya devam edin.", focusDessertCourse);
});

[...document.querySelectorAll(".card[data-item]")].forEach(enableTrayDrag);
dessertCards.forEach(enableDessertDrag);

submitDessert.addEventListener("click", () => {
  const validation = validateSeatValue(seatInput.value);
  if (!validation.ok) {
    showToast(validation.message);
    return;
  }
  if (dessertCounts.size === 0) {
    showToast("Tatlı tabağı boş, lütfen seçim yap.");
    return;
  }

  const seatKey = getNormalizedSeat(seatInput.value);
  const orders = loadOrders();
  const existing = orders[seatKey];
  const payload = Array.isArray(existing) ? { meze: existing } : existing || {};
  orders[seatKey] = {
    ...payload,
    dessert: serializeDessert(),
  };
  saveOrders(orders);
  showToast("Tüm siparişleriniz alınmıştır.");
  clearDessert();
});

renderPlate();
renderDessert();

if (resetDessert) {
  resetDessert.addEventListener("click", () => {
    clearDessert();
  });
}
