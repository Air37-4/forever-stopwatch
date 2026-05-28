const GLOBAL_START_URL = "start.json?v=5";

const els = {
  mainDays: document.querySelector("#mainDays"),
  mainHours: document.querySelector("#mainHours"),
  sinceText: document.querySelector("#sinceText"),
  minutesTotal: document.querySelector("#minutesTotal"),
  hoursTotal: document.querySelector("#hoursTotal"),
  daysTotal: document.querySelector("#daysTotal"),
  weeksTotal: document.querySelector("#weeksTotal"),
  monthsTotal: document.querySelector("#monthsTotal"),
  yearsTotal: document.querySelector("#yearsTotal"),
};

let startedAt = null;

async function init() {
  try {
    const response = await fetch(GLOBAL_START_URL, { cache: "no-store" });
    if (response.ok) {
      const config = await response.json();
      const ts = Number(config.startedAt);
      if (Number.isFinite(ts) && ts > 0) {
        startedAt = ts;
      }
    }
  } catch {
    // ignore
  }
  render();
  setInterval(render, 1000);
}

function render() {
  if (!startedAt) {
    els.mainDays.textContent = "0";
    els.mainHours.textContent = "0";
    els.sinceText.textContent = "Ожидание времени старта...";
    return;
  }

  const elapsedMs = Math.max(0, Date.now() - startedAt);
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const totalHours = Math.floor(totalSeconds / 3600);

  els.mainDays.textContent = formatNumber(days);
  els.mainHours.textContent = formatNumber(totalHours);

  els.sinceText.textContent = `Старт: ${new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(startedAt))}`;

  els.minutesTotal.textContent = formatNumber(Math.floor(totalSeconds / 60));
  els.hoursTotal.textContent = formatNumber(totalHours);
  els.daysTotal.textContent = formatNumber(days);
  els.weeksTotal.textContent = formatNumber(Math.floor(days / 7));
  els.monthsTotal.textContent = formatNumber(fullCalendarMonthsSince(startedAt));
  els.yearsTotal.textContent = formatNumber(fullCalendarYearsSince(startedAt));
}

function fullCalendarMonthsSince(timestamp) {
  const start = new Date(timestamp);
  const now = new Date();
  let months =
    (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth();
  if (now.getDate() < start.getDate()) {
    months -= 1;
  }
  return Math.max(0, months);
}

function fullCalendarYearsSince(timestamp) {
  const start = new Date(timestamp);
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  const anniversary = new Date(now.getFullYear(), start.getMonth(), start.getDate());
  if (now < anniversary) {
    years -= 1;
  }
  return Math.max(0, years);
}

function formatNumber(value) {
  return new Intl.NumberFormat("ru-RU").format(value);
}

init();
