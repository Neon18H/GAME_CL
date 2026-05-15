const $ = (s) => document.querySelector(s);
const STORAGE_KEY = "volver_state_v1";
const API_KEY_STORAGE = "volver_openrouter_key";

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

let state = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") || {
  chapter: 0, decisions: [], memory:{se_aleja:0, evita:0, se_queda:0, carino:0, ignora:0, nostalgia:0}, aiLog:[]
};

function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function typeText(el, text, speed=32){ return new Promise(res=>{ el.textContent=""; let i=0; const t=setInterval(()=>{ el.textContent+=text[i]||""; if(++i>text.length){ clearInterval(t); res(); } }, speed); }); }

function updateMemory(choice){
  const m = state.memory;
  const c = choice.toLowerCase();
  if(c.includes("irse")||c.includes("huir")) m.se_aleja++;
  if(c.includes("ignorar")||c.includes("callar")) {m.evita++;m.ignora++;}
  if(c.includes("esperar")||c.includes("sí")||c.includes("acerc")) m.se_queda++;
  if(c.includes("honest")||c.includes("confiar")||c.includes("responder")) m.carino++;
  if(c.includes("recuerd")||c.includes("estrella")||c.includes("leer")) m.nostalgia++;
}

async function aiNarrative(chapter, choice){
  const key = localStorage.getItem(API_KEY_STORAGE);
  if(!key){
    return `No hay API key configurada. Tu elección fue: "${choice}". Aun así, el aire susurra: quizá una parte de ti nunca quiso irse.`;
  }
  const prompt = `Eres un guionista romántico y cinematográfico. Responde en español con 3-4 líneas emotivas, naturales y profundas.\nCapítulo: ${chapter.title}\nEscena: ${chapter.scene}\nElección: ${choice}\nMemoria emocional acumulada: ${JSON.stringify(state.memory)}\nUsa la memoria para personalizar confesión.`;
  try{
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":`Bearer ${key}`},
      body: JSON.stringify({ model:"deepseek/deepseek-chat-v3.1", messages:[{role:"system",content:"Escribe como una película romántica interactiva."},{role:"user",content:prompt}], temperature:0.9 })
    });
    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content?.trim();
    return text || "La noche tiembla, pero tu historia aún respira.";
  }catch(e){
    return "La conexión con la IA falló, pero la lluvia sigue escribiendo por ustedes.";
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
      state.decisions.push({chapter:ch.title,choice}); updateMemory(choice);
      save();
      const ai = await aiNarrative(ch, choice);
      state.aiLog.push({chapter:ch.title, ai}); save();
      $("#aiResponse").textContent = ai; $("#aiBox").classList.remove("d-none");
      setTimeout(()=>{ state.chapter++; save(); renderChapter(); }, 2600);
    };
    box.appendChild(b);
  });
}

async function renderEnding(){
  $("#storyScreen").classList.add("d-none");
  $("#endingScreen").classList.remove("d-none");
  const m = state.memory;
  const dynamic = m.se_aleja > m.se_queda
    ? "Aunque siempre terminabas alejándote… yo seguía esperándote."
    : "Tal vez una parte de ti tampoco quería irse.";
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
$("#restartBtn").onclick=()=>{ localStorage.removeItem(STORAGE_KEY); location.reload(); };
$("#saveApiBtn").onclick=()=>{ localStorage.setItem(API_KEY_STORAGE, $("#apiKeyInput").value.trim()); };

initIntro();
initFx();
