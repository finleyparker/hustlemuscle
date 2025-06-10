import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useNavigation } from '@react-navigation/native';
import { logout } from '../database/UserDB';
import AuthScreen from './AuthScreen';
import { auth } from '../database/firebase';
import { signOut } from 'firebase/auth';
import { useDate } from '../context/DateContext';
import { requestNotificationPermissions, disableNotifications, enableNotifications } from '../utils/notifications';
import * as Notifications from 'expo-notifications';
import { getConsoleLoggingState, setConsoleLoggingState } from '../utils/consoleLogger';

const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [consoleLoggingEnabled, setConsoleLoggingEnabled] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [showHiddenDatePicker, setShowHiddenDatePicker] = useState(false);
  const [showDebugSwitch, setShowDebugSwitch] = useState(false);
  const navigation = useNavigation();
  const { updateDate, currentDate } = useDate();

  // Check notification permission status and console logging state on component mount
  useEffect(() => {
    checkNotificationStatus();
    checkConsoleLoggingStatus();
  }, []);

  const checkNotificationStatus = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setNotificationsEnabled(status === 'granted');
  };

  const checkConsoleLoggingStatus = async () => {
    const isEnabled = await getConsoleLoggingState();
    setConsoleLoggingEnabled(isEnabled);
  };

  const handleNotificationToggle = async (value) => {
    if (value) {
      // Request notification permissions
      const granted = await requestNotificationPermissions();
      if (granted) {
        const enabled = await enableNotifications();
        if (enabled) {
          setNotificationsEnabled(true);
        }
      } else {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive workout reminders.',
          [{ text: 'OK' }]
        );
      }
    } else {
      // Disable notifications completely
      const disabled = await disableNotifications();
      if (disabled) {
        setNotificationsEnabled(false);
      }
    }
  };

  const handleConsoleLoggingToggle = async () => {
    try {
      const newState = !consoleLoggingEnabled;
      await setConsoleLoggingState(!newState); // Reverse the state
      setConsoleLoggingEnabled(newState);
    } catch (error) {
      console.error('Error toggling console logging:', error);
    }
  };

  const handleNotificationTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    
    if (newCount >= 3) {
      setShowDebugSwitch(prev => !prev);
      setTapCount(0);
    }
  };

  const handleHiddenTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    
    if (newCount >= 3) {
      setShowHiddenDatePicker(true);
      setTapCount(0);
    }
  };

  const handleHiddenDateConfirm = async (date) => {
    // Set to midnight local time
    const adjustedDate = new Date(date);
    adjustedDate.setHours(0, 0, 0, 0);
    const year = adjustedDate.getFullYear();
    const month = String(adjustedDate.getMonth() + 1).padStart(2, '0');
    const day = String(adjustedDate.getDate()).padStart(2, '0');
    const localDateString = `${year}-${month}-${day}`;
    await updateDate(localDateString);
    setShowHiddenDatePicker(false);
  };

  const askLogout = () =>
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Sign Out',
        onPress: async () => {
          try {
            logout(navigation);
          } catch (error) {
            console.error('Error signing out:', error);
            Alert.alert('Error', 'Failed to sign out. Please try again.');
          }
        }
      },
    ]);

  return (
    <View style={styles.container}>
      {/* Account Section */}
      <Text style={styles.sectionHeader}>ACCOUNT</Text>
      <View style={styles.card}>
        <TouchableOpacity 
          style={styles.row}
          onPress={() => navigation.navigate('UpdateDetails')}
        >
          <Ionicons name="person-circle" size={24} color="#fff" style={styles.icon} />
          <Text style={styles.label}>Update details</Text>
          <Feather name="chevron-right" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('UpdateMetrics')}>
          <MaterialIcons name="fitness-center" size={22} color="#fff" style={styles.icon} />
          <Text style={styles.label}>Update metrics</Text>
          <Feather name="chevron-right" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.row, styles.logoutRow]} onPress={askLogout}>
          <Feather name="log-out" size={22} color="#ff5e69" style={styles.icon} />
          <Text style={[styles.label, { color: '#ff5e69' }]}>Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* Preferences Section */}
      <Text style={styles.sectionHeader}>PREFERENCES</Text>
      <View style={styles.card}>
        <TouchableOpacity 
          style={styles.row}
          onPress={handleNotificationTap}
        >
          <Ionicons name="notifications-outline" size={22} color="#fff" style={styles.icon} />
          <Text style={styles.label}>Notification settings</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleNotificationToggle}
            thumbColor={notificationsEnabled ? '#E3FA05' : '#888'}
            trackColor={{ true: '#E3FA05', false: '#444' }}
            style={styles.switch}
          />
        </TouchableOpacity>
        {showDebugSwitch && (
          <View style={styles.row}>
            <Ionicons name="code-working-outline" size={22} color="#fff" style={styles.icon} />
            <Text style={styles.label}>Debug mode</Text>
            <Switch
              value={!consoleLoggingEnabled}
              onValueChange={handleConsoleLoggingToggle}
              thumbColor={!consoleLoggingEnabled ? '#E3FA05' : '#888'}
              trackColor={{ true: '#E3FA05', false: '#444' }}
              style={styles.switch}
            />
          </View>
        )}
      </View>

      {/* Hidden Date Change Feature */}
      <TouchableOpacity 
        style={styles.hiddenButton} 
        onPress={handleHiddenTap}
      >
        <Text style={styles.hiddenButtonText}>Version 1.0.0</Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={showHiddenDatePicker}
        mode="date"
        onConfirm={handleHiddenDateConfirm}
        onCancel={() => setShowHiddenDatePicker(false)}
        display="inline"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 40,
  },
  sectionHeader: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 24,
    marginTop: 24,
    marginBottom: 8,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#18181A',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#232325',
  },
  icon: {
    marginRight: 16,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  chevron: {
    marginLeft: 8,
  },
  switch: {
    marginLeft: 8,
  },
  logoutRow: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
  hiddenButton: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  hiddenButtonText: {
    color: '#888',
    fontSize: 12,
  },
});

export default SettingsScreen; 