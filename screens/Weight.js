import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../database/firebase';
import { setDoc, doc } from 'firebase/firestore';


const WeightScreen = ({ navigation }) => {
  const [weight, setWeight] = useState('0.0');
  const [unit, setUnit] = useState('kg');

  const handleWeightChange = (value) => {
    // Remove any non-numeric characters except decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const parts = cleanValue.split('.');
    if (parts.length > 2) return;
    setWeight(cleanValue);
  };

  const handleNext = async () => {
    if (parseFloat(weight) <= 0) return;

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error('No user is signed in');
        return;
      }

      await setDoc(doc(db, 'UserDetails', userId), {
        Weight: parseFloat(weight),
        WeightUnit: unit
      }, { merge: true });

      navigation.navigate('Physique');
    } catch (error) {
      console.error('Error saving weight:', error);
    }
  };

  const toggleUnit = () => {
    if (unit === 'kg') {
      setUnit('lbs');
      // Convert kg to lbs
      setWeight((parseFloat(weight) * 2.20462).toFixed(1));
    } else {
      setUnit('kg');
      // Convert lbs to kg
      setWeight((parseFloat(weight) / 2.20462).toFixed(1));
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.contentContainer}>
          <Text style={styles.metricText}>Starting Metric #2</Text>
          <Text style={styles.titleText}>Starting Weight</Text>
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitleText}>Enter your weight.</Text>
            <TouchableOpacity onPress={toggleUnit}>
              <Ionicons name="swap-horizontal" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.weightInputContainer}>
              <TextInput
                style={styles.weightInput}
                value={weight}
                onChangeText={handleWeightChange}
                keyboardType="decimal-pad"
                placeholderTextColor="#666666"
                selectionColor="#FFFFFF"
              />
            </View>
            <TouchableOpacity 
              style={styles.unitButton}
              onPress={toggleUnit}
            >
              <Text style={styles.unitButtonText}>{unit}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[
              styles.nextButton,
              parseFloat(weight) <= 0 && styles.nextButtonDisabled
            ]}
            onPress={handleNext}
            disabled={parseFloat(weight) <= 0}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
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
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    gap: 8,
  },
  subtitleText: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  weightInputContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 30,
    paddingHorizontal: 20,
    height: 50,
    justifyContent: 'center',
  },
  weightInput: {
    color: '#FFFFFF',
    fontSize: 16,
    padding: 0,
  },
  unitButton: {
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 30,
    paddingHorizontal: 20,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  unitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
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

export default WeightScreen; 