import React, { useState } from "react";
import { 
  FileText, ExternalLink, Loader2, FileSpreadsheet, Info, AlertCircle, Sparkles, BookOpen 
} from "lucide-react";

export default function DokumenPendukungForm() {
  const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfG3bfMAfIKI4ibuRfzUiTvQUkwRwyBDCe3PNFqh8LtQ06aaw/viewform?usp=dialog";
  const targetSheetLink = "https://docs.google.com/spreadsheets/d/1nrvmGZy63mufsRJJJvXtr_Q5VnOkSs1vgIrV7lLk2Tw/edit?usp=sharing";
  
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const handleIframeLoad = () => {
    setIframeLoaded(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-sans" id="dokumen-pendukung-embed-view">
      
      {/* Banner introduction with action links */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 border border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-950/80 border border-amber-900 px-2 py-0.5 rounded-full tracking-wider">
              Google Form Integrator
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-full tracking-wider">
              Dinas KPP Kab. TTS
            </span>
          </div>
          <h2 className="text-base font-extrabold text-white">Portal Upload Dokumen Pendukung & Laporan Fisik</h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Halaman integrasi Google Form untuk mengupload Dokumen Pendukung Kegiatan (Surat Tugas, Laporan, atau Hasil Lahan). Data foto diupload lewat form ini dan otomatis tersinkron ke <strong>Cell K</strong> di Google Sheet Dinas.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          <a 
            href={targetSheetLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-bold flex items-center gap-2 transition active:scale-95 border border-slate-700"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Lihat Google Sheet ↗</span>
          </a>

          <a 
            href={formUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition active:scale-95 shadow-md border border-emerald-500"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Buka Form (Tab Baru) ↗</span>
          </a>
        </div>
      </div>

      {/* Embedded form frame and tutorials */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Helper Panel */}
        <div className="space-y-4 lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5 pb-2.5 border-b border-slate-100">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              Petunjuk Upload
            </h3>
            
            <div className="space-y-3.5">
              <div className="flex gap-3">
                <span className="w-5 h-5 bg-amber-100 text-amber-800 font-mono text-xs font-bold flex items-center justify-center rounded-full shrink-0">1</span>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  Isi informasi nama operator, lokasi kecamatan, dan desa pelaporan pada Google Form di sebelah kanan.
                </p>
              </div>

              <div className="flex gap-3">
                <span className="w-5 h-5 bg-amber-100 text-amber-800 font-mono text-xs font-bold flex items-center justify-center rounded-full shrink-0">2</span>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  Gunakan tombol <strong>"Add File" / "Tambahkan File"</strong> di dalam form untuk mengunggah dokumen pendukung / Surat Tugas Anda.
                </p>
              </div>

              <div className="flex gap-3">
                <span className="w-5 h-5 bg-amber-100 text-amber-800 font-mono text-xs font-bold flex items-center justify-center rounded-full shrink-0">3</span>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  Tekan <strong>"Submit" / "Kirim"</strong>. Link upload otomatis tercatat di Google Sheet.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-100/80 rounded-2xl p-4 space-y-2">
            <h4 className="text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-emerald-700 shrink-0" />
              Informasi Sinkronisasi
            </h4>
            <p className="text-[11px] text-emerald-950 leading-relaxed font-medium">
              Sistem backend Apps Script akan memetakan tautan Google Drive dari dokumen pendukung yang Anda unggah secara otomatis ke lembar kerja KPP Kabupaten TTS.
            </p>
          </div>

          <div className="bg-amber-50/60 border border-amber-100/80 rounded-2xl p-4 space-y-2 text-[11px] text-amber-800">
            <h4 className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              Kendala Tampilan?
            </h4>
            <p className="leading-relaxed font-semibold">
              Bila form tidak termuat dengan sempurna karena restriksi browser Anda, silakan klik tombol <strong>"Buka Form (Tab Baru)"</strong> di bagian atas layar untuk mengunduh/mengupload langsung via aplikasi Google.
            </p>
          </div>
        </div>

        {/* Live dynamic Google Form Web interface */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col min-h-[640px]" id="iframe-cabinet-dokumen">
          
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center px-4">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-500" />
              Formulir Unggah Google (Terintegrasi)
            </span>
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Secure Form Link
            </div>
          </div>

          <div className="flex-1 relative bg-slate-50 min-h-[580px]">
            {!iframeLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-white">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase">Menghubungkan ke Portal Google Form...</h4>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-0.5">
                    Harap pastikan koneksi internet stabil saat mengupload file dokumen pendukung.
                  </p>
                </div>
              </div>
            )}

            <iframe 
              src={formUrl}
              className="w-full h-full min-h-[600px] border-none bg-white"
              onLoad={handleIframeLoad}
              title="Formulir Operator Google"
              allow="clipboard-write"
              referrerPolicy="no-referrer"
            />
          </div>

        </div>

      </div>

    </div>
  );
}
