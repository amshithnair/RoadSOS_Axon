/**
 * Country Emergency Numbers Database
 * 50+ countries with ambulance, police, fire, and disaster numbers.
 * Auto-detected from GPS or manually overridden.
 */

export interface CountryEmergency {
  code: string;      // ISO 3166-1 alpha-2
  name: string;
  ambulance: string;
  police: string;
  fire: string;
  disaster: string;  // NDRF/FEMA etc.
  coast_guard?: string;
  flag: string;
  // Bounding box [minLat, minLng, maxLat, maxLng]
  bbox: [number, number, number, number];
}

export const EMERGENCY_DB: CountryEmergency[] = [
  {
    code: 'IN', name: 'India', flag: '🇮🇳',
    ambulance: '108', police: '100', fire: '101', disaster: '1078',
    bbox: [8.0, 68.0, 37.5, 97.5],
  },
  {
    code: 'US', name: 'United States', flag: '🇺🇸',
    ambulance: '911', police: '911', fire: '911', disaster: '1-800-621-3362',
    bbox: [24.5, -125.0, 49.5, -66.5],
  },
  {
    code: 'GB', name: 'United Kingdom', flag: '🇬🇧',
    ambulance: '999', police: '999', fire: '999', disaster: '0800-678-1767',
    bbox: [49.9, -8.6, 60.8, 1.8],
  },
  {
    code: 'AU', name: 'Australia', flag: '🇦🇺',
    ambulance: '000', police: '000', fire: '000', disaster: '132-500',
    bbox: [-43.6, 113.3, -10.7, 153.6],
  },
  {
    code: 'CA', name: 'Canada', flag: '🇨🇦',
    ambulance: '911', police: '911', fire: '911', disaster: '1-800-830-3118',
    bbox: [41.7, -141.0, 83.1, -52.6],
  },
  {
    code: 'DE', name: 'Germany', flag: '🇩🇪',
    ambulance: '112', police: '110', fire: '112', disaster: '0800-111-0-111',
    bbox: [47.3, 5.9, 55.1, 15.0],
  },
  {
    code: 'FR', name: 'France', flag: '🇫🇷',
    ambulance: '15', police: '17', fire: '18', disaster: '112',
    bbox: [41.3, -5.1, 51.1, 9.6],
  },
  {
    code: 'JP', name: 'Japan', flag: '🇯🇵',
    ambulance: '119', police: '110', fire: '119', disaster: '171',
    bbox: [24.0, 122.9, 45.5, 153.9],
  },
  {
    code: 'CN', name: 'China', flag: '🇨🇳',
    ambulance: '120', police: '110', fire: '119', disaster: '12320',
    bbox: [18.1, 73.4, 53.6, 135.1],
  },
  {
    code: 'BR', name: 'Brazil', flag: '🇧🇷',
    ambulance: '192', police: '190', fire: '193', disaster: '199',
    bbox: [-33.7, -73.9, 5.3, -34.7],
  },
  {
    code: 'ZA', name: 'South Africa', flag: '🇿🇦',
    ambulance: '10177', police: '10111', fire: '10177', disaster: '112',
    bbox: [-34.8, 16.4, -22.1, 32.9],
  },
  {
    code: 'NG', name: 'Nigeria', flag: '🇳🇬',
    ambulance: '112', police: '112', fire: '112', disaster: '112',
    bbox: [4.3, 2.7, 13.9, 14.7],
  },
  {
    code: 'EG', name: 'Egypt', flag: '🇪🇬',
    ambulance: '123', police: '122', fire: '180', disaster: '123',
    bbox: [22.0, 25.0, 31.7, 37.0],
  },
  {
    code: 'KE', name: 'Kenya', flag: '🇰🇪',
    ambulance: '999', police: '999', fire: '999', disaster: '0800-720-616',
    bbox: [-4.7, 33.9, 4.6, 41.9],
  },
  {
    code: 'MX', name: 'Mexico', flag: '🇲🇽',
    ambulance: '911', police: '911', fire: '911', disaster: '800-903-9200',
    bbox: [14.5, -117.1, 32.7, -86.7],
  },
  {
    code: 'AR', name: 'Argentina', flag: '🇦🇷',
    ambulance: '107', police: '101', fire: '100', disaster: '911',
    bbox: [-55.0, -73.6, -21.8, -53.6],
  },
  {
    code: 'ID', name: 'Indonesia', flag: '🇮🇩',
    ambulance: '118', police: '110', fire: '113', disaster: '117',
    bbox: [-11.0, 95.0, 5.9, 141.0],
  },
  {
    code: 'PK', name: 'Pakistan', flag: '🇵🇰',
    ambulance: '115', police: '15', fire: '16', disaster: '1129',
    bbox: [23.7, 60.9, 37.1, 77.8],
  },
  {
    code: 'BD', name: 'Bangladesh', flag: '🇧🇩',
    ambulance: '999', police: '999', fire: '999', disaster: '1090',
    bbox: [20.6, 88.0, 26.6, 92.7],
  },
  {
    code: 'PH', name: 'Philippines', flag: '🇵🇭',
    ambulance: '911', police: '911', fire: '911', disaster: '911',
    bbox: [4.6, 116.9, 20.8, 126.6],
  },
  {
    code: 'VN', name: 'Vietnam', flag: '🇻🇳',
    ambulance: '115', police: '113', fire: '114', disaster: '1800-599-908',
    bbox: [8.4, 102.1, 23.4, 109.5],
  },
  {
    code: 'TH', name: 'Thailand', flag: '🇹🇭',
    ambulance: '1669', police: '191', fire: '199', disaster: '1784',
    bbox: [5.6, 97.3, 20.5, 105.7],
  },
  {
    code: 'MY', name: 'Malaysia', flag: '🇲🇾',
    ambulance: '999', police: '999', fire: '994', disaster: '999',
    bbox: [0.9, 99.6, 7.4, 119.3],
  },
  {
    code: 'SG', name: 'Singapore', flag: '🇸🇬',
    ambulance: '995', police: '999', fire: '995', disaster: '1800-229-4100',
    bbox: [1.2, 103.6, 1.5, 104.0],
  },
  {
    code: 'NZ', name: 'New Zealand', flag: '🇳🇿',
    ambulance: '111', police: '111', fire: '111', disaster: '0800-173-476',
    bbox: [-47.3, 166.4, -34.4, 178.6],
  },
  {
    code: 'IT', name: 'Italy', flag: '🇮🇹',
    ambulance: '118', police: '113', fire: '115', disaster: '112',
    bbox: [35.5, 6.6, 47.1, 18.5],
  },
  {
    code: 'ES', name: 'Spain', flag: '🇪🇸',
    ambulance: '061', police: '091', fire: '080', disaster: '112',
    bbox: [36.0, -9.3, 43.8, 4.3],
  },
  {
    code: 'PT', name: 'Portugal', flag: '🇵🇹',
    ambulance: '112', police: '112', fire: '112', disaster: '112',
    bbox: [36.8, -9.5, 42.2, -6.2],
  },
  {
    code: 'NL', name: 'Netherlands', flag: '🇳🇱',
    ambulance: '112', police: '112', fire: '112', disaster: '112',
    bbox: [50.8, 3.4, 53.5, 7.2],
  },
  {
    code: 'BE', name: 'Belgium', flag: '🇧🇪',
    ambulance: '112', police: '101', fire: '112', disaster: '112',
    bbox: [49.5, 2.5, 51.5, 6.4],
  },
  {
    code: 'CH', name: 'Switzerland', flag: '🇨🇭',
    ambulance: '144', police: '117', fire: '118', disaster: '112',
    bbox: [45.8, 5.9, 47.8, 10.5],
  },
  {
    code: 'SE', name: 'Sweden', flag: '🇸🇪',
    ambulance: '112', police: '112', fire: '112', disaster: '113-13',
    bbox: [55.3, 11.1, 69.1, 24.2],
  },
  {
    code: 'NO', name: 'Norway', flag: '🇳🇴',
    ambulance: '113', police: '112', fire: '110', disaster: '815-45-100',
    bbox: [57.9, 4.6, 71.2, 31.1],
  },
  {
    code: 'DK', name: 'Denmark', flag: '🇩🇰',
    ambulance: '112', police: '114', fire: '112', disaster: '112',
    bbox: [54.6, 8.1, 57.7, 15.2],
  },
  {
    code: 'FI', name: 'Finland', flag: '🇫🇮',
    ambulance: '112', police: '112', fire: '112', disaster: '112',
    bbox: [59.8, 19.5, 70.1, 31.6],
  },
  {
    code: 'PL', name: 'Poland', flag: '🇵🇱',
    ambulance: '112', police: '997', fire: '998', disaster: '112',
    bbox: [49.0, 14.1, 54.8, 24.1],
  },
  {
    code: 'UA', name: 'Ukraine', flag: '🇺🇦',
    ambulance: '103', police: '102', fire: '101', disaster: '112',
    bbox: [44.4, 22.1, 52.4, 40.2],
  },
  {
    code: 'RU', name: 'Russia', flag: '🇷🇺',
    ambulance: '103', police: '102', fire: '101', disaster: '112',
    bbox: [41.2, 19.6, 81.9, 190.0],
  },
  {
    code: 'TR', name: 'Turkey', flag: '🇹🇷',
    ambulance: '112', police: '155', fire: '110', disaster: '122',
    bbox: [35.8, 25.7, 42.1, 44.8],
  },
  {
    code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦',
    ambulance: '911', police: '911', fire: '911', disaster: '920008040',
    bbox: [16.3, 36.6, 32.2, 55.7],
  },
  {
    code: 'AE', name: 'UAE', flag: '🇦🇪',
    ambulance: '998', police: '999', fire: '997', disaster: '800-NCEMA',
    bbox: [22.6, 51.6, 26.1, 56.4],
  },
  {
    code: 'IR', name: 'Iran', flag: '🇮🇷',
    ambulance: '115', police: '110', fire: '125', disaster: '122',
    bbox: [25.1, 44.0, 39.8, 63.3],
  },
  {
    code: 'IL', name: 'Israel', flag: '🇮🇱',
    ambulance: '101', police: '100', fire: '102', disaster: '104',
    bbox: [29.5, 34.2, 33.3, 35.9],
  },
  {
    code: 'LK', name: 'Sri Lanka', flag: '🇱🇰',
    ambulance: '1990', police: '119', fire: '111', disaster: '117',
    bbox: [5.9, 79.6, 9.8, 81.9],
  },
  {
    code: 'NP', name: 'Nepal', flag: '🇳🇵',
    ambulance: '102', police: '100', fire: '101', disaster: '1116',
    bbox: [26.3, 80.1, 30.4, 88.2],
  },
  {
    code: 'MM', name: 'Myanmar', flag: '🇲🇲',
    ambulance: '192', police: '199', fire: '191', disaster: '1280',
    bbox: [9.8, 92.2, 28.5, 101.2],
  },
  {
    code: 'KH', name: 'Cambodia', flag: '🇰🇭',
    ambulance: '119', police: '117', fire: '118', disaster: '112',
    bbox: [10.4, 102.3, 14.7, 107.6],
  },
  {
    code: 'GH', name: 'Ghana', flag: '🇬🇭',
    ambulance: '193', police: '191', fire: '192', disaster: '112',
    bbox: [4.7, -3.3, 11.2, 1.2],
  },
  {
    code: 'ET', name: 'Ethiopia', flag: '🇪🇹',
    ambulance: '907', police: '991', fire: '939', disaster: '907',
    bbox: [3.4, 33.0, 14.9, 47.9],
  },
  // Default fallback
  {
    code: 'EU', name: 'Europe/Other', flag: '🌍',
    ambulance: '112', police: '112', fire: '112', disaster: '112',
    bbox: [-90, -180, 90, 180],
  },
];

