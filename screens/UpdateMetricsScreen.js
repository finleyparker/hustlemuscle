import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Button } from 'react-native';

const metrics = [
  { label: 'Your Fitness Goal', value: 'Gain Muscle' },
  { label: 'Your Experience', value: 'Beginner' },
  { label: 'Your Free Days', value: '5 days' },
  { label: 'Your Equipment', value: 'Barbell, Kettle bell, ...' },
];

const UpdateMetricsScreen = () => {
  const [gender, setGender] = useState('Male');
  const [genderModalVisible, setGenderModalVisible] = useState(false);
  const [weight, setWeight] = useState(50);
  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [weightInput, setWeightInput] = useState(weight.toString());

  const openGenderModal = () => setGenderModalVisible(true);
  const closeGenderModal = () => setGenderModalVisible(false);
  const selectGender = (value) => {
    setGender(value);
    closeGenderModal();
  };

  const openWeightModal = () => {
    setWeightInput(weight.toString());
    setWeightModalVisible(true);
  };
  const closeWeightModal = () => setWeightModalVisible(false);
  const saveWeight = () => {
    const num = parseInt(weightInput);
    if (!isNaN(num) && num > 0) {
      setWeight(num);
      closeWeightModal();
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: '#000', flex: 1 }}
      contentContainerStyle={styles.container}
    >
      <View style={{ height: 8 }} />
      {/* Gender Card */}
      <TouchableOpacity style={styles.card} onPress={openGenderModal} activeOpacity={0.7}>
        <Text style={styles.label}>Your Gender</Text>
        <Text style={styles.value}>{gender}</Text>
      </TouchableOpacity>
      {/* Weight Card */}
      <TouchableOpacity style={styles.card} onPress={openWeightModal} activeOpacity={0.7}>
        <Text style={styles.label}>Your Current Weight</Text>
        <Text style={styles.value}>{weight} kg</Text>
      </TouchableOpacity>
      {metrics.map((item, idx) => (
        <View key={idx} style={styles.card}>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.value}>{item.value}</Text>
        </View>
      ))}
      {/* Gender Modal */}
      <Modal
        visible={genderModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeGenderModal}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeGenderModal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Gender</Text>
            <TouchableOpacity
              style={[styles.modalOption, gender === 'Male' && styles.selectedOption]}
              onPress={() => selectGender('Male')}
            >
              <Text style={[styles.modalOptionText, gender === 'Male' && { color: '#222' }]}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalOption, gender === 'Female' && styles.selectedOption]}
              onPress={() => selectGender('Female')}
            >
              <Text style={[styles.modalOptionText, gender === 'Female' && { color: '#222' }]}>Female</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      {/* Weight Modal */}
      <Modal
        visible={weightModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeWeightModal}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeWeightModal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={weightInput}
              onChangeText={setWeightInput}
              keyboardType="numeric"
              placeholder="Enter weight"
              placeholderTextColor="#888"
              maxLength={3}
            />
            <View style={{ height: 16 }} />
            <Button title="Save" onPress={saveWeight} color="#E4FA00" />
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
});

export default UpdateMetricsScreen; 