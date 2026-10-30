import React, { useState, useEffect } from 'react';
import {
  Save,
  Send,
  MapPin,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Droplets,
  Sprout,
  Users,
  ShieldAlert,
  Camera,
  RefreshCw,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SurveyRecord, IrrigationScheme, FarmlandPlot, WaterSourceType, IrrigationType, SoilType } from '../types/survey';
import { syncEngine } from '../services/syncEngine';

interface SurveyFormViewProps {
  onSubmissionComplete: () => void;
  isOnline: boolean;
  isAdmin?: boolean;
  onRequestAdminAuth?: (actionDesc: string, onSuccess?: () => void) => void;
}

export const SurveyFormView: React.FC<SurveyFormViewProps> = ({
  onSubmissionComplete,
  isOnline,
  isAdmin = false,
  onRequestAdminAuth,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [geoLocating, setGeoLocating] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [draftSavedMessage, setDraftSavedMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<SurveyRecord>>({
    enumerator_name: 'Getachew Haile',
    enumerator_phone: '0912120269',
    enumerator_role: 'Data Collector / Reporter',
    report_date: new Date().toISOString().split('T')[0],
    report_week: 2,
    report_month: 'October',
    report_year: 2026,
    phase: 'Phase 1 - Land & Sowing',

    region: 'Oromia',
    zone: 'East Shewa',
    woreda: 'Adama',
    kebele: 'Wonji Shoa',
    agro_zone: 'Midland (1500-2300m)',
    kebele_gps_lat: 8.455,
    kebele_gps_lng: 39.278,

    plan_area_ha: 1500,
    plan_hh_m: 900,
    plan_hh_f: 300,
    plan_hh_total: 1200,
    plan_yield_qt_ha: 42,
    plan_prod_qt: 63000,

    area_sown_cum_ha: 1410,
    ach_sown_pct: 94.0,
    area_gap_ha: 90,
    hh_part_m: 860,
    hh_part_f: 280,
    hh_part_total: 1140,
    hh_part_pct: 95.0,
    track_status: 'on_track',

    land_identified_ha: 1500,
    land_prepared_cum_ha: 1480,
    prep_method: 'Tractor',
    soil_type: 'clay',
    soil_acidity: 'Non-acidic (pH > 6.5)',
    prev_crop: 'Teff / Haricot Bean',
    wheat_varieties: ['Kakaba', 'Kingbird'],

    seed_dist_total_qt: 1800,
    seed_used_total_qt: 1780,

    stages: {
      emergence_ha: 150,
      tillering_ha: 600,
      stem_elongation_ha: 450,
      booting_ha: 210,
      heading_flowering_ha: 0,
      milk_dough_ha: 0,
      maturity_ha: 0,
      harvested_ha: 0,
    },

    inputs: {
      urea_need_qt: 1500,
      urea_supplied_qt: 1400,
      urea_used_qt: 1350,
      nps_need_qt: 1500,
      nps_supplied_qt: 1500,
      nps_used_qt: 1500,
      npsb_need_qt: 0,
      npsb_supplied_qt: 0,
      npsb_used_qt: 0,
      compost_used_m3: 300,
      herbicide_need_l: 1400,
      herbicide_used_l: 1350,
      fungicide_need_l: 900,
      fungicide_used_l: 850,
      insecticide_need_l: 200,
      insecticide_used_l: 180,
      knapsack_sprayers_total: 38,
      knapsack_sprayers_functional: 34,
    },

    schemes: [
      {
        id: 'sch_adama_01',
        name: 'Awash Central Pump Intake',
        source_name: 'Awash River Main Stream',
        source_type: 'river',
        irrigation_type: 'motor_pump',
        interval_days: 9,
        design_command_ha: 1500,
        wheat_actual_ha: 1410,
        beneficiaries_m: 860,
        beneficiaries_f: 280,
        gps_lat: 8.448,
        gps_lng: 39.284,
        pumps_total: 12,
        pumps_functional: 10,
        pumps_broken: 1,
        pumps_under_maintenance: 1,
        pumps_maintained_cumulative: 3,
        pumps_new_available: 2,
        pumps_new_distributed: 2,
        pumps_needed_additional: 1,
        pump_avg_capacity_ls: 50,
      },
    ],

    farmlands: [
      {
        id: 'fl_adama_01',
        plot_code: 'ADM-WJ-01',
        farmer_name: 'Tesfaye Alemu',
        gender: 'M',
        scheme_id: 'sch_adama_01',
        gps_lat: 8.452,
        gps_lng: 39.279,
        area_ha: 2.0,
        sowing_date: '2026-10-02',
        irrigations_applied: 3,
        expected_yield_qt_ha: 45,
        variety: 'Kakaba',
        growth_stage: 'tillering',
      },
    ],

    challenges: {
      water_shortage: false,
      fuel_power_shortage: true,
      fertilizer_shortage: false,
      seed_shortage: false,
      pest_rust_outbreak: false,
      pump_breakdown: true,
      canal_siltation: false,
      market_access: false,
      action_taken: 'Replaced impellers for 1 pump unit; fuel supply regulated by union.',
      support_needed: 'Need 1 standby generator for uninterrupted irrigation during line outages.',
      opportunities_notes: 'High farmer motivation in cluster arrangement with coordinated watering turns.',
      remarks: 'Vegetative growth is healthy and uniform.',
    },
  });

  // Load draft on mount if available
  useEffect(() => {
    const draft = localStorage.getItem('kobosync_active_draft');
    if (draft) {
      try {
        setFormData(JSON.parse(draft));
      } catch (e) {
        console.error('Failed to parse draft:', e);
      }
    }
  }, []);

  const updateField = (field: string, val: any) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: val };
      localStorage.setItem('kobosync_active_draft', JSON.stringify(next));
      return next;
    });
  };

  const updateNestedField = (parent: 'stages' | 'inputs' | 'challenges', child: string, val: any) => {
    setFormData((prev) => {
      const nextParent = { ...((prev[parent] as any) || {}), [child]: val };
      const next = { ...prev, [parent]: nextParent };
      localStorage.setItem('kobosync_active_draft', JSON.stringify(next));
      return next;
    });
  };

  // GPS Geolocation Grabber
  const handleGrabGps = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLocating(false);
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setFormData((prev) => ({
          ...prev,
          kebele_gps_lat: lat,
          kebele_gps_lng: lng,
        }));
      },
      (err) => {
        setGeoLocating(false);
        setGeoError(`GPS error: ${err.message}. Defaulting to kebele centroid.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Add Scheme Card
  const handleAddScheme = () => {
    const newScheme: IrrigationScheme = {
      id: `sch_${Date.now()}`,
      name: `Scheme ${((formData.schemes || []).length + 1)}`,
      source_name: 'Awash Basin Branch',
      source_type: 'river',
      irrigation_type: 'motor_pump',
      interval_days: 10,
      design_command_ha: 400,
      wheat_actual_ha: 380,
      beneficiaries_m: 240,
      beneficiaries_f: 80,
      gps_lat: formData.kebele_gps_lat || 8.45,
      gps_lng: formData.kebele_gps_lng || 39.28,
      pumps_total: 4,
      pumps_functional: 4,
      pumps_broken: 0,
      pumps_under_maintenance: 0,
      pumps_maintained_cumulative: 0,
      pumps_new_available: 0,
      pumps_new_distributed: 0,
      pumps_needed_additional: 0,
      pump_avg_capacity_ls: 40,
    };
    updateField('schemes', [...(formData.schemes || []), newScheme]);
  };

  const handleRemoveScheme = (index: number) => {
    const updated = [...(formData.schemes || [])];
    updated.splice(index, 1);
    updateField('schemes', updated);
  };

  const handleSchemeChange = (index: number, key: keyof IrrigationScheme, value: any) => {
    const updated = [...(formData.schemes || [])];
    updated[index] = { ...updated[index], [key]: value };
    updateField('schemes', updated);
  };

  // Add Plot Card
  const handleAddPlot = () => {
    const newPlot: FarmlandPlot = {
      id: `fl_${Date.now()}`,
      plot_code: `PLT-${((formData.farmlands || []).length + 1)}`,
      farmer_name: 'Farmer Name',
      gender: 'M',
      scheme_id: formData.schemes?.[0]?.id || '',
      gps_lat: formData.kebele_gps_lat || 8.45,
      gps_lng: formData.kebele_gps_lng || 39.28,
      area_ha: 1.5,
      sowing_date: new Date().toISOString().split('T')[0],
      irrigations_applied: 2,
      expected_yield_qt_ha: 42,
      variety: 'Kakaba',
      growth_stage: 'tillering',
    };
    updateField('farmlands', [...(formData.farmlands || []), newPlot]);
  };

  const handleRemovePlot = (index: number) => {
    const updated = [...(formData.farmlands || [])];
    updated.splice(index, 1);
    updateField('farmlands', updated);
  };

  const executeSubmission = async () => {
    setIsSubmitting(true);
    try {
      const result = await syncEngine.submitSurvey(formData);
      localStorage.removeItem('kobosync_active_draft');

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      alert(
        result.queuedOffline
          ? 'Survey saved to OFFLINE QUEUE! Your data is preserved locally in remote mode and will automatically sync and resolve conflicts when connection is restored.'
          : 'Survey successfully synced to KoboToolbox field database!'
      );

      onSubmissionComplete();
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Form Submission with Admin Auth restriction
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      if (onRequestAdminAuth) {
        onRequestAdminAuth(
          'Adding, saving, and submitting new field surveys is restricted to authorized administrators. Please enter administrator password (e.g. OBOA2026).',
          () => executeSubmission()
        );
      } else {
        alert('Action restricted: Administrator authorization required to submit field data.');
      }
      return;
    }
    await executeSubmission();
  };

  const steps = [
    { num: 1, title: '0. Reporting information' },
    { num: 2, title: 'Targets & Progress' },
    { num: 3, title: 'Crop Phenology & Inputs' },
    { num: 4, title: 'Schemes & Plots' },
    { num: 5, title: 'Challenges & Review' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Administrator Restriction Banner */}
      {!isAdmin ? (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-amber-900 shadow-sm">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Viewer Mode (Read-Only):</strong> Field data collection and survey submission is password restricted to authorized administrators.
            </span>
          </div>
          {onRequestAdminAuth && (
            <button
              type="button"
              onClick={() => onRequestAdminAuth('Unlock Administrator mode to submit field survey data')}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs cursor-pointer shrink-0 self-start sm:self-auto shadow-sm"
            >
              Unlock Admin
            </button>
          )}
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-center gap-2 text-xs text-emerald-800 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Administrator Mode Active:</strong> Verified to record, submit, and commit field survey data.
          </span>
        </div>
      )}

      {/* Form Header */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                KoboToolbox Compatible Form
              </span>
              <span className="text-xs text-slate-500 font-mono">ID: ayqceYfs6Dxi567kBEi7AZ</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">Irrigated Wheat Weekly Monitoring - Oromia</h2>
            <p className="text-xs text-slate-500">
              Offline-capable mobile field survey collector. Captures scheme infrastructure, plot GPS, and input status.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                localStorage.setItem('kobosync_active_draft', JSON.stringify(formData));
                setDraftSavedMessage('Draft saved locally at ' + new Date().toLocaleTimeString());
                setTimeout(() => setDraftSavedMessage(null), 3000);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer shadow-sm"
            >
              <Save className="w-3.5 h-3.5 text-emerald-600" />
              <span>Save Draft</span>
            </button>
          </div>
        </div>

        {draftSavedMessage && (
          <div className="mt-2 text-xs text-emerald-700 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{draftSavedMessage}</span>
          </div>
        )}

        {/* Step Indicator */}
        <div className="mt-5 grid grid-cols-5 gap-1.5 border-t border-slate-200 pt-3">
          {steps.map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setActiveStep(s.num)}
              className={`p-2 rounded-xl text-left text-xs transition-colors cursor-pointer ${
                activeStep === s.num
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <span className="block text-[10px] font-mono text-slate-500">Step {s.num}</span>
              <span className="truncate block font-semibold">{s.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STEP 1: 0. Reporting information */}
        {activeStep === 1 && (
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>0. Reporting information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Name of data collector / reporter *
                </label>
                <input
                  type="text"
                  required
                  value={formData.enumerator_name || ''}
                  onChange={(e) => updateField('enumerator_name', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none"
                  placeholder="e.g. Getachew Haile"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Phone number of reporter
                </label>
                <input
                  type="text"
                  value={formData.enumerator_phone || ''}
                  onChange={(e) => updateField('enumerator_phone', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none"
                  placeholder="e.g. 0912120269"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Position of reporter
                </label>
                <select
                  value={formData.enumerator_role || ''}
                  onChange={(e) => updateField('enumerator_role', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                >
                  <option>Data Collector / Reporter</option>
                  <option>Kebele Development Agent (DA)</option>
                  <option>Woreda Irrigation Agronomist</option>
                  <option>Zone Field Monitor</option>
                  <option>Regional Irrigation Supervisor</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Report Date *</label>
                <input
                  type="date"
                  required
                  value={formData.report_date || ''}
                  onChange={(e) => updateField('report_date', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Report Week (1-52) *</label>
                <input
                  type="number"
                  min="1"
                  max="52"
                  required
                  value={formData.report_week || 4}
                  onChange={(e) => updateField('report_week', Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Monitoring Phase</label>
                <select
                  value={formData.phase || ''}
                  onChange={(e) => updateField('phase', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                >
                  <option>Phase 1 - Land & Sowing</option>
                  <option>Phase 2 - Crop Care & Irrigation</option>
                  <option>Phase 3 - Harvest & Threshing</option>
                </select>
              </div>
            </div>

            <h4 className="text-xs font-bold text-slate-700 pt-3 border-t border-slate-200">Administrative Hierarchy</h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-slate-500 mb-1">Region</label>
                <input
                  type="text"
                  disabled
                  value="Oromia"
                  className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-lg px-3 py-2 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-medium">Zone *</label>
                <select
                  value={formData.zone || 'East Shewa'}
                  onChange={(e) => updateField('zone', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                >
                  <option>East Shewa</option>
                  <option>Arsi</option>
                  <option>West Arsi</option>
                  <option>Bale</option>
                  <option>Southwest Shewa</option>
                  <option>Jimma</option>
                  <option>Guji</option>
                  <option>Borena</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-medium">Woreda *</label>
                <input
                  type="text"
                  required
                  value={formData.woreda || ''}
                  onChange={(e) => updateField('woreda', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-medium">Kebele *</label>
                <input
                  type="text"
                  required
                  value={formData.kebele || ''}
                  onChange={(e) => updateField('kebele', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* GPS Capture */}
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Kebele GPS Coordinates (Lat / Lng)</span>
                </span>
                <button
                  type="button"
                  onClick={handleGrabGps}
                  disabled={geoLocating}
                  className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-medium cursor-pointer shadow-sm"
                >
                  <RefreshCw className={`w-3 h-3 ${geoLocating ? 'animate-spin' : ''}`} />
                  <span>{geoLocating ? 'Acquiring GPS...' : 'Capture My GPS'}</span>
                </button>
              </div>

              {geoError && <p className="text-[11px] text-amber-600 font-medium">{geoError}</p>}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] text-slate-500 font-medium">Latitude:</span>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.kebele_gps_lat || 8.44}
                    onChange={(e) => updateField('kebele_gps_lat', parseFloat(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 font-mono focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-medium">Longitude:</span>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.kebele_gps_lng || 39.06}
                    onChange={(e) => updateField('kebele_gps_lng', parseFloat(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 font-mono focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Targets & Progress */}
        {activeStep === 2 && (
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span>Section 2: Irrigated Wheat Targets & Sowing Progress</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Planned Area (ha) *</label>
                <input
                  type="number"
                  required
                  value={formData.plan_area_ha || 0}
                  onChange={(e) => {
                    const plan = Number(e.target.value);
                    const sown = formData.area_sown_cum_ha || 0;
                    updateField('plan_area_ha', plan);
                    updateField('ach_sown_pct', plan > 0 ? Number(((sown / plan) * 100).toFixed(1)) : 0);
                    updateField('area_gap_ha', Math.max(0, plan - sown));
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:border-emerald-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Cumulative Area Sown (ha) *</label>
                <input
                  type="number"
                  required
                  value={formData.area_sown_cum_ha || 0}
                  onChange={(e) => {
                    const sown = Number(e.target.value);
                    const plan = formData.plan_area_ha || 1;
                    updateField('area_sown_cum_ha', sown);
                    updateField('ach_sown_pct', Number(((sown / plan) * 100).toFixed(1)));
                    updateField('area_gap_ha', Math.max(0, plan - sown));
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-emerald-700 font-bold focus:border-emerald-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-medium">Sowing Achievement %</label>
                <input
                  type="text"
                  disabled
                  value={`${formData.ach_sown_pct || 0}%`}
                  className="w-full bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-emerald-800 font-bold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Participating Male Farmers</label>
                <input
                  type="number"
                  value={formData.hh_part_m || 0}
                  onChange={(e) => {
                    const m = Number(e.target.value);
                    const f = formData.hh_part_f || 0;
                    updateField('hh_part_m', m);
                    updateField('hh_part_total', m + f);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Participating Female Farmers</label>
                <input
                  type="number"
                  value={formData.hh_part_f || 0}
                  onChange={(e) => {
                    const f = Number(e.target.value);
                    const m = formData.hh_part_m || 0;
                    updateField('hh_part_f', f);
                    updateField('hh_part_total', m + f);
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Tracking Status</label>
                <select
                  value={formData.track_status || 'on_track'}
                  onChange={(e) => updateField('track_status', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                >
                  <option value="on_track">On Track (≥ 90%)</option>
                  <option value="lagging">Lagging (75 - 89%)</option>
                  <option value="critical">Critical (&lt; 75%)</option>
                  <option value="completed">Completed (100%)</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
              <span className="font-semibold text-slate-800 block mb-2">Land Preparation Agronomy:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-600 font-medium block mb-1">Land Prepared Cumulative (ha)</label>
                  <input
                    type="number"
                    value={formData.land_prepared_cum_ha || 0}
                    onChange={(e) => updateField('land_prepared_cum_ha', Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-600 font-medium block mb-1">Preparation Method</label>
                  <select
                    value={formData.prep_method || 'Tractor'}
                    onChange={(e) => updateField('prep_method', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 focus:border-emerald-600 focus:outline-none"
                  >
                    <option>Tractor</option>
                    <option>Oxen</option>
                    <option>Manual</option>
                    <option>Combined</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-600 font-medium block mb-1">Soil Type</label>
                  <select
                    value={formData.soil_type || 'clay'}
                    onChange={(e) => updateField('soil_type', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="clay">Clay</option>
                    <option value="black_vertisol">Black Vertisol</option>
                    <option value="loam">Loam</option>
                    <option value="sandy_loam">Sandy Loam</option>
                    <option value="alluvial">Alluvial</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Crop Phenology & Inputs */}
        {activeStep === 3 && (
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span>Section 3: Crop Growth Stages (ha) & Fertilizer Application</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-slate-600 font-medium block mb-1">Emergence (ha)</label>
                <input
                  type="number"
                  value={formData.stages?.emergence_ha || 0}
                  onChange={(e) => updateNestedField('stages', 'emergence_ha', Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Tillering (ha)</label>
                <input
                  type="number"
                  value={formData.stages?.tillering_ha || 0}
                  onChange={(e) => updateNestedField('stages', 'tillering_ha', Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Stem Elongation (ha)</label>
                <input
                  type="number"
                  value={formData.stages?.stem_elongation_ha || 0}
                  onChange={(e) => updateNestedField('stages', 'stem_elongation_ha', Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Booting (ha)</label>
                <input
                  type="number"
                  value={formData.stages?.booting_ha || 0}
                  onChange={(e) => updateNestedField('stages', 'booting_ha', Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Heading / Flowering (ha)</label>
                <input
                  type="number"
                  value={formData.stages?.heading_flowering_ha || 0}
                  onChange={(e) => updateNestedField('stages', 'heading_flowering_ha', Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Milk / Dough (ha)</label>
                <input
                  type="number"
                  value={formData.stages?.milk_dough_ha || 0}
                  onChange={(e) => updateNestedField('stages', 'milk_dough_ha', Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Maturity (ha)</label>
                <input
                  type="number"
                  value={formData.stages?.maturity_ha || 0}
                  onChange={(e) => updateNestedField('stages', 'maturity_ha', Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium block mb-1">Harvested (ha)</label>
                <input
                  type="number"
                  value={formData.stages?.harvested_ha || 0}
                  onChange={(e) => updateNestedField('stages', 'harvested_ha', Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 focus:border-emerald-600 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <h4 className="text-xs font-bold text-slate-800 pt-3 border-t border-slate-200">
              Fertilizers & Rust Fungicides
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-800 block mb-1.5">Urea Fertilizer (qt)</span>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Needed:</span>
                    <input
                      type="number"
                      value={formData.inputs?.urea_need_qt || 0}
                      onChange={(e) => updateNestedField('inputs', 'urea_need_qt', Number(e.target.value))}
                      className="w-24 bg-white border border-slate-300 rounded px-2 py-1 text-right text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Applied/Used:</span>
                    <input
                      type="number"
                      value={formData.inputs?.urea_used_qt || 0}
                      onChange={(e) => updateNestedField('inputs', 'urea_used_qt', Number(e.target.value))}
                      className="w-24 bg-white border border-slate-300 rounded px-2 py-1 text-right text-emerald-700 font-bold focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-800 block mb-1.5">NPS Fertilizer (qt)</span>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Needed:</span>
                    <input
                      type="number"
                      value={formData.inputs?.nps_need_qt || 0}
                      onChange={(e) => updateNestedField('inputs', 'nps_need_qt', Number(e.target.value))}
                      className="w-24 bg-white border border-slate-300 rounded px-2 py-1 text-right text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Applied/Used:</span>
                    <input
                      type="number"
                      value={formData.inputs?.nps_used_qt || 0}
                      onChange={(e) => updateNestedField('inputs', 'nps_used_qt', Number(e.target.value))}
                      className="w-24 bg-white border border-slate-300 rounded px-2 py-1 text-right text-emerald-700 font-bold focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-800 block mb-1.5">Rust Fungicide (L)</span>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Needed:</span>
                    <input
                      type="number"
                      value={formData.inputs?.fungicide_need_l || 0}
                      onChange={(e) => updateNestedField('inputs', 'fungicide_need_l', Number(e.target.value))}
                      className="w-24 bg-white border border-slate-300 rounded px-2 py-1 text-right text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Applied/Used:</span>
                    <input
                      type="number"
                      value={formData.inputs?.fungicide_used_l || 0}
                      onChange={(e) => updateNestedField('inputs', 'fungicide_used_l', Number(e.target.value))}
                      className="w-24 bg-white border border-slate-300 rounded px-2 py-1 text-right text-purple-700 font-bold focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Schemes & Plots */}
        {activeStep === 4 && (
          <div className="space-y-4">
            {/* Irrigation Schemes Repeat */}
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-600" />
                  <span>Section 4A: Irrigation Schemes & Water Infrastructure</span>
                </h3>
                <button
                  type="button"
                  onClick={handleAddScheme}
                  className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Scheme</span>
                </button>
              </div>

              {(formData.schemes || []).map((scheme, sIdx) => (
                <div key={`${scheme.id || 'sch'}_${sIdx}`} className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800">Scheme #{sIdx + 1}</span>
                    {(formData.schemes || []).length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveScheme(sIdx)}
                        className="text-rose-600 hover:text-rose-700 text-xs flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-slate-700 mb-1 block font-medium">Scheme Name *</label>
                      <input
                        type="text"
                        required
                        value={scheme.name}
                        onChange={(e) => handleSchemeChange(sIdx, 'name', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 mb-1 block font-medium">Water Source Name</label>
                      <input
                        type="text"
                        value={scheme.source_name}
                        onChange={(e) => handleSchemeChange(sIdx, 'source_name', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 mb-1 block font-medium">Source Type</label>
                      <select
                        value={scheme.source_type}
                        onChange={(e) => handleSchemeChange(sIdx, 'source_type', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 focus:border-emerald-600 focus:outline-none"
                      >
                        <option value="river">River</option>
                        <option value="lake">Lake</option>
                        <option value="dam">Dam / Reservoir</option>
                        <option value="spring">Spring</option>
                        <option value="deep_well">Deep Well</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-700 mb-1 block font-medium">Wheat Area (ha)</label>
                      <input
                        type="number"
                        value={scheme.wheat_actual_ha}
                        onChange={(e) => handleSchemeChange(sIdx, 'wheat_actual_ha', Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 mb-1 block font-medium">Irrigation Interval (Days)</label>
                      <input
                        type="number"
                        value={scheme.interval_days}
                        onChange={(e) => handleSchemeChange(sIdx, 'interval_days', Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 mb-1 block font-medium">Discharge Rate (L/s)</label>
                      <input
                        type="number"
                        value={scheme.pump_avg_capacity_ls}
                        onChange={(e) => handleSchemeChange(sIdx, 'pump_avg_capacity_ls', Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-900 focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-2.5">
                    <span className="text-[11px] font-semibold text-slate-700 block mb-1.5">
                      Pumps Inventory & Condition:
                    </span>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 font-medium">Total Pumps</span>
                        <input
                          type="number"
                          value={scheme.pumps_total}
                          onChange={(e) => handleSchemeChange(sIdx, 'pumps_total', Number(e.target.value))}
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-mono focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-700 font-semibold">Functional</span>
                        <input
                          type="number"
                          value={scheme.pumps_functional}
                          onChange={(e) => handleSchemeChange(sIdx, 'pumps_functional', Number(e.target.value))}
                          className="w-full bg-white border border-emerald-300 rounded px-2 py-1 text-emerald-700 font-mono font-bold focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-amber-700 font-semibold">Under Maint.</span>
                        <input
                          type="number"
                          value={scheme.pumps_under_maintenance}
                          onChange={(e) =>
                            handleSchemeChange(sIdx, 'pumps_under_maintenance', Number(e.target.value))
                          }
                          className="w-full bg-white border border-amber-300 rounded px-2 py-1 text-amber-700 font-mono focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-rose-700 font-semibold">Broken</span>
                        <input
                          type="number"
                          value={scheme.pumps_broken}
                          onChange={(e) => handleSchemeChange(sIdx, 'pumps_broken', Number(e.target.value))}
                          className="w-full bg-white border border-rose-300 rounded px-2 py-1 text-rose-700 font-mono font-bold focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Farmland Plots Repeat */}
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Section 4B: Farmland GPS Plots</span>
                </h3>
                <button
                  type="button"
                  onClick={handleAddPlot}
                  className="flex items-center gap-1 px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded text-xs font-semibold cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Farm Plot</span>
                </button>
              </div>

              {(formData.farmlands || []).map((plot, pIdx) => (
                <div key={`${plot.id || 'plot'}_${pIdx}`} className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sky-700">
                      Plot #{pIdx + 1} ({plot.plot_code})
                    </span>
                    {(formData.farmlands || []).length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePlot(pIdx)}
                        className="text-rose-600 hover:text-rose-700 cursor-pointer font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-600 font-medium">Farmer Name:</span>
                      <input
                        type="text"
                        value={plot.farmer_name}
                        onChange={(e) => {
                          const updated = [...(formData.farmlands || [])];
                          updated[pIdx].farmer_name = e.target.value;
                          updateField('farmlands', updated);
                        }}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 font-medium">Area (ha):</span>
                      <input
                        type="number"
                        step="0.1"
                        value={plot.area_ha}
                        onChange={(e) => {
                          const updated = [...(formData.farmlands || [])];
                          updated[pIdx].area_ha = Number(e.target.value);
                          updateField('farmlands', updated);
                        }}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 font-medium">Variety:</span>
                      <input
                        type="text"
                        value={plot.variety}
                        onChange={(e) => {
                          const updated = [...(formData.farmlands || [])];
                          updated[pIdx].variety = e.target.value;
                          updateField('farmlands', updated);
                        }}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-600 font-medium">Expected Yield (qt/ha):</span>
                      <input
                        type="number"
                        value={plot.expected_yield_qt_ha}
                        onChange={(e) => {
                          const updated = [...(formData.farmlands || [])];
                          updated[pIdx].expected_yield_qt_ha = Number(e.target.value);
                          updateField('farmlands', updated);
                        }}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 font-semibold focus:border-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: Challenges & Review */}
        {activeStep === 5 && (
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Section 5: Field Challenges, Interventions & Submission</span>
            </h3>

            <div className="space-y-3 text-xs">
              <span className="font-semibold text-slate-800 block">Select Key Challenges Encountered This Week:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { key: 'water_shortage', label: 'Water Discharge Shortage' },
                  { key: 'fuel_power_shortage', label: 'Fuel / Electricity Outage' },
                  { key: 'pump_breakdown', label: 'Mechanical Pump Breakdown' },
                  { key: 'pest_rust_outbreak', label: 'Wheat Rust Outbreak' },
                  { key: 'fertilizer_shortage', label: 'Fertilizer Delivery Lag' },
                  { key: 'seed_shortage', label: 'Certified Seed Deficit' },
                  { key: 'canal_siltation', label: 'Canal Sedimentation' },
                  { key: 'market_access', label: 'Cooperative Market Bottleneck' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean((formData.challenges as any)?.[item.key])}
                      onChange={(e) => updateNestedField('challenges', item.key, e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-0"
                    />
                    <span className="text-slate-800 font-medium">{item.label}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Actions Taken So Far</label>
                <textarea
                  rows={2}
                  value={formData.challenges?.action_taken || ''}
                  onChange={(e) => updateNestedField('challenges', 'action_taken', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  placeholder="Describe remedial actions mobilized by farmers or local administration..."
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Specific Intervention Requested</label>
                <textarea
                  rows={2}
                  value={formData.challenges?.support_needed || ''}
                  onChange={(e) => updateNestedField('challenges', 'support_needed', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white"
                  placeholder="e.g. Spare impellers, diesel fuel quota, knapsack sprayers..."
                />
              </div>

              {/* Offline Submission Notice Banner */}
              <div
                className={`p-3 rounded-lg border flex items-start gap-2.5 text-xs ${
                  isOnline
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <div>
                  <span className="font-bold block">
                    {isOnline ? 'Online Mode Active' : 'Offline Field Collection Mode'}
                  </span>
                  <span>
                    {isOnline
                      ? 'Internet connectivity is live. Your submission will transmit immediately and sync with KoboToolbox.'
                      : 'Remote area offline mode active. Your survey will be safely queued in local device storage and automatically transmitted with conflict resolution once internet is detected.'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step Navigation & Submit Buttons */}
        <div className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
          <button
            type="button"
            disabled={activeStep === 1}
            onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
          >
            &larr; Previous Step
          </button>

          <div className="flex items-center gap-2">
            {activeStep < 5 ? (
              <button
                type="button"
                onClick={() => setActiveStep((prev) => Math.min(5, prev + 1))}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm"
              >
                Next Step &rarr;
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Field Survey'}</span>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
