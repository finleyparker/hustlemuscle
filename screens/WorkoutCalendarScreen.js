import React, { useState, useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../database/firebase';  
import { collection, query, where, getDocs } from 'firebase/firestore';
import { formatPlanName, formatDurationWeeks, formatCreatedAt, formatPlan, extractDaysFromPlan, formatPlanDaysWithExercises, formatDayOfWeek } from '../utils/planFormatters';
import { getWorkoutTimeline } from '../database/WorkoutTimeline';
import { useFocusEffect } from '@react-navigation/native';
import { useDate } from '../context/DateContext';

export const getTodaysWorkout = (exercises, currentDate) => {
  console.log('Looking for workout on date:', currentDate);
  console.log('Available exercises:', JSON.stringify(exercises, null, 2));
  console.log('Exercise dates:', exercises.map(e => e.date));
  const dayExercises = exercises.find(e => {
    console.log('Comparing:', { exerciseDate: e.date, currentDate });
    return e.date === currentDate;
  });
  console.log('Found day exercises:', dayExercises);
  return dayExercises ? {
    exercises: dayExercises.exercises,
    day: dayExercises.workoutTitle || 'Workout'
  } : { exercises: [], day: '' };
};

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
  const [selectedDayExercises, setSelectedDayExercises] = useState([]);
  const { currentDate } = useDate();
  
  const hasFetchedData = useRef(false);

  const fetchTimeline = useMemo(() => async () => {
    console.log("Fetching timeline data...");
    setIsLoading(true);
    try {
      const timelineData = await getWorkoutTimeline();
      console.log("Timeline data received:", timelineData);
      
      if (timelineData) {
        setExercises(timelineData.exercises);
        
        // Create marked dates with only selected for the selected day
        const updatedMarkedDates = {};
        timelineData.exercises.forEach(exercise => {
          updatedMarkedDates[exercise.date] = {
            completionStatus: exercise.completionStatus
          };
        });
        // Only set selected for the selected day
        if (selected) {
          updatedMarkedDates[selected] = {
            ...updatedMarkedDates[selected],
            
            selected: true
          };
        }
        setMarkedDates(updatedMarkedDates);
        
        // Set initial selected date to current date from context
        setSelected(currentDate);
        
        // Find exercises for the current date
        const currentDayExercises = timelineData.exercises.find(
          ex => ex.date === currentDate
        );
        if (currentDayExercises) {
          setSelectedDayExercises(currentDayExercises.exercises);
        }

        // Set start and end dates
        if (timelineData.exercises.length > 0) {
          const dates = timelineData.exercises.map(e => new Date(e.date));
          const start = new Date(Math.min(...dates));
          const end = new Date(Math.max(...dates));
          setStartDate(start.toISOString().split('T')[0]);
          setEndDate(end.toISOString().split('T')[0]);
        }

        // Set plan name
        setPlanName('Workout Calendar');
      }
    } catch (error) {
      console.error("Error fetching timeline:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentDate, selected]);

  // Add useFocusEffect to refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('Screen focused, current date:', currentDate);
      fetchTimeline();
    }, [currentDate])
  );

  // Memoize markedDates to ensure calendar updates
  const computedMarkedDates = useMemo(() => {
    const newMarked = { ...markedDates };
    if (selected) {
      newMarked[selected] = {
        ...(markedDates[selected] || {}),
        selected: true,
        selectedColor: '#ff5e69',
        selectedTextColor: '#fff',
      };
    }
    if (currentDate) {
      newMarked[currentDate] = {
        ...(markedDates[currentDate] || {}),
        today: true,
        selected: true, // Make sure current date is always selected
        selectedColor: '#ff5e69',
        selectedTextColor: '#fff',
      };
    }
    console.log('Calendar Render - selected:', selected, 'currentDate:', currentDate, 'computedMarkedDates:', newMarked);
    return newMarked;
  }, [markedDates, selected, currentDate]);

  const onDayPress = (day) => {
    console.log('Day pressed:', day.dateString);
    setSelected(day.dateString);
    const selectedExercises = exercises.find(ex => ex.date === day.dateString);
    if (selectedExercises) {
      setSelectedDayExercises(selectedExercises.exercises);
      setShowWorkoutDetails(true);
    }
  };

  const ExerciseCard = ({ exercise }) => (
    <View style={styles.exerciseCard}>
      <Text style={styles.exerciseName}>{exercise.exerciseName}</Text>
      <View style={styles.exerciseDetails}>
        <View style={styles.exerciseDetail}>
          <Text style={styles.detailLabel}>Sets</Text>
          <Text style={styles.detailValue}>{exercise.suggestedSets}</Text>
        </View>
        <View style={styles.exerciseDetail}>
          <Text style={styles.detailLabel}>Reps</Text>
          <Text style={styles.detailValue}>{exercise.suggestedReps}</Text>
        </View>
        <View style={styles.exerciseDetail}>
          <Text style={styles.detailLabel}>Rest</Text>
          <Text style={styles.detailValue}>{exercise.restTime}</Text>
        </View>
      </View>
    </View>
  );

  useFocusEffect(
    React.useCallback(() => {
      setSelected(currentDate);
    }, [currentDate])
  );

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
          current={currentDate}
          onDayPress={onDayPress}
          hideExtraDays={true}
          markingType="custom"
          markedDates={markedDates}
          dayComponent={({ date, state }) => {
            const dateString = date.dateString;
            const isCompleted = markedDates[dateString]?.completionStatus === 'complete';
            const isSelected = dateString === currentDate;
            const isWorkoutDay = dateString in markedDates;
            const todayStr = new Date().toISOString().split('T')[0];
            const isToday = dateString === todayStr;

            let dayContent = (
              <Text
                style={{
                  color: isSelected ? '#fff' : isCompleted ? '#4CAF50' : isWorkoutDay ? '#fff' : '#888',
                  fontWeight: isSelected ? 'bold' : 'normal',
                  fontSize: 16,
                  opacity: isWorkoutDay ? 1 : 0.5,
                }}
              >
                {date.day}
              </Text>
            );

            // Red circle for incomplete workout days
            if (isWorkoutDay && !isCompleted) {
              dayContent = (
                <View
                  style={{
                    backgroundColor: '#ff5e69',
                    borderRadius: 16,
                    width: 32,
                    height: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: '#fff',
                      fontWeight: isSelected ? 'bold' : 'normal',
                      fontSize: 16,
                    }}
                  >
                    {date.day}
                  </Text>
                </View>
              );
            }

            // Green checkmark for completed workout days
            if (isCompleted) {
              dayContent = (
                <View style={{ alignItems: 'center', justifyContent: 'center', height: 32, width: 32 }}>
                  <Text
                    style={{
                      color: '#4CAF50',
                      fontWeight: isSelected ? 'bold' : 'normal',
                      fontSize: 16,
                    }}
                  >
                    {date.day}
                  </Text>
                  <View style={{ position: 'absolute', bottom: -2, right: -2 }}>
                    <Ionicons name="checkmark-circle" size={12} color="#4CAF50" />
                  </View>
                </View>
              );
            }

            // Highlight selected date (from context) with a yellow border
            let content = dayContent;
            if (isSelected) {
              content = (
                <View
                  style={{
                    borderColor: '#E3FA05',
                    borderWidth: 2,
                    borderRadius: 16,
                    padding: 2,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {dayContent}
                </View>
              );
            }

            if (isWorkoutDay) {
              return (
                <TouchableOpacity onPress={() => onDayPress({ dateString })} activeOpacity={0.7}>
                  {content}
                </TouchableOpacity>
              );
            }
            return content;
          }}
          enableSwipeMonths={true}
          minDate={startDate}
          maxDate={endDate}
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

      {/* Exercise Details Modal */}
      <Modal
        visible={showWorkoutDetails}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowWorkoutDetails(false)}
      >
        <View style={styles.modalContainer}>
        
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selected ? new Date(selected).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : ''}
              </Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowWorkoutDetails(false)}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.exercisesList}>
              {selectedDayExercises.map((exercise, index) => (
                <ExerciseCard key={index} exercise={exercise} />
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  exerciseCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  exerciseName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  exerciseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exerciseDetail: {
    alignItems: 'center',
  },
  detailLabel: {
    color: '#8E8E93',
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default WorkoutCalendarScreen; 