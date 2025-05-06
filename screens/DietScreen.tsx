// HomeScreen.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  useColorScheme,
  ScrollView,
  StatusBar,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { collection, getDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = ({ navigation }: any) => {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  const userId = '1212'; // Replace with real user ID from Firebase Auth
  const [modalVisible, setModalVisible] = useState(false);
  const [totalCalories, setTotalCalories] = useState(0);
  const [selectedMeals, setSelectedMeals] = useState<{ name: string; calories: number }[]>([]);
  const [manualMealName, setManualMealName] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [dailyTarget, setDailyTarget] = useState(2000); // Default target
  const [dietGoal, setDietGoal] = useState('');
  const [activityLevel, setActivityLevel] = useState('');

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const userRef = doc(db, 'dietPlans', userId);
          const docSnap = await getDoc(userRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setTotalCalories(data.totalCalories || 0);
            setSelectedMeals(data.selectedMeals || []);

            // Set daily target based on diet goal
            const weightGoal = data.weightGoal || 'MaintainWeight';
            setDietGoal(weightGoal);

            const activityLevel = data.activityLevel || 'MildlyActive';
            setActivityLevel(activityLevel);

            let target = 2000;
            if (weightGoal === 'LoseWeight' && activityLevel === 'NotActive') target = 1500;
            else if (weightGoal === 'LoseWeight' && activityLevel === 'MildlyActive') target = 1700;
            else if (weightGoal === 'LoseWeight' && activityLevel === 'Moderate') target = 1900;
            else if (weightGoal === 'LoseWeight' && activityLevel === 'Active') target = 2100;
            else if (weightGoal === 'LoseWeight' && activityLevel === 'ExtremelyActive') target = 2300;
            else if (weightGoal === 'MaintainWeight' && activityLevel === 'NotActive') target = 1800;
            else if (weightGoal === 'MaintainWeight' && activityLevel === 'MildlyActive') target = 2000;
            else if (weightGoal === 'MaintainWeight' && activityLevel === 'Moderate') target = 2200;
            else if (weightGoal === 'MaintainWeight' && activityLevel === 'Active') target = 2400;
            else if (weightGoal === 'MaintainWeight' && activityLevel === 'ExtremelyActive') target = 2600;
            else if (weightGoal === 'GainWeight' && activityLevel === 'NotActive') target = 2500;
            else if (weightGoal === 'GainWeight' && activityLevel === 'MildlyActive') target = 2700;
            else if (weightGoal === 'GainWeight' && activityLevel === 'Moderate') target = 2900;
            else if (weightGoal === 'GainWeight' && activityLevel === 'Active') target = 3100;
            else if (weightGoal === 'GainWeight' && activityLevel === 'ExtremelyActive') target = 3300;
            else target = 2000;

            setDailyTarget(target);
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      fetchData();
    }, [])
  );

  const toggleModal = (visible: boolean) => {
    setModalVisible(visible);
  };

  const handleManualSubmit = async () => {
    const cal = parseInt(manualCalories);
    if (!manualMealName || isNaN(cal) || cal <= 0) {
      Alert.alert('Error', 'Please enter a valid meal name and calorie number.');
      return;
    }

    const newMeal = { name: manualMealName, calories: cal };
    const updatedTotal = totalCalories + cal;
    const updatedMeals = [...selectedMeals, newMeal];

    try {
      const userRef = doc(db, 'dietPlans', userId);
      await updateDoc(userRef, {
        totalCalories: updatedTotal,
        selectedMeals: updatedMeals,
      });

      setSelectedMeals(updatedMeals);
      setTotalCalories(updatedTotal);
      setManualMealName('');
      setManualCalories('');
      setModalVisible(false);
    } catch (error) {
      console.error('Failed to update manual entry:', error);
      Alert.alert('Error', 'Could not save entry. Try again.');
    }
  };

  const handleReset = async () => {
    try {
      setTotalCalories(0);
      setSelectedMeals([]);

      const dietPlanRef = doc(db, 'dietPlans', userId);
      await updateDoc(dietPlanRef, {
        totalCalories: 0,
        selectedMeals: [],
      });
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  };

  const fill = (totalCalories / dailyTarget) * 100;
  const tintColor = fill <= 100 ? '#00e0ff' : 'red';

  return (
    <View style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>This is the Home Screen</Text>

          <Button
            title="Create a new personalised diet"
            onPress={() => navigation.navigate('New')}
          />
          <View style={{ marginTop: 5 }}>
            <Button
              title="View current plan"
              onPress={() => navigation.navigate('Current')}
            />
          </View>

          <View style={styles.progress}>
            <AnimatedCircularProgress
              size={250}
              width={20}
              fill={fill}
              tintColor={tintColor}
              backgroundColor="#3d5875"
            />
            <Text style={styles.calorie}>Calories:</Text>
            <Text style={styles.calorie1}>{totalCalories}</Text>
            <Text style={styles.goalText}>Daily Target: {dailyTarget}</Text>
            {fill > 100}
          </View>

          <View style={styles.button3}>
            <Button
              title="Add Calories Manually"
              onPress={() => toggleModal(true)}
            />
          </View>

          <View style={styles.log}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 10 }}>
              Meal Log:
            </Text>
            {selectedMeals.length === 0 ? (
              <Text>No meals logged yet.</Text>
            ) : (
              selectedMeals.map((meal, index) => (
                <Text key={index}>
                  {meal.name} - {meal.calories} cal
                </Text>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Manual Entry Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => toggleModal(false)}
      >
        <View style={styles.modal1}>
          <View style={styles.modalContent}>
            <View style={styles.closeButton}>
              <Button title="X" onPress={() => toggleModal(false)} />
            </View>
            <Text style={styles.text}>Add Calories Manually</Text>

            <TextInput
              placeholder="Meal name"
              style={styles.input}
              value={manualMealName}
              onChangeText={setManualMealName}
            />

            <TextInput
              placeholder="Calories"
              style={styles.input}
              keyboardType="numeric"
              value={manualCalories}
              onChangeText={setManualCalories}
            />

            <Button title="Add" onPress={handleManualSubmit} />
          </View>
        </View>
      </Modal>

      <View style={styles.button2}>
        <Button
          color="red"
          title="Reset Plan"
          onPress={handleReset}
          accessibilityLabel="Reset calorie count and meal log"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 40,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  progress: {
    alignItems: 'center',
    marginTop: 20,
  },
  calorie: {
    marginTop: -170,
    fontSize: 35,
  },
  calorie1: {
    fontSize: 30,
  },
  goalText: {
    fontSize: 16,
    marginTop: 10,
    color: '#333',
  },
  warningText: {
    marginTop: 70,
    color: 'red',
    fontWeight: 'bold',
  },
  button2: {
    marginLeft: 0,
  },
  button3: {
    marginLeft: 80,
    marginTop: 80,
    width: 200,
  },
  log: {
    marginLeft: 20,
    marginTop: 20,
  },
  modal1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 30,
  },
  modalContent: {
    width: 300,
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  text: {
    fontSize: 18,
    color: 'black',
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    marginLeft: 230,
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 15,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
  },
});

export default HomeScreen;
