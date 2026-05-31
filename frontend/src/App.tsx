import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import { SplashScreen, OnboardingScreen, PermissionsScreen, SetupScreen } from './screens/OnboardingScreens';
import { HomeScreen } from './screens/HomeScreen';
import {
  TriageScreen,
  MedicalEmergencyScreen,
  FireEmergencyScreen,
  BreakdownScreen,
  FuelEmergencyScreen,
  FloodEmergencyScreen,
  SilentSOSScreen,
} from './screens/EmergencyScreens';
import {
  IncidentMapScreen,
  BytanderEntryScreen,
  MedicalIDScreen,
  SafeArrivalScreen,
} from './screens/SupportScreens';

// Store
import { useIncidentStore } from './store';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function OnboardingStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        cardStyle: { backgroundColor: 'white' },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="OnboardingFlow" component={OnboardingScreen} />
      <Stack.Screen name="Permissions" component={PermissionsScreen} />
      <Stack.Screen name="Setup" component={SetupScreen} />
    </Stack.Navigator>
  );
}

function EmergencyStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="EmergencyMedical" component={TriageScreen} />
      <Stack.Screen name="MedicalDetails" component={MedicalEmergencyScreen} />
      <Stack.Screen name="EmergencyFire" component={FireEmergencyScreen} />
      <Stack.Screen name="EmergencyBreakdown" component={BreakdownScreen} />
      <Stack.Screen name="EmergencyFuel" component={FuelEmergencyScreen} />
      <Stack.Screen name="EmergencyFlood" component={FloodEmergencyScreen} />
      <Stack.Screen name="EmergencySOS" component={SilentSOSScreen} />
      <Stack.Screen name="IncidentMap" component={IncidentMapScreen} />
    </Stack.Navigator>
  );
}

function SupportStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="BytanderEntry" component={BytanderEntryScreen} />
      <Stack.Screen name="MedicalID" component={MedicalIDScreen} />
      <Stack.Screen name="SafeArrival" component={SafeArrivalScreen} />
    </Stack.Navigator>
  );
}

function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="EmergencyFlows" component={EmergencyStack} />
      <Stack.Screen name="SupportFlows" component={SupportStack} />
    </Stack.Navigator>
  );
}

function App() {
  const onboardingComplete = useIncidentStore((state) => state.onboardingComplete);

  if (!onboardingComplete) {
    return (
      <SafeAreaProvider>
        <NavigationContainer>
          <OnboardingStack />
        </NavigationContainer>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <HomeStackNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
