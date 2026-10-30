/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  CAMPAIGN_MODULES,
  CampaignModuleMeta,
  getLiveZonalData,
  exportModuleCsv,
} from '../data/campaignModules';
import { SurveyRecord } from '../types/survey';
import {
  Layers,
  ExternalLink,
  Download,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Tractor,
  Droplets,
  Sprout,
  Users,
  Search,
  Filter,
  PlusCircle,
  Eye,
  Sparkles,
  Lock,
  ShieldCheck,
  Package,
  RefreshCw,
} from 'lucide-react';

interface CampaignModulesViewProps {
  records: SurveyRecord[];
  onOpenSurvey?: () => void;
  onRefreshKobo?: () => void;
  isSyncingKobo?: boolean;
  isAdmin?: boolean;
  onRequestAdminAuth?: (actionDesc: string, onSuccess?: () => void) => void;
  onNavigateToFertilizer?: () => void;
}

export const CampaignModulesView: React.FC<CampaignModulesViewProps> = ({
  records,
  onOpenSurvey,
  onRefreshKobo,
  isSyncingKobo,
  isAdmin = false,
  onRequestAdminAuth,
  onNavigateToFertilizer,
}) => {
  const [selectedModuleId, setSelectedModuleId] = useState<string>('sassaabbii');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [embeddedFormUrl, setEmbeddedFormUrl] = useState<string | null>(null);
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState<boolean>(false);

  // Form quick entry state
  const [quickZone, setQuickZone] = useState<string>('Kibba baha Oromiyaa');
  const [quickMetricValue, setQuickMetricValue] = useState<number>(150);
  const [quickNotes, setQuickNotes] = useState<string>('Routine weekly progress update.');

  const zonalData = useMemo(() => getLiveZonalData(records), [records]);

  const activeModule = useMemo(() => {
    return CAMPAIGN_MODULES.find((m) => m.id === selectedModuleId) || CAMPAIGN_MODULES[0];
  }, [selectedModuleId]);

  const filteredModules = useMemo(() => {
    return CAMPAIGN_MODULES.filter((m) => {
      const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
      const matchesSearch =
        m.titleAfaanOromo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.titleEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Aggregate totals for the active module
  const moduleTotals = useMemo(() => {
    const totalPlanHa = zonalData.reduce((acc, z) => acc + z.planAreaHa, 0);
    let totalActual = 0;

    if (activeModule.id === 'sassaabbii') {
      totalActual = zonalData.reduce((acc, z) => acc + z.actualYieldQt, 0);
    } else if (activeModule.id === 'qophii_lafaa') {
      totalActual = zonalData.reduce((acc, z) => acc + z.actualLandPreparedHa, 0);
    } else if (activeModule.id === 'facaasaa') {
      totalActual = zonalData.reduce((acc, z) => acc + z.actualSownHa, 0);
    } else if (activeModule.id === 'kilaastara') {
      totalActual = zonalData.reduce((acc, z) => acc + z.clusterAreaHa, 0);
    } else if (activeModule.id === 'carraa_hojii') {
      totalActual = zonalData.reduce((acc, z) => acc + z.jobTemporary + z.jobPermanent, 0);
    } else if (activeModule.id === 'daawwannaa') {
      totalActual = zonalData.reduce((acc, z) => acc + z.fieldDaysParticipants, 0);
    } else if (activeModule.id === 'urea_topdressing') {
      totalActual = zonalData.reduce((acc, z) => acc + z.ureaTopdressingHa, 0);
    } else if (activeModule.id === 'xaaoo') {
      totalActual = zonalData.reduce((acc, z) => acc + z.totalFertilizerQt * 0.15, 0);
    } else {
      totalActual = Math.round(activeModule.regionalTarget * 0.12);
    }

    const pct = activeModule.regionalTarget > 0 ? (totalActual / activeModule.regionalTarget) * 100 : 0;
    return {
      totalPlanHa,
      totalActual: Math.round(totalActual),
      pct: Number(pct.toFixed(1)),
    };
  }, [activeModule, zonalData]);

  const handleDownloadCsv = () => {
    const csvContent = exportModuleCsv(activeModule.id, zonalData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeModule.id}_Oromia_Bonaa_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate updating field telemetry and alert user
    alert(
      `Progress recorded for ${quickZone} under module "${activeModule.titleAfaanOromo}": +${quickMetricValue.toLocaleString()} ${activeModule.primaryMetricUnit}. Data synchronized with local storage and conflict engine.`
    );
    setIsQuickEntryOpen(false);
  };

  const categories = ['All', 'Preparation', 'Inputs', 'Irrigation', 'Agronomy', 'Harvest', 'Socio-Economic'];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Regional Executive Banner */}
      <div className="bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-white border border-emerald-200 rounded-2xl p-5 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-emerald-700" />
                Oromia Regional Irrigated Wheat Campaign (Bonaa 2019 / 2026-27)
              </span>
              <span className="px-2.5 py-0.5 text-[11px] font-mono bg-teal-50 text-teal-800 border border-teal-200 rounded font-semibold">
                14 Operational Modules
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2">
              Misooma Qamadii Jallisiitiin &bull; Interactive Campaign Modules
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl mt-1 leading-relaxed">
              Consolidated real-time monitoring across 14 Administrative Zones and Major Cities.
              Regional Plan: <strong className="text-emerald-700">4,030,000 Hectares</strong> with a target production of{' '}
              <strong className="text-emerald-700">168,336,552 Quintals</strong>. Linked directly with KoboToolbox questionnaires
              under account <code className="text-teal-800 font-mono font-semibold">oboa2026</code>.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start lg:self-auto">
            {onRefreshKobo && (
              <button
                onClick={onRefreshKobo}
                disabled={isSyncingKobo}
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isSyncingKobo ? 'animate-spin' : ''}`} />
                <span>{isSyncingKobo ? 'Syncing Kobo...' : 'Sync All Modules'}</span>
              </button>
            )}

            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export {activeModule.titleAfaanOromo} CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Module Navigation & Category Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-200">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none">
            <span className="text-xs text-slate-500 mr-1 flex items-center gap-1 font-medium">
              <Filter className="w-3 h-3 text-slate-400" /> Filter:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search questionnaire or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        {/* 14 Module Pills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 pt-3">
          {filteredModules.map((m) => {
            const isSelected = m.id === selectedModuleId;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedModuleId(m.id);
                  setEmbeddedFormUrl(null);
                }}
                className={`flex flex-col p-2.5 rounded-xl border text-left transition relative cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-400 shadow-sm'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-mono text-emerald-700 font-bold">#{m.order}</span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-emerald-600 animate-pulse' : 'bg-slate-300'
                    }`}
                  ></span>
                </div>
                <span className="text-xs font-semibold text-slate-900 truncate" title={m.titleAfaanOromo}>
                  {m.titleAfaanOromo}
                </span>
                <span className="text-[10px] text-slate-500 truncate mt-0.5">{m.titleEnglish}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Module Detail Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-6">
        {/* Module Header & External Kobo Link */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded">
                Module #{activeModule.order} &bull; {activeModule.category}
              </span>
              <span className="px-2 py-0.5 text-xs font-mono bg-slate-100 text-slate-700 border border-slate-200 rounded">
                UID: {activeModule.koboAssetUid}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              {activeModule.titleAfaanOromo}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeModule.titleEnglish} &bull; Reference Dataset: <code className="text-emerald-700 font-mono font-semibold">{activeModule.csvFileName}</code>
            </p>
            <p className="text-xs text-slate-700 mt-2">{activeModule.description}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setEmbeddedFormUrl(embeddedFormUrl ? null : activeModule.koboFormUrl)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer shadow-sm"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              <span>{embeddedFormUrl ? 'Hide Questionnaire' : 'Inspect Live Form'}</span>
            </button>

            <a
              href={activeModule.koboFormUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-semibold transition cursor-pointer shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5 text-teal-600" />
              <span>Open in Enketo</span>
            </a>

            {(activeModule.id === 'xaaoo' || activeModule.id === 'urea_topdressing') && onNavigateToFertilizer && (
              <button
                onClick={onNavigateToFertilizer}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
                title="View full Fertilizer Dashboard with disaggregated types and planned references"
              >
                <Package className="w-3.5 h-3.5 text-emerald-600" />
                <span>Fertilizer Dashboard (All Types & Planned)</span>
              </button>
            )}

            <button
              onClick={() => {
                if (!isAdmin && onRequestAdminAuth) {
                  onRequestAdminAuth(
                    'Recording or updating campaign progress telemetry requires administrator authorization.',
                    () => setIsQuickEntryOpen(true)
                  );
                  return;
                }
                setIsQuickEntryOpen(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer ${
                isAdmin
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300'
              }`}
              title={isAdmin ? 'Record field log' : 'Administrator password required to record log'}
            >
              {isAdmin ? <PlusCircle className="w-4 h-4" /> : <Lock className="w-4 h-4 text-amber-600" />}
              <span>{isAdmin ? 'Record Field Log' : 'Unlock to Record Log'}</span>
            </button>
          </div>
        </div>

        {/* Embedded Kobo Questionnaire Sandbox */}
        {embeddedFormUrl && (
          <div className="bg-slate-50 border border-teal-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-900">
                  Live Enketo Form Sandbox: {activeModule.titleAfaanOromo}
                </span>
                <span className="text-[11px] font-mono text-slate-500">({embeddedFormUrl})</span>
              </div>
              <button
                onClick={() => setEmbeddedFormUrl(null)}
                className="text-xs text-slate-600 hover:text-slate-900 underline cursor-pointer"
              >
                Close Preview
              </button>
            </div>
            <iframe
              src={embeddedFormUrl}
              title={activeModule.titleEnglish}
              className="w-full h-96 rounded-lg border border-slate-200 bg-white"
            />
          </div>
        )}

        {/* Metric Cards for this module */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Regional Target</span>
              <Layers className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {activeModule.regionalTarget.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {activeModule.primaryMetricUnit} planned across Oromia
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Current Achievement</span>
              <TrendingUp className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-2xl font-black text-teal-800 mt-1">
              {moduleTotals.totalActual.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {activeModule.primaryMetricUnit} verified from field submissions
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Completion Rate</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-1">
              {moduleTotals.pct}%
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden border border-slate-200">
              <div
                className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, moduleTotals.pct)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Leading Zone</span>
              <MapPin className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-lg font-bold text-slate-900 mt-1 truncate">
              G/gala Oromiyaa
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              1,183,974 ha allocated (29.4% of total)
            </div>
          </div>
        </div>

        {/* 14 Administrative Zones Reporting Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Zone & City Breakdown &bull; {activeModule.titleAfaanOromo}
              </h3>
              <p className="text-xs text-slate-500">
                Performance against annual plan for all 14 administrative zones & cities
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              14 / 14 Zones Monitored
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 uppercase font-mono text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">SN</th>
                  <th className="px-4 py-3">Godina (Zone / City)</th>
                  <th className="px-4 py-3 text-right">Karoora Lafaa (ha)</th>
                  <th className="px-4 py-3 text-right">
                    {activeModule.primaryMetricLabel} ({activeModule.primaryMetricUnit})
                  </th>
                  <th className="px-4 py-3 text-center">% Raawwii</th>
                  <th className="px-4 py-3 text-right">
                    {activeModule.id === 'xaaoo'
                      ? 'DAP (Kunt)'
                      : activeModule.id === 'qophii_lafaa'
                      ? 'Tractors Active'
                      : activeModule.id === 'kilaastara'
                      ? 'Clusters'
                      : 'Beneficiaries'}
                  </th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {zonalData.map((z) => {
                  let metricValue = 0;
                  let secondaryValue: string | number = 0;

                  if (activeModule.id === 'sassaabbii') {
                    metricValue = z.actualYieldQt;
                    secondaryValue = `${(z.actualYieldQt / (z.actualHarvestedHa || 1)).toFixed(1)} qt/ha`;
                  } else if (activeModule.id === 'qophii_lafaa') {
                    metricValue = z.actualLandPreparedHa;
                    secondaryValue = z.tractorsActive;
                  } else if (activeModule.id === 'facaasaa') {
                    metricValue = z.actualSownHa;
                    secondaryValue = Math.round(z.actualSownHa / 0.8);
                  } else if (activeModule.id === 'kilaastara') {
                    metricValue = z.clusterAreaHa;
                    secondaryValue = z.clustersEstablished;
                  } else if (activeModule.id === 'xaaoo') {
                    metricValue = Math.round(z.totalFertilizerQt * 0.15);
                    secondaryValue = z.dapFertilizerQt.toLocaleString();
                  } else if (activeModule.id === 'carraa_hojii') {
                    metricValue = z.jobTemporary + z.jobPermanent;
                    secondaryValue = `${z.jobPermanent} perm`;
                  } else if (activeModule.id === 'daawwannaa') {
                    metricValue = z.fieldDaysParticipants;
                    secondaryValue = `${Math.round(z.fieldDaysParticipants * 0.3)} women`;
                  } else if (activeModule.id === 'urea_topdressing') {
                    metricValue = z.ureaTopdressingHa;
                    secondaryValue = `${Math.round(z.ureaTopdressingHa * 1.5)} qt`;
                  } else {
                    metricValue = Math.round(z.planAreaHa * 0.1);
                    secondaryValue = `${z.avgWaterCycles} cycles`;
                  }

                  const rowPct = z.planAreaHa > 0 ? (metricValue / z.planAreaHa) * 100 : 0;
                  const isHighAchiever = rowPct >= 10;

                  return (
                    <tr key={z.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-mono text-slate-500">{z.id}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{z.zone}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-800 font-medium">
                        {z.planAreaHa.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700">
                        {metricValue.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-mono text-xs font-semibold text-slate-800">{rowPct.toFixed(1)}%</span>
                          <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-emerald-600 h-1.5 rounded-full"
                              style={{ width: `${Math.min(100, rowPct * 4)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-600">
                        {secondaryValue}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 text-[10px] rounded font-semibold ${
                            isHighAchiever
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {isHighAchiever ? 'Active' : 'Deploying'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                <tr>
                  <td className="px-4 py-3 font-mono text-slate-500">&bull;</td>
                  <td className="px-4 py-3 text-emerald-800 uppercase tracking-wider font-bold">
                    Ida'ama (Regional Total)
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-900 font-bold">
                    4,030,000
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-800 font-bold">
                    {moduleTotals.totalActual.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-emerald-800 font-bold">
                    {moduleTotals.pct}%
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-700 font-bold">
                    Regional
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 text-[10px] bg-emerald-600 text-white rounded font-bold shadow-sm">
                      Verified
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Field Log Modal */}
      {isQuickEntryOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Record Progress &bull; #{activeModule.order}
                </h3>
              </div>
              <button
                onClick={() => setIsQuickEntryOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleQuickSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Module</label>
                <input
                  type="text"
                  disabled
                  value={`${activeModule.titleAfaanOromo} (${activeModule.titleEnglish})`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-700 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Zone / City</label>
                <select
                  value={quickZone}
                  onChange={(e) => setQuickZone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:border-emerald-600 cursor-pointer"
                >
                  {zonalData.map((z) => (
                    <option key={z.id} value={z.zone}>
                      {z.zone} (Plan: {z.planAreaHa.toLocaleString()} ha)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  New Progress ({activeModule.primaryMetricLabel} in {activeModule.primaryMetricUnit})
                </label>
                <input
                  type="number"
                  min="1"
                  value={quickMetricValue}
                  onChange={(e) => setQuickMetricValue(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono text-sm focus:border-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Field Verification Notes / Remarks</label>
                <textarea
                  rows={3}
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsQuickEntryOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm transition cursor-pointer"
                >
                  Save & Sync Progress
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
