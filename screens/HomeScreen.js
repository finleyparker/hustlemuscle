import React, { useEffect, useState, useMemo } from 'react';
import { View, Alert, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../database/firebase';
import { getUserName, logout } from '../database/UserDB';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { doc, getDoc } from 'firebase/firestore';
import { runDailyTask, testRunDailyTask } from '../utils/syncWorkoutSchedule';  

const HomeScreen = () => {
  const [userName, setUserName] = useState('');
  const navigation = useNavigation();
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [totalCalories, setTotalCalories] = useState(0);
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch user name when the component mounts
  useEffect(() => {
    const fetchUserName = async () => {
      const user = auth.currentUser;
      if (user) {
        const name = await getUserName(user.uid);
        setUserName(name);
      }
    };

    fetchUserName();
  }, []);

  useEffect(() => {
    const fetchCalories = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'UserDetails', user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTotalCalories(data.totalCalories || 0);
        }
      }
    };
  
    fetchCalories();
  }, []);
  

  const askLogout = () =>
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Sign Out',
        onPress: () => logout(navigation)
      },
    ]);

  // Run daily task when date changes
  useEffect(() => {
    const checkDate = async () => {
      console.log("Checking date...");
      const newDate = new Date().toISOString().slice(0, 10);
      console.log("Current date in state:", currentDate);
      console.log("New date:", newDate);
      
      if (newDate !== currentDate) {
        console.log("Date changed, updating state...");
        setCurrentDate(newDate);
      } else {
        console.log("Date hasn't changed");
      }
    };

    console.log("Setting up daily task check...");
    // Check immediately and then every minute
    checkDate();
    const interval = setInterval(checkDate, 60000);

    return () => {
      console.log("Cleaning up interval");
      clearInterval(interval);
    };
  }, [currentDate]);

  const today = useMemo(() => new Date(), [currentDate]); // Update today when date changes

  const weekDays = useMemo(() => {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - today.getDay());

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
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const showCalendar = () => setCalendarVisible(true);
  const hideCalendar = () => setCalendarVisible(false);
  const handleConfirm = (date) => {
    setSelectedDate(date);
    hideCalendar();
    console.log('Selected date:', date);
  };

  return (
    <ScrollView style={styles.container}>
      

      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome back, {userName}</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Settings')}>
            <Image
              source={require('../assets/profile-placeholder.png')}
              style={styles.profileImage} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar Strip */}
      <View style={styles.calendarStrip}>
        {weekDays.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayContainer,
              isToday(item.fullDate) && styles.selectedDayContainer,
            ]}
            onPress={() => navigation.navigate('WorkoutCalendar')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.dayText,
                isToday(item.fullDate) && styles.selectedDayText,
              ]}
            >
              {item.date}
            </Text>
            <Text
              style={[
                styles.dayLabel,
                isToday(item.fullDate) && styles.selectedDayText,
              ]}
            >
              {item.day}
            </Text>
          </TouchableOpacity>
        ))}
        <DateTimePickerModal
          isVisible={isCalendarVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideCalendar}
          display="inline"
        />
      </View>

      {/* Main Cards */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Workout')}
      >
        <Image
          source={require('../assets/weights3.jpg')}
          style={styles.cardBackground}
          resizeMode="cover"
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
        onPress={() => navigation.navigate('DietScreen')}
      >
        <Image
          source={require('../assets/food.jpg')}
          style={styles.cardBackground}
          resizeMode="cover"
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

      {/* Statistics Stat Cards (restored) */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabel}>
            Workouts Completed{"\n"}this week
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalCalories}</Text>
          <Text style={styles.statLabel}>Calorie Tracker</Text>
        </View>
      </View>

      {/* Test Buttons */}
      <View style={styles.testButtonsContainer}>
        <TouchableOpacity
          style={styles.testButton}
          onPress={() => navigation.navigate('TestWorkoutTimeline')}
        >
          <Text style={styles.testButtonText}>Test Workout Timeline</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          onPress={async () => {
            console.log("Manually triggering test task...");
            try {
              const result = await testRunDailyTask();
              console.log("Test task completed:", result);
              if (result && result.success) {
                // Navigate to calendar to refresh it
                navigation.navigate('WorkoutCalendar');
              } else {
                console.log("Test task did not complete successfully:", result?.message || "Unknown error");
              }
            } catch (error) {
              console.error("Error running test task:", error);
            }
          }}
        >
          <Text style={styles.testButtonText}>Test Date Shift</Text>
        </TouchableOpacity>
      </View>

      {/* My Progress Panel */}
      <TouchableOpacity
        style={styles.progressPanel}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('WorkoutHistory')}
      >
        <View style={styles.progressPanelHeader}>
          <Text style={styles.progressPanelLabel}>My Progress</Text>
          <Ionicons name="chevron-forward" size={22} color="#fff" />
        </View>
        <LinearGradient
          colors={['#a18fff', '#e0d7ff', '#fff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.progressBar}
        />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  welcomeContainer: {
    alignItems: 'center',
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 15.6,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 20,
  },
  profileButton: {
    position: 'absolute',
    right: 0,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  calendarStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 50,
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
    color: '#89868A',
    fontSize: 16,
    fontWeight: '500',
  },
  dayLabel: {
    color: '#89868A',
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
    fontSize: 30.5,
    fontWeight: 'bold',
  },
  progressPanel: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    gap: 12,
  },
  progressPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    
  },
  progressPanelLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  progressBar: {
    height: 14,
    borderRadius: 7,
    width: '100%',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 8,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 20,
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
  testButtonsContainer: {
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  testButton: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;
