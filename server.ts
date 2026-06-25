import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent set for telemetry monitoring
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Peringatan: GEMINI_API_KEY tidak ditemukan di environment. Rekomendasi AI akan dijalankan dalam mode simulasi.");
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

// Simulated mock AI responses in case API key is missing or fails
const getMockAiResponse = (dataLength: number) => {
  return {
    overallScore: 78,
    scoreReason: "Penghitungan efisiensi pelaporan menunjukkan data lengkap, namun rasio penggunaan bahan bakar berlebih ditemukan pada 2 traktor di Kecamatan Soe dan terdapat ketidakseimbangan alokasi pompa air di wilayah kering.",
    efficiencyAnalysis: [
      {
        id: "eff-1",
        alsintan: "Traktor Roda 4 (John Deere)",
        issue: "Konsumsi solar mencapai 22 Liter/Hektar (Normal: 12-15 Liter/Ha) di Kecamatan Soe.",
        severity: "tinggi",
        impact: "Lonjakan biaya operasional bahan bakar hingga 45% dari anggaran per hektar.",
        recommendation: "Lakukan kalibrasi pisau rotary pembajak tanah serta perawatan filter solar pada unit ini segera."
      },
      {
        id: "eff-2",
        alsintan: "Mesin Pompa Air 3 Inch",
        issue: "Pompa air menyala terus menerus di sawah Kecamatan Amanuban Selatan tanpa pemantauan kelembapan.",
        severity: "sedang",
        impact: "Pemborosan BBM bensin dangan efisiensi siram yang rendah pada komoditas Jagung.",
        recommendation: "Gunakan metode penggenangan bergilir (intermittent irrigation) dan jadwalkan pompa beroperasi hanya pada pagi/sore hari."
      },
      {
        id: "eff-3",
        alsintan: "Traktor Roda 2 (Yanmar)",
        issue: "Kinerja sangat efisien (8.5 Liter/Ha) di Kecamatan Mollo Utara untuk pembajakan lahan kebun tanaman hortikultura.",
        severity: "rendah",
        impact: "Nisbah hemat biaya operasional bahan bakar sebesar 15% dari standar daerah.",
        recommendation: "Pertahankan densitas kerja unit ini dan jadikan operator daerah Mollo Utara sebagai contoh pelatihan efisiensi bagi kecamatan lain."
      }
    ],
    allocationRecommendations: [
      {
        id: "alloc-1",
        kecamatan: "Amanuban Selatan",
        alsintanNeeded: "Traktor Roda 4 & Mesin Pompa Air",
        reason: "Merupakan sentra padi sawah utama di Timur Tengah Selatan yang sedang memasuki masa tanam kedua (MT-2), membutuhkan pengerjaan olah tanah yang masif dan pasokan air permukaan penunjang akibat curah hujan minim.",
        action: "Mobilisasi 2 unit Traktor Roda 4 dari depo utama Soe dan 3 unit Pompa air portabel bantuan dari Dinas."
      },
      {
        id: "alloc-2",
        kecamatan: "Mollo Utara",
        alsintanNeeded: "Cultivator Tanaman Hortikultura",
        reason: "Wilayah dataran tinggi dengan topografi berbukit dan berhawa sejuk, fokus pada sayur-sayuran, tomat, dan cabai yang memerlukan penggemburan tanah bedengan yang rapat dan presisi.",
        action: "Prioritaskan sisa suplai 4 unit cultivator ukuran kecil ke kelompok tani setempat guna menekan penggunaan cangkul konvensional."
      },
      {
        id: "alloc-3",
        kecamatan: "Batu Putih",
        alsintanNeeded: "Traktor Roda 2 & Water Pump",
        reason: "Daerah kering pembatas dengan kabupaten Kupang yang didominasi budidaya Jagung lokal dan palawija lain pada tanah berpasir.",
        action: "Luncurkan unit Traktor Roda 2 yang lincah bermanuver di areal berpagar hidup tanaman kelor."
      }
    ],
    cropStrategy: {
      season: "Peralihan Pancaroba Kemarau NTT (Juni - September)",
      recommendedCrops: ["Jagung Hibrida", "Sorgum", "Cabai Keriting", "Kacang Tanah"],
      waterStrategy: "Perluas sumur bor pertanian dangkal dan terapkan mulsa organik/plastik di atas bedengan hortikultura untuk menekan laju penguapan (evapotranspirasi) air tanah di TTS yang bersuhu kering.",
      summaryText: "Fokus optimalisasi diarahkan pada tanaman hemat air (low-water-demand) guna mengantisipasi ancaman el-nino lokal. Pengoperasian Alsintan Traktor disarankan dirampungkan secepatnya dalam periode pagi hari agar mesin bekerja di temperatur udara rendah untuk meningkatkan efisiensi pembakaran bbm."
    }
  };
};

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", mode: process.env.NODE_ENV || "development" });
});

