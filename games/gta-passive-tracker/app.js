const STORAGE_KEY = "cdawgs-gta-passive-tracker-v1";
const $ = (selector) => document.querySelector(selector);
const data = window.GTA_BUSINESS_DATA;

const defaultState = () => {
  const state = {
    tracking: false,
    lastUpdated: Date.now(),
    saleMode: "far",
    bonuses: {
      carWashCashBonus: false,
      smokeWeedBonus: false
    },
    businesses: {},
    nightclub: {
      owned: false,
      equipment: true,
      floors: 5,
      goods: {}
    }
  };

  data.supplyBusinesses.forEach((business) => {
    state.businesses[business.id] = {
      owned: business.id === "bunker" || business.id === "acid" || business.id === "cocaine",
      upgrade: business.defaultUpgrade,
      supply: business.id === "acid" ? 100 : 0,
      product: 0,
      acidNameBonus: false
    };
  });

  data.nightclubGoods.forEach((good) => {
    state.nightclub.goods[good.id] = {
      active: ["cargo", "sporting", "southAmerican", "pharma", "cashCreation"].includes(good.id),
      crates: 0
    };
  });

  return state;
};

let state = loadState();
let uiTimer = null;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const fresh = defaultState();
    if (!saved) return fresh;

    const merged = {
      ...fresh,
      ...saved,
      bonuses: { ...fresh.bonuses, ...(saved.bonuses || {}) },
      businesses: { ...fresh.businesses, ...(saved.businesses || {}) },
      nightclub: {
        ...fresh.nightclub,
        ...(saved.nightclub || {}),
        goods: { ...fresh.nightclub.goods, ...((saved.nightclub && saved.nightclub.goods) || {}) }
      }
    };

    data.supplyBusinesses.forEach((business) => {
      merged.businesses[business.id] = {
        ...fresh.businesses[business.id],
        ...(saved.businesses ? saved.businesses[business.id] : {})
      };
    });

    data.nightclubGoods.forEach((good) => {
      merged.nightclub.goods[good.id] = {
        ...fresh.nightclub.goods[good.id],
        ...((saved.nightclub && saved.nightclub.goods) ? saved.nightclub.goods[good.id] : {})
      };
    });

    return merged;
  } catch (error) {
    console.warn("Saved data could not be loaded. Starting fresh.", error);
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(Math.round(value || 0));
}

function formatNumber(value, digits = 1) {
  return Number(value || 0).toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: value % 1 && digits > 0 ? 1 : 0
  });
}

