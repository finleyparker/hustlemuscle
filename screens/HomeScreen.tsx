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
import * as Progress from 'react-native-progress';
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
  const [totalFats, setTotalFats] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [totalCarbs, setTotalCarbs] = useState(0);
  const [selectedMeals, setSelectedMeals] = useState<{ name: string; calories: number }[]>([]);
  const [manualMealName, setManualMealName] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualFats, setManualFats] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [dailyTarget, setDailyTarget] = useState(2000); // Default target
  const [carbTarget, setCarbTarget] = useState(0.3);
  const [fatTarget, setFatTarget] = useState(0.3);  
  const [proteinTarget, setProteinTarget] = useState(0.4);
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
            setTotalFats(data.totalFats || 0);
            setTotalProtein(data.totalProtein || 0);
            setTotalCarbs(data.totalCarbs || 0);

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
            
            let proteinRatio = 0.3; // 30% of daily target
            let fatRatio = 0.3; // 30% of daily target  
            let carbRatio = 0.4; // 40% of daily target

            if (weightGoal === 'LoseWeight') {
              proteinRatio = 0.4; // higher protein
              fatRatio = 0.3;
              carbRatio = 0.3;
            } else if (weightGoal === 'MaintainWeight') {
              proteinRatio = 0.3;
              fatRatio = 0.3;
              carbRatio = 0.4;
            } else if (weightGoal === 'GainWeight') {
              proteinRatio = 0.25;
              fatRatio = 0.25;
              carbRatio = 0.5; // higher carbs
            }
            setDailyTarget(target);
            setCarbTarget(carbRatio);
            setFatTarget(fatRatio);
            setProteinTarget(proteinRatio);
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
    const fat = parseInt(manualFats);
    const protein = parseInt(manualProtein);
    const carbs = parseInt(manualCarbs);
    if (!manualMealName || isNaN(cal) || cal <= 0) {
      Alert.alert('Error', 'Please enter a valid meal name and calorie number.');
      return;
    }

    const newMeal = { name: manualMealName, calories: cal };
    const updatedTotal = totalCalories + cal;
    const updatedFats = totalFats + fat; // Replace with actual fat calculation
    const updatedProtein = totalProtein + protein; // Replace with actual protein calculation
    const updatedCarbs = totalCarbs + carbs; // Replace with actual carb calculation
    const updatedMeals = [...selectedMeals, newMeal];

    try {
      const userRef = doc(db, 'dietPlans', userId);
      await updateDoc(userRef, {
        totalCalories: updatedTotal,
        totalFats: updatedFats,
        totalProtein: updatedProtein,
        totalCarbs: updatedCarbs,
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
      setTotalFats(0);
      setTotalProtein(0);
      setTotalCarbs(0);

      const dietPlanRef = doc(db, 'dietPlans', userId);
      await updateDoc(dietPlanRef, {
        totalCalories: 0,
        totalFats: 0,
        totalProtein: 0,
        totalCarbs: 0,
        selectedMeals: [],
      });
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  };

  const proteinTarget1 = (dailyTarget * proteinTarget) // 30% of daily target
  const fatTarget1 = (dailyTarget * fatTarget) // 30% of daily target
  const carbTarget1 = (dailyTarget * carbTarget) // 40% of daily target


  const fill = (totalCalories / dailyTarget) * 100;
  const tintColor = fill <= 100 ? '#00e0ff' : 'red';

  const fillCarbs = (totalCarbs / carbTarget1);
  const fillFats = (totalFats / fatTarget1);
  const fillProtein = (totalProtein / proteinTarget1);

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
              title="Add Data Manually"
              onPress={() => toggleModal(true)}
            />
          </View>
          <View style={styles.carbs}>
            <Text>Carbs: {Math.round(fillCarbs * 100)}%   </Text>
            <Progress.Bar progress={fillCarbs} width={200} height={15} color="#ff0000" animationType="spring" />
          </View>
          <View style={styles.fats}>
          <Text>Fats: {Math.round(fillFats * 100)}%   </Text>
            <Progress.Bar progress={fillFats} width={200} height={15} color="#00ff00"/>
          </View>
          <View style={styles.protein}>
          <Text>Protein: {Math.round(fillProtein * 100)}%   </Text>
            <Progress.Bar progress={fillProtein} width={200} height={15} color="#0000ff"/>
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
            <Text style={styles.text}>Add Data Manually</Text>

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

            <TextInput
              placeholder="Carbs"
              style={styles.input}
              keyboardType="numeric"
              value={manualCarbs}
              onChangeText={setManualCarbs}
            />

            <TextInput
              placeholder="Protein"
              style={styles.input}
              keyboardType="numeric"
              value={manualProtein}
              onChangeText={setManualProtein}
            />

            <TextInput
              placeholder="Fats"
              style={styles.input}
              keyboardType="numeric"
              value={manualFats}
              onChangeText={setManualFats}
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
  carbs: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fats: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  protein: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default HomeScreen;
