/**
 * =========================================================================
 * DIGIPUS - MAIN APPLICATION CONTROLLER
 * SDN CIPINANG MELAYU 03 PAGI
 * =========================================================================
 */

window.DEFAULT_LOGO_SVG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'><circle cx='200' cy='200' r='185' fill='%23e21b23'/><circle cx='200' cy='200' r='132' fill='%23ffffff'/><circle cx='200' cy='200' r='126' fill='none' stroke='%23e21b23' stroke-width='3.5'/><defs><path id='pathTop' d='M 42,200 A 158,158 0 0,1 358,200' fill='none'/><path id='pathBottom' d='M 358,200 A 158,158 0 0,1 42,200' fill='none'/></defs><polygon points='43,200 46,207 54,207 48,212 50,220 43,215 36,220 38,212 32,207 40,207' fill='%23ffffff' transform='rotate(-10 43 210)'/><polygon points='357,200 360,207 368,207 362,212 364,220 357,215 350,220 352,212 346,207 354,207' fill='%23ffffff' transform='rotate(10 357 210)'/><text fill='%23ffffff' font-family='Arial Black, Arial, sans-serif' font-weight='900' font-size='22' letter-spacing='2.5'><textPath href='%23pathTop' startOffset='50%' text-anchor='middle'>SEKOLAH DASAR NEGERI</textPath></text><text fill='%23ffffff' font-family='Arial Black, Arial, sans-serif' font-weight='900' font-size='20.5' letter-spacing='2'><textPath href='%23pathBottom' startOffset='50%' text-anchor='middle'>CIPINANG MELAYU 03 PAGI</textPath></text><polygon points='200,122 204,134 216,134 207,142 210,154 200,147 190,154 193,142 184,134 196,134' fill='%23f4b400'/><polygon points='175,138 178,145 186,145 180,150 182,158 175,153 168,158 170,150 164,145 172,145' fill='%23f4b400' transform='rotate(-15 175 148)'/><polygon points='225,138 228,145 236,145 230,150 232,158 225,153 218,158 220,150 214,145 222,145' fill='%23f4b400' transform='rotate(15 225 148)'/><path d='M 200,172 C 182,156 150,155 125,178 C 145,174 175,172 200,183 C 225,172 255,174 275,178 C 250,155 218,156 200,172 Z' fill='%2300853f'/><circle cx='154' cy='208' r='18' fill='%231b65b6'/><path d='M 154,226 C 142,226 130,230 120,227 C 117,226 122,233 128,239 C 138,248 144,242 144,258 L 138,278 C 137,282 144,282 146,278 L 153,260 L 160,278 C 162,282 169,282 168,278 L 162,258 C 162,244 170,238 188,214 C 189,212 184,213 178,218 C 168,226 160,226 154,226 Z' fill='%231b65b6'/><circle cx='242' cy='210' r='17' fill='%231b65b6'/><path d='M 230,206 C 218,202 210,210 214,217 C 218,222 225,214 229,212 Z' fill='%231b65b6'/><path d='M 254,206 C 266,202 274,210 270,217 C 266,222 259,214 255,212 Z' fill='%231b65b6'/><path d='M 242,226 C 236,226 230,228 220,221 C 214,217 212,219 216,224 C 224,233 232,238 232,246 L 225,264 C 224,266 226,267 229,267 L 257,267 C 260,267 262,266 261,264 L 254,246 C 254,238 262,233 274,225 C 278,222 276,219 270,222 C 260,228 248,226 242,226 Z' fill='%231b65b6'/><path d='M 235,267 L 233,280 C 232,283 238,283 239,280 L 241,267 Z M 249,267 L 251,280 C 252,283 258,283 257,280 L 255,267 Z' fill='%231b65b6'/></svg>";

let categoryChartInstance = null;
let topBooksChartInstance = null;
let uploadedCoverBase64 = null;
let uploadedCoverMime = null;
let uploadedCoverName = null;
let uploadedEbookBase64 = null;
let uploadedEbookMime = null;
let uploadedEbookName = null;

let currentLogoDataUrl = null;
let currentKopDataUrl = null;
let currentKopMode = "text";
let currentBookCoverDataUrl = "";

/**
 * Page Loader Helpers (Efek transisi loading saat refresh / buka sistem)
 */
function showPageLoader(text = "Memuat data perpustakaan...") {
  const loader = document.getElementById("pageLoader");
  const txt = document.getElementById("loaderStatusText");
  if (txt) txt.innerText = text;
  if (loader) {
    loader.classList.remove("fade-out");
    loader.style.display = "flex";
  }
}

function hidePageLoader() {
  const loader = document.getElementById("pageLoader");
  if (loader) {
    loader.classList.add("fade-out");
    setTimeout(() => {
      loader.style.display = "none";
    }, 450);
  }
}

/**
 * Kompresi dan penyesuaian ukuran gambar di browser menggunakan Canvas
 * Menjamin file gambar tidak berukuran besar (sangat ringan ~20KB-80KB),
 * tidak pernah rusak/broken link, dan langsung tersimpan aman!
 */
function compressAndResizeImage(file, maxWidth, maxHeight, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("File gambar tidak valid"));
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/png", quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Tampilkan animasi loading pembuka
  showPageLoader("Menghubungkan ke sistem perpustakaan...");

  try {
    // 2. Tampilkan status koneksi
    updateConnectionStatusUI();

    // 3. Muat pengaturan & identitas sekolah (Logo, Kop, Biodata)
    await loadSchoolSettings();

    // 4. Periksa apakah admin sudah login
    const isLoggedIn = window.DigipusAPI.isLoggedIn();
    updateAuthButtonUI(isLoggedIn);

    // 5. Muat katalog publik
    await renderPublicCatalog();

    // 6. Pertahankan halaman & tab yang sedang dibuka saat di-refresh!
    const savedView = localStorage.getItem("digipus_active_view") || "public";
    const savedTab = localStorage.getItem("digipus_active_tab") || "tabDashboard";

    if (isLoggedIn && savedView === "admin") {
      showAdminDashboard(savedTab, false);
    } else {
      showPublicPortal(false);
    }

    // 7. Inisialisasi default date input
    initDefaultDateInputs();
  } catch(err) {
    console.error("Kesalahan inisialisasi:", err);
  } finally {
    // Hilangkan loader dengan transisi halus
    setTimeout(hidePageLoader, 400);
  }
});

