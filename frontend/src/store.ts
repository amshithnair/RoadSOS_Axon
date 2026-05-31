import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface EmergencyContact {
  name: string;
  phone: string;
}

export interface MedicalDetails {
  bloodGroup: string;
  allergies: string;
  medications: string;
}

export interface SafeArrivalState {
  deadline: number | null;      // timestamp ms
  destination: string;
  contacts: EmergencyContact[];
}

export interface IncidentState {
  // Onboarding
  onboardingComplete: boolean;
  permissionsGranted: boolean;

  // Language
  language: 'en' | 'hi' | 'gu';

  // User info
  userName: string;
  userPhone: string;
  emergencyContacts: EmergencyContact[];

  // Medical
  medicalDetails: MedicalDetails;

  // Current incident
  emergencyType: string | null;
  triageLevel: 'critical' | 'moderate' | 'minor' | null;
  triageAnswers: Record<string, boolean> | null;
  location: { lat: number; lng: number } | null;
  kmMarker: string | null;
  currentIncidentId: string | null;
  bystanders: Array<{ id: string; role: string }>;

  // Safe Arrival
  safeArrival: SafeArrivalState;

  // Offline status
  offlineStatus: 'live' | 'offline' | 'none';

  // Hackathon presentation controller overrides
  locationOverride: { lat: number; lng: number; label: string; countryCode: string } | null;

  // Actions
  setOnboarding: (complete: boolean) => void;
  setPermissions: (granted: boolean) => void;
  setLanguage: (lang: 'en' | 'hi' | 'gu') => void;
  setUserInfo: (name: string, phone: string) => void;
  setEmergencyContacts: (contacts: EmergencyContact[]) => void;
  addEmergencyContact: (contact: EmergencyContact) => void;
  removeEmergencyContact: (index: number) => void;
  setMedicalDetails: (details: MedicalDetails) => void;
  setEmergencyType: (type: string) => void;
  setTriageLevel: (level: 'critical' | 'moderate' | 'minor') => void;
  setTriageAnswers: (answers: Record<string, boolean>) => void;
  setLocation: (lat: number, lng: number) => void;
  setKmMarker: (marker: string) => void;
  setCurrentIncident: (id: string) => void;
  addBystander: (id: string, role: string) => void;
  setSafeArrival: (data: SafeArrivalState) => void;
  clearSafeArrival: () => void;
  setOfflineStatus: (status: 'live' | 'offline' | 'none') => void;
  setLocationOverride: (override: { lat: number; lng: number; label: string; countryCode: string } | null) => void;
  reset: () => void;
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

const STORAGE_KEY = '@roadsos_state';

const defaultMedical: MedicalDetails = { bloodGroup: '', allergies: '', medications: '' };
const defaultSafeArrival: SafeArrivalState = { deadline: null, destination: '', contacts: [] };

export const useIncidentStore = create<IncidentState>((set, get) => ({
  // Initial state
  onboardingComplete: false,
  permissionsGranted: false,
  language: 'en',
  userName: '',
  userPhone: '',
  emergencyContacts: [],
  medicalDetails: defaultMedical,
  emergencyType: null,
  triageLevel: null,
  triageAnswers: null,
  location: null,
  kmMarker: null,
  currentIncidentId: null,
  bystanders: [],
  safeArrival: defaultSafeArrival,
  offlineStatus: 'none',
  locationOverride: null,

  // Actions
  setOnboarding: (complete) => {
    set({ onboardingComplete: complete });
    get().saveToStorage();
  },
  setPermissions: (granted) => {
    set({ permissionsGranted: granted });
    get().saveToStorage();
  },
  setLanguage: (lang) => {
    set({ language: lang });
    get().saveToStorage();
  },
  setUserInfo: (name, phone) => {
    set({ userName: name, userPhone: phone });
    get().saveToStorage();
  },
  setEmergencyContacts: (contacts) => {
    set({ emergencyContacts: contacts });
    get().saveToStorage();
  },
  addEmergencyContact: (contact) => {
    set((state) => ({ emergencyContacts: [...state.emergencyContacts, contact] }));
    get().saveToStorage();
  },
  removeEmergencyContact: (index) => {
    set((state) => ({
      emergencyContacts: state.emergencyContacts.filter((_, i) => i !== index),
    }));
    get().saveToStorage();
  },
  setMedicalDetails: (details) => {
    set({ medicalDetails: details });
    get().saveToStorage();
  },
  setEmergencyType: (type) => set({ emergencyType: type }),
  setTriageLevel: (level) => set({ triageLevel: level }),
  setTriageAnswers: (answers) => set({ triageAnswers: answers }),
  setLocation: (lat, lng) => set({ location: { lat, lng } }),
  setKmMarker: (marker) => set({ kmMarker: marker }),
  setCurrentIncident: (id) => set({ currentIncidentId: id }),
  addBystander: (id, role) =>
    set((state) => ({ bystanders: [...state.bystanders, { id, role }] })),
  setSafeArrival: (data) => {
    set({ safeArrival: data });
    get().saveToStorage();
  },
  clearSafeArrival: () => {
    set({ safeArrival: defaultSafeArrival });
    get().saveToStorage();
  },
  setOfflineStatus: (status) => set({ offlineStatus: status }),
  setLocationOverride: (override) => set({ locationOverride: override }),
  reset: () =>
    set({
      emergencyType: null,
      triageLevel: null,
      triageAnswers: null,
      location: null,
      kmMarker: null,
      currentIncidentId: null,
      bystanders: [],
    }),

  // Persistence
  saveToStorage: async () => {
    try {
      const state = get();
      const persisted = {
        onboardingComplete: state.onboardingComplete,
        permissionsGranted: state.permissionsGranted,
        language: state.language,
        userName: state.userName,
        userPhone: state.userPhone,
        emergencyContacts: state.emergencyContacts,
        medicalDetails: state.medicalDetails,
        safeArrival: state.safeArrival,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch (_) {}
  },

  loadFromStorage: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        set({
          onboardingComplete: data.onboardingComplete ?? false,
          permissionsGranted: data.permissionsGranted ?? false,
          language: data.language ?? 'en',
          userName: data.userName ?? '',
          userPhone: data.userPhone ?? '',
          emergencyContacts: data.emergencyContacts ?? [],
          medicalDetails: data.medicalDetails ?? defaultMedical,
          safeArrival: data.safeArrival ?? defaultSafeArrival,
        });
      }
    } catch (_) {}
  },
}));
