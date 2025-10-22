const telegram = window.Telegram.WebApp;
const DEVICE_TYPE = telegram.platform;

telegram.expand();
if (telegram.isVersionAtLeast("6.1")) {
  telegram.BackButton.show()
  telegram.BackButton.onClick(() => hapticFeedback('soft', '../'));
}
if (telegram.isVersionAtLeast("7.7")) telegram.disableVerticalSwipes();
if (telegram.isVersionAtLeast("8.0")) {
  telegram.requestFullscreen();
}


function hapticFeedback(type, redirectUrl) {
  if (telegram.isVersionAtLeast("6.1") && (DEVICE_TYPE === 'android' || DEVICE_TYPE === 'ios')) {
    switch (type) {
      case 'light':
        telegram.HapticFeedback.impactOccurred('light');
        break;
      case 'medium':
        telegram.HapticFeedback.impactOccurred('medium');
        break;
      case 'heavy':
        telegram.HapticFeedback.impactOccurred('heavy');
        break;
      case 'rigid':
        telegram.HapticFeedback.impactOccurred('rigid');
        break;
      case 'soft':
        telegram.HapticFeedback.impactOccurred('soft');
        break;
      case 'error':
        telegram.HapticFeedback.notificationOccurred('error');
        break;
      case 'success':
        telegram.HapticFeedback.notificationOccurred('success');
        break;
      case 'warning':
        telegram.HapticFeedback.notificationOccurred('warning');
        break;
      case 'change':
        telegram.HapticFeedback.selectionChanged();
        break;
      default:
        console.warn('Unknown haptic feedback type:', type);
    }
  }
  if (redirectUrl && redirectUrl !== '#') {
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 0);
  }
}


const SafeAreaManager = (() => {
  let safeAreaTop = 0;
  let safeAreaBottom = 0;
  let contentSafeAreaTop = 0;
  let contentSafeAreaBottom = 0;

  function getTotalSafeAreas() {
    return {
      top: safeAreaTop + contentSafeAreaTop,
      bottom: safeAreaBottom + contentSafeAreaBottom
    };
  }

  function updateFromTelegram() {
    const content = telegram.contentSafeAreaInset || {};
    const system = telegram.safeAreaInset || {};

    contentSafeAreaTop = content.top || 0;
    contentSafeAreaBottom = content.bottom || 0;
    safeAreaTop = system.top || 0;
    safeAreaBottom = system.bottom || 0;
  }

  function init() {
    const updateAndNotify = () => {
      updateFromTelegram();
      if (typeof SafeAreaManager.onChange === 'function') {
        SafeAreaManager.onChange(getTotalSafeAreas());
      }
    };

    telegram.onEvent('safeAreaChanged', updateAndNotify);
    telegram.onEvent('contentSafeAreaChanged', updateAndNotify);
    updateAndNotify();
  }

  return {
    init,
    getTotalSafeAreas,
    onChange: null
  };
})();


document.addEventListener('DOMContentLoaded', () => {
  const trackInfo = document.querySelector('.track-info');
  const controls = document.querySelector('.controls');
  // const description = document.querySelector('.description');

  SafeAreaManager.onChange = ({ top, bottom }) => {
    const bottomValue = bottom === 0 ? 'calc((100 / 428) * 16 * var(--vw))' : `${bottom * 2}px`;
    const topValue = top === 0 ? 'calc(100 / 428 * 16 * var(--vw))' : `${top}px`;

    trackInfo.style.marginTop = topValue;
    controls.style.paddingBottom = bottomValue;
  };
  SafeAreaManager.init();
});















































// Номер песни из ссылки
const urlParams = new URLSearchParams(window.location.search);
const album = urlParams.get('album') || '1';
const track = urlParams.get('track') || '1';





// --- DOM ---
const trackTitle = document.querySelector('.track-title');
const trackArtist = document.querySelector('.track-artist');
const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const currentEl = document.getElementById('current');
const durationEl = document.getElementById('duration');
const progress = document.getElementById('progress');
const timeline = document.getElementById('timeline');
const linesList = document.getElementById('lines');
const app = document.getElementById('app');

audio.src = `../${album}/music/${track}.mp3`;
document.body.style.setProperty('--bg-image', `url("../../img/album-${album}.jpg")`);
document.querySelector('.track-info img').src = `../../img/album-${album}.jpg`;