// Proxy to fetch data from the Google Spreadsheet or Apps Script Web App in real-time
app.get("/api/fetch-external-data", async (req, res) => {
  try {
    const sheetId = typeof req.query.sheetId === "string" ? req.query.sheetId.trim() : "";
    const activeSheetId = sheetId || "15uUmtI5CDwUw6FpvPyshOR2v9zoDXDxp-3a_D5al7C4";
    
    const clientMacroUrl = typeof req.query.macroUrl === "string" ? req.query.macroUrl.trim() : "";
    const activeMacroUrl = clientMacroUrl || "https://script.google.com/macros/s/AKfycbyhhqEziXcF-OV_d6VXe9rhNT7yqvWo6brR4a43Yolnb8tlUWe7W22c4DXI8s5WtJaC/exec";

    console.log(`Mencoba mengambil data dari Google Apps Script: ${activeMacroUrl}`);
    
    let fetchedData: any = null;
    let isJson = false;

    try {
      const macroResponse = await fetch(activeMacroUrl, {
        method: "GET",
        headers: {
          "Accept": "application/json"
        }
      });
      
      if (macroResponse.ok) {
        const contentType = macroResponse.headers.get("content-type") || "";
        if (contentType.toLowerCase().includes("application/json")) {
          fetchedData = await macroResponse.json();
          isJson = true;
          console.log("Berhasil memuat JSON secara langsung dari Google Apps Script Web App!");
        } else {
          const text = await macroResponse.text();
          try {
            fetchedData = JSON.parse(text);
            isJson = true;
            console.log("Berhasil mem-parsing teks respons Apps Script sebagai JSON!");
          } catch (e) {
            console.log("Respons Apps Script berupa HTML/Teks Non-JSON.");
          }
        }
      } else {
        console.log(`Apps Script Web App mengembalikan status HTTP: ${macroResponse.status}`);
      }
    } catch (e: any) {
      console.log("Tidak dapat menjangkau Apps Script Web App untuk GET, menggunakan fallback Google Sheet CSV.", e.message);
    }

    if (isJson && fetchedData) {
      return res.json({ success: true, isJson: true, data: fetchedData });
    }

    // FALLBACK: Fetch from the Google Spreadsheet as CSV, parsing it in real-time
    // Kita coba panggil format export alternatif dulu, lalu format gviz sebagai cadangan
    const exportUrl = `https://docs.google.com/spreadsheets/d/${activeSheetId}/export?format=csv&gid=1391367572`;
    const gvizUrl = `https://docs.google.com/spreadsheets/d/${activeSheetId}/gviz/tq?tqx=out:csv&gid=1391367572`;
    
    let response: any = null;
    let fetchError: any = null;

    try {
      console.log(`Mengaktifkan Fallback 1: Menghubungi tautan Google Sheet (${activeSheetId}) via Export CSV...`);
      response = await fetch(exportUrl);
      if (!response.ok) {
        console.warn(`Export CSV mengembalikan status HTTP ${response.status}. Menghubungi via Gviz...`);
        response = await fetch(gvizUrl);
      }
    } catch (e: any) {
      console.warn("Gagal fetch pertama (export), mencoba Gviz...", e.message);
      try {
        response = await fetch(gvizUrl);
      } catch (e2: any) {
        fetchError = e2;
      }
    }

    if (!response || !response.ok) {
      const statusText = response ? `HTTP ${response.status}` : (fetchError ? fetchError.message : "Tidak diketahui");
      return res.status(200).json({
        success: false,
        error: "Google Sheets mengembalikan status HTTP " + (response ? response.status : "Error 404/403"),
        details: `Gagal mengunduh berkas Google Sheet dengan ID: ${activeSheetId}. Pastikan berkas diatur aksesnya ke 'Siapa saja dengan link' (Anyone with link) untuk dibaca publik, atau periksa kembali ID tersebut.`
      });
    }

    const csvText = await response.text();
    
    // Safety check: if the text starts with HTML, it means the sheet is private and returned a Google login page
    if (csvText.trim().toLowerCase().startsWith("<!doctype html") || csvText.trim().toLowerCase().startsWith("<html")) {
      return res.status(200).json({
        success: false,
        error: "Google Sheets memerlukan akses Publik (Akses Ditolak).",
        details: `Google Sheet dengan ID ${activeSheetId} terkunci. Pastikan pengaturan berbaginya diset ke 'Siapa saja dengan link' (Anyone with link).`
      });
    }
    
    // Parse CSV Text with support for quoted cellular bounds containing commas
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = "";
    let inQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      const nextChar = csvText[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentCell += '"';
          i++; // skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentCell.trim());
        currentCell = "";
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        currentRow.push(currentCell.trim());
        if (currentRow.some(cell => cell !== "")) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = "";
      } else {
        currentCell += char;
      }
    }
    if (currentCell || currentRow.length > 0) {
      currentRow.push(currentCell.trim());
      if (currentRow.some(cell => cell !== "")) {
        rows.push(currentRow);
      }
    }

    if (rows.length <= 1) {
      // Empty or fallback configuration
      return res.json({ success: true, isJson: true, data: [] });
    }

    const headers = rows[0].map(h => String(h).trim().toLowerCase());
    const dataRows = rows.slice(1);

    const findIndexByHeader = (aliases: string[]): number => {
      return headers.findIndex((h) => aliases.some((alias) => h.includes(alias)));
    };

    const timeIdx = findIndexByHeader(["timestamp", "tanggal", "waktu"]);
    const opIdx = findIndexByHeader(["operator", "nama", "petugas"]);
    const alsIdx = findIndexByHeader(["alsintan", "alat", "mesin"]);
    const locIdx = findIndexByHeader(["kecamatan", "lokasi", "desa"]);
    const luasIdx = findIndexByHeader(["luas", "hektar", "lahan"]);
    const komIdx = findIndexByHeader(["komoditas", "tanaman", "kelompok"]);
    const bbmIdx = findIndexByHeader(["bbm", "bensin", "solar", "bahan bakar"]);
    const dok1Idx = findIndexByHeader(["dokumentasi kegiatan"]);
    const dok2Idx = findIndexByHeader(["dokumen pendukung"]);

    // Map rows cleanly to AlsintanReportRow structures
    const parsedData = dataRows.map((rowArr, index) => {
      const getVal = (colIdx: number, fallback: string) => {
        if (colIdx >= 0 && rowArr[colIdx]) return rowArr[colIdx];
        return fallback;
      };

      const rawTimestamp = getVal(timeIdx, "");
      const rawOperator = getVal(opIdx, "Operator Umum");
      const rawAlsintan = getVal(alsIdx, "Yanmar TR2");
      const lokasi = getVal(locIdx, "Amanuban Selatan");
      const rawLuas = getVal(luasIdx, "");
      const komoditasStr = getVal(komIdx, "");
      const rawBBM = getVal(bbmIdx, "");
      const dokumentasiKegiatan = getVal(dok1Idx, "");
      const dokumenPendukung = getVal(dok2Idx, "");
      
      // 1. Process operator name
      const operator = rawOperator.replace(/\s*\(TR4\)\s*/i, "").trim();

      // 2. Identify the active Machinery name
      let cleanAlsintan = "Traktor Roda 2 (Yanmar)";
      const alsLower = rawAlsintan.toLowerCase();
      if (alsLower.includes("tr4") || alsLower.includes("roda 4") || alsLower.includes("john deere")) {
        cleanAlsintan = "Traktor Roda 4 (John Deere)";
      } else if (alsLower.includes("tr2") || alsLower.includes("roda 2") || alsLower.includes("yanmar")) {
        cleanAlsintan = "Traktor Roda 2 (Yanmar)";
      } else if (alsLower.includes("pompa") || alsLower.includes("water") || alsLower.includes("pump")) {
        cleanAlsintan = "Mesin Pompa Air 3 Inch";
      } else if (alsLower.includes("cultivator")) {
        cleanAlsintan = "Cultivator";
      } else if (alsLower.includes("combine") || alsLower.includes("harvester") || alsLower.includes("panen")) {
        cleanAlsintan = "Combine Harvester";
      }

      // 3. Determine Luas Lahan (Hectare) with smart fallback
      let luasLahan = parseFloat(rawLuas);
      if (isNaN(luasLahan) || luasLahan <= 0) {
        luasLahan = 1.5;
      }

      // 4. Resolve Kabupaten TTS Kecamatan
      let kecamatan = "Amanuban Selatan";
      const locLower = lokasi.toLowerCase();
      if (locLower.includes("bena") || locLower.includes("oebelo")) {
        kecamatan = "Amanuban Selatan";
      } else if (locLower.includes("benlutu") || locLower.includes("boentuka")) {
        kecamatan = "Batu Putih";
      } else if (locLower.includes("kesetnana") || locLower.includes("soe") || locLower.includes("kufe")) {
        kecamatan = "Soe";
      } else if (locLower.includes("boking")) {
        kecamatan = "Boking";
      } else if (locLower.includes("tunua") || locLower.includes("mollo")) {
        kecamatan = "Mollo Utara";
      } else if (locLower.includes("siso")) {
        kecamatan = "Mollo Selatan";
      } else if (locLower.includes("tubuhue")) {
        kecamatan = "Amanuban Barat";
      } else if (locLower.includes("fatuulan") || locLower.includes("kie")) {
        kecamatan = "Kie";
      } else {
        // Neatly capitalize Lokasi name
        kecamatan = lokasi.charAt(0).toUpperCase() + lokasi.slice(1).toLowerCase();
      }

      // 5. Compute dynamic crop (commodity)
      let komoditas = "Jagung Hibrida";
      if (cleanAlsintan.includes("Roda 4") || cleanAlsintan.includes("Combine")) {
        komoditas = "Padi Sawah";
      } else if (cleanAlsintan.includes("Cultivator")) {
        komoditas = "Tomat & Cabai";
      }
      if (komoditasStr) {
        komoditas = komoditasStr;
      }

      // 6. Resolve Fuel consumption (BBM Liter) with strict sheet priority
      let bensin = parseFloat(rawBBM);
      if (isNaN(bensin) || bensin <= 0) {
        // fallback to calculation ONLY if bbm field is blank or invalid
        let bensinRate = 9; // L/Ha for TR2
        if (cleanAlsintan.includes("Roda 4")) bensinRate = 13.5;
        else if (cleanAlsintan.includes("Pompa")) bensinRate = 11;
        else if (cleanAlsintan.includes("Cultivator")) bensinRate = 7.5;
        else if (cleanAlsintan.includes("Combine")) bensinRate = 18;
        bensin = Math.round(luasLahan * bensinRate) || 12;
      }

      return {
        id: `ext-${index}-${Date.now()}`,
        timestamp: rawTimestamp || "10/06/2026 17:00",
        operator: operator,
        alsintan: cleanAlsintan,
        kecamatan: kecamatan,
        desa: lokasi,
        luasLahan: parseFloat(luasLahan.toFixed(1)),
        komoditas: komoditas,
        bensin: bensin,
        status: "Tersingkronisasi" as const,
        dokumentasiKegiatan: dokumentasiKegiatan,
        dokumenPendukung: dokumenPendukung
      };
    });

    console.log(`Berhasil menyinkronkan ${parsedData.length} baris data dari Google Sheet secara langsung!`);
    return res.json({ success: true, isJson: true, data: parsedData });

  } catch (error: any) {
    console.error("Gagal melakukan proxy get Google Sheet:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Gagal menjembatani data CSV Google Sheet", 
      details: error.message 
    });
  }
});

