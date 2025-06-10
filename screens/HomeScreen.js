import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Alert,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { db, auth } from "../database/firebase";
import { getUserName } from "../database/UserDB";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { doc, getDoc } from "firebase/firestore";
import { runDailyTask, testRunDailyTask, resetStreakCounter } from "../utils/syncWorkoutSchedule";
import ProgressBar from "../components/ProgressBar";
import { getTodaysWorkout } from "./WorkoutCalendarScreen";
import { getWorkoutTimeline } from "../database/WorkoutTimeline";
import {
  loadFromCache,
  saveToCache,
  createCacheKey,
  CACHE_DURATIONS,
  clearCache,
} from "../utils/cacheManager";
import { useDate } from '../context/DateContext';

const HomeScreen = () => {
  const [userName, setUserName] = useState("");
  const navigation = useNavigation();
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [totalCalories, setTotalCalories] = useState(0);
  const [weeklyWorkouts, setWeeklyWorkouts] = useState(0);
  const { currentDate } = useDate();
  const [todaysSession, setTodaysSession] = useState("");
  const [sessionCacheBuster, setSessionCacheBuster] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [exercises, setExercises] = useState([]);

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

  // Fetch workout timeline data and today's session whenever currentDate changes
  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const timelineData = await getWorkoutTimeline();
        if (timelineData && timelineData.exercises) {
          setExercises(timelineData.exercises);
        } else {
          setExercises([]);
        }
      } catch (error) {
        console.error('Error fetching timeline:', error);
        setExercises([]);
        // Optionally set an error state to display in the UI
      }
    };
    fetchTimeline();
    // Also update today's session
    const fetchTodaysSession = async () => {
      const cacheKey = createCacheKey("todays_session", currentDate);
      const timestampKey = createCacheKey("todays_session_timestamp", currentDate);
      await clearCache(cacheKey);
      await clearCache(timestampKey);
      let sessionTitle = "";
      try {
        const timelineData = await getWorkoutTimeline();
        if (timelineData && timelineData.exercises) {
          const incompleteWorkouts = timelineData.exercises
            .filter(ex => ex.completionStatus === "incomplete")
            .sort((a, b) => new Date(a.date) - new Date(b.date));
          if (incompleteWorkouts.length > 0) {
            sessionTitle = incompleteWorkouts[0].workoutTitle || "";
          }
        }
      } catch (error) {
        console.error("Error fetching timeline:", error);
      }
      await saveToCache(cacheKey, timestampKey, sessionTitle);
      setTodaysSession(sessionTitle);
    };
    fetchTodaysSession();
  }, [currentDate]);

  // Add useFocusEffect to refresh stats when returning to screen
  useFocusEffect(
    React.useCallback(() => {
      const fetchUserStats = async () => {
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, "UserDetails", user.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setTotalCalories(data.totalCalories || 0);
            setWeeklyWorkouts(data.streak || 0);
            setBestStreak(data.bestStreak || 0);
          }
        }
      };

      fetchUserStats();
    }, [])
  );

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
        // Refresh user stats when date changes
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, "UserDetails", user.uid);
          const docSnap = await getDoc(userRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setTotalCalories(data.totalCalories || 0);
            setWeeklyWorkouts(data.streak || 0);
          }
        }
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

  const today = useMemo(() => {
    // Create a new date object from the currentDate string
    const [year, month, day] = currentDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    // Set to midnight in local timezone
    date.setHours(0, 0, 0, 0);
    console.log('HomeScreen - Current date from context:', currentDate);
    console.log('HomeScreen - Parsed date:', date.toISOString());
    return date;
  }, [currentDate]);

  const weekDays = useMemo(() => {
    const days = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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
    console.log('HomeScreen - Week days:', days.map(d => `${d.day} ${d.date}`));
    return days;
  }, [today]);

  const isToday = (date) => {
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    const todayDate = new Date(today);
    todayDate.setHours(0, 0, 0, 0);
    
    console.log('HomeScreen - Comparing dates:', {
      compareDate: compareDate.toISOString(),
      todayDate: todayDate.toISOString(),
      isMatch: compareDate.getTime() === todayDate.getTime()
    });
    
    return compareDate.getTime() === todayDate.getTime();
  };

  const isSelectedDay = (date) => {
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    const selectedDate = new Date(currentDate);
    selectedDate.setHours(0, 0, 0, 0);
    return compareDate.getTime() === selectedDate.getTime();
  };

  const showCalendar = () => setCalendarVisible(true);
  const hideCalendar = () => setCalendarVisible(false);
  const handleConfirm = (date) => {
    setSelectedDate(date);
    hideCalendar();
    console.log("Selected date:", date);
  };

  // Expose a function to trigger a session refetch after plan shift
  const triggerSessionRefetch = () => setSessionCacheBuster((b) => b + 1);

  useFocusEffect(
    React.useCallback(() => {
      // Re-fetch or re-set state here
      setSelectedDate(currentDate);
      // Optionally trigger any other refresh logic
    }, [currentDate])
  );

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
            onPress={() => navigation.navigate("Settings")}
          >
            <Ionicons name="settings" size={24} color="#FFFFFF" />
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
              isSelectedDay(item.fullDate) && styles.selectedDayContainer,
            ]}
            onPress={() => navigation.navigate("WorkoutCalendar")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.dayText,
                isSelectedDay(item.fullDate) && styles.selectedDayText,
              ]}
            >
              {item.date}
            </Text>
            <Text
              style={[
                styles.dayLabel,
                isSelectedDay(item.fullDate) && styles.selectedDayText,
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
        onPress={() => navigation.navigate("Workout")}
      >
        <Image
          source={require("../assets/weights3.jpg")}
          style={styles.cardBackground}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.5)"]}
          style={styles.cardGradient}
        >
          <View style={styles.cardContentRow}>
            <View style={styles.cardContentColumn}>
              <View style={styles.titleRow}>
                <Text style={styles.cardTitle}>Workout</Text>
                <Ionicons
                  name="chevron-forward"
                  size={25}
                  color="white"
                  style={styles.chevronIcon}
                />
              </View>
              {todaysSession ? (
                <View style={styles.sessionRow}>
                  <Text style={styles.sessionLabel}>Upcoming Workout:</Text>
                  <Text style={styles.sessionValue}> {todaysSession}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("DietScreen")}
      >
        <Image
          source={require("../assets/food.jpg")}
          style={styles.cardBackground}
          resizeMode="cover"
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.5)"]}
          style={styles.cardGradient}
        >
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Meal Planner</Text>
            <Ionicons name="chevron-forward" size={24} color="white" />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Statistics Stat Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons name="trending-up" size={22} color="#fff" style={{ marginRight: 8 }} />
            <Text style={[styles.statLabel, { color: '#fff', fontWeight: '600', fontSize: 15 }]}>Streak Counter</Text>
          </View>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 28, marginBottom: 2, letterSpacing: 0.5 }}>
            {weeklyWorkouts} <Text style={{ fontSize: 18, fontWeight: '400', color: '#bbb' }}>days</Text>
          </Text>
          <Text style={{ color: '#bbb', fontSize: 15, fontWeight: '500', marginTop: 2 }}>
            Best Streak: <Text style={{ color: '#bbb', fontWeight: '600' }}>{bestStreak}</Text> days
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalCalories}</Text>
          <Text style={styles.statLabel}>Calorie Tracker</Text>
        </View>
      </View>

      {/* My Progress Panel */}
      <ProgressBar onPress={() => navigation.navigate("WorkoutHistory")} />

      {/* Test Buttons */}
      {/**
      <View style={styles.testButtonsContainer}>
        <TouchableOpacity
          style={styles.testButton}
          onPress={async () => {
            await resetStreakCounter();
            navigation.navigate("TestWorkoutTimeline");
            // Refresh stats after reset
            const user = auth.currentUser;
            if (user) {
              const userRef = doc(db, "UserDetails", user.uid);
              const docSnap = await getDoc(userRef);
              if (docSnap.exists()) {
                const data = docSnap.data();
                setWeeklyWorkouts(data.streak || 0);
              }
            }
          }}
        >
          <Text style={styles.testButtonText}>Test Workout Timeline</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          onPress={async () => {
            await testRunDailyTask();
            triggerSessionRefetch();
          }}
        >
          <Text style={styles.testButtonText}>Test Date Shift</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          onPress={async () => {
            await resetStreakCounter();
            // Refresh stats after reset
            const user = auth.currentUser;
            if (user) {
              const userRef = doc(db, "UserDetails", user.uid);
              const docSnap = await getDoc(userRef);
              if (docSnap.exists()) {
                const data = docSnap.data();
                setWeeklyWorkouts(data.streak || 0);
              }
            }
          }}
        >
          <Text style={styles.testButtonText}>Reset Streak Counter</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          onPress={() => {
            const userId = auth.currentUser?.uid;
            console.log("Current User ID:", userId);
          }}
        >
          <Text style={styles.testButtonText}>Print User ID</Text>
        </TouchableOpacity>
      </View>
      **/}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  backButton: {
    position: "absolute",
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
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  welcomeContainer: {
    alignItems: "center",
  },
  welcomeText: {
    color: "#FFFFFF",
    fontSize: 15.6,
    fontWeight: "600",
    textAlign: "center",
    paddingVertical: 20,
  },
  profileButton: {
    position: "absolute",
    right: 0,
  },
  calendarStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 50,
    marginBottom: 20,
  },
  dayContainer: {
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
  },
  selectedDayContainer: {
    backgroundColor: "#E4FA00",
  },
  dayText: {
    color: "#89868A",
    fontSize: 16,
    fontWeight: "500",
  },
  dayLabel: {
    color: "#89868A",
    fontSize: 12,
    marginTop: 4,
  },
  selectedDayText: {
    color: "#000000",
  },
  card: {
    height: 160,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    overflow: "hidden",
  },
  cardBackground: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  cardGradient: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  cardContentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
    paddingRight: 8,
  },
  cardContentColumn: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    paddingVertical: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
  },
  sessionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 12,
    flexWrap: "nowrap",
  },
  sessionLabel: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
  },
  sessionValue: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "400",
    marginLeft: 4,
    letterSpacing: 1,
    minWidth: 0,
  },
  chevronIcon: {
    marginLeft: 12,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 8,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 20,
  },
  statNumber: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 5,
  },
  statLabel: {
    color: "#8E8E93",
    fontSize: 14,
  },
  testButtonsContainer: {
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  testButton: {
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  testButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default HomeScreen;
