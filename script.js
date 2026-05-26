const STORAGE_KEY = "forever-stopwatch-started-at";
const GLOBAL_START_URL = "start.json?v=2";

const els = {
  startButton: document.querySelector("#startButton"),
  stateLabel: document.querySelector("#stateLabel"),
  mainDays: document.querySelector("#mainDays"),
  mainHours: document.querySelector("#mainHours"),
  sinceText: document.querySelector("#sinceText"),
  secondsTotal: document.querySelector("#secondsTotal"),
  minutesTotal: document.querySelector("#minutesTotal"),
  hoursTotal: document.querySelector("#hoursTotal"),
  daysTotal: document.querySelector("#daysTotal"),
  weeksTotal: document.querySelector("#weeksTotal"),
  monthsTotal: document.querySelector("#monthsTotal"),
  yearsTotal: document.querySelector("#yearsTotal"),
};

let startedAt = readStartTime();

function readStartTime(globalStart) {
  const url = new URL(window.location.href);
  const fromUrl = Number(url.searchParams.get("start"));
  const fromStorage = Number(localStorage.getItem(STORAGE_KEY));
  const candidate =
    Number.isFinite(fromUrl) && fromUrl > 0
      ? fromUrl
      : Number.isFinite(globalStart) && globalStart > 0
        ? globalStart
        : fromStorage;

  if (Number.isFinite(candidate) && candidate > 0) {
    localStorage.setItem(STORAGE_KEY, String(candidate));
    return candidate;
  }

  return null;
}

async function readGlobalStartTime() {
  try {
    const response = await fetch(GLOBAL_START_URL, { cache: "no-store" });

    if (!response.ok) {
      return null;
    }

    const config = await response.json();
    const timestamp = Number(config.startedAt);
    return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : null;
  } catch {
    return null;
  }
}

function startForever() {
  if (startedAt) {
    return;
  }

  startedAt = Date.now();
  localStorage.setItem(STORAGE_KEY, String(startedAt));
  persistStartInUrl(startedAt);
  render();
}

function persistStartInUrl(value) {
  const url = new URL(window.location.href);
  url.searchParams.set("start", String(value));
  window.history.replaceState({}, "", url);
}

function render() {
  if (!startedAt) {
    els.mainDays.textContent = "0";
    els.mainHours.textContent = "0";
    return;
  }

  const elapsedMs = Math.max(0, Date.now() - startedAt);
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const totalHours = Math.floor(totalSeconds / 3600);

  els.mainDays.textContent = formatNumber(days);
  els.mainHours.textContent = formatNumber(totalHours);

  els.stateLabel.textContent = "Время уже идет";
  els.sinceText.textContent = `Старт: ${new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(startedAt))}`;

  els.secondsTotal.textContent = formatNumber(totalSeconds);
  els.minutesTotal.textContent = formatNumber(Math.floor(totalSeconds / 60));
  els.hoursTotal.textContent = formatNumber(totalHours);
  els.daysTotal.textContent = formatNumber(days);
  els.weeksTotal.textContent = formatNumber(Math.floor(days / 7));
  els.monthsTotal.textContent = formatNumber(fullCalendarMonthsSince(startedAt));
  els.yearsTotal.textContent = formatNumber(fullCalendarYearsSince(startedAt));

  els.startButton.textContent = "Запущено";
  els.startButton.classList.add("is-running");
  els.startButton.setAttribute("aria-disabled", "true");
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

els.startButton.addEventListener("click", startForever);
render();
setInterval(render, 1000);

readGlobalStartTime().then((globalStart) => {
  const hasExplicitStart = new URL(window.location.href).searchParams.has("start");

  if (globalStart && (!startedAt || !hasExplicitStart)) {
    startedAt = readStartTime(globalStart);
    render();
  }
});
