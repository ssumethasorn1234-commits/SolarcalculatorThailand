globalThis.window=globalThis;require("../js/config.js");const E=require("../js/engine.js"),C=SOLAR_CONFIG;
let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log("FAIL",m)}else console.log("ok  ",m)};
const cases={
 unknown:{billUnknown:true},
 normal:{province:"นครราชสีมา",bill:4000,presence:"most",peaks:["day"],orient:"S",shade:"none",roofType:"tile",pref:"ongrid"},
 backup:{province:"เชียงใหม่",bill:6000,goals:["backup"],pref:"backup",presence:"none",peaks:["night"]},
 smallRoof:{province:"ภูเก็ต",bill:8000,roofArea:20},
 p1:{bill:5000,priority:1},p5:{bill:5000,priority:5},capLow:{bill:5000,budgetCap:90000}};
const R={};for(const k in cases){R[k]=E.calc(cases[k],C);const s=R[k].scenarios;
 console.log(k,R[k].system,"conf:",R[k].confidence,"| B/V/M kWp:",s.budget.S,s.best.S,s.max.S,"score",s.best.score,"payback",s.best.payback&&s.best.payback.toFixed(1))}
ok(R.unknown.confidence==="low","ข้อมูลไม่ครบ → Low");
ok(R.normal.confidence!=="low","ข้อมูลครบ → ไม่ Low");
ok(R.backup.useBat&&R.backup.batteryRec==="recommended","ต้องการ Backup → Hybrid + Battery");
ok(R.normal.system==="On-Grid"&&R.normal.batteryKwh===0,"On-Grid ไม่มี Battery");
ok(R.smallRoof.scenarios.max.S<=20/C.m2PerKwp+.5,"พื้นที่หลังคาจำกัดขนาด");
for(const k in R){const s=R[k].scenarios;ok(s.budget.S<=s.best.S&&s.best.S<=s.max.S,k+": Budget ≤ Best ≤ Max")}
ok(R.p5.scenarios.best.S>=R.p1.scenarios.best.S,"priority 5 ≥ priority 1");
ok(R.capLow.scenarios.budget.cost[1]<=90000||R.capLow.scenarios.budget.S===C.minKwp,"Budget อยู่ในงบ");

// --- appliances ---
const T=E.applTable({presence:"some",appliances:{ac:{on:true,qty:2,hours:8},fridge:{on:true,qty:1},ev:{on:true,qty:1},pc:{on:false,qty:3,hours:5}}},C);
ok(T.rows.length===3,"เฉพาะอุปกรณ์ที่ติ๊ก");
ok(T.rows.find(r=>r.id==="ac").wh===900*2*8,"แอร์ 2 เครื่อง 8 ชม. = 14,400 Wh");
ok(T.rows.find(r=>r.id==="fridge").wh===50*24,"ตู้เย็นใช้ชั่วโมงสมมติ 24");
ok(Math.abs(T.kwhMonth-(14400+1200+8000)*30/1000)<1e-9,"รวม kWh/เดือน");
const ap1=E.calc({province:"นครราชสีมา",billUnknown:true,presence:"none",orient:"S",shade:"none",roofType:"tile",appliances:{ac:{on:true,qty:2,hours:8},led:{on:true,qty:10,hours:5}}},C);
ok(Math.abs(ap1.E_month-ap1.appliances.kwhMonth*C.otherLoadsFactor)<1e-9,"ไม่ทราบบิล -> ใช้ไฟจากอุปกรณ์ +10%");
ok(ap1.confidence!=="low","ไม่ทราบบิลแต่ระบุอุปกรณ์ -> ไม่ Low");
const base={province:"นครราชสีมา",bill:4000,presence:"none",orient:"S",shade:"none",roofType:"tile"};
const noA=E.calc(base,C),dayA=E.calc({...base,appliances:{pool:{on:true,qty:1},ac:{on:true,qty:1,hours:6}}},C);
ok(dayA.SC>noA.SC,"อุปกรณ์ใช้ช่วงกลางวัน (ปั๊มสระ) -> SC สูงขึ้น "+noA.SC.toFixed(2)+"->"+dayA.SC.toFixed(2));
const nightA=E.calc({...base,presence:"most",appliances:{led:{on:true,qty:20,hours:6},fridge:{on:true,qty:2}}},C),noB=E.calc({...base,presence:"most"},C);
ok(nightA.SC<noB.SC,"อุปกรณ์ส่วนใหญ่ใช้กลางคืน -> SC ลดลง");
const big=E.calc({...base,appliances:{ac:{on:true,qty:10,hours:24}}},C);
ok(big.reasons.some(x=>x.includes("สูงกว่าที่คำนวณจากค่าไฟ")),"เตือนเมื่ออุปกรณ์สูงกว่าบิล");
ok(big.E_month===4000/C.tariffAvg,"มีบิล -> ใช้บิลเป็นหลัก");
ok(noA.appliances.rows.length===0&&E.calc({billUnknown:true},C).confidence==="low","ไม่ระบุอุปกรณ์ -> พฤติกรรมเดิม");
process.exit(bad?1:0);
