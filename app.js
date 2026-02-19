const seatInput = document.getElementById("seatInput");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");
const toastOk = document.getElementById("toastOk");
const toastChef = document.getElementById("toastChef");
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
const infoModal = document.getElementById("infoModal");
const infoTitle = document.getElementById("infoTitle");
const infoBody = document.getElementById("infoBody");
const infoAllergen = document.getElementById("infoAllergen");
const infoButtons = [...document.querySelectorAll(".info-button")];
const cardImages = [...document.querySelectorAll(".card img")];

const counts = new Map();
const dessertCounts = new Map();
const STORAGE_KEY = "kaserol_orders";
let toastOnClose = null;
const MEZE_LABELS = {
  "1": "Sushi",
  "2": "Shrimp",
  "3": "Pizza",
};

const INFO_CONTENT = {
  sushi: {
    title: "Sushi",
    body:
      "Taptaze somon, kremamsı avokado ve özenle sarılmış pirinçle hazırlanan bu sushi tabağı; hafif ama karakterli bir lezzet arayanlar için birebir. Dengeli aroması ve şık sunumuyla hem göze hem damağa hitap eder. Minimal ama iddialı.",
    allergen:
      "Alerjen Bilgisi: Balık, susam, soya ürünü içerir. Eser miktarda gluten içerebilir.",
  },
  shrimp: {
    title: "Shrimp",
    body:
      "Altın renginde çıtır kaplaması ve içindeki sulu, lezzetli karidesle tam bir \"ilk ısırıkta aşk\" tabağı. Dışı kıtır, içi yumuşacık dokusuyla sıcak servis edildiğinde masanın favorisi olmaya aday. Paylaşmak zor... ama denemek serbest.",
    allergen:
      "Alerjen Bilgisi: Kabuklu deniz ürünü, gluten, yumurta içerir. Eser miktarda süt ürünü içerebilir.",
  },
  pizza: {
    title: "Pizza",
    body:
      "Uzatmalı eriyen peyniri, hafif baharatlı sosu ve klasik lezzetiyle vazgeçilmez bir favori. İster hızlı bir kaçamak ister keyifli bir atıştırmalık… Bu dilimler her ortamın yıldızı.",
    allergen:
      "Alerjen Bilgisi: Gluten, süt ürünü içerir. Eser miktarda soya ve yumurta içerebilir.",
  },
  mantarmakarna: {
    title: "Mantarlı Makarna",
    body:
      "Tereyağında sote mantarların derin aroması, ipeksi bir sosla buluşuyor. Al dente makarna dokusu ve dengeli baharatıyla hem doyurucu hem zarif bir tabak. Sıcacık, güven veren bir klasik.",
    allergen:
      "Alerjen Bilgisi: Gluten, süt ürünü içerir. Eser miktarda yumurta ve soya içerebilir.",
  },
  kuzuincik: {
    title: "Kuzu İncik",
    body:
      "Uzun sürede ağır ateşte pişen kuzu incik, kemikten ayrılan yumuşak dokusuyla gerçek bir şölen. Yoğun sosu ve tok aromasıyla özel anların yıldızı; güçlü, unutulmaz bir lezzet.",
    allergen:
      "Alerjen Bilgisi: Süt ürünü içerir. Eser miktarda gluten ve soya içerebilir.",
  },
  kilicbaligi: {
    title: "Kılıç Balığı",
    body:
      "Izgara dokusuyla etli, tok bir balık deneyimi. Limon dokunuşu ve hafif baharatlarla öne çıkan kılıç balığı; ferah, dengeli ve rafine bir tabak.",
    allergen:
      "Alerjen Bilgisi: Balık içerir. Eser miktarda gluten ve soya içerebilir.",
  },
  baklava: {
    title: "Baklava",
    body:
      "Kat kat çıtır yufka, bol fıstık ve dengeli şerbet... Her lokmada geleneksel bir şıklık. Yoğun ama yormayan, klasik tatlıların tartışmasız yıldızı.",
    allergen:
      "Alerjen Bilgisi: Gluten, kuruyemiş, süt ürünü içerir. Eser miktarda yumurta içerebilir.",
  },
  browni: {
    title: "Browni",
    body:
      "Yoğun kakao aroması ve nemli dokusuyla tam kıvamında bir browni. Bitter çikolatanın zenginliği, yumuşacık iç yapıyla birleşir; sade ama çok etkileyici.",
    allergen:
      "Alerjen Bilgisi: Gluten, yumurta, süt ürünü içerir. Eser miktarda kuruyemiş ve soya içerebilir.",
  },
  cheesecake: {
    title: "Cheesecake",
    body:
      "Kremamsı peynir dolgusu ve hafif, çıtır tabanı ile dengeli bir tatlı. Ne çok ağır ne çok hafif; her lokmada zarif bir ferahlık.",
    allergen:
      "Alerjen Bilgisi: Gluten, süt ürünü, yumurta içerir. Eser miktarda soya içerebilir.",
  },
};

