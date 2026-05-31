import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {
  SafeAreaContainer,
  Header,
  Button,
  FormField,
  Card,
  RoleCard,
  GuidanceStep,
  Colors,
} from '../components/Layout';
import { useIncidentStore, EmergencyContact } from '../store';
import * as Location from 'expo-location';

// ─── INCIDENT MAP SCREEN ─────────────────────────────────────────────────────
export const IncidentMapScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const incidentId = route?.params?.incidentId ?? 'INC_DEMO';
  const [copied, setCopied] = useState(false);
  const { location, locationOverride } = useIncidentStore();

  const activeLat = locationOverride?.lat ?? location?.lat ?? 20.5937;
  const activeLng = locationOverride?.lng ?? location?.lng ?? 78.9629;
  const activeLabel = locationOverride?.label ?? (location ? `${location.lat.toFixed(4)}°N, ${location.lng.toFixed(4)}°E` : 'New Delhi, India');

  const shareLink = `roadsos.app/i/${incidentId}`;

  const handleCopy = () => {
    try {
      if (Platform.OS === 'web' && navigator?.clipboard) {
        navigator.clipboard.writeText(shareLink).catch(() => {});
      } else {
        Clipboard.setString(shareLink);
      }
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <SafeAreaContainer>
      <Header title="📍 Incident Map" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={ss.content}>
        {/* Map placeholder */}
        <View style={ss.mapPlaceholder}>
          <Text style={{ fontSize: 48, marginBottom: 8 }}>🗺️</Text>
          <Text style={ss.mapPlaceholderText}>{activeLabel}</Text>
          <Text style={{ fontSize: 11, color: Colors.gray500, marginTop: 6 }}>
            Coords: {activeLat.toFixed(5)}, {activeLng.toFixed(5)}
          </Text>
          <Text style={{ fontSize: 11, color: Colors.gray400, marginTop: 4 }}>ID: #{incidentId}</Text>
        </View>

        {/* Status cards */}
        <View style={ss.statusGrid}>
          <StatusCard icon="🚑" label="Ambulance" status="Called" color={Colors.green} />
          <StatusCard icon="👨‍👩‍👧" label="Family" status="Alerted" color={Colors.green} />
          <StatusCard icon="🚔" label="Police" status="Pending" color={Colors.gray400} />
        </View>

        {/* ETA */}
        <View style={ss.etaBanner}>
          <Text style={ss.etaText}>⏱ Estimated ETA: ~8 minutes</Text>
          <Text style={ss.etaNote}>Based on distance ÷ 40 km/h · rough estimate</Text>
        </View>

        {/* Nearby services */}
        <Card>
          <Text style={ss.cardTitle}>Nearby Services</Text>
          <ServiceRow emoji="🏥" label="District Hospital" dist="2.3 km" eta="5 min" />
          <ServiceRow emoji="🚒" label="Fire Station" dist="1.8 km" eta="3 min" />
          <ServiceRow emoji="🚔" label="Police Station" dist="3.1 km" eta="7 min" last />
        </Card>

        {/* Share link */}
        <Card style={{ marginTop: 8 }}>
          <Text style={ss.cardTitle}>Share with Family</Text>
          <View style={ss.shareBox}>
            <Text style={ss.shareLabel}>Incident Link:</Text>
            <Text style={ss.shareLink}>{shareLink}</Text>
          </View>
          <Button title={copied ? '✅ Copied!' : '📋 Copy Link'} onPress={handleCopy} variant={copied ? 'secondary' : 'primary'} />
          <Button
            title="📤 Share"
            onPress={() => {
              if (Platform.OS !== 'web') {
                // Use share sheet on device
              }
            }}
            variant="outline"
            style={{ marginTop: 6 }}
          />
        </Card>

        <Button
          title="✅ Mark Resolved"
          onPress={() => { Alert.alert('Incident resolved', 'Thank you.'); try { navigation.getParent()?.navigate('HomeMain'); } catch { navigation.navigate('HomeMain'); } }}
          variant="outline"
          style={{ marginTop: 12 }}
        />
      </ScrollView>
    </SafeAreaContainer>
  );
};

