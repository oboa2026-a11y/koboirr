import { SurveyRecord } from '../types/survey';

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(Math.round(num));
};

export const formatHectares = (ha: number): string => {
  return `${formatNumber(ha)} ha`;
};

export const formatQuintals = (qt: number): string => {
  return `${formatNumber(qt)} qt`;
};

export const exportToCsv = (records: SurveyRecord[]): void => {
  const headers = [
    'ID',
    'Report Date',
    'Week',
    'Zone',
    'Woreda',
    'Kebele',
    'Agro Zone',
    'Plan Area (ha)',
    'Cumulative Sown (ha)',
    'Achievement %',
    'Plan Beneficiaries',
    'Actual Beneficiaries',
    'Track Status',
    'Urea Used (qt)',
    'NPS Used (qt)',
    'Fungicide Used (L)',
    'Schemes Count',
    'Pumps Total',
    'Pumps Functional',
    'Sync Status',
    'Synced At',
  ];

  const rows = records.map((r) => [
    r.id,
    r.report_date,
    r.report_week,
    `"${r.zone}"`,
    `"${r.woreda}"`,
    `"${r.kebele}"`,
    `"${r.agro_zone}"`,
    r.plan_area_ha,
    r.area_sown_cum_ha,
    r.ach_sown_pct,
    r.plan_hh_total,
    r.hh_part_total,
    r.track_status,
    r.inputs.urea_used_qt,
    r.inputs.nps_used_qt,
    r.inputs.fungicide_used_l,
    r.schemes.length,
    r.schemes.reduce((acc, s) => acc + s.pumps_total, 0),
    r.schemes.reduce((acc, s) => acc + s.pumps_functional, 0),
    r.syncStatus,
    r.syncedAt || '',
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `kobo_wheat_monitoring_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToGeoJson = (records: SurveyRecord[]): void => {
  const features = records.map((r) => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [r.kebele_gps_lng, r.kebele_gps_lat],
    },
    properties: {
      id: r.id,
      zone: r.zone,
      woreda: r.woreda,
      kebele: r.kebele,
      plan_ha: r.plan_area_ha,
      sown_ha: r.area_sown_cum_ha,
      ach_pct: r.ach_sown_pct,
      beneficiaries: r.hh_part_total,
      track_status: r.track_status,
      schemes_count: r.schemes.length,
    },
  }));

  const geoJson = {
    type: 'FeatureCollection',
    features,
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(geoJson, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `kobo_wheat_spatial_${new Date().toISOString().split('T')[0]}.geojson`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
