
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
import { db, auth } from '../database/firebase';
import { useFocusEffect } from '@react-navigation/native';
import { setDoc, serverTimestamp } from 'firebase/firestore';

const DietScreen = ({ navigation }: any) => {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };


  const userId = auth.currentUser?.uid;
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
  const [dailyTarget, setDailyTarget] = useState(2000); // default target
  const [carbTarget, setCarbTarget] = useState(0.3); // default target
  const [fatTarget, setFatTarget] = useState(0.3);  // default target
  const [proteinTarget, setProteinTarget] = useState(0.4); // default target
  const [dietGoal, setDietGoal] = useState('');
  const [activityLevel, setActivityLevel] = useState('');

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          if (!userId) {
            console.error('User ID is undefined');
            return;
          }
          const userRef = doc(db, 'UserDetails', userId);
          const docSnap = await getDoc(userRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setTotalCalories(data.totalCalories || 0);
            setSelectedMeals(data.selectedMeals || []);
            setTotalFats(data.totalFats || 0);
            setTotalProtein(data.totalProtein || 0);
            setTotalCarbs(data.totalCarbs || 0);

            
            const PhysiqueGoal = data.weightGoal || 'MaintainWeight';
            setDietGoal(PhysiqueGoal);

            const activityLevel = data.activityLevel || 'MildlyActive';
            setActivityLevel(activityLevel);

            // set daily target based on diet goal
            let target = 2000;
            if (PhysiqueGoal === 'Weight Loss' && activityLevel === 'Not Active') target = 1500;
            else if (PhysiqueGoal === 'Weight Loss' && activityLevel === 'Mildly Active') target = 1700;
            else if (PhysiqueGoal === 'Weight Loss' && activityLevel === 'Moderate') target = 1900;
            else if (PhysiqueGoal === 'Weight Loss' && activityLevel === 'Active') target = 2100;
            else if (PhysiqueGoal === 'Weight Loss' && activityLevel === 'Extremely Active') target = 2300;
            else if (PhysiqueGoal === 'Endurance' && activityLevel === 'Not Active') target = 2050;
            else if (PhysiqueGoal === 'Endurance' && activityLevel === 'Mildly Active') target = 2200;
            else if (PhysiqueGoal === 'Endurance' && activityLevel === 'Moderate') target = 2350;
            else if (PhysiqueGoal === 'Endurance' && activityLevel === 'Active') target = 2500;
            else if (PhysiqueGoal === 'Endurance' && activityLevel === 'Extremely Active') target = 2650;
            else if (PhysiqueGoal === 'Muscle Gain' && activityLevel === 'Not Active') target = 2500;
            else if (PhysiqueGoal === 'Muscle Gain' && activityLevel === 'Mildly Active') target = 2700;
            else if (PhysiqueGoal === 'Muscle Gain' && activityLevel === 'Moderate') target = 2900;
            else if (PhysiqueGoal === 'Muscle Gain' && activityLevel === 'Active') target = 3100;
            else if (PhysiqueGoal === 'Muscle Gain' && activityLevel === 'Extremely Active') target = 3300;
            else if (PhysiqueGoal === 'Flexibility' && activityLevel === 'Not Active') target = 1800;
            else if (PhysiqueGoal === 'Flexibility' && activityLevel === 'Mildly Active') target = 1900;
            else if (PhysiqueGoal === 'Flexibility' && activityLevel === 'Moderate') target = 2000;
            else if (PhysiqueGoal === 'Flexibility' && activityLevel === 'Active') target = 2200;
            else if (PhysiqueGoal === 'Flexibility' && activityLevel === 'Extremely Active') target = 2400;
            else if (PhysiqueGoal === 'Strength' && activityLevel === 'Not Active') target = 2500;
            else if (PhysiqueGoal === 'Strength' && activityLevel === 'Mildly Active') target = 2700;
            else if (PhysiqueGoal === 'Strength' && activityLevel === 'Moderate') target = 2900;
            else if (PhysiqueGoal === 'Strength' && activityLevel === 'Active') target = 3100;
            else if (PhysiqueGoal === 'Strength' && activityLevel === 'Extremely Active') target = 3300;
            else target = 2000;
            
            let proteinRatio = 0.3; 
            let fatRatio = 0.3; 
            let carbRatio = 0.4;

            if (PhysiqueGoal === 'Weight Loss') {
              proteinRatio = 0.4; 
              fatRatio = 0.3;
              carbRatio = 0.3;
            } else if (PhysiqueGoal === 'Flexibility') {
              proteinRatio = 0.3;
              fatRatio = 0.3;
              carbRatio = 0.4;
            } else if (PhysiqueGoal === 'Muscle Gain') {
              proteinRatio = 0.25;
              fatRatio = 0.25;
              carbRatio = 0.5; 
            } else if (PhysiqueGoal === 'Strength') {
              proteinRatio = 0.25;
              fatRatio = 0.25;
              carbRatio = 0.5; 
            } else if (PhysiqueGoal === 'Endurance') {
              proteinRatio = 0.25;
              fatRatio = 0.25;
              carbRatio = 0.5; 
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

  const submitDailySummary = async () => {
    const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
const localDateString = `${yyyy}-${mm}-${dd}`; // YYYY-MM-DD format
  
    if (!userId) {
      console.error('User ID is undefined');
      return;
    }
    const dailySummaryRef = doc(db, 'UserDetails', userId, 'days', localDateString);
  
    try {
      await setDoc(dailySummaryRef, {
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFats,
        timestamp: serverTimestamp(),
      });
  
      console.log('Daily summary saved.');
      handleReset();
    } catch (error) {
      console.error('Error saving daily summary:', error);
    }
  };
  

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
    const updatedFats = totalFats + fat; 
    const updatedProtein = totalProtein + protein;
    const updatedCarbs = totalCarbs + carbs; 
    const updatedMeals = [...selectedMeals, newMeal];

    try {
      if (!userId) {
        console.error('User ID is undefined');
        return;
      }
      const userRef = doc(db, 'UserDetails', userId);
      await setDoc(
        userRef,
        {
          totalCalories: updatedTotal,
          totalFats: updatedFats,
          totalProtein: updatedProtein,
          totalCarbs: updatedCarbs,
          selectedMeals: updatedMeals,
        },
        { merge: true }
      );

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

      if (!userId) {
        console.error('User ID is undefined');
        return;
      }
      const dietPlanRef = doc(db, 'UserDetails', userId);
      await setDoc(dietPlanRef, {
        totalCalories: 0,
        totalFats: 0,
        totalProtein: 0,
        totalCarbs: 0,
        selectedMeals: [],
      }, { merge: true }
    );
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  };

  const proteinTarget1 = (dailyTarget * proteinTarget) 
  const fatTarget1 = (dailyTarget * fatTarget) 
  const carbTarget1 = (dailyTarget * carbTarget) 


  const fill = (totalCalories / dailyTarget) * 100;
  const tintColor = fill <= 100 ? '#00e0ff' : 'red';

  const fillCarbs = (totalCarbs / carbTarget1);
  const fillFats = (totalFats / fatTarget1);
  const fillProtein = (totalProtein / proteinTarget1);

  return (
    <View style={backgroundStyle}>
      <StatusBar
        
      />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>This is the Home Screen</Text>

          <Button
            title="View past calorie consumption"
            onPress={() => navigation.navigate('NewDiet')}
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
            <Text style={styles.text1}>Carbs: {Math.round(fillCarbs * 100)}%   </Text>
            <Progress.Bar progress={fillCarbs} width={200} height={15} color="#ff0000" animationType="spring" />
          </View>
          <View style={styles.fats}>
          <Text style={styles.text1}>Fats: {Math.round(fillFats * 100)}%   </Text>
            <Progress.Bar progress={fillFats} width={200} height={15} color="#00ff00"/>
          </View>
          <View style={styles.protein}>
          <Text style={styles.text1}>Protein: {Math.round(fillProtein * 100)}%   </Text>
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

     
      <Modal  // modal for manual data entry
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
      <Button title="Submit Daily Summary" onPress={submitDailySummary} />
    </View>
    
  );
};

const styles = StyleSheet.create({

  sectionContainer: {
    paddingHorizontal: 24,
    backgroundColor: 'black',
    paddingTop: 40,
    paddingBottom: 20,
  },
  text1: {
    color: 'white',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    color: 'white',
  },
  progress: {
    alignItems: 'center',
    marginTop: 20,
  },
  calorie: {
    marginTop: -170,
    fontSize: 35,
    color: 'white',
  },
  calorie1: {
    fontSize: 30,
    color: 'white',
  },
  goalText: {
    fontSize: 16,
    marginTop: 10,
    color: 'white',
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
  backgroundStyle: {
    backgroundColor: '#000',

  },
});

export default DietScreen;
