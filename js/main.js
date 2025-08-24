// js/main.js
import { mostrarFotosUnaPorUna } from './gallery.js';
import { initValentineCard } from './valentinecard.js';
import { initHeart } from './heart.js';
import { initCard } from './card.js';
import { initIntroCard } from './intro.js';

import { initLocalMusic } from './localMusic.js';
import { mountMusicToggle } from './musicToggle.js';

/* ===== Música local ===== */
initLocalMusic({
  srcs: [
    './mp3/ithappenedquiet.mp3',
    './mp3/theseed.mp3',
    './mp3/runaway.mp3'
  ],
  volume: 0.5,
  loopAll: true,
  autoplay: true
});
mountMusicToggle();

// intento inmediato + reintentos cortos (por políticas de autoplay)
function tryStart(){ window.bgMusic?.unmute?.(); window.bgMusic?.setVolume?.(0.9); window.bgMusic?.play?.(); }
tryStart();
window.addEventListener('focus', tryStart);
document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='visible') tryStart(); });
// botón fallback si el navegador bloquea
(function(){
  const id='audio-nudge';
  if (document.getElementById(id)) return;
  const b=document.createElement('button');
  b.id=id; b.type='button'; b.textContent='Habilitar audio';
  b.style.cssText='position:fixed;left:50%;transform:translateX(-50%);bottom:20px;z-index:10000;padding:8px 12px;border:0;border-radius:999px;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.2);font:600 14px system-ui;cursor:pointer;';
  b.onclick=()=>{ tryStart(); b.remove(); };
  requestAnimationFrame(()=>document.body.appendChild(b));
})();
/* ===== Fin música ===== */

function loadComponent(p){ return fetch(p).then(r=>r.text()); }

function createPanel({id, html}){
  return `
    <section class="panel" id="panel-${id}" hidden>
      <div class="panel-content">
        <section class="comp comp-${id}" hidden aria-hidden="true">
          ${html}
        </section>
        <div class="flow-actions" data-flow-for="${id}"></div>
      </div>
    </section>`;
}

function setupUI(root){
  const ids=['intro','heart','gallery','card','letter'];
  const titles=['intro','cœur','galerie','carte','lettre'];

  const bar=document.createElement('div');
  bar.className='comp-bar';
  bar.innerHTML=titles.map((t,i)=>`<button class="comp-btn" data-btn="${ids[i]}" aria-expanded="false" disabled>${t}</button>`).join('');
  root.prepend(bar);

  const setOpen=(id,open)=>{
    const panel=root.querySelector(`#panel-${id}`);
    const btn=bar.querySelector(`[data-btn="${id}"]`);
    const comp=panel.querySelector('.comp');
    if(btn){ btn.classList.toggle('is-active',open); btn.setAttribute('aria-expanded',String(open)); }
    comp.toggleAttribute('hidden',!open);
    comp.setAttribute('aria-hidden',String(!open));
    if(open && panel.classList.contains('open')) return;
    if(!open && !panel.classList.contains('open')) return;
    if(open){ panel.hidden=false; panel.offsetHeight; panel.classList.add('open'); }
    else{
      panel.classList.remove('open');
      const onEnd=(e)=>{ if(e.propertyName!=='max-height') return; if(!panel.classList.contains('open')) panel.hidden=true; panel.removeEventListener('transitionend',onEnd); };
      panel.addEventListener('transitionend',onEnd);
    }
  };

  const openOnly=(id)=>ids.forEach(x=>setOpen(x,x===id));
  const enableTab=id=>{ const b=bar.querySelector(`[data-btn="${id}"]`); if(b) b.disabled=false; };
  const showBar=()=>bar.classList.add('is-visible');

  bar.addEventListener('click', e=>{
    const b=e.target.closest('.comp-btn'); if(!b || b.disabled) return;
    openOnly(b.dataset.btn);
    root.querySelector(`#panel-${b.dataset.btn}`).scrollIntoView({behavior:'smooth',block:'start'});
  });

  return { setOpen, openOnly, enableTab, showBar, ids };
}

function injectNext(root, fromId, toId, label='Siguiente'){
  const zone=root.querySelector(`.flow-actions[data-flow-for="${fromId}"]`);
  if(!zone || zone.querySelector(`[data-next="${toId}"]`)) return;
  const btn=document.createElement('button');
  btn.className='flow-next';
  btn.textContent=label;
  btn.setAttribute('data-next',toId);
  zone.appendChild(btn);
}

Promise.all([
  loadComponent('./components/intro.html'),
  loadComponent('./components/heart.html'),
  loadComponent('./components/gallery.html'),
  loadComponent('./components/card.html'),
  loadComponent('./components/valentinecard.html')
]).then(([intro,heart,gallery,card,letter])=>{
  const w=document.querySelector('.main-wrapper');

  w.insertAdjacentHTML('beforeend', createPanel({id:'intro', html:intro}));
  w.insertAdjacentHTML('beforeend', createPanel({id:'heart', html:heart}));
  w.insertAdjacentHTML('beforeend', createPanel({id:'gallery', html:gallery}));
  w.insertAdjacentHTML('beforeend', createPanel({id:'card', html:card}));
  w.insertAdjacentHTML('beforeend', createPanel({id:'letter', html:letter}));

  initIntroCard();
  initHeart();
  initCard();
  mostrarFotosUnaPorUna();
  initValentineCard();

  const ui=setupUI(w);
  ui.openOnly('intro');

  injectNext(w,'intro','heart','Suivant');
  injectNext(w,'heart','gallery','Suivant');
  injectNext(w,'gallery','card','Suivant');

  w.addEventListener('click', e=>{
    const n1=e.target.closest('.flow-next[data-next="heart"]');
    const n2=e.target.closest('.flow-next[data-next="gallery"]');
    const n3=e.target.closest('.flow-next[data-next="card"]');
    if(n1){ ui.enableTab('heart'); ui.openOnly('heart'); return; }
    if(n2){ ui.enableTab('gallery'); ui.openOnly('gallery'); return; }
    if(n3){ ui.enableTab('card'); ui.openOnly('card'); return; }
  });

  const finishFlow=()=>{
    ui.enableTab('letter'); ui.openOnly('letter');
    setupCTAReveal(); ui.ids.forEach(ui.enableTab); ui.showBar();
  };
  w.addEventListener('card:completed', finishFlow);
  w.addEventListener('click', e=>{ const n=e.target.closest('.flow-next[data-next="letter"]'); if(n) finishFlow(); });

  function setupCTAReveal(){
    const cta=document.querySelector('.footer-cta');
    const cont=document.querySelector('#panel-letter .panel-content');
    if(!cta || !cont) return;
    cta.hidden=true; cta.classList.remove('is-revealed');
    let s=cont.querySelector('.cta-sentinel');
    if(!s){ s=document.createElement('div'); s.className='cta-sentinel'; s.style.cssText='height:1px;margin-top:24px;'; cont.appendChild(s); }
    const io=new IntersectionObserver((entries,obs)=>{
      if(entries.some(e=>e.isIntersecting)){
        cta.hidden=false; requestAnimationFrame(()=>cta.classList.add('is-revealed')); obs.disconnect();
      }
    },{root:null,threshold:0.6});
    io.observe(s);
  }
});
