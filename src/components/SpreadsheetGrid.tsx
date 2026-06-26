import React from "react";
import { ExternalLink, FileSpreadsheet } from "lucide-react";

export default function SpreadsheetGrid() {
  const sheetUrl = "https://docs.google.com/spreadsheets/d/15uUmtI5CDwUw6FpvPyshOR2v9zoDXDxp-3a_D5al7C4/edit?resourcekey=&gid=1391367572#gid=1391367572";
  const embedUrl = "https://docs.google.com/spreadsheets/d/15uUmtI5CDwUw6FpvPyshOR2v9zoDXDxp-3a_D5al7C4/htmlembed?gid=1391367572&widget=true&headers=false";

  return (
    <div className="w-full flex flex-col items-center justify-center py-10 bg-white rounded-2xl shadow-sm border border-slate-200" id="spreadsheet-embed-view">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full px-8 pb-4 border-b border-slate-100 mb-6 gap-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
          Rekap Laporan Olah Lahan
        </h2>
        <a 
          href={sheetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-md cursor-pointer"
        >
          <ExternalLink className="w-4 h-4" />
          Buka di Google Sheets
        </a>
      </div>
      
      <div className="w-full h-[600px] px-6 pb-6">
        <iframe 
          src={embedUrl}
          className="w-full h-full border border-slate-200 rounded-xl"
          title="Google Sheet Rekap Laporan"
        />
      </div>
    </div>
  );
}
