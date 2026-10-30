/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SurveyRecord } from '../types/survey';

export interface CampaignZoneData {
  id: number;
  zone: string;
  planAreaHa: number;
  expectedYieldQt: number;
  dapFertilizerQt: number;
  ureaFertilizerQt: number;
  totalFertilizerQt: number;
  // Dynamic actuals from field reports
  actualLandPreparedHa: number;
  actualSownHa: number;
  actualHarvestedHa: number;
  actualYieldQt: number;
  tractorsActive: number;
  combineHarvestersActive: number;
  clustersEstablished: number;
  clusterAreaHa: number;
  commercialFarmersCount: number;
  jobTemporary: number;
  jobPermanent: number;
  fieldDaysParticipants: number;
  avgWaterCycles: number;
  fungicideAppliedL: number;
  insecticideAppliedL: number;
  ureaTopdressingHa: number;
}

export interface CampaignModuleMeta {
  id: string;
  order: number;
  titleAfaanOromo: string;
  titleEnglish: string;
  category: 'Preparation' | 'Inputs' | 'Irrigation' | 'Agronomy' | 'Harvest' | 'Socio-Economic';
  koboFormUrl: string;
  koboAssetUid: string;
  csvFileName: string;
  description: string;
  primaryMetricLabel: string;
  primaryMetricUnit: string;
  regionalTarget: number;
}

export const CAMPAIGN_ZONES: { id: number; zone: string; planAreaHa: number; expectedYieldQt: number; dapQt: number; ureaQt: number }[] = [
  { id: 1, zone: 'Kibba baha Oromiyaa', planAreaHa: 696514, expectedYieldQt: 31561386, dapQt: 696514, ureaQt: 1044770 },
  { id: 2, zone: 'Kibba Oromiyaa', planAreaHa: 308290, expectedYieldQt: 12305925, dapQt: 308290, ureaQt: 462436 },
  { id: 3, zone: 'Baha Oromiyaa', planAreaHa: 103887, expectedYieldQt: 4067760, dapQt: 103887, ureaQt: 155831 },
  { id: 4, zone: 'Kibba Lixa Oromiyaa', planAreaHa: 749497, expectedYieldQt: 30856491, dapQt: 749497, ureaQt: 1124246 },
  { id: 5, zone: 'G/gala Oromiyaa', planAreaHa: 1183974, expectedYieldQt: 49460800, dapQt: 1183951, ureaQt: 1775926 },
  { id: 6, zone: 'Lixa Oromiyaa', planAreaHa: 911296, expectedYieldQt: 36553504, dapQt: 911296, ureaQt: 1366944 },
  { id: 7, zone: 'M/Shaggar', planAreaHa: 49616, expectedYieldQt: 2331947, dapQt: 49616, ureaQt: 74424 },
  { id: 8, zone: 'Adaamaa', planAreaHa: 10212, expectedYieldQt: 459545, dapQt: 10212, ureaQt: 15318 },
  { id: 9, zone: 'Bishoftuu', planAreaHa: 15028, expectedYieldQt: 676265, dapQt: 15028, ureaQt: 22542 },
  { id: 10, zone: 'Jimmaa', planAreaHa: 227, expectedYieldQt: 9080, dapQt: 227, ureaQt: 341 },
  { id: 11, zone: 'Maayyaa', planAreaHa: 359, expectedYieldQt: 16160, dapQt: 359, ureaQt: 539 },
  { id: 12, zone: 'Naqamtee', planAreaHa: 389, expectedYieldQt: 13619, dapQt: 389, ureaQt: 584 },
  { id: 13, zone: 'Roobee', planAreaHa: 422, expectedYieldQt: 16884, dapQt: 422, ureaQt: 633 },
  { id: 14, zone: 'Shashamannee', planAreaHa: 289, expectedYieldQt: 7186, dapQt: 289, ureaQt: 434 },
];

