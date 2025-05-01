import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
    
    // Navigate to physique screen if a valid weight is entered
    if (parseFloat(cleanValue) > 0) {
      setTimeout(() => {
        navigation.navigate('Physique');
      }, 1000);
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
});

export default WeightScreen; 