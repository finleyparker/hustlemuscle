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
import { getSessionDetails } from "../database/WorkoutDB";

const WorkoutScreen = () => {
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [workout, setWorkout] = useState(null);

  useEffect(() => {
    const fetchWorkout = async () => {
      try {
        const timelineData = await getWorkoutTimeline();
        if (timelineData && timelineData.exercises) {
          // Find the most recent incomplete workout
          const incompleteWorkouts = timelineData.exercises
            .filter((ex) => ex.completionStatus === "incomplete")
            .sort((a, b) => new Date(b.date) - new Date(a.date));

          if (incompleteWorkouts.length > 0) {
            setWorkout(incompleteWorkouts[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching workout:", error);
      } finally {
        setLoading(false);
      }
    };
    console.log("workout: ", workout);
    //console.log("workout.id: ", workout.id);
    fetchWorkout();
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
          <Text style={styles.noWorkoutText}>
            Start a new workout plan to begin your fitness journey!
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
              <Pressable
                key={idx}
                style={({ pressed }) => [
                  styles.exerciseCard,
                  pressed && styles.exerciseCardPressed,
                ]}
                onPress={() => {
                  console.log("Exercise pressed:", ex.exerciseName);
                }}
              >
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{ex.exerciseName}</Text>
                  <Text style={styles.exerciseSets}>
                    Sets: {ex.suggestedSets}
                  </Text>
                  <Text style={styles.exerciseReps}>
                    Reps: {ex.suggestedReps}
                  </Text>
                  {ex.instructions && ex.instructions.length > 0 && (
                    <View style={styles.instructionsContainer}>
                      <Text style={styles.instructionsTitle}>
                        Instructions:
                      </Text>
                      {ex.instructions.map((instruction, i) => (
                        <Text key={i} style={styles.instructionText}>
                          • {instruction}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              </Pressable>
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
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
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
