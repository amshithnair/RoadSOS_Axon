import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import {
  SafeAreaContainer,
  BottomTabs,
  OfflineDot,
  SafeArrivalBanner,
  Colors,
} from '../components/Layout';
import { useIncidentStore } from '../store';
import { TOTAL_CONTACTS_DEMO } from '../services/mockData';
import { EMERGENCY_DB } from '../services/emergencyDB';

const SIDE_PAD = 16;
const GAP = 10;
const { width: SCREEN_W } = Dimensions.get('window');
// Each grid cell = half the available width minus the gap
const CELL_W = (SCREEN_W - SIDE_PAD * 2 - GAP) / 2;

// ─── ANIMATED EMERGENCY BUTTON ───────────────────────────────────────────────
interface BtnProps {
  icon: string;
  title: string;
  subtitle?: string;
  color: string;
  onPress: () => void;
  size?: 'large' | 'medium' | 'small';
  width?: number | string;
}

const EmBtn: React.FC<BtnProps> = ({ icon, title, subtitle, color, onPress, size = 'medium', width }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const onIn  = () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 50 }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 50 }).start();

  const isLarge  = size === 'large';
  const isSmall  = size === 'small';
  const vPad     = isLarge ? 28 : isSmall ? 14 : 20;
  const iconSize  = isLarge ? 44 : isSmall ? 28 : 36;
  const titleSize = isLarge ? 16 : isSmall ? 12 : 14;

  return (
    <Animated.View style={{ transform: [{ scale }], width: width ?? '100%' }}>
      <TouchableOpacity
        style={[
          styles.emBtn,
          {
            backgroundColor: color,
            paddingVertical: vPad,
            width: '100%',
          },
        ]}
        onPress={onPress}
        onPressIn={onIn}
        onPressOut={onOut}
        activeOpacity={1}
      >
        <Text style={[styles.emBtnIcon, { fontSize: iconSize }]}>{icon}</Text>
        <Text style={[styles.emBtnTitle, { fontSize: titleSize }]}>{title}</Text>
        {subtitle ? <Text style={styles.emBtnSub}>{subtitle}</Text> : null}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── STAT PILL ────────────────────────────────────────────────────────────────
const StatPill: React.FC<{ icon: string; value: string; label: string; color: string }> = ({ icon, value, label, color }) => (
  <View style={styles.statPill}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ─── HOME SCREEN ─────────────────────────────────────────────────────────────
export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('home');
  const { offlineStatus, safeArrival, clearSafeArrival } = useIncidentStore();
  const counterAnim = useRef(new Animated.Value(0)).current;
  const [displayCount, setDisplayCount] = useState(0);
  const headerAnim = useRef(new Animated.Value(0)).current;

  // Animate contacts counter on load
  useEffect(() => {
    const listener = counterAnim.addListener(({ value }) => setDisplayCount(Math.floor(value)));
    Animated.timing(counterAnim, { toValue: TOTAL_CONTACTS_DEMO, duration: 2000, useNativeDriver: false }).start();

    Animated.timing(headerAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
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
    <SafeAreaContainer style={{ flex: 1, backgroundColor: '#f1f5f9' }}>
      {/* ── Top Bar ── */}
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <Text style={styles.logo}>🚨</Text>
          <View>
            <Text style={styles.logoText}>ROADSoS</Text>
            <Text style={styles.logoTagline}>Emergency Response</Text>
          </View>
          <View style={styles.betaBadge}><Text style={styles.betaText}>BETA</Text></View>
        </View>
        <View style={styles.topRight}>
          <OfflineDot status={offlineStatus === 'none' ? 'live' : offlineStatus} />
          <TouchableOpacity onPress={() => setActiveTab('profile')} style={styles.profileBtn}>
            <Text style={{ fontSize: 20 }}>👤</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Safe Arrival Banner ── */}
      {safeArrival.deadline && (
        <SafeArrivalBanner
          destination={safeArrival.destination}
          deadline={safeArrival.deadline}
          onCheckIn={clearSafeArrival}
        />
      )}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {activeTab === 'home' && <HomeTab nav={nav} navSupport={navSupport} displayCount={displayCount} />}
        {activeTab === 'profile' && <ProfileTab navigation={navigation} />}
      </ScrollView>

      <BottomTabs activeTab={activeTab} tabs={tabs} />
    </SafeAreaContainer>
  );
};

// ─── HOME TAB CONTENT ─────────────────────────────────────────────────────────
const HomeTab: React.FC<{
  nav: (screen: string, params?: any) => void;
  navSupport: (screen: string) => void;
  displayCount: number;
}> = ({ nav, navSupport, displayCount }) => {
  return (
    <>
      {/* Stats bar */}
      <View style={styles.statsBar}>
        <StatPill icon="📍" value={`${displayCount}`}            label="contacts"  color={Colors.green}  />
        <View style={styles.statsDivider} />
        <StatPill icon="🌍" value={`${EMERGENCY_DB.length - 1}`} label="countries" color={Colors.blue}   />
        <View style={styles.statsDivider} />
        <StatPill icon="📡" value="Offline"                      label="capable"   color={Colors.purple} />
      </View>

      {/* Section heading */}
      <Text style={styles.heading}>What's the emergency?</Text>
      <Text style={styles.subHeading}>Tap for immediate help · Works offline</Text>

      {/* ── Button Row 1: Accident — full width ── */}
      <EmBtn
        icon="🚗"
        title="Accident / Crash"
        subtitle="Triage · Medical · Ambulance"
        color={Colors.red}
        onPress={() => nav('Triage')}
        size="large"
      />

      {/* ── Button Row 2: Car Fire — full width ── */}
      <View style={{ marginTop: GAP }}>
        <EmBtn
          icon="🔥"
          title="Car Fire"
          subtitle="Evacuation guide · Fire brigade"
          color={Colors.orange}
          onPress={() => nav('EvacuationGuide')}
          size="large"
        />
      </View>

      {/* ── Button Grid: 2×2 exact — use fixed pixel widths ── */}
      <View style={styles.gridRow}>
        {/* Col 1 */}
        <View style={styles.gridCol}>
          <View style={{ width: CELL_W }}>
            <EmBtn icon="🔧" title="Breakdown" color={Colors.blue}   onPress={() => nav('EmergencyBreakdown', { defaultTab: 0 })} />
          </View>
          <View style={{ width: CELL_W, marginTop: GAP }}>
            <EmBtn icon="🌊" title="Flood / Natural" color={Colors.teal}   onPress={() => nav('EmergencyFlood')} />
          </View>
        </View>
        {/* Gap */}
        <View style={{ width: GAP }} />
        {/* Col 2 */}
        <View style={styles.gridCol}>
          <View style={{ width: CELL_W }}>
            <EmBtn icon="⛽" title="Out of Fuel"   color={Colors.purple} onPress={() => nav('EmergencyBreakdown', { defaultTab: 2 })} />
          </View>
          <View style={{ width: CELL_W, marginTop: GAP }}>
            <EmBtn icon="🚨" title="Crime / Theft" color="#7f1d1d"       onPress={() => nav('EmergencySOS')} />
          </View>
        </View>
      </View>

      {/* ── Quick Actions Row ── */}
      <Text style={styles.sectionLabel}>⚡ Quick Actions</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
        <View style={{ flexDirection: 'row', gap: 8, paddingRight: 8 }}>
          <QuickAction icon="🩺" label="CPR Guide"    onPress={() => navSupport('CPRGuide')} />
          <QuickAction icon="🆔" label="Medical ID"   onPress={() => navSupport('MedicalID')} />
          <QuickAction icon="📝" label="FIR Report"   onPress={() => navSupport('AccidentReport')} />
          <QuickAction icon="🗺" label="Incident Map" onPress={() => nav('IncidentMap')} />
          <QuickAction icon="🛣" label="Safe Drive"   onPress={() => navSupport('SafeArrival')} />
        </View>
      </ScrollView>

      {/* ── Global Coverage Card ── */}
      <View style={styles.globalCard}>
        <View style={styles.globalCardHeader}>
          <Text style={styles.globalCardTitle}>🌍 Global Emergency Coverage</Text>
          <Text style={styles.globalCardCount}>{EMERGENCY_DB.length - 1} countries</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
          <View style={{ flexDirection: 'row', gap: 6, paddingRight: 8 }}>
            {EMERGENCY_DB.filter(c => c.code !== 'EU').slice(0, 15).map((c) => (
              <View key={c.code} style={styles.countryChip}>
                <Text style={{ fontSize: 18 }}>{c.flag}</Text>
                <Text style={styles.countryChipCode}>{c.code}</Text>
              </View>
            ))}
            <View style={[styles.countryChip, { backgroundColor: Colors.blue + '18', borderColor: Colors.blue + '44', justifyContent: 'center' }]}>
              <Text style={{ fontSize: 14, color: Colors.blue, fontWeight: '700' }}>+{EMERGENCY_DB.length - 16}›</Text>
            </View>
          </View>
        </ScrollView>
        <Text style={styles.globalNote}>Auto-detects country from GPS · Offline-ready</Text>
      </View>

      {/* ── Bystander Strip ── */}
      <TouchableOpacity style={styles.bystanderStrip} onPress={() => navSupport('BystanderEntry')}>
        <View style={styles.bystanderIconWrap}>
          <Text style={{ fontSize: 24 }}>👁</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.bystanderTitle}>I'm a bystander at a crash</Text>
          <Text style={styles.bystanderSub}>Get a role assignment · Guide the rescue</Text>
        </View>
        <View style={styles.bystanderArrow}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>›</Text>
        </View>
      </TouchableOpacity>

      {/* ── CPR Callout ── */}
      <TouchableOpacity style={styles.cprBanner} onPress={() => navSupport('CPRGuide')}>
        <Text style={styles.cprBannerIcon}>🫀</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.cprBannerTitle}>CPR Metronome Guide</Text>
          <Text style={styles.cprBannerSub}>100–120 BPM · Step-by-step life-saving tool</Text>
        </View>
        <Text style={{ color: Colors.red, fontSize: 20, fontWeight: '800' }}>›</Text>
      </TouchableOpacity>
    </>
  );
};

