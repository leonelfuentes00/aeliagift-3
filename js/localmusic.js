// Reproductor local <audio> con playlist y loop
let _audio = null;
let _list = [];
let _idx = 0;
let _loopAll = true;

function _load(i, { play = true } = {}) {
  _idx = i;
  _audio.src = _list[_idx];
  if (play) _audio.play().catch(()=>{});
}

export function initLocalMusic({
  srcs = [],        // ['audio/runaway.mp3', 'audio/the_seed.mp3', ...]
  volume = 0.8,     // 0..1
  loopAll = true,   // loop de la lista
  autoplay = true
} = {}) {
  if (_audio) return _audio;

  _list = srcs.slice();
  if (_list.length === 0) {
    console.warn('[localMusic] lista vacía');
    return null;
  }

  _audio = new Audio();
  _audio.hidden = true;
  _audio.preload = 'auto';
  _audio.crossOrigin = 'anonymous';
  _audio.volume = volume;
  _audio.loop = false;     // manejamos loop manual de la lista
  _loopAll = !!loopAll;

  document.body.appendChild(_audio);
  _load(0, { play: autoplay });

  _audio.addEventListener('ended', () => {
    const last = _idx === _list.length - 1;
    if (!last) return _load(_idx + 1, { play: true });
    if (_loopAll) return _load(0, { play: true });
  });

  // API pública compatible
  window.bgMusic = {
    play:   () => _audio.play().catch(()=>{}),
    pause:  () => _audio.pause(),
    mute:   () => (_audio.muted = true),
    unmute: () => (_audio.muted = false),
    toggleMute: () => (_audio.muted = !_audio.muted),
    isMuted: () => _audio.muted,
    setVolume: (v) => (_audio.volume = Math.max(0, Math.min(1, v))),
    next: () => _load((_idx + 1) % _list.length, { play: true }),
    prev: () => _load((_idx - 1 + _list.length) % _list.length, { play: true }),
    setPlaylist: (arr = [], { startIndex = 0, play = true } = {}) => {
      if (!arr.length) return;
      _list = arr.slice();
      _load(Math.max(0, Math.min(startIndex, _list.length - 1)), { play });
    },
    currentIndex: () => _idx,
    list: () => _list.slice()
  };

  return _audio;
}
