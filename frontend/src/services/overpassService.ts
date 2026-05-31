/**
 * Overpass API Service
 * Fetches real emergency services from OpenStreetMap Overpass API
 * with offline fallback and local caching.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ServiceResult {
  id: string;
  name: string;
  distance: number;      // km
  distanceLabel: string; // "1.2 km"
  phone: string;
  lat: number;
  lng: number;
  type: string;
  isOffline: boolean;
  openNow?: boolean;
}

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://lz4.overpass-api.de/api/interpreter',
  'https://z.overpass-api.de/api/interpreter',
];

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const CACHE_PREFIX = '@roadsos_overpass_';

// ─── Distance calculation ────────────────────────────────────────────────────
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Overpass query builder ───────────────────────────────────────────────────
function buildQuery(lat: number, lng: number, tags: string[], radius = 10000): string {
  const conditions = tags
    .map(
      (tag) => `
    node[${tag}](around:${radius},${lat},${lng});
    way[${tag}](around:${radius},${lat},${lng});
    relation[${tag}](around:${radius},${lat},${lng});`
    )
    .join('');
  return `[out:json][timeout:20];(${conditions});out center 20;`;
}

// ─── Parse Overpass elements into ServiceResult ───────────────────────────────
function parseElements(
  elements: any[],
  userLat: number,
  userLng: number,
  type: string
): ServiceResult[] {
  const results: ServiceResult[] = [];

  for (const el of elements) {
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (!lat || !lng) continue;

    const tags = el.tags ?? {};
    const name =
      tags.name ||
      tags['name:en'] ||
      tags.operator ||
      tags.brand ||
      inferName(type, tags);

    const phone = tags.phone || tags['contact:phone'] || tags.emergency || '';
    const distance = haversineKm(userLat, userLng, lat, lng);

    results.push({
      id: String(el.id),
      name: name.trim() || inferName(type, tags),
      distance,
      distanceLabel: distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)} km`,
      phone: cleanPhone(phone),
      lat,
      lng,
      type,
      isOffline: false,
      openNow: parseOpenNow(tags.opening_hours),
    });
  }

  return results.sort((a, b) => a.distance - b.distance).slice(0, 10);
}

function inferName(type: string, tags: any): string {
  const names: Record<string, string> = {
    hospital: 'Hospital',
    clinic: 'Clinic',
    police: 'Police Station',
    fire_station: 'Fire Station',
    fuel: 'Petrol Pump',
    car_repair: 'Vehicle Repair',
    tyres: 'Tyre Shop',
    car_dealership: 'Car Showroom',
    ambulance_station: 'Ambulance Station',
  };
  return tags.amenity ? (names[tags.amenity] ?? type) : type;
}

function cleanPhone(phone: string): string {
  return phone.replace(/[^\d+\-\s()]/g, '').trim().slice(0, 20);
}

function parseOpenNow(hours?: string): boolean | undefined {
  if (!hours) return undefined;
  if (hours === '24/7') return true;
  // Simple check — a full parser would be needed for production
  return undefined;
}

// ─── Cache helpers ───────────────────────────────────────────────────────────
async function getCached(key: string): Promise<ServiceResult[] | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return data;
  } catch {
    return null;
  }
}

async function setCached(key: string, data: ServiceResult[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

// ─── Main fetch function ──────────────────────────────────────────────────────
export type ServiceCategory =
  | 'hospital'
  | 'trauma'
  | 'clinic'
  | 'police'
  | 'fire_station'
  | 'fuel'
  | 'car_repair'
  | 'tyres'
  | 'car_dealership'
  | 'ambulance';

const CATEGORY_TAGS: Record<ServiceCategory, string[]> = {
  hospital: ['amenity=hospital', 'amenity=clinic', 'healthcare=hospital'],
  trauma: ['amenity=hospital', 'healthcare=hospital', 'trauma=yes'],
  clinic: ['amenity=clinic', 'amenity=doctors', 'healthcare=clinic'],
  police: ['amenity=police'],
  fire_station: ['amenity=fire_station'],
  fuel: ['amenity=fuel'],
  car_repair: ['amenity=car_repair', 'shop=car_repair'],
  tyres: ['shop=tyres', 'shop=tyre'],
  car_dealership: ['shop=car', 'shop=car_dealership'],
  ambulance: ['amenity=ambulance_station', 'emergency=ambulance_station'],
};

const OFFLINE_FALLBACKS: Record<ServiceCategory, Partial<ServiceResult>[]> = {
  hospital: [
    { name: 'District Hospital', phone: '108', distanceLabel: '~2 km' },
    { name: 'Government Medical College', phone: '108', distanceLabel: '~4 km' },
    { name: 'Primary Health Centre', phone: '108', distanceLabel: '~6 km' },
  ],
  trauma: [
    { name: 'Trauma Centre (Call 108)', phone: '108', distanceLabel: 'Call first' },
    { name: 'District Hospital Emergency', phone: '108', distanceLabel: '~3 km' },
  ],
  clinic: [
    { name: 'Nearest Clinic', phone: '108', distanceLabel: '~1 km' },
    { name: 'Medical Store / Dispensary', phone: '', distanceLabel: '~2 km' },
  ],
  police: [
    { name: 'Police Control Room', phone: '100', distanceLabel: 'Call 100' },
    { name: 'Local Police Station', phone: '100', distanceLabel: '~2 km' },
  ],
  fire_station: [
    { name: 'Fire Brigade', phone: '101', distanceLabel: 'Call 101' },
    { name: 'Fire Station', phone: '101', distanceLabel: '~3 km' },
  ],
  fuel: [
    { name: 'HP Petrol Station', phone: '', distanceLabel: '~1 km' },
    { name: 'Indian Oil Station', phone: '', distanceLabel: '~2 km' },
    { name: 'BPCL Fuel Station', phone: '', distanceLabel: '~3 km' },
  ],
  car_repair: [
    { name: 'Vehicle Repair Workshop', phone: '', distanceLabel: '~2 km' },
    { name: 'Roadside Mechanic', phone: '', distanceLabel: '~3 km' },
  ],
  tyres: [
    { name: 'Tyre Repair Shop', phone: '', distanceLabel: '~1 km' },
    { name: 'MRF Tyre Centre', phone: '', distanceLabel: '~3 km' },
  ],
  car_dealership: [
    { name: 'Maruti Service Centre', phone: '', distanceLabel: '~4 km' },
    { name: 'Authorised Service Centre', phone: '', distanceLabel: '~5 km' },
  ],
  ambulance: [
    { name: 'Ambulance — Dial 108', phone: '108', distanceLabel: 'Call 108' },
  ],
};

function getOfflineFallback(lat: number, lng: number, category: ServiceCategory): ServiceResult[] {
  return (OFFLINE_FALLBACKS[category] ?? []).map((f, i) => ({
    id: `offline_${i}`,
    name: f.name ?? 'Service',
    distance: i + 1,
    distanceLabel: f.distanceLabel ?? '~? km',
    phone: f.phone ?? '',
    lat: lat + (i * 0.01),
    lng: lng + (i * 0.01),
    type: category,
    isOffline: true,
  }));
}

export async function fetchNearbyServices(
  lat: number,
  lng: number,
  category: ServiceCategory,
  radius = 10000
): Promise<ServiceResult[]> {
  // Check if forced offline is active in incident store
  try {
    const { useIncidentStore } = require('../store');
    const isForcedOffline = useIncidentStore.getState().offlineStatus === 'offline';
    if (isForcedOffline) {
      return getOfflineFallback(lat, lng, category);
    }
  } catch {}

  const cacheKey = `${category}_${lat.toFixed(3)}_${lng.toFixed(3)}`;

  // 1. Try cache first
  const cached = await getCached(cacheKey);
  if (cached && cached.length > 0) return cached;

  // 2. Try Overpass API
  const tags = CATEGORY_TAGS[category];
  const query = buildQuery(lat, lng, tags, radius);

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!response.ok) continue;

      const json = await response.json();
      const elements = json.elements ?? [];

      if (elements.length === 0) break; // No results in this area

      const results = parseElements(elements, lat, lng, category);
      if (results.length > 0) {
        await setCached(cacheKey, results);
        return results;
      }
    } catch {
      // Try next endpoint or fall through to offline
    }
  }

  // 3. Return offline fallback with isOffline: true
  return getOfflineFallback(lat, lng, category);
}

// ─── Convenience helpers ──────────────────────────────────────────────────────
export async function fetchAllEmergencyServices(lat: number, lng: number) {
  const [hospitals, police, fire, ambulance] = await Promise.all([
    fetchNearbyServices(lat, lng, 'hospital'),
    fetchNearbyServices(lat, lng, 'police'),
    fetchNearbyServices(lat, lng, 'fire_station'),
    fetchNearbyServices(lat, lng, 'ambulance'),
  ]);
  return { hospitals, police, fire, ambulance };
}

export async function fetchBreakdownServices(lat: number, lng: number) {
  const [towing, tyres, fuel, showrooms] = await Promise.all([
    fetchNearbyServices(lat, lng, 'car_repair'),
    fetchNearbyServices(lat, lng, 'tyres'),
    fetchNearbyServices(lat, lng, 'fuel'),
    fetchNearbyServices(lat, lng, 'car_dealership'),
  ]);
  return { towing, tyres, fuel, showrooms };
}

// Export total count of contacts fetched (for hackathon demo)
export async function fetchTotalContactsCount(lat: number, lng: number): Promise<number> {
  try {
    const { hospitals, police, fire, ambulance } = await fetchAllEmergencyServices(lat, lng);
    const { towing, tyres, fuel, showrooms } = await fetchBreakdownServices(lat, lng);
    return hospitals.length + police.length + fire.length + ambulance.length +
           towing.length + tyres.length + fuel.length + showrooms.length;
  } catch {
    return 0;
  }
}
