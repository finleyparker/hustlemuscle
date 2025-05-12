import React, { useEffect, useState } from 'react';
import {
    View, Text, TextInput, ScrollView,
    StyleSheet, TouchableOpacity, ActivityIndicator, Platform, StatusBar, SafeAreaView
} from 'react-native';
import { getExerciseNamesFromSession, getSessionName, updateExerciseCompletion } from '../database/WorkoutDB';
import { useNavigation, useRoute } from '@react-navigation/native';


export default function WorkoutLogScreen() {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const route = useRoute();
    const sessionId = route.params?.sessionId;
    const navigation = useNavigation();

    useEffect(() => {
        const fetchSessionDetails = async () => {
            const session_name = await getSessionName(sessionId);
            navigation.setOptions({ title: `Current Session: ${session_name}` });

            //get each exercise name
            const names = await getExerciseNamesFromSession(sessionId);
            const formatted = names.map(name => ({
                name,
                sets: [{ reps: '', weight: '' }] // start with 1 set per exercise
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

    const handleRemoveSet = (exerciseIndex, setIndex) => {
        const updated = [...exercises];
        if (updated[exerciseIndex].sets.length > 1) {
            updated[exerciseIndex].sets.splice(setIndex, 1);
            setExercises(updated);
        }
    };

    const handleAddSet = (exerciseIndex) => {
        const updated = [...exercises];
        updated[exerciseIndex].sets.push({ reps: '', weight: '' });
        setExercises(updated);
    };

    const handleSave = async () => {
        const completions = exercises.map((exercise) => ({
            workout_session_id: sessionId,
            exercise_id: exercise.exercise_id || exercise.name, // fallback if no ID
            sets: exercise.sets.length,
            reps: exercise.sets.map(set => parseInt(set.reps) || 0),
            weights: exercise.sets.map(set => parseFloat(set.weight) || 0),
            duration: null,
            isComplete: exercise.sets.every(set => set.reps && set.weight)
        }));

        try {
            await updateExerciseCompletion(completions);
            alert('Workout saved!');
            navigation.navigate('Home');
        } catch (error) {
            console.error('Save error:', error);
            alert('Failed to save.');
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container2}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#446df6" />
                    <Text style={{ color: '#fff', marginTop: 10 }}>Loading workout...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container2} >

            <ScrollView style={styles.planContainer}>
                {exercises.map((exercise, exerciseIndex) => (
                    <View key={exerciseIndex} style={styles.exerciseCard}>
                        <Text style={styles.exerciseName}>{exercise.name}</Text>

                        {exercise.sets.map((set, setIndex) => (
                            <View key={setIndex} style={styles.inputRow}>
                                <Text style={styles.label}>Set {setIndex + 1}:</Text>

                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    placeholder="Reps"
                                    value={set.reps}
                                    onChangeText={(value) =>
                                        handleInputChange(exerciseIndex, setIndex, 'reps', value)
                                    }
                                />
                                <Text style={styles.label}>reps</Text>

                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    placeholder="Weight"
                                    value={set.weight}
                                    onChangeText={(value) =>
                                        handleInputChange(exerciseIndex, setIndex, 'weight', value)
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
                    onPress={handleSave}
                >
                    <Text style={styles.endWorkoutText}>Finish Workout</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}




const styles = StyleSheet.create({
    container2: {
        backgroundColor: "#000", // Black background for the whole screen
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 20,
        flex: 1,
    },
    planContainer: {
        padding: 20,
        borderBottomWidth: 1,
        borderColor: '#ddd',
        backgroundColor: "#000", // Set the background of the workout plan container to black
    },
    exerciseCard: {
        marginBottom: 15,
        backgroundColor: '#333', // Dark grey background for each exercise card
        borderRadius: 10,
        padding: 15,
    },
    exerciseName: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        color: '#fff', // White color for the exercise name
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 10,
        width: 90,
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: '#ccc',
        textAlign: 'center',
    },
    header: {
        backgroundColor: '#000', // Black background for header
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 20,
        paddingBottom: 10,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backText: {
        color: '#446df6', // Text color for back button
        fontSize: 16,
    },
    headerTitle: {
        color: '#fff', // White color for the header title
        fontSize: 18,
        fontWeight: 'bold',
    },
    label: {
        fontSize: 16,
        color: '#fff', // White color for labels
    },
    addSetButton: {
        marginTop: 5,
        alignSelf: 'flex-start',
        backgroundColor: '#666', // Dark grey button color
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 5,
    },
    addSetText: {
        color: '#fff', // White text on add set button
        fontWeight: 'bold',
    },
    saveButton: {
        backgroundColor: '#446df6',
        padding: 10,
        marginTop: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    endWorkoutButton: {
        backgroundColor: '#e3f900', // Red button for end workout
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40, // gives space at the end
    },
    removeSetButton: {
        marginLeft: 5,
        backgroundColor: '#ff6b6b', // Light red button for removing sets
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeSetText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    endWorkoutText: {
        color: '#000', // White text on end workout button
        fontSize: 16,
        fontWeight: 'bold',
    },
});