// ─── QUICK ACTION PILL ────────────────────────────────────────────────────────
const QuickAction: React.FC<{ icon: string; label: string; onPress: () => void }> = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress}>
    <Text style={{ fontSize: 22 }}>{icon}</Text>
    <Text style={styles.quickActionLabel}>{label}</Text>
  </TouchableOpacity>
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
      <View style={styles.profileHero}>
        <View style={styles.profileAvatar}>
          <Text style={{ fontSize: 36 }}>👤</Text>
        </View>
        <Text style={styles.profileName}>{userName || 'Set up your profile'}</Text>
        <Text style={styles.profilePhone}>{userPhone || 'Tap Edit to add phone'}</Text>
        <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('Setup')}>
          <Text style={styles.editBtnText}>✏️ Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Emergency contacts */}
      <SectionCard title="🆘 Emergency Contacts">
        {emergencyContacts.length === 0 ? (
          <TouchableOpacity onPress={() => navigation.navigate('Setup')}>
            <Text style={styles.emptyLink}>+ Add emergency contacts →</Text>
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
        <InfoRow label="Allergies"   value={medicalDetails.allergies   || 'None'} />
        <InfoRow label="Medications" value={medicalDetails.medications || 'None'} />
      </SectionCard>

      {/* Language */}
      <SectionCard title="🌐 Language">
        <InfoRow label="Selected" value={{ en: 'English', hi: 'हिंदी', gu: 'ગુજરાતી' }[language] ?? 'English'} />
      </SectionCard>

      {/* Hackathon Demo Controller */}
      <SectionCard title="🛠️ Hackathon Presentation Controller">
        <Text style={styles.controllerHeading}>Simulate Connection Mode</Text>
        <View style={styles.controllerRow}>
          <TouchableOpacity
            style={[styles.controllerBtn, offlineStatus !== 'offline' && styles.controllerBtnActiveLive]}
            onPress={() => setOfflineStatus('live')}
          >
            <Text style={[styles.controllerBtnText, offlineStatus !== 'offline' && styles.controllerBtnTextActive]}>🟢 Live Network</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controllerBtn, offlineStatus === 'offline' && styles.controllerBtnActiveOffline]}
            onPress={() => setOfflineStatus('offline')}
          >
            <Text style={[styles.controllerBtnText, offlineStatus === 'offline' && styles.controllerBtnTextActive]}>🟠 Force Offline</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.controllerHeading, { marginTop: 14 }]}>Simulate GPS Country Override</Text>
        <Text style={styles.controllerHelp}>Test auto-resolving coordinates to local country numbers (108 vs 911 vs 999 vs 119):</Text>

        <View style={styles.locationGrid}>
          {[
            { label: '🛰️ Auto (Real GPS)', code: null,  lat: 0,       lng: 0,         loc: 'Real GPS', full: null },
            { label: '🇮🇳 New Delhi, IN',  code: 'IN', lat: 28.632,  lng: 77.219,    loc: 'New Delhi, India (Overridden)' },
            { label: '🇺🇸 New York, US',   code: 'US', lat: 40.7128, lng: -74.006,   loc: 'New York, USA (Overridden)' },
            { label: '🇬🇧 London, UK',     code: 'GB', lat: 51.5074, lng: -0.1278,   loc: 'London, UK (Overridden)' },
            { label: '🇯🇵 Tokyo, JP',      code: 'JP', lat: 35.6762, lng: 139.6503,  loc: 'Tokyo, Japan (Overridden)' },
          ].map((item) => {
            const isActive = item.code === null
              ? locationOverride === null
              : locationOverride?.countryCode === item.code;
            return (
              <TouchableOpacity
                key={item.label}
                style={[styles.locChip, isActive && styles.locChipActive]}
                onPress={() => {
                  if (item.code === null) {
                    setLocationOverride(null);
                  } else {
                    setLocationOverride({ lat: item.lat, lng: item.lng, label: item.loc, countryCode: item.code });
                  }
                }}
              >
                <Text style={[styles.locChipText, isActive && styles.locChipTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.controllerStatusBadge}>
          <Text style={styles.statusBadgeText}>
            Status: {locationOverride ? `📍 Overridden: ${locationOverride.label}` : '🛰️ Real GPS Active'}
          </Text>
        </View>
      </SectionCard>

      {/* Quick links */}
      <View style={styles.quickLinks}>
        <QuickLink icon="🆔" title="Medical QR ID"      sub="Offline QR for first responders"   onPress={() => navigation.navigate('SupportFlows',   { screen: 'MedicalID' })} />
        <QuickLink icon="🛣" title="Safe Arrival Timer"  sub="Set trip deadline alert"            onPress={() => navigation.navigate('SupportFlows',   { screen: 'SafeArrival' })} />
        <QuickLink icon="👁" title="I'm a Bystander"     sub="Help someone at a crash"            onPress={() => navigation.navigate('SupportFlows',   { screen: 'BystanderEntry' })} />
        <QuickLink icon="🗺" title="Incident Map"        sub="View live incident status"          onPress={() => navigation.navigate('EmergencyFlows', { screen: 'IncidentMap' })} />
        <QuickLink icon="🩺" title="CPR Metronome Guide" sub="Interactive life-saving tool"       onPress={() => navigation.navigate('SupportFlows',   { screen: 'CPRGuide' })} />
        <QuickLink icon="📝" title="Accident Report / FIR" sub="Auto-generate shareable reports" onPress={() => navigation.navigate('SupportFlows',   { screen: 'AccidentReport' })} />
      </View>

      {/* App stats */}
      <View style={styles.appStats}>
        <Text style={styles.appStatsTitle}>App Coverage</Text>
        <View style={styles.appStatsGrid}>
          <StatBox value={`${TOTAL_CONTACTS_DEMO}+`}         label="Contacts\nper incident" />
          <StatBox value={`${EMERGENCY_DB.length - 1}`}      label="Countries\ncovered" />
          <StatBox value="100%"                               label="Offline\ncapable" />
          <StatBox value="<3s"                                label="Avg. load\ntime" />
        </View>
      </View>

      {/* Reset Data Button */}
      <View style={{ marginTop: 16, marginBottom: 32, alignItems: 'center' }}>
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={async () => {
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            await AsyncStorage.clear();
            alert('App data reset! Reload the page to see the onboarding screen.');
            if ((window as any)?.location) (window as any).location.reload();
          }}
        >
          <Text style={styles.resetBtnText}>🔄 Reset Demo Data (Show Onboarding)</Text>
        </TouchableOpacity>
        <Text style={styles.resetBtnHint}>Clears local storage · Restarts onboarding flow</Text>
      </View>
    </ScrollView>
  );
};

// ─── SMALL SUB-COMPONENTS ─────────────────────────────────────────────────────
const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.sectionCard}>
    <Text style={styles.sectionCardTitle}>{title}</Text>
    {children}
  </View>
);

const InfoRow: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[styles.infoValue, highlight && { color: Colors.red, fontWeight: '800' }]}>{value}</Text>
  </View>
);