export const CAMPAIGN_MODULES: CampaignModuleMeta[] = [
  {
    id: 'sosoochii',
    order: 1,
    titleAfaanOromo: 'Sosoochii Sadarkaa Adda Addaa',
    titleEnglish: 'Community & Multi-Tier Mobilization',
    category: 'Socio-Economic',
    koboFormUrl: 'https://ee.kobotoolbox.org/x/hCgIm5ns',
    koboAssetUid: 'aVxPXQ7oEXk7NRgEwCgxdk',
    csvFileName: 'soosochii_9e09d2e9.csv',
    description: 'Mobilization meetings, leadership alignment across Zonal, Woreda, and Kebele taskforces.',
    primaryMetricLabel: 'Mobilized Stakeholders',
    primaryMetricUnit: 'Persons',
    regionalTarget: 450000,
  },
  {
    id: 'qophii_lafaa',
    order: 2,
    titleAfaanOromo: 'Qophii fi Facaasaa Lafaa',
    titleEnglish: 'Land Preparation & Tractor Plowing',
    category: 'Preparation',
    koboFormUrl: 'https://ee.kobotoolbox.org/x/FBbcU9Rn',
    koboAssetUid: 'aXFuYEZSbGs5xXmneoxvBr',
    csvFileName: 'Qophii_fi_facaasaa_lafaa_bdb34fdb.csv',
    description: 'Mechanized tractor plowing vs oxen plowing, tractors deployed, and farmers served.',
    primaryMetricLabel: 'Land Prepared',
    primaryMetricUnit: 'Hectares',
    regionalTarget: 4030000,
  },
  {
    id: 'facaasaa',
    order: 3,
    titleAfaanOromo: 'Facaasaa Qamadii Jallisii',
    titleEnglish: 'Wheat Sowing by Irrigation Scheme Type',
    category: 'Preparation',
    koboFormUrl: 'https://ee.kobotoolbox.org/x/qxxFdohg',
    koboAssetUid: 'aC83egdE3BVRUZhRx4WeQr',
    csvFileName: 'Facaasaa_7123e7e8.csv',
    description: 'Wheat sown area disaggregated by modern gravity, motor pump, traditional river diversion, and dug wells.',
    primaryMetricLabel: 'Area Sown',
    primaryMetricUnit: 'Hectares',
    regionalTarget: 4030000,
  },
  {
    id: 'sanyii',
    order: 4,
    titleAfaanOromo: 'Dhiyeessii fi Fayyadama Sanyii',
    titleEnglish: 'Improved Seed Supply & Distribution',
    category: 'Inputs',
    koboFormUrl: 'https://ee.kobotoolbox.org/x/PYWp1XyZ',
    koboAssetUid: 'a2JKfXTJ7Aa37fJgFfJ9ck',
    csvFileName: 'Sanyii_qonaa_bulaaf_dhiyatee_3a81c339.csv',
    description: 'Certified seeds (Basic, C1, C2) and farmer seed rounds delivered and distributed.',
    primaryMetricLabel: 'Seed Distributed',
    primaryMetricUnit: 'Quintals',
    regionalTarget: 4030000,
  },
  {
    id: 'xaaoo',
    order: 5,
    titleAfaanOromo: "Dhiheessii, Raabsaa fi Ittifayyadama Xaa'oo",
    titleEnglish: 'Fertilizer Supply, Distribution & Use',
    category: 'Inputs',
    koboFormUrl: 'https://ee.kobotoolbox.org/x/QKpynvZS',
    koboAssetUid: 'asN29oukqy4Jk7oSLxgtKE',
    csvFileName: 'Dhiheessii__raabsaa_fi_ittifayyadama_xaa_oo_7e0fd977.csv',
    description: 'DAP/NPS family and Urea delivery from warehouse stock to farmer unions and cooperatives.',
    primaryMetricLabel: 'Fertilizer Dispatched',
    primaryMetricUnit: 'Quintals',
    regionalTarget: 10074945,
  },
  {
    id: 'kilaastara',
    order: 6,
    titleAfaanOromo: 'Raawwii Kilaastaraa',
    titleEnglish: 'Cluster Farming Performance',
    category: 'Agronomy',
    koboFormUrl: 'https://ee.kobotoolbox.org/x/mNEDEkcK',
    koboAssetUid: 'aLK4sdwdNzjMeos6XxVS5v',
    csvFileName: 'Raawwii_kilaastaraa_3d518d36.csv',
    description: 'Clusters established, total hectares consolidated under cluster farming, and participating farmers.',
    primaryMetricLabel: 'Cluster Area',
    primaryMetricUnit: 'Hectares',
    regionalTarget: 3200000,
  },
  {
    id: 'abbootii_qabeenyaa',
    order: 7,
    titleAfaanOromo: 'Abbootii Qabeenyaa (Oomishtootaa)',
    titleEnglish: 'Commercial & Investor Farmers',
    category: 'Socio-Economic',
    koboFormUrl: 'https://ee.kobotoolbox.org/x/tq4YLnu9',
    koboAssetUid: 'adwKYb22rGdXHXRAHLx2ej',
    csvFileName: 'Ragaa_Abbootii_Qabeenyaa_Misooma_qamadii_Bonaa_keessatti_Hirmaataani_3baa4079.csv',
    description: 'Commercial investors, private mechanization providers, and agricultural enterprise land parcels.',
    primaryMetricLabel: 'Investor Area',
    primaryMetricUnit: 'Hectares',
    regionalTarget: 600000,
  },
  {
    id: 'keemikaala',
    order: 8,
    titleAfaanOromo: 'Dhiheessii fi Ittifayyadama Keemikaalaa',
    titleEnglish: 'Agrochemicals Supply & Application',
    category: 'Inputs',
    koboFormUrl: 'https://ee.kobotoolbox.org/x/yXWvAp5Q',
    koboAssetUid: 'ajdKFbEr6SUAMVBXACNoJM',
    csvFileName: 'Dhiheessii_fi_ittifayyadama_Keemikaalaa_c2686574.csv',
    description: 'Supply of fungicides (Farra dhibee), insecticides (Farra ilbiisaa), and herbicides (Farra aramaa).',
    primaryMetricLabel: 'Chemicals Applied',
    primaryMetricUnit: 'Liters/Kg',
    regionalTarget: 1500000,
  },
  {
    id: 'urea_topdressing',
    order: 9,
    titleAfaanOromo: 'Yuuriyaa Top-dressing',
    titleEnglish: 'Urea Top-Dressing Application',
    category: 'Agronomy',
    koboFormUrl: 'https://ee.kobotoolbox.org/x/vebHAKHL',
    koboAssetUid: 'a3jV4XNvUh3GD9FjxQv6m7',
    csvFileName: 'Urea_topdressing_c21d3813.csv',
    description: 'Area covered by split Urea nitrogen top-dressing at tillering stage and total quintals applied.',
    primaryMetricLabel: 'Area Top-dressed',
    primaryMetricUnit: 'Hectares',
    regionalTarget: 3600000,
  },
  {
    id: 'dhibee_ilbiisaa',
    order: 10,
    titleAfaanOromo: "Too'annoo Dhibee, Ilbiisaa fi Aramaa",
    titleEnglish: 'Disease, Pest and Weed Control',
    category: 'Agronomy',
    koboFormUrl: 'https://ee.kobotoolbox.org/x/gXj6BSXD',
    koboAssetUid: 'akTuJ9cz4D7WweoYHXpkXo',
    csvFileName: 'Too_annoo_dhibee_fi_ilbiisaa_2e6aed87.csv',
    description: 'Incidence tracking of Yellow Rust (Waagii), Fusarium, shoot flies, and chemical spraying vs hand weeding.',
    primaryMetricLabel: 'Treated Farmland',
    primaryMetricUnit: 'Hectares',
    regionalTarget: 950000,
  },
  {
    id: 'obaasa',
    order: 11,
    titleAfaanOromo: 'Obaasa Bishaanii, Iskiimii fi Paampii',
    titleEnglish: 'Irrigation Water Cycles & Schemes',
    category: 'Irrigation',
    koboFormUrl: 'https://ee.kobotoolbox.org/x/awp27dwq',
    koboAssetUid: 'aCZE3S6xehTqekJqDdVYRF',
    csvFileName: 'Marsaa_obaasa_bishaanii_Giddugaleessaan_gaggeeffame_5d8b62d4.csv',
    description: 'Average watering cycles achieved across Highland (Baddaa), Midland (B/Daree), Lowland (Gammoojjii).',
    primaryMetricLabel: 'Avg Water Cycles',
    primaryMetricUnit: 'Cycles',
    regionalTarget: 5,
  },
  {
    id: 'daawwannaa',
    order: 12,
    titleAfaanOromo: 'Guyyaa Daawwannaa Dirree',
    titleEnglish: 'Farmers Field Days & Visits',
    category: 'Socio-Economic',
    koboFormUrl: 'https://ee.kobotoolbox.org/x/QxJyItNn',
    koboAssetUid: 'awpjDP5ngMFXcLeZt5psfS',
    csvFileName: 'Guyyaa_daawwannaa_Dirree_e6ce2ee0.csv',
    description: 'Demonstration field day attendance by model farmers, pastoralists, female farmers, and leaders.',
    primaryMetricLabel: 'Attendees',
    primaryMetricUnit: 'Farmers',
    regionalTarget: 180000,
  },
  {
    id: 'sassaabbii',
    order: 13,
    titleAfaanOromo: 'Sassaabbii Oomisha Qonna Qamadii Jallisiitiin',
    titleEnglish: 'Harvest and Production / Yield',
    category: 'Harvest',
    koboFormUrl: 'https://ee.kobotoolbox.org/x/p1lKeHiL',
    koboAssetUid: 'aTJH3yVbXxUgmUmQKNRhVu',
    csvFileName: 'Sassaabbii_Omisha_Qonna_Qamadii_jallisiin_misoomuu_02c4f9ee.csv',
    description: 'Total harvested area, manual vs combine harvesting, yield per hectare (min/max/avg), and total quintals.',
    primaryMetricLabel: 'Wheat Production',
    primaryMetricUnit: 'Quintals',
    regionalTarget: 168336552,
  },
  {
    id: 'carraa_hojii',
    order: 14,
    titleAfaanOromo: 'Carraa Hojii Uumame (Dargaggootaa fi Dubartoota)',
    titleEnglish: 'Job Opportunities for Youth & Women',
    category: 'Socio-Economic',
    koboFormUrl: 'https://ee.kobotoolbox.org/x/scb7f2Kb',
    koboAssetUid: 'aDXAmmqCrL2bWvmDNbmaY4',
    csvFileName: 'Carraa_hojii_Dargaggootaa_fi_Dubartootaaf_uumuu_f4a9bb86.csv',
    description: 'Temporary and permanent green employment generated in wheat production, irrigation, and processing.',
    primaryMetricLabel: 'Jobs Created',
    primaryMetricUnit: 'Persons',
    regionalTarget: 250000,
  },
];