const StatusCard: React.FC<{ icon: string; label: string; status: string; color: string }> = ({ icon, label, status, color }) => (
  <View style={[ss.statusCard, { borderColor: color + '44' }]}>
    <Text style={{ fontSize: 22 }}>{icon}</Text>
    <Text style={ss.statusLabel}>{label}</Text>
    <Text style={[ss.statusValue, { color }]}>{status}</Text>
  </View>
);

const ServiceRow: React.FC<{ emoji: string; label: string; dist: string; eta: string; last?: boolean }> = ({ emoji, label, dist, eta, last }) => (
  <View style={[ss.serviceRow, last && { borderBottomWidth: 0 }]}>
    <Text style={{ fontSize: 18, marginRight: 8 }}>{emoji}</Text>
    <Text style={ss.serviceLabel}>{label} · {dist}</Text>
    <Text style={ss.serviceEta}>{eta}</Text>
  </View>
);

// ─── BYSTANDER ENTRY SCREEN ──────────────────────────────────────────────────
export const BystanderEntryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [placeName, setPlaceName] = useState('Getting your location…');
  const [loading, setLoading] = useState(true);
  const { locationOverride } = useIncidentStore();

  useEffect(() => {
    const get = async () => {
      if (locationOverride) {
        setPlaceName(locationOverride.label);
        setLoading(false);
        return;
      }
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setPlaceName(`${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`);
        } else {
          setPlaceName('Location unavailable');
        }
      } catch {
        setPlaceName('Location unavailable');
      } finally {
        setLoading(false);
      }
    };
    get();
  }, []);

  const handleConfirm = () => {
    // Mock Firebase nearby check — in production: query incidents within 200m
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Simulate finding a nearby incident
      navigation.navigate('RoleAssignment', { incidentId: 'INC_XK29', responders: 2 });
    }, 1500);
  };

  return (
    <SafeAreaContainer>
      <Header title="👁 I'm a Bystander" onBack={() => navigation.goBack()} color={Colors.green} />
      <ScrollView contentContainerStyle={ss.content}>
        <View style={ss.bystanderBanner}>
          <Text style={ss.bystanderBannerTitle}>You're at an accident scene</Text>
          <Text style={ss.bystanderBannerSub}>Your calm help makes a real difference. We'll guide you.</Text>
        </View>

        {/* Location confirmed */}
        <View style={ss.locationConfirm}>
          <Text style={ss.locationConfirmLabel}>📍 Your current location</Text>
          <Text style={ss.locationConfirmValue}>{loading ? 'Locating…' : placeName}</Text>
        </View>

        <Button
          title={loading ? 'Checking nearby incidents…' : 'Yes, I\'m at the scene →'}
          onPress={handleConfirm}
          disabled={loading}
          style={{ marginTop: 8, backgroundColor: loading ? Colors.gray400 : Colors.green }}
        />

        <View style={ss.divider} />

        <Text style={ss.orText}>Or start a fresh report</Text>
        <Button
          title="🆕 Report New Incident"
          onPress={() => navigation.navigate('BystanderGuidance', { role: 'STAY_WITH_VICTIM', incidentId: 'NEW' })}
          variant="outline"
        />
      </ScrollView>
    </SafeAreaContainer>
  );
};

// ─── ROLE ASSIGNMENT SCREEN ───────────────────────────────────────────────────
const ROLES = [
  { id: 'STAY', icon: '🩺', role: 'Stay with injured person', desc: 'Keep them conscious and calm until help arrives.' },
  { id: 'CALL', icon: '📞', role: 'Call ambulance', desc: 'Dial 108 and stay on the line with the dispatcher.' },
  { id: 'TRAFFIC', icon: '🚗', role: 'Direct traffic', desc: 'Signal vehicles to slow down and keep the lane clear.' },
  { id: 'FLAG', icon: '🚩', role: 'Flag the ambulance', desc: 'Stand 50m ahead on the road to guide ambulance in.' },
];

