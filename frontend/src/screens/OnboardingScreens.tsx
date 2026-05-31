import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
} from 'react-native';
import { useIncidentStore, EmergencyContact } from '../store';
import {
  SafeAreaContainer,
  Header,
  Button,
  FormField,
  PermissionRow,
  ContactCard,
  Colors,
} from '../components/Layout';

const { width } = Dimensions.get('window');



// ─── SPLASH SCREEN ───────────────────────────────────────────────────────────
export const SplashScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const loadFromStorage = useIncidentStore((s) => s.loadFromStorage);
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    // Animate in
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();

    // Load storage + navigate after 1.5s
    const init = async () => {
      await loadFromStorage();
    };
    init();

    const timer = setTimeout(() => {
      const { onboardingComplete } = useIncidentStore.getState();
      if (!onboardingComplete) {
        navigation.replace('LandingIntro');
      }
      // If onboardingComplete=true, App.tsx will automatically render HomeStack
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={ss.splashBg}>
      <Animated.View style={[ss.splashContent, { opacity: fade, transform: [{ scale }] }]}>
        <Text style={ss.splashIcon}>🚨</Text>
        <Text style={ss.splashTitle}>ROADSoS</Text>
        <Text style={ss.splashTagline}>Help finds you.</Text>
      </Animated.View>
      <View style={ss.splashFooter}>
        <Text style={ss.splashFooterText}>Emergency Response Network</Text>
      </View>
    </View>
  );
};

// ─── LANDING INTRO SCREEN ───────────────────────────────────────────────────
export const LandingIntroScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Fade in and scale up the content on load
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 850,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Constant smooth pulse animation for the logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <SafeAreaContainer style={{ backgroundColor: '#ffffff' }}>
      <Animated.View style={[ss.landingContainer, { opacity: fadeAnim }]}>
        <View style={ss.landingHero}>
          <Animated.View style={{ transform: [{ scale: Animated.multiply(logoScale, pulseAnim) }] }}>
            <Text style={ss.landingLogoIcon}>🚨</Text>
          </Animated.View>
          <Text style={ss.landingLogoText}>ROADSoS</Text>
          <Text style={ss.landingSub}>Your offline emergency response lifeline.</Text>
        </View>

        {/* Feature Pills */}
        <View style={ss.featureBox}>
          <View style={ss.featureItem}>
            <Text style={ss.featureIcon}>🌍</Text>
            <View style={ss.featureTexts}>
              <Text style={ss.featureTitle}>Global Emergency Numbers</Text>
              <Text style={ss.featureDesc}>Auto-detects country coordinates to display local help numbers.</Text>
            </View>
          </View>

          <View style={ss.featureItem}>
            <Text style={ss.featureIcon}>📡</Text>
            <View style={ss.featureTexts}>
              <Text style={ss.featureTitle}>Offline Capable Database</Text>
              <Text style={ss.featureDesc}>Resolves major Indian highway KM markers without internet access.</Text>
            </View>
          </View>

          <View style={ss.featureItem}>
            <Text style={ss.featureIcon}>👥</Text>
            <View style={ss.featureTexts}>
              <Text style={ss.featureTitle}>Bystander Rescue Hub</Text>
              <Text style={ss.featureDesc}>Guides nearby helpers with assigned roles to assist you.</Text>
            </View>
          </View>
        </View>

        <View style={ss.landingFooter}>
          <Button
            title="Get Started →"
            onPress={() => navigation.navigate('OnboardingFlow')}
            style={{ width: '100%', backgroundColor: '#16a34a' }}
          />
          <TouchableOpacity
            style={ss.landingSkipLink}
            onPress={() => {
            useIncidentStore.getState().setOnboarding(true);
            // App.tsx will swap to HomeStack automatically
          }}
          >
            <Text style={ss.landingSkipLinkText}>Already configured? Skip to Home</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaContainer>
  );
};

// ─── ONBOARDING SCREEN ───────────────────────────────────────────────────────
const SLIDES = [
  {
    icon: '🚑',
    title: 'Any emergency.\nAny device.',
    desc: 'From accidents to breakdowns — ROADSoS connects you to help in seconds, no matter where you are.',
    bg: '#fff',
  },
  {
    icon: '👥',
    title: "You're never\nalone.",
    desc: 'Nearby bystanders are guided to help you. Community-powered response gets to you before ambulances do.',
    bg: '#fff',
  },
  {
    icon: '📡',
    title: 'Works without\ninternet.',
    desc: 'Our offline database covers major highways. Find help even when the network is down.',
    bg: '#fff',
  },
];

