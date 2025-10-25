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
  const cover = document.querySelector('.cover');
  const tracks = document.querySelector('.tracks');
  SafeAreaManager.onChange = ({ top, bottom }) => {
    const topValue = top === 0 ? 'calc(100 / 428 * 24 * var(--vw))' : `${top}px`;
    const bottomValue = bottom === 0 ? 'calc((100 / 428) * 32 * var(--vw))' : `${bottom * 2}px`;
    cover.style.marginTop = topValue
    tracks.style.marginBottom = bottomValue
  };
  SafeAreaManager.init();
});








const albumInfo = {
  1: {
    "title": "Студийные герои",
    "tracks": {
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
    }
  },
  2: {
    "title": "Мемы и депрессия",
    "tracks": {
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
    }
  },
  3: {
    "title": "CAPITALISTIC SWINE GRINDCORE",
    "tracks": {
      1: "Стамбул 2025 🅴",
      2: "Ragnarok 🅴",
      3: "Панк 🅴",
      4: "Штефангейт 🅴",
      5: "Памяти Алексея Навального 🅴",
      6: "Покупай 🅴",
      7: "Америка 🅴",
      8: "GPT 🅴",
      9: "Крылья 🅴",
      10: "Туманный мир 🅴",
      11: "Ragnarok 🅴 (оригинал)",
      12: "Панк 🅴 (оригинал)",
      13: "Штефангейт 🅴 (оригинал)",
      14: "Памяти Алексея Навального 🅴 (оригинал)",
      15: "Покупай 🅴 (оригинал)",
      16: "Америка 🅴 (оригинал)",
      17: "GPT 🅴 (оригинал)",
      18: "Крылья 🅴 (оригинал)",
      19: "Туманный мир 🅴 (оригинал)"
    }
  }
}

const urlParams = new URLSearchParams(window.location.search);
const album = urlParams.get('album') || '1';

document.querySelector('.cover img').src = `../img/album-${album}.jpg`;
document.querySelector('.info span').textContent = albumInfo[album].title;

const tracksContainer = document.querySelector('.tracks');
const tracks = albumInfo[album].tracks;
for (const [track, title] of Object.entries(tracks)) {
  const trackDiv = document.createElement('div');
  trackDiv.className = 'track';
  trackDiv.setAttribute('onclick', `hapticFeedback('soft', 'track?album=${album}&track=${track}')`);
  trackDiv.innerHTML = `
    <span class="number">${track}</span>
    <div class="title">
      <span>${title}</span>
      <div class="arrow">
        <svg><use href="#arrow-svg"></use></svg>
      </div>
    </div>
  `;
  tracksContainer.appendChild(trackDiv);
}

document.body.style.setProperty('--bg-image', `url("../img/album-${album}.jpg")`);
