import React, { useState } from 'react';
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



const GenderScreen = ({ navigation }) => {
  const [selectedGender, setSelectedGender] = useState(null);
  

  const handleGenderSelect = async (gender) => {
    setSelectedGender(gender);
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error('No user is signed in');
        return;
      }
      
      // Update the Gender field in the user's document
      await setDoc(doc(db, 'UserDetails', userId), {
        Gender: gender
      }, { merge: true });
      
      // Navigate to weight screen after a short delay
      setTimeout(() => {
        navigation.navigate('Weight');
      }, 300);
    } catch (error) {
      console.error('Error saving gender:', error);
    }
  };

  const handleNext = async () => {
    if (!selectedGender) {
      // Optionally show an alert or message that gender must be selected
      return;
    }

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error('No user is signed in');
        return;
      }
      
      // Update the Gender field in the user's document
      await setDoc(doc(db, 'UserDetails', userId), {
        Gender: selectedGender
      }, { merge: true });
      
      navigation.navigate('Weight');
    } catch (error) {
      console.error('Error saving gender:', error);
    }
  };

  const GenderButton = ({ gender, isSelected }) => (
    <TouchableOpacity
      style={[
        styles.genderButton,
        isSelected && styles.selectedGenderButton,
      ]}
      onPress={() => handleGenderSelect(gender)}
    >
      <Text style={[
        styles.genderButtonText,
        isSelected && styles.selectedGenderButtonText,
      ]}>
        {gender}
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
        <Text style={styles.metricText}>Starting Metric #1</Text>
        <Text style={styles.titleText}>Gender</Text>
        <Text style={styles.subtitleText}>Please select your gender.</Text>

        <View style={styles.genderContainer}>
          <GenderButton 
            gender="Male" 
            isSelected={selectedGender === 'Male'} 
          />
          <GenderButton 
            gender="Female" 
            isSelected={selectedGender === 'Female'} 
          />
        </View>

        <TouchableOpacity 
          style={[
            styles.nextButton,
            !selectedGender && styles.nextButtonDisabled
          ]}
          onPress={handleNext}
          disabled={!selectedGender}
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
  genderContainer: {
    gap: 16,
  },
  genderButton: {
    backgroundColor: 'transparent',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
  },
  selectedGenderButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  genderButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  selectedGenderButtonText: {
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

export default GenderScreen; 