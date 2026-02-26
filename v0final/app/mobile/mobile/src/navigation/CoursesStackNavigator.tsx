import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CoursesScreen from '../screens/Courses/CoursesScreen';
import CourseDetailScreen from '../screens/Courses/CourseDetailScreen';
import LessonScreen from '../screens/Courses/LessonScreen';

const Stack = createNativeStackNavigator();

export default function CoursesStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="CoursesMain" component={CoursesScreen} />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
      <Stack.Screen name="Lesson" component={LessonScreen} />
    </Stack.Navigator>
  );
}
