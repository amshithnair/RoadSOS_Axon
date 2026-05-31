import { create } from 'zustand';

export interface IncidentState {
  // User onboarding
  onboardingComplete: boolean;
  permissionsGranted: boolean;
  
  // Current incident
  emergencyType: string | null;
  triageLevel: 'critical' | 'moderate' | 'minor' | null;
  location: { lat: number; lng: number } | null;
  kmMarker: string | null;
  
  // User info
  userName: string | null;
  userPhone: string | null;
  emergencyContacts: { name: string; phone: string }[];
  medicalInfo: string | null;
  
  // Incident tracking
  currentIncidentId: string | null;
  bystanders: Array<{ id: string; role: string }>;
  
  // Actions
  setOnboarding: (complete: boolean) => void;
  setPermissions: (granted: boolean) => void;
  setEmergencyType: (type: string) => void;
  setTriageLevel: (level: 'critical' | 'moderate' | 'minor') => void;
  setLocation: (lat: number, lng: number) => void;
  setKmMarker: (marker: string) => void;
  setUserInfo: (name: string, phone: string) => void;
  addEmergencyContact: (name: string, phone: string) => void;
  setMedicalInfo: (info: string) => void;
  setCurrentIncident: (id: string) => void;
  addBystander: (id: string, role: string) => void;
  reset: () => void;
}

export const useIncidentStore = create<IncidentState>((set) => ({
  // Initial state
  onboardingComplete: false,
  permissionsGranted: false,
  emergencyType: null,
  triageLevel: null,
  location: null,
  kmMarker: null,
  userName: null,
  userPhone: null,
  emergencyContacts: [],
  medicalInfo: null,
  currentIncidentId: null,
  bystanders: [],
  
  // Actions
  setOnboarding: (complete) => set({ onboardingComplete: complete }),
  setPermissions: (granted) => set({ permissionsGranted: granted }),
  setEmergencyType: (type) => set({ emergencyType: type }),
  setTriageLevel: (level) => set({ triageLevel: level }),
  setLocation: (lat, lng) => set({ location: { lat, lng } }),
  setKmMarker: (marker) => set({ kmMarker: marker }),
  setUserInfo: (name, phone) => set({ userName: name, userPhone: phone }),
  addEmergencyContact: (name, phone) => 
    set((state) => ({ 
      emergencyContacts: [...state.emergencyContacts, { name, phone }] 
    })),
  setMedicalInfo: (info) => set({ medicalInfo: info }),
  setCurrentIncident: (id) => set({ currentIncidentId: id }),
  addBystander: (id, role) => 
    set((state) => ({ 
      bystanders: [...state.bystanders, { id, role }] 
    })),
  reset: () => set({
    emergencyType: null,
    triageLevel: null,
    location: null,
    kmMarker: null,
    currentIncidentId: null,
    bystanders: [],
  }),
}));
