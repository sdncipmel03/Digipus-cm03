/**
 * =========================================================================
 * DIGIPUS - API & DATA LAYER
 * SDN CIPINANG MELAYU 03 PAGI
 * =========================================================================
 * Bertanggung jawab menangani request ke Google Apps Script Web App API
 * dan menyediakan Fallback Storage (Demo Mode) jika URL Apps Script belum diisi.
 * =========================================================================
 */

const STORAGE_KEY_URL = "digipus_gas_url";
const STORAGE_KEY_SETTINGS = "digipus_settings";
const STORAGE_KEY_BOOKS = "digipus_books";
const STORAGE_KEY_LOANS = "digipus_loans";
const STORAGE_KEY_VISITS = "digipus_visits";
const STORAGE_KEY_AUTH = "digipus_auth_token";

const DEFAULT_LOGO_SVG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><circle cx='200' cy='200' r='185' fill='%23e21b23'/><circle cx='200' cy='200' r='132' fill='%23ffffff'/><circle cx='200' cy='200' r='126' fill='none' stroke='%23e21b23' stroke-width='3.5'/><defs><path id='pathTop' d='M 42,200 A 158,158 0 0,1 358,200' fill='none'/><path id='pathBottom' d='M 358,200 A 158,158 0 0,1 42,200' fill='none'/></defs><polygon points='43,200 46,207 54,207 48,212 50,220 43,215 36,220 38,212 32,207 40,207' fill='%23ffffff' transform='rotate(-10 43 210)'/><polygon points='357,200 360,207 368,207 362,212 364,220 357,215 350,220 352,212 346,207 354,207' fill='%23ffffff' transform='rotate(10 357 210)'/><text fill='%23ffffff' font-family='Arial Black, Arial, sans-serif' font-weight='900' font-size='22' letter-spacing='2.5'><textPath href='%23pathTop' startOffset='50%' text-anchor='middle'>SEKOLAH DASAR NEGERI</textPath></text><text fill='%23ffffff' font-family='Arial Black, Arial, sans-serif' font-weight='900' font-size='20.5' letter-spacing='2'><textPath href='%23pathBottom' startOffset='50%' text-anchor='middle'>CIPINANG MELAYU 03 PAGI</textPath></text><polygon points='200,122 204,134 216,134 207,142 210,154 200,147 190,154 193,142 184,134 196,134' fill='%23f4b400'/><polygon points='175,138 178,145 186,145 180,150 182,158 175,153 168,158 170,150 164,145 172,145' fill='%23f4b400' transform='rotate(-15 175 148)'/><polygon points='225,138 228,145 236,145 230,150 232,158 225,153 218,158 220,150 214,145 222,145' fill='%23f4b400' transform='rotate(15 225 148)'/><path d='M 200,172 C 182,156 150,155 125,178 C 145,174 175,172 200,183 C 225,172 255,174 275,178 C 250,155 218,156 200,172 Z' fill='%2300853f'/><circle cx='154' cy='208' r='18' fill='%231b65b6'/><path d='M 154,226 C 142,226 130,230 120,227 C 117,226 122,233 128,239 C 138,248 144,242 144,258 L 138,278 C 137,282 144,282 146,278 L 153,260 L 160,278 C 162,282 169,282 168,278 L 162,258 C 162,244 170,238 188,214 C 189,212 184,213 178,218 C 168,226 160,226 154,226 Z' fill='%231b65b6'/><circle cx='242' cy='210' r='17' fill='%231b65b6'/><path d='M 230,206 C 218,202 210,210 214,217 C 218,222 225,214 229,212 Z' fill='%231b65b6'/><path d='M 254,206 C 266,202 274,210 270,217 C 266,222 259,214 255,212 Z' fill='%231b65b6'/><path d='M 242,226 C 236,226 230,228 220,221 C 214,217 212,219 216,224 C 224,233 232,238 232,246 L 225,264 C 224,266 226,267 229,267 L 257,267 C 260,267 262,266 261,264 L 254,246 C 254,238 262,233 274,225 C 278,222 276,219 270,222 C 260,228 248,226 242,226 Z' fill='%231b65b6'/><path d='M 235,267 L 233,280 C 232,283 238,283 239,280 L 241,267 Z M 249,267 L 251,280 C 252,283 258,283 257,280 L 255,267 Z' fill='%231b65b6'/></svg>";

