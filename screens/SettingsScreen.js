import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useNavigation } from '@react-navigation/native';
import { logout } from '../database/UserDB';
import AuthScreen from './AuthScreen';
import { auth } from '../database/firebase';
import { signOut } from 'firebase/auth';

const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const navigation = useNavigation();

  const showCalendar = () => setCalendarVisible(true);
  const hideCalendar = () => setCalendarVisible(false);
  const handleConfirm = (date) => {
    setSelectedDate(date);
    hideCalendar();
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
            await logout();
            await signOut(auth);
            navigation.reset({
              index: 0,
              routes: [{ name: 'AuthScreen' }],
            });
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
        <TouchableOpacity style={styles.row}>
          <Ionicons name="person-circle" size={24} color="#fff" style={styles.icon} />
          <Text style={styles.label}>Update details</Text>
          <Feather name="chevron-right" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('UpdateMetrics')}>
          <MaterialIcons name="fitness-center" size={22} color="#fff" style={styles.icon} />
          <Text style={styles.label}>Update metrics</Text>
          <Feather name="chevron-right" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={showCalendar}>
          <Feather name="calendar" size={22} color="#fff" style={styles.icon} />
          <Text style={styles.label}>
            {selectedDate ? selectedDate.toLocaleDateString() : 'Calendar'}
          </Text>
          <Feather name="chevron-right" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <DateTimePickerModal
          isVisible={isCalendarVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideCalendar}
          display="inline"
        />
        <TouchableOpacity style={[styles.row, styles.logoutRow]} onPress={askLogout}>
          <Feather name="log-out" size={22} color="#ff5e69" style={styles.icon} />
          <Text style={[styles.label, { color: '#ff5e69' }]}>Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* Preferences Section */}
      <Text style={styles.sectionHeader}>PREFERENCES</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="notifications-outline" size={22} color="#fff" style={styles.icon} />
          <Text style={styles.label}>Notification settings</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            thumbColor={notificationsEnabled ? '#E3FA05' : '#888'}
            trackColor={{ true: '#E3FA05', false: '#444' }}
            style={styles.switch}
          />
        </View>
        <TouchableOpacity style={styles.row}>
          <Feather name="message-square" size={22} color="#fff" style={styles.icon} />
          <Text style={styles.label}>Provide feedback</Text>
          <Feather name="chevron-right" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.row, styles.deleteRow]}>
          <Feather name="trash-2" size={22} color="#ff5e69" style={styles.icon} />
          <Text style={[styles.label, { color: '#ff5e69' }]}>Delete account</Text>
        </TouchableOpacity>
      </View>
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
  deleteRow: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
});

export default SettingsScreen; 