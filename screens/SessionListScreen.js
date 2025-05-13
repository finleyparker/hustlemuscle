import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { getSessionDetails } from '../database/WorkoutDB';
import { useNavigation } from '@react-navigation/native';

export default function SessionListScreen() {
    const [sessions, setSessions] = useState([]);
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchSessions = async () => {
            console.log('setting session details');
            const data = await getSessionDetails();
            setSessions(data);
            setLoading(false);
        };
        fetchSessions();
    }, []);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('WorkoutLog', { sessionId: item.id })}
        >
            <Text style={styles.cardTitle}>{item.session_name || item.workout_plan_id}</Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#446df6" />
                    <Text style={{ color: '#fff', marginTop: -100 }}>Loading sessions...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={sessions}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListEmptyComponent={<Text style={styles.emptyText}>No sessions found.</Text>}
            />
            <TouchableOpacity
                style={styles.newPlanButton}
                //go to onboarding screen, but skip gender
                onPress={() => navigation.navigate('Equipment')}
            >
                <Text style={styles.newPlanText}>Create New Workout Plan</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0c0f0A', padding: 20 },
    card: {
        backgroundColor: '#446df6',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
    },
    cardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    emptyText: { color: '#fff', textAlign: 'center', marginTop: 20 },
    newPlanButton: {
        backgroundColor: '#e3f900', // or another suitable color
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    newPlanText: {
        color: '#black',
        fontSize: 16,
        fontWeight: 'bold',
    },

});