export const OnboardingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const setOnboarding = useIncidentStore((s) => s.setOnboarding);

  const goTo = (idx: number) => {
    flatRef.current?.scrollToIndex({ index: idx, animated: true });
    setCurrentSlide(idx);
  };

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      goTo(currentSlide + 1);
    } else {
      setOnboarding(true);
      navigation.replace('Permissions');
    }
  };

  return (
    <SafeAreaContainer>
      {/* Skip button */}
      <TouchableOpacity
        style={ss.skipBtn}
        onPress={() => { setOnboarding(true); navigation.replace('Permissions'); }}
      >
        <Text style={ss.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentSlide(idx);
        }}
        renderItem={({ item }) => (
          <View style={[ss.slide, { width }]}>
            <Text style={ss.slideIcon}>{item.icon}</Text>
            <Text style={ss.slideTitle}>{item.title}</Text>
            <Text style={ss.slideDesc}>{item.desc}</Text>
          </View>
        )}
        style={{ flex: 1 }}
      />

      {/* Dot pagination */}
      <View style={ss.dots}>
        {SLIDES.map((_, i) => (
          <TouchableOpacity key={i} onPress={() => goTo(i)}>
            <View style={[ss.dot, i === currentSlide && ss.dotActive]} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={ss.onboardingBtns}>
        <Button
          title={currentSlide === SLIDES.length - 1 ? 'Get Started →' : 'Next →'}
          onPress={handleNext}
        />
      </View>
    </SafeAreaContainer>
  );
};

// ─── PERMISSIONS SCREEN ──────────────────────────────────────────────────────
type PermStatus = 'granted' | 'denied' | 'pending';

export const PermissionsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const setPermissions = useIncidentStore((s) => s.setPermissions);
  const [locationStatus, setLocationStatus] = useState<PermStatus>('pending');
  const [contactsStatus, setContactsStatus] = useState<PermStatus>('pending');
  const [smsStatus, setSmsStatus] = useState<PermStatus>('pending');

  const requestLocation = async () => {
    try {
      const Location = require('expo-location');
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationStatus(status === 'granted' ? 'granted' : 'denied');
    } catch {
      setLocationStatus('denied');
    }
  };

  const requestContacts = async () => {
    // expo-contacts not installed in web mode — graceful fallback
    setContactsStatus('granted');
  };

  const requestSMS = async () => {
    setSmsStatus('granted');
  };

  const handleAllowAll = async () => {
    await requestLocation();
    await requestContacts();
    await requestSMS();
  };

  const handleContinue = () => {
    setPermissions(locationStatus === 'granted');
    navigation.replace('Setup');
  };

  const allGranted = locationStatus === 'granted' && contactsStatus === 'granted' && smsStatus === 'granted';

  return (
    <SafeAreaContainer>
      <Header title="Permissions" />
      <ScrollView contentContainerStyle={ss.scrollContent}>
        <Text style={ss.permHeading}>We need a few permissions</Text>
        <Text style={ss.permSubHeading}>These help us get you help faster in an emergency.</Text>

        <PermissionRow
          icon="📍"
          title="Location"
          description="To find emergency services near you and share your position"
          status={locationStatus}
          onPress={requestLocation}
        />
        <PermissionRow
          icon="👥"
          title="Contacts"
          description="To let you import emergency contacts quickly"
          status={contactsStatus}
          onPress={requestContacts}
        />
        <PermissionRow
          icon="💬"
          title="SMS"
          description="To alert your family automatically in an emergency"
          status={smsStatus}
          onPress={requestSMS}
        />

        <View style={{ marginTop: 24 }}>
          {!allGranted && (
            <Button title="Allow All Permissions" onPress={handleAllowAll} />
          )}
          <Button
            title={allGranted ? 'Continue →' : 'Skip for now'}
            onPress={handleContinue}
            variant={allGranted ? 'primary' : 'outline'}
            style={{ marginTop: 8 }}
          />
        </View>
      </ScrollView>
    </SafeAreaContainer>
  );
};

// ─── SETUP SCREEN ─────────────────────────────────────────────────────────────
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'];

