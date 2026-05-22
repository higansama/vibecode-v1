# Implementasi Fitur Autentikasi (Register & Login) dengan Clean Architecture (DDD)

## Ringkasan Tugas
Anda ditugaskan untuk mengimplementasikan fitur autentikasi yang mencakup registrasi pengguna baru dan login. Sistem ini harus dibangun di atas *framework* ElysiaJS dengan Drizzle ORM dan MySQL, dan **wajib** menggunakan pendekatan **Clean Architecture** dan **Domain Driven Design (DDD)** yang modular.

**Prinsip Utama:**
- *Readability is King* (Kode harus mudah dibaca)
- *Maintainability is Queen* (Kode harus mudah dipelihara)
- *Scalability is God* (Arsitektur harus bisa diskalakan)
- Wajib menggunakan **Repository Pattern** untuk memisahkan logika akses *database* dari logika bisnis.

---

## 1. Skema Database
Buat atau perbarui tabel `users` pada Drizzle schema dengan spesifikasi berikut:
- `id`: Integer, Primary Key, Auto Increment
- `name`: Varchar(255), Not Null
- `email`: Varchar(255), Not Null, Unique
- `password`: Varchar(255), Not Null *(menyimpan hash dari bcrypt)*
- `created_at`: Timestamp, Default Current Timestamp

---

## 2. Spesifikasi API

### A. Registrasi User Baru
**Endpoint:** `POST /api/v1/auth/register`

