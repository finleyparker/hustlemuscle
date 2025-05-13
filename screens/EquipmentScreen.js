import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db, auth } from '../database/firebase';
import { doc, setDoc } from 'firebase/firestore';

const COMMON_EQUIPMENT = [
  'Dumbbells',
  'Resistance Bands',
  'Yoga Mat',
  'Pull-up Bar',
  'Kettlebell',
  'Bench',
  'None',
];

const EquipmentScreen = ({ navigation }) => {
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [customEquipment, setCustomEquipment] = useState('');
  const [customEquipmentList, setCustomEquipmentList] = useState([]);

  const toggleEquipment = (item) => {
    setSelectedEquipment(prev => {
      if (prev.includes(item)) {
        return prev.filter(i => i !== item);
      } else {
        return [...prev, item];
      }
    });
  };

  const addCustomEquipment = () => {
    if (customEquipment.trim() && !customEquipmentList.includes(customEquipment.trim())) {
      setCustomEquipmentList(prev => [...prev, customEquipment.trim()]);
      setSelectedEquipment(prev => [...prev, customEquipment.trim()]);
      setCustomEquipment('');
    }
  };

  const handleSave = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error('No user is signed in');
        return;
      }

      await setDoc(doc(db, 'UserDetails', userId), {
        Equipment: selectedEquipment
      }, { merge: true });

      // Navigate to Home screen after a short delay
      setTimeout(() => {
        navigation.navigate('Home');
      }, 300);
    } catch (error) {
      console.error('Error saving equipment:', error);
    }
  };

  const EquipmentButton = ({ item, isSelected }) => (
    <TouchableOpacity
      style={[
        styles.equipmentButton,
        isSelected && styles.selectedEquipmentButton,
      ]}
      onPress={() => toggleEquipment(item)}
    >
      <Text style={[
        styles.equipmentButtonText,
        isSelected && styles.selectedEquipmentButtonText,
      ]}>
        {item}
      </Text>
      {isSelected && (
        <Ionicons 
          name="checkmark" 
          size={20} 
          color="#000000" 
          style={styles.checkmark}
        />
      )}
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

      <ScrollView style={styles.contentContainer}>
        <Text style={styles.metricText}>Starting Metric #5</Text>
        <Text style={styles.titleText}>Equipment</Text>
        <Text style={styles.subtitleText}>What equipment do you have at home?</Text>

        <View style={styles.equipmentContainer}>
          {COMMON_EQUIPMENT.map((item) => (
            <EquipmentButton
              key={item}
              item={item}
              isSelected={selectedEquipment.includes(item)}
            />
          ))}

          {customEquipmentList.map((item) => (
            <EquipmentButton
              key={item}
              item={item}
              isSelected={selectedEquipment.includes(item)}
            />
          ))}
        </View>

        <View style={styles.customEquipmentContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add other equipment..."
            placeholderTextColor="#666666"
            value={customEquipment}
            onChangeText={setCustomEquipment}
            onSubmitEditing={addCustomEquipment}
          />
          <TouchableOpacity 
            style={styles.addButton}
            onPress={addCustomEquipment}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.continueButton}
          onPress={handleSave}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
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
  equipmentContainer: {
    gap: 12,
    marginBottom: 24,
  },
  equipmentButton: {
    backgroundColor: 'transparent',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#333333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedEquipmentButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  equipmentButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  selectedEquipmentButtonText: {
    color: '#000000',
  },
  checkmark: {
    marginLeft: 8,
  },
  customEquipmentContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  input: {
    flex: 1,
    backgroundColor: '#111111',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    color: '#FFFFFF',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#333333',
    borderRadius: 30,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  continueButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EquipmentScreen; 