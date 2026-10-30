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
  FileSpreadsheet,
  Package,
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
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
  isAdmin: boolean;
  onOpenAdminModal: () => void;
  onLogoutAdmin: () => void;
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
  isAdmin,
  onOpenAdminModal,
  onLogoutAdmin,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: Layers },
    { id: 'fertilizer', label: 'Fertilizer Dashboard', icon: Package },
    { id: 'modules', label: '14 Campaign Pillars (CSV & Kobo)', icon: FileSpreadsheet },
    { id: 'map', label: 'Interactive Map', icon: MapPin },
    { id: 'survey', label: 'Collect Field Data', icon: ClipboardList },
    { id: 'sync', label: 'Sync & Conflicts', icon: GitMerge, badge: syncStats.pending },
    { id: 'submissions', label: 'Submissions Hub', icon: Table },
    { id: 'kobo', label: 'Kobo Forms (oboa2026)', icon: ExternalLink },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 text-slate-800 shadow-sm">
      {/* Top Banner for Remote Offline Simulation */}
      {isSimulatingOffline && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 text-xs text-amber-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>
              <strong>Remote Field Mode (Offline Simulation Active):</strong> Network requests are held in local IndexedDB /
              storage. Submissions will queue and trigger automatic conflict resolution once reconnected.
            </span>
          </div>
          <button
            onClick={onToggleSimulateOffline}
            className="text-amber-700 underline hover:text-amber-900 font-medium cursor-pointer"
          >
            Turn Off Simulation
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black text-white text-lg tracking-wider shadow-sm border border-emerald-400">
              🌾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight">KoboSync Oromia</h1>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                  Wheat Initiative
                </span>
                <span className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200 rounded">
                  user: oboa2026
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Weekly Monitoring &bull; Form <code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded border border-slate-200">9OBwKKRd</code> (ayqceYfs6Dxi567kBEi7AZ)
              </p>
            </div>
          </div>

          {/* Sync Controls, Admin Lock Status & Offline Toggle */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Administrator Lock / Unlock Switch */}
            {isAdmin ? (
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 rounded-lg px-2.5 py-1 text-xs text-emerald-800 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="hidden md:inline font-semibold">Admin (Unlocked)</span>
                <button
                  onClick={onLogoutAdmin}
                  className="ml-1 text-[11px] underline text-emerald-700 hover:text-emerald-950 cursor-pointer"
                  title="Lock back to read-only Viewer mode"
                >
                  Lock
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdminModal}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg transition-colors cursor-pointer shadow-sm font-semibold"
                title="Enter Administrator Password to add or edit data"
              >
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Unlock Admin</span>
              </button>
            )}

            {/* Pull from Kobo Cloud */}
            {onPullKoboCloud && (
              <button
                onClick={onPullKoboCloud}
                disabled={isPullingKobo || !syncStats.isOnline}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                title="Fetch latest verified submissions from KoboToolbox cloud server (oboa2026)"
              >
                <RefreshCw className={`w-3 h-3 ${isPullingKobo ? 'animate-spin text-emerald-600' : 'text-slate-600'}`} />
                <span className="hidden md:inline font-medium">{isPullingKobo ? 'Pulling...' : 'Pull Kobo Data'}</span>
              </button>
            )}

            {/* Online / Offline status badge */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                syncStats.isOnline
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
              title={syncStats.isOnline ? 'Online: Direct Kobo Cloud Sync' : 'Offline: Local Queueing Active'}
            >
              {syncStats.isOnline ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden md:inline">Online (Live)</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <WifiOff className="w-3.5 h-3.5 text-rose-600" />
                  <span className="hidden md:inline">Remote Offline</span>
                </>
              )}
            </div>

            {/* Offline Simulation Button */}
            <button
              onClick={onToggleSimulateOffline}
              className={`px-2.5 py-1 text-xs rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
                isSimulatingOffline
                  ? 'bg-amber-100 text-amber-800 border-amber-300 font-medium'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50 hover:text-slate-900 shadow-sm'
              }`}
              title="Toggle simulated offline state to test remote area submission"
            >
              <WifiOff className="w-3 h-3 text-slate-500" />
              <span className="hidden lg:inline">{isSimulatingOffline ? 'Disable Field Mode' : 'Simulate Offline'}</span>
            </button>

            {/* Sync Now button */}
            <button
              onClick={onForceSync}
              disabled={syncStats.isSyncing || !syncStats.isOnline}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer ${
                syncStats.pending > 0
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-bounce-short shadow-emerald-200'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Synchronize queued records with server"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncStats.isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
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
              className="hidden xl:flex items-center gap-1 px-2.5 py-1 text-xs bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg transition-colors shadow-sm font-medium"
              title="Open Official KoboToolbox Web Form"
            >
              <ExternalLink className="w-3 h-3 text-emerald-600" />
              <span>Kobo Enketo</span>
            </a>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex space-x-1 overflow-x-auto pb-1.5 scrollbar-none border-t border-slate-200 pt-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 shadow-sm border border-emerald-200 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-white">
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
