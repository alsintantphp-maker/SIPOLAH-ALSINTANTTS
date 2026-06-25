import React, { useState, useRef } from "react";
import { AlsintanReportRow } from "../types";
import { ttsKecamatanList, alsintanList, commoditiesList } from "../initialData";
import { 
  Search, Trash2, Edit3, Plus, ArrowRight, Download, FileSpreadsheet, RotateCcw, Check, X,
  ExternalLink, Calendar, MapPin, Layers, Settings, Fuel, Upload, Paperclip, Loader2, AlertTriangle
} from "lucide-react";

interface SpreadsheetGridProps {
  reports: AlsintanReportRow[];
  onAddReport: (newRow: Omit<AlsintanReportRow, "id" | "timestamp">) => void;
  onUpdateReport: (updatedRow: AlsintanReportRow) => void;
  onDeleteReport: (id: string) => void;
  onResetData: () => void;
  isSyncing: boolean;
  onSyncRow: (id: string) => void;
  onSyncAll: () => void;
  userEmail: string;
}

export default function SpreadsheetGrid({
  reports,
  onAddReport,
  onUpdateReport,
  onDeleteReport,
  onResetData,
  isSyncing,
  onSyncRow,
  onSyncAll,
  userEmail
}: SpreadsheetGridProps) {
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKecamatan, setSelectedKecamatan] = useState("Semua");
  const [selectedAlsintan, setSelectedAlsintan] = useState("Semua");

  // Add Form inline / modal visibility
  const [showAddForm, setShowAddForm] = useState(false);
  const [newForm, setNewForm] = useState({
    operator: "",
    alsintan: alsintanList[0],
    kecamatan: ttsKecamatanList[0],
    desa: "",
    luasLahan: 1.0,
    komoditas: commoditiesList[0],
    bensin: 3,
    dokumentasiKegiatan: "",
    dokumenPendukung: "",
  });

  // Cell Editing states
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<AlsintanReportRow | null>(null);

  // File uploading simulator states & references
  const [uploadingState, setUploadingState] = useState<{ id: string | "new"; progress: number; fileName: string } | null>(null);
  const newFileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  const isAuthorized = userEmail.trim().toLowerCase() === "bahrunalfazari@gmail.com";

  React.useEffect(() => {
    if (isAuthorized) {
      setNewForm(prev => ({ ...prev, operator: "Bahrun Alfazari" }));
    } else {
      setNewForm(prev => ({ ...prev, operator: "" }));
    }
  }, [userEmail, isAuthorized]);

  const simulateDocUpload = (file: File, targetId: string | "new") => {
    setUploadingState({ id: targetId, progress: 0, fileName: file.name });
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setUploadingState(prev => {
        if (!prev) return null;
        return { ...prev, progress: currentProgress };
      });
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        
        // Generate a high fidelity clickable mock share link representing a real file uploaded to Google Drive
        const formattedFileName = encodeURIComponent(file.name.replace(/\s+/g, '_'));
        const mockDriveLink = `https://drive.google.com/file/d/1_upload_${Math.random().toString(36).substring(2, 10)}_${formattedFileName}/view?usp=sharing`;
        
        if (targetId === "new") {
          setNewForm(prev => ({
            ...prev,
            dokumenPendukung: mockDriveLink
          }));
        } else {
          setEditForm(prev => prev ? ({
            ...prev,
            dokumenPendukung: mockDriveLink
          }) : null);
        }
        
        // Clear progress indicator after briefly showing completion
        setTimeout(() => {
          setUploadingState(null);
        }, 1200);
      }
    }, 100);
  };

  // Stats computation
  const totalArea = reports.reduce((sum, r) => sum + r.luasLahan, 0);
  const totalFuel = reports.reduce((sum, r) => sum + r.bensin, 0);
  const avgEfficiency = totalArea > 0 ? parseFloat((totalFuel / totalArea).toFixed(1)) : 0;
  const pendingSyncCount = reports.filter(r => r.status !== "Tersingkronisasi").length;

  // Filtered reports
  const filteredReports = reports.filter((row) => {
    const matchesSearch = row.operator.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          row.desa.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesKecamatan = selectedKecamatan === "Semua" || row.kecamatan === selectedKecamatan;
    const matchesAlsintan = selectedAlsintan === "Semua" || row.alsintan === selectedAlsintan;
    return matchesSearch && matchesKecamatan && matchesAlsintan;
  });

  const handleStartEdit = (row: AlsintanReportRow) => {
    setEditingRowId(row.id);
    setEditForm({ ...row });
  };

  const handleSaveEdit = () => {
    if (editForm) {
      // Mark as needing sync upon edit to emulate physical sheet optimization
      const updated = {
        ...editForm,
        status: "Perlu Sinkronisasi" as const
      };
      onUpdateReport(updated);
      setEditingRowId(null);
      setEditForm(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
    setEditForm(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.operator.trim()) {
      alert("Nama operator harus diisi!");
      return;
    }
    if (!newForm.desa.trim()) {
      alert("Nama desa harus diisi!");
      return;
    }
    onAddReport({
      operator: newForm.operator,
      alsintan: newForm.alsintan,
      kecamatan: newForm.kecamatan,
      desa: newForm.desa,
      luasLahan: Number(newForm.luasLahan),
      komoditas: newForm.komoditas,
      bensin: Number(newForm.bensin),
      dokumentasiKegiatan: newForm.dokumentasiKegiatan,
      dokumenPendukung: newForm.dokumenPendukung,
      status: "Perlu Sinkronisasi",
    });
    // Reset form
    setNewForm({
      operator: "",
      alsintan: alsintanList[0],
      kecamatan: ttsKecamatanList[0],
      desa: "",
      luasLahan: 1.0,
      komoditas: commoditiesList[0],
      bensin: 3,
      dokumentasiKegiatan: "",
      dokumenPendukung: "",
    });
    setShowAddForm(false);
  };

  // Convert current table to CSV file for local download simulation
  const exportToCSV = () => {
    const headers = "ID,Timestamp,Operator,Alsintan,Kecamatan,Desa,LuasLahan_Ha,Komoditas,BahanBakar_Liter,DokumentasiKegiatan,DokumenPendukung,Status\n";
    const rows = reports.map(r => 
      `"${r.id}","${r.timestamp}","${r.operator}","${r.alsintan}","${r.kecamatan}","${r.desa}",${r.luasLahan},"${r.komoditas}",${r.bensin},"${r.dokumentasiKegiatan || ""}","${r.dokumenPendukung || ""}","${r.status}"`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Laporan_Olah_Lahan_Alsintan_TTS.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" id="spreadsheet-container-wrapper">
      
      {/* Alert banner for non-authorized emails */}
      {!isAuthorized && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 shadow-xs animate-fade-in">
          <div className="p-2 bg-amber-100 text-amber-800 rounded-xl shrink-0">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-amber-900 uppercase tracking-widest">⚠️ Otorisasi Akses Terbatas (Hanya Lihat)</h4>
            <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
              Anda sedang login sebagai <strong className="font-bold underline">{userEmail}</strong>. Sesuai kebijakan dinas, hak untuk menambah, mengedit, menghapus, menyinkronkan, atau menyetel ulang data siber ini dibatasi hanya untuk user email administrator resmi <strong className="text-amber-950 font-bold">bahrunAlfazari@gmail.com</strong>.
            </p>
            <p className="text-[10px] text-amber-600 mt-0.5">
              Silakan ganti/tambahkan user email <strong className="font-bold">bahrunAlfazari@gmail.com</strong> pada tombol pemilih <strong className="underline">"Staf Aktif"</strong> di bagian paling atas halaman untuk membuka akses penuh.
            </p>
          </div>
        </div>
      )}
      
      {/* Quick Dashboard Stat Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-4 rounded-xl shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider opacity-85">Total Olah Lahan</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold">{totalArea.toFixed(1)}</span>
            <span className="text-xs font-semibold">Hektar (Ha)</span>
          </div>
          <span className="text-[10px] opacity-75 mt-1 block">Dari {reports.length} laporan di TTS</span>
        </div>

        <div className="bg-slate-800 text-white p-4 rounded-xl shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider opacity-85">Total Konsumsi BBM</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold">{totalFuel}</span>
            <span className="text-xs font-semibold">Liter (L)</span>
          </div>
          <span className="text-[10px] text-emerald-400 mt-1 block">Bensin / Solar Subsidi</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Rataan Efisiensi</span>
          <div className="mt-2 flex items-baseline gap-1 text-slate-800">
            <span className="text-2xl font-extrabold text-emerald-700">{avgEfficiency}</span>
            <span className="text-xs font-semibold text-slate-400">Liter / Ha</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Rata-rata se-kabupaten</span>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Belum Disinkronkan</span>
          <div className="mt-2 flex items-baseline gap-1.5 text-slate-800">
            <span className="text-2xl font-extrabold text-amber-600">{pendingSyncCount}</span>
            <span className="text-xs font-semibold text-slate-400">Baris</span>
          </div>
          <span className="text-[10px] text-amber-500 mt-1 block font-medium">Butuh Unggah ke Sheets</span>
        </div>
      </div>

      {/* Main Grid Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        
        {/* Spreadsheet Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
          
          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari Operator / Desa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg bg-white w-full sm:w-[220px] focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Filter Kecamatan */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Kecamatan:</span>
              <select
                value={selectedKecamatan}
                onChange={(e) => setSelectedKecamatan(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-emerald-600"
              >
                <option value="Semua">Semua Kecamatan</option>
                {ttsKecamatanList.map(kec => (
                  <option key={kec} value={kec}>{kec}</option>
                ))}
              </select>
            </div>

            {/* Filter Alsintan */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Alsintan:</span>
              <select
                value={selectedAlsintan}
                onChange={(e) => setSelectedAlsintan(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-emerald-600"
              >
                <option value="Semua">Semua Alat</option>
                {alsintanList.map(alt => (
                  <option key={alt} value={alt}>{alt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto justify-end border-t xl:border-t-0 pt-3 xl:pt-0">
            {pendingSyncCount > 0 && (
              <button
                onClick={onSyncAll}
                disabled={isSyncing}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer bg-amber-500 hover:bg-amber-600 text-slate-900 border border-amber-400 ${
                  isSyncing ? "opacity-75 cursor-wait" : ""
                }`}
                title="Sinkronkan seluruh baris baru/koreksi ke Google Sheet secara real-time"
              >
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-900 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950"></span>
                </div>
                {isSyncing ? "Menyinkronkan..." : `Sinkronkan Semua (${pendingSyncCount})`}
              </button>
            )}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Baris Baru
            </button>
            <button
              onClick={exportToCSV}
              className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Unduh data dalam format file CSV lokal"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              Unduh CSV
            </button>
            <button
              onClick={onResetData}
              className="px-3.5 py-1.5 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Kembalikan data ke pengaturan bawaan dinas"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
              Reset Data
            </button>
          </div>
        </div>

        {/* Dynamic Inner Form to Add Row */}
        {showAddForm && (
          <form onSubmit={handleFormSubmit} className="p-5 bg-emerald-50/50 border-b border-slate-200">
            <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mb-3">
              <Plus className="w-4 h-4" />
              FORM PENAMBAHAN RECORD PELAPORAN BARIS GOOGLE SHEET
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 block uppercase">Nama Operator</label>
                <input
                  type="text"
                  placeholder="Contoh: Hendrik Noemleni"
                  value={newForm.operator}
                  onChange={(e) => setNewForm({ ...newForm, operator: e.target.value })}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs w-full focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 block uppercase">Desa Operasional</label>
                <input
                  type="text"
                  placeholder="Contoh: Kapan / Niki-Niki"
                  value={newForm.desa}
                  onChange={(e) => setNewForm({ ...newForm, desa: e.target.value })}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs w-full focus:outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 block uppercase">Kecamatan di TTS</label>
                <select
                  value={newForm.kecamatan}
                  onChange={(e) => setNewForm({ ...newForm, kecamatan: e.target.value })}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs w-full focus:outline-none focus:border-emerald-600"
                >
                  {ttsKecamatanList.map(kec => (
                    <option key={kec} value={kec}>{kec}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 block uppercase">Peralatan Alsintan</label>
                <select
                  value={newForm.alsintan}
                  onChange={(e) => setNewForm({ ...newForm, alsintan: e.target.value })}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs w-full focus:outline-none focus:border-emerald-600"
                >
                  {alsintanList.map(alt => (
                    <option key={alt} value={alt}>{alt}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 block uppercase">Luas Olah Lahan (Hektar)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="50"
                  value={newForm.luasLahan}
                  onChange={(e) => setNewForm({ ...newForm, luasLahan: parseFloat(e.target.value) || 1.0 })}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs w-full focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 block uppercase">BBM Yang Dipakai (Liter)</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={newForm.bensin}
                  onChange={(e) => setNewForm({ ...newForm, bensin: parseInt(e.target.value) || 10 })}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs w-full focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 block uppercase">Komoditas Tani</label>
                <select
                  value={newForm.komoditas}
                  onChange={(e) => setNewForm({ ...newForm, komoditas: e.target.value })}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs w-full focus:outline-none focus:border-emerald-600"
                >
                  {commoditiesList.map(com => (
                    <option key={com} value={com}>{com}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 block uppercase">Dokumentasi Kegiatan (Link Drive)</label>
                <input
                  type="url"
                  placeholder="Contoh: https://drive.google.com/..."
                  value={newForm.dokumentasiKegiatan}
                  onChange={(e) => setNewForm({ ...newForm, dokumentasiKegiatan: e.target.value })}
                  className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs w-full focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 block uppercase font-bold flex items-center gap-1">
                  <span>Dokumen Pendukung Kegiatan</span>
                  <span className="text-[9px] lowercase font-normal text-slate-400">(Upload file otomatis terkirim)</span>
                </label>
                
                {/* Hidden Real File Input */}
                <input
                  type="file"
                  ref={newFileRef}
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      simulateDocUpload(e.target.files[0], "new");
                    }
                  }}
                />

                <div className="flex gap-1.5 items-stretch">
                  <input
                    type="text"
                    placeholder="Contoh: Surat_Tugas_Pelaporan.pdf"
                    value={newForm.dokumenPendukung}
                    onChange={(e) => setNewForm({ ...newForm, dokumenPendukung: e.target.value })}
                    className="flex-1 bg-white border text-slate-900 border-slate-300 placeholder-slate-400 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 bg-amber-50/5"
                    title="Bisa diisi manual atau pakai tombol Upload di samping"
                  />
                  
                  <button
                    type="button"
                    disabled={uploadingState?.id === "new"}
                    onClick={() => newFileRef.current?.click()}
                    className="px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 border border-amber-400 transition cursor-pointer disabled:opacity-50"
                  >
                    {uploadingState?.id === "new" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{uploadingState?.id === "new" ? "Membaca..." : "Upload"}</span>
                  </button>
                </div>

                {uploadingState?.id === "new" && (
                  <div className="mt-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full transition-all duration-150" 
                      style={{ width: `${uploadingState.progress}%` }}
                    />
                  </div>
                )}
                {newForm.dokumenPendukung && !uploadingState && (
                  <span className="text-[9px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5 animate-fade-in">
                    <Paperclip className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span className="truncate max-w-[200px]">Siap sinkron otomatis ke kolom Google Sheet</span>
                  </span>
                )}
              </div>

              <div className="flex items-end gap-2 pt-2 md:pt-0">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs py-2.5 transition active:scale-95 cursor-pointer"
                >
                  Masukkan ke Tabel
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 bg-slate-300 hover:bg-slate-400 text-slate-700 font-semibold rounded-lg text-xs py-2.5 transition cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </div>
          </form>
        )}

        {/* The Google Sheets Grid Container */}
        <div className="overflow-x-auto spreadsheet-scroll relative">
          <table className="w-full text-slate-700 border-collapse">
            
            {/* Sheet Column Headers (Mocking Google Sheets A, B, C...) */}
            <thead>
              <tr className="bg-[#f8fafc] text-slate-400 text-[10px] font-mono border-b border-slate-200 divide-x divide-slate-200">
                <th className="w-12 text-center py-1 select-none font-bold">#</th>
                <th className="px-4 py-1 text-left min-w-[150px]">Col A (TANGGAL)</th>
                <th className="px-4 py-1 text-left min-w-[140px]">Col B (OPERATOR)</th>
                <th className="px-4 py-1 text-left min-w-[200px]">Col C (ALSINTAN)</th>
                <th className="px-4 py-1 text-left min-w-[150px]">Col D (KECAMATAN)</th>
                <th className="px-4 py-1 text-left min-w-[120px]">Col E (DESA)</th>
                <th className="px-4 py-1 text-right min-w-[100px]">Col F (LUAS_HA)</th>
                <th className="px-4 py-1 text-left min-w-[130px]">Col G (KOMODITAS)</th>
                <th className="px-4 py-1 text-right min-w-[110px]">Col H (BBM_LIT)</th>
                <th className="px-4 py-1 text-left min-w-[180px]">Col J (DOK_KEGIATAN)</th>
                <th className="px-4 py-1 text-left min-w-[180px] text-amber-700">Col K (DOK_PENDUKUNG)</th>
                <th className="px-4 py-1 text-center min-w-[140px]">Col I (STATUS_SYNC)</th>
                <th className="px-4 py-1 text-center min-w-[120px]">AKSI BARIS</th>
              </tr>
            </thead>

            {/* Sheet Data Content */}
            <tbody className="divide-y divide-slate-150 text-[12px] divide-x divide-slate-100">
              {filteredReports.length > 0 ? (
                filteredReports.map((row, index) => {
                  const isEditing = editingRowId === row.id;
                  const ratio = row.luasLahan > 0 ? (row.bensin / row.luasLahan).toFixed(1) : "0";
                  const efficiencyAlert = Number(ratio) > 19;

                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-emerald-50/20 group transition ${
                        isEditing ? "bg-amber-50" : index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                      }`}
                    >
                      {/* Row count index marker (mimicking sheet row numbering) */}
                      <td className="bg-slate-100/70 text-[10px] font-mono text-slate-400 font-bold text-center py-2.5">
                        {index + 1}
                      </td>

                      {/* Column A: Timestamp */}
                      <td className="px-4 py-2 font-mono text-slate-500 whitespace-nowrap">
                        {row.timestamp}
                      </td>

                      {/* Column B: Operator */}
                      <td className="px-4 py-2 font-medium text-slate-800">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm?.operator || ""}
                            onChange={(e) => setEditForm(prev => prev ? ({ ...prev, operator: e.target.value }) : null)}
                            className="bg-white border border-slate-300 rounded px-1.5 py-0.5 w-full focus:outline-emerald-500 focus:outline"
                          />
                        ) : (
                          row.operator
                        )}
                      </td>

                      {/* Column C: Alsintan */}
                      <td className="px-4 py-2 text-slate-600">
                        {isEditing ? (
                          <select
                            value={editForm?.alsintan || ""}
                            onChange={(e) => setEditForm(prev => prev ? ({ ...prev, alsintan: e.target.value }) : null)}
                            className="bg-white border border-slate-300 rounded px-1.5 py-0.5 w-full"
                          >
                            {alsintanList.map(alt => (
                              <option key={alt} value={alt}>{alt}</option>
                            ))}
                          </select>
                        ) : (
                          row.alsintan
                        )}
                      </td>

                      {/* Column D: Kecamatan */}
                      <td className="px-4 py-2 text-slate-600">
                        {isEditing ? (
                          <select
                            value={editForm?.kecamatan || ""}
                            onChange={(e) => setEditForm(prev => prev ? ({ ...prev, kecamatan: e.target.value }) : null)}
                            className="bg-white border border-slate-300 rounded px-1.5 py-0.5 w-full"
                          >
                            {ttsKecamatanList.map(kec => (
                              <option key={kec} value={kec}>{kec}</option>
                            ))}
                          </select>
                        ) : (
                          row.kecamatan
                        )}
                      </td>

                      {/* Column E: Desa */}
                      <td className="px-4 py-2 text-slate-600">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm?.desa || ""}
                            onChange={(e) => setEditForm(prev => prev ? ({ ...prev, desa: e.target.value }) : null)}
                            className="bg-white border border-slate-300 rounded px-1.5 py-0.5 w-full"
                          />
                        ) : (
                          row.desa
                        )}
                      </td>

                      {/* Column F: Luas Lahan (Ha) */}
                      <td className="px-4 py-2 text-right font-mono font-medium">
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.1"
                            value={editForm?.luasLahan || 0}
                            onChange={(e) => setEditForm(prev => prev ? ({ ...prev, luasLahan: parseFloat(e.target.value) || 0 }) : null)}
                            className="bg-white border border-slate-300 rounded px-1.5 py-0.5 w-20 text-right"
                          />
                        ) : (
                          row.luasLahan.toFixed(1) + " Ha"
                        )}
                      </td>

                      {/* Column G: Crop */}
                      <td className="px-4 py-2 text-slate-600 font-medium">
                        {isEditing ? (
                          <select
                            value={editForm?.komoditas || ""}
                            onChange={(e) => setEditForm(prev => prev ? ({ ...prev, komoditas: e.target.value }) : null)}
                            className="bg-white border border-slate-300 rounded px-1.5 py-0.5 w-full"
                          >
                            {commoditiesList.map(com => (
                              <option key={com} value={com}>{com}</option>
                            ))}
                          </select>
                        ) : (
                          row.komoditas
                        )}
                      </td>

                      {/* Column H: Fuel (Liter) */}
                      <td className="px-4 py-2 text-right font-mono font-medium">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editForm?.bensin || 0}
                            onChange={(e) => setEditForm(prev => prev ? ({ ...prev, bensin: parseInt(e.target.value) || 0 }) : null)}
                            className="bg-white border border-slate-300 rounded px-1.5 py-0.5 w-20 text-right"
                          />
                        ) : (
                          <span className={efficiencyAlert ? "text-rose-600 font-bold" : "text-slate-700"}>
                            {row.bensin} L
                          </span>
                        )}
                      </td>

                      {/* Column J: Dokumentasi Kegiatan (Link Drive) */}
                      <td className="px-4 py-2 text-slate-600">
                        {isEditing ? (
                          <input
                            type="text"
                            placeholder="Link Drive..."
                            value={editForm?.dokumentasiKegiatan || ""}
                            onChange={(e) => setEditForm(prev => prev ? ({ ...prev, dokumentasiKegiatan: e.target.value }) : null)}
                            className="bg-white border border-slate-300 rounded px-1.5 py-0.5 w-full text-xs"
                          />
                        ) : row.dokumentasiKegiatan ? (
                          <a
                            href={row.dokumentasiKegiatan}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 underline font-medium truncate max-w-[150px]"
                            title={row.dokumentasiKegiatan}
                          >
                            <span>Unduh / Lihat ↗</span>
                          </a>
                        ) : (
                          <span className="text-slate-300 italic text-[11px]">Tidak ada dokumen</span>
                        )}
                      </td>

                      {/* Column K: Dokumen Pendukung Kegiatan (Input Manual) */}
                      <td className="px-4 py-2 text-slate-600">
                        {isEditing ? (
                          <div className="flex flex-col gap-1 min-w-[200px]">
                            {/* Hidden Real File Input for editing */}
                            <input
                              type="file"
                              ref={editFileRef}
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  simulateDocUpload(e.target.files[0], row.id);
                                }
                              }}
                            />
                            
                            <div className="flex gap-1">
                              <input
                                type="text"
                                placeholder="Dokumen Pendukung..."
                                value={editForm?.dokumenPendukung || ""}
                                onChange={(e) => setEditForm(prev => prev ? ({ ...prev, dokumenPendukung: e.target.value }) : null)}
                                className="flex-1 bg-amber-50 text-amber-900 border border-amber-300 rounded px-1.5 py-0.5 text-xs outline-none focus:border-amber-500"
                              />
                              <button
                                type="button"
                                disabled={uploadingState?.id === row.id}
                                onClick={() => editFileRef.current?.click()}
                                className="p-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded flex items-center justify-center shrink-0 disabled:opacity-50"
                                title="Upload File Baru"
                              >
                                {uploadingState?.id === row.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Upload className="w-3 h-3" />
                                )}
                              </button>
                            </div>

                            {uploadingState?.id === row.id && (
                              <div className="bg-slate-100 rounded-full h-1 overflow-hidden w-full">
                                <div 
                                  className="bg-emerald-600 h-full transition-all duration-150" 
                                  style={{ width: `${uploadingState.progress}%` }}
                                />
                              </div>
                            )}
                          </div>
                        ) : row.dokumenPendukung ? (
                          <div className="flex items-center gap-1.5 max-w-[170px] truncate">
                            {row.dokumenPendukung.startsWith("http") ? (
                              <a
                                href={row.dokumenPendukung}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-bold tracking-wide flex items-center gap-1 transition"
                                title="Klik untuk mengunduh / melihat dokumen pendukung di tab baru"
                              >
                                <Paperclip className="w-3 h-3 text-amber-700 shrink-0" />
                                <span className="truncate max-w-[110px]">Unduh Dokumen ↗</span>
                              </a>
                            ) : (
                              <span className="bg-amber-100/70 text-amber-900 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide">
                                {row.dokumenPendukung}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-350 italic text-[11px]">-</span>
                        )}
                      </td>

                      {/* Column I: Status */}
                      <td className="px-4 py-2 text-center whitespace-nowrap">
                        {row.status === "Tersingkronisasi" ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[10px]">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            Tersinkronisasi
                          </span>
                        ) : row.status === "Perlu Sinkronisasi" ? (
                          <button
                            onClick={() => onSyncRow(row.id)}
                            className="inline-flex cursor-pointer items-center gap-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold text-[10px] transition active:scale-95"
                            title="Klik untuk menyinkronkan baris ini secara mandiri"
                          >
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
                            Perlu Sinkronisasi
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold text-[10px]">
                            Verifikasi Dinas
                          </span>
                        )}
                      </td>

                      {/* Action Cell */}
                      <td className="px-4 py-1 text-center whitespace-nowrap">
                        {!isAuthorized ? (
                          <div className="flex items-center justify-center text-slate-400" title="Hak edit/hapus terkunci (Khusus Admin bahrunAlfazari@gmail.com)">
                            <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 select-none">
                              🔒 Terkunci
                            </span>
                          </div>
                        ) : isEditing ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={handleSaveEdit}
                              className="p-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10px] flex items-center gap-0.5"
                            >
                              <Check className="w-3 h-3" /> Simpan
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1 px-2 bg-slate-500 hover:bg-slate-600 text-white rounded font-bold text-[10px] flex items-center gap-0.5"
                            >
                              <X className="w-3 h-3" /> Batal
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleStartEdit(row)}
                              className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded transition cursor-pointer"
                              title="Edit isi baris"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteReport(row.id)}
                              className="p-1 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded transition cursor-pointer"
                              title="Hapus baris ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400 italic">
                    Tidak ditemukan laporan yang sesuai kriteria pencarian / filter Anda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Sheet Grid footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 uppercase font-mono">
          <span>Tabel Aktif: Halaman 1 dari 1</span>
          <span className="flex items-center gap-1 mt-1 sm:mt-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Total record diolah: {filteredReports.length} dari {reports.length} baris
          </span>
        </div>
      </div>
    </div>
  );
}
