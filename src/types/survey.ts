/**
 * Types for Irrigated Wheat Weekly Monitoring - Oromia
 * Based on KoboToolbox Form: https://ee.kobotoolbox.org/x/9OBwKKRd
 * Form ID: ayqceYfs6Dxi567kBEi7AZ
 */

export type SyncStatus = 'synced' | 'pending_sync' | 'syncing' | 'conflict_detected' | 'conflict_resolved' | 'failed';

export type TrackStatus = 'on_track' | 'lagging' | 'critical' | 'completed';

export type WaterSourceType = 'river' | 'lake' | 'spring' | 'dam' | 'shallow_well' | 'deep_well' | 'other';

export type IrrigationType = 'gravity' | 'motor_pump' | 'solar_pump' | 'drip' | 'sprinkler' | 'spate';

export type SoilType = 'clay' | 'loam' | 'sandy_loam' | 'black_vertisol' | 'alluvial' | 'other';

export interface IrrigationScheme {
  id: string;
  name: string;
  source_name: string;
  source_type: WaterSourceType;
  irrigation_type: IrrigationType;
  interval_days: number;
  design_command_ha: number;
  wheat_actual_ha: number;
  beneficiaries_m: number;
  beneficiaries_f: number;
  gps_lat: number;
  gps_lng: number;
  gps_altitude?: number;
  photo_url?: string;
  pumps_total: number;
  pumps_functional: number;
  pumps_broken: number;
  pumps_under_maintenance: number;
  pumps_maintained_cumulative: number;
  pumps_new_available: number;
  pumps_new_distributed: number;
  pumps_needed_additional: number;
  pump_avg_capacity_ls: number;
}

export interface FarmlandPlot {
  id: string;
  plot_code: string;
  farmer_name: string;
  gender: 'M' | 'F';
  scheme_id: string;
  gps_lat: number;
  gps_lng: number;
  area_ha: number;
  sowing_date: string;
  irrigations_applied: number;
  expected_yield_qt_ha: number;
  variety: string;
  photo_url?: string;
  growth_stage: 'emergence' | 'tillering' | 'stem_elongation' | 'booting' | 'heading' | 'dough' | 'maturity' | 'harvested';
}

export interface FertilizerAgro {
  urea_need_qt: number;
  urea_supplied_qt: number;
  urea_used_qt: number;
  nps_need_qt: number;
  nps_supplied_qt: number;
  nps_used_qt: number;
  npsb_need_qt: number;
  npsb_supplied_qt: number;
  npsb_used_qt: number;
  compost_used_m3: number;
  herbicide_need_l: number;
  herbicide_used_l: number;
  fungicide_need_l: number;
  fungicide_used_l: number; // for wheat rust
  insecticide_need_l: number;
  insecticide_used_l: number;
  knapsack_sprayers_total: number;
  knapsack_sprayers_functional: number;
}

export interface CropGrowthDistribution {
  emergence_ha: number;
  tillering_ha: number;
  stem_elongation_ha: number;
  booting_ha: number;
  heading_flowering_ha: number;
  milk_dough_ha: number;
  maturity_ha: number;
  harvested_ha: number;
}

export interface ChallengesAndAction {
  water_shortage: boolean;
  fuel_power_shortage: boolean;
  fertilizer_shortage: boolean;
  seed_shortage: boolean;
  pest_rust_outbreak: boolean;
  pump_breakdown: boolean;
  canal_siltation: boolean;
  market_access: boolean;
  other_challenge_text?: string;
  action_taken: string;
  support_needed: string;
  opportunities_notes: string;
  remarks: string;
  field_photo_url?: string;
}

export interface SurveyRecord {
  id: string;
  instanceId: string;
  formId: string; // "ayqceYfs6Dxi567kBEi7AZ"
  version: string;
  koboFormUrl: string;

  // Metadata
  enumerator_name: string;
  enumerator_phone: string;
  enumerator_role: string;
  report_date: string;
  report_week: number;
  report_month: string;
  report_year: number;
  phase: 'Phase 1 - Land & Sowing' | 'Phase 2 - Crop Care & Irrigation' | 'Phase 3 - Harvest & Threshing';

  // Location
  region: string; // "Oromia"
  zone: string; // "East Shewa", "Arsi", "West Arsi", "Bale", etc.
  woreda: string;
  kebele: string;
  agro_zone: 'Lowland (<1500m)' | 'Midland (1500-2300m)' | 'Highland (>2300m)';
  kebele_gps_lat: number;
  kebele_gps_lng: number;

  // Targets & Progress
  plan_area_ha: number;
  plan_hh_m: number;
  plan_hh_f: number;
  plan_hh_total: number;
  plan_yield_qt_ha: number;
  plan_prod_qt: number;

  area_sown_cum_ha: number;
  ach_sown_pct: number;
  area_gap_ha: number;
  hh_part_m: number;
  hh_part_f: number;
  hh_part_total: number;
  hh_part_pct: number;
  track_status: TrackStatus;

  // Agronomy
  land_identified_ha: number;
  land_prepared_cum_ha: number;
  prep_method: 'Tractor' | 'Oxen' | 'Manual' | 'Combined';
  soil_type: SoilType;
  soil_acidity: 'Non-acidic (pH > 6.5)' | 'Moderately acidic (pH 5.5-6.5)' | 'Strongly acidic (pH < 5.5)';
  prev_crop: string;
  wheat_varieties: string[]; // e.g. ["Danda'a", "Kakaba", "Kingbird", "Ogolcho"]

  // Seed
  seed_dist_total_qt: number;
  seed_used_total_qt: number;

  // Crop stages
  stages: CropGrowthDistribution;

  // Fertilizers & chemicals
  inputs: FertilizerAgro;

  // Schemes (repeat group)
  schemes: IrrigationScheme[];

  // Farmlands (repeat group)
  farmlands: FarmlandPlot[];

  // Challenges
  challenges: ChallengesAndAction;

  // Sync state
  syncStatus: SyncStatus;
  syncAttempts: number;
  lastAttemptAt?: string;
  syncedAt?: string;
  syncErrorMessage?: string;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
  createdOffline: boolean;
  clientDeviceId: string;

  // Conflict records if any
  conflicts?: ConflictDetail[];
}

export interface ConflictDetail {
  id: string;
  recordId: string;
  field: string;
  fieldLabel: string;
  serverValue: any;
  clientValue: any;
  resolvedValue: any;
  strategyUsed: 'monotonic_max' | 'last_write_wins' | 'field_merge' | 'manual_override';
  reason: string;
  detectedAt: string;
  resolvedAt: string;
}

export interface SyncStats {
  totalRecords: number;
  synced: number;
  pending: number;
  conflictsResolved: number;
  failed: number;
  lastSyncTime: string | null;
  isOnline: boolean;
  isSyncing: boolean;
}
