import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../database/firebase';  
import { collection, query, where, getDocs } from 'firebase/firestore';
import { formatPlanName, formatDurationWeeks, formatCreatedAt, formatPlan, extractDaysFromPlan, formatPlanDaysWithExercises, formatDayOfWeek } from '../utils/planFormatters';
import getWorkoutTimeline from '../database/WorkoutTimeline';

const WorkoutCalendarScreen = ({ navigation }) => {
  const [selected, setSelected] = useState('');
  const [showWorkoutDetails, setShowWorkoutDetails] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [planName, setPlanName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [days, setDays] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  const [exercises, setExercises] = useState([]);
  
  const hasFetchedData = useRef(false);

  const fetchTimeline = useMemo(() => async () => {
    setIsLoading(true);
    try {
      const timelineData = await getWorkoutTimeline();
      
      if (timelineData) {
        setMarkedDates(timelineData.markedDates);
        setExercises(timelineData.exercises);
        
        // Format the exercises for display
        const formattedDays = timelineData.exercises.map(exercise => {
          const date = new Date(exercise.id);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
          return `${dayName} (${exercise.id}): ${exercise.exercises.length} exercises`;
        });
        
        setDays(formattedDays);
        setPlanName('Workout Calendar');
        
        // Set start and end dates from the exercises array
        if (timelineData.exercises.length > 0) {
          const dates = timelineData.exercises.map(e => new Date(e.id));
          const start = new Date(Math.min(...dates));
          const end = new Date(Math.max(...dates));
          setStartDate(start.toLocaleDateString());
          setEndDate(end.toLocaleDateString());
        }
      } else {
        setDays([]);
        setMarkedDates({});
        setExercises([]);
        setPlanName('No Timeline Found');
        setStartDate('No start date');
        setEndDate('No end date');
      }
    } catch (error) {
      console.error('Error fetching timeline:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimeline();
  }, [fetchTimeline]);

  const handleDayPress = (day) => {
    setSelected(day.dateString);
    // Find the exercises for this day
    const dayExercises = exercises.find(e => e.id === day.dateString);
    if (dayExercises) {
      setShowWorkoutDetails(true);
      // You can add logic here to show the exercises in a modal
    }
  };

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

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
        <Text style={styles.label}>End Date:</Text>
        {isLoading ? (
          <ActivityIndicator size="small" color="#aaa" style={{ marginLeft: 8 }} />
        ) : (
          <Text style={[styles.label, { marginLeft: 8 }]}>{endDate}</Text>
        )}
      </View>

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