# 📚 PETUNJUK LENGKAP PENGGUNAAN & DEPLOYMENT DIGIPUS
## SDN CIPINANG MELAYU 03 PAGI

Aplikasi **Digipus** adalah Sistem Informasi Perpustakaan Digital yang dirancang khusus untuk lingkungan sekolah dasar dengan antarmuka yang ramah, edukatif, dan ceria. Aplikasi ini terintegrasi penuh dengan **Google Sheets** sebagai database online dan **Google Drive** untuk penyimpanan otomatis file E-Book PDF dan Logo Sekolah ke dalam subfolder khusus.

---

## 📁 Struktur Berkas Aplikasi

```text
Aplikasi Perpustakaan/
│
├── Buka_Digipus.bat          <-- Klik 2x untuk langsung membuka aplikasi di Windows
├── PETUNJUK_LENGKAP.md       <-- Panduan langkah demi langkah ini
│
├── backend/
│   ├── Code.gs               <-- Kode Google Apps Script (API & Auto-Folder Drive)
│   └── appsscript.json       <-- Konfigurasi manifest Apps Script
│
└── frontend/
    ├── index.html            <-- Antarmuka web utama (Katalog Publik & Dashboard Admin)
    ├── css/
    │   └── style.css         <-- Desain ramah anak & print engine Kop Surat resmi A4
    └── js/
        ├── api.js            <-- Penghubung API Google Apps Script & Offline Cache
        ├── app.js            <-- Logika aplikasi, pencarian, input buku, peminjaman
        └── reports.js        <-- Generator format laporan resmi kedinasan
```

---

## 🚀 LANGKAH 1: Mencoba Aplikasi Secara Langsung (Mode Demo / Offline)

Aplikasi telah dilengkapi **Smart Offline Cache**. Anda dapat langsung menggunakannya detik ini juga tanpa konfigurasi server yang rumit:

1. Buka folder `Aplikasi Perpustakaan`.
2. Klik 2x pada file **`Buka_Digipus.bat`** (atau klik kanan `frontend/index.html` dan pilih *Open with Google Chrome / Microsoft Edge*).
3. Aplikasi akan langsung terbuka di browser Anda!
4. **Akun Login Admin Bawaan**:
   - **Username**: `admin`
   - **Password**: `admin123`

---

## ☁️ LANGKAH 2: Menghubungkan ke Google Sheet & Google Drive Otomatis

Agar semua data buku, peminjaman, kunjungan, dan file E-Book tersimpan **otomatis di Google Drive & Google Sheet akun sekolah Anda**, ikuti 5 langkah mudah berikut (hanya butuh 3 menit):

