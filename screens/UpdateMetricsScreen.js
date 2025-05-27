import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Button } from 'react-native';
import { getUserManagedDetails } from '../utils/manageDetails';
import { Ionicons } from '@expo/vector-icons';
import { updateGender, updateFitnessGoal, updateExperienceLevel, updateFreeDays, updateWeight, updateDietRestrictions } from '../database/UserDB';
import { useFocusEffect } from '@react-navigation/native';

const UpdateMetricsScreen = () => {
  const [gender, setGender] = useState('');
  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('kg');
  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [experienceLevelModalVisible, setExperienceLevelModalVisible] = useState(false);
  const [workoutDays, setWorkoutDays] = useState('');
  const [fitnessGoalModalVisible, setFitnessGoalModalVisible] = useState(false);
  const [workoutDaysModalVisible, setWorkoutDaysModalVisible] = useState(false);
  const [dietRestrictions, setDietRestrictions] = useState([]);
  const [dietRestrictionsModalVisible, setDietRestrictionsModalVisible] = useState(false);

  const loadDetails = async () => {
    try {
      const details = await getUserManagedDetails();
      console.log('Loaded details:', details);
      setGender(details.Gender || '');
      setWeight(details.Weight ? details.Weight.toString() : '');
      setWeightUnit(details.WeightUnit || 'kg');
      setWeightInput(details.Weight ? details.Weight.toString() : '');
      setFitnessGoal(details.PhysiqueGoal || '');
      setExperienceLevel(details.ExperienceLevel || '');
      setWorkoutDays(details.WorkoutDaysPerWeek ? details.WorkoutDaysPerWeek.toString() : '');
      console.log('Setting diet restrictions:', details.DietaryRestrictions);
      setDietRestrictions(Array.isArray(details.DietaryRestrictions) ? details.DietaryRestrictions : []);
    } catch (e) {
      console.error('Error loading details:', e);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadDetails();
    }, [])
  );

  const openGenderModal = () => setGenderModalVisible(true);
  const closeGenderModal = () => setGenderModalVisible(false);
  const selectGender = async (value) => {
    
    try {
      await updateGender(value);
      setGender(value);
      closeGenderModal();
    } catch (error) {
      console.error('Error updating gender:', error);
    }
  };

  const openWeightModal = () => {
    setWeightInput(weight);
    setWeightModalVisible(true);
  };
  const closeWeightModal = () => setWeightModalVisible(false);
  const saveWeight = async () => {
    const num = parseFloat(weightInput);
    if (!isNaN(num) && num > 0) {
      try {
        await updateWeight(num.toString(), weightUnit);
        setWeight(num.toString());
        closeWeightModal();
      } catch (error) {
        console.error('Error updating weight:', error);
      }
    }
  };

  const toggleWeightUnit = () => {
    const newUnit = weightUnit === 'kg' ? 'lbs' : 'kg';
    setWeightUnit(newUnit);
    if (weight) {
      const currentWeight = parseFloat(weight);
      if (newUnit === 'lbs') {
        setWeight((currentWeight * 2.20462).toFixed(1));
      } else {
        setWeight((currentWeight / 2.20462).toFixed(1));
      }
    }
  };

  // Reusable modal for selecting an option
  const OptionModal = ({ visible, onClose, options, selectedValue, onSelect, title, multiSelect }) => (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={[styles.modalCloseIcon, { marginBottom: 15 }]}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{title || 'Select Option'}</Text>
          {options.map((option, idx) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.modalOption, selectedValue.includes(option.value) && styles.selectedOption]}
              onPress={() => onSelect(option.value)}
            >
              <Text style={[styles.modalOptionText, selectedValue.includes(option.value) && { color: '#222' }]}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <ScrollView
      style={{ backgroundColor: '#000', flex: 1 }}
      contentContainerStyle={styles.container}
    >
      <View style={{ height: 8 }} />
      {/* Gender Card */}
      <TouchableOpacity style={styles.card} onPress={openGenderModal} activeOpacity={0.7}>
        <Text style={styles.label}>Your Gender</Text>
        <Text style={styles.value}>{gender || 'Not set'}</Text>
      </TouchableOpacity>
      {/* Weight Card */}
      <TouchableOpacity style={styles.card} onPress={openWeightModal} activeOpacity={0.7}>
        <Text style={styles.label}>Your Current Weight</Text>
        <Text style={styles.value}>{weight ? `${weight} ${weightUnit}` : 'Not set'}</Text>
      </TouchableOpacity>
      {/* Physique Goal Card */}
      <TouchableOpacity style={styles.card} onPress={() => setFitnessGoalModalVisible(true)} activeOpacity={0.7}>
        <Text style={styles.label}>Your Fitness Goal</Text>
        <Text style={styles.value}>{fitnessGoal || 'Not set'}</Text>
      </TouchableOpacity>
      {/* Experience Level Card */}
      <TouchableOpacity style={styles.card} onPress={() => setExperienceLevelModalVisible(true)} activeOpacity={0.7}>
        <Text style={styles.label}>Your Experience</Text>
        <Text style={styles.value}>{experienceLevel || 'Not set'}</Text>
      </TouchableOpacity>
      {/* Workout Days Card */}
      <TouchableOpacity style={styles.card} onPress={() => setWorkoutDaysModalVisible(true)} activeOpacity={0.7}>
        <Text style={styles.label}>Your Free Days</Text>
        <Text style={styles.value}>{workoutDays ? `${workoutDays} days` : 'Not set'}</Text>
      </TouchableOpacity>
      {/* Diet Restrictions Card */}
      <TouchableOpacity style={styles.card} onPress={() => setDietRestrictionsModalVisible(true)} activeOpacity={0.7}>
        <Text style={styles.label}>Your Diet Restrictions</Text>
        <Text style={styles.value}>
          {Array.isArray(dietRestrictions) && dietRestrictions.length > 0 
            ? dietRestrictions.join(', ') 
            : 'No restrictions'}
        </Text>
      </TouchableOpacity>
      {/* Gender Modal */}
      <OptionModal
        visible={genderModalVisible}
        onClose={closeGenderModal}
        options={[
          { label: 'Male', value: 'Male' },
          { label: 'Female', value: 'Female' },
        ]}
        selectedValue={gender}
        onSelect={selectGender}
        title="Select Gender"
      />
       {/* Fitness Goal Modal */}
       <OptionModal
        visible={fitnessGoalModalVisible}
        onClose={() => setFitnessGoalModalVisible(false)}
        options={[
          { label: 'Gain Muscle', value: 'Gain Muscle' },
          { label: 'Lose Weight', value: 'Lose Weight' },
          { label: 'Flexibility', value: 'Flexibility' },
          { label: 'Endurance', value: 'Endurance' },
          { label: 'Strength', value: 'Strength' },
        ]}
        selectedValue={fitnessGoal}
        onSelect={async (value) => {
          try {
            await updateFitnessGoal(value);
            setFitnessGoal(value);
            setFitnessGoalModalVisible(false);
          } catch (error) {
            console.error('Error updating fitness goal:', error);
          }
        }}
        title="Select Fitness Goal"
      />
      {/* Experience Level Modal */}
      <OptionModal
        visible={experienceLevelModalVisible}
        onClose={() => setExperienceLevelModalVisible(false)}
        options={[
          { label: 'Beginner', value: 'Beginner' },
          { label: 'Intermediate', value: 'Intermediate' },
          { label: 'Expert', value: 'Expert' },
        ]}
        selectedValue={experienceLevel}
        onSelect={async (value) => {
          try {
            await updateExperienceLevel(value);
            setExperienceLevel(value);
            setExperienceLevelModalVisible(false);
          } catch (error) {
            console.error('Error updating experience level:', error);
          }
        }}
        title="Select Experience Level"
      />
      {/* Workout Days Modal */}
      <OptionModal
        visible={workoutDaysModalVisible}
        onClose={() => setWorkoutDaysModalVisible(false)}
        options={[
          { label: '3 Days', value: '3' },
          { label: '4 Days', value: '4' },
          { label: '5 Days', value: '5' },
        ]}
        selectedValue={workoutDays}
        onSelect={async (value) => {
          try {
            await updateFreeDays(parseInt(value));
            setWorkoutDays(value);
            setWorkoutDaysModalVisible(false);
          } catch (error) {
            console.error('Error updating workout days:', error);
          }
        }}
        title="Select Workout Days"
      />
      {/* Weight Modal */}
      <Modal
        visible={weightModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeWeightModal}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeWeightModal}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={[styles.modalCloseIcon, { marginBottom: 15 }]}
              onPress={closeWeightModal}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Enter Weight</Text>
            <View style={styles.weightInputContainer}>
              <TextInput
                style={styles.input}
                value={weightInput}
                onChangeText={setWeightInput}
                keyboardType="decimal-pad"
                placeholder="Enter weight"
                placeholderTextColor="#888"
                maxLength={5}
              />
              <TouchableOpacity 
                style={styles.unitButton}
                onPress={toggleWeightUnit}
              >
                <Text style={styles.unitButtonText}>{weightUnit}</Text>
              </TouchableOpacity>
            </View>
            <View style={{ height: 16 }} />
            <Button title="Save" onPress={saveWeight} color="#E4FA00" />
          </View>
        </TouchableOpacity>
      </Modal>
      {/* Diet Restrictions Modal */}
      <Modal
        visible={dietRestrictionsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDietRestrictionsModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setDietRestrictionsModalVisible(false)}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={[styles.modalCloseIcon, { marginBottom: 15 }]}
              onPress={() => setDietRestrictionsModalVisible(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Diet Restrictions</Text>
            {[
              { label: 'Vegetarian', value: 'Vegetarian' },
              { label: 'Vegan', value: 'Vegan' },
              { label: 'Gluten-Free', value: 'Gluten-Free' },
              { label: 'Dairy-Free', value: 'Dairy-Free' },
              { label: 'No Restrictions', value: 'None' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.modalOption, dietRestrictions.includes(option.value) && styles.selectedOption]}
                onPress={() => {
                  let newRestrictions;
                  if (option.value === 'None') {
                    newRestrictions = [];
                  } else {
                    // If selecting a restriction, remove 'None' if it exists
                    newRestrictions = dietRestrictions.filter(r => r !== 'None');
                    
                    // Toggle the selected restriction
                    if (newRestrictions.includes(option.value)) {
                      newRestrictions = newRestrictions.filter(r => r !== option.value);
                    } else {
                      newRestrictions = [...newRestrictions, option.value];
                    }
                  }
                  setDietRestrictions(newRestrictions);
                }}
              >
                <Text style={[styles.modalOptionText, dietRestrictions.includes(option.value) && { color: '#222' }]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.modalOption, { marginTop: 20, backgroundColor: '#E4FA00' }]}
              onPress={async () => {
                try {
                  console.log('Saving diet restrictions:', dietRestrictions);
                  await updateDietRestrictions(dietRestrictions);
                  console.log('Diet restrictions saved successfully');
                  setDietRestrictionsModalVisible(false);
                } catch (error) {
                  console.error('Error updating diet restrictions:', error);
                }
              }}
            >
              <Text style={[styles.modalOptionText, { color: '#000' }]}>Save</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#000',
    paddingTop: 40,
    paddingBottom: 24,
  },
  sectionHeader: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 24,
    marginTop: 8,
    marginBottom: 8,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#18181A',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  value: {
    color: '#bbb',
    fontSize: 15,
    fontWeight: '400',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#18181A',
    borderRadius: 16,
    padding: 24,
    width: 260,
    alignItems: 'center',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 18,
  },
  modalOption: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 30,
    marginBottom: 10,
    backgroundColor: '#232325',
  },
  selectedOption: {
    backgroundColor: '#E4FA00',
  },
  modalOptionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 20,
  },
  input: {
    width: 120,
    backgroundColor: '#232325',
    color: '#fff',
    borderRadius: 10,
    padding: 10,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalCloseIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
  },
  weightInputContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  unitButton: {
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 30,
    paddingHorizontal: 20,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  unitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default UpdateMetricsScreen; 