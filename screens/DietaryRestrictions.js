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
import { db, auth } from '../database/firebase';
import { doc, setDoc } from 'firebase/firestore';

const DietaryRestrictionsScreen = ({ navigation }) => {
  const [selectedRestrictions, setSelectedRestrictions] = useState([]);

  const dietaryOptions = [
    {
      label: 'None',
      description: 'No dietary restrictions'
    },
    {
      label: 'Vegetarian',
      description: 'No meat products'
    },
    {
      label: 'Vegan',
      description: 'No animal products'
    },
    {
      label: 'Dairy Free',
      description: 'No dairy products'
    },
    {
      label: 'Celiac',
      description: 'No gluten'
    },
    {
      label: 'Pescatarian',
      description: 'Fish but no other meat'
    }
  ];

  const handleRestrictionSelect = (restriction) => {
    setSelectedRestrictions(prev => {
      // If "None" is selected, clear all other selections
      if (restriction === 'None') {
        return 'None';
      }
      
      // If selecting something else, remove "None"
      let newSelection = prev.filter(r => r !== 'None');
      
      // Toggle the selected restriction
      if (newSelection.includes(restriction)) {
        newSelection = newSelection.filter(r => r !== restriction);
      } else {
        newSelection = [...newSelection, restriction];
      }
      
      // If nothing is selected, add "None"
      return newSelection.length === 0 ? ['None'] : newSelection;
    });
  };

  const handleNext = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error('No user is signed in');
        return;
      }

      await setDoc(doc(db, 'UserDetails', userId), {
        dietRestriction: selectedRestrictions
      }, { merge: true });

      navigation.navigate('Equipment');
    } catch (error) {
      console.error('Error saving dietary restrictions:', error);
    }
  };

  const RestrictionButton = ({ option }) => (
    <TouchableOpacity
      style={[
        styles.restrictionButton,
        selectedRestrictions.includes(option.label) && styles.selectedRestrictionButton,
      ]}
      onPress={() => handleRestrictionSelect(option.label)}
    >
      <View style={styles.checkboxContainer}>
        <View style={[
          styles.checkbox,
          selectedRestrictions.includes(option.label) && styles.checkboxSelected
        ]}>
          {selectedRestrictions.includes(option.label) && (
            <Ionicons name="checkmark" size={20} color="#000000" />
          )}
        </View>
      </View>
      <View style={styles.textContainer}>
        <Text style={[
          styles.restrictionButtonText,
          selectedRestrictions.includes(option.label) && styles.selectedRestrictionButtonText,
        ]}>
          {option.label}
        </Text>
        <Text style={[
          styles.restrictionDescription,
          selectedRestrictions.includes(option.label) && styles.selectedRestrictionDescription,
        ]}>
          {option.description}
        </Text>
      </View>
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

      <ScrollView style={styles.scrollView}>
        <View style={styles.contentContainer}>
          <Text style={styles.metricText}>Starting Metric #7</Text>
          <Text style={styles.titleText}>Dietary Restrictions</Text>
          <Text style={styles.subtitleText}>Select all that apply</Text>

          <View style={styles.restrictionsContainer}>
            {dietaryOptions.map((option, index) => (
              <RestrictionButton key={index} option={option} />
            ))}
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.nextButton,
          selectedRestrictions.length === 0 && styles.nextButtonDisabled
        ]}
        onPress={handleNext}
        disabled={selectedRestrictions.length === 0}
      >
        <Text style={styles.nextButtonText}>Next</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
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
    paddingBottom: 100,
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
  restrictionsContainer: {
    gap: 16,
  },
  restrictionButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedRestrictionButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderColor: '#000000',
  },
  textContainer: {
    flex: 1,
  },
  restrictionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  selectedRestrictionButtonText: {
    color: '#000000',
  },
  restrictionDescription: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.7,
  },
  selectedRestrictionDescription: {
    color: '#000000',
    opacity: 0.7,
  },
  nextButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginHorizontal: 20,
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

export default DietaryRestrictionsScreen; 