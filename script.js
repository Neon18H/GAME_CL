const levels = [
  ["¿Qué sentimiento puede sobrevivir incluso al silencio?", "amor", "No desapareció aunque dejaron de hablar.", "A veces el silencio también es una forma de extrañar."],
  ["¿Qué lugar puede sentirse como hogar sin ser una casa?", "corazon", "Era el único lugar donde quería quedarme.", "Nunca me sentí tan en paz como contigo."],
  ["¿Qué sigue vivo incluso después de una despedida?", "recuerdos", "El tiempo no pudo borrarlos.", "Todavía encuentro partes de ti en mis días."],
  ["¿Qué me impidió decirte lo que sentía?", "miedo", "A veces amar también asusta.", "Perderte siempre fue mi mayor temor."],
  ["¿Qué hacía eterno cada momento contigo?", "felicidad", "No era el lugar… eras tú.", "Convertías los días normales en recuerdos eternos."],
  ["¿Qué nunca dejó de buscar el colibrí?", "volver", "El corazón siempre regresa donde fue feliz.", "Una parte de mí jamás se fue."],
  ["¿Qué guardé incluso cuando intenté olvidarte?", "sentimientos", "El tiempo no logró destruirlos.", "Te seguí queriendo incluso en silencio."],
  ["¿Qué hacía especiales las mañanas?", "tu", "No era el amanecer.", "Tu presencia cambiaba completamente mis días."],
  ["¿Qué jamás logró apagar la distancia?", "conexion", "Seguía sintiéndose incluso lejos.", "Siempre sentí que algo nos seguía uniendo."],
  ["¿Qué quería hacer el colibrí después de perderse?", "regresar", "Algunas almas siempre encuentran el camino.", "Si pudiera elegir otra vez… volvería a ti."],
  ["¿Qué descubrí demasiado tarde?", "verdad", "El corazón ya lo sabía.", "Entendí tarde cuánto significabas para mí."],
  ["¿Qué nunca dejó de pronunciar mi mente?", "nombre", "Incluso el silencio lo repetía.", "Pensarte se volvió involuntario."],
  ["¿Qué aún deseo recuperar?", "nosotros", "No era algo… era alguien.", "Todavía sueño con volver a encontrarnos."],
  ["¿Qué siguió intacto a pesar del tiempo?", "amor", "Nunca desapareció realmente.", "Mi corazón nunca aprendió a dejarte ir."],
  ["¿Qué verdad escondió el colibrí durante todo este tiempo?", "amarte", "Era imposible ocultarlo para siempre.", "La verdad es que nunca dejé de amarte."]
];

const els = {
  introText: document.getElementById('introText'), startBtn: document.getElementById('startBtn'),
  introScreen: document.getElementById('introScreen'), gameScreen: document.getElementById('gameScreen'),
  finalScreen: document.getElementById('finalScreen'), levelTitle: document.getElementById('levelTitle'),
  mysteryText: document.getElementById('mysteryText'), progressBar: document.getElementById('progressBar'),
  answerForm: document.getElementById('answerForm'), answerInput: document.getElementById('answerInput'),
  feedback: document.getElementById('feedback'), hintStar: document.getElementById('hintStar'), hintCard: document.getElementById('hintCard'),
  finalLines: document.getElementById('finalLines'), proposalBlock: document.getElementById('proposalBlock'),
  endBtn: document.getElementById('endBtn'), resetBtn: document.getElementById('resetBtn'),
  bgm: document.getElementById('bgm'), sfxCorrect: document.getElementById('sfxCorrect'), sfxHint: document.getElementById('sfxHint'), sfxType: document.getElementById('sfxType')
};

let state = JSON.parse(localStorage.getItem('misterios_estado') || '{"level":0,"pieces":[]}');

function normalize(t){ return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim(); }

function typeWriter(target, text, speed = 40, cb){
  target.textContent = '';
  let i = 0;
  const id = setInterval(() => {
    target.textContent += text[i] || '';
    if (i % 3 === 0) { els.sfxType.currentTime = 0; els.sfxType.play().catch(()=>{}); }
    i++;
    if(i > text.length){ clearInterval(id); cb && cb(); }
  }, speed);
}

