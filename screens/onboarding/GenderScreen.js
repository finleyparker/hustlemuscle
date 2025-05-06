import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import app from '../../firebase';

const GenderScreen = ({ navigation }) => {
  const [selectedGender, setSelectedGender] = useState(null);
  const db = getFirestore(app);

  const handleGenderSelect = async (gender) => {
    setSelectedGender(gender);
    try {
      // Update the Gender field in the user's document
      await setDoc(doc(db, 'UserDetails', '07QDnA7D3QOrcZNS3Dfe'), {
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
});

export default GenderScreen; 