export const SetupScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const store = useIncidentStore();
  const [name, setName] = useState(store.userName || '');
  const [phone, setPhone] = useState(store.userPhone || '');
  const [contacts, setContacts] = useState<EmergencyContact[]>(store.emergencyContacts.length ? store.emergencyContacts : [{ name: '', phone: '' }]);
  const [bloodGroup, setBloodGroup] = useState(store.medicalDetails.bloodGroup || '');
  const [allergies, setAllergies] = useState(store.medicalDetails.allergies || '');
  const [medications, setMedications] = useState(store.medicalDetails.medications || '');
  const [language, setLanguage] = useState<'en' | 'hi' | 'gu'>(store.language || 'en');
  const [saved, setSaved] = useState(false);

  const addContact = () => {
    if (contacts.length < 3) setContacts([...contacts, { name: '', phone: '' }]);
  };

  const updateContact = (i: number, field: 'name' | 'phone', val: string) => {
    const updated = [...contacts];
    updated[i] = { ...updated[i], [field]: val };
    setContacts(updated);
  };

  const removeContact = (i: number) => setContacts(contacts.filter((_, idx) => idx !== i));

  const handleSave = () => {
    store.setUserInfo(name, phone);
    store.setEmergencyContacts(contacts.filter((c) => c.name && c.phone));
    store.setMedicalDetails({ bloodGroup, allergies, medications });
    store.setLanguage(language);
    setSaved(true);
    setTimeout(() => {
      if (store.onboardingComplete) {
        // Already in HomeStack — just go back to profile
        navigation.goBack();
      } else {
        // In OnboardingStack — mark complete, App.tsx swaps stacks
        useIncidentStore.getState().setOnboarding(true);
      }
    }, 800);
  };

  return (
    <SafeAreaContainer>
      <Header
        title="Setup Profile"
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={[ss.scrollContent, { paddingBottom: 48 }]}>
        {/* Basic Info */}
        <Text style={ss.sectionTitle}>👤 Your Info</Text>
        <FormField label="Full Name" required>
          <TextInput style={ss.textInput} placeholder="Enter your name" value={name} onChangeText={setName} placeholderTextColor={Colors.gray400} />
        </FormField>
        <FormField label="Phone Number" required>
          <TextInput style={ss.textInput} placeholder="Enter your phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor={Colors.gray400} />
        </FormField>

        {/* Emergency Contacts */}
        <Text style={ss.sectionTitle}>🆘 Emergency Contacts</Text>
        <Text style={ss.sectionSubtitle}>Up to 3 contacts. They'll be alerted in an emergency.</Text>
        {contacts.map((c, i) => (
          <ContactCard
            key={i}
            index={i}
            name={c.name}
            phone={c.phone}
            onChangeName={(v) => updateContact(i, 'name', v)}
            onChangePhone={(v) => updateContact(i, 'phone', v)}
            onRemove={() => removeContact(i)}
          />
        ))}
        {contacts.length < 3 && (
          <TouchableOpacity style={ss.addContactBtn} onPress={addContact}>
            <Text style={ss.addContactText}>+ Add Contact</Text>
          </TouchableOpacity>
        )}

        {/* Medical Info */}
        <Text style={ss.sectionTitle}>🩸 Medical Info</Text>
        <Text style={ss.sectionSubtitle}>Shown to responders in an emergency. Stored offline.</Text>

        <Text style={[ss.label, { marginBottom: 8 }]}>Blood Group</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 8, paddingRight: 8 }}>
            {BLOOD_GROUPS.map((bg) => (
              <TouchableOpacity
                key={bg}
                style={[ss.bloodBtn, bloodGroup === bg && ss.bloodBtnActive]}
                onPress={() => setBloodGroup(bg)}
              >
                <Text style={[ss.bloodBtnText, bloodGroup === bg && { color: '#fff' }]}>{bg}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <FormField label="Allergies">
          <TextInput style={ss.textInput} placeholder="e.g. Penicillin, Aspirin" value={allergies} onChangeText={setAllergies} placeholderTextColor={Colors.gray400} />
        </FormField>
        <FormField label="Current Medications">
          <TextInput style={ss.textInput} placeholder="e.g. Metformin 500mg" value={medications} onChangeText={setMedications} placeholderTextColor={Colors.gray400} />
        </FormField>

        {/* Language Selector */}
        <Text style={ss.sectionTitle}>🌐 Language</Text>
        <View style={ss.langRow}>
          {([['en', 'English'], ['hi', 'हिंदी'], ['gu', 'ગુજરાતી']] as const).map(([code, label]) => (
            <TouchableOpacity
              key={code}
              style={[ss.langBtn, language === code && ss.langBtnActive]}
              onPress={() => setLanguage(code)}
            >
              <Text style={[ss.langBtnText, language === code && { color: '#fff' }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ marginTop: 24 }}>
          <Button
            title={saved ? '✅ Saved!' : 'Save & Continue →'}
            onPress={handleSave}
            disabled={!name || !phone}
          />
          <Button
            title="Skip"
            onPress={() => {
            useIncidentStore.getState().setOnboarding(true);
          }}
            variant="ghost"
            style={{ marginTop: 4 }}
          />
        </View>
      </ScrollView>
    </SafeAreaContainer>
  );
};

// ─── STYLES ───────────────────────────────────────────────────────────────────
const ss = StyleSheet.create({
  splashBg: {
    flex: 1,
    backgroundColor: '#16a34a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashContent: { alignItems: 'center' },
  splashIcon: { fontSize: 80, marginBottom: 16 },
  splashTitle: { fontSize: 42, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  splashTagline: { fontSize: 20, color: 'rgba(255,255,255,0.85)', marginTop: 8, fontStyle: 'italic' },
  splashFooter: { position: 'absolute', bottom: 40 },
  splashFooterText: { color: 'rgba(255,255,255,0.6)', fontSize: 13 },

  skipBtn: { position: 'absolute', top: 56, right: 20, zIndex: 10, padding: 8 },
  skipText: { color: Colors.gray500, fontSize: 15, fontWeight: '600' },

  slide: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  slideIcon: { fontSize: 90, marginBottom: 24 },
  slideTitle: { fontSize: 32, fontWeight: '800', color: Colors.gray900, textAlign: 'center', marginBottom: 16, lineHeight: 40 },
  slideDesc: { fontSize: 16, color: Colors.gray600, textAlign: 'center', lineHeight: 26 },

  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.gray300 },
  dotActive: { width: 28, backgroundColor: Colors.red, borderRadius: 4 },

  onboardingBtns: { paddingHorizontal: 24, paddingBottom: 32 },

  scrollContent: { paddingHorizontal: 16, paddingTop: 20 },

  permHeading: { fontSize: 24, fontWeight: '800', color: Colors.gray900, marginBottom: 6 },
  permSubHeading: { fontSize: 14, color: Colors.gray500, marginBottom: 24, lineHeight: 20 },

  sectionTitle: { fontSize: 17, fontWeight: '800', color: Colors.gray900, marginTop: 24, marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: Colors.gray500, marginBottom: 14, lineHeight: 20 },

  textInput: {
    borderWidth: 1, borderColor: Colors.gray300, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 16,
    color: Colors.gray900, backgroundColor: '#fff',
  },
  label: { fontSize: 14, fontWeight: '600', color: Colors.gray700 },

  addContactBtn: {
    borderWidth: 1.5, borderColor: Colors.blue, borderRadius: 10,
    paddingVertical: 12, alignItems: 'center', marginBottom: 8, borderStyle: 'dashed',
  },
  addContactText: { color: Colors.blue, fontWeight: '700', fontSize: 14 },

  bloodBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: Colors.gray100, borderWidth: 1, borderColor: Colors.gray200,
  },
  bloodBtnActive: { backgroundColor: Colors.red, borderColor: Colors.red },
  bloodBtnText: { fontWeight: '600', fontSize: 14, color: Colors.gray700 },

  langRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  langBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center',
    backgroundColor: Colors.gray100, borderWidth: 1.5, borderColor: Colors.gray200,
  },
  langBtnActive: { backgroundColor: Colors.green, borderColor: Colors.green },
  langBtnText: { fontWeight: '700', fontSize: 14, color: Colors.gray700 },

  // Landing Intro Screen Styles
  landingContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 36,
  },
  landingHero: {
    alignItems: 'center',
    marginTop: 20,
  },
  landingLogoIcon: {
    fontSize: 76,
    marginBottom: 12,
  },
  landingLogoText: {
    fontSize: 38,
    fontWeight: '900',
    color: Colors.gray900,
    letterSpacing: -1,
  },
  landingSub: {
    fontSize: 14,
    color: Colors.gray50,
    marginTop: 6,
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: Colors.red,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  featureBox: {
    backgroundColor: Colors.gray50,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.gray200,
    marginVertical: 24,
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  featureIcon: {
    fontSize: 26,
    marginTop: 2,
  },
  featureTexts: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gray900,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    color: Colors.gray500,
    lineHeight: 18,
  },
  landingFooter: {
    width: '100%',
    alignItems: 'center',
  },
  landingSkipLink: {
    marginTop: 14,
    padding: 10,
  },
  landingSkipLinkText: {
    color: Colors.gray400,
    fontSize: 13,
    fontWeight: '600',
  },
});
