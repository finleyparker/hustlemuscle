import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../database/firebase';  
import { collection, query, where, getDocs } from 'firebase/firestore';
import { formatPlanName, formatDurationWeeks, formatCreatedAt, formatPlan, extractDaysFromPlan, formatPlanDaysWithExercises, formatDayOfWeek } from '../utils/planFormatters';

const WorkoutCalendarScreen = ({ navigation }) => {
  const [selected, setSelected] = useState('');
  const [showWorkoutDetails, setShowWorkoutDetails] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [planName, setPlanName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [days, setDays] = useState('');
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [durationWeeks, setDurationWeeks] = useState('');
  
  const hasFetchedData = useRef(false);

  const fetchWorkoutPlans = useMemo(() => async () => {
    setIsLoading(true);
    const userId = auth.currentUser && auth.currentUser.uid;

    const workoutPlansRef = collection(db, "workoutPlans");
    const q = query(workoutPlansRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const data = querySnapshot.docs[0].data();
      const formattedData = {
        startDate: formatCreatedAt(data.createdAt),
        endDate: formatCreatedAt(data.createdAt, data.durationWeeks),
        planName: formatPlanName(data.planName),
        days: formatPlanDaysWithExercises(data.plan),
        daysOfWeek: formatDayOfWeek(data.plan),
        durationWeeks: formatDurationWeeks(data.durationWeeks)
      };
      
      setStartDate(formattedData.startDate);
      setEndDate(formattedData.endDate);
      setPlanName(formattedData.planName);
      setDays(formattedData.days);
      setDaysOfWeek(formattedData.daysOfWeek);
      setDurationWeeks(formattedData.durationWeeks);
    } else {
      const emptyData = {
        startDate: 'No plans found',
        endDate: 'No date',
        planName: 'No plan',
        days: [],
        daysOfWeek: [],
        durationWeeks: 0
      };
      setStartDate(emptyData.startDate);
      setEndDate(emptyData.endDate);
      setPlanName(emptyData.planName);
      setDays(emptyData.days);
      setDaysOfWeek(emptyData.daysOfWeek);
      setDurationWeeks(emptyData.durationWeeks);
    }
    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchWorkoutPlans();
  }, [fetchWorkoutPlans]);
  
  console.log('DAYS:', days);
  console.log('DAYS OF WEEK:', daysOfWeek);
  console.log('DURATION WEEKS:', durationWeeks);

  // Workout details for each type
  const workoutDetails = {
    push: [
      { name: 'Bench Press', sets: '4', reps: '8-10' },
      { name: 'Overhead Press', sets: '4', reps: '8-10' },
      { name: 'Incline Dumbbell Press', sets: '3', reps: '10-12' },
      { name: 'Lateral Raises', sets: '3', reps: '12-15' },
      { name: 'Tricep Pushdowns', sets: '3', reps: '12-15' },
    ],
    pull: [
      { name: 'Pull-ups', sets: '4', reps: '8-10' },
      { name: 'Barbell Rows', sets: '4', reps: '8-10' },
      { name: 'Face Pulls', sets: '3', reps: '12-15' },
      { name: 'Bicep Curls', sets: '3', reps: '10-12' },
      { name: 'Hammer Curls', sets: '3', reps: '10-12' },
    ],
    legs: [
      { name: 'Squats', sets: '4', reps: '8-10' },
      { name: 'Romanian Deadlifts', sets: '4', reps: '8-10' },
      { name: 'Leg Press', sets: '3', reps: '10-12' },
      { name: 'Leg Extensions', sets: '3', reps: '12-15' },
      { name: 'Calf Raises', sets: '4', reps: '15-20' },
    ],
  };

  // No hardcoded workoutDates or modal logic
  const handleDayPress = (day) => {
    setSelected(day.dateString);
  };

  const dayNameToIndex = {
    Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
    Thursday: 4, Friday: 5, Saturday: 6
  };

  function getMarkedDates(daysOfWeek, durationWeeks) {
    const today = new Date();
    const marked = {};

    daysOfWeek.forEach(dayName => {
      const dayIndex = dayNameToIndex[dayName];
      // Find the next occurrence of this day
      let firstDate = new Date(today);
      const diff = (dayIndex - today.getDay() + 7) % 7;
      firstDate.setDate(today.getDate() + diff);

      // Mark this day for each week
      for (let week = 0; week < durationWeeks; week++) {
        const d = new Date(firstDate);
        d.setDate(firstDate.getDate() + week * 7);
        const key = d.toISOString().split('T')[0];
        marked[key] = {
          marked: true,
          dotColor: '#ff5e69',
          selected: true,
          selectedColor: '#ff5e69'
        };
      }
    });

    return marked;
  }

  const markedDates = getMarkedDates(daysOfWeek, durationWeeks);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLoading ? 'Loading...' : planName}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
        <Text style={styles.label}>Start Date:</Text>
        {isLoading ? (
          <ActivityIndicator size="small" color="#aaa" style={{ marginLeft: 8 }} />
        ) : (
          <Text style={[styles.label, { marginLeft: 8 }]}>{startDate}</Text>
        )}
      </View>
      
      

      <Text style={styles.label}>Projected End Date:</Text>

      <View style={styles.calendarContainer}>
        <Calendar
          theme={{
            backgroundColor: '#18181A',
            calendarBackground: '#18181A',
            textSectionTitleColor: '#aaa',
            selectedDayBackgroundColor: '#ff5e69',
            selectedDayTextColor: '#fff',
            todayTextColor: '#E3FA05',
            dayTextColor: '#fff',
            textDisabledColor: '#444',
            monthTextColor: '#fff',
            arrowColor: '#fff',
            textDayFontWeight: '400',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '600',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14,
          }}
          onDayPress={handleDayPress}
          hideExtraDays={true}
          markedDates={markedDates}
        />
      </View>

      {/* Display formatted plan days string */}
      <Text style={styles.sectionTitle}>Workout Schedule</Text>
      {days && Array.isArray(days) && days.length > 0 && (
        <ScrollView style={{ marginTop: 24, backgroundColor: '#18181A', borderRadius: 12, padding: 16, maxHeight: 200 }}>
          {days.map((line, idx) => (
            <Text key={idx} style={{ color: '#808080', fontFamily: 'monospace', marginBottom: 12 }}>{line}</Text>
          ))}
        </ScrollView>
      )}
      {days && typeof days === 'string' && days.length > 0 && (
        <View style={{ marginTop: 24, backgroundColor: '#18181A', borderRadius: 12, padding: 16 }}>
          <Text style={{ color: '#fff', fontFamily: 'monospace' }}>{days}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  title: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    marginTop: 8,
  },
  label: {
    color: '#aaa',
    fontSize: 15,
    marginBottom: 4,
  },
  sectionTitle: {
    color: '#AAA',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
  },
  calendarContainer: {
    backgroundColor: '#18181A',
    borderRadius: 16,
    padding: 8,
    marginTop: 24,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#18181A',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  exercisesList: {
    marginTop: 10,
  },
  exerciseItem: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  exerciseName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  exerciseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exerciseSets: {
    color: '#aaa',
    fontSize: 16,
  },
  exerciseReps: {
    color: '#aaa',
    fontSize: 16,
  },
});

export default WorkoutCalendarScreen; 