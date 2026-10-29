import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  MapPin,
  X,
  Printer,
  Cloud,
  CloudCheck,
  RefreshCw,
  ExternalLink,
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import { SurveyRecord } from '../types/survey';
import { formatNumber, exportToCsv, exportToGeoJson } from '../utils/formatters';
import { syncEngine } from '../services/syncEngine';

interface SubmissionsViewProps {
  records: SurveyRecord[];
  onSyncKobo?: () => Promise<void>;
  isSyncingKobo?: boolean;
}

export const SubmissionsView: React.FC<SubmissionsViewProps> = ({
  records,
  onSyncKobo,
  isSyncingKobo = false,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterZone, setFilterZone] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<SurveyRecord | null>(null);
  const [xmlModalRecord, setXmlModalRecord] = useState<SurveyRecord | null>(null);
  const [manualSyncMessage, setManualSyncMessage] = useState<string | null>(null);
  const [syncingRecordId, setSyncingRecordId] = useState<string | null>(null);

  // Filter records
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.kebele.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.woreda.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.enumerator_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesZone = filterZone === 'all' || r.zone === filterZone;
    const matchesStatus = filterStatus === 'all' || r.syncStatus === filterStatus;

    const isKoboCloud = r.id.startsWith('kobo_') || r.clientDeviceId === 'kobotoolbox-server' || r.clientDeviceId === 'kobotoolbox-webform';
    const matchesSource =
      filterSource === 'all' ||
      (filterSource === 'kobo_cloud' && isKoboCloud) ||
      (filterSource === 'field_device' && !isKoboCloud);

    return matchesSearch && matchesZone && matchesStatus && matchesSource;
  });

  const zones = ['all', ...Array.from(new Set(records.map((r) => r.zone)))];

  const handleSyncWithKobo = async () => {
    if (onSyncKobo) {
      await onSyncKobo();
    } else {
      await syncEngine.pullFromKoboCloud();
      await syncEngine.syncPendingSubmissions();
    }
    setManualSyncMessage('Submissions Hub successfully synchronized with KoboToolbox cloud server (user: oboa2026)!');
    setTimeout(() => setManualSyncMessage(null), 5000);
  };

  const handleSyncSingleRecord = async (rec: SurveyRecord) => {
    setSyncingRecordId(rec.id);
    try {
      await syncEngine.syncPendingSubmissions();
    } finally {
      setSyncingRecordId(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const koboCloudCount = records.filter(
    (r) => r.id.startsWith('kobo_') || r.clientDeviceId === 'kobotoolbox-server' || r.clientDeviceId === 'kobotoolbox-webform'
  ).length;

  const pendingCount = records.filter((r) => r.syncStatus === 'pending_sync' || r.syncStatus === 'syncing').length;

  return (
    <div className="space-y-4">
      {/* Kobo Cloud Sync Status Banner */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-sky-950 text-sky-400 border border-sky-800 shrink-0">
            <Cloud className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">KoboToolbox Cloud Submissions Hub</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                User: oboa2026
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                Asset: ayqceYfs6Dxi567kBEi7AZ
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Target Form: <strong>Irrigated Wheat Weekly Monitoring - Oromia</strong> (ee.kobotoolbox.org/x/9OBwKKRd).
              Real-time synchronization between remote mobile field scouts and KoboToolbox cloud repository.
            </p>
          </div>
        </div>

        {/* Sync Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSyncWithKobo}
            disabled={isSyncingKobo}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            title="Pull latest submissions from KoboToolbox server and push pending records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingKobo ? 'animate-spin' : ''}`} />
            <span>{isSyncingKobo ? 'Syncing Kobo...' : 'Sync with Kobo Server'}</span>
          </button>
        </div>
      </div>

      {manualSyncMessage && (
        <div className="p-3 bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{manualSyncMessage}</span>
          </div>
          <button onClick={() => setManualSyncMessage(null)} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
          <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Total Submissions</span>
          <span className="text-lg font-black text-white">{records.length}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
          <span className="text-sky-400 block text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
            <Cloud className="w-3 h-3" />
            <span>Kobo Cloud Verified</span>
          </span>
          <span className="text-lg font-black text-sky-400">{koboCloudCount} verified</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
          <span className="text-amber-400 block text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Queued Offline</span>
          </span>
          <span className="text-lg font-black text-amber-400">{pendingCount} pending</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg">
          <span className="text-purple-400 block text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Conflict Resolved</span>
          </span>
          <span className="text-lg font-black text-purple-400">
            {records.filter((r) => r.syncStatus === 'conflict_resolved').length} records
          </span>
        </div>
      </div>

      {/* Search and Action Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search kebele, woreda, data collector / reporter, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Source Filter */}
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="all">All Sources</option>
            <option value="kobo_cloud">☁️ Kobo Cloud (oboa2026)</option>
            <option value="field_device">📱 Field Device Submissions</option>
          </select>

          {/* Zone Filter */}
          <select
            value={filterZone}
            onChange={(e) => setFilterZone(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="all">All Zones</option>
            {zones
              .filter((z) => z !== 'all')
              .map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="all">All Sync Statuses</option>
            <option value="synced">Synced</option>
            <option value="conflict_resolved">Conflict Resolved</option>
            <option value="pending_sync">Pending Sync</option>
          </select>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToCsv(filteredRecords)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
            title="Export filtered records to CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => exportToGeoJson(filteredRecords)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
            title="Export spatial geometries to GeoJSON"
          >
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span>GeoJSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg cursor-pointer"
            title="Print report"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-3">Kebele & Woreda</th>
                <th className="py-3 px-3">Origin / Source</th>
                <th className="py-3 px-3">Week</th>
                <th className="py-3 px-3">Name of data collector / reporter</th>
                <th className="py-3 px-3 text-right">Plan (ha)</th>
                <th className="py-3 px-3 text-right">Sown (ha)</th>
                <th className="py-3 px-3 text-right">Ach %</th>
                <th className="py-3 px-3 text-center">Schemes</th>
                <th className="py-3 px-3">Sync Status</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredRecords.map((r) => {
                const isKoboCloud =
                  r.id.startsWith('kobo_') ||
                  r.clientDeviceId === 'kobotoolbox-server' ||
                  r.clientDeviceId === 'kobotoolbox-webform';

                return (
                  <tr
                    key={r.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isKoboCloud ? 'bg-sky-950/20' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white block">{r.kebele}</span>
                        {isKoboCloud && (
                          <span
                            className="px-1.5 py-0.2 text-[9px] font-bold bg-sky-900 text-sky-200 border border-sky-700 rounded"
                            title="Directly verified on KoboToolbox server for account oboa2026"
                          >
                            Cloud
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {r.woreda}, {r.zone}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      {isKoboCloud ? (
                        <div className="flex items-center gap-1 text-sky-400">
                          <Cloud className="w-3.5 h-3.5 shrink-0" />
                          <span className="font-mono text-[10px]">Kobo Cloud</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-slate-400">
                          <Smartphone className="w-3.5 h-3.5 shrink-0" />
                          <span className="text-[10px]">Field Device</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono font-medium">W{r.report_week}</td>
                    <td className="py-3 px-3">
                      <span className="text-white block">{r.enumerator_name}</span>
                      <span className="text-[10px] text-slate-400">{r.enumerator_role}</span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400">{formatNumber(r.plan_area_ha)}</td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-400">{formatNumber(r.area_sown_cum_ha)}</td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`font-semibold ${
                          r.ach_sown_pct >= 90
                            ? 'text-emerald-400'
                            : r.ach_sown_pct >= 75
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {r.ach_sown_pct}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-mono text-[11px]">
                        {r.schemes.length}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize flex items-center gap-1 ${
                            r.syncStatus === 'synced'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : r.syncStatus === 'conflict_resolved'
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                          }`}
                        >
                          {r.syncStatus === 'synced' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                          <span>{r.syncStatus.replace('_', ' ')}</span>
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {r.syncStatus === 'pending_sync' && (
                          <button
                            onClick={() => handleSyncSingleRecord(r)}
                            disabled={syncingRecordId === r.id}
                            className="p-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white cursor-pointer"
                            title="Transmit pending submission to Kobo now"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${syncingRecordId === r.id ? 'animate-spin' : ''}`} />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedRecord(r)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                          title="View details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setXmlModalRecord(r)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 cursor-pointer"
                          title="View OpenRosa XML"
                        >
                          <FileCode className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-xl p-5 shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase">
                    Record ID: {selectedRecord.id}
                  </span>
                  {(selectedRecord.id.startsWith('kobo_') || selectedRecord.clientDeviceId === 'kobotoolbox-server') && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-sky-950 text-sky-300 border border-sky-800">
                      ☁️ Synced from Kobo Cloud (oboa2026)
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {selectedRecord.kebele}, {selectedRecord.woreda} ({selectedRecord.zone})
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-800/60 p-3 rounded-lg border border-slate-700/60">
              <div>
                <span className="text-slate-400 block text-[10px]">Report Date</span>
                <span className="font-semibold text-white">{selectedRecord.report_date}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Week & Phase</span>
                <span className="font-semibold text-white">Week {selectedRecord.report_week}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Planned Area</span>
                <span className="font-semibold text-white">{formatNumber(selectedRecord.plan_area_ha)} ha</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Cumulative Sown</span>
                <span className="font-semibold text-emerald-400">{formatNumber(selectedRecord.area_sown_cum_ha)} ha</span>
              </div>
            </div>

            {/* 0. Reporting information */}
            <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                0. Reporting information
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[10px]">Name of data collector / reporter:</span>
                  <span className="font-bold text-white text-xs">{selectedRecord.enumerator_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Phone number of reporter:</span>
                  <span className="font-mono text-white">{selectedRecord.enumerator_phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Position of reporter:</span>
                  <span className="text-white">{selectedRecord.enumerator_role}</span>
                </div>
              </div>
            </div>

            {/* Schemes in this kebele */}
            <div>
              <h4 className="font-bold text-white mb-2 text-xs">Irrigation Schemes ({selectedRecord.schemes.length})</h4>
              <div className="space-y-2">
                {selectedRecord.schemes.map((s, sIdx) => (
                  <div key={`${s.id || 'sch'}_${sIdx}`} className="bg-slate-800/40 p-2.5 rounded border border-slate-700/60 flex justify-between">
                    <div>
                      <span className="font-bold text-white block">{s.name}</span>
                      <span className="text-[11px] text-slate-400">
                        {s.source_name} ({s.source_type}) &bull; {s.wheat_actual_ha} ha
                      </span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-emerald-400 font-bold">{s.pumps_functional} Act</span> /{' '}
                      <span className="text-amber-400">{s.pumps_under_maintenance} Maint</span> /{' '}
                      <span className="text-rose-400">{s.pumps_broken} Down</span>
                      <span className="block text-[10px] text-slate-500 font-normal">Total: {s.pumps_total} pumps</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Farmlands */}
            {selectedRecord.farmlands && selectedRecord.farmlands.length > 0 && (
              <div>
                <h4 className="font-bold text-white mb-2 text-xs">Farmland GPS Plots ({selectedRecord.farmlands.length})</h4>
                <div className="space-y-1.5">
                  {selectedRecord.farmlands.map((f, fIdx) => (
                    <div key={`${f.id || 'plot'}_${fIdx}`} className="bg-slate-800/40 p-2 rounded border border-slate-700/60 flex justify-between">
                      <div>
                        <span className="font-semibold text-white">{f.farmer_name}</span> ({f.plot_code})
                        <span className="block text-[10px] text-slate-400">
                          Variety: {f.variety} &bull; Area: {f.area_ha} ha &bull; GPS: {f.gps_lat.toFixed(4)}, {f.gps_lng.toFixed(4)}
                        </span>
                      </div>
                      <div className="text-right font-semibold text-emerald-400">
                        {f.expected_yield_qt_ha} qt/ha
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inputs & Challenges */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs">Chemicals & Fertilizer Applied</h4>
              <div className="grid grid-cols-3 gap-2 bg-slate-800/40 p-2.5 rounded border border-slate-700/60">
                <div>
                  <span className="text-slate-400 block text-[10px]">Urea:</span>
                  <span className="font-bold text-white">{selectedRecord.inputs.urea_used_qt} qt</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">NPS:</span>
                  <span className="font-bold text-white">{selectedRecord.inputs.nps_used_qt} qt</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Rust Fungicide:</span>
                  <span className="font-bold text-purple-400">{selectedRecord.inputs.fungicide_used_l} L</span>
                </div>
              </div>
            </div>

            {selectedRecord.challenges.remarks && (
              <div className="bg-slate-800/60 p-2.5 rounded border border-slate-700/60 text-slate-300">
                <span className="font-bold text-slate-400 block text-[10px]">Field Remarks:</span>
                <p className="mt-0.5">{selectedRecord.challenges.remarks}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* XML Code Modal */}
      {xmlModalRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 max-w-2xl w-full max-h-[85vh] flex flex-col rounded-xl p-5 shadow-2xl text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-sky-400" />
                  <span>KoboToolbox OpenRosa XML Payload</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Target Endpoint: <code>https://ee.kobotoolbox.org/submission/ayqceYfs6Dxi567kBEi7AZ</code>
                </p>
              </div>
              <button
                onClick={() => setXmlModalRecord(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <pre className="flex-1 bg-slate-950 p-3 rounded-lg overflow-x-auto text-[11px] font-mono text-emerald-400 border border-slate-800">
              {syncEngine.generateOpenRosaXml(xmlModalRecord)}
            </pre>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  const xml = syncEngine.generateOpenRosaXml(xmlModalRecord);
                  navigator.clipboard.writeText(xml);
                  alert('OpenRosa XML copied to clipboard!');
                }}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-semibold cursor-pointer"
              >
                Copy XML
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
