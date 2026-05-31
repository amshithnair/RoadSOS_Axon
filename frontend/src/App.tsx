import { useEffect } from 'react';
import { AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import { SplashScreen, LandingIntroScreen, OnboardingScreen, PermissionsScreen, SetupScreen } from './screens/OnboardingScreens';
import { HomeScreen } from './screens/HomeScreen';
import {
  TriageScreen,
  MedicalEmergencyScreen,
  EvacuationGuideScreen,
  FireEmergencyScreen,
  BreakdownScreen,
  FloodEmergencyScreen,
  SilentSOSScreen,
} from './screens/EmergencyScreens';
import {
  IncidentMapScreen,
  BystanderEntryScreen,
  RoleAssignmentScreen,
  BystanderGuidanceScreen,
  MedicalIDScreen,
  SafeArrivalScreen,
} from './screens/SupportScreens';
import { CPRGuideScreen } from './screens/CPRGuideScreen';
import { AccidentReportScreen } from './screens/AccidentReportScreen';

// Store
import { useIncidentStore } from './store';

const Stack = createStackNavigator();

function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: '#fff' } }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="LandingIntro" component={LandingIntroScreen} />
      <Stack.Screen name="OnboardingFlow" component={OnboardingScreen} />
      <Stack.Screen name="Permissions" component={PermissionsScreen} />
      <Stack.Screen name="Setup" component={SetupScreen} />
    </Stack.Navigator>
  );
}

function EmergencyStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Triage" component={TriageScreen} />
      <Stack.Screen name="MedicalDetails" component={MedicalEmergencyScreen} />
      <Stack.Screen name="EvacuationGuide" component={EvacuationGuideScreen} />
      <Stack.Screen name="EmergencyFire" component={FireEmergencyScreen} />
      <Stack.Screen name="EmergencyBreakdown" component={BreakdownScreen} />
      <Stack.Screen name="EmergencyFlood" component={FloodEmergencyScreen} />
      <Stack.Screen name="EmergencySOS" component={SilentSOSScreen} />
      <Stack.Screen name="IncidentMap" component={IncidentMapScreen} />
    </Stack.Navigator>
  );
}

function SupportStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BystanderEntry" component={BystanderEntryScreen} />
      <Stack.Screen name="RoleAssignment" component={RoleAssignmentScreen} />
      <Stack.Screen name="BystanderGuidance" component={BystanderGuidanceScreen} />
      <Stack.Screen name="MedicalID" component={MedicalIDScreen} />
      <Stack.Screen name="SafeArrival" component={SafeArrivalScreen} />
      <Stack.Screen name="CPRGuide" component={CPRGuideScreen} />
      <Stack.Screen name="AccidentReport" component={AccidentReportScreen} />
    </Stack.Navigator>
  );
}

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Setup" component={SetupScreen} />
      <Stack.Screen name="EmergencyFlows" component={EmergencyStack} />
      <Stack.Screen name="SupportFlows" component={SupportStack} />
    </Stack.Navigator>
  );
}

function App() {
  const { onboardingComplete, loadFromStorage, safeArrival, clearSafeArrival } = useIncidentStore();

  // Load persisted state on launch
  useEffect(() => {
    loadFromStorage();
  }, []);

  // Safe arrival foreground check
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        const { deadline } = safeArrival;
        if (deadline && Date.now() > deadline + 15 * 60 * 1000) {
          // Deadline missed — in a real app: send SMS here
          clearSafeArrival();
        }
      }
    });
    return () => sub.remove();
  }, [safeArrival]);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {onboardingComplete ? <HomeStack /> : <OnboardingStack />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
