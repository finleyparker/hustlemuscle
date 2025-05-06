import React from 'react';
import { View, Text, Button } from 'react-native';
import { db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';


const UpdateGender = () => {
  const handleUpdateGender = async () => {
    const userRef = doc(db, 'UserDetails', '07QDnA7D3QOrcZNS3Dfe');
    try {
      await setDoc(userRef, { Gender: 'male' }, { merge: true });
      console.log('Gender updated successfully.');
    } catch (error) {
      console.error('Error updating gender:', error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Press the button to update Gender:</Text>
      <Button title="Update Gender" onPress={handleUpdateGender} />
    </View>
  );
};

export default UpdateGender;
