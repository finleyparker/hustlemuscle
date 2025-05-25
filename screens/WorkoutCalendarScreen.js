import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';

const WorkoutCalendarScreen = ({ navigation }) => {
  const [selected, setSelected] = useState('');
  const [showWorkoutDetails, setShowWorkoutDetails] = useState(false);

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

  // Get current week's dates
  const workoutDates = useMemo(() => {
    const today = new Date();
    const dates = {};
    
    // Get Monday of current week
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    
    // Add Push day (Monday)
    const pushDate = monday.toISOString().split('T')[0];
    dates[pushDate] = {
      selected: false,
      marked: true,
      dotColor: '#ff5e69',
      selectedColor: '#ff5e69',
      type: 'push',
      customStyles: {
        container: {
          backgroundColor: '#ff5e69',
          borderRadius: 8,
        },
        text: {
          color: 'white',
          fontWeight: 'bold',
        },
      },
    };

    // Add Pull day (Wednesday)
    const wednesday = new Date(monday);
    wednesday.setDate(monday.getDate() + 2);
    const pullDate = wednesday.toISOString().split('T')[0];
    dates[pullDate] = {
      selected: false,
      marked: true,
      dotColor: '#4CAF50',
      selectedColor: '#4CAF50',
      type: 'pull',
      customStyles: {
        container: {
          backgroundColor: '#4CAF50',
          borderRadius: 8,
        },
        text: {
          color: 'white',
          fontWeight: 'bold',
        },
      },
    };

    // Add Legs day (Friday)
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);
    const legsDate = friday.toISOString().split('T')[0];
    dates[legsDate] = {
      selected: false,
      marked: true,
      dotColor: '#2196F3',
      selectedColor: '#2196F3',
      type: 'legs',
      customStyles: {
        container: {
          backgroundColor: '#2196F3',
          borderRadius: 8,
        },
        text: {
          color: 'white',
          fontWeight: 'bold',
        },
      },
    };

    return dates;
  }, []);

  const handleDayPress = (day) => {
    setSelected(day.dateString);
    if (workoutDates[day.dateString]) {
      setShowWorkoutDetails(true);
    }
  };

  const getWorkoutType = () => {
    return workoutDates[selected]?.type || '';
  };

  const renderWorkoutDetails = () => {
    const type = getWorkoutType();
    const exercises = workoutDetails[type] || [];

    return (
      <Modal
        visible={showWorkoutDetails}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowWorkoutDetails(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {type.charAt(0).toUpperCase() + type.slice(1)} Day Workout
              </Text>
              <TouchableOpacity
                onPress={() => setShowWorkoutDetails(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.exercisesList}>
              {exercises.map((exercise, index) => (
                <View key={index} style={styles.exerciseItem}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <View style={styles.exerciseDetails}>
                    <Text style={styles.exerciseSets}>Sets: {exercise.sets}</Text>
                    <Text style={styles.exerciseReps}>Reps: {exercise.reps}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>3-Day a Week Muscle Gain Program</Text>
      <Text style={styles.label}>Start Date:</Text>
      <Text style={styles.label}>Projected End Date:</Text>

      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#ff5e69' }]} />
          <Text style={styles.legendText}>Push</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Pull</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#2196F3' }]} />
          <Text style={styles.legendText}>Legs</Text>
        </View>
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
          markedDates={{
            ...workoutDates,
            [selected]: { 
              ...workoutDates[selected],
              selected: true,
            },
          }}
          hideExtraDays={true}
        />
      </View>
      {renderWorkoutDetails()}
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
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    color: '#fff',
    fontSize: 14,
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