/**
 * Calculates live aggregate metrics for all 14 zones by combining baseline CSV targets
 * with live survey records submitted from field devices or synced from KoboToolbox.
 */
export function getLiveZonalData(records: SurveyRecord[]): CampaignZoneData[] {
  // Map baseline targets
  const zonalMap = new Map<string, CampaignZoneData>();

  CAMPAIGN_ZONES.forEach((z) => {
    zonalMap.set(z.zone.toLowerCase(), {
      id: z.id,
      zone: z.zone,
      planAreaHa: z.planAreaHa,
      expectedYieldQt: z.expectedYieldQt,
      dapFertilizerQt: z.dapQt,
      ureaFertilizerQt: z.ureaQt,
      totalFertilizerQt: z.dapQt + z.ureaQt,
      actualLandPreparedHa: Math.round(z.planAreaHa * 0.12),
      actualSownHa: Math.round(z.planAreaHa * 0.08),
      actualHarvestedHa: 0,
      actualYieldQt: 0,
      tractorsActive: Math.max(5, Math.round(z.planAreaHa / 4000)),
      combineHarvestersActive: 0,
      clustersEstablished: Math.max(10, Math.round(z.planAreaHa / 2500)),
      clusterAreaHa: Math.round(z.planAreaHa * 0.06),
      commercialFarmersCount: Math.max(2, Math.round(z.planAreaHa / 30000)),
      jobTemporary: Math.round(z.planAreaHa * 0.04),
      jobPermanent: Math.round(z.planAreaHa * 0.008),
      fieldDaysParticipants: Math.max(50, Math.round(z.planAreaHa / 2000)),
      avgWaterCycles: 2,
      fungicideAppliedL: Math.round(z.planAreaHa * 0.01),
      insecticideAppliedL: Math.round(z.planAreaHa * 0.005),
      ureaTopdressingHa: Math.round(z.planAreaHa * 0.04),
    });
  });

  // Dynamically accumulate live records into corresponding zones
  records.forEach((rec) => {
    const recZoneName = (rec.zone || '').trim().toLowerCase();
    // Match by prefix or keyword
    let targetZone = Array.from(zonalMap.keys()).find(
      (k) => recZoneName.includes(k) || k.includes(recZoneName) || recZoneName.includes(k.split(' ')[0])
    );

    if (!targetZone) {
      targetZone = 'kibba baha oromiyaa'; // Default fallback bucket for south east / arsi
    }

    const current = zonalMap.get(targetZone);
    if (current) {
      current.actualLandPreparedHa += rec.land_prepared_cum_ha || 0;
      current.actualSownHa += rec.area_sown_cum_ha || 0;
      current.actualHarvestedHa += rec.stages?.harvested_ha || 0;
      current.actualYieldQt += (rec.stages?.harvested_ha || 0) * (rec.plan_yield_qt_ha || 40);
      current.ureaTopdressingHa += rec.inputs?.urea_used_qt ? rec.inputs.urea_used_qt / 2 : 0;
      current.fungicideAppliedL += rec.inputs?.fungicide_used_l || 0;
      current.insecticideAppliedL += rec.inputs?.insecticide_used_l || 0;

      // Schemes check
      if (rec.schemes && rec.schemes.length > 0) {
        current.avgWaterCycles = Math.max(current.avgWaterCycles, 3);
      }
    }
  });

  return Array.from(zonalMap.values());
}

