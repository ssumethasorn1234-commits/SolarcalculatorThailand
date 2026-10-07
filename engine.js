/* Calculation Engine — ไม่ผูกกับ UI ทดสอบด้วย node tests/run.js */
(function(g){
"use strict";
const cl=(x,a,b)=>Math.min(b,Math.max(a,x));
const f0=n=>Math.round(n).toLocaleString("th-TH");
function regionOf(p,c){for(const r in c.regions)if(c.regions[r].split(",").includes(p))return r;return null}
function applTable(inp,cfg){
 const sel=(inp&&inp.appliances)||{},rows=[],occ=cfg.dayOcc[(inp&&inp.presence)||"some"]||cfg.dayOcc.some;let wh=0,dw=0;
 cfg.appliances.forEach(a=>{const s=sel[a.id];if(!s||!s.on)return;
  const q=Math.max(1,Math.round(+s.qty||1)),h=a.hrs?cl(+s.hours||1,0,24):(a.fix||0),w=a.wh!=null?a.wh*q:a.w*q*h,df=a.day==="occ"?occ:a.day;
  rows.push({id:a.id,name:a.n,qty:q,hours:a.hrs?h:null,fixedHours:a.fix||null,unit:a.unit||"",wh:w});wh+=w;dw+=w*df});
 return{rows,whDay:wh,kwhDay:wh/1000,kwhMonth:wh*cfg.daysPerMonth/1000,dayShare:wh?dw/wh:null};
}
function calc(inp,cfg){
 inp=inp||{};const goals=inp.goals||[],peaks=inp.peaks||[],loads=inp.loads||[];let unk=0;
 const region=regionOf(inp.province,cfg);if(!region)unk++;
 const Y=region?cfg.yield[region]:cfg.yieldDefault;
 const ap=applTable(inp,cfg),hasAp=ap.rows.length>0;
 const billKnown=!inp.billUnknown&&+inp.bill>0;if(!billKnown&&!hasAp)unk++;
 const E_month=+inp.kwh>0?+inp.kwh:billKnown?(+inp.bill)/cfg.tariffAvg:hasAp?ap.kwhMonth*cfg.otherLoadsFactor:cfg.defaultBill/cfg.tariffAvg,E_day=E_month/30,E_year=E_month*12;
 const bill=billKnown?+inp.bill:E_month*cfg.tariffAvg;
 if(!inp.orient||inp.orient==="unknown")unk++;
 if(!inp.shade||inp.shade==="unknown")unk++;
 if(!inp.roofType||inp.roofType==="unknown")unk++;
 const site=(cfg.orient[inp.orient]||cfg.orient.unknown)*(cfg.shade[inp.shade]||cfg.shade.unknown);
 let sc=cfg.presence[inp.presence]||cfg.presence.some;
 if(peaks.includes("day"))sc+=.05;
 if(!peaks.includes("day")&&(peaks.includes("evening")||peaks.includes("night")))sc-=.05;
 if(hasAp&&ap.dayShare!=null){const cov=Math.min(.8,ap.kwhMonth/E_month);sc=(1-cov)*sc+cov*ap.dayShare}
 sc=cl(sc,.3,.85);
 const pref=inp.pref||"unsure",needBackup=goals.includes("backup")||pref==="backup";
 const nightHigh=(peaks.includes("evening")||peaks.includes("night"))&&sc<.7;
 let batRec=needBackup?"recommended":(goals.includes("battery")||nightHigh)?"optional":(unk>=4?"unknown":"notneeded");
 const useBat=pref==="ongrid"?false:(pref==="hybrid"||needBackup||(pref==="unsure"&&goals.includes("battery")));
 const B=cfg.battery;let bat=0;
 if(useBat){const need=needBackup?B.critKW*B.hours:E_day*(1-sc)*.5;bat=Math.max(B.min,Math.ceil(need/B.dod/B.eff/2.5)*2.5);}
 const SC=useBat?Math.min(.95,sc+B.scBoost):sc;
 const roofMax=+inp.roofArea>0?+inp.roofArea/cfg.m2PerKwp:cfg.maxKwp;
 const over=goals.includes("export")?cfg.overGenExport:cfg.overGen;
 let maxS=Math.min(cfg.maxKwp,roofMax,over*E_year/(Y*cfg.PR[1]*site));
 maxS=Math.max(cfg.minKwp,Math.floor(maxS*2)/2);
 const cap=+inp.budgetCap>0?+inp.budgetCap:0,exp=goals.includes("export"),rows=[];
 for(let S=cfg.minKwp;S<=maxS+1e-9;S+=.5){
  const gen=cfg.PR.map(p=>S*Y*p*site);
  const ben=x=>Math.min(x*SC,E_year)*cfg.tariffEff+(exp?Math.max(x-Math.min(x*SC,E_year),0)*cfg.exportRate:0)-S*cfg.recurringPerKwp;
  const benefit=gen.map(ben);
  const cost=[0,1,2].map(i=>S*cfg.pricePerKwp[i]+cfg.bos[i]+(useBat?bat*cfg.battPerKwh[i]+cfg.hybridExtra[i]:0)+(needBackup?cfg.backupEquip[i]:0));
  const self=Math.min(gen[1]*SC,E_year);
  rows.push({S,gen,cost,benefit,savings:self*cfg.tariffEff,util:self/gen[1],
   payback:benefit[1]>0?cost[1]/benefit[1]:null,
   paybackRange:[benefit[2]>0?cost[0]/benefit[2]:null,benefit[0]>0?cost[2]/benefit[0]:null]});
 }
 const maxCost=Math.max(...rows.map(r=>r.cost[1])),maxSav=Math.max(...rows.map(r=>r.savings))||1;
 const p=cl(+inp.priority||3,1,5),W={...cfg.w};W.budget+=(3-p)*.04;W.saving+=(p-3)*.04;
 const tot=Object.values(W).reduce((a,b)=>a+b,0);for(const k in W)W[k]/=tot;
 const maxG=goals.includes("max");
 rows.forEach(r=>{
  const bf=cap?Math.min(1,cap/r.cost[1]):1-.7*r.cost[1]/maxCost,sb=r.savings/maxSav;
  const pf=r.payback==null?0:cl(1-(r.payback-3)/9,0,1),gf=maxG?sb:r.util;
  r.score=Math.round(100*(W.budget*bf+W.saving*sb+W.payback*pf+W.usage*r.util+W.goal*gf));
 });
 const best=rows.reduce((a,b)=>b.score>a.score?b:a),max=rows[rows.length-1];
 let bud;
 if(cap){const ok=rows.filter(r=>r.cost[1]<=cap);bud=ok.length?ok[ok.length-1]:rows[0];}
 if(!bud||bud.S>=best.S){const t=best.S*.6;bud=rows.reduce((a,b)=>Math.abs(b.S-t)<Math.abs(a.S-t)?b:a);}
 const confidence=unk<=1?"high":unk<=3?"medium":"low";
 const reasons=[
  `ค่าไฟประมาณ ${f0(bill)} บาท/เดือน (ราว ${f0(E_month)} หน่วย) หรือใช้ไฟราว ${f0(E_year)} หน่วย/ปี`,
  `ระบบ ${best.S} kWp ผลิตไฟได้ราว ${f0(best.gen[1])} หน่วย/ปี และคาดว่าใช้เองได้ราว ${Math.round(SC*100)}% ของที่ผลิต`,
  best.payback?`คืนทุนประมาณ ${best.payback.toFixed(1)} ปี (ค่ากลาง) ได้คะแนนรวมสูงสุดจากงบ ผลประหยัด การคืนทุน และการใช้ไฟ`:"ข้อมูลนี้ยังประเมินการคืนทุนไม่ได้"];
 if(hasAp){reasons.push(`ระบุอุปกรณ์ไฟฟ้า ${ap.rows.length} รายการ ใช้ไฟราว ${f0(ap.kwhMonth)} หน่วย/เดือน คาดว่าใช้ช่วงกลางวันราว ${Math.round(ap.dayShare*100)}% จึงนำมาปรับสัดส่วนใช้ไฟเอง`);
  if(billKnown&&ap.kwhMonth>E_month*1.2)reasons.push("ไฟจากอุปกรณ์ที่ระบุสูงกว่าที่คำนวณจากค่าไฟ ควรตรวจสอบจำนวนและชั่วโมง ระบบใช้ค่าไฟจากบิลเป็นหลัก")}
 if(site<.95)reasons.push("ทิศหลังคาหรือเงาบังทำให้ผลผลิตลดลงจากค่ามาตรฐาน");
 if(roofMax<cfg.maxKwp&&+inp.roofArea>0)reasons.push(`พื้นที่หลังคาจำกัดขนาดระบบไม่เกินราว ${roofMax.toFixed(1)} kWp`);
 if(pref==="ongrid"&&needBackup)reasons.push("คุณเลือก On-Grid แต่ต้องการไฟสำรอง ควรพิจารณา Hybrid หรือ Backup-focused");
 if(cap&&best.cost[1]>cap)reasons.push("ราคาประมาณการของระบบแนะนำสูงกว่างบที่กำหนด ดูตัวเลือก Budget");
 const assumptions=[
  ["ผลผลิตต่อปี (Yield)",`${f0(Y)} kWh/kWp/ปี (${region||"ค่าเฉลี่ยประเทศ"})`],
  ["Performance Ratio",cfg.PR.join(" / ")+` (ต่ำ/กลาง/สูง) × ปัจจัยหลังคา ${site.toFixed(2)}`],
  ["อัตราค่าไฟเฉลี่ย (แปลงบิล→หน่วย)",`${cfg.tariffAvg} บาท/หน่วย`],
  ["ค่าไฟที่ประหยัดได้",`${cfg.tariffEff} บาท/หน่วย`],
  ["สัดส่วนใช้ไฟเอง (SC)",`${Math.round(SC*100)}%`],
  ["ราคาติดตั้ง",`${f0(cfg.pricePerKwp[0])}–${f0(cfg.pricePerKwp[2])} บาท/kWp + ค่าอุปกรณ์ประกอบ`],
  ["ค่าบำรุงรักษา",`${cfg.recurringPerKwp} บาท/kWp/ปี`]];
 if(exp)assumptions.push(["ราคารับซื้อไฟส่วนเกิน",`${cfg.exportRate} บาท/หน่วย (ต้องตรวจสอบเงื่อนไขจริง)`]);
 if(hasAp){const sel=inp.appliances;
  assumptions.push(["กำลังไฟอุปกรณ์ที่ใช้คำนวณ",cfg.appliances.filter(a=>sel[a.id]&&sel[a.id].on).map(a=>a.n+" "+(a.wh!=null?f0(a.wh)+" Wh/วัน/คัน":a.w+" W"+(a.fix?" × "+a.fix+" ชม./วัน":""))).join(", ")]);
  assumptions.push(["สัดส่วนใช้ไฟช่วงกลางวัน",`อุปกรณ์ที่ใช้ตามผู้อยู่บ้าน ${Math.round(cfg.dayOcc[inp.presence||"some"]*100)}% หลอดไฟ 10% ปั๊มสระ 90% ชาร์จ EV 25%`]);
  if(!billKnown&&!(+inp.kwh>0))assumptions.push(["ปริมาณไฟรวมเมื่อไม่ทราบค่าไฟ","ไฟจากอุปกรณ์ที่ระบุ + "+Math.round((cfg.otherLoadsFactor-1)*100)+"% สำหรับอุปกรณ์อื่น"])}
 if(useBat)assumptions.push(["Battery",`${bat} kWh ระบุ (DoD ${B.dod}, ประสิทธิภาพ ${B.eff})`]);
 const mk=r=>({...r});
 return{meta:{calculation_version:cfg.calculation_version,assumption_set_version:cfg.assumption_set_version,generated_at:new Date().toISOString()},
  system:useBat?(needBackup?"Backup-focused Hybrid":"Hybrid"):"On-Grid",useBat,batteryKwh:bat,batteryRec:batRec,
  appliances:ap,E_month,E_year,SC,region,weights:W,scenarios:{budget:mk(bud),best:mk(best),max:mk(max)},
  confidence,reasons,assumptions};
}
const api={calc,applTable};
if(typeof module!=="undefined")module.exports=api;else g.SolarEngine=api;
})(typeof window!=="undefined"?window:globalThis);
