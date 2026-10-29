import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { MapView } from './components/MapView';
import { SurveyFormView } from './components/SurveyFormView';
import { SyncConflictView } from './components/SyncConflictView';
import { SubmissionsView } from './components/SubmissionsView';
import { KoboBridgeView } from './components/KoboBridgeView';
import { syncEngine } from './services/syncEngine';
import { SurveyRecord, SyncStats } from './types/survey';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [records, setRecords] = useState<SurveyRecord[]>([]);
  const [syncStats, setSyncStats] = useState<SyncStats>(syncEngine.getStats());
  const [isSimulatingOffline, setIsSimulatingOffline] = useState<boolean>(syncEngine.isSimulatingOffline());

  useEffect(() => {
    // Subscribe to sync engine events
    const unsubscribe = syncEngine.subscribe((stats, updatedRecords) => {
      setSyncStats(stats);
      setRecords([...updatedRecords]);
      setIsSimulatingOffline(syncEngine.isSimulatingOffline());
    });

    return () => {
      unsubscribe();
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">
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
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            records={records}
            onOpenSurvey={() => setActiveTab('survey')}
            onOpenSync={() => setActiveTab('sync')}
          />
        )}

        {activeTab === 'map' && <MapView records={records} />}

        {activeTab === 'survey' && (
          <SurveyFormView
            isOnline={syncStats.isOnline}
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
          />
        )}

        {activeTab === 'kobo' && <KoboBridgeView />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-xs text-slate-400 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">KoboSync Oromia</span>
            <span>&bull;</span>
            <span>Irrigated Wheat Weekly Monitoring</span>
            <span>&bull;</span>
            <span className="font-mono text-[11px] text-slate-500">ID: ayqceYfs6Dxi567kBEi7AZ</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span>Enketo Endpoint:</span>
            <a
              href="https://ee.kobotoolbox.org/x/9OBwKKRd"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:underline font-mono"
            >
              ee.kobotoolbox.org/x/9OBwKKRd
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
