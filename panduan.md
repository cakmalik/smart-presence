# PRD — Sistem Presensi Sekolah Multi Tenant

---

# 1. Latar Belakang

Sekolah membutuhkan sistem presensi digital untuk:

* presensi sholat dhuhur berjamaah harian
* presensi event/acara sekolah
* pengelolaan siswa dan kelas
* pencatatan kehadiran secara cepat menggunakan QR Code

Sistem harus mendukung banyak sekolah dalam satu aplikasi (multi-tenant), dengan hak akses berbeda untuk:

* superadmin
* admin sekolah
* operator/petugas

---

# 2. Tujuan Project

Membuat platform presensi sekolah yang:

* mudah digunakan
* cepat saat proses scan
* dapat mengelola banyak sekolah sekaligus
* memiliki histori presensi lengkap
* scalable untuk pengembangan fitur selanjutnya

---

# 3. Scope MVP

## Fitur Utama MVP

---

## Multi Sekolah

* Superadmin dapat membuat sekolah
* Setiap sekolah memiliki data terpisah
* Setiap sekolah memiliki user sendiri

---

## Manajemen User & Role

### Role

* Superadmin
* Admin Sekolah
* Operator/Petugas

### Hak Akses

#### Superadmin

* mengelola seluruh sekolah
* membuat akun admin/operator
* monitoring seluruh data

#### Admin Sekolah

* mengelola siswa
* mengelola kelas
* mengelola event
* melihat laporan
* mengelola operator

#### Operator

* melakukan scan presensi
* input manual presensi
* melihat data terbatas

---

## Manajemen Siswa

### Fitur

* tambah/edit/hapus siswa
* import siswa
* assign kelas
* generate QR Code siswa
* cetak kartu siswa

### Data Siswa

* NIS/NISN
* nama
* kelas
* status aktif
* QR Code unik

---

## Manajemen Kelas

### Fitur

* CRUD kelas
* assign wali kelas (optional)

---

## Presensi Sholat Dhuhur Harian

### Fitur

* presensi harian otomatis berdasarkan hari aktif sekolah
* scan QR siswa
* input manual
* validasi duplicate attendance
* histori presensi

### Data

* tanggal
* waktu scan
* operator
* status hadir

---

## Presensi Event Sekolah

### Fitur

* membuat event
* menentukan jadwal event
* scan QR untuk event
* presensi manual
* laporan peserta hadir

### Data

* nama event
* tanggal
* waktu
* lokasi
* status aktif

---

## QR Code Scanner

### Fitur

* scan menggunakan kamera device
* scan cepat
* auto-submit
* fallback input manual

### Support

* HP Android
* tablet
* laptop webcam

---

## Dashboard

### Superadmin

* jumlah sekolah
* total siswa
* statistik presensi

### Admin Sekolah

* statistik sekolah sendiri
* presensi harian
* event aktif

---

## Laporan

### Fitur

* rekap presensi harian
* rekap event
* filter tanggal
* filter kelas
* export Excel/PDF

---

# 4. Out of Scope (MVP)

Belum dikerjakan:

* mobile app native
* fingerprint
* RFID/NFC
* notifikasi WhatsApp
* parent portal
* pembayaran sekolah
* realtime websocket
* offline sync

---

# 5. Target User

## Superadmin

Pemilik sistem.

## Admin Sekolah

Staff administrasi sekolah.

## Operator/Petugas

Petugas scan presensi.

---

# 6. Arsitektur Sistem

## Tech Stack

### Backend

* Laravel

### Frontend

* Laravel Inertia React

### Database

* PostgreSQL atau MySQL

### QR Scanner

* html5-qrcode atau library JS serupa

### Hosting

* VPS Linux
* atau shared hosting besar

---

# 7. Multi Tenant Strategy

Menggunakan:

* single database
* tenant isolation via `school_id`

Semua tabel utama memiliki:

* school_id

Contoh:

* students
* classrooms
* users
* events
* attendances

---

# 8. Struktur Role

| Role          | Akses             |
| ------------- | ----------------- |
| Superadmin    | Semua sekolah     |
| Admin Sekolah | Sekolah sendiri   |
| Operator      | Presensi terbatas |

---

# 9. Database Awal (High Level)

## schools

* id
* name
* address
* status

---

## users

* id
* school_id
* name
* email
* password
* role

---

## classrooms

* id
* school_id
* name

---

## students

* id
* school_id
* classroom_id
* nis
* name
* qr_code
* status

---

## events

* id
* school_id
* name
* start_at
* end_at
* location

---

## attendances

* id
* school_id
* student_id
* operator_id
* attendance_type
* event_id nullable
* attended_at

---

# 10. Attendance Type

Enum:

* dhuhur
* event

---

# 11. Flow Presensi Dhuhur

1. Operator login
2. Buka halaman scan
3. Scan QR siswa
4. Sistem validasi:

   * siswa aktif
   * belum presensi hari ini
5. Simpan attendance
6. Tampilkan sukses

### Fallback

* cari nama siswa
* input manual

---

# 12. Flow Presensi Event

1. Admin membuat event
2. Event aktif saat hari H
3. Operator scan siswa
4. Sistem menyimpan attendance event
5. Laporan dapat dilihat admin

---

# 13. Security

* RBAC permission
* tenant isolation
* CSRF protection
* rate limiting
* audit log (future)
* secure QR token

---

# 14. Future Roadmap

## Phase 2

* WhatsApp notification
* Parent portal
* Mobile app
* Push notification

## Phase 3

* RFID/NFC
* Face recognition
* Fingerprint integration
* Analytics dashboard

---

# 15. Estimasi Modul Pengerjaan

## Phase 1

* Auth
* Multi school
* Role permission
* CRUD siswa
* CRUD kelas

## Phase 2

* QR generator
* Scanner
* Presensi dhuhur

## Phase 3

* Event attendance
* Reporting
* Export

## Phase 4

* Optimization
* Security
* UI/UX polish

---

# 16. Rekomendasi Package Laravel

## Permission

* spatie/laravel-permission

## Excel Export

* Laravel Excel

## QR Code

* Simple QrCode

## Activity Log

* spatie/laravel-activitylog

---

# 17. Kesimpulan

Project ini sangat cocok menggunakan:

* Laravel monolith
* Inertia React
* multi tenant sederhana via school_id

Karena:

* development cepat
* maintainable
* scalable
* hemat biaya
* cocok untuk solo developer

