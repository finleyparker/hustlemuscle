import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { getWorkoutTimeline } from "../database/WorkoutTimeline";
import { registerSessionRefreshCallback } from "../utils/sessionManager";

const WorkoutScreen = () => {
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [workout, setWorkout] = useState(null);

  const fetchWorkout = async () => {
    try {
      setLoading(true);
      const timelineData = await getWorkoutTimeline();
      console.log('Raw timeline data:', JSON.stringify(timelineData, null, 2));
      
      if (timelineData && timelineData.exercises) {
        console.log('Number of exercises found:', timelineData.exercises.length);
        
        // Find incomplete workouts and sort by date (earliest first)
        const incompleteWorkouts = timelineData.exercises
          .filter((ex) => {
            console.log('Exercise date:', ex.date, 'completion status:', ex.completionStatus);
            return ex.completionStatus === "incomplete";
          })
          .sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateA - dateB; // Sort ascending (earliest first)
          });

        console.log('Number of incomplete workouts:', incompleteWorkouts.length);
        if (incompleteWorkouts.length > 0) {
          console.log('Earliest incomplete workout:', JSON.stringify(incompleteWorkouts[0], null, 2));
          setWorkout(incompleteWorkouts[0]);
        } else {
          console.log('No incomplete workouts found');
          setWorkout(null);
        }
      } else {
        console.log('No timeline data or exercises found');
        setWorkout(null);
      }
    } catch (error) {
      console.error("Error fetching workout:", error);
      setWorkout(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchWorkout();

    // Register for session refreshes
    const unregister = registerSessionRefreshCallback(fetchWorkout);

    // Cleanup on unmount
    return () => {
      unregister();
    };
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading workout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!workout) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.heading}>No workouts available</Text>
          <TouchableOpacity onPress={() => navigation.navigate("WorkoutPlan")}>
            <Text style={styles.noWorkoutText}>
              Start a new workout plan to begin your fitness journey!
            </Text>
          </TouchableOpacity>
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
            Started on : {workout?.startDate || "N/A"}
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
        <Text style={styles.heading}>Your Next Workout:</Text>
        <View style={styles.programBox}>
          <Text style={styles.programName}>{workout.workoutTitle}</Text>
          <View style={styles.exerciseList}>
            {workout.exercises.map((ex, idx) => (
              <Text key={idx} style={styles.exerciseName}>
                {ex.exerciseName}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => navigation.navigate("WorkoutLog")} //, { sessionId: workout.id })}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
  noWorkoutText: {
    color: "#888",
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
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
    backgroundColor: "#1a1a1c",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  exerciseCardPressed: {
    backgroundColor: "#232325",
    transform: [{ scale: 0.98 }],
  },
  exerciseInfo: {
    gap: 4,
  },
  exerciseName: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 8,
  },
  exerciseSets: {
    color: "#bbb",
    fontSize: 15,
  },
  exerciseReps: {
    color: "#bbb",
    fontSize: 15,
  },
  instructionsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  instructionsTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  instructionText: {
    color: "#bbb",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 2,
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
