import { Stack, Redirect } from 'expo-router';

import {
  ActivityIndicator,
  View,
} from 'react-native';

import { useAuth } from '../context/AuthContext';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#050816',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator
          size="large"
          color="#FF174D"
        />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)/team" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}