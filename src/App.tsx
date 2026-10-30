import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { FertilizerDashboard } from './components/FertilizerDashboard';
import { MapView } from './components/MapView';
import { SurveyFormView } from './components/SurveyFormView';
import { SyncConflictView } from './components/SyncConflictView';
import { SubmissionsView } from './components/SubmissionsView';
import { KoboBridgeView } from './components/KoboBridgeView';
import { CampaignModulesView } from './components/CampaignModulesView';
import { AdminAuthModal } from './components/AdminAuthModal';
import { syncEngine } from './services/syncEngine';
import { authService } from './services/authService';
import { SurveyRecord, SyncStats } from './types/survey';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [records, setRecords] = useState<SurveyRecord[]>([]);
  const [syncStats, setSyncStats] = useState<SyncStats>(syncEngine.getStats());
  const [isSimulatingOffline, setIsSimulatingOffline] = useState<boolean>(syncEngine.isSimulatingOffline());

  // Administrator Authentication State
  const [isAdmin, setIsAdmin] = useState<boolean>(authService.isAdmin());
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);
  const [adminActionDesc, setAdminActionDesc] = useState<string>('Adding or modifying survey data requires administrator authorization.');
  const [pendingAdminAction, setPendingAdminAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    // Subscribe to sync engine events
    const unsubscribeSync = syncEngine.subscribe((stats, updatedRecords) => {
      setSyncStats(stats);
      setRecords([...updatedRecords]);
      setIsSimulatingOffline(syncEngine.isSimulatingOffline());
    });

    // Subscribe to admin authentication changes
    const unsubscribeAuth = authService.subscribe((authState) => {
      setIsAdmin(authState.isAdmin);
    });

    return () => {
      unsubscribeSync();
      unsubscribeAuth();
    };
  }, []);

  const [isPullingKobo, setIsPullingKobo] = useState<boolean>(false);

  const handleToggleSimulateOffline = () => {
    const nextState = !isSimulatingOffline;
    setIsSimulatingOffline(nextState);
    syncEngine.setOfflineSimulation(nextState);
  };

  const handleForceSync = async () => {
    await syncEngine.syncPendingSubmissions();
  };

  const handlePullKoboCloud = async () => {
    setIsPullingKobo(true);
    try {
      const res = await syncEngine.pullFromKoboCloud();
      if (res.error) {
        alert(`Note on Kobo Cloud fetch: ${res.error}. Showing cached verified submissions.`);
      } else {
        alert(`Kobo Cloud fetch successful: ${res.fetched} verified submissions fetched for account oboa2026.`);
      }
    } finally {
      setIsPullingKobo(false);
    }
  };

  const handleRequestAdminAuth = (actionDesc: string, onSuccess?: () => void) => {
    setAdminActionDesc(actionDesc);
    setPendingAdminAction(() => onSuccess || null);
    setIsAdminModalOpen(true);
  };

  const handleLogoutAdmin = () => {
    authService.logout();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-200 selection:text-emerald-950">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        syncStats={syncStats}
        isSimulatingOffline={isSimulatingOffline}
        onToggleSimulateOffline={handleToggleSimulateOffline}
        onForceSync={handleForceSync}
        onPullKoboCloud={handlePullKoboCloud}
        isPullingKobo={isPullingKobo}
        isAdmin={isAdmin}
        onOpenAdminModal={() => handleRequestAdminAuth('Administrator access to edit data and manage records')}
        onLogoutAdmin={handleLogoutAdmin}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            records={records}
            onOpenSurvey={() => setActiveTab('survey')}
            onOpenSync={() => setActiveTab('sync')}
            onOpenModules={() => setActiveTab('modules')}
            onOpenFertilizer={() => setActiveTab('fertilizer')}
          />
        )}

        {activeTab === 'fertilizer' && (
          <FertilizerDashboard
            records={records}
            isAdmin={isAdmin}
            onRequestAdminAuth={handleRequestAdminAuth}
            onOpenSurvey={() => setActiveTab('survey')}
          />
        )}

        {activeTab === 'modules' && (
          <CampaignModulesView
            records={records}
            onOpenSurvey={() => setActiveTab('survey')}
            onRefreshKobo={handlePullKoboCloud}
            isSyncingKobo={isPullingKobo}
            isAdmin={isAdmin}
            onRequestAdminAuth={handleRequestAdminAuth}
            onNavigateToFertilizer={() => setActiveTab('fertilizer')}
          />
        )}

        {activeTab === 'map' && <MapView records={records} />}

        {activeTab === 'survey' && (
          <SurveyFormView
            isOnline={syncStats.isOnline}
            isAdmin={isAdmin}
            onRequestAdminAuth={handleRequestAdminAuth}
            onSubmissionComplete={() => {
              setActiveTab('dashboard');
            }}
          />
        )}

        {activeTab === 'sync' && (
          <SyncConflictView records={records} syncStats={syncStats} onRefresh={handleForceSync} />
        )}

        {activeTab === 'submissions' && (
          <SubmissionsView
            records={records}
            onSyncKobo={handlePullKoboCloud}
            isSyncingKobo={isPullingKobo}
            isAdmin={isAdmin}
            onRequestAdminAuth={handleRequestAdminAuth}
          />
        )}

        {activeTab === 'kobo' && <KoboBridgeView />}
      </main>

      {/* Administrator Authentication Modal */}
      <AdminAuthModal
        isOpen={isAdminModalOpen}
        onClose={() => {
          setIsAdminModalOpen(false);
          setPendingAdminAction(null);
        }}
        onSuccess={() => {
          if (pendingAdminAction) {
            pendingAdminAction();
          }
          setPendingAdminAction(null);
        }}
        requiredActionDescription={adminActionDesc}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 text-xs text-slate-500 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">KoboSync Oromia</span>
            <span>&bull;</span>
            <span>Irrigated Wheat Weekly Monitoring</span>
            <span>&bull;</span>
            <span className="font-mono text-[11px] text-emerald-700">ID: ayqceYfs6Dxi567kBEi7AZ</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-slate-500">Enketo Endpoint:</span>
            <a
              href="https://ee.kobotoolbox.org/x/9OBwKKRd"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-700 hover:text-emerald-800 hover:underline font-mono font-medium"
            >
              ee.kobotoolbox.org/x/9OBwKKRd
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