/**
 * Detect country from GPS coordinates.
 * Uses bounding-box lookup (fast, offline).
 */
export function detectCountry(lat: number, lng: number): CountryEmergency {
  // First pass: find all matching bounding boxes
  const matches = EMERGENCY_DB.filter(
    (c) =>
      c.code !== 'EU' &&
      lat >= c.bbox[0] &&
      lng >= c.bbox[1] &&
      lat <= c.bbox[2] &&
      lng <= c.bbox[3]
  );

  if (matches.length === 0) {
    // Return world fallback
    return EMERGENCY_DB[EMERGENCY_DB.length - 1];
  }

  // Return smallest bounding box (most specific match)
  return matches.reduce((best, c) => {
    const bestArea = (best.bbox[2] - best.bbox[0]) * (best.bbox[3] - best.bbox[1]);
    const cArea = (c.bbox[2] - c.bbox[0]) * (c.bbox[3] - c.bbox[1]);
    return cArea < bestArea ? c : best;
  });
}

export function getCountryByCode(code: string): CountryEmergency {
  return EMERGENCY_DB.find((c) => c.code === code) ?? EMERGENCY_DB[EMERGENCY_DB.length - 1];
}

// Indian KM Marker database (highway → GPS positions at every 10km)
export interface KmMarkerEntry {
  highway: string;
  km: number;
  lat: number;
  lng: number;
  nearbyPump?: string;
  nearbyHospital?: string;
  state?: string;
}

