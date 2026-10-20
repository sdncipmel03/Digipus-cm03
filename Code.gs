/**
 * =========================================================================
 * DIGIPUS - SISTEM PERPUSTAKAAN DIGITAL
 * SDN CIPINANG MELAYU 03 PAGI
 * =========================================================================
 * Backend Google Apps Script (Apps Script Web App)
 * 
 * Fitur:
 * 1. Otomatis membuat Google Spreadsheet Database jika belum ada
 * 2. Otomatis membuat Folder Utama & Subfolder Google Drive:
 *    - Folder Utama: Digipus_SDN_Cipinang_Melayu_03
 *    - Subfolder: Ebook_Files (File PDF Buku Digital)
 *    - Subfolder: School_Assets (Logo Sekolah & Dokumen)
 * 3. Otomatis membuat dan memformat Sheet:
 *    - Settings (Pengaturan Biodata Sekolah & Akun Admin)
 *    - Books (Katalog Buku Fisik & Digital)
 *    - Loans (Sirkulasi Peminjaman & Pengembalian)
 *    - Visits (Buku Tamu / Rekap Kunjungan)
 * 4. API Endpoint doPost dan doGet untuk Web Client
 * =========================================================================
 */

// KONSTANTA NAMA
var APP_NAME = "Digipus - SDN Cipinang Melayu 03 Pagi";
var ROOT_FOLDER_NAME = "Digipus_SDN_Cipinang_Melayu_03";
var SPREADSHEET_NAME = "DB_Digipus_SDN_Cipinang_Melayu_03";
var SUBFOLDER_EBOOKS = "Ebook_Files";
var SUBFOLDER_ASSETS = "School_Assets";

// PROPERTY STORE KEYS
var PROP_SPREADSHEET_ID = "DIGIPUS_SPREADSHEET_ID";
var PROP_ROOT_FOLDER_ID = "DIGIPUS_ROOT_FOLDER_ID";
var PROP_EBOOKS_FOLDER_ID = "DIGIPUS_EBOOKS_FOLDER_ID";
var PROP_ASSETS_FOLDER_ID = "DIGIPUS_ASSETS_FOLDER_ID";

/**
 * Inisialisasi Otomatis Folder Drive dan Spreadsheet Database
 */
function initDatabase() {
  var userProperties = PropertiesService.getScriptProperties();
  var ssId = userProperties.getProperty(PROP_SPREADSHEET_ID);
  var rootFolderId = userProperties.getProperty(PROP_ROOT_FOLDER_ID);
  
  var rootFolder;
  if (rootFolderId) {
    try {
      rootFolder = DriveApp.getFolderById(rootFolderId);
    } catch(e) {
      rootFolder = null;
    }
  }
  
  if (!rootFolder) {
    var folders = DriveApp.getFoldersByName(ROOT_FOLDER_NAME);
    if (folders.hasNext()) {
      rootFolder = folders.next();
    } else {
      rootFolder = DriveApp.createFolder(ROOT_FOLDER_NAME);
    }
    userProperties.setProperty(PROP_ROOT_FOLDER_ID, rootFolder.getId());
  }
  
  // Buat Subfolder jika belum ada
  var ebooksFolder = getOrCreateSubFolder(rootFolder, SUBFOLDER_EBOOKS);
  var assetsFolder = getOrCreateSubFolder(rootFolder, SUBFOLDER_ASSETS);
  userProperties.setProperty(PROP_EBOOKS_FOLDER_ID, ebooksFolder.getId());
  userProperties.setProperty(PROP_ASSETS_FOLDER_ID, assetsFolder.getId());
  
  // Buat Spreadsheet jika belum ada
  var ss;
  if (ssId) {
    try {
      ss = SpreadsheetApp.openById(ssId);
    } catch(e) {
      ss = null;
    }
  }
  
  if (!ss) {
    var files = rootFolder.getFilesByName(SPREADSHEET_NAME);
    if (files.hasNext()) {
      var file = files.next();
      ss = SpreadsheetApp.openById(file.getId());
    } else {
      ss = SpreadsheetApp.create(SPREADSHEET_NAME);
      var ssFile = DriveApp.getFileById(ss.getId());
      ssFile.moveTo(rootFolder);
    }
    userProperties.setProperty(PROP_SPREADSHEET_ID, ss.getId());
  }
  
  // Konfigurasi Sheets
  setupSettingsSheet(ss);
  setupBooksSheet(ss);
  setupLoansSheet(ss);
  setupVisitsSheet(ss);
  
  return {
    status: "success",
    message: "Inisialisasi Database dan Folder Drive Berhasil!",
    spreadsheetId: ss.getId(),
    spreadsheetUrl: ss.getUrl(),
    rootFolderUrl: rootFolder.getUrl()
  };
}