function formatDuration(minutes) {
  if (!Number.isFinite(minutes)) return "--";
  if (minutes <= 0) return "now";
  const rounded = Math.ceil(minutes);
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  if (h <= 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function getBusinessState(id) {
  return state.businesses[id];
}

function getUpgrade(business) {
  const bState = getBusinessState(business.id);
  return business.upgrades[bState.upgrade] || business.upgrades[business.defaultUpgrade];
}

function getSupplyPerProduct(upgrade) {
  return 100 / upgrade.productFromFullSupply;
}

function getValueMultiplier(business) {
  let multiplier = 1;
  const bState = getBusinessState(business.id);
  if (business.linkedBonus && state.bonuses[business.linkedBonus.key]) {
    multiplier *= business.linkedBonus.multiplier;
  }
  if (business.valueBonusToggle && bState[business.valueBonusToggle.key]) {
    multiplier *= business.valueBonusToggle.multiplier;
  }
  return multiplier;
}

function getValuePerUnit(business) {
  const upgrade = getUpgrade(business);
  const base = state.saleMode === "far" ? upgrade.valueFar : upgrade.valueClose;
  return base * getValueMultiplier(business);
}

function syncProgress(now = Date.now()) {
  const last = Number(state.lastUpdated || now);
  const elapsedMinutes = Math.max(0, (now - last) / 60000);

  if (!state.tracking || elapsedMinutes <= 0) {
    state.lastUpdated = now;
    saveState();
    return;
  }

  data.supplyBusinesses.forEach((business) => {
    const bState = getBusinessState(business.id);
    if (!bState.owned) return;

    const upgrade = getUpgrade(business);
    const supplyPerProduct = getSupplyPerProduct(upgrade);
    const remainingCapacity = Math.max(0, business.maxProduct - Number(bState.product || 0));

    if (remainingCapacity <= 0 || Number(bState.supply || 0) <= 0) return;

    const maxByTime = elapsedMinutes / upgrade.minutesPerUnit;
    const maxBySupply = Number(bState.supply || 0) / supplyPerProduct;
    const produced = Math.min(maxByTime, maxBySupply, remainingCapacity);

    bState.product = clamp(Number(bState.product || 0) + produced, 0, business.maxProduct);
    bState.supply = clamp(Number(bState.supply || 0) - produced * supplyPerProduct, 0, business.maxSupply);
  });

  if (state.nightclub.owned) {
    data.nightclubGoods.forEach((good) => {
      const gState = state.nightclub.goods[good.id];
      if (!gState.active) return;
      const maxCrates = getNightclubCapacity(good);
      const minutesPerCrate = getNightclubMinutesPerCrate(good);
      const remainingCapacity = Math.max(0, maxCrates - Number(gState.crates || 0));
      if (remainingCapacity <= 0) return;
      const produced = Math.min(elapsedMinutes / minutesPerCrate, remainingCapacity);
      gState.crates = clamp(Number(gState.crates || 0) + produced, 0, maxCrates);
    });
  }

  state.lastUpdated = now;
  saveState();
}

function getNightclubCapacity(good) {
  return good.minStorage * clamp(state.nightclub.floors, 1, 5);
}

function getNightclubMinutesPerCrate(good) {
  return state.nightclub.equipment ? good.baseMinutesPerCrate / 2 : good.baseMinutesPerCrate;
}

function getNightclubGrossValue() {
  return data.nightclubGoods.reduce((sum, good) => {
    const gState = state.nightclub.goods[good.id];
    return sum + Number(gState.crates || 0) * good.valuePerCrate;
  }, 0);
}

function getTonyCut(gross) {
  return Math.min(gross * 0.1, 100000);
}

function getSupplyBusinessValue() {
  return data.supplyBusinesses.reduce((sum, business) => {
    const bState = getBusinessState(business.id);
    if (!bState.owned) return sum;
    return sum + Number(bState.product || 0) * getValuePerUnit(business);
  }, 0);
}

function getTotalValue() {
  const nightclubGross = state.nightclub.owned ? getNightclubGrossValue() : 0;
  return getSupplyBusinessValue() + nightclubGross;
}

function getAlerts() {
  const alerts = [];
  data.supplyBusinesses.forEach((business) => {
    const bState = getBusinessState(business.id);
    if (!bState.owned) return;
    const supplyPct = Number(bState.supply || 0);
    const productPct = (Number(bState.product || 0) / business.maxProduct) * 100;
    if (supplyPct <= 0 && productPct < 100) alerts.push(`${business.name} needs supplies`);
    if (productPct >= 95) alerts.push(`${business.name} is almost full`);
  });

  if (state.nightclub.owned) {
    const totals = getNightclubTotals();
    if (totals.percent >= 95) alerts.push("Nightclub warehouse is almost full");
  }

  return alerts.slice(0, 5);
}

function getTimeUntilSupplyEmpty(business) {
  const bState = getBusinessState(business.id);
  const upgrade = getUpgrade(business);
  const supplyPerProduct = getSupplyPerProduct(upgrade);
  const remainingCapacity = Math.max(0, business.maxProduct - Number(bState.product || 0));
  if (Number(bState.supply || 0) <= 0) return 0;
  if (remainingCapacity <= 0) return Infinity;
  const producibleBySupply = Number(bState.supply || 0) / supplyPerProduct;
  return Math.min(producibleBySupply, remainingCapacity) * upgrade.minutesPerUnit;
}

function getTimeUntilProductFull(business) {
  const bState = getBusinessState(business.id);
  const upgrade = getUpgrade(business);
  const supplyPerProduct = getSupplyPerProduct(upgrade);
  const remainingCapacity = Math.max(0, business.maxProduct - Number(bState.product || 0));
  if (remainingCapacity <= 0) return 0;
  if (Number(bState.supply || 0) <= 0) return Infinity;
  const producibleBySupply = Number(bState.supply || 0) / supplyPerProduct;
  if (producibleBySupply < remainingCapacity) return Infinity;
  return remainingCapacity * upgrade.minutesPerUnit;
}

function getNightclubTotals() {
  let crates = 0;
  let capacity = 0;
  data.nightclubGoods.forEach((good) => {
    const gState = state.nightclub.goods[good.id];
    crates += Number(gState.crates || 0);
    capacity += getNightclubCapacity(good);
  });
  return {
    crates,
    capacity,
    percent: capacity ? (crates / capacity) * 100 : 0
  };
}

function render() {
  syncProgress();
  renderTopBar();
  renderBusinessCards();
  renderNightclub();
  renderSourcesPanel();
  bindStaticControls();
}

function renderTopBar() {
  const alerts = getAlerts();
  const totalValue = getTotalValue();
  const activeOwned = data.supplyBusinesses.filter((business) => getBusinessState(business.id).owned).length + (state.nightclub.owned ? 1 : 0);

  $("#statusPill").textContent = state.tracking ? "Tracking in game time" : "Paused";
  $("#statusPill").className = `status-pill ${state.tracking ? "active" : ""}`;
  $("#trackingButton").textContent = state.tracking ? "I am out of game" : "I am in game";
  $("#trackingButton").className = `primary-toggle ${state.tracking ? "on" : ""}`;
  $("#totalValue").textContent = formatMoney(totalValue);
  $("#activeCount").textContent = activeOwned;
  $("#saleMode").value = state.saleMode;
  $("#carWashCashBonus").checked = state.bonuses.carWashCashBonus;
  $("#smokeWeedBonus").checked = state.bonuses.smokeWeedBonus;
  $("#lastUpdated").textContent = new Date(state.lastUpdated).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });

  const alertsBox = $("#alerts");
  alertsBox.innerHTML = alerts.length
    ? alerts.map((alert) => `<span>${alert}</span>`).join("")
    : "<span>All tracked businesses look okay.</span>";
}

