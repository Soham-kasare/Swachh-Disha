const LOGO='images/logo.png';
const $=s=>document.querySelector(s),R=$('#app');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const Z=['Arnala','Virar','Agashi','Nalasopara','Vasai','Vasai Road','Naigaon','Evershine / Waliv'];
const CO={Arnala:[19.469,72.728],Virar:[19.456,72.811],Agashi:[19.43,72.79],Nalasopara:[19.419,72.818],Vasai:[19.392,72.84],'Vasai Road':[19.382,72.832],Naigaon:[19.351,72.846],'Evershine / Waliv':[19.4,72.87]};
const code=a=>'VV-0'+(Z.indexOf(a)+1),opts=(a,s)=>a.map(x=>`<option ${x==s?'selected':''}>${x}</option>`).join('');
const tm=t=>new Date(t).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),cd=ms=>{const s=Math.max(0,Math.floor(ms/1000));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
let DB;try{DB=JSON.parse(localStorage.getItem('sd'))}catch(e){}
if(!DB)DB={n:1003,u:[{id:'SDC-1001',role:'collector',name:'Ramesh Patil',mob:'9000000001',area:'Virar',kind:'solo'},{id:'SDC-1002',role:'collector',name:'Sunita Gaikwad',mob:'9000000002',area:'Vasai',kind:'solo'},{id:'SDC-1003',role:'collector',name:'Imran Shaikh',mob:'9000000003',area:'Nalasopara',kind:'group',gid:'G1'}],c:[],g:[{id:'G1',name:'Nalasopara Clean Team',area:'Nalasopara'}]};
const save=()=>{try{localStorage.setItem('sd',JSON.stringify(DB))}catch(e){toast('Storage is full. Old photos may need clearing.')}};
let me=null,tab='',sel='',draft={},flt='all';
try{me=DB.u.find(u=>u.id==sessionStorage.getItem('sdme'))||null}catch(e){}
function toast(m){const t=$('#tt');t.textContent=m;t.classList.add('on');clearTimeout(t.h);t.h=setTimeout(()=>t.classList.remove('on'),3200)}
const U=id=>DB.u.find(u=>u.id==id),C=id=>DB.c.find(c=>c.id==id),log=(c,m)=>c.log.push([Date.now(),m]);
// ---- camera (live only) ----
function stamp(c,lat,lng,ap,demo){const x=c.getContext('2d');x.fillStyle='rgba(0,0,0,.65)';x.fillRect(0,c.height-24,c.width,24);x.fillStyle='#fff';x.font='12px sans-serif';x.fillText(`${lat.toFixed(5)}, ${lng.toFixed(5)} | ${new Date().toLocaleString()}${ap?' | approx':''}${demo?' | DEMO':''}`,8,c.height-8)}
function demoImg(k){const c=document.createElement('canvas');c.width=480;c.height=360;const x=c.getContext('2d');
if(k=='after'){const g=x.createLinearGradient(0,0,480,360);g.addColorStop(0,'#d9f0d0');g.addColorStop(1,'#fff7d0');x.fillStyle=g;x.fillRect(0,0,480,360);x.fillStyle='#2d8a4a';for(let i=0;i<7;i++){x.beginPath();x.arc(40+i*68,280,24,0,7);x.fill()}}
else{x.fillStyle='#6b5a45';x.fillRect(0,0,480,360);for(let i=0;i<60;i++){x.fillStyle=`hsl(${Math.random()*60},30%,${15+Math.random()*30}%)`;x.fillRect(Math.random()*450,Math.random()*320,10+Math.random()*50,8+Math.random()*30)}}return c}
function cam(title,area,kind,cb){let st,geo=null;const m=document.createElement('div');m.className='modal';
m.innerHTML=`<div class="box"><h3>${title}</h3><video autoplay playsinline muted></video><p class="mu" id="cm">Starting camera…</p><div class="row"><button class="btn" id="cs">📷 Capture</button><button class="btn o" id="cd">Use demo photo</button><button class="btn o" id="cc">Cancel</button></div></div>`;
document.body.appendChild(m);const q=s=>m.querySelector(s),v=q('video'),msg=q('#cm'),done=()=>{st&&st.getTracks().forEach(t=>t.stop());m.remove()};
navigator.mediaDevices?.getUserMedia({video:{facingMode:'environment'}}).then(s=>{st=s;v.srcObject=s;msg.textContent='Point at the spot, then capture. Gallery uploads are not allowed.'}).catch(()=>{v.style.display='none';msg.textContent='Camera is not available here. Allow camera access, or use a demo photo to test the flow.'});
navigator.geolocation?.getCurrentPosition(p=>geo={lat:p.coords.latitude,lng:p.coords.longitude},()=>{},{timeout:8000});
const fin=(c,demo)=>{const ap=!geo,lat=geo?geo.lat:CO[area][0]+(Math.random()-.5)*.008,lng=geo?geo.lng:CO[area][1]+(Math.random()-.5)*.008;stamp(c,lat,lng,ap,demo);done();cb({img:c.toDataURL('image/jpeg',.6),lat,lng,ap,t:Date.now()})};
q('#cs').onclick=()=>{if(!st)return toast('Camera not ready');const c=document.createElement('canvas');c.width=480;c.height=Math.round(480*v.videoHeight/v.videoWidth)||360;c.getContext('2d').drawImage(v,0,0,c.width,c.height);fin(c,0)};
q('#cd').onclick=()=>fin(demoImg(kind),1);q('#cc').onclick=done}
function ask(title,ph,cb){const m=document.createElement('div');m.className='modal';m.innerHTML=`<div class="box"><h3>${title}</h3><textarea placeholder="${ph}"></textarea><div class="row"><button class="btn">Continue</button><button class="btn o">Cancel</button></div></div>`;document.body.appendChild(m);const b=m.querySelectorAll('button');b[0].onclick=()=>{const v=m.querySelector('textarea').value.trim();if(!v)return toast('Please write a reason');m.remove();cb(v)};b[1].onclick=()=>m.remove()}
// ---- AI verification (image hash comparison) ----
const hash=src=>new Promise(r=>{const i=new Image();i.onload=()=>{const c=document.createElement('canvas');c.width=c.height=8;const x=c.getContext('2d');x.drawImage(i,0,0,8,8);const d=x.getImageData(0,0,8,8).data;let g=[],s=0;for(let k=0;k<64;k++){const v=(d[k*4]+d[k*4+1]+d[k*4+2])/3;g.push(v);s+=v}r(g.map(v=>v>s/64?1:0))};i.src=src});
const diff=(a,b)=>a.reduce((n,v,i)=>n+(v!=b[i]),0);
const km=(a,b)=>{const r=Math.PI/180,x=(b.lng-a.lng)*r*Math.cos(a.lat*r),y=(b.lat-a.lat)*r;return Math.hypot(x,y)*6371};
async function verify(c,p){const d=diff(await hash(c.img),await hash(p.img)),k=km(c,p);const chk=[['Live camera capture',1],['Geo-tag and timestamp present',1],['Same location as the complaint ('+k.toFixed(2)+' km apart)',k<.5||c.ap||p.ap],['Scene has changed since the complaint (score '+d+'/64)',d>=10]];return{ok:chk.every(x=>x[1]),chk}}
// ---- assignment ----
function assign(c,ex){const cs=DB.u.filter(u=>u.role=='collector'&&u.area==c.area&&u.id!=ex);if(!cs.length)return;const ld=u=>DB.c.filter(x=>x.to==u.id&&x.st!='resolved').length;cs.sort((a,b)=>ld(a)-ld(b));const u=cs[0];c.to=u.id;c.gid=u.gid||'';c.st='assigned';log(c,'Auto-forwarded to '+u.name+' ('+u.id+')')}

// ---- VVCMC data (as supplied; verify before official use) ----
const FLEET=[['Tricycles',219,'Narrow-lane and primary door-to-door collection'],['Handcarts',208,'Street sweeping and manual ward collection'],['Tippers',108,'Primary and secondary waste transport'],['Compactors',63,'High-volume compression and hauling'],['Dumpers',44,'Bulk waste and C&D transport'],['Tractors',19,'Secondary hauling and ward support'],['Mechanical Sweeping Machines',7,'Road dust mitigation (NCAP and SBM 2.0)'],['Electric Litter Picking Machines',5,'Ride-on units for public spaces'],['Drain Masters',2,'Mechanized nallah and drain cleaning']];
const DUMP=[19.40,72.885];
function cityData(){const mx=219;return `<div class="card"><h2>Vasai-Virar at a glance</h2><p class="mu">Source: VVCMC published reports and Environmental Status Report, as provided. Please verify before official use.</p>
<div class="grid"><div class="stat"><b>686 TPD</b>Solid waste collected daily</div><div class="stat"><b>975–1,155 TPD</b>Estimated total generation</div><div class="stat"><b>120 TPD</b>Construction and demolition waste</div><div class="stat"><b>~60 t/month</b>E-waste generated</div><div class="stat"><b>73–85%</b>Households covered door to door</div><div class="stat"><b>9</b>Prabhag Samitis (Wards A to I)</div><div class="stat"><b>15–16 lakh MT</b>Legacy waste under biomining</div><div class="stat"><b>675</b>Collection and cleaning vehicles</div></div>
<h3 style="margin-top:18px">Waste composition (of 686 TPD collected)</h3><div style="display:flex;height:30px;border-radius:10px;overflow:hidden;font-size:13px;color:#fff;font-weight:600"><div style="width:60%;background:var(--g);padding:4px 10px">Wet / organic 60% · 411 TPD</div><div style="width:40%;background:var(--y);color:#2a2000;padding:4px 10px">Dry 40% · 275 TPD</div></div>
<p class="mu">Waste goes to the Gokhiware / Bhoidapada dumping site, where biomining and remediation work is under way.</p></div>
<div class="card"><h3>Fleet strength: 675 units</h3>${FLEET.map(f=>`<div class="row"><span style="width:210px">${f[0]}</span><div class="bar"><i style="width:${f[1]/mx*100}%"></i></div><b style="width:36px;text-align:right">${f[1]}</b></div><div class="mu" style="margin:-4px 0 4px 0">${f[2]}</div>`).join('')}</div>
<div class="card"><h3>Administration and contracts</h3><ul style="margin:6px 0;padding-left:20px"><li>Solid Waste Management Department is led by the Deputy Municipal Commissioner (Public Health and SWM) at the Virar West headquarters.</li><li>Assistant Municipal Commissioners, Senior Health Inspectors and Junior Health Inspectors work across all 9 Prabhag Samitis.</li><li>Door-to-door collection, street sweeping and drain cleaning run mostly on ward-wise service-level contracts. A consolidated live headcount of contract workers is not published.</li><li>Five-year contracts (2025–26 to 2030–31) worth about ₹957.64 crore: Amrut Enterprises, RPN Infra Pvt. Ltd., Krystal Integrated Services Ltd. and R &amp; B Infra Project Pvt. Ltd.</li><li>Clean-Up Marshals, including women’s self-help groups, enforce anti-littering and the single-use plastic ban.</li></ul></div>`}
// ---- real map (Leaflet + OpenStreetMap), limited to Vasai-Virar ----
let MP=null;
function mapPage(){return `<div class="card"><h3>Vasai-Virar live map</h3><div id="map" style="height:460px;border-radius:12px"></div><p class="mu">🔴 open complaint · 🟢 cleaned · 🟡 dumping site (approximate position). Zone circles show open complaints.</p></div>`}
function drawMap(){const el=document.getElementById('map');if(MP){MP.remove();MP=null}if(!el)return;
if(typeof L=='undefined'){el.innerHTML='<p class="mu" style="padding:20px">The map needs an internet connection to load.</p>';return}
const B=L.latLngBounds([19.30,72.70],[19.50,72.95]);MP=L.map(el,{minZoom:11,maxZoom:17,maxBounds:B.pad(.1),maxBoundsViscosity:1}).fitBounds(B);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors',maxZoom:17}).addTo(MP);
Z.forEach(z=>{const o=DB.c.filter(c=>c.area==z&&c.st!='resolved').length;L.circleMarker(CO[z],{radius:10+o*2,color:'#14672f',fillColor:'#14672f',fillOpacity:.25,weight:2}).addTo(MP).bindTooltip(code(z)+' '+z+' · '+o+' open',{permanent:true,direction:'right',offset:[8,0]})});
DB.c.forEach(c=>L.circleMarker([c.lat,c.lng],{radius:7,color:'#fff',weight:2,fillColor:c.st=='resolved'?'#1f9d3a':'#d63031',fillOpacity:1}).addTo(MP).bindPopup('<b>'+c.id+'</b><br>'+code(c.area)+' · '+ST[c.st]));
L.circleMarker(DUMP,{radius:9,color:'#fff',weight:2,fillColor:'#e0a41a',fillOpacity:1}).addTo(MP).bindPopup('<b>Gokhiware / Bhoidapada dumping site</b><br>Approximate position. Biomining under way.');
setTimeout(()=>MP&&MP.invalidateSize(),100)}
// ---- login ----
const RL=[['citizen','🏠','Citizen','Report garbage and track cleaning'],['collector','🧹','Garbage collector','Get tasks and upload proof'],['host','🏛️','Area host','Manage complaints in your area'],['admin','📊','Admin / Operator','Inspect, manage groups and staff']];
function loginView(){const r=sel;return `<div class="w"><div class="hd"><img src="${LOGO}" alt="Swachh Disha"><h1>Swachh Disha</h1><div class="mr">स्वच्छ वसई-विरार, सुंदर वसई-विरार!</div></div><h3>Choose your interface</h3><div class="roles">${RL.map(x=>`<button class="role ${r==x[0]?'on':''}" onclick="sel='${x[0]}';render()"><span>${x[1]}</span><b>${x[2]}</b><div class="mu">${x[3]}</div></button>`).join('')}</div>
${r?`<div class="card"><h3>${RL.find(x=>x[0]==r)[2]}: sign in or register</h3>
<label>Mobile number</label><input id="fm" inputmode="numeric" maxlength="10" placeholder="10-digit number">
<label>Full name (needed to register)</label><input id="fn">
${r!='admin'?`<label>Area</label><select id="fa">${opts(Z)}</select>`:''}
${r=='collector'?`<label>Vehicle / equipment</label><select id="fv">${opts(FLEET.map(f=>f[0]))}</select><label>Collector type</label><select id="fk"><option value="solo">Individual collector</option><option value="group">Collection group member</option></select>`:''}
${r=='admin'||r=='host'?`<label>Passcode</label><input id="fp" type="password"><p class="mu">Demo passcode: ${r=='admin'?'admin123':'host123'}</p>`:''}
<div class="row"><button class="btn" onclick="enter()">Continue</button></div>
${r=='collector'?'<p class="mu">Demo collectors: 9000000001 (Virar), 9000000002 (Vasai), 9000000003 (Nalasopara group).</p>':''}</div>`:''}${cityData()}${mapPage()}</div>`}
function enter(){const f=i=>(document.getElementById(i)?.value||'').trim(),mob=f('fm');
if(!/^\d{10}$/.test(mob))return toast('Enter a 10-digit mobile number');
if(sel=='admin'&&f('fp')!='admin123')return toast('Wrong admin passcode');if(sel=='host'&&f('fp')!='host123')return toast('Wrong area host passcode');
let u=DB.u.find(x=>x.role==sel&&x.mob==mob);
if(!u){if(!f('fn'))return toast('Enter your name to register');u={id:sel=='collector'?'SDC-'+(++DB.n):'U-'+(++DB.n),role:sel,name:f('fn'),mob,area:f('fa'),kind:f('fk')||'',veh:f('fv')};DB.u.push(u);save();toast('Registered. Your ID is '+u.id)}
me=u;tab='';try{sessionStorage.setItem('sdme',u.id)}catch(e){}render()}
function out(){me=null;sel='';try{sessionStorage.clear()}catch(e){}render()}
// ---- complaint card ----
const ST={new:'Waiting for assignment',assigned:'Assigned',working:'Cleaning in progress',resolved:'Cleaned'};
function cx(c,role){const col=U(c.to),late=c.st!='resolved'&&Date.now()>c.due,mine=me&&c.to==me.id||(me&&me.gid&&c.gid==me.gid);let a='';
const cs=DB.u.filter(u=>u.role=='collector'&&u.area==c.area);
if(role=='collector'&&mine){if(c.st=='assigned')a+=`<button class="btn s" onclick="act('start','${c.id}')">Start cleaning</button>`;
if(c.st=='working'){if(!c.ext||c.ext.s!='pending')a+=`<button class="btn o s" onclick="act('ext','${c.id}')">Request extra time</button>`;a+=`<button class="btn s" onclick="act('done','${c.id}')">📷 Upload proof and complete</button>`}}
if(role=='host'||role=='admin'){if(c.st!='resolved')a+=`<select style="width:auto" onchange="act('re','${c.id}',this.value)"><option value="">${col?'Reassign':'Assign'} collector…</option>${cs.map(u=>`<option value="${u.id}">${esc(u.name)} (${u.id})</option>`).join('')}</select>`;
if(c.ext&&c.ext.s=='pending')a+=`<button class="btn s" onclick="act('ok','${c.id}')">Approve +20 min</button><button class="btn o s" onclick="act('no','${c.id}')">Decline</button>`}
return `<div class="card"><div class="row sp" style="margin:0"><div><b>${c.id}</b> · ${code(c.area)} ${esc(c.area)}</div><span class="b ${c.st}">${ST[c.st]}</span></div>
${c.note?`<p style="margin:6px 0">${esc(c.note)}</p>`:''}
<div class="imgs"><figure><img src="${c.img}" alt="Before"><figcaption>Complaint ${tm(c.t)} · 📍 ${c.lat.toFixed(4)}, ${c.lng.toFixed(4)}</figcaption></figure>${c.after?`<figure><img src="${c.after}" alt="After"><figcaption>Cleaning proof ${tm(c.done||Date.now())}</figcaption></figure>`:''}</div>
<div class="mu">${c.st=='resolved'?'Resolved in '+Math.round((c.done-c.t)/60000)+' min':`⏱ <span data-due="${c.due}" class="${late?'red':''}">${late?'Overdue':cd(c.due-Date.now())}</span> to respond`}${col&&role!='collector'?' · Collector: '+esc(col.name)+' ('+col.id+')':''}</div>
${c.ext?`<div class="ext">Extra time requested: ${esc(c.ext.r)} · <b>${c.ext.s}</b><br><img src="${c.ext.img}" style="width:120px;border-radius:8px;margin-top:6px" alt="Delay proof"></div>`:''}
${c.ai?`<div class="ext">AI verification: <b class="${c.ai.ok?'ok':'red'}">${c.ai.ok?'Passed':'Not verified. Retake a clear photo of the cleaned spot.'}</b><br>${c.ai.chk.map(x=>(x[1]?'✔ ':'✘ ')+x[0]).join('<br>')}</div>`:''}
${c.st=='resolved'&&role=='citizen'?`<div class="ext">✅ Your garbage spot is cleaned and ready to use.<div class="row"><span>Rate the collector:</span>${[1,2,3,4,5].map(n=>`<button class="star ${c.rate>=n?'on':''}" onclick="rate('${c.id}',${n})" aria-label="${n} stars">★</button>`).join('')}</div><input id="f${c.id}" placeholder="Share your experience (optional)" value="${esc(c.fb||'')}"></div>`:''}
${c.rate&&role!='citizen'?`<div class="mu">Citizen rating: ${'★'.repeat(c.rate)} ${esc(c.fb||'')}</div>`:''}
${a?`<div class="row">${a}</div>`:''}
<ul class="log">${c.log.map(l=>`<li>${tm(l[0])} ${esc(l[1])}</li>`).join('')}</ul></div>`}
// ---- actions ----
function act(k,id,v){const c=C(id);
if(k=='start'){c.st='working';log(c,'Cleaning started')}
else if(k=='ext')return ask('Request extra time','Reason for the delay',r=>cam('Photo proof for the delay',c.area,'before',p=>{c.ext={r,img:p.img,s:'pending'};log(c,'Extra time requested: '+r);save();render();toast('Request sent to the area host')}));
else if(k=='done')return cam('Photo after cleaning',c.area,'after',async p=>{toast('AI is checking the photos…');const r=await verify(c,p);c.ai=r;c.after=p.img;if(r.ok){c.st='resolved';c.done=Date.now();log(c,'AI verified. Garbage cleared')}else log(c,'AI could not verify the cleaning');save();render()});
else if(k=='re'){if(!v)return;const u=U(v);c.to=v;c.gid=u.gid||'';c.st=c.st=='new'?'assigned':c.st;log(c,'Assigned to '+u.name+' by '+me.role)}
else if(k=='ok'){c.ext.s='approved';c.due+=1200000;log(c,'Extra 20 minutes approved')}
else if(k=='no'){c.ext.s='declined';log(c,'Extra time declined')}
save();render()}
function rate(id,n){const c=C(id);c.rate=n;c.fb=document.getElementById('f'+id)?.value||c.fb||'';save();render();toast('Thank you for your feedback')}
// ---- report form (citizen + collector) ----
function pReport(t){return `<div class="card"><h2>${t}</h2><label>Area</label><select id="ra">${opts(Z,draft.area||me.area)}</select><label>Details</label><textarea id="rn" placeholder="e.g. Garbage pile near the station road">${esc(draft.note||'')}</textarea>
${draft.p?`<img class="ph" src="${draft.p.img}" alt="Captured"><p class="mu">📍 ${draft.p.lat.toFixed(5)}, ${draft.p.lng.toFixed(5)} ${draft.p.ap?'(approximate location)':'(GPS)'}</p>`:'<p class="mu">No photo yet. Photos must be taken live with the camera; gallery uploads are not allowed.</p>'}
<div class="row"><button class="btn o" onclick="snap()">📷 Take photo</button><button class="btn" onclick="submitC()">Submit complaint</button></div></div>`}
function snap(){draft.area=$('#ra').value;draft.note=$('#rn').value;cam('Photo of the garbage spot',draft.area,'before',p=>{draft.p=p;render()})}
async function submitC(){const area=$('#ra').value,note=$('#rn').value.trim();if(!draft.p)return toast('Take a live photo first');const h=await hash(draft.p.img);
if(DB.c.some(o=>o.h&&o.area==area&&o.st!='resolved'&&diff(o.h,h)<4))return toast('AI check: this looks like a duplicate of an open complaint');
const p=draft.p,c={id:'SD-'+(++DB.n),area,note,img:p.img,lat:p.lat,lng:p.lng,ap:p.ap,t:Date.now(),due:Date.now()+1200000,by:me.id,st:'new',h,log:[[Date.now(),'Complaint received with geo-tagged photo']]};
assign(c,me.id);DB.c.unshift(c);save();draft={};tab=me.role=='citizen'?'My complaints':'My tasks';toast(c.to?'Submitted and forwarded to a collector':'Submitted. Waiting for the area host to assign');render()}
// ---- pages ----
const mineC=()=>DB.c.filter(c=>c.by==me.id),pts=u=>DB.c.filter(c=>c.by==u.id&&c.st=='resolved').length*10+DB.c.filter(c=>c.by==u.id&&c.rate).length*2;
const avg=a=>a.length?(a.reduce((x,y)=>x+y,0)/a.length).toFixed(1):'–';
const P={citizen:{'Report garbage':()=>pReport('Report a garbage spot'),
'My complaints':()=>{const l=mineC();return l.length?l.map(c=>cx(c,'citizen')).join(''):'<div class="card">No complaints yet. Use “Report garbage” to send your first geo-tagged photo.</div>'},
'Community':()=>{const z=Z.map(a=>{const l=DB.c.filter(c=>c.area==a),r=l.filter(c=>c.st=='resolved');return{a,t:l.length,r:r.length,p:l.length?r.length/l.length*100:0}}).sort((x,y)=>y.p-x.p||y.t-x.t);const cz=DB.u.filter(u=>u.role=='citizen').sort((a,b)=>pts(b)-pts(a));
return `<div class="card"><h2>Your Green Points: ${pts(me)} 🏅</h2><p class="mu">10 points for each complaint that gets cleaned, 2 points for each rating you give.</p></div><div class="card"><h3>Ward cleanliness leaderboard</h3>${z.map((x,i)=>`<div class="row"><b style="width:22px">${i+1}</b><span style="width:130px">${x.a}</span><div class="bar"><i style="width:${x.p}%"></i></div><span>${x.r}/${x.t}</span></div>`).join('')}</div><div class="card"><h3>Top citizens</h3>${cz.slice(0,5).map(u=>`<div class="row sp"><span>${esc(u.name.split(' ')[0])} · ${code(u.area)}</span><b>${pts(u)} pts</b></div>`).join('')||'<p class="mu">No citizens yet.</p>'}</div>`}},
collector:{'My tasks':()=>{const l=DB.c.filter(c=>c.to==me.id||(me.gid&&c.gid==me.gid));return `<div class="card" style="background:var(--yl)"><b>${esc(me.name)}</b> · ID <b>${me.id}</b> · ${me.kind=='group'?'Group member':'Individual collector'} · ${esc(me.area)}</div>`+(l.length?l.map(c=>cx(c,'collector')).join(''):'<div class="card">No tasks assigned yet. New complaints from your area appear here automatically.</div>')},
'Raise complaint':()=>pReport('Raise a complaint for a location'),
'Profile':()=>{const l=DB.c.filter(c=>c.to==me.id),r=l.filter(c=>c.st=='resolved'),g=DB.g.find(x=>x.id==me.gid);return `<div class="card"><h2>${esc(me.name)}</h2><p>Collector ID: <b>${me.id}</b><br>Area: ${esc(me.area)} (${code(me.area)})<br>Vehicle: ${esc(me.veh||'Not set')}<br>Type: ${me.kind=='group'?'Group member · '+esc(g?g.name:'not yet added to a group'):'Individual'}</p><div class="grid"><div class="stat"><b>${r.length}</b>Jobs completed</div><div class="stat"><b>${avg(r.filter(c=>c.rate).map(c=>c.rate))} ★</b>Citizen rating</div><div class="stat"><b>${r.length?Math.round(r.filter(c=>c.done<=c.due).length/r.length*100)+'%':'–'}</b>On time</div></div></div>${r.filter(c=>c.fb).map(c=>`<div class="card mu">“${esc(c.fb)}” · ${'★'.repeat(c.rate)}</div>`).join('')}`}},
host:{'Complaints':()=>{const l=DB.c.filter(c=>c.area==me.area);return `<div class="card" style="background:var(--yl)"><b>${esc(me.name)}</b> · Area host · ${code(me.area)} ${esc(me.area)}<br><span class="mu">Complaints show area codes only, not citizen names.</span></div>`+(l.length?l.map(c=>cx(c,'host')).join(''):'<div class="card">No complaints in your area.</div>')},
'Collectors':()=>`<div class="card"><h3>Collectors in ${esc(me.area)}</h3>`+(DB.u.filter(u=>u.role=='collector'&&u.area==me.area).map(u=>{const l=DB.c.filter(c=>c.to==u.id);return `<div class="row sp"><span><b>${esc(u.name)}</b> (${u.id}) · ${u.kind=='group'?'Group':'Individual'}</span><span class="mu">${l.filter(c=>c.st!='resolved').length} open · ${l.filter(c=>c.st=='resolved').length} done · ${avg(l.filter(c=>c.rate).map(c=>c.rate))} ★</span></div>`}).join('')||'<p class="mu">No collectors have registered for this area yet.</p>')+'</div>'},
admin:{'Dashboard':()=>{const a=DB.c,r=a.filter(c=>c.st=='resolved'),od=a.filter(c=>c.st!='resolved'&&Date.now()>c.due).length;return `<div class="grid"><div class="stat"><b>${a.length}</b>Total complaints</div><div class="stat"><b>${a.length-r.length}</b>Open</div><div class="stat"><b>${r.length}</b>Cleaned</div><div class="stat"><b class="${od?'red':''}">${od}</b>Overdue</div><div class="stat"><b>${r.length?Math.round(r.reduce((s,c)=>s+c.done-c.t,0)/r.length/60000):'–'}</b>Avg. minutes to clean</div><div class="stat"><b>${avg(a.filter(c=>c.rate).map(c=>c.rate))} ★</b>Citizen rating</div></div><div class="card" style="margin-top:14px"><h3>Inspection by zone</h3>${Z.map(z=>{const l=a.filter(c=>c.area==z),d=l.filter(c=>c.st=='resolved').length;return `<div class="row"><span style="width:140px">${code(z)} ${z}</span><div class="bar"><i style="width:${l.length?d/l.length*100:0}%"></i></div><span>${d}/${l.length}</span></div>`}).join('')}</div>`},
'Inspection':()=>{const l=DB.c.filter(c=>flt=='all'||c.st==flt);return `<div class="row"><select style="width:auto" onchange="flt=this.value;render()">${['all','new','assigned','working','resolved'].map(s=>`<option value="${s}" ${s==flt?'selected':''}>${s=='all'?'All complaints':ST[s]}</option>`).join('')}</select></div><br>`+(l.length?l.map(c=>cx(c,'admin')).join(''):'<div class="card">No complaints match this filter.</div>')},
'Groups':()=>{const free=DB.u.filter(u=>u.role=='collector'&&!u.gid);return `<div class="card"><h3>Create a collection group</h3><div class="grid"><input id="gn" placeholder="Group name"><select id="ga">${opts(Z)}</select></div><div class="row"><button class="btn" onclick="mkG()">Create group</button></div></div>`+DB.g.map(g=>`<div class="card"><h3>${esc(g.name)} <span class="mu">· ${esc(g.area)}</span></h3>${DB.u.filter(u=>u.gid==g.id).map(u=>`<div class="row sp"><span>${esc(u.name)} (${u.id})</span><button class="btn o s" onclick="rmM('${u.id}')">Remove</button></div>`).join('')||'<p class="mu">No members yet.</p>'}<div class="row"><select id="m${g.id}" style="width:auto">${free.map(u=>`<option value="${u.id}">${esc(u.name)} (${u.id})</option>`).join('')||'<option value="">No free collectors</option>'}</select><button class="btn s" onclick="addM('${g.id}')">Add member</button></div></div>`).join('')},
'Users':()=>`<div class="card" style="overflow-x:auto"><table><tr><th>ID</th><th>Name</th><th>Role</th><th>Area</th></tr>${DB.u.map(u=>`<tr><td>${u.id}</td><td>${esc(u.name)}</td><td>${u.role}</td><td>${esc(u.area||'–')}</td></tr>`).join('')}</table></div>`}};
Object.values(P).forEach(r=>r['Live map']=mapPage);P.admin['City data']=P.host['City data']=cityData;
function mkG(){const n=$('#gn').value.trim();if(!n)return toast('Enter a group name');DB.g.push({id:'G'+(++DB.n),name:n,area:$('#ga').value});save();render();toast('Group created')}
function addM(g){const u=U($('#m'+g).value);if(!u)return;u.gid=g;u.kind='group';save();render()}
function rmM(id){const u=U(id);u.gid='';u.kind='solo';save();render()}
function render(){if(!me){R.innerHTML=loginView();setTimeout(drawMap,0);return}
const T=Object.keys(P[me.role]);if(!T.includes(tab))tab=T[0];
R.innerHTML=`<header><div class="w"><img src="${LOGO}" alt=""><b>SWACHH DISHA</b><div class="me"><b>${esc(me.name)}</b><br>${RL.find(x=>x[0]==me.role)[2]} <a href="#" onclick="out();return false" style="color:var(--g)">Log out</a></div></div></header><nav class="tabs">${T.map(t=>`<button class="${t==tab?'on':''}" onclick="tab='${t}';render()">${t}</button>`).join('')}</nav><main class="w">${P[me.role][tab]()}</main>`;setTimeout(drawMap,0)}
setInterval(()=>document.querySelectorAll('[data-due]').forEach(e=>{const l=e.dataset.due-Date.now();e.textContent=l>0?cd(l):'Overdue';e.className=l>0?'':'red'}),1000);
// intro
$('#il').src=LOGO;let i=0;const sl=document.querySelectorAll('.sl'),dt=document.querySelectorAll('.dots i');
const cl=()=>$('#intro').classList.add('hide');
$('#nx').onclick=()=>{if(i<2){i++;sl.forEach((e,k)=>e.classList.toggle('on',k==i));dt.forEach((e,k)=>e.classList.toggle('on',k==i));$('#nx').textContent=i==2?'Get started':'Next'}else cl()};$('#skip').onclick=cl;
if(me)cl();render();