function getOrCreateSubFolder(parentFolder, name) {
  var subFolders = parentFolder.getFoldersByName(name);
  if (subFolders.hasNext()) {
    return subFolders.next();
  }
  return parentFolder.createFolder(name);
}

function getDatabaseSpreadsheet() {
  var userProperties = PropertiesService.getScriptProperties();
  var ssId = userProperties.getProperty(PROP_SPREADSHEET_ID);
  if (!ssId) {
    initDatabase();
    ssId = userProperties.getProperty(PROP_SPREADSHEET_ID);
  }
  return SpreadsheetApp.openById(ssId);
}

/**
 * Setup Sheet: Settings
 */
function setupSettingsSheet(ss) {
  var sheet = ss.getSheetByName("Settings");
  if (!sheet) {
    sheet = ss.insertSheet("Settings");
    var defaultSheet = ss.getSheetByName("Sheet1");
    if (defaultSheet && ss.getSheets().length > 1) {
      try { ss.deleteSheet(defaultSheet); } catch(e){}
    }
  }
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Key", "Value", "Keterangan"]);
    var defaultSettings = [
      ["admin_username", "admin", "Username Login Admin Perpustakaan"],
      ["admin_password", "admin123", "Password Login Admin (Dapat diganti)"],
      ["school_name", "SDN Cipinang Melayu 03 Pagi", "Nama Lengkap Sekolah"],
      ["npsn", "20104331", "Nomor Pokok Sekolah Nasional"],
      ["school_address", "Jl. Kartika Eka Paksi KPAD Jatiwaringin RT.010/006 Kel. Cipinang Melayu Kec. Makasar Jakarta Timur", "Alamat Sekolah"],
      ["headmaster_name", "Dra. Hj. Nurjanah, M.Pd", "Nama Kepala Sekolah"],
      ["headmaster_nip", "196805121993032004", "NIP Kepala Sekolah"],
      ["librarian_name", "Siti Rahmawati, S.Pd", "Nama Petugas/Pengelola Perpustakaan"],
      ["librarian_nip", "198502142010012015", "NIP Petugas Perpustakaan"],
      ["school_logo_url", "", "URL Logo Sekolah di Drive"],
      ["kop_mode", "text", "Mode Kop Surat (text atau image)"],
      ["kop_image_url", "", "URL Gambar Kop Surat Resmi"],
      ["library_name", "Perpustakaan 'Cahaya Ilmu' Digipus SDN Cipinang Melayu 03", "Nama Ruang Perpustakaan"],
      ["loan_period_days", "7", "Lama Maksimal Peminjaman (Hari)"]
    ];
    for (var i = 0; i < defaultSettings.length; i++) {
      sheet.appendRow(defaultSettings[i]);
    }
    formatHeaderRow(sheet);
  }
}

/**
 * Setup Sheet: Books
 */
