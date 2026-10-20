/**
 * =========================================================================
 * DIGIPUS - REPORT & PRINT ENGINE
 * SDN CIPINANG MELAYU 03 PAGI
 * =========================================================================
 * Mengelola pembuatan dokumen laporan dan rekapitulasi bulanan berformat
 * kedinasan resmi (Standar A4, Kop Surat, dan Tanda Tangan Resmi).
 * =========================================================================
 */

const DigipusReports = {
  MONTH_NAMES: [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ],

  // Format tanggal ke Bahasa Indonesia (Contoh: 20 Oktober 2026)
  formatIndonesianDate(dateObj = new Date()) {
    const day = dateObj.getDate();
    const month = this.MONTH_NAMES[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    return `${day} ${month} ${year}`;
  },

  async updateReportPreview() {
    const reportType = document.getElementById("reportTypeSelect").value;
    const selectedMonth = document.getElementById("reportMonthSelect").value;
    const selectedYear = document.getElementById("reportYearSelect").value;
    const selectedCategory = document.getElementById("reportCategoryFilter")?.value || "all";

    // Toggle filter input visibility
    const colMonth = document.getElementById("colReportMonth");
    const colCat = document.getElementById("colReportCategory");
    if (reportType === "book_inventory") {
      colMonth.style.display = "none";
      colCat.style.display = "block";
    } else {
      colMonth.style.display = "block";
      colCat.style.display = "none";
    }

    const settings = await window.DigipusAPI.getSettings();
    this.renderKopAndSignatures(settings);

    if (reportType === "monthly_loans") {
      await this.renderMonthlyLoansReport(selectedMonth, selectedYear);
    } else if (reportType === "monthly_visits") {
      await this.renderMonthlyVisitsReport(selectedMonth, selectedYear);
    } else if (reportType === "book_inventory") {
      await this.renderBookInventoryReport(selectedCategory);
    }
  },

  renderKopAndSignatures(settings) {
    const isImageMode = (settings.kop_mode === "image") && !!settings.kop_image_url;
    const kopImageContainer = document.getElementById("kopImageContainer");
    const kopTextContainer = document.getElementById("kopTextContainer");
    const kopUploadedBanner = document.getElementById("kopUploadedBanner");

    if (isImageMode && kopUploadedBanner) {
      if (kopImageContainer) kopImageContainer.style.display = "block";
      if (kopTextContainer) kopTextContainer.style.display = "none";
      kopUploadedBanner.src = settings.kop_image_url;
    } else {
      if (kopImageContainer) kopImageContainer.style.display = "none";
      if (kopTextContainer) kopTextContainer.style.display = "block";

      const schoolName = settings.school_name || "SDN CIPINANG MELAYU 03 PAGI";
      const npsn = settings.npsn || "20104331";
      const address = settings.school_address || "Jl. Kartika Eka Paksi KPAD Jatiwaringin RT.010/006 Kel. Cipinang Melayu Kec. Makasar Jakarta Timur";

      const kopNameEl = document.getElementById("kopSchoolName");
      const kopNpsnEl = document.getElementById("kopNpsn");
      const kopAddressEl = document.getElementById("kopSchoolAddress");
      const kopLogoEl = document.getElementById("kopSchoolLogo");

      if (kopNameEl) kopNameEl.innerText = schoolName.toUpperCase();
      if (kopNpsnEl) kopNpsnEl.innerText = npsn;
      if (kopAddressEl) kopAddressEl.innerText = address;
      if (kopLogoEl) {
        kopLogoEl.src = settings.school_logo_url || window.DEFAULT_LOGO_SVG;
      }
    }

    // Tanda Tangan Resmi
    const sigHead = document.getElementById("sigHeadmasterName");
    const sigHeadNip = document.getElementById("sigHeadmasterNip");
    const sigLib = document.getElementById("sigLibrarianName");
    const sigLibNip = document.getElementById("sigLibrarianNip");
    const sigDate = document.getElementById("sigDateLocation");

    if (sigHead) sigHead.innerText = settings.headmaster_name || "Dra. Hj. Nurjanah, M.Pd";
    if (sigHeadNip) sigHeadNip.innerText = settings.headmaster_nip || "196805121993032004";
    if (sigLib) sigLib.innerText = settings.librarian_name || "Siti Rahmawati, S.Pd";
    if (sigLibNip) sigLibNip.innerText = settings.librarian_nip || "198502142010012015";
    if (sigDate) sigDate.innerText = `Jakarta, ${this.formatIndonesianDate()}`;
  },

  // 1. REKAP PEMINJAMAN BULANAN
  async renderMonthlyLoansReport(monthStr, yearStr) {
    const loans = await window.DigipusAPI.getLoans();
    const monthIndex = parseInt(monthStr, 10) - 1;
    const monthName = this.MONTH_NAMES[monthIndex];

    document.getElementById("reportPreviewTitle").innerText = "REKAPITULASI PEMINJAMAN & SIRKULASI BUKU";
    document.getElementById("reportPreviewSubtitle").innerText = `Bulan: ${monthName} ${yearStr}`;

    // Filter berdasarkan bulan & tahun
    const filtered = loans.filter(item => {
      if (!item.loanDate) return false;
      const parts = item.loanDate.split("-");
      if (parts.length < 2) return false;
      return parts[0] === yearStr && parts[1] === monthStr;
    });

    let totalDipinjam = 0;
    let totalDikembalikan = 0;
    let totalTerlambat = 0;

    filtered.forEach(l => {
      if (l.status === "Dipinjam") totalDipinjam++;
      else if (l.status === "Dikembalikan") totalDikembalikan++;
      else if (l.status === "Terlambat") totalTerlambat++;
    });

    // Summary Box
    const summaryBox = document.getElementById("reportSummaryStats");
    summaryBox.innerHTML = `
      <div><strong>Total Transaksi:</strong> ${filtered.length} transaksi</div>
      <div><strong>Masih Dipinjam:</strong> ${totalDipinjam} buku</div>
      <div><strong>Sudah Kembali:</strong> ${totalDikembalikan} buku</div>
      <div><strong>Terlambat:</strong> ${totalTerlambat} buku</div>
    `;

    // Table Content
    const thead = document.querySelector("#reportPreviewTable thead");
    const tbody = document.querySelector("#reportPreviewTable tbody");

    thead.innerHTML = `
      <tr>
        <th style="width: 5%;">No</th>
        <th style="width: 14%;">No. Pinjam</th>
        <th style="width: 28%;">Judul Buku</th>
        <th style="width: 18%;">Peminjam & Kelas</th>
        <th style="width: 12%;">Tgl Pinjam</th>
        <th style="width: 12%;">Tenggat</th>
        <th style="width: 11%;">Status</th>
      </tr>
    `;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center" style="padding: 20px; font-style: italic;">
            Tidak ada transaksi peminjaman pada periode ${monthName} ${yearStr}.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map((l, idx) => `
      <tr>
        <td class="text-center">${idx + 1}</td>
        <td><strong>${l.loanId}</strong></td>
        <td>${l.bookTitle}</td>
        <td>${l.memberName} <br><small>(${l.gradeClass})</small></td>
        <td class="text-center">${l.loanDate || '-'}</td>
        <td class="text-center">${l.dueDate || '-'}</td>
        <td class="text-center"><strong>${l.status}</strong></td>
      </tr>
    `).join("");
  },

  // 2. REKAP KUNJUNGAN BULANAN
  async renderMonthlyVisitsReport(monthStr, yearStr) {
    const visits = await window.DigipusAPI.getVisits();
    const monthIndex = parseInt(monthStr, 10) - 1;
    const monthName = this.MONTH_NAMES[monthIndex];

    document.getElementById("reportPreviewTitle").innerText = "REKAPITULASI BULANAN KUNJUNGAN PERPUSTAKAAN";
    document.getElementById("reportPreviewSubtitle").innerText = `Periode: ${monthName} ${yearStr}`;

    const filtered = visits.filter(item => {
      if (!item.date) return false;
      const parts = item.date.split("-");
      if (parts.length < 2) return false;
      return parts[0] === yearStr && parts[1] === monthStr;
    });

    let totalSiswa = 0;
    let totalGuru = 0;
    filtered.forEach(v => {
      if (v.role === "Siswa") totalSiswa++;
      else totalGuru++;
    });

    const summaryBox = document.getElementById("reportSummaryStats");
    summaryBox.innerHTML = `
      <div><strong>Total Pengunjung:</strong> ${filtered.length} Orang</div>
      <div><strong>Pengunjung Siswa:</strong> ${totalSiswa} Siswa</div>
      <div><strong>Pengunjung Guru/Staf:</strong> ${totalGuru} Orang</div>
    `;

    const thead = document.querySelector("#reportPreviewTable thead");
    const tbody = document.querySelector("#reportPreviewTable tbody");

    thead.innerHTML = `
      <tr>
        <th style="width: 5%;">No</th>
        <th style="width: 15%;">Tanggal & Jam</th>
        <th style="width: 25%;">Nama Pengunjung</th>
        <th style="width: 15%;">Peran</th>
        <th style="width: 15%;">Kelas / Unit</th>
        <th style="width: 25%;">Tujuan Kunjungan</th>
      </tr>
    `;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center" style="padding: 20px; font-style: italic;">
            Belum ada catatan kunjungan pada bulan ${monthName} ${yearStr}.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map((v, idx) => `
      <tr>
        <td class="text-center">${idx + 1}</td>
        <td class="text-center">${v.date} ${v.time ? '('+v.time+')' : ''}</td>
        <td><strong>${v.name}</strong></td>
        <td>${v.role}</td>
        <td>${v.gradeUnit || '-'}</td>
        <td>${v.purpose}</td>
      </tr>
    `).join("");
  },

  // 3. LAPORAN DATA BUKU / INVENTARIS
  async renderBookInventoryReport(categoryFilter = "all") {
    const books = await window.DigipusAPI.getBooks();
    document.getElementById("reportPreviewTitle").innerText = "LAPORAN DATA INVENTARIS BUKU PERPUSTAKAAN";
    document.getElementById("reportPreviewSubtitle").innerText = `Koleksi Lengkap Digipus SDN Cipinang Melayu 03 Pagi`;

    const filtered = categoryFilter === "all" ? books : books.filter(b => b.category === categoryFilter);

    let totalExemplars = 0;
    let totalFisik = 0;
    let totalDigital = 0;

    filtered.forEach(b => {
      if (b.type === "Digital") {
        totalDigital++;
      } else {
        totalFisik++;
        totalExemplars += (Number(b.stock) || 0);
      }
    });

    const summaryBox = document.getElementById("reportSummaryStats");
    summaryBox.innerHTML = `
      <div><strong>Total Judul:</strong> ${filtered.length} Judul</div>
      <div><strong>Buku Fisik:</strong> ${totalFisik} Judul (${totalExemplars} Eks)</div>
      <div><strong>Buku Digital (E-Book):</strong> ${totalDigital} Judul</div>
    `;

    const thead = document.querySelector("#reportPreviewTable thead");
    const tbody = document.querySelector("#reportPreviewTable tbody");

    thead.innerHTML = `
      <tr>
        <th style="width: 5%;">No</th>
        <th style="width: 12%;">Kode Buku</th>
        <th style="width: 30%;">Judul Buku</th>
        <th style="width: 15%;">Pengarang</th>
        <th style="width: 12%;">Kategori</th>
        <th style="width: 10%;">Jenis</th>
        <th style="width: 8%;">Stok</th>
        <th style="width: 8%;">Lokasi Rak</th>
      </tr>
    `;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center" style="padding: 20px; font-style: italic;">
            Tidak ada buku pada kategori yang dipilih.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map((b, idx) => `
      <tr>
        <td class="text-center">${idx + 1}</td>
        <td class="text-center"><strong>${b.id}</strong></td>
        <td>${b.title} <br><small>ISBN: ${b.isbn || '-'}</small></td>
        <td>${b.author || '-'}</td>
        <td class="text-center">${b.category}</td>
        <td class="text-center">${b.type}</td>
        <td class="text-center">${b.type === 'Digital' ? '∞' : (b.stock || 0)}</td>
        <td class="text-center">${b.location || '-'}</td>
      </tr>
    `).join("");
  }
};

window.DigipusReports = DigipusReports;
