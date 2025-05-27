import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TextInput, Button, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../database/firebase';


export default function NewDiet() {
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

  const [open2, setOpen2] = useState(false);
  const [value2, setValue2] = useState(null);
  const [items2, setItems2] = useState([
    { label: 'Lose Weight', value: 'LoseWeight' },
    { label: 'Gain Weight', value: 'GainWeight' },
    { label: 'Maintain weight', value: 'MaintainWeight' },
  ]);

  const [open3, setOpen3] = useState(false);
  const [value3, setValue3] = useState(null);
  const [items3, setItems3] = useState([
    { label: 'Extremely active (exercise 6+ days a week)', value: 'ExtremelyActive' },
    { label: 'Active (exercise 4-5 days a week)', value: 'Active' },
    { label: 'Moderate (exercise 2-3 days a week)', value: 'Moderate' },
    { label: 'Mildly Active (exercise 1 day a week)', value: 'MildlyActive' },
    { label: 'Not Active (little to no exercise)', value: 'NotActive' },
  ]);

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        // User is signed in, set the currentUserId
        setUserId(user.uid);
        console.log("User ID:", user.uid);
      } else {
        // No user is signed in
        setUserId(null);
        console.log("No user is signed in.");
      }
    });

    return () => unsubscribe(); // Cleanup the listener on component unmount
  }, []);

  const closeDropdowns = () => {
    setOpen1(false);
    setOpen2(false);
    setOpen3(false);
    Keyboard.dismiss();
  };

  const saveDietPlan = async () => {
    if (!value1 || !value2 || !value3) {
      Alert.alert('Missing Input', 'Please fill in all fields before saving the diet plan.');
      return;
    }

    try {
      const dietPlanData = {
        dietRestriction: value1,
        weightGoal: value2,
        activityLevel: value3,
        userId: userId,
      };

      if (!userId) {
        throw new Error('User ID is required');
      }

      const dietPlanDocRef = doc(db, 'dietPlans', userId);

      await setDoc(dietPlanDocRef, dietPlanData);

      console.log('Diet plan saved successfully!');
      Alert.alert('Success', 'Your personalized diet plan has been created!', [
        { text: 'OK' },
      ]);

      setValue1(null);
      setValue2(null);
      setValue3(null);
    } catch (error) {
      console.error('Error saving diet plan: ', error);
      Alert.alert('Error', 'There was a problem saving your diet plan. Please try again.');
    }
  };


  return (
    
      <View style={styles.container}>
        <Text style={styles.title}>Calorie Consumption History</Text>
        
        
        
      
      </View>
   
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
