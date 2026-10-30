/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SurveyRecord } from '../types/survey';

export type FertilizerType = 'nps' | 'urea_basal' | 'urea_topdressing' | 'organic_bio';

export interface FertilizerTypeMeta {
  type: FertilizerType;
  nameEnglish: string;
  nameAfaanOromo: string;
  category: 'Basal (Sowing)' | 'Top-Dressing (Vegetative)' | 'Bio & Organic Inputs';
  dosageStandard: string;
  plannedRegionalTargetQt: number;
  description: string;
  badgeColor: string;
}

export const FERTILIZER_TYPE_METAS: Record<FertilizerType, FertilizerTypeMeta> = {
  nps: {
    type: 'nps',
    nameEnglish: 'NPS / NPS-B / NPS-Zn (Basal)',
    nameAfaanOromo: "Xaa'oo Bu'uuraa NPS / NPS-B",
    category: 'Basal (Sowing)',
    dosageStandard: '1.0 - 1.25 qt/ha (100 kg/ha at sowing)',
    plannedRegionalTargetQt: 4030000,
    description: 'Applied at sowing into the furrow alongside improved wheat seeds. Supplies phosphorus, nitrogen, and sulfur.',
    badgeColor: 'border-emerald-500/50 text-emerald-300 bg-emerald-950/60',
  },
  urea_basal: {
    type: 'urea_basal',
    nameEnglish: 'Urea (Basal / 1st Dose)',
    nameAfaanOromo: "Yuuriyaa Marsaa 1ffaa (Facaasaa)",
    category: 'Basal (Sowing)',
    dosageStandard: '1.0 - 1.5 qt/ha (50-100 kg/ha basal split)',
    plannedRegionalTargetQt: 6044945,
    description: 'First split application of nitrogen provided during or immediately following initial seedling emergence.',
    badgeColor: 'border-sky-500/50 text-sky-300 bg-sky-950/60',
  },
  urea_topdressing: {
    type: 'urea_topdressing',
    nameEnglish: 'Urea Top-Dressing (2nd Dose)',
    nameAfaanOromo: 'Yuuriyaa Top-dressing (Marsaa 2ffaa)',
    category: 'Top-Dressing (Vegetative)',
    dosageStandard: '0.75 - 1.0 qt/ha applied at tillering (21-35 days)',
    plannedRegionalTargetQt: 2821000,
    description: 'Crucial nitrogen top-dressing applied during tillering and stem elongation stages, directly followed by irrigation.',
    badgeColor: 'border-amber-500/50 text-amber-300 bg-amber-950/60',
  },
  organic_bio: {
    type: 'organic_bio',
    nameEnglish: 'Bio-Fertilizer & Organic Compost',
    nameAfaanOromo: "Xaa'oo Uumamaa fi Dhangala'oo",
    category: 'Bio & Organic Inputs',
    dosageStandard: 'Liquid bio-fertilizer seed coating / 5-10 m³/ha compost',
    plannedRegionalTargetQt: 1200000,
    description: 'Rhizobacteria bio-inoculants, vermicompost, and liquid organic foliar fertilizers enhancing soil health.',
    badgeColor: 'border-teal-500/50 text-teal-300 bg-teal-950/60',
  },
};

export interface ZonalFertilizerAllocation {
  id: number;
  zone: string;
  planAreaHa: number;
  // NPS
  npsPlanQt: number;
  npsSuppliedQt: number;
  npsDistributedQt: number;
  npsUsedQt: number;
  // Urea Basal
  ureaBasalPlanQt: number;
  ureaBasalSuppliedQt: number;
  ureaBasalDistributedQt: number;
  ureaBasalUsedQt: number;
  // Urea Top-dressing
  ureaTopPlanHa: number;
  ureaTopPlanQt: number;
  ureaTopSuppliedQt: number;
  ureaTopDistributedQt: number;
  ureaTopCoveredHa: number;
  // Bio/Organic
  bioPlanQt: number;
  bioDistributedQt: number;
}

