import { useState, useEffect, useRef } from 'react';

import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';

import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateProfileStats } from '../integration/authIntegration';
import { useAuth } from '../context/AuthContext';

const AVATAR_PADRAO =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png';

const AVATARES = [
  AVATAR_PADRAO,
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png',
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png',
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png',
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png',
];

function gerarAvatarTemporario(valor?: string | null) {
  if (!valor) {
    return AVATAR_PADRAO;
  }

  const soma = valor
    .split('')
    .reduce((total, letra) => total + letra.charCodeAt(0), 0);

  return AVATARES[soma % AVATARES.length];
}

type Capturado = {
  index: string;
  nome: string;
  imagem?: string;
  tipos?: string[];
};

export default function Perfil() {
  const { user, userId, signOut } = useAuth();

  const [fotoPerfil, setFotoPerfil] = useState(AVATAR_PADRAO);

  const [capturados, setCapturados] = useState<Capturado[]>([]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(34)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const lightAnim = useRef(new Animated.Value(0.35)).current;
  const scanAnim = useRef(new Animated.Value(0)).current;
  const pokeballAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const ultimaAtualizacaoRef = useRef('');

  const totalCapturados = capturados.length;
  const vitorias = totalCapturados;
  const derrotas = 0;
  const progressoDex = Math.min(100, Math.round((totalCapturados / 151) * 100));
  const nivelTreinador = Math.max(1, 5 + totalCapturados);
  const estrelas = Math.min(5, Math.max(1, Math.ceil(nivelTreinador / 10)));

  useEffect(() => {
    carregarDados();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.045,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const light = Animated.loop(
      Animated.sequence([
        Animated.timing(lightAnim, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(lightAnim, {
          toValue: 0.35,
          duration: 650,
          useNativeDriver: true,
        }),
      ])
    );

    const scan = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    const pokeball = Animated.loop(
      Animated.timing(pokeballAnim, {
        toValue: 1,
        duration: 4200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    pulse.start();
    light.start();
    scan.start();
    pokeball.start();

    return () => {
      pulse.stop();
      light.stop();
      scan.stop();
      pokeball.stop();
    };
  }, [userId]);

  useEffect(() => {
    progressAnim.setValue(0);

    Animated.timing(progressAnim, {
      toValue: progressoDex,
      duration: 850,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [progressoDex]);

  useEffect(() => {
    salvarPerfilNaApi();
  }, [userId, nivelTreinador, vitorias, derrotas]);

  async function salvarPerfilNaApi() {
    if (!userId) return;

    const assinatura = `${userId}-${nivelTreinador}-${vitorias}-${derrotas}`;

    if (ultimaAtualizacaoRef.current === assinatura) {
      return;
    }

    try {
      ultimaAtualizacaoRef.current = assinatura;

      await updateProfileStats(
        userId,
        nivelTreinador,
        vitorias,
        derrotas
      );

      console.log('Perfil atualizado na API:', {
        userId,
        level: nivelTreinador,
        vitorias,
        derrotas,
      });
    } catch (error: any) {
      ultimaAtualizacaoRef.current = '';

      console.log(
        'Erro ao atualizar perfil:',
        error?.response?.data || error?.message || error
      );
    }
  }

  async function carregarDados() {
    const avatarDaSessao = gerarAvatarTemporario(userId || user);
    setFotoPerfil(avatarDaSessao);

    await AsyncStorage.removeItem('@Pokemon:FotoPerfil');

    if (!userId) {
      setCapturados([]);
      return;
    }

    await AsyncStorage.removeItem(`@Pokemon:FotoPerfil:${userId}`);

    const capturadosSalvos = await AsyncStorage.getItem(
      `@Pokemon:Capturados:${userId}`
    );

    if (capturadosSalvos) {
      setCapturados(JSON.parse(capturadosSalvos));
    } else {
      setCapturados([]);
    }
  }

  function selecionarImagem() {
    const indiceAtual = AVATARES.indexOf(fotoPerfil);
    const proximoIndice = indiceAtual >= 0 ? indiceAtual + 1 : 0;
    const proximoAvatar = AVATARES[proximoIndice % AVATARES.length];

    setFotoPerfil(proximoAvatar);
  }

  async function sair() {
    await signOut();
    router.replace('/(auth)');
  }

  function imagemPokemon(pokemon: Capturado) {
    if (pokemon.imagem) return pokemon.imagem;

    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${Number(
      pokemon.index
    )}.png`;
  }

  const rotatePokeball = pokeballAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const ultimosCapturados = capturados.slice(-3).reverse();

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <Animated.View style={[styles.bigLight, { opacity: lightAnim }]} />
          <View style={styles.smallLightRed} />
          <View style={styles.smallLightYellow} />
          <View style={styles.smallLightGreen} />
        </View>

        <Text style={styles.logo}>PIXEL TRAINER CARD</Text>

        <Text style={styles.online}>ONLINE</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator>
        <Animated.View
          style={[
            styles.heroCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.pixelGrid} />

          <Animated.View
            pointerEvents="none"
            style={[
              styles.scanLight,
              {
                transform: [
                  {
                    translateX: scanAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-220, 980],
                    }),
                  },
                ],
              },
            ]}
          />

          <View style={styles.cardTopRow}>
            <Text style={styles.sectionCode}>TRAINER DATA</Text>
            <Text style={styles.trainerId}>ID #{String(nivelTreinador * 27).padStart(5, '0')}</Text>
          </View>

          <View style={styles.mainContent}>
            <TouchableOpacity activeOpacity={0.88} onPress={selecionarImagem}>
              <Animated.View
                style={[
                  styles.avatarMachine,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <View style={styles.avatarScreenTop} />
                <View style={styles.avatarScreenInner}>
                  <Image
                    source={{ uri: fotoPerfil }}
                    style={styles.avatar}
                    onError={() => setFotoPerfil(AVATAR_PADRAO)}
                  />
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.avatarScan,
                      {
                        transform: [
                          {
                            translateY: scanAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [-90, 90],
                            }),
                          },
                        ],
                      },
                    ]}
                  />
                </View>

                <View style={styles.editBadge}>
                  <Text style={styles.editIcon}>▶</Text>
                </View>
              </Animated.View>
            </TouchableOpacity>

            <View style={styles.trainerPanel}>
              <Text style={styles.label}>TREINADOR</Text>
              <Text style={styles.nome}>{user || 'Treinador Pokémon'}</Text>

              <View style={styles.levelRow}>
                <View style={styles.levelBox}>
                  <Text style={styles.levelLabel}>LV</Text>
                  <Text style={styles.levelNumber}>{nivelTreinador}</Text>
                </View>

                <View style={styles.rankBox}>
                  <Text style={styles.rankLabel}>RANK</Text>
                  <Text style={styles.rankStars}>{'★'.repeat(estrelas)}{'☆'.repeat(5 - estrelas)}</Text>
                </View>
              </View>

              <View style={styles.badgesRow}>
                <Text style={styles.badge}>KANTO</Text>
                <Text style={styles.badge}>PIXEL</Text>
                <Text style={styles.badge}>DEX</Text>
                <Text style={styles.badge}>TRAINER</Text>
              </View>

              <Text style={styles.description}>
                Complete sua Pokédex, acompanhe seus capturados e desafie rivais para evoluir seu perfil de treinador.
              </Text>
            </View>
          </View>

          <View style={styles.dexProgressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>KANTO DEX PROGRESS</Text>
              <Text style={styles.progressPercent}>{progressoDex}%</Text>
            </View>

            <View style={styles.progressBg}>
              <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
            </View>

            <Text style={styles.progressText}>{totalCapturados} de 151 Pokémons registrados</Text>
          </View>
        </Animated.View>

        <View style={styles.statsGrid}>
          <View style={styles.statCardGreen}>
            <Text style={styles.statIcon}>🏆</Text>
            <Text style={styles.statNumber}>{vitorias}</Text>
            <Text style={styles.statLabel}>Vitórias</Text>
          </View>

          <View style={styles.statCardRed}>
            <Text style={styles.statIcon}>💀</Text>
            <Text style={styles.statNumberRed}>{derrotas}</Text>
            <Text style={styles.statLabel}>Derrotas</Text>
          </View>

          <View style={styles.statCardYellow}>
            <Text style={styles.statIcon}>📦</Text>
            <Text style={styles.statNumberYellow}>{totalCapturados}</Text>
            <Text style={styles.statLabel}>Capturados</Text>
          </View>
        </View>

        <View style={styles.storagePanel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>★ ÚLTIMOS CAPTURADOS</Text>
            <Text style={styles.panelSmall}>PC BOX</Text>
          </View>

          {ultimosCapturados.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Nenhum Pokémon registrado</Text>
              <Text style={styles.emptyText}>Vença uma batalha final para abrir uma Pokébola e capturar um novo Pokémon.</Text>
            </View>
          ) : (
            <View style={styles.capturedRow}>
              {ultimosCapturados.map((pokemon, index) => (
                <Animated.View
                  key={`${pokemon.index}-${index}`}
                  style={[
                    styles.miniPokemonCard,
                    {
                      opacity: fadeAnim,
                      transform: [{ translateY: slideAnim }],
                    },
                  ]}
                >
                  <Text style={styles.miniNumber}>#{pokemon.index}</Text>
                  <Image source={{ uri: imagemPokemon(pokemon) }} style={styles.miniImage} />
                  <Text style={styles.miniName}>{pokemon.nome}</Text>
                  <Text style={styles.miniType}>{pokemon.tipos?.join(' • ') || 'Pokémon'}</Text>
                </Animated.View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.menuPanel}>
          <View style={styles.menuHeader}>
            <Animated.Text style={[styles.pokeball, { transform: [{ rotate: rotatePokeball }] }]}>◉</Animated.Text>
            <Text style={styles.menuTitle}>MENU DO TREINADOR</Text>
          </View>

          <View style={styles.navigation}>
            <TouchableOpacity style={styles.navCard} onPress={() => router.push('/(app)/team')}>
              <Text style={styles.navIcon}>👥</Text>
              <Text style={styles.navTitle}>Meu Time</Text>
              <Text style={styles.navDesc}>Equipe e capturados</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navCard} onPress={() => router.push('/(app)/pokedex')}>
              <Text style={styles.navIcon}>📖</Text>
              <Text style={styles.navTitle}>Pokédex</Text>
              <Text style={styles.navDesc}>Registros e cartas</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.navCard, styles.activeCard]}>
              <Text style={styles.navIcon}>⭐</Text>
              <Text style={styles.navTitle}>Perfil</Text>
              <Text style={styles.navDesc}>Trainer Card</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navCard} onPress={() => router.push('/(app)/battle')}>
              <Text style={styles.navIcon}>⚔️</Text>
              <Text style={styles.navTitle}>Batalha</Text>
              <Text style={styles.navDesc}>Desafiar rival</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.oakBox}>
          <Text style={styles.oakTitle}>PROF. OAK</Text>
          <Text style={styles.oakText}>
            “Um treinador profissional observa seus dados, entende sua equipe e se prepara antes de cada batalha.”
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={sair}>
          <Text style={styles.logoutText}>SAIR DA CONTA</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#030716',
  },

  topBar: {
    height: 50,
    backgroundColor: '#10164A',
    borderBottomWidth: 3,
    borderBottomColor: '#26346C',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  bigLight: {
    width: 26,
    height: 26,
    borderRadius: 18,
    backgroundColor: '#68D8FF',
    borderWidth: 3,
    borderColor: '#E8FAFF',
    shadowColor: '#68D8FF',
    shadowOpacity: 1,
    shadowRadius: 14,
  },

  smallLightRed: {
    width: 12,
    height: 12,
    borderRadius: 10,
    backgroundColor: '#FF4D6D',
  },

  smallLightYellow: {
    width: 12,
    height: 12,
    borderRadius: 10,
    backgroundColor: '#FFD93D',
  },

  smallLightGreen: {
    width: 12,
    height: 12,
    borderRadius: 10,
    backgroundColor: '#31FF7B',
  },

  logo: {
    color: '#FFD600',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 3,
  },

  online: {
    color: '#31FF7B',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },

  container: {
    padding: 20,
    paddingBottom: 54,
  },

  heroCard: {
    backgroundColor: '#0B142C',
    borderWidth: 3,
    borderColor: '#263B70',
    borderRadius: 0,
    padding: 18,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 18,
  },

  pixelGrid: {
    position: 'absolute',
    right: 20,
    top: 14,
    width: 160,
    height: 110,
    backgroundColor: '#FFD600',
    opacity: 0.08,
  },

  scanLight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 90,
    backgroundColor: 'rgba(255,255,255,0.06)',
    zIndex: 2,
  },

  cardTopRow: {
    backgroundColor: '#060A1A',
    borderWidth: 3,
    borderColor: '#1F2E58',
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  sectionCode: {
    color: '#FFD600',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },

  trainerId: {
    color: '#31FF7B',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },

  mainContent: {
    flexDirection: 'row',
    gap: 18,
  },

  avatarMachine: {
    width: 245,
    backgroundColor: '#D51D36',
    borderWidth: 4,
    borderColor: '#720B1C',
    padding: 14,
    position: 'relative',
  },

  avatarScreenTop: {
    width: 42,
    height: 8,
    backgroundColor: '#111827',
    alignSelf: 'center',
    marginBottom: 10,
  },

  avatarScreenInner: {
    width: 205,
    height: 190,
    backgroundColor: '#081221',
    borderWidth: 4,
    borderColor: '#E6E6E6',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  avatar: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },

  avatarScan: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(49,255,123,0.55)',
  },

  editBadge: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    width: 42,
    height: 42,
    backgroundColor: '#FFD600',
    borderWidth: 3,
    borderColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },

  editIcon: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '900',
  },

  trainerPanel: {
    flex: 1,
    backgroundColor: '#081221',
    borderWidth: 3,
    borderColor: '#1F2E58',
    padding: 18,
  },

  label: {
    color: '#31FF7B',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },

  nome: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    textTransform: 'capitalize',
    marginTop: 6,
    marginBottom: 14,
  },

  levelRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },

  levelBox: {
    width: 105,
    backgroundColor: '#061B12',
    borderWidth: 3,
    borderColor: '#31FF7B',
    padding: 12,
  },

  levelLabel: {
    color: '#A7F3D0',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },

  levelNumber: {
    color: '#31FF7B',
    fontSize: 31,
    fontWeight: '900',
  },

  rankBox: {
    flex: 1,
    backgroundColor: '#1B1603',
    borderWidth: 3,
    borderColor: '#FFD600',
    padding: 12,
  },

  rankLabel: {
    color: '#FFD600',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },

  rankStars: {
    color: '#FFD600',
    fontSize: 25,
    fontWeight: '900',
    marginTop: 4,
  },

  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 14,
  },

  badge: {
    backgroundColor: '#10164A',
    color: '#FFD600',
    borderWidth: 2,
    borderColor: '#FFD600',
    paddingHorizontal: 12,
    paddingVertical: 5,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },

  description: {
    color: '#AAB3C7',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '700',
  },

  dexProgressCard: {
    backgroundColor: '#081221',
    borderWidth: 3,
    borderColor: '#1F2E58',
    padding: 16,
    marginTop: 16,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  progressTitle: {
    color: '#FFD600',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 2,
  },

  progressPercent: {
    color: '#31FF7B',
    fontSize: 15,
    fontWeight: '900',
  },

  progressBg: {
    height: 18,
    backgroundColor: '#020613',
    borderWidth: 3,
    borderColor: '#263B70',
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#31FF7B',
  },

  progressText: {
    color: '#AAB3C7',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 8,
  },

  statsGrid: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 18,
  },

  statCardGreen: {
    flex: 1,
    backgroundColor: '#061B12',
    borderWidth: 3,
    borderColor: '#31FF7B',
    paddingVertical: 18,
    alignItems: 'center',
  },

  statCardRed: {
    flex: 1,
    backgroundColor: '#220713',
    borderWidth: 3,
    borderColor: '#FF4D6D',
    paddingVertical: 18,
    alignItems: 'center',
  },

  statCardYellow: {
    flex: 1,
    backgroundColor: '#1B1603',
    borderWidth: 3,
    borderColor: '#FFD600',
    paddingVertical: 18,
    alignItems: 'center',
  },

  statIcon: {
    fontSize: 26,
    marginBottom: 6,
  },

  statNumber: {
    color: '#31FF7B',
    fontSize: 34,
    fontWeight: '900',
  },

  statNumberRed: {
    color: '#FF4D6D',
    fontSize: 34,
    fontWeight: '900',
  },

  statNumberYellow: {
    color: '#FFD600',
    fontSize: 34,
    fontWeight: '900',
  },

  statLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  storagePanel: {
    backgroundColor: '#0B142C',
    borderWidth: 3,
    borderColor: '#263B70',
    padding: 18,
    marginBottom: 18,
  },

  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  panelTitle: {
    color: '#FFD600',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },

  panelSmall: {
    color: '#31FF7B',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },

  capturedRow: {
    flexDirection: 'row',
    gap: 14,
  },

  miniPokemonCard: {
    flex: 1,
    backgroundColor: '#060A1A',
    borderWidth: 3,
    borderColor: '#FFD600',
    padding: 14,
    alignItems: 'center',
  },

  miniNumber: {
    alignSelf: 'flex-end',
    color: '#8F9AB3',
    fontSize: 12,
    fontWeight: '900',
  },

  miniImage: {
    width: 90,
    height: 90,
    resizeMode: 'contain',
  },

  miniName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'capitalize',
    marginTop: 6,
  },

  miniType: {
    color: '#AAB3C7',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginTop: 4,
    textAlign: 'center',
  },

  emptyBox: {
    backgroundColor: '#060A1A',
    borderWidth: 3,
    borderColor: '#1F2E58',
    padding: 24,
    alignItems: 'center',
  },

  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 8,
  },

  emptyText: {
    color: '#AAB3C7',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 21,
    textAlign: 'center',
  },

  menuPanel: {
    backgroundColor: '#0B142C',
    borderWidth: 3,
    borderColor: '#263B70',
    padding: 18,
    marginBottom: 18,
  },

  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },

  pokeball: {
    color: '#FFD600',
    fontSize: 24,
    fontWeight: '900',
  },

  menuTitle: {
    color: '#FFD600',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },

  navigation: {
    flexDirection: 'row',
    gap: 12,
  },

  navCard: {
    flex: 1,
    backgroundColor: '#060A1A',
    borderWidth: 3,
    borderColor: '#263B70',
    padding: 16,
    alignItems: 'center',
  },

  activeCard: {
    backgroundColor: '#D51D36',
    borderColor: '#FFD600',
  },

  navIcon: {
    fontSize: 28,
    marginBottom: 8,
  },

  navTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
  },

  navDesc: {
    color: '#AAB3C7',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },

  oakBox: {
    backgroundColor: '#07101F',
    borderWidth: 3,
    borderColor: '#31FF7B',
    padding: 18,
    marginBottom: 18,
  },

  oakTitle: {
    color: '#31FF7B',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
  },

  oakText: {
    color: '#AAB3C7',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 21,
  },

  logoutButton: {
    backgroundColor: '#060A1A',
    borderWidth: 3,
    borderColor: '#FF174D',
    paddingVertical: 16,
    alignItems: 'center',
  },

  logoutText: {
    color: '#FF4D6D',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 2,
  },
});