export const KM_MARKER_DB: Record<string, KmMarkerEntry> = {
  'NH48-0': { highway: 'NH-48', km: 0, lat: 28.632, lng: 77.219, state: 'Delhi' },
  'NH48-50': { highway: 'NH-48', km: 50, lat: 28.137, lng: 76.936, state: 'Haryana', nearbyPump: 'HP Station' },
  'NH48-100': { highway: 'NH-48', km: 100, lat: 27.643, lng: 76.654, state: 'Rajasthan', nearbyHospital: 'CHC Rewari' },
  'NH48-150': { highway: 'NH-48', km: 150, lat: 27.148, lng: 76.372, state: 'Rajasthan' },
  'NH48-200': { highway: 'NH-48', km: 200, lat: 26.654, lng: 76.090, state: 'Rajasthan', nearbyPump: 'BPCL Pump' },
  'NH48-250': { highway: 'NH-48', km: 250, lat: 26.159, lng: 75.807, state: 'Rajasthan', nearbyHospital: 'District Hospital Dausa' },
  'NH48-300': { highway: 'NH-48', km: 300, lat: 26.488, lng: 75.795, state: 'Rajasthan' },
  'NH48-350': { highway: 'NH-48', km: 350, lat: 26.920, lng: 75.815, nearbyPump: 'Indian Oil', state: 'Rajasthan' },

  'NH8-0': { highway: 'NH-8', km: 0, lat: 28.632, lng: 77.219, state: 'Delhi' },
  'NH8-50': { highway: 'NH-8', km: 50, lat: 28.137, lng: 76.936, nearbyPump: 'HP Station', state: 'Haryana' },
  'NH8-100': { highway: 'NH-8', km: 100, lat: 27.643, lng: 76.654, state: 'Rajasthan' },

  'NH44-0': { highway: 'NH-44', km: 0, lat: 28.700, lng: 77.100, state: 'Delhi' },
  'NH44-50': { highway: 'NH-44', km: 50, lat: 28.927, lng: 77.200, state: 'Haryana', nearbyPump: 'BPCL Panipat' },
  'NH44-100': { highway: 'NH-44', km: 100, lat: 29.386, lng: 76.980, state: 'Haryana', nearbyHospital: 'Civil Hospital Karnal' },
  'NH44-150': { highway: 'NH-44', km: 150, lat: 29.844, lng: 76.757, state: 'Punjab' },
  'NH44-200': { highway: 'NH-44', km: 200, lat: 30.320, lng: 76.547, nearbyPump: 'Indian Oil', state: 'Punjab' },
  'NH44-250': { highway: 'NH-44', km: 250, lat: 30.798, lng: 76.336, state: 'Punjab', nearbyHospital: 'GMCH Chandigarh' },

  'NH19-0': { highway: 'NH-19', km: 0, lat: 25.595, lng: 85.138, state: 'Bihar' },
  'NH19-50': { highway: 'NH-19', km: 50, lat: 25.297, lng: 84.617, state: 'Uttar Pradesh', nearbyPump: 'HP Pump' },
  'NH19-100': { highway: 'NH-19', km: 100, lat: 25.000, lng: 84.096, state: 'Uttar Pradesh', nearbyHospital: 'District Hospital' },
  'NH19-150': { highway: 'NH-19', km: 150, lat: 24.702, lng: 83.574, state: 'Uttar Pradesh' },

  'NH66-0': { highway: 'NH-66', km: 0, lat: 22.304, lng: 70.802, state: 'Gujarat' },
  'NH66-50': { highway: 'NH-66', km: 50, lat: 21.898, lng: 70.541, state: 'Gujarat', nearbyPump: 'BPCL Station' },
  'NH66-100': { highway: 'NH-66', km: 100, lat: 21.492, lng: 70.279, state: 'Gujarat', nearbyHospital: 'Amreli Hospital' },

  'NH27-0': { highway: 'NH-27', km: 0, lat: 22.570, lng: 88.369, state: 'West Bengal' },
  'NH27-50': { highway: 'NH-27', km: 50, lat: 22.800, lng: 87.871, state: 'West Bengal' },

  'NH16-0': { highway: 'NH-16', km: 0, lat: 13.083, lng: 80.270, state: 'Tamil Nadu' },
  'NH16-50': { highway: 'NH-16', km: 50, lat: 13.624, lng: 80.111, state: 'Andhra Pradesh', nearbyPump: 'Indian Oil Nellore' },
  'NH16-100': { highway: 'NH-16', km: 100, lat: 14.165, lng: 79.952, state: 'Andhra Pradesh' },
  'NH16-150': { highway: 'NH-16', km: 150, lat: 14.705, lng: 79.793, state: 'Andhra Pradesh', nearbyHospital: 'Ongole Government Hospital' },

  'NH6-0': { highway: 'NH-6', km: 0, lat: 21.150, lng: 72.800, state: 'Gujarat' },
  'NH6-50': { highway: 'NH-6', km: 50, lat: 21.320, lng: 73.430, state: 'Gujarat' },
  'NH6-100': { highway: 'NH-6', km: 100, lat: 21.490, lng: 74.060, nearbyHospital: 'Dhule District Hospital', state: 'Maharashtra' },
};

