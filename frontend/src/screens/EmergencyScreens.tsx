import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { useIncidentStore } from '../store';
import { SafeAreaContainer, Header, Button, FormField } from '../components/Layout';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  infoBox: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  infoBoxText: {
    fontSize: 13,
    color: '#7f1d1d',
    lineHeight: 20,
  },
  questionCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  answerButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  answerButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
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
  readOnlyInput: {
    backgroundColor: '#f3f4f6',
  },
  locationButtonContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  locationButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    alignItems: 'center',
  },
  locationButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  evacuationStep: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  stepNumber: {
    fontSize: 32,
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  issueButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  issueButtonSelected: {
    backgroundColor: '#3b82f6',
  },
  issueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  issueButtonTextSelected: {
    color: '#fff',
  },
  evacuationWarning: {
    backgroundColor: '#fef3c7',
    borderWidth: 2,
    borderColor: '#fcd34d',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  evacuationWarningTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 16,
  },
  emergencyIndicator: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  spinnerContainer: {
    alignItems: 'center',
    gap: 16,
  },
  spinnerText: {
    fontSize: 16,
    color: '#4b5563',
  },
});

export const TriageScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
  const setTriageLevel = useIncidentStore((state) => state.setTriageLevel);

  const questions = [
    { id: 'q1', text: 'Are you having severe symptoms (difficulty breathing, chest pain, severe bleeding)?' },
    { id: 'q2', text: 'Do you feel like your life is in immediate danger?' },
    { id: 'q3', text: 'Do you require immediate medical attention?' },
  ];

  const handleAnswer = (id: string, answer: boolean) => {
    setAnswers({ ...answers, [id]: answer });
  };

  const handleSubmit = () => {
    const yesCount = Object.values(answers).filter((v) => v === true).length;

    if (yesCount >= 2) {
      setTriageLevel('critical');
    } else if (yesCount === 1) {
      setTriageLevel('moderate');
    } else {
      setTriageLevel('minor');
    }

    navigation.navigate('MedicalDetails');
  };

  const allAnswered = questions.every((q) => answers[q.id] !== null && answers[q.id] !== undefined);

  return (
    <SafeAreaContainer style={styles.container}>
      <Header title="Quick Assessment" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={{ fontSize: 16, color: '#4b5563', marginBottom: 24 }}>
          Answer these questions to help us serve you better:
        </Text>

        {questions.map((question) => (
          <View key={question.id} style={styles.questionCard}>
            <Text style={styles.questionText}>{question.text}</Text>
            <View style={styles.answerButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.answerButton,
                  answers[question.id] === true && { backgroundColor: '#ef4444' },
                ]}
                onPress={() => handleAnswer(question.id, true)}
              >
                <Text
                  style={[
                    { fontWeight: '600' },
                    answers[question.id] === true ? { color: '#fff' } : { color: '#111827' },
                  ]}
                >
                  Yes
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.answerButton,
                  answers[question.id] === false && { backgroundColor: '#22c55e' },
                ]}
                onPress={() => handleAnswer(question.id, false)}
              >
                <Text
                  style={[
                    { fontWeight: '600' },
                    answers[question.id] === false ? { color: '#fff' } : { color: '#111827' },
                  ]}
                >
                  No
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <Button
          title="Continue"
          onPress={handleSubmit}
          disabled={!allAnswered}
          variant={allAnswered ? 'primary' : 'secondary'}
        />
      </ScrollView>
    </SafeAreaContainer>
  );
};

