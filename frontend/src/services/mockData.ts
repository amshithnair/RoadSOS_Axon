/**
 * Mock Data Service — Realistic demo data for all categories.
 * Simulates Overpass API results for a convincing demo.
 * Shows 8-10 results per category with realistic Indian data.
 */

export interface MockService {
  id: string;
  name: string;
  distance: string;
  distanceSortKey: number; // for sorting
  phone: string;
  address: string;
  isOffline?: boolean;
  openNow?: boolean;
  type?: string;
  eta?: string;
}

// ─── HOSPITALS ───────────────────────────────────────────────────────────────
export const MOCK_TRAUMA_CENTRES: MockService[] = [
  { id: '1', name: 'City Trauma & Emergency Centre', distance: '1.2 km', distanceSortKey: 1.2, phone: '080-22224444', address: 'MG Road, Sector 12', openNow: true, eta: '3 min' },
  { id: '2', name: 'AIIMS Advanced Trauma Unit', distance: '2.4 km', distanceSortKey: 2.4, phone: '011-26588500', address: 'NH-48, Bypass Road', openNow: true, eta: '6 min' },
  { id: '3', name: 'District Government Hospital', distance: '3.1 km', distanceSortKey: 3.1, phone: '080-23321234', address: 'Civil Lines', openNow: true, eta: '8 min' },
];

export const MOCK_HOSPITALS: MockService[] = [
  { id: '1', name: 'General Hospital Emergency', distance: '0.9 km', distanceSortKey: 0.9, phone: '080-44112233', address: '15, Hospital Road', openNow: true, eta: '2 min' },
  { id: '2', name: 'Apollo Emergency Wing', distance: '1.8 km', distanceSortKey: 1.8, phone: '080-26304050', address: 'Bannerghatta Road', openNow: true, eta: '5 min' },
  { id: '3', name: 'Fortis Hospital', distance: '2.6 km', distanceSortKey: 2.6, phone: '080-49899898', address: 'Cunningham Road', openNow: true, eta: '7 min' },
  { id: '4', name: 'St. John\'s Medical College', distance: '3.4 km', distanceSortKey: 3.4, phone: '080-22065010', address: 'Koramangala', openNow: true, eta: '9 min' },
  { id: '5', name: 'Manipal Hospital', distance: '4.2 km', distanceSortKey: 4.2, phone: '080-25024444', address: 'HAL Airport Road', openNow: true, eta: '11 min' },
];

export const MOCK_CLINICS: MockService[] = [
  { id: '1', name: 'Sunrise Urgent Care Clinic', distance: '0.4 km', distanceSortKey: 0.4, phone: '080-11223344', address: 'Near Petrol Pump', openNow: true, eta: '1 min' },
  { id: '2', name: 'LifeCare Family Clinic', distance: '0.8 km', distanceSortKey: 0.8, phone: '080-99887766', address: 'Main Market', openNow: true, eta: '2 min' },
  { id: '3', name: 'MedPlus Clinic', distance: '1.3 km', distanceSortKey: 1.3, phone: '080-33221100', address: 'Opp. Bus Stand', openNow: true, eta: '3 min' },
  { id: '4', name: 'People\'s Dispensary', distance: '1.9 km', distanceSortKey: 1.9, phone: '080-55443322', address: 'Railway Colony', openNow: false, eta: '5 min' },
];

// ─── POLICE ──────────────────────────────────────────────────────────────────
export const MOCK_POLICE: MockService[] = [
  { id: '1', name: 'Police Control Room', distance: 'Call', distanceSortKey: 0, phone: '100', address: 'Dial 100 — 24/7', openNow: true, eta: 'Immediate' },
  { id: '2', name: 'Highway Patrol Unit', distance: '1.4 km', distanceSortKey: 1.4, phone: '112', address: 'NH-48 Patrol Point', openNow: true, eta: '4 min' },
  { id: '3', name: 'City Police Station', distance: '2.2 km', distanceSortKey: 2.2, phone: '080-22942100', address: 'MG Road Police Station', openNow: true, eta: '6 min' },
  { id: '4', name: 'Traffic Police Outpost', distance: '3.1 km', distanceSortKey: 3.1, phone: '080-22868300', address: 'Junction Point', openNow: true, eta: '8 min' },
  { id: '5', name: 'District Police HQ', distance: '4.8 km', distanceSortKey: 4.8, phone: '080-22942000', address: 'Civil Lines', openNow: true, eta: '12 min' },
];

