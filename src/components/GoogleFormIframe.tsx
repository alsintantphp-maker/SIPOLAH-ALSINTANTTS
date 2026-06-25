import React, { useState, useEffect } from "react";
import { 
  ExternalLink, FileText, AlertCircle, Info, Sparkles, Check, 
  RefreshCw, Laptop, Send, HelpCircle, MonitorDot, Milestone, Settings
} from "lucide-react";

interface GoogleFormIframeProps {
  macroUrl: string;
  onMacroUrlChange: (newUrl: string) => void;
}

export default function GoogleFormIframe({ macroUrl, onMacroUrlChange }: GoogleFormIframeProps) {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [urlInput, setUrlInput] = useState(macroUrl);

  useEffect(() => {
    setUrlInput(macroUrl);
  }, [macroUrl]);

  const handleIframeLoad = () => {
    setIframeLoaded(true);
  };

  const handleSaveUrl = () => {
    if (urlInput.trim().startsWith("https://")) {
      onMacroUrlChange(urlInput.trim());
      setIsEditingUrl(false);
      setIframeLoaded(false);
    } else {
      alert("Masukkan tautan Apps Script Web App yang sah (dimulai dengan https://)");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6" id="google-form-embed-view">
      
      {/* Banner introduction with action links */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 border border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-950/80 border border-amber-900 px-2 py-0.5 rounded-full tracking-wider">
              Google Web Service Integrator
            </span>
          </div>
          <h2 className="text-base font-extrabold text-white">Layanan Input Form Pelaporan Lapangan Dinas</h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Halaman ini menghubungkan langsung ke formulir Google Apps Script Dinas yang didesain khusus untuk operator kecamatan di TTS. Hubungan web aman, terenkripsi, dan real-time.
          </p>
        </div>

        <a 
          href={macroUrl}
          target="_blank"
          referrerPolicy="no-referrer"
          rel="noopener noreferrer"
          className="px-5 py-3 cursor-pointer bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2.5 transition active:scale-95 shadow-md shrink-0 border border-emerald-500"
        >
          <ExternalLink className="w-4 h-4" />
          Buka Form di Tab Baru (Resmi)
        </a>
      </div>

      {/* Dynamic Macro Web App URL Configuration */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="space-y-0.5 animate-fade-in">
          <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            Endpoint Apps Script Web App Aktif (Sirkuit Pengiriman & Form)
          </h3>
          <p className="text-[10px] text-slate-500 font-medium">
            Tautan makro penengah pengiriman form dan pengambilan dataset.
          </p>
        </div>
        
        <div className="w-full sm:w-auto flex items-center gap-2">
          {isEditingUrl ? (
            <div className="flex items-center gap-2 w-full sm:w-[400px]">
              <input 
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 text-[11px] font-mono border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 bg-white"
                placeholder="https://script.google.com/macros/s/.../exec"
              />
              <button 
                onClick={handleSaveUrl}
                className="px-3 py-1.5 bg-emerald-600 font-bold text-[11px] hover:bg-emerald-500 text-white rounded-lg transition shrink-0 cursor-pointer"
              >
                Simpan
              </button>
              <button 
                onClick={() => { setUrlInput(macroUrl); setIsEditingUrl(false); }}
                className="px-2.5 py-1.5 bg-slate-200 font-semibold text-[11px] hover:bg-slate-300 text-slate-700 rounded-lg transition shrink-0 cursor-pointer"
              >
                Batal
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full justify-between sm:justify-start">
              <span className="text-[10px] bg-slate-100 font-mono text-slate-600 px-2.5 py-1.5 rounded-lg border border-slate-200 max-w-[200px] sm:max-w-[320px] truncate" title={macroUrl}>
                {macroUrl}
              </span>
              <button 
                onClick={() => setIsEditingUrl(true)}
                className="px-3 py-1.5 bg-slate-250 hover:bg-slate-300 border border-slate-300 text-slate-700 text-[11px] font-bold rounded-lg transition shrink-0 cursor-pointer"
              >
                Ubah Endpoint
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Embedded form frame and tutorials */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Step by step operator guidebook */}
        <div className="space-y-4 lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Milestone className="w-4 h-4 text-emerald-700" />
              Langkah Pengisian
            </h3>
            
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="w-5 h-5 bg-emerald-100 text-emerald-800 font-mono text-xs font-bold flex items-center justify-center rounded-full shrink-0">1</span>
                <p className="text-[11px] text-slate-600 leading-normal">
                  Pilih Kecamatan, masukkan nama operator dan data Alsintan yang Anda kelola hari ini.
                </p>
              </div>

              <div className="flex gap-3">
                <span className="w-5 h-5 bg-emerald-100 text-emerald-800 font-mono text-xs font-bold flex items-center justify-center rounded-full shrink-0">2</span>
                <p className="text-[11px] text-slate-600 leading-normal">
                  Tuliskan jumlah luasan bajak tanah dalam hektar dan bensin bbm murni terpakai.
                </p>
              </div>

              <div className="flex gap-3">
                <span className="w-5 h-5 bg-emerald-100 text-emerald-800 font-mono text-xs font-bold flex items-center justify-center rounded-full shrink-0">3</span>
                <p className="text-[11px] text-slate-600 leading-normal">
                  Tekan submit di dalam formulir. Hasil akan langsung masuk ke database Google Sheet.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4.5 space-y-2">
            <h4 className="text-[11px] font-bold text-emerald-800 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-emerald-700" />
              Rekomendasi Hemat
            </h4>
            <p className="text-[11px] text-emerald-900 leading-relaxed font-semibold">
              Gunakan mode potret smartphone Anda untuk membuka tautan Google Form jika tampilan di layar laptop/komputer terlalu rapat.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 space-y-2 text-[11px] text-amber-800">
            <h4 className="font-bold flex items-center gap-1">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Keamanan Iframe
            </h4>
            <p className="leading-relaxed font-medium">
              Jika kotak formulir di kanan tampak kosong, ini terjadi karena kebijakan restriksi keamanan (CORS/X-Frame-Options) Google. Silakan klik tombol <strong>"Buka Form"</strong> di bagian atas.
            </p>
          </div>
        </div>

        {/* Live dynamic Google Form Web interface or status placeholder */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col min-h-[580px]" id="iframe-cabinet">
          
          <div className="p-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center px-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <MonitorDot className="w-3.5 h-3.5 text-slate-400" />
              Antarmuka Google Apps Script Embed
            </span>
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-mono bg-emerald-100/50 px-2 py-0.5 rounded border border-emerald-100">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Live Frame Connection
            </div>
          </div>

          <div className="flex-1 relative bg-slate-100">
            {!iframeLoaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-white">
                <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase">Menghubungkan ke Server Google...</h4>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-0.5">
                    Memuat antarmuka pelaporan luar jaringan dinas. Harap pastikan koneksi internet stabil.
                  </p>
                </div>
              </div>
            )}

            <iframe 
              src={macroUrl}
              className="w-full h-full min-h-[550px] border-none bg-white"
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