// Default Seed Data untuk Demonstrasi Awal (Sesuai Data Resmi SDN Cipinang Melayu 03 Pagi)
const DEFAULT_SETTINGS = {
  school_name: "SDN Cipinang Melayu 03 Pagi",
  npsn: "20104331",
  school_address: "Jl. Manunggal II RT.003/RW.02, Cipinang Melayu, Kec. Makasar, Kota Jakarta Timur, DKI Jakarta 13620",
  headmaster_name: "Dra. Hj. Nurjanah, M.Pd",
  headmaster_nip: "196805121993032004",
  librarian_name: "Siti Rahmawati, S.Pd",
  librarian_nip: "198502142010012015",
  loan_period_days: "7",
  school_logo_url: DEFAULT_LOGO_SVG,
  kop_mode: "text", // "text" (Kop Teks Kedinasan) atau "image" (Gambar Kop Surat Sekolah)
  kop_image_url: "",
  library_name: "Perpustakaan 'Cahaya Ilmu' Digipus SDN Cipinang Melayu 03",
  admin_username: "admin"
};

const DEFAULT_BOOKS = [
  {
    id: "BK-001",
    title: "Si Kancil dan Buaya yang Cerdik",
    author: "Rahimsyah",
    publisher: "Pustaka Belajar",
    year: "2021",
    isbn: "978-602-1234-01-1",
    category: "Fiksi",
    type: "Fisik",
    stock: 5,
    location: "Rak Cerita Anak A1",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
    fileUrl: "",
    synopsis: "Kisah fabel klasik penuh pesan moral tentang kecerdikan, budi pekerti, dan kejujuran bagi anak-anak.",
    createdAt: "2026-01-10"
  },
  {
    id: "BK-002",
    title: "Ensiklopedi Sains Anak: Mengenal Tata Surya",
    author: "Dr. Haryanto",
    publisher: "Erlangga for Kids",
    year: "2022",
    isbn: "978-602-1234-02-8",
    category: "Non-Fiksi",
    type: "Digital",
    stock: 99,
    location: "E-Library",
    coverUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    synopsis: "Buku digital interaktif untuk anak SD yang menjelaskan tentang planet, matahari, dan misteri luar angkasa.",
    createdAt: "2026-01-12"
  },
  {
    id: "BK-003",
    title: "Buku Tematik Terpadu Kelas 4: Indahnya Kebersamaan",
    author: "Kemendikbudristek",
    publisher: "Pusat Kurikulum dan Perbukuan",
    year: "2023",
    isbn: "978-602-244-123-4",
    category: "Pelajaran",
    type: "Fisik",
    stock: 24,
    location: "Rak Tematik Kelas 4",
    coverUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400",
    fileUrl: "",
    synopsis: "Buku pegangan siswa kelas 4 SD kurikulum nasional yang menekankan toleransi dan keberagaman budaya.",
    createdAt: "2026-01-15"
  },
  {
    id: "BK-004",
    title: "Petualangan Si Bolang di Hutan Belantara",
    author: "Tim Trans Media",
    publisher: "Bintang Indonesia",
    year: "2020",
    isbn: "978-602-1234-04-2",
    category: "Fiksi",
    type: "Digital",
    stock: 99,
    location: "E-Library",
    coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    synopsis: "Kisah inspiratif tentang petualangan anak-anak desa mencintai lingkungan alam dan kearifan Nusantara.",
    createdAt: "2026-01-20"
  },
  {
    id: "BK-005",
    title: "Kamus Bergambar 3 Bahasa (Indonesia - Inggris - Arab)",
    author: "M. Syafi'i",
    publisher: "WahyuMedia",
    year: "2021",
    isbn: "978-602-1234-05-9",
    category: "Referensi",
    type: "Fisik",
    stock: 8,
    location: "Rak Kamus B2",
    coverUrl: "https://images.unsplash.com/photo-1507842229456-7833503f2d21?w=400",
    fileUrl: "",
    synopsis: "Kamus tematik penuh warna untuk meningkatkan perbendaharaan kata anak sekolah dasar.",
    createdAt: "2026-01-22"
  },
  {
    id: "BK-006",
    title: "Cerita Rakyat Nusantara: Malin Kundang & Danau Toba",
    author: "Tira Ikranegara",
    publisher: "Dua Media",
    year: "2022",
    isbn: "978-602-1234-06-6",
    category: "Fiksi",
    type: "Digital",
    stock: 99,
    location: "E-Library",
    coverUrl: "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=400",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    synopsis: "Kumpulan cerita rakyat penuh hikmah berbakti kepada orang tua dan menjaga amanah leluhur.",
    createdAt: "2026-02-01"
  }
];

