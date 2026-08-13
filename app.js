document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".tab-btn")
      .forEach((b) => b.classList.remove("active"));

    document
      .querySelectorAll(".tab-panel")
      .forEach((p) => p.classList.remove("active"));

    btn.classList.add("active");

    const panel = document.getElementById(btn.dataset.tab);

    if (panel) {
      panel.classList.add("active");
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
});


/* =========================
   Google Apps Script
   ========================= */

const API_URL =
  "https://script.google.com/macros/s/AKfycby55e_04YmYG241oyYhQ4c9XfJCMYeVVT7nUW7U6wQ8GgrLAqJPVqmzXp3HX5AVB-GZ/exec";


/* =========================
   إعدادات الحملة
   ========================= */

const GOAL = 200000;

const START_DATE = "2026-08-14";

const TOTAL_DAYS = 12;


/* =========================
   العناصر
   ========================= */

const $ = (id) => document.getElementById(id);


const totalCount = $("totalCount");

const progressBar = $("progressBar");

const progressText = $("progressText");

const remaining = $("remaining");

const dayNumber = $("dayNumber");


const amountInput = $("amount");

const submitBtn = $("submitBtn");

const submitText = $("submitText");

const message = $("message");


const myTotal = $("myTotal");

const refreshBtn = $("refreshBtn");


const intentionInput = $("intentionInput");

const addIntentionBtn = $("addIntentionBtn");

const intentionMessage = $("intentionMessage");

const intentionsList = $("intentionsList");

const refreshIntentionsBtn = $("refreshIntentionsBtn");


/* =========================
   تنسيق الأرقام
   ========================= */

function fmt(number) {
  return Number(number || 0).toLocaleString("en-US");
}


/* تحويل الأرقام العربية والفارسية إلى إنجليزية

   ١٢٣٤ → 1234
   ۱۲۳۴ → 1234
*/

function normalizeDigits(value) {
  return String(value)
    .replace(/[٠-٩]/g, (digit) =>
      "٠١٢٣٤٥٦٧٨٩".indexOf(digit)
    )
    .replace(/[۰-۹]/g, (digit) =>
      "۰۱۲۳۴۵۶۷۸۹".indexOf(digit)
    )
    .replace(/,/g, "")
    .replace(/،/g, "")
    .trim();
}


/* =========================
   الرسائل
   ========================= */

function setMessage(text, type = "") {
  message.textContent = text;

  message.className =
    `message ${type}`.trim();
}


function setIntentionMessage(
  text,
  type = ""
) {
  intentionMessage.textContent = text;

  intentionMessage.className =
    `message ${type}`.trim();
}


/* =========================
   اليوم الحالي
   ========================= */

function getCampaignDay() {
  const start =
    new Date(`${START_DATE}T00:00:00`);

  const now =
    new Date();


  const difference =
    Math.floor(
      (now - start) / 86400000
    ) + 1;


  return Math.min(
    TOTAL_DAYS,
    Math.max(1, difference)
  );
}


/* =========================
   عرض العداد
   ========================= */

function renderStats(total = 0) {
  total =
    Number(total || 0);


  totalCount.textContent =
    fmt(total);


  /* المتبقي */

  const remainingAmount =
    Math.max(
      0,
      GOAL - total
    );


  remaining.textContent =
    fmt(remainingAmount);


  /* النسبة */

  const rawPercent =
    (total / GOAL) * 100;


  /* الشريط يتوقف عند 100%
     لكن الرقم نفسه يستمر فوق 200 ألف
  */

  const barPercent =
    Math.min(
      100,
      rawPercent
    );


  progressBar.style.width =
    `${barPercent}%`;


  /* لو تجاوزنا الهدف */

  if (total > GOAL) {
    progressText.textContent =
      `${rawPercent.toFixed(0)}% — تجاوزنا الهدف 🤍`;
  }

  else {
    progressText.textContent =
      `${rawPercent.toFixed(
        rawPercent >= 10 ? 0 : 1
      )}%`;
  }


  /* رقم اليوم */

  dayNumber.textContent =
    `${getCampaignDay()} / ${TOTAL_DAYS}`;
}