function initDefaultDateInputs() {
  const today = new Date().toISOString().split("T")[0];
  const dateInput = document.getElementById("loanFormDate");
  const dueDateInput = document.getElementById("loanFormDueDate");
  if (dateInput) dateInput.value = today;

  // Default tempo +7 hari
  if (dueDateInput) {
    const due = new Date();
    due.setDate(due.getDate() + 7);
    dueDateInput.value = due.toISOString().split("T")[0];
  }
}

// =========================================================================
// UI HELPERS, TOAST NOTIFICATION & TOGGLE
// =========================================================================
function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === "password") {
    input.type = "text";
    if (btn) btn.innerHTML = "🙈 Sembunyikan";
  } else {
    input.type = "password";
    if (btn) btn.innerHTML = "👁️ Tampilkan";
  }
}
function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let icon = "✅";
  if (type === "error") icon = "❌";
  else if (type === "info") icon = "ℹ️";

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(50px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add("show");
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove("show");
}

// =========================================================================
// PENGATURAN, LOGO & KOP SURAT
// =========================================================================
function updateConnectionStatusUI() {
  const badge = document.getElementById("connectionStatusBadge");
  const text = document.getElementById("connectionStatusText");
  const scriptInput = document.getElementById("settingScriptUrl");

  const url = window.DigipusAPI.getAppScriptUrl();
  if (scriptInput) scriptInput.value = url;

  if (window.DigipusAPI.isCloudConnected()) {
    badge.className = "status-pill status-connected";
    text.innerText = "☁️ Terhubung ke Google Sheet & Drive";
  } else {
    badge.className = "status-pill status-demo";
    text.innerText = "Mode Demo (Lokal)";
  }

  updateMultiDeviceShareUI();
}

function updateMultiDeviceShareUI() {
  const shareBox = document.getElementById("multiDeviceShareBox");
  const shareInput = document.getElementById("multiDeviceShareUrl");
  if (!shareBox || !shareInput) return;

  const url = window.DigipusAPI.getAppScriptUrl();
  if (url && url.startsWith("https://script.google.com/macros/s/")) {
    const currentLoc = window.location.href.split("?")[0].split("#")[0];
    const fullShareUrl = currentLoc + "?gas=" + encodeURIComponent(url.trim());
    shareInput.value = fullShareUrl;
    shareBox.style.display = "block";
  } else {
    shareBox.style.display = "none";
  }
}

function copyMultiDeviceShareUrl() {
  const shareInput = document.getElementById("multiDeviceShareUrl");
  if (!shareInput || !shareInput.value) {
    showToast("Belum ada koneksi Google Apps Script yang aktif.", "error");
    return;
  }

  const textToCopy = shareInput.value;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast("Tautan auto-connect disalin! Buka link ini di HP agar langsung terhubung.", "success");
    }).catch(() => {
      shareInput.select();
      document.execCommand("copy");
      showToast("Tautan auto-connect disalin!", "success");
    });
  } else {
    shareInput.select();
    document.execCommand("copy");
    showToast("Tautan auto-connect disalin!", "success");
  }
}

async function loadSchoolSettings() {
  const s = await window.DigipusAPI.getSettings();

  // Bersihkan logo lama jika masih SVG segitiga / lama
  if (!s.school_logo_url || (s.school_logo_url.startsWith("data:image/svg+xml") && !s.school_logo_url.includes("SEKOLAH DASAR NEGERI"))) {
    currentLogoDataUrl = window.DEFAULT_LOGO_SVG;
    s.school_logo_url = window.DEFAULT_LOGO_SVG;
    localStorage.setItem("digipus_settings", JSON.stringify(s));
  } else {
    currentLogoDataUrl = s.school_logo_url;
  }

  currentKopDataUrl = s.kop_image_url || "";
  currentKopMode = s.kop_mode || "text";

  // Update Navigasi
  const schoolName = s.school_name || "SDN Cipinang Melayu 03 Pagi";
  document.getElementById("navSubtitle").innerText = `Perpustakaan Digital ${schoolName}`;

  const navLogo = document.getElementById("navSchoolLogo");
  if (navLogo) navLogo.src = currentLogoDataUrl;

  const previewLogo = document.getElementById("settingLogoPreview");
  if (previewLogo) previewLogo.src = currentLogoDataUrl;

  const loginLogo = document.getElementById("loginModalLogo");
  if (loginLogo) loginLogo.src = currentLogoDataUrl;

  const loaderLogo = document.getElementById("loaderSchoolLogo");
  if (loaderLogo) loaderLogo.src = currentLogoDataUrl;

  // Update Mode Kop Surat
  const radioText = document.getElementById("radioKopText");
  const radioImage = document.getElementById("radioKopImage");
  const sectionUploadKop = document.getElementById("sectionUploadKopImage");

  if (currentKopMode === "image") {
    if (radioImage) radioImage.checked = true;
    if (sectionUploadKop) sectionUploadKop.style.display = "block";
  } else {
    if (radioText) radioText.checked = true;
    if (sectionUploadKop) sectionUploadKop.style.display = "none";
  }

  updateKopPreviewUI();

  // Update Form Biodata Sekolah
  document.getElementById("settingSchoolName").value = schoolName;
  document.getElementById("settingNpsn").value = s.npsn || "20104331";
  document.getElementById("settingSchoolAddress").value = s.school_address || "Jl. Kartika Eka Paksi KPAD Jatiwaringin RT.010/006 Kel. Cipinang Melayu Kec. Makasar Jakarta Timur";
  document.getElementById("settingHeadmasterName").value = s.headmaster_name || "";
  document.getElementById("settingHeadmasterNip").value = s.headmaster_nip || "";
  document.getElementById("settingLibrarianName").value = s.librarian_name || "";
  document.getElementById("settingLibrarianNip").value = s.librarian_nip || "";
  document.getElementById("settingLoanDays").value = s.loan_period_days || "7";
}

function updateKopPreviewUI() {
  const preview = document.getElementById("settingKopPreview");
  const notice = document.getElementById("kopEmptyNotice");
  const removeBtn = document.getElementById("btnRemoveKopImage");

  if (currentKopDataUrl) {
    if (preview) { preview.src = currentKopDataUrl; preview.style.display = "block"; }
    if (notice) notice.style.display = "none";
    if (removeBtn) removeBtn.style.display = "inline-block";
  } else {
    if (preview) { preview.src = ""; preview.style.display = "none"; }
    if (notice) notice.style.display = "block";
    if (removeBtn) removeBtn.style.display = "none";
  }
}

function handleKopModeChange(mode) {
  currentKopMode = mode;
  const section = document.getElementById("sectionUploadKopImage");
  if (section) {
    section.style.display = mode === "image" ? "block" : "none";
  }
}