const DEFAULT_LOANS = [
  {
    loanId: "PJM-202610-001",
    bookId: "BK-001",
    bookTitle: "Si Kancil dan Buaya yang Cerdik",
    memberName: "Ahmad Fauzi",
    memberRole: "Siswa",
    gradeClass: "Kelas 4A",
    loanDate: "2026-10-01",
    dueDate: "2026-10-08",
    returnDate: "2026-10-07",
    status: "Dikembalikan",
    notes: "Buku kembali dalam kondisi bersih dan rapi"
  },
  {
    loanId: "PJM-202610-002",
    bookId: "BK-003",
    bookTitle: "Buku Tematik Terpadu Kelas 4: Indahnya Kebersamaan",
    memberName: "Siti Aisyah",
    memberRole: "Siswa",
    gradeClass: "Kelas 4B",
    loanDate: "2026-10-14",
    dueDate: "2026-10-21",
    returnDate: "",
    status: "Dipinjam",
    notes: "Tugas kelompok tema kebudayaan"
  },
  {
    loanId: "PJM-202610-003",
    bookId: "BK-005",
    bookTitle: "Kamus Bergambar 3 Bahasa (Indonesia - Inggris - Arab)",
    memberName: "Budi Santoso",
    memberRole: "Siswa",
    gradeClass: "Kelas 5A",
    loanDate: "2026-10-05",
    dueDate: "2026-10-12",
    returnDate: "",
    status: "Terlambat",
    notes: "Tenggat waktu lewat, siswa sudah diberi pemberitahuan"
  }
];

const DEFAULT_VISITS = [
  { id: "VIS-001", date: "2026-10-15", time: "08:15", name: "Ahmad Fauzi", role: "Siswa", gradeUnit: "Kelas 4A", purpose: "Membaca Buku Cerita / Fiksi" },
  { id: "VIS-002", date: "2026-10-15", time: "08:30", name: "Siti Aisyah", role: "Siswa", gradeUnit: "Kelas 4B", purpose: "Meminjam Buku" },
  { id: "VIS-003", date: "2026-10-16", time: "09:00", name: "Pak Hendra, S.Pd", role: "Guru", gradeUnit: "Guru Kelas 5", purpose: "Membaca Buku Pelajaran / Tematik" },
  { id: "VIS-004", date: "2026-10-18", time: "10:15", name: "Rizky Pratama", role: "Siswa", gradeUnit: "Kelas 6A", purpose: "Mengerjakan Tugas / Belajar Kelompok" },
  { id: "VIS-005", date: "2026-10-20", time: "08:00", name: "Zahra Nurhaliza", role: "Siswa", gradeUnit: "Kelas 3B", purpose: "Membaca Buku Cerita / Fiksi" }
];

