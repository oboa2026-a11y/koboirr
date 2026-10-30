/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AuthState {
  isAdmin: boolean;
  adminUsername: string;
  lastLoginTime?: number;
}

const STORAGE_KEY = 'oboa_admin_auth_state';
const CUSTOM_PASSWORD_KEY = 'oboa_admin_custom_password';

// Recognized default administrator passwords for convenience
const DEFAULT_PASSWORDS = [
  'OBOA2026',
  'oboa2026',
  'Irri@2026',
  'irri@2026',
  'oboa@2026',
  'Oboa@2026',
];

type AuthListener = (state: AuthState) => void;

class AuthService {
  private listeners: AuthListener[] = [];
  private state: AuthState = {
    isAdmin: false,
    adminUsername: 'oboa2026',
  };

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Valid session lasts 24 hours
        if (parsed.lastLoginTime && Date.now() - parsed.lastLoginTime < 24 * 60 * 60 * 1000) {
          this.state = parsed;
        } else {
          this.logout();
        }
      }
    } catch {
      this.state = { isAdmin: false, adminUsername: 'oboa2026' };
    }
  }

  private saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to persist auth state', e);
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach((listener) => listener({ ...this.state }));
  }

  public subscribe(listener: AuthListener): () => void {
    this.listeners.push(listener);
    listener({ ...this.state });
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public getState(): AuthState {
    return { ...this.state };
  }

  public isAdmin(): boolean {
    return this.state.isAdmin;
  }

  public login(password: string): { success: boolean; message: string } {
    const trimmed = (password || '').trim();
    const customPass = localStorage.getItem(CUSTOM_PASSWORD_KEY);

    const isValid =
      DEFAULT_PASSWORDS.includes(trimmed) ||
      DEFAULT_PASSWORDS.map((p) => p.toLowerCase()).includes(trimmed.toLowerCase()) ||
      (customPass && customPass === trimmed);

    if (isValid) {
      this.state = {
        isAdmin: true,
        adminUsername: 'oboa2026',
        lastLoginTime: Date.now(),
      };
      this.saveState();
      return { success: true, message: 'Administrator mode unlocked successfully.' };
    }

    return {
      success: false,
      message: 'Invalid administrator password. Please check your credentials (e.g., OBOA2026 or Irri@2026).',
    };
  }

  public logout(): void {
    this.state = {
      isAdmin: false,
      adminUsername: 'oboa2026',
    };
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    this.notify();
  }

  public changePassword(currentPass: string, newPass: string): { success: boolean; message: string } {
    const loginCheck = this.login(currentPass);
    if (!loginCheck.success) {
      return { success: false, message: 'Current password incorrect.' };
    }
    if (!newPass || newPass.trim().length < 4) {
      return { success: false, message: 'New password must be at least 4 characters.' };
    }

    localStorage.setItem(CUSTOM_PASSWORD_KEY, newPass.trim());
    return { success: true, message: 'Administrator password updated successfully.' };
  }
}

export const authService = new AuthService();
