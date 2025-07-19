import {create} from 'zustand';

type PrivacySettings = {
  profileVisibility: boolean;
  showName: boolean;
  shareRole: boolean;
  shareLinkedln: boolean;
  shareBio: boolean;
  shareContacts: boolean;
};

type PrivacySettingsStore = {
  settings: PrivacySettings;
  toggleSetting: (key: keyof PrivacySettings) => void;
  setSettings: (newSettings: Partial<PrivacySettings>) => void;
};

export const usePrivacySettingsStore = create<PrivacySettingsStore>(set => ({
  settings: {
    profileVisibility: true,
    showName: false,
    shareRole: false,
    shareLinkedln: false,
    shareBio: false,
    shareContacts: false,
  },
  toggleSetting: key =>
    set(state => ({
      settings: {...state.settings, [key]: !state.settings[key]},
    })),
  setSettings: newSettings =>
    set(state => ({
      settings: {...state.settings, ...newSettings},
    })),
}));