**Request Body:**
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
}
```

**Response Success (200/201):**
```json
{
    "success": true,
    "message": "User created successfully",
    "data": {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "created_at": "2022-01-01T00:00:00.000Z"
    }
}
```

**Response Failed:**
```json
{
    "success": false,
    "message": "User already exists",
    "detail": "[technical error jika ada]"
}
```

### B. Login User
**Endpoint:** `POST /api/v1/auth/login`

**Request Body:**
```json
{
    "email": "john@example.com",
    "password": "password123"
}
```

**Response Success (200):**
```json
{
    "success": true,
    "message": "User logged in successfully",
    "data": {
        "token": "[token_jwt]",
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "created_at": "2022-01-01T00:00:00.000Z"
        }
    }
}
```

**Response Failed:**
```json
{
    "success": false,
    "message": "Wrong password",
    "detail": "[technical error jika ada]"
}
```

---

## 3. Struktur Folder (Wajib Diikuti)
Gunakan struktur modular berbasis DDD di dalam direktori `src/`:

```text
src/
│
├── api/              # Endpoint routes
│   └── v1/
│       └── auth/
│           ├── register.ts
│           └── login.ts
│
├── application/      # Business logic & domain services (Use Cases)
│   └── auth/
│       ├── register.service.ts
│       └── login.service.ts
│
├── domain/           # Business entities, interfaces, & value objects
│   └── user/
│       ├── user.entity.ts
│       ├── user.repository.interface.ts
│       └── user.error.ts
│
├── infrastructure/   # Infrastructure concerns (DB, JWT, Bcrypt)
│   ├── db/           # Drizzle schema, migrations, connection
│   │   ├── schema.ts
│   │   ├── index.ts
│   │   └── user.repository.ts
│   ├── jwt/          # JWT utilities
│   │   └── index.ts
│   └── bcrypt/       # Password hashing utilities
│       └── index.ts
│
└── main.ts           # Application entry point & setup (sebelumnya index.ts)
```

---

## 4. Panduan Eksekusi Langkah-demi-Langkah (Step-by-Step)
Kerjakan secara berurutan sesuai tahap di bawah ini. Jangan melompat!

### Tahap 1: Persiapan & Instalasi Dependensi
1. Masuk ke direktori `backend-elysia/`.
2. Ubah nama file `src/index.ts` menjadi `src/main.ts`. Jangan lupa *update* skrip `dev` di `package.json` agar mengarah ke `src/main.ts`.
3. Tambahkan pustaka yang dibutuhkan dengan menjalankan perintah:
   `bun add bcryptjs jsonwebtoken`
4. Tambahkan *types* untuk TypeScript:
   `bun add -D @types/bcryptjs @types/jsonwebtoken`

### Tahap 2: Infrastruktur Database & Schema
1. Pindahkan struktur database yang sudah ada agar sesuai dengan arsitektur (yaitu ke `src/infrastructure/db/`). Pastikan *path* di `drizzle.config.ts` juga di-*update*.
2. Buka `schema.ts`. Perbarui definisi tabel `users` agar persis sesuai Poin 1 (tambahkan kolom `password`).
3. Jalankan perintah `bun run db:push` untuk menyinkronkan skema ini ke MySQL.

### Tahap 3: Membangun Layer Domain (Core Business)
*Layer ini sangat suci dan tidak boleh bergantung pada pustaka eksternal seperti Drizzle atau framework Elysia.*
1. **Buat `src/domain/user/user.entity.ts`:**
   - Buat tipe/interface murni (tanpa Drizzle) untuk mendeskripsikan model `User`.
   - Buat interface `CreateUserDTO` untuk payload data pembuatan *user* baru.
2. **Buat `src/domain/user/user.error.ts`:**
   - Buat kelas *error* kustom seperti `UserAlreadyExistsError` dan `InvalidCredentialsError`.
3. **Buat `src/domain/user/user.repository.interface.ts`:**
   - Buat `interface IUserRepository` yang mendefinisikan metode:
     - `findByEmail(email: string): Promise<User | null>`
     - `create(data: CreateUserDTO): Promise<User>`

### Tahap 4: Membangun Layer Infrastructure
*Layer ini menangani komunikasi dengan hal-hal teknis pihak ketiga.*
1. **Implementasi Repository Pattern (`src/infrastructure/db/user.repository.ts`):**
   - Buat class `UserRepository` yang *implements* `IUserRepository`.
   - Panggil instance koneksi database Drizzle di sini untuk menjalankan operasi `SELECT` (berdasarkan *email*) dan `INSERT` (pembuatan user baru).
2. **Utilitas Bcrypt (`src/infrastructure/bcrypt/index.ts`):**
   - Buat dan ekspor fungsi untuk melempar password polos (plain) menjadi *hash* `hashPassword(plain: string)`.
   - Buat fungsi untuk mencocokkan password `comparePassword(plain: string, hash: string)`.
3. **Utilitas JWT (`src/infrastructure/jwt/index.ts`):**
   - Buat dan ekspor fungsi untuk menghasilkan *token* `generateToken(payload: any)`. Gunakan *secret key* sederhana atau dari `.env`.

### Tahap 5: Membangun Layer Application (Use Cases)
*Layer ini merupakan otak dari bisnis proses yang sesungguhnya.*
1. **Register Service (`src/application/auth/register.service.ts`):**
   - Buat class `RegisterService` yang menerima instance dari `IUserRepository` (Dependency Injection) melalui *constructor*.
   - Buat fungsi `execute(data)`.
   - **Logika:** Panggil *repository* untuk mengecek apakah email ada. Jika ada, lemparkan error `UserAlreadyExistsError`. Jika belum, *hash password* melalui utilitas bcrypt, dan simpan *user* ke *repository*.
2. **Login Service (`src/application/auth/login.service.ts`):**
   - Buat class `LoginService` yang menerima instance `IUserRepository`.
   - Buat fungsi `execute(email, password)`.
   - **Logika:** Panggil *repository* untuk mencari *user* berdasarkan email. Jika tidak ada, lemparkan error `InvalidCredentialsError`. Jika ada, bandingkan *password* dengan utilitas bcrypt. Jika salah lemparkan error. Jika benar, buat *token* dengan JWT, kembalikan *token* beserta data profil tanpa *password*.

### Tahap 6: Membangun Layer API (Controllers)
*Layer ini menghubungkan dunia luar (HTTP) ke sistem kita.*
1. **Register Route (`src/api/v1/auth/register.ts`):**
   - Terima request HTTP POST dari framework Elysia.
   - Panggil `RegisterService`.
   - Tangkap (catch) error yang terjadi dan kembalikan format JSON sesuai spesifikasi (success false). Jika sukses, kembalikan response JSON (success true).
2. **Login Route (`src/api/v1/auth/login.ts`):**
   - Lakukan hal serupa seperti di atas, panggil `LoginService` dan kembalikan struktur respons yang diminta pada Poin 2.

### Tahap 7: Wiring di Entry Point (`main.ts`)
1. Buka `src/main.ts`.
2. Hapus rute bawaan Elysia yang tidak penting.
3. Instansiasi `UserRepository`.
4. Instansiasi `RegisterService` dan `LoginService` dengan meng-*inject* instance `UserRepository` tersebut secara manual ke konstruktor mereka.
5. Impor rute Elysia dari `api/v1/auth/...` dan daftarkan ke *instance* utama aplikasi.
6. Jalankan server dan tes API ini menggunakan REST Client atau Postman.