function renderBusinessCards() {
  const container = $("#businessCards");
  container.innerHTML = data.supplyBusinesses.map(renderBusinessCard).join("");
  bindBusinessControls();
}

function renderBusinessCard(business) {
  const bState = getBusinessState(business.id);
  const upgrade = getUpgrade(business);
  const productPct = (Number(bState.product || 0) / business.maxProduct) * 100;
  const supplyPct = Number(bState.supply || 0);
  const value = Number(bState.product || 0) * getValuePerUnit(business);
  const untilEmpty = getTimeUntilSupplyEmpty(business);
  const untilFull = getTimeUntilProductFull(business);
  const supplyPerProduct = getSupplyPerProduct(upgrade);
  const statusClass = !bState.owned ? "muted" : supplyPct <= 0 ? "danger" : productPct >= 95 ? "warn" : "good";
  const statusText = !bState.owned ? "Not tracked" : supplyPct <= 0 && productPct < 100 ? "Needs supplies" : productPct >= 100 ? "Full" : productPct >= 95 ? "Sell soon" : "Producing";

  const upgradeOptions = Object.entries(business.upgrades).map(([key, item]) => {
    return `<option value="${key}" ${bState.upgrade === key ? "selected" : ""}>${item.label}</option>`;
  }).join("");

  const estimatedNote = upgrade.estimatedSupply ? `<p class="mini-warning">Supply conversion is estimated for this upgrade level. Fully upgraded rates are strongest.</p>` : "";
  const valueBonusControl = business.valueBonusToggle ? `
    <label class="check-row slim">
      <input type="checkbox" data-action="toggle-business-bonus" data-id="${business.id}" data-bonus="${business.valueBonusToggle.key}" ${bState[business.valueBonusToggle.key] ? "checked" : ""}>
      <span>${business.valueBonusToggle.label}</span>
    </label>` : "";

  return `
    <article class="business-card ${bState.owned ? "" : "disabled-card"}" data-id="${business.id}">
      <div class="card-head">
        <div>
          <p class="eyebrow">${business.group}</p>
          <h3>${business.name}</h3>
        </div>
        <label class="switch-label">
          <input type="checkbox" data-action="toggle-owned" data-id="${business.id}" ${bState.owned ? "checked" : ""}>
          <span>Owned</span>
        </label>
      </div>

      <div class="card-status">
        <span class="badge ${statusClass}">${statusText}</span>
        <strong>${formatMoney(value)}</strong>
      </div>

      <label class="field-label" for="upgrade-${business.id}">Upgrade setup</label>
      <select id="upgrade-${business.id}" data-action="upgrade" data-id="${business.id}">
        ${upgradeOptions}
      </select>
      ${valueBonusControl}

      <div class="bar-row">
        <div class="bar-label"><span>Supplies</span><strong>${formatNumber(supplyPct, 1)} / 100</strong></div>
        <div class="progress"><i style="width:${clamp(supplyPct, 0, 100)}%"></i></div>
        <input type="range" min="0" max="100" step="1" value="${Math.round(supplyPct)}" data-action="supply" data-id="${business.id}">
      </div>

      <div class="bar-row">
        <div class="bar-label"><span>${business.productLabel}</span><strong>${formatNumber(bState.product, 1)} / ${business.maxProduct}</strong></div>
        <div class="progress product"><i style="width:${clamp(productPct, 0, 100)}%"></i></div>
        <input type="range" min="0" max="${business.maxProduct}" step="0.1" value="${Number(bState.product || 0)}" data-action="product" data-id="${business.id}">
      </div>

      <div class="metric-grid">
        <div><span>Product</span><strong>${formatNumber(productPct, 1)}%</strong></div>
        <div><span>Unit value</span><strong>${formatMoney(getValuePerUnit(business))}</strong></div>
        <div><span>Supplies empty</span><strong>${untilEmpty === Infinity ? "paused/full" : formatDuration(untilEmpty)}</strong></div>
        <div><span>Product full</span><strong>${untilFull === Infinity ? "needs supplies" : formatDuration(untilFull)}</strong></div>
      </div>

      <div class="quick-buttons">
        <button data-action="full-supply" data-id="${business.id}">Full supplies</button>
        <button data-action="empty-supply" data-id="${business.id}">Empty supplies</button>
        <button data-action="full-product" data-id="${business.id}">Full product</button>
        <button data-action="sell-product" data-id="${business.id}">Sold product</button>
      </div>

      <p class="source-note">${business.sourceNote} This setup produces about ${formatNumber(upgrade.productFromFullSupply, 1)} product units from a full supply bar, using ${formatNumber(supplyPerProduct, 2)} supplies per product unit.</p>
      ${estimatedNote}
    </article>
  `;
}

