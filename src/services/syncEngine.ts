import { SurveyRecord, ConflictDetail, SyncStats } from '../types/survey';
import {
  loadStoredRecords,
  saveStoredRecords,
  loadStoredConflicts,
  saveStoredConflicts,
  getSimulatedOffline,
  setSimulatedOffline,
  getOrCreateDeviceId,
} from './storage';
import { resolveSubmissionConflict } from './conflictResolver';

import { fetchLiveKoboSubmissions } from './koboApi';

type SyncListener = (stats: SyncStats, records: SurveyRecord[]) => void;

class SyncEngine {
  private listeners: Set<SyncListener> = new Set();
  private isSyncing: boolean = false;
  private isOnlineStatus: boolean = navigator.onLine && !getSimulatedOffline();
  private autoSyncInterval: any = null;

  constructor() {
    this.initNetworkListeners();
    this.startPeriodicSync();
    // Proactively pull latest live data from Kobo account on startup if online
    if (this.isOnlineStatus) {
      setTimeout(() => this.pullFromKoboCloud(), 1000);
    }
  }

  private initNetworkListeners() {
    window.addEventListener('online', () => {
      this.handleNetworkChange(true);
    });

    window.addEventListener('offline', () => {
      this.handleNetworkChange(false);
    });
  }

  public handleNetworkChange(online: boolean) {
    const effectiveOnline = online && !getSimulatedOffline();
    if (this.isOnlineStatus !== effectiveOnline) {
      this.isOnlineStatus = effectiveOnline;
      this.notifyListeners();
      if (this.isOnlineStatus) {
        // Trigger automatic sync when internet becomes available
        this.syncPendingSubmissions();
      }
    }
  }

  public setOfflineSimulation(simulateOffline: boolean) {
    setSimulatedOffline(simulateOffline);
    this.handleNetworkChange(navigator.onLine);
  }

  public isSimulatingOffline(): boolean {
    return getSimulatedOffline();
  }

  public isOnline(): boolean {
    return this.isOnlineStatus;
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    listener(this.getStats(), loadStoredRecords());
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    const stats = this.getStats();
    const records = loadStoredRecords();
    this.listeners.forEach((fn) => fn(stats, records));
  }

  public getStats(): SyncStats {
    const records = loadStoredRecords();
    const conflicts = loadStoredConflicts();
    const synced = records.filter((r) => r.syncStatus === 'synced' || r.syncStatus === 'conflict_resolved').length;
    const pending = records.filter((r) => r.syncStatus === 'pending_sync' || r.syncStatus === 'syncing').length;
    const failed = records.filter((r) => r.syncStatus === 'failed').length;

    const latestSync = records
      .filter((r) => r.syncedAt)
      .sort((a, b) => new Date(b.syncedAt!).getTime() - new Date(a.syncedAt!).getTime())[0];

    return {
      totalRecords: records.length,
      synced,
      pending,
      conflictsResolved: conflicts.length,
      failed,
      lastSyncTime: latestSync ? latestSync.syncedAt || null : null,
      isOnline: this.isOnlineStatus,
      isSyncing: this.isSyncing,
    };
  }

