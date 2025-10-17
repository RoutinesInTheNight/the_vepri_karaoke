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
  setTimeout(() => {
    window.location.href = redirectUrl;
  }, 0);
}






// --- DOM ---
const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const currentEl = document.getElementById('current');
const durationEl = document.getElementById('duration');
const progress = document.getElementById('progress');
const timeline = document.getElementById('timeline');
const linesList = document.getElementById('lines');
const app = document.getElementById('app');

let cues = []; // сюда загрузим SRT
let activeIndex = 0;
let isPlaying = false;

// --- Загрузка SRT ---
fetch('song.srt')
  .then(r => r.text())
  .then(text => {
    cues = parseSRT(text);
    rebuildLyrics();
  })
  .catch(err => console.error('Ошибка загрузки SRT:', err));

// --- Функция пересборки списка ---
function rebuildLyrics() {
  linesList.innerHTML = '';

  for (let i = 0; i < cues.length; i++) {
    const c = cues[i];

    const li = document.createElement('li');
    li.dataset.index = i;
    li.dataset.start = c.start;
    li.dataset.end = c.end;

    // если строка состоит только из "-"
    if (c.text.trim() === '-') {
      li.classList.add('fill-line');
      li.innerHTML = `<span class="fill"></span>`;
    } else {
      li.textContent = c.text;
    }

    linesList.appendChild(li);

    // вставляем "gap", если есть пауза до следующей строки
    if (i < cues.length - 1) {
      const next = cues[i + 1];
      const gapDuration = next.start - c.end;
      if (gapDuration > 0.01) {
        const gapLi = document.createElement('li');
        gapLi.classList.add('gap');
        gapLi.dataset.start = c.end;
        gapLi.dataset.end = next.start;
        linesList.appendChild(gapLi);
      }
    }
  }

  setActive(0);
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
  playIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>'; // pause
  app.classList.remove('not-playing');
});

audio.addEventListener('pause', () => {
  isPlaying = false;
  playIcon.innerHTML = '<path d="M8 5v14l11-7z"></path>'; // play
  if (audio.currentTime === 0) app.classList.add('not-playing');
});

audio.addEventListener('timeupdate', () => {
  const t = audio.currentTime;
  currentEl.textContent = formatTime(t);
  const pct = (t / audio.duration) * 100;
  progress.style.width = `${Math.max(0, Math.min(100, pct))}%`;

  // 🔹 обновляем заполнение для строк с "-"
  document.querySelectorAll('.fill-line').forEach(li => {
    const i = Number(li.dataset.index);
    const cue = cues[i];
    if (!cue) return;

    const fill = li.querySelector('.fill');
    if (!fill) return;

    if (t < cue.start) {
      fill.style.width = '0%';
    } else if (t >= cue.end) {
      fill.style.width = '100%';
    } else {
      const pct = ((t - cue.start) / (cue.end - cue.start)) * 100;
      fill.style.width = `${pct}%`;
    }
  });

  // найти активную строчку
  let idx = cues.findIndex(c => t >= c.start && t < c.end);
  if (idx === -1) {
    if (t >= cues[cues.length - 1].end) idx = cues.length - 1;
    else if (t < cues[0].start) idx = 0;
  }

  if (idx !== activeIndex) setActive(idx);
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
  if (idx == null || idx < 0) idx = 0;
  idx = Math.min(cues.length - 1, idx);
  activeIndex = idx;

  document.querySelectorAll('#lines li').forEach(li => li.classList.remove('active'));
  const activeLi = document.querySelector(`#lines li[data-index='${idx}']`);
  if (activeLi) activeLi.classList.add('active');

  // смещаем список, чтобы активная строчка была по центру
  const liHeight = activeLi ? activeLi.offsetHeight : 48;
  const wrapRect = linesList.parentElement.getBoundingClientRect();
  const centerY = wrapRect.height / 2;
  const activeTop = activeLi ? activeLi.offsetTop : 0;
  const offset = centerY - (activeTop + liHeight / 2);
  linesList.style.transform = `translateY(${offset}px)`;
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
  playIcon.innerHTML = '<path d="M8 5v14l11-7z"></path>';
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