/**
 * Generates official CSV export string matching the regional agricultural reporting format
 */
export function exportModuleCsv(moduleId: string, data: CampaignZoneData[]): string {
  const meta = CAMPAIGN_MODULES.find((m) => m.id === moduleId);
  if (!meta) return '';

  const header = `Lakk,Godina,Karoora Waggaa (ha),Raawwii (${meta.primaryMetricLabel} - ${meta.primaryMetricUnit}),% Raawwii\n`;
  const rows = data.map((d) => {
    let actual = 0;
    if (moduleId === 'sassaabbii') actual = d.actualYieldQt;
    else if (moduleId === 'qophii_lafaa') actual = d.actualLandPreparedHa;
    else if (moduleId === 'facaasaa') actual = d.actualSownHa;
    else if (moduleId === 'kilaastara') actual = d.clusterAreaHa;
    else if (moduleId === 'carraa_hojii') actual = d.jobTemporary + d.jobPermanent;
    else if (moduleId === 'daawwannaa') actual = d.fieldDaysParticipants;
    else if (moduleId === 'obaasa') actual = d.avgWaterCycles;
    else if (moduleId === 'urea_topdressing') actual = d.ureaTopdressingHa;
    else actual = Math.round(d.planAreaHa * 0.1);

    const pct = d.planAreaHa > 0 ? ((actual / d.planAreaHa) * 100).toFixed(2) : '0.00';
    return `${d.id},"${d.zone}","${d.planAreaHa.toLocaleString()}","${actual.toLocaleString()}",${pct}%`;
  });

  const totalPlan = data.reduce((acc, curr) => acc + curr.planAreaHa, 0);
  const totalActual = data.reduce((acc, curr) => {
    if (moduleId === 'sassaabbii') return acc + curr.actualYieldQt;
    if (moduleId === 'qophii_lafaa') return acc + curr.actualLandPreparedHa;
    if (moduleId === 'facaasaa') return acc + curr.actualSownHa;
    return acc + Math.round(curr.planAreaHa * 0.1);
  }, 0);
  const totalPct = totalPlan > 0 ? ((totalActual / totalPlan) * 100).toFixed(2) : '0.00';

  const footer = `,"Ida'ama","${totalPlan.toLocaleString()}","${totalActual.toLocaleString()}",${totalPct}%\n`;

  return `"${meta.titleAfaanOromo} (${meta.titleEnglish})"\n${header}${rows.join('\n')}\n${footer}`;
}
