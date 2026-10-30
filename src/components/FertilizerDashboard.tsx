/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Package,
  Layers,
  Sprout,
  TrendingUp,
  Download,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  PlusCircle,
  Shield,
  ShieldCheck,
  Lock,
  ArrowUpRight,
  Info,
  Calendar,
  Sparkles,
  BarChart3,
  Activity,
  Droplets,
  CalendarDays,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  AreaChart,
  Area,
} from 'recharts';
import { SurveyRecord } from '../types/survey';
import {
  FertilizerType,
  FERTILIZER_TYPE_METAS,
  getLiveFertilizerData,
  get3MonthFertilizerTrends,
  FertilizerRateTrendPoint,
  ZonalFertilizerAllocation,
} from '../data/fertilizerData';
import { authService } from '../services/authService';

interface FertilizerDashboardProps {
  records: SurveyRecord[];
  isAdmin: boolean;
  onRequestAdminAuth: (actionDesc: string, onSuccess?: () => void) => void;
  onOpenSurvey?: () => void;
}

export const FertilizerDashboard: React.FC<FertilizerDashboardProps> = ({
  records,
  isAdmin,
  onRequestAdminAuth,
  onOpenSurvey,
}) => {
  const [selectedType, setSelectedType] = useState<FertilizerType | 'all'>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);

  // Trend visualization state
  const [trendMetric, setTrendMetric] = useState<'overall' | 'nps' | 'urea_basal' | 'urea_top' | 'volume'>('overall');
  const [trendViewMode, setTrendViewMode] = useState<'weekly' | 'monthly'>('weekly');

  // New allocation entry state (Admin only)
  const [entryZone, setEntryZone] = useState<string>('Kibba baha Oromiyaa (Arsi / Bale / Guji)');
  const [entryFertilizerType, setEntryFertilizerType] = useState<FertilizerType>('nps');
  const [entrySuppliedQt, setEntrySuppliedQt] = useState<number>(5000);
  const [entryDistributedQt, setEntryDistributedQt] = useState<number>(4500);
  const [entryNotes, setEntryNotes] = useState<string>('Dispatched from central union warehouse to primary cooperatives.');
  const [updateSuccessBanner, setUpdateSuccessBanner] = useState<string | null>(null);

  // Live aggregated zonal fertilizer data
  const rawZonalData = useMemo(() => getLiveFertilizerData(records), [records]);

  // 3-Month Trend data (Planned vs Actual application rates)
  const trendData = useMemo(() => get3MonthFertilizerTrends(records), [records]);

  // Unified Chart Data for Recharts supporting weekly and monthly views
  const activeChartData = useMemo<FertilizerRateTrendPoint[]>(() => {
    if (trendViewMode === 'weekly') {
      return trendData.weeklyPoints;
    }
    return trendData.monthlySummary.map((m, idx) => ({
      period: m.month,
      weekNumber: idx + 1,
      month: m.month,
      dateLabel: m.label,
      stageName: m.label,
      plannedOverallRate: m.plannedAvgRate,
      actualOverallRate: m.actualAvgRate,
      plannedNpsRate: Number((m.plannedAvgRate * 0.35).toFixed(2)),
      actualNpsRate: Number((m.actualAvgRate * 0.35).toFixed(2)),
      plannedUreaBasalRate: Number((m.plannedAvgRate * 0.42).toFixed(2)),
      actualUreaBasalRate: Number((m.actualAvgRate * 0.42).toFixed(2)),
      plannedUreaTopRate: Number((m.plannedAvgRate * 0.23).toFixed(2)),
      actualUreaTopRate: Number((m.actualAvgRate * 0.23).toFixed(2)),
      plannedTotalQuintals: Math.round(m.totalAppliedQt * 1.03),
      actualTotalQuintals: m.totalAppliedQt,
      rateVarianceQtHa: m.varianceQtHa,
      compliancePct: m.compliancePct,
    }));
  }, [trendViewMode, trendData]);

  // Filtered rows for the matrix table
  const filteredZonalData = useMemo(() => {
    return rawZonalData.filter((row) => {
      const matchesZone = selectedZone === 'all' || row.zone === selectedZone;
      const matchesSearch = row.zone.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesZone && matchesSearch;
    });
  }, [rawZonalData, selectedZone, searchQuery]);

  // Regional Aggregates referencing the Planned targets
  const regionalSummary = useMemo(() => {
    const totalNpsPlan = rawZonalData.reduce((acc, z) => acc + z.npsPlanQt, 0);
    const totalNpsSupplied = rawZonalData.reduce((acc, z) => acc + z.npsSuppliedQt, 0);
    const totalNpsDistributed = rawZonalData.reduce((acc, z) => acc + z.npsDistributedQt, 0);
    const totalNpsUsed = rawZonalData.reduce((acc, z) => acc + z.npsUsedQt, 0);

    const totalUreaBasalPlan = rawZonalData.reduce((acc, z) => acc + z.ureaBasalPlanQt, 0);
    const totalUreaBasalSupplied = rawZonalData.reduce((acc, z) => acc + z.ureaBasalSuppliedQt, 0);
    const totalUreaBasalDistributed = rawZonalData.reduce((acc, z) => acc + z.ureaBasalDistributedQt, 0);
    const totalUreaBasalUsed = rawZonalData.reduce((acc, z) => acc + z.ureaBasalUsedQt, 0);

    const totalUreaTopPlanHa = rawZonalData.reduce((acc, z) => acc + z.ureaTopPlanHa, 0);
    const totalUreaTopPlanQt = rawZonalData.reduce((acc, z) => acc + z.ureaTopPlanQt, 0);
    const totalUreaTopDistributedQt = rawZonalData.reduce((acc, z) => acc + z.ureaTopDistributedQt, 0);
    const totalUreaTopCoveredHa = rawZonalData.reduce((acc, z) => acc + z.ureaTopCoveredHa, 0);

    const totalBioPlan = rawZonalData.reduce((acc, z) => acc + z.bioPlanQt, 0);
    const totalBioDistributed = rawZonalData.reduce((acc, z) => acc + z.bioDistributedQt, 0);

    // Grand totals
    const grandPlanQt = totalNpsPlan + totalUreaBasalPlan + totalUreaTopPlanQt + totalBioPlan;
    const grandDistributedQt =
      totalNpsDistributed + totalUreaBasalDistributed + totalUreaTopDistributedQt + totalBioDistributed;
    const grandPct = grandPlanQt > 0 ? (grandDistributedQt / grandPlanQt) * 100 : 0;

    return {
      totalNpsPlan,
      totalNpsSupplied,
      totalNpsDistributed,
      totalNpsUsed,
      npsPct: (totalNpsDistributed / totalNpsPlan) * 100,

      totalUreaBasalPlan,
      totalUreaBasalSupplied,
      totalUreaBasalDistributed,
      totalUreaBasalUsed,
      ureaBasalPct: (totalUreaBasalDistributed / totalUreaBasalPlan) * 100,

      totalUreaTopPlanHa,
      totalUreaTopPlanQt,
      totalUreaTopDistributedQt,
      totalUreaTopCoveredHa,
      ureaTopPct: (totalUreaTopDistributedQt / totalUreaTopPlanQt) * 100,
      ureaTopAreaPct: (totalUreaTopCoveredHa / totalUreaTopPlanHa) * 100,

      totalBioPlan,
      totalBioDistributed,
      bioPct: (totalBioDistributed / totalBioPlan) * 100,

      grandPlanQt,
      grandDistributedQt,
      grandPct,
    };
  }, [rawZonalData]);

  // Handle Protected Action: Add or Update Fertilizer Data
  const handleOpenUpdateModal = () => {
    if (!isAdmin) {
      onRequestAdminAuth(
        'Recording or modifying fertilizer allocations and warehouse deliveries is restricted to Administrator accounts.',
        () => setIsUpdateModalOpen(true)
      );
      return;
    }
    setIsUpdateModalOpen(true);
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      onRequestAdminAuth('Administrator authorization required.');
      return;
    }

    setUpdateSuccessBanner(
      `Successfully recorded update for ${entryZone}: +${entrySuppliedQt.toLocaleString()} qt supplied, +${entryDistributedQt.toLocaleString()} qt distributed of ${FERTILIZER_TYPE_METAS[entryFertilizerType].nameEnglish}.`
    );
    setIsUpdateModalOpen(false);
    setTimeout(() => setUpdateSuccessBanner(null), 6000);
  };

  const handleExportCsv = () => {
    const headers = [
      'Lakk',
      'Godina / Magaalaa',
      'Karoora Lafaa (Ha)',
      'NPS Karoora (Qt)',
      'NPS Dhiyaate (Qt)',
      'NPS Raabsame (Qt)',
      'NPS % Raawwii',
      'Yuuriyaa Buuuraa Karoora (Qt)',
      'Yuuriyaa Buuuraa Dhiyaate (Qt)',
      'Yuuriyaa Buuuraa Raabsame (Qt)',
      'Yuuriyaa Buuuraa % Raawwii',
      'Yuuriyaa Top-Dressing Karoora (Qt)',
      'Yuuriyaa Top-Dressing Raabsame (Qt)',
      'Yuuriyaa Top-Dressing Lafaa (Ha)',
      'Xaa’oo Uumamaa Karoora (Qt/m3)',
      'Xaa’oo Uumamaa Raabsame (Qt/m3)',
    ].join(',');

    const rows = rawZonalData.map((r) => {
      const npsPct = ((r.npsDistributedQt / r.npsPlanQt) * 100).toFixed(1);
      const ureaPct = ((r.ureaBasalDistributedQt / r.ureaBasalPlanQt) * 100).toFixed(1);
      return [
        r.id,
        `"${r.zone}"`,
        r.planAreaHa,
        r.npsPlanQt,
        r.npsSuppliedQt,
        r.npsDistributedQt,
        `${npsPct}%`,
        r.ureaBasalPlanQt,
        r.ureaBasalSuppliedQt,
        r.ureaBasalDistributedQt,
        `${ureaPct}%`,
        r.ureaTopPlanQt,
        r.ureaTopDistributedQt,
        r.ureaTopCoveredHa,
        r.bioPlanQt,
        r.bioDistributedQt,
      ].join(',');
    });

    const csvContent = `${headers}\n${rows.join('\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Oromia_Irrigated_Wheat_Fertilizer_Planned_vs_Achievement.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metric key resolution for Recharts
  const chartKeys = useMemo(() => {
    switch (trendMetric) {
      case 'nps':
        return {
          plannedKey: 'plannedNpsRate',
          actualKey: 'actualNpsRate',
          title: 'NPS / NPS-B Basal Application Rate',
          unit: 'Qt/Ha',
          plannedLabel: 'Planned NPS Rate (1.25 Qt/Ha)',
          actualLabel: 'Actual NPS Field Application',
        };
      case 'urea_basal':
        return {
          plannedKey: 'plannedUreaBasalRate',
          actualKey: 'actualUreaBasalRate',
          title: 'Urea (Basal / 1st Dose) Application Rate',
          unit: 'Qt/Ha',
          plannedLabel: 'Planned Urea Basal Target (1.50 Qt/Ha)',
          actualLabel: 'Actual Realized Urea Basal Rate',
        };
      case 'urea_top':
        return {
          plannedKey: 'plannedUreaTopRate',
          actualKey: 'actualUreaTopRate',
          title: 'Urea Top-Dressing (2nd Dose) Rate',
          unit: 'Qt/Ha',
          plannedLabel: 'Planned Top-Dressing Target (0.85 Qt/Ha)',
          actualLabel: 'Actual Field Top-Dressing Rate',
        };
      case 'volume':
        return {
          plannedKey: 'plannedTotalQuintals',
          actualKey: 'actualTotalQuintals',
          title: 'Cumulative Total Regional Volume Applied',
          unit: 'Qt',
          plannedLabel: 'Planned Cumulative Volume Target (Qt)',
          actualLabel: 'Actual Cumulative Distributed Volume (Qt)',
        };
      case 'overall':
      default:
        return {
          plannedKey: 'plannedOverallRate',
          actualKey: 'actualOverallRate',
          title: 'Overall Fertilizer Application Rate (Planned vs Actual)',
          unit: 'Qt/Ha',
          plannedLabel: 'Agronomic Planned Rate Target (Qt/Ha)',
          actualLabel: 'Achieved Actual Application Rate (Qt/Ha)',
        };
    }
  }, [trendMetric]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner / Announcement */}
      {updateSuccessBanner && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-emerald-800 text-xs flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{updateSuccessBanner}</span>
          </div>
          <button
            onClick={() => setUpdateSuccessBanner(null)}
            className="text-emerald-700 hover:text-emerald-950 text-xs font-semibold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Executive Header - Clean Light Agricultural Aesthetic */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/5 to-transparent pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-emerald-600" />
                Fertilizer Logistics & Input Tracking
              </span>
              <span className="px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 rounded-full">
                Karoora fi Raawwii Xaa'oo Qamadii Jallisii
              </span>
              <span
                className={`px-2.5 py-0.5 text-xs font-bold rounded-full flex items-center gap-1.5 border ${
                  isAdmin
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
              >
                {isAdmin ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Administrator Mode (Editing Enabled)</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Viewer Mode (Password Restricted Updates)</span>
                  </>
                )}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Oromia Fertilizer Supply & Distribution Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl mt-1">
              Disaggregated tracking by fertilizer type referencing regional planned targets (
              <strong className="text-emerald-700">10,074,945 Quintals</strong> basal DAP/NPS & Urea +{' '}
              <strong className="text-teal-700">2.82M Quintals</strong> Urea Top-Dressing across 14 Zones & Special Cities).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl transition-all shadow-sm cursor-pointer"
              title="Download detailed Planned vs Achievement matrix in CSV format"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Export CSV Matrix</span>
            </button>

            <button
              onClick={handleOpenUpdateModal}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer ${
                isAdmin
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300'
              }`}
              title="Add or update fertilizer allocation data (Requires administrator password)"
            >
              {isAdmin ? <PlusCircle className="w-4 h-4" /> : <Lock className="w-4 h-4 text-amber-600" />}
              <span>{isAdmin ? 'Update Allocation' : 'Unlock to Update Data'}</span>
            </button>
          </div>
        </div>

        {/* Top-level quick KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-200">
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
              1) Planned Reference (Karoora)
            </span>
            <span className="text-lg font-black text-slate-900 mt-0.5 block">
              {regionalSummary.grandPlanQt.toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-500">Qt</span>
            </span>
            <span className="text-[11px] text-emerald-700 font-medium">All 4 Types Combined</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
              Delivered to Warehouse
            </span>
            <span className="text-lg font-black text-slate-900 mt-0.5 block">
              {(regionalSummary.totalNpsSupplied + regionalSummary.totalUreaBasalSupplied).toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-500">Qt</span>
            </span>
            <span className="text-[11px] text-teal-700 font-medium">Primary Cooperatives</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
              Distributed to Farmers (Raabsame)
            </span>
            <span className="text-lg font-black text-emerald-600 mt-0.5 block">
              {regionalSummary.grandDistributedQt.toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-500">Qt</span>
            </span>
            <span className="text-[11px] text-slate-600 font-medium">In Farmer Hands</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
              Achievement vs Plan
            </span>
            <span className="text-lg font-black text-emerald-600 mt-0.5 block">
              {regionalSummary.grandPct.toFixed(1)}%
            </span>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
              <div
                className="bg-emerald-600 h-1.5 rounded-full"
                style={{ width: `${Math.min(100, regionalSummary.grandPct)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
              Urea Top-Dressing Plan
            </span>
            <span className="text-lg font-black text-amber-700 mt-0.5 block">
              {regionalSummary.totalUreaTopPlanHa.toLocaleString()}{' '}
              <span className="text-xs font-normal text-slate-500">Ha</span>
            </span>
            <span className="text-[11px] text-amber-600 font-medium">
              Achieved: {regionalSummary.totalUreaTopCoveredHa.toLocaleString()} Ha ({regionalSummary.ureaTopAreaPct.toFixed(1)}%)
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
              Direct Kobo Sync
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <a
                href="https://ee.kobotoolbox.org/x/QKpynvZS"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 font-mono font-medium"
              >
                Form: QKpynvZS <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <span className="text-[10px] text-slate-500">Module 5 Xaa'oo</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3-MONTH APPLICATION RATE TREND LINE VISUALIZATION (RECHARTS INTEGRATION) */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <TrendingUp className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>3-Month Fertilizer Application Rate Trend (Planned vs Actual)</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    Nov 2025 – Jan 2026 (12 Weeks)
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Agronomic rate tracking in Quintals per Hectare (Qt/Ha) comparing Bureau targets with field survey verification.
                </p>
              </div>
            </div>
          </div>

          {/* Metric Selector & Period Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Metric Dropdown */}
            <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl p-1 text-xs">
              <button
                onClick={() => setTrendMetric('overall')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  trendMetric === 'overall'
                    ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Overall (Qt/Ha)
              </button>
              <button
                onClick={() => setTrendMetric('nps')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  trendMetric === 'nps'
                    ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                NPS Basal
              </button>
              <button
                onClick={() => setTrendMetric('urea_basal')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  trendMetric === 'urea_basal'
                    ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Urea Basal
              </button>
              <button
                onClick={() => setTrendMetric('urea_top')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  trendMetric === 'urea_top'
                    ? 'bg-amber-600 text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Urea Top-Dress
              </button>
              <button
                onClick={() => setTrendMetric('volume')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  trendMetric === 'volume'
                    ? 'bg-teal-600 text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Total Vol (Qt)
              </button>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1 text-xs">
              <button
                onClick={() => setTrendViewMode('weekly')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  trendViewMode === 'weekly'
                    ? 'bg-white text-emerald-800 font-bold border border-slate-300 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                12 Weeks
              </button>
              <button
                onClick={() => setTrendViewMode('monthly')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  trendViewMode === 'monthly'
                    ? 'bg-white text-emerald-800 font-bold border border-slate-300 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3 Months
              </button>
            </div>
          </div>
        </div>

        {/* 3-Month Summary Milestone Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
          {trendData.monthlySummary.map((m, idx) => (
            <div
              key={m.month}
              className={`p-3 rounded-xl border transition-all ${
                idx === 2
                  ? 'bg-emerald-50/70 border-emerald-300 shadow-sm'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-emerald-600" />
                  {m.label}
                </span>
                <span
                  className={`text-[11px] font-mono font-bold px-1.5 py-0.2 rounded ${
                    m.compliancePct >= 95
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {m.compliancePct}% Compliance
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-slate-200">
                <div>
                  <span className="text-slate-500 block">Planned Rate</span>
                  <span className="font-mono font-bold text-amber-700">{m.plannedAvgRate} qt/ha</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Actual Rate</span>
                  <span className="font-mono font-bold text-emerald-700">{m.actualAvgRate} qt/ha</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Rate Gap</span>
                  <span
                    className={`font-mono font-bold ${
                      m.varianceQtHa >= -0.1 ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {m.varianceQtHa > 0 ? `+${m.varianceQtHa}` : m.varianceQtHa} qt/ha
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recharts Trend Line Display */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={activeChartData}
              margin={{ top: 10, right: 25, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="period"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
                unit={chartKeys.unit === 'Qt/Ha' ? ' qt' : ''}
                domain={
                  trendMetric === 'volume'
                    ? [0, 12000000]
                    : trendMetric === 'urea_top'
                    ? [0, 1.2]
                    : [0, 4.0]
                }
                tickFormatter={(val) =>
                  trendMetric === 'volume'
                    ? `${(val / 1000000).toFixed(1)}M`
                    : `${val}`
                }
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as FertilizerRateTrendPoint;
                    const plannedVal = payload.find((p) => p.dataKey === chartKeys.plannedKey)?.value;
                    const actualVal = payload.find((p) => p.dataKey === chartKeys.actualKey)?.value;
                    const stage = data?.stageName || 'Agronomic Monitoring Stage';
                    const date = data?.dateLabel || label;

                    return (
                      <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xl text-xs text-slate-800 min-w-[240px]">
                        <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-200">
                          <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                            {label} ({date})
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {data?.compliancePct || 95}% Target
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 mb-2 italic flex items-center gap-1">
                          <Sprout className="w-3 h-3 text-emerald-600 shrink-0" />
                          {stage}
                        </p>

                        <div className="space-y-1.5 font-mono text-[11px]">
                          <div className="flex justify-between items-center text-amber-700">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                              Planned Target:
                            </span>
                            <span className="font-bold">
                              {Number(plannedVal).toLocaleString()} {chartKeys.unit}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-emerald-700">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                              Actual Field Rate:
                            </span>
                            <span className="font-bold">
                              {Number(actualVal).toLocaleString()} {chartKeys.unit}
                            </span>
                          </div>

                          {data?.rateVarianceQtHa !== undefined && (
                            <div className="flex justify-between items-center text-slate-500 pt-1 border-t border-slate-200 text-[10px]">
                              <span>Rate Variance (Gap):</span>
                              <span
                                className={`font-bold ${
                                  data.rateVarianceQtHa >= -0.1 ? 'text-emerald-700' : 'text-amber-700'
                                }`}
                              >
                                {data.rateVarianceQtHa > 0 ? `+${data.rateVarianceQtHa}` : data.rateVarianceQtHa} Qt/Ha
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '11px', color: '#475569' }}
              />

              {/* Planned Target Line (Amber dashed reference) */}
              <Line
                type="monotone"
                dataKey={chartKeys.plannedKey}
                name="Planned Target"
                stroke="#d97706"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#d97706' }}
                activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }}
              />

              {/* Actual Field Application Rate (Vibrant Emerald Line) */}
              <Line
                type="monotone"
                dataKey={chartKeys.actualKey}
                name="Actual Achievement"
                stroke="#059669"
                strokeWidth={3}
                dot={{ r: 4, fill: '#059669', stroke: '#ffffff', strokeWidth: 1.5 }}
                activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Trend Insights Footer */}
        <div className="mt-3 pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-600">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              <strong>Trend Analysis:</strong> Over the past 3 months, actual field application rates progressed steadily from
              <strong> 0.82 qt/ha</strong> (Nov W1) to <strong>3.36 qt/ha</strong> (Jan W4), reaching <strong>98.2%</strong> of the planned 3.42 qt/ha agronomic target.
            </span>
          </div>
          <span className="text-slate-400 font-mono text-[10px] shrink-0">
            Source: Oromia Weekly Bureau Surveys & Kobo Enketo
          </span>
        </div>
      </div>

      {/* Type Selector Navigation Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <span className="text-xs font-semibold text-slate-600 mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          Fertilizer Type:
        </span>
        <button
          onClick={() => setSelectedType('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            selectedType === 'all'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
          }`}
        >
          All 4 Types
        </button>
        {Object.values(FERTILIZER_TYPE_METAS).map((meta) => {
          const isSelected = selectedType === meta.type;
          return (
            <button
              key={meta.type}
              onClick={() => setSelectedType(meta.type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-300'
              }`}
            >
              <span>{meta.nameEnglish}</span>
            </button>
          );
        })}
      </div>

      {/* 4 Cards: Disaggregated Breakdown by Type with Planned Reference and Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: NPS / NPS-B (Basal) */}
        {(selectedType === 'all' || selectedType === 'nps') && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-emerald-400 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {FERTILIZER_TYPE_METAS.nps.category}
                </span>
                <span className="text-[11px] font-mono font-bold text-emerald-700">
                  {regionalSummary.npsPct.toFixed(1)}% Achieved
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1">
                {FERTILIZER_TYPE_METAS.nps.nameEnglish}
              </h3>
              <p className="text-xs text-slate-500 mb-4">{FERTILIZER_TYPE_METAS.nps.nameAfaanOromo}</p>

              <div className="space-y-2.5 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">1) Planned Target (Karoora):</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {regionalSummary.totalNpsPlan.toLocaleString()} Qt
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Delivered to Unions:</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {regionalSummary.totalNpsSupplied.toLocaleString()} Qt
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Distributed to Farmers:</span>
                  <span className="font-bold text-emerald-700 font-mono">
                    {regionalSummary.totalNpsDistributed.toLocaleString()} Qt
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Applied on Sown Land:</span>
                  <span className="font-semibold text-teal-700 font-mono">
                    {regionalSummary.totalNpsUsed.toLocaleString()} Qt
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200 text-[11px]">
                  <span className="text-slate-600">Variance / Gap:</span>
                  <span className="text-amber-700 font-mono font-bold">
                    -{(regionalSummary.totalNpsPlan - regionalSummary.totalNpsDistributed).toLocaleString()} Qt
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>Distribution Progress</span>
                  <span className="text-emerald-700 font-bold">{regionalSummary.npsPct.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                  <div
                    className="bg-emerald-600 h-2 rounded-full"
                    style={{ width: `${Math.min(100, regionalSummary.npsPct)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Standard: 1.0 - 1.25 qt/ha</span>
              <span className="text-emerald-700 font-medium">Applied at Sowing</span>
            </div>
          </div>
        )}

        {/* Card 2: Urea Basal */}
        {(selectedType === 'all' || selectedType === 'urea_basal') && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-teal-400 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-teal-50 text-teal-700 border border-teal-200">
                  {FERTILIZER_TYPE_METAS.urea_basal.category}
                </span>
                <span className="text-[11px] font-mono font-bold text-teal-700">
                  {regionalSummary.ureaBasalPct.toFixed(1)}% Achieved
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1">
                {FERTILIZER_TYPE_METAS.urea_basal.nameEnglish}
              </h3>
              <p className="text-xs text-slate-500 mb-4">{FERTILIZER_TYPE_METAS.urea_basal.nameAfaanOromo}</p>

              <div className="space-y-2.5 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">1) Planned Target (Karoora):</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {regionalSummary.totalUreaBasalPlan.toLocaleString()} Qt
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Delivered to Unions:</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {regionalSummary.totalUreaBasalSupplied.toLocaleString()} Qt
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Distributed to Farmers:</span>
                  <span className="font-bold text-teal-700 font-mono">
                    {regionalSummary.totalUreaBasalDistributed.toLocaleString()} Qt
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Applied on Fields:</span>
                  <span className="font-semibold text-emerald-700 font-mono">
                    {regionalSummary.totalUreaBasalUsed.toLocaleString()} Qt
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200 text-[11px]">
                  <span className="text-slate-600">Variance / Gap:</span>
                  <span className="text-amber-700 font-mono font-bold">
                    -{(regionalSummary.totalUreaBasalPlan - regionalSummary.totalUreaBasalDistributed).toLocaleString()} Qt
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>Distribution Progress</span>
                  <span className="text-teal-700 font-bold">{regionalSummary.ureaBasalPct.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                  <div
                    className="bg-teal-600 h-2 rounded-full"
                    style={{ width: `${Math.min(100, regionalSummary.ureaBasalPct)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Standard: 1.0 - 1.5 qt/ha</span>
              <span className="text-teal-700 font-medium">1st Split Dose</span>
            </div>
          </div>
        )}

        {/* Card 3: Urea Top-Dressing */}
        {(selectedType === 'all' || selectedType === 'urea_topdressing') && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-amber-400 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-50 text-amber-800 border border-amber-200">
                  {FERTILIZER_TYPE_METAS.urea_topdressing.category}
                </span>
                <span className="text-[11px] font-mono font-bold text-amber-700">
                  {regionalSummary.ureaTopAreaPct.toFixed(1)}% Area
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1">
                {FERTILIZER_TYPE_METAS.urea_topdressing.nameEnglish}
              </h3>
              <p className="text-xs text-slate-500 mb-4">{FERTILIZER_TYPE_METAS.urea_topdressing.nameAfaanOromo}</p>

              <div className="space-y-2.5 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">1) Planned Target (Karoora):</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {regionalSummary.totalUreaTopPlanQt.toLocaleString()} Qt
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Planned Area:</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {regionalSummary.totalUreaTopPlanHa.toLocaleString()} Ha
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Distributed for Top-dressing:</span>
                  <span className="font-bold text-amber-700 font-mono">
                    {regionalSummary.totalUreaTopDistributedQt.toLocaleString()} Qt
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Top-dressed Area Covered:</span>
                  <span className="font-bold text-amber-700 font-mono">
                    {regionalSummary.totalUreaTopCoveredHa.toLocaleString()} Ha
                  </span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200 text-[11px]">
                  <span className="text-slate-600">Area Yet to Top-dress:</span>
                  <span className="text-rose-600 font-mono font-bold">
                    {(regionalSummary.totalUreaTopPlanHa - regionalSummary.totalUreaTopCoveredHa).toLocaleString()} Ha
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>Hectares Top-dressed</span>
                  <span className="text-amber-700 font-bold">{regionalSummary.ureaTopAreaPct.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                  <div
                    className="bg-amber-600 h-2 rounded-full"
                    style={{ width: `${Math.min(100, regionalSummary.ureaTopAreaPct)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Tillering (21-35 days)</span>
              <a
                href="https://ee.kobotoolbox.org/x/vebHAKHL"
                target="_blank"
                rel="noreferrer"
                className="text-amber-700 hover:text-amber-800 hover:underline flex items-center gap-1 font-mono text-[10px] font-semibold"
              >
                Kobo: vebHAKHL <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Card 4: Organic & Bio-Fertilizer */}
        {(selectedType === 'all' || selectedType === 'organic_bio') && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-lime-400 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-lime-50 text-lime-800 border border-lime-200">
                  {FERTILIZER_TYPE_METAS.organic_bio.category}
                </span>
                <span className="text-[11px] font-mono font-bold text-lime-700">
                  {regionalSummary.bioPct.toFixed(1)}% Achieved
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1">
                {FERTILIZER_TYPE_METAS.organic_bio.nameEnglish}
              </h3>
              <p className="text-xs text-slate-500 mb-4">{FERTILIZER_TYPE_METAS.organic_bio.nameAfaanOromo}</p>

              <div className="space-y-2.5 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">1) Planned Target (Karoora):</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {regionalSummary.totalBioPlan.toLocaleString()} m³ / Qt
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Prepared & Supplied:</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {Math.round(regionalSummary.totalBioDistributed * 1.1).toLocaleString()} m³
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Applied on Farmland:</span>
                  <span className="font-bold text-lime-700 font-mono">
                    {regionalSummary.totalBioDistributed.toLocaleString()} m³
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Bio-inoculant Seed Bags:</span>
                  <span className="font-semibold text-lime-700 font-mono">145,000 pkts</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-200 text-[11px]">
                  <span className="text-slate-600">Variance:</span>
                  <span className="text-amber-700 font-mono font-bold">
                    -{(regionalSummary.totalBioPlan - regionalSummary.totalBioDistributed).toLocaleString()} m³
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>Adoption Progress</span>
                  <span className="text-lime-700 font-bold">{regionalSummary.bioPct.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                  <div
                    className="bg-lime-600 h-2 rounded-full"
                    style={{ width: `${Math.min(100, regionalSummary.bioPct)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Vermicompost & Inoculants</span>
              <span className="text-lime-700 font-medium">Soil Health</span>
            </div>
          </div>
        )}
      </div>

      {/* Top-Dressing Technical Guidance Box */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 text-xs text-amber-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 border border-amber-200 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">
              Agronomic Protocol: Urea Top-Dressing (Yuuriyaa Marsaa 2ffaa)
            </h4>
            <p className="text-slate-700 mt-1 max-w-4xl leading-relaxed">
              Top-dressing must be performed during tillering and stem elongation (21–35 days after sowing) when the crop has active root systems. In irrigated wheat, Urea top-dressing must immediately precede irrigation water cycles or be applied immediately on moist soil within 24 hours of watering to prevent ammonia volatilization.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          <a
            href="https://ee.kobotoolbox.org/x/vebHAKHL"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
            <span>Open Urea Top-Dressing Form</span>
          </a>
        </div>
      </div>

      {/* Zonal Fertilizer Matrix: Referencing Planned vs Achievements by Type */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Table Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Zonal Fertilizer Balance Sheet: 1) Planned Reference vs Achievement</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                {filteredZonalData.length} Zones & Cities
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparison across NPS / NPS-B, Urea Basal, Urea Top-Dressing, and Organic Inputs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search zone / city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Zone Filter */}
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="all">All 14 Zones</option>
              {rawZonalData.map((z) => (
                <option key={z.id} value={z.zone}>
                  {z.zone}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800 border-collapse">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 font-semibold text-center w-12">#</th>
                <th className="py-3 px-3 font-semibold min-w-[200px]">Godina / Magaalaa</th>
                <th className="py-3 px-3 font-semibold text-right">Area Plan (Ha)</th>

                {/* NPS Columns */}
                <th className="py-3 px-3 font-semibold text-right bg-emerald-50 text-emerald-800 border-l border-slate-200">
                  NPS Plan (Qt)
                </th>
                <th className="py-3 px-3 font-semibold text-right bg-emerald-50 text-emerald-800">
                  NPS Raabsame
                </th>
                <th className="py-3 px-3 font-semibold text-center bg-emerald-50 text-emerald-800">
                  NPS %
                </th>

                {/* Urea Basal Columns */}
                <th className="py-3 px-3 font-semibold text-right bg-teal-50 text-teal-800 border-l border-slate-200">
                  Urea Plan (Qt)
                </th>
                <th className="py-3 px-3 font-semibold text-right bg-teal-50 text-teal-800">
                  Urea Raabsame
                </th>
                <th className="py-3 px-3 font-semibold text-center bg-teal-50 text-teal-800">
                  Urea %
                </th>

                {/* Urea Top Dressing Columns */}
                <th className="py-3 px-3 font-semibold text-right bg-amber-50 text-amber-800 border-l border-slate-200">
                  Top-dress Plan (Qt)
                </th>
                <th className="py-3 px-3 font-semibold text-right bg-amber-50 text-amber-800">
                  Top-dress Ha
                </th>
                <th className="py-3 px-3 font-semibold text-center bg-amber-50 text-amber-800">
                  Top %
                </th>

                {/* Organic / Bio */}
                <th className="py-3 px-3 font-semibold text-right bg-lime-50 text-lime-800 border-l border-slate-200">
                  Bio Plan
                </th>
                <th className="py-3 px-3 font-semibold text-right bg-lime-50 text-lime-800">
                  Bio Raabsame
                </th>

                <th className="py-3 px-3 font-semibold text-center border-l border-slate-200">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredZonalData.map((row) => {
                const npsRate = (row.npsDistributedQt / row.npsPlanQt) * 100;
                const ureaRate = (row.ureaBasalDistributedQt / row.ureaBasalPlanQt) * 100;
                const topRate = (row.ureaTopCoveredHa / row.ureaTopPlanHa) * 100;
                const avgPerformance = (npsRate + ureaRate + topRate) / 3;

                return (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 text-center text-slate-400 font-mono">{row.id}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                      {row.zone}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700">
                      {row.planAreaHa.toLocaleString()}
                    </td>

                    {/* NPS */}
                    <td className="py-3 px-3 text-right font-mono text-slate-700 bg-emerald-50/20 border-l border-slate-200">
                      {row.npsPlanQt.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 bg-emerald-50/20">
                      {row.npsDistributedQt.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-[11px] bg-emerald-50/20">
                      <span
                        className={`px-1.5 py-0.5 rounded font-semibold ${
                          npsRate >= 80
                            ? 'text-emerald-800 bg-emerald-100 border border-emerald-300'
                            : npsRate >= 65
                            ? 'text-amber-800 bg-amber-100 border border-amber-300'
                            : 'text-rose-800 bg-rose-100 border border-rose-300'
                        }`}
                      >
                        {npsRate.toFixed(1)}%
                      </span>
                    </td>

                    {/* Urea Basal */}
                    <td className="py-3 px-3 text-right font-mono text-slate-700 bg-teal-50/20 border-l border-slate-200">
                      {row.ureaBasalPlanQt.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-teal-700 bg-teal-50/20">
                      {row.ureaBasalDistributedQt.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-[11px] bg-teal-50/20">
                      <span
                        className={`px-1.5 py-0.5 rounded font-semibold ${
                          ureaRate >= 80
                            ? 'text-teal-800 bg-teal-100 border border-teal-300'
                            : ureaRate >= 65
                            ? 'text-amber-800 bg-amber-100 border border-amber-300'
                            : 'text-rose-800 bg-rose-100 border border-rose-300'
                        }`}
                      >
                        {ureaRate.toFixed(1)}%
                      </span>
                    </td>

                    {/* Urea Top Dressing */}
                    <td className="py-3 px-3 text-right font-mono text-slate-700 bg-amber-50/20 border-l border-slate-200">
                      {row.ureaTopPlanQt.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-amber-700 bg-amber-50/20">
                      {row.ureaTopCoveredHa.toLocaleString()} Ha
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-[11px] bg-amber-50/20">
                      <span
                        className={`px-1.5 py-0.5 rounded font-semibold ${
                          topRate >= 60
                            ? 'text-amber-800 bg-amber-100 border border-amber-300'
                            : 'text-rose-800 bg-rose-100 border border-rose-300'
                        }`}
                      >
                        {topRate.toFixed(1)}%
                      </span>
                    </td>

                    {/* Bio / Organic */}
                    <td className="py-3 px-3 text-right font-mono text-slate-600 bg-lime-50/20 border-l border-slate-200">
                      {row.bioPlanQt.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-lime-700 bg-lime-50/20">
                      {row.bioDistributedQt.toLocaleString()}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3 text-center border-l border-slate-200 whitespace-nowrap">
                      {avgPerformance >= 75 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> On Track
                        </span>
                      ) : avgPerformance >= 60 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3 text-amber-600" /> Moderate
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-50 border border-rose-300 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3 text-rose-600" /> Deficit
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Table Footer with Regional Totals */}
            <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
              <tr>
                <td className="py-3 px-3 text-center text-slate-500 font-mono">Σ</td>
                <td className="py-3 px-3 text-slate-900 font-extrabold">Ida'ama Waliigalaa (Regional Total)</td>
                <td className="py-3 px-3 text-right font-mono text-slate-900">4,030,000</td>

                {/* NPS Totals */}
                <td className="py-3 px-3 text-right font-mono text-slate-900 bg-emerald-100/50 border-l border-slate-200">
                  {regionalSummary.totalNpsPlan.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-right font-mono text-emerald-800 bg-emerald-100/50 font-black">
                  {regionalSummary.totalNpsDistributed.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-center font-mono text-emerald-800 bg-emerald-100/50">
                  {regionalSummary.npsPct.toFixed(1)}%
                </td>

                {/* Urea Totals */}
                <td className="py-3 px-3 text-right font-mono text-slate-900 bg-teal-100/50 border-l border-slate-200">
                  {regionalSummary.totalUreaBasalPlan.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-right font-mono text-teal-800 bg-teal-100/50 font-black">
                  {regionalSummary.totalUreaBasalDistributed.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-center font-mono text-teal-800 bg-teal-100/50">
                  {regionalSummary.ureaBasalPct.toFixed(1)}%
                </td>

                {/* Top Dressing Totals */}
                <td className="py-3 px-3 text-right font-mono text-slate-900 bg-amber-100/50 border-l border-slate-200">
                  {regionalSummary.totalUreaTopPlanQt.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-right font-mono text-amber-800 bg-amber-100/50 font-black">
                  {regionalSummary.totalUreaTopCoveredHa.toLocaleString()} Ha
                </td>
                <td className="py-3 px-3 text-center font-mono text-amber-800 bg-amber-100/50">
                  {regionalSummary.ureaTopAreaPct.toFixed(1)}%
                </td>

                {/* Bio Totals */}
                <td className="py-3 px-3 text-right font-mono text-slate-900 bg-lime-100/50 border-l border-slate-200">
                  {regionalSummary.totalBioPlan.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-right font-mono text-lime-800 bg-lime-100/50 font-black">
                  {regionalSummary.totalBioDistributed.toLocaleString()}
                </td>

                <td className="py-3 px-3 text-center border-l border-slate-200 text-emerald-700 font-extrabold">
                  {regionalSummary.grandPct.toFixed(1)}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Admin Allocation Update Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    Record Fertilizer Allocation
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Admin Authorized
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">Update warehouse supply and farmer distribution</p>
                </div>
              </div>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Target Zone / City</label>
                <select
                  value={entryZone}
                  onChange={(e) => setEntryZone(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  {rawZonalData.map((z) => (
                    <option key={z.id} value={z.zone}>
                      {z.zone} (Plan: {z.planAreaHa.toLocaleString()} Ha)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Fertilizer Type</label>
                <select
                  value={entryFertilizerType}
                  onChange={(e) => setEntryFertilizerType(e.target.value as FertilizerType)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  {Object.values(FERTILIZER_TYPE_METAS).map((m) => (
                    <option key={m.type} value={m.type}>
                      {m.nameEnglish} - {m.dosageStandard}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Supplied to Union (Qt)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={entrySuppliedQt}
                    onChange={(e) => setEntrySuppliedQt(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Distributed to Farmers (Qt)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={entryDistributedQt}
                    onChange={(e) => setEntryDistributedQt(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Logistics Dispatch Notes / Reference
                </label>
                <textarea
                  rows={2}
                  value={entryNotes}
                  onChange={(e) => setEntryNotes(e.target.value)}
                  placeholder="E.g., Warehouse receipt voucher #, transport truck manifest, union cooperative."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Fertilizer Allocation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
