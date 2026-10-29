import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SurveyRecord, IrrigationScheme, FarmlandPlot } from '../types/survey';
import { MapPin, Navigation, Droplets, Layers, Info, Filter, CheckCircle2, AlertTriangle } from 'lucide-react';
import { formatNumber } from '../utils/formatters';

interface MapViewProps {
  records: SurveyRecord[];
}

export const MapView: React.FC<MapViewProps> = ({ records }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [activeZone, setActiveZone] = useState<string>('all');
  const [selectedScheme, setSelectedScheme] = useState<IrrigationScheme | null>(null);

  // Extract all schemes with their parent woreda/zone info
  const schemesWithContext = records.flatMap((r) =>
    (r.schemes || []).map((s) => ({
      ...s,
      zone: r.zone,
      woreda: r.woreda,
      kebele: r.kebele,
      track_status: r.track_status,
    }))
  );

  // Extract all farmland plots
  const farmlandsWithContext = records.flatMap((r) =>
    (r.farmlands || []).map((f) => ({
      ...f,
      zone: r.zone,
      woreda: r.woreda,
      kebele: r.kebele,
    }))
  );

  const filteredSchemes =
    activeZone === 'all' ? schemesWithContext : schemesWithContext.filter((s) => s.zone === activeZone);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet map if not created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [8.2, 39.2], // Centered around Central/East Oromia (Adama, Lume, Arsi)
        zoom: 8,
        zoomControl: true,
      });

      // Base layer - OpenStreetMap Humanitarian / Standard
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    // Custom Icon generator
    const createCustomIcon = (type: 'scheme' | 'plot', status: 'optimal' | 'warning' | 'danger') => {
      const bg =
        status === 'optimal'
          ? 'background: #10b981; border: 2px solid #064e3b;'
          : status === 'warning'
          ? 'background: #f59e0b; border: 2px solid #78350f;'
          : 'background: #ef4444; border: 2px solid #7f1d1d;';

      const iconHtml = `
        <div style="${bg} width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.4); color: white; font-size: 11px; font-weight: bold;">
          ${type === 'scheme' ? '💧' : '🌾'}
        </div>
      `;

      return L.divIcon({
        html: iconHtml,
        className: 'custom-div-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
    };

    // Plot schemes
    filteredSchemes.forEach((s) => {
      const status = s.pumps_broken > 0 ? 'danger' : s.pumps_under_maintenance > 0 ? 'warning' : 'optimal';
      const marker = L.marker([s.gps_lat, s.gps_lng], {
        icon: createCustomIcon('scheme', status),
      }).addTo(map);

      const popupHtml = `
        <div style="font-family: sans-serif; font-size: 12px; color: #1e293b; min-width: 200px;">
          <h4 style="margin: 0 0 4px; font-weight: bold; font-size: 13px; color: #0f172a;">${s.name}</h4>
          <p style="margin: 0 0 6px; color: #64748b; font-size: 11px;">
            ${s.kebele}, ${s.woreda} (${s.zone} Zone)
          </p>
          <div style="background: #f1f5f9; padding: 6px; border-radius: 4px; margin-bottom: 6px;">
            <div><strong>Water Source:</strong> ${s.source_name} (${s.source_type})</div>
            <div><strong>Wheat Area:</strong> ${s.wheat_actual_ha} ha</div>
            <div><strong>Beneficiaries:</strong> ${s.beneficiaries_m + s.beneficiaries_f} HHs</div>
          </div>
          <div style="font-size: 11px;">
            <strong>Pumps Status:</strong>
            <span style="color: #10b981;">${s.pumps_functional} Active</span> |
            <span style="color: #f59e0b;">${s.pumps_under_maintenance} Maint</span> |
            <span style="color: #ef4444;">${s.pumps_broken} Down</span>
          </div>
        </div>
      `;
      marker.bindPopup(popupHtml);
      marker.on('click', () => {
        setSelectedScheme(s);
      });
    });

    // Plot farmlands
    farmlandsWithContext.forEach((f) => {
      const marker = L.circleMarker([f.gps_lat, f.gps_lng], {
        radius: 6,
        fillColor: '#38bdf8',
        color: '#0284c7',
        weight: 1.5,
        opacity: 1,
        fillOpacity: 0.8,
      }).addTo(map);

      const popupHtml = `
        <div style="font-family: sans-serif; font-size: 12px; color: #1e293b;">
          <strong>Plot: ${f.plot_code}</strong><br/>
          Farmer: ${f.farmer_name} (${f.gender})<br/>
          Area: ${f.area_ha} ha | Variety: ${f.variety}<br/>
          Stage: ${f.growth_stage} | Expected Yield: ${f.expected_yield_qt_ha} qt/ha
        </div>
      `;
      marker.bindPopup(popupHtml);
    });

    return () => {
      // Cleanup on unmount handled gracefully
    };
  }, [filteredSchemes, farmlandsWithContext]);

  const handleFlyTo = (scheme: IrrigationScheme) => {
    setSelectedScheme(scheme);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([scheme.gps_lat, scheme.gps_lng], 13, { duration: 1.2 });
    }
  };

  const zones = ['all', ...Array.from(new Set(records.map((r) => r.zone)))];

  return (
    <div className="space-y-4">
      {/* Map Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-lg">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Geographic Surveillance & Scheme Mapping</h3>
            <p className="text-xs text-slate-400">
              {filteredSchemes.length} irrigation schemes and {farmlandsWithContext.length} monitored GPS farmland plots
            </p>
          </div>
        </div>

        {/* Zone Selector */}
        <div className="flex items-center gap-2 text-xs bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400">Filter Zone:</span>
          <select
            value={activeZone}
            onChange={(e) => setActiveZone(e.target.value)}
            className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-slate-800">
              All Zones ({schemesWithContext.length} schemes)
            </option>
            {zones
              .filter((z) => z !== 'all')
              .map((z) => (
                <option key={z} value={z} className="bg-slate-800">
                  {z}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Map + Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main Map Container */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm h-[560px] relative">
          <div ref={mapContainerRef} className="w-full h-full z-10" />

          {/* Map Floating Legend */}
          <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-3 rounded-lg text-xs text-slate-200 shadow-lg pointer-events-auto">
            <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400 block mb-1.5">
              Map Legend
            </span>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-800"></span>
                <span>Optimal Scheme (All Pumps Working)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-800"></span>
                <span>Pumps Under Maintenance</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 border border-rose-800"></span>
                <span>Broken Pumps / Deficit</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 border border-sky-600"></span>
                <span>Monitored Farmland GPS Plot</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Scheme list & Inspector */}
        <div className="space-y-4">
          {/* Selected Scheme Details Card */}
          {selectedScheme ? (
            <div className="bg-slate-900 border border-emerald-600/50 p-4 rounded-xl shadow-sm text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Selected Scheme
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  {selectedScheme.gps_lat.toFixed(3)}, {selectedScheme.gps_lng.toFixed(3)}
                </span>
              </div>
              <h4 className="font-bold text-sm text-white">{selectedScheme.name}</h4>
              <p className="text-slate-400 text-[11px] mb-3">Source: {selectedScheme.source_name}</p>

              <div className="space-y-2 bg-slate-800/60 p-2.5 rounded border border-slate-700/60 text-slate-300">
                <div className="flex justify-between">
                  <span>Command Area:</span>
                  <span className="font-semibold text-white">{formatNumber(selectedScheme.wheat_actual_ha)} ha</span>
                </div>
                <div className="flex justify-between">
                  <span>Beneficiaries:</span>
                  <span className="font-semibold text-white">
                    {formatNumber(selectedScheme.beneficiaries_m + selectedScheme.beneficiaries_f)} HHs
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Irrigation Interval:</span>
                  <span className="font-semibold text-white">{selectedScheme.interval_days} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Discharge:</span>
                  <span className="font-semibold text-white">{selectedScheme.pump_avg_capacity_ls} L/s</span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">Pump Inventory:</span>
                <div className="grid grid-cols-3 gap-1 text-center font-mono">
                  <div className="bg-emerald-950/60 p-1.5 rounded border border-emerald-800 text-emerald-300">
                    <span className="block text-sm font-bold">{selectedScheme.pumps_functional}</span>
                    <span className="text-[9px]">Functional</span>
                  </div>
                  <div className="bg-amber-950/60 p-1.5 rounded border border-amber-800 text-amber-300">
                    <span className="block text-sm font-bold">{selectedScheme.pumps_under_maintenance}</span>
                    <span className="text-[9px]">Maint.</span>
                  </div>
                  <div className="bg-rose-950/60 p-1.5 rounded border border-rose-800 text-rose-300">
                    <span className="block text-sm font-bold">{selectedScheme.pumps_broken}</span>
                    <span className="text-[9px]">Broken</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs text-center text-slate-400">
              <Info className="w-5 h-5 mx-auto mb-1.5 text-slate-500" />
              <span>Click any map marker or select a scheme below to inspect its live pump and water data.</span>
            </div>
          )}

          {/* Scheme Quick List */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2.5">Schemes In Focus</h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {filteredSchemes.map((s, idx) => (
                <button
                  key={`${s.id}_${s.kebele}_${idx}`}
                  onClick={() => handleFlyTo(s)}
                  className={`w-full text-left p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                    selectedScheme?.id === s.id
                      ? 'bg-emerald-950/40 border-emerald-600/50 text-white'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="font-semibold truncate">{s.name}</div>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
                    <span>
                      {s.woreda} &bull; {s.wheat_actual_ha} ha
                    </span>
                    <span
                      className={`font-semibold ${
                        s.pumps_broken > 0
                          ? 'text-rose-400'
                          : s.pumps_under_maintenance > 0
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {s.pumps_functional}/{s.pumps_total} pumps
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
