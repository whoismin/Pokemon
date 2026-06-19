import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import { router } from 'expo-router';

import { styles } from './style';

type Props = {
  usuario: string;
  senha: string;
  setUsuario: (value: string) => void;
  setSenha: (value: string) => void;
  entrar: () => void;
};

export default function Card({
  usuario,
  senha,
  setUsuario,
  setSenha,
  entrar,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>USUÁRIO</Text>

      <TextInput
        style={styles.input}
        placeholder="Usuário"
        placeholderTextColor="#8B8EA8"
        value={usuario}
        onChangeText={setUsuario}
      />

      <Text style={styles.label}>SENHA</Text>

      <TextInput
        style={styles.input}
        placeholder="••••••••"
        placeholderTextColor="#8B8EA8"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={entrar}
      >
        <Text style={styles.buttonText}>
          SIGN IN
        </Text>
      </TouchableOpacity>

        <Text style={styles.register}>
          Don't have an account?
        </Text>

        <TouchableOpacity
          onPress={() =>
            router.push('/(auth)/register')
          }
        >
          <Text style={styles.registerRed}>
            Register
          </Text>
        </TouchableOpacity>
      </View>
  );
}