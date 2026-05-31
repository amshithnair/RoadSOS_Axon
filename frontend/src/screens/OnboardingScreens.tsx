import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useIncidentStore } from '../store';
import { SafeAreaContainer, Header, Button, FormField } from '../components/Layout';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientBg: {
    backgroundColor: '#ef4444',
  },
  splashIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  splashTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  splashSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  slideContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  slideIcon: {
    fontSize: 80,
    marginBottom: 32,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  slideDescription: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
  },
  dotActive: {
    backgroundColor: '#ef4444',
    width: 32,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  permissionCard: {
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    gap: 12,
  },
  permissionIcon: {
    fontSize: 24,
  },
  permissionContent: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  permissionDescription: {
    fontSize: 14,
    color: '#4b5563',
  },
});

export const SplashScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const onboardingComplete = useIncidentStore((state) => state.onboardingComplete);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onboardingComplete) {
        navigation.replace('HomeMain');
      } else {
        navigation.replace('OnboardingFlow');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation, onboardingComplete]);

  return (
    <SafeAreaContainer style={[styles.container, styles.gradientBg]}>
      <View style={styles.slideContent}>
        <Text style={styles.splashIcon}>🚑</Text>
        <Text style={styles.splashTitle}>ROADSoS</Text>
        <Text style={styles.splashSubtitle}>Emergency Response Network</Text>
      </View>
    </SafeAreaContainer>
  );
};

export const OnboardingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const setOnboarding = useIncidentStore((state) => state.setOnboarding);

  const slides = [
    {
      title: 'Welcome to ROADSoS',
      description: 'Your trusted emergency response network. Get help when you need it most.',
      icon: '🚑',
    },
    {
      title: 'Multiple Emergency Types',
      description: 'From medical emergencies to vehicle breakdowns, we help with all types of roadside issues.',
      icon: '🔧',
    },
    {
      title: 'Community Support',
      description: 'Help others and get help from nearby community members in times of need.',
      icon: '🤝',
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setOnboarding(true);
      navigation.replace('Permissions');
    }
  };

  const slide = slides[currentSlide];

  return (
    <SafeAreaContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.slideContent}>
          <Text style={styles.slideIcon}>{slide.icon}</Text>
          <Text style={styles.slideTitle}>{slide.title}</Text>
          <Text style={styles.slideDescription}>{slide.description}</Text>

          <View style={styles.dotsContainer}>
            {slides.map((_, idx) => (
              <View
                key={idx}
                style={[styles.dot, idx === currentSlide && styles.dotActive]}
              />
            ))}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
            onPress={handleNext}
            variant="primary"
          />
          {currentSlide > 0 && (
            <Button
              title="Back"
              onPress={() => setCurrentSlide(currentSlide - 1)}
              variant="outline"
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaContainer>
  );
};

export const PermissionsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const setPermissions = useIncidentStore((state) => state.setPermissions);

  const handleGrant = () => {
    setPermissions(true);
    navigation.replace('Setup');
  };

  return (
    <SafeAreaContainer>
      <Header title="Permissions" onBack={() => navigation.goBack()} />
      
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 24 }}>
          We need access to:
        </Text>

        <View style={styles.permissionCard}>
          <Text style={styles.permissionIcon}>📍</Text>
          <View style={styles.permissionContent}>
            <Text style={styles.permissionTitle}>Location</Text>
            <Text style={styles.permissionDescription}>To help emergency services find you quickly</Text>
          </View>
        </View>

        <View style={styles.permissionCard}>
          <Text style={styles.permissionIcon}>📞</Text>
          <View style={styles.permissionContent}>
            <Text style={styles.permissionTitle}>Phone Calls</Text>
            <Text style={styles.permissionDescription}>To contact emergency services</Text>
          </View>
        </View>

        <View style={styles.permissionCard}>
          <Text style={styles.permissionIcon}>📱</Text>
          <View style={styles.permissionContent}>
            <Text style={styles.permissionTitle}>Contacts</Text>
            <Text style={styles.permissionDescription}>To notify your emergency contacts</Text>
          </View>
        </View>

        <View style={{ marginTop: 32, marginBottom: 24 }}>
          <Button title="Grant Permissions" onPress={handleGrant} variant="primary" />
          <Button
            title="Skip for Now"
            onPress={() => navigation.replace('Setup')}
            variant="outline"
            style={{ marginTop: 12 }}
          />
        </View>
      </ScrollView>
    </SafeAreaContainer>
  );
};

export const SetupScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const setUserInfo = useIncidentStore((state) => state.setUserInfo);

  const handleSetup = () => {
    if (name && phone) {
      setUserInfo(name, phone);
      navigation.replace('HomeMain');
    }
  };

  return (
    <SafeAreaContainer>
      <Header title="Setup Your Profile" onBack={() => navigation.goBack()} />
      
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24 }}>
        <FormField label="Full Name" required>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#9ca3af"
          />
        </FormField>

        <FormField label="Phone Number" required>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your phone"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholderTextColor="#9ca3af"
          />
        </FormField>

        <View style={{ marginTop: 24, marginBottom: 24 }}>
          <Button
            title="Continue"
            onPress={handleSetup}
            variant="primary"
            disabled={!name || !phone}
          />
          <Button
            title="Skip"
            onPress={() => navigation.replace('HomeMain')}
            variant="outline"
            style={{ marginTop: 12 }}
          />
        </View>
      </ScrollView>
    </SafeAreaContainer>
  );
};
