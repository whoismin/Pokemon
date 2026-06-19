import { useEffect, useState } from 'react';

import {
  View,
  Alert,
  StyleSheet,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';

import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();

  const pokemonY = useSharedValue(0);
  const formOpacity = useSharedValue(0);
  const formX = useSharedValue(-35);
  const pokeballRotate = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  useEffect(() => {
    pokemonY.value = withRepeat(
      withSequence(
        withTiming(-7, { duration: 1100 }),
        withTiming(0, { duration: 1100 })
      ),
      -1
    );

    pokeballRotate.value = withRepeat(
      withTiming(360, {
        duration: 1800,
        easing: Easing.linear,
      }),
      -1
    );

    formOpacity.value = withTiming(1, { duration: 600 });
    formX.value = withSpring(0, { damping: 14 });
  }, []);

  const pokemonAnim = useAnimatedStyle(() => ({
    transform: [{ translateY: pokemonY.value }],
  }));

  const formAnim = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateX: formX.value }],
  }));

  const pokeballAnim = useAnimatedStyle(() => ({
    transform: [{ rotate: `${pokeballRotate.value}deg` }],
  }));

  const buttonAnim = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  async function entrar() {
    if (!usuario || !senha) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    buttonScale.value = withSequence(
      withTiming(0.96, { duration: 70 }),
      withSpring(1)
    );

    setLoading(true);

    const sucesso = await signIn(usuario, senha);

    setLoading(false);

    if (sucesso) {
      router.replace('/(app)/team');
    } else {
      Alert.alert('Erro', 'Usuário ou senha incorretos!');
    }
  }

  return (
    <View style={styles.page}>
      <StatusBar barStyle="light-content" />

      <View style={styles.card}>
        <Animated.View style={[styles.left, formAnim]}>
          <View style={styles.titleRow}>
            <Animated.Image
              source={{
                uri: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png',
              }}
              style={[styles.pokeball, pokeballAnim]}
              resizeMode="contain"
            />

            <View>
              <Text style={styles.title}>Bem-vindo</Text>
              <Text style={styles.titleYellow}>de volta!</Text>
            </View>
          </View>

          <Text style={styles.subtitle}>
            Entre para continuar sua jornada▼
          </Text>

          <Text style={styles.label}>NOME DO TREINADOR</Text>
          <View style={styles.inputBox}>
            <Ionicons name="person" size={16} color="#ffdf28" />
            <TextInput
              style={styles.input}
              placeholder="Digite seu nome de treinador"
              placeholderTextColor="#8177b0"
              value={usuario}
              onChangeText={setUsuario}
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.label}>SENHA</Text>
          <View style={styles.inputBox}>
            <Ionicons name="lock-closed" size={16} color="#ffdf28" />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#8177b0"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
            />
          </View>

          <TouchableOpacity>
            <Text style={styles.forgot}>Esqueceu a senha?</Text>
          </TouchableOpacity>

          <Animated.View style={buttonAnim}>
            <TouchableOpacity
              style={styles.button}
              onPress={entrar}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator color="#141414" />
              ) : (
                <Text style={styles.buttonText}>ENTRAR ►</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.registerText}>
            Ainda não tem conta?
            <Text
              style={styles.registerLink}
              onPress={() => router.push('/register')}
            >
              {' '}Cadastre-se
            </Text>
          </Text>

      
        </Animated.View>

        <View style={styles.right}>
          <View style={styles.statusBox}>
            <View style={styles.statusRow}>
              <Text style={styles.statusName}>PIKACHU</Text>
              <Text style={styles.statusLevel}>Lv.25</Text>
            </View>

            <View style={styles.hpRow}>
              <Text style={styles.hp}>HP</Text>
              <View style={styles.hpBar}>
                <View style={styles.hpFill} />
              </View>
              <Text style={styles.hpNumber}>90/120</Text>
            </View>

            <View style={styles.typeRow}>
              <Text style={styles.typeElectric}>ELÉTRICO</Text>
            </View>
          </View>

          <View style={styles.moon}>
            <View style={styles.moonCut} />
          </View>

          <Text style={styles.star1}>·</Text>
          <Text style={styles.star2}>·</Text>
          <Text style={styles.star3}>·</Text>
          <Text style={styles.star4}>·</Text>
          <Text style={styles.star5}>·</Text>
          <Text style={styles.star6}>·</Text>

          <View style={styles.lightSoft} />
          <View style={styles.lightBig} />
          <View style={styles.lightSmall} />

          <Animated.Image
            source={{
              uri: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
            }}
            style={[styles.pokemon, pokemonAnim]}
            resizeMode="contain"
          />

          <View style={styles.ground1} />
          <View style={styles.ground2} />

          <Text style={styles.footerRight}>POKÉMON LOGIN</Text>
        </View>
      </View>
    </View>
  );
}

