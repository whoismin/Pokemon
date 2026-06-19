import { useEffect, useMemo, useRef, useState } from 'react';

import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  Animated,
  Easing,
} from 'react-native';

import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Pokemon } from '../@types/pokemon';
import { useAuth } from '../context/AuthContext';
import { getTeam } from '../integration/teamIntegration';

const typeColors: Record<string, string> = {
  fire: '#FF6B35',
  water: '#4D96FF',
  grass: '#79D957',
  electric: '#FFD93D',
  ground: '#C89B3C',
  rock: '#A38C5A',
  psychic: '#FF5DA2',
  ghost: '#7B61FF',
  poison: '#B967D9',
  flying: '#9DB7F5',
  normal: '#A8A77A',
  bug: '#A6B91A',
  fighting: '#C22E28',
  ice: '#74D9D9',
  dragon: '#6F35FC',
  dark: '#705746',
  steel: '#B7B7CE',
  fairy: '#D685AD',
};

const typeLabels: Record<string, string> = {
  fire: 'Fogo',
  water: 'Água',
  grass: 'Grama',
  electric: 'Elétrico',
  ground: 'Terra',
  rock: 'Pedra',
  psychic: 'Psíquico',
  ghost: 'Fantasma',
  poison: 'Venenoso',
  flying: 'Voador',
  normal: 'Normal',
  bug: 'Inseto',
  fighting: 'Lutador',
  ice: 'Gelo',
  dragon: 'Dragão',
  dark: 'Sombrio',
  steel: 'Aço',
  fairy: 'Fada',
};

const typeIcons: Record<string, string> = {
  fire: '🔥',
  water: '💧',
  grass: '🌿',
  electric: '⚡',
  ground: '⛰️',
  rock: '🪨',
  psychic: '🔮',
  ghost: '👻',
  poison: '☠️',
  flying: '🪽',
  normal: '●',
  bug: '🐛',
  fighting: '🥊',
  ice: '❄️',
  dragon: '🐉',
  dark: '🌑',
  steel: '⚙️',
  fairy: '✨',
};

