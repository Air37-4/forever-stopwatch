const GLOBAL_START_URL = "start.json?v=7";

const els = {
  mainMinutes: document.querySelector("#mainMinutes"),
  mainHours: document.querySelector("#mainHours"),
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
    els.mainMinutes.textContent = "0";
    els.mainHours.textContent = "0";
    return;
  }

  const elapsedMs = Math.max(0, Date.now() - startedAt);
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalSeconds / 3600);

  els.mainMinutes.textContent = formatNumber(totalMinutes);
  els.mainHours.textContent = formatNumber(totalHours);
}

function formatNumber(value) {
  return new Intl.NumberFormat("ru-RU").format(value);
}

init();