const tracks = {
  1: {
    1: "Консьюмеризм 🅴",
    2: "Деньги 🅴",
    3: "Сосочка 🅴",
    4: "Звезда новой школы должна умереть 🅴",
    5: "Кто такой Гусейн Гасанов? 🅴",
    6: "И снова, спасибо тебе 🅴",
    7: "И опять гулять 🅴",
    8: "Рок мёртв. Всё ещё 🅴",
    9: "Ты идёшь по снегу 🅴",
    10: "Бэкап 🅴",
    11: "Твой краш 🅴",
    12: "Паттерн 🅴"
  },
  2: {
    1: "Где ты 🅴",
    2: "24101989 (feat. Валентина Лавриненко) 🅴",
    3: 'Бар "Рагнарёк" (feat. ЗАМАЙ) 🅴',
    4: "За моим компом",
    5: "Мальчик-постмодернист 🅴",
    6: "Юра 🅴",
    7: "Ты",
    8: "Омномном 🅴",
    9: "Старый, толстый 🅴",
    10: "Дикодэнс 🅴",
    11: "Паранойя 🅴",
    12: "Хеллоуин Инфанты 🅴",
    13: "Скевоморфизм 🅴",
    14: "Мемы и депрессия 🅴",
    15: "Я 🅴",
    16: "Песня о смерти 🅴",
    17: "Видоизменённый углерод 🅴"
  },
  3: {
    1: "Стамбул 2025 🅴",
    2: "Ragnarok 🅴",
    3: "Панк 🅴",
    4: "Штефангейт 🅴",
    5: "Памяти Алексея Навального 🅴",
    6: "Покупай 🅴",
    7: "Америка 🅴",
    8: "GPT 🅴",
    9: "Крылья 🅴",
    10: "Туманный мир 🅴"
  }
}
trackTitle.textContent = tracks[album][track];
trackArtist.textContent = `${track} / ${Object.keys(tracks[album]).length}`;



let cues = []; // сюда загрузим SRT
let activeIndex = 0;
let isPlaying = false;

// --- Загрузка SRT ---
fetch(`../${album}/srt/${track}.srt`)
  .then(r => r.text())
  .then(text => {
    cues = parseSRT(text);
    rebuildLyrics();
    requestAnimationFrame(animateGapBars);
  })
  .catch(err => console.error('Ошибка загрузки SRT:', err));


// --- Функция пересборки списка ---
function rebuildLyrics() {
  linesList.innerHTML = '';

  let indexCounter = 0;

  const firstCueStart = cues[0]?.start || 0;
  if (firstCueStart > 0) {
    const gapLi = createGapLi(0, firstCueStart);
    gapLi.dataset.index = indexCounter++;
    linesList.appendChild(gapLi);
  }

  for (let i = 0; i < cues.length; i++) {
    const c = cues[i];

    const li = document.createElement('li');
    li.textContent = c.text;
    li.dataset.index = indexCounter++;
    li.dataset.start = c.start;
    li.dataset.end = c.end;
    li.classList.add('line');
    linesList.appendChild(li);

    if (i < cues.length - 1) {
      const next = cues[i + 1];
      const gapDuration = next.start - c.end;
      if (gapDuration > 0.01) {
        const gapLi = createGapLi(c.end, next.start);
        gapLi.dataset.index = indexCounter++;
        linesList.appendChild(gapLi);
      }
    }
  }

  setActive(0);
}

// функция создания полосы "gap"
function createGapLi(start, end) {
  const li = document.createElement('li');
  li.classList.add('gap');
  li.dataset.start = start;
  li.dataset.end = end;

  const bg = document.createElement('div');
  bg.classList.add('gap-bg');

  const fill = document.createElement('div');
  fill.classList.add('gap-fill');

  bg.appendChild(fill);
  li.appendChild(bg);

  // вычисляем длительность gap и ширину
  const gapDuration = end - start;

  // если меньше 1 сек — 5%, если больше 10 сек — 100%, между ними — пропорционально
  let widthPct;
  if (gapDuration <= 1) widthPct = 5;
  else if (gapDuration >= 10) widthPct = 100;
  else widthPct = 5 + ((gapDuration - 1) / (10 - 1)) * (100 - 5);

  li.style.width = `${widthPct}%`;
  li.style.margin = 'auto'; // чтобы было по центру

  return li;
}