export default function Team() {
  const [time, setTime] = useState<Pokemon[]>([]);
  const [capturados, setCapturados] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [tipoSelecionado, setTipoSelecionado] = useState('todos');

  const { signOut, userId } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(28)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const estrelas = useMemo(() => {
    return Array.from({ length: 45 }).map((_, index) => ({
      id: index,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      opacity: 0.2 + Math.random() * 0.7,
    }));
  }, []);

  useEffect(() => {
    carregarTime();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 650,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 950,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 950,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const scan = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 2300,
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

    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    scan.start();
    glow.start();

    return () => {
      pulse.stop();
      scan.stop();
      glow.stop();
    };
  }, []);

  async function carregarTime() {
    try {
      setLoading(true);

      if (!userId) {
        Alert.alert('Erro', 'Usuário não encontrado. Faça login novamente.');
        router.replace('/(auth)');
        return;
      }

      const timeApi = await getTeam(userId);

      if (!userId) return;

const capturadosSalvos = await AsyncStorage.getItem(
  `@Pokemon:Capturados:${userId}`
);
      const listaCapturados = capturadosSalvos ? JSON.parse(capturadosSalvos) : [];

      setTime(timeApi);
      setCapturados(listaCapturados);
    } catch (error) {
      console.log('Erro ao carregar time:', error);
      Alert.alert('Erro', 'Não foi possível carregar seu time.');
    } finally {
      setLoading(false);
    }
  }

  async function sair() {
    await signOut();
    router.replace('/(auth)');
  }

  function imagemPokemon(pokemon: Pokemon) {
    if (pokemon.imagem) return pokemon.imagem;

    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${Number(
      pokemon.index
    )}.png`;
  }

  function normalizar(texto: string) {
    return texto.toLowerCase().trim();
  }

  function filtrarPokemons(lista: Pokemon[]) {
    return lista.filter(pokemon => {
      const texto = normalizar(busca);
      const tipos = pokemon.tipos?.map(tipo => normalizar(tipo)) || [];

      const combinaBusca =
        pokemon.nome.toLowerCase().includes(texto) ||
        pokemon.index.includes(texto) ||
        tipos.some(tipo => tipo.includes(texto)) ||
        tipos.some(tipo => (typeLabels[tipo] || '').toLowerCase().includes(texto));

      const combinaTipo =
        tipoSelecionado === 'todos' || tipos.some(tipo => tipo === tipoSelecionado);

      return combinaBusca && combinaTipo;
    });
  }

  const todosPokemons = useMemo(() => {
    return [...time, ...capturados];
  }, [time, capturados]);

  const tiposDisponiveis = useMemo(() => {
    const tipos = todosPokemons.flatMap(pokemon =>
      pokemon.tipos?.map(tipo => tipo.toLowerCase()) || []
    );

    return ['todos', ...Array.from(new Set(tipos))];
  }, [todosPokemons]);

  const timeFiltrado = filtrarPokemons(time);
  const capturadosFiltrados = filtrarPokemons(capturados);

  function TypeBadge({ tipo }: { tipo: string }) {
    const tipoLower = tipo.toLowerCase();
    const cor = typeColors[tipoLower] || '#63C7EF';

    return (
      <View style={[styles.typeBadge, { backgroundColor: cor }]}>
        <Text
          style={[
            styles.typeBadgeText,
            tipoLower === 'electric' && styles.typeBadgeTextDark,
          ]}
        >
          {typeIcons[tipoLower] || '●'} {typeLabels[tipoLower] || tipo}
        </Text>
      </View>
    );
  }

  function PixelCorner({ color }: { color: string }) {
    return (
      <>
        <View style={[styles.corner, styles.cornerTL, { backgroundColor: color }]} />
        <View style={[styles.corner, styles.cornerTR, { backgroundColor: color }]} />
        <View style={[styles.corner, styles.cornerBL, { backgroundColor: color }]} />
        <View style={[styles.corner, styles.cornerBR, { backgroundColor: color }]} />
      </>
    );
  }

  function CardPokemon({
    pokemon,
    capturado = false,
  }: {
    pokemon: Pokemon;
    capturado?: boolean;
  }) {
    const tipoPrincipal = pokemon.tipos?.[0]?.toLowerCase() || 'normal';
    const corPrincipal = typeColors[tipoPrincipal] || '#FFD600';

    return (
      <Animated.View
        style={[
          styles.cardOuter,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity activeOpacity={0.86} style={[styles.card, { borderColor: corPrincipal }]}>
          <PixelCorner color={corPrincipal} />

          <Animated.View
            pointerEvents="none"
            style={[
              styles.cardNeon,
              {
                backgroundColor: corPrincipal,
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.04, 0.14],
                }),
              },
            ]}
          />

          <View style={styles.cardTopRow}>
            <View style={styles.dexChip}>
              <Text style={styles.number}>#{pokemon.index}</Text>
            </View>

            <Text style={[styles.category, { color: corPrincipal }]}>
              {capturado ? 'CAPTURED' : 'TEAM SLOT'}
            </Text>
          </View>

          <Animated.View
            style={[
              styles.pixelFrame,
              {
                borderColor: corPrincipal,
                transform: [{ scale: capturado ? pulseAnim : 1 }],
              },
            ]}
          >
            <View style={[styles.spriteGlow, { backgroundColor: corPrincipal }]} />
            <View style={styles.pixelGrid} />
            <Image
              source={{ uri: imagemPokemon(pokemon) }}
              style={styles.image}
              resizeMode="contain"
            />
          </Animated.View>

          <Text style={styles.name}>{pokemon.nome}</Text>

          <View style={styles.types}>
            {pokemon.tipos?.slice(0, 2).map(tipo => (
              <TypeBadge key={tipo} tipo={tipo} />
            ))}
          </View>

          <View style={styles.pixelInfoBox}>
            <Text style={styles.infoLabel}>Origem</Text>
            <Text style={styles.infoValue}>
              {capturado ? 'Vitória na batalha' : 'Equipe principal'}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  function EmptyState({ title, text }: { title: string; text: string }) {
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyIcon}>▣</Text>
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptyText}>{text}</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Animated.View style={[styles.loaderPixel, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.loaderCore} />
        </Animated.View>
        <Text style={styles.loadingText}>Carregando Poké Storage...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {estrelas.map(estrela => (
        <View
          key={estrela.id}
          style={[
            styles.star,
            {
              left: estrela.left,
              top: estrela.top,
              opacity: estrela.opacity,
            },
          ]}
        />
      ))}

      <View style={styles.topBar}>
        <View style={styles.topLeft}>
          <View style={styles.topDotGreen} />
          <View style={styles.topDotYellow} />
          <View style={styles.topDotRed} />
          <Text style={styles.logo}>POKÉMON TEAM</Text>
        </View>

        <Text style={styles.status}>PIXEL PC STORAGE</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Animated.View
          style={[
            styles.hero,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.pixelPattern} />
          <Animated.View
            style={[
              styles.scanLine,
              {
                transform: [
                  {
                    translateX: scanAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-260, 1000],
                    }),
                  },
                ],
              },
            ]}
          />

          <View style={styles.heroText}>
            <Text style={styles.kicker}>TRAINER STORAGE</Text>
            <Text style={styles.title}>Meu Time</Text>
            <Text style={styles.subtitle}>
              Organize sua equipe, filtre por tipo e veja seus Pokémon capturados.
            </Text>
          </View>

          <View style={styles.counterBox}>
            <Text style={styles.counterNumber}>{time.length}</Text>
            <Text style={styles.counterLabel}>no time</Text>
          </View>

          <View style={styles.counterBoxGold}>
            <Text style={styles.counterNumberGold}>{capturados.length}</Text>
            <Text style={styles.counterLabel}>capturados</Text>
          </View>
        </Animated.View>

        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuButton} onPress={() => router.push('/(app)/pokedex')}>
            <Text style={styles.menuText}>POKÉDEX</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuButtonBattle} onPress={() => router.push('/(app)/battle')}>
            <Text style={styles.menuTextDark}>BATALHAR</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuButtonOutline} onPress={() => router.push('/(app)/perfil')}>
            <Text style={styles.menuTextOutline}>PERFIL</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuButtonExit} onPress={sair}>
            <Text style={styles.menuTextExit}>SAIR</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <View style={styles.searchHeader}>
            <View>
              <Text style={styles.searchLabel}>🔎 BUSCA DO PC</Text>
              <Text style={styles.searchHint}>nome • número • categoria elemental</Text>
            </View>

            <Text style={styles.searchCount}>{timeFiltrado.length + capturadosFiltrados.length} resultados</Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Ex: Pikachu, 25, água, fire..."
            placeholderTextColor="#7C8499"
            value={busca}
            onChangeText={setBusca}
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeFilterArea}>
            {tiposDisponiveis.map(tipo => {
              const ativo = tipoSelecionado === tipo;
              const cor = tipo === 'todos' ? '#FFD600' : typeColors[tipo] || '#FFD600';

              return (
                <TouchableOpacity
                  key={tipo}
                  activeOpacity={0.85}
                  style={[
                    styles.filterButton,
                    { borderColor: cor },
                    ativo && { backgroundColor: cor },
                  ]}
                  onPress={() => setTipoSelecionado(tipo)}
                >
                  <Text style={[styles.filterText, ativo && styles.filterTextActive]}>
                    {tipo === 'todos'
                      ? '★ TODOS'
                      : `${typeIcons[tipo] || '●'} ${typeLabels[tipo]?.toUpperCase() || tipo.toUpperCase()}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>★ TIME PRINCIPAL</Text>
            <Text style={styles.sectionSubtitle}>Pokémon ativos para batalha</Text>
          </View>
          <Text style={styles.sectionCount}>{timeFiltrado.length} encontrados</Text>
        </View>

        {timeFiltrado.length === 0 ? (
          <EmptyState
            title="Nenhum Pokémon encontrado"
            text="Tente buscar por outro nome, número ou tipo."
          />
        ) : (
          <FlatList
            data={timeFiltrado}
            keyExtractor={item => item.index}
            numColumns={4}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.columnWrapper}
            renderItem={({ item }) => <CardPokemon pokemon={item} />}
          />
        )}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>★ POKÉMONS CAPTURADOS</Text>
            <Text style={styles.sectionSubtitle}>Recompensas das batalhas vencidas</Text>
          </View>
          <Text style={styles.sectionCount}>{capturadosFiltrados.length} encontrados</Text>
        </View>

        {capturadosFiltrados.length === 0 ? (
          <EmptyState
            title={capturados.length === 0 ? 'Nenhum Pokémon capturado' : 'Nenhum capturado encontrado'}
            text={
              capturados.length === 0
                ? 'Vença uma batalha completa para abrir a Pokédex e ganhar um novo Pokémon.'
                : 'Tente mudar a busca ou escolher outro tipo.'
            }
          />
        ) : (
          <FlatList
            data={capturadosFiltrados}
            keyExtractor={(item, index) => `${item.index}-${index}`}
            numColumns={4}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.columnWrapper}
            renderItem={({ item }) => <CardPokemon pokemon={item} capturado />}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#030716',
    overflow: 'hidden',
  },

  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
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
    gap: 10,
  },

  topDotGreen: {
    width: 14,
    height: 14,
    borderRadius: 20,
    backgroundColor: '#31FF7B',
    shadowColor: '#31FF7B',
    shadowOpacity: 1,
    shadowRadius: 12,
  },

  topDotYellow: {
    width: 14,
    height: 14,
    borderRadius: 20,
    backgroundColor: '#FFD600',
  },

  topDotRed: {
    width: 14,
    height: 14,
    borderRadius: 20,
    backgroundColor: '#FF4D6D',
  },

  logo: {
    color: '#FFD600',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 3,
  },

  status: {
    color: '#FF4D6D',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },

  container: {
    padding: 20,
    paddingBottom: 70,
  },

  hero: {
    backgroundColor: '#0B142C',
    borderWidth: 3,
    borderColor: '#263B70',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
    overflow: 'hidden',
    position: 'relative',
  },

  pixelPattern: {
    position: 'absolute',
    right: 24,
    top: 18,
    width: 118,
    height: 86,
    opacity: 0.08,
    backgroundColor: '#FFD600',
  },

  scanLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
  },

  heroText: {
    flex: 1,
  },

  kicker: {
    color: '#31FF7B',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 4,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 1,
  },

  subtitle: {
    color: '#AAB3C7',
    fontSize: 14,
    marginTop: 6,
    fontWeight: '700',
  },

  counterBox: {
    backgroundColor: '#060A1A',
    borderWidth: 3,
    borderColor: '#31D06B',
    paddingVertical: 12,
    paddingHorizontal: 22,
    alignItems: 'center',
  },

  counterBoxGold: {
    backgroundColor: '#060A1A',
    borderWidth: 3,
    borderColor: '#FFD600',
    paddingVertical: 12,
    paddingHorizontal: 22,
    alignItems: 'center',
  },

  counterNumber: {
    color: '#31FF7B',
    fontSize: 30,
    fontWeight: '900',
  },

  counterNumberGold: {
    color: '#FFD600',
    fontSize: 30,
    fontWeight: '900',
  },

  counterLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  menu: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },

  menuButton: {
    flex: 1,
    backgroundColor: '#FF174D',
    borderWidth: 3,
    borderColor: '#FF6B8A',
    paddingVertical: 14,
    alignItems: 'center',
  },

  menuButtonBattle: {
    flex: 1,
    backgroundColor: '#FFD600',
    borderWidth: 3,
    borderColor: '#FFF36D',
    paddingVertical: 14,
    alignItems: 'center',
  },

  menuText: {
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 1,
  },

  menuTextDark: {
    color: '#030716',
    fontWeight: '900',
    letterSpacing: 1,
  },

  menuButtonOutline: {
    flex: 1,
    backgroundColor: '#060A1A',
    borderWidth: 3,
    borderColor: '#31D06B',
    paddingVertical: 14,
    alignItems: 'center',
  },

  menuTextOutline: {
    color: '#31FF7B',
    fontWeight: '900',
    letterSpacing: 1,
  },

  menuButtonExit: {
    flex: 1,
    backgroundColor: '#060A1A',
    borderWidth: 3,
    borderColor: '#FF174D',
    paddingVertical: 14,
    alignItems: 'center',
  },

  menuTextExit: {
    color: '#FF4D6D',
    fontWeight: '900',
    letterSpacing: 1,
  },

  searchBox: {
    backgroundColor: '#0B142C',
    borderWidth: 3,
    borderColor: '#263B70',
    padding: 16,
    marginBottom: 24,
  },

  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
    marginBottom: 10,
  },

  searchLabel: {
    color: '#FFD600',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },

  searchHint: {
    color: '#7C8499',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 3,
  },

  searchCount: {
    color: '#31FF7B',
    fontSize: 12,
    fontWeight: '900',
  },

  input: {
    backgroundColor: '#050A18',
    borderWidth: 3,
    borderColor: '#1F2E58',
    padding: 14,
    color: '#FFFFFF',
    fontWeight: '800',
    marginBottom: 14,
  },

  typeFilterArea: {
    gap: 10,
  },

  filterButton: {
    backgroundColor: '#060A1A',
    borderWidth: 3,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  filterText: {
    color: '#AAB3C7',
    fontSize: 12,
    fontWeight: '900',
  },

  filterTextActive: {
    color: '#030716',
  },

  sectionHeader: {
    backgroundColor: '#080E22',
    borderLeftWidth: 5,
    borderLeftColor: '#FFD600',
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 14,
  },

  sectionTitle: {
    color: '#FFD600',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },

  sectionSubtitle: {
    color: '#7C8499',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },

  sectionCount: {
    color: '#8F9AB3',
    fontSize: 12,
    fontWeight: '900',
  },

  listContent: {
    paddingBottom: 20,
  },

  columnWrapper: {
    gap: 14,
    marginBottom: 14,
  },

  cardOuter: {
    flex: 1,
  },

  card: {
    flex: 1,
    minHeight: 292,
    backgroundColor: '#0B142C',
    borderWidth: 3,
    padding: 14,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },

  cardNeon: {
    position: 'absolute',
    width: '110%',
    height: '110%',
  },

  corner: {
    position: 'absolute',
    width: 15,
    height: 15,
  },

  cornerTL: {
    top: 0,
    left: 0,
  },

  cornerTR: {
    top: 0,
    right: 0,
  },

  cornerBL: {
    bottom: 0,
    left: 0,
  },

  cornerBR: {
    bottom: 0,
    right: 0,
  },

  cardTopRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  dexChip: {
    backgroundColor: '#060A1A',
    borderWidth: 2,
    borderColor: '#263B70',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  number: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  category: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },

  pixelFrame: {
    width: 136,
    height: 136,
    backgroundColor: '#07101F',
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    overflow: 'hidden',
  },

  pixelGrid: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.05,
    backgroundColor: '#FFFFFF',
  },

  spriteGlow: {
    position: 'absolute',
    width: 92,
    height: 92,
    opacity: 0.18,
  },

  image: {
    width: 116,
    height: 116,
  },

  name: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    textTransform: 'capitalize',
    marginBottom: 8,
    textAlign: 'center',
  },

  types: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },

  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },

  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },

  typeBadgeTextDark: {
    color: '#2B2400',
  },

  pixelInfoBox: {
    backgroundColor: '#060A1A',
    borderWidth: 2,
    borderColor: '#263B70',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    width: '100%',
  },

  infoLabel: {
    color: '#7C8499',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },

  infoValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 2,
  },

  emptyBox: {
    backgroundColor: '#0B142C',
    borderWidth: 3,
    borderColor: '#263B70',
    padding: 30,
    alignItems: 'center',
    marginBottom: 22,
  },

  emptyIcon: {
    color: '#FFD600',
    fontSize: 30,
    fontWeight: '900',
    marginBottom: 8,
  },

  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
  },

  emptyText: {
    color: '#AAB3C7',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    fontWeight: '700',
  },

  center: {
    flex: 1,
    backgroundColor: '#030716',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loaderPixel: {
    width: 64,
    height: 64,
    backgroundColor: '#FF174D',
    borderWidth: 5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loaderCore: {
    width: 22,
    height: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#030716',
  },

  loadingText: {
    color: '#FFD600',
    marginTop: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
