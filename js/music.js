let _audio;

/** Crea una única instancia que buclea siempre. */
export function ensureMusic(src, { volume = 0.35 } = {}) {
  if (_audio) return _audio;

  _audio = new Audio(src);
  _audio.loop = true;
  _audio.preload = 'auto';
  _audio.volume = volume;

  // Autoplay sólo después de gesto del usuario (política de los navegadores)
  const tryPlay = () => _audio.play().catch(() => {});
  window.addEventListener('pointerdown', tryPlay, { once: true });
  window.addEventListener('keydown', tryPlay, { once: true });

  // Media Session opcional
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: 'Aurora', artist: '', album: ''
    });
  }

  // Reintenta al volver a la pestaña
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !_audio.paused) {
      _audio.play().catch(() => {});
    }
  });

  // Acceso global útil para toggles
  window.appMusic = _audio;
  return _audio;
}

/** Botón flotante para mutear/desmutear. */
export function mountMusicToggle() {
  const btn = document.createElement('button');
  btn.className = 'music-toggle';
  btn.type = 'button';
  btn.setAttribute('aria-pressed', 'true');
  btn.textContent = '🔊';
  btn.style.cssText = `
    position:fixed; right:12px; bottom:12px; z-index:9999;
    padding:8px 12px; border-radius:999px; border:0; cursor:pointer;
    box-shadow:0 2px 8px rgba(0,0,0,.2); background:#fff; font-size:18px;
  `;
  btn.addEventListener('click', () => {
    if (!window.appMusic) return;
    window.appMusic.muted = !window.appMusic.muted;
    btn.textContent = window.appMusic.muted ? '🔇' : '🔊';
    btn.setAttribute('aria-pressed', String(!window.appMusic.muted));
  });
  document.body.appendChild(btn);
}