export const MedicalEmergencyScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [location, setLocation] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const setLocation_state = useIncidentStore((state) => state.setLocation);
  const setCurrentIncident = useIncidentStore((state) => state.setCurrentIncident);

  const handleGetLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      const coordText = `${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`;
      setLocation(coordText);
      setLocation_state(loc.coords.latitude, loc.coords.longitude);
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
    }
  };

  const handleSubmit = () => {
    const incidentId = 'inc_' + Date.now();
    setCurrentIncident(incidentId);
    navigation.navigate('IncidentMap', { incidentId });
  };

  return (
    <SafeAreaContainer style={styles.container}>
      <Header title="Medical Emergency" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoBox}>
          <Text style={[styles.infoBoxText, { fontWeight: '600' }]}>
            Emergency help is on the way!
          </Text>
          <Text style={styles.infoBoxText}>
            We've notified emergency services in your area.
          </Text>
        </View>

        <FormField label="Location">
          <View style={styles.locationButtonContainer}>
            <TextInput
              style={[styles.textInput, styles.readOnlyInput, { flex: 1 }]}
              placeholder="Tap Get Location"
              value={location}
              editable={false}
              placeholderTextColor="#9ca3af"
            />
            <TouchableOpacity style={styles.locationButton} onPress={handleGetLocation}>
              <Text style={{ fontSize: 20 }}>📍</Text>
            </TouchableOpacity>
          </View>
        </FormField>

        <FormField label="Symptoms / Details">
          <TextInput
            style={[styles.textInput, { height: 100, textAlignVertical: 'top' }]}
            placeholder="Describe your symptoms"
            value={symptoms}
            onChangeText={setSymptoms}
            multiline
            placeholderTextColor="#9ca3af"
          />
        </FormField>

        <Button
          title="Send Report & Connect"
          onPress={handleSubmit}
          variant="primary"
        />
        <Button
          title="Back"
          onPress={() => navigation.goBack()}
          variant="outline"
          style={{ marginTop: 12 }}
        />
      </ScrollView>
    </SafeAreaContainer>
  );
};

export const FireEmergencyScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [showEvacuation, setShowEvacuation] = useState(true);
  const setCurrentIncident = useIncidentStore((state) => state.setCurrentIncident);

  if (showEvacuation) {
    return (
      <SafeAreaContainer style={styles.container}>
        <Header title="Vehicle Fire - IMMEDIATE ACTION" onBack={() => setShowEvacuation(false)} />

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.evacuationWarning}>
            <Text style={styles.evacuationWarningTitle}>EVACUATE IMMEDIATELY!</Text>

            <View style={styles.evacuationStep}>
              <Text style={styles.stepNumber}>1️⃣</Text>
              <Text style={styles.stepText}>Get out of the vehicle</Text>
            </View>
            <View style={styles.evacuationStep}>
              <Text style={styles.stepNumber}>2️⃣</Text>
              <Text style={styles.stepText}>Move at least 100 meters away</Text>
            </View>
            <View style={styles.evacuationStep}>
              <Text style={styles.stepNumber}>3️⃣</Text>
              <Text style={styles.stepText}>Don't try to extinguish the fire</Text>
            </View>
            <View style={styles.evacuationStep}>
              <Text style={styles.stepNumber}>4️⃣</Text>
              <Text style={styles.stepText}>Call emergency services</Text>
            </View>

            <Button
              title="I'm Safe - Continue"
              onPress={() => setShowEvacuation(false)}
              variant="danger"
              style={{ marginTop: 16 }}
            />
          </View>
        </ScrollView>
      </SafeAreaContainer>
    );
  }

  return (
    <SafeAreaContainer style={styles.container}>
      <Header title="Vehicle Fire" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoBox}>
          <Text style={styles.infoBoxText}>Emergency services have been notified.</Text>
        </View>

        <FormField label="Any injuries?">
          <TextInput
            style={styles.textInput}
            placeholder="Describe any injuries"
            placeholderTextColor="#9ca3af"
          />
        </FormField>

        <Button
          title="Connect to Emergency Services"
          onPress={() => {
            const incidentId = 'inc_' + Date.now();
            setCurrentIncident(incidentId);
            navigation.navigate('IncidentMap', { incidentId });
          }}
          variant="primary"
        />
      </ScrollView>
    </SafeAreaContainer>
  );
};