const DigipusAPI = {
  getAppScriptUrl() {
    // 1. Cek dari Konfigurasi Global Terpusat (config.js) -> Berlaku untuk SEMUA perangkat (HP & PC)
    if (window.DIGIPUS_GLOBAL_CONFIG && window.DIGIPUS_GLOBAL_CONFIG.gasUrl && window.DIGIPUS_GLOBAL_CONFIG.gasUrl.trim()) {
      return window.DIGIPUS_GLOBAL_CONFIG.gasUrl.trim();
    }

    // 2. Cek dari Parameter URL (?gas=... atau ?api=...) saat dibuka dari HP lewat link/QR Code
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const paramGas = urlParams.get("gas") || urlParams.get("api");
      if (paramGas && paramGas.startsWith("https://script.google.com/macros/s/")) {
        localStorage.setItem(STORAGE_KEY_URL, paramGas);
        return paramGas;
      }
    } catch (e) {}

    // 3. Cek dari penyimpanan lokal browser ini
    const saved = localStorage.getItem(STORAGE_KEY_URL);
    if (saved) return saved;

    // 4. Otomatis terdeteksi jika halaman dibuka langsung dari Google Apps Script Web App!
    if (window.location.href.includes("script.google.com/macros/s/")) {
      const detectedUrl = window.location.href.split("?")[0];
      localStorage.setItem(STORAGE_KEY_URL, detectedUrl);
      return detectedUrl;
    }
    return "";
  },

  setAppScriptUrl(url) {
    if (url) {
      const cleanUrl = url.trim();
      localStorage.setItem(STORAGE_KEY_URL, cleanUrl);
      if (window.DIGIPUS_GLOBAL_CONFIG) {
        window.DIGIPUS_GLOBAL_CONFIG.gasUrl = cleanUrl;
      }
    } else {
      localStorage.removeItem(STORAGE_KEY_URL);
      if (window.DIGIPUS_GLOBAL_CONFIG) {
        window.DIGIPUS_GLOBAL_CONFIG.gasUrl = "";
      }
    }
  },

  isCloudConnected() {
    const url = this.getAppScriptUrl();
    return !!(url && url.startsWith("https://script.google.com/macros/s/"));
  },

  // Inisialisasi Mock Data jika di LocalStorage masih kosong
  initLocalData() {
    if (!localStorage.getItem(STORAGE_KEY_SETTINGS)) {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    } else {
      // Migrasi otomatis: ganti logo segitiga lama yang tersimpan di cache browser
      try {
        const s = JSON.parse(localStorage.getItem(STORAGE_KEY_SETTINGS) || "{}");
        if (s.school_logo_url && s.school_logo_url.startsWith("data:image/svg+xml") && !s.school_logo_url.includes("SEKOLAH DASAR NEGERI")) {
          s.school_logo_url = DEFAULT_LOGO_SVG;
          localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(s));
        }
      } catch (e) {}
    }
    if (!localStorage.getItem(STORAGE_KEY_BOOKS)) {
      localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(DEFAULT_BOOKS));
    }
    if (!localStorage.getItem(STORAGE_KEY_LOANS)) {
      localStorage.setItem(STORAGE_KEY_LOANS, JSON.stringify(DEFAULT_LOANS));
    }
    if (!localStorage.getItem(STORAGE_KEY_VISITS)) {
      localStorage.setItem(STORAGE_KEY_VISITS, JSON.stringify(DEFAULT_VISITS));
    }
  },

  // Helper HTTP GET ke Apps Script
  async fetchGasGet(action, params = {}) {
    const url = new URL(this.getAppScriptUrl());
    url.searchParams.append("action", action);
    for (let k in params) {
      url.searchParams.append(k, params[k]);
    }
    const res = await fetch(url.toString(), { method: "GET" });
    return await res.json();
  },

  // Helper HTTP POST ke Apps Script
  async fetchGasPost(action, payload = {}) {
    const url = this.getAppScriptUrl();
    const body = JSON.stringify({ action, ...payload });
    const res = await fetch(url, {
      method: "POST",
      body: body,
      headers: { "Content-Type": "text/plain;charset=utf-8" }
    });
    return await res.json();
  },

  // -------------------------------------------------------------
  // TEST KONEKSI & SETUP DATABASE
  // -------------------------------------------------------------
  async testConnection(customUrl) {
    const targetUrl = customUrl || this.getAppScriptUrl();
    if (!targetUrl) throw new Error("URL Google Apps Script belum diisi!");

    const url = new URL(targetUrl);
    url.searchParams.append("action", "setup");
    
    const res = await fetch(url.toString(), { method: "GET" });
    const json = await res.json();
    if (json.status === "success") {
      this.setAppScriptUrl(targetUrl);
      return json;
    } else {
      throw new Error(json.message || "Gagal menghubungkan ke Apps Script");
    }
  },

  // -------------------------------------------------------------
  // PENGATURAN / BIODATA SEKOLAH
  // -------------------------------------------------------------
  async getSettings() {
    const local = JSON.parse(localStorage.getItem(STORAGE_KEY_SETTINGS) || "null");
    let base = local ? { ...DEFAULT_SETTINGS, ...local } : { ...DEFAULT_SETTINGS };

    // Migrasi logo lama: pastikan jika masih SVG lama, ganti ke logo resmi SDN 03
    if (base.school_logo_url && base.school_logo_url.startsWith("data:image/svg+xml") && !base.school_logo_url.includes("SEKOLAH DASAR NEGERI")) {
      base.school_logo_url = DEFAULT_LOGO_SVG;
    }

    // Dukung konfigurasi global terpusat dari config.js
    if (window.DIGIPUS_GLOBAL_CONFIG) {
      if (window.DIGIPUS_GLOBAL_CONFIG.customLogoUrl) {
        base.school_logo_url = window.DIGIPUS_GLOBAL_CONFIG.customLogoUrl;
      }
      if (window.DIGIPUS_GLOBAL_CONFIG.customKopUrl && !base.kop_image_url) {
        base.kop_image_url = window.DIGIPUS_GLOBAL_CONFIG.customKopUrl;
        base.kop_mode = "image";
      }
    }

    if (this.isCloudConnected()) {
      try {
        const res = await this.fetchGasGet("getSettings");
        if (res.status === "success" && res.data) {
          const cloudData = res.data;
          // Pertahankan logo dan kop lokal jika di cloud masih kosong
          if (!cloudData.school_logo_url && base.school_logo_url) {
            delete cloudData.school_logo_url;
          }
          if (!cloudData.kop_image_url && base.kop_image_url) {
            delete cloudData.kop_image_url;
          }
          base = { ...base, ...cloudData };
          localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(base));
          return base;
        }
      } catch (e) {
        console.warn("Gagal mengambil dari Google Sheet, menggunakan cache:", e);
      }
    }

    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(base));
    return base;
  },

  async saveSettings(settings) {
    // 1. Simpan seketika di localStorage agar instan & tidak pernah hilang saat refresh
    const cur = JSON.parse(localStorage.getItem(STORAGE_KEY_SETTINGS) || "{}");
    const merged = { ...DEFAULT_SETTINGS, ...cur, ...settings };
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(merged));

    // 2. Sinkronisasi ke Cloud Google Sheet & Drive jika terhubung
    if (this.isCloudConnected()) {
      try {
        await this.fetchGasPost("saveSettings", { settings: merged });
      } catch (e) {
        console.warn("Gagal simpan ke cloud, data tersimpan aman di lokal:", e);
      }
    }
    return { status: "success", message: "Pengaturan berhasil disimpan!", data: merged };
  },

  // -------------------------------------------------------------
  // LOGIN ADMIN
  // -------------------------------------------------------------
  async login(username, password) {
    if (this.isCloudConnected()) {
      try {
        const res = await this.fetchGasPost("login", { username, password });
        if (res.status === "success") {
          localStorage.setItem(STORAGE_KEY_AUTH, res.token || "token_admin");
          return res;
        } else {
          throw new Error(res.message || "Username atau password salah");
        }
      } catch(e) {
        if (!e.message.includes("salah")) {
          console.warn("Fallback offline auth:", e);
        } else {
          throw e;
        }
      }
    }

    // Fallback Offline Login
    if (username.trim() === "admin" && password.trim() === "admin123") {
      localStorage.setItem(STORAGE_KEY_AUTH, "token_demo_admin");
      return {
        status: "success",
        message: "Login Berhasil (Mode Offline/Demo)!",
        token: "token_demo_admin",
        user: { username: "admin", role: "Super Admin Perpustakaan" }
      };
    } else {
      throw new Error("Username atau Password Admin salah! (Gunakan default: admin / admin123)");
    }
  },

  logout() {
    localStorage.removeItem(STORAGE_KEY_AUTH);
  },

  isLoggedIn() {
    return !!localStorage.getItem(STORAGE_KEY_AUTH);
  },

  // -------------------------------------------------------------
  // DATA BUKU
  // -------------------------------------------------------------
  async getBooks() {
    if (this.isCloudConnected()) {
      try {
        const res = await this.fetchGasGet("getBooks");
        if (res.status === "success" && Array.isArray(res.data)) {
          localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(res.data));
          return res.data;
        }
      } catch (e) {
        console.warn("Gagal fetch buku cloud, menggunakan lokal:", e);
      }
    }
    return JSON.parse(localStorage.getItem(STORAGE_KEY_BOOKS) || "[]");
  },

  async saveBook(book) {
    // 1. Simpan segera di Local Storage agar responsif & tidak hilang saat refresh
    const books = JSON.parse(localStorage.getItem(STORAGE_KEY_BOOKS) || "[]");
    let isEdit = false;
    let newId = book.id;

    if (!newId) {
      newId = "BK-" + String(books.length + 1).padStart(3, "0");
      book.id = newId;
      book.createdAt = new Date().toISOString().split("T")[0];
      books.unshift(book);
    } else {
      const idx = books.findIndex(b => b.id === newId);
      if (idx !== -1) {
        books[idx] = { ...books[idx], ...book };
        isEdit = true;
      } else {
        books.unshift(book);
      }
    }
    localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(books));

    // 2. Kirim ke Google Apps Script / Sheet jika terhubung
    if (this.isCloudConnected()) {
      try {
        await this.fetchGasPost("saveBook", { book });
      } catch (e) {
        console.warn("Gagal simpan buku cloud, buku aman tersimpan di lokal:", e);
      }
    }

    return {
      status: "success",
      message: isEdit ? "Buku berhasil diperbarui!" : "Buku baru berhasil ditambahkan!",
      data: { id: newId }
    };
  },

  async deleteBook(id) {
    if (this.isCloudConnected()) {
      try {
        await this.fetchGasPost("deleteBook", { id });
      } catch (e) {
        console.warn("Gagal hapus cloud:", e);
      }
    }
    let books = JSON.parse(localStorage.getItem(STORAGE_KEY_BOOKS) || "[]");
    books = books.filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(books));
    return { status: "success", message: "Buku berhasil dihapus." };
  },

  // -------------------------------------------------------------
  // PEMINJAMAN & PENGEMBALIAN
  // -------------------------------------------------------------
  async getLoans() {
    if (this.isCloudConnected()) {
      try {
        const res = await this.fetchGasGet("getLoans");
        if (res.status === "success" && Array.isArray(res.data)) {
          localStorage.setItem(STORAGE_KEY_LOANS, JSON.stringify(res.data));
          return res.data;
        }
      } catch (e) {
        console.warn("Gagal fetch loans cloud, menggunakan lokal:", e);
      }
    }
    return JSON.parse(localStorage.getItem(STORAGE_KEY_LOANS) || "[]");
  },

  async saveLoan(loan) {
    if (this.isCloudConnected()) {
      try {
        const res = await this.fetchGasPost("saveLoan", { loan });
        if (res.status === "success") {
          await this.getLoans();
          return res;
        }
      } catch (e) {
        console.warn("Gagal simpan pinjam cloud:", e);
      }
    }

    const loans = JSON.parse(localStorage.getItem(STORAGE_KEY_LOANS) || "[]");
    const num = loans.length + 1;
    const now = new Date();
    const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    loan.loanId = loan.loanId || `PJM-${ym}-${String(num).padStart(3, "0")}`;
    loan.status = loan.status || "Dipinjam";
    loans.unshift(loan);
    localStorage.setItem(STORAGE_KEY_LOANS, JSON.stringify(loans));

    // Kurangi stok buku lokal jika fisik
    const books = JSON.parse(localStorage.getItem(STORAGE_KEY_BOOKS) || "[]");
    const b = books.find(item => item.id === loan.bookId);
    if (b && b.type !== "Digital" && b.stock > 0) {
      b.stock -= 1;
      localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(books));
    }

    return { status: "success", message: "Peminjaman buku berhasil dicatat!", loanId: loan.loanId };
  },

  async returnBook(loanId, returnDate, notes) {
    if (this.isCloudConnected()) {
      try {
        const res = await this.fetchGasPost("returnBook", { loanId, returnDate, notes });
        if (res.status === "success") {
          await this.getLoans();
          return res;
        }
      } catch(e) {
        console.warn("Gagal kembalikan di cloud:", e);
      }
    }

    const loans = JSON.parse(localStorage.getItem(STORAGE_KEY_LOANS) || "[]");
    const target = loans.find(l => l.loanId === loanId);
    if (target) {
      target.status = "Dikembalikan";
      target.returnDate = returnDate || new Date().toISOString().split("T")[0];
      if (notes) target.notes = notes;
      localStorage.setItem(STORAGE_KEY_LOANS, JSON.stringify(loans));

      // Kembalikan stok fisik
      const books = JSON.parse(localStorage.getItem(STORAGE_KEY_BOOKS) || "[]");
      const b = books.find(item => item.id === target.bookId);
      if (b && b.type !== "Digital") {
        b.stock = (Number(b.stock) || 0) + 1;
        localStorage.setItem(STORAGE_KEY_BOOKS, JSON.stringify(books));
      }
      return { status: "success", message: "Buku berhasil dikembalikan dan stok bertambah!" };
    }
    return { status: "error", message: "Data pinjaman tidak ditemukan." };
  },

  async deleteLoan(loanId) {
    if (this.isCloudConnected()) {
      try {
        await this.fetchGasPost("deleteLoan", { loanId });
      } catch (e) {
        console.warn("Gagal hapus pinjaman di cloud:", e);
      }
    }
    let loans = JSON.parse(localStorage.getItem(STORAGE_KEY_LOANS) || "[]");
    loans = loans.filter(l => l.loanId !== loanId);
    localStorage.setItem(STORAGE_KEY_LOANS, JSON.stringify(loans));
    return { status: "success", message: "Riwayat peminjaman dihapus." };
  },

  // -------------------------------------------------------------
  // BUKU TAMU / KUNJUNGAN
  // -------------------------------------------------------------
  async getVisits() {
    if (this.isCloudConnected()) {
      try {
        const res = await this.fetchGasGet("getVisits");
        if (res.status === "success" && Array.isArray(res.data)) {
          localStorage.setItem(STORAGE_KEY_VISITS, JSON.stringify(res.data));
          return res.data;
        }
      } catch (e) {
        console.warn("Gagal fetch visits cloud, menggunakan lokal:", e);
      }
    }
    return JSON.parse(localStorage.getItem(STORAGE_KEY_VISITS) || "[]");
  },

  async saveVisit(visit) {
    if (this.isCloudConnected()) {
      try {
        const res = await this.fetchGasPost("saveVisit", { visit });
        if (res.status === "success") {
          await this.getVisits();
          return res;
        }
      } catch (e) {
        console.warn("Gagal simpan kunjungan ke cloud:", e);
      }
    }

    const visits = JSON.parse(localStorage.getItem(STORAGE_KEY_VISITS) || "[]");
    const now = new Date();
    visit.id = "VIS-" + String(visits.length + 1).padStart(3, "0");
    visit.date = visit.date || now.toISOString().split("T")[0];
    visit.time = visit.time || `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    visits.unshift(visit);
    localStorage.setItem(STORAGE_KEY_VISITS, JSON.stringify(visits));
    return { status: "success", message: "Kehadiran perpustakaan berhasil dicatat!", id: visit.id };
  },

  // -------------------------------------------------------------
  // UPLOAD FILE KE GOOGLE DRIVE SUBFOLDER
  // -------------------------------------------------------------
  async uploadFileToDrive(fileName, mimeType, base64Data, folderType = "ebook") {
    if (this.isCloudConnected()) {
      return await this.fetchGasPost("uploadFile", {
        fileName,
        mimeType,
        base64Data,
        folderType
      });
    } else {
      // Mock File Upload jika offline: mengembalikan data URL lokal
      return {
        status: "success",
        message: "File tersimpan dalam cache lokal (Mode Demo)",
        fileUrl: `data:${mimeType};base64,${base64Data}`
      };
    }
  }
};

// Inisialisasi awal
DigipusAPI.initLocalData();
window.DigipusAPI = DigipusAPI;
