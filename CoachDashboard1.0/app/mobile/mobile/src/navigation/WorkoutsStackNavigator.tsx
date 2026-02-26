import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WorkoutsScreen from '../screens/Workouts/WorkoutsScreen';
import WorkoutDetailScreen from '../screens/Workouts/WorkoutDetailScreen';
import ActiveWorkoutScreen from '../screens/Workouts/ActiveWorkoutScreen';
import ProgramsScreen from '../screens/Programs/ProgramsScreen';
import ProgramDetailScreen from '../screens/Programs/ProgramDetailScreen';

const Stack = createNativeStackNavigator();

export default function WorkoutsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="WorkoutsList" component={WorkoutsScreen} />
      <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
      <Stack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} />
      <Stack.Screen name="Programs" component={ProgramsScreen} />
      <Stack.Screen name="ProgramDetail" component={ProgramDetailScreen} />
    </Stack.Navigator>
  );
}