export const BASELINE_ZONAL_FERTILIZER: ZonalFertilizerAllocation[] = [
  {
    id: 1,
    zone: 'Kibba baha Oromiyaa (Arsi / Bale / Guji)',
    planAreaHa: 696514,
    npsPlanQt: 696514,
    npsSuppliedQt: 620000,
    npsDistributedQt: 574000,
    npsUsedQt: 520000,
    ureaBasalPlanQt: 1044770,
    ureaBasalSuppliedQt: 940000,
    ureaBasalDistributedQt: 835000,
    ureaBasalUsedQt: 720000,
    ureaTopPlanHa: 620000,
    ureaTopPlanQt: 487560,
    ureaTopSuppliedQt: 390000,
    ureaTopDistributedQt: 310000,
    ureaTopCoveredHa: 340000,
    bioPlanQt: 200000,
    bioDistributedQt: 165000,
  },
  {
    id: 2,
    zone: 'Kibba Oromiyaa (Borena / West Guji)',
    planAreaHa: 308290,
    npsPlanQt: 308290,
    npsSuppliedQt: 275000,
    npsDistributedQt: 246000,
    npsUsedQt: 215000,
    ureaBasalPlanQt: 462436,
    ureaBasalSuppliedQt: 410000,
    ureaBasalDistributedQt: 360000,
    ureaBasalUsedQt: 295000,
    ureaTopPlanHa: 270000,
    ureaTopPlanQt: 215800,
    ureaTopSuppliedQt: 172000,
    ureaTopDistributedQt: 135000,
    ureaTopCoveredHa: 145000,
    bioPlanQt: 90000,
    bioDistributedQt: 72000,
  },
  {
    id: 3,
    zone: 'Baha Oromiyaa (East / West Hararghe)',
    planAreaHa: 103887,
    npsPlanQt: 103887,
    npsSuppliedQt: 95000,
    npsDistributedQt: 85000,
    npsUsedQt: 78000,
    ureaBasalPlanQt: 155831,
    ureaBasalSuppliedQt: 142000,
    ureaBasalDistributedQt: 125000,
    ureaBasalUsedQt: 108000,
    ureaTopPlanHa: 95000,
    ureaTopPlanQt: 72720,
    ureaTopSuppliedQt: 60000,
    ureaTopDistributedQt: 48000,
    ureaTopCoveredHa: 52000,
    bioPlanQt: 35000,
    bioDistributedQt: 29000,
  },
  {
    id: 4,
    zone: 'Kibba Lixa Oromiyaa (Jimma / Ilu / Buno)',
    planAreaHa: 749497,
    npsPlanQt: 749497,
    npsSuppliedQt: 670000,
    npsDistributedQt: 615000,
    npsUsedQt: 550000,
    ureaBasalPlanQt: 1124246,
    ureaBasalSuppliedQt: 1010000,
    ureaBasalDistributedQt: 890000,
    ureaBasalUsedQt: 780000,
    ureaTopPlanHa: 680000,
    ureaTopPlanQt: 524650,
    ureaTopSuppliedQt: 410000,
    ureaTopDistributedQt: 330000,
    ureaTopCoveredHa: 360000,
    bioPlanQt: 220000,
    bioDistributedQt: 180000,
  },
  {
    id: 5,
    zone: 'G/gala Oromiyaa (East Shewa / Southwest Shewa)',
    planAreaHa: 1183974,
    npsPlanQt: 1183951,
    npsSuppliedQt: 1080000,
    npsDistributedQt: 995000,
    npsUsedQt: 910000,
    ureaBasalPlanQt: 1775926,
    ureaBasalSuppliedQt: 1620000,
    ureaBasalDistributedQt: 1460000,
    ureaBasalUsedQt: 1290000,
    ureaTopPlanHa: 1050000,
    ureaTopPlanQt: 828780,
    ureaTopSuppliedQt: 690000,
    ureaTopDistributedQt: 580000,
    ureaTopCoveredHa: 620000,
    bioPlanQt: 350000,
    bioDistributedQt: 285000,
  },
  {
    id: 6,
    zone: 'Lixa Oromiyaa (West Shewa / Horo Guduru / Qellem)',
    planAreaHa: 911296,
    npsPlanQt: 911296,
    npsSuppliedQt: 810000,
    npsDistributedQt: 730000,
    npsUsedQt: 650000,
    ureaBasalPlanQt: 1366944,
    ureaBasalSuppliedQt: 1220000,
    ureaBasalDistributedQt: 1060000,
    ureaBasalUsedQt: 910000,
    ureaTopPlanHa: 800000,
    ureaTopPlanQt: 637900,
    ureaTopSuppliedQt: 505000,
    ureaTopDistributedQt: 395000,
    ureaTopCoveredHa: 430000,
    bioPlanQt: 280000,
    bioDistributedQt: 220000,
  },
  {
    id: 7,
    zone: 'M/Shaggar',
    planAreaHa: 49616,
    npsPlanQt: 49616,
    npsSuppliedQt: 46000,
    npsDistributedQt: 41000,
    npsUsedQt: 38000,
    ureaBasalPlanQt: 74424,
    ureaBasalSuppliedQt: 68000,
    ureaBasalDistributedQt: 61000,
    ureaBasalUsedQt: 53000,
    ureaTopPlanHa: 45000,
    ureaTopPlanQt: 34730,
    ureaTopSuppliedQt: 28000,
    ureaTopDistributedQt: 23000,
    ureaTopCoveredHa: 25000,
    bioPlanQt: 15000,
    bioDistributedQt: 12500,
  },
  {
    id: 8,
    zone: 'Adaamaa (Magaalaa)',
    planAreaHa: 10212,
    npsPlanQt: 10212,
    npsSuppliedQt: 9800,
    npsDistributedQt: 9200,
    npsUsedQt: 8800,
    ureaBasalPlanQt: 15318,
    ureaBasalSuppliedQt: 14500,
    ureaBasalDistributedQt: 13400,
    ureaBasalUsedQt: 12200,
    ureaTopPlanHa: 9500,
    ureaTopPlanQt: 7150,
    ureaTopSuppliedQt: 6200,
    ureaTopDistributedQt: 5400,
    ureaTopCoveredHa: 6100,
    bioPlanQt: 3500,
    bioDistributedQt: 3100,
  },
  {
    id: 9,
    zone: 'Bishoftuu (Magaalaa)',
    planAreaHa: 15028,
    npsPlanQt: 15028,
    npsSuppliedQt: 14200,
    npsDistributedQt: 13300,
    npsUsedQt: 12500,
    ureaBasalPlanQt: 22542,
    ureaBasalSuppliedQt: 21000,
    ureaBasalDistributedQt: 19100,
    ureaBasalUsedQt: 17200,
    ureaTopPlanHa: 13500,
    ureaTopPlanQt: 10520,
    ureaTopSuppliedQt: 8900,
    ureaTopDistributedQt: 7800,
    ureaTopCoveredHa: 8700,
    bioPlanQt: 5000,
    bioDistributedQt: 4200,
  },
  {
    id: 10,
    zone: 'Jimmaa (Magaalaa)',
    planAreaHa: 227,
    npsPlanQt: 227,
    npsSuppliedQt: 220,
    npsDistributedQt: 210,
    npsUsedQt: 205,
    ureaBasalPlanQt: 341,
    ureaBasalSuppliedQt: 330,
    ureaBasalDistributedQt: 315,
    ureaBasalUsedQt: 290,
    ureaTopPlanHa: 210,
    ureaTopPlanQt: 160,
    ureaTopSuppliedQt: 150,
    ureaTopDistributedQt: 130,
    ureaTopCoveredHa: 145,
    bioPlanQt: 80,
    bioDistributedQt: 70,
  },
  {
    id: 11,
    zone: 'Maayyaa (Magaalaa)',
    planAreaHa: 359,
    npsPlanQt: 359,
    npsSuppliedQt: 350,
    npsDistributedQt: 330,
    npsUsedQt: 310,
    ureaBasalPlanQt: 539,
    ureaBasalSuppliedQt: 510,
    ureaBasalDistributedQt: 480,
    ureaBasalUsedQt: 430,
    ureaTopPlanHa: 320,
    ureaTopPlanQt: 250,
    ureaTopSuppliedQt: 230,
    ureaTopDistributedQt: 195,
    ureaTopCoveredHa: 210,
    bioPlanQt: 120,
    bioDistributedQt: 100,
  },
  {
    id: 12,
    zone: 'Naqamtee (Magaalaa)',
    planAreaHa: 389,
    npsPlanQt: 389,
    npsSuppliedQt: 380,
    npsDistributedQt: 360,
    npsUsedQt: 340,
    ureaBasalPlanQt: 584,
    ureaBasalSuppliedQt: 560,
    ureaBasalDistributedQt: 510,
    ureaBasalUsedQt: 460,
    ureaTopPlanHa: 350,
    ureaTopPlanQt: 270,
    ureaTopSuppliedQt: 250,
    ureaTopDistributedQt: 220,
    ureaTopCoveredHa: 240,
    bioPlanQt: 130,
    bioDistributedQt: 110,
  },
  {
    id: 13,
    zone: 'Roobee (Magaalaa)',
    planAreaHa: 422,
    npsPlanQt: 422,
    npsSuppliedQt: 410,
    npsDistributedQt: 390,
    npsUsedQt: 370,
    ureaBasalPlanQt: 633,
    ureaBasalSuppliedQt: 600,
    ureaBasalDistributedQt: 560,
    ureaBasalUsedQt: 510,
    ureaTopPlanHa: 380,
    ureaTopPlanQt: 300,
    ureaTopSuppliedQt: 270,
    ureaTopDistributedQt: 240,
    ureaTopCoveredHa: 260,
    bioPlanQt: 140,
    bioDistributedQt: 120,
  },
  {
    id: 14,
    zone: 'Shashamannee (Magaalaa)',
    planAreaHa: 289,
    npsPlanQt: 289,
    npsSuppliedQt: 280,
    npsDistributedQt: 270,
    npsUsedQt: 260,
    ureaBasalPlanQt: 434,
    ureaBasalSuppliedQt: 410,
    ureaBasalDistributedQt: 380,
    ureaBasalUsedQt: 345,
    ureaTopPlanHa: 260,
    ureaTopPlanQt: 200,
    ureaTopSuppliedQt: 180,
    ureaTopDistributedQt: 160,
    ureaTopCoveredHa: 180,
    bioPlanQt: 100,
    bioDistributedQt: 85,
  },
];

