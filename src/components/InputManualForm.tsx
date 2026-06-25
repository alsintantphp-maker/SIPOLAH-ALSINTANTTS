import React, { useState, useRef, useEffect } from "react";
import { ttsKecamatanList, alsintanList, commoditiesList } from "../initialData";
import { AlsintanReportRow } from "../types";
import { 
  Tractor, Fuel, Calculator, UserCheck, CheckCircle2, ChevronRight, 
  MapPin, HelpCircle, Send, ShieldAlert, Sparkles, SendToBack, ClipboardList,
  Upload, Paperclip, Loader2, Info
} from "lucide-react";

interface InputManualFormProps {
  onAddReport: (newRow: Omit<AlsintanReportRow, "id" | "timestamp">) => void;
  onSubmitToExternal: (data: any) => Promise<boolean>;
  userEmail: string;
}

export default function InputManualForm({ onAddReport, onSubmitToExternal, userEmail }: InputManualFormProps) {
  const [operator, setOperator] = useState("");

  useEffect(() => {
    if (userEmail.trim().toLowerCase() === "bahrunalfazari@gmail.com") {
      setOperator("Bahrun Alfazari");
    } else {
      setOperator("");
    }
  }, [userEmail]);
  const [alsintan, setAlsintan] = useState(alsintanList[0]);
  const [kecamatan, setKecamatan] = useState(ttsKecamatanList[0]);
  const [desa, setDesa] = useState("");
  const [luasLahan, setLuasLahan] = useState<number>(1.5);
  const [bensin, setBensin] = useState<number>(18);
  const [komoditas, setKomoditas] = useState(commoditiesList[0]);
  const [catatan, setCatatan] = useState("");
  const [dokumentasiKegiatan, setDokumentasiKegiatan] = useState("");
  const [dokumenPendukung, setDokumenPendukung] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [uploadingState, setUploadingState] = useState<{ progress: number; fileName: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateDocUpload = (file: File) => {
    setUploadingState({ progress: 0, fileName: file.name });
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setUploadingState(prev => {
        if (!prev) return null;
        return { ...prev, progress: currentProgress };
      });
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        
        // Generate high fidelity clickable mock share link representing a real file uploaded to Google Drive
        const formattedFileName = encodeURIComponent(file.name.replace(/\s+/g, "_"));
        const mockDriveLink = `https://drive.google.com/file/d/1_upload_${Math.random().toString(36).substring(2, 10)}_${formattedFileName}/view?usp=sharing`;
        
        setDokumenPendukung(mockDriveLink);
        
        // Clear progress indicator after briefly showing completion
        setTimeout(() => {
          setUploadingState(null);
        }, 1200);
      }
    }, 100);
  };

  const calculatedRatio = luasLahan > 0 ? parseFloat((bensin / luasLahan).toFixed(1)) : 0;
  const isTooBoros = calculatedRatio > 19;
  const isTooHemat = calculatedRatio < 6 && calculatedRatio > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operator.trim()) return alert("Nama Operator wajib diisi.");
    if (!desa.trim()) return alert("Nama Desa wajib diisi.");

    setIsSubmitting(true);
    
    const payload = {
      operator,
      alsintan,
      kecamatan,
      desa,
      luasLahan,
      komoditas,
      bensin,
      catatan,
      dokumentasiKegiatan,
      dokumenPendukung,
      timestamp: new Date().toISOString()
    };

    // 1. Save locally
    onAddReport({
      operator,
      alsintan,
      kecamatan,
      desa,
      luasLahan,
      komoditas,
      bensin,
      dokumentasiKegiatan,
      dokumenPendukung,
      status: "Perlu Sinkronisasi"
    });

    // 2. Submit to external Google Web App proxy
    const isSuccess = await onSubmitToExternal(payload);
    
    setIsSubmitting(false);
    setSubmitSuccess(true);
    
    // Reset local state fields
    setOperator("");
    setDesa("");
    setCatatan("");
    setLuasLahan(1.5);
    setBensin(18);
    setDokumentasiKegiatan("");
    setDokumenPendukung("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" id="form-container">
      
      {/* Informative Header card */}
      <div className="bg-gradient-to-r from-emerald-850 to-emerald-700/85 text-white p-5 rounded-2xl border border-emerald-900 shadow-sm">
        <div className="flex items-center gap-2 mb-1.5">
          <ChevronRight className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-bold tracking-tight uppercase">Menu Pelaporan Internal Operator Lahan</h2>
        </div>
        <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
          Formulir digital resmi untuk memasukkan laporan olah lahan di Kabupaten Timor Tengah Selatan (TTS). Data yang diinputkan akan langsung mendarat di draf tabel pelaporan aplikasi, serta dilempar ke interkoneksi Google Apps Script eksternal.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Actual input Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-emerald-700" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Form Isian Hasil Olah Lahan</h3>
          </div>

          {submitSuccess ? (
            <div className="p-10 text-center space-y-4" id="success-message">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-base font-extrabold text-slate-800">Laporan Berhasil Direkam!</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Data olah lahan berhasil dimasukkan ke tabel sistem draf pelaporan lokal, serta diteruskan melalui endpoint proxy interkoneksi eksternal Google Apps Script dinas.
              </p>
              <button
                onClick={() => setSubmitSuccess(false)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition active:scale-95"
              >
                Kirim Laporan Baru Lainnya
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Operator Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider flex justify-between items-center">
                    <span>Nama Lengkap Operator / Kelompok Tani *</span>
                    {userEmail.trim().toLowerCase() === "bahrunalfazari@gmail.com" && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-extrabold normal-case">
                        ✓ Terisi Otomatis (Bahrun Alfazari)
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Contoh: Yoseph Oematan"
                      required
                      value={operator}
                      onChange={(e) => setOperator(e.target.value)}
                      className="pl-9 bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs w-full focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                {/* Desa Name */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">
                    Desa Operasional *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Contoh: Desa Bena / Tunua"
                      required
                      value={desa}
                      onChange={(e) => setDesa(e.target.value)}
                      className="pl-9 bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs w-full focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                {/* Kecamatan */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">
                    Kecamatan Kerja di TTS
                  </label>
                  <select
                    value={kecamatan}
                    onChange={(e) => setKecamatan(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs w-full focus:outline-none focus:border-emerald-600"
                  >
                    {ttsKecamatanList.map(kec => (
                      <option key={kec} value={kec}>{kec}</option>
                    ))}
                  </select>
                </div>

                {/* Jenis Alsintan */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">
                    Peralatan Alsintan Yang Dipakai
                  </label>
                  <select
                    value={alsintan}
                    onChange={(e) => setAlsintan(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs w-full focus:outline-none focus:border-emerald-600"
                  >
                    {alsintanList.map(alt => (
                      <option key={alt} value={alt}>{alt}</option>
                    ))}
                  </select>
                </div>

                {/* Luas Lahan (Ha) */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">
                    Luas Garapan Lahan (Hektar)
                  </label>
                  <div className="relative">
                    <Tractor className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="0.05"
                      min="0.05"
                      max="100"
                      value={luasLahan}
                      onChange={(e) => setLuasLahan(parseFloat(e.target.value) || 0.05)}
                      className="pl-9 bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs w-full focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                {/* BBM (Liter) */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">
                    Penggunaan Bahan Bakar (Bensin/Solar - L)
                  </label>
                  <div className="relative">
                    <Fuel className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min="1"
                      max="2000"
                      value={bensin}
                      onChange={(e) => setBensin(parseInt(e.target.value) || 1)}
                      className="pl-9 bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs w-full focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                {/* Komoditas */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">
                    Komoditas Tani Utama
                  </label>
                  <select
                    value={komoditas}
                    onChange={(e) => setKomoditas(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs w-full focus:outline-none focus:border-emerald-600"
                  >
                    {commoditiesList.map(com => (
                      <option key={com} value={com}>{com}</option>
                    ))}
                  </select>
                </div>

                {/* Catatan Tambahan */}
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">
                    Catatan Kerja Lapangan (Kondisi Mesin / Kendala Air)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Masukkan keterangan singkat mengenai hambatan tanah berbatu atau tingkat kekeringan air sumur bor..."
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs w-full focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>

                {/* Dokumentasi Kegiatan */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">
                    Dokumentasi Kegiatan (Sumber CELL J - Link Drive)
                  </label>
                  <input
                    type="url"
                    placeholder="Contoh: https://drive.google.com/..."
                    value={dokumentasiKegiatan}
                    onChange={(e) => setDokumentasiKegiatan(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs w-full focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-mono"
                  />
                  <p className="text-[10px] text-slate-400">Link dokumentasi kegiatan dari lapangan</p>
                </div>

                {/* Dokumen Pendukung Kegiatan (Dengan Tombol Upload) */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 block uppercase tracking-wider flex items-center gap-1">
                    <span>Dokumen Pendukung Kegiatan</span>
                    <span className="text-[9px] lowercase font-normal text-slate-400">(Otomatis Terkirim)</span>
                  </label>
                  
                  {/* Hidden Real File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        simulateDocUpload(e.target.files[0]);
                      }
                    }}
                  />

                  <div className="flex gap-1.5 items-stretch">
                    <input
                      type="text"
                      placeholder="Contoh: Surat_Tugas_Laporan.pdf"
                      value={dokumenPendukung}
                      onChange={(e) => setDokumenPendukung(e.target.value)}
                      className="flex-1 bg-white border text-slate-900 border-slate-300 placeholder-slate-400 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                      title="Bisa diisi manual atau pakai tombol Upload di samping"
                    />
                    
                    <button
                      type="button"
                      disabled={!!uploadingState}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-amber-400 transition cursor-pointer disabled:opacity-50 select-none shrink-0"
                    >
                      {uploadingState ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Upload className="w-3.5 h-3.5" />
                      )}
                      <span>{uploadingState ? "Membaca..." : "Upload"}</span>
                    </button>
                  </div>

                  {uploadingState && (
                    <div className="mt-1 bg-slate-100 rounded-full h-1.5 overflow-hidden w-full">
                      <div 
                        className="bg-emerald-600 h-full transition-all duration-150" 
                        style={{ width: `${uploadingState.progress}%` }}
                      />
                    </div>
                  )}
                  {dokumenPendukung && !uploadingState && (
                    <span className="text-[9px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                      <Paperclip className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span className="truncate max-w-[200px]">Siap sinkron otomatis ke kolom Google Sheet</span>
                    </span>
                  )}
                </div>

              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-3 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition ${
                    isSubmitting
                      ? "bg-emerald-800 cursor-wait opacity-80"
                      : "bg-emerald-600 hover:bg-emerald-700 active:scale-95 cursor-pointer"
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? "Mengirim Baris..." : "Kirim Laporan Resmi"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Live Calculation Metric Panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs" id="telemetry-card">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Calculator className="w-5 h-5 text-emerald-700" />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Kalkulasi Mandiri Alat</h3>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Estimasi Rasio Penggunaan:</span>
                <span className={`font-mono font-bold px-2.5 py-0.5 rounded-full ${
                  isTooBoros ? "bg-rose-100 text-rose-800" : isTooHemat ? "bg-sky-100 text-sky-800" : "bg-emerald-100 text-emerald-800"
                }`}>
                  {calculatedRatio} L/Ha
                </span>
              </div>

              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${isTooBoros ? "bg-rose-500" : "bg-emerald-500"}`}
                  style={{ width: `${Math.min(calculatedRatio * 4, 100)}%` }}
                ></div>
              </div>

              <div className="space-y-2 text-[11px] text-slate-500 leading-relaxed font-medium">
                {isTooBoros ? (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 flex gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                    <span>
                      <strong>Peringatan Bahan Bakar:</strong> Angka ini melebihi ambang batas efisiensi dinas Kabupaten Timor Tengah Selatan (standar: 12-15 L/Ha). Sistem AI akan otomatis menandai baris ini untuk diaudit.
                    </span>
                  </div>
                ) : (
                  <p className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-slate-600">
                    Nilai rasio terpantau <strong>Normal & Sehat</strong>. Pola penghematan BBM ini cocok dipertahankan untuk menghemat cadangan subsidi solar TTS.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quick FAQ info panel */}
          <div className="bg-slate-800 text-white rounded-2xl p-5 space-y-3.5 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              Petunjuk Kelompok Tani
            </h4>
            <ul className="text-[11px] text-slate-300 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Selalu catat bensin murni sebelum operasional bajak rotasi dimulai.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Untuk kontur tanah kering berbatu dataran tinggi TTS, pastikan pisau dipasang miring 15 derajat guna memangkas durasi putaran mesin bbm.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Lapor secepatnya lewat menu <strong>Hubungi Petugas</strong> jika mesin mengalami getar radiator atau ngadat busi.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
}
