import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaContainer, Header, EmergencyButton, BottomTabs } from '../components/Layout';
import { useIncidentStore } from '../store';

const { width } = Dimensions.get('window');
const buttonWidth = (width - 48) / 2; // 2 columns with padding

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    paddingBottom: 100,
  },
  infoBox: {
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderColor: '#93c5fd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 13,
    color: '#075985',
    lineHeight: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  emergencyButtonWrapper: {
    width: buttonWidth,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 24,
  },
  bystanderButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#dcfce7',
    borderWidth: 2,
    borderColor: '#22c55e',
    borderRadius: 8,
    alignItems: 'center',
  },
  bystanderButtonText: {
    color: '#15803d',
    fontWeight: '600',
    fontSize: 16,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  profileCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  profileItem: {
    marginBottom: 12,
  },
  profileLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  profileValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  profileButton: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f3e8ff',
    borderWidth: 2,
    borderColor: '#a855f7',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  profileButtonText: {
    color: '#6b21a8',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#4b5563',
  },
});

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('home');
  const userName = useIncidentStore((state) => state.userName);

  const emergencies = [
    { icon: '🚑', title: 'Medical\nEmergency', color: 'red' as const, route: 'EmergencyMedical' },
    { icon: '🔥', title: 'Vehicle\nFire', color: 'orange' as const, route: 'EmergencyFire' },
    { icon: '🚗', title: 'Breakdown', color: 'blue' as const, route: 'EmergencyBreakdown' },
    { icon: '⛽', title: 'Out of\nFuel', color: 'purple' as const, route: 'EmergencyFuel' },
    { icon: '💧', title: 'Flood/Water', color: 'blue' as const, route: 'EmergencyFlood' },
    { icon: '🆘', title: 'Silent\nSOS', color: 'red' as const, route: 'EmergencySOS' },
  ];

  const tabs = [
    { id: 'home', icon: '🏠', label: 'Home', action: () => setActiveTab('home') },
    { id: 'profile', icon: '👤', label: 'Profile', action: () => setActiveTab('profile') },
    { id: 'incidents', icon: '📍', label: 'Active', action: () => setActiveTab('incidents') },
  ];

  return (
    <SafeAreaContainer style={styles.container}>
      <Header 
        title={`Welcome${userName ? ', ' + userName : ''}!`}
        rightAction={<Text style={{ fontSize: 24 }}>⚙️</Text>}
      />
      
      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'home' && (
          <>
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: '600' }}>How to use:</Text> Tap the button matching your emergency type. We'll guide you through the process.
              </Text>
            </View>

            <View style={styles.gridContainer}>
              {emergencies.map((emergency) => (
                <View key={emergency.route} style={styles.emergencyButtonWrapper}>
                  <EmergencyButton
                    icon={emergency.icon}
                    title={emergency.title}
                    color={emergency.color}
                    onPress={() => navigation.navigate('EmergencyFlows', { screen: emergency.route })}
                  />
                </View>
              ))}
            </View>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.bystanderButton}
              onPress={() => navigation.navigate('SupportFlows', { screen: 'BytanderEntry' })}
            >
              <Text style={styles.bystanderButtonText}>I'm a Bystander - Help Someone</Text>
            </TouchableOpacity>
          </>
        )}

        {activeTab === 'profile' && (
          <>
            <View style={styles.profileCard}>
              <Text style={styles.profileCardTitle}>Your Profile</Text>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Name</Text>
                <Text style={styles.profileValue}>{userName || 'Not set'}</Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={[styles.profileButton, { borderColor: '#a855f7', backgroundColor: '#f3e8ff' }]}
              onPress={() => navigation.navigate('SupportFlows', { screen: 'MedicalID' })}
            >
              <Text style={[styles.profileButtonText, { color: '#6b21a8' }]}>📋 View Medical QR ID</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.profileButton, { borderColor: '#3b82f6', backgroundColor: '#dbeafe' }]}
              onPress={() => navigation.navigate('SupportFlows', { screen: 'SafeArrival' })}
            >
              <Text style={[styles.profileButtonText, { color: '#1e40af' }]}>🛣️ Set Safe Arrival Alert</Text>
            </TouchableOpacity>
          </>
        )}

        {activeTab === 'incidents' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No active incidents</Text>
          </View>
        )}
      </ScrollView>

      <BottomTabs activeTab={activeTab} tabs={tabs} />
    </SafeAreaContainer>
  );
};
