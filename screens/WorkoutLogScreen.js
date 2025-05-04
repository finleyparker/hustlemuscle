import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getWorkoutPlans, updateWorkoutPlan } from '../database/WorkoutLog';

export default function WorkoutLogScreen() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            const data = await getWorkoutPlans();
            setPlans(data);
            setLoading(false);
        };

        fetchPlans();
    }, []);

    const handleValueChange = (planId, index, field, value) => {
        const updatedPlans = plans.map(plan => {
            if (plan.id === planId) {
                const updatedExercises = [...plan.exercises];
                updatedExercises[index][field] = value;
                return { ...plan, exercises: updatedExercises };
            }
            return plan;
        });
        setPlans(updatedPlans);
    };

    const handleSave = async (planId, exercises) => {
        await updateWorkoutPlan(planId, exercises);
        alert('Workout plan saved!');
    };

    if (loading) return <ActivityIndicator size="large" color="#446df6" />;

    return (
        <FlatList
            data={plans}
            keyExtractor={item => item.id}
            renderItem={({ item: plan }) => (
                <View style={styles.planContainer}>
                    <Text style={styles.planTitle}>{plan.name}</Text>
                    {plan.exercises.map((exercise, index) => (
                        <View key={index} style={styles.exerciseCard}>
                            <Text style={styles.exerciseName}>{exercise.exercise_name}</Text>
                            <View style={styles.inputRow}>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    value={String(exercise.sets)}
                                    onChangeText={value => handleValueChange(plan.id, index, 'sets', value)}
                                />
                                <Text style={styles.label}>sets</Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType="numeric"
                                    value={String(exercise.reps)}
                                    onChangeText={value => handleValueChange(plan.id, index, 'reps', value)}
                                />
                                <Text style={styles.label}>reps</Text>
                            </View>
                        </View>
                    ))}
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={() => handleSave(plan.id, plan.exercises)}
                    >
                        <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                </View>
            )}
        />
    );
}

const styles = StyleSheet.create({
    planContainer: { padding: 20, borderBottomWidth: 1, borderColor: '#ddd' },
    planTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
    exerciseCard: { marginBottom: 15, backgroundColor: '#f0f0f0', borderRadius: 10, padding: 15 },
    exerciseName: { fontSize: 18, fontWeight: '600' },
    inputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
    input: { backgroundColor: '#fff', borderRadius: 5, padding: 10, width: 60, marginHorizontal: 5 },
    label: { fontSize: 16 },
    saveButton: {
        backgroundColor: '#446df6',
        padding: 10,
        marginTop: 10,
        borderRadius: 5,
        alignItems: 'center'
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16
    }
});