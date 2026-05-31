import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Linking,
  BackHandler,
  Alert,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { useIncidentStore } from '../store';
import {
  SafeAreaContainer,
  Header,
  Button,
  GoldenHourTimer,
  LocationBar,
  AlertFamilyButton,
  FirstAidSteps,
  PumpAlertBanner,
  KmMarkerModal,
  ResultTab,
  Colors,
} from '../components/Layout';
import {
  detectCountry,
  CountryEmergency,
} from '../services/emergencyDB';
import {
  MockService,
  getMedicalServices,
  MOCK_POLICE,
  MOCK_FUEL,
  MOCK_FIRE_STATIONS,
  MOCK_TOWING,
  MOCK_TYRES,
  MOCK_SHOWROOMS,
  MOCK_AMBULANCE,
  MOCK_SHELTERS,
} from '../services/mockData';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const callNumber = (num: string) =>
  Linking.openURL(`tel:${num.replace(/[\s\-()]/g, '')}`);
const openMaps = (name: string, address: string) =>
  Linking.openURL(`https://www.google.com/maps/search/${encodeURIComponent(name + ' ' + address)}`);

// ─── COUNTRY BADGE ────────────────────────────────────────────────────────────
const CountryBadge: React.FC<{ country: CountryEmergency }> = ({ country }) => (
  <View style={es.countryBadge}>
    <Text style={es.countryFlag}>{country.flag}</Text>
    <View>
      <Text style={es.countryName}>{country.name}</Text>
      <Text style={es.countryNums}>
        🚑 {country.ambulance}  🚔 {country.police}  🚒 {country.fire}
      </Text>
    </View>
  </View>
);

// ─── DATA SOURCE BADGE ────────────────────────────────────────────────────────
const DataSourceBadge: React.FC<{ count: number; isLive?: boolean }> = ({ count, isLive = true }) => (
  <View style={[es.sourceBadge, { backgroundColor: isLive ? Colors.green + '18' : Colors.amber + '18' }]}>
    <View style={[es.sourceDot, { backgroundColor: isLive ? Colors.green : Colors.amber }]} />
    <Text style={[es.sourceText, { color: isLive ? Colors.greenDark : Colors.amberDark }]}>
      {count} contacts fetched · {isLive ? 'Live data' : 'Offline DB'}
    </Text>
  </View>
);

