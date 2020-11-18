import React, { useState, useEffect } from 'react';
import { NavigationContainer, StackActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'native-base';

import LoginScreen from '../screens/LoginScreen';
import MainScreen from '../screens/MainScreen';
import InfoScreen from '../screens/InfoScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NauticalScreen from '../screens/NauticalScreen';
import NauticalDetails from '../screens/NauticalScreenSingle';

import { colors } from '../variables/GlobalVariables';

const AuthStack = createStackNavigator();

const AuthStackScreen = () => {
  return (
    <AuthStack.Navigator screenOptions={{
      headerStyle: { backgroundColor: colors.dark.primary },
      headerTintColor: colors.dark.tint
    }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
}

const InfoStack = createStackNavigator();

const InfoStackScreen = () => {
  return (
    <InfoStack.Navigator screenOptions={{
      headerStyle: { backgroundColor: colors.dark.primary },
      headerTintColor: colors.dark.tint
    }}>
      <InfoStack.Screen name="Info" component={InfoScreen} />
      <InfoStack.Screen name="Weather" component={InfoScreen} />
      <InfoStack.Screen name="Nautical Warnings" component={NauticalScreen} />
      <InfoStack.Screen name="Nautical Warning" component={NauticalDetails} />
    </InfoStack.Navigator>
  );
}

const SettingsStack = createStackNavigator();

const SettingsStackScreen = () => {
  return (
    <SettingsStack.Navigator screenOptions={{
      headerStyle: { backgroundColor: colors.dark.primary },
      headerTintColor: colors.dark.tint
    }}>
      <SettingsStack.Screen name="Settings" component={SettingsScreen} />
      <SettingsStack.Screen name="Theme" component={SettingsScreen} />
      <SettingsStack.Screen name="About" component={SettingsScreen} />
    </SettingsStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

const TabNavigatorScreen = () => {
  return (
    <Tab.Navigator tabBarOptions={{
      activeTintColor: colors.dark.accent,
      activeBackgroundColor: colors.dark.secondary,
      inactiveTintColor: colors.dark.tint,
      inactiveBackgroundColor: colors.dark.primary,
    }}>
      <Tab.Screen name="Map" component={MainScreen} options={{
        tabBarIcon: () => <Icon name='md-boat' style={{ color: colors.dark.tint }} />
      }} />
      <Tab.Screen name="Info" component={InfoStackScreen} options={{
        tabBarIcon: () => <Icon name="md-cloudy" style={{ color: colors.dark.tint }} />
      }} />
      <Tab.Screen name="Settings" component={SettingsStackScreen} options={{
        tabBarIcon: () => <Icon name="md-menu" style={{ color: colors.dark.tint }} />
      }} />
    </Tab.Navigator>
  );
}

const Navigation = () => {
  const isSigned = false;
  return (
    <NavigationContainer>
      {isSigned ? TabNavigatorScreen() : AuthStackScreen()}
    </NavigationContainer>
  );
}

export default Navigation;
