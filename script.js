const $ = (s) => document.querySelector(s);
const STORY_STORAGE_KEY = "volver_state_v2";
const EMOTIONAL_STORAGE_KEY = "volver_emotional_profile_v1";

const chapters = [
  { title:"Capítulo 1 — La Ventana", scene:"La lluvia golpea el cristal. Un colibrí tiembla afuera, mirándote como si recordara tu nombre.", choices:["Abrir la ventana","Ignorarlo"] },
  { title:"Capítulo 2 — El Mensaje", scene:"Tu teléfono ilumina la oscuridad: \"¿Sigues despierta?\"", choices:["Responder","Ignorar","Leer sin contestar"] },
  { title:"Capítulo 3 — La Cafetería", scene:"Lo ves al fondo, solo, junto a dos tazas ya frías.", choices:["Entrar","Irse","Observar desde lejos"] },
  { title:"Capítulo 4 — La Carta", scene:"Una carta jamás abierta aparece entre libros viejos.", choices:["Leerla","Guardarla","Romperla"] },
  { title:"Capítulo 5 — La Llamada", scene:"2:13 AM. El teléfono vibra sobre tu pecho.", choices:["Responder","Ignorar","Escuchar en silencio"] },
  { title:"Capítulo 6 — Los Recuerdos", scene:"Fotografías flotan como piezas de un universo roto.", choices:["Guardar las felices","Eliminar las dolorosas","No tocar nada"] },
  { title:"Capítulo 7 — El Colibrí", scene:"Regresa. Esta vez no parece un ave: parece una señal.", choices:["Extender la mano","Mirarlo de lejos","Cerrar la cortina"] },
  { title:"Capítulo 8 — El Tren", scene:"La estación vacía respira neón y despedidas.", choices:["Subir al tren","Esperar","Irse"] },
  { title:"Capítulo 9 — Los Silencios", scene:"Él dice tu nombre. Después, silencio. Te toca llenarlo.", choices:["Hablar con honestidad","Responder con frialdad","Callar"] },
  { title:"Capítulo 10 — El Regreso", scene:"Da un paso hacia ti. El pasado también.", choices:["Acercarte","Retroceder","Preguntar por qué volvió"] },
  { title:"Capítulo 11 — El Miedo", scene:"Tu corazón late como si huyera de sí mismo.", choices:["Confiar","Huir","Mantener distancia"] },
  { title:"Capítulo 12 — La Verdad", scene:"Confesiones incompletas aparecen como luces en la niebla.", choices:["Escuchar todo","Pedir tiempo","Interrumpir"] },
  { title:"Capítulo 13 — El Universo", scene:"Un cielo estrellado desbloquea frases que solo ustedes entienden.", choices:["Leer cada estrella","Buscar solo una","Cerrar los ojos"] },
  { title:"Capítulo 14 — La Decisión Final", scene:"\"Si pudieras volver a elegir… ¿te quedarías?\"", choices:["Sí","No","No lo sé"] },
  { title:"Capítulo 15 — Final Cinematográfico", scene:"Todo converge aquí. Lo que callaste, lo que elegiste, lo que aún sientes.", choices:["Ver final"] }
];

let state = JSON.parse(localStorage.getItem(STORY_STORAGE_KEY) || "null") || {
  chapter: 0,
  decisions: [],
  aiLog: []
};

let emotionalProfile = JSON.parse(localStorage.getItem(EMOTIONAL_STORAGE_KEY) || "null") || {
  nostalgic: 0,
  distant: 0,
  affectionate: 0,
  avoidant: 0,
  hopeful: 0
};

function save(){
  localStorage.setItem(STORY_STORAGE_KEY, JSON.stringify(state));
  localStorage.setItem(EMOTIONAL_STORAGE_KEY, JSON.stringify(emotionalProfile));
}

function typeText(el, text, speed=32){ return new Promise(res=>{ el.textContent=""; let i=0; const t=setInterval(()=>{ el.textContent+=text[i]||""; if(++i>text.length){ clearInterval(t); res(); } }, speed); }); }

function updateEmotionalProfile(choice){
  const c = choice.toLowerCase();
  if (c.includes("recuerd") || c.includes("estrella") || c.includes("leer")) emotionalProfile.nostalgic++;
  if (c.includes("irse") || c.includes("retroced") || c.includes("frialdad")) emotionalProfile.distant++;
  if (c.includes("confiar") || c.includes("honest") || c.includes("acerc") || c.includes("responder")) emotionalProfile.affectionate++;
  if (c.includes("ignorar") || c.includes("callar") || c.includes("huir") || c.includes("distancia")) emotionalProfile.avoidant++;
  if (c.includes("esperar") || c.includes("sí") || c.includes("escuchar") || c.includes("volver")) emotionalProfile.hopeful++;
}

