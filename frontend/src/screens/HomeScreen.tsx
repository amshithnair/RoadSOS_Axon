import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {
  SafeAreaContainer,
  EmergencyButton,
  BottomTabs,
  OfflineDot,
  SafeArrivalBanner,
  Colors,
} from '../components/Layout';
import { useIncidentStore } from '../store';
import { TOTAL_CONTACTS_DEMO } from '../services/mockData';
import { EMERGENCY_DB } from '../services/emergencyDB';

const COL_GAP = 10;
const SIDE_PAD = 16;

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('home');
  const { offlineStatus, safeArrival, clearSafeArrival } = useIncidentStore();
  const counterAnim = useRef(new Animated.Value(0)).current;
  const [displayCount, setDisplayCount] = useState(0);

  // Animate contacts counter on load
  useEffect(() => {
    const listener = counterAnim.addListener(({ value }) => setDisplayCount(Math.floor(value)));
    Animated.timing(counterAnim, {
      toValue: TOTAL_CONTACTS_DEMO,
      duration: 2000,
      useNativeDriver: false,
    }).start();
    return () => counterAnim.removeListener(listener);
  }, []);

  const nav = (screen: string, params?: any) =>
    navigation.navigate('EmergencyFlows', { screen, params });
  const navSupport = (screen: string) =>
    navigation.navigate('SupportFlows', { screen });

  const tabs = [
    { id: 'home',    icon: '🏠', label: 'Home',      action: () => setActiveTab('home') },
    { id: 'profile', icon: '👤', label: 'Profile',   action: () => setActiveTab('profile') },
    { id: 'qr',      icon: '🆔', label: 'Medical ID', action: () => navSupport('MedicalID') },
    { id: 'arrival', icon: '🛣',  label: 'Safe Drive', action: () => navSupport('SafeArrival') },
  ];

  return (
    <SafeAreaContainer style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* Top Bar */}
      <View style={ss.topBar}>
        <View style={ss.topLeft}>
          <Text style={ss.logo}>🚨 ROADSoS</Text>
          <View style={ss.betaBadge}><Text style={ss.betaText}>BETA</Text></View>
        </View>
        <OfflineDot status={offlineStatus === 'none' ? 'live' : offlineStatus} />
        <TouchableOpacity onPress={() => setActiveTab('profile')} style={ss.profileBtn}>
          <Text style={{ fontSize: 20 }}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Safe Arrival Banner */}
      {safeArrival.deadline && (
        <SafeArrivalBanner
          destination={safeArrival.destination}
          deadline={safeArrival.deadline}
          onCheckIn={clearSafeArrival}
        />
      )}

      <ScrollView contentContainerStyle={ss.scroll} showsVerticalScrollIndicator={false}>
        {activeTab === 'home' && (
          <>
            {/* Hero stats bar */}
            <View style={ss.statsBar}>
              <StatPill icon="📍" value={`${displayCount}`} label="contacts" color={Colors.green} />
              <View style={ss.statsDivider} />
              <StatPill icon="🌍" value={`${EMERGENCY_DB.length - 1}`} label="countries" color={Colors.blue} />
              <View style={ss.statsDivider} />
              <StatPill icon="📡" value="Offline" label="capable" color={Colors.purple} />
            </View>

            <Text style={ss.heading}>What's the emergency?</Text>
            <Text style={ss.subHeading}>Tap for immediate help</Text>

            {/* Row 1 — Accident (full width, largest) */}
            <View style={ss.fullRow}>
              <EmergencyButton
                icon="🚗"
                title="Accident / Crash"
                color={Colors.red}
                onPress={() => nav('Triage')}
                size="large"
              />
            </View>

            {/* Row 2 — Car Fire (full width, large) */}
            <View style={[ss.fullRow, { marginTop: COL_GAP }]}>
              <EmergencyButton
                icon="🔥"
                title="Car Fire"
                color={Colors.orange}
                onPress={() => nav('EvacuationGuide')}
                size="large"
              />
            </View>

            {/* Row 3 — 2×2 grid */}
            <View style={ss.grid}>
              <View style={ss.gridItem}>
                <EmergencyButton icon="🔧" title="Breakdown" color={Colors.blue} onPress={() => nav('EmergencyBreakdown', { defaultTab: 0 })} />
              </View>
              <View style={ss.gridItem}>
                <EmergencyButton icon="⛽" title="Out of Fuel" color={Colors.purple} onPress={() => nav('EmergencyBreakdown', { defaultTab: 2 })} />
              </View>
              <View style={ss.gridItem}>
                <EmergencyButton icon="🌊" title="Flood / Natural" color={Colors.teal} onPress={() => nav('EmergencyFlood')} />
              </View>
              <View style={ss.gridItem}>
                <EmergencyButton icon="🚨" title="Crime / Theft" color="#7f1d1d" onPress={() => nav('EmergencySOS')} />
              </View>
            </View>

            {/* Global Coverage Section */}
            <View style={ss.globalCard}>
              <View style={ss.globalCardHeader}>
                <Text style={ss.globalCardTitle}>🌍 Global Emergency Coverage</Text>
                <Text style={ss.globalCardCount}>{EMERGENCY_DB.length - 1} countries</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                <View style={{ flexDirection: 'row', gap: 6, paddingRight: 8 }}>
                  {EMERGENCY_DB.filter(c => c.code !== 'EU').slice(0, 15).map((c) => (
                    <View key={c.code} style={ss.countryChip}>
                      <Text style={{ fontSize: 18 }}>{c.flag}</Text>
                      <Text style={ss.countryChipCode}>{c.code}</Text>
                    </View>
                  ))}
                  <View style={[ss.countryChip, { backgroundColor: Colors.blue + '18', borderColor: Colors.blue + '44' }]}>
                    <Text style={{ fontSize: 14, color: Colors.blue, fontWeight: '700' }}>+{EMERGENCY_DB.length - 16}›</Text>
                  </View>
                </View>
              </ScrollView>
              <Text style={ss.globalNote}>Auto-detects country from GPS · Offline-ready</Text>
            </View>

            {/* Bystander ghost strip */}
            <TouchableOpacity
              style={ss.bystanderStrip}
              onPress={() => navSupport('BystanderEntry')}
            >
              <Text style={ss.bystanderIcon}>👁</Text>
              <View style={{ flex: 1 }}>
                <Text style={ss.bystanderTitle}>I'm a bystander at a crash</Text>
                <Text style={ss.bystanderSub}>Help guide rescue — get role assignment</Text>
              </View>
              <Text style={{ color: Colors.green, fontSize: 20 }}>›</Text>
            </TouchableOpacity>
          </>
        )}

        {activeTab === 'profile' && <ProfileTab navigation={navigation} />}
      </ScrollView>

      <BottomTabs activeTab={activeTab} tabs={tabs} />
    </SafeAreaContainer>
  );
};

