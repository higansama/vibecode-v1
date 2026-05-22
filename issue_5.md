# Issue #5: Penambahan Domain Product, Order, dan Update User

## Ringkasan Tugas
Anda ditugaskan untuk mengimplementasikan fitur pembaruan tabel user, penambahan domain produk beserta CRUD-nya, dan domain order yang tahan terhadap *race condition* (menggunakan RabbitMQ & Database Transaction). Semua harus tetap mematuhi prinsip **Clean Architecture (DDD)** seperti fitur sebelumnya. Panduan ini dibuat terstruktur agar mudah dieksekusi langkah demi langkah.

---

## Tahap 1: Pembaruan Domain User
1. **Perbarui Skema Database** (`src/infrastructure/db/schema.ts`):
   - Buka tabel `users`.
   - Tambahkan kolom `role`: `varchar(32)`, `notNull()`, dengan nilai *default* `'basic'`.
   - Tambahkan kolom `status`: `varchar(32)`.
2. **Sinkronisasi Database**:
   - Jalankan `bun run db:push`.
   - (Operasi Manual/Query) Pastikan data pengguna yang `role`-nya kosong di-update menjadi `'basic'`.
3. **Perbarui Domain Entity**:
   - Buka `src/domain/user/user.entity.ts`.
   - Tambahkan atribut `role` dan `status` ke interface `User`.

---

## Tahap 2: Pembuatan Skema & Seeder Domain Product
1. **Skema Database (`src/infrastructure/db/schema.ts`)**:
   - Buat tabel `products_table`:
     - `id`: integer, auto increment, primary key.
     - `sku`: varchar(32), not null.
     - `nama_produk`: varchar(64), not null.
     - `created_at`: timestamp, default now.
   - Buat tabel `variant_product_stocks_table`:
     - `id`: integer, auto increment, primary key.
     - `id_product`: integer, not null (tidak perlu relasi/FK eksplisit di Drizzle).
     - `sku_variant`: varchar(32), not null.
     - `stock_product`: unsigned int (atau int), not null.
     - `price`: unsigned int (atau int), not null.
     - `created_at`: timestamp, default now.
   - Jalankan `bun run db:push`.
2. **Buat File Seeder (`src/infrastructure/db/seed.ts`)**:
   - Buat script untuk mengisi `products_table` dan `variant_product_stocks_table` dengan data awal yang saling terhubung (melalui nilai `id_product`).

---

## Tahap 3: Membangun Clean Architecture Domain Product
1. **Domain Layer (`src/domain/product/`)**:
   - `product.entity.ts`: Buat interface/tipe untuk Product, Variant, dan DTO untuk Create/Update.
   - `product.repository.interface.ts`: Definisikan *method* CRUD (create, read, update, delete).
2. **Infrastructure Layer (`src/infrastructure/db/product.repository.ts`)**:
   - Buat `ProductRepository` yang mengimplementasikan interface di atas. Gunakan instance `db` Drizzle.
3. **Application Layer (`src/application/product/`)**:
   - Buat file service (misal: `product.service.ts`) yang menangani logika bisnis CRUD.
4. **API Layer (`src/api/v1/product/index.ts`)**:
   - Buat *route* Elysia untuk metode GET, POST, PUT, DELETE.
   - Pastikan *response* berstandar sama dengan Domain User: `{ success, message, data/detail }`.

---

## Tahap 4: Persiapan Skema & Antrean Domain Order
1. **Skema Database (`src/infrastructure/db/schema.ts`)**:
   - Buat tabel `orders_table`:
     - `id`: integer, auto increment, primary key.
     - `id_user`: integer, not null.
     - `nominal`: integer, not null.
     - `discount`: integer, not null.
     - `grand_total`: integer, not null.
     - `payment_status`: varchar (nilai: 'waiting', 'success', 'expired'), not null.
     - `payment_expired_at`: timestamp (atau time).
     - `created_at`: timestamp, default now.
   - Buat tabel `order_details_table`:
     - `id`: integer, auto increment, primary key.
     - `id_variant_product_stocks_table`: integer, not null.
     - `buy_price`: integer, not null.
     - `qty`: integer, not null.
     - `total_price`: integer, not null.
     - `created_at`: timestamp, default now.
   - Jalankan `bun run db:push`.
2. **Instalasi RabbitMQ**:
   - Jalankan: `bun add amqplib` dan `bun add -D @types/amqplib`.
   - Sediakan `docker-compose.yml` (jika belum ada) untuk me-*running* server RabbitMQ di lokal.
3. **Infrastruktur RabbitMQ (`src/infrastructure/rabbitmq/index.ts`)**:
   - Buat utilitas untuk *connect*, *publishMessage*, dan *consumeMessage*.

---

## Tahap 5: Logika Bisnis Domain Order (Tahan Race Condition)
Fitur ini mensyaratkan order bisa menangani 100 user bersamaan, sehingga harus dibagi menjadi 2 tahap: **Publisher** (Menerima Order) dan **Consumer/Worker** (Memproses Order).

1. **Domain Layer (`src/domain/order/`)**:
   - `order.entity.ts`: Interface Order dan OrderDetail.
   - `order.repository.interface.ts`: Interface yang memuat method `processCheckoutTx`.
2. **Infrastructure Layer (`src/infrastructure/db/order.repository.ts`)**:
   - Buat fungsi `processCheckoutTx(payload)` yang menggunakan `db.transaction(async (tx) => { ... })`.
   - Di dalam transaksi:
     - Kunci baris (*row lock* opsional jika diperlukan) atau lakukan pengecekan *stock*.
     - Kurangi stok dari `variant_product_stocks_table`. Jika stok `< 0`, *rollback* (lempar *error*).
     - Hitung *nominal*, *discount*, dan *grand_total*.
     - Tentukan `payment_expired_at` (Waktu sekarang + 1 jam).
     - Insert ke `orders_table` (status: 'waiting').
     - Insert ke `order_details_table`.
3. **Application Layer (Use Cases)**:
   - `checkout.service.ts` (Publisher):
     - Validasi *user*: Cari *user* berdasarkan ID, pastikan *role* = `'basic'` dan status `!= 'forbidden'` serta `!= 'in-active'`.
     - *Publish* data pesanan mentah (ID User, ID Variant, Qty) ke antrean RabbitMQ (`order_queue`).
     - Kembalikan respons ke *user*: "Pesanan sedang diproses dalam antrean".
   - `order.worker.ts` (Consumer):
     - Dengarkan *queue* RabbitMQ.
     - Saat pesan masuk, jalankan fungsi `processCheckoutTx` dari repository.
     - Tangkap jika terjadi kegagalan (misal stok habis) dan akui pesan (*acknowledge/ack*) agar tidak me-loop tanpa henti.

---

## Tahap 6: API Layer & Wiring
1. **API Layer (`src/api/v1/order/index.ts`)**:
   - Buat endpoint `POST /api/v1/order/checkout`. Pastikan *endpoint* ini dilindungi oleh *middleware* otentikasi (JWT) untuk mendapatkan `id_user`.
2. **Wiring di `main.ts`**:
   - Lakukan Dependency Injection untuk Product dan Order.
   - Daftarkan *route* `/api/v1/product` dan `/api/v1/order`.
   - Panggil/inisialisasi `order.worker.ts` agar consumer RabbitMQ berjalan di *background* bersamaan dengan server Elysia.