async function aiNarrative(chapter, choice){
  try {
    const response = await fetch("/.netlify/functions/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chapter: chapter.title,
        scene: chapter.scene,
        choice,
        emotionalProfile,
        decisions: state.decisions.slice(-8),
        recentResponses: state.aiLog.slice(-4)
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return "Hoy el destino se quedó sin voz, pero mi pecho todavía insiste en pronunciar tu nombre.";
    }

    return data?.text || "Entre la lluvia y el silencio, todavía encuentro una forma de esperarte.";
  } catch (_error) {
    return "La noche se quedó sin señal, pero no sin memoria: aún late lo que vivimos.";
  }
}

function renderChapter(){
  const idx = state.chapter;
  if(idx >= chapters.length) return renderEnding();
  const ch = chapters[idx];
  $("#chapterTitle").textContent = ch.title;
  $("#chapterProgress").style.width = `${(idx/chapters.length)*100}%`;
  $("#sceneBox").innerHTML = `<p>${ch.scene}</p>`;
  $("#aiBox").classList.add("d-none");
  const box = $("#choicesBox"); box.innerHTML="";
  ch.choices.forEach(choice=>{
    const b = document.createElement("button"); b.className="choice-btn"; b.textContent = choice;
    b.onclick = async ()=>{
      state.decisions.push({chapter:ch.title, choice});
      updateEmotionalProfile(choice);
      save();
      const ai = await aiNarrative(ch, choice);
      state.aiLog.push({chapter:ch.title, ai});
      save();
      $("#aiResponse").textContent = ai;
      $("#aiBox").classList.remove("d-none");
      setTimeout(()=>{ state.chapter++; save(); renderChapter(); }, 2600);
    };
    box.appendChild(b);
  });
}

async function renderEnding(){
  $("#storyScreen").classList.add("d-none");
  $("#endingScreen").classList.remove("d-none");
  const dynamic = emotionalProfile.distant > emotionalProfile.hopeful
    ? "Te vi alejarte muchas veces, y aun así nunca dejé de quedarme donde pudiera encontrarte."
    : "Si todavía miras hacia atrás, entonces quizá todavía exista un lugar para nosotros.";
  const lines = [
    "Probamos diferentes caminos…", "En algunos te quedabas.", "En otros te ibas.", "Pero en todos…", "yo seguía enamorándome de ti.",
    "Nunca dejé de amarte.", dynamic
  ].join("\n\n");
  await typeText($("#endingLines"), lines, 34);
  $("#editableBlock").classList.remove("d-none");
}

function initIntro(){
  const intro = ["Existen decisiones que parecen pequeñas…","Pero algunas cambian historias enteras.","¿Qué habría pasado si hubiéramos elegido distinto?"].join("\n\n");
  typeText($("#introText"), intro, 44);
}

function initFx(){
  const rain = $("#rainCanvas"), p = $("#particlesCanvas");
  const rc = rain.getContext("2d"), pc = p.getContext("2d");
  let drops=[], stars=[];
  function resize(){ rain.width=p.width=innerWidth; rain.height=p.height=innerHeight;
    drops=Array.from({length:180},()=>({x:Math.random()*rain.width,y:Math.random()*rain.height,l:8+Math.random()*16,v:3+Math.random()*5}));
    stars=Array.from({length:70},()=>({x:Math.random()*p.width,y:Math.random()*p.height,r:Math.random()*1.8,a:Math.random()})); }
  addEventListener("resize",resize); resize();
  (function loop(){
    rc.clearRect(0,0,rain.width,rain.height); pc.clearRect(0,0,p.width,p.height);
    drops.forEach(d=>{ rc.strokeStyle="rgba(160,190,255,.33)"; rc.beginPath(); rc.moveTo(d.x,d.y); rc.lineTo(d.x-2,d.y+d.l); rc.stroke(); d.y+=d.v; if(d.y>rain.height)d.y=-20; });
    stars.forEach(s=>{ pc.fillStyle=`rgba(210,220,255,${s.a})`; pc.beginPath(); pc.arc(s.x,s.y,s.r,0,6.28); pc.fill(); s.a += (Math.random()-.5)*.05; s.a=Math.max(.08,Math.min(.9,s.a)); });
    requestAnimationFrame(loop);
  })();
}

$("#startBtn").onclick = ()=>{
  $("#introScreen").classList.add("d-none"); $("#storyScreen").classList.remove("d-none");
  $("#bgm").volume=.33; $("#rainSfx").volume=.2; $("#bgm").play().catch(()=>{}); $("#rainSfx").play().catch(()=>{});
  renderChapter();
};
$("#restartBtn").onclick=()=>{ localStorage.removeItem(STORY_STORAGE_KEY); localStorage.removeItem(EMOTIONAL_STORAGE_KEY); location.reload(); };

initIntro();
initFx();
