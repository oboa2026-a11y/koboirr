import React, { useState } from 'react';
import {
  GitMerge,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Server,
  Smartphone,
  Sparkles,
  Layers,
  FileText,
} from 'lucide-react';
import { SurveyRecord, ConflictDetail, SyncStats } from '../types/survey';
import { syncEngine } from '../services/syncEngine';

interface SyncConflictViewProps {
  records: SurveyRecord[];
  syncStats: SyncStats;
  onRefresh: () => void;
}

export const SyncConflictView: React.FC<SyncConflictViewProps> = ({ records, syncStats, onRefresh }) => {
  const [isSimulatingConflict, setIsSimulatingConflict] = useState<boolean>(false);
  const [selectedConflict, setSelectedConflict] = useState<ConflictDetail | null>(null);

  // Extract all conflicts from records
  const allConflicts: ConflictDetail[] = records.flatMap((r) => r.conflicts || []);

  // Filter records by sync status
  const pendingRecords = records.filter((r) => r.syncStatus === 'pending_sync' || r.syncStatus === 'syncing');
  const conflictResolvedRecords = records.filter((r) => r.syncStatus === 'conflict_resolved');
  const syncedRecords = records.filter((r) => r.syncStatus === 'synced');

  // Interactive Conflict Collision Simulation
  const handleSimulateConflict = async () => {
    setIsSimulatingConflict(true);

    try {
      // Find an existing synced record or use default Bora kebele
      const baseRecord = records.find((r) => r.kebele === 'Malima Boro') || records[0];

      // Create an offline submission for the exact same kebele and week with conflicting data
      const conflictingSubmission: Partial<SurveyRecord> = {
        kebele: baseRecord.kebele,
        woreda: baseRecord.woreda,
        zone: baseRecord.zone,
        report_week: baseRecord.report_week,
        report_year: baseRecord.report_year,
        enumerator_name: 'Driba Gemechu (Field Scout B)',
        enumerator_role: 'Mobile Extension Scout',
        area_sown_cum_ha: baseRecord.area_sown_cum_ha + 45, // higher progress reported offline
        land_prepared_cum_ha: baseRecord.land_prepared_cum_ha + 30,
        hh_part_total: baseRecord.hh_part_total + 25,
        createdOffline: true,
        schemes: baseRecord.schemes.map((s, idx) => ({
          ...s,
          id: `${s.id}_sim_${Date.now()}_${idx}`,
          pumps_broken: Math.max(0, s.pumps_broken - 1),
          pumps_functional: s.pumps_functional + 1,
          pumps_maintained_cumulative: s.pumps_maintained_cumulative + 1,
        })),
        inputs: {
          ...baseRecord.inputs,
          urea_used_qt: baseRecord.inputs.urea_used_qt + 50,
          fungicide_used_l: baseRecord.inputs.fungicide_used_l + 40,
        },
        challenges: {
          ...baseRecord.challenges,
          remarks: 'Offline scout verified 45 additional hectares sown on North canal perimeter.',
        },
      };

      // Submit while setting status
      await syncEngine.submitSurvey(conflictingSubmission);

      // Trigger sync which will detect collision and resolve!
      await syncEngine.syncPendingSubmissions();
      onRefresh();
    } catch (err: any) {
      alert(`Simulation failed: ${err.message}`);
    } finally {
      setIsSimulatingConflict(false);
    }
  };

  const handleForceSyncAll = async () => {
    await syncEngine.syncPendingSubmissions();
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Telemetry */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Multi-Tier Sync Engine
              </span>
              <span className="text-xs text-slate-500 font-medium">OpenRosa &bull; Offline-First Architecture</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">Synchronization & Automated Conflict Resolution</h2>
            <p className="text-xs text-slate-600">
              Guarantees zero field data loss in remote areas without cellular connectivity through monotonic accumulator
              protection and 3-way field-level merges.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSimulateConflict}
              disabled={isSimulatingConflict}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              title="Test how the engine resolves simultaneous online/offline edits for the same kebele"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isSimulatingConflict ? 'Simulating...' : 'Simulate Field Conflict'}</span>
            </button>

            <button
              onClick={handleForceSyncAll}
              disabled={syncStats.isSyncing || !syncStats.isOnline}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncStats.isSyncing ? 'animate-spin' : ''}`} />
              <span>{syncStats.isSyncing ? 'Syncing...' : 'Force Sync All'}</span>
            </button>
          </div>
        </div>

        {/* Sync Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-200">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 block mb-1 font-medium">Queue Status</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-amber-700">{syncStats.pending}</span>
              <span className="text-[11px] text-slate-500">pending</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 block mb-1 font-medium">Synced to Server</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-emerald-700">{syncStats.synced}</span>
              <span className="text-[11px] text-slate-500">verified</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 block mb-1 font-medium">Auto-Resolved Conflicts</span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-purple-700">{allConflicts.length}</span>
              <span className="text-[11px] text-slate-500">discrepancies</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 block mb-1 font-medium">Last Transmission</span>
            <div className="text-xs font-bold text-slate-900 truncate">
              {syncStats.lastSyncTime ? new Date(syncStats.lastSyncTime).toLocaleTimeString() : 'Awaiting sync'}
            </div>
          </div>
        </div>
      </div>

      {/* Conflict Resolution Audit Log & Principles */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Automated Conflict Resolution Audit Stream</span>
            </h3>
            <p className="text-xs text-slate-500">
              Inspect granular decisions made by the automated reconciliation algorithms
            </p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
            {allConflicts.length} Auto-Resolved Items
          </span>
        </div>

        {/* Resolution Strategy Guidelines */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>1. Monotonic Progress Rule</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Cumulative hectares sown, land prepared, and seed applied monotonically increase. Older or stale offline
              submissions can never overwrite higher verified field achievement.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-sky-800">
              <span className="w-2 h-2 rounded-full bg-sky-600"></span>
              <span>2. Field Ground-Truth Rule</span>
            </div>
            <p className="text-[11px] text-slate-600">
              On-site equipment condition audits (e.g. technician verified pump repairs or breakdown) take precedence based
              on verified physical inspection timestamps.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-purple-800">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              <span>3. 3-Way Non-Destructive Merge</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Distinct field updates (e.g., Enumerator A logged fertilizer, Enumerator B updated pump repair) are merged
              cleanly with audit trail preserved.
            </p>
          </div>
        </div>

        {/* Conflict Items Table / Cards */}
        {allConflicts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-300 rounded-xl bg-slate-50">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-900">No active conflicts detected.</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Click &quot;Simulate Field Conflict&quot; above to simulate concurrent offline submissions and see how the
              engine resolves them in real-time.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {allConflicts.map((conf) => (
              <div
                key={conf.id}
                onClick={() => setSelectedConflict(conf)}
                className={`p-3.5 rounded-xl border text-xs transition-colors cursor-pointer ${
                  selectedConflict?.id === conf.id
                    ? 'bg-purple-50/70 border-purple-400'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">{conf.fieldLabel}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-white text-slate-700 border border-slate-200">
                      {conf.field}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      conf.strategyUsed === 'monotonic_max'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : conf.strategyUsed === 'last_write_wins'
                        ? 'bg-sky-50 text-sky-800 border border-sky-200'
                        : 'bg-purple-50 text-purple-800 border border-purple-200'
                    }`}
                  >
                    Strategy: {conf.strategyUsed.replace('_', ' ')}
                  </span>
                </div>

                {/* Values Diff */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-white p-2.5 rounded-lg border border-slate-200 font-mono text-[11px]">
                  <div className="text-slate-600">
                    <span className="text-[10px] uppercase text-slate-500 block font-sans font-semibold">Existing Server Value:</span>
                    <span className="text-rose-700 font-bold">{String(conf.serverValue)}</span>
                  </div>

                  <div className="text-slate-600">
                    <span className="text-[10px] uppercase text-slate-500 block font-sans font-semibold">Offline Client Value:</span>
                    <span className="text-amber-700 font-bold">{String(conf.clientValue)}</span>
                  </div>

                  <div className="text-emerald-800 font-bold">
                    <span className="text-[10px] uppercase text-emerald-700 block font-sans font-semibold">Resolved Value:</span>
                    <span className="text-emerald-700">{String(conf.resolvedValue)}</span>
                  </div>
                </div>

                {/* Reason Explanation */}
                <p className="text-[11px] text-slate-600 mt-2 flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{conf.reason}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sync Queue Manager */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Local Queue Submissions Inspector</h3>
        <p className="text-xs text-slate-500 mb-4">
          All submissions stored inside browser device storage awaiting sync or verified by server
        </p>

        <div className="space-y-2">
          {records.map((rec) => (
            <div
              key={rec.id}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">
                    {rec.kebele}, {rec.woreda} ({rec.zone})
                  </span>
                  <span className="text-slate-500 text-[11px]">&bull; Week {rec.report_week}</span>
                </div>
                <div className="text-[11px] text-slate-600">
                  Data Collector: {rec.enumerator_name} &bull; Sown: {rec.area_sown_cum_ha} ha ({rec.ach_sown_pct}%) &bull;{' '}
                  {rec.schemes.length} schemes
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold capitalize ${
                    rec.syncStatus === 'synced'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : rec.syncStatus === 'conflict_resolved'
                      ? 'bg-purple-50 text-purple-800 border border-purple-200'
                      : rec.syncStatus === 'pending_sync'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {rec.syncStatus.replace('_', ' ')}
                </span>

                <span className="text-[11px] text-slate-500 font-mono">
                  {rec.syncedAt ? new Date(rec.syncedAt).toLocaleTimeString() : 'In Queue'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