async function handleKopImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  try {
    showToast("Mengompres & memproses gambar kop surat...", "info");
    const compressed = await compressAndResizeImage(file, 1200, 300, 0.9);
    currentKopDataUrl = compressed;
    currentKopMode = "image";
    
    const radioImg = document.getElementById("radioKopImage");
    if (radioImg) radioImg.checked = true;
    updateKopPreviewUI();

    // LANGSUNG SIMPAN OTOMATIS: Bertahan saat refresh & seketika tersimpan permanen!
    await window.DigipusAPI.saveSettings({
      kop_image_url: compressed,
      kop_mode: "image"
    });

    if (typeof generateReportPreview === "function") {
      generateReportPreview();
    }

    showToast("✅ Gambar Kop Surat berhasil diunggah & langsung tersimpan!", "success");
  } catch(err) {
    showToast("Gagal memproses gambar kop: " + err.message, "error");
  }
}

async function removeKopImage() {
  if (confirm("Hapus gambar kop surat dan gunakan Format Teks Kedinasan Otomatis?")) {
    currentKopDataUrl = "";
    currentKopMode = "text";
    const radioText = document.getElementById("radioKopText");
    if (radioText) radioText.checked = true;
    const section = document.getElementById("sectionUploadKopImage");
    if (section) section.style.display = "none";
    updateKopPreviewUI();

    // Auto-save perubahan hapus kop surat
    await window.DigipusAPI.saveSettings({
      kop_image_url: "",
      kop_mode: "text"
    });

    if (typeof generateReportPreview === "function") {
      generateReportPreview();
    }

    showToast("Gambar kop surat dihapus & tersimpan.", "info");
  }
}

async function handleLogoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  try {
    showToast("Mengompres & memproses logo...", "info");
    const compressed = await compressAndResizeImage(file, 260, 260, 0.95);
    currentLogoDataUrl = compressed;

    // Update elemen gambar logo seketika
    const previewEl = document.getElementById("settingLogoPreview");
    if (previewEl) previewEl.src = compressed;

    const navLogoEl = document.getElementById("navSchoolLogo");
    if (navLogoEl) navLogoEl.src = compressed;

    const modalLogoEl = document.getElementById("loginModalLogo");
    if (modalLogoEl) modalLogoEl.src = compressed;

    const loaderLogoEl = document.getElementById("loaderSchoolLogo");
    if (loaderLogoEl) loaderLogoEl.src = compressed;

    // LANGSUNG SIMPAN OTOMATIS: Bertahan saat refresh & tersimpan permanen!
    await window.DigipusAPI.saveSettings({
      school_logo_url: compressed
    });

    if (typeof generateReportPreview === "function") {
      generateReportPreview();
    }

    showToast("✅ Logo sekolah berhasil diunggah & langsung tersimpan!", "success");
  } catch(err) {
    showToast("Gagal memproses logo: " + err.message, "error");
  }
}

async function resetDefaultLogo() {
  currentLogoDataUrl = window.DEFAULT_LOGO_SVG;
  const previewEl = document.getElementById("settingLogoPreview");
  if (previewEl) previewEl.src = window.DEFAULT_LOGO_SVG;

  const navLogoEl = document.getElementById("navSchoolLogo");
  if (navLogoEl) navLogoEl.src = window.DEFAULT_LOGO_SVG;

  const modalLogoEl = document.getElementById("loginModalLogo");
  if (modalLogoEl) modalLogoEl.src = window.DEFAULT_LOGO_SVG;

  // Auto-save reset logo
  await window.DigipusAPI.saveSettings({
    school_logo_url: window.DEFAULT_LOGO_SVG
  });

  if (typeof generateReportPreview === "function") {
    generateReportPreview();
  }

  showToast("Logo dikembalikan ke standar SDN 03 & tersimpan.", "info");
}

async function testBackendConnection() {
  const urlInput = document.getElementById("settingScriptUrl").value.trim();
  if (!urlInput) {
    showToast("Silakan masukkan URL Web App Google Apps Script terlebih dahulu!", "error");
    return;
  }

  showToast("Menguji koneksi & memeriksa folder Drive...", "info");
  try {
    const res = await window.DigipusAPI.testConnection(urlInput);
    updateConnectionStatusUI();
    showToast("Berhasil terhubung ke Google Sheet & Drive! Folder otomatis dibuat.", "success");
    await refreshAllData();
  } catch (err) {
    showToast("Koneksi gagal: " + err.message, "error");
  }
}

function resetToDemoMode() {
  if (confirm("Kembalikan ke Mode Demo Lokal? Data akan disimpan di browser ini.")) {
    window.DigipusAPI.setAppScriptUrl("");
    updateConnectionStatusUI();
    showToast("Beralih ke mode demo lokal.", "info");
  }
}

async function saveSchoolSettings() {
  const settings = {
    school_name: document.getElementById("settingSchoolName").value,
    npsn: document.getElementById("settingNpsn").value,
    school_address: document.getElementById("settingSchoolAddress").value,
    headmaster_name: document.getElementById("settingHeadmasterName").value,
    headmaster_nip: document.getElementById("settingHeadmasterNip").value,
    librarian_name: document.getElementById("settingLibrarianName").value,
    librarian_nip: document.getElementById("settingLibrarianNip").value,
    loan_period_days: document.getElementById("settingLoanDays").value,
    school_logo_url: currentLogoDataUrl || window.DEFAULT_LOGO_SVG,
    kop_mode: currentKopMode || "text",
    kop_image_url: currentKopDataUrl || ""
  };

  showToast("Menyimpan pengaturan, logo & kop surat...", "info");
  await window.DigipusAPI.saveSettings(settings);
  await loadSchoolSettings();
  if (typeof generateReportPreview === "function") {
    generateReportPreview();
  }
  showToast("Biodata, Logo, dan Kop Surat berhasil disimpan!", "success");
}

// =========================================================================
// AUTHENTICATION & VIEW TOGGLE
// =========================================================================
function updateAuthButtonUI(isLoggedIn) {
  const btn = document.getElementById("btnNavAuth");
  const txt = document.getElementById("authBtnText");
  if (isLoggedIn) {
    btn.className = "btn btn-success-pill";
    txt.innerText = "Dashboard Admin";
  } else {
    btn.className = "btn btn-primary-pill";
    txt.innerText = "Login Admin";
  }
}

function toggleAuthAction() {
  if (window.DigipusAPI.isLoggedIn()) {
    showAdminDashboard();
  } else {
    openModal("modalLogin");
  }
}