/* =========================
   مجموع هذه البنت على جهازها
   ========================= */

function renderMyTotal() {
  const value =
    Number(
      localStorage.getItem(
        "salawat_my_total"
      ) || 0
    );


  myTotal.textContent =
    fmt(value);
}


/* =========================
   التأكد من وجود الرابط
   ========================= */

function apiReady() {
  return (
    API_URL &&
    !API_URL.includes("PUT_YOUR")
  );
}


/* =========================
   تحميل العداد
   ========================= */

async function loadStats() {
  if (!apiReady()) {
    return;
  }


  try {
    const response =
      await fetch(
        `${API_URL}?action=stats&t=${Date.now()}`,
        {
          method: "GET",
          cache: "no-store"
        }
      );


    const data =
      await response.json();


    if (!data.ok) {
      throw new Error(
        data.error ||
        "تعذر تحميل العداد"
      );
    }


    renderStats(
      data.total
    );
  }

  catch (error) {
    setMessage(
      "تعذّر تحديث العداد الآن. جرّبي مرة ثانية.",
      "err"
    );


    console.error(error);
  }
}


/* =========================
   إضافة عدد جديد
   ========================= */

async function addAmount() {

  /* نحول أي أرقام عربية أولاً */

  const normalizedValue =
    normalizeDigits(
      amountInput.value
    );


  const amount =
    Number(
      normalizedValue
    );


  /* لازم يكون رقم صحيح وأكبر من صفر */

  if (
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !Number.isInteger(amount)
  ) {
    setMessage(
      "اكتبي عدد صحيح أكبر من صفر 🤍",
      "err"
    );


    amountInput.focus();

    return;
  }


  /* حماية من رقم ضخم يُكتب بالغلط
     هذا لا علاقة له بهدف 200 ألف.
     يمكن للمجموع الكلي تجاوز 200 ألف عادي.
  */

  if (amount > 100000) {
    setMessage(
      "تأكدي من العدد قبل الإضافة.",
      "err"
    );

    return;
  }


  if (!apiReady()) {
    return;
  }


  submitBtn.disabled =
    true;


  submitText.textContent =
    "بنضيف العدد...";


  try {
    const payload =
      new URLSearchParams();


    payload.set(
      "action",
      "add"
    );


    payload.set(
      "amount",
      String(amount)
    );


    const response =
      await fetch(
        API_URL,
        {
          method: "POST",
          body: payload
        }
      );


    const data =
      await response.json();


    if (!data.ok) {
      throw new Error(
        data.error ||
        "تعذر الحفظ"
      );
    }


    /* مجموع البنت على جهازها */

    const currentPersonalTotal =
      Number(
        localStorage.getItem(
          "salawat_my_total"
        ) || 0
      );


    const newPersonalTotal =
      currentPersonalTotal +
      amount;


    localStorage.setItem(
      "salawat_my_total",
      String(
        newPersonalTotal
      )
    );


    renderMyTotal();


    /* تحديث المجموع الجماعي */

    renderStats(
      data.total
    );


    /* تفريغ الخانة */

    amountInput.value =
      "";


    setMessage(
      `انضاف ${fmt(amount)} للمجموع 🤍`,
      "ok"
    );


    /* اهتزاز خفيف على الأجهزة الداعمة */

    if (navigator.vibrate) {
      navigator.vibrate(40);
    }
  }

  catch (error) {
    setMessage(
      "صار خطأ بالحفظ. جرّبي مرة ثانية.",
      "err"
    );


    console.error(error);
  }

  finally {
    submitBtn.disabled =
      false;


    submitText.textContent =
      "أضيفي للمجموع 🤍";
  }
}


/* =========================
   حماية نص النوايا
   ========================= */

function escapeHtml(value) {
  return String(value)

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );
}


/* =========================
   تحميل النوايا
   ========================= */