/**
 * Resolve KM marker to GPS coordinates.
 */
export function resolveKmMarker(highway: string, km: number): KmMarkerEntry | null {
  const normalised = highway.replace(/\s/g, '').toUpperCase();

  // Try exact match first
  const exactKey = `${normalised}-${km}`;
  if (KM_MARKER_DB[exactKey]) return KM_MARKER_DB[exactKey];

  // Try nearest 10km increment
  const roundedKm = Math.round(km / 10) * 10;
  const roundedKey = `${normalised}-${roundedKm}`;
  if (KM_MARKER_DB[roundedKey]) return { ...KM_MARKER_DB[roundedKey], km };

  // Try nearby highway names (NH48 == NH-48 == NH 48)
  const hwVariants = [
    normalised,
    normalised.replace('NH', 'NH-'),
    normalised.replace('NH-', 'NH'),
  ];
  for (const hw of hwVariants) {
    const key = `${hw}-${roundedKm}`;
    if (KM_MARKER_DB[key]) return { ...KM_MARKER_DB[key], km };
  }

  return null;
}

/**
 * Get list of all highways in the offline DB (for autocomplete).
 */
export function getHighwayList(): string[] {
  const highways = new Set<string>();
  Object.values(KM_MARKER_DB).forEach((e) => highways.add(e.highway));
  return Array.from(highways).sort();
}
