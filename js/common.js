(function(){
const C=SOLAR_CONFIG;
window.$=(s,r=document)=>r.querySelector(s);
window.fmt=n=>Math.round(n).toLocaleString("th-TH");
window.rng=(a,b)=>fmt(a)+"–"+fmt(b);
window.LS={get(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const uid=()=>crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random();
let aid=LS.get("sc_aid");if(!aid){aid=uid();LS.set("sc_aid",aid)}
let sid=sessionStorage.getItem("sc_sid");if(!sid){sid=uid();sessionStorage.setItem("sc_sid",sid)}
window.SID=sid;
const qs=new URLSearchParams(location.search);
const source=qs.get("utm_source")||(document.referrer?new URL(document.referrer).hostname:"direct");
/* Event ledger: เก็บเมื่อผู้ใช้ยินยอมเท่านั้น และไม่ส่งข้อมูลส่วนบุคคลใน payload */
window.track=function(name,payload){
 if(LS.get("sc_consent")!=="granted")return;
 const ev={id:uid(),anonymous_id:aid,session_id:sid,event_name:name,event_time:new Date().toISOString(),page_path:location.pathname,payload_json:payload||{}};
 const q=LS.get("sc_events",[]);q.push(ev);LS.set("sc_events",q.slice(-300));
 if(C.analyticsEndpoint&&navigator.sendBeacon)navigator.sendBeacon(C.analyticsEndpoint,JSON.stringify(ev));
};
const page=document.body.dataset.page||"page";
document.title=document.title||"Solar Calculator Thailand";
$("#h").outerHTML=`<header class="top"><div class="w"><a class="logo" href="index.html"><i></i>Solar Calculator Thailand</a>
<nav aria-label="เมนูหลัก"><a href="calculator.html">คำนวณ</a><a href="knowledge.html">ความรู้</a><a href="report.html?type=checklist">เช็กลิสต์ติดตั้ง</a><a href="advertise.html">ลงโฆษณา</a><a href="about.html">เกี่ยวกับเรา</a></nav>
<a class="btn" href="calculator.html" data-cta="header">เริ่มคำนวณฟรี</a></div></header>`;
$("#f").outerHTML=`<footer><div class="w"><p><b>ประมาณการเบื้องต้น</b> ไม่ใช่การออกแบบทางวิศวกรรม ใบเสนอราคา หรือการรับประกันผลประหยัด เราไม่ใช่ผู้ติดตั้ง Solar และผลลัพธ์ไม่ถูกปรับเพื่อผู้ลงโฆษณา</p>
<p><a href="about.html#contact">ติดต่อ</a><a href="about.html#privacy">นโยบายความเป็นส่วนตัว</a><a href="about.html#terms">เงื่อนไขการใช้งาน</a><a href="about.html#cookie">คุกกี้และการติดตามการใช้งาน</a></p>
<p>Calculation ${C.calculation_version} | Assumptions ${C.assumption_set_version}</p></div></footer>`;
function consentBar(){
 if(LS.get("sc_consent"))return;
 const b=document.createElement("div");b.className="bar";b.setAttribute("role","region");b.setAttribute("aria-label","ความยินยอมสถิติการใช้งาน");
 b.innerHTML=`<span>เราเก็บสถิติการใช้งานแบบไม่ระบุตัวตนเพื่อปรับปรุงเครื่องมือ (ไม่เก็บชื่อ เบอร์ หรือที่อยู่) <a href="about.html#cookie">รายละเอียด</a></span><button class="btn" id="ok">ยอมรับ</button><button class="btn g" id="no">ปฏิเสธ</button>`;
 document.body.append(b);
 const set=v=>{LS.set("sc_consent",v);b.remove();if(v==="granted"){track("consent_update",{consent_type:"analytics",value:true});track("page_view",{page_type:page,path:location.pathname,source,campaign_id:qs.get("utm_campaign")||""})}};
 $("#ok").onclick=()=>set("granted");$("#no").onclick=()=>set("denied");
}
consentBar();
track("page_view",{page_type:page,path:location.pathname,source,campaign_id:qs.get("utm_campaign")||""});
document.addEventListener("click",e=>{const a=e.target.closest("[data-cta]");if(a)track("knowledge_cta_click",{article_id:page,target:a.dataset.cta})});
})();
