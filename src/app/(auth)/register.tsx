import { useEffect, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withSpring,
  Easing,
} from 'react-native-reanimated';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { register } from '../integration/authIntegration';

function senhaValida(senha: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(senha);
}

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucessoSenha, setSucessoSenha] = useState(false);

  const pokemonY = useSharedValue(0);
  const formOpacity = useSharedValue(0);
  const formX = useSharedValue(30);
  const buttonScale = useSharedValue(1);
  const pokeballRotate = useSharedValue(0);

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

    formOpacity.value = withTiming(1, { duration: 500 });
    formX.value = withSpring(0, { damping: 14 });
  }, []);

  const pokemonAnim = useAnimatedStyle(() => ({
    transform: [{ translateY: pokemonY.value }],
  }));

  const formAnim = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateX: formX.value }],
  }));

  const buttonAnim = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const pokeballAnim = useAnimatedStyle(() => ({
    transform: [{ rotate: `${pokeballRotate.value}deg` }],
  }));



  function validarCampos() {
    const nome = username.trim();
    const senha = password.trim();
    const confirmarSenha = confirm.trim();

    if (!nome || !senha || !confirmarSenha) {
      setErro('⚠ Preencha todos os campos para continuar.');
      setSucessoSenha(false);
      return false;
    }

    if (nome.length < 3) {
      setErro('⚠ O nome do treinador precisa ter no mínimo 3 caracteres.');
      setSucessoSenha(false);
      return false;
    }

    if (!senhaValida(senha)) {
      setErro('⚠ A senha deve ter 8 caracteres, letra maiúscula, minúscula e número.');
      setSucessoSenha(false);
      return false;
    }

    if (senha !== confirmarSenha) {
      setErro('⚠ As senhas não estão iguais.');
      setSucessoSenha(false);
      return false;
    }

    setErro('');
    setSucessoSenha(true);
    return true;
  }

  function validarSenhaEmTempoReal(novaSenha: string, novaConfirmacao = confirm) {
    setPassword(novaSenha);

    if (!novaSenha && !novaConfirmacao) {
      setErro('');
      setSucessoSenha(false);
      return;
    }

    if (novaSenha.length > 0 && !senhaValida(novaSenha)) {
      setErro('⚠ A senha deve ter 8 caracteres, letra maiúscula, minúscula e número.');
      setSucessoSenha(false);
      return;
    }

    if (novaConfirmacao.length > 0 && novaSenha !== novaConfirmacao) {
      setErro('⚠ As senhas ainda não estão iguais.');
      setSucessoSenha(false);
      return;
    }

    if (novaSenha.length > 0 && novaConfirmacao.length > 0 && novaSenha === novaConfirmacao) {
      setErro('');
      setSucessoSenha(true);
      return;
    }

    setErro('');
    setSucessoSenha(false);
  }

  function validarConfirmacaoEmTempoReal(novaConfirmacao: string) {
    setConfirm(novaConfirmacao);

    if (!password && !novaConfirmacao) {
      setErro('');
      setSucessoSenha(false);
      return;
    }

    if (password.length > 0 && !senhaValida(password)) {
      setErro('⚠ A senha deve ter 8 caracteres, letra maiúscula, minúscula e número.');
      setSucessoSenha(false);
      return;
    }

    if (novaConfirmacao.length > 0 && password !== novaConfirmacao) {
      setErro('⚠ As senhas ainda não estão iguais.');
      setSucessoSenha(false);
      return;
    }

    if (password.length > 0 && novaConfirmacao.length > 0 && password === novaConfirmacao) {
      setErro('');
      setSucessoSenha(true);
      return;
    }

    setErro('');
    setSucessoSenha(false);
  }

  async function handleRegister() {
  const nome = username.trim();
  const senha = password.trim();

  if (!validarCampos()) {
    return;
  }

  buttonScale.value = withSequence(
    withTiming(0.96, { duration: 70 }),
    withSpring(1)
  );

  setLoading(true);

  try {
    await register(nome, senha);

    Alert.alert(
      'Sucesso',
      'Conta criada com sucesso! Agora faça login para continuar.'
    );

    router.replace('/(auth)');
  } catch (error: any) {
    const mensagem =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      'Não foi possível criar a conta. Verifique os dados e tente novamente.';

    setErro(`⚠ ${mensagem}`);
    Alert.alert('Erro ao criar conta', mensagem);
  } finally {
    setLoading(false);
  }
}

  return (
    <View style={styles.page}>
      <View style={styles.card}>
        <View style={styles.left}>
          <View style={styles.statusBox}>
            <View style={styles.statusRow}>
              <Text style={styles.statusName}>CHARMANDER</Text>
              <Text style={styles.statusLevel}>Lv.36</Text>
            </View>

            <View style={styles.hpRow}>
              <Text style={styles.hp}>HP</Text>
              <View style={styles.hpBar}>
                <View style={styles.hpFill} />
              </View>
              <Text style={styles.hpNumber}>75/190</Text>
            </View>

            <View style={styles.typeRow}>
              <Text style={styles.typeFire}>FOGO</Text>
              <Text style={styles.typeFly}>VOADOR</Text>
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
              uri: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png',
            }}
            style={[styles.pokemon, pokemonAnim]}
            resizeMode="contain"
          />

          <View style={styles.ground1} />
          <View style={styles.ground2} />

          <Text style={styles.footerLeft}>POKÉMON CADASTRO</Text>
        </View>

        <Animated.View style={[styles.right, formAnim]}>
          <View style={styles.titleRow}>
            <Animated.Image
              source={{
                uri: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png',
              }}
              style={[styles.pokeball, pokeballAnim]}
              resizeMode="contain"
            />

            <View>
              <Text style={styles.title}>Crie sua</Text>
              <Text style={styles.titleYellow}>conta!</Text>
            </View>
          </View>

          <Text style={styles.subtitle}>
            Cadastre-se e comece a colecionar▼
          </Text>

          <Text style={styles.label}>NOME DO TREINADOR</Text>
          <View style={styles.inputBox}>
            <Ionicons name="person" size={16} color="#7053c6" />
            <TextInput
              style={styles.input}
              placeholder="Digite seu nome de treinador"
              placeholderTextColor="#8177b0"
              value={username}
              onChangeText={(texto) => {
                setUsername(texto);
                if (erro) setErro('');
              }}
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
              value={password}
              onChangeText={validarSenhaEmTempoReal}
              secureTextEntry
            />
          </View>

          <Text style={styles.label}>CONF. SENHA</Text>
          <View style={styles.inputBox}>
            <Ionicons name="lock-closed" size={16} color="#ffdf28" />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#8177b0"
              value={confirm}
              onChangeText={validarConfirmacaoEmTempoReal}
              secureTextEntry
            />
          </View>

          {erro !== '' && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#ff4d6d" />
              <Text style={styles.errorText}>{erro}</Text>
            </View>
          )}

          {sucessoSenha && erro === '' && (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={16} color="#31ff7b" />
              <Text style={styles.successText}>Senhas iguais e cadastro pronto ✓</Text>
            </View>
          )}

          <Animated.View style={buttonAnim}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.9}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>CADASTRAR ►</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.loginText}>
            Já tem uma conta?
            <Text
              style={styles.loginLink}
              onPress={() => router.push('/(auth)')}
            >
              {' '}Fazer login
            </Text>
          </Text>

          
        </Animated.View>
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
    borderColor: '#4c46a0',
    borderRadius: 6,
    overflow: 'hidden',
  },

  left: {
    width: '50%',
    backgroundColor: '#081521',
    borderRightWidth: 4,
    borderRightColor: '#4c46a0',
    position: 'relative',
    overflow: 'hidden',
  },

  right: {
    flex: 1,
    backgroundColor: '#0a0825',
    paddingHorizontal: 42,
    justifyContent: 'center',
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
    width: '72%',
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
    gap: 6,
    marginTop: 8,
  },

  typeFire: {
    fontFamily: FONT,
    fontSize: 7,
    color: '#fff',
    fontWeight: '900',
    backgroundColor: '#ff4b20',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  typeFly: {
    fontFamily: FONT,
    fontSize: 7,
    color: '#fff',
    fontWeight: '900',
    backgroundColor: '#0b89e8',
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
    backgroundColor: '#fff09b',
    shadowColor: '#fff09b',
    shadowOpacity: 0.9,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },

  moonCut: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#081521',
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
    width: 430,
    height: 300,
    borderRadius: 55,
    backgroundColor: 'rgba(255, 93, 20, 0.045)',
    bottom: 55,
    alignSelf: 'center',
    transform: [
      { rotate: '6deg' },
      { scaleX: 1.35 },
    ],
  },

  lightBig: {
    position: 'absolute',
    width: 360,
    height: 260,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 122, 31, 0.08)',
    bottom: 70,
    alignSelf: 'center',
    transform: [
      { rotate: '-12deg' },
      { scaleX: 1.25 },
    ],
  },

  lightSmall: {
    position: 'absolute',
    width: 230,
    height: 170,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 167, 48, 0.13)',
    bottom: 105,
    alignSelf: 'center',
    transform: [
      { rotate: '10deg' },
      { scaleX: 1.15 },
    ],
  },

  pokemon: {
    position: 'absolute',
    bottom: 58,
    alignSelf: 'center',
    width: 260,
    height: 260,
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

  footerLeft: {
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
    letterSpacing: 1,
  },

  titleYellow: {
    color: '#ffdf28',
    fontFamily: FONT,
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: 1,
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
    borderColor: '#4f4aa2',
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

  button: {
    height: 58,
    backgroundColor: '#f77720',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 24,
    borderBottomWidth: 5,
    borderBottomColor: '#af4313',
  },

  buttonText: {
    color: '#ffffff',
    fontFamily: FONT,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
  },

  loginText: {
    color: '#7e77a9',
    fontFamily: FONT,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '700',
  },

  loginLink: {
    color: '#ffdf28',
    fontWeight: '900',
    textDecorationLine: 'underline',
  },



  errorBox: {
    backgroundColor: '#2A0711',
    borderWidth: 2,
    borderColor: '#FF4D6D',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  errorText: {
    flex: 1,
    color: '#FF4D6D',
    fontFamily: FONT,
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 16,
  },

  successBox: {
    backgroundColor: '#061B12',
    borderWidth: 2,
    borderColor: '#31FF7B',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  successText: {
    flex: 1,
    color: '#31FF7B',
    fontFamily: FONT,
    fontSize: 11,
    fontWeight: '900',
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
});