export const RoleAssignmentScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const incidentId = route?.params?.incidentId ?? 'INC_DEMO';
  const responders = route?.params?.responders ?? 1;
  const [myRole, setMyRole] = useState(ROLES[0].id); // Interactive selection

  return (
    <SafeAreaContainer>
      <Header title="Role Assignment" onBack={() => navigation.goBack()} color={Colors.green} />
      <ScrollView contentContainerStyle={ss.content}>
        <View style={ss.incidentHeader}>
          <Text style={ss.incidentId}>Incident #{incidentId}</Text>
          <Text style={ss.responderCount}>{responders + 1} people helping</Text>
        </View>

        <Text style={ss.rolesHeading}>Select your role:</Text>

        {ROLES.map((r, i) => (
          <RoleCard
            key={r.id}
            icon={r.icon}
            role={r.role}
            description={r.desc}
            isMine={r.id === myRole}
            isTaken={i > 0 && i < 2} // mock: role index 1 is "taken"
            onPress={() => setMyRole(r.id)}
          />
        ))}

        <Button
          title="▶ Start Selected Role"
          onPress={() => navigation.navigate('BystanderGuidance', { role: myRole, incidentId })}
          style={{ marginTop: 8, backgroundColor: Colors.green }}
        />
      </ScrollView>
    </SafeAreaContainer>
  );
};

// ─── BYSTANDER GUIDANCE SCREEN ────────────────────────────────────────────────
const ROLE_STEPS: Record<string, string[]> = {
  STAY: [
    'Kneel beside the injured person and speak calmly',
    'Check if they are conscious — tap shoulder and ask "Can you hear me?"',
    'If unconscious, tilt head back to open airway',
    'Do not move them unless there is fire or water risk',
    'Keep them warm using a jacket or blanket',
  ],
  CALL: [
    'Dial 108 (ambulance) on your phone',
    'Give your GPS location or nearest landmark',
    'Say how many people are injured and severity',
    'Stay on the line — do not hang up',
    'Update the dispatcher when ambulance arrives nearby',
  ],
  TRAFFIC: [
    'Move 50 metres back from the crash site',
    'Face oncoming traffic and signal "slow down" with both arms',
    'Stay on the shoulder — never stand in the lane',
    'Direct vehicles around the crash scene',
    'Continue until police arrive',
  ],
  FLAG: [
    'Move to 100 metres ahead of the crash (in the direction ambulance comes from)',
    'Stand on the shoulder and wave a bright cloth or use your phone torch',
    'When you see the ambulance, wave with both arms',
    'Guide the ambulance to stop at the right spot',
    'Rejoin the scene once ambulance is parked',
  ],
};

export const BystanderGuidanceScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const role = route?.params?.role ?? 'STAY';
  const { incidentId: _incidentId } = route?.params ?? {};
  const steps = ROLE_STEPS[role] ?? ROLE_STEPS['STAY'];
  const [activeStep, setActiveStep] = useState(0);
  const [doneSteps, setDoneSteps] = useState<number[]>([]);
  const allDone = doneSteps.length === steps.length;

  const roleInfo = ROLES.find((r) => r.id === role) ?? ROLES[0];

  const markDone = (i: number) => {
    if (!doneSteps.includes(i)) {
      setDoneSteps([...doneSteps, i]);
      setActiveStep(Math.min(i + 1, steps.length - 1));
    }
  };

  return (
    <SafeAreaContainer>
      <Header title="Bystander Guidance" onBack={() => navigation.goBack()} color={Colors.green} />
      <ScrollView contentContainerStyle={ss.content}>
        {/* Role label */}
        <View style={ss.roleLabel}>
          <Text style={ss.roleLabelIcon}>{roleInfo.icon}</Text>
          <Text style={ss.roleLabelText}>Your role: {roleInfo.role}</Text>
        </View>

        {/* Steps */}
        {steps.map((step, i) => (
          <GuidanceStep
            key={i}
            step={step}
            index={i}
            isDone={doneSteps.includes(i)}
            isActive={i === activeStep}
            onMarkDone={() => markDone(i)}
          />
        ))}

        {/* All done */}
        {allDone && (
          <View style={ss.allDoneCard}>
            <Text style={ss.allDoneIcon}>✅</Text>
            <Text style={ss.allDoneTitle}>You've done everything you can.</Text>
            <Text style={ss.allDoneSub}>Help is coming. Thank you for being there.</Text>
          </View>
        )}

        {/* Ambulance ETA strip */}
        <View style={ss.etaStrip}>
          <Text style={ss.etaStripText}>🚑 Ambulance ETA: ~8 min (estimate)</Text>
        </View>

        {allDone && (
          <Button
            title="🚑 Ambulance has arrived"
            onPress={() => {
              Alert.alert('Incident resolved', 'Thank you for helping!');
              try { navigation.getParent()?.navigate('HomeMain'); } catch { navigation.navigate('HomeMain'); }
            }}
            style={{ backgroundColor: Colors.green, marginTop: 8 }}
          />
        )}
      </ScrollView>
    </SafeAreaContainer>
  );
};

