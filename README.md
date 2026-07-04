# GameSync Pro 🎮

ระบบซิงค์ไฟล์เกมผ่าน Torrent & FTP สำหรับร้านเกม — พร้อม Dashboard สวยงาม

## ฟีเจอร์

### ฝั่ง Admin (เซิร์ฟเวอร์)
- 📊 Dashboard ภาพรวม: สถิติ, เกมยอดนิยม, กิจกรรมล่าสุด
- 🎮 จัดการเกม: เพิ่ม/แก้ไข/ลบ + กำหนด path Torrent/FTP
- 🏪 จัดการร้านค้า: สร้างร้าน + กำหนด PIN แต่ละร้าน
- 📂 หมวดหมู่: ไอคอนและสีแต่ละหมวด
- 📋 Log กิจกรรม: ดูการดาวน์โหลดทุกร้าน

### ฝั่ง Client (ร้านค้า)
- 🔐 Login ด้วย PIN ของร้าน (keypad UI)
- 📋 ตารางเกมทั้งหมดพร้อมสถานะ
- 🔍 วิเคราะห์ไฟล์: เปรียบเทียบ version/checksum
- ▶ เริ่มอัพเดท / ⏸ หยุดชั่วคราว / ■ หยุด
- ↻ อัพเดทแบบ Manual
- ⚡ เลือกวิธีโหลด: Torrent หรือ FTP ต่อเกม
- 📊 Progress bar + ความเร็ว real-time

## Tech Stack

| | Tech |
|--|--|
| Frontend + API | Next.js 14 |
| Database | MySQL บน Railway + Prisma |
| Auth | JWT + bcrypt PIN |
| Torrent | WebTorrent (browser P2P) |
| Deploy | Vercel + GitHub Actions |

## ติดตั้ง

```bash
npm install
cp .env.example .env
# ใส่ DATABASE_URL จาก Railway

npx prisma db push
npm run dev
```

## URL

| URL | คำอธิบาย |
|-----|---------|
| `/admin` | Admin Dashboard |
| `/client` | หน้าล็อกอินร้านค้า (PIN) |

## GitHub Secrets สำหรับ Auto-Deploy

| Secret | ค่า |
|--------|-----|
| `DATABASE_URL` | Railway MySQL URL |
| `JWT_SECRET` | `openssl rand -base64 32` |
| `ADMIN_PIN` | PIN สำหรับแอดมิน |
| `VERCEL_TOKEN` | จาก vercel.com |
| `VERCEL_ORG_ID` | จาก `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | จาก `.vercel/project.json` |

## เพิ่มเกมใหม่

1. Admin → จัดการเกม → เพิ่มเกม
2. กรอก: ชื่อ, หมวดหมู่, Server Path
3. ใส่ Magnet Link (Torrent) และ/หรือ FTP path
4. ใส่ Checksum (MD5) เพื่อตรวจสอบการเปลี่ยนแปลง

## เพิ่มร้านใหม่

1. Admin → ร้านค้า → เพิ่มร้าน
2. ตั้งชื่อร้านและ PIN (4-8 หลัก)
3. ร้านล็อกอินที่ `/client` ด้วย PIN นั้น
