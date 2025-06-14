import React, { useMemo } from 'react';
import { auth } from '../database/firebase';

import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getUserName } from '../database/UserDB';

// import LinearGradient from 'expo'
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = () => {
  //get current user name
  if (!auth.currentUser) return;
  const user = auth.currentUser;
  const user_name = getUserName(user.uid);

  // Get current date and calculate the week
  const today = useMemo(() => new Date(), []);
  const navigation = useNavigation();

  const weekDays = useMemo(() => {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


    // Get Sunday of current week
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay());

    // Generate array of dates for the week
    for (let i = 0; i < 7; i++) {
      const date = new Date(sunday);
      date.setDate(sunday.getDate() + i);
      days.push({
        date: date.getDate(),
        day: dayNames[date.getDay()],
        fullDate: date,
      });
    }
    return days;
  }, [today]);

  const isToday = (date) => {
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Welcome back, {user_name}</Text>
          <Image
            source={require('../assets/profile-placeholder.png')}
            style={styles.profileImage}
          />
        </View>
      </View>

      {/* Calendar Strip */}
      <View style={styles.calendarStrip}>
        {weekDays.map((item, index) => (
          <View
            key={index}
            style={[
              styles.dayContainer,
              isToday(item.fullDate) && styles.selectedDayContainer
            ]}
          >
            <Text style={[
              styles.dayText,
              isToday(item.fullDate) && styles.selectedDayText
            ]}>
              {item.date}
            </Text>
            <Text style={[
              styles.dayLabel,
              isToday(item.fullDate) && styles.selectedDayText
            ]}>
              {item.day}
            </Text>
          </View>
        ))}
      </View>

      {/* Main Cards */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Sessions')}>
        <Image
          source={require('../assets/workout-bg.png')}
          style={styles.cardBackground}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.5)']}
          style={styles.cardGradient}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Workout</Text>
            <Ionicons name="chevron-forward" size={24} color="white" />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('DietScreen')}>
        <Image
          source={require('../assets/meal-bg.png')}
          style={styles.cardBackground}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.5)']}
          style={styles.cardGradient}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Meal Planner</Text>
            <Ionicons name="chevron-forward" size={24} color="white" />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Statistics Section */}
      <View style={styles.statisticsHeader}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <Ionicons name="chevron-forward" size={24} color="white" />
      </View>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabel}>Workouts Completed{'\n'}this week</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Calorie Tracker</Text>
        </View>
      </View>
    </ScrollView >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  calendarStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  dayContainer: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
  },
  selectedDayContainer: {
    backgroundColor: '#E4FA00',
  },
  dayText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  dayLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
  },
  selectedDayText: {
    color: '#000000',
  },
  card: {
    height: 160,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  cardBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardGradient: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statisticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 15,
    marginRight: 10,
  },
  statNumber: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    color: '#8E8E93',
    fontSize: 14,
  },
});

export default HomeScreen; 