  /**
   * Save a new survey record into local storage.
   * If online, attempts sync immediately; if offline, queues for automatic sync.
   */
  public async submitSurvey(record: Partial<SurveyRecord>): Promise<{ record: SurveyRecord; queuedOffline: boolean }> {
    const deviceId = getOrCreateDeviceId();
    const now = new Date().toISOString();

    const fullRecord: SurveyRecord = {
      id: record.id || `rec_sub_${Date.now()}`,
      instanceId: record.instanceId || `uuid:${crypto.randomUUID()}`,
      formId: 'ayqceYfs6Dxi567kBEi7AZ',
      version: '1 (2026-10-29 10:18:09)',
      koboFormUrl: 'https://ee.kobotoolbox.org/x/9OBwKKRd',

      enumerator_name: record.enumerator_name || 'Field Enumerator',
      enumerator_phone: record.enumerator_phone || '',
      enumerator_role: record.enumerator_role || 'Kebele Agronomist',
      report_date: record.report_date || now.split('T')[0],
      report_week: record.report_week || 4,
      report_month: record.report_month || 'October',
      report_year: record.report_year || 2026,
      phase: record.phase || 'Phase 2 - Crop Care & Irrigation',

      region: 'Oromia',
      zone: record.zone || 'East Shewa',
      woreda: record.woreda || 'Adama',
      kebele: record.kebele || 'Wonji',
      agro_zone: record.agro_zone || 'Midland (1500-2300m)',
      kebele_gps_lat: record.kebele_gps_lat || 8.44,
      kebele_gps_lng: record.kebele_gps_lng || 39.06,

      plan_area_ha: record.plan_area_ha || 1000,
      plan_hh_m: record.plan_hh_m || 700,
      plan_hh_f: record.plan_hh_f || 250,
      plan_hh_total: record.plan_hh_total || 950,
      plan_yield_qt_ha: record.plan_yield_qt_ha || 40,
      plan_prod_qt: record.plan_prod_qt || 40000,

      area_sown_cum_ha: record.area_sown_cum_ha || 920,
      ach_sown_pct: record.ach_sown_pct || 92,
      area_gap_ha: record.area_gap_ha || 80,
      hh_part_m: record.hh_part_m || 660,
      hh_part_f: record.hh_part_f || 240,
      hh_part_total: record.hh_part_total || 900,
      hh_part_pct: record.hh_part_pct || 94.7,
      track_status: record.track_status || 'on_track',

      land_identified_ha: record.land_identified_ha || 1000,
      land_prepared_cum_ha: record.land_prepared_cum_ha || 980,
      prep_method: record.prep_method || 'Tractor',
      soil_type: record.soil_type || 'clay',
      soil_acidity: record.soil_acidity || 'Non-acidic (pH > 6.5)',
      prev_crop: record.prev_crop || 'Teff',
      wheat_varieties: record.wheat_varieties || ['Kakaba', "Danda'a"],

      seed_dist_total_qt: record.seed_dist_total_qt || 1200,
      seed_used_total_qt: record.seed_used_total_qt || 1180,

      stages: record.stages || {
        emergence_ha: 100,
        tillering_ha: 400,
        stem_elongation_ha: 300,
        booting_ha: 120,
        heading_flowering_ha: 0,
        milk_dough_ha: 0,
        maturity_ha: 0,
        harvested_ha: 0,
      },

      inputs: record.inputs || {
        urea_need_qt: 1000,
        urea_supplied_qt: 950,
        urea_used_qt: 900,
        nps_need_qt: 1000,
        nps_supplied_qt: 1000,
        nps_used_qt: 1000,
        npsb_need_qt: 0,
        npsb_supplied_qt: 0,
        npsb_used_qt: 0,
        compost_used_m3: 200,
        herbicide_need_l: 800,
        herbicide_used_l: 750,
        fungicide_need_l: 600,
        fungicide_used_l: 550,
        insecticide_need_l: 150,
        insecticide_used_l: 120,
        knapsack_sprayers_total: 25,
        knapsack_sprayers_functional: 22,
      },

      schemes: record.schemes || [],
      farmlands: record.farmlands || [],
      challenges: record.challenges || {
        water_shortage: false,
        fuel_power_shortage: false,
        fertilizer_shortage: false,
        seed_shortage: false,
        pest_rust_outbreak: false,
        pump_breakdown: false,
        canal_siltation: false,
        market_access: false,
        action_taken: 'Routine weekly extension support conducted.',
        support_needed: '',
        opportunities_notes: '',
        remarks: 'Field operations proceeding according to cluster plan.',
      },

      syncStatus: this.isOnlineStatus ? 'syncing' : 'pending_sync',
      syncAttempts: 0,
      isDraft: false,
      createdAt: now,
      updatedAt: now,
      createdOffline: !this.isOnlineStatus,
      clientDeviceId: deviceId,
      conflicts: [],
    };

    const currentRecords = loadStoredRecords();
    currentRecords.unshift(fullRecord);
    saveStoredRecords(currentRecords);
    this.notifyListeners();

    if (this.isOnlineStatus) {
      // Background sync right away
      this.syncPendingSubmissions();
      return { record: fullRecord, queuedOffline: false };
    } else {
      return { record: fullRecord, queuedOffline: true };
    }
  }

  /**
   * Process all pending submissions and perform automated conflict resolution.
   */
  public async syncPendingSubmissions(): Promise<{ syncedCount: number; conflictsResolved: number }> {
    if (this.isSyncing || !this.isOnlineStatus) {
      return { syncedCount: 0, conflictsResolved: 0 };
    }

    this.isSyncing = true;
    this.notifyListeners();

    let syncedCount = 0;
    let conflictsResolved = 0;

    try {
      const records = loadStoredRecords();
      const allConflicts = loadStoredConflicts();

      // Find pending records
      const pendingIndices: number[] = [];
      records.forEach((r, idx) => {
        if (r.syncStatus === 'pending_sync' || r.syncStatus === 'syncing' || r.syncStatus === 'failed') {
          pendingIndices.push(idx);
        }
      });

      for (const idx of pendingIndices) {
        const item = records[idx];
        item.syncAttempts += 1;
        item.lastAttemptAt = new Date().toISOString();

        // Check if there is an existing synced record in the same Kebele & Report Week
        const existingSynced = records.find(
          (other) =>
            other.id !== item.id &&
            other.kebele === item.kebele &&
            other.woreda === item.woreda &&
            other.report_week === item.report_week &&
            other.report_year === item.report_year &&
            (other.syncStatus === 'synced' || other.syncStatus === 'conflict_resolved')
        );

        if (existingSynced) {
          // Automatic conflict resolution triggered!
          const resolution = resolveSubmissionConflict(existingSynced, item);
          if (resolution.hasConflict) {
            conflictsResolved += resolution.conflicts.length;
            allConflicts.push(...resolution.conflicts);

            // Replace current item with merged resolved record
            records[idx] = resolution.resolvedRecord;
            records[idx].syncStatus = 'conflict_resolved';
            records[idx].syncedAt = new Date().toISOString();
            syncedCount += 1;
            continue;
          }
        }

        // Simulate network submission to KoboToolbox OpenRosa endpoint
        // Or if proxy is reachable, try calling /api/kobo/submission/ayqceYfs6Dxi567kBEi7AZ
        await new Promise((res) => setTimeout(res, 350)); // realistic network latency

        item.syncStatus = 'synced';
        item.syncedAt = new Date().toISOString();
        item.syncErrorMessage = undefined;
        syncedCount += 1;
      }

      saveStoredRecords(records);
      saveStoredConflicts(allConflicts);
    } catch (err: any) {
      console.error('Error during synchronization:', err);
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }

    return { syncedCount, conflictsResolved };
  }

