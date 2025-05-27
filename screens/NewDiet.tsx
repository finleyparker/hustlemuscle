import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { db, auth } from '../database/firebase';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';

export default function NewDiet() {
  const userId = auth.currentUser?.uid;
      if (!userId) {
        console.error('No user is signed in');
        return;
      }

      const fetchMeals = async () => {
        try {
          const snapshot = await getDocs(collection(db, 'UserDetails', userId, 'days'));
          const meals = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }));
          console.log('All meals:', meals);
          meals.sort((a, b) => b.id.localeCompare(a.id));
          return meals;
        } catch (error) {
          console.error('Error fetching meals:', error);
          return [];
        }
      };
      const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMeals = async () => {
      const data = await fetchMeals();
      setMeals(data);
      setLoading(false);
    };
    loadMeals();
  }, []);
    return (
        <><View style={styles.container}>
          <View>
        <Text style={styles.title1}>Macro History</Text>
      </View>
          {loading ? (
            <Text>Loading...</Text>
          ) : (
            <FlatList
              data={meals}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <Text style={styles.title}>Date: {item.id}</Text>
                  <Text>Calories: {item.totalCalories}</Text>
                  <Text>Carbs: {item.totalCarbs}</Text>
                  <Text>Protein: {item.totalProtein}</Text>
                  <Text>Fat: {item.totalFats}</Text>
                 
                </View>
              )} />
          )}
        </View></>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'black',
  },
  card: {
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
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  title1: {
    fontSize: 22,
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
});



