import React from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../database/firebase';  // adjust if needed
import { updateGender } from '../database/UserDB';

const Gender = () => {
  const handleSaveGender = async () => {
    try {
      await updateGender('transfemale');  // pass whatever gender you want to save
      Alert.alert('Success', 'Gender updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'There was a problem updating gender.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Gender</Text>
      <Button title="Save Gender" onPress={handleSaveGender} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',  // or your preferred background
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default Gender;
