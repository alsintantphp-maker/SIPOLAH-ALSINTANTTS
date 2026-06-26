import React from "react";
import { ExternalLink, FileText } from "lucide-react";

export default function GoogleFormIframe() {
  const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfCteT8svz_h7eGPUEfl6BE7XH8-uCmgz81voxXGbRG6hPIUQ/viewform?usp=dialog";

  return (
    <div className="w-full flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-slate-200" id="google-form-embed-view">
      <div className="bg-emerald-100 p-4 rounded-full mb-6">
        <FileText className="w-12 h-12 text-emerald-700" />
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">Lapor Olah Lahan</h2>
      <p className="text-sm text-slate-500 mb-8 max-w-md text-center">
        Silakan klik tombol di bawah ini untuk mengisi formulir laporan olah lahan secara langsung melalui Google Forms.
      </p>
      <a 
        href={formUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition flex items-center gap-2 shadow-md cursor-pointer"
      >
        <ExternalLink className="w-5 h-5" />
        Buka Google Form
      </a>
    </div>
  );
}