const FONT = 'monospace';

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#090820',
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    width: '86%',
    height: '82%',
    flexDirection: 'row',
    backgroundColor: '#090720',
    borderWidth: 5,
    borderColor: '#51451a',
    borderRadius: 6,
    overflow: 'hidden',
  },

  left: {
    flex: 1,
    backgroundColor: '#0a0825',
    paddingHorizontal: 42,
    justifyContent: 'center',
  },

  right: {
    width: '50%',
    backgroundColor: '#111005',
    borderLeftWidth: 4,
    borderLeftColor: '#51451a',
    position: 'relative',
    overflow: 'hidden',
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 10,
  },

  pokeball: {
    width: 42,
    height: 42,
    imageRendering: 'pixelated',
  } as any,

  title: {
    color: '#ffffff',
    fontFamily: FONT,
    fontSize: 27,
    fontWeight: '900',
  },

  titleYellow: {
    color: '#ffdf28',
    fontFamily: FONT,
    fontSize: 27,
    fontWeight: '900',
    marginTop: -6,
  },

  subtitle: {
    color: '#8b82bb',
    fontFamily: FONT,
    fontSize: 12,
    marginBottom: 30,
    fontWeight: '700',
  },

  label: {
    color: '#ffdf28',
    fontFamily: FONT,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 9,
  },

  inputBox: {
    height: 54,
    borderWidth: 3,
    borderColor: '#5b501c',
    backgroundColor: '#09071d',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 20,
  },

  input: {
    flex: 1,
    height: '100%',
    color: '#ffffff',
    fontFamily: FONT,
    fontSize: 14,
    marginLeft: 12,
    backgroundColor: '#09071d',
    outlineStyle: 'none',
  } as any,

  forgot: {
    color: '#ffdf28',
    fontFamily: FONT,
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'right',
    marginTop: -8,
    marginBottom: 18,
  },

  button: {
    height: 58,
    backgroundColor: '#ffdf28',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 24,
    borderBottomWidth: 5,
    borderBottomColor: '#b89a11',
  },

  buttonText: {
    color: '#141414',
    fontFamily: FONT,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  registerText: {
    color: '#7e77a9',
    fontFamily: FONT,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '700',
  },

  registerLink: {
    color: '#ffdf28',
    fontWeight: '900',
    textDecorationLine: 'underline',
  },

  version: {
    color: '#ffffff35',
    fontFamily: FONT,
    fontSize: 8,
    textAlign: 'center',
    marginTop: 20,
    letterSpacing: 1,
    fontWeight: '900',
  },

  statusBox: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 180,
    backgroundColor: '#f0ecd7',
    borderWidth: 4,
    borderColor: '#282653',
    padding: 10,
    zIndex: 20,
  },

  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  statusName: {
    fontFamily: FONT,
    color: '#151527',
    fontSize: 11,
    fontWeight: '900',
  },

  statusLevel: {
    fontFamily: FONT,
    color: '#151527',
    fontSize: 10,
    fontWeight: '900',
  },

  hpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },

  hp: {
    fontFamily: FONT,
    fontSize: 8,
    color: '#151527',
    fontWeight: '900',
  },

  hpBar: {
    width: 78,
    height: 6,
    backgroundColor: '#24233c',
  },

  hpFill: {
    width: '82%',
    height: '100%',
    backgroundColor: '#ffdf28',
  },

  hpNumber: {
    fontFamily: FONT,
    fontSize: 8,
    color: '#151527',
    fontWeight: '900',
  },

  typeRow: {
    flexDirection: 'row',
    marginTop: 8,
  },

  typeElectric: {
    fontFamily: FONT,
    fontSize: 7,
    color: '#141414',
    fontWeight: '900',
    backgroundColor: '#ffdf28',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  moon: {
    position: 'absolute',
    top: 32,
    right: 48,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff7a8',
  },

  moonCut: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#111005',
  },

  star1: {
    position: 'absolute',
    top: 120,
    left: 75,
    color: '#fff',
    fontSize: 14,
  },

  star2: {
    position: 'absolute',
    top: 150,
    left: 135,
    color: '#fff',
    fontSize: 11,
  },

  star3: {
    position: 'absolute',
    top: 180,
    right: 155,
    color: '#fff',
    fontSize: 11,
  },

  star4: {
    position: 'absolute',
    top: 250,
    left: 250,
    color: '#fff',
    fontSize: 13,
  },

  star5: {
    position: 'absolute',
    top: 330,
    right: 110,
    color: '#fff',
    fontSize: 13,
  },

  star6: {
    position: 'absolute',
    top: 420,
    left: 170,
    color: '#fff',
    fontSize: 10,
  },

  lightSoft: {
    position: 'absolute',
    width: 440,
    height: 300,
    borderRadius: 55,
    backgroundColor: 'rgba(255, 223, 40, 0.045)',
    bottom: 55,
    alignSelf: 'center',
    transform: [{ rotate: '6deg' }, { scaleX: 1.35 }],
  },

  lightBig: {
    position: 'absolute',
    width: 360,
    height: 260,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 223, 40, 0.08)',
    bottom: 70,
    alignSelf: 'center',
    transform: [{ rotate: '-12deg' }, { scaleX: 1.25 }],
  },

  lightSmall: {
    position: 'absolute',
    width: 230,
    height: 170,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 244, 90, 0.13)',
    bottom: 105,
    alignSelf: 'center',
    transform: [{ rotate: '10deg' }, { scaleX: 1.15 }],
  },

  pokemon: {
    position: 'absolute',
    bottom: 58,
    alignSelf: 'center',
    width: 270,
    height: 270,
    zIndex: 10,
    imageRendering: 'pixelated',
  } as any,

  ground1: {
    position: 'absolute',
    bottom: -18,
    left: -38,
    width: 250,
    height: 72,
    borderRadius: 120,
    backgroundColor: '#245f19',
    zIndex: 15,
  },

  ground2: {
    position: 'absolute',
    bottom: -28,
    right: -28,
    width: 260,
    height: 80,
    borderRadius: 140,
    backgroundColor: '#1b5115',
    zIndex: 15,
  },

  footerRight: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    color: '#ffffff45',
    fontFamily: FONT,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
    zIndex: 30,
  },
});