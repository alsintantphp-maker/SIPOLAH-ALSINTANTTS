import React, { useState, useEffect } from "react";
import { ExternalLink, FileSpreadsheet, Upload, CheckCircle2, FileText, AlertCircle, RefreshCw } from "lucide-react";
import { AlsintanReportRow } from "../types";

interface Props {
  reports: AlsintanReportRow[];
}

export default function DokumenPendukungForm({ reports }: Props) {
  const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSehb55CDTZ_Lyim4HmtNLIsgouPvD8tI1OEzZthkARzJvOPhw/viewform?usp=dialog";
  
  const totalLaporan = reports.length;
  
  const [totalBuktiDukung, setTotalBuktiDukung] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchBuktiDukungCount = async () => {
      try {
        setIsLoading(true);
        setErrorMsg(null);
        // Using Google Visualization API to fetch CSV format of the sheet
        const response = await fetch("https://docs.google.com/spreadsheets/d/1BP6SwS3EEhmqOWIlhhXWrScH24mIhf1UuNR0pvfQIJM/gviz/tq?tqx=out:csv&gid=1881961917");
        if (!response.ok) {
          throw new Error("Gagal mengambil data Spreadsheet");
        }
        
        const csvText = await response.text();
        // Simple CSV parser: split by newlines, minus 1 for header row
        const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== "");
        
        if (isMounted) {
          // If there's a header row, we subtract 1. If it's totally empty, count is 0.
          const count = lines.length > 1 ? lines.length - 1 : 0;
          setTotalBuktiDukung(count);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error fetching bukti dukung:", err);
        if (isMounted) {
          setErrorMsg("Gagal memuat jumlah data");
          setIsLoading(false);
          
          // Fallback to local reports
          const fallbackCount = reports.filter(r => 
            (r.dokumenPendukung && r.dokumenPendukung.trim() !== '') || 
            (r.dokumentasiKegiatan && r.dokumentasiKegiatan.trim() !== '')
          ).length;
          setTotalBuktiDukung(fallbackCount);
        }
      }
    };
    
    fetchBuktiDukungCount();
    
    return () => {
      isMounted = false;
    };
  }, [reports]);

  const percentage = totalLaporan > 0 ? Math.round((totalBuktiDukung / totalLaporan) * 100) : 0;
  
  return (
    <div className="w-full flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-sm border border-slate-200" id="dokumen-pendukung-embed-view">
      <div className="bg-emerald-100 p-4 rounded-full mb-6">
        <Upload className="w-12 h-12 text-emerald-700" />
      </div>
      
      <h2 className="text-xl font-bold text-slate-800 mb-2">Upload Bukti Dukung</h2>
      <p className="text-sm text-slate-500 mb-8 max-w-md text-center">
        Silakan klik tombol di bawah ini untuk mengunggah bukti dukung dan melihat daftar dokumen yang telah diunggah.
      </p>

      {/* Statistik Box */}
      <div className="flex flex-col sm:flex-row gap-6 mb-10 w-full max-w-2xl px-6 justify-center">
        <div className="flex-1 bg-slate-50 border border-slate-200 p-5 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-slate-100">
            <FileText className="w-20 h-20" />
          </div>
          <span className="text-sm font-semibold text-slate-500 mb-1 z-10">Total Olah Lahan</span>
          <span className="text-4xl font-black text-slate-800 z-10">{totalLaporan}</span>
        </div>
        
        <div className="flex-1 bg-emerald-50 border border-emerald-100 p-5 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-emerald-100">
            <CheckCircle2 className="w-20 h-20" />
          </div>
          <span className="text-sm font-semibold text-emerald-700 mb-1 z-10">Bukti Dukung Terupload</span>
          <div className="text-4xl font-black text-emerald-600 z-10 flex items-center justify-center gap-2">
            {isLoading ? (
              <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
            ) : (
              <span>{totalBuktiDukung}</span>
            )}
          </div>
          {errorMsg && (
            <span className="text-[10px] text-amber-600 z-10 mt-1 absolute bottom-2">{errorMsg}</span>
          )}
        </div>
      </div>
      
      <div className="w-full max-w-2xl px-6 mb-10">
        <div className="flex justify-between text-xs font-bold mb-2">
          <span className="text-slate-500">Progres Kelengkapan</span>
          <span className={percentage >= 100 ? "text-emerald-600" : "text-amber-500"}>{Math.min(percentage, 100)}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
          <div 
            className={`h-3 rounded-full transition-all duration-1000 ${percentage >= 100 ? 'bg-emerald-500' : 'bg-amber-400'}`} 
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
        {percentage < 100 && totalLaporan > 0 && (
          <p className="text-xs text-amber-600 mt-3 flex items-center gap-1.5 font-medium justify-center">
            <AlertCircle className="w-3.5 h-3.5" />
            Terdapat {totalLaporan > totalBuktiDukung ? totalLaporan - totalBuktiDukung : 0} laporan yang belum memiliki bukti dukung.
          </p>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <a 
          href={formUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-md cursor-pointer w-full sm:w-auto justify-center"
        >
          <ExternalLink className="w-5 h-5" />
          Upload Bukti Dukung (Form)
        </a>
      </div>
    </div>
  );
}
