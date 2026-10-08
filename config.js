/* Solar Calculator Thailand — Configuration (assumption_set_version: TH-2026-01-DRAFT)
   ค่าทั้งหมดเป็นค่าสมมติฐานเบื้องต้น ต้องตรวจสอบกับข้อมูลตลาดจริงก่อน production
   ห้ามแก้ค่าย้อนหลังโดยไม่เปลี่ยนเวอร์ชัน */
(typeof window!=="undefined"?window:globalThis).SOLAR_CONFIG=(function(){
const regions={
 BKK:"กรุงเทพมหานคร,นนทบุรี,ปทุมธานี,สมุทรปราการ,สมุทรสาคร,นครปฐม",
 C:"พระนครศรีอยุธยา,อ่างทอง,ลพบุรี,สิงห์บุรี,ชัยนาท,สระบุรี,นครนายก,สุพรรณบุรี,นครสวรรค์,อุทัยธานี",
 N:"เชียงใหม่,เชียงราย,ลำพูน,ลำปาง,แพร่,น่าน,พะเยา,แม่ฮ่องสอน,อุตรดิตถ์,ตาก,สุโขทัย,พิษณุโลก,พิจิตร,กำแพงเพชร,เพชรบูรณ์",
 NE:"นครราชสีมา,ขอนแก่น,อุดรธานี,อุบลราชธานี,บุรีรัมย์,สุรินทร์,ศรีสะเกษ,ร้อยเอ็ด,มหาสารคาม,กาฬสินธุ์,สกลนคร,นครพนม,มุกดาหาร,ยโสธร,อำนาจเจริญ,หนองคาย,บึงกาฬ,หนองบัวลำภู,เลย,ชัยภูมิ",
 E:"ชลบุรี,ระยอง,จันทบุรี,ตราด,ฉะเชิงเทรา,ปราจีนบุรี,สระแก้ว",
 W:"ราชบุรี,กาญจนบุรี,เพชรบุรี,ประจวบคีรีขันธ์,สมุทรสงคราม",
 S:"ชุมพร,ระนอง,สุราษฎร์ธานี,นครศรีธรรมราช,กระบี่,พังงา,ภูเก็ต,สงขลา,สตูล,ตรัง,พัทลุง,ปัตตานี,ยะลา,นราธิวาส"};
return{
 calculation_version:"v1.0.0", assumption_set_version:"TH-2026-01-DRAFT",
 analyticsEndpoint:"https://script.google.com/macros/s/AKfycbwYdeeaSPdhqbYgckBpGWHOdMrmW6D5I-lQ2HGMZTBmC91iKwxhEKdKwUvpaazSna6r/exec",   // ใส่ URL ของ Backend/API เมื่อพร้อม (ว่าง = เก็บในเครื่องผู้ใช้เท่านั้น)
 formEndpoint:"",        // URL รับฟอร์มลงโฆษณา (ว่าง = เก็บในเครื่อง)
 contactEmail:"solarcalculatorthai@gmail.com",
 regions, provinces:Object.values(regions).join(",").split(",").sort((a,b)=>a.localeCompare(b,"th")),
 yield:{BKK:1350,C:1380,N:1400,NE:1420,E:1380,W:1400,S:1330}, yieldDefault:1380, // kWh/kWp/ปี
 PR:[.74,.80,.84],                 // low, mid, high
 tariffAvg:4.4, tariffEff:4.2, exportRate:2.2, defaultBill:3000,
 pricePerKwp:[22000,28000,36000], bos:[10000,15000,25000],
 battPerKwh:[12000,16000,22000], hybridExtra:[20000,30000,45000], backupEquip:[10000,20000,35000],
 recurringPerKwp:150, m2PerKwp:6, minKwp:1, maxKwp:20, overGen:1.1, overGenExport:1.5,
 presence:{most:.75,some:.6,none:.45},
 orient:{N:.8,NE:.88,E:.93,SE:.97,S:1,SW:.97,W:.93,NW:.88,unknown:.95},
 shade:{none:1,some:.92,heavy:.8,unknown:.95},
 battery:{critKW:1.5,hours:4,dod:.9,eff:.92,min:5,scBoost:.2},
 w:{budget:.25,saving:.30,payback:.20,usage:.15,goal:.10},  // W_system = 0 ใน v1.0 (สเปกยังไม่กำหนดค่า)
 appliances:[ // w = วัตต์เฉลี่ยขณะใช้งาน (ค่าสมมติ), hrs = ให้ผู้ใช้ระบุชั่วโมง/วัน, fix = ชั่วโมง/วันที่สมมติ, wh = Wh/วัน/คัน, day = สัดส่วนใช้ช่วงกลางวัน (occ = ตามคำตอบว่ามีคนอยู่บ้านไหม)
  {id:"pc",n:"คอมพิวเตอร์",w:150,hrs:1,day:"occ"},
  {id:"ac",n:"แอร์",w:900,hrs:1,day:"occ"},
  {id:"bulb",n:"หลอดไฟทั่วไป",w:40,hrs:1,day:.1},
  {id:"tv",n:"ทีวี",w:100,hrs:1,day:"occ"},
  {id:"led",n:"หลอด LED",w:10,hrs:1,day:.1},
  {id:"iron",n:"เตารีด",w:1000,hrs:1,day:"occ"},
  {id:"wash",n:"เครื่องซักผ้า",w:500,hrs:1,day:"occ"},
  {id:"fridge",n:"ตู้เย็น",w:50,fix:24,day:.375},
  {id:"purifier",n:"เครื่องฟอกอากาศ",w:50,fix:12,day:.5},
  {id:"pool",n:"สระว่ายน้ำ (ปั๊มกรอง)",w:750,fix:6,day:.9},
  {id:"koi",n:"บ่อปลาคาร์ฟ (ปั๊ม/กรอง)",w:200,fix:24,day:.375},
  {id:"phev",n:"Plug-in Hybrid (ชาร์จ)",wh:4000,unit:"คัน",day:.25},
  {id:"ev",n:"EV Charger (รถไฟฟ้า)",wh:8000,unit:"คัน",day:.25}],
 dayOcc:{most:.6,some:.4,none:.15}, otherLoadsFactor:1.1, daysPerMonth:30,
 L:{
  presence:{most:"อยู่บ้านเกือบตลอดวัน",some:"อยู่บ้านบางช่วง",none:"แทบไม่มีคนอยู่บ้านตอนกลางวัน"},
  peaks:{morning:"เช้า",day:"กลางวัน",evening:"เย็น",night:"กลางคืน"},
  loads:{ac:"แอร์ 3 เครื่องขึ้นไป",ev:"รถ EV",heater:"เครื่องทำน้ำอุ่น",pump:"ปั๊มน้ำ",pool:"สระว่ายน้ำ"},
  goals:{reduce:"ลดค่าไฟ",max:"ลดค่าไฟให้มากที่สุด",day:"ใช้ไฟ Solar ช่วงกลางวัน",battery:"ต้องการ Battery",backup:"ต้องการไฟสำรองตอนไฟดับ",ev:"รองรับ EV",export:"ขายไฟส่วนเกิน",unsure:"ยังไม่แน่ใจ"},
  pref:{ongrid:"On-Grid",hybrid:"Hybrid",backup:"Backup-focused",unsure:"ยังไม่แน่ใจ"},
  bat:{recommended:"แนะนำ",optional:"เป็นทางเลือก",notneeded:"ไม่จำเป็นสำหรับเป้าหมายนี้",unknown:"ข้อมูลไม่พอ"},
  conf:{high:"สูง",medium:"ปานกลาง",low:"ต่ำ"}}
};})();