async function loadIntentions() {
  if (!apiReady()) {
    return;
  }


  try {
    const response =
      await fetch(
        `${API_URL}?action=intentions&t=${Date.now()}`,
        {
          method: "GET",
          cache: "no-store"
        }
      );


    const data =
      await response.json();


    if (!data.ok) {
      throw new Error(
        data.error ||
        "تعذر تحميل النوايا"
      );
    }


    const items =
      Array.isArray(
        data.intentions
      )
        ? data.intentions
        : [];


    /* إذا ما في نوايا
       ما نظهر أي جملة
    */

    if (!items.length) {
      intentionsList.innerHTML =
        "";

      return;
    }


    intentionsList.innerHTML =
      items
        .map(
          (item) => `
            <article class="intention-item">

              <div class="intention-heart">
                🤍
              </div>

              <p>
                ${escapeHtml(
                  item.text || ""
                )}
              </p>

            </article>
          `
        )
        .join("");
  }

  catch (error) {
    console.error(error);
  }
}


/* =========================
   إضافة نية
   ========================= */

async function addIntention() {

  const text =
    intentionInput.value.trim();


  if (text.length < 2) {
    setIntentionMessage(
      "اكتبي نيتك أول 🤍",
      "err"
    );


    intentionInput.focus();

    return;
  }


  if (!apiReady()) {
    return;
  }


  addIntentionBtn.disabled =
    true;


  addIntentionBtn.textContent =
    "بنضيف النية...";


  try {
    const payload =
      new URLSearchParams();


    payload.set(
      "action",
      "addIntention"
    );


    payload.set(
      "text",
      text
    );


    const response =
      await fetch(
        API_URL,
        {
          method: "POST",
          body: payload
        }
      );


    const data =
      await response.json();


    if (!data.ok) {
      throw new Error(
        data.error ||
        "تعذر حفظ النية"
      );
    }


    intentionInput.value =
      "";


    setIntentionMessage(
      "انضافت نيتك 🤍",
      "ok"
    );


    await loadIntentions();
  }

  catch (error) {
    setIntentionMessage(
      "صار خطأ بالحفظ. جرّبي مرة ثانية.",
      "err"
    );


    console.error(error);
  }

  finally {
    addIntentionBtn.disabled =
      false;


    addIntentionBtn.textContent =
      "أضيفي النية 🤍";
  }
}


/* =========================
   أزرار +100 / +500 / +1000
   ========================= */

document
  .querySelectorAll("[data-add]")
  .forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          const add =
            Number(
              button.dataset.add ||
              0
            );


          const current =
            Number(
              normalizeDigits(
                amountInput.value
              )
            ) || 0;


          amountInput.value =
            current + add;


          amountInput.focus();
        }
      );

    }
  );


/* =========================
   زر إضافة العدد
   ========================= */

submitBtn.addEventListener(
  "click",
  addAmount
);


/* =========================
   زر إضافة النية
   ========================= */

addIntentionBtn.addEventListener(
  "click",
  addIntention
);


/* =========================
   تحديث النوايا
   ========================= */

refreshIntentionsBtn.addEventListener(
  "click",
  loadIntentions
);


/* =========================
   تحديث العداد
   ========================= */

refreshBtn.addEventListener(
  "click",
  () => {

    setMessage("");

    loadStats();
  }
);


/* =========================
   Enter يضيف العدد
   ========================= */

amountInput.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key === "Enter"
    ) {
      addAmount();
    }
  }
);


/* =========================
   Service Worker
   ========================= */

if (
  "serviceWorker" in navigator
) {
  window.addEventListener(
    "load",
    () => {

      navigator
        .serviceWorker
        .register(
          "./service-worker.js"
        )

        .catch(
          console.error
        );
    }
  );
}


/* =========================
   أول تحميل
   ========================= */

renderStats(0);

renderMyTotal();

loadStats();

loadIntentions();


/* =========================
   تحديث تلقائي
   ========================= */

/* العداد كل 20 ثانية */

setInterval(
  loadStats,
  20000
);


/* النوايا كل 30 ثانية */

setInterval(
  loadIntentions,
  30000
);
