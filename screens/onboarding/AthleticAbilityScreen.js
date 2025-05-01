import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AthleticAbilityScreen = ({ navigation }) => {
  const [selectedGoal, setSelectedGoal] = useState(null);

  const handleGoalSelect = (goal) => {
    setSelectedGoal(goal);
    // Navigate to home screen after a short delay
    setTimeout(() => {
      navigation.navigate('Home');
    }, 300);
  };

  const GoalButton = ({ goal }) => (
    <TouchableOpacity
      style={[
        styles.goalButton,
        selectedGoal === goal && styles.selectedGoalButton,
      ]}
      onPress={() => handleGoalSelect(goal)}
    >
      <Text style={[
        styles.goalButtonText,
        selectedGoal === goal && styles.selectedGoalButtonText,
      ]}>
        {goal}
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
        <Text style={styles.metricText}>Starting Metric #3</Text>
        <Text style={styles.titleText}>Athletic Ability</Text>
        <Text style={styles.subtitleText}>Select your performance goals.</Text>

        <View style={styles.goalsContainer}>
          <GoalButton goal="Increase Strength" />
          <GoalButton goal="Increase Endurance / Stamina" />
          <GoalButton goal="Improve Mobility / Flexibility" />
        </View>
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
  goalsContainer: {
    gap: 16,
  },
  goalButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  selectedGoalButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  goalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  selectedGoalButtonText: {
    color: '#000000',
  },
});

export default AthleticAbilityScreen; 