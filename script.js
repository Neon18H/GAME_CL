const $=s=>document.querySelector(s);
const state=JSON.parse(localStorage.getItem('archivos_corazon')||'{"level":0,"fragments":[],"decision":""}');
const introLines=["Algunas personas desaparecen…","Pero ciertas emociones dejan rastros.","Has encontrado 15 archivos ocultos."];
const fragments=[];
const audio={bgm:$('#bgm'),tick:$('#tick'),ok:$('#ok')};

function save(){localStorage.setItem('archivos_corazon',JSON.stringify(state));}
function typeText(el,text,s=42,cb){el.textContent='';let i=0;const t=setInterval(()=>{el.textContent+=text[i]||'';audio.tick.currentTime=0;audio.tick.play().catch(()=>{});if(++i>text.length){clearInterval(t);cb&&cb();}},s)}
function done(msg){audio.ok.play().catch(()=>{});if(msg)fragments.push(msg);state.fragments=[...new Set(fragments.concat(state.fragments))];state.level++;save();setTimeout(render,700)}

function render(){const n=state.level;$('#levelName').textContent=`Archivo ${Math.min(n+1,15)} de 15`;$('#progress').style.width=`${(n/15)*100}%`;const s=$('#stage');s.innerHTML='';if(n>=15)return finalConfession();levels[n](s)}