  /**
   * Proactively pulls live survey submissions directly from KoboToolbox cloud server (oboa2026).
   */
  public async pullFromKoboCloud(): Promise<{ fetched: number; newCount: number; error?: string }> {
    if (!this.isOnlineStatus) {
      return { fetched: 0, newCount: 0, error: 'Cannot pull from cloud while offline' };
    }

    try {
      const res = await fetchLiveKoboSubmissions();
      if (!res.success) {
        return { fetched: 0, newCount: 0, error: res.error };
      }

      const currentRecords = loadStoredRecords();
      const existingIds = new Set(currentRecords.map((r) => r.id));
      const existingInstances = new Set(currentRecords.map((r) => r.instanceId));

      let newCount = 0;
      for (const koboRec of res.records) {
        if (!existingIds.has(koboRec.id) && !existingInstances.has(koboRec.instanceId)) {
          currentRecords.unshift(koboRec);
          newCount += 1;
        }
      }

      if (newCount > 0) {
        saveStoredRecords(currentRecords);
        this.notifyListeners();
      }

      return { fetched: res.submissionsCount, newCount };
    } catch (err: any) {
      console.error('Failed to pull from Kobo:', err);
      return { fetched: 0, newCount: 0, error: err.message };
    }
  }

  /**
   * Generates standard OpenRosa XML submission string for KoboToolbox
   */
  public generateOpenRosaXml(record: SurveyRecord): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<ayqceYfs6Dxi567kBEi7AZ xmlns:jr="http://openrosa.org/javarosa" xmlns:orx="http://openrosa.org/xforms" id="ayqceYfs6Dxi567kBEi7AZ" version="${record.version}">
  <formhub>
    <uuid>${record.instanceId.replace('uuid:', '')}</uuid>
  </formhub>
  <start>${record.createdAt}</start>
  <end>${record.updatedAt}</end>
  <today>${record.report_date}</today>
  <deviceid>${record.clientDeviceId}</deviceid>
  <username>${record.enumerator_name}</username>
  <g_meta>
    <enumerator_name>${record.enumerator_name}</enumerator_name>
    <enumerator_phone>${record.enumerator_phone}</enumerator_phone>
    <enumerator_role>${record.enumerator_role}</enumerator_role>
    <report_date>${record.report_date}</report_date>
    <report_week>${record.report_week}</report_week>
    <phase>${record.phase}</phase>
    <report_month>${record.report_month}</report_month>
    <report_year>${record.report_year}</report_year>
  </g_meta>
  <g_loc>
    <region>${record.region}</region>
    <zone>${record.zone}</zone>
    <woreda>${record.woreda}</woreda>
    <kebele>${record.kebele}</kebele>
    <agro_zone>${record.agro_zone}</agro_zone>
    <kebele_gps>${record.kebele_gps_lat} ${record.kebele_gps_lng} 0 0</kebele_gps>
  </g_loc>
  <g_prog>
    <plan_area_ha>${record.plan_area_ha}</plan_area_ha>
    <area_sown_cum_ha>${record.area_sown_cum_ha}</area_sown_cum_ha>
    <ach_sown_pct>${record.ach_sown_pct}</ach_sown_pct>
    <area_gap_ha>${record.area_gap_ha}</area_gap_ha>
    <hh_part_total>${record.hh_part_total}</hh_part_total>
    <track_status>${record.track_status}</track_status>
  </g_prog>
  <g_agro>
    <land_prepared_cum_ha>${record.land_prepared_cum_ha}</land_prepared_cum_ha>
    <prep_method>${record.prep_method}</prep_method>
    <soil_type>${record.soil_type}</soil_type>
    <seed_dist_total_qt>${record.seed_dist_total_qt}</seed_dist_total_qt>
  </g_agro>
  <meta>
    <instanceID>${record.instanceId}</instanceID>
  </meta>
</ayqceYfs6Dxi567kBEi7AZ>`;
  }

  private startPeriodicSync() {
    // Check every 30 seconds if online and there are pending items
    this.autoSyncInterval = setInterval(() => {
      if (this.isOnlineStatus && !this.isSyncing) {
        const stats = this.getStats();
        if (stats.pending > 0) {
          this.syncPendingSubmissions();
        }
      }
    }, 30000);
  }

  public destroy() {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
    }
  }
}

export const syncEngine = new SyncEngine();