const QuickLink: React.FC<{ icon: string; title: string; sub: string; onPress: () => void }> = ({ icon, title, sub, onPress }) => (
  <TouchableOpacity style={styles.quickLink} onPress={onPress}>
    <Text style={{ fontSize: 24, marginRight: 12 }}>{icon}</Text>
    <View style={{ flex: 1 }}>
      <Text style={styles.quickLinkTitle}>{title}</Text>
      <Text style={styles.quickLinkSub}>{sub}</Text>
    </View>
    <Text style={{ color: Colors.gray300, fontSize: 20 }}>›</Text>
  </TouchableOpacity>
);

const StatBox: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <View style={styles.statBox}>
    <Text style={styles.statBoxValue}>{value}</Text>
    <Text style={styles.statBoxLabel}>{label}</Text>
  </View>
);

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: Colors.gray100,
  },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { fontSize: 22 },
  logoText: { fontSize: 16, fontWeight: '900', color: Colors.gray900, letterSpacing: -0.5 },
  logoTagline: { fontSize: 9, color: Colors.gray400, fontWeight: '600', letterSpacing: 0.5 },
  betaBadge: {
    backgroundColor: Colors.red + '18', borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  betaText: { fontSize: 8, fontWeight: '800', color: Colors.red, letterSpacing: 1 },
  profileBtn: { padding: 6 },

  // Scroll
  scroll: { paddingHorizontal: SIDE_PAD, paddingTop: 14, paddingBottom: 100 },

  // Stats bar
  statsBar: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14,
    paddingVertical: 12, paddingHorizontal: 8, marginBottom: 16,
    borderWidth: 1, borderColor: Colors.gray100,
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 2 },
      default: {},
    }),
  },
  statPill: { flex: 1, alignItems: 'center' },
  statIcon: { fontSize: 16, marginBottom: 2 },
  statValue: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 10, color: Colors.gray400, fontWeight: '600', marginTop: 1 },
  statsDivider: { width: 1, backgroundColor: Colors.gray100, marginVertical: 4 },

  // Headings
  heading: { fontSize: 22, fontWeight: '900', color: Colors.gray900, marginBottom: 2 },
  subHeading: { fontSize: 12, color: Colors.gray400, marginBottom: 12, fontWeight: '500' },
  sectionLabel: {
    fontSize: 11, fontWeight: '800', color: Colors.gray500,
    marginTop: 16, marginBottom: 8,
    textTransform: 'uppercase', letterSpacing: 1,
  },

  // Emergency button
  emBtn: {
    borderRadius: 16,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  emBtnIcon: { marginBottom: 4 },
  emBtnTitle: { fontWeight: '800', color: '#fff', textAlign: 'center', lineHeight: 20 },
  emBtnSub: { fontSize: 10, color: 'rgba(255,255,255,0.75)', marginTop: 3, textAlign: 'center' },

  // Grid
  gridRow: { flexDirection: 'row', marginTop: GAP },
  gridCol: { flexDirection: 'column' },

  // Quick action pills (horizontal scroll)
  quickAction: {
    alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1, borderColor: Colors.gray200,
    gap: 4,
  },
  quickActionLabel: { fontSize: 10, fontWeight: '700', color: Colors.gray700 },

  // Global card
  globalCard: {
    marginTop: 14, backgroundColor: '#fff', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.gray100,
  },
  globalCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  globalCardTitle: { fontSize: 14, fontWeight: '700', color: Colors.gray900 },
  globalCardCount: {
    fontSize: 12, color: Colors.blue, fontWeight: '700',
    backgroundColor: Colors.blue + '18', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  countryChip: {
    alignItems: 'center', paddingHorizontal: 8, paddingVertical: 6,
    backgroundColor: Colors.gray50, borderRadius: 8, borderWidth: 1, borderColor: Colors.gray200,
  },
  countryChipCode: { fontSize: 9, color: Colors.gray600, fontWeight: '700', marginTop: 2 },
  globalNote: { fontSize: 11, color: Colors.gray400, marginTop: 8, fontStyle: 'italic' },

  // Bystander strip
  bystanderStrip: {
    marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.greenDark, borderRadius: 14, padding: 14,
  },
  bystanderIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  bystanderTitle: { fontSize: 14, fontWeight: '700', color: '#fff' },
  bystanderSub: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  bystanderArrow: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },

  // CPR banner
  cprBanner: {
    marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    borderWidth: 1.5, borderColor: Colors.red + '44',
  },
  cprBannerIcon: { fontSize: 28 },
  cprBannerTitle: { fontSize: 14, fontWeight: '700', color: Colors.gray900 },
  cprBannerSub: { fontSize: 11, color: Colors.gray500, marginTop: 2 },

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

  // Reset button
  resetBtn: {
    backgroundColor: Colors.red, paddingVertical: 12, paddingHorizontal: 20,
    borderRadius: 10, alignItems: 'center',
  },
  resetBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  resetBtnHint: { color: Colors.gray400, fontSize: 10, marginTop: 6, textAlign: 'center' },
});