function setupBooksSheet(ss) {
  var sheet = ss.getSheetByName("Books");
  if (!sheet) sheet = ss.insertSheet("Books");
  
  if (sheet.getLastRow() === 0) {
    var headers = [
      "ID", "Judul", "Pengarang", "Penerbit", "Tahun Terbit", 
      "ISBN", "Kategori", "Jenis", "Stok", "Lokasi Rak", 
      "Cover URL", "File Digital URL", "Sinopsis", "Tanggal Input"
    ];
    sheet.appendRow(headers);
    
    // Sample Data Buku Edukatif untuk SD
    var sampleBooks = [
      [
        "BK-001", "Si Kancil dan Buaya yang Cerdik", "Rahimsyah", "Pustaka Belajar", "2021",
        "978-602-1234-01-1", "Fiksi", "Fisik", "5", "Rak Cerita Anak A1",
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400", "", 
        "Kisah fabel klasik penuh pesan moral tentang kecerdikan dan kejujuran.", "2026-01-10"
      ],
      [
        "BK-002", "Ensiklopedi Sains Anak: Mengenal Tata Surya", "Dr. Haryanto", "Erlangga for Kids", "2022",
        "978-602-1234-02-8", "Non-Fiksi", "Digital", "99", "E-Library",
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400", "https://drive.google.com", 
        "Panduan interaktif mengenal planet, bintang, dan fenomena antariksa untuk tingkat SD.", "2026-01-12"
      ],
      [
        "BK-003", "Buku Tematik Terpadu Kelas 4: Indahnya Kebersamaan", "Kemendikbudristek", "Pusat Kurikulum dan Perbukuan", "2023",
        "978-602-244-123-4", "Pelajaran", "Fisik", "25", "Rak Tematik Kelas 4",
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400", "", 
        "Buku teks pelajaran kurikulum nasional tematik untuk siswa SD kelas 4.", "2026-01-15"
      ],
      [
        "BK-004", "Petualangan Si Bolang di Hutan Belantara", "Tim Trans Media", "Bintang Indonesia", "2020",
        "978-602-1234-04-2", "Fiksi", "Digital", "99", "E-Library",
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400", "https://drive.google.com", 
        "Kisah inspiratif anak negeri yang mencintai alam dan kearifan lokal Nusantara.", "2026-01-20"
      ],
      [
        "BK-005", "Kamus Bergambar 3 Bahasa (Indonesia - Inggris - Arab)", "M. Syafi'i", "WahyuMedia", "2021",
        "978-602-1234-05-9", "Referensi", "Fisik", "8", "Rak Kamus B2",
        "https://images.unsplash.com/photo-1507842229456-7833503f2d21?w=400", "", 
        "Kamus kosakata dasar dengan ilustrasi warna-warni mempermudah daya ingat siswa SD.", "2026-01-22"
      ]
    ];
    
    for (var i = 0; i < sampleBooks.length; i++) {
      sheet.appendRow(sampleBooks[i]);
    }
    formatHeaderRow(sheet);
  }
}

/**
 * Setup Sheet: Loans (Peminjaman)
 */
function setupLoansSheet(ss) {
  var sheet = ss.getSheetByName("Loans");
  if (!sheet) sheet = ss.insertSheet("Loans");
  
  if (sheet.getLastRow() === 0) {
    var headers = [
      "ID Pinjam", "ID Buku", "Judul Buku", "Nama Peminjam", "Peran", 
      "Kelas / Jabatan", "Tanggal Pinjam", "Tenggat Waktu", "Tanggal Kembali", 
      "Status", "Catatan"
    ];
    sheet.appendRow(headers);
    
    var sampleLoans = [
      [
        "PJM-2026-001", "BK-001", "Si Kancil dan Buaya yang Cerdik", "Ahmad Fauzi", "Siswa",
        "Kelas 4A", "2026-10-01", "2026-10-08", "2026-10-07", "Dikembalikan", "Tepat waktu, kondisi buku baik"
      ],
      [
        "PJM-2026-002", "BK-003", "Buku Tematik Terpadu Kelas 4: Indahnya Kebersamaan", "Siti Aisyah", "Siswa",
        "Kelas 4B", "2026-10-10", "2026-10-17", "", "Dipinjam", "Sedang dipinjam untuk tugas kelompok"
      ],
      [
        "PJM-2026-003", "BK-005", "Kamus Bergambar 3 Bahasa (Indonesia - Inggris - Arab)", "Budi Santoso", "Siswa",
        "Kelas 5A", "2026-10-05", "2026-10-12", "", "Terlambat", "Perlu diingatkan wali kelas"
      ]
    ];
    
    for (var i = 0; i < sampleLoans.length; i++) {
      sheet.appendRow(sampleLoans[i]);
    }
    formatHeaderRow(sheet);
  }
}

/**
 * Setup Sheet: Visits (Kunjungan / Buku Tamu)
 */
