document.querySelectorAll(".tab-btn").forEach(btn=>{btn.addEventListener("click",()=>{document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active"));document.querySelectorAll(".tab-panel").forEach(p=>p.classList.remove("active"));btn.classList.add("active");document.getElementById(btn.dataset.tab)?.classList.add("active");window.scrollTo({top:0,behavior:"smooth"});});});

/* =========================
   عدّلي هذا الرابط فقط
   بعد نشر Google Apps Script
   ========================= */
const API_URL = "PUT_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";

const GOAL = 200000;
const START_DATE = "2026-08-14";
const TOTAL_DAYS = 12;

const $ = (id) => document.getElementById(id);

const totalCount = $("totalCount");
const progressBar = $("progressBar");
const progressText = $("progressText");
const remaining = $("remaining");
const entriesCount = $("entriesCount");
const dayNumber = $("dayNumber");
const amountInput = $("amount");
const submitBtn = $("submitBtn");
const submitText = $("submitText");
const message = $("message");
const myTotal = $("myTotal");
const refreshBtn = $("refreshBtn");
const installBtn = $("installBtn");
const iosHint = $("iosHint");

const intentionInput = $("intentionInput");
const addIntentionBtn = $("addIntentionBtn");
const intentionMessage = $("intentionMessage");
const intentionsList = $("intentionsList");
const refreshIntentionsBtn = $("refreshIntentionsBtn");

let deferredPrompt = null;

function fmt(n) {
  return Number(n || 0).toLocaleString("en-US");
}

function setMessage(text, type = "") {
  message.textContent = text;
  message.className = `message ${type}`.trim();
}

function getCampaignDay() {
  const start = new Date(`${START_DATE}T00:00:00`);
  const now = new Date();
  const diff = Math.floor((now - start) / 86400000) + 1;
  return Math.min(TOTAL_DAYS, Math.max(1, diff));
}

function renderStats(total = 0, entries = 0) {
  total = Number(total || 0);
  entries = Number(entries || 0);

  totalCount.textContent = fmt(total);
  entriesCount.textContent = fmt(entries);

  const rem = Math.max(0, GOAL - total);
  remaining.textContent = fmt(rem);

  const rawPct = (total / GOAL) * 100;
  const pct = Math.min(100, rawPct);
  progressBar.style.width = `${pct}%`;
  progressText.textContent = total > GOAL ? `${rawPct.toFixed(0)}% — تجاوزنا الهدف 🤍` : `${rawPct.toFixed(rawPct >= 10 ? 0 : 1)}%`;

  dayNumber.textContent = `${getCampaignDay()} / ${TOTAL_DAYS}`;
}

function renderMyTotal() {
  const value = Number(localStorage.getItem("salawat_my_total") || 0);
  myTotal.textContent = fmt(value);
}

function apiReady() {
  return API_URL && !API_URL.includes("PUT_YOUR");
}

async function loadStats() {
  if (!apiReady()) {
    setMessage("لسه لازم نحط رابط Google Apps Script في ملف app.js.", "err");
    return;
  }

  try {
    const res = await fetch(`${API_URL}?action=stats&t=${Date.now()}`, {
      method: "GET",
      cache: "no-store"
    });
    const data = await res.json();

    if (!data.ok) throw new Error(data.error || "تعذر تحميل العداد");
    renderStats(data.total, data.entries);
  } catch (err) {
    setMessage("تعذّر تحديث العداد الآن. جرّبي مرة ثانية.", "err");
    console.error(err);
  }
}

async function addAmount() {
  const amount = Math.floor(Number(amountInput.value));

  if (!Number.isFinite(amount) || amount <= 0) {
    setMessage("اكتبي عدد صحيح أكبر من صفر 🤍", "err");
    amountInput.focus();
    return;
  }

  if (amount > 100000) {
    setMessage("تأكدي من العدد قبل الإضافة.", "err");
    return;
  }

  if (!apiReady()) {
    setMessage("لازم أولًا تحطي رابط Google Apps Script داخل app.js.", "err");
    return;
  }

  submitBtn.disabled = true;
  submitText.textContent = "بنضيف العدد...";

  try {
    const payload = new URLSearchParams();
    payload.set("action", "add");
    payload.set("amount", String(amount));

    const res = await fetch(API_URL, {
      method: "POST",
      body: payload
    });

    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "تعذر الحفظ");

    const currentMine = Number(localStorage.getItem("salawat_my_total") || 0);
    localStorage.setItem("salawat_my_total", String(currentMine + amount));
    renderMyTotal();

    renderStats(data.total, data.entries);
    amountInput.value = "";
    setMessage(`انضاف ${fmt(amount)} للمجموع 🤍 تقبّل الله منكم`, "ok");

    if (navigator.vibrate) navigator.vibrate(40);
  } catch (err) {
    setMessage("صار خطأ بالحفظ. جرّبي مرة ثانية.", "err");
    console.error(err);
  } finally {
    submitBtn.disabled = false;
    submitText.textContent = "أضيفي للمجموع 🤍";
  }
}


function setIntentionMessage(text, type = "") {
  intentionMessage.textContent = text;
  intentionMessage.className = `message ${type}`.trim();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadIntentions() {
  if (!apiReady()) return;

  try {
    const res = await fetch(`${API_URL}?action=intentions&t=${Date.now()}`, {
      method: "GET",
      cache: "no-store"
    });
    const data = await res.json();

    if (!data.ok) throw new Error(data.error || "تعذر تحميل النوايا");

    const items = Array.isArray(data.intentions) ? data.intentions : [];

    if (!items.length) {
      intentionsList.innerHTML = `<div class="empty-intentions">لسه ما انضافت نوايا 🤍</div>`;
      return;
    }

    intentionsList.innerHTML = items.map(item => `
      <article class="intention-item">
        <div class="intention-heart">🤍</div>
        <p>${escapeHtml(item.text || "")}</p>
      </article>
    `).join("");
  } catch (err) {
    console.error(err);
  }
}

async function addIntention() {
  const text = intentionInput.value.trim();

  if (text.length < 2) {
    setIntentionMessage("اكتبي نيتك أول 🤍", "err");
    intentionInput.focus();
    return;
  }

  if (!apiReady()) {
    setIntentionMessage("لازم أولًا نربط الصفحة بـ Google Apps Script.", "err");
    return;
  }

  addIntentionBtn.disabled = true;
  addIntentionBtn.textContent = "بنضيف النية...";

  try {
    const payload = new URLSearchParams();
    payload.set("action", "addIntention");
    payload.set("text", text);

    const res = await fetch(API_URL, {
      method: "POST",
      body: payload
    });

    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "تعذر حفظ النية");

    intentionInput.value = "";
    setIntentionMessage("انضافت نيتك بدون اسم 🤍", "ok");
    await loadIntentions();
  } catch (err) {
    setIntentionMessage("صار خطأ بالحفظ. جرّبي مرة ثانية.", "err");
    console.error(err);
  } finally {
    addIntentionBtn.disabled = false;
    addIntentionBtn.textContent = "أضيفي النية 🤍";
  }
}

document.querySelectorAll("[data-add]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const add = Number(btn.dataset.add || 0);
    const current = Number(amountInput.value || 0);
    amountInput.value = current + add;
    amountInput.focus();
  });
});

submitBtn.addEventListener("click", addAmount);

addIntentionBtn.addEventListener("click", addIntention);
refreshIntentionsBtn.addEventListener("click", loadIntentions);

refreshBtn.addEventListener("click", () => {
  setMessage("");
  loadStats();
});

amountInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addAmount();
});

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.classList.remove("hidden");
});

installBtn.addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.classList.add("hidden");
});

const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
if (isIOS && !isStandalone) {
  iosHint.classList.remove("hidden");
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(console.error);
  });
}

renderStats(0, 0);
renderMyTotal();
loadStats();
loadIntentions();

// تحديث تلقائي كل 20 ثانية حتى يظل العداد قريب من المباشر
setInterval(loadStats, 20000);
setInterval(loadIntentions, 30000);
