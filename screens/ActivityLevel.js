import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../database/firebase';
import { doc, setDoc } from 'firebase/firestore';

const ActivityLevelScreen = ({ navigation }) => {
  const [selectedLevel, setSelectedLevel] = useState(null);

  const activityLevels = [
    {
      label: 'Extremely Active',
      description: 'Exercise 6+ days a week'
    },
    {
      label: 'Active',
      description: 'Exercise 4-5 days a week'
    },
    {
      label: 'Moderate',
      description: 'Exercise 2-3 days a week'
    },
    {
      label: 'Mildly Active',
      description: 'Exercise 1 day a week'
    },
    {
      label: 'Not Active',
      description: 'Little to no exercise'
    }
  ];

  const handleLevelSelect = (level) => {
    setSelectedLevel(level);
  };

  const handleNext = async () => {
    if (!selectedLevel) return;

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error('No user is signed in');
        return;
      }

      await setDoc(doc(db, 'UserDetails', userId), {
        ActivityLevel: selectedLevel
      }, { merge: true });

      navigation.navigate('FreeDays');
    } catch (error) {
      console.error('Error saving activity level:', error);
    }
  };

  const LevelButton = ({ level }) => (
    <TouchableOpacity
      style={[
        styles.levelButton,
        selectedLevel === level.label && styles.selectedLevelButton,
      ]}
      onPress={() => handleLevelSelect(level.label)}
    >
      <Text style={[
        styles.levelButtonText,
        selectedLevel === level.label && styles.selectedLevelButtonText,
      ]}>
        {level.label}
      </Text>
      <Text style={[
        styles.levelDescription,
        selectedLevel === level.label && styles.selectedLevelDescription,
      ]}>
        {level.description}
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
        <Text style={styles.metricText}>Starting Metric #5</Text>
        <Text style={styles.titleText}>Activity Level</Text>
        <Text style={styles.subtitleText}>How often do you exercise?</Text>

        <View style={styles.levelsContainer}>
          {activityLevels.map((level, index) => (
            <LevelButton key={index} level={level} />
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.nextButton,
            !selectedLevel && styles.nextButtonDisabled
          ]}
          onPress={handleNext}
          disabled={!selectedLevel}
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
  levelsContainer: {
    gap: 16,
  },
  levelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  selectedLevelButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  levelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  selectedLevelButtonText: {
    color: '#000000',
  },
  levelDescription: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.7,
  },
  selectedLevelDescription: {
    color: '#000000',
    opacity: 0.7,
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

export default ActivityLevelScreen; 