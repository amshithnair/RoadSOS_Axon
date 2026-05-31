import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaContainer, Header, Button, FormField, Card } from '../components/Layout';
import { useIncidentStore } from '../store';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  mapPlaceholder: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#d1d5db',
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: '#4b5563',
  },
  qrContainer: {
    backgroundColor: '#f3e8ff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  qrPlaceholderText: {
    fontSize: 12,
    color: '#4b5563',
  },
  qrDescription: {
    fontSize: 12,
    color: '#4b5563',
    textAlign: 'center',
  },
  shareBox: {
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  shareLabel: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 4,
  },
  shareCode: {
    fontSize: 14,
    color: '#1e40af',
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  serviceText: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  serviceTime: {
    fontSize: 12,
    color: '#22c55e',
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderColor: '#93c5fd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  infoText: {
    fontSize: 13,
    color: '#075985',
    lineHeight: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  tabButtonActive: {
    backgroundColor: '#3b82f6',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  tabButtonTextActive: {
    color: '#fff',
  },
});

export const IncidentMapScreen: React.FC<{ navigation: any; route: any }> = ({ navigation, route }) => {
  const { incidentId } = route.params;

  return (
    <SafeAreaContainer style={styles.container}>
      <Header title="Incident Map" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.mapPlaceholder}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>🗺️</Text>
          <Text style={styles.mapPlaceholderText}>Map View - Shareable Incident Report</Text>
          <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>
            Incident ID: {incidentId}
          </Text>
        </View>

        <Card>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 }}>
            Share with Family
          </Text>
          <View style={styles.shareBox}>
            <Text style={styles.shareLabel}>Shareable Link:</Text>
            <Text style={styles.shareCode}>roadsos.app/incident/{incidentId}</Text>
          </View>
          <Button title="Copy Link" onPress={() => {}} variant="primary" />
          <Button title="Share via Message" onPress={() => {}} variant="secondary" style={{ marginTop: 8 }} />
        </Card>

        <Card style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 }}>
            Nearby Services
          </Text>
          <View style={styles.serviceItem}>
            <Text style={styles.serviceText}>🏥 Hospital - 2.3 km away</Text>
            <Text style={styles.serviceTime}>5 min</Text>
          </View>
          <View style={styles.serviceItem}>
            <Text style={styles.serviceText}>🚒 Fire Station - 1.8 km away</Text>
            <Text style={styles.serviceTime}>3 min</Text>
          </View>
          <View style={[styles.serviceItem, { borderBottomWidth: 0 }]}>
            <Text style={styles.serviceText}>🚔 Police Station - 3.1 km away</Text>
            <Text style={styles.serviceTime}>7 min</Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaContainer>
  );
};

export const BytanderEntryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [incidentCode, setIncidentCode] = useState('');

  return (
    <SafeAreaContainer style={styles.container}>
      <Header title="I'm a Bystander" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Thank you for helping! You can either assist someone at a nearby incident or create a new report.
          </Text>
        </View>

        <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 }}>
          Join an Existing Incident
        </Text>

        <TextInput
          style={{
            borderWidth: 1,
            borderColor: '#d1d5db',
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 16,
            marginBottom: 12,
            backgroundColor: '#fff',
          }}
          placeholder="Enter incident code"
          value={incidentCode}
          onChangeText={setIncidentCode}
          placeholderTextColor="#9ca3af"
        />

        <Button
          title="Join Incident"
          onPress={() => {}}
          variant="primary"
          disabled={!incidentCode}
        />

        <View style={{ height: 1, backgroundColor: '#d1d5db', marginVertical: 24 }} />

        <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 }}>
          Report New Issue
        </Text>

        <Button
          title="Report Incident"
          onPress={() => {}}
          variant="secondary"
        />
      </ScrollView>
    </SafeAreaContainer>
  );
};

export const MedicalIDScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const medicalInfo = useIncidentStore((state) => state.medicalInfo);

  return (
    <SafeAreaContainer style={styles.container}>
      <Header title="Medical QR ID" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.qrContainer}>
          <Text style={{ fontSize: 13, color: '#6b21a8', marginBottom: 16 }}>
            Your Medical ID QR Code
          </Text>
          <View style={styles.qrPlaceholder}>
            <Text style={styles.qrPlaceholderText}>📱 QR Code Here</Text>
          </View>
          <Text style={styles.qrDescription}>
            Scan this code to view your emergency medical information (offline)
          </Text>
        </View>

        <Card>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 }}>
            Your Medical Information
          </Text>
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 12, color: '#4b5563' }}>Blood Type:</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>
              Unknown (Add in Profile)
            </Text>
          </View>
          <View style={{ marginBottom: 12 }}>
            <Text style={{ fontSize: 12, color: '#4b5563' }}>Allergies:</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>None listed</Text>
          </View>
          <View>
            <Text style={{ fontSize: 12, color: '#4b5563' }}>Current Medications:</Text>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>None listed</Text>
          </View>
        </Card>

        <Button
          title="Edit Medical Info"
          onPress={() => {}}
          variant="secondary"
          style={{ marginTop: 24 }}
        />
      </ScrollView>
    </SafeAreaContainer>
  );
};

export const SafeArrivalScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [destination, setDestination] = useState('');
  const [arrivalTime, setArrivalTime] = useState('30');
  const [contacts, setContacts] = useState('');

  return (
    <SafeAreaContainer style={styles.container}>
      <Header title="Safe Arrival Alert" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Set a timer. If you don't check in by the time it expires, emergency contacts will be notified.
          </Text>
        </View>

        <FormField label="Destination" required>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#d1d5db',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 16,
              backgroundColor: '#fff',
            }}
            placeholder="Where are you heading?"
            value={destination}
            onChangeText={setDestination}
            placeholderTextColor="#9ca3af"
          />
        </FormField>

        <FormField label="Expected Arrival Time (minutes)" required>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#d1d5db',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 16,
              backgroundColor: '#fff',
            }}
            placeholder="30"
            value={arrivalTime}
            onChangeText={setArrivalTime}
            keyboardType="number-pad"
            placeholderTextColor="#9ca3af"
          />
        </FormField>

        <FormField label="Notify Contacts (comma-separated names)" required>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: '#d1d5db',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 16,
              backgroundColor: '#fff',
            }}
            placeholder="Mom, Dad, Brother"
            value={contacts}
            onChangeText={setContacts}
            placeholderTextColor="#9ca3af"
          />
        </FormField>

        <Button
          title="Start Safe Arrival Timer"
          onPress={() => navigation.navigate('HomeMain')}
          variant="primary"
        />
        <Button
          title="Cancel"
          onPress={() => navigation.goBack()}
          variant="outline"
          style={{ marginTop: 12 }}
        />
      </ScrollView>
    </SafeAreaContainer>
  );
};
