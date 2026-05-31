import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Dimensions,
  Animated,
  TextInput,
  Modal,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
export const Colors = {
  red: '#ef4444',
  redDark: '#b91c1c',
  orange: '#f97316',
  orangeDark: '#c2410c',
  blue: '#3b82f6',
  blueDark: '#1d4ed8',
  purple: '#a855f7',
  purpleDark: '#7e22ce',
  teal: '#14b8a6',
  tealDark: '#0f766e',
  slate: '#64748b',
  slateDark: '#334155',
  green: '#22c55e',
  greenDark: '#15803d',
  amber: '#f59e0b',
  amberDark: '#b45309',
  white: '#ffffff',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
};

// ─── SAFE AREA CONTAINER ─────────────────────────────────────────────────────
interface SafeAreaContainerProps {
  children: React.ReactNode;
  style?: any;
}
export const SafeAreaContainer: React.FC<SafeAreaContainerProps> = ({ children, style }) => (
  <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeContainer, style]}>{children}</SafeAreaView>
);

// ─── HEADER ──────────────────────────────────────────────────────────────────
interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  color?: string;
}
export const Header: React.FC<HeaderProps> = ({ title, onBack, rightAction, color }) => (
  <View style={[styles.header, color ? { backgroundColor: color, borderBottomColor: color } : {}]}>
    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.headerBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={[styles.backText, color ? { color: '#fff' } : {}]}>←</Text>
        </TouchableOpacity>
      )}
      <Text style={[styles.headerTitle, color ? { color: '#fff' } : {}]} numberOfLines={1}>{title}</Text>
    </View>
    {rightAction}
  </View>
);

// ─── OFFLINE DOT ─────────────────────────────────────────────────────────────
interface OfflineDotProps {
  status: 'live' | 'offline' | 'none';
}
export const OfflineDot: React.FC<OfflineDotProps> = ({ status }) => {
  const colorMap = { live: Colors.green, offline: Colors.amber, none: Colors.red };
  const labelMap = { live: 'Live', offline: 'Offline', none: 'No data' };
  return (
    <View style={styles.offlineDot}>
      <View style={[styles.dot, { backgroundColor: colorMap[status] }]} />
      <Text style={[styles.dotLabel, { color: colorMap[status] }]}>{labelMap[status]}</Text>
    </View>
  );
};