// ─── MEDICAL ID SCREEN ────────────────────────────────────────────────────────
export const MedicalIDScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { medicalDetails, userName, emergencyContacts } = useIncidentStore();
  const hasData = medicalDetails.bloodGroup || medicalDetails.allergies || medicalDetails.medications;

  // Try to use react-native-qrcode-svg if available
  let QRCode: any = null;
  try { QRCode = require('react-native-qrcode-svg').default; } catch {}

  const qrData = JSON.stringify({
    name: userName,
    blood: medicalDetails.bloodGroup,
    allergies: medicalDetails.allergies,
    meds: medicalDetails.medications,
    contact: emergencyContacts[0] ?? null,
  });

  return (
    <SafeAreaContainer>
      <Header title="🆔 Medical QR ID" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={ss.content}>
        {!hasData ? (
          <View style={ss.emptyState}>
            <Text style={ss.emptyStateIcon}>🩺</Text>
            <Text style={ss.emptyStateTitle}>No Medical Info Set</Text>
            <Text style={ss.emptyStateSub}>Add your blood group and allergies so first responders can help you faster.</Text>
            <Button title="Set Up Medical Info →" onPress={() => navigation.navigate('Setup')} style={{ marginTop: 20 }} />
          </View>
        ) : (
          <>
            {/* QR Code */}
            <View style={ss.qrContainer}>
              <Text style={ss.qrLabel}>Scan in emergency · Works offline</Text>
              <View style={ss.qrBox}>
                {QRCode ? (
                  <QRCode value={qrData} size={200} />
                ) : (
                  <View style={ss.qrFallback}>
                    <Text style={{ fontSize: 32 }}>📱</Text>
                    <Text style={{ fontSize: 12, color: Colors.gray500, textAlign: 'center', marginTop: 8 }}>QR generated on device</Text>
                  </View>
                )}
              </View>
              <Text style={ss.qrInstruction}>📸 Screenshot and set as your lock screen wallpaper</Text>
            </View>

            {/* Medical Info Card */}
            <Card>
              <Text style={ss.cardTitle}>Your Medical Information</Text>
              <InfoRow label="Blood Group" value={medicalDetails.bloodGroup || 'Not set'} highlight={!!medicalDetails.bloodGroup} />
              <InfoRow label="Allergies" value={medicalDetails.allergies || 'None listed'} />
              <InfoRow label="Medications" value={medicalDetails.medications || 'None listed'} />
              {emergencyContacts[0] && (
                <InfoRow label="Emergency Contact" value={`${emergencyContacts[0].name} · ${emergencyContacts[0].phone}`} />
              )}
            </Card>

            <Button title="✏️ Edit Medical Info" onPress={() => navigation.navigate('Setup')} variant="outline" style={{ marginTop: 8 }} />
          </>
        )}
      </ScrollView>
    </SafeAreaContainer>
  );
};