function setupVisitsSheet(ss) {
  var sheet = ss.getSheetByName("Visits");
  if (!sheet) sheet = ss.insertSheet("Visits");
  
  if (sheet.getLastRow() === 0) {
    var headers = ["ID Kunjungan", "Tanggal", "Waktu", "Nama Pengunjung", "Peran", "Kelas / Unit", "Tujuan Kunjungan"];
    sheet.appendRow(headers);
    
    var sampleVisits = [
      ["VIS-001", "2026-10-15", "08:15", "Ahmad Fauzi", "Siswa", "Kelas 4A", "Membaca Buku Cerita"],
      ["VIS-002", "2026-10-15", "08:30", "Siti Aisyah", "Siswa", "Kelas 4B", "Meminjam Buku Tematik"],
      ["VIS-003", "2026-10-16", "09:00", "Pak Hendra, S.Pd", "Guru", "Guru Kelas 5", "Mencari Referensi Pembelajaran"],
      ["VIS-004", "2026-10-18", "10:15", "Rizky Pratama", "Siswa", "Kelas 6A", "Membaca di Ruang Baca"],
      ["VIS-005", "2026-10-20", "08:00", "Zahra Nurhaliza", "Siswa", "Kelas 3C", "Meminjam Buku Komik Edukatif"]
    ];
    
    for (var i = 0; i < sampleVisits.length; i++) {
      sheet.appendRow(sampleVisits[i]);
    }
    formatHeaderRow(sheet);
  }
}

function formatHeaderRow(sheet) {
  var range = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  range.setBackground("#1e40af");
  range.setFontColor("#ffffff");
  range.setFontWeight("bold");
  range.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
}

// =========================================================================
// API ROUTING (doGet & doPost)
// =========================================================================

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : null;
    
    // Jika dibuka langsung di browser (tanpa ?action=...), sajikan antarmuka Web Digipus
    if (!action) {
      return HtmlService.createHtmlOutputFromFile("Index")
        .setTitle("Digipus - SDN Cipinang Melayu 03 Pagi")
        .addMetaTag("viewport", "width=device-width, initial-scale=1")
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
    }

    var result = {};
    
    switch (action) {
      case "ping":
        result = { status: "success", message: "API Digipus SDN Cipinang Melayu 03 Pagi Aktif!", timestamp: new Date().toISOString() };
        break;
        
      case "setup":
        result = initDatabase();
        break;
        
      case "getSettings":
        result = getSettingsData();
        break;
        
      case "getBooks":
        result = getBooksData(e.parameter);
        break;
        
      case "getLoans":
        result = getLoansData(e.parameter);
        break;
        
      case "getVisits":
        result = getVisitsData(e.parameter);
        break;
        
      case "getDashboard":
        result = getDashboardStats();
        break;
        
      default:
        result = { status: "error", message: "Aksi tidak dikenali: " + action };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    }
    
    var action = data.action;
    var result = {};
    
    switch(action) {
      case "login":
        result = handleAdminLogin(data.username, data.password);
        break;
        
      case "saveSettings":
        result = handleSaveSettings(data.settings);
        break;
        
      case "saveBook":
        result = handleSaveBook(data.book);
        break;
        
      case "deleteBook":
        result = handleDeleteBook(data.id);
        break;
        
      case "saveLoan":
        result = handleSaveLoan(data.loan);
        break;
        
      case "returnBook":
        result = handleReturnBook(data.loanId, data.returnDate, data.notes);
        break;
        
      case "deleteLoan":
        result = handleDeleteLoan(data.loanId);
        break;
        
      case "saveVisit":
        result = handleSaveVisit(data.visit);
        break;
        
      case "uploadFile":
        result = handleFileUpload(data.fileName, data.mimeType, data.base64Data, data.folderType);
        break;
        
      default:
        result = { status: "error", message: "Aksi POST tidak dikenali: " + action };
    }
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// =========================================================================
// HANDLER FUNGSI-FUNGSI BISNIS
// =========================================================================

function getSettingsData() {
  var ss = getDatabaseSpreadsheet();
  var sheet = ss.getSheetByName("Settings");
  var data = sheet.getDataRange().getValues();
  var settings = {};
  
  for (var i = 1; i < data.length; i++) {
    var key = data[i][0];
    var val = data[i][1];
    if (key !== "admin_password") { // Sembunyikan password saat load biasa
      settings[key] = val;
    }
  }
  return { status: "success", data: settings };
}

