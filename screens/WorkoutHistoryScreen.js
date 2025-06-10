import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { getCompletedSessions } from "../database/WorkoutDB";

const WorkoutHistoryScreen = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        console.log("Fetching completed sessions...");
        const data = await getCompletedSessions();
        // Sort sessions by completion date, most recent first
        const sortedData = data.sort(
          (a, b) => b.completion_date - a.completion_date
        );
        setSessions(sortedData);
      } catch (error) {
        console.error("Error fetching completed sessions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const formatDate = (date) => {
    if (!date) return "No date";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => console.log("workout session history details pressed.")}
    >
      <Text style={styles.cardTitle}>{item.workoutTitle}</Text>
      <Text style={styles.cardDate}>Date: {item.date}</Text>
      <Text style={styles.cardExercises}>
        {item.exercises?.length || 0} exercises
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#446df6" />
          <Text style={{ color: "#fff", marginTop: 10 }}>
            Loading workout history...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No completed workouts found. Complete a workout to see it here!
          </Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0c0f0A",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#446df6",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  cardDate: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 5,
  },
  cardExercises: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.8,
  },
  emptyText: {
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
});

export default WorkoutHistoryScreen;
