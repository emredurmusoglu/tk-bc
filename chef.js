const chefList = document.getElementById("chefList");
const chefSeatBar = document.getElementById("chefSeatBar");
const STORAGE_KEY = "kaserol_orders";
const ITEM_LABELS = {
  "1": "Sushi",
  "2": "Shrimp",
  "3": "Pizza",
};
const DESSERT_LABELS = {
  "1": "Baklava",
  "2": "Browni",
  "3": "Cheesecake",
};
const MAIN_LABELS = {
  mantarmakarna: "Mantarlı Makarna",
  kuzuincik: "Kuzu İncik",
  kilicbaligi: "Kılıç Balığı",
};
const MAIN_IMAGES = {
  mantarmakarna: "pasta.png",
  kuzuincik: "kuzu.png",
  kilicbaligi: "balik.png",
};
const MEZE_IMAGE_MAP = {
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
const DESSERT_IMAGE_MAP = {
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

function clearActiveSeat() {
  chefList.innerHTML = "";
}

function renderSeatDetail(seat, data) {
  clearActiveSeat();
  const row = document.createElement("div");
  row.className = "chef-item";

  const seatEl = document.createElement("div");
  seatEl.className = "chef-seat";
  seatEl.textContent = `${seat.toUpperCase()} koltuğu`;
  row.appendChild(seatEl);

  const normalized = Array.isArray(data) ? { meze: data } : data || {};
  const mezeItems = normalized.meze || [];
  const mainChoice = normalized.main || null;
  const dessertItems = normalized.dessert || [];

  const mezeTitle = document.createElement("div");
  mezeTitle.className = "chef-subtitle";
  mezeTitle.textContent = "Meze";
  row.appendChild(mezeTitle);

  const plate = document.createElement("div");
  plate.className = "chef-plate-visual";

  const plateImg = document.createElement("img");
  plateImg.src = "servis.png";
  plateImg.alt = "Servis tabağı";
  plate.appendChild(plateImg);

  const plateItems = document.createElement("div");
  plateItems.className = "chef-plate-items";

  const mezeSet = new Set();
  mezeItems.forEach((entry) => {
    const chip = document.createElement("div");
    chip.className = "chef-plate-item";

    const text = document.createElement("span");
    const normalizedEntry = normalizeChipEntry(entry, ITEM_LABELS, "Meze");
    const label = normalizedEntry.label;
    if (normalizedEntry.itemId) {
      mezeSet.add(normalizedEntry.itemId);
    }
    if (normalizedEntry.count > 1) {
      text.textContent = label;
      chip.appendChild(text);
      const sup = document.createElement("span");
      sup.className = "chip-sup";
      sup.textContent = `x${normalizedEntry.count}`;
      chip.appendChild(sup);
      plateItems.appendChild(chip);
    }
  });

  plate.appendChild(plateItems);
  row.appendChild(plate);
  adjustChipScale(plateItems, mezeItems.length);
  updateChefPlateImage(plateImg, mezeSet);

  const mainTitle = document.createElement("div");
  mainTitle.className = "chef-subtitle";
  mainTitle.textContent = "Ana Yemek";
  row.appendChild(mainTitle);

  const mainWrap = document.createElement("div");
  mainWrap.className = "chef-main";

  if (mainChoice) {
    const mainCard = document.createElement("div");
    mainCard.className = "chef-main-card";

    const img = document.createElement("img");
    img.src = MAIN_IMAGES[mainChoice] || "servis.png";
    img.alt = MAIN_LABELS[mainChoice] || mainChoice;
    mainCard.appendChild(img);

    const text = document.createElement("span");
    text.textContent = MAIN_LABELS[mainChoice] || mainChoice;
    mainCard.appendChild(text);

    mainWrap.appendChild(mainCard);
  } else {
    const empty = document.createElement("div");
    empty.className = "chef-main-empty";
    empty.textContent = "Ana yemek seçilmedi.";
    mainWrap.appendChild(empty);
  }

  row.appendChild(mainWrap);

  const dessertTitle = document.createElement("div");
  dessertTitle.className = "chef-subtitle";
  dessertTitle.textContent = "Tatlı";
  row.appendChild(dessertTitle);

  const dessertPlate = document.createElement("div");
  dessertPlate.className = "chef-plate-visual";

  const dessertImg = document.createElement("img");
  dessertImg.src = "servis.png";
  dessertImg.alt = "Tatlı tabağı";
  dessertPlate.appendChild(dessertImg);

  const dessertChipWrap = document.createElement("div");
  dessertChipWrap.className = "chef-plate-items";

  const dessertSet = new Set();
  dessertItems.forEach((entry) => {
    const chip = document.createElement("div");
    chip.className = "chef-plate-item";

    const text = document.createElement("span");
    const normalizedEntry = normalizeChipEntry(entry, DESSERT_LABELS, "Tatlı");
    const label = normalizedEntry.label;
    if (normalizedEntry.itemId) {
      dessertSet.add(normalizedEntry.itemId);
    }
    if (normalizedEntry.count > 1) {
      text.textContent = label;
      chip.appendChild(text);
      const sup = document.createElement("span");
      sup.className = "chip-sup";
      sup.textContent = `x${normalizedEntry.count}`;
      chip.appendChild(sup);
      dessertChipWrap.appendChild(chip);
    }
  });

  dessertPlate.appendChild(dessertChipWrap);
  row.appendChild(dessertPlate);
  adjustChipScale(dessertChipWrap, dessertItems.length);
  updateChefDessertImage(dessertImg, dessertSet);

  chefList.appendChild(row);
}

function renderChefList() {
  const orders = loadOrders();
  const entries = Object.entries(orders);
  chefList.innerHTML = "";
  chefSeatBar.innerHTML = "";

  if (entries.length === 0) {
    const empty = document.createElement("div");
    empty.className = "chef-item";
    empty.textContent = "Kayıtlı sipariş yok.";
    chefList.appendChild(empty);
    return;
  }

  entries
    .sort(([a], [b]) => a.localeCompare(b, "tr"))
    .forEach(([seat, items], index) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chef-seat-chip";
      chip.textContent = seat.toUpperCase();
      chip.addEventListener("click", () => {
        document.querySelectorAll(".chef-seat-chip").forEach((el) => {
          el.classList.remove("active");
        });
        chip.classList.add("active");
        renderSeatDetail(seat, items);
      });
      chefSeatBar.appendChild(chip);

      if (index === 0) {
        chip.classList.add("active");
        renderSeatDetail(seat, items);
      }
    });
}

function adjustChipScale(container, chipCount) {
  if (!container) return;
  const isChef = container.classList.contains("chef-plate-items");
  let scale = isChef ? 0.9 : 1;
  if (chipCount >= 9) scale = isChef ? 0.55 : 0.6;
  else if (chipCount >= 7) scale = isChef ? 0.65 : 0.7;
  else if (chipCount >= 5) scale = isChef ? 0.75 : 0.8;
  else if (chipCount >= 4) scale = isChef ? 0.82 : 0.9;
  container.style.setProperty("--chip-scale", String(scale));
}

function normalizeChipEntry(entry, labels, prefix) {
  const rawItem = entry?.item ?? "";
  let itemId = String(rawItem).trim();
  let count = Number(entry?.count) || 1;
  const match = itemId.match(/^(\d+)\s*x\s*(\d+)$/i);
  if (match) {
    itemId = match[1];
    count = Number(match[2]) || count;
  }
  const label = labels[itemId] || `${prefix} ${itemId}`.trim();
  return { label, count, itemId };
}

function updateChefPlateImage(imgEl, itemSet) {
  if (!imgEl) return;
  const key = [...itemSet].sort().join(",");
  const match = MEZE_IMAGE_MAP[key];
  if (match) {
    imgEl.src = match.src;
    imgEl.alt = match.alt;
    return;
  }
  imgEl.src = "servis.png";
  imgEl.alt = "Servis tabağı";
}

function updateChefDessertImage(imgEl, itemSet) {
  if (!imgEl) return;
  const key = [...itemSet].sort().join(",");
  const match = DESSERT_IMAGE_MAP[key];
  if (match) {
    imgEl.src = match.src;
    imgEl.alt = match.alt;
    return;
  }
  imgEl.src = "servis.png";
  imgEl.alt = "Tatlı tabağı";
}

renderChefList();
