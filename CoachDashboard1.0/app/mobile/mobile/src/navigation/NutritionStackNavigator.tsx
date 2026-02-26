import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NutritionScreen from '../screens/Nutrition/NutritionScreen';
import AddFoodScreen from '../screens/Nutrition/AddFoodScreen';
import FoodSearchScreen from '../screens/Nutrition/FoodSearchScreen';
import FoodDetailScreen from '../screens/Nutrition/FoodDetailScreen';
import BarcodeScannerScreen from '../screens/Nutrition/BarcodeScannerScreen';
import MealPlanScreen from '../screens/Nutrition/MealPlanScreen';
import ShoppingListScreen from '../screens/Nutrition/ShoppingListScreen';

const Stack = createNativeStackNavigator();

export default function NutritionStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="NutritionHome" component={NutritionScreen} />
      <Stack.Screen name="AddFood" component={AddFoodScreen} />
      <Stack.Screen name="FoodSearch" component={FoodSearchScreen} />
      <Stack.Screen name="FoodDetail" component={FoodDetailScreen} />
      <Stack.Screen name="MealPlan" component={MealPlanScreen} />
      <Stack.Screen name="ShoppingList" component={ShoppingListScreen} />
      <Stack.Screen
        name="BarcodeScanner"
        component={BarcodeScannerScreen}
        options={{ presentation: 'fullScreenModal' }}
      />
    </Stack.Navigator>
  );
}
