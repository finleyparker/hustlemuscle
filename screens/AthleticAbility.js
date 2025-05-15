import React, { use, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../database/firebase';  // adjust if needed
import { doc, setDoc } from 'firebase/firestore';

const AthleticAbilityScreen = ({ navigation }) => {
  const [selectedGoal, setSelectedGoal] = useState(null);

  const handleGoalSelect = (goal) => {
    setSelectedGoal(goal);
  };

  const handleNext = async () => {
    if (!selectedGoal) return;

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error('No user is signed in');
        return;
      }

      await setDoc(doc(db, 'UserDetails', userId), {
        AthleticGoal: selectedGoal
      }, { merge: true });

      navigation.navigate('Equipment');
    } catch (error) {
      console.error('Error saving athletic goal:', error);
    }
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

        <TouchableOpacity
          style={[
            styles.nextButton,
            !selectedGoal && styles.nextButtonDisabled
          ]}
          onPress={handleNext}
          disabled={!selectedGoal}
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

export default AthleticAbilityScreen; 