import React, { useEffect, useState } from "react";
import {
  View,
  Modal,
  Button,
  Text,
  Image,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar,
  SafeAreaView,
} from "react-native";
import {
  getExerciseIDFromSession,
  getExerciseNamesFromSession,
  getSessionName,
  updateExerciseCompletion,
  updateSessionCompletion,
} from "../database/WorkoutDB";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getExerciseInstructions } from "../api/exercises";
import { getUserID } from "../database/UserDB";

export default function WorkoutLogScreen() {
  const [exercises, setExercises] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [instructions, setInstructions] = useState(null);
  const [sessionName, setSessionName] = useState("");
  const route = useRoute();
  const sessionId = route.params?.sessionId;
  const navigation = useNavigation();

  useEffect(() => {
    const fetchSessionDetails = async () => {
      const user_id = await getUserID();
      const today = new Date().toISOString().split("T")[0]; // e.g., "2025-06-16"
      const exercisesFromDB = await getExercisesFromWorkoutTimeline(
        user_id,
        today
      );

      const formatted = exercisesFromDB.map((exercise, index) => ({
        exercise_id: exercise.id || index.toString(),
        name: exercise.exerciseName || "Unknown",
        sets: [
          {
            reps: exercise.instructions?.reps?.toString() || "",
            weight: exercise.instructions?.weight?.toString() || "",
          },
        ],
      }));

      setExercises(formatted);
      setLoading(false);
    };

    fetchSessionDetails();
  }, []);

  const handleInputChange = (exerciseIndex, setIndex, field, value) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets[setIndex][field] = value;
    setExercises(updated);
  };

  const openDetails = async (exercise) => {
    //make details pop up screen visible
    setModalVisible(true);
    //current exercise
    setSelectedExercise(exercise);
    try {
      //get the instructions of the selected exercise
      const result = await getExerciseInstructions(exercise.exercise_id);
      //set instructions
      setInstructions(result || ["No Instructions Found."]);
    } catch (error) {
      console.error("Failed to fetch instructions:", error);
      setInstructions(["Instructions unavailable."]);
    }
  };

  const handleRemoveSet = (exerciseIndex, setIndex) => {
    const updated = [...exercises];
    if (updated[exerciseIndex].sets.length > 1) {
      updated[exerciseIndex].sets.splice(setIndex, 1);
      setExercises(updated);
    }
  };

  const handleAddSet = (exerciseIndex) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets.push({ reps: "", weight: "" });
    setExercises(updated);
  };

  const handleSaveSession = async () => {
    try {
      //get user id
      const user_id = await getUserID();
      console.log("user id: ", user_id);

      //date
      const completion_date = new Date();
      completion_date.setSeconds(0, 0);
      console.log("exercise_completion date: ", completion_date);

      //save exercise completion details
      const completions = exercises.map((exercise) => ({
        workout_session_id: sessionId,
        exercise_id: exercise.exercise_id || exercise.name,
        sets: exercise.sets.length,
        reps: exercise.sets.map((set) => parseInt(set.reps) || 0),
        weights: exercise.sets.map((set) => parseFloat(set.weight) || 0),
        completion_date: completion_date,
        user_id: user_id,
      }));

      // Save exercise completions first
      await saveUpdatedTimeline(user_id, today, exercises);

      // Then mark the session as completed
      //await updateSessionCompletion(sessionId);

      alert("Workout saved successfully!");
      navigation.navigate("Home");
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save workout. Please try again.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container2}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#446df6" />
          <Text style={{ color: "#fff", marginTop: 10 }}>
            Loading workout...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container2}>
      {/* Exercise details modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.container3}>
          <View style={styles.detailsScreen}>
            {/* Exercise name */}
            <Text style={styles.exerciseDetailsName}>
              {selectedExercise?.name || "No Exercise Selected."}
            </Text>
            {/* Exercise images */}
            <View style={styles.exerciseImageRow} testID="exerciseImage">
              <Image
                style={styles.exerciseImage}
                source={{
                  //example image
                  uri:
                    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/" +
                    selectedExercise?.exercise_id +
                    "/0.jpg",
                }}
              ></Image>
              <Image
                style={styles.exerciseImage}
                source={{
                  //example image
                  uri:
                    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/" +
                    selectedExercise?.exercise_id +
                    "/1.jpg",
                }}
              ></Image>
            </View>
            {/* Exercise instructions */}
            <ScrollView
              testID="exerciseInstructions"
              style={styles.exerciseInstructionsContainer}
            >
              {instructions && instructions.length > 0 ? (
                instructions.map((step, index) => (
                  <Text key={index} style={styles.exerciseInstructionsText}>
                    {index + 1}. {step}
                  </Text>
                ))
              ) : (
                <Text style={styles.exerciseInstructionsText}>
                  Loading instructions...
                </Text>
              )}
            </ScrollView>

            {/* close button */}
            <TouchableOpacity
              //when pressed open details pop-up
              onPress={() => setModalVisible(false)}
              style={styles.closeDetailsButton}
            >
              <Text style={styles.closeDetailsIcon}>X</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* main session list */}
      <ScrollView style={styles.planContainer}>
        {/* Workout Details */}
        <View style={styles.workoutDetails}>
          <Text style={styles.workoutTodayText}>Today's Workout:</Text>
          <Text style={styles.workoutTitle}>{sessionName}</Text>
        </View>

        {exercises.map((exercise, exerciseIndex) => (
          <View key={exerciseIndex} style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <TouchableOpacity
              //when pressed open details pop-up
              onPress={() => openDetails(exercise)}
              style={styles.detailsButton}
              testID="detailsButton"
            >
              <Text style={styles.detailsIcon}>i</Text>
            </TouchableOpacity>
            {exercise.sets.map((set, setIndex) => (
              <View key={setIndex} style={styles.inputRow}>
                <Text style={styles.label}>Set {setIndex + 1}:</Text>

                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="Reps"
                  value={set.reps}
                  onChangeText={(value) =>
                    handleInputChange(exerciseIndex, setIndex, "reps", value)
                  }
                />
                <Text style={styles.label}>reps</Text>

                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="Weight"
                  value={set.weight}
                  onChangeText={(value) =>
                    handleInputChange(exerciseIndex, setIndex, "weight", value)
                  }
                />
                <Text style={styles.label}>kg</Text>

                {exercise.sets.length > 1 && (
                  <TouchableOpacity
                    onPress={() => handleRemoveSet(exerciseIndex, setIndex)}
                    style={styles.removeSetButton}
                  >
                    <Text style={styles.removeSetText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <TouchableOpacity
              style={styles.addSetButton}
              onPress={() => handleAddSet(exerciseIndex)}
            >
              <Text style={styles.addSetText}>+ Add Set</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          style={styles.endWorkoutButton}
          onPress={handleSaveSession}
        >
          <Text style={styles.endWorkoutText}>Finish Workout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  exerciseImageRow: {
    flexDirection: "row",
    justifyContent: "space-between", // or 'center' / 'flex-start'
    paddingHorizontal: 10,
    marginTop: 10,
  },

  exerciseImage: {
    width: 150,
    height: 150,
    resizeMode: "cover", // or 'contain' if you want to preserve aspect
    marginHorizontal: 5,
  },

  exerciseInstructionsContainer: {
    marginTop: 15,
    paddingHorizontal: 10,
    alignSelf: "stretch",
  },
  exerciseInstructionsText: {
    fontSize: 15,
    color: "#fff",
    lineHeight: 22,
    marginBottom: 8,
  },
  closeDetailsButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#446df6",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  closeDetailsIcon: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  exerciseDetailsName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#fff",
  },

  container3: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)", // 50% opacity black
  },
  detailsScreen: {
    alignItems: "center",
    //justifyContent: 'center',
    width: "90%",
    height: "70%",
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#333",
  },
  detailsButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#446df6",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  detailsIcon: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  container2: {
    backgroundColor: "#000", // Black background for the whole screen
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 20,
    flex: 1,
  },
  planContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#000", // Set the background of the workout plan container to black
  },
  exerciseCard: {
    marginBottom: 15,
    backgroundColor: "#333", // Dark grey background for each exercise card
    borderRadius: 10,
    padding: 15,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#fff", // White color for the exercise name
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 10,
    width: 90,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    textAlign: "center",
  },
  header: {
    backgroundColor: "#000", // Black background for header
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backText: {
    color: "#446df6", // Text color for back button
    fontSize: 16,
  },
  headerTitle: {
    color: "#fff", // White color for the header title
    fontSize: 18,
    fontWeight: "bold",
  },
  label: {
    fontSize: 16,
    color: "#fff", // White color for labels
  },
  addSetButton: {
    marginTop: 5,
    alignSelf: "flex-start",
    backgroundColor: "#007AFF", // Blue button color
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
  },
  addSetText: {
    color: "#fff", // White text on add set button
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: "#446df6",
    padding: 10,
    marginTop: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  endWorkoutButton: {
    backgroundColor: "#888", // Grey button for end workout
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40, // gives space at the end
  },
  removeSetButton: {
    marginLeft: 5,
    backgroundColor: "#ff6b6b", // Light red button for removing sets
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  removeSetText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  endWorkoutText: {
    color: "#fff", // White text on end workout button
    fontSize: 16,
    fontWeight: "bold",
  },
  headerContainer: {
    // New style for header container
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backArrow: {
    // New style for back arrow
    color: "#fff",
    fontSize: 24,
    marginRight: 15,
  },
  workoutDetails: {
    // New style for workout details container
    marginBottom: 20,
  },
  workoutTodayText: {
    // New style for "Today's Workout" text
    color: "#ccc",
    fontSize: 16,
  },
  workoutTitle: {
    // Existing style, might need adjustment
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});