/**
 * Combines baseline regional plans with live field survey inputs
 */
export function getLiveFertilizerData(records: SurveyRecord[]): ZonalFertilizerAllocation[] {
  // Deep clone baseline
  const result: ZonalFertilizerAllocation[] = JSON.parse(JSON.stringify(BASELINE_ZONAL_FERTILIZER));

  records.forEach((rec) => {
    const recZone = (rec.zone || '').toLowerCase();
    const target = result.find(
      (z) => recZone.includes(z.zone.toLowerCase().split(' ')[0]) || z.zone.toLowerCase().includes(recZone)
    );

    if (target && rec.inputs) {
      if (rec.inputs.nps_supplied_qt) target.npsSuppliedQt += rec.inputs.nps_supplied_qt;
      if (rec.inputs.nps_used_qt) {
        target.npsDistributedQt += rec.inputs.nps_used_qt;
        target.npsUsedQt += rec.inputs.nps_used_qt;
      }
      if (rec.inputs.urea_supplied_qt) target.ureaBasalSuppliedQt += rec.inputs.urea_supplied_qt;
      if (rec.inputs.urea_used_qt) {
        target.ureaBasalDistributedQt += rec.inputs.urea_used_qt;
        target.ureaBasalUsedQt += rec.inputs.urea_used_qt;
      }
      if (rec.inputs.compost_used_m3) {
        target.bioDistributedQt += rec.inputs.compost_used_m3;
      }
    }
  });

  return result;
}