function handleAdminLogin(username, password) {
  var ss = getDatabaseSpreadsheet();
  var sheet = ss.getSheetByName("Settings");
  var data = sheet.getDataRange().getValues();
  
  var dbUser = "";
  var dbPass = "";
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === "admin_username") dbUser = String(data[i][1]).trim();
    if (data[i][0] === "admin_password") dbPass = String(data[i][1]).trim();
  }
  
  if (username === dbUser && password === dbPass) {
    var token = "token_" + Utilities.getUuid();
    return {
      status: "success",
      message: "Login Berhasil! Selamat datang di Digipus SDN Cipinang Melayu 03 Pagi.",
      token: token,
      user: { username: dbUser, role: "Super Admin Perpustakaan" }
    };
  } else {
    return { status: "error", message: "Username atau Password Admin salah!" };
  }
}

function handleSaveSettings(newSettings) {
  var ss = getDatabaseSpreadsheet();
  var sheet = ss.getSheetByName("Settings");
  var data = sheet.getDataRange().getValues();
  
  for (var key in newSettings) {
    var found = false;
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        sheet.getRange(i + 1, 2).setValue(newSettings[key]);
        found = true;
        break;
      }
    }
    if (!found) {
      sheet.appendRow([key, newSettings[key], "Kustom Pengaturan"]);
    }
  }
  return { status: "success", message: "Biodata sekolah & pengaturan berhasil diperbarui!" };
}

function getBooksData(params) {
  var ss = getDatabaseSpreadsheet();
  var sheet = ss.getSheetByName("Books");
  var data = sheet.getDataRange().getValues();
  var books = [];
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue;
    books.push({
      id: row[0],
      title: row[1],
      author: row[2],
      publisher: row[3],
      year: row[4],
      isbn: row[5],
      category: row[6],
      type: row[7],
      stock: Number(row[8]) || 0,
      location: row[9],
      coverUrl: row[10],
      fileUrl: row[11],
      synopsis: row[12],
      createdAt: row[13]
    });
  }
  return { status: "success", count: books.length, data: books };
}

function handleSaveBook(book) {
  var ss = getDatabaseSpreadsheet();
  var sheet = ss.getSheetByName("Books");
  var data = sheet.getDataRange().getValues();
  
  var isEdit = false;
  var targetRow = -1;
  var bookId = book.id;
  
  if (!bookId) {
    // Generate ID baru
    var num = sheet.getLastRow();
    bookId = "BK-" + ("000" + num).slice(-3);
  }
  
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(bookId)) {
      isEdit = true;
      targetRow = i + 1;
      break;
    }
  }
  
  var now = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd");
  var rowData = [
    bookId,
    book.title || "",
    book.author || "",
    book.publisher || "",
    book.year || "",
    book.isbn || "",
    book.category || "Fiksi",
    book.type || "Fisik",
    book.type === "Digital" ? 99 : (Number(book.stock) >= 0 ? Number(book.stock) : 1),
    book.location || "Rak Umum",
    book.coverUrl || "",
    book.fileUrl || "",
    book.synopsis || "",
    isEdit ? (data[targetRow - 1][13] || now) : now
  ];
  
  if (isEdit && targetRow > 1) {
    sheet.getRange(targetRow, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  
  return {
    status: "success",
    message: isEdit ? "Buku berhasil diperbarui!" : "Buku baru berhasil ditambahkan!",
    data: { id: bookId }
  };
}

function handleDeleteBook(id) {
  var ss = getDatabaseSpreadsheet();
  var sheet = ss.getSheetByName("Books");
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { status: "success", message: "Buku dengan ID " + id + " berhasil dihapus." };
    }
  }
  return { status: "error", message: "Buku dengan ID " + id + " tidak ditemukan." };
}

