import React, {
  createContext,
  useState,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '../integration/authIntegration';

type AuthContextData = {
  isAuthenticated: boolean;
  user: string | null;
  userId: string | null;
  isLoading: boolean;
  signIn: (username: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      try {
        const storedUser = await AsyncStorage.getItem('@Auth:user');
        const storedUserId = await AsyncStorage.getItem('@Auth:userId');

        if (storedUser && storedUserId) {
          setUser(storedUser);
          setUserId(storedUserId);
          setIsAuthenticated(true);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadStorageData();
  }, []);

  async function signIn(username: string, password: string): Promise<boolean> {
    try {
      const response = await login(
  username.trim(),
  password.trim()
);

console.log('LOGIN API:', response);

      const id =
        response?.id ||
        response?.userId ||
        response?.uuid ||
        response?.user?.id ||
        response?.user?.userId ||
        response?.data?.id ||
        response?.data?.userId ||
        null;

      if (!id) {
        console.log('NÃO ACHEI USER ID NA RESPOSTA:', response);
        return false;
      }

      setUser(username.trim());
      setUserId(id);
      setIsAuthenticated(true);

      await AsyncStorage.setItem('@Auth:user', username.trim());
      await AsyncStorage.setItem('@Auth:userId', id);

      return true;
    } catch (error: any) {
      console.log('ERRO LOGIN:', error?.response?.data || error);
      return false;
    }
  }

  async function signOut(): Promise<void> {
    setUser(null);
    setUserId(null);
    setIsAuthenticated(false);

    await AsyncStorage.removeItem('@Auth:user');
    await AsyncStorage.removeItem('@Auth:userId');
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        userId,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}