### 1. Buka Google Apps Script
1. Buka browser dan kunjungi: **[https://script.google.com/](https://script.google.com/)**
2. Pastikan Anda sudah login menggunakan akun Google sekolah / pribadi.
3. Klik tombol **+ Proyek baru** (*New Project*).
4. Beri nama proyek di kiri atas: `Backend Digipus SDN Cipinang Melayu 03`.

### 2. Salin Kode Backend
1. Buka berkas `backend/Code.gs` yang ada di laptop Anda.
2. Salin (**Copy**) seluruh isi kode dari berkas tersebut.
3. Di editor Google Apps Script, hapus kode bawaan `function myFunction() {}`, lalu tempel (**Paste**) kode dari `Code.gs`.
4. Tekan ikon **Simpan** (💾) atau `Ctrl + S`.

### 3. Jalankan Inisialisasi Otomatis (Membuat Folder & Sheet Otomatis)
1. Pada menu fungsi di bagian atas (sebelah tombol *Debug*), pilih fungsi: **`initDatabase`**.
2. Klik tombol **Jalankan** (*Run* ▶).
3. Google akan memunculkan jendela **Authorization Required** (Izin Akses):
   - Klik **Review Permissions** (Tinjau Izin).
   - Pilih akun Google Anda.
   - Jika muncul peringatan *"Google hasn't verified this app"*, klik **Advanced** (Lanjutan) di kiri bawah, lalu klik **Go to Backend Digipus (unsafe)**.
   - Klik **Allow** (Izinkan).
4. **SELESAI!** Periksa Google Drive Anda, secara otomatis sistem telah membuat:
   - 📁 **Folder Utama**: `Digipus_SDN_Cipinang_Melayu_03`
   - 📁 **Subfolder 1**: `Ebook_Files` (Penyimpanan otomatis file E-Book PDF)
   - 📁 **Subfolder 2**: `School_Assets` (Penyimpanan logo sekolah & dokumen)
   - 📊 **Google Spreadsheet**: `DB_Digipus_SDN_Cipinang_Melayu_03` (Lengkap dengan 4 sheet: `Settings`, `Books`, `Loans`, dan `Visits`).

### 4. Deploy sebagai Web App
1. Di halaman Google Apps Script, klik tombol biru **Deploy** (Terapkan) di pojok kanan atas, lalu pilih **New deployment** (Penerapan baru).
2. Klik ikon gerigi (⚙️) di sebelah *Select type*, pilih **Web app**.
3. Isi konfigurasi berikut:
   - **Description**: `Digipus Web App v1`
   - **Execute as**: `Me (email-anda@gmail.com)`
   - **Who has access**: `Anyone` *(Penting: Pilih Anyone agar aplikasi web frontend dapat membaca & menulis data)*.
4. Klik tombol **Deploy**.
5. Salin (**Copy**) **Web App URL** yang muncul (URL berakhiran `/exec`, contoh: `https://script.google.com/macros/s/AKfycb.../exec`).

### 5. Hubungkan ke Aplikasi Digipus
1. Buka aplikasi Digipus Anda di browser (`Buka_Digipus.bat`).
2. Klik tombol **Login Admin** di pojok kanan atas (User: `admin` | Pass: `admin123`).
3. Di menu sidebar admin, pilih **⚙️ Biodata & Pengaturan**.
4. Gulir ke bagian kanan: **Logo Sekolah & Google Apps Script**.
5. Tempelkan URL yang baru Anda salin pada kolom **URL Web App Google Apps Script**.
6. Klik tombol hijau **⚡ Tes Koneksi & Sinkronisasi**.
7. Status di pojok kanan atas akan langsung berubah menjadi hijau: **☁️ Terhubung ke Google Sheet & Drive**!

---

## 🌟 FITUR-FITUR UTAMA DIGIPUS

### 1. Portal Publik & Katalog Siswa/Guru
- Tampilan ramah dan edukatif untuk siswa SDN Cipinang Melayu 03 Pagi.
- Pencarian cerdas berdasarkan judul, pengarang, maupun materi pelajaran.
- Filter kategori ramah anak: *Fiksi & Cerita Anak, Non-Fiksi & Sains, Pelajaran Tematik, Kamus & Referensi, Agama & Budi Pekerti*.
- Filter jenis: Buku Fisik dan Buku Digital (E-Book).
- Untuk buku digital, siswa dapat langsung mengklik tombol **📖 Buka & Baca E-Book Sekarang**.

### 2. Buku Tamu Kunjungan Digital
- Siswa atau guru yang berkunjung ke perpustakaan dapat mengisi daftar hadir mandiri dengan mengklik tombol **📝 Isi Buku Tamu** di navigasi atas.
- Mengisi nama, kelas (Kelas 1A s/d 6B), dan tujuan kunjungan.
- Data langsung masuk ke rekap statistik perpustakaan.

### 3. Manajemen Buku (Fisik & Digital)
- Form input buku lengkap: Judul, Pengarang, Penerbit, Tahun, ISBN, Kategori, Lokasi Rak, dan Sinopsis.
- **Dukungan Buku Digital (E-Book)**: Anda dapat mengunggah file PDF langsung dari laptop. File akan otomatis dikirim dan disimpan ke Google Drive subfolder `Ebook_Files`.
- **Dukungan Buku Fisik**: Mengatur jumlah stok eksemplar di rak secara dinamis.

### 4. Sirkulasi Peminjaman & Pengembalian
- Pilihan buku fisik otomatis mendeteksi sisa stok di rak.
- Otomatis menghitung tanggal tempo peminjaman (default 7 hari sesuai aturan sekolah).
- Status peminjaman dengan penanda warna: *Dipinjam (Kuning)*, *Dikembalikan (Hijau)*, dan *Terlambat (Merah)*.
- Tombol **✓ Kembalikan** dengan 1-klik yang otomatis memulihkan stok eksemplar buku di database.

### 5. Laporan Resmi & Rekapitulasi Cetak PDF Rapi (Standar A4 Kedinasan)
Tersedia 3 jenis laporan resmi yang siap cetak atau diunduh sebagai PDF:
1. **Rekapitulasi Peminjaman & Sirkulasi Buku Bulanan** (Dapat difilter per bulan & tahun).
2. **Rekapitulasi Bulanan Kunjungan Perpustakaan** (Laporan kehadiran siswa & guru).
3. **Laporan Data Katalog & Koleksi Buku Perpustakaan** (Inventaris lengkap perpustakaan).

**Format Cetak Resmi Dilengkapi**:
- **KOP SURAT RESMI**: Pemerintah Provinsi DKI Jakarta - Dinas Pendidikan - Suku Dinas Pendidikan Wilayah I Kota Administrasi Jakarta Timur - SDN Cipinang Melayu 03 Pagi (Lengkap dengan NPSN, Akreditasi, Alamat, dan Logo Sekolah).
- **Garis Ganda Kedinasan**.
- **Ringkasan Statistik**.
- **Tabel Data Rapi Bergaris**.
- **Tanda Tangan Kedinasan**:
  - Mengetahui: Kepala SDN Cipinang Melayu 03 Pagi (Nama + NIP).
  - Pengelola Perpustakaan Digipus (Nama + NIP).
  - Titimangsa Jakarta otomatis.
- Tombol **🖨️ Cetak / Simpan PDF**: Menggunakan format cetak standar kertas A4, tinggal pilih *Destination: Save as PDF* di jendela cetak browser.

### 6. Biodata Sekolah & Upload Logo
- Mengubah Nama Sekolah, NPSN, Alamat Lengkap, Nama & NIP Kepala Sekolah, serta Nama & NIP Pengelola Perpustakaan.
- Upload Logo Baru: File gambar logo akan otomatis disimpan ke Google Drive subfolder `School_Assets` dan langsung terpasang pada KOP Surat serta navigasi aplikasi.

## 🌐 CARA DEPLOY & MENGAKSES DARI KOMPUTER LAIN

Agar aplikasi **Digipus** dapat dibuka oleh guru di ruang guru, siswa di lab komputer, atau dari komputer mana pun, Anda memiliki **3 pilihan metode** yang sangat mudah:

---

### METODE 1: Akses Jaringan Lokal Wi-Fi Sekolah (Paling Cepat & Tanpa Internet Hosting)
Jika komputer lain terhubung ke jaringan **Wi-Fi atau kabel LAN yang sama di SDN Cipinang Melayu 03 Pagi**:

1. Di komputer utama/server perpustakaan, klik 2x file:
   👉 **`Bagikan_Ke_Komputer_Lain_WiFi.bat`**
2. Jendela hitam akan muncul dan menampilkan alamat IP Anda, contoh:
   ```text
   http://192.168.1.15:8080/
   ```
3. Buka browser di komputer guru atau lab komputer lain, lalu ketik alamat tersebut di address bar (misal: `http://192.168.1.15:8080/`).
4. **Selesai!** Komputer lain dapat langsung membuka katalog buku, mengisi buku tamu, dan login admin.
5. Pastikan jendela hitam server tetap terbuka selama jam operasional perpustakaan.

---

### METODE 2: Deploy Online 100% Gratis via Vercel (Rekomendasi Utama)
Dengan mendeploy ke **Vercel**, aplikasi Digipus akan online 24 jam dengan tautan HTTPS resmi (contoh: `https://digipus-cipinang-melayu03.vercel.app`) dan dapat dibuka dari komputer mana saja, di rumah, maupun di HP guru/siswa.

#### Panduan Langkah demi Langkah Deploy ke Vercel:

##### Cara A: Menggunakan GitHub + Vercel Dashboard (Paling Rapi & Standar Industri)
1. **Buat Akun di Vercel**:
   - Buka **[https://vercel.com/signup](https://vercel.com/signup)**
   - Pilih **Continue with GitHub** (atau daftar menggunakan akun Google Anda).
2. **Upload Folder Aplikasi ke GitHub**:
   - Buat repositori baru di GitHub (misal bernama: `digipus-sdn-cipinang-03`).
   - Unggah seluruh folder `Aplikasi Perpustakaan` ke repositori tersebut.
3. **Impor Proyek ke Vercel**:
   - Di dashboard Vercel, klik tombol **Add New...** -> pilih **Project**.
   - Pilih repositori `digipus-sdn-cipinang-03` yang baru Anda buat, lalu klik **Import**.
   - Pada bagian **Root Directory**, biarkan default `./` (karena konfigurasi `vercel.json` sudah otomatis mengarahkan ke folder frontend).
   - Klik tombol biru **Deploy**.
4. **Selesai!**
   - Dalam hitungan 20 detik, Vercel akan memberikan link domain website Anda (misal: `https://digipus-sdn-cipinang-03.vercel.app`).
   - Buka link tersebut, login ke Admin (`admin` / `admin123`), lalu masukkan URL Google Apps Script Anda sekali saja. Semua komputer di dunia bisa langsung membuka Digipus lewat link tersebut!

##### Cara B: Menggunakan Vercel CLI (Lewat Terminal / Command Prompt)
Jika laptop Anda memiliki Node.js:
1. Buka Command Prompt (CMD) di folder `Aplikasi Perpustakaan`.
2. Jalankan perintah instalasi Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. Ketik perintah deploy:
   ```bash
   vercel
   ```
4. Masuk (*login*) ke akun Vercel Anda lewat browser saat diminta.
5. Tekan Enter pada setiap pertanyaan pengaturan default.
6. Ketik perintah:
   ```bash
   vercel --prod
   ```
7. URL website online Anda langsung muncul di layar terminal!

---

### METODE 3: Menyalin Folder ke Komputer Lain (Pakai Flashdisk / Google Drive)
Karena backend database sudah tersimpan di **Google Spreadsheet & Google Drive**:
1. Cukup salin (**Copy**) seluruh folder `Aplikasi Perpustakaan` ke Flashdisk atau upload ke Google Drive.
2. Tempelkan (**Paste**) di komputer lain (misalnya komputer ruang piket atau lab).
3. Di komputer lain tersebut, cukup klik 2x file `Buka_Digipus.bat`.
4. Buka menu **Biodata & Pengaturan** -> masukkan URL Google Apps Script Anda -> Klik **Tes Koneksi & Sinkronisasi**.
5. Semua data buku, peminjaman, dan kunjungan akan otomatis terhubung sama persis secara real-time!

---

## 🔒 Keamanan & Pengelolaan
- Dirancang untuk **satu admin pengelola** perpustakaan.
- Password admin dapat diubah sewaktu-waktu melalui sheet `Settings` pada Google Spreadsheet atau menu pengaturan.

Selamat mengelola Perpustakaan Digital SDN Cipinang Melayu 03 Pagi! 📚✨

