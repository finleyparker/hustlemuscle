import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { updateFreeDays } from '../database/UserDB';

const FreeDaysPerWeekScreen = ({ navigation }) => {
  const [selectedDays, setSelectedDays] = useState(0);

  const handleDaySelect = (days) => {
    setSelectedDays(days);
  };
  
  const handleNext = async () => {
    if (selectedDays === 0) return;
    
    try {
      await updateFreeDays(selectedDays);
      navigation.navigate('DietaryRestrictions');
    } catch (error) {
      console.error('Error saving workout days:', error);
    }
  };
  
  const DayButton = ({ days }) => (
    <TouchableOpacity
      style={[
        styles.dayButton,
        selectedDays === days && styles.selectedDayButton,
      ]}
      onPress={() => handleDaySelect(days)}
    >
      <Text style={[
        styles.dayButtonText,
        selectedDays === days && styles.selectedDayButtonText,
      ]}>
        {days} {days === 1 ? 'Day' : 'Days'}
      </Text>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={styles.contentContainer}>
        <Text style={styles.metricText}>Starting Metric #6</Text>
        <Text style={styles.titleText}>Workout Schedule</Text>
        <Text style={styles.subtitleText}>How many days per week can you workout?</Text>

        <ScrollView>
          <View style={styles.daysContainer}>
            <DayButton days={3} />
            <DayButton days={4} />
            <DayButton days={5} />
          </View>
        </ScrollView>
        
        <TouchableOpacity 
          style={[
            styles.nextButton,
            selectedDays === 0 && styles.nextButtonDisabled
          ]}
          onPress={handleNext}
          disabled={selectedDays === 0}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backButton: {
    padding: 16,
    position: 'absolute',
    top: 60,
    left: 10,
    zIndex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 120,
  },
  metricText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
    opacity: 0.7,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitleText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 40,
    opacity: 0.7,
  },
  daysContainer: {
    gap: 16,
    marginBottom: 20,
  },
  dayButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  selectedDayButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  dayButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  selectedDayButtonText: {
    color: '#000000',
  },
  nextButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 40,
  },
  nextButtonDisabled: {
    backgroundColor: '#333333',
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FreeDaysPerWeekScreen;  
  