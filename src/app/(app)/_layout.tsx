import { useEffect } from 'react';

import { Stack, Redirect } from 'expo-router';

import {
  ActivityIndicator,
  View,
  Alert,
} from 'react-native';

import { useAuth } from '../context/AuthContext';

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      Alert.alert(
        'Login necessário',
        'Você precisa fazer login para acessar esta página.'
      );
    }
  }, [isAuthenticated, isLoading]);

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

  if (!isAuthenticated) {
    return <Redirect href="/(auth)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}