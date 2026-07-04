# TorrentSync 🔄

ระบบซิงค์ไฟล์อัตโนมัติด้วย WebTorrent — จัดการงานได้เหมือน uTorrent

## Stack

| Layer | Tech |
|-------|------|
| Frontend + API | Next.js 14 (App Router) |
| Database | MySQL บน Railway + Prisma ORM |
| Torrent Engine | WebTorrent (browser-based P2P) |
| Deploy | Vercel (ฟรี) |
| CI/CD | GitHub Actions |

## ฟีเจอร์

- ✅ เพิ่ม / แก้ไข / ลบ งานซิงค์
- ✅ เพิ่ม Magnet link — ดาวน์โหลดผ่าน WebTorrent ในเบราว์เซอร์
- ✅ แสดงความเร็วดาวน์โหลด / อัพโหลด / จำนวน Peers แบบ real-time
- ✅ Progress bar แต่ละไฟล์
- ✅ Pause / Resume / Delete ทอร์เรนต์
- ✅ ซิงค์อัตโนมัติตามตาราง (Cron)
- ✅ ประวัติกิจกรรมพร้อม log level
- ✅ Auto-deploy เมื่อ push ขึ้น GitHub

---

## วิธีติดตั้ง (ทีละขั้นตอน)

### 1️⃣ สร้าง Database บน Railway

1. ไปที่ [railway.app](https://railway.app) → New Project → MySQL
2. คลิก MySQL service → **Variables** tab
3. Copy ค่า `DATABASE_URL` (รูปแบบ: `mysql://user:pass@host:port/db`)

### 2️⃣ Fork / Clone โปรเจกต์

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/torrentsync.git
cd torrentsync

# ติดตั้ง dependencies
npm install

# สร้าง .env จาก template
cp .env.example .env
```

แก้ไข `.env`:
```env
DATABASE_URL="mysql://user:password@your-railway-host:3306/railway"
NEXTAUTH_SECRET="สร้างด้วย: openssl rand -base64 32"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3️⃣ สร้าง Database Tables

```bash
# Push schema ไปที่ Railway MySQL
npx prisma db push

# (ทางเลือก) เปิด Prisma Studio
npx prisma studio
```

### 4️⃣ รันในเครื่อง

```bash
npm run dev
# เปิด http://localhost:3000
```

---

## Deploy บน Vercel + GitHub Actions

### ตั้งค่า Vercel

1. ไปที่ [vercel.com](https://vercel.com) → Import GitHub repo
2. ตั้งค่า Environment Variables:
   ```
   DATABASE_URL = (Railway MySQL URL)
   NEXTAUTH_SECRET = (random string)
   NEXT_PUBLIC_APP_URL = https://your-app.vercel.app
   ```
3. Deploy!

### ตั้งค่า GitHub Actions (สำหรับ auto-deploy)

ไปที่ GitHub repo → **Settings → Secrets and variables → Actions** แล้วเพิ่ม:

| Secret | วิธีได้มา |
|--------|-----------|
| `VERCEL_TOKEN` | vercel.com → Account Settings → Tokens |
| `VERCEL_ORG_ID` | `vercel env pull` แล้วดูใน `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | เหมือนกัน |
| `DATABASE_URL` | Railway → MySQL → Variables |

ทุกครั้งที่ `git push origin main` → GitHub Actions จะ deploy ให้อัตโนมัติ

---

## วิธีใช้งาน

### สร้างงานซิงค์
1. ไปแท็บ **งานซิงค์** → กดปุ่ม **สร้างงานใหม่**
2. กรอก:
   - **ชื่องาน**: ชื่อที่จำง่าย
   - **Path ต้นทาง**: `/source/folder` (โฟลเดอร์ที่ต้องการซิงค์)
   - **Path ปลายทาง**: `/dest/folder`
   - **ตาราง Cron** (ถ้าต้องการ): `0 * * * *` = ทุกชั่วโมง
   - **ซิงค์อัตโนมัติ**: เปิด/ปิด

### เพิ่มทอร์เรนต์
1. ไปแท็บ **ทอร์เรนต์** → **เพิ่ม Magnet**
2. วาง Magnet link
3. เลือกงานที่จะเชื่อมโยง
4. WebTorrent จะเริ่มดาวน์โหลดในเบราว์เซอร์ทันที

---

## โครงสร้างโปรเจกต์

```
torrentsync/
├── app/
│   ├── api/
│   │   ├── jobs/            # CRUD งาน
│   │   │   └── [id]/
│   │   │       └── action/  # start/pause/stop/sync
│   │   ├── torrents/        # CRUD ทอร์เรนต์
│   │   └── stats/           # ภาพรวมสถิติ
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── Sidebar.tsx
│   ├── Dashboard.tsx
│   ├── JobList.tsx
│   ├── JobModal.tsx
│   ├── TorrentList.tsx
│   └── ActivityLog.tsx
├── lib/
│   ├── prisma.ts
│   └── useTorrent.ts        # WebTorrent hook
├── prisma/
│   └── schema.prisma
└── .github/
    └── workflows/
        └── deploy.yml
```

## API Endpoints

| Method | Endpoint | คำอธิบาย |
|--------|----------|-----------|
| GET | `/api/jobs` | ดูงานทั้งหมด |
| POST | `/api/jobs` | สร้างงานใหม่ |
| PUT | `/api/jobs/:id` | แก้ไขงาน |
| DELETE | `/api/jobs/:id` | ลบงาน |
| POST | `/api/jobs/:id/action` | start/pause/stop/sync |
| GET | `/api/torrents` | ดูทอร์เรนต์ทั้งหมด |
| POST | `/api/torrents` | เพิ่มทอร์เรนต์ |
| PATCH | `/api/torrents/:id` | อัพเดทความคืบหน้า |
| DELETE | `/api/torrents/:id` | ลบทอร์เรนต์ |
| GET | `/api/stats` | สถิติรวม + ประวัติ |