// ─── FIRE STATIONS ───────────────────────────────────────────────────────────
export const MOCK_FIRE_STATIONS: MockService[] = [
  { id: '1', name: 'Fire Brigade Control Room', distance: 'Call', distanceSortKey: 0, phone: '101', address: 'Dial 101 — 24/7', openNow: true, eta: 'Immediate' },
  { id: '2', name: 'Central Fire Station', distance: '1.6 km', distanceSortKey: 1.6, phone: '080-22971500', address: 'Kasturba Road', openNow: true, eta: '4 min' },
  { id: '3', name: 'Highway Fire Post', distance: '3.2 km', distanceSortKey: 3.2, phone: '080-25360500', address: 'Bypass Rd, NH-48', openNow: true, eta: '8 min' },
  { id: '4', name: 'North Fire Brigade', distance: '5.0 km', distanceSortKey: 5.0, phone: '080-28451010', address: 'Industrial Area', openNow: true, eta: '12 min' },
];

// ─── PETROL PUMPS ─────────────────────────────────────────────────────────────
export const MOCK_FUEL: MockService[] = [
  { id: '1', name: 'HP Speed Fuel Station', distance: '0.3 km', distanceSortKey: 0.3, phone: '98765 43210', address: 'NH-48, Near Toll', openNow: true, eta: '1 min' },
  { id: '2', name: 'Indian Oil Petrol Pump', distance: '0.8 km', distanceSortKey: 0.8, phone: '90000 11111', address: 'Bypass Road', openNow: true, eta: '2 min' },
  { id: '3', name: 'BPCL Hi-Speed Station', distance: '1.5 km', distanceSortKey: 1.5, phone: '77777 22222', address: 'Highway Junction', openNow: true, eta: '4 min' },
  { id: '4', name: 'Essar Fuel Pump', distance: '2.2 km', distanceSortKey: 2.2, phone: '88888 55555', address: 'Truck Parking Area', openNow: true, eta: '6 min' },
  { id: '5', name: 'Reliance Fuel Centre', distance: '3.1 km', distanceSortKey: 3.1, phone: '70000 33333', address: 'Service Road', openNow: true, eta: '8 min' },
  { id: '6', name: 'Shell Fuel Station', distance: '4.0 km', distanceSortKey: 4.0, phone: '60000 44444', address: 'Near Overpass', openNow: false, eta: '10 min' },
];

// ─── TOWING / CAR REPAIR ─────────────────────────────────────────────────────
export const MOCK_TOWING: MockService[] = [
  { id: '1', name: 'Highway Towing Services', distance: '0.6 km', distanceSortKey: 0.6, phone: '98765 43210', address: 'NH-48, Km 142', openNow: true, eta: '2 min' },
  { id: '2', name: 'QuickTow 24/7', distance: '1.4 km', distanceSortKey: 1.4, phone: '90001 11111', address: 'Bypass Road', openNow: true, eta: '4 min' },
  { id: '3', name: 'National Highway Rescue', distance: '2.0 km', distanceSortKey: 2.0, phone: '80000 22222', address: 'Truck Terminal', openNow: true, eta: '5 min' },
  { id: '4', name: 'Auto Aid Towing', distance: '3.2 km', distanceSortKey: 3.2, phone: '70000 33333', address: 'Industrial Area', openNow: true, eta: '8 min' },
  { id: '5', name: 'Roadside Rescue Pvt. Ltd.', distance: '4.5 km', distanceSortKey: 4.5, phone: '60000 44444', address: 'Market Road', openNow: false, eta: '12 min' },
];

// ─── PUNCTURE / TYRES ────────────────────────────────────────────────────────
export const MOCK_TYRES: MockService[] = [
  { id: '1', name: 'MRF Tyre Express', distance: '0.4 km', distanceSortKey: 0.4, phone: '88888 00000', address: 'Near Dhaba', openNow: true, eta: '1 min' },
  { id: '2', name: 'Ceat Tyre Shop', distance: '1.0 km', distanceSortKey: 1.0, phone: '77777 11111', address: 'Highway Market', openNow: true, eta: '3 min' },
  { id: '3', name: 'Rapid Puncture Repair', distance: '1.8 km', distanceSortKey: 1.8, phone: '66666 22222', address: 'Fuel Station Area', openNow: true, eta: '5 min' },
  { id: '4', name: 'Apollo Tyres Centre', distance: '2.6 km', distanceSortKey: 2.6, phone: '55555 33333', address: 'Transport Nagar', openNow: true, eta: '7 min' },
  { id: '5', name: 'JK Tyre Service', distance: '3.5 km', distanceSortKey: 3.5, phone: '44444 44444', address: 'Bypass Junction', openNow: false, eta: '9 min' },
];