// ─── EMERGENCY BUTTON ────────────────────────────────────────────────────────
interface EmergencyButtonProps {
  icon: string;
  title: string;
  color: string;
  onPress: () => void;
  size?: 'large' | 'medium';
}
export const EmergencyButton: React.FC<EmergencyButtonProps> = ({ icon, title, color, onPress, size = 'medium' }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50 }).start();
  const handlePressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }).start();

  const isLarge = size === 'large';
  return (
    <Animated.View style={{ transform: [{ scale }], width: '100%' }}>
      <TouchableOpacity
        style={[styles.emergencyBtn, { backgroundColor: color, paddingVertical: isLarge ? 28 : 20, width: '100%' }]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Text style={[styles.emergencyBtnIcon, { fontSize: isLarge ? 44 : 36 }]}>{icon}</Text>
        <Text style={[styles.emergencyBtnTitle, { fontSize: isLarge ? 16 : 14 }]}>{title}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── EMERGENCY RESULT CARD ────────────────────────────────────────────────────
interface EmergencyCardProps {
  name: string;
  distance: string;
  phone?: string;
  isOffline?: boolean;
  accentColor?: string;
  onCall?: () => void;
  onNavigate?: () => void;
}
export const EmergencyCard: React.FC<EmergencyCardProps> = ({
  name, distance, phone, isOffline, accentColor = Colors.blue, onCall, onNavigate,
}) => (
  <View style={styles.emergencyCard}>
    <View style={styles.emergencyCardHeader}>
      <View style={{ flex: 1 }}>
        <Text style={styles.emergencyCardName}>{name}</Text>
        <Text style={styles.emergencyCardDistance}>{distance}</Text>
        {phone ? <Text style={styles.emergencyCardPhone}>{phone}</Text> : null}
      </View>
      {isOffline && (
        <View style={styles.offlineBadge}>
          <Text style={styles.offlineBadgeText}>Offline data</Text>
        </View>
      )}
    </View>
    <View style={styles.emergencyCardActions}>
      {onCall && (
        <TouchableOpacity style={[styles.cardBtn, { backgroundColor: Colors.green }]} onPress={onCall}>
          <Text style={styles.cardBtnText}>📞 Call</Text>
        </TouchableOpacity>
      )}
      {onNavigate && (
        <TouchableOpacity style={[styles.cardBtn, { backgroundColor: accentColor }]} onPress={onNavigate}>
          <Text style={styles.cardBtnText}>🗺 Navigate</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

// ─── GOLDEN HOUR TIMER ───────────────────────────────────────────────────────
interface GoldenHourTimerProps {
  startTime: number; // timestamp ms when started
}
export const GoldenHourTimer: React.FC<GoldenHourTimerProps> = ({ startTime }) => {
  const pulse = useRef(new Animated.Value(1)).current;
  const [remaining, setRemaining] = useState(3600);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const rem = Math.max(0, 3600 - elapsed);
      setRemaining(rem);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    if (remaining <= 1800) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.05, duration: 600, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      );
      anim.start();
      return () => anim.stop();
    }
  }, [remaining <= 1800]);

  const mins = Math.floor(remaining / 60).toString().padStart(2, '0');
  const secs = (remaining % 60).toString().padStart(2, '0');
  const isUrgent = remaining <= 1800;

  return (
    <Animated.View style={[styles.goldenTimer, { backgroundColor: isUrgent ? Colors.redDark : Colors.red, transform: [{ scale: pulse }] }]}>
      <Text style={styles.goldenTimerLabel}>⏱ Golden Hour</Text>
      <Text style={styles.goldenTimerTime}>{mins}:{secs}</Text>
    </Animated.View>
  );
};

// ─── LOCATION BAR ────────────────────────────────────────────────────────────
interface LocationBarProps {
  placeName: string;
  onKmMarkerPress?: () => void;
}
export const LocationBar: React.FC<LocationBarProps> = ({ placeName, onKmMarkerPress }) => (
  <View style={styles.locationBar}>
    <Text style={styles.locationBarIcon}>📍</Text>
    <View style={{ flex: 1 }}>
      <Text style={styles.locationBarText} numberOfLines={1}>{placeName || 'Getting location…'}</Text>
      {onKmMarkerPress && (
        <TouchableOpacity onPress={onKmMarkerPress}>
          <Text style={styles.kmMarkerLink}>Enter km marker</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

// ─── ALERT FAMILY BUTTON ─────────────────────────────────────────────────────
interface AlertFamilyButtonProps {
  onPress: () => void;
  sent?: boolean;
}
export const AlertFamilyButton: React.FC<AlertFamilyButtonProps> = ({ onPress, sent }) => (
  <TouchableOpacity
    style={[styles.alertFamilyBtn, sent && { backgroundColor: Colors.greenDark }]}
    onPress={onPress}
    disabled={sent}
  >
    <Text style={styles.alertFamilyText}>{sent ? '✅ Family Alerted' : '📲 Alert Family'}</Text>
  </TouchableOpacity>
);

// ─── FIRST AID STEPS ─────────────────────────────────────────────────────────
interface FirstAidStepsProps {
  steps: string[];
}
export const FirstAidSteps: React.FC<FirstAidStepsProps> = ({ steps }) => {
  const [open, setOpen] = useState(true);
  return (
    <View style={styles.firstAidContainer}>
      <TouchableOpacity style={styles.firstAidHeader} onPress={() => setOpen(!open)}>
        <Text style={styles.firstAidTitle}>🩹 First Aid Steps</Text>
        <Text style={styles.firstAidChevron}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open && steps.map((step, i) => (
        <View key={i} style={styles.firstAidStep}>
          <View style={styles.firstAidNum}><Text style={styles.firstAidNumText}>{i + 1}</Text></View>
          <Text style={styles.firstAidStepText}>{step}</Text>
        </View>
      ))}
    </View>
  );
};

// ─── PERMISSION ROW ──────────────────────────────────────────────────────────
type PermStatus = 'granted' | 'denied' | 'pending';
interface PermissionRowProps {
  icon: string;
  title: string;
  description: string;
  status: PermStatus;
  onPress: () => void;
}
export const PermissionRow: React.FC<PermissionRowProps> = ({ icon, title, description, status, onPress }) => {
  const statusColor = status === 'granted' ? Colors.green : status === 'denied' ? Colors.red : Colors.gray400;
  const statusLabel = status === 'granted' ? 'Granted' : status === 'denied' ? 'Denied' : 'Required';
  return (
    <TouchableOpacity style={styles.permRow} onPress={onPress} disabled={status === 'granted'}>
      <Text style={styles.permIcon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.permTitle}>{title}</Text>
        <Text style={styles.permDesc}>{description}</Text>
      </View>
      <View style={[styles.permBadge, { backgroundColor: statusColor + '22', borderColor: statusColor }]}>
        <Text style={[styles.permBadgeText, { color: statusColor }]}>{statusLabel}</Text>
      </View>
    </TouchableOpacity>
  );
};

// ─── CONTACT CARD ────────────────────────────────────────────────────────────
interface ContactCardProps {
  index: number;
  name: string;
  phone: string;
  onChangeName: (v: string) => void;
  onChangePhone: (v: string) => void;
  onRemove: () => void;
}
export const ContactCard: React.FC<ContactCardProps> = ({ index, name, phone, onChangeName, onChangePhone, onRemove }) => (
  <View style={styles.contactCard}>
    <View style={styles.contactCardHeader}>
      <Text style={styles.contactCardTitle}>Contact {index + 1}</Text>
      <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={{ color: Colors.red, fontSize: 20 }}>🗑</Text>
      </TouchableOpacity>
    </View>
    <TextInput style={styles.contactInput} placeholder="Name" value={name} onChangeText={onChangeName} placeholderTextColor={Colors.gray400} />
    <TextInput style={styles.contactInput} placeholder="Phone number" value={phone} onChangeText={onChangePhone} keyboardType="phone-pad" placeholderTextColor={Colors.gray400} />
  </View>
);

// ─── RESULT TAB BAR ──────────────────────────────────────────────────────────
interface ResultTabProps {
  tabs: string[];
  activeIndex: number;
  onTabChange: (i: number) => void;
}
export const ResultTab: React.FC<ResultTabProps> = ({ tabs, activeIndex, onTabChange }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
    <View style={{ flexDirection: 'row', gap: 8, paddingRight: 16 }}>
      {tabs.map((tab, i) => (
        <TouchableOpacity
          key={tab}
          style={[styles.resultTab, i === activeIndex && styles.resultTabActive]}
          onPress={() => onTabChange(i)}
        >
          <Text style={[styles.resultTabText, i === activeIndex && styles.resultTabTextActive]}>{tab}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </ScrollView>
);

// ─── PUMP ALERT BANNER ───────────────────────────────────────────────────────
interface PumpAlertBannerProps {
  pumpName: string;
}
export const PumpAlertBanner: React.FC<PumpAlertBannerProps> = ({ pumpName }) => (
  <View style={styles.pumpBanner}>
    <Text style={styles.pumpBannerText}>⛽ {pumpName} alerted — help is coming</Text>
  </View>
);

// ─── SAFE ARRIVAL BANNER ─────────────────────────────────────────────────────
interface SafeArrivalBannerProps {
  destination: string;
  deadline: number;
  onCheckIn: () => void;
}
export const SafeArrivalBanner: React.FC<SafeArrivalBannerProps> = ({ destination, deadline, onCheckIn }) => {
  const mins = Math.max(0, Math.ceil((deadline - Date.now()) / 60000));
  return (
    <TouchableOpacity style={styles.safeArrivalBanner} onPress={onCheckIn}>
      <Text style={styles.safeArrivalText}>🛣 {destination} · {mins}m remaining</Text>
      <Text style={styles.safeArrivalCTA}>Tap to check in ›</Text>
    </TouchableOpacity>
  );
};

// ─── ROLE CARD ───────────────────────────────────────────────────────────────
interface RoleCardProps {
  icon: string;
  role: string;
  description: string;
  isMine?: boolean;
  isTaken?: boolean;
  onPress?: () => void;
}
export const RoleCard: React.FC<RoleCardProps> = ({ icon, role, description, isMine, isTaken, onPress }) => (
  <TouchableOpacity
    style={[styles.roleCard, isMine && styles.roleCardMine, isTaken && !isMine && styles.roleCardTaken]}
    onPress={onPress}
    disabled={isTaken && !isMine}
  >
    <Text style={styles.roleCardIcon}>{icon}</Text>
    <View style={{ flex: 1, paddingRight: 8 }}>
      <Text style={[styles.roleCardTitle, isTaken && !isMine && { color: Colors.gray400 }]} numberOfLines={2}>{role}</Text>
      <Text style={[styles.roleCardDesc, isTaken && !isMine && { color: Colors.gray400 }]} numberOfLines={3}>{description}</Text>
    </View>
    {isMine && <View style={styles.myBadge}><Text style={styles.myBadgeText}>YOU</Text></View>}
    {isTaken && !isMine && <Text style={{ color: Colors.gray400, fontSize: 12 }}>Taken</Text>}
  </TouchableOpacity>
);

// ─── GUIDANCE STEP ───────────────────────────────────────────────────────────
interface GuidanceStepProps {
  step: string;
  index: number;
  isDone: boolean;
  isActive: boolean;
  onMarkDone: () => void;
}
export const GuidanceStep: React.FC<GuidanceStepProps> = ({ step, index, isDone, isActive, onMarkDone }) => (
  <View style={[styles.guidanceStep, isActive && styles.guidanceStepActive, isDone && styles.guidanceStepDone]}>
    <View style={[styles.guidanceNum, isDone && { backgroundColor: Colors.green }]}>
      <Text style={styles.guidanceNumText}>{isDone ? '✓' : index + 1}</Text>
    </View>
    <Text style={[styles.guidanceText, isDone && { textDecorationLine: 'line-through', color: Colors.gray400 }]}>{step}</Text>
    {isActive && !isDone && (
      <TouchableOpacity style={styles.markDoneBtn} onPress={onMarkDone}>
        <Text style={styles.markDoneText}>Done</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ─── KM MARKER MODAL ─────────────────────────────────────────────────────────
interface KmMarkerModalProps {
  visible: boolean;
  onClose: () => void;
  onResolve: (highway: string, km: string) => void;
}
export const KmMarkerModal: React.FC<KmMarkerModalProps> = ({ visible, onClose, onResolve }) => {
  const [highway, setHighway] = useState('');
  const [km, setKm] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [resolved, setResolved] = useState<any>(null);
  const slideAnim = useRef(new Animated.Value(300)).current;

  // Lazy import to avoid circular deps
  let getHighwayList: () => string[] = () => [];
  let resolveKmMarker: (h: string, k: number) => any = () => null;
  try {
    const db = require('../services/emergencyDB');
    getHighwayList = db.getHighwayList;
    resolveKmMarker = db.resolveKmMarker;
  } catch {}

  const allHighways = getHighwayList();

  useEffect(() => {
    if (visible) {
      setHighway(''); setKm(''); setResolved(null); setSuggestions([]);
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }).start();
    } else {
      slideAnim.setValue(300);
    }
  }, [visible]);

  const handleHighwayChange = (text: string) => {
    setHighway(text);
    setResolved(null);
    if (text.length >= 2) {
      const q = text.toUpperCase().replace(/\s/g, '');
      setSuggestions(allHighways.filter((h) => h.replace(/[\s-]/g, '').toUpperCase().includes(q)).slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const handleFind = () => {
    if (!highway || !km) return;
    const result = resolveKmMarker(highway, parseInt(km));
    if (result) {
      setResolved(result);
    } else {
      // Not in DB — use highway name as location label
      onResolve(highway, km);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%', flex: 1, justifyContent: 'flex-end' }}>
          <Animated.View style={[styles.modalSheet, { transform: [{ translateY: slideAnim }] }]}>
            <Pressable>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>📍 Enter KM Marker</Text>
            <Text style={styles.modalSubtitle}>For highway emergencies when GPS address is unclear</Text>

            <Text style={styles.inputLabel}>Highway Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. NH-48"
              value={highway}
              onChangeText={handleHighwayChange}
              placeholderTextColor={Colors.gray400}
              autoCapitalize="characters"
            />
            {/* Autocomplete suggestions */}
            {suggestions.length > 0 && (
              <View style={styles.suggestBox}>
                {suggestions.map((s) => (
                  <TouchableOpacity key={s} style={styles.suggestItem} onPress={() => { setHighway(s); setSuggestions([]); }}>
                    <Text style={styles.suggestText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.inputLabel}>KM Number</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 142"
              value={km}
              onChangeText={setKm}
              keyboardType="numeric"
              placeholderTextColor={Colors.gray400}
            />

            {/* Resolved result preview */}
            {resolved && (
              <View style={styles.resolvedCard}>
                <Text style={styles.resolvedTitle}>✅ Location found in offline DB</Text>
                <Text style={styles.resolvedSub}>{resolved.highway}, KM {resolved.km} · {resolved.state}</Text>
                {resolved.nearbyHospital && <Text style={styles.resolvedSub}>🏥 {resolved.nearbyHospital}</Text>}
                {resolved.nearbyPump && <Text style={styles.resolvedSub}>⛽ {resolved.nearbyPump}</Text>}
              </View>
            )}

            <TouchableOpacity
              style={[styles.modalBtn, (!highway || !km) && { opacity: 0.5 }]}
              onPress={resolved ? () => onResolve(highway, km) : handleFind}
              disabled={!highway || !km}
            >
              <Text style={styles.modalBtnText}>{resolved ? 'Use this location →' : 'Find services here'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancelBtn} onPress={onClose}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Animated.View>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

// ─── CARD ────────────────────────────────────────────────────────────────────
interface CardProps { children: React.ReactNode; style?: any; onPress?: () => void; }
export const Card: React.FC<CardProps> = ({ children, style, onPress }) => {
  const comp = <View style={[styles.card, style]}>{children}</View>;
  return onPress ? <TouchableOpacity onPress={onPress}>{comp}</TouchableOpacity> : comp;
};

// ─── FORM FIELD ──────────────────────────────────────────────────────────────
interface FormFieldProps { label: string; required?: boolean; children: React.ReactNode; }
export const FormField: React.FC<FormFieldProps> = ({ label, required, children }) => (
  <View style={styles.formField}>
    <View style={{ flexDirection: 'row' }}>
      <Text style={styles.label}>{label}</Text>
      {required && <Text style={{ color: Colors.red, marginLeft: 4 }}>*</Text>}
    </View>
    {children}
  </View>
);

// ─── BUTTON ──────────────────────────────────────────────────────────────────
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: any;
  icon?: string;
}
export const Button: React.FC<ButtonProps> = ({ variant = 'primary', title, onPress, disabled, style, icon }) => {
  const variantStyle = {
    primary: { backgroundColor: Colors.red },
    secondary: { backgroundColor: Colors.gray200 },
    danger: { backgroundColor: Colors.redDark },
    outline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: Colors.gray300 },
    ghost: { backgroundColor: 'transparent' },
  }[variant];
  const textColor = (variant === 'secondary' || variant === 'outline' || variant === 'ghost') ? Colors.gray900 : '#fff';
  return (
    <TouchableOpacity
      style={[styles.button, variantStyle, disabled && { opacity: 0.4 }, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.buttonText, { color: textColor }]}>{icon ? `${icon} ` : ''}{title}</Text>
    </TouchableOpacity>
  );
};

// ─── BOTTOM TABS ─────────────────────────────────────────────────────────────
interface BottomTabsProps {
  activeTab: string;
  tabs: Array<{ id: string; icon: string; label: string; action: () => void }>;
}
export const BottomTabs: React.FC<BottomTabsProps> = ({ activeTab, tabs }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bottomTabs, { paddingBottom: Math.max(insets.bottom, 4) }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity key={tab.id} style={styles.tabButton} onPress={tab.action}>
            <Text style={[styles.tabIcon, isActive && { opacity: 1 }]}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, isActive && { color: Colors.red, fontWeight: '700' }]}>{tab.label}</Text>
            {isActive && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ─── SPINNER ─────────────────────────────────────────────────────────────────
export const Spinner: React.FC = () => <ActivityIndicator size="large" color={Colors.red} />;

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#fff' },

  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray900, flex: 1, marginLeft: 12 },
  headerBack: { padding: 4 },
  backText: { fontSize: 24, color: Colors.gray900 },

  offlineDot: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotLabel: { fontSize: 11, fontWeight: '600' },

  emergencyBtn: {
    borderRadius: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  emergencyBtnIcon: { marginBottom: 6 },
  emergencyBtnTitle: { fontWeight: '700', color: '#fff', textAlign: 'center', lineHeight: 20 },

  emergencyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  emergencyCardHeader: { flexDirection: 'row', marginBottom: 10 },
  emergencyCardName: { fontSize: 16, fontWeight: '700', color: Colors.gray900, marginBottom: 2 },
  emergencyCardDistance: { fontSize: 13, color: Colors.gray500, marginBottom: 2 },
  emergencyCardPhone: { fontSize: 13, color: Colors.blue },
  offlineBadge: { backgroundColor: Colors.amber + '22', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start' },
  offlineBadgeText: { fontSize: 10, color: Colors.amberDark, fontWeight: '600' },
  emergencyCardActions: { flexDirection: 'row', gap: 8 },
  cardBtn: { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center' },
  cardBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  goldenTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  goldenTimerLabel: { color: '#fff', fontSize: 14, fontWeight: '600' },
  goldenTimerTime: { color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: 2 },

  locationBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.gray50,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
    gap: 8,
  },
  locationBarIcon: { fontSize: 18, marginTop: 1 },
  locationBarText: { fontSize: 14, color: Colors.gray800, fontWeight: '500' },
  kmMarkerLink: { fontSize: 12, color: Colors.blue, marginTop: 2, textDecorationLine: 'underline' },

  alertFamilyBtn: {
    backgroundColor: Colors.blue,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginVertical: 8,
  },
  alertFamilyText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  firstAidContainer: {
    backgroundColor: Colors.gray50,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.gray200,
    marginVertical: 8,
    overflow: 'hidden',
  },
  firstAidHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  firstAidTitle: { fontSize: 15, fontWeight: '700', color: Colors.gray900 },
  firstAidChevron: { fontSize: 12, color: Colors.gray500 },
  firstAidStep: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 14, paddingBottom: 12, gap: 10 },
  firstAidNum: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.red, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  firstAidNumText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  firstAidStepText: { flex: 1, fontSize: 14, color: Colors.gray700, lineHeight: 22 },

  permRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray50,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  permIcon: { fontSize: 28 },
  permTitle: { fontSize: 15, fontWeight: '600', color: Colors.gray900, marginBottom: 2 },
  permDesc: { fontSize: 12, color: Colors.gray500, lineHeight: 18 },
  permBadge: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  permBadgeText: { fontSize: 11, fontWeight: '700' },

  contactCard: {
    backgroundColor: Colors.gray50,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  contactCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  contactCardTitle: { fontSize: 13, fontWeight: '600', color: Colors.gray600 },
  contactInput: {
    borderWidth: 1, borderColor: Colors.gray300, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8, fontSize: 15, color: Colors.gray900,
    backgroundColor: '#fff', marginBottom: 6,
  },

  resultTab: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: Colors.gray100,
    borderWidth: 1, borderColor: Colors.gray200,
  },
  resultTabActive: { backgroundColor: Colors.blue, borderColor: Colors.blue },
  resultTabText: { fontSize: 13, fontWeight: '600', color: Colors.gray700 },
  resultTabTextActive: { color: '#fff' },

  pumpBanner: {
    backgroundColor: Colors.green, paddingVertical: 10, paddingHorizontal: 16,
    borderRadius: 8, marginBottom: 10,
  },
  pumpBannerText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  safeArrivalBanner: {
    backgroundColor: Colors.amber,
    paddingVertical: 10, paddingHorizontal: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  safeArrivalText: { color: Colors.gray900, fontWeight: '600', fontSize: 13 },
  safeArrivalCTA: { color: Colors.gray800, fontSize: 12, fontWeight: '700' },

  roleCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.gray50, borderRadius: 12, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.gray200,
  },
  roleCardMine: { backgroundColor: '#dcfce7', borderColor: Colors.green },
  roleCardTaken: { opacity: 0.6 },
  roleCardIcon: { fontSize: 28 },
  roleCardTitle: { fontSize: 15, fontWeight: '700', color: Colors.gray900, marginBottom: 2 },
  roleCardDesc: { fontSize: 12, color: Colors.gray500, lineHeight: 18 },
  myBadge: { backgroundColor: Colors.green, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  myBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },

  guidanceStep: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 10, marginBottom: 8,
    backgroundColor: Colors.gray50, borderWidth: 1, borderColor: Colors.gray200,
  },
  guidanceStepActive: { backgroundColor: '#eff6ff', borderColor: Colors.blue },
  guidanceStepDone: { backgroundColor: '#f0fdf4', borderColor: Colors.green },
  guidanceNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.blue, alignItems: 'center', justifyContent: 'center',
  },
  guidanceNumText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  guidanceText: { flex: 1, fontSize: 15, color: Colors.gray800, lineHeight: 22 },
  markDoneBtn: { backgroundColor: Colors.green, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  markDoneText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 32,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.gray300, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.gray900, marginBottom: 4 },
  modalSubtitle: { fontSize: 13, color: Colors.gray500, marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: Colors.gray700, marginBottom: 6 },
  modalInput: {
    borderWidth: 1, borderColor: Colors.gray300, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: Colors.gray900,
    backgroundColor: Colors.gray50, marginBottom: 16,
  },
  modalBtn: {
    backgroundColor: Colors.blue, borderRadius: 10,
    paddingVertical: 14, alignItems: 'center', marginTop: 4,
  },
  modalBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  modalCancelBtn: { paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  modalCancelText: { color: Colors.gray500, fontSize: 14 },

  card: {
    backgroundColor: '#fff', borderRadius: 12, borderWidth: 1,
    borderColor: Colors.gray200, padding: 16, marginBottom: 12,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2,
  },
  formField: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: Colors.gray900, marginBottom: 6 },

  button: {
    paddingVertical: 14, paddingHorizontal: 16,
    borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginVertical: 4,
    minHeight: 48,
  },
  buttonText: { fontWeight: '700', fontSize: 16 },

  bottomTabs: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: Colors.gray200,
  },
  tabButton: { flex: 1, alignItems: 'center', paddingVertical: 8, position: 'relative' },
  tabIcon: { fontSize: 22, marginBottom: 3, opacity: 0.7 },
  tabLabel: { fontSize: 10, fontWeight: '600', color: Colors.gray500 },
  tabIndicator: {
    position: 'absolute', top: 0, left: '15%', right: '15%',
    height: 2, backgroundColor: Colors.red, borderRadius: 1,
  },

  // KM Marker autocomplete
  suggestBox: {
    backgroundColor: '#fff', borderRadius: 8, borderWidth: 1,
    borderColor: Colors.gray200, marginBottom: 12, overflow: 'hidden',
  },
  suggestItem: {
    paddingHorizontal: 14, paddingVertical: 11,
    borderBottomWidth: 1, borderBottomColor: Colors.gray100,
  },
  suggestText: { fontSize: 14, color: Colors.blue, fontWeight: '600' },

  resolvedCard: {
    backgroundColor: '#f0fdf4', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: Colors.green, marginBottom: 12,
  },
  resolvedTitle: { fontSize: 14, fontWeight: '700', color: Colors.greenDark, marginBottom: 4 },
  resolvedSub: { fontSize: 13, color: Colors.green, marginTop: 2 },
});