/**
 * 3-Month Historical & Real-Time Trend Data comparing Planned vs Actual Application Rates (Qt/Ha and Total Quintals)
 * Spans November 2025, December 2025, and January 2026 across 12 weekly monitoring intervals.
 */
export interface FertilizerRateTrendPoint {
  period: string;
  weekNumber: number;
  month: 'November' | 'December' | 'January';
  dateLabel: string;
  stageName: string;
  plannedOverallRate: number;      // Qt/Ha
  actualOverallRate: number;       // Qt/Ha
  plannedNpsRate: number;          // Qt/Ha
  actualNpsRate: number;           // Qt/Ha
  plannedUreaBasalRate: number;    // Qt/Ha
  actualUreaBasalRate: number;     // Qt/Ha
  plannedUreaTopRate: number;      // Qt/Ha
  actualUreaTopRate: number;       // Qt/Ha
  plannedTotalQuintals: number;    // Cumulative Quintals
  actualTotalQuintals: number;     // Cumulative Quintals
  rateVarianceQtHa: number;        // actual - planned
  compliancePct: number;          // (actual / planned) * 100
}

export const PAST_3_MONTHS_APPLICATION_TRENDS: FertilizerRateTrendPoint[] = [
  // Month 1: November 2025 - Land Preparation, Planting & Basal NPS Split
  {
    period: 'Nov W1',
    weekNumber: 1,
    month: 'November',
    dateLabel: '07 Nov 2025',
    stageName: 'Early Furrowing & Soil Conditioning',
    plannedOverallRate: 1.00,
    actualOverallRate: 0.82,
    plannedNpsRate: 1.00,
    actualNpsRate: 0.82,
    plannedUreaBasalRate: 0.00,
    actualUreaBasalRate: 0.00,
    plannedUreaTopRate: 0.00,
    actualUreaTopRate: 0.00,
    plannedTotalQuintals: 450000,
    actualTotalQuintals: 369000,
    rateVarianceQtHa: -0.18,
    compliancePct: 82.0,
  },
  {
    period: 'Nov W2',
    weekNumber: 2,
    month: 'November',
    dateLabel: '14 Nov 2025',
    stageName: 'Intensive Sowing & Basal NPS Placement',
    plannedOverallRate: 1.15,
    actualOverallRate: 0.96,
    plannedNpsRate: 1.15,
    actualNpsRate: 0.96,
    plannedUreaBasalRate: 0.20,
    actualUreaBasalRate: 0.15,
    plannedUreaTopRate: 0.00,
    actualUreaTopRate: 0.00,
    plannedTotalQuintals: 1100000,
    actualTotalQuintals: 945000,
    rateVarianceQtHa: -0.19,
    compliancePct: 83.5,
  },
  {
    period: 'Nov W3',
    weekNumber: 3,
    month: 'November',
    dateLabel: '21 Nov 2025',
    stageName: 'Seedling Emergence & Initial Urea Basal Split',
    plannedOverallRate: 1.60,
    actualOverallRate: 1.42,
    plannedNpsRate: 1.20,
    actualNpsRate: 1.10,
    plannedUreaBasalRate: 0.60,
    actualUreaBasalRate: 0.48,
    plannedUreaTopRate: 0.00,
    actualUreaTopRate: 0.00,
    plannedTotalQuintals: 1950000,
    actualTotalQuintals: 1720000,
    rateVarianceQtHa: -0.18,
    compliancePct: 88.8,
  },
  {
    period: 'Nov W4',
    weekNumber: 4,
    month: 'November',
    dateLabel: '28 Nov 2025',
    stageName: 'Full Emergence & Basal Consolidation',
    plannedOverallRate: 2.10,
    actualOverallRate: 1.92,
    plannedNpsRate: 1.25,
    actualNpsRate: 1.18,
    plannedUreaBasalRate: 1.10,
    actualUreaBasalRate: 0.98,
    plannedUreaTopRate: 0.00,
    actualUreaTopRate: 0.00,
    plannedTotalQuintals: 2850000,
    actualTotalQuintals: 2560000,
    rateVarianceQtHa: -0.18,
    compliancePct: 91.4,
  },

  // Month 2: December 2025 - Vegetative Stage, 1st Irrigation & 1st Top-Dressing
  {
    period: 'Dec W1',
    weekNumber: 5,
    month: 'December',
    dateLabel: '05 Dec 2025',
    stageName: 'Early Vegetative & Urea Basal Completion',
    plannedOverallRate: 2.45,
    actualOverallRate: 2.28,
    plannedNpsRate: 1.25,
    actualNpsRate: 1.22,
    plannedUreaBasalRate: 1.35,
    actualUreaBasalRate: 1.24,
    plannedUreaTopRate: 0.15,
    actualUreaTopRate: 0.10,
    plannedTotalQuintals: 3800000,
    actualTotalQuintals: 3510000,
    rateVarianceQtHa: -0.17,
    compliancePct: 93.1,
  },
  {
    period: 'Dec W2',
    weekNumber: 6,
    month: 'December',
    dateLabel: '12 Dec 2025',
    stageName: 'First Irrigation Round & Tillering Initiation',
    plannedOverallRate: 2.70,
    actualOverallRate: 2.54,
    plannedNpsRate: 1.25,
    actualNpsRate: 1.24,
    plannedUreaBasalRate: 1.45,
    actualUreaBasalRate: 1.36,
    plannedUreaTopRate: 0.30,
    actualUreaTopRate: 0.22,
    plannedTotalQuintals: 4900000,
    actualTotalQuintals: 4580000,
    rateVarianceQtHa: -0.16,
    compliancePct: 94.1,
  },
  {
    period: 'Dec W3',
    weekNumber: 7,
    month: 'December',
    dateLabel: '19 Dec 2025',
    stageName: 'Active Tillering & Primary Urea Top-Dressing',
    plannedOverallRate: 2.95,
    actualOverallRate: 2.81,
    plannedNpsRate: 1.25,
    actualNpsRate: 1.25,
    plannedUreaBasalRate: 1.50,
    actualUreaBasalRate: 1.42,
    plannedUreaTopRate: 0.50,
    actualUreaTopRate: 0.41,
    plannedTotalQuintals: 6200000,
    actualTotalQuintals: 5850000,
    rateVarianceQtHa: -0.14,
    compliancePct: 95.3,
  },
  {
    period: 'Dec W4',
    weekNumber: 8,
    month: 'December',
    dateLabel: '26 Dec 2025',
    stageName: 'Second Water Cycle Synchronization',
    plannedOverallRate: 3.10,
    actualOverallRate: 2.98,
    plannedNpsRate: 1.25,
    actualNpsRate: 1.25,
    plannedUreaBasalRate: 1.50,
    actualUreaBasalRate: 1.45,
    plannedUreaTopRate: 0.65,
    actualUreaTopRate: 0.55,
    plannedTotalQuintals: 7400000,
    actualTotalQuintals: 7080000,
    rateVarianceQtHa: -0.12,
    compliancePct: 96.1,
  },

  // Month 3: January 2026 - Stem Elongation, Peak Top-Dressing & Booting Phase
  {
    period: 'Jan W1',
    weekNumber: 9,
    month: 'January',
    dateLabel: '02 Jan 2026',
    stageName: 'Stem Elongation & Secondary Top-Dressing',
    plannedOverallRate: 3.25,
    actualOverallRate: 3.14,
    plannedNpsRate: 1.25,
    actualNpsRate: 1.25,
    plannedUreaBasalRate: 1.50,
    actualUreaBasalRate: 1.47,
    plannedUreaTopRate: 0.75,
    actualUreaTopRate: 0.68,
    plannedTotalQuintals: 8600000,
    actualTotalQuintals: 8290000,
    rateVarianceQtHa: -0.11,
    compliancePct: 96.6,
  },
  {
    period: 'Jan W2',
    weekNumber: 10,
    month: 'January',
    dateLabel: '09 Jan 2026',
    stageName: 'Canal Irrigation & Critical Nitrogen Uptake',
    plannedOverallRate: 3.35,
    actualOverallRate: 3.24,
    plannedNpsRate: 1.25,
    actualNpsRate: 1.25,
    plannedUreaBasalRate: 1.50,
    actualUreaBasalRate: 1.49,
    plannedUreaTopRate: 0.82,
    actualUreaTopRate: 0.74,
    plannedTotalQuintals: 9600000,
    actualTotalQuintals: 9280000,
    rateVarianceQtHa: -0.11,
    compliancePct: 96.7,
  },
  {
    period: 'Jan W3',
    weekNumber: 11,
    month: 'January',
    dateLabel: '16 Jan 2026',
    stageName: 'Late Booting & Nitrogen Top-Dressing Wrap-up',
    plannedOverallRate: 3.40,
    actualOverallRate: 3.31,
    plannedNpsRate: 1.25,
    actualNpsRate: 1.25,
    plannedUreaBasalRate: 1.50,
    actualUreaBasalRate: 1.50,
    plannedUreaTopRate: 0.85,
    actualUreaTopRate: 0.79,
    plannedTotalQuintals: 10400000,
    actualTotalQuintals: 10080000,
    rateVarianceQtHa: -0.09,
    compliancePct: 97.4,
  },
  {
    period: 'Jan W4',
    weekNumber: 12,
    month: 'January',
    dateLabel: '23 Jan 2026',
    stageName: 'Full Canopy Closure & Final Target Attainment',
    plannedOverallRate: 3.42,
    actualOverallRate: 3.36,
    plannedNpsRate: 1.25,
    actualNpsRate: 1.25,
    plannedUreaBasalRate: 1.50,
    actualUreaBasalRate: 1.50,
    plannedUreaTopRate: 0.85,
    actualUreaTopRate: 0.82,
    plannedTotalQuintals: 11000000,
    actualTotalQuintals: 10720000,
    rateVarianceQtHa: -0.06,
    compliancePct: 98.2,
  },
];

