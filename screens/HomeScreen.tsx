//HomeScreen.tsx
import React from 'react';
import { View, Text, Button, useColorScheme, ScrollView, StatusBar, StyleSheet, Modal } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

const HomeScreen = ({ navigation }: any) => {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  const [modalVisible, setModalVisible] = React.useState(false);
  const [mealModalVisible, setMealModalVisible] = React.useState(false);

  const toggleModal = (visible: boolean) => {
    setModalVisible(visible);
  };

  const fill = 60; // Example fill percentage
  const toggleMealModal = (visible: boolean) => {
    setMealModalVisible(visible);
  };

  return (
<View>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>This is the Home Screen</Text>

            <Button
              title="Create a new personalised diet"
              onPress={() => navigation.navigate('New')}
              accessibilityLabel="Create a new personalised diet"
            />
            <Button
              title="View current plan"
              onPress={() => navigation.navigate('Current')}
              accessibilityLabel="View current plan"
            />

            <View style={styles.progress}>
            <AnimatedCircularProgress
                size={250}
                width={20}
                fill={fill}
                tintColor="#00e0ff"
                backgroundColor="#3d5875"
                onAnimationComplete={() => console.log('onAnimationComplete')}
              />
              <Text style={styles.calorie}>Calories:</Text>
              <Text style={styles.calorie1}> 1,106</Text>
            </View>

            {/* First Modal */}
            <Modal
              visible={modalVisible}
              animationType="slide"
              transparent = {true}
              onRequestClose={() => {
                console.log("Modal has been closed.");
                toggleModal(false);
              }}
            >
              <View style={styles.modal1}>
              <View style={styles.modalContent}>
              <View style={styles.closeButton}>
              <Button
                  title="X"
                  onPress={() => toggleModal(false)}
                />
                </View>
                <Text style={styles.text}>text heree</Text>
                <Text style={styles.text}>text heree</Text>
                <Text style={styles.text}>text heree</Text>
                <Text style={styles.text}>text heree</Text>
                <Text style={styles.text}>text heree</Text>
                <Text style={styles.text}>text heree</Text>
                <Text style={styles.text}>text heree</Text>
                
                </View>
              </View>
            </Modal>

            {/* Second Modal */}
            <Modal
              visible={mealModalVisible}
              animationType="slide"
              transparent = {true}
              onRequestClose={() => {
                console.log("Meal Modal has been closed.");
                toggleMealModal(false);
              }}
            >
              <View style={styles.modal1}>
              <View style={styles.modalContent}>
              <View style={styles.closeButton}>
              <Button
                  title="X"
                  onPress={() => toggleMealModal(false)}
                />
                </View>
                <Text style={styles.text}>text here!</Text>
                <Text style={styles.text}>text here!</Text>
                <Text style={styles.text}>text here!</Text>

                
                </View>
              </View>
            </Modal>
          </View>

          <View style={styles.button2}>
            <Button
              color="red"
              title="Select Meal"
              onPress={() => toggleMealModal(true)}
              accessibilityLabel="Navigate to the fourth page"
            />
          </View>

          <View style={styles.button3}>
            <Button
              title="Add Calories Manually"
              onPress={() => toggleModal(true)}
            />
          </View>

          <View style={styles.log}>
            <Text>jfeijfie</Text>
            <Text>jfeiejfie</Text>
            <Text>jffeijfie</Text>
            <Text>jfeigjfie</Text>
            <Text>jfeihjfie</Text>
            <Text>jfetijfie</Text>
            <Text>jfecijfie</Text>
            <Text>jfeiyyjfie</Text>
            <Text>jfeijujfie</Text>
            <Text>jfeidejfie</Text>
            <Text>jfeidcjfie</Text>
            <Text>jfeicvjfie</Text>
            <Text>jfeicvjfie</Text>
            <Text>jfevbijfie</Text>
            <Text>jfengijfie</Text>
            <Text>jfehgijfie</Text>
            <Text>jfeiujjfie</Text>
            <Text>jfeiujjujfie</Text>
          </View>
        </View>
      </ScrollView>


      </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 40,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderWidth: 1,
    backgroundColor: 'black',
    alignItems: 'center',
  },
  progress: {
    alignItems: 'center',
    marginTop: 20,
  },
  calorie: {
    marginTop: -170,
    fontSize: 35,
  },
  calorie1: {
    fontSize: 30,
  },
  button2: {
    marginTop: 120,
    marginLeft: -200,
  },
  button3: {
    marginLeft: 160,
    marginTop: -38,
    width: 200,
  },
  log: {
    marginLeft: 20,
  },
  modal1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 30,

  },
  modalContent: {
    width: 300,
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  text: {
    fontSize: 18,
    color: 'black',
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    marginLeft: 230,
  }
});

export default HomeScreen;
