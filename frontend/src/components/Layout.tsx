import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Platform.OS === 'android' ? 0 : 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginLeft: 12,
  },
  headerBack: {
    padding: 8,
  },
  backText: {
    fontSize: 24,
    color: '#111827',
  },
  emergencyButton: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
    marginBottom: 8,
    activeOpacity: 0.8,
  },
  emergencyButtonIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emergencyButtonTitle: {
    fontWeight: '700',
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
  emergencyButtonDescription: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  buttonPrimary: {
    backgroundColor: '#ef4444',
  },
  buttonSecondary: {
    backgroundColor: '#e5e7eb',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#d1d5db',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
    color: '#fff',
  },
  buttonTextSecondary: {
    color: '#111827',
  },
  formField: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  labelRequired: {
    color: '#ef4444',
    marginLeft: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
  },
  bottomTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  tabButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1,
  },
  tabButtonActive: {
    color: '#ef4444',
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabLabelActive: {
    color: '#ef4444',
  },
});

interface SafeAreaContainerProps {
  children: React.ReactNode;
  style?: any;
}

export const SafeAreaContainer: React.FC<SafeAreaContainerProps> = ({ children, style }) => {
  return (
    <SafeAreaView style={[styles.safeContainer, style]}>
      {children}
    </SafeAreaView>
  );
};

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, onBack, rightAction }) => {
  return (
    <View style={styles.header}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.headerBack}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      {rightAction}
    </View>
  );
};

interface BottomTabsProps {
  activeTab: string;
  tabs: Array<{ id: string; icon: string; label: string; action: () => void }>;
}

export const BottomTabs: React.FC<BottomTabsProps> = ({ activeTab, tabs }) => {
  return (
    <View style={styles.bottomTabs}>
      {tabs.map((tab) => (
        <TouchableOpacity key={tab.id} style={styles.tabButton} onPress={tab.action}>
          <Text style={[styles.tabIcon, activeTab === tab.id && styles.tabButtonActive]}>
            {tab.icon}
          </Text>
          <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

interface EmergencyButtonProps {
  icon: string;
  title: string;
  color: 'red' | 'orange' | 'blue' | 'purple' | 'green';
  onPress: () => void;
  description?: string;
}

export const EmergencyButton: React.FC<EmergencyButtonProps> = ({
  icon,
  title,
  color,
  onPress,
  description,
}) => {
  const colorMap = {
    red: '#ef4444',
    orange: '#f97316',
    blue: '#3b82f6',
    purple: '#a855f7',
    green: '#22c55e',
  };

  return (
    <TouchableOpacity
      style={[
        styles.emergencyButton,
        { backgroundColor: colorMap[color] },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.emergencyButtonIcon}>{icon}</Text>
      <Text style={styles.emergencyButtonTitle}>{title}</Text>
      {description && <Text style={styles.emergencyButtonDescription}>{description}</Text>}
    </TouchableOpacity>
  );
};

interface CardProps {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress }) => {
  const component = (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress}>{component}</TouchableOpacity>;
  }

  return component;
};

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ label, required, children }) => {
  return (
    <View style={styles.formField}>
      <View style={{ flexDirection: 'row' }}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.labelRequired}>*</Text>}
      </View>
      {children}
    </View>
  );
};

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: any;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  title,
  onPress,
  disabled = false,
  style,
}) => {
  const variantStyles = {
    primary: styles.buttonPrimary,
    secondary: styles.buttonSecondary,
    danger: { backgroundColor: '#dc2626' },
    outline: styles.buttonOutline,
  };

  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 12 },
    md: { paddingVertical: 12, paddingHorizontal: 16 },
    lg: { paddingVertical: 16, paddingHorizontal: 24 },
  };

  const textColor = variant === 'secondary' || variant === 'outline' ? '#111827' : '#fff';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variantStyles[variant],
        sizeStyles[size],
        disabled && { opacity: 0.5 },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
};

export const Spinner: React.FC = () => (
  <ActivityIndicator size="large" color="#ef4444" />
);
