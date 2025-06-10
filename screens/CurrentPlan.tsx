import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert } from 'react-native';
import { collection, getDocs, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../database/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface FoodItem {
  id: string;
  type: string;
  title: string;
  ingredient: string[];
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

interface DietPlan {
  DietaryRestrictions: string;
  totalCalories?: number;
  totalProtein?: number;
  totalFat?: number;
  totalCarbs?: number;
  selectedMeals?: {
    name: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  }[];
}

export default function App() {
  const [meal, setMeal] = useState<FoodItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [userDietRestriction, setUserDietRestriction] = useState<string>('');
  const [totalCalories, setTotalCalories] = useState<number>(0);
  const [totalProtein, setTotalProtein] = useState<number>(0);
  const [totalFat, setTotalFat] = useState<number>(0);
  const [totalCarbs, setTotalCarbs] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => { //get user id of person signed in
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        console.warn('User not signed in');
        setUserId(null);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchUserDiet = async () => { // Fetch the user's diet plan from Firestore
      try {
        const dietPlanDocRef = doc(db, 'UserDetails', userId);
        const dietPlanDoc = await getDoc(dietPlanDocRef);

        if (dietPlanDoc.exists()) {
          const dietPlanData = dietPlanDoc.data() as DietPlan;
          setUserDietRestriction(dietPlanData.DietaryRestrictions);
          setTotalCalories(dietPlanData.totalCalories || 0);

          // Add these lines:
        setTotalProtein(dietPlanData.totalProtein || 0);
        setTotalFat(dietPlanData.totalFat || 0);
        setTotalCarbs(dietPlanData.totalCarbs || 0);
        } else {
          console.log('No diet plan found for this user');
          Alert.alert("Alert Title","No diet plan found for this user",[{ text: "OK"}]);
        }
      } catch (error) {
        console.error('Error fetching user diet plan:', error);
        Alert.alert("Alert Title","Error fetching user diet plan",[{ text: "OK"}]);
      }
    };

    const fetchMeals = async () => { // Fetch meals from Firestore
      try {
        const querySnapshot = await getDocs(collection(db, 'meals'));
        const mealData: FoodItem[] = [];
        querySnapshot.forEach((doc) => {
          mealData.push({ id: doc.id, ...doc.data() } as FoodItem);
        });
        setMeal(mealData);
      } catch (error) {
        console.error('Error loading meals: ', error);
        Alert.alert("Alert Title","Error loading meals",[{ text: "OK"}]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDiet();
    fetchMeals();
  }, [userId]);


  const filteredDiet = userDietRestriction === 'None' // If no dietary restrictions, show all meals
    ? meal
    : meal.filter(item => item.type === userDietRestriction); // Filter meals based on user's dietary restrictions

  const handleSelectMeal = async (
    calories: number,
    title: string,
    protein: number,
    fat: number,
    carbs: number
  ) => {
    if (!userId) {
      console.error('User ID is undefined');
      Alert.alert("Alert Title","User ID is undefined",[{ text: "OK"}]);
      return;
    }

    // Update the total calories and macros
    const newTotal = totalCalories + calories;
    const newProtein = totalProtein + protein;
    const newFat = totalFat + fat;
    const newCarbs = totalCarbs + carbs;

    setTotalCalories(newTotal);
    setTotalProtein(newProtein);
    setTotalFat(newFat);
    setTotalCarbs(newCarbs);

    const dietPlanRef = doc(db, 'UserDetails', userId);

    try {
      const docSnap = await getDoc(dietPlanRef);
      let updatedMeals: {
        name: string;
        calories: number;
        protein: number;
        fat: number;
        carbs: number;
      }[] = [];

      if (docSnap.exists()) { // If the diet plan document exists, update the selected meals
        const data = docSnap.data() as DietPlan;
        const currentMeals = data.selectedMeals || [];
        updatedMeals = [...currentMeals, { name: title, calories, protein, fat, carbs }];
      } else {
        updatedMeals = [{ name: title, calories, protein, fat, carbs }];
      }

      await setDoc(dietPlanRef, { // Update the diet plan with new total calories and selected meals
        totalCalories: newTotal,
        totalProtein: newProtein,
        totalFat: newFat,
        totalCarbs: newCarbs,
        selectedMeals: updatedMeals,
      }, { merge: true }); //add merge to avoid overwriting the entire document
    } catch (error) {
      console.error('Error updating meal selection:', error);
      Alert.alert("Alert Title","Error updating meal selection",[{ text: "OK"}]);
    }
  };

  return (
    <View style={{ flex: 1, paddingTop: 50, paddingHorizontal: 16, backgroundColor: 'black' }}>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <>
          <Text style={styles.title}>Dietary Restrictions: {userDietRestriction}</Text>
          <Text style={styles.totalCalories}>
            View meals based on your dietary restrictions and goals.
          </Text>
          <Text style={styles.totalCalories}>
            Total Calories Consumed: {totalCalories}
          </Text>

          <FlatList
            data={filteredDiet}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.mealCard}>
                <Text style={styles.subtitle}>{item.type}</Text>
                <Text style={styles.mealTitle}>{item.title}</Text>
                <Text>
                  {Array.isArray(item.ingredient)
                    ? `- ${item.ingredient.join('\n- ')}`
                    : 'No ingredients listed.'}
                </Text>
                <Text>Calories: {item.calories}</Text>
                <Text>Protein: {item.protein}g  |  Carbs: {item.carbs}g  |  Fat: {item.fat}g</Text>
                <View style={styles.selectbutton}>
                <Button
                  title="Select"
                  onPress={() =>
                    handleSelectMeal(
                      item.calories,
                      item.title,
                      item.protein,
                      item.fat,
                      item.carbs
                    )
                  }
                />
                </View>
              
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  selectbutton: {
    marginTop: 10,
    borderRadius: 5,
    padding: 5,
    marginLeft: 250,
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'white',
  },
  totalCalories: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 10,
    color: 'white',
  },
  subtitle: {
    color: 'gray',
  },
  mealCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    borderBottomColor: 'black',
    borderBottomWidth: 2,
    marginTop: 20,
  },
});
