import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AboutScreen = ({ navigation }) => {
    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.content}>
                <Text style={styles.title}>About HustleMuscle</Text>
                <Text style={styles.paragraph}>
                    HustleMuscle is your personal fitness and diet planning assistant. Track your workouts, monitor your meals, and stay committed to your goals — all in one place.
                </Text>
                <Text style={styles.paragraph}>
                    This app was built with React Native, Firebase, and a whole lot of hustle 💪
                </Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
    backButton: {
        padding: 16,
        position: 'absolute',
        top: 60,
        left: 10,
        zIndex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 120,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    paragraph: {
        color: '#CCCCCC',
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 16,
    },
});

export default AboutScreen;