const levels=[
(s)=>{s.innerHTML=`<div class='glass'>Chat recuperado: "Creo que nunca dejé de <input id='l1'/>" <button id='go1' class='btn btn-main btn-sm'>Reconstruir</button></div>`;$('#go1').onclick=()=>$('#l1').value.trim().toLowerCase()==='amarte'?done('Creo que nunca dejé de amarte.'):s.classList.add('glitch')},
(s)=>{s.innerHTML=`<p>Foto rota: arrastra en orden 1-2-3.</p><div class='d-flex gap-2' id='dz'></div><div class='puzzle-grid mt-3'>${[2,3,1].map(n=>`<div class='piece' draggable='true' data-v='${n}'>Pieza ${n}</div>`).join('')}</div>`;const dz=$('#dz');[1,2,3].forEach(()=>dz.innerHTML+=`<div class='dropzone'></div>`);let seq=[];document.querySelectorAll('.piece').forEach(p=>{p.ondragstart=e=>e.dataTransfer.setData('t',p.dataset.v)});document.querySelectorAll('.dropzone').forEach(d=>{d.ondragover=e=>e.preventDefault();d.ondrop=e=>{e.preventDefault();const v=e.dataTransfer.getData('t');d.textContent=v;seq.push(+v);if(seq.length===3&&seq.join('')==='123')done('En cada pixel, seguía tu nombre.')}})},
(s)=>{s.innerHTML=`<p>Audio oculto: activa fragmentos correctos.</p>${['to','da','vía','pienso','en','ti'].map((x,i)=>`<button class='btn btn-outline-light m-1 f' data-i='${i}'>${x}</button>`).join('')}<div id='out' class='mt-2'></div>`;const order=[0,1,2,3,4,5],hit=[];document.querySelectorAll('.f').forEach(b=>b.onclick=()=>{hit.push(+b.dataset.i);$('#out').textContent=hit.map(i=>order.includes(i)?['to','da','vía','pienso','en','ti'][i]:'').join(' ');if(hit.length===6&&hit.every((v,i)=>v===order[i]))done('Todavía pienso en ti.')})},
(s)=>{s.innerHTML=`<p>Constelación: conecta 5 estrellas.</p><div id='sky' style='height:260px;position:relative'></div>`;const sky=$('#sky');for(let i=0;i<5;i++){const st=document.createElement('div');st.className='star';st.style.left=(15+i*16)+'%';st.style.top=(20+Math.sin(i)*35)+'%';sky.appendChild(st)}let c=0;document.querySelectorAll('.star').forEach(st=>st.onclick=()=>{st.style.background='#ff7ea9';if(++c===5)done('Siempre terminaba regresando a ti.')})},
(s)=>{const items=['Lluvia en la ventana','Discusión ajena','Tu risa en el pasillo','Rostro desconocido'];s.innerHTML='<p>Elige 2 recuerdos verdaderos.</p>';items.forEach((t,i)=>s.innerHTML+=`<button class='btn btn-outline-light m-1 r' data-ok='${i===0||i===2}'>${t}</button>`);let ok=0;document.querySelectorAll('.r').forEach(b=>b.onclick=()=>{b.disabled=true;if(b.dataset.ok==='true'){ok++;b.className='btn btn-success m-1'}else b.remove();if(ok===2)done('No pude borrar lo real.')})},
(s)=>{s.innerHTML=`<p>Código del corazón:</p><pre>err_404.bin
love.tmp
__amarte__.key
lost.sig</pre><input id='c6' placeholder='archivo correcto'> <button id='b6' class='btn btn-main btn-sm'>Ejecutar</button>`;$('#b6').onclick=()=>$('#c6').value.includes('amarte')&&done('Clave emocional aceptada.')},
(s)=>{s.innerHTML=`<p style='transform:scaleX(-1)'>odatil ne euq ol odot erpmeis etiuq es oN</p><button id='mirror' class='btn btn-main'>Reflejar</button>`;$('#mirror').onclick=()=>done('No quise siempre todo lo que en ti latido.')},
(s)=>{s.innerHTML=`<p>Latidos: pulsa con ritmo 1-1-2.</p><button id='beat' class='btn btn-main'>♥</button><div id='btxt'></div>`;const seq=[];$('#beat').onclick=()=>{seq.push(Date.now());$('#btxt').textContent='♥ '.repeat(seq.length);if(seq.length===3)done('Mi corazón aún reacciona a ti.')}},
(s)=>{s.innerHTML=`<p>Decisión:</p><button class='btn btn-outline-light m-1 d' data-v='esperar'>Esperarte</button><button class='btn btn-outline-light m-1 d' data-v='buscar'>Buscarte</button>`;document.querySelectorAll('.d').forEach(b=>b.onclick=()=>{state.decision=b.dataset.v;done(state.decision==='buscar'?'Elegí buscarte otra vez.':'Me quedé esperando tu regreso.')})},
(s)=>{const arr=['cine','lluvia','carta','carta','sol','cine','lluvia','sol'];let open=[];s.innerHTML='<p>Memoria:</p><div class="memory-grid">'+arr.map((v,i)=>`<div class='mem-card' data-v='${v}' data-i='${i}'>?</div>`).join('')+'</div>';document.querySelectorAll('.mem-card').forEach(c=>c.onclick=()=>{if(c.textContent!=='?')return;c.textContent=c.dataset.v;open.push(c);if(open.length===2){if(open[0].dataset.v===open[1].dataset.v){open=[];if([...document.querySelectorAll('.mem-card')].every(x=>x.textContent!=='?'))done('Cada recuerdo tenía tu eco.')}else setTimeout(()=>{open.forEach(x=>x.textContent='?');open=[]},500)}})},
(s)=>{s.innerHTML=`<p>Ventana del colibrí: síguelo con el mouse.</p><div id='hunt' style='height:250px;position:relative'><div class='hummingbird' id='bird'></div></div>`;const bird=$('#bird');let x=30;setInterval(()=>{x=(x+22)%260;bird.style.left=x+'px';bird.style.top=(80+Math.sin(x/25)*70)+'px';},250);$('#hunt').onmousemove=e=>{const r=e.currentTarget.getBoundingClientRect();const bx=bird.offsetLeft,by=bird.offsetTop;if(Math.hypot(e.clientX-r.left-bx,e.clientY-r.top-by)<40)done('Te encontré en la misma ventana.')};},
(s)=>{const lines=['Perdón por callar','Nunca me fui del todo','Aún guardo tu voz'];s.innerHTML='<p>Carta digital: revela fragmentos.</p>'+lines.map((l,i)=>`<button class='btn btn-outline-light m-1 c12' data-t='${l}'>Fragmento ${i+1}</button>`).join('')+'<div id="out12" class="mt-2"></div>';let got=[];document.querySelectorAll('.c12').forEach(b=>b.onclick=()=>{got.push(b.dataset.t);b.disabled=true;$('#out12').innerHTML=got.join('<br>');if(got.length===3)done('La carta nunca dejó de escribirse.')})},
(s)=>{s.innerHTML=`<p>Rebobina el tiempo.</p><input id='time13' type='range' min='0' max='100' value='100' class='form-range'><div id='mem13'></div>`;$('#time13').oninput=e=>{const v=+e.target.value;$('#mem13').textContent=v<70?'Primer abrazo':v<40?'Risa compartida':v<15?'Promesa en voz baja':'';if(v<10)done('Todo era más simple contigo.')};},
(s)=>{s.innerHTML=`<p>Ilumina la habitación.</p><div class='flashlight' id='room'><div class='hidden-line' style='left:40px;top:70px'>Nunca te olvidé.</div><div class='hidden-line' style='left:210px;top:180px'>Siempre estuviste aquí.</div><div class='reveal' id='rv'></div></div>`;const room=$('#room'),rv=$('#rv');room.onmousemove=e=>{const r=room.getBoundingClientRect();rv.style.setProperty('--x',((e.clientX-r.left)/r.width*100)+'%');rv.style.setProperty('--y',((e.clientY-r.top)/r.height*100)+'%');if(e.clientX-r.left>200&&e.clientY-r.top>150)done('La verdad aún brillaba.')};},
(s)=>{s.innerHTML=`<p>Confesión final:</p><div class='float-words'>${state.fragments.slice(-8).map(f=>`<span>${f}</span>`).join('')}<span>Nunca</span><span>dejé</span><span>de</span><span>amarte</span></div><button id='close15' class='btn btn-main mt-3'>Unir todo</button>`;$('#close15').onclick=()=>done('Nunca dejé de amarte.')}
];

