import React, { useState } from "react";
import { AiOptimizationResult, AlsintanReportRow } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { 
  Cpu, Sparkles, Brain, AlertOctagon, TrendingUp, Compass, Leaf, ArrowRight,
  ShieldCheck, Loader2, Play, Flame, HelpCircle
} from "lucide-react";

interface AiAdviserProps {
  reports: AlsintanReportRow[];
  onOptimize: () => Promise<void>;
  aiResult: AiOptimizationResult | null;
  isLoading: boolean;
  errorMsg: string | null;
}

export default function AiAdviser({ reports, onOptimize, aiResult, isLoading, errorMsg }: AiAdviserProps) {
  const [activeTab, setActiveTab] = useState<"efficiency" | "allocation" | "crop">("efficiency");

  // Circular gauge config
  const score = aiResult?.overallScore || 0;
  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = (val: number) => {
    if (val >= 80) return "text-emerald-500 stroke-emerald-500";
    if (val >= 60) return "text-amber-500 stroke-amber-500";
    return "text-rose-500 stroke-rose-400";
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case "tinggi":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "sedang":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden" id="ai-advisor-panel">
      
      {/* Panel Banner Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 text-white p-1 rounded-lg">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold font-mono">Modul Penasihat AI Terintegrasi</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold tracking-tight">Rekomendasi & Analisis Optimasi Alsintan (Gemini AI)</h2>
          <p className="text-xs text-emerald-200 max-w-2xl">
            Sistem pengolahan data otomatis untuk mendeteksi anomali bahan bakar, mengoptimalkan distribusi regional Alsintan, dan menakar efisiensi sistem pelaporan Google Sheet Dinas di Timor Tengah Selatan.
          </p>
        </div>

        <button
          onClick={onOptimize}
          disabled={isLoading}
          className={`cursor-pointer px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-lg ${
            isLoading
              ? "bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700"
              : "bg-emerald-500 hover:bg-emerald-400 text-emerald-950 active:scale-95 border border-emerald-400"
          }`}
          id="btn-trigger-ai"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              Memproses Data Lahan...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Mulai Analisis Optimalisasi
            </>
          )}
        </button>
      </div>

      {/* Main Body */}
      <div className="p-6">
        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2.5">
            <AlertOctagon className="w-5 h-5 text-rose-500 shrink-0" />
            <div>
              <span className="font-bold">Gagal Menghubungkan Analitik AI:</span> {errorMsg}
              <p className="mt-1 text-[11px] text-rose-600">
                Peringatan ini muncul jika kunci API Gemini tidak valid atau kehabisan kuota kerja. Aplikasi akan menyimulasikan rekomendasi dinas yang komprehensif.
              </p>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {isLoading ? (
            /* Loading State Screen */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="py-12 flex flex-col items-center justify-center text-center max-w-md mx-auto"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-emerald-600 animate-spin"></div>
                <Brain className="w-6 h-6 text-emerald-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mt-4 uppercase tracking-wider">Menghitung Efisiensi Lahan & BBM</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Mengambil baris Google Sheet, menghitung rasio bensin per hektar, memetakan komoditas kering TTS, dan menyusun solusi mobilisasi mesin...
              </p>
            </motion.div>
          ) : aiResult ? (
            /* AI Results Visualizers */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              
              {/* Score Gauge Widget Frame */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col items-center text-center justify-between" id="ai-score-card">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Indeks Optimasi Sistem</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Penilaian efisiensi operasional terintegrasi</p>
                </div>

                <div className="relative my-4 flex items-center justify-center">
                  <svg className="w-36 h-36 transform -rotate-90">
                    <circle
                      cx="72"
                      cy="72"
                      r={radius}
                      className="stroke-slate-200 fill-none"
                      strokeWidth={strokeWidth}
                    />
                    <circle
                      cx="72"
                      cy="72"
                      r={radius}
                      className={`fill-none transition-all duration-1000 ${getScoreColor(score)}`}
                      strokeWidth={strokeWidth}
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-slate-800">{score}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Skor Indeks</span>
                  </div>
                </div>

                <div className="space-y-2 w-full">
                  <div className="bg-white border border-slate-200 p-3 rounded-xl text-left">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-800 mb-1">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Diagnostik Sistem:
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                      {aiResult.scoreReason}
                    </p>
                  </div>
                </div>
              </div>

              {/* Dynamic Analysis Tabs and Cards */}
              <div className="lg:col-span-2 flex flex-col" id="ai-tabs-container">
                
                {/* Tabs Selector Bar */}
                <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 rounded-xl gap-1">
                  <button
                    onClick={() => setActiveTab("efficiency")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${
                      activeTab === "efficiency"
                        ? "bg-white text-emerald-800 shadow-sm border border-slate-200/55"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    Audit Bahan Bakar
                  </button>
                  <button
                    onClick={() => setActiveTab("allocation")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${
                      activeTab === "allocation"
                        ? "bg-white text-emerald-800 shadow-sm border border-slate-200/55"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    Redistribusi Unit
                  </button>
                  <button
                    onClick={() => setActiveTab("crop")}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition ${
                      activeTab === "crop"
                        ? "bg-white text-emerald-800 shadow-sm border border-slate-200/55"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Leaf className="w-3.5 h-3.5" />
                    Ketahanan Musim
                  </button>
                </div>

                {/* Tabs Panel Frame */}
                <div className="flex-1 mt-4">
                  {activeTab === "efficiency" && (
                    <div className="space-y-3.5">
                      {aiResult.efficiencyAnalysis?.map((eff) => (
                        <div key={eff.id} className="border border-slate-200 rounded-xl p-3.5 space-y-2 hover:border-slate-300 transition bg-slate-50/20">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-bold text-slate-800">{eff.alsintan}</span>
                            <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getSeverityColor(eff.severity)}`}>
                              Isu {eff.severity}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                            <strong className="text-rose-600 font-bold">Kondisi:</strong> {eff.issue}
                          </p>
                          <p className="text-xs text-slate-500 font-medium">
                            <strong className="text-slate-700 font-bold">Kerugian Riil:</strong> {eff.impact}
                          </p>
                          <div className="pt-2 border-t border-slate-100 flex items-start gap-1.5 text-xs text-emerald-800 bg-emerald-50/40 p-2 rounded-lg">
                            <Compass className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                            <p className="leading-relaxed">
                              <strong>Saran Solutif:</strong> {eff.recommendation}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "allocation" && (
                    <div className="space-y-3.5">
                      {aiResult.allocationRecommendations?.map((alloc) => (
                        <div key={alloc.id} className="border border-slate-200 rounded-xl p-3.5 space-y-2 bg-slate-50/20">
                          <div className="flex justify-between items-start">
                            <span className="text-xs font-extrabold text-emerald-800">Kecamatan {alloc.kecamatan}</span>
                            <span className="text-[10px] text-slate-400 font-mono">Disposisi Alat</span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                            <strong>Kebutuhan Unit:</strong> <span className="bg-emerald-100 text-emerald-900 px-1.5 py-0.2 rounded font-bold">{alloc.alsintanNeeded}</span>
                          </p>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            <strong>Analisis Dasar:</strong> {alloc.reason}
                          </p>
                          <div className="pt-2 border-t border-slate-100 flex items-center gap-1 text-xs text-slate-800">
                            <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                            <p>
                              <strong>Rekomendasi Mobilisasi:</strong> {alloc.action}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "crop" && aiResult.cropStrategy && (
                    <div className="border border-slate-200 rounded-xl p-5 bg-emerald-50/20 space-y-4">
                      <div className="flex justify-between items-center pb-2.5 border-b border-emerald-100">
                        <span className="text-xs font-extrabold text-slate-700">Tinjauan Agronomi TTS</span>
                        <span className="text-[10px] bg-emerald-100 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                          {aiResult.cropStrategy.season}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Komoditas Lahan Kering Rekomendasi Dinas</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {aiResult.cropStrategy.recommendedCrops?.map((crop) => (
                            <span key={crop} className="bg-white border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1 text-xs font-semibold shadow-xs">
                              ☘️ {crop}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Strategi Manajemen Air Terbatas</span>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          {aiResult.cropStrategy.waterStrategy}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-emerald-100 text-xs text-emerald-900 font-semibold italic leading-relaxed">
                        &ldquo; {aiResult.cropStrategy.summaryText} &rdquo;
                      </div>
                    </div>
                  )}
                </div>

              </div>
              
            </motion.div>
          ) : (
            /* Welcome Widget Screen (Before click) */
            <div className="py-12 text-center max-w-lg mx-auto flex flex-col items-center">
              <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl mb-4 border border-slate-100">
                <HelpCircle className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Perhitungan Rekomendasi Belum Dimulai</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Klik tombol di kanan atas untuk memproses data peloporan hasil olah lahan. Sistem akan menganalisis tren optimasi dan memberikan masukan logistik secara langsung.
              </p>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