// --- Вспомогательные функции ---
function formatTime(t) {
  if (!isFinite(t)) return '0:00';
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// --- Аудио ---
audio.addEventListener('loadedmetadata', () => {
  durationEl.textContent = formatTime(audio.duration);
});

playBtn.addEventListener('click', () => {
  if (audio.paused) audio.play();
  else audio.pause();
});

audio.addEventListener('play', () => {
  isPlaying = true;
  playIcon.innerHTML = '<path d="M176 96C149.5 96 128 117.5 128 144L128 496C128 522.5 149.5 544 176 544L240 544C266.5 544 288 522.5 288 496L288 144C288 117.5 266.5 96 240 96L176 96zM400 96C373.5 96 352 117.5 352 144L352 496C352 522.5 373.5 544 400 544L464 544C490.5 544 512 522.5 512 496L512 144C512 117.5 490.5 96 464 96L400 96z"></path>'; // pause
  app.classList.remove('not-playing');
});

audio.addEventListener('pause', () => {
  isPlaying = false;
  playIcon.innerHTML = '<path d="M187.2 100.9C174.8 94.1 159.8 94.4 147.6 101.6C135.4 108.8 128 121.9 128 136L128 504C128 518.1 135.5 531.2 147.6 538.4C159.7 545.6 174.8 545.9 187.2 539.1L523.2 355.1C536 348.1 544 334.6 544 320C544 305.4 536 291.9 523.2 284.9L187.2 100.9z"></path>'; // play
  if (audio.currentTime === 0) app.classList.add('not-playing');
});

audio.addEventListener('timeupdate', () => {
  const t = audio.currentTime;
  currentEl.textContent = formatTime(t);
  const pct = (t / audio.duration) * 100;
  progress.style.width = `${Math.max(0, Math.min(100, pct))}%`;

  // ищем активный элемент (line или gap)
  const allItems = Array.from(document.querySelectorAll('#lines li'));
  let newIndex = null;

  for (const li of allItems) {
    const start = parseFloat(li.dataset.start);
    const end = parseFloat(li.dataset.end);
    if (t >= start && t < end) {
      newIndex = parseInt(li.dataset.index);
      break;
    }
  }

  if (newIndex !== activeIndex) setActive(newIndex);
});



// клик по таймлайну
timeline.addEventListener('click', e => {
  const rect = timeline.getBoundingClientRect();
  const x = e.clientX - rect.left;
  if (audio.duration) audio.currentTime = (x / rect.width) * audio.duration;
});

// пробел для play/pause
window.addEventListener('keydown', e => {
  if (e.code === 'Space') {
    e.preventDefault();
    if (audio.paused) audio.play();
    else audio.pause();
  }
});

// --- Работа с активной строчкой ---
function setActive(idx) {
  activeIndex = idx;

  document.querySelectorAll('#lines li').forEach(li => li.classList.remove('active'));

  if (idx === null) return;
  const activeLi = document.querySelector(`#lines li[data-index='${idx}']`);
  if (!activeLi) return;

  activeLi.classList.add('active');

  const liHeight = activeLi.offsetHeight;
  const wrapRect = linesList.parentElement.getBoundingClientRect();
  const centerY = wrapRect.height / 2;
  const activeTop = activeLi.offsetTop;
  const offset = (centerY - (activeTop + liHeight / 2)) * 0.95;
  linesList.style.transform = `translateY(${offset}px)`;
  hapticFeedback('change');
}



// клик по строчке для перехода
linesList.addEventListener('click', e => {
  const li = e.target.closest('li');
  if (!li) return;
  const i = Number(li.dataset.index);
  if (cues[i]) {
    audio.currentTime = cues[i].start + 0.001;
    if (audio.paused) audio.play();
  }
});

// --- Конец воспроизведения ---
audio.addEventListener('ended', () => {
  playIcon.innerHTML = '<path d="M187.2 100.9C174.8 94.1 159.8 94.4 147.6 101.6C135.4 108.8 128 121.9 128 136L128 504C128 518.1 135.5 531.2 147.6 538.4C159.7 545.6 174.8 545.9 187.2 539.1L523.2 355.1C536 348.1 544 334.6 544 320C544 305.4 536 291.9 523.2 284.9L187.2 100.9z"></path>';
  app.classList.add('not-playing');
});

// --- Парсер SRT ---
function parseSRT(srtText) {
  const blocks = srtText.trim().split(/\n\s*\n+/);
  const out = [];

  for (const block of blocks) {
    const lines = block.split(/\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length >= 2) {
      const timeLine = lines.find(l => l.includes('-->'));
      const match = timeLine && timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*--> (\d{2}:\d{2}:\d{2},\d{3})/);
      if (match) {
        const start = toSeconds(match[1]);
        const end = toSeconds(match[2]);
        const text = lines.slice(lines.indexOf(timeLine) + 1).join(' ');
        out.push({ start, end, text });
      }
    }
  }
  return out;

  function toSeconds(t) {
    const [h, m, s, ms] = t.split(/[:,]/).map(Number);
    return h * 3600 + m * 60 + s + ms / 1000;
  }
}







function animateGapBars() {
  const t = audio.currentTime;

  document.querySelectorAll('#lines li.gap').forEach(li => {
    const start = parseFloat(li.dataset.start);
    const end = parseFloat(li.dataset.end);
    const fill = li.querySelector('.gap-fill');
    if (!fill) return;

    if (t >= start && t <= end) {
      const progress = ((t - start) / (end - start)) * 100;
      fill.style.width = `${progress}%`;
    } else if (t < start) {
      fill.style.width = '0%';
    } else if (t > end) {
      fill.style.width = '100%';
    }
  });

  requestAnimationFrame(animateGapBars);
}