function placeStar(){
  const top = 12 + Math.random() * 70;
  const left = 6 + Math.random() * 82;
  els.hintStar.style.top = `${top}%`;
  els.hintStar.style.left = `${left}%`;
}

function renderLevel(){
  const i = state.level;
  if(i >= levels.length) return runEnding();
  const [m] = levels[i];
  els.levelTitle.textContent = `Nivel ${i+1} de 15`;
  els.mysteryText.textContent = m;
  els.progressBar.style.width = `${(i/levels.length)*100}%`;
  els.feedback.innerHTML = '';
  els.answerInput.value = '';
  els.hintCard.classList.add('d-none');
  els.hintStar.classList.remove('d-none');
  placeStar();
}

function save(){ localStorage.setItem('misterios_estado', JSON.stringify(state)); }

els.answerForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const value = normalize(els.answerInput.value);
  const lvl = levels[state.level];
  if(value === normalize(lvl[1])){
    els.sfxCorrect.play().catch(()=>{});
    state.pieces.push(lvl[3]);
    state.level++;
    save();
    els.feedback.innerHTML = `<div class="ok"><p>✨ ${lvl[3]}</p><small>Fragmento desbloqueado.</small></div>`;
    setTimeout(renderLevel, 2000);
  } else {
    els.feedback.innerHTML = '<div class="error">La respuesta no abre este recuerdo… intenta otra vez.</div>';
  }
});

els.hintStar.addEventListener('click', ()=>{
  const lvl = levels[state.level];
  els.sfxHint.play().catch(()=>{});
  els.hintCard.textContent = `Pista: ${lvl[2]}`;
  els.hintCard.classList.remove('d-none');
  els.hintStar.classList.add('d-none');
  setTimeout(()=>{
    els.hintCard.style.opacity = '0';
    setTimeout(()=>{ els.hintCard.classList.add('d-none'); els.hintCard.style.opacity = '1'; }, 900);
  }, 5000);
});

function runEnding(){
  els.gameScreen.classList.add('d-none');
  els.finalScreen.classList.remove('d-none');
  const seq = [
    'Intenté seguir adelante…',
    'Intenté convencerme de que el tiempo lo arreglaría todo…',
    'Pero cada camino…',
    'siempre terminaba llevándome hacia ti.',
    'Nunca dejé de amarte.'
  ];
  let idx = 0;
  const showNext = ()=>{
    if(idx >= seq.length){ els.proposalBlock.classList.remove('d-none'); return; }
    const line = document.createElement('p');
    els.finalLines.appendChild(line);
    typeWriter(line, seq[idx], idx===4 ? 90 : 45, ()=> setTimeout(showNext, 1000));
    idx++;
  };
  showNext();
}

els.endBtn?.addEventListener('click', ()=>{
  els.finalLines.innerHTML += '<p class="mt-4">Gracias por llegar hasta aquí.</p>';
});

els.resetBtn.addEventListener('click', ()=>{
  state = { level: 0, pieces: [] };
  save();
  renderLevel();
});

els.startBtn.addEventListener('click', ()=>{
  els.bgm.volume = 0.45;
  els.bgm.play().catch(()=>{});
  els.introScreen.classList.add('d-none');
  els.gameScreen.classList.remove('d-none');
  renderLevel();
});

typeWriter(els.introText, 'Hay sentimientos que no desaparecen…\nsolo aprenden a esconderse.\n\nBienvenida a Los Misterios del Corazón.', 52);

(function drawStarfield(){
  const c = document.getElementById('starfield');
  const ctx = c.getContext('2d');
  const stars = Array.from({length: 120}, () => ({x: Math.random(), y: Math.random(), z: Math.random()*1.2+0.2}));
  const resize = ()=>{ c.width = innerWidth; c.height = innerHeight; };
  addEventListener('resize', resize); resize();
  (function loop(){
    ctx.clearRect(0,0,c.width,c.height);
    stars.forEach(s=>{
      const x = s.x * c.width, y = s.y * c.height;
      const r = s.z * 1.6;
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
      ctx.fillStyle = `rgba(180,210,255,${0.3+s.z*0.4})`; ctx.fill();
      s.y += 0.00035 * s.z; if(s.y > 1) s.y = 0;
    });
    requestAnimationFrame(loop);
  })();
})();
