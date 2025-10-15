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
  cues.forEach((c, i) => {
    const li = document.createElement('li');
    li.textContent = c.text;
    li.dataset.index = i;
    linesList.appendChild(li);
  });
  setActive(0);
}

function formatTime(t) {
  if (!isFinite(t)) return '0:00';
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// once metadata loaded, set duration
audio.addEventListener('loadedmetadata', () => {
  durationEl.textContent = formatTime(audio.duration);
});

// Play/pause toggle
playBtn.addEventListener('click', () => {
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
});

// reflect play/pause
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

// Update time and progress and lyrics
audio.addEventListener('timeupdate', () => {
  const t = audio.currentTime;
  currentEl.textContent = formatTime(t);
  const pct = (t / audio.duration) * 100;
  progress.style.width = Math.max(0, Math.min(100, pct)) + '%';

  // find active cue
  let idx = cues.findIndex(c => t >= c.start && t < c.end);
  if (idx === -1) {
    // if after last cue, set to last
    if (t >= cues[cues.length - 1].end) idx = cues.length - 1;
    else if (t < cues[0].start) idx = 0;
  }
  if (idx !== activeIndex) {
    setActive(idx);
  }
});

// click to seek
timeline.addEventListener('click', (e) => {
  const rect = timeline.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const pct = x / rect.width;
  if (audio.duration) audio.currentTime = pct * audio.duration;
});

// make keyboard space toggle
window.addEventListener('keydown', (e) => { if (e.code === 'Space') { e.preventDefault(); if (audio.paused) audio.play(); else audio.pause(); } });

function setActive(idx) {
  if (idx == null || idx < 0) idx = 0;
  idx = Math.min(cues.length - 1, idx);
  activeIndex = idx;
  // highlight
  document.querySelectorAll('#lines li').forEach(li => li.classList.remove('active'));
  const activeLi = document.querySelector(`#lines li[data-index='${idx}']`);
  if (activeLi) activeLi.classList.add('active');

  // compute translate to center the active li
  const liHeight = activeLi ? activeLi.offsetHeight : 48;
  const listRect = linesList.getBoundingClientRect();
  const wrapRect = linesList.parentElement.getBoundingClientRect();
  const centerY = wrapRect.height / 2;
  // index top offset
  let offset = 0;
  const activeTop = activeLi ? activeLi.offsetTop : 0;
  // want activeTop + liHeight/2 to align with centerY
  offset = centerY - (activeTop + liHeight / 2);
  linesList.style.transform = `translateY(${offset}px)`;
}

// Initialize: before play, make first line slightly below center (handled by .not-playing class)
setActive(0);

// click on a line to seek to its start
linesList.addEventListener('click', (e) => {
  const li = e.target.closest('li');
  if (!li) return;
  const i = Number(li.dataset.index);
  if (cues[i]) {
    audio.currentTime = cues[i].start + 0.001; // tiny offset to ensure timeupdate registers
    if (audio.paused) audio.play();
  }
});

// For accessibility: announce which line is active (simple console for demo)
audio.addEventListener('ended', () => {
  playIcon.innerHTML = '<path d="M8 5v14l11-7z"></path>';
  app.classList.add('not-playing');
});

// Optional: if you want to programmatically load SRT later, here's a tiny parser you can reuse
function parseSRT(srtText) {
  const blocks = srtText.trim().split(/\\n\\s*\\n+/);
  const out = [];

  for (const block of blocks) {
    const lines = block.split(/\\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length >= 2) {
      const timeLine = lines.find(l => l.includes('-->'));
      const match = timeLine && timeLine.match(/(\\d{2}:\\d{2}:\\d{2},\\d{3})\\s*-->\\s*(\\d{2}:\\d{2}:\\d{2},\\d{3})/);
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