const InfoRow: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
  <View style={ss.infoRow}>
    <Text style={ss.infoLabel}>{label}</Text>
    <Text style={[ss.infoValue, highlight && { color: Colors.red, fontWeight: '800' }]}>{value}</Text>
  </View>
);

// ─── SAFE ARRIVAL SCREEN ─────────────────────────────────────────────────────
export const SafeArrivalScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { safeArrival, setSafeArrival, clearSafeArrival, emergencyContacts } = useIncidentStore();
  const [destination, setDestination] = useState('');
  const [hours, setHours] = useState('2');
  const [mins, setMins] = useState('0');
  const [selectedContacts, setSelectedContacts] = useState<EmergencyContact[]>(emergencyContacts);

  const isActive = !!safeArrival.deadline;

  const handleStart = () => {
    const h = parseInt(hours) || 0;
    const m = parseInt(mins) || 0;
    const deadline = Date.now() + (h * 60 + m) * 60 * 1000;
    setSafeArrival({ deadline, destination, contacts: selectedContacts });
    try { navigation.getParent()?.navigate('HomeMain'); } catch { navigation.navigate('HomeMain'); }
  };

  const toggleContact = (contact: EmergencyContact) => {
    setSelectedContacts((prev) =>
      prev.find((c) => c.phone === contact.phone)
        ? prev.filter((c) => c.phone !== contact.phone)
        : [...prev, contact]
    );
  };

  if (isActive) {
    const minsLeft = Math.max(0, Math.ceil(((safeArrival.deadline ?? 0) - Date.now()) / 60000));
    return (
      <SafeAreaContainer>
        <Header title="🛣 Safe Arrival" onBack={() => navigation.goBack()} />
        <View style={ss.content}>
          <View style={ss.activeTimerCard}>
            <Text style={ss.activeTimerIcon}>⏱</Text>
            <Text style={ss.activeTimerTitle}>Timer Active</Text>
            <Text style={ss.activeTimerDest}>Destination: {safeArrival.destination}</Text>
            <Text style={ss.activeTimerMins}>{minsLeft} minutes remaining</Text>
          </View>
          <Button
            title="✅ I Arrived Safely — Check In"
            onPress={() => { clearSafeArrival(); try { navigation.getParent()?.navigate('HomeMain'); } catch { navigation.navigate('HomeMain'); } }}
            style={{ backgroundColor: Colors.green, marginTop: 16 }}
          />
          <Button
            title="❌ Cancel Timer"
            onPress={() => { clearSafeArrival(); }}
            variant="outline"
            style={{ marginTop: 8 }}
          />
        </View>
      </SafeAreaContainer>
    );
  }

  return (
    <SafeAreaContainer>
      <Header title="🛣 Safe Arrival" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={[ss.content, { paddingBottom: 48 }]}>
        <Text style={ss.safeArrivalDesc}>Going on a long drive? Set a timer. If you don't check in, your contacts will be notified.</Text>

        <FormField label="Destination" required>
          <TextInput
            style={ss.textInput}
            placeholder="e.g. Mumbai"
            value={destination}
            onChangeText={setDestination}
            placeholderTextColor={Colors.gray400}
          />
        </FormField>

        <Text style={[ss.label, { marginBottom: 8 }]}>Expected arrival in</Text>
        <View style={ss.timeRow}>
          <View style={ss.timeField}>
            <TextInput
              style={ss.timeInput}
              value={hours}
              onChangeText={setHours}
              keyboardType="numeric"
              maxLength={2}
              placeholderTextColor={Colors.gray400}
            />
            <Text style={ss.timeUnit}>hours</Text>
          </View>
          <Text style={ss.timeSep}>:</Text>
          <View style={ss.timeField}>
            <TextInput
              style={ss.timeInput}
              value={mins}
              onChangeText={setMins}
              keyboardType="numeric"
              maxLength={2}
              placeholderTextColor={Colors.gray400}
            />
            <Text style={ss.timeUnit}>mins</Text>
          </View>
        </View>

        {/* Contacts to alert */}
        {emergencyContacts.length > 0 && (
          <>
            <Text style={[ss.label, { marginTop: 16, marginBottom: 8 }]}>Notify these contacts</Text>
            {emergencyContacts.map((c, i) => {
              const selected = !!selectedContacts.find((sc) => sc.phone === c.phone);
              return (
                <TouchableOpacity key={i} style={[ss.contactToggle, selected && ss.contactToggleActive]} onPress={() => toggleContact(c)}>
                  <Text style={[ss.contactToggleText, selected && { color: Colors.green }]}>{c.name} · {c.phone}</Text>
                  <Text style={{ fontSize: 18 }}>{selected ? '✅' : '⬜'}</Text>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        <Button
          title="▶ Start Safe Arrival Timer"
          onPress={handleStart}
          disabled={!destination || (!hours && !mins)}
          style={{ marginTop: 24, backgroundColor: Colors.amber }}
        />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaContainer>
  );
};

// ─── STYLES ───────────────────────────────────────────────────────────────────
const ss = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.gray900, marginBottom: 12 },

  // Incident Map
  mapPlaceholder: {
    height: 220, backgroundColor: Colors.gray100, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    borderWidth: 1, borderColor: Colors.gray200,
  },
  mapPlaceholderText: { fontSize: 16, color: Colors.gray600, fontWeight: '600' },
  statusGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  statusCard: {
    flex: 1, borderRadius: 10, padding: 10, alignItems: 'center',
    backgroundColor: '#fff', borderWidth: 1,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2,
  },
  statusLabel: { fontSize: 11, color: Colors.gray500, marginTop: 4 },
  statusValue: { fontSize: 12, fontWeight: '700', marginTop: 2 },
  etaBanner: {
    backgroundColor: '#eff6ff', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: Colors.blue + '44', marginBottom: 12,
  },
  etaText: { fontSize: 14, fontWeight: '700', color: Colors.blue },
  etaNote: { fontSize: 11, color: Colors.gray500, marginTop: 2 },
  serviceRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.gray100,
  },
  serviceLabel: { flex: 1, fontSize: 14, color: Colors.gray800 },
  serviceEta: { fontSize: 12, color: Colors.green, fontWeight: '700' },
  shareBox: {
    backgroundColor: Colors.gray50, borderRadius: 8, padding: 12, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.gray200,
  },
  shareLabel: { fontSize: 11, color: Colors.gray500, marginBottom: 4 },
  shareLink: { fontSize: 14, color: Colors.blue, fontWeight: '600', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },

  // Bystander Entry
  bystanderBanner: {
    backgroundColor: '#f0fdf4', borderRadius: 14, padding: 18,
    borderWidth: 1.5, borderColor: Colors.green, marginBottom: 16,
  },
  bystanderBannerTitle: { fontSize: 20, fontWeight: '800', color: Colors.greenDark, marginBottom: 4 },
  bystanderBannerSub: { fontSize: 14, color: Colors.green, lineHeight: 20 },
  locationConfirm: {
    backgroundColor: Colors.gray50, borderRadius: 10, padding: 14,
    borderWidth: 1, borderColor: Colors.gray200, marginBottom: 12,
  },
  locationConfirmLabel: { fontSize: 12, color: Colors.gray500, marginBottom: 4 },
  locationConfirmValue: { fontSize: 15, color: Colors.gray800, fontWeight: '600' },
  divider: { height: 1, backgroundColor: Colors.gray200, marginVertical: 24 },
  orText: { fontSize: 14, color: Colors.gray500, textAlign: 'center', marginBottom: 12 },

  // Role Assignment
  incidentHeader: {
    backgroundColor: '#f0fdf4', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: Colors.green, marginBottom: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  incidentId: { fontSize: 16, fontWeight: '800', color: Colors.greenDark },
  responderCount: { fontSize: 13, color: Colors.green, fontWeight: '600' },
  rolesHeading: { fontSize: 13, fontWeight: '700', color: Colors.gray500, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },

  // Guidance
  roleLabel: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16,
    backgroundColor: '#f0fdf4', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: Colors.green,
  },
  roleLabelIcon: { fontSize: 28 },
  roleLabelText: { fontSize: 16, fontWeight: '700', color: Colors.greenDark, flex: 1 },
  allDoneCard: {
    backgroundColor: '#f0fdf4', borderRadius: 14, padding: 20,
    alignItems: 'center', marginVertical: 16, borderWidth: 1.5, borderColor: Colors.green,
  },
  allDoneIcon: { fontSize: 40, marginBottom: 8 },
  allDoneTitle: { fontSize: 18, fontWeight: '800', color: Colors.greenDark, textAlign: 'center' },
  allDoneSub: { fontSize: 14, color: Colors.green, textAlign: 'center', marginTop: 4 },
  etaStrip: {
    backgroundColor: Colors.blue + '18', borderRadius: 10, padding: 12, marginTop: 8,
    borderWidth: 1, borderColor: Colors.blue + '44',
  },
  etaStripText: { fontSize: 14, color: Colors.blue, fontWeight: '600', textAlign: 'center' },

  // Medical ID
  emptyState: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 },
  emptyStateIcon: { fontSize: 60, marginBottom: 16 },
  emptyStateTitle: { fontSize: 22, fontWeight: '800', color: Colors.gray900, marginBottom: 8 },
  emptyStateSub: { fontSize: 14, color: Colors.gray500, textAlign: 'center', lineHeight: 22 },
  qrContainer: {
    backgroundColor: '#f5f3ff', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16,
    borderWidth: 1, borderColor: Colors.purple + '44',
  },
  qrLabel: { fontSize: 13, color: Colors.purple, fontWeight: '600', marginBottom: 16 },
  qrBox: {
    width: 220, height: 220, backgroundColor: '#fff',
    borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.gray200, marginBottom: 16,
  },
  qrFallback: { alignItems: 'center', justifyContent: 'center' },
  qrInstruction: { fontSize: 12, color: Colors.purple, textAlign: 'center', fontWeight: '500' },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.gray100,
  },
  infoLabel: { fontSize: 13, color: Colors.gray500, flex: 1 },
  infoValue: { fontSize: 14, color: Colors.gray800, fontWeight: '600', flex: 2, textAlign: 'right' },

  // Safe Arrival
  safeArrivalDesc: { fontSize: 14, color: Colors.gray600, lineHeight: 22, marginBottom: 20 },
  textInput: {
    borderWidth: 1, borderColor: Colors.gray300, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: Colors.gray900, backgroundColor: '#fff',
  },
  label: { fontSize: 14, fontWeight: '600', color: Colors.gray700 },
  timeRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 },
  timeField: { flex: 1, minWidth: 80, alignItems: 'center' },
  timeInput: {
    width: '100%', borderWidth: 1, borderColor: Colors.gray300, borderRadius: 10,
    padding: 12, fontSize: 28, fontWeight: '800', color: Colors.gray900, textAlign: 'center', backgroundColor: '#fff',
  },
  timeUnit: { fontSize: 12, color: Colors.gray500, marginTop: 4, fontWeight: '600' },
  timeSep: { fontSize: 28, fontWeight: '800', color: Colors.gray400, marginBottom: 20 },
  contactToggle: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.gray50, borderRadius: 10, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: Colors.gray200,
  },
  contactToggleActive: { backgroundColor: '#f0fdf4', borderColor: Colors.green },
  contactToggleText: { fontSize: 14, color: Colors.gray700, fontWeight: '500' },
  activeTimerCard: {
    backgroundColor: '#fffbeb', borderRadius: 16, padding: 24, alignItems: 'center',
    borderWidth: 2, borderColor: Colors.amber,
  },
  activeTimerIcon: { fontSize: 40, marginBottom: 8 },
  activeTimerTitle: { fontSize: 22, fontWeight: '900', color: Colors.amberDark },
  activeTimerDest: { fontSize: 15, color: Colors.gray600, marginTop: 4 },
  activeTimerMins: { fontSize: 32, fontWeight: '800', color: Colors.amber, marginTop: 8 },
});
