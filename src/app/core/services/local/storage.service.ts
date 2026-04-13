import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({ providedIn: 'root' })
export class StorageService {

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      Preferences.set({ key: 'access_token', value: accessToken }),
      Preferences.set({ key: 'refresh_token', value: refreshToken }),
    ]);
  }

  async getAccessToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: 'access_token' });
    return value;
  }

  async getRefreshToken(): Promise<string | null> {
    const { value } = await Preferences.get({ key: 'refresh_token' });
    return value;
  }

  async clearTokens(): Promise<void> {
    await Promise.all([
      Preferences.remove({ key: 'access_token' }),
      Preferences.remove({ key: 'refresh_token' }),
    ]);
  }

  async set(key: string, value: string): Promise<void> {
    await Preferences.set({ key, value });
  }

  async get(key: string): Promise<string | null> {
    const { value } = await Preferences.get({ key });
    return value;
  }

  async remove(key: string): Promise<void> {
    await Preferences.remove({ key });
  }
}