// ─── SHOWROOMS ───────────────────────────────────────────────────────────────
export const MOCK_SHOWROOMS: MockService[] = [
  { id: '1', name: 'Maruti Suzuki Service', distance: '2.0 km', distanceSortKey: 2.0, phone: '44444 66666', address: 'Service Road', openNow: true, eta: '5 min' },
  { id: '2', name: 'Hyundai Authorised Service', distance: '2.8 km', distanceSortKey: 2.8, phone: '33333 55555', address: 'Industrial Area', openNow: true, eta: '7 min' },
  { id: '3', name: 'Tata Motors Workshop', distance: '3.5 km', distanceSortKey: 3.5, phone: '22222 44444', address: 'Commercial Hub', openNow: true, eta: '9 min' },
  { id: '4', name: 'Honda Cars Service', distance: '4.2 km', distanceSortKey: 4.2, phone: '11111 33333', address: 'Outer Ring Road', openNow: false, eta: '11 min' },
  { id: '5', name: 'Mahindra Service Centre', distance: '5.0 km', distanceSortKey: 5.0, phone: '00000 22222', address: 'Near Highway', openNow: false, eta: '13 min' },
];

// ─── AMBULANCE ───────────────────────────────────────────────────────────────
export const MOCK_AMBULANCE: MockService[] = [
  { id: '1', name: 'Ambulance — Dial 108', distance: 'Call', distanceSortKey: 0, phone: '108', address: 'State Emergency Medical Services', openNow: true, eta: 'Dispatch now' },
  { id: '2', name: '102 Ambulance (Govt)', distance: 'Call', distanceSortKey: 0.1, phone: '102', address: 'National Ambulance Service', openNow: true, eta: '6-8 min avg' },
  { id: '3', name: 'Ziqitza Healthcare (ZHL)', distance: '2.1 km', distanceSortKey: 2.1, phone: '1800-313-1414', address: 'Medical Centre Road', openNow: true, eta: '5 min' },
  { id: '4', name: 'Falck Ambulance Service', distance: '3.4 km', distanceSortKey: 3.4, phone: '1800-102-0102', address: 'Hospital Zone', openNow: true, eta: '9 min' },
];

// ─── SHELTER (Flood) ─────────────────────────────────────────────────────────
export const MOCK_SHELTERS: MockService[] = [
  { id: '1', name: 'Govt. School (Elevated)', distance: '0.6 km', distanceSortKey: 0.6, phone: '1078', address: '10m above road level', openNow: true },
  { id: '2', name: 'Community Hall', distance: '1.2 km', distanceSortKey: 1.2, phone: '100', address: 'High ground, Sector 4', openNow: true },
  { id: '3', name: 'Fuel Station (Raised)', distance: '0.8 km', distanceSortKey: 0.8, phone: '88888 00000', address: 'Highway, above flood level', openNow: true },
];

// ─── TOTAL CONTACTS COUNT (demo stat) ────────────────────────────────────────
export const TOTAL_CONTACTS_DEMO = 
  MOCK_TRAUMA_CENTRES.length + MOCK_HOSPITALS.length + MOCK_CLINICS.length +
  MOCK_POLICE.length + MOCK_FIRE_STATIONS.length + MOCK_FUEL.length +
  MOCK_TOWING.length + MOCK_TYRES.length + MOCK_SHOWROOMS.length + MOCK_AMBULANCE.length;

// Helper: get services by severity
export function getMedicalServices(severity: 'critical' | 'moderate' | 'minor') {
  if (severity === 'critical') return MOCK_TRAUMA_CENTRES;
  if (severity === 'moderate') return MOCK_HOSPITALS;
  return MOCK_CLINICS;
}

export function getMedicalLabel(severity: 'critical' | 'moderate' | 'minor') {
  if (severity === 'critical') return 'Trauma Centre';
  if (severity === 'moderate') return 'Hospital Emergency';
  return 'Nearest Clinic';
}
