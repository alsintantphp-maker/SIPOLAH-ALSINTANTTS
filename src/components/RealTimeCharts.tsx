import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { AlsintanReportRow } from "../types";
import { UserCheck, Tractor, DollarSign, Wallet, ClipboardCheck, ArrowUpRight } from "lucide-react";

interface RealTimeChartsProps {
  reports: AlsintanReportRow[];
}

// Regional official tariffs for rental/operating services in Timor Tengah Selatan (TTS)
export const getAlsintanTariff = (name: string): number => {
  const norm = name.toLowerCase();
  if (norm.includes("roda 4") || norm.includes("john deere")) return 1500000; // Rp 15.000 / Are = Rp 1.500.000 / Ha
  if (norm.includes("roda 2") || norm.includes("yanmar")) return 250000;    // Rp 250.000 / Ha
  if (norm.includes("pompa")) return 150000;                                 // Rp 150.000 / Ha
  if (norm.includes("cultivator")) return 180000;                            // Rp 180.000 / Ha
  if (norm.includes("harvester") || norm.includes("combine")) return 300000; // Rp 300.000 / Ha
  if (norm.includes("ekskavator") || norm.includes("excavator")) return 2000000; // Rp 2.000.000 / Hari
  return 200000; // Default standard rate
};

export const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export default function RealTimeCharts({ reports }: RealTimeChartsProps) {
  // 1. Process data for: HASIL OLAH LAHAN PER PETUGAS (KUANTITAS)
  // We sum the Hectares (luasLahan) and count reports for each Operator
  const operatorMap: Record<string, { hectares: number; count: number }> = {};
  
  reports.forEach((row) => {
    const name = row.operator || "Operator Tidak Dikenal";
    if (!operatorMap[name]) {
      operatorMap[name] = { hectares: 0, count: 0 };
    }
    operatorMap[name].hectares += (row.luasLahan || 0);
    operatorMap[name].count += 1;
  });

  const operatorChartData = Object.entries(operatorMap).map(([name, data]) => ({
    name,
    hectares: parseFloat(data.hectares.toFixed(1)),
    laporanCount: data.count,
  })).sort((a, b) => b.hectares - a.hectares);

  // 2. Process data for: PER ALSINTAN SUDAH BERAPA HEKTAR
  const alsintanHectaresMap: Record<string, number> = {};
  reports.forEach((row) => {
    const key = row.alsintan || "Alsintan Umum";
    alsintanHectaresMap[key] = (alsintanHectaresMap[key] || 0) + (row.luasLahan || 0);
  });

  const alsintanHectaresData = Object.entries(alsintanHectaresMap).map(([name, value]) => ({
    name,
    hectares: parseFloat(value.toFixed(1)),
  })).sort((a, b) => b.hectares - a.hectares);

  // 3. Process data for: RUPIAH TERCAPAI DARI MASING-MASING OPERATOR
  const operatorRupiahMap: Record<string, { rupiah: number; hectares: number }> = {};
  reports.forEach((row) => {
    const operator = row.operator || "Operator Tidak Dikenal";
    const alsintan = row.alsintan || "Alsintan Umum";
    let rev = 0;
    
    // Check if the Google Sheet provided a predefined rental cost "biayaSewa"
    if (row.biayaSewa !== undefined && !isNaN(row.biayaSewa) && row.biayaSewa > 0) {
      rev = row.biayaSewa;
    } else {
      const tariff = getAlsintanTariff(alsintan);
      if (alsintan.toLowerCase().includes("ekskavator") || alsintan.toLowerCase().includes("excavator")) {
        // Based on durasiKerja (Hari)
        const hari = row.durasiKerja || 1; 
        rev = hari * tariff;
      } else {
        // Based on luasLahan (Ha)
        rev = (row.luasLahan || 0) * tariff;
      }
    }
    
    if (!operatorRupiahMap[operator]) {
      operatorRupiahMap[operator] = { rupiah: 0, hectares: 0 };
    }
    operatorRupiahMap[operator].rupiah += rev;
    operatorRupiahMap[operator].hectares += (row.luasLahan || 0);
  });

  const operatorRupiahData = Object.entries(operatorRupiahMap).map(([name, stats]) => ({
    name,
    rupiah: stats.rupiah,
    hectares: parseFloat(stats.hectares.toFixed(1)),
  })).sort((a, b) => b.rupiah - a.rupiah);

  // Color palette for professional green/emerald theme compatible with Timor Tengah Selatan
  const greenPalette = ["#059669", "#10b981", "#34d399", "#047857", "#6ee7b7", "#85e3b2"];

  return (
    <div className="space-y-8" id="dashboard-pure-analytics">
      
      {/* SECTION 1: HASIL OLAH LAHAN PER PETUGAS (KUANTITAS) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs" id="petugas-analytics">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                <UserCheck className="w-5 h-5" />
              </span>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                Hasil Olah Lahan per Petugas / Operator (Kuantitas)
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Total capaian pengerjaan olah lahan pertanian didistribusikan per operator per musim tanam
            </p>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
            Total Operator: {operatorChartData.length} Orang
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Visual bar chart for Operators */}
          <div className="lg:col-span-2 h-[300px]">
            {operatorChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={operatorChartData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#334155", fontWeight: 600 }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", borderRadius: "10px", border: "none", color: "#fff" }}
                    labelStyle={{ fontWeight: "bold", fontSize: 11 }}
                    itemStyle={{ color: "#a7f3d0", fontSize: 11 }}
                    formatter={(value) => [`${value} Ha`, "Jumlah Garapan (Ha)"]}
                  />
                  <Bar dataKey="hectares" radius={[0, 4, 4, 0]}>
                    {operatorChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={greenPalette[index % greenPalette.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">
                Belum ada data perekaman operator.
              </div>
            )}
          </div>

          {/* Side summary list for detailed quantities */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-4">
              Peringkat Produktivitas Kerja
            </span>
            <div className="flex-1 overflow-y-auto space-y-3 max-h-[220px] pr-1.5 scrollbar-thin">
              {operatorChartData.map((operator, index) => (
                <div key={operator.name} className="flex justify-between items-center text-xs pb-2 border-b border-slate-200/50">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 block">
                      {index + 1}. {operator.name}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {operator.laporanCount} kali pelaporan lahan
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded text-[11px]">
                      {operator.hectares} Ha
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2 & 3: GRID LAYOUT FOR MACHINERY METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="machinery-analytics-layout">
        
        {/* SECTION 2: PER ALSINTAN SUDAH BERAPA HEKTAR */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between min-h-[400px]" id="hectare-per-alsintan">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                <Tractor className="w-5 h-5" />
              </span>
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-tight">
                  Per Alsintan Sudah Berapa Hektar
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">Akumulasi luasan tanah garapan dalam satuan Hektar (Ha)</p>
              </div>
            </div>

            <div className="space-y-4">
              {alsintanHectaresData.length > 0 ? (
                alsintanHectaresData.map((item, idx) => {
                  const maxHectares = Math.max(...alsintanHectaresData.map(d => d.hectares), 1);
                  const progressWidth = (item.hectares / maxHectares) * 100;
                  return (
                    <div key={item.name} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                        <span className="truncate max-w-[70%]">{item.name}</span>
                        <span className="font-mono font-bold text-slate-800">{item.hectares} Ha</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${progressWidth}%`,
                            backgroundColor: greenPalette[idx % greenPalette.length]
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-xs text-slate-400 font-medium">
                  Belum ada laporan data Alsintan.
                </div>
              )}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-3 mt-4 text-center">
            Pembaruan periodik langsung dari laporan database Google Sheet Dinas TTS
          </div>
        </div>

        {/* SECTION 3: RUPIAH TERCAPAI DARI MASING-MASING PETUGAS/OPERATOR */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between min-h-[400px]" id="rupiah-per-operator">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                <Wallet className="w-5 h-5" />
              </span>
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-tight">
                  Rupiah Tercapai Dari Masing-Masing Petugas
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">Pencapaian PNBP / Retribusi daerah berdasarkan hasil kerja petugas</p>
              </div>
            </div>

            <div className="space-y-3.5">
              {operatorRupiahData.length > 0 ? (
                operatorRupiahData.map((item, idx) => {
                  return (
                    <div 
                      key={item.name} 
                      className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 flex justify-between items-center hover:bg-slate-100/50 transition"
                    >
                      <div className="space-y-1 max-w-[65%]">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span className="text-xs font-bold text-slate-800 truncate">{item.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-semibold">
                          Total Volume Kerja
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg block shadow-2xs">
                          {formatRupiah(item.rupiah)}
                        </span>
                        <span className="text-[9px] text-slate-400 mt-0.5 inline-block font-medium">
                          ({item.hectares} Ha terolah)
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-xs text-slate-400 font-medium">
                  Belum ada taksiran retribusi rupiah.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4">
            <div className="bg-emerald-50 text-emerald-950 p-2.5 rounded-xl border border-emerald-100 text-[10px] flex items-center justify-between mb-2">
              <span className="font-semibold block">Total Retribusi Terkumpul:</span>
              <span className="font-mono font-bold text-xs">
                {formatRupiah(operatorRupiahData.reduce((sum, item) => sum + item.rupiah, 0))}
              </span>
            </div>
            <p className="text-[9px] text-slate-400 font-medium leading-relaxed">
              *Retribusi Acuan: Rp 1.500.000 / Hektar untuk Traktor Roda 4 dan Rp.2.000.000 / Hari untuk Ekskavator.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