/**
 * Returns dynamic 3-month trend data reacting to newly submitted or fetched survey records
 */
export function get3MonthFertilizerTrends(records: SurveyRecord[]): {
  weeklyPoints: FertilizerRateTrendPoint[];
  monthlySummary: {
    month: 'November' | 'December' | 'January';
    label: string;
    plannedAvgRate: number;
    actualAvgRate: number;
    varianceQtHa: number;
    totalAppliedQt: number;
    compliancePct: number;
  }[];
} {
  const points = JSON.parse(JSON.stringify(PAST_3_MONTHS_APPLICATION_TRENDS)) as FertilizerRateTrendPoint[];

  // If there are live records with fertilizer inputs, slightly elevate recent weeks based on verified inputs
  const liveInputSum = records.reduce((acc, r) => {
    return acc + (r.inputs?.nps_used_qt || 0) + (r.inputs?.urea_used_qt || 0);
  }, 0);

  if (liveInputSum > 0 && points.length > 0) {
    const boostRate = Math.min(0.08, (liveInputSum / 5000000) * 0.08);
    // Apply boost to recent weeks (Jan W3, Jan W4)
    points[points.length - 1].actualOverallRate = Number(
      Math.min(3.42, points[points.length - 1].actualOverallRate + boostRate).toFixed(2)
    );
    points[points.length - 1].rateVarianceQtHa = Number(
      (points[points.length - 1].actualOverallRate - points[points.length - 1].plannedOverallRate).toFixed(2)
    );
    points[points.length - 1].compliancePct = Number(
      ((points[points.length - 1].actualOverallRate / points[points.length - 1].plannedOverallRate) * 100).toFixed(1)
    );
  }

  // Calculate monthly summaries
  const months: ('November' | 'December' | 'January')[] = ['November', 'December', 'January'];
  const monthlySummary = months.map((m) => {
    const monthPoints = points.filter((p) => p.month === m);
    const plannedAvg = monthPoints.reduce((acc, p) => acc + p.plannedOverallRate, 0) / monthPoints.length;
    const actualAvg = monthPoints.reduce((acc, p) => acc + p.actualOverallRate, 0) / monthPoints.length;
    const lastPoint = monthPoints[monthPoints.length - 1];

    return {
      month: m,
      label: m === 'November' ? 'Month 1: Nov 2025 (Basal)' : m === 'December' ? 'Month 2: Dec 2025 (Split 1)' : 'Month 3: Jan 2026 (Top-Dressing)',
      plannedAvgRate: Number(plannedAvg.toFixed(2)),
      actualAvgRate: Number(actualAvg.toFixed(2)),
      varianceQtHa: Number((actualAvg - plannedAvg).toFixed(2)),
      totalAppliedQt: lastPoint.actualTotalQuintals,
      compliancePct: Number(((actualAvg / plannedAvg) * 100).toFixed(1)),
    };
  });

  return {
    weeklyPoints: points,
    monthlySummary,
  };
}
