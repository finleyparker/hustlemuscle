import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../database/firebase';

const ProgressBar = ({ onPress }) => {
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);

  useEffect(() => {
    const fetchWorkoutProgress = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (userId) {
          const datedExercisesRef = collection(db, 'workoutTimeline', userId, 'datedExercises');
          const snapshot = await getDocs(datedExercisesRef);
          let complete = 0;
          let total = 0;
          snapshot.forEach(doc => {
            total++;
            const data = doc.data();
            if (data.completionStatus === 'complete') complete++;
          });
          setCompletedSessions(complete);
          setTotalSessions(total);
        }
      } catch (error) {
        console.error('Error fetching workout progress:', error);
      }
    };
    fetchWorkoutProgress();
  }, []);

  const progressPercentage = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

  return (
    <TouchableOpacity
      style={styles.progressPanel}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.progressPanelHeader}>
        <View>
          <Text style={styles.progressPanelLabel}>My Progress</Text>
          <Text style={styles.sessionCount}>
            {Math.round(progressPercentage)}% Complete{"\n"}
            {completedSessions} of {totalSessions} Sessions
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color="#fff" />
      </View>
      <View style={styles.progressBarContainer}>
        <LinearGradient
          colors={['#a18fff', '#e0d7ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressBar, { width: `${progressPercentage}%` }]}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  progressPanel: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    gap: 12,
  },
  progressPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressPanelLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sessionCount: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 4,
  },
  progressBarContainer: {
    height: 14,
    borderRadius: 7,
    width: '100%',
    backgroundColor: '#2a2a2d',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 7,
  },
});

export default ProgressBar; 