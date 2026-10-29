import { SurveyRecord, ConflictDetail } from '../types/survey';
import { INITIAL_SURVEY_RECORDS } from '../data/mockSurveyData';

const STORAGE_KEYS = {
  RECORDS: 'kobosync_survey_records_v1',
  DRAFTS: 'kobosync_survey_drafts_v1',
  CONFLICTS: 'kobosync_conflicts_v1',
  SIMULATE_OFFLINE: 'kobosync_sim_offline',
  DEVICE_ID: 'kobosync_device_id',
};

export const getOrCreateDeviceId = (): string => {
  let id = localStorage.getItem(STORAGE_KEYS.DEVICE_ID);
  if (!id) {
    id = `device-et-${Math.random().toString(36).substring(2, 8)}`;
    localStorage.setItem(STORAGE_KEYS.DEVICE_ID, id);
  }
  return id;
};

export const loadStoredRecords = (): SurveyRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(INITIAL_SURVEY_RECORDS));
      return INITIAL_SURVEY_RECORDS;
    }
    const parsed: SurveyRecord[] = JSON.parse(raw);
    // Ensure initial verified records (like kobo_live_272443029) are present and refreshed
    const existingIds = new Set(parsed.map((p) => p.id));
    let hasUpdates = false;
    for (const initRec of INITIAL_SURVEY_RECORDS) {
      if (!existingIds.has(initRec.id)) {
        parsed.unshift(initRec);
        hasUpdates = true;
      } else if (initRec.id === 'kobo_live_272443029') {
        const idx = parsed.findIndex((p) => p.id === 'kobo_live_272443029');
        if (idx !== -1 && parsed[idx].enumerator_name !== 'Getachew Haile') {
          parsed[idx] = { ...parsed[idx], ...initRec };
          hasUpdates = true;
        }
      }
    }
    if (hasUpdates) {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(parsed));
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load stored records:', err);
    return INITIAL_SURVEY_RECORDS;
  }
};

export const saveStoredRecords = (records: SurveyRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save records:', err);
  }
};

export const loadStoredDrafts = (): Partial<SurveyRecord>[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DRAFTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const saveStoredDrafts = (drafts: Partial<SurveyRecord>[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(drafts));
  } catch (err) {
    console.error('Failed to save drafts:', err);
  }
};

export const loadStoredConflicts = (): ConflictDetail[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONFLICTS);
    if (!raw) {
      // Gather initial conflicts from mock data
      const initialConflicts = INITIAL_SURVEY_RECORDS.flatMap((r) => r.conflicts || []);
      localStorage.setItem(STORAGE_KEYS.CONFLICTS, JSON.stringify(initialConflicts));
      return initialConflicts;
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const saveStoredConflicts = (conflicts: ConflictDetail[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CONFLICTS, JSON.stringify(conflicts));
  } catch (err) {
    console.error('Failed to save conflicts:', err);
  }
};

export const getSimulatedOffline = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.SIMULATE_OFFLINE) === 'true';
};

export const setSimulatedOffline = (offline: boolean): void => {
  localStorage.setItem(STORAGE_KEYS.SIMULATE_OFFLINE, offline ? 'true' : 'false');
};
