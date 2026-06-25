import React, { useState } from "react";
import { Database, FileSpreadsheet, RefreshCw, Layers, CheckCircle, AlertTriangle, ShieldCheck, User } from "lucide-react";

interface HeaderProps {
  onSyncAll: () => void;
  isSyncing: boolean;
  lastSyncedTime: string;
  totalPendingCount: number;
  sheetId: string;
  onSheetIdChange: (newId: string) => void;
  userEmail: string;
  onUserEmailChange: (email: string) => void;
}

export default function Header({ 
  onSyncAll, 
  isSyncing, 
  lastSyncedTime, 
  totalPendingCount,
  sheetId,
  onSheetIdChange,
  userEmail,
  onUserEmailChange
}: HeaderProps) {
  const [isEditingId, setIsEditingId] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [userList, setUserList] = useState<string[]>(() => {
    const list = localStorage.getItem("tts_alsintan_users");
    return list ? JSON.parse(list) : ["BahrunAlfazari@gmail.com", "operator_kapan@gmail.com"];
  });

  const handleAddNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUserEmail && newUserEmail.includes("@")) {
      const updatedList = Array.from(new Set([...userList, newUserEmail]));
      setUserList(updatedList);
      localStorage.setItem("tts_alsintan_users", JSON.stringify(updatedList));
      onUserEmailChange(newUserEmail);
      setNewUserEmail("");
      setIsAddingUser(false);
      alert(`User ${newUserEmail} berhasil ditambahkan secara otomatis dan diaktifkan.`);
    } else {
      alert("Masukkan alamat email yang valid!");
    }
  };

  const isAuthorized = userEmail.trim().toLowerCase() === "bahrunalfazari@gmail.com";

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm" id="dashboard-header">
      {/* Top Banner (Government agricultural branding) */}
      <div className="bg-emerald-950 text-emerald-100 px-6 py-2 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs border-b border-emerald-950 gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold tracking-wider uppercase">Portal Resmi Alsintan</span>
          <span className="text-emerald-400">|</span>
          <span>Dinas Tanaman Pangan, Hortikultura dan Perkebunan Kabupaten Timor Tengah Selatan (TTS)</span>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-emerald-900 px-2 py-1 rounded border border-emerald-800">
            <User className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-emerald-300">Staf Aktif:</span>
            {isAddingUser ? (
              <form onSubmit={handleAddNewUser} className="inline-flex items-center gap-1">
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="email@baru.com"
                  className="bg-white text-slate-800 text-[10px] px-1 py-0.2 rounded focus:outline-none w-32 border-none"
                  autoFocus
                  required
                />
                <button type="submit" className="text-emerald-300 font-bold bg-emerald-800 hover:bg-emerald-700 px-1 rounded">Ok</button>
                <button type="button" onClick={() => setIsAddingUser(false)} className="text-rose-300 hover:text-rose-100">Batal</button>
              </form>
            ) : (
              <select
                value={userEmail}
                onChange={(e) => {
                  if (e.target.value === "ADD_NEW") {
                    setIsAddingUser(true);
                  } else {
                    onUserEmailChange(e.target.value);
                  }
                }}
                className="bg-[#022c22] text-white text-xs font-semibold focus:outline-none border-none py-0.2 px-1 rounded cursor-pointer"
              >
                {userList.map(u => (
                  <option key={u} value={u} className="bg-emerald-950 text-white">
                    {u} {u.toLowerCase() === "bahrunalfazari@gmail.com" ? "(Admin Utama)" : ""}
                  </option>
                ))}
                <option value="ADD_NEW" className="bg-slate-800 text-yellow-300">
                  + Tambah User Otomatis...
                </option>
              </select>
            )}
          </div>

          <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0 ${
            isAuthorized 
              ? "bg-emerald-500/25 text-emerald-400 border border-emerald-500/40"
              : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
          }`} title={isAuthorized ? "Hak Akses Penuh" : "Akses Terbatas"}>
            {isAuthorized ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Autentikasi Penuh</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
                <span>Hanya Lihat</span>
              </>
            )}
          </div>

          <span className="text-emerald-700">/</span>
          <span>Wilayah Kerja: <strong className="text-white">Nusa Tenggara Timur (NTT)</strong></span>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Title and agency emblem mockup */}
        <div className="flex items-start gap-3">
          <div className="bg-emerald-100 text-emerald-800 p-2.5 rounded-xl border border-emerald-200 shadow-inner flex items-center justify-center">
            <Layers className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              SIPOLAH-ALSINTAN <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">V2.1 - OPTIMIZED</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Sistem Pelaporan Hasil Olah Lahan Alsintan Berbasis Google Sheet Kabupaten TTS
            </p>
          </div>
        </div>

        {/* Google Sheet Sync Panel */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center gap-3 pr-3 border-r border-slate-200">
            <div className="bg-green-100 text-green-700 p-2 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Google Sheet Aktif</span>
                {totalPendingCount > 0 && (
                  <span className="text-[9px] bg-amber-100 border border-amber-200 text-amber-800 px-1 py-0.2 rounded font-bold animate-pulse flex items-center gap-0.5">
                    <AlertTriangle className="w-2.5 h-2.5" /> {totalPendingCount} Baru
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs">
                {isEditingId ? (
                  <input
                    type="text"
                    value={sheetId}
                    onChange={(e) => onSheetIdChange(e.target.value)}
                    onBlur={() => setIsEditingId(false)}
                    onKeyDown={(e) => e.key === "Enter" && setIsEditingId(false)}
                    className="border border-slate-300 rounded px-1.5 py-0.1 bg-white text-slate-800 font-mono text-[11px] focus:outline-none focus:border-emerald-500"
                    autoFocus
                  />
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span
                      onClick={() => setIsEditingId(true)}
                      className="font-mono text-slate-700 font-semibold cursor-pointer underline decoration-dotted hover:text-emerald-700 transition max-w-[120px] truncate"
                      title="Klik untuk mengubah URL/ID Google Sheet"
                    >
                      {sheetId}
                    </span>
                    <a
                      href={`https://docs.google.com/spreadsheets/d/${sheetId}/edit?usp=sharing`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-bold hover:bg-emerald-100 transition shrink-0"
                      title="Klik untuk membuka Spreadsheet asli di Tab Baru"
                    >
                      Buka Sheet ↗
                    </a>
                  </div>
                )}
                <span className="text-[10px] text-slate-400">(ID Sheet)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col text-[11px]">
            <span className="text-slate-400">Status Sinkronisasi:</span>
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
              Terhubung & Aman
            </span>
            <span className="text-[10px] text-slate-400">Terakhir: {lastSyncedTime}</span>
          </div>

          <button
            onClick={onSyncAll}
            disabled={isSyncing}
            className={`cursor-pointer px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm ${
              isSyncing
                ? "bg-emerald-100 text-emerald-800 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95"
            }`}
            id="btn-sync-sheet"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Menyinkronkan..." : "Sinkronkan Sekarang"}
          </button>
        </div>
      </div>
    </header>
  );
}
