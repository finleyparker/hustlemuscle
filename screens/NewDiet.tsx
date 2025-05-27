import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, TextInput, Button, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { collection, addDoc, doc, setDoc, getDocs } from 'firebase/firestore';
import { auth, db } from '../database/firebase';






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

  

  const NewDiet = () => {
  
    const saveDietPlan = async () => {
    


      const fetchUserMeals = async (userId: string) => {
        try {
          const calorieHistory = collection(db, 'UserDetails', userId, 'days');
          const snapshot = await getDocs(calorieHistory);
          const meals = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

        } catch (error) {
          console.error('Error fetching history:', error);
          return [];
        }
          };
    
          fetchUserMeals(userId!); // Ensure userId is not null before calling
       
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Calorie Consumption History</Text>
      </View>
    );
  };

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
export default NewDiet;