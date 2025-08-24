// js/musicToggle.js (o donde armaste el botón de mute)
export function mountMusicToggle() {
  if (document.getElementById('music-toggle')) return;

  const wrap = document.createElement('div');
  wrap.style.cssText = `
    position:fixed; bottom:20px; right:20px; z-index:10000;
    display:flex; gap:8px;
  `;

  // Botón mute
  const muteBtn = document.createElement('button');
  muteBtn.id = 'music-toggle';
  muteBtn.textContent = '🔊';
  muteBtn.style.cssText = baseStyle();
  muteBtn.onclick = () => {
    if (window.bgMusic?.isMuted()) {
      window.bgMusic?.unmute();
      muteBtn.textContent = '🔊';
    } else {
      window.bgMusic?.mute();
      muteBtn.textContent = '🔇';
    }
  };
  wrap.appendChild(muteBtn);

  // Botón next
  const nextBtn = document.createElement('button');
  nextBtn.id = 'music-next';
  nextBtn.textContent = '⏭️';
  nextBtn.style.cssText = baseStyle();
  nextBtn.onclick = () => { window.bgMusic?.next(); };
  wrap.appendChild(nextBtn);

  document.body.appendChild(wrap);

  function baseStyle() {
    return `
      width:32px;height:32px;border-radius:50%;border:0;
      background:#fff;box-shadow:0 2px 6px rgba(0,0,0,.25);
      font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;
    `;
  }
}
