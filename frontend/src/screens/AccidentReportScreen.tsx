import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import {
  SafeAreaContainer,
  Header,
  Button,
  FormField,
  Card,
  Colors,
} from '../components/Layout';
import * as Location from 'expo-location';
import { useIncidentStore } from '../store';

export const AccidentReportScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [dateTime, setDateTime] = useState('');
  const [gpsLocation, setGpsLocation] = useState('Detecting…');
  const [description, setDescription] = useState('');
  const [vehicles, setVehicles] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const { locationOverride } = useIncidentStore();

  useEffect(() => {
    // Set current time
    const now = new Date();
    setDateTime(now.toLocaleString());

    if (locationOverride) {
      setGpsLocation(locationOverride.label);
      return;
    }

    // Get GPS
    const getLoc = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setGpsLocation(`${loc.coords.latitude.toFixed(5)}°N, ${loc.coords.longitude.toFixed(5)}°E`);
        } else {
          setGpsLocation('GPS Access Denied');
        }
      } catch {
        setGpsLocation('Unknown (GPS Error)');
      }
    };
    getLoc();
  }, []);

  const addSimulatedPhoto = (type: string) => {
    if (photos.includes(type)) {
      setPhotos(photos.filter(p => p !== type));
    } else {
      setPhotos([...photos, type]);
    }
  };

  // Generate FIR text template
  const generateFIRText = () => {
    return `To,\nThe Officer-In-Charge,\nPolice Department\n\nSubject: INTIMATION OF ROAD ACCIDENT\n\nRespected Sir/Madam,\n\nI am writing to formally report a road traffic accident that occurred on ${dateTime || '[Date/Time]'}.\n\nDetails of the occurrence are as follows:\n- Location: ${gpsLocation || '[Location]'}\n- Vehicles Involved: ${vehicles || '[N/A]'}\n- Description of Incident: ${description || 'No description provided.'}\n- Photo Evidence Attached: ${photos.length > 0 ? photos.join(', ') : 'None'}\n\nPlease take this information on record as a formal general diary entry / FIR intimation.\n\nReported via ROADSoS App\nTimestamp: ${new Date().toISOString()}`;
  };

  const handleCopyReport = async () => {
    const text = generateFIRText();
    try {
      if (Platform.OS === 'web' && navigator?.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older RN
        const { default: Clipboard } = await import('@react-native-clipboard/clipboard').catch(() => ({ default: null }));
        if (Clipboard) Clipboard.setString(text);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      Alert.alert('Success', 'FIR / Accident Report copied to clipboard.');
    } catch {
      Alert.alert('Error', 'Failed to copy to clipboard.');
    }
  };

  const handleShareWhatsApp = () => {
    Alert.alert(
      'WhatsApp Report',
      'This would open WhatsApp and pre-fill the accident report details for your emergency contacts/police.'
    );
  };

  return (
    <SafeAreaContainer style={{ backgroundColor: '#fafafb' }}>
      <Header title="📝 Accident Report Generator" onBack={() => navigation.goBack()} color={Colors.blue} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>📋 Auto-Generate FIR & Reports</Text>
          <Text style={styles.introSub}>Create a structured document with GPS location, photo evidence, and descriptions to share instantly with police or insurance.</Text>
        </View>

        {/* Info Form */}
        <Card>
          <Text style={styles.cardTitle}>Incident Details</Text>

          <FormField label="Date & Time" required>
            <TextInput
              style={styles.inputDisabled}
              value={dateTime}
              editable={false}
            />
          </FormField>

          <FormField label="GPS Location Coordinates" required>
            <TextInput
              style={styles.inputDisabled}
              value={gpsLocation}
              editable={false}
            />
          </FormField>

          <FormField label="Vehicles Involved" required>
            <TextInput
              style={styles.inputText}
              placeholder="e.g. White SUV (KA-03-ME-4321), Red Hatchback"
              value={vehicles}
              onChangeText={setVehicles}
              placeholderTextColor={Colors.gray400}
            />
          </FormField>

          <FormField label="Accident Description" required>
            <TextInput
              style={[styles.inputText, styles.inputTextArea]}
              placeholder="Describe what happened (e.g. rear-end crash due to sudden braking)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              placeholderTextColor={Colors.gray400}
            />
          </FormField>
        </Card>

        {/* Photo Evidence Card */}
        <Card style={{ marginTop: 8 }}>
          <Text style={styles.cardTitle}>📸 Attach Photo Evidence</Text>
          <Text style={styles.photoSub}>Select the photos you want to simulate attaching to this report:</Text>

          <View style={styles.photoGrid}>
            <TouchableOpacity
              style={[styles.photoOption, photos.includes('Overall Accident Scene') && styles.photoOptionSelected]}
              onPress={() => addSimulatedPhoto('Overall Accident Scene')}
            >
              <Text style={styles.photoEmoji}>🚗</Text>
              <Text style={styles.photoLabel}>Accident Scene</Text>
              <Text style={styles.photoStatus}>{photos.includes('Overall Accident Scene') ? '✅ Attached' : '➕ Add'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.photoOption, photos.includes('License Plate / ID') && styles.photoOptionSelected]}
              onPress={() => addSimulatedPhoto('License Plate / ID')}
            >
              <Text style={styles.photoEmoji}>🪪</Text>
              <Text style={styles.photoLabel}>License Plate</Text>
              <Text style={styles.photoStatus}>{photos.includes('License Plate / ID') ? '✅ Attached' : '➕ Add'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.photoOption, photos.includes('Vehicle Damage Detail') && styles.photoOptionSelected]}
              onPress={() => addSimulatedPhoto('Vehicle Damage Detail')}
            >
              <Text style={styles.photoEmoji}>💥</Text>
              <Text style={styles.photoLabel}>Damage Detail</Text>
              <Text style={styles.photoStatus}>{photos.includes('Vehicle Damage Detail') ? '✅ Attached' : '➕ Add'}</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Report Preview */}
        <Card style={{ marginTop: 8 }}>
          <Text style={styles.cardTitle}>📄 Generated FIR / GD Template</Text>
          <View style={styles.firPreviewBox}>
            <ScrollView style={{ height: 180 }}>
              <Text style={styles.firText}>{generateFIRText()}</Text>
            </ScrollView>
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.btnCopy} onPress={handleCopyReport}>
              <Text style={styles.btnCopyText}>{copied ? '✅ Copied!' : '📋 Copy Report'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnShare} onPress={handleShareWhatsApp}>
              <Text style={styles.btnShareText}>💬 Share WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Button
          title="Done & Return Home"
          onPress={() => { try { navigation.getParent()?.navigate('HomeMain'); } catch { navigation.navigate('HomeMain'); } }}
          variant="outline"
          style={{ marginTop: 16 }}
        />
      </ScrollView>
    </SafeAreaContainer>
  );
};

const styles = StyleSheet.create({
  scroll: {
    padding: 16,
    paddingBottom: 48,
  },
  introCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.blue + '33',
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.blueDark,
    marginBottom: 4,
  },
  introSub: {
    fontSize: 12,
    color: Colors.gray600,
    lineHeight: 18,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.gray900,
    marginBottom: 12,
  },
  inputDisabled: {
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.gray600,
  },
  inputText: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.gray800,
  },
  inputTextArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  photoSub: {
    fontSize: 12,
    color: Colors.gray500,
    marginBottom: 12,
  },
  photoGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  photoOption: {
    flex: 1,
    backgroundColor: Colors.gray50,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  photoOptionSelected: {
    backgroundColor: '#eff6ff',
    borderColor: Colors.blue,
  },
  photoEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  photoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.gray700,
    marginBottom: 6,
  },
  photoStatus: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.blue,
  },
  firPreviewBox: {
    backgroundColor: Colors.gray900,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  firText: {
    color: '#34d399',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    lineHeight: 18,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  btnCopy: {
    flex: 1,
    backgroundColor: Colors.blue,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnCopyText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  btnShare: {
    flex: 1,
    backgroundColor: Colors.green,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnShareText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});
