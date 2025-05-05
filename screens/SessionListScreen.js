import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { getSessionDetails } from '../database/WorkoutLog';
import { useNavigation } from '@react-navigation/native';

export default function SessionListScreen() {
    const [sessions, setSessions] = useState([]);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchSessions = async () => {
            console.log('setting session details');
            const data = await getSessionDetails();
            setSessions(data);
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

    return (
        <View style={styles.container}>
            <FlatList
                data={sessions}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListEmptyComponent={<Text style={styles.emptyText}>No sessions found.</Text>}
            />
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
});
