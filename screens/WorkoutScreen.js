import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { getSessionDetails } from "../database/WorkoutDB";
import { useNavigation } from "@react-navigation/native";

const WorkoutScreen = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchSession = async () => {
      console.log("Fetching session details...");
      const data = await getSessionDetails();
      setSession(data);
      setLoading(false);
    };
    fetchSession();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: "#fff", marginTop: 10 }}>
            Loading workout...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Program Info */}
        <Text style={styles.heading}>Your program:</Text>
        <TouchableOpacity
          style={styles.programBox}
          onPress={() => navigation.navigate("WorkoutPlan")}
          activeOpacity={0.85}
        >
          <Text style={styles.programName}>
            3-Day a Week Muscle Gain Program
          </Text>
          <Text style={styles.programDate}>
            Started on : {session?.startDate || "N/A"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => {
            // Optional reset logic
          }}
        >
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>

        {/* Today's Workout */}
        <Text style={styles.heading}>Today's Workout:</Text>
        <Text style={styles.workoutTitle}>{session?.dayName || "Day #X"}</Text>

        <View style={styles.exerciseList}>
          {session?.exercises?.map((ex, idx) => (
            <View key={idx} style={styles.exerciseCard}>
              <View>
                <Text style={styles.exerciseName}>{ex.exerciseName}</Text>
                <Text style={styles.exerciseSets}>
                  Sets: {ex.instructions?.sets || 0}
                </Text>
              </View>
              <Text style={styles.exerciseReps}>
                Reps: {ex.instructions?.reps || 0}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.startButton}
        onPress={() => navigation.navigate("WorkoutLog")}
      >
        <Text style={styles.startButtonText}>Start Now</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    backgroundColor: "#000",
  },
  heading: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 2,
    marginBottom: 6,
    marginTop: 8,
  },
  programBox: {
    backgroundColor: "#232325",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  programName: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 4,
  },
  programDate: {
    color: "#888",
    fontSize: 13,
    marginTop: 2,
  },
  resetButton: {
    alignSelf: "center",
    marginTop: 2,
    marginBottom: 10,
  },
  resetText: {
    color: "#bbb",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  workoutTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 14,
  },
  exerciseList: {
    gap: 10,
  },
  exerciseCard: {
    backgroundColor: "#232325",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  exerciseName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  exerciseSets: {
    color: "#bbb",
    fontSize: 13,
    marginTop: 2,
  },
  exerciseReps: {
    color: "#bbb",
    fontSize: 15,
    fontWeight: "500",
  },
  startButton: {
    backgroundColor: "#d3d3d3",
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 18,
    paddingVertical: 14,
    alignItems: "center",
  },
  startButtonText: {
    color: "#222",
    fontSize: 17,
    fontWeight: "bold",
  },
});

export default WorkoutScreen;