function finalConfession(){
  $('#experience').classList.add('d-none');$('#ending').classList.remove('d-none');
  const lines=["Quizás fui torpe…","Quizás llegué demasiado tarde…","Pero jamás dejé de sentirlo.","Nunca dejé de amarte."];
  let i=0;const box=$('#endingText');
  const next=()=>{if(i>=lines.length){$('#addressBlock').classList.remove('d-none');return;}typeText(box,box.textContent+(box.textContent?'\n\n':'')+lines[i],34,()=>setTimeout(next,650));i++};
  next();
}

$('#btnAccess').onclick=()=>{$('#intro').classList.add('d-none');$('#experience').classList.remove('d-none');audio.bgm.volume=.35;audio.bgm.play().catch(()=>{});render()};
$('#btnRestart').onclick=()=>{localStorage.removeItem('archivos_corazon');location.reload()};
$('#btnFinish').onclick=()=>$('#endingText').textContent+="\n\nArchivo cerrado.";

(function intro(){typeText($('#introType'),introLines.join('\n\n'),48)})();
(function bg(){const c=$('#bgFx'),x=c.getContext('2d');let p=[];const rs=()=>{c.width=innerWidth;c.height=innerHeight;p=Array.from({length:90},()=>({x:Math.random()*c.width,y:Math.random()*c.height,r:Math.random()*2+1,v:Math.random()*0.6+0.2}))};addEventListener('resize',rs);rs();(function loop(){x.clearRect(0,0,c.width,c.height);p.forEach(o=>{x.fillStyle='rgba(135,170,255,.45)';x.beginPath();x.arc(o.x,o.y,o.r,0,7);x.fill();o.y-=o.v;if(o.y<0)o.y=c.height});requestAnimationFrame(loop)})();})();
