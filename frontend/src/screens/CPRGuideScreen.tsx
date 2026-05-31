import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Vibration,
  Platform,
} from 'react-native';
import {
  SafeAreaContainer,
  Header,
  Button,
  Colors,
} from '../components/Layout';

const CPR_STEPS = [
  {
    title: '📞 1. Call for Help First',
    desc: 'Ensure emergency services (ambulance) are already called. Put your phone on speaker next to you.',
  },
  {
    title: '💨 2. Check Breathing & Airway',
    desc: 'Tilt head back slightly, lift chin, and look/listen for breathing. If no breathing or gasping, start CPR.',
  },
  {
    title: '❤️ 3. Chest Compressions',
    desc: 'Place hands in center of chest. Push HARD & FAST to the beat of the pulse indicator below.',
  },
  {
    title: '👄 4. Rescue Breaths',
    desc: 'If trained: give 2 rescue breaths after every 30 compressions. Otherwise, do continuous chest compressions.',
  },
];

export const CPRGuideScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [activeStep, setActiveStep] = useState(2); // Start at compressions by default as it's the core focus
  const [isBeating, setIsBeating] = useState(false);
  const [compressionCount, setCompressionCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<any>(null);

  // Animation values for metronome pulse
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const flashAnim = useRef(new Animated.Value(0)).current;
  const beatIntervalRef = useRef<any>(null);

  // CPR Metronome timer (110 BPM -> ~545ms interval)
  const bpm = 110;
  const intervalMs = (60 / bpm) * 1000;

  useEffect(() => {
    if (isBeating) {
      // Setup total elapsed time timer
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);

      // Setup metronome beat loop
      beatIntervalRef.current = setInterval(() => {
        // Increment compression counts
        setCompressionCount((c) => c + 1);

        // Haptic feedback (Vibrate 30ms on device)
        if (Platform.OS !== 'web') {
          try {
            Vibration.vibrate(30);
          } catch {}
        }

        // Run animations
        pulseAnim.setValue(1);
        flashAnim.setValue(1);

        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.25,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(flashAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: false,
          }),
        ]).start();
      }, intervalMs);
    } else {
      // Clear all timers
      if (timerRef.current) clearInterval(timerRef.current);
      if (beatIntervalRef.current) clearInterval(beatIntervalRef.current);
      setElapsedSeconds(0);
      setCompressionCount(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (beatIntervalRef.current) clearInterval(beatIntervalRef.current);
    };
  }, [isBeating]);

  const toggleMetronome = () => {
    setIsBeating(!isBeating);
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const backgroundColor = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.white, '#fee2e2'], // flashes red/pink
  });

  return (
    <SafeAreaContainer style={{ backgroundColor: '#fdfcfc' }}>
      <Header title="🩺 Life-Saving CPR Guide" onBack={() => navigation.goBack()} color={Colors.red} />

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Urgent warning Banner */}
        <View style={styles.warningBanner}>
          <Text style={styles.warningTitle}>⚠️ EMERGENCY INSTRUCTION</Text>
          <Text style={styles.warningSub}>If victim is unresponsive and not breathing, proceed immediately.</Text>
        </View>

        {/* Steps tabs */}
        <View style={styles.stepTabs}>
          {CPR_STEPS.map((_, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.stepTab,
                activeStep === idx && styles.stepTabActive,
              ]}
              onPress={() => setActiveStep(idx)}
            >
              <Text style={[
                styles.stepTabText,
                activeStep === idx && styles.stepTabTextActive,
              ]}>
                Step {idx + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Active step detail card */}
        <View style={styles.activeStepCard}>
          <Text style={styles.activeStepTitle}>{CPR_STEPS[activeStep].title}</Text>
          <Text style={styles.activeStepDesc}>{CPR_STEPS[activeStep].desc}</Text>
        </View>

        {/* Metronome section */}
        {activeStep === 2 && (
          <Animated.View style={[styles.metronomeContainer, { backgroundColor }]}>
            <Text style={styles.metronomeHeader}>Chest Compression Assistant</Text>
            <Text style={styles.metronomeSub}>Aim for 100-120 compressions/min. Depth: 2 inches (5cm).</Text>

            {/* CPR Live Session Stats */}
            {isBeating && (
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{compressionCount}</Text>
                  <Text style={styles.statLabel}>COMPRESSIONS</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{formatTime(elapsedSeconds)}</Text>
                  <Text style={styles.statLabel}>ELAPSED TIME</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNum}>{Math.floor(compressionCount / 30)}</Text>
                  <Text style={styles.statLabel}>CYCLES (30:2)</Text>
                </View>
              </View>
            )}

            {/* Pulse Indicator */}
            <View style={styles.pulseArea}>
              <Animated.View
                style={[
                  styles.pulseCircle,
                  {
                    transform: [{ scale: pulseAnim }],
                    borderColor: isBeating ? Colors.red : Colors.gray300,
                    backgroundColor: isBeating ? Colors.red + '15' : Colors.gray100,
                  },
                ]}
              >
                <Text style={[styles.pulseText, { color: isBeating ? Colors.red : Colors.gray500 }]}>
                  {isBeating ? 'PUSH!' : 'IDLE'}
                </Text>
              </Animated.View>
            </View>

            {/* Pulse control button */}
            <TouchableOpacity
              style={[
                styles.pulseButton,
                { backgroundColor: isBeating ? Colors.slateDark : Colors.red },
              ]}
              onPress={toggleMetronome}
            >
              <Text style={styles.pulseButtonText}>
                {isBeating ? '⏹ Stop Assistant' : '▶ Start Beat Assistant'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.bpmIndicator}>🎯 Programmed Pace: {bpm} BPM</Text>
          </Animated.View>
        )}

        {/* Informative tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Essential Tips:</Text>
          <Text style={styles.tipsText}>• Keep your arms locked straight and push using your body weight, not just your arms.</Text>
          <Text style={styles.tipsText}>• Let the chest recoil completely between compressions to allow blood to flow back to the heart.</Text>
          <Text style={styles.tipsText}>• Do not stop compressions for more than 10 seconds under any circumstance.</Text>
        </View>

        {/* Footer actions */}
        <View style={styles.footer}>
          {activeStep < 3 ? (
            <Button
              title="Next Step →"
              onPress={() => setActiveStep(activeStep + 1)}
              style={{ backgroundColor: Colors.red }}
            />
          ) : (
            <Button
              title="✅ Finished CPR Guide"
              onPress={() => navigation.goBack()}
              variant="outline"
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaContainer>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 16,
    paddingBottom: 48,
  },
  warningBanner: {
    backgroundColor: Colors.red + '15',
    borderColor: Colors.red + '44',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  warningTitle: {
    color: Colors.redDark,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  warningSub: {
    color: Colors.red,
    fontSize: 13,
    lineHeight: 18,
  },
  stepTabs: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  stepTab: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: Colors.gray100,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  stepTabActive: {
    backgroundColor: Colors.red,
    borderColor: Colors.red,
  },
  stepTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.gray600,
  },
  stepTabTextActive: {
    color: '#fff',
  },
  activeStepCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.gray200,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  activeStepTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.gray900,
    marginBottom: 8,
  },
  activeStepDesc: {
    fontSize: 14,
    color: Colors.gray600,
    lineHeight: 22,
  },
  metronomeContainer: {
    borderRadius: 14,
    padding: 18,
    borderWidth: 1.5,
    borderColor: Colors.red + '33',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  metronomeHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.gray900,
  },
  metronomeSub: {
    fontSize: 11,
    color: Colors.gray500,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.red,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.gray500,
    marginTop: 3,
  },
  pulseArea: {
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  pulseCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  pulseText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  pulseButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  pulseButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  },
  bpmIndicator: {
    fontSize: 12,
    color: Colors.gray500,
    fontWeight: '600',
  },
  tipsCard: {
    backgroundColor: Colors.gray50,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.gray200,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.gray800,
    marginBottom: 6,
  },
  tipsText: {
    fontSize: 12,
    color: Colors.gray600,
    lineHeight: 18,
    marginBottom: 4,
  },
  footer: {
    marginTop: 8,
  },
});
