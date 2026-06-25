export type AirStatus = "Lancar" | "Kering" | "Normal";

export interface AlsintanReportRow {
  id: string;
  timestamp: string;
  operator: string;
  alsintan: string;
  kecamatan: string;
  desa: string;
  luasLahan: number; // Hektar
  komoditas: string;
  bensin: number; // Liter
  status: "Tersingkronisasi" | "Perlu Sinkronisasi" | "Verifikasi Tertunda";
  dokumentasiKegiatan?: string;
  dokumenPendukung?: string;
}

export interface DashboardStats {
  totalArea: number; // Ha
  totalFuel: number; // Liter
  averageEfficiency: number; // Liter / Ha
  totalReports: number;
  activeAlsintanCount: number;
}

export interface EfficiencyIssue {
  id: string;
  alsintan: string;
  issue: string;
  severity: "tinggi" | "sedang" | "rendah";
  impact: string;
  recommendation: string;
}

export interface AllocationRecommendation {
  id: string;
  kecamatan: string;
  alsintanNeeded: string;
  reason: string;
  action: string;
}

export interface CropStrategy {
  season: string;
  recommendedCrops: string[];
  waterStrategy: string;
  summaryText: string;
}

export interface AiOptimizationResult {
  overallScore: number;
  scoreReason: string;
  efficiencyAnalysis: EfficiencyIssue[];
  allocationRecommendations: AllocationRecommendation[];
  cropStrategy: CropStrategy;
}
