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
import { updateDietRestrictions } from '../database/UserDB';

const DietaryRestrictionsScreen = ({ navigation }) => {
  const [selectedRestriction, setSelectedRestriction] = useState('');

  const handleRestrictionSelect = (restriction) => {
    setSelectedRestriction(restriction);
  };

  const handleNext = async () => {
    try {
      await updateDietRestrictions(selectedRestriction);
      navigation.navigate('Equipment');
    } catch (error) {
      console.error('Error saving diet restrictions:', error);
    }
  };

  const RestrictionButton = ({ label, value }) => (
    <TouchableOpacity
      style={[
        styles.restrictionButton,
        selectedRestriction === value && styles.selectedRestrictionButton,
      ]}
      onPress={() => handleRestrictionSelect(value)}
    >
      <Text style={[
        styles.restrictionButtonText,
        selectedRestriction === value && styles.selectedRestrictionButtonText,
      ]}>
        {label}
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
        <Text style={styles.metricText}>Starting Metric #7</Text>
        <Text style={styles.titleText}>Dietary Restrictions</Text>
        <Text style={styles.subtitleText}>Select your dietary restriction.</Text>

        <ScrollView>
          <View style={styles.restrictionsContainer}>
            <RestrictionButton label="Vegetarian" value="Vegetarian" />
            <RestrictionButton label="Vegan" value="Vegan" />
            <RestrictionButton label="Gluten-Free" value="Gluten-Free" />
            <RestrictionButton label="Dairy-Free" value="Dairy-Free" />
            <RestrictionButton label="No Restrictions" value="None" />
          </View>
        </ScrollView>
        
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={handleNext}
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
  restrictionsContainer: {
    gap: 16,
    marginBottom: 20,
  },
  restrictionButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  selectedRestrictionButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  restrictionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  selectedRestrictionButtonText: {
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
  nextButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DietaryRestrictionsScreen; 