// ─── STAT PILL ────────────────────────────────────────────────────────────────
const StatPill: React.FC<{ icon: string; value: string; label: string; color: string }> = ({ icon, value, label, color }) => (
  <View style={ss.statPill}>
    <Text style={ss.statIcon}>{icon}</Text>
    <Text style={[ss.statValue, { color }]}>{value}</Text>
    <Text style={ss.statLabel}>{label}</Text>
  </View>
);

// ─── PROFILE TAB ─────────────────────────────────────────────────────────────
const ProfileTab: React.FC<{ navigation: any }> = ({ navigation }) => {
  const {
    userName,
    userPhone,
    emergencyContacts,
    medicalDetails,
    language,
    offlineStatus,
    setOfflineStatus,
    locationOverride,
    setLocationOverride,
  } = useIncidentStore();

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Header card */}
      <View style={ss.profileHero}>
        <View style={ss.profileAvatar}>
          <Text style={{ fontSize: 36 }}>👤</Text>
        </View>
        <Text style={ss.profileName}>{userName || 'Set up your profile'}</Text>
        <Text style={ss.profilePhone}>{userPhone || 'Tap Edit to add phone'}</Text>
        <TouchableOpacity style={ss.editBtn} onPress={() => navigation.navigate('Setup')}>
          <Text style={ss.editBtnText}>✏️ Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Emergency contacts */}
      <SectionCard title="🆘 Emergency Contacts">
        {emergencyContacts.length === 0 ? (
          <TouchableOpacity onPress={() => navigation.navigate('Setup')}>
            <Text style={ss.emptyLink}>+ Add emergency contacts →</Text>
          </TouchableOpacity>
        ) : (
          emergencyContacts.map((c, i) => (
            <InfoRow key={i} label={`Contact ${i + 1}`} value={`${c.name}  ·  ${c.phone}`} />
          ))
        )}
      </SectionCard>

      {/* Medical info */}
      <SectionCard title="🩸 Medical Info">
        <InfoRow label="Blood Group" value={medicalDetails.bloodGroup || 'Not set'} highlight={!!medicalDetails.bloodGroup} />
        <InfoRow label="Allergies" value={medicalDetails.allergies || 'None'} />
        <InfoRow label="Medications" value={medicalDetails.medications || 'None'} />
      </SectionCard>

      {/* Language */}
      <SectionCard title="🌐 Language">
        <InfoRow label="Selected" value={{ en: 'English', hi: 'हिंदी', gu: 'ગુજરાતી' }[language] ?? 'English'} />
      </SectionCard>

      {/* Hackathon Demo Controller */}
      <SectionCard title="🛠️ Hackathon Presentation Controller">
        <Text style={ss.controllerHeading}>Simulate Connection Mode</Text>
        <View style={ss.controllerRow}>
          <TouchableOpacity
            style={[
              ss.controllerBtn,
              offlineStatus !== 'offline' && ss.controllerBtnActiveLive,
            ]}
            onPress={() => setOfflineStatus('live')}
          >
            <Text style={[
              ss.controllerBtnText,
              offlineStatus !== 'offline' && ss.controllerBtnTextActive,
            ]}>🟢 Live Network</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              ss.controllerBtn,
              offlineStatus === 'offline' && ss.controllerBtnActiveOffline,
            ]}
            onPress={() => setOfflineStatus('offline')}
          >
            <Text style={[
              ss.controllerBtnText,
              offlineStatus === 'offline' && ss.controllerBtnTextActive,
            ]}>🟠 Force Offline</Text>
          </TouchableOpacity>
        </View>

        <Text style={[ss.controllerHeading, { marginTop: 14 }]}>Simulate GPS Country Override</Text>
        <Text style={ss.controllerHelp}>Test auto-resolving coordinates to local country numbers (108 vs 911 vs 999 vs 119):</Text>

        <View style={ss.locationGrid}>
          <TouchableOpacity
            style={[
              ss.locChip,
              locationOverride === null && ss.locChipActive,
            ]}
            onPress={() => setLocationOverride(null)}
          >
            <Text style={[ss.locChipText, locationOverride === null && ss.locChipTextActive]}>🛰️ Auto (Real GPS)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              ss.locChip,
              locationOverride?.countryCode === 'IN' && ss.locChipActive,
            ]}
            onPress={() => setLocationOverride({
              lat: 28.632,
              lng: 77.219,
              label: 'New Delhi, India (Overridden)',
              countryCode: 'IN'
            })}
          >
            <Text style={[ss.locChipText, locationOverride?.countryCode === 'IN' && ss.locChipTextActive]}>🇮🇳 New Delhi, IN</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              ss.locChip,
              locationOverride?.countryCode === 'US' && ss.locChipActive,
            ]}
            onPress={() => setLocationOverride({
              lat: 40.7128,
              lng: -74.0060,
              label: 'New York, USA (Overridden)',
              countryCode: 'US'
            })}
          >
            <Text style={[ss.locChipText, locationOverride?.countryCode === 'US' && ss.locChipTextActive]}>🇺🇸 New York, US</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              ss.locChip,
              locationOverride?.countryCode === 'GB' && ss.locChipActive,
            ]}
            onPress={() => setLocationOverride({
              lat: 51.5074,
              lng: -0.1278,
              label: 'London, UK (Overridden)',
              countryCode: 'GB'
            })}
          >
            <Text style={[ss.locChipText, locationOverride?.countryCode === 'GB' && ss.locChipTextActive]}>🇬🇧 London, UK</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              ss.locChip,
              locationOverride?.countryCode === 'JP' && ss.locChipActive,
            ]}
            onPress={() => setLocationOverride({
              lat: 35.6762,
              lng: 139.6503,
              label: 'Tokyo, Japan (Overridden)',
              countryCode: 'JP'
            })}
          >
            <Text style={[ss.locChipText, locationOverride?.countryCode === 'JP' && ss.locChipTextActive]}>🇯🇵 Tokyo, JP</Text>
          </TouchableOpacity>
        </View>

        {/* Current status display badge */}
        <View style={ss.controllerStatusBadge}>
          <Text style={ss.statusBadgeText}>
            Status: {locationOverride ? `📍 Overridden: ${locationOverride.label}` : '🛰️ Real GPS Active'}
          </Text>
        </View>
      </SectionCard>

      {/* Quick links */}
      <View style={ss.quickLinks}>
        <QuickLink icon="🆔" title="Medical QR ID" sub="Offline QR for first responders" onPress={() => navigation.navigate('SupportFlows', { screen: 'MedicalID' })} />
        <QuickLink icon="🛣" title="Safe Arrival Timer" sub="Set trip deadline alert" onPress={() => navigation.navigate('SupportFlows', { screen: 'SafeArrival' })} />
        <QuickLink icon="👁" title="I'm a Bystander" sub="Help someone at a crash" onPress={() => navigation.navigate('SupportFlows', { screen: 'BystanderEntry' })} />
        <QuickLink icon="🗺" title="Incident Map" sub="View live incident status" onPress={() => navigation.navigate('EmergencyFlows', { screen: 'IncidentMap' })} />
        <QuickLink icon="🩺" title="CPR Metronome Guide" sub="Interactive life-saving tool" onPress={() => navigation.navigate('SupportFlows', { screen: 'CPRGuide' })} />
        <QuickLink icon="📝" title="Accident Report / FIR" sub="Auto-generate shareable reports" onPress={() => navigation.navigate('SupportFlows', { screen: 'AccidentReport' })} />
      </View>

      {/* App stats */}
      <View style={ss.appStats}>
        <Text style={ss.appStatsTitle}>App Coverage</Text>
        <View style={ss.appStatsGrid}>
          <StatBox value={`${TOTAL_CONTACTS_DEMO}+`} label="Contacts\nper incident" />
          <StatBox value={`${EMERGENCY_DB.length - 1}`} label="Countries\ncovered" />
          <StatBox value="100%" label="Offline\ncapable" />
          <StatBox value="<3s" label="Avg. load\ntime" />
        </View>
      </View>

      {/* Reset Data Button */}
      <View style={{ marginTop: 20, alignItems: 'center' }}>
        <TouchableOpacity
          style={{ backgroundColor: Colors.red, padding: 12, borderRadius: 8 }}
          onPress={async () => {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            await AsyncStorage.clear();
            alert('App data reset! Please reload the page to see the onboarding screen.');
            if (window?.location) window.location.reload();
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>🔄 Reset Demo Data (Show Onboarding)</Text>
        </TouchableOpacity>
        <Text style={{ color: Colors.gray400, fontSize: 11, marginTop: 6, textAlign: 'center' }}>
          Tap to clear local storage and restart the onboarding flow.
        </Text>
      </View>
    </ScrollView>
  );
};

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={ss.sectionCard}>
    <Text style={ss.sectionCardTitle}>{title}</Text>
    {children}
  </View>
);

const InfoRow: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
  <View style={ss.infoRow}>
    <Text style={ss.infoLabel}>{label}</Text>
    <Text style={[ss.infoValue, highlight && { color: Colors.red, fontWeight: '800' }]}>{value}</Text>
  </View>
);

const QuickLink: React.FC<{ icon: string; title: string; sub: string; onPress: () => void }> = ({ icon, title, sub, onPress }) => (
  <TouchableOpacity style={ss.quickLink} onPress={onPress}>
    <Text style={{ fontSize: 24, marginRight: 12 }}>{icon}</Text>
    <View style={{ flex: 1 }}>
      <Text style={ss.quickLinkTitle}>{title}</Text>
      <Text style={ss.quickLinkSub}>{sub}</Text>
    </View>
    <Text style={{ color: Colors.gray300, fontSize: 20 }}>›</Text>
  </TouchableOpacity>
);

const StatBox: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <View style={ss.statBox}>
    <Text style={ss.statBoxValue}>{value}</Text>
    <Text style={ss.statBoxLabel}>{label}</Text>
  </View>
);

// ─── STYLES ──────────────────────────────────────────────────────────────────
const ss = StyleSheet.create({
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: Colors.gray100,
  },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logo: { fontSize: 18, fontWeight: '900', color: Colors.gray900 },
  betaBadge: { backgroundColor: Colors.red + '18', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  betaText: { fontSize: 9, fontWeight: '800', color: Colors.red, letterSpacing: 1 },
  profileBtn: { padding: 6 },

  scroll: { paddingHorizontal: SIDE_PAD, paddingTop: 14, paddingBottom: 100 },

  // Stats bar
  statsBar: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14,
    paddingVertical: 12, paddingHorizontal: 8, marginBottom: 16,
    borderWidth: 1, borderColor: Colors.gray100,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4,
  },
  statPill: { flex: 1, alignItems: 'center' },
  statIcon: { fontSize: 16, marginBottom: 2 },
  statValue: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 10, color: Colors.gray400, fontWeight: '600', marginTop: 1 },
  statsDivider: { width: 1, backgroundColor: Colors.gray100, marginVertical: 4 },

  heading: { fontSize: 24, fontWeight: '900', color: Colors.gray900, marginBottom: 4 },
  subHeading: { fontSize: 13, color: Colors.gray400, marginBottom: 14, fontWeight: '500' },

  fullRow: { width: '100%' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, width: '100%' },
  gridItem: { flexBasis: '47%', flexGrow: 1 },

  // Global card
  globalCard: {
    marginTop: 14, backgroundColor: '#fff', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.gray100,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2,
  },
  globalCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  globalCardTitle: { fontSize: 14, fontWeight: '700', color: Colors.gray900 },
  globalCardCount: { fontSize: 12, color: Colors.blue, fontWeight: '700', backgroundColor: Colors.blue + '18', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  countryChip: {
    alignItems: 'center', paddingHorizontal: 8, paddingVertical: 6,
    backgroundColor: Colors.gray50, borderRadius: 8, borderWidth: 1, borderColor: Colors.gray200,
  },
  countryChipCode: { fontSize: 9, color: Colors.gray600, fontWeight: '700', marginTop: 2 },
  globalNote: { fontSize: 11, color: Colors.gray400, marginTop: 8, fontStyle: 'italic' },

  // Bystander strip
  bystanderStrip: {
    marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#f0fdf4', borderRadius: 14, padding: 14,
    borderWidth: 1.5, borderColor: Colors.green,
  },
  bystanderIcon: { fontSize: 26 },
  bystanderTitle: { fontSize: 14, fontWeight: '700', color: Colors.greenDark },
  bystanderSub: { fontSize: 11, color: Colors.green, marginTop: 2 },

  // Profile
  profileHero: {
    backgroundColor: '#fff', margin: 4, borderRadius: 16, padding: 24,
    alignItems: 'center', marginBottom: 12,
    borderWidth: 1, borderColor: Colors.gray100,
  },
  profileAvatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.gray100,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  profileName: { fontSize: 20, fontWeight: '800', color: Colors.gray900, marginBottom: 4 },
  profilePhone: { fontSize: 14, color: Colors.gray500, marginBottom: 12 },
  editBtn: {
    backgroundColor: Colors.gray100, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8,
  },
  editBtnText: { fontSize: 14, fontWeight: '700', color: Colors.gray700 },

  sectionCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.gray100,
  },
  sectionCardTitle: { fontSize: 14, fontWeight: '800', color: Colors.gray900, marginBottom: 12 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7,
    borderBottomWidth: 1, borderBottomColor: Colors.gray50,
  },
  infoLabel: { fontSize: 13, color: Colors.gray500 },
  infoValue: { fontSize: 13, color: Colors.gray800, fontWeight: '600', flexShrink: 1, textAlign: 'right', maxWidth: '60%' },
  emptyLink: { fontSize: 14, color: Colors.blue, fontWeight: '600' },

  quickLinks: { marginBottom: 10 },
  quickLink: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 12, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: Colors.gray100,
  },
  quickLinkTitle: { fontSize: 14, fontWeight: '700', color: Colors.gray900 },
  quickLinkSub: { fontSize: 12, color: Colors.gray500, marginTop: 2 },

  appStats: {
    backgroundColor: Colors.gray900, borderRadius: 16, padding: 16, marginBottom: 24,
  },
  appStatsTitle: { fontSize: 13, fontWeight: '700', color: Colors.gray400, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  appStatsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statBox: {
    flex: 1, minWidth: '45%', backgroundColor: Colors.gray800,
    borderRadius: 10, padding: 12, alignItems: 'center',
  },
  statBoxValue: { fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 4 },
  statBoxLabel: { fontSize: 11, color: Colors.gray400, textAlign: 'center', lineHeight: 16 },

  // Controller styles
  controllerHeading: { fontSize: 13, fontWeight: '700', color: Colors.gray600, marginBottom: 8 },
  controllerHelp: { fontSize: 11, color: Colors.gray400, marginBottom: 10, lineHeight: 16 },
  controllerRow: { flexDirection: 'row', gap: 8 },
  controllerBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: Colors.gray200, alignItems: 'center', backgroundColor: Colors.gray50 },
  controllerBtnActiveLive: { backgroundColor: Colors.green + '15', borderColor: Colors.green },
  controllerBtnActiveOffline: { backgroundColor: Colors.amber + '15', borderColor: Colors.amber },
  controllerBtnText: { fontSize: 12, fontWeight: '600', color: Colors.gray500 },
  controllerBtnTextActive: { color: Colors.gray900, fontWeight: '700' },
  locationGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  locChip: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: Colors.gray200, backgroundColor: Colors.gray50 },
  locChipActive: { backgroundColor: Colors.blue + '15', borderColor: Colors.blue },
  locChipText: { fontSize: 11, color: Colors.gray600, fontWeight: '500' },
  locChipTextActive: { color: Colors.blue, fontWeight: '700' },
  controllerStatusBadge: { marginTop: 12, padding: 8, borderRadius: 6, backgroundColor: Colors.gray100 },
  statusBadgeText: { fontSize: 11, color: Colors.gray600, fontWeight: '600', textAlign: 'center' },
});