function getLoansData(params) {
  var ss = getDatabaseSpreadsheet();
  var sheet = ss.getSheetByName("Loans");
  var data = sheet.getDataRange().getValues();
  var loans = [];
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue;
    loans.push({
      loanId: row[0],
      bookId: row[1],
      bookTitle: row[2],
      memberName: row[3],
      memberRole: row[4],
      gradeClass: row[5],
      loanDate: formatDateString(row[6]),
      dueDate: formatDateString(row[7]),
      returnDate: formatDateString(row[8]),
      status: row[9],
      notes: row[10]
    });
  }
  return { status: "success", count: loans.length, data: loans };
}

function handleSaveLoan(loan) {
  var ss = getDatabaseSpreadsheet();
  var sheet = ss.getSheetByName("Loans");
  var booksSheet = ss.getSheetByName("Books");
  
  var loanId = loan.loanId;
  if (!loanId) {
    var prefix = "PJM-" + Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyyMM");
    loanId = prefix + "-" + ("000" + sheet.getLastRow()).slice(-3);
  }
  
  var rowData = [
    loanId,
    loan.bookId,
    loan.bookTitle,
    loan.memberName,
    loan.memberRole || "Siswa",
    loan.gradeClass || "-",
    loan.loanDate || Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd"),
    loan.dueDate || "",
    loan.returnDate || "",
    loan.status || "Dipinjam",
    loan.notes || ""
  ];
  
  sheet.appendRow(rowData);
  
  // Kurangi stok buku jika jenis fisik
  reduceBookStock(booksSheet, loan.bookId, 1);
  
  return {
    status: "success",
    message: "Data peminjaman berhasil dicatat!",
    loanId: loanId
  };
}

function handleReturnBook(loanId, returnDate, notes) {
  var ss = getDatabaseSpreadsheet();
  var loansSheet = ss.getSheetByName("Loans");
  var booksSheet = ss.getSheetByName("Books");
  var data = loansSheet.getDataRange().getValues();
  
  var targetRow = -1;
  var bookId = "";
  
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(loanId)) {
      targetRow = i + 1;
      bookId = data[i][1];
      break;
    }
  }
  
  if (targetRow > 1) {
    var rDate = returnDate || Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd");
    loansSheet.getRange(targetRow, 9).setValue(rDate); // Return Date
    loansSheet.getRange(targetRow, 10).setValue("Dikembalikan"); // Status
    if (notes) {
      loansSheet.getRange(targetRow, 11).setValue(notes);
    }
    
    // Kembalikan stok buku
    reduceBookStock(booksSheet, bookId, -1);
    
    return { status: "success", message: "Buku berhasil dikembalikan dan stok diperbarui!" };
  }
  
  return { status: "error", message: "Data peminjaman tidak ditemukan." };
}

function handleDeleteLoan(loanId) {
  var ss = getDatabaseSpreadsheet();
  var sheet = ss.getSheetByName("Loans");
  var data = sheet.getDataRange().getValues();
  
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(loanId)) {
      sheet.deleteRow(i + 1);
      return { status: "success", message: "Riwayat peminjaman berhasil dihapus." };
    }
  }
  return { status: "error", message: "Data peminjaman tidak ditemukan." };
}

function reduceBookStock(sheet, bookId, amount) {
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(bookId)) {
      var currentStock = Number(data[i][8]) || 0;
      var type = data[i][7];
      if (type !== "Digital") {
        var newStock = Math.max(0, currentStock - amount);
        sheet.getRange(i + 1, 9).setValue(newStock);
      }
      break;
    }
  }
}

function getVisitsData(params) {
  var ss = getDatabaseSpreadsheet();
  var sheet = ss.getSheetByName("Visits");
  var data = sheet.getDataRange().getValues();
  var visits = [];
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0]) continue;
    visits.push({
      id: row[0],
      date: formatDateString(row[1]),
      time: row[2],
      name: row[3],
      role: row[4],
      gradeUnit: row[5],
      purpose: row[6]
    });
  }
  return { status: "success", count: visits.length, data: visits };
}

