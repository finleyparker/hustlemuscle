import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Adjust the path to your firebase config

interface FoodItem {
  id: string;
  type: string;
  title: string;
  ingredient: string[];
  calories: number;
}

interface DietPlan {
  dietRestriction: string;
}

export default function App() {
  const [hello, setHello] = useState<FoodItem[]>([]);
  const [userDietRestriction, setUserDietRestriction] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Hardcoded user ID for testing purposes
  const userId = '1212'; // Replace this with actual user ID from Firebase Auth

  useEffect(() => {
    const fetchUserDiet = async () => {
      try {
        const dietPlanDocRef = doc(db, 'dietPlans', userId); // Use userId as document ID
        const dietPlanDoc = await getDoc(dietPlanDocRef);

        if (dietPlanDoc.exists()) {
          const dietPlanData = dietPlanDoc.data() as DietPlan;
          setUserDietRestriction(dietPlanData.dietRestriction); // Set the diet restriction (e.g., "Pescatarian")
        } else {
          console.log('No diet plan found for this user');
          <Text>No Diet Found</Text>
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
        console.error('Error loading posts: ', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch user diet and food data
    fetchUserDiet();
    fetchHello();
  }, []);

  // Filter the food items based on the user's diet restriction
  const filteredDiet = hello.filter(item => item.type === userDietRestriction);

  return (
    <View style={{ flex: 1, paddingTop: 50 }}>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <>
          <Text style={styles.title}>Your Diet Plan: {userDietRestriction}</Text>
          <FlatList
            data={filteredDiet}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={{ margin: 10 }}>
                <Text style={styles.subtitle}>{item.type}</Text>
                <Text style={{ fontSize: 18 }}>{item.title}</Text>
                <Text>- {item.ingredient.join('\n- ')} {/* Joining the ingredients array with a new line */}</Text>
                <Text></Text>
                <Button
                    title="select"
                />
                <View
                  style={{
                   borderBottomColor: 'black',
                    borderBottomWidth: 2,
                    marginTop: 25,
                  }}
                />
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
    fontSize: 20,
    textAlign: 'center',
  },
  subtitle: {
    marginLeft: 10,
    color: 'gray',

  }
});