function renderNightclub() {
  const gross = getNightclubGrossValue();
  const cut = getTonyCut(gross);
  const net = Math.max(0, gross - cut);
  const totals = getNightclubTotals();

  $("#nightclubOwned").checked = state.nightclub.owned;
  $("#nightclubEquipment").checked = state.nightclub.equipment;
  $("#nightclubFloors").value = state.nightclub.floors;
  $("#nightclubValue").textContent = formatMoney(gross);
  $("#nightclubNet").textContent = formatMoney(net);
  $("#nightclubCrates").textContent = `${formatNumber(totals.crates, 1)} / ${totals.capacity}`;
  $("#nightclubPercent").textContent = `${formatNumber(totals.percent, 1)}%`;
  $("#nightclubProgress").style.width = `${clamp(totals.percent, 0, 100)}%`;

  const container = $("#nightclubGoods");
  container.innerHTML = data.nightclubGoods.map((good) => {
    const gState = state.nightclub.goods[good.id];
    const maxCrates = getNightclubCapacity(good);
    const percent = maxCrates ? (Number(gState.crates || 0) / maxCrates) * 100 : 0;
    const minutesPerCrate = getNightclubMinutesPerCrate(good);
    const value = Number(gState.crates || 0) * good.valuePerCrate;
    const fullIn = gState.active && Number(gState.crates || 0) < maxCrates ? (maxCrates - Number(gState.crates || 0)) * minutesPerCrate : 0;

    return `
      <div class="nc-good ${gState.active ? "" : "disabled-card"}">
        <div class="nc-top">
          <label class="check-row">
            <input type="checkbox" data-action="nc-active" data-id="${good.id}" ${gState.active ? "checked" : ""}>
            <span>${good.name}</span>
          </label>
          <strong>${formatMoney(value)}</strong>
        </div>
        <p>${good.source}</p>
        <div class="bar-label"><span>Crates</span><strong>${formatNumber(gState.crates, 1)} / ${maxCrates}</strong></div>
        <div class="progress product"><i style="width:${clamp(percent, 0, 100)}%"></i></div>
        <input type="range" min="0" max="${maxCrates}" step="0.1" value="${Number(gState.crates || 0)}" data-action="nc-crates" data-id="${good.id}">
        <div class="nc-meta">
          <span>${formatDuration(minutesPerCrate)} per crate</span>
          <span>${gState.active ? `Full in ${formatDuration(fullIn)}` : "Technician off"}</span>
        </div>
      </div>
    `;
  }).join("");

  bindNightclubControls();
}

function renderSourcesPanel() {
  $("#rateSummary").innerHTML = `
    <p><strong>Rate set:</strong> Bunker, MC businesses, Acid Lab, and Nightclub warehouse are built into <code>business-data.js</code>. You can change any value there later without changing the app logic.</p>
    <p><strong>Important:</strong> Special event weeks can temporarily multiply GTA$ values or production speed. This tracker is set up for normal baseline production, with optional Money Fronts boosts for Cash and Weed.</p>
  `;
}

