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

    // создаём обычную строчку
    const li = document.createElement('li');
    li.textContent = c.text;
    li.dataset.index = i;
    li.dataset.start = c.start;
    li.dataset.end = c.end;
    linesList.appendChild(li);

    // если есть пауза до следующей строки, вставляем "gap"
    if (i < cues.length - 1) {
      const next = cues[i + 1];
      const gapDuration = next.start - c.end;
      if (gapDuration > 0.01) { // минимальный порог
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

  // --- обычные строки ---
  let idx = cues.findIndex(c => t >= c.start && t < c.end);
  if (idx === -1) {
    if (t < cues[0].start) idx = 0;
    else if (t > cues[cues.length - 1].end) idx = cues.length - 1;
  }
  if (idx !== activeIndex) setActive(idx);

  // --- gap-анимация ---
  document.querySelectorAll('#lines li.gap').forEach(gap => {
    const start = parseFloat(gap.dataset.start);
    const end = parseFloat(gap.dataset.end);

    if (t >= start && t <= end) {
      const pct = ((t - start) / (end - start)) * 100;
      let span = gap.querySelector('.fill');
      if (!span) {
        span = document.createElement('span');
        span.className = 'fill';
        Object.assign(span.style, {
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: '0%',
          background: 'white',
          transition: 'width 0.1s linear'
        });
        gap.appendChild(span);
      }
      span.style.width = pct + '%';
    } else {
      const span = gap.querySelector('.fill');
      if (span) span.style.width = '0%';
    }
  });
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
