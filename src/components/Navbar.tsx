import React from 'react';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Layers,
  MapPin,
  ClipboardList,
  GitMerge,
  ExternalLink,
  Table,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { SyncStats } from '../types/survey';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  syncStats: SyncStats;
  isSimulatingOffline: boolean;
  onToggleSimulateOffline: () => void;
  onForceSync: () => void;
  onPullKoboCloud?: () => void;
  isPullingKobo?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  syncStats,
  isSimulatingOffline,
  onToggleSimulateOffline,
  onForceSync,
  onPullKoboCloud,
  isPullingKobo,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: Layers },
    { id: 'map', label: 'Interactive Map', icon: MapPin },
    { id: 'survey', label: 'Collect Field Data', icon: ClipboardList },
    { id: 'sync', label: 'Sync & Conflicts', icon: GitMerge, badge: syncStats.pending },
    { id: 'submissions', label: 'Submissions Hub', icon: Table },
    { id: 'kobo', label: 'KoboToolbox (oboa2026)', icon: ExternalLink },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      {/* Top Banner for Remote Offline Simulation */}
      {isSimulatingOffline && (
        <div className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-1.5 text-xs text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>
              <strong>Remote Field Mode (Offline Simulation Active):</strong> Network requests are held in local IndexedDB /
              storage. Submissions will queue and trigger automatic conflict resolution once reconnected.
            </span>
          </div>
          <button
            onClick={onToggleSimulateOffline}
            className="text-amber-300 underline hover:text-white font-medium cursor-pointer"
          >
            Turn Off Simulation
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-600 flex items-center justify-center font-black text-white text-lg tracking-wider shadow-sm">
              🌾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">KoboSync Oromia</h1>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/50 rounded">
                  Wheat Initiative
                </span>
                <span className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-mono bg-sky-950 text-sky-300 border border-sky-800 rounded">
                  user: oboa2026
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Weekly Monitoring &bull; Form <code className="text-slate-300">9OBwKKRd</code> (ayqceYfs6Dxi567kBEi7AZ)
              </p>
            </div>
          </div>

          {/* Sync Controls & Offline Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Pull from Kobo Cloud */}
            {onPullKoboCloud && (
              <button
                onClick={onPullKoboCloud}
                disabled={isPullingKobo || !syncStats.isOnline}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-sky-900/40 hover:bg-sky-800/60 text-sky-200 border border-sky-700/60 rounded transition-colors cursor-pointer disabled:opacity-50"
                title="Fetch latest verified submissions from KoboToolbox cloud server (oboa2026)"
              >
                <RefreshCw className={`w-3 h-3 ${isPullingKobo ? 'animate-spin text-sky-400' : 'text-sky-400'}`} />
                <span className="hidden md:inline">{isPullingKobo ? 'Pulling...' : 'Pull Kobo Data'}</span>
              </button>
            )}

            {/* Online / Offline status badge */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                syncStats.isOnline
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/40'
                  : 'bg-rose-950/60 text-rose-300 border-rose-700/40'
              }`}
              title={syncStats.isOnline ? 'Online: Direct Kobo Cloud Sync' : 'Offline: Local Queueing Active'}
            >
              {syncStats.isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden md:inline">Online (Live)</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                  <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden md:inline">Remote Offline</span>
                </>
              )}
            </div>

            {/* Offline Simulation Button */}
            <button
              onClick={onToggleSimulateOffline}
              className={`px-2.5 py-1 text-xs rounded border transition-colors cursor-pointer flex items-center gap-1.5 ${
                isSimulatingOffline
                  ? 'bg-amber-600/30 text-amber-200 border-amber-500/50'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="Toggle simulated offline state to test remote area submission"
            >
              <WifiOff className="w-3 h-3" />
              <span className="hidden lg:inline">{isSimulatingOffline ? 'Disable Field Mode' : 'Simulate Offline'}</span>
            </button>

            {/* Sync Now button */}
            <button
              onClick={onForceSync}
              disabled={syncStats.isSyncing || !syncStats.isOnline}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer ${
                syncStats.pending > 0
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-bounce-short'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Synchronize queued records with server"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncStats.isSyncing ? 'animate-spin text-emerald-300' : ''}`} />
              <span>
                {syncStats.isSyncing
                  ? 'Syncing...'
                  : syncStats.pending > 0
                  ? `Sync Now (${syncStats.pending})`
                  : 'Synced'}
              </span>
            </button>

            {/* Kobo Form Link */}
            <a
              href="https://ee.kobotoolbox.org/x/9OBwKKRd"
              target="_blank"
              rel="noreferrer"
              className="hidden xl:flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded transition-colors"
              title="Open Official KoboToolbox Web Form"
            >
              <ExternalLink className="w-3 h-3 text-sky-400" />
              <span>Kobo Enketo</span>
            </a>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex space-x-1 overflow-x-auto pb-1 scrollbar-none border-t border-slate-800/80 pt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