async function handleAdminLoginSubmit(e) {
  e.preventDefault();
  const u = document.getElementById("loginUsername").value;
  const p = document.getElementById("loginPassword").value;
  const btn = document.getElementById("btnSubmitLogin");

  btn.disabled = true;
  btn.innerText = "Memverifikasi...";

  try {
    const res = await window.DigipusAPI.login(u, p);
    showToast(res.message, "success");
    closeModal("modalLogin");
    updateAuthButtonUI(true);
    showAdminDashboard();
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    btn.disabled = false;
    btn.innerText = "Masuk ke Dashboard";
  }
}

function logoutAdmin() {
  if (confirm("Apakah Anda yakin ingin keluar dari Dashboard Admin?")) {
    window.DigipusAPI.logout();
    updateAuthButtonUI(false);
    showPublicPortal();
    showToast("Anda telah keluar dari Dashboard Admin.", "info");
  }
}

function showAdminDashboard(initialTab = "tabDashboard", updateStorage = true) {
  document.getElementById("viewPublic").classList.remove("active");
  document.getElementById("viewAdmin").classList.add("active");
  
  if (updateStorage) {
    localStorage.setItem("digipus_active_view", "admin");
  }

  updateMobileNavUI("admin", initialTab);
  switchAdminTab(initialTab);
}

function showPublicPortal(updateStorage = true) {
  document.getElementById("viewAdmin").classList.remove("active");
  document.getElementById("viewPublic").classList.add("active");

  if (updateStorage) {
    localStorage.setItem("digipus_active_view", "public");
  }

  updateMobileNavUI("public", "catalog");
  renderPublicCatalog();
}

function switchAdminTab(tabId) {
  const tabs = document.querySelectorAll(".admin-tab-pane");
  tabs.forEach(t => t.classList.remove("active"));
  
  const navBtns = document.querySelectorAll(".sidebar-nav-item");
  navBtns.forEach(b => b.classList.remove("active"));

  const targetTab = document.getElementById(tabId);
  if (targetTab) targetTab.classList.add("active");

  // Simpan tab aktif agar saat F5/refresh tetap berada di tab ini!
  localStorage.setItem("digipus_active_tab", tabId);

  const activeBtn = Array.from(navBtns).find(b => b.getAttribute("onclick")?.includes(tabId));
  if (activeBtn) activeBtn.classList.add("active");

  updateMobileNavUI("admin", tabId);

  if (tabId === "tabDashboard") {
    refreshAdminDashboard();
  } else if (tabId === "tabBooks") {
    renderAdminBooksTable();
  } else if (tabId === "tabLoans") {
    renderAdminLoansTable();
  } else if (tabId === "tabVisits") {
    renderAdminVisitsTable();
  } else if (tabId === "tabReports") {
    generateReportPreview();
  }
}

/**
 * Controller Mobile Bottom Navigation Bar (Handphone)
 */
function updateMobileNavUI(activeView, activeTab) {
  const bnavPub = document.getElementById("bottomNavPublic");
  const bnavAdm = document.getElementById("bottomNavAdmin");

  if (activeView === "admin") {
    if (bnavPub) bnavPub.style.display = "none";
    if (bnavAdm) bnavAdm.style.display = "flex";

    // Update active highlight di bottom nav admin
    const bItems = document.querySelectorAll("#bottomNavAdmin .bottom-nav-item");
    bItems.forEach(b => b.classList.remove("active"));

    if (activeTab === "tabDashboard") document.getElementById("bnavAdmDashboard")?.classList.add("active");
    else if (activeTab === "tabBooks") document.getElementById("bnavAdmBooks")?.classList.add("active");
    else if (activeTab === "tabLoans") document.getElementById("bnavAdmLoans")?.classList.add("active");
    else if (activeTab === "tabVisits") document.getElementById("bnavAdmVisits")?.classList.add("active");
  } else {
    if (bnavAdm) bnavAdm.style.display = "none";
    if (bnavPub) bnavPub.style.display = "flex";

    const bItems = document.querySelectorAll("#bottomNavPublic .bottom-nav-item");
    bItems.forEach(b => b.classList.remove("active"));

    if (activeTab === "catalog") document.getElementById("bnavPubCatalog")?.classList.add("active");
    else if (activeTab === "search") document.getElementById("bnavPubSearch")?.classList.add("active");

    const authLabel = document.getElementById("bnavAuthLabel");
    if (authLabel) {
      authLabel.innerText = window.DigipusAPI.isLoggedIn() ? "Dashboard" : "Admin";
    }
  }
}

function handleMobileNavClick(action) {
  if (action === "catalog") {
    showPublicPortal();
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else if (action === "search") {
    showPublicPortal();
    const searchInput = document.getElementById("publicSearchInput");
    if (searchInput) {
      searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => searchInput.focus(), 300);
    }
  } else if (action === "auth") {
    toggleAuthAction();
  }
}

async function refreshAllData() {
  showToast("Memperbarui seluruh data...", "info");
  await renderPublicCatalog();
  await refreshAdminDashboard();
  await renderAdminBooksTable();
  await renderAdminLoansTable();
  await renderAdminVisitsTable();
  showToast("Data terbaru berhasil dimuat!", "success");
}

// =========================================================================
// PORTAL PUBLIK & KATALOG SISWA
// =========================================================================
let publicSearchKeyword = "";
let publicActiveCategory = "all";
let publicActiveType = "all";

