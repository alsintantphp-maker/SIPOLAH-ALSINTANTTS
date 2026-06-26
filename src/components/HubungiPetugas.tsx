import React, { useState } from "react";
import { 
  Phone, MessageSquare, Mail, Map, Clock, ShieldAlert, 
  UserCheck, Send, PhoneCall, HelpCircle, BookOpen, AlertCircle, Sparkles 
} from "lucide-react";

export default function HubungiPetugas() {
  const [nama, setNama] = useState("");
  const [kecamatan, setKecamatan] = useState("Amanuban Selatan");
  const [topik, setTopik] = useState("Kerusakan Mesin Alsintan");
  const [pesan, setPesan] = useState("");
  const [petugasId, setPetugasId] = useState(0);

  // Real Field Coordinators (Penyuluh / Petugas Lapangan)
  const coordinators = [
    { jabatan: "Petugas Lapangan", nama: "Bahrun Key Alfazahri, ST", phone: "082145935384", status: "Aktif" },
    { jabatan: "Petugas Lapangan", nama: "Yarit H Punuf, S.Tr", phone: "082145406246", status: "Aktif" },
    { jabatan: "Petugas Lapangan", nama: "Yufen Takesan, S.TP", phone: "082147237040", status: "Aktif" }
  ];

  const categories = [
    "Kerusakan Mesin Alsintan",
    "Permohonan Kuota Solar Subsidi",
    "Pendaftaran Kelompok Tani Baru",
    "Kesulitan Sinyal Sinkronisasi GPS",
    "Pertanyaan Strategi Tanam Kering"
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !pesan.trim()) {
      alert("Nama dan isi pesan wajib diisi.");
      return;
    }
    
    const targetPetugas = coordinators[petugasId];
    if (targetPetugas) {
      const phoneNumber = targetPetugas.phone.replace(/[^0-9]/g, "");
      const waMessage = `Halo Bapak/Ibu ${targetPetugas.nama},\n\nSaya ${nama} dari Kecamatan ${kecamatan}.\n\n*Topik Pengaduan:* ${topik}\n\n*Pesan:*\n${pesan}`;
      const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(waMessage)}`;
      window.open(waUrl, "_blank");
    }
    
    setNama("");
    setPesan("");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in" id="contact-officer-interface">
      
      {/* Visual Header */}
      <div className="bg-gradient-to-r from-teal-900 to-emerald-950 text-white rounded-2xl p-6 border border-teal-950 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-teal-400 bg-teal-950/80 border border-teal-900 px-2 py-0.5 rounded-full tracking-wider inline-block">
            Pusat Bantuan & Layanan Penyuluhan TTS
          </span>
          <h2 className="text-base font-extrabold text-white">Hubungi Petugas Dinas / Koordinator Lapangan</h2>
          <p className="text-xs text-teal-100 max-w-2xl leading-relaxed">
            Menghubungkan Anda langsung dengan Koordinator Penyuluh Pertanian Lapangan (PPL) dan Tim Pengawasan Alsintan Dinas Kabupaten Timor Tengah Selatan untuk resolusi cepat perbaikan traktor, bantuan solar, atau kendala irigasi darurat.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Contact list of sub-district field coordinators */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest pb-2 border-b border-slate-100 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-700" />
              Direktori Koordinator Alsintan
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {coordinators.map((coord, idx) => (
                <div 
                  key={idx} 
                  className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200/60 rounded-xl p-3.5 space-y-2.5 transition flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{coord.jabatan}</span>
                      <h4 className="text-xs font-extrabold text-slate-800">{coord.nama}</h4>
                    </div>
                    <span className="text-[9px] bg-emerald-100 border border-emerald-200 text-emerald-800 font-mono px-2 py-0.5 rounded-full font-bold">
                      {coord.status}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between gap-1.5 text-xs">
                    <span className="text-slate-500 flex items-center gap-1 font-mono">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      {coord.phone}
                    </span>
                    <a 
                      href={`https://wa.me/${coord.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Office profile */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <Map className="w-5 h-5 text-emerald-700" />
              Alamat Kantor Dinas Kabupaten Timor Tengah Selatan
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
              <strong>Gedung Dinas Pertanian & Tanaman Pangan:</strong> Jl. Raya Basuki Rahmat, Kota Soe, Kabupaten Timor Tengah Selatan, Nusa Tenggara Timur (81211).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-500 pt-1">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <strong className="block text-slate-700">Jam Operasional Layanan:</strong>
                  <span>Senin - Jumat | 08:00 WITA - 16:30 WITA</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <strong className="block text-slate-700">Surel Layanan Pengaduan:</strong>
                  <span className="font-semibold">ppl.alsintan.tts@gmail.com</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Dispatch Form Box */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between" id="feedback-form-box">
            
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <MessageSquare className="w-5 h-5 text-emerald-700" />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Kirim Surat Pengaduan Sinyal / Rusak</h3>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Tujuan Petugas Laporan *</label>
                <select 
                  value={petugasId}
                  onChange={(e) => setPetugasId(Number(e.target.value))}
                  className="bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs w-full focus:outline-none focus:border-emerald-600"
                >
                  {coordinators.map((coord, idx) => (
                    <option key={idx} value={idx}>{coord.nama} - {coord.phone}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Nama Pelapor / Pengadu *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Masukkan nama lengkap"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs w-full focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Kecamatan Domisili Lahan</label>
                <select 
                  value={kecamatan}
                  onChange={(e) => setKecamatan(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs w-full focus:outline-none focus:border-emerald-600"
                >
                  <option value="Amanuban Selatan">Amanuban Selatan</option>
                  <option value="Mollo Utara">Mollo Utara</option>
                  <option value="Amanuban Barat">Amanuban Barat</option>
                  <option value="Mollo Selatan">Mollo Selatan</option>
                  <option value="Batu Putih">Batu Putih</option>
                  <option value="Kota Soe">Kota Soe (Kecamatan Kota)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Topik Laporan Permasalahan</label>
                <select 
                  value={topik}
                  onChange={(e) => setTopik(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-xs w-full focus:outline-none focus:border-emerald-600"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Isi Pengaduan / Deskripsi Insiden Lapangan *</label>
                <textarea 
                  rows={3} 
                  required 
                  value={pesan}
                  onChange={(e) => setPesan(e.target.value)}
                  placeholder="Ceritakan dengan lengkap nomor seri mesin, nama desa, kronologi kerusakan radiator atau kendala subsidi kuota bbm..."
                  className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs w-full focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-700"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Send className="w-3.5 h-3.5" />
                Kirim via WhatsApp
              </button>
            </form>

          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4.5 space-y-2 text-amber-800" id="advisory-alert-field">
            <h4 className="text-[11px] font-bold flex items-center gap-1">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Siaga Kekeringan & Kebakaran Lahan
            </h4>
            <p className="text-[11px] leading-relaxed font-semibold">
              Kementerian Pertanian memperkirakan perpanjangan el-nino kering di kawasan NTT termasuk Timor Tengah Selatan s.d akhir musim. Gunakan mesin pompa air cadangan secara adil bergantian antar kelompok tani desa.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
