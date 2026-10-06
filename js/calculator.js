(function(){
const C=SOLAR_CONFIG,E=SolarEngine,L=C.L,app=$("#app"),dlg=$("#dlg");
const HELP={ongrid:["On-Grid","ต่อกับไฟการไฟฟ้า ไม่มี Battery ลดค่าไฟเป็นหลัก ระบบทั่วไปจะไม่จ่ายไฟตอนกริดดับ"],
 hybrid:["Hybrid","Solar + Battery เพิ่มสัดส่วนการใช้ไฟจากแสงอาทิตย์เอง และอาจสำรองไฟได้ตามอุปกรณ์และการออกแบบ"],
 backup:["Backup-focused","เน้นสำรองไฟวงจรสำคัญเมื่อไฟดับ ไม่ได้หมายความว่าทั้งบ้านจะมีไฟเสมอ"],
 kwp:["kWp กับ kWh","kWp คือกำลังติดตั้งของแผง ส่วน kWh คือพลังงานที่ผลิตหรือใช้จริง (หน่วยไฟ)"],
 payback:["ระยะคืนทุน","เป็นประมาณการอย่างง่าย = เงินลงทุน ÷ ผลประโยชน์ต่อปี ไม่ใช่การรับประกัน"],
 battery:["Battery","Battery ไม่จำเป็นสำหรับทุกบ้าน เหมาะเมื่อใช้ไฟกลางคืนมากหรือต้องการไฟสำรอง ขนาดที่แสดงเป็นค่าประมาณ ไม่ใช่การออกแบบวิศวกรรม"],
 why:["ทำไมระบบนี้","ระบบเลือกขนาดที่ได้คะแนนรวมสูงสุดจากงบ ผลประหยัด ระยะคืนทุน การใช้ไฟ และเป้าหมายของคุณ"]};
const opt=o=>Object.entries(o).map(([k,v])=>[k,v]);
const U=[["unknown","ไม่ทราบ"]];
const STEPS=[
 {t:"พื้นที่ติดตั้ง",d:"ใช้ประมาณปริมาณแสงแดดในพื้นที่ ไม่ต้องระบุที่อยู่",f:[
  {k:"province",l:"จังหวัด",type:"select",o:U.concat(C.provinces.map(p=>[p,p]))}]},
 {t:"ค่าไฟฟ้า",d:"ดูได้จากบิลค่าไฟ ถ้าไม่แน่ใจ ประมาณค่าเฉลี่ยก็ได้",f:[
  {k:"bill",l:"ค่าไฟเฉลี่ยต่อเดือน (บาท)",type:"num",ph:"เช่น 3500"},
  {k:"billUnknown",type:"chk",cl:"ไม่ทราบ (ใช้ค่าสมมติ 3,000 บาท/เดือน)"},
  {k:"kwh",l:"หน่วยไฟต่อเดือน (kWh) ถ้ามี",type:"num",ph:"ไม่บังคับ",h:"kwp"},
  {k:"billType",l:"ประเภทบิล",type:"select",o:[["home","บ้านพักอาศัย"],["other","อื่น ๆ"]],n:"ถ้าไม่ใช่บ้านพักอาศัย ค่าไฟต่อหน่วยอาจต่างจากที่ระบบสมมติ"}]},
 {t:"พฤติกรรมการใช้ไฟ",d:"ช่วยประเมินว่าใช้ไฟจากแผงโดยตรงได้มากแค่ไหน",f:[
  {k:"presence",l:"มีคนอยู่บ้านตอนกลางวันไหม",type:"cards",o:opt(L.presence)},
  {k:"peaks",l:"ช่วงที่ใช้ไฟมาก (เลือกได้หลายข้อ)",type:"multi",o:opt(L.peaks)},
  {k:"loads",l:"อุปกรณ์ที่มี",type:"multi",o:opt(L.loads)}]},
 {t:"หลังคาและพื้นที่",d:"ตอบเท่าที่รู้ ข้อไหนไม่ทราบเลือก 'ไม่ทราบ' ได้",f:[
  {k:"roofType",l:"ประเภทหลังคา",type:"select",o:U.concat([["tile","กระเบื้อง"],["metal","Metal Sheet"],["concrete","คอนกรีต"],["other","อื่น ๆ"]])},
  {k:"orient",l:"ทิศที่หลังคาหันไป",type:"select",o:U.concat(["N","NE","E","SE","S","SW","W","NW"].map(x=>[x,x]))},
  {k:"shade",l:"เงาบังหลังคา",type:"select",o:U.concat([["none","ไม่มี"],["some","บางช่วง"],["heavy","มาก"]])},
  {k:"roofArea",l:"พื้นที่หลังคาที่ใช้ได้ (ตร.ม.) ถ้าทราบ",type:"num",ph:"ไม่บังคับ"}]},
 {t:"เป้าหมาย",d:"เลือกได้หลายข้อ",f:[{k:"goals",type:"multi",o:opt(L.goals)}]},
 {t:"รูปแบบระบบ",d:"ยังไม่แน่ใจก็เลือกได้ ระบบจะแนะนำให้",f:[
  {k:"pref",type:"cards",o:[["ongrid","On-Grid","ลดค่าไฟ ไม่มี Battery"],["hybrid","Hybrid","Solar + Battery"],["backup","Backup-focused","เน้นไฟสำรอง"],["unsure","ยังไม่แน่ใจ","ให้ระบบแนะนำ"]],h:"ongrid",n:"กด ℹ เพื่ออ่านคำอธิบายแต่ละแบบ (On-Grid / Hybrid / Backup)"}]},
 {t:"งบประมาณ",d:"ปรับแล้วดูผลต่างได้อีกในหน้าผลลัพธ์",f:[
  {k:"priority",l:"คุณให้ความสำคัญกับอะไรมากกว่า",type:"scale"},
  {k:"budgetCap",l:"งบสูงสุด (บาท) ถ้ามี",type:"num",ph:"ไม่บังคับ เว้นว่าง = ไม่ทราบ"}]}];
const def={province:"unknown",presence:"some",peaks:["day"],loads:[],roofType:"unknown",orient:"unknown",shade:"unknown",goals:["reduce"],pref:"unsure",priority:3,billType:"home"};
let S=Object.assign({},def,LS.get("sc_state",{})),step=LS.get("sc_step",0),t0=Date.now(),done=false;
const qb=new URLSearchParams(location.search).get("bill");if(qb&&!S.bill){S.bill=+qb;step=0}
const save=()=>{LS.set("sc_state",S);LS.set("sc_step",step)};
function fld(f){
 const v=S[f.k],h=f.h?` <button type="button" class="i" data-h="${f.h}" aria-label="อธิบาย ${f.h}">ℹ</button>`:"";let c="";
 if(f.type==="select")c=`<select id="${f.k}" data-k="${f.k}">${f.o.map(o=>`<option value="${o[0]}"${v==o[0]?" selected":""}>${o[1]}</option>`).join("")}</select>`;
 else if(f.type==="num")c=`<input id="${f.k}" data-k="${f.k}" type="number" inputmode="decimal" min="0" value="${v??""}" placeholder="${f.ph||""}">`;
 else if(f.type==="chk")c=`<label class="chk"><input type="checkbox" data-k="${f.k}"${v?" checked":""}> ${f.cl}</label>`;
 else if(f.type==="multi")c=`<div class="opts" role="group" aria-label="${f.l||f.k}">${f.o.map(o=>`<label class="opt"><input type="checkbox" data-m="${f.k}" value="${o[0]}"${(v||[]).includes(o[0])?" checked":""}><span>${o[1]}</span></label>`).join("")}</div>`;
 else if(f.type==="cards")c=`<div class="opts" role="radiogroup" aria-label="${f.l||f.k}">${f.o.map(o=>`<label class="opt"><input type="radio" name="${f.k}" data-k="${f.k}" value="${o[0]}"${v==o[0]?" checked":""}><span>${o[1]}${o[2]?`<small>${o[2]}</small>`:""}</span></label>`).join("")}</div>`;
 else if(f.type==="scale")c=`<input id="${f.k}" data-k="${f.k}" type="range" min="1" max="5" step="1" value="${v}"><div class="sc"><span>1 ประหยัดเงิน</span><span>5 ลดค่าไฟมากที่สุด</span></div>`;
 return `<div class="field">${f.l?`<label for="${f.k}">${f.l}${h}</label>`:h}${c}${f.n?`<p class="note">${f.n}</p>`:""}<p class="err" id="e_${f.k}" role="alert"></p></div>`;
}
function show(n){
 step=n;save();const s=STEPS[n],pct=Math.round(n/7*100);
 app.innerHTML=`<p class="note" aria-live="polite">ขั้นที่ ${n+1} จาก 7 (ประมาณ ${pct}%)</p><div class="prog" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><div style="width:${pct||4}%"></div></div>
 <h1 style="font-size:1.7rem">${s.t}</h1><p class="note">${s.d}</p><div class="card">${s.f.map(fld).join("")}</div>
 <div class="nav"><button class="btn g" id="bk"${n?"":" disabled"}>ย้อนกลับ</button><button class="btn" id="nx">${n==6?"ดูผลลัพธ์":"ถัดไป"}</button></div>`;
 if(!sessionStorage.getItem("sc_started")){sessionStorage.setItem("sc_started","1");track("calculator_start",{session_id:SID,source:document.referrer?"referral":"direct",landing_page:location.pathname})}
 track("calculator_step_view",{session_id:SID,step_number:n+1});t0=Date.now();window.scrollTo(0,0);
}
function valid(n){
 if(n===1&&!S.billUnknown&&!(+S.bill>0)){$("#e_bill").textContent="ใส่ค่าไฟต่อเดือน หรือติ๊ก 'ไม่ทราบ'";return false}
 return true}
app.addEventListener("click",e=>{
 const i=e.target.closest(".i");if(i){help(i.dataset.h);return}
 if(e.target.id==="bk")show(step-1);
 if(e.target.id==="nx"){
  if(!valid(step)){track("calculator_step_error",{session_id:SID,step_number:step+1,error_type:"required_missing"});return}
  track("calculator_step_complete",{session_id:SID,step_number:step+1,completion_ms:Date.now()-t0});
  step<6?show(step+1):results();}
});
app.addEventListener("input",e=>{
 const t=e.target;if(t.dataset.k){let v=t.type==="checkbox"?t.checked:t.type==="number"||t.type==="range"?(t.value===""?"":+t.value):t.value;S[t.dataset.k]=v;
  if(t.dataset.k==="priority")track("budget_priority_change",{session_id:SID,value_1_to_5:v});$("#e_"+t.dataset.k)&&($("#e_"+t.dataset.k).textContent="")}
 else if(t.dataset.m){S[t.dataset.m]=[...app.querySelectorAll(`[data-m="${t.dataset.m}"]:checked`)].map(x=>x.value)}
 save()});
function help(k,html){if(k==="battery")track("battery_info_view",{session_id:SID});const h=HELP[k]||["",""];$("#dh").textContent=h[0]||k;$("#db").innerHTML=html||h[1];dlg.showModal();
 if(["ongrid","hybrid","backup"].includes(k)){$("#db").innerHTML=["ongrid","hybrid","backup"].map(x=>`<p><b>${HELP[x][0]}</b><br>${HELP[x][1]}</p>`).join("");track("system_info_open",{session_id:SID,system_type:k})}}
$("#dc").onclick=()=>dlg.close();
const pb=s=>s.paybackRange[0]==null||s.paybackRange[1]==null?"ไม่สามารถประเมินได้จากข้อมูลนี้":s.paybackRange[0].toFixed(1)+"–"+s.paybackRange[1].toFixed(1)+" ปี";
const card=(k,t,s,best,sel)=>`<article class="scn${best?" best":""}${sel?" sel":""}" data-s="${k}" tabindex="0" role="button" aria-pressed="${!!sel}"><h3>${t}${best?'<span class="tag">แนะนำ</span>':""}</h3><p class="big">${s.S} kWp</p><dl>
<dt>ราคาติดตั้งโดยประมาณ</dt><dd>${rng(s.cost[0],s.cost[2])} บาท</dd><dt>ผลิตไฟต่อปี</dt><dd>${rng(s.gen[0],s.gen[2])} หน่วย</dd>
<dt>ผลประโยชน์ต่อปี</dt><dd>${rng(s.benefit[0],s.benefit[2])} บาท</dd><dt>คืนทุน</dt><dd>${pb(s)}</dd><dt>คะแนน</dt><dd>${s.score}/100</dd></dl></article>`;
let base,cur,touched=false,selK="best";
function results(){
 if(!done){done=true;}
 base=E.calc(S,C);cur=base;touched=false;selK="best";
 const b=base.scenarios.best,sl=Math.max(100000,Math.round((+S.budgetCap||b.cost[1])/10000)*10000);
 app.innerHTML=`<div id="res"></div><section class="pg card"><h3>ปรับงบประมาณดูผลต่าง (What-if)</h3>
 <label for="bs" class="note">งบสูงสุด: <b id="bv">${fmt(sl)}</b> บาท</label><input type="range" id="bs" min="50000" max="1000000" step="10000" value="${sl}"><p id="wi" class="note" aria-live="polite">เลื่อนเพื่อดูว่าระบบแนะนำเปลี่ยนไปอย่างไร</p></section>
 <section class="pg"><details><summary>สมมติฐานที่ใช้คำนวณ</summary><table id="as"></table><p class="note">ค่าทั้งหมดเป็นประมาณการเบื้องต้น เวอร์ชัน ${C.calculation_version} / ${C.assumption_set_version}</p></details></section>
 <section class="pg card"><h3>ดาวน์โหลด</h3><p><a class="btn" id="dr" href="report.html">Solar Report (PDF)</a> <a class="btn g" id="dc2" href="report.html?type=checklist">Installation Checklist</a></p><p class="note">เปิดรายงานแล้วกด 'บันทึกเป็น PDF' (Thai font ถูกต้อง ไม่ต้องติดตั้งอะไรเพิ่ม)</p>
 <button class="btn g" id="edit">แก้ไขคำตอบ</button></section>`;
 const bs=base.scenarios.best,band=(v,a)=>{for(const x of a)if(v<x)return"<"+x;return">="+a[a.length-1]};
 track("calculator_complete",{session_id:SID,result_id:"local",calculation_version:C.calculation_version,region:base.region||"unknown",system_type:base.system,size_kwp:bs.S,size_band:band(bs.S,[3,5,10]),budget_band:band(bs.cost[1],[100000,200000,400000]),goals:(S.goals||[]).join("|"),confidence:base.confidence});track("result_view",{session_id:SID,result_id:"local"});
 paint();window.scrollTo(0,0);
 $("#bs").oninput=e=>{touched=true;const v=+e.target.value;$("#bv").textContent=fmt(v);cur=E.calc({...S,budgetCap:v},C);paint(v)};
 $("#bs").onchange=e=>track("budget_change",{session_id:SID,old_budget:+S.budgetCap||0,new_budget:+e.target.value});
 $("#edit").onclick=()=>show(0);
 $("#dr").onclick=()=>track("report_generate",{session_id:SID,report_id:LS.get("sc_result",{}).id});
 $("#dc2").onclick=()=>track("checklist_view",{session_id:SID});
}
function paint(cap){
 const r=cur,sc=r.scenarios,id=LS.get("sc_result",{}).id||"SR-"+Date.now().toString(36).toUpperCase()+Math.random().toString(36).slice(2,5).toUpperCase();
 LS.set("sc_result",{id,inputs:cap?{...S,budgetCap:cap}:S,result:r});
 $("#res").innerHTML=`<p class="note">ผลประมาณการเบื้องต้น (ไม่ใช่ใบเสนอราคา) <a href="#" id="as2">ดูสมมติฐาน</a></p>
 <h1 style="font-size:1.8rem">ระบบที่เหมาะกับคุณ: ${sc.best.S} kWp ${r.system}</h1>
 <p>Best Value Score <b>${sc.best.score}/100</b> ความมั่นใจ <span class="badge ${r.confidence}">${L.conf[r.confidence]}</span> Battery: <b>${L.bat[r.batteryRec]}</b> <button class="i" data-h="battery" aria-label="อธิบาย Battery">ℹ</button>${r.useBat?` (ราว ${r.batteryKwh} kWh)`:""}</p>
 <div class="card"><h3>ทำไมแนะนำระบบนี้ <button class="i" data-h="why" aria-label="อธิบาย">ℹ</button></h3><ul>${r.reasons.map(x=>`<li>${x}</li>`).join("")}</ul>
 ${r.confidence!=="high"?'<p class="note">ตอบข้อที่เลือก "ไม่ทราบ" เพิ่มเพื่อให้ผลแม่นขึ้น</p>':""}</div>
 <div class="cards3">${card("budget","Budget",sc.budget,0,selK==="budget")}${card("best","Best Value",sc.best,1,selK==="best")}${card("max","Maximum Saving",sc.max,0,selK==="max")}</div>
 <p class="note">คืนทุน: <button class="i" data-h="payback" aria-label="อธิบาย">ℹ</button> kWp กับ kWh: <button class="i" data-h="kwp" aria-label="อธิบาย">ℹ</button></p>`;
 $("#as").innerHTML=r.assumptions.map(a=>`<tr><th>${a[0]}</th><td>${a[1]}</td></tr>`).join("");
 if(cap){const b=base.scenarios.best,n=sc.best;$("#wi").innerHTML=`ที่งบ ${fmt(cap)} บาท: แนะนำ <b>${n.S} kWp</b> (เทียบกับค่าเดิม ${n.S>=b.S?"+":""}${(n.S-b.S).toFixed(1)} kWp) ผลประโยชน์ต่อปีเปลี่ยน ${n.benefit[1]>=b.benefit[1]?"+":""}${fmt(n.benefit[1]-b.benefit[1])} บาท ราคากลางเปลี่ยน ${n.cost[1]>=b.cost[1]?"+":""}${fmt(n.cost[1]-b.cost[1])} บาท`;track("what_if_change",{session_id:SID,delta_budget:cap-(+S.budgetCap||0),resulting_system:n.S+" kWp "+r.system})}
 else["budget","best","max"].forEach(k=>track("scenario_view",{session_id:SID,scenario:k}));
}
app.addEventListener("click",e=>{
 if(e.target.id==="as2"){e.preventDefault();$("#as").closest("details").open=true;$("#as").scrollIntoView();return}
 const c=e.target.closest(".scn");if(c&&cur){selK=c.dataset.s;app.querySelectorAll(".scn").forEach(x=>{x.classList.toggle("sel",x===c);x.setAttribute("aria-pressed",x===c)});track("scenario_select",{session_id:SID,scenario:selK})}});
app.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.classList.contains("scn")){e.preventDefault();e.target.click()}});
window.addEventListener("pagehide",()=>{if(!done)track("calculator_abandon",{session_id:SID,step_number:step+1})});
show(Math.min(step,6));
})();
