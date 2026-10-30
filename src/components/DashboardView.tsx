import React, { useState } from 'react';
import {
  TrendingUp,
  Users,
  Activity,
  Droplets,
  Sprout,
  ShieldAlert,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Wrench,
  Sparkles,
  Package,
} from 'lucide-react';
import { SurveyRecord } from '../types/survey';
import { formatNumber, formatHectares, formatQuintals } from '../utils/formatters';

interface DashboardViewProps {
  records: SurveyRecord[];
  onOpenSurvey: () => void;
  onOpenSync: () => void;
  onOpenModules?: () => void;
  onOpenFertilizer?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  records,
  onOpenSurvey,
  onOpenSync,
  onOpenModules,
  onOpenFertilizer,
}) => {
  const [selectedZone, setSelectedZone] = useState<string>('all');

  // Filter records by zone
  const filteredRecords = selectedZone === 'all' ? records : records.filter((r) => r.zone === selectedZone);

  // Aggregated KPIs
  const totalPlannedHa = filteredRecords.reduce((acc, r) => acc + (r.plan_area_ha || 0), 0);
  const totalSownHa = filteredRecords.reduce((acc, r) => acc + (r.area_sown_cum_ha || 0), 0);
  const sowingAchievementPct = totalPlannedHa > 0 ? ((totalSownHa / totalPlannedHa) * 100).toFixed(1) : '0';

  const totalBeneficiaries = filteredRecords.reduce((acc, r) => acc + (r.hh_part_total || 0), 0);
  const maleBeneficiaries = filteredRecords.reduce((acc, r) => acc + (r.hh_part_m || 0), 0);
  const femaleBeneficiaries = filteredRecords.reduce((acc, r) => acc + (r.hh_part_f || 0), 0);
  const femaleRatio = totalBeneficiaries > 0 ? ((femaleBeneficiaries / totalBeneficiaries) * 100).toFixed(1) : '0';

  // Schemes & Pumps
  const allSchemes = filteredRecords.flatMap((r) => r.schemes || []);
  const totalPumps = allSchemes.reduce((acc, s) => acc + (s.pumps_total || 0), 0);
  const functionalPumps = allSchemes.reduce((acc, s) => acc + (s.pumps_functional || 0), 0);
  const brokenPumps = allSchemes.reduce((acc, s) => acc + (s.pumps_broken || 0), 0);
  const underMaintPumps = allSchemes.reduce((acc, s) => acc + (s.pumps_under_maintenance || 0), 0);
  const pumpFunctionalPct = totalPumps > 0 ? ((functionalPumps / totalPumps) * 100).toFixed(1) : '100';

  // Yield and Production
  const totalEstimatedProdQt = filteredRecords.reduce((acc, r) => {
    const yieldRate = r.plan_yield_qt_ha || 40;
    return acc + r.area_sown_cum_ha * yieldRate;
  }, 0);

  // Stages Aggregation
  const stages = {
    emergence: filteredRecords.reduce((acc, r) => acc + (r.stages?.emergence_ha || 0), 0),
    tillering: filteredRecords.reduce((acc, r) => acc + (r.stages?.tillering_ha || 0), 0),
    stem_elongation: filteredRecords.reduce((acc, r) => acc + (r.stages?.stem_elongation_ha || 0), 0),
    booting: filteredRecords.reduce((acc, r) => acc + (r.stages?.booting_ha || 0), 0),
    heading: filteredRecords.reduce((acc, r) => acc + (r.stages?.heading_flowering_ha || 0), 0),
    milk_dough: filteredRecords.reduce((acc, r) => acc + (r.stages?.milk_dough_ha || 0), 0),
    maturity: filteredRecords.reduce((acc, r) => acc + (r.stages?.maturity_ha || 0), 0),
    harvested: filteredRecords.reduce((acc, r) => acc + (r.stages?.harvested_ha || 0), 0),
  };

  // Inputs Aggregation
  const ureaNeed = filteredRecords.reduce((acc, r) => acc + (r.inputs?.urea_need_qt || 0), 0);
  const ureaUsed = filteredRecords.reduce((acc, r) => acc + (r.inputs?.urea_used_qt || 0), 0);
  const npsNeed = filteredRecords.reduce((acc, r) => acc + (r.inputs?.nps_need_qt || 0), 0);
  const npsUsed = filteredRecords.reduce((acc, r) => acc + (r.inputs?.nps_used_qt || 0), 0);
  const fungicideUsed = filteredRecords.reduce((acc, r) => acc + (r.inputs?.fungicide_used_l || 0), 0);

  // Rust Outbreak alerts
  const rustAlerts = filteredRecords.filter((r) => r.challenges?.pest_rust_outbreak);

  // Zones list
  const availableZones = ['all', ...Array.from(new Set(records.map((r) => r.zone)))];

  return (
    <div className="space-y-6">
      {/* Top Controls & Regional Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Oromia Regional Government
            </span>
            <span className="text-xs text-slate-500 font-medium">Weekly Irrigation Cycle 2026/27</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Irrigated Wheat Field Monitoring Command Dashboard</h2>
          <p className="text-xs text-slate-600">
            Real-time telemetry aggregated from offline-capable KoboToolbox mobile submissions across lowland & highland clusters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Zone Filter */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-slate-500 font-medium">Zone:</span>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-white text-slate-800">
                All Oromia Zones ({records.length} kebeles)
              </option>
              {availableZones
                .filter((z) => z !== 'all')
                .map((zone) => (
                  <option key={zone} value={zone} className="bg-white text-slate-800">
                    {zone} Zone
                  </option>
                ))}
            </select>
          </div>

          {onOpenFertilizer && (
            <button
              onClick={onOpenFertilizer}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Package className="w-3.5 h-3.5 text-emerald-600" />
              <span>Fertilizer Dashboard</span>
            </button>
          )}

          {onOpenModules && (
            <button
              onClick={onOpenModules}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <span>14 Campaign Pillars</span>
            </button>
          )}

          <button
            onClick={onOpenSurvey}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Field Survey</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Area Sown */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Cumulative Area Sown</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{formatNumber(totalSownHa)}</span>
            <span className="text-xs text-slate-500">/ {formatNumber(totalPlannedHa)} ha</span>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-emerald-700 font-semibold">{sowingAchievementPct}% Sown</span>
              <span className="text-slate-500">{formatNumber(Math.max(0, totalPlannedHa - totalSownHa))} ha gap</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
              <div
                className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Number(sowingAchievementPct))}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Card 2: Beneficiary Farmers */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Beneficiary Farmers</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{formatNumber(totalBeneficiaries)}</span>
            <span className="text-xs text-slate-500">households</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <span className="flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              <span>Male: {formatNumber(maleBeneficiaries)}</span>
            </span>
            <span className="flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-pink-500"></span>
              <span>Female: {formatNumber(femaleBeneficiaries)} ({femaleRatio}%)</span>
            </span>
          </div>
        </div>

        {/* Card 3: Pump & Water Security */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Irrigation Pump Health</span>
            <Droplets className="w-4 h-4 text-sky-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{pumpFunctionalPct}%</span>
            <span className="text-xs text-slate-500">
              ({functionalPumps}/{totalPumps} functional)
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px]">
            <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-medium">
              {functionalPumps} Active
            </span>
            <span className="px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded font-medium">
              {underMaintPumps} Maint.
            </span>
            <span className="px-1.5 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded font-medium">
              {brokenPumps} Down
            </span>
          </div>
        </div>

        {/* Card 4: Estimated Wheat Yield */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Forecast Production</span>
            <Sprout className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{formatNumber(totalEstimatedProdQt)}</span>
            <span className="text-xs text-slate-500">quintals</span>
          </div>
          <div className="mt-3 text-xs text-slate-600 flex items-center justify-between">
            <span>Average Plan Yield:</span>
            <span className="font-semibold text-amber-700">~43.5 qt/ha</span>
          </div>
        </div>
      </div>

      {/* Rust Alerts Banner if any */}
      {rustAlerts.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start justify-between gap-3 text-rose-900 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-rose-100 border border-rose-200 text-rose-600">
              <ShieldAlert className="w-5 h-5 text-rose-600 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-950">Wheat Rust Surveillance Alert in {rustAlerts.length} Kebele(s)</h4>
              <p className="text-xs text-rose-800 mt-0.5">
                Elevated rust risk flagged in:{' '}
                {rustAlerts.map((r) => `${r.woreda} (${r.kebele})`).join(', ')}. Prophylactic fungicide spraying and
                knapsack sprayer mobilization active.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-xs font-bold bg-rose-600 text-white rounded-md shadow-sm whitespace-nowrap">
            Action Mobilized
          </span>
        </div>
      )}

      {/* Row 2: Crop Growth Stages & Weekly Sowing Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Stages Pipeline (2 columns) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>🌾 Wheat Phenological Growth Stages</span>
                <span className="text-[11px] font-normal text-slate-500">({formatHectares(totalSownHa)} total)</span>
              </h3>
              <p className="text-xs text-slate-500">Current vegetative and reproductive stage distribution</p>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 mb-5 border border-slate-200">
            <div
              style={{ width: `${(stages.emergence / (totalSownHa || 1)) * 100}%` }}
              className="bg-lime-500 transition-all"
              title={`Emergence: ${stages.emergence} ha`}
            ></div>
            <div
              style={{ width: `${(stages.tillering / (totalSownHa || 1)) * 100}%` }}
              className="bg-emerald-600 transition-all"
              title={`Tillering: ${stages.tillering} ha`}
            ></div>
            <div
              style={{ width: `${(stages.stem_elongation / (totalSownHa || 1)) * 100}%` }}
              className="bg-teal-600 transition-all"
              title={`Stem Elongation: ${stages.stem_elongation} ha`}
            ></div>
            <div
              style={{ width: `${(stages.booting / (totalSownHa || 1)) * 100}%` }}
              className="bg-cyan-600 transition-all"
              title={`Booting: ${stages.booting} ha`}
            ></div>
            <div
              style={{ width: `${(stages.heading / (totalSownHa || 1)) * 100}%` }}
              className="bg-amber-500 transition-all"
              title={`Heading / Flowering: ${stages.heading} ha`}
            ></div>
            <div
              style={{ width: `${(stages.milk_dough / (totalSownHa || 1)) * 100}%` }}
              className="bg-orange-500 transition-all"
              title={`Milk / Dough: ${stages.milk_dough} ha`}
            ></div>
          </div>

          {/* Stage Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-lime-700 font-semibold">1. Emergence</span>
              <p className="text-base font-bold text-slate-900 mt-0.5">{formatNumber(stages.emergence)} ha</p>
              <span className="text-[10px] text-slate-500">
                {((stages.emergence / (totalSownHa || 1)) * 100).toFixed(1)}% of crop
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-emerald-700 font-semibold">2. Tillering</span>
              <p className="text-base font-bold text-slate-900 mt-0.5">{formatNumber(stages.tillering)} ha</p>
              <span className="text-[10px] text-slate-500">
                {((stages.tillering / (totalSownHa || 1)) * 100).toFixed(1)}% of crop
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-teal-700 font-semibold">3. Stem Elongation</span>
              <p className="text-base font-bold text-slate-900 mt-0.5">{formatNumber(stages.stem_elongation)} ha</p>
              <span className="text-[10px] text-slate-500">
                {((stages.stem_elongation / (totalSownHa || 1)) * 100).toFixed(1)}% of crop
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-cyan-700 font-semibold">4. Booting</span>
              <p className="text-base font-bold text-slate-900 mt-0.5">{formatNumber(stages.booting)} ha</p>
              <span className="text-[10px] text-slate-500">
                {((stages.booting / (totalSownHa || 1)) * 100).toFixed(1)}% of crop
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-amber-700 font-semibold">5. Heading / Flowering</span>
              <p className="text-base font-bold text-slate-900 mt-0.5">{formatNumber(stages.heading)} ha</p>
              <span className="text-[10px] text-slate-500">
                {((stages.heading / (totalSownHa || 1)) * 100).toFixed(1)}% of crop
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-orange-700 font-semibold">6. Grain Filling</span>
              <p className="text-base font-bold text-slate-900 mt-0.5">{formatNumber(stages.milk_dough)} ha</p>
              <span className="text-[10px] text-slate-500">Upcoming phase</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-amber-800 font-semibold">7. Maturity</span>
              <p className="text-base font-bold text-slate-900 mt-0.5">{formatNumber(stages.maturity)} ha</p>
              <span className="text-[10px] text-slate-500">Harvest ready</span>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] text-emerald-800 font-semibold">8. Harvested</span>
              <p className="text-base font-bold text-slate-900 mt-0.5">{formatNumber(stages.harvested)} ha</p>
              <span className="text-[10px] text-slate-500">Threshed grain</span>
            </div>
          </div>
        </div>

        {/* Input & Fertilizer Fulfillment Card */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="text-sm font-bold text-slate-900">Fertilizer & Chemical Inputs</h3>
            {onOpenFertilizer && (
              <button
                onClick={onOpenFertilizer}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Type & Plan Breakdown &rarr;</span>
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 mb-4">Required vs Delivered vs Field Application (Disaggregated by Type)</p>

          <div className="space-y-4">
            {/* Urea */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-800 font-medium">Urea (White)</span>
                <span className="text-slate-500">
                  {formatNumber(ureaUsed)} / {formatNumber(ureaNeed)} qt
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="bg-teal-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (ureaUsed / (ureaNeed || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* NPS */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-800 font-medium">NPS (Basal)</span>
                <span className="text-slate-500">
                  {formatNumber(npsUsed)} / {formatNumber(npsNeed)} qt
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="bg-emerald-600 h-2 rounded-full"
                  style={{ width: `${Math.min(100, (npsUsed / (npsNeed || 1)) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Rust Fungicide */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-800 font-medium">Rust Fungicide (Tilt/Rex)</span>
                <span className="text-slate-500">{formatNumber(fungicideUsed)} Litres</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                <div className="bg-lime-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center justify-between text-slate-800 mb-1">
              <span className="font-medium">Knapsack Sprayers Status</span>
              <span className="text-emerald-700 font-semibold">
                {filteredRecords.reduce((acc, r) => acc + (r.inputs?.knapsack_sprayers_functional || 0), 0)} /{' '}
                {filteredRecords.reduce((acc, r) => acc + (r.inputs?.knapsack_sprayers_total || 0), 0)} functional
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Extension desks equipped with motorized and manual pressure sprayers for rapid cluster interventions.
            </p>
          </div>
        </div>
      </div>

      {/* Row 3: Irrigation Schemes & Field Cluster Performance Table */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Active Irrigation Schemes & Water Sources</h3>
            <p className="text-xs text-slate-500">River basins, dams, and deep wells serving monitored kebeles</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-full">
            {allSchemes.length} Registered Schemes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-800">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Scheme Name</th>
                <th className="py-2.5 px-3">Water Source</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3 text-right">Wheat Area</th>
                <th className="py-2.5 px-3 text-right">Beneficiaries</th>
                <th className="py-2.5 px-3 text-center">Pumps (Act / Maint / Down)</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {allSchemes.map((scheme, idx) => (
                <tr key={`${scheme.id}_${idx}`} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-slate-900">{scheme.name}</td>
                  <td className="py-2.5 px-3 text-slate-600">{scheme.source_name}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 border border-slate-200 text-slate-700 uppercase">
                      {scheme.irrigation_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-emerald-700">
                    {formatNumber(scheme.wheat_actual_ha)} ha
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-600">
                    {formatNumber(scheme.beneficiaries_m + scheme.beneficiaries_f)} HHs
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="font-mono text-[11px]">
                      <span className="text-emerald-700 font-medium">{scheme.pumps_functional}</span> /{' '}
                      <span className="text-amber-700 font-medium">{scheme.pumps_under_maintenance}</span> /{' '}
                      <span className="text-rose-700 font-medium">{scheme.pumps_broken}</span>
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    {scheme.pumps_broken > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-medium">
                        <Wrench className="w-3 h-3" />
                        <span>Repair Needed</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Optimal</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