export const BreakdownScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [issueType, setIssueType] = useState('');
  const setCurrentIncident = useIncidentStore((state) => state.setCurrentIncident);

  const issues = ['Flat Tire', 'Engine Problem', 'Dead Battery', 'Overheating', 'Other'];

  return (
    <SafeAreaContainer style={styles.container}>
      <Header title="Vehicle Breakdown" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={{ fontSize: 16, color: '#4b5563', marginBottom: 24 }}>
          What's wrong with your vehicle?
        </Text>

        {issues.map((issue) => (
          <TouchableOpacity
            key={issue}
            style={[
              styles.issueButton,
              issueType === issue && styles.issueButtonSelected,
            ]}
            onPress={() => setIssueType(issue)}
          >
            <Text
              style={[
                styles.issueButtonText,
                issueType === issue && styles.issueButtonTextSelected,
              ]}
            >
              {issue}
            </Text>
          </TouchableOpacity>
        ))}

        <Button
          title="Find Services Near Me"
          onPress={() => {
            if (issueType) {
              const incidentId = 'inc_' + Date.now();
              setCurrentIncident(incidentId);
              navigation.navigate('IncidentMap', { incidentId });
            }
          }}
          variant="primary"
          disabled={!issueType}
          style={{ marginTop: 24 }}
        />
      </ScrollView>
    </SafeAreaContainer>
  );
};

export const FuelEmergencyScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const setCurrentIncident = useIncidentStore((state) => state.setCurrentIncident);

  return (
    <SafeAreaContainer style={styles.container}>
      <Header title="Out of Fuel" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.infoBox, { backgroundColor: '#fef3c7', borderColor: '#fcd34d' }]}>
          <Text style={[styles.infoBoxText, { color: '#78350f' }]}>
            We'll help you find the nearest fuel station and arrange assistance if needed.
          </Text>
        </View>

        <Button
          title="Find Nearest Fuel Station"
          onPress={() => {
            const incidentId = 'inc_' + Date.now();
            setCurrentIncident(incidentId);
            navigation.navigate('IncidentMap', { incidentId });
          }}
          style={{ marginTop: 16 }}
        />
      </ScrollView>
    </SafeAreaContainer>
  );
};

export const FloodEmergencyScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const setCurrentIncident = useIncidentStore((state) => state.setCurrentIncident);

  return (
    <SafeAreaContainer style={styles.container}>
      <Header title="Flood/Water Emergency" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.evacuationWarning, { borderColor: '#60a5fa', backgroundColor: '#dbeafe' }]}>
          <Text style={[styles.evacuationWarningTitle, { color: '#1e40af' }]}>
            WATER CROSSING SAFETY
          </Text>
          <Text style={{ fontSize: 14, color: '#075985', lineHeight: 22, marginBottom: 16 }}>
            • Never drive through standing water{'\n'}
            • 6 inches of water can sweep a car away{'\n'}
            • If stranded, stay in the vehicle{'\n'}
            • Call for professional rescue help
          </Text>
        </View>

        <Button
          title="Request Rescue Assistance"
          onPress={() => {
            const incidentId = 'inc_' + Date.now();
            setCurrentIncident(incidentId);
            navigation.navigate('IncidentMap', { incidentId });
          }}
          variant="primary"
          style={{ marginTop: 16, backgroundColor: '#3b82f6' }}
        />
      </ScrollView>
    </SafeAreaContainer>
  );
};

export const SilentSOSScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [sending, setSending] = useState(false);
  const setCurrentIncident = useIncidentStore((state) => state.setCurrentIncident);

  const handleSend = async () => {
    setSending(true);
    setTimeout(() => {
      const incidentId = 'inc_' + Date.now();
      setCurrentIncident(incidentId);
      navigation.navigate('IncidentMap', { incidentId });
    }, 2000);
  };

  return (
    <SafeAreaContainer style={[styles.container, styles.emergencyIndicator]}>
      <View style={styles.spinnerContainer}>
        <Text style={{ fontSize: 60 }}>📵</Text>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827' }}>Silent SOS</Text>
        <Text style={{ fontSize: 16, color: '#4b5563', textAlign: 'center', lineHeight: 24 }}>
          This will discreetly send your location to emergency contacts. The screen appears inactive to observers.
        </Text>

        {!sending ? (
          <Button
            title="Activate Silent SOS"
            onPress={handleSend}
            variant="primary"
            style={{ marginTop: 32, paddingVertical: 20 }}
          />
        ) : (
          <View style={styles.spinnerContainer}>
            <View
              style={{
                width: 50,
                height: 50,
                borderWidth: 4,
                borderColor: '#ef4444',
                borderTopColor: 'transparent',
                borderRadius: 25,
              }}
            />
            <Text style={styles.spinnerText}>Sending discreet emergency alert...</Text>
          </View>
        )}
      </View>
    </SafeAreaContainer>
  );
};