async function renderPublicCatalog() {
  const books = await window.DigipusAPI.getBooks();

  // Update Hero Stats
  let totalExemplars = 0;
  let digitalCount = 0;
  let physicalCount = 0;

  books.forEach(b => {
    if (b.type === "Digital") {
      digitalCount++;
    } else {
      physicalCount++;
      totalExemplars += (Number(b.stock) || 0);
    }
  });

  document.getElementById("pubTotalBooks").innerText = books.length;
  document.getElementById("pubDigitalBooks").innerText = digitalCount;
  document.getElementById("pubPhysicalBooks").innerText = physicalCount;

  // Filter books
  const filtered = books.filter(b => {
    const matchCat = (publicActiveCategory === "all") || (b.category === publicActiveCategory);
    const matchType = (publicActiveType === "all") || (b.type === publicActiveType);
    const kw = publicSearchKeyword.toLowerCase();
    const matchKw = !kw || 
      (b.title && b.title.toLowerCase().includes(kw)) ||
      (b.author && b.author.toLowerCase().includes(kw)) ||
      (b.category && b.category.toLowerCase().includes(kw)) ||
      (b.synopsis && b.synopsis.toLowerCase().includes(kw));

    return matchCat && matchType && matchKw;
  });

  document.getElementById("publicBookCount").innerText = filtered.length;
  const grid = document.getElementById("publicBookGrid");

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍📖</div>
        <h3>Buku yang kamu cari belum ditemukan</h3>
        <p>Coba gunakan kata kunci lain atau pilih kategori yang berbeda ya!</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(b => {
    const isDigital = b.type === "Digital";
    const cover = b.coverUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400";
    const catClass = getCategoryBadgeClass(b.category);
    
    return `
      <div class="book-card" onclick="openBookDetailModal('${b.id}')">
        <div class="book-card-cover-wrap">
          <img src="${cover}" alt="${b.title}" class="book-cover-img" loading="lazy">
          <div class="badge-tag-wrap">
            <span class="badge-pill ${catClass}">${b.category || 'Umum'}</span>
          </div>
          <span class="badge-type-pill ${isDigital ? 'type-digital' : 'type-fisik'}">
            ${isDigital ? '⚡ E-Book' : '📦 Fisik'}
          </span>
        </div>
        <div class="book-card-body">
          <h3 class="book-card-title">${b.title}</h3>
          <p class="book-card-author">✍️ ${b.author || 'Anonim'}</p>
          <div class="book-card-meta">
            <span class="stock-indicator ${(!isDigital && b.stock <= 0) ? 'stock-empty' : 'stock-avail'}">
              ${isDigital ? 'Bebas Baca (Digital)' : (b.stock > 0 ? `Tersedia: ${b.stock} eks` : 'Dipinjam Semua')}
            </span>
            <button class="btn btn-sm ${isDigital ? 'btn-success-pill' : 'btn-secondary-pill'}" onclick="event.stopPropagation(); openBookDetailModal('${b.id}')">
              ${isDigital ? '📖 Baca' : 'Detail'}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function getCategoryBadgeClass(cat) {
  if (!cat) return "badge-lainnya";
  const c = cat.toLowerCase();
  if (c.includes("fiksi")) return "badge-fiksi";
  if (c.includes("non")) return "badge-nonfiksi";
  if (c.includes("pelajaran") || c.includes("tematik")) return "badge-pelajaran";
  if (c.includes("referensi") || c.includes("kamus")) return "badge-referensi";
  if (c.includes("agama")) return "badge-agama";
  return "badge-lainnya";
}

function handlePublicSearch() {
  const val = document.getElementById("publicSearchInput").value;
  publicSearchKeyword = val;
  const clearBtn = document.getElementById("clearSearchBtn");
  clearBtn.style.display = val ? "flex" : "none";
  renderPublicCatalog();
}

function clearPublicSearch() {
  document.getElementById("publicSearchInput").value = "";
  publicSearchKeyword = "";
  document.getElementById("clearSearchBtn").style.display = "none";
  renderPublicCatalog();
}

function filterPublicCategory(cat) {
  publicActiveCategory = cat;
  const pills = document.querySelectorAll("#publicCategoryPills .pill-btn");
  pills.forEach(p => {
    if (p.getAttribute("data-cat") === cat) p.classList.add("active");
    else p.classList.remove("active");
  });
  renderPublicCatalog();
}

function handlePublicTypeFilter() {
  publicActiveType = document.getElementById("publicTypeFilter").value;
  renderPublicCatalog();
}

async function openBookDetailModal(id) {
  const books = await window.DigipusAPI.getBooks();
  const b = books.find(x => x.id === id);
  if (!b) return;

  document.getElementById("detailBookTitle").innerText = b.title;
  document.getElementById("detailBookCover").src = b.coverUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400";
  document.getElementById("detailBookAuthor").innerText = b.author || "-";
  document.getElementById("detailBookPublisher").innerText = b.publisher || "-";
  document.getElementById("detailBookYear").innerText = b.year || "-";
  document.getElementById("detailBookIsbn").innerText = b.isbn || "-";
  document.getElementById("detailBookLocation").innerText = b.location || "Rak Utama Perpustakaan";
  document.getElementById("detailBookSynopsis").innerText = b.synopsis || "Belum ada sinopsis untuk buku ini.";

  const catSpan = document.getElementById("detailBookCategory");
  catSpan.innerText = b.category;
  catSpan.className = `badge-pill ${getCategoryBadgeClass(b.category)}`;

  const typeSpan = document.getElementById("detailBookType");
  const isDigital = b.type === "Digital";
  typeSpan.innerText = isDigital ? "Buku Digital (E-Book)" : "Buku Cetak Fisik";
  typeSpan.className = `badge-pill ${isDigital ? 'type-digital' : 'type-fisik'}`;

  const stockSpan = document.getElementById("detailBookStock");
  if (isDigital) {
    stockSpan.innerHTML = `<span class="stock-avail">Tersedia online (Akses tanpa batas)</span>`;
  } else {
    stockSpan.innerHTML = b.stock > 0 
      ? `<span class="stock-avail">Tersedia (${b.stock} eksemplar di rak)</span>` 
      : `<span class="stock-empty">Sedang tidak tersedia / dipinjam</span>`;
  }

  const digitalBar = document.getElementById("detailDigitalAction");
  const readBtn = document.getElementById("btnReadDigital");
  if (isDigital && b.fileUrl) {
    digitalBar.style.display = "block";
    readBtn.href = b.fileUrl;
  } else {
    digitalBar.style.display = "none";
  }

  openModal("modalBookDetail");
}

// =========================================================================
// BUKU TAMU DIGITAL
// =========================================================================
function openGuestBookModal() {
  openModal("modalGuestBook");
}

function handleGuestRoleChange() {
  const role = document.getElementById("guestRole").value;
  const colClass = document.getElementById("colGuestClass");
  if (role === "Siswa") {
    colClass.style.display = "block";
  } else {
    colClass.style.display = "none";
  }
}

async function handleGuestBookSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("guestName").value;
  const role = document.getElementById("guestRole").value;
  const grade = role === "Siswa" ? document.getElementById("guestClass").value : role;
  const purpose = document.getElementById("guestPurpose").value;

  const visit = { name, role, gradeUnit: grade, purpose };

  showToast("Mencatat kehadiran kunjungan...", "info");
  const res = await window.DigipusAPI.saveVisit(visit);
  showToast(res.message, "success");
  closeModal("modalGuestBook");
  document.getElementById("guestName").value = "";
  
  if (window.DigipusAPI.isLoggedIn()) {
    refreshAdminDashboard();
    renderAdminVisitsTable();
  }
}

// =========================================================================
// ADMIN DASHBOARD & CHARTS
// =========================================================================
async function refreshAdminDashboard() {
  const books = await window.DigipusAPI.getBooks();
  const loans = await window.DigipusAPI.getLoans();
  const visits = await window.DigipusAPI.getVisits();

  let totalExemplars = 0;
  let digitalCount = 0;
  let catCounts = {};

  books.forEach(b => {
    const c = b.category || "Lainnya";
    catCounts[c] = (catCounts[c] || 0) + 1;
    if (b.type === "Digital") {
      digitalCount++;
    } else {
      totalExemplars += (Number(b.stock) || 0);
    }
  });

  let activeLoans = 0;
  let overdueLoans = 0;
  let bookLoanCounts = {};

  loans.forEach(l => {
    bookLoanCounts[l.bookTitle] = (bookLoanCounts[l.bookTitle] || 0) + 1;
    if (l.status === "Dipinjam") activeLoans++;
    else if (l.status === "Terlambat") overdueLoans++;
  });

  document.getElementById("kpiTotalTitles").innerText = books.length;
  document.getElementById("kpiTotalExemplars").innerText = `${totalExemplars} total eksemplar fisik`;
  document.getElementById("kpiDigitalBooks").innerText = digitalCount;
  document.getElementById("kpiActiveLoans").innerText = activeLoans;
  document.getElementById("kpiOverdueCount").innerText = `${overdueLoans} melewati tenggat`;
  document.getElementById("kpiTotalVisits").innerText = visits.length;

  renderCategoryChart(catCounts);
  renderTopBooksChart(bookLoanCounts);
  renderDashboardQuickLoans(loans);
}

function renderCategoryChart(catCounts) {
  const ctx = document.getElementById("categoryChart");
  if (!ctx) return;

  const labels = Object.keys(catCounts);
  const data = Object.values(catCounts);

  if (categoryChartInstance) categoryChartInstance.destroy();

  categoryChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: [
          "#8b5cf6", "#0284c7", "#f59e0b", "#ec4899", "#10b981", "#64748b"
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });
}

function renderTopBooksChart(bookLoanCounts) {
  const ctx = document.getElementById("topBooksChart");
  if (!ctx) return;

  const sorted = Object.entries(bookLoanCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const labels = sorted.map(s => s[0].length > 20 ? s[0].substring(0, 18) + "..." : s[0]);
  const data = sorted.map(s => s[1]);

  if (topBooksChartInstance) topBooksChartInstance.destroy();

  topBooksChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels.length ? labels : ["Belum Ada Data"],
      datasets: [{
        label: "Jumlah Peminjaman",
        data: data.length ? data : [0],
        backgroundColor: "#1e40af",
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 } }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

function renderDashboardQuickLoans(loans) {
  const tbody = document.querySelector("#dashboardQuickLoansTable tbody");
  const urgent = loans.filter(l => l.status === "Dipinjam" || l.status === "Terlambat").slice(0, 5);

  if (urgent.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="padding:16px;">Tidak ada peminjaman aktif saat ini. Semua buku telah dikembalikan.</td></tr>`;
    return;
  }

  tbody.innerHTML = urgent.map(l => `
    <tr>
      <td><strong>${l.loanId}</strong></td>
      <td>${l.bookTitle}</td>
      <td>${l.memberName}</td>
      <td>${l.gradeClass}</td>
      <td>${l.dueDate}</td>
      <td><span class="status-badge ${l.status === 'Terlambat' ? 'badge-terlambat' : 'badge-dipinjam'}">${l.status}</span></td>
      <td>
        <button class="btn btn-sm btn-success-pill" onclick="quickReturnBook('${l.loanId}')">
          ✓ Kembalikan
        </button>
      </td>
    </tr>
  `).join("");
}

// =========================================================================
// MANAJEMEN BUKU (ADMIN)
// =========================================================================
let adminBookSearchKw = "";
let adminBookCat = "all";
let adminBookType = "all";

async function renderAdminBooksTable() {
  const books = await window.DigipusAPI.getBooks();
  const tbody = document.getElementById("adminBooksTableBody");

  const filtered = books.filter(b => {
    const matchCat = (adminBookCat === "all") || (b.category === adminBookCat);
    const matchType = (adminBookType === "all") || (b.type === adminBookType);
    const kw = adminBookSearchKw.toLowerCase();
    const matchKw = !kw ||
      (b.title && b.title.toLowerCase().includes(kw)) ||
      (b.author && b.author.toLowerCase().includes(kw)) ||
      (b.isbn && b.isbn.toLowerCase().includes(kw));

    return matchCat && matchType && matchKw;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center" style="padding: 24px;">Tidak ada data buku yang sesuai.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(b => {
    const isDigital = b.type === "Digital";
    const cover = b.coverUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400";
    return `
      <tr>
        <td><img src="${cover}" alt="Cover" class="table-thumb"></td>
        <td><strong>${b.id}</strong></td>
        <td>
          <strong>${b.title}</strong>
          ${b.isbn ? `<br><small style="color:#64748b;">ISBN: ${b.isbn}</small>` : ''}
        </td>
        <td>
          <span class="badge-pill ${getCategoryBadgeClass(b.category)}">${b.category}</span>
          <br>
          <span class="badge-type-pill ${isDigital ? 'type-digital' : 'type-fisik'}" style="position:static; margin-top:4px;">
            ${isDigital ? 'Digital' : 'Fisik'}
          </span>
        </td>
        <td>${b.author || '-'} <br><small>${b.publisher || '-'}</small></td>
        <td>${b.year || '-'}</td>
        <td><strong>${isDigital ? '∞' : (b.stock || 0)}</strong></td>
        <td>
          ${isDigital 
            ? (b.fileUrl ? `<a href="${b.fileUrl}" target="_blank" class="btn btn-sm btn-link">Lihat E-Book</a>` : '-') 
            : (b.location || '-')}
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-sm btn-secondary-pill" onclick="openEditBookModal('${b.id}')">✏️ Edit</button>
            <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteBook('${b.id}')">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function handleAdminBookFilter() {
  adminBookSearchKw = document.getElementById("adminBookSearch").value;
  adminBookCat = document.getElementById("adminBookCatFilter").value;
  adminBookType = document.getElementById("adminBookTypeFilter").value;
  renderAdminBooksTable();
}

function updateBookFormCoverPreview(url) {
  const previewImg = document.getElementById("bookFormCoverPreviewImg");
  const placeholder = document.getElementById("bookCoverPlaceholder");
  const removeBtn = document.getElementById("btnRemoveBookCover");
  const hiddenInput = document.getElementById("bookFormCoverUrl");

  if (url) {
    if (previewImg) {
      previewImg.src = url;
      previewImg.style.display = "block";
    }
    if (placeholder) placeholder.style.display = "none";
    if (removeBtn) removeBtn.style.display = "inline-block";
    if (hiddenInput) hiddenInput.value = url;
  } else {
    if (previewImg) {
      previewImg.src = "";
      previewImg.style.display = "none";
    }
    if (placeholder) placeholder.style.display = "flex";
    if (removeBtn) removeBtn.style.display = "none";
    if (hiddenInput) hiddenInput.value = "";
  }
}

function removeBookCover() {
  currentBookCoverDataUrl = "";
  uploadedCoverBase64 = null;
  uploadedCoverName = null;
  const fileInput = document.getElementById("bookFormCoverFile");
  if (fileInput) fileInput.value = "";
  updateBookFormCoverPreview("");
  showToast("Sampul buku telah dihapus.", "info");
}

function openAddBookModal() {
  document.getElementById("bookForm").reset();
  document.getElementById("bookFormId").value = "";
  document.getElementById("modalBookFormTitle").innerText = "📚 Tambah Buku Baru";
  document.getElementById("sectionDigitalFile").style.display = "none";
  document.getElementById("colBookStock").style.display = "block";
  
  uploadedCoverBase64 = null;
  uploadedCoverName = null;
  uploadedEbookBase64 = null;
  currentBookCoverDataUrl = "";
  updateBookFormCoverPreview("");

  openModal("modalBookForm");
}

async function openEditBookModal(id) {
  const books = await window.DigipusAPI.getBooks();
  const b = books.find(x => x.id === id);
  if (!b) return;

  document.getElementById("modalBookFormTitle").innerText = "✏️ Edit Data Buku";
  document.getElementById("bookFormId").value = b.id;
  document.getElementById("bookFormTitle").value = b.title || "";
  document.getElementById("bookFormCategory").value = b.category || "Fiksi";
  document.getElementById("bookFormType").value = b.type || "Fisik";
  document.getElementById("bookFormStock").value = b.stock || 0;
  document.getElementById("bookFormLocation").value = b.location || "";
  document.getElementById("bookFormAuthor").value = b.author || "";
  document.getElementById("bookFormPublisher").value = b.publisher || "";
  document.getElementById("bookFormYear").value = b.year || "2024";
  document.getElementById("bookFormIsbn").value = b.isbn || "";
  document.getElementById("bookFormFileUrl").value = b.fileUrl || "";
  document.getElementById("bookFormSynopsis").value = b.synopsis || "";

  // Tampilkan cover buku yang tersimpan
  currentBookCoverDataUrl = b.coverUrl || "";
  uploadedCoverBase64 = null;
  updateBookFormCoverPreview(currentBookCoverDataUrl);

  handleBookTypeChange();
  openModal("modalBookForm");
}

function handleBookTypeChange() {
  const type = document.getElementById("bookFormType").value;
  const isDigital = type === "Digital";
  document.getElementById("sectionDigitalFile").style.display = isDigital ? "block" : "none";
  document.getElementById("colBookStock").style.display = isDigital ? "none" : "block";
}

async function handleCoverFileSelected(e) {
  const file = e.target.files[0];
  if (!file) return;

  try {
    showToast("Mengompres & memproses cover buku...", "info");
    const compressed = await compressAndResizeImage(file, 450, 600, 0.88);
    currentBookCoverDataUrl = compressed;
    uploadedCoverName = file.name;
    uploadedCoverMime = "image/png";
    uploadedCoverBase64 = compressed.split(",")[1];
    
    // Tampilkan pratinjau seketika
    updateBookFormCoverPreview(compressed);
    showToast("✅ Cover buku berhasil dimuat! Siap disimpan.", "success");
  } catch(err) {
    showToast("Gagal memproses gambar cover: " + err.message, "error");
  }
}

function handleEbookFileSelected(e) {
  const file = e.target.files[0];
  if (!file) return;
  uploadedEbookName = file.name;
  uploadedEbookMime = file.type;
  const reader = new FileReader();
  reader.onload = function(evt) {
    uploadedEbookBase64 = evt.target.result.split(",")[1];
  };
  reader.readAsDataURL(file);
}

async function handleBookFormSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById("btnSaveBook");
  btn.disabled = true;
  btn.innerText = "Menyimpan ke Database...";

  try {
    let coverUrl = currentBookCoverDataUrl || document.getElementById("bookFormCoverUrl")?.value || "";
    let fileUrl = document.getElementById("bookFormFileUrl").value;

    // Jika belum ada cover, sediakan cover ilustrasi default ramah anak
    if (!coverUrl) {
      coverUrl = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400";
    }

    // Jika online dan upload file PDF ke Drive subfolder Ebook_Files
    if (uploadedEbookBase64 && window.DigipusAPI.isCloudConnected()) {
      showToast("Mengunggah file PDF E-Book ke Google Drive...", "info");
      const upPdf = await window.DigipusAPI.uploadFileToDrive(
        uploadedEbookName || "ebook.pdf",
        uploadedEbookMime || "application/pdf",
        uploadedEbookBase64,
        "ebook"
      );
      if (upPdf && upPdf.fileUrl) fileUrl = upPdf.fileUrl;
    }

    const book = {
      id: document.getElementById("bookFormId").value,
      title: document.getElementById("bookFormTitle").value,
      category: document.getElementById("bookFormCategory").value,
      type: document.getElementById("bookFormType").value,
      stock: Number(document.getElementById("bookFormStock").value) || 0,
      location: document.getElementById("bookFormLocation").value,
      author: document.getElementById("bookFormAuthor").value,
      publisher: document.getElementById("bookFormPublisher").value,
      year: document.getElementById("bookFormYear").value,
      isbn: document.getElementById("bookFormIsbn").value,
      coverUrl: coverUrl,
      fileUrl: fileUrl,
      synopsis: document.getElementById("bookFormSynopsis").value
    };

    const res = await window.DigipusAPI.saveBook(book);
    showToast(res.message, "success");
    closeModal("modalBookForm");
    await renderAdminBooksTable();
    await renderPublicCatalog();
    refreshAdminDashboard();
  } catch (err) {
    showToast("Gagal menyimpan: " + err.message, "error");
  } finally {
    btn.disabled = false;
    btn.innerText = "💾 Simpan Buku";
  }
}

async function confirmDeleteBook(id) {
  if (confirm(`Yakin ingin menghapus buku dengan ID ${id}? Tindakan ini permanen.`)) {
    showToast("Menghapus buku...", "info");
    const res = await window.DigipusAPI.deleteBook(id);
    showToast(res.message, "success");
    await renderAdminBooksTable();
    await renderPublicCatalog();
    refreshAdminDashboard();
  }
}

// =========================================================================
// SIRKULASI PEMINJAMAN & PENGEMBALIAN
// =========================================================================
let loanSearchKw = "";
let loanStatusFilterVal = "all";

async function renderAdminLoansTable() {
  const loans = await window.DigipusAPI.getLoans();
  const tbody = document.getElementById("adminLoansTableBody");

  const filtered = loans.filter(l => {
    const matchStatus = (loanStatusFilterVal === "all") || (l.status === loanStatusFilterVal);
    const kw = loanSearchKw.toLowerCase();
    const matchKw = !kw ||
      (l.bookTitle && l.bookTitle.toLowerCase().includes(kw)) ||
      (l.memberName && l.memberName.toLowerCase().includes(kw)) ||
      (l.gradeClass && l.gradeClass.toLowerCase().includes(kw)) ||
      (l.loanId && l.loanId.toLowerCase().includes(kw));

    return matchStatus && matchKw;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" class="text-center" style="padding:24px;">Tidak ada data peminjaman yang cocok.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(l => {
    let badgeClass = "badge-dipinjam";
    if (l.status === "Dikembalikan") badgeClass = "badge-dikembalikan";
    else if (l.status === "Terlambat") badgeClass = "badge-terlambat";

    return `
      <tr>
        <td><strong>${l.loanId}</strong></td>
        <td>${l.bookTitle}</td>
        <td><strong>${l.memberName}</strong></td>
        <td>${l.memberRole} <br><small>${l.gradeClass}</small></td>
        <td>${l.loanDate || '-'}</td>
        <td>${l.dueDate || '-'}</td>
        <td>${l.returnDate || '-'}</td>
        <td><span class="status-badge ${badgeClass}">${l.status}</span></td>
        <td>
          <div class="action-buttons">
            ${l.status !== 'Dikembalikan' ? `
              <button class="btn btn-sm btn-success-pill" onclick="quickReturnBook('${l.loanId}')">
                ✓ Kembali
              </button>
            ` : ''}
            <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteLoan('${l.loanId}')">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function handleLoanFilter() {
  loanSearchKw = document.getElementById("loanSearchInput").value;
  loanStatusFilterVal = document.getElementById("loanStatusFilter").value;
  renderAdminLoansTable();
}

async function openAddLoanModal() {
  const books = await window.DigipusAPI.getBooks();
  const select = document.getElementById("loanFormBookSelect");

  // Filter buku fisik yang stoknya > 0
  const availableBooks = books.filter(b => b.type !== "Digital" && b.stock > 0);

  if (availableBooks.length === 0) {
    showToast("Tidak ada stok buku fisik yang tersedia untuk dipinjam saat ini.", "error");
    return;
  }

  select.innerHTML = availableBooks.map(b => `
    <option value="${b.id}" data-title="${b.title}">
      ${b.title} (Sisa Stok: ${b.stock} eks)
    </option>
  `).join("");

  document.getElementById("loanFormMemberName").value = "";
  document.getElementById("loanFormGrade").value = "";
  document.getElementById("loanFormNotes").value = "";
  initDefaultDateInputs();
  openModal("modalLoanForm");
}

async function handleLoanFormSubmit(e) {
  e.preventDefault();
  const select = document.getElementById("loanFormBookSelect");
  const selectedOpt = select.options[select.selectedIndex];

  const loan = {
    bookId: select.value,
    bookTitle: selectedOpt.getAttribute("data-title"),
    memberName: document.getElementById("loanFormMemberName").value,
    memberRole: document.getElementById("loanFormMemberRole").value,
    gradeClass: document.getElementById("loanFormGrade").value,
    loanDate: document.getElementById("loanFormDate").value,
    dueDate: document.getElementById("loanFormDueDate").value,
    notes: document.getElementById("loanFormNotes").value
  };

  showToast("Mencatat transaksi peminjaman...", "info");
  const res = await window.DigipusAPI.saveLoan(loan);
  showToast(res.message, "success");
  closeModal("modalLoanForm");
  await renderAdminLoansTable();
  await renderAdminBooksTable();
  refreshAdminDashboard();
}

async function quickReturnBook(loanId) {
  if (confirm(`Konfirmasi pengembalian buku untuk nomor pinjam ${loanId}?`)) {
    showToast("Memperbarui status pengembalian & stok...", "info");
    const res = await window.DigipusAPI.returnBook(loanId);
    showToast(res.message, "success");
    await renderAdminLoansTable();
    await renderAdminBooksTable();
    refreshAdminDashboard();
  }
}

async function confirmDeleteLoan(loanId) {
  if (confirm(`Hapus riwayat peminjaman ${loanId}?`)) {
    showToast("Menghapus data...", "info");
    const res = await window.DigipusAPI.deleteLoan(loanId);
    showToast(res.message, "success");
    await renderAdminLoansTable();
    refreshAdminDashboard();
  }
}

// =========================================================================
// REKAP KUNJUNGAN BUKU TAMU
// =========================================================================
let visitSearchKw = "";
let visitDateVal = "";

async function renderAdminVisitsTable() {
  const visits = await window.DigipusAPI.getVisits();
  const tbody = document.getElementById("adminVisitsTableBody");

  const filtered = visits.filter(v => {
    const matchDate = !visitDateVal || (v.date === visitDateVal);
    const kw = visitSearchKw.toLowerCase();
    const matchKw = !kw ||
      (v.name && v.name.toLowerCase().includes(kw)) ||
      (v.gradeUnit && v.gradeUnit.toLowerCase().includes(kw)) ||
      (v.purpose && v.purpose.toLowerCase().includes(kw));

    return matchDate && matchKw;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding:24px;">Belum ada kunjungan pada kriteria ini.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(v => `
    <tr>
      <td><strong>${v.id}</strong></td>
      <td>${v.date} <br><small>${v.time || ''}</small></td>
      <td><strong>${v.name}</strong></td>
      <td>${v.role}</td>
      <td>${v.gradeUnit}</td>
      <td>${v.purpose}</td>
    </tr>
  `).join("");
}

function handleVisitFilter() {
  visitSearchKw = document.getElementById("visitSearchInput").value;
  visitDateVal = document.getElementById("visitDateFilter").value;
  renderAdminVisitsTable();
}

// =========================================================================
// PRINT & LAPORAN PREVIEW
// =========================================================================
function generateReportPreview() {
  window.DigipusReports.updateReportPreview();
}

function triggerReportPrint() {
  window.print();
}
