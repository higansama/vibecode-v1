# Setup Project: ElysiaJS + Drizzle + MySQL dengan Bun

## Ringkasan
Tugas ini mencakup setup awal untuk project backend baru yang menggunakan Bun sebagai runtime dan package manager. Teknologi yang digunakan adalah ElysiaJS untuk framework web, Drizzle ORM untuk interaksi dengan database, dan MySQL sebagai database.

## Persyaratan & Stack Teknologi
- **Runtime & Package Manager**: Bun
- **Framework**: ElysiaJS
- **ORM**: Drizzle ORM
- **Database**: MySQL

## Tugas High-Level

### 1. Inisialisasi Project
- Inisialisasi project Bun baru di direktori utama.
- Install dan konfigurasi aplikasi dasar menggunakan ElysiaJS.
- Pastikan server dapat berjalan dan dapat merespons endpoint *health check* dasar (contoh: `GET /`).

### 2. Setup Database & ORM
- Install Drizzle ORM, Drizzle Kit, dan driver MySQL yang diperlukan.
- Siapkan file konfigurasi Drizzle (contoh: `drizzle.config.ts`), gunakan *environment variables* (variabel lingkungan) untuk *connection string* database.
- Buat file skema database awal yang mendefinisikan setidaknya satu tabel contoh (contoh: tabel `users`).
- Konfigurasikan skrip npm/bun di dalam `package.json` untuk menangani migrasi database (generate dan push) menggunakan Drizzle Kit.

### 3. Struktur Aplikasi & Integrasi
- Atur kode ke dalam struktur yang rapi dan modular (contoh: pisahkan direktori untuk route, skema database, dan controller/service).
- Integrasikan instance database Drizzle dengan aplikasi Elysia sehingga *route handler* dapat melakukan query ke database.

### 4. Konfigurasi Environment
- Buat file `.env.example` yang mencantumkan variabel lingkungan yang dibutuhkan (seperti `DATABASE_URL`).

## Kriteria Penerimaan (Acceptance Criteria)
- Menjalankan perintah development (contoh: `bun run dev`) dapat menjalankan server Elysia dengan sukses tanpa error.
- Migrasi Drizzle dapat di-generate dan diaplikasikan dengan baik ke database MySQL.
- Terdapat minimal satu route yang berfungsi untuk membaca atau menulis data ke database MySQL melalui Drizzle.
- Struktur project sudah rapi dan siap digunakan untuk pengembangan fitur selanjutnya.