// ─── SERVICE CARD (Enhanced EmergencyCard) ────────────────────────────────────
const ServiceCard: React.FC<{
  service: MockService;
  accentColor: string;
  showOpenTag?: boolean;
}> = ({ service, accentColor, showOpenTag = true }) => (
  <View style={es.serviceCard}>
    <View style={es.serviceCardTop}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <Text style={es.serviceName}>{service.name}</Text>
          {showOpenTag && service.openNow !== undefined && (
            <View style={[es.openTag, { backgroundColor: service.openNow ? '#dcfce7' : '#f3f4f6' }]}>
              <Text style={[es.openTagText, { color: service.openNow ? Colors.greenDark : Colors.gray500 }]}>
                {service.openNow ? 'Open' : 'Closed'}
              </Text>
            </View>
          )}
        </View>
        <Text style={es.serviceAddress}>{service.address}</Text>
        <View style={es.serviceMetaRow}>
          <Text style={es.serviceDist}>📍 {service.distance}</Text>
          {service.eta && <Text style={es.serviceEta}>⏱ ~{service.eta}</Text>}
          {service.isOffline && <Text style={es.offlineTag}>Offline data</Text>}
        </View>
        {service.phone ? <Text style={es.servicePhone}>📞 {service.phone}</Text> : null}
      </View>
    </View>
    <View style={es.serviceCardActions}>
      {service.phone ? (
        <TouchableOpacity
          style={[es.actionBtn, { backgroundColor: Colors.green }]}
          onPress={() => callNumber(service.phone)}
        >
          <Text style={es.actionBtnText}>📞 Call</Text>
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity
        style={[es.actionBtn, { backgroundColor: accentColor, flex: service.phone ? 1 : 2 }]}
        onPress={() => openMaps(service.name, service.address)}
      >
        <Text style={es.actionBtnText}>🗺 Navigate</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// ─── TRIAGE SCREEN ───────────────────────────────────────────────────────────
const TRIAGE_QUESTIONS = [
  { id: 'q_unconscious', text: 'Is anyone unconscious, unresponsive, or experiencing seizures?' },
  { id: 'q_bleeding', text: 'Is there heavy, pulsating, or uncontrolled bleeding?' },
  { id: 'q_breathing', text: 'Are they experiencing severe breathing difficulties or choking?' },
  { id: 'q_spine', text: 'Is there a suspected head, neck, or spine injury (unable to feel/move limbs)?' },
  { id: 'q_special', text: 'Is the patient a child under 12 or a pregnant woman?' },
  { id: 'q_trapped', text: 'Is the victim trapped inside the vehicle or under debris?' },
];

export interface RoutedHospital {
  name: string;
  category: string;
  distance: string;
  eta: string;
  phone: string;
  address: string;
  reason: string;
  severity: 'critical' | 'moderate' | 'minor';
  decisionPath: string[];
  matchedRule: string;
  actionSteps: string[];
}

export function determineHospitalAndReason(answers: Record<string, boolean> | null): RoutedHospital {
  const fallback: RoutedHospital = {
    name: 'General Hospital Emergency',
    category: 'Hospital Emergency Room',
    distance: '0.9 km',
    eta: '2 min',
    phone: '080-44112233',
    address: '15, Hospital Road',
    reason: 'Standard Emergency Room routing due to missing triage check details.',
    severity: 'minor',
    matchedRule: 'else (fallback)',
    decisionPath: [
      '// No triage details available',
      'else {',
      '  recommend("General Hospital Emergency");',
      '}'
    ],
    actionSteps: ['Please stay calm and contact the emergency line.']
  };

  if (!answers) return fallback;

  if (answers['q_unconscious'] || answers['q_spine']) {
    return {
      name: 'AIIMS Advanced Trauma Unit',
      category: 'Level-1 Advanced Trauma & Neuro Centre',
      distance: '2.4 km',
      eta: '6 min',
      phone: '011-26588500',
      address: 'NH-48, Bypass Road',
      reason: 'Unconsciousness or suspected neck/spine trauma requires immediate access to neurosurgeons, spinal stabilization, and rapid head CT imaging available only at a Level-1 Advanced Trauma Centre.',
      severity: 'critical',
      matchedRule: 'unconscious || spine_injury',
      decisionPath: [
        'if (unconscious || spine_injury) {',
        '  // Required: Neuro, CT Scan, Spine Board',
        '  recommend("AIIMS Advanced Trauma Unit");',
        '}'
      ],
      actionSteps: [
        "DO NOT move the victim to prevent permanent spinal cord damage.",
        "Keep the victim warm and talk to them to check level of consciousness.",
        "Clear airway gently without tilting the head or neck."
      ]
    };
  } else if (answers['q_trapped']) {
    return {
      name: 'City Trauma & Emergency Centre',
      category: 'Emergency & Extrication Trauma Hub',
      distance: '1.2 km',
      eta: '3 min',
      phone: '080-22224444',
      address: 'MG Road, Sector 12',
      reason: 'Being trapped inside a vehicle requires a facility with integrated fire/rescue coordination and quick access to orthopedic and general trauma surgery.',
      severity: 'critical',
      matchedRule: 'trapped_in_vehicle',
      decisionPath: [
        'else if (trapped_in_vehicle) {',
        '  // Required: Rescue/extrication + orthopedic surgery',
        '  recommend("City Trauma & Emergency Centre");',
        '}'
      ],
      actionSteps: [
        "Turn off the vehicle's ignition to prevent spark/fire hazard.",
        "Wait for professional extrication team unless there is immediate fire/submersion risk.",
        "Cover the victim with a jacket to protect from glass shards."
      ]
    };
  } else if (answers['q_bleeding'] || answers['q_breathing']) {
    return {
      name: 'General Hospital Emergency',
      category: 'Major Resuscitation & ER Care',
      distance: '0.9 km',
      eta: '2 min',
      phone: '080-44112233',
      address: '15, Hospital Road',
      reason: 'Severe bleeding or breathing difficulties require immediate airway management, chest tubes, and active blood transfusions available at a fully-equipped General Hospital Emergency Room.',
      severity: 'moderate',
      matchedRule: 'bleeding || breathing_difficulty',
      decisionPath: [
        'else if (heavy_bleeding || breathing_difficulty) {',
        '  // Required: Resuscitation, blood bank, airway control',
        '  recommend("General Hospital Emergency");',
        '}'
      ],
      actionSteps: [
        "Apply firm, continuous pressure to any bleeding wounds using clean cloth.",
        "Keep the patient sitting upright if they have difficulty breathing.",
        "Do not give any food or liquids to the patient."
      ]
    };
  } else if (answers['q_special']) {
    return {
      name: "St. John's Medical College",
      category: 'Specialized Pediatric & OBGYN ER Wing',
      distance: '3.4 km',
      eta: '9 min',
      phone: '080-22065010',
      address: 'Koramangala',
      reason: 'Pediatric and maternal patients have unique physiological responses to trauma. They need specialized neonatal, pediatric, or obstetric emergency care.',
      severity: 'moderate',
      matchedRule: 'pediatric || pregnant',
      decisionPath: [
        'else if (pediatric_or_pregnant) {',
        '  // Required: Neonatal/Ped ER specialist',
        '  recommend("St. John\'s Medical College");',
        '}'
      ],
      actionSteps: [
        "Inform dispatcher that the patient is a child or pregnant woman.",
        "Keep a pregnant patient lying on her LEFT side to optimize blood flow.",
        "Speak gently to comfort the child or mother."
      ]
    };
  } else {
    return {
      name: 'Sunrise Urgent Care Clinic',
      category: 'Community Urgent Care & First-Aid Clinic',
      distance: '0.4 km',
      eta: '1 min',
      phone: '080-11223344',
      address: 'Near Petrol Pump',
      reason: 'For minor injuries (conscious, breathing normally, no severe bleeding or head/spine risk), a local urgent care clinic is optimal to avoid overloading major trauma centers.',
      severity: 'minor',
      matchedRule: 'else (minor)',
      decisionPath: [
        'else {',
        '  // Required: Basic wound dressing & observation',
        '  recommend("Sunrise Urgent Care Clinic");',
        '}'
      ],
      actionSteps: [
        "Clean minor scrapes or cuts with clean water if available.",
        "Apply standard sterile bandages and dress the wounds.",
        "Move the patient safely to the sidewalk away from moving traffic."
      ]
    };
  }
}

export const TriageScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const setTriageLevel = useIncidentStore((s) => s.setTriageLevel);
  const setTriageAnswers = useIncidentStore((s) => s.setTriageAnswers);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const animateTransition = (cb: () => void) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }).start(() => {
      cb();
      slideAnim.setValue(40);
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleAnswer = (yes: boolean) => {
    const questionId = TRIAGE_QUESTIONS[currentQ].id;
    const newAnswers = { ...answers, [questionId]: yes };

    if (currentQ < TRIAGE_QUESTIONS.length - 1) {
      animateTransition(() => {
        setCurrentQ(currentQ + 1);
        setAnswers(newAnswers);
      });
    } else {
      let level: 'critical' | 'moderate' | 'minor' = 'minor';
      if (newAnswers['q_unconscious'] || newAnswers['q_spine'] || newAnswers['q_trapped']) {
        level = 'critical';
      } else if (newAnswers['q_bleeding'] || newAnswers['q_breathing'] || newAnswers['q_special']) {
        level = 'moderate';
      } else {
        level = 'minor';
      }

      setTriageLevel(level);
      setTriageAnswers(newAnswers);
      navigation.navigate('MedicalDetails');
    }
  };

  const q = TRIAGE_QUESTIONS[currentQ];

  return (
    <SafeAreaContainer>
      <View style={es.triageHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={{ color: '#fff', fontSize: 24 }}>←</Text>
        </TouchableOpacity>
        <Text style={es.triageHeaderText}>Quick Check</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress bar */}
      <View style={es.progressTrack}>
        {TRIAGE_QUESTIONS.map((_, i) => (
          <View
            key={i}
            style={[
              es.progressSegment,
              i < currentQ && { backgroundColor: Colors.green },
              i === currentQ && { backgroundColor: Colors.red },
            ]}
          />
        ))}
      </View>

      <View style={es.triageContent}>
        <Text style={es.triageStep}>Question {currentQ + 1} of {TRIAGE_QUESTIONS.length}</Text>

        <Animated.View style={{ transform: [{ translateY: slideAnim }], opacity: fadeAnim }}>
          <Text style={es.triageQuestion}>{q.text}</Text>
        </Animated.View>

        <View style={es.triageButtons}>
          <TouchableOpacity style={es.yesBtn} onPress={() => handleAnswer(true)} activeOpacity={0.85}>
            <Text style={es.yesBtnText}>YES</Text>
          </TouchableOpacity>
          <TouchableOpacity style={es.noBtn} onPress={() => handleAnswer(false)} activeOpacity={0.85}>
            <Text style={es.noBtnText}>NO</Text>
          </TouchableOpacity>
        </View>

        <Text style={es.triageHint}>Tap your answer — no typing needed</Text>
      </View>
    </SafeAreaContainer>
  );
};

// ─── MEDICAL EMERGENCY SCREEN ─────────────────────────────────────────────────
export const MedicalEmergencyScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { triageAnswers, setLocation, locationOverride } = useIncidentStore();
  const [placeName, setPlaceName] = useState('Detecting location…');
  const [kmModalVisible, setKmModalVisible] = useState(false);
  const [familyAlerted, setFamilyAlerted] = useState(false);
  const [pumpAlerted, setPumpAlerted] = useState(false);
  const [timerStart] = useState(Date.now());
  const [country, setCountry] = useState<CountryEmergency | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [showCode, setShowCode] = useState(false);

  const routed = determineHospitalAndReason(triageAnswers);
  const severity = routed.severity;
  const accentColor = { critical: Colors.red, moderate: Colors.orange, minor: Colors.blue }[severity];

  const recommendedService: MockService = {
    id: 'routed_rec',
    name: routed.name,
    distance: routed.distance,
    distanceSortKey: parseFloat(routed.distance),
    phone: routed.phone,
    address: routed.address,
    openNow: true,
    eta: routed.eta,
    type: routed.category,
  };

  const rawServices = getMedicalServices(severity);
  const services = [
    recommendedService,
    ...rawServices.filter(s => s.name.toLowerCase() !== routed.name.toLowerCase())
  ];

  useEffect(() => {
    (async () => {
      if (locationOverride) {
        setLocation(locationOverride.lat, locationOverride.lng);
        setPlaceName(locationOverride.label);
        setCountry(detectCountry(locationOverride.lat, locationOverride.lng));
        setLoadingLocation(false);
        return;
      }
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setLocation(loc.coords.latitude, loc.coords.longitude);
          setPlaceName(`${loc.coords.latitude.toFixed(4)}°N, ${loc.coords.longitude.toFixed(4)}°E`);
          const detected = detectCountry(loc.coords.latitude, loc.coords.longitude);
          setCountry(detected);
        } else {
          setPlaceName('Location unavailable — enter km marker');
          setCountry(detectCountry(20.5937, 78.9629)); // India fallback
        }
      } catch {
        setPlaceName('Tap to enter km marker');
        setCountry(detectCountry(20.5937, 78.9629));
      } finally {
        setLoadingLocation(false);
      }
    })();

    if (severity === 'critical') {
      setTimeout(() => {
        Alert.alert(
          '🚑 Ambulance Being Called',
          `Dialling ${country?.ambulance ?? '108'} — please confirm.`,
          [
            { text: `Call ${country?.ambulance ?? '108'}`, style: 'destructive', onPress: () => callNumber(country?.ambulance ?? '108') },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
      }, 800);
    }
  }, []);

  const firstAidSteps = routed.actionSteps;

  return (
    <SafeAreaContainer>
      <GoldenHourTimer startTime={timerStart} />
      <Header title={`🏥 Medical — ${routed.name}`} onBack={() => navigation.goBack()} color={accentColor} />

      {pumpAlerted && <PumpAlertBanner pumpName={MOCK_FUEL[0].name} />}

      <ScrollView contentContainerStyle={es.content} showsVerticalScrollIndicator={false}>
        {/* Country badge */}
        {country && <CountryBadge country={country} />}

        <DataSourceBadge count={services.length + MOCK_POLICE.length + 1} />

        <LocationBar
          placeName={loadingLocation ? 'Detecting GPS location…' : placeName}
          onKmMarkerPress={() => setKmModalVisible(true)}
        />

        {severity === 'critical' && (
          <TouchableOpacity style={[es.autoDial, { backgroundColor: accentColor }]} onPress={() => callNumber(country?.ambulance ?? '108')}>
            <Text style={es.autoDialText}>🚑 Tap to call Ambulance — {country?.ambulance ?? '108'}</Text>
          </TouchableOpacity>
        )}

        {/* Dynamic Diagnostics Card */}
        <View style={es.diagnosticsCard}>
          <View style={es.diagHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 16 }}>🤖</Text>
              <Text style={es.diagTitle}>Router Diagnostics</Text>
            </View>
            <TouchableOpacity onPress={() => setShowCode(!showCode)} style={es.codeToggle}>
              <Text style={es.codeToggleText}>{showCode ? '💬 Explain Decision' : '💻 View Code Tree'}</Text>
            </TouchableOpacity>
          </View>
          
          {showCode ? (
            <View style={es.codeBox}>
              <Text style={es.codeLine}>
                <Text style={es.codeKeyword}>const</Text> triageAnswers = {JSON.stringify(triageAnswers || {}, null, 2)};
              </Text>
              <Text style={es.codeLine} />
              
              <View style={routed.matchedRule === 'unconscious || spine_injury' ? es.codeLineActiveBox : null}>
                <Text style={[es.codeLine, routed.matchedRule === 'unconscious || spine_injury' && es.codeLineActive]}>
                  <Text style={es.codeKeyword}>if</Text> (triageAnswers.q_unconscious || triageAnswers.q_spine) {'{'}
                </Text>
                <Text style={[es.codeLine, routed.matchedRule === 'unconscious || spine_injury' && es.codeLineActive]}>
                  {'  '}recommend(<Text style={es.codeString}>"AIIMS Advanced Trauma Unit"</Text>); <Text style={es.codeComment}>// Level-1 Trauma</Text>
                </Text>
                <Text style={[es.codeLine, routed.matchedRule === 'unconscious || spine_injury' && es.codeLineActive]}>
                  {'}'}
                </Text>
              </View>

              <View style={routed.matchedRule === 'trapped_in_vehicle' ? es.codeLineActiveBox : null}>
                <Text style={[es.codeLine, routed.matchedRule === 'trapped_in_vehicle' && es.codeLineActive]}>
                  <Text style={es.codeKeyword}>else if</Text> (triageAnswers.q_trapped) {'{'}
                </Text>
                <Text style={[es.codeLine, routed.matchedRule === 'trapped_in_vehicle' && es.codeLineActive]}>
                  {'  '}recommend(<Text style={es.codeString}>"City Trauma & Emergency Centre"</Text>); <Text style={es.codeComment}>// Extrication</Text>
                </Text>
                <Text style={[es.codeLine, routed.matchedRule === 'trapped_in_vehicle' && es.codeLineActive]}>
                  {'}'}
                </Text>
              </View>

              <View style={routed.matchedRule === 'bleeding || breathing_difficulty' ? es.codeLineActiveBox : null}>
                <Text style={[es.codeLine, routed.matchedRule === 'bleeding || breathing_difficulty' && es.codeLineActive]}>
                  <Text style={es.codeKeyword}>else if</Text> (triageAnswers.q_bleeding || triageAnswers.q_breathing) {'{'}
                </Text>
                <Text style={[es.codeLine, routed.matchedRule === 'bleeding || breathing_difficulty' && es.codeLineActive]}>
                  {'  '}recommend(<Text style={es.codeString}>"General Hospital Emergency"</Text>); <Text style={es.codeComment}>// Major ER</Text>
                </Text>
                <Text style={[es.codeLine, routed.matchedRule === 'bleeding || breathing_difficulty' && es.codeLineActive]}>
                  {'}'}
                </Text>
              </View>

              <View style={routed.matchedRule === 'pediatric || pregnant' ? es.codeLineActiveBox : null}>
                <Text style={[es.codeLine, routed.matchedRule === 'pediatric || pregnant' && es.codeLineActive]}>
                  <Text style={es.codeKeyword}>else if</Text> (triageAnswers.q_special) {'{'}
                </Text>
                <Text style={[es.codeLine, routed.matchedRule === 'pediatric || pregnant' && es.codeLineActive]}>
                  {'  '}recommend(<Text style={es.codeString}>"St. John's Medical College"</Text>); <Text style={es.codeComment}>// Ped/OBGYN ER</Text>
                </Text>
                <Text style={[es.codeLine, routed.matchedRule === 'pediatric || pregnant' && es.codeLineActive]}>
                  {'}'}
                </Text>
              </View>

              <View style={routed.matchedRule === 'else (minor)' ? es.codeLineActiveBox : null}>
                <Text style={[es.codeLine, routed.matchedRule === 'else (minor)' && es.codeLineActive]}>
                  <Text style={es.codeKeyword}>else</Text> {'{'}
                </Text>
                <Text style={[es.codeLine, routed.matchedRule === 'else (minor)' && es.codeLineActive]}>
                  {'  '}recommend(<Text style={es.codeString}>"Sunrise Urgent Care Clinic"</Text>); <Text style={es.codeComment}>// Minor Urgent Care</Text>
                </Text>
                <Text style={[es.codeLine, routed.matchedRule === 'else (minor)' && es.codeLineActive]}>
                  {'}'}
                </Text>
              </View>
            </View>
          ) : (
            <View style={es.rationaleBox}>
              <Text style={es.matchedRuleLabel}>
                Route Condition: <Text style={{ fontFamily: 'monospace', fontWeight: 'bold', color: Colors.teal }}>{routed.matchedRule.toUpperCase()}</Text>
              </Text>
              <Text style={es.rationaleText}>{routed.reason}</Text>
              
              <View style={es.answersSummary}>
                <Text style={es.answersTitle}>Triage Questionnaire Responses:</Text>
                {Object.entries(triageAnswers || {}).map(([key, value]) => {
                  const qText = TRIAGE_QUESTIONS.find(q => q.id === key)?.text ?? key;
                  return (
                    <View key={key} style={es.answerRow}>
                      <Text style={es.answerRowText} numberOfLines={1}>{qText}</Text>
                      <Text style={[es.answerBadge, value ? es.answerYes : es.answerNo]}>
                        {value ? 'YES' : 'NO'}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        <Text style={es.sectionLabel}>Recommended Facility Nearby</Text>
        <View style={es.recommendedFacilityContainer}>
          <View style={es.recommendedBadge}>
            <Text style={es.recommendedBadgeText}>⭐ RECOMMENDED DESTINATION</Text>
          </View>
          <ServiceCard service={services[0]} accentColor={accentColor} />
        </View>

        {services.length > 1 && (
          <>
            <Text style={es.sectionLabel}>Alternate Medical Facilities Nearby</Text>
            {services.slice(1).map((s) => (
              <ServiceCard key={s.id} service={s} accentColor={Colors.slate} />
            ))}
          </>
        )}

        <Text style={es.sectionLabel}>Ambulance Services</Text>
        {MOCK_AMBULANCE.slice(0, 2).map((s) => (
          <ServiceCard key={s.id} service={s} accentColor={Colors.red} showOpenTag={false} />
        ))}

        <Text style={es.sectionLabel}>Police</Text>
        {MOCK_POLICE.slice(0, 2).map((s) => (
          <ServiceCard key={s.id} service={s} accentColor={Colors.slate} showOpenTag={false} />
        ))}

        <Text style={es.sectionLabel}>Nearest Petrol Pump</Text>
        <ServiceCard service={MOCK_FUEL[0]} accentColor={Colors.purple} />
        {!pumpAlerted && (
          <Button title="⛽ Alert Petrol Pump" onPress={() => setPumpAlerted(true)} variant="outline" style={{ marginBottom: 8 }} />
        )}

        <FirstAidSteps steps={firstAidSteps} />
        
        {severity === 'critical' && (
          <Button
            title="🩺 Open Life-Saving CPR Guide"
            onPress={() => {
              try {
                navigation.getParent()?.navigate('SupportFlows', { screen: 'CPRGuide' });
              } catch {
                navigation.navigate('SupportFlows', { screen: 'CPRGuide' });
              }
            }}
            style={{ backgroundColor: Colors.red, marginVertical: 8 }}
          />
        )}

        <AlertFamilyButton sent={familyAlerted} onPress={() => setFamilyAlerted(true)} />

        <TouchableOpacity style={es.bystanderLink} onPress={() => navigation.navigate('IncidentMap')}>
          <Text style={es.bystanderLinkText}>👁 I'm a bystander here →</Text>
        </TouchableOpacity>
      </ScrollView>

      <KmMarkerModal
        visible={kmModalVisible}
        onClose={() => setKmModalVisible(false)}
        onResolve={(hw, km) => {
          setPlaceName(`${hw}, KM ${km}`);
          setKmModalVisible(false);
        }}
      />
    </SafeAreaContainer>
  );
};

// ─── EVACUATION GUIDE SCREEN ─────────────────────────────────────────────────
const EVAC_STEPS = [
  { icon: '🔑', text: 'TURN OFF IGNITION', sub: 'Cut the fuel supply immediately. Remove key.' },
  { icon: '🏃', text: 'GET EVERYONE OUT', sub: 'All passengers out NOW. Move 50m away. Leave everything.' },
  { icon: '🚫', text: 'DO NOT open the bonnet', sub: 'Oxygen feeds fire. Opening bonnet accelerates burning.' },
  { icon: '📞', text: 'Call Fire Brigade — 101', sub: 'Give your location. Stay well clear of the vehicle.' },
];

export const EvacuationGuideScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [seconds, setSeconds] = useState(90);
  const timerRef = useRef<any>(null);
  const stepTimerRef = useRef<any>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Timer countdown
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          navigation.replace('EmergencyFire');
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    // Step auto-advance every 15s
    stepTimerRef.current = setInterval(() => {
      setCurrentStep((prev) => Math.min(prev + 1, EVAC_STEPS.length - 1));
    }, 15000);

    // Pulse animation for urgency
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();

    return () => {
      clearInterval(timerRef.current);
      clearInterval(stepTimerRef.current);
      pulse.stop();
    };
  }, []);

  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toString().padStart(2, '0');
  const urgentColor = seconds < 30 ? '#dc2626' : Colors.orange;

  return (
    <View style={[es.evacBg, { backgroundColor: urgentColor }]}>
      {/* Timer strip */}
      <Animated.View style={[es.evacTimerStrip, { transform: [{ scale: pulseAnim }] }]}>
        <View>
          <Text style={es.evacTimerLabel}>EVACUATE NOW</Text>
          <Text style={es.evacTimerSub}>Auto-advances to fire brigade services</Text>
        </View>
        <Text style={es.evacTimerNum}>{mins}:{secs}</Text>
      </Animated.View>

      {/* Progress dots */}
      <View style={es.evacDots}>
        {EVAC_STEPS.map((_, i) => (
          <View key={i} style={[es.evacDot, i <= currentStep && { backgroundColor: '#fff', width: i === currentStep ? 24 : 8 }]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}>
        {EVAC_STEPS.map((step, i) => (
          <View
            key={i}
            style={[
              es.evacStep,
              i === currentStep && es.evacStepActive,
              i < currentStep && es.evacStepDone,
            ]}
          >
            <Text style={es.evacStepIcon}>{step.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[es.evacStepText, i < currentStep && { opacity: 0.6 }]}>{step.text}</Text>
              <Text style={es.evacStepSub}>{step.sub}</Text>
            </View>
            {i < currentStep && <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 24 }}>✓</Text>}
          </View>
        ))}

        {currentStep < EVAC_STEPS.length - 1 && (
          <TouchableOpacity
            style={es.evacNextBtn}
            onPress={() => setCurrentStep((p) => Math.min(p + 1, EVAC_STEPS.length - 1))}
          >
            <Text style={es.evacNextText}>✓ Done — Next Step</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Persistent bottom button */}
      <TouchableOpacity style={es.evacBottomBtn} onPress={() => navigation.navigate('EmergencyFire')}>
        <Text style={es.evacBottomBtnText}>🚒 Show nearby fire brigade →</Text>
      </TouchableOpacity>
    </View>
  );
};

// ─── FIRE EMERGENCY SCREEN ────────────────────────────────────────────────────
export const FireEmergencyScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [familyAlerted, setFamilyAlerted] = useState(false);
  const { location, locationOverride } = useIncidentStore();
  const activeLat = locationOverride?.lat ?? location?.lat ?? 20.5937;
  const activeLng = locationOverride?.lng ?? location?.lng ?? 78.9629;
  const country = detectCountry(activeLat, activeLng);

  return (
    <SafeAreaContainer>
      <Header title="🔥 Fire Emergency" onBack={() => navigation.navigate('EvacuationGuide')} color={Colors.orange} />
      <ScrollView contentContainerStyle={es.content} showsVerticalScrollIndicator={false}>
        <CountryBadge country={country} />
        <DataSourceBadge count={MOCK_FIRE_STATIONS.length + MOCK_FUEL.length + MOCK_POLICE.length} />

        {/* Critical warning — undismissable */}
        <View style={es.fireWarning}>
          <Text style={es.fireWarningTitle}>⚠️ DO NOT use water on fuel fires</Text>
          <Text style={es.fireWarningText}>
            Water spreads fuel fires. Use sand, dry powder, or CO₂ extinguisher only.
            Stand at least 50 metres away from the vehicle.
          </Text>
        </View>

        <Text style={es.sectionLabel}>Fire Brigade</Text>
        {MOCK_FIRE_STATIONS.map((s) => (
          <ServiceCard key={s.id} service={s} accentColor={Colors.orange} showOpenTag={false} />
        ))}

        <Text style={es.sectionLabel}>Nearest Petrol Pump (may have extinguisher)</Text>
        {MOCK_FUEL.slice(0, 2).map((s) => (
          <ServiceCard key={s.id} service={s} accentColor={Colors.orange} />
        ))}

        <Text style={es.sectionLabel}>Police — Traffic Management</Text>
        {MOCK_POLICE.slice(0, 2).map((s) => (
          <ServiceCard key={s.id} service={s} accentColor={Colors.slate} showOpenTag={false} />
        ))}

        <AlertFamilyButton sent={familyAlerted} onPress={() => setFamilyAlerted(true)} />
      </ScrollView>
    </SafeAreaContainer>
  );
};

// ─── BREAKDOWN SCREEN ─────────────────────────────────────────────────────────
const BREAKDOWN_TABS = ['🔧 Towing', '🔄 Puncture', '⛽ Petrol Pumps', '🏪 Showrooms'];

export const BreakdownScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const defaultTab = route?.params?.params?.defaultTab ?? 0;
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [placeName, setPlaceName] = useState('Detecting location…');
  const [kmModalVisible, setKmModalVisible] = useState(false);
  const [pumpAlerted, setPumpAlerted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showClosed, setShowClosed] = useState(false);
  const { locationOverride, setLocation } = useIncidentStore();

  const tabData = [MOCK_TOWING, MOCK_TYRES, MOCK_FUEL, MOCK_SHOWROOMS];
  const accentColors = [Colors.blue, Colors.blue, Colors.purple, Colors.slate];

  useEffect(() => {
    (async () => {
      if (locationOverride) {
        setLocation(locationOverride.lat, locationOverride.lng);
        setPlaceName(locationOverride.label);
        setLoading(false);
        return;
      }
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setLocation(loc.coords.latitude, loc.coords.longitude);
          setPlaceName(`${loc.coords.latitude.toFixed(4)}°N, ${loc.coords.longitude.toFixed(4)}°E`);
        } else {
          setPlaceName('GPS unavailable — enter km marker');
        }
      } catch {
        setPlaceName('Tap to enter km marker');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const currentData = (tabData[activeTab] ?? []).filter(
    (s) => showClosed || s.openNow !== false
  );

  return (
    <SafeAreaContainer>
      <Header title="🔧 Breakdown / Fuel" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={es.content} showsVerticalScrollIndicator={false}>
        {pumpAlerted && <PumpAlertBanner pumpName={MOCK_FUEL[0].name} />}
        <DataSourceBadge count={MOCK_TOWING.length + MOCK_TYRES.length + MOCK_FUEL.length + MOCK_SHOWROOMS.length} />
        <LocationBar placeName={loading ? 'Detecting…' : placeName} onKmMarkerPress={() => setKmModalVisible(true)} />

        <ResultTab tabs={BREAKDOWN_TABS} activeIndex={activeTab} onTabChange={setActiveTab} />

        {/* Show/hide closed toggle */}
        <TouchableOpacity style={es.closedToggle} onPress={() => setShowClosed(!showClosed)}>
          <Text style={es.closedToggleText}>
            {showClosed ? '👁 Showing all (incl. closed)' : '✓ Only showing open — tap to show all'}
          </Text>
        </TouchableOpacity>

        {currentData.length === 0 ? (
          <View style={es.emptyTab}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>🔍</Text>
            <Text style={{ color: Colors.gray500, fontSize: 14 }}>No open services found</Text>
            <Button title="Show closed too" onPress={() => setShowClosed(true)} variant="outline" style={{ marginTop: 12 }} />
          </View>
        ) : (
          currentData.map((s) => (
            <ServiceCard key={s.id} service={s} accentColor={accentColors[activeTab]} />
          ))
        )}

        {activeTab === 2 && !pumpAlerted && (
          <Button title="⛽ Alert Nearest Pump — Preparing to Assist" onPress={() => setPumpAlerted(true)} variant="outline" style={{ marginTop: 4 }} />
        )}
      </ScrollView>

      <KmMarkerModal
        visible={kmModalVisible}
        onClose={() => setKmModalVisible(false)}
        onResolve={(hw, km) => { setPlaceName(`${hw}, KM ${km}`); setKmModalVisible(false); }}
      />
    </SafeAreaContainer>
  );
};

// ─── FLOOD EMERGENCY SCREEN ───────────────────────────────────────────────────
export const FloodEmergencyScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [familyAlerted, setFamilyAlerted] = useState(false);
  const { location, locationOverride } = useIncidentStore();
  const activeLat = locationOverride?.lat ?? location?.lat ?? 20.5937;
  const activeLng = locationOverride?.lng ?? location?.lng ?? 78.9629;
  const country = detectCountry(activeLat, activeLng);

  return (
    <SafeAreaContainer>
      <Header title="🌊 Flood Emergency" onBack={() => navigation.goBack()} color={Colors.teal} />
      <ScrollView contentContainerStyle={es.content} showsVerticalScrollIndicator={false}>
        <CountryBadge country={country} />
        <DataSourceBadge count={3 + MOCK_POLICE.length + 2} />

        {/* DO NOT drive warning */}
        <View style={es.floodWarning}>
          <Text style={es.floodWarningTitle}>🚫 DO NOT drive through water</Text>
          <Text style={es.floodWarningText}>
            Just 15cm of fast-moving water can knock a person down.
            30cm can sweep a small car away. Stay in vehicle and call rescue.
          </Text>
        </View>

        <Text style={es.sectionLabel}>NDRF Rescue</Text>
        <ServiceCard service={{ id: '1', name: 'NDRF Control Room', distance: 'Call 1078', distanceSortKey: 0, phone: country.disaster, address: 'National Disaster Response Force', openNow: true, eta: 'Dispatching' }} accentColor={Colors.teal} showOpenTag={false} />

        <Text style={es.sectionLabel}>Emergency Services</Text>
        <ServiceCard service={{ id: '2', name: 'Ambulance — Emergency', distance: 'Call', distanceSortKey: 0, phone: country.ambulance, address: 'State Emergency Medical Services', openNow: true }} accentColor={Colors.red} showOpenTag={false} />
        <ServiceCard service={{ ...MOCK_POLICE[0], id: 'p1' }} accentColor={Colors.slate} showOpenTag={false} />

        <Text style={es.sectionLabel}>Nearest Hospital</Text>
        <ServiceCard service={{ id: 'h1', name: 'General Hospital', distance: '3.1 km', distanceSortKey: 3.1, phone: '080-44112233', address: 'Hospital Road', openNow: true, eta: '8 min' }} accentColor={Colors.teal} />

        <Text style={es.sectionLabel}>Safe Shelters Nearby</Text>
        {MOCK_SHELTERS.map((s) => (
          <ServiceCard key={s.id} service={s} accentColor={Colors.green} showOpenTag={false} />
        ))}

        <AlertFamilyButton sent={familyAlerted} onPress={() => setFamilyAlerted(true)} />

        <View style={es.safeRouteCard}>
          <Text style={es.safeRouteTitle}>🗺 Find Safe Route</Text>
          <Text style={es.safeRouteSub}>Navigate to elevated ground away from flood zones</Text>
          <Button
            title="Open Safe Route in Maps"
            onPress={() => Linking.openURL('https://www.google.com/maps/dir/?api=1&destination=elevated+ground')}
            style={{ backgroundColor: Colors.teal, marginTop: 10 }}
          />
        </View>
      </ScrollView>
    </SafeAreaContainer>
  );
};

// ─── SILENT SOS SCREEN ───────────────────────────────────────────────────────
export const SilentSOSScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const tapCount = useRef(0);
  const tapTimer = useRef<any>(null);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    const timer = setTimeout(() => setShowHint(false), 4000);
    return () => {
      sub.remove();
      clearTimeout(timer);
    };
  }, []);

  const handleTripleTap = () => {
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    if (tapCount.current >= 3) {
      tapCount.current = 0;
      // SilentSOSScreen is nested: HomeStack > EmergencyFlows > EmergencySOS
      // Need to go up two levels to reach HomeMain
      try {
        navigation.getParent()?.navigate('HomeMain');
      } catch {
        navigation.navigate('HomeMain');
      }
    } else {
      tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 2000);
    }
  };

  return (
    <View style={es.sosBg}>
      {/* Silent GPS tracking indicator (invisible to bystanders) */}
      <View style={es.sosStatusBox}>
        <Text style={es.sosStatusText}>● SOS Active · GPS tracking · Police alerted</Text>
        <Text style={es.sosStatusSub}>Location sent every 60 seconds</Text>
      </View>

      {/* Hidden cancel zone — bottom right */}
      <TouchableOpacity style={es.sosTapZone} onPress={handleTripleTap} activeOpacity={1} />

      {/* Barely-visible cancel hint */}
      <View style={es.sosHint}>
        <Text style={es.sosHintText}>Triple-tap bottom-right to cancel</Text>
      </View>

      {showHint && (
        <View style={es.sosOverlay}>
          <Text style={es.sosOverlayIcon}>🤫</Text>
          <Text style={es.sosOverlayTitle}>Silent SOS Mode Engaged</Text>
          <Text style={es.sosOverlayDesc}>
            To protect you from detection, the screen will dim completely. Police have been alerted, and your GPS location is being streamed live.
          </Text>
          <View style={es.sosOverlayBanner}>
            <Text style={es.sosOverlayBannerText}>
              🔑 DEMO ESCAPE: Triple-tap the bottom-right corner to exit this mode.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

// ─── STYLES ──────────────────────────────────────────────────────────────────
const es = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 },
  sectionLabel: {
    fontSize: 11, fontWeight: '800', color: Colors.gray400,
    marginTop: 20, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1,
  },

  // Country badge
  countryBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.gray50, borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: Colors.gray200, marginBottom: 8,
  },
  countryFlag: { fontSize: 28 },
  countryName: { fontSize: 12, fontWeight: '700', color: Colors.gray700 },
  countryNums: { fontSize: 11, color: Colors.gray500, marginTop: 1 },

  // Data source badge
  sourceBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 10,
  },
  sourceDot: { width: 6, height: 6, borderRadius: 3 },
  sourceText: { fontSize: 12, fontWeight: '600' },

  // Service card
  serviceCard: {
    backgroundColor: '#fff', borderRadius: 14, borderWidth: 1,
    borderColor: Colors.gray200, padding: 14, marginBottom: 10,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4,
  },
  serviceCardTop: { flexDirection: 'row', marginBottom: 10 },
  serviceName: { fontSize: 15, fontWeight: '700', color: Colors.gray900, flexShrink: 1 },
  serviceAddress: { fontSize: 12, color: Colors.gray500, marginTop: 2, marginBottom: 4 },
  serviceMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  serviceDist: { fontSize: 12, color: Colors.gray600, fontWeight: '600' },
  serviceEta: { fontSize: 12, color: Colors.green, fontWeight: '600' },
  servicePhone: { fontSize: 13, color: Colors.blue, fontWeight: '500' },
  offlineTag: { fontSize: 10, color: Colors.amberDark, backgroundColor: Colors.amber + '22', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontWeight: '600' },
  openTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  openTagText: { fontSize: 10, fontWeight: '700' },
  serviceCardActions: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, paddingVertical: 9, borderRadius: 8, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  // Auto dial
  autoDial: {
    borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14,
    marginBottom: 12, alignItems: 'center',
  },
  autoDialText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  // Bystander link
  bystanderLink: { paddingVertical: 16, alignItems: 'center' },
  bystanderLinkText: { color: Colors.blue, fontWeight: '600', fontSize: 14 },

  // Triage
  triageHeader: {
    backgroundColor: Colors.red, paddingHorizontal: 20, paddingVertical: 14,
    paddingTop: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  triageHeaderText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  progressTrack: { flexDirection: 'row', height: 4, gap: 3, paddingHorizontal: 4 },
  progressSegment: { flex: 1, backgroundColor: Colors.gray200 },
  triageContent: { flex: 1, paddingHorizontal: 24, paddingTop: 40 },
  triageStep: { fontSize: 12, color: Colors.gray400, marginBottom: 16, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  triageQuestion: { fontSize: 26, fontWeight: '800', color: Colors.gray900, lineHeight: 36, marginBottom: 40 },
  triageButtons: { flexDirection: 'row', gap: 12 },
  yesBtn: {
    flex: 1, paddingVertical: 24, borderRadius: 16, backgroundColor: Colors.red,
    alignItems: 'center', elevation: 4, shadowColor: Colors.red, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  yesBtnText: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 2 },
  noBtn: {
    flex: 1, paddingVertical: 24, borderRadius: 16,
    borderWidth: 2, borderColor: Colors.gray300, backgroundColor: '#fff',
    alignItems: 'center',
  },
  noBtnText: { color: Colors.gray700, fontSize: 22, fontWeight: '900' },
  triageHint: { textAlign: 'center', color: Colors.gray400, fontSize: 12, marginTop: 24 },

  // Evacuation
  evacBg: { flex: 1 },
  evacTimerStrip: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 52, paddingBottom: 14,
  },
  evacTimerLabel: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  evacTimerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },
  evacTimerNum: { color: '#fff', fontSize: 52, fontWeight: '900', letterSpacing: -2 },
  evacDots: { flexDirection: 'row', gap: 6, paddingHorizontal: 20, paddingBottom: 12 },
  evacDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.35)' },
  evacStep: {
    flexDirection: 'row', gap: 14, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 16, marginBottom: 10,
  },
  evacStepActive: {
    backgroundColor: 'rgba(255,255,255,0.32)',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.8)',
  },
  evacStepDone: { backgroundColor: 'rgba(0,0,0,0.12)' },
  evacStepIcon: { fontSize: 36 },
  evacStepText: { fontSize: 17, fontWeight: '900', color: '#fff', marginBottom: 3, letterSpacing: 0.3 },
  evacStepSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 19 },
  evacNextBtn: {
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.8)', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 8,
  },
  evacNextText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  evacBottomBtn: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)', paddingVertical: 20, alignItems: 'center',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)',
  },
  evacBottomBtnText: { color: '#fff', fontWeight: '800', fontSize: 17 },

  // Fire
  fireWarning: {
    backgroundColor: '#fff1f0', borderRadius: 14, padding: 16,
    borderWidth: 2, borderColor: Colors.red, marginBottom: 12,
  },
  fireWarningTitle: { fontSize: 15, fontWeight: '900', color: Colors.redDark, marginBottom: 6 },
  fireWarningText: { fontSize: 13, color: Colors.redDark, lineHeight: 21 },

  // Flood
  floodWarning: {
    backgroundColor: '#f0fdfa', borderRadius: 14, padding: 16,
    borderWidth: 2, borderColor: Colors.teal, marginBottom: 12,
  },
  floodWarningTitle: { fontSize: 15, fontWeight: '900', color: Colors.tealDark, marginBottom: 6 },
  floodWarningText: { fontSize: 13, color: Colors.tealDark, lineHeight: 21 },
  safeRouteCard: {
    backgroundColor: '#f0fdfa', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: Colors.teal, marginTop: 8,
  },
  safeRouteTitle: { fontSize: 16, fontWeight: '800', color: Colors.tealDark },
  safeRouteSub: { fontSize: 13, color: Colors.teal, marginTop: 4 },

  // Breakdown
  closedToggle: {
    paddingVertical: 8, paddingHorizontal: 12,
    backgroundColor: Colors.gray100, borderRadius: 8, marginBottom: 12,
    alignSelf: 'flex-start',
  },
  closedToggleText: { fontSize: 12, color: Colors.gray600, fontWeight: '500' },
  emptyTab: { alignItems: 'center', paddingVertical: 40 },

  // Silent SOS
  sosBg: { flex: 1, backgroundColor: '#040404' },
  sosStatusBox: {
    position: 'absolute', top: 60, left: 0, right: 0, alignItems: 'center',
  },
  sosStatusText: { color: 'rgba(255,0,0,0.08)', fontSize: 11 },
  sosStatusSub: { color: 'rgba(255,255,255,0.04)', fontSize: 9, marginTop: 2 },
  sosTapZone: { position: 'absolute', bottom: 0, right: 0, width: 110, height: 110 },
  sosHint: { position: 'absolute', bottom: 20, left: 0, right: 0, alignItems: 'center' },
  sosHintText: { color: 'rgba(255,255,255,0.04)', fontSize: 9 },

  // Silent SOS Overlay
  sosOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 999,
  },
  sosOverlayIcon: { fontSize: 64, marginBottom: 20 },
  sosOverlayTitle: { fontSize: 24, fontWeight: '800', color: Colors.red, marginBottom: 12, textAlign: 'center' },
  sosOverlayDesc: { fontSize: 14, color: '#ccc', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  sosOverlayBanner: { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderWidth: 1, borderColor: Colors.red, borderRadius: 10, padding: 12 },
  sosOverlayBannerText: { fontSize: 13, color: Colors.red, fontWeight: '700', textAlign: 'center', lineHeight: 18 },

  // Diagnostics Card
  diagnosticsCard: {
    backgroundColor: '#1e1e2e',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#313244',
    padding: 14,
    marginVertical: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  diagHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#313244',
    paddingBottom: 10,
    marginBottom: 10,
  },
  diagTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#cdd6f4',
  },
  codeToggle: {
    backgroundColor: '#313244',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  codeToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#89b4fa',
  },
  codeBox: {
    backgroundColor: '#11111b',
    borderRadius: 8,
    padding: 10,
  },
  codeLine: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    color: '#cdd6f4',
    lineHeight: 16,
  },
  codeLineActiveBox: {
    backgroundColor: 'rgba(166, 227, 161, 0.15)',
    borderLeftWidth: 3,
    borderLeftColor: '#a6e3a1',
    paddingLeft: 4,
    marginVertical: 2,
    borderRadius: 2,
  },
  codeLineActive: {
    color: '#a6e3a1',
    fontWeight: '700',
  },
  codeKeyword: {
    color: '#cba6f7',
    fontWeight: '600',
  },
  codeString: {
    color: '#a6e3a1',
  },
  codeComment: {
    color: '#6c7086',
    fontStyle: 'italic',
  },
  rationaleBox: {
    paddingVertical: 4,
  },
  matchedRuleLabel: {
    fontSize: 11,
    color: '#a6adc8',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rationaleText: {
    fontSize: 13,
    color: '#cdd6f4',
    lineHeight: 20,
    marginBottom: 12,
  },
  answersSummary: {
    backgroundColor: '#11111b',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  answersTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#89b4fa',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  answerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  answerRowText: {
    fontSize: 12,
    color: '#a6adc8',
    flex: 1,
    marginRight: 10,
  },
  answerBadge: {
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  answerYes: {
    backgroundColor: '#f38ba822',
    color: '#f38ba8',
  },
  answerNo: {
    backgroundColor: '#a6e3a122',
    color: '#a6e3a1',
  },
  recommendedFacilityContainer: {
    borderWidth: 2,
    borderColor: '#f9e2af',
    borderRadius: 16,
    padding: 4,
    marginBottom: 12,
    backgroundColor: 'rgba(249, 226, 175, 0.05)',
  },
  recommendedBadge: {
    backgroundColor: '#f9e2af',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 4,
    marginLeft: 6,
    marginTop: 2,
  },
  recommendedBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#1e1e2e',
    letterSpacing: 0.5,
  },
});