function showToast(message, onClose, action) {
  if (!toast) return;
  if (message && toastMessage) toastMessage.textContent = message;
  toastOnClose = typeof onClose === "function" ? onClose : null;
  if (toastChef) {
    if (action && action.href) {
      toastChef.textContent = action.label || "Şef Ekranı";
      toastChef.href = action.href;
      toastChef.hidden = false;
      toastChef.style.display = "";
      toastChef.setAttribute("aria-hidden", "false");
    } else {
      toastChef.hidden = true;
      toastChef.style.display = "none";
      toastChef.setAttribute("aria-hidden", "true");
    }
  }
  toast.hidden = false;
}

function showInfoModal(infoKey) {
  if (!infoModal) return;
  const payload = INFO_CONTENT[infoKey];
  if (!payload) return;
  if (infoTitle) infoTitle.textContent = payload.title;
  if (infoBody) infoBody.textContent = payload.body;
  if (infoAllergen) infoAllergen.textContent = payload.allergen;
  infoModal.hidden = false;
}

function hideInfoModal() {
  if (!infoModal) return;
  infoModal.hidden = true;
}

function validateSeatValue(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return { ok: false, message: "Lütfen önce koltuk numaranızı giriniz." };
  }

  const match = trimmed.match(/^(\d{1,2})\s*([a-zA-Z])$/);
  if (!match) {
    return { ok: false, message: "Uçağımızda böyle bir koltuk bulunmamaktadır." };
  }

  const number = Number.parseInt(match[1], 10);
  if (Number.isNaN(number) || number < 1 || number > 55) {
    return { ok: false, message: "Uçağımızda böyle bir koltuk bulunmamaktadır." };
  }

  const letter = match[2].toLowerCase();
  const allowed = new Set(["a", "b", "c", "d", "e", "f", "g", "h", "j", "k"]);
  if (!allowed.has(letter)) {
    return { ok: false, message: "Uçağımızda böyle bir koltuk bulunmamaktadır." };
  }

  return { ok: true };
}

function getNormalizedSeat(value) {
  const match = value.trim().match(/^(\d{1,2})\s*([a-zA-Z])$/);
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
  if (toastChef) {
    toastChef.hidden = true;
    toastChef.style.display = "none";
    toastChef.setAttribute("aria-hidden", "true");
  }
});

if (toast) {
  toast.addEventListener("click", (event) => {
    if (event.target === toast || event.target === toastOk || event.target === toastChef) {
      toast.hidden = true;
      if (toastOnClose) {
        const cb = toastOnClose;
        toastOnClose = null;
        cb();
      }
    }
  });
}

if (infoModal) {
  infoModal.addEventListener("click", (event) => {
    if (event.target === infoModal) {
      hideInfoModal();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !infoModal.hidden) {
      hideInfoModal();
    }
  });
}

infoButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    showInfoModal(button.dataset.info);
  });
  button.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });
});

cardImages.forEach((img) => {
  img.setAttribute("draggable", "false");
  img.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });
});

submitOrder.addEventListener("click", () => {
  const validation = validateSeatValue(seatInput.value);
  if (!validation.ok) {
    showToast(validation.message);
    return;
  }
  if (counts.size === 0) {
    showToast("Tabağınız boş. Lütfen seçim yapınız.");
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
    "Meze tercihleriniz şefimize iletilmiştir. Lütfen ana yemek seçimine ilerleyiniz.",
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
    showToast("Lütfen bir ana yemek seçiniz.");
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
  showToast(
    "Ana yemek tercihiniz kaydedilmiştir. Lütfen tatlı seçimine devam ediniz.",
    focusDessertCourse
  );
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
    showToast("Tatlı tabağınız boş. Lütfen seçim yapınız.");
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
  showToast(
    "Tüm siparişleriniz alınmıştır. Siparişlerin şef ekranında nasıl görüneceğini görmek isterseniz tıklayınız.",
    null,
    { label: "Şef Ekranı", href: "chef.html" }
  );
  clearDessert();
});

renderPlate();
renderDessert();

if (resetDessert) {
  resetDessert.addEventListener("click", () => {
    clearDessert();
  });
}
