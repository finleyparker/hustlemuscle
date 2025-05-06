import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, Button, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Adjust the path to your firebase config

export default function App() {
  // First dropdown
  const [open1, setOpen1] = useState(false);
  const [value1, setValue1] = useState(null);
  const [items1, setItems1] = useState([
    { label: 'None', value: 'none' },
    { label: 'Vegetarian', value: 'Vegetarian' },
    { label: 'Vegan', value: 'Vegan' },
    { label: 'Dairy free', value: 'DairyFree' },
    { label: 'Celiac', value: 'Celiac' },
    { label: 'Pescatarian', value: 'Pescatarian' },
  ]);

  // Second dropdown
  const [open2, setOpen2] = useState(false);
  const [value2, setValue2] = useState(null);
  const [items2, setItems2] = useState([
    { label: 'Lose Weight', value: 'LoseWeight' },
    { label: 'Gain Weight', value: 'GainWeight' },
    { label: 'Maintain weight', value: 'MaintainWeight' },
  ]);

  // Third dropdown
  const [open3, setOpen3] = useState(false);
  const [value3, setValue3] = useState(null);
  const [items3, setItems3] = useState([
    { label: 'Extremely active (exercise 6+ days a week)', value: 'ExtremelyActive' },
    { label: 'Active (exercise 4-5 days a week)', value: 'Active' },
    { label: 'Moderate (exercise 2-3 days a week)', value: 'Moderate' },
    { label: 'Mildly Active (exercise 1 day a week)', value: 'MildlyActive' },
    { label: 'Not Active (little to no exercise)', value: 'NotActive' },
  ]);



  // Hardcoded user ID for testing purposes
  const userId = '1212'; // Replace this with actual user ID from Firebase Auth or any other method

  // Function to close all dropdowns and dismiss keyboard when tapping outside
  const closeDropdowns = () => {
    setOpen1(false);
    setOpen2(false);
    setOpen3(false);
    Keyboard.dismiss();  // Dismiss keyboard if it's open
  };

  // Function to save diet plan to Firebase under the user's collection
  const saveDietPlan = async () => {
    try {
      const dietPlanData = {
        dietRestriction: value1,
        weightGoal: value2,
        activityLevel: value3,
        userId: userId,
      };

      // Create a reference to the user's document

      // Reference to the diet plan document with userId as the document ID
      const dietPlanDocRef = doc(db, 'dietPlans', userId); // This uses the userId as the document ID

      // Save the diet plan document
      await setDoc(dietPlanDocRef, dietPlanData);

      console.log('Diet plan saved successfully!');
        // Show success message
        Alert.alert('Success', 'Your personalized diet plan has been created!', [
            { text: 'OK' },
          ]);
    
          // Clear input fields
          setValue1(null);
          setValue2(null);
          setValue3(null);
    } catch (error) {
      console.error('Error saving diet plan: ', error);
    }
    
  };

  return (
    <TouchableWithoutFeedback onPress={closeDropdowns}>
      <View style={styles.container}>
        <Text style={styles.title}>Create personalised Diet Plan</Text>
        <Text>Any Dietary restrictions?</Text>
        <DropDownPicker
          open={open1}
          value={value1}
          items={items1}
          setOpen={(val) => setOpen1(val)}
          setValue={setValue1}
          setItems={setItems1}
          placeholder="Select..."
          zIndex={3000}
          zIndexInverse={1000}
        />
        <Text>What are your weight goals?</Text>
        <DropDownPicker
          open={open2}
          value={value2}
          items={items2}
          setOpen={(val) => setOpen2(val)}
          setValue={setValue2}
          setItems={setItems2}
          placeholder="Select..."
          zIndex={2000}
          zIndexInverse={2000}
        />
        <Text>How physically active are you?</Text>
        <DropDownPicker
          open={open3}
          value={value3}
          items={items3}
          setOpen={(val) => setOpen3(val)}
          setValue={setValue3}
          setItems={setItems3}
          placeholder="Select..."
          zIndex={1000}
          zIndexInverse={1000}
        />
        <View style={styles.buttonContainer}>
          <Button color="white" title="Create Plan" onPress={saveDietPlan} />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 70,
    paddingHorizontal: 20,
    gap: 20,
  },
  dropdown: {
    borderColor: '#ccc',
    borderRadius: 8,
  },
  dropdownContainer: {
    borderColor: '#ccc',
  },
  input: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 8,
    padding: 10,
  },
  buttonContainer: {
    backgroundColor: 'black',
  },
  title: {
    fontSize: 40,
    textAlign: 'center',
  }
});
