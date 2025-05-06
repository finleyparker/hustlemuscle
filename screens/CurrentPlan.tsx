import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Adjust path if needed

interface FoodItem {
  id: string;
  type: string;
  title: string;
  ingredient: string[];
  calories: number;
}

interface DietPlan {
  dietRestriction: string;
  totalCalories?: number;
}

export default function App() {
  const [hello, setHello] = useState<FoodItem[]>([]);
  const [userDietRestriction, setUserDietRestriction] = useState<string>('');
  const [totalCalories, setTotalCalories] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Hardcoded user ID for testing
  const userId = '1212'; // Replace with Firebase Auth UID

  useEffect(() => {
    const fetchUserDiet = async () => {
      try {
        const dietPlanDocRef = doc(db, 'dietPlans', userId);
        const dietPlanDoc = await getDoc(dietPlanDocRef);

        if (dietPlanDoc.exists()) {
          const dietPlanData = dietPlanDoc.data() as DietPlan;
          setUserDietRestriction(dietPlanData.dietRestriction);
          setTotalCalories(dietPlanData.totalCalories || 0);
        } else {
          console.log('No diet plan found for this user');
        }
      } catch (error) {
        console.error('Error fetching user diet plan:', error);
      }
    };

    const fetchHello = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'meals'));
        const helloData: FoodItem[] = [];
        querySnapshot.forEach((doc) => {
          helloData.push({ id: doc.id, ...doc.data() } as FoodItem);
        });
        setHello(helloData);
      } catch (error) {
        console.error('Error loading meals: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDiet();
    fetchHello();
  }, []);

  // Filter food items based on diet restriction
  const filteredDiet = userDietRestriction === 'none'
  ? hello // Show all meals
  : hello.filter(item => item.type === userDietRestriction);

  // Handle meal selection
  const handleSelectMeal = async (calories: number, title: string) => {
    const newTotal = totalCalories + calories;
    setTotalCalories(newTotal);
  
    const dietPlanRef = doc(db, 'dietPlans', userId);
  
    try {
      const docSnap = await getDoc(dietPlanRef);
      let updatedMeals: { name: string; calories: number }[] = [];
if (docSnap.exists()) {
  const data = docSnap.data() as DietPlan & { selectedMeals?: { name: string; calories: number }[] };
  const currentMeals = data.selectedMeals || [];
  updatedMeals = [...currentMeals, { name: title, calories }];
} else {
  updatedMeals = [{ name: title, calories }];
}

  
      await updateDoc(dietPlanRef, {
        totalCalories: newTotal,
        selectedMeals: updatedMeals,
      });
    } catch (error) {
      console.error('Error updating meal selection:', error);
    }
  };
  

  return (
    <View style={{ flex: 1, paddingTop: 50, paddingHorizontal: 16 }}>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <>
          <Text style={styles.title}>Dietary Restrictions: {userDietRestriction}</Text>
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
                <Button title="Select" onPress={() => handleSelectMeal(item.calories, item.title)} />

                <View style={styles.divider} />
              </View>
            )}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  totalCalories: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 10,
  },
  subtitle: {
    marginLeft: 10,
    color: 'gray',
  },
  mealCard: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
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