function bindStaticControls() {
  $("#trackingButton").onclick = () => {
    syncProgress();
    state.tracking = !state.tracking;
    state.lastUpdated = Date.now();
    saveState();
    render();
  };

  $("#saleMode").onchange = (event) => {
    syncProgress();
    state.saleMode = event.target.value;
    saveState();
    render();
  };

  $("#carWashCashBonus").onchange = (event) => {
    syncProgress();
    state.bonuses.carWashCashBonus = event.target.checked;
    saveState();
    render();
  };

  $("#smokeWeedBonus").onchange = (event) => {
    syncProgress();
    state.bonuses.smokeWeedBonus = event.target.checked;
    saveState();
    render();
  };

  $("#resetAll").onclick = () => {
    const okay = confirm("Reset all saved tracker data on this browser?");
    if (!okay) return;
    state = defaultState();
    saveState();
    render();
  };

  $("#exportData").onclick = () => {
    syncProgress();
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "gta-business-tracker-backup.json";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  $("#importInput").onchange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
        state = loadState();
        render();
      } catch (error) {
        alert("That file could not be imported. Make sure it is a tracker backup JSON file.");
      }
    };
    reader.readAsText(file);
  };
}

function bindBusinessControls() {
  document.querySelectorAll("#businessCards [data-action]").forEach((control) => {
    control.oninput = handleBusinessAction;
    control.onchange = handleBusinessAction;
    if (control.tagName === "BUTTON") control.onclick = handleBusinessAction;
  });
}

function handleBusinessAction(event) {
  const target = event.currentTarget;
  const action = target.dataset.action;
  const id = target.dataset.id;
  const business = data.supplyBusinesses.find((item) => item.id === id);
  if (!business) return;

  syncProgress();
  const bState = getBusinessState(id);

  if (action === "toggle-owned") bState.owned = target.checked;
  if (action === "upgrade") bState.upgrade = target.value;
  if (action === "supply") bState.supply = clamp(target.value, 0, business.maxSupply);
  if (action === "product") bState.product = clamp(target.value, 0, business.maxProduct);
  if (action === "toggle-business-bonus") bState[target.dataset.bonus] = target.checked;
  if (action === "full-supply") bState.supply = business.maxSupply;
  if (action === "empty-supply") bState.supply = 0;
  if (action === "full-product") bState.product = business.maxProduct;
  if (action === "sell-product") bState.product = 0;

  saveState();
  render();
}

function bindNightclubControls() {
  $("#nightclubOwned").onchange = (event) => {
    syncProgress();
    state.nightclub.owned = event.target.checked;
    saveState();
    render();
  };

  $("#nightclubEquipment").onchange = (event) => {
    syncProgress();
    state.nightclub.equipment = event.target.checked;
    saveState();
    render();
  };

  $("#nightclubFloors").onchange = (event) => {
    syncProgress();
    state.nightclub.floors = clamp(event.target.value, 1, 5);
    data.nightclubGoods.forEach((good) => {
      const gState = state.nightclub.goods[good.id];
      gState.crates = clamp(gState.crates, 0, getNightclubCapacity(good));
    });
    saveState();
    render();
  };

  $("#nightclubReset").onclick = () => {
    syncProgress();
    data.nightclubGoods.forEach((good) => {
      state.nightclub.goods[good.id].crates = 0;
    });
    saveState();
    render();
  };

  document.querySelectorAll("#nightclubGoods [data-action]").forEach((control) => {
    control.oninput = handleNightclubAction;
    control.onchange = handleNightclubAction;
  });
}

function handleNightclubAction(event) {
  const target = event.currentTarget;
  const action = target.dataset.action;
  const id = target.dataset.id;
  const good = data.nightclubGoods.find((item) => item.id === id);
  if (!good) return;
  syncProgress();
  const gState = state.nightclub.goods[id];
  if (action === "nc-active") gState.active = target.checked;
  if (action === "nc-crates") gState.crates = clamp(target.value, 0, getNightclubCapacity(good));
  saveState();
  render();
}

function startClock() {
  if (uiTimer) clearInterval(uiTimer);
  uiTimer = setInterval(() => {
    syncProgress();
    renderTopBar();
    renderBusinessCards();
    renderNightclub();
  }, 15000);
}

document.addEventListener("DOMContentLoaded", () => {
  render();
  startClock();
});
