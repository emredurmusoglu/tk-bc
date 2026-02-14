const seatInput = document.getElementById("seatInput");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");
const toastOk = document.getElementById("toastOk");
const plateDrop = document.getElementById("plateDrop");
const plateItems = document.getElementById("plateItems");
const submitOrder = document.getElementById("submitOrder");
const submitMain = document.getElementById("submitMain");
const mainCourse = document.getElementById("mainCourse");
const mainCards = [...document.querySelectorAll(".main-card")];
const dessertCourse = document.getElementById("dessertCourse");
const dessertDrop = document.getElementById("dessertDrop");
const dessertItems = document.getElementById("dessertItems");
const submitDessert = document.getElementById("submitDessert");
const dessertCards = [...document.querySelectorAll(".dessert-card")];

const counts = new Map();
const dessertCounts = new Map();
const STORAGE_KEY = "kaserol_orders";
let toastOnClose = null;

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
  mainCourse.scrollIntoView({ behavior: "smooth", block: "start" });
}

function focusDessertCourse() {
  if (!dessertCourse) return;
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

function renderPlate() {
  plateItems.innerHTML = "";
  [...counts.entries()].sort().forEach(([item, count]) => {
    const chip = document.createElement("div");
    chip.className = "plate-item";
    chip.draggable = true;
    chip.dataset.item = item;
    chip.textContent = `${item}`;
    if (count > 1) {
      const sup = document.createElement("span");
      sup.className = "chip-sup";
      sup.textContent = `x${count}`;
      chip.appendChild(sup);
    }
    chip.addEventListener("dragstart", (event) => {
      setDragData(event, { source: "plate", item });
    });
    plateItems.appendChild(chip);
  });
  adjustChipScale(plateItems, counts.size);
}

function renderDessert() {
  dessertItems.innerHTML = "";
  [...dessertCounts.entries()].sort().forEach(([item, count]) => {
    const chip = document.createElement("div");
    chip.className = "plate-item";
    chip.draggable = true;
    chip.dataset.item = item;
    chip.textContent = `${item}`;
    if (count > 1) {
      const sup = document.createElement("span");
      sup.className = "chip-sup";
      sup.textContent = `x${count}`;
      chip.appendChild(sup);
    }
    chip.addEventListener("dragstart", (event) => {
      setDragData(event, { source: "dessert-plate", item });
    });
    dessertItems.appendChild(chip);
  });
  adjustChipScale(dessertItems, dessertCounts.size);
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
  showToast("Tatlı tercihiniz kaydedildi.");
  clearDessert();
});

renderPlate();
renderDessert();
