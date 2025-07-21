function initCustomSlider() {
  const volumeIcon = document.querySelector('.ytp-volume-icon');
  const panel = document.querySelector('.ytp-volume-panel');
  const video = document.querySelector('video');
  const timer = document.querySelector('.ytp-time-display.notranslate');
  const chapter = document.querySelector('.ytp-chapter-title.ytp-button');

  if (!volumeIcon || !panel || !video || !timer) return;

  // Ховаємо стандартний повзунок
  const oldSlider = panel.querySelector('.ytp-volume-slider');
  if (oldSlider) oldSlider.style.display = 'none';

  // Видаляємо старий кастомний, якщо є
  const prev = document.querySelector('#custom-volume-slider');
  if (prev) prev.remove();

  // Створюємо кастомний повзунок
  const slider = document.createElement('div');
  slider.id = 'custom-volume-slider';
  slider.innerHTML = `
    <div id="custom-volume-track">
      <div id="custom-volume-fill"></div>
      <div id="custom-volume-thumb"></div>
    </div>
  `;
  panel.appendChild(slider);

  const track = slider.querySelector('#custom-volume-track');
  const fill = slider.querySelector('#custom-volume-fill');
  const thumb = slider.querySelector('#custom-volume-thumb');

  // Оновлення UI повзунка
  function updateUI(vol) {
    const px = vol * 200;
    fill.style.width = `${px}px`;
    thumb.style.left = `${px}px`;
  }

  updateUI(video.volume);

  // Керування drag
  let isDragging = false;

  function setVolumeFromEvent(e) {
    const rect = track.getBoundingClientRect();
    let vol = (e.clientX - rect.left) / 200;
    vol = Math.max(0, Math.min(1, vol));

    if (vol === 0) {
      video.volume = 0;
      video.muted = true;
    } else {
      video.muted = false;
      video.volume = vol;
    }
    updateUI(vol);
  }

  track.addEventListener('mousedown', (e) => {
    isDragging = true;
    setVolumeFromEvent(e);
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) setVolumeFromEvent(e);
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Колесо миші - мілкий крок 0.01
  track.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      let delta = e.deltaY < 0 ? 0.01 : -0.01;
      let vol = video.volume + delta;
      vol = Math.max(0, Math.min(1, vol));

      if (vol === 0) {
        video.volume = 0;
        video.muted = true;
      } else {
        video.muted = false;
        video.volume = vol;
      }

      updateUI(vol);
    },
    { passive: false }
  );

  // Синхронізація при зміні гучності ззовні
  video.addEventListener('volumechange', () => updateUI(video.volume));

  // Поява/зникнення повзунка з анімацією
  let hideTimer;

  function showSlider() {
    clearTimeout(hideTimer);
    slider.classList.add('visible');
    timer.style.transform = 'translateX(200px)';
    if (chapter) chapter.style.transform = 'translateX(200px)';
  }

  function hideSlider() {
    slider.classList.remove('visible');
    timer.style.transform = 'translateX(0)';
    if (chapter) chapter.style.transform = 'translateX(0)';
  }

  volumeIcon.addEventListener('mouseenter', showSlider);
  slider.addEventListener('mouseenter', showSlider);

  volumeIcon.addEventListener('mouseleave', () => {
    hideTimer = setTimeout(hideSlider, 100);
  });

  slider.addEventListener('mouseleave', () => {
    hideTimer = setTimeout(hideSlider, 100);
  });

  // При початковому завантаженні зменшуємо зсув
  showSlider();
  hideTimer = setTimeout(hideSlider, 100);
}

// Очікуємо, поки елементи завантажаться
const wait = setInterval(() => {
  if (
    document.querySelector('.ytp-volume-icon') &&
    document.querySelector('.ytp-volume-panel') &&
    document.querySelector('video')
  ) {
    clearInterval(wait);
    initCustomSlider();
  }
}, 500);