// Proxy to submit data to the Google App Script Web App
app.post("/api/submit-external-data", async (req, res) => {
  try {
    const clientMacroUrl = typeof req.query.macroUrl === "string" ? req.query.macroUrl.trim() : "";
    const activeMacroUrl = clientMacroUrl || "https://script.google.com/macros/s/AKfycbyKpibLPuY9jwZAJjbDkVSyIt-_JZq2H6bPJSfdVA5GiEAqNdXcYiUk7517qgGtBkFpSw/exec";
    console.log(`Mengirimkan baris input baru ke Google Apps Script via proxy server (${activeMacroUrl}):`, req.body);

    const response = await fetch(activeMacroUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(req.body)
    });

    const respText = await response.text();
    return res.json({ success: true, rawResponse: respText });
  } catch (error: any) {
    console.error("Gagal mengirimkan proxy post ke Google Sheet:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Gagal meneruskan input ke Google Sheet", 
      details: error.message 
    });
  }
});

// Endpoint to compute and optimize agricultural reporting and engine telemetry
app.post("/api/optimize", async (req, res) => {
  try {
    const { rawData, summaryStats } = req.body;
    
    if (!rawData || !Array.isArray(rawData)) {
      return res.status(400).json({ error: "Format input data tidak valid. Diperlukan rawData berupa array." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      console.log("Menjalankan optimasi simulasi (tidak ada API Key)...");
      return res.json(getMockAiResponse(rawData.length));
    }

    const prompt = `Anda adalah sistem pakar kecerdasan buatan (AI Specialist) di bidang Agronomi dan Manajemen Alsintan (Alat dan Mesin Pertanian) untuk Dinas Tanaman Pangan, Hortikultura dan Perkebunan Kabupaten Timor Tengah Selatan (TTS), NTT. 

Tugas Anda adalah menganalisis data pelaporan hasil olah lahan berikut dan memberikan rekomendasi optimasi yang sangat tajam, ekonomis, realistis, berdampak, dan praktis. Semua rekomendasi disuarakan dengan tata krama profesional dan dalam Bahasa Indonesia.

Berikut adalah Ringkasan Statistik Pelaporan Lahan TTS:
- Total Pelaporan Lahan: ${summaryStats?.totalReports || rawData.length} pelaporan
- Total Luas Lahan Terolah: ${summaryStats?.totalArea || 0} Hektar
- Total Konsumsi Bahan Bakar: ${summaryStats?.totalFuel || 0} Liter
- Rata-rata Bahan Bakar per Hektar: ${summaryStats?.averageEfficiency || 0} Liter/Hektar

Berikut adalah Data Pelaporan Mentah yang Tersimpan di Google Sheet (format JSON):
${JSON.stringify(rawData.slice(0, 30), null, 2)}

Harap berikan analisis optimasi sistem pelaporan dan penggunaan Alsintan ini sesuai ketentuan berikut.
Fokus analisis Anda:
1. **Analisis Efisiensi Bahan Bakar (Solar/Bensin)**: Hitung atau estimasikan rasio bensin per hektar (L/Ha) untuk setiap tipe Alsintan berdasarkan data di atas. Identifikasi jika ada laporan yang tidak wajar (misalnya pengunaan solar di atas 20 L/Ha atau di bawah 5 L/Ha untuk traktor roda 4) dan tunjukkan nama kecamatan/operator serta berikan saran perbaikan efisiensi operasional.
2. **Rekomendasi Alokasi Unit Alsintan**: Kecamatan di TTS (seperti Amanuban Barat, Amanuban Selatan, Mollo Utara, Mollo Selatan, Batu Putih, Polen, Kie, dll.) memiliki jenis tanah, air, dan tanaman yang berbeda. Rekomendasikan pergeseran unit Alsintan agar selaras dengan jenis komoditas utama daerah tersebut (Padi sawah butuh pompa & traktor roda 4; jagung kebun butuh traktor roda 2, hortikultura berbukit butuh cultivator tanah).
3. **Penyuluhan Strategi Budidaya & Air**: Berikan petunjuk budidaya tanaman sela/pangan yang paling hemat air untuk Kabupaten TTS yang berciri semi-arid (kering).
4. **Indeks Optimasi Keseluruhan**: Berikan nilai indeks optimasi (1-100) dari efisiensi yang tercatat pada pelaporan.

Jawablah HARUS DENGAN OUTPUT JSON MUTLAK YANG VALID (tanpa teks pembuka atau penutup markdown seperti \`\`\`json atau teks lain di luarnya) sesuai struktur berikut:
{
  "overallScore": <angka 1-100>,
  "scoreReason": "<penjelasan singkat kenapa mendapat skor tersebut>",
  "efficiencyAnalysis": [
    {
      "id": "<id unik>",
      "alsintan": "<Nama Alsintan dengan tipe/operator>",
      "issue": "<Isu pemborosan / efisiensi / perawatan yang diidentifikasi dari data>",
      "severity": "tinggi" | "sedang" | "rendah",
      "impact": "<akibat operasional atau ekonomi dari isu tersebut>",
      "recommendation": "<solusi perbaikan konkret berupa instruksi kerja operasional>"
    }
  ],
  "allocationRecommendations": [
    {
      "id": "<id unik>",
      "kecamatan": "<Nama Kecamatan di TTS yang terdampak>",
      "alsintanNeeded": "<Alsintan yang perlu ditambahkan atau diredistribusikan>",
      "reason": "<Analisis latar belakang kebutuhan kecamatan tersebut>",
      "action": "<Langkah mobilisasi fisik yang disarankan>"
    }
  ],
  "cropStrategy": {
    "season": "<Deskripsi musim tanam saat ini di TTS ntt>",
    "recommendedCrops": ["<komoditas 1>", "<komoditas 2>", "<komoditas 3>"],
    "waterStrategy": "<Strategi irigasi pompa air dan penghematan air tanah>",
    "summaryText": "<Ringkasan evaluasi taktis Alsintan & penutup dalam 3 kalimat>"
  }
}`;

    console.log("Mengirim request analisis ke Gemini API...");
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("Respons kosong dari Gemini API");
    }

    try {
      // Clean possible Markdown markers in case the model ignores config
      let cleanedText = textOutput.trim();
      if (cleanedText.startsWith("```json")) {
        cleanedText = cleanedText.substring(7);
      }
      if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText.substring(3);
      }
      if (cleanedText.endsWith("```")) {
        cleanedText = cleanedText.substring(0, cleanedText.length - 3);
      }
      cleanedText = cleanedText.trim();

      const parsedJSON = JSON.parse(cleanedText);
      return res.json(parsedJSON);
    } catch (parseError) {
      console.error("Kesalahan parsing JSON dari Gemini:", textOutput);
      // Fallback inside catch if JSON output format has slight defects
      return res.json(getMockAiResponse(rawData.length));
    }

  } catch (error: any) {
    console.error("Gagal melakukan analisis Gemini:", error);
    // Graceful error propagation back to UI client
    return res.status(500).json({ 
      error: "Gagal menghubungkan sistem analisis AI", 
      details: error.message,
      fallbackData: getMockAiResponse(10)
    });
  }
});

// Start our full-stack server
async function startServer() {
  // Integrate Vite dynamically during development
  if (process.env.NODE_ENV === "production") {
    // Production serving
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    // Development mode with hot reloads handled by Vite's internal DevServer
    console.log("Setting up Vite dev middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Alsintan TTS] Server berjalan di port: http://localhost:${PORT}`);
  });
}

startServer();
