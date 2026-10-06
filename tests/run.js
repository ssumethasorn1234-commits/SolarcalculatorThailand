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
process.exit(bad?1:0);
