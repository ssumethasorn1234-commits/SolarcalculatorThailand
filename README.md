# Solar Calculator Thailand — Phase 1 (Static Frontend MVP)

เว็บ static ล้วน (HTML/CSS/JS) ไม่ต้องติดตั้งหรือ build อะไร เปิด `index.html` ดูในเครื่องได้เลย

## ขึ้น GitHub Pages (ยังไม่มี Domain ก็ใช้ได้)
1. สร้าง repo ใหม่บน GitHub แล้วอัปโหลดไฟล์ทั้งหมดในโฟลเดอร์นี้ (รวม `.nojekyll`)
2. Settings → Pages → Source: *Deploy from a branch* → Branch: `main` / `(root)` → Save
3. เว็บจะอยู่ที่ `https://<ชื่อผู้ใช้>.github.io/<ชื่อ repo>/` (ทุกลิงก์เป็น relative path ใช้ได้ทันที)
4. เมื่อมี Domain: Settings → Pages → Custom domain แล้วค่อยเพิ่ม `sitemap.xml`, `robots.txt`, canonical

## โครงสร้าง
- `js/config.js` ค่าสมมติฐานทั้งหมด + เวอร์ชัน (ห้ามกระจายค่าไว้ใน UI)
- `js/engine.js` สูตรคำนวณ (แยกจาก UI) ทดสอบ: `node tests/run.js`
- `js/calculator.js` Calculator 7 ขั้น + หน้าผลลัพธ์ + What-if
- `js/report.js` รายงาน/เช็กลิสต์ (กด "บันทึกเป็น PDF" ใช้ print ของเบราว์เซอร์ ฟอนต์ไทยถูกต้อง)
- `js/common.js` header/footer, ความยินยอม, Event tracking ตาม Event Dictionary

## ข้อควรรู้
- **ค่าใน config.js เป็นค่าสมมติฐานเบื้องต้น** (ราคา, yield, tariff, PR, น้ำหนักคะแนน) ต้องตรวจสอบก่อนเปิดใช้งานจริง (Milestone M10)
- Event และฟอร์มลงโฆษณา เก็บใน localStorage ของผู้ใช้เท่านั้น จนกว่าจะตั้ง `analyticsEndpoint` / `formEndpoint` ใน config
- **อย่าใส่ secret/API key ใน repo นี้** (ตามข้อกำหนด Security)
- ยังไม่รวม: Database, Admin Dashboard, PDF แบบสร้างฝั่ง server (ต้องมี Backend — M7/M9)