function handleSaveVisit(visit) {
  var ss = getDatabaseSpreadsheet();
  var sheet = ss.getSheetByName("Visits");
  
  var now = new Date();
  var dateStr = Utilities.formatDate(now, "Asia/Jakarta", "yyyy-MM-dd");
  var timeStr = Utilities.formatDate(now, "Asia/Jakarta", "HH:mm");
  var visitId = "VIS-" + ("000" + sheet.getLastRow()).slice(-3);
  
  var rowData = [
    visitId,
    visit.date || dateStr,
    visit.time || timeStr,
    visit.name || "Anonim",
    visit.role || "Siswa",
    visit.gradeUnit || "-",
    visit.purpose || "Membaca"
  ];
  
  sheet.appendRow(rowData);
  return { status: "success", message: "Kehadiran kunjungan perpustakaan berhasil dicatat!", id: visitId };
}

function handleFileUpload(fileName, mimeType, base64Data, folderType) {
  var userProperties = PropertiesService.getScriptProperties();
  var targetFolderId = folderType === "asset" 
    ? userProperties.getProperty(PROP_ASSETS_FOLDER_ID)
    : userProperties.getProperty(PROP_EBOOKS_FOLDER_ID);
    
  var folder;
  if (targetFolderId) {
    try {
      folder = DriveApp.getFolderById(targetFolderId);
    } catch(e) {
      folder = null;
    }
  }
  
  if (!folder) {
    initDatabase();
    targetFolderId = folderType === "asset" 
      ? userProperties.getProperty(PROP_ASSETS_FOLDER_ID)
      : userProperties.getProperty(PROP_EBOOKS_FOLDER_ID);
    folder = DriveApp.getFolderById(targetFolderId);
  }
  
  var decodedBytes = Utilities.base64Decode(base64Data);
  var blob = Utilities.newBlob(decodedBytes, mimeType, fileName);
  var file = folder.createFile(blob);
  
  // Set file public view agar bisa diakses langsung di Digipus
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  var isImage = (mimeType && mimeType.indexOf("image") !== -1);
  var fileUrl = isImage 
    ? ("https://lh3.googleusercontent.com/d/" + file.getId())
    : ("https://drive.google.com/uc?export=view&id=" + file.getId());
  
  return {
    status: "success",
    message: "File berhasil disimpan di Google Drive!",
    fileId: file.getId(),
    fileName: fileName,
    fileUrl: fileUrl,
    viewUrl: file.getUrl()
  };
}

function getDashboardStats() {
  var ss = getDatabaseSpreadsheet();
  var bData = ss.getSheetByName("Books").getDataRange().getValues();
  var lData = ss.getSheetByName("Loans").getDataRange().getValues();
  var vData = ss.getSheetByName("Visits").getDataRange().getValues();
  
  var totalBooks = 0;
  var totalTitles = 0;
  var physicalBooks = 0;
  var digitalBooks = 0;
  var categoryCounts = {};
  
  for (var i = 1; i < bData.length; i++) {
    if (!bData[i][0]) continue;
    totalTitles++;
    var type = bData[i][7];
    var stock = Number(bData[i][8]) || 0;
    var cat = bData[i][6] || "Lainnya";
    
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    
    if (type === "Digital") {
      digitalBooks++;
      totalBooks += 1;
    } else {
      physicalBooks++;
      totalBooks += stock;
    }
  }
  
  var activeLoans = 0;
  var returnedLoans = 0;
  var overdueLoans = 0;
  var topBooksMap = {};
  
  for (var j = 1; j < lData.length; j++) {
    if (!lData[j][0]) continue;
    var status = lData[j][9];
    var title = lData[j][2];
    topBooksMap[title] = (topBooksMap[title] || 0) + 1;
    
    if (status === "Dipinjam") activeLoans++;
    else if (status === "Dikembalikan") returnedLoans++;
    else if (status === "Terlambat") overdueLoans++;
  }
  
  var totalVisits = Math.max(0, vData.length - 1);
  
  return {
    status: "success",
    data: {
      totalTitles: totalTitles,
      totalBooks: totalBooks,
      physicalBooks: physicalBooks,
      digitalBooks: digitalBooks,
      activeLoans: activeLoans,
      returnedLoans: returnedLoans,
      overdueLoans: overdueLoans,
      totalVisits: totalVisits,
      categoryCounts: categoryCounts,
      topBooks: topBooksMap
    }
  };
}

function formatDateString(val) {
  if (!val) return "";
  if (val instanceof Date) {
    return Utilities.formatDate(val, "Asia/Jakarta", "yyyy-MM-dd");
  }
  return String(val);
}
