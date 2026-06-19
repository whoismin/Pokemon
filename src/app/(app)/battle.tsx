import { useEffect, useMemo, useRef, useState } from 'react';

import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';

import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Pokemon } from '../@types/pokemon';
import { getPokemon } from '../integration/pokemonintegration';
import { getTeam } from '../integration/teamIntegration';
import { useAuth } from '../context/AuthContext';

type Resultado = {
  meuPokemon: Pokemon;
  inimigoPokemon: Pokemon;
  minhaForca: number;
  inimigoForca: number;
  vencedor: 'meu' | 'inimigo';
};

type BattlePokemon = Pokemon & {
  hpMax: number;
  hpAtual: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  speed: number;
  level: number;
};

export default function Battle() {
  const { userId } = useAuth();

  const [meuTime, setMeuTime] = useState<BattlePokemon[]>([]);
  const [rivalTime, setRivalTime] = useState<BattlePokemon[]>([]);
  const [rodadaAtual, setRodadaAtual] = useState(0);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [placarFinal, setPlacarFinal] = useState({ vitorias: 0, derrotas: 0 });
  const [pokemonPremio, setPokemonPremio] = useState<BattlePokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [preBattle, setPreBattle] = useState(true);
  const [lutando, setLutando] = useState(false);
  const [finalizado, setFinalizado] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const brilho = useRef(new Animated.Value(0)).current;
  const meuAnim = useRef(new Animated.Value(1)).current;
  const rivalAnim = useRef(new Animated.Value(1)).current;
  const perdeuAnim = useRef(new Animated.Value(0)).current;
  const ganhouAnim = useRef(new Animated.Value(0)).current;
  const pokedexAnim = useRef(new Animated.Value(0)).current;
  const pokeballAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const preFadeAnim = useRef(new Animated.Value(0)).current;
  const preSlideAnim = useRef(new Animated.Value(34)).current;
  const preVsAnim = useRef(new Animated.Value(1)).current;
  const preScanAnim = useRef(new Animated.Value(0)).current;

  const estrelas = useMemo(() => {
    return Array.from({ length: 35 }).map((_, index) => ({
      id: index,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 65}%`,
    }));
  }, []);

  useEffect(() => {
    carregarBatalha();

    const animacaoBrilho = Animated.loop(
      Animated.sequence([
        Animated.timing(brilho, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(brilho, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    animacaoBrilho.start();

    Animated.parallel([
      Animated.timing(preFadeAnim, {
        toValue: 1,
        duration: 720,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(preSlideAnim, {
        toValue: 0,
        duration: 720,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    const preVsLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(preVsAnim, {
          toValue: 1.08,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(preVsAnim, {
          toValue: 1,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const preScanLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(preScanAnim, {
          toValue: 1,
          duration: 2600,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(preScanAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    preVsLoop.start();
    preScanLoop.start();

    return () => {
      animacaoBrilho.stop();
      preVsLoop.stop();
      preScanLoop.stop();
    };
  }, []);

  async function carregarBatalha() {
    try {
      if (!userId) {
        Alert.alert('Erro', 'Usuário não encontrado.');
        router.replace('/(auth)');
        return;
      }

      const timeApi = await getTeam(userId);
      const todos = await getPokemon(151);

      const meuTimeFormatado = timeApi.slice(0, 5).map(criarPokemonBatalha);
      const inimigos = sortearRival(todos, timeApi).map(criarPokemonBatalha);

      if (meuTimeFormatado.length === 0) {
        Alert.alert('Atenção', 'Você precisa ter pokémons no seu time.');
        router.replace('/(app)/team');
        return;
      }

      setMeuTime(meuTimeFormatado);
      setRivalTime(inimigos);
      setLogs([`Go, ${meuTimeFormatado[0].nome}!`, `${inimigos[0].nome} apareceu!`]);
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Não foi possível carregar a batalha.');
    } finally {
      setLoading(false);
    }
  }

  function sortearRival(lista: Pokemon[], meuTimeAtual: Pokemon[]) {
    const disponiveis = lista.filter(
      pokemon => !meuTimeAtual.some(meu => meu.index === pokemon.index)
    );

    const sorteados: Pokemon[] = [];

    while (sorteados.length < 5 && disponiveis.length > 0) {
      const index = Math.floor(Math.random() * disponiveis.length);
      sorteados.push(disponiveis[index]);
      disponiveis.splice(index, 1);
    }

    return sorteados;
  }

  function calcularForca(pokemon: Pokemon) {
    return pokemon.poderes.reduce((total, poder) => total + poder.forca, 0);
  }

  function criarPokemonBatalha(pokemon: Pokemon): BattlePokemon {
    const forca = calcularForca(pokemon);
    const hp = Math.min(180, 90 + Math.floor(forca / 3));

    return {
      ...pokemon,
      hpMax: hp,
      hpAtual: hp,
      atk: Math.min(160, 45 + Math.floor(forca / 5)),
      def: Math.min(160, 40 + Math.floor(forca / 6)),
      spa: Math.min(160, 50 + Math.floor(forca / 5)),
      spd: Math.min(160, 45 + Math.floor(forca / 6)),
      speed: Math.min(160, 55 + Math.floor(forca / 5)),
      level: 50 + Math.floor(Math.random() * 6),
    };
  }

  function imagemPokemon(pokemon: Pokemon) {
    if (pokemon.imagem) return pokemon.imagem;

    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${Number(
      pokemon.index
    )}.png`;
  }

  function adicionarLog(texto: string) {
    setLogs(atual => [...atual, texto]);
  }

  function calcularDano(atacante: BattlePokemon, defensor: BattlePokemon) {
    const dano = Math.floor(
      atacante.atk * 0.45 + atacante.spa * 0.25 - defensor.def * 0.18
    );

    return Math.max(22, dano);
  }

  async function salvarPokemonCapturado(pokemonCapturado: Pokemon) {
  if (!userId) {
    Alert.alert(
      'Erro',
      'Usuário não encontrado. Faça login novamente.'
    );
    return;
  }

  const chaveCapturados = `@Pokemon:Capturados:${userId}`;

  const capturadosSalvos =
    await AsyncStorage.getItem(chaveCapturados);

  const listaCapturados: Pokemon[] =
    capturadosSalvos
      ? JSON.parse(capturadosSalvos)
      : [];

  const jaExiste = listaCapturados.some(
    pokemon => pokemon.index === pokemonCapturado.index
  );

  if (jaExiste) {
    return;
  }

  const novaLista = [
    ...listaCapturados,
    pokemonCapturado,
  ];

  await AsyncStorage.setItem(
    chaveCapturados,
    JSON.stringify(novaLista)
  );
}

  function mostrarMensagemPerdeu() {
    perdeuAnim.setValue(0);

    Animated.sequence([
      Animated.timing(perdeuAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.delay(1200),
      Animated.timing(perdeuAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function mostrarMensagemGanhou() {
    ganhouAnim.setValue(0);

    Animated.sequence([
      Animated.timing(ganhouAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.delay(1200),
      Animated.timing(ganhouAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function animarAtaque(vencedor: 'meu' | 'inimigo') {
    const anim = vencedor === 'meu' ? meuAnim : rivalAnim;

    Animated.sequence([
      Animated.timing(anim, {
        toValue: 1.16,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }

  async function batalhar() {
    if (lutando || resultado || finalizado) return;

    const meuPokemon = meuTime[rodadaAtual];
    const inimigoPokemon = rivalTime[rodadaAtual];

    if (!meuPokemon || !inimigoPokemon) return;

    setLutando(true);
    setLogs([`Go, ${meuPokemon.nome}!`, `${inimigoPokemon.nome} apareceu!`]);

    setTimeout(() => {
      const danoMeu = calcularDano(meuPokemon, inimigoPokemon);
      const novoRivalTime = [...rivalTime];
      const hpRivalDepois = Math.max(0, inimigoPokemon.hpAtual - danoMeu);

      novoRivalTime[rodadaAtual] = {
        ...inimigoPokemon,
        hpAtual: hpRivalDepois,
      };

      setRivalTime(novoRivalTime);
      adicionarLog(`${meuPokemon.nome} usou Ataque Especial!`);
      adicionarLog(`${danoMeu} damage dealt!`);
      animarAtaque('meu');

      setTimeout(() => {
        const novoMeuTime = [...meuTime];
        let hpMeuDepois = meuPokemon.hpAtual;

        if (hpRivalDepois > 0) {
          const danoInimigo = calcularDano(inimigoPokemon, meuPokemon);
          hpMeuDepois = Math.max(0, meuPokemon.hpAtual - danoInimigo);

          novoMeuTime[rodadaAtual] = {
            ...meuPokemon,
            hpAtual: hpMeuDepois,
          };

          setMeuTime(novoMeuTime);
          adicionarLog(`${inimigoPokemon.nome} contra-atacou!`);
          adicionarLog(`${danoInimigo} damage dealt!`);
          animarAtaque('inimigo');
        }

        let vencedor: 'meu' | 'inimigo';
        const meuAtualizado = novoMeuTime[rodadaAtual] || meuPokemon;
        const rivalAtualizado = novoRivalTime[rodadaAtual] || inimigoPokemon;

        if (hpRivalDepois <= 0) {
          vencedor = 'meu';
          adicionarLog(`${inimigoPokemon.nome} fainted!`);
          adicionarLog('Você venceu esta rodada!');
          mostrarMensagemGanhou();
        } else if (hpMeuDepois <= 0) {
          vencedor = 'inimigo';
          adicionarLog(`${meuPokemon.nome} fainted!`);
          adicionarLog('Você perdeu esta rodada!');
          mostrarMensagemPerdeu();
        } else {
          const minhaForca = calcularForca(meuPokemon);
          const inimigoForca = calcularForca(inimigoPokemon);
          vencedor = minhaForca >= inimigoForca ? 'meu' : 'inimigo';

          if (vencedor === 'meu') {
            novoRivalTime[rodadaAtual] = { ...rivalAtualizado, hpAtual: 0 };
            setRivalTime([...novoRivalTime]);
            adicionarLog(`${inimigoPokemon.nome} fainted!`);
            adicionarLog('Você venceu esta rodada!');
            mostrarMensagemGanhou();
          } else {
            novoMeuTime[rodadaAtual] = { ...meuAtualizado, hpAtual: 0 };
            setMeuTime([...novoMeuTime]);
            adicionarLog(`${meuPokemon.nome} fainted!`);
            adicionarLog('Você perdeu esta rodada!');
            mostrarMensagemPerdeu();
          }
        }

        const novoResultado: Resultado = {
          meuPokemon,
          inimigoPokemon,
          minhaForca: calcularForca(meuPokemon),
          inimigoForca: calcularForca(inimigoPokemon),
          vencedor,
        };

        setResultado(novoResultado);
        setLutando(false);
      }, 950);
    }, 700);
  }

  async function finalizarBatalha(todasRodadas: Resultado[]) {
    const vitorias = todasRodadas.filter(item => item.vencedor === 'meu').length;
    const derrotas = todasRodadas.filter(item => item.vencedor === 'inimigo').length;

    setPlacarFinal({ vitorias, derrotas });

    if (vitorias > derrotas) {
      const ultimaVitoria = [...todasRodadas]
        .reverse()
        .find(item => item.vencedor === 'meu');

      const premio = ultimaVitoria?.inimigoPokemon as BattlePokemon | undefined;

      if (premio) {
        setPokemonPremio(premio);
        await salvarPokemonCapturado(premio);
      }
    } else {
      setPokemonPremio(null);
    }

    setFinalizado(true);
    abrirPokedex();
  }

  function abrirPokedex() {
    pokedexAnim.setValue(0);
    pokeballAnim.setValue(0);
    cardAnim.setValue(0);

    Animated.sequence([
      Animated.timing(pokedexAnim, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.back(1.15)),
        useNativeDriver: true,
      }),
      Animated.timing(pokeballAnim, {
        toValue: 1,
        duration: 1700,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 620,
        easing: Easing.out(Easing.back(1.35)),
        useNativeDriver: true,
      }),
    ]).start();
  }

  function proximaRodada() {
    if (!resultado) return;

    const novasRodadas = [...resultados, resultado];
    setResultados(novasRodadas);

    if (rodadaAtual + 1 >= 5 || rodadaAtual + 1 >= meuTime.length) {
      finalizarBatalha(novasRodadas);
      return;
    }

    const proxima = rodadaAtual + 1;
    setRodadaAtual(proxima);
    setResultado(null);
    setLogs([`Go, ${meuTime[proxima].nome}!`, `${rivalTime[proxima].nome} apareceu!`]);
  }

  function BarraStatus({
    nome,
    valor,
    cor,
  }: {
    nome: string;
    valor: number;
    cor: string;
  }) {
    return (
      <View style={styles.statLine}>
        <Text style={styles.statName}>{nome}</Text>

        <View style={styles.statBg}>
          <View
            style={[
              styles.statFill,
              {
                width: `${Math.min(100, valor / 1.6)}%`,
                backgroundColor: cor,
              },
            ]}
          />
        </View>

        <Text style={styles.statValue}>{valor}</Text>
      </View>
    );
  }

  function PokemonInfo({
    pokemon,
    rival = false,
  }: {
    pokemon: BattlePokemon;
    rival?: boolean;
  }) {
    return (
      <View style={styles.sideCard}>
        <Text style={[styles.cardTitle, rival && styles.rivalTitle]}>
          {rival ? 'RIVAL LEAD' : 'YOUR LEAD'}
        </Text>

        <View style={styles.cardHeader}>
          <Image source={{ uri: imagemPokemon(pokemon) }} style={styles.icon} />

          <View>
            <Text style={styles.name}>{pokemon.nome}</Text>
            <Text style={styles.level}>Lv.{pokemon.level}</Text>

            <View style={styles.types}>
              {pokemon.tipos?.slice(0, 2).map(tipo => (
                <Text key={tipo} style={styles.typeBadge}>
                  {tipo}
                </Text>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.hpTextRow}>
          <Text style={styles.hpLabel}>HP</Text>
          <Text style={styles.hpNumber}>
            {pokemon.hpAtual}/{pokemon.hpMax}
          </Text>
        </View>

        <View style={styles.hpBg}>
          <View
            style={[
              styles.hpFill,
              {
                width: `${(pokemon.hpAtual / pokemon.hpMax) * 100}%`,
                backgroundColor:
                  pokemon.hpAtual < pokemon.hpMax * 0.45
                    ? '#FFB020'
                    : '#31D06B',
              },
            ]}
          />
        </View>

        <View style={styles.statsBox}>
          <Text style={styles.statsTitle}>★ STATS</Text>

          <BarraStatus nome="HP" valor={pokemon.hpAtual} cor="#FF5C7A" />
          <BarraStatus nome="ATK" valor={pokemon.atk} cor="#FFB56B" />
          <BarraStatus nome="DEF" valor={pokemon.def} cor="#FFD96B" />
          <BarraStatus nome="SpA" valor={pokemon.spa} cor="#9CB9FF" />
          <BarraStatus nome="SpD" valor={pokemon.spd} cor="#9BE28F" />
          <BarraStatus nome="SPD" valor={pokemon.speed} cor="#FF8BC1" />
        </View>
      </View>
    );
  }

  function TeamList({
    title,
    data,
  }: {
    title: string;
    data: BattlePokemon[];
  }) {
    return (
      <View style={styles.teamBox}>
        <Text style={styles.teamTitle}>{title}</Text>

        {data.map((pokemon, index) => (
          <View key={`${pokemon.index}-${index}`} style={styles.teamLine}>
            <View
              style={[
                styles.dot,
                index === rodadaAtual && styles.activeDot,
                pokemon.hpAtual <= 0 && styles.deadDot,
              ]}
            />

            <Text
              style={[
                styles.teamName,
                pokemon.hpAtual <= 0 && styles.fainted,
                index === rodadaAtual && styles.activeName,
              ]}
            >
              {pokemon.nome}
            </Text>

            <Text style={styles.teamHp}>
              {pokemon.hpAtual <= 0 ? 'FNT' : pokemon.hpAtual}
            </Text>
          </View>
        ))}
      </View>
    );
  }

  function PreviewPokemonCard({
    pokemon,
    rival = false,
    index,
  }: {
    pokemon: BattlePokemon;
    rival?: boolean;
    index: number;
  }) {
    return (
      <Animated.View
        style={[
          styles.previewPokemonCard,
          rival && styles.previewPokemonCardRival,
          {
            opacity: preFadeAnim,
            transform: [
              {
                translateY: preSlideAnim.interpolate({
                  inputRange: [0, 34],
                  outputRange: [0, 34 + index * 4],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.previewCardTop}>
          <Text style={styles.previewSlot}>#{index + 1}</Text>
          <Text style={[styles.previewLevel, rival && styles.previewLevelRival]}>
            LV.{pokemon.level}
          </Text>
        </View>

        <View style={styles.previewImageBox}>
          <Image source={{ uri: imagemPokemon(pokemon) }} style={styles.previewImage} />
        </View>

        <Text style={styles.previewName}>{pokemon.nome}</Text>

        <View style={styles.previewTypes}>
          {pokemon.tipos?.slice(0, 2).map(tipo => (
            <Text key={tipo} style={styles.previewTypeBadge}>
              {tipo}
            </Text>
          ))}
        </View>

        <View style={styles.previewPowerBar}>
          <View
            style={[
              styles.previewPowerFill,
              {
                width: `${Math.min(100, calcularForca(pokemon) / 4)}%`,
                backgroundColor: rival ? '#FF5D7A' : '#31FF7B',
              },
            ]}
          />
        </View>
      </Animated.View>
    );
  }


  if (loading || !meuTime[0] || !rivalTime[0]) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FFD600" />
        <Text style={styles.loadingText}>Carregando batalha...</Text>
      </View>
    );
  }


  if (preBattle) {
    return (
      <View style={styles.preBattleScreen}>
        <View style={styles.preTopBar}>
          <Text style={styles.preLogo}>⚔ BATTLE PREVIEW</Text>
          <Text style={styles.preStatus}>READY</Text>
        </View>

        <View style={styles.preBackground}>
          {estrelas.map(estrela => (
            <View
              key={`pre-${estrela.id}`}
              style={[
                styles.star,
                {
                  left: estrela.left,
                  top: estrela.top,
                },
              ]}
            />
          ))}

          <Animated.View
            pointerEvents="none"
            style={[
              styles.preScanLight,
              {
                transform: [
                  {
                    translateX: preScanAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-240, 1180],
                    }),
                  },
                ],
              },
            ]}
          />

          <Animated.View
            style={[
              styles.preHeaderCard,
              {
                opacity: preFadeAnim,
                transform: [{ translateY: preSlideAnim }],
              },
            ]}
          >
            <Text style={styles.preTitle}>PREPARE-SE PARA A BATALHA</Text>
            <Text style={styles.preSubtitle}>
              Confira os 5 Pokémon de cada lado antes do confronto começar.
            </Text>
          </Animated.View>

          <View style={styles.preVersusArea}>
            <Animated.View
              style={[
                styles.preTeamPanel,
                {
                  opacity: preFadeAnim,
                  transform: [{ translateX: preSlideAnim.interpolate({ inputRange: [0, 34], outputRange: [0, -34] }) }],
                },
              ]}
            >
              <View style={styles.prePanelHeader}>
                <Text style={styles.prePanelTitle}>SEU TIME</Text>
                <Text style={styles.prePanelStatus}>{meuTime.length}/5 READY</Text>
              </View>

              <View style={styles.previewGrid}>
                {meuTime.slice(0, 5).map((pokemon, index) => (
                  <PreviewPokemonCard
                    key={`meu-preview-${pokemon.index}-${index}`}
                    pokemon={pokemon}
                    index={index}
                  />
                ))}
              </View>
            </Animated.View>

            <Animated.View
              style={[
                styles.preVsBox,
                {
                  transform: [{ scale: preVsAnim }],
                },
              ]}
            >
              <Text style={styles.preVsText}>VS</Text>
              <Text style={styles.preVsSub}>5 ROUNDS</Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.preTeamPanelRival,
                {
                  opacity: preFadeAnim,
                  transform: [{ translateX: preSlideAnim }],
                },
              ]}
            >
              <View style={styles.prePanelHeader}>
                <Text style={styles.prePanelTitleRival}>TIME RIVAL</Text>
                <Text style={styles.prePanelStatusRival}>{rivalTime.length}/5 READY</Text>
              </View>

              <View style={styles.previewGrid}>
                {rivalTime.slice(0, 5).map((pokemon, index) => (
                  <PreviewPokemonCard
                    key={`rival-preview-${pokemon.index}-${index}`}
                    pokemon={pokemon}
                    rival
                    index={index}
                  />
                ))}
              </View>
            </Animated.View>
          </View>

          <View style={styles.preFooter}>
            <Text style={styles.preTip}>
              Dica: vença mais rodadas que o rival para desbloquear um Pokémon capturado.
            </Text>

            <TouchableOpacity
              activeOpacity={0.88}
              style={styles.startBattleButton}
              onPress={() => setPreBattle(false)}
            >
              <Text style={styles.startBattleText}>INICIAR BATALHA ►</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const meuPokemon = meuTime[Math.min(rodadaAtual, meuTime.length - 1)];
  const rivalPokemon = rivalTime[Math.min(rodadaAtual, rivalTime.length - 1)];
  const vitorias = finalizado
    ? placarFinal.vitorias
    : resultados.filter(item => item.vencedor === 'meu').length;
  const derrotas = finalizado
    ? placarFinal.derrotas
    : resultados.filter(item => item.vencedor === 'inimigo').length;

  const pokeballShake = pokeballAnim.interpolate({
    inputRange: [0, 0.12, 0.22, 0.32, 0.42, 0.52, 0.62, 0.72, 0.82, 1],
    outputRange: ['0deg', '-18deg', '18deg', '-16deg', '16deg', '-12deg', '12deg', '-8deg', '8deg', '0deg'],
  });

  const pokeballScale = pokeballAnim.interpolate({
    inputRange: [0, 0.12, 0.28, 0.44, 0.6, 0.78, 1],
    outputRange: [0.65, 1, 1.13, 0.92, 1.18, 0.88, 0],
  });

  const pokeballOpacity = pokeballAnim.interpolate({
    inputRange: [0, 0.1, 0.78, 1],
    outputRange: [0, 1, 1, 0],
  });

  const pokedexFlashOpacity = pokeballAnim.interpolate({
    inputRange: [0, 0.72, 0.86, 1],
    outputRange: [0, 0, 0.9, 0],
  });

  const pokeballTextOpacity = pokeballAnim.interpolate({
    inputRange: [0, 0.12, 0.75, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Text style={styles.logo}>⚡ POKÉMON BATTLE</Text>

        <View style={styles.roundBalls}>
          {meuTime.map((_, index) => (
            <View
              key={`meu-${index}`}
              style={[styles.ball, index === rodadaAtual && styles.ballActive]}
            />
          ))}

          <Text style={styles.vs}>VS</Text>

          {rivalTime.map((_, index) => (
            <View
              key={`rival-${index}`}
              style={[
                styles.ball,
                index === rodadaAtual && styles.ballRivalActive,
              ]}
            />
          ))}
        </View>

        <Text style={styles.battling}>× BATTLING...</Text>
      </View>

      <View style={styles.main}>
        <View style={styles.sidebar}>
          <PokemonInfo pokemon={meuPokemon} />
          <TeamList title="YOUR TEAM" data={meuTime} />
        </View>

        <View style={styles.centerArea}>
          <View style={styles.arena}>
            {estrelas.map(estrela => (
              <View
                key={estrela.id}
                style={[
                  styles.star,
                  {
                    left: estrela.left,
                    top: estrela.top,
                  },
                ]}
              />
            ))}

            <View style={styles.mountainA} />
            <View style={styles.mountainB} />
            <View style={styles.mountainC} />

            <View style={styles.platformLeft} />
            <View style={styles.platformRight} />

            <Animated.View
              style={[
                styles.myPokemonBattle,
                {
                  transform: [{ scale: meuAnim }],
                  opacity: meuPokemon.hpAtual <= 0 ? 0.35 : 1,
                },
              ]}
            >
              <Image
                source={{ uri: imagemPokemon(meuPokemon) }}
                style={styles.battleImage}
              />
            </Animated.View>

            <Animated.View
              style={[
                styles.rivalPokemonBattle,
                {
                  transform: [{ scale: rivalAnim }],
                  opacity: rivalPokemon.hpAtual <= 0 ? 0.35 : 1,
                },
              ]}
            >
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.glow,
                  {
                    opacity: brilho.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.2, 0.75],
                    }),
                  },
                ]}
              />

              <Image
                source={{ uri: imagemPokemon(rivalPokemon) }}
                style={styles.battleImage}
              />
            </Animated.View>

            <Animated.View
              pointerEvents="none"
              style={[
                styles.lostMessage,
                {
                  opacity: perdeuAnim,
                  transform: [
                    {
                      scale: perdeuAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.lostTitle}>RODADA PERDIDA!</Text>
              <Text style={styles.lostText}>
                Seu Pokémon foi derrotado. Tente virar a batalha!
              </Text>
            </Animated.View>

            <Animated.View
              pointerEvents="none"
              style={[
                styles.winMessage,
                {
                  opacity: ganhouAnim,
                  transform: [
                    {
                      scale: ganhouAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.winTitle}>RODADA VENCIDA!</Text>
              <Text style={styles.winText}>
                Continue vencendo para ganhar um Pokémon no final.
              </Text>
            </Animated.View>
          </View>

          <View style={styles.bottomPanel}>
            <View style={styles.hpBattleRow}>
              <View style={styles.hpBattleBox}>
                <View style={styles.hpBattleHeader}>
                  <Text style={styles.myHpName}>{meuPokemon.nome}</Text>
                  <Text style={styles.myHpName}>
                    {meuPokemon.hpAtual}/{meuPokemon.hpMax}
                  </Text>
                </View>

                <View style={styles.hpBg}>
                  <View
                    style={[
                      styles.hpFill,
                      {
                        width: `${(meuPokemon.hpAtual / meuPokemon.hpMax) * 100}%`,
                        backgroundColor:
                          meuPokemon.hpAtual < meuPokemon.hpMax * 0.45
                            ? '#FFB020'
                            : '#31D06B',
                      },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.hpBattleBox}>
                <View style={styles.hpBattleHeader}>
                  <Text style={styles.rivalHpName}>{rivalPokemon.nome}</Text>
                  <Text style={styles.rivalHpName}>
                    {rivalPokemon.hpAtual}/{rivalPokemon.hpMax}
                  </Text>
                </View>

                <View style={styles.hpBg}>
                  <View
                    style={[
                      styles.hpFill,
                      {
                        width: `${(rivalPokemon.hpAtual / rivalPokemon.hpMax) * 100}%`,
                        backgroundColor:
                          rivalPokemon.hpAtual < rivalPokemon.hpMax * 0.45
                            ? '#FFB020'
                            : '#31D06B',
                      },
                    ]}
                  />
                </View>
              </View>
            </View>

            <ScrollView style={styles.logBox}>
              {logs.map((log, index) => (
                <Text
                  key={`${log}-${index}`}
                  style={
                    log.includes('damage') ||
                    log.includes('fainted') ||
                    log.includes('perdeu')
                      ? styles.logRed
                      : log.includes('venceu')
                      ? styles.logGreen
                      : styles.logWhite
                  }
                >
                  {log}
                </Text>
              ))}
            </ScrollView>
          </View>

          {!resultado ? (
            <TouchableOpacity
              style={[styles.button, lutando && styles.buttonDisabled]}
              onPress={batalhar}
              disabled={lutando || !!resultado || finalizado}
            >
              <Text style={styles.buttonText}>
                {lutando ? '⚔ LUTANDO...' : '⚔ BATALHAR'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.button} onPress={proximaRodada} disabled={finalizado}>
              <Text style={styles.buttonText}>
                {rodadaAtual + 1 >= 5 || rodadaAtual + 1 >= meuTime.length
                  ? 'FINALIZAR BATALHA'
                  : 'PRÓXIMA RODADA'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.sidebar}>
          <PokemonInfo pokemon={rivalPokemon} rival />
          <TeamList title="RIVAL TEAM" data={rivalTime} />
        </View>
      </View>

      <Animated.View
        pointerEvents={finalizado ? 'auto' : 'none'}
        style={[
          styles.finalOverlay,
          {
            opacity: pokedexAnim,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.pokedexBox,
            {
              transform: [
                {
                  scale: pokedexAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.75, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.pokedexTop}>
            <View style={styles.pokedexLight} />
            <Text style={styles.pokedexTitle}>POKÉDEX</Text>
          </View>

          <Text style={styles.finalTitle}>
            {vitorias > derrotas ? 'VOCÊ VENCEU!' : 'VOCÊ PERDEU!'}
          </Text>


          {pokemonPremio ? (
            <View style={styles.rewardStage}>
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.captureTextBox,
                  {
                    opacity: pokeballTextOpacity,
                  },
                ]}
              >
                <Text style={styles.captureTitle}>CAPTURA CONFIRMADA!</Text>
                <Text style={styles.captureText}>A Pokébola está abrindo...</Text>
              </Animated.View>

              <Animated.View
                pointerEvents="none"
                style={[
                  styles.captureBall,
                  {
                    opacity: pokeballOpacity,
                    transform: [
                      { rotate: pokeballShake },
                      { scale: pokeballScale },
                    ],
                  },
                ]}
              >
                <View style={styles.ballTop} />
                <View style={styles.ballBottom} />
                <View style={styles.ballLine} />
                <View style={styles.ballCenterOuter}>
                  <View style={styles.ballCenterInner} />
                </View>
              </Animated.View>

              <Animated.View
                pointerEvents="none"
                style={[
                  styles.captureFlash,
                  {
                    opacity: pokedexFlashOpacity,
                  },
                ]}
              />

              <Animated.View
                style={[
                  styles.pokemonCard,
                  {
                    opacity: cardAnim,
                    transform: [
                      {
                        translateY: cardAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [35, 0],
                        }),
                      },
                      {
                        scale: cardAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.78, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.pokemonCardShine} />

                <View style={styles.cardTopRow}>
                  <Text style={styles.cardBasic}>BÁSICO</Text>
                  <Text style={styles.cardPokemonName}>{pokemonPremio.nome}</Text>
                  <Text style={styles.cardHp}>HP {pokemonPremio.hpMax}</Text>
                </View>

                <View style={styles.rewardImageBox}>
                  <Image
                    source={{ uri: imagemPokemon(pokemonPremio) }}
                    style={styles.rewardImage}
                  />
                </View>

                <Text style={styles.cardCaption}>
                  Nº {String(pokemonPremio.index).padStart(3, '0')} • Pokémon {pokemonPremio.tipos?.join(' / ')}
                </Text>

                <View style={styles.cardAttackArea}>
                  <View style={styles.cardAttackLine}>
                    <Text style={styles.cardAttackIcon}>🌿</Text>
                    <View style={styles.cardAttackTextBox}>
                      <Text style={styles.cardAttackName}>Hp</Text>
                      <Text style={styles.cardAttackDesc}>Registrado na sua coleção.</Text>
                    </View>
                    <Text style={styles.cardAttackValue}>{pokemonPremio.hpMax}</Text>
                  </View>

                  <View style={styles.cardAttackLine}>
                    <Text style={styles.cardAttackIcon}>⭐</Text>
                    <View style={styles.cardAttackTextBox}>
                      <Text style={styles.cardAttackName}>Ataque</Text>
                      <Text style={styles.cardAttackDesc}>Novo parceiro desbloqueado.</Text>
                    </View>
                    <Text style={styles.cardAttackValue}>{pokemonPremio.atk}</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.cardFooterText}>Fraqueza 🔥 x2</Text>
                  <Text style={styles.cardFooterText}>Recuo ⭐⭐</Text>
                </View>

                <Text style={styles.rewardInfo}>foi adicionado à sua coleção!</Text>
              </Animated.View>
            </View>
          ) : (
            <Animated.View style={[styles.defeatCard, { opacity: cardAnim }]}> 
              <Text style={styles.defeatTitle}>Nenhum Pokémon capturado</Text>
              <Text style={styles.defeatText}>
                Vença a batalha final para desbloquear um novo Pokémon.
              </Text>
            </Animated.View>
          )}


          <TouchableOpacity
            style={styles.finalButton}
            onPress={() => router.push('/(app)/perfil')}
          >
            <Text style={styles.finalButtonText}>VOLTAR AO PERFIL</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  preBattleScreen: {
    flex: 1,
    backgroundColor: '#030716',
  },

  preTopBar: {
    height: 50,
    backgroundColor: '#10164A',
    borderBottomWidth: 3,
    borderBottomColor: '#26346C',
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  preLogo: {
    color: '#FFD600',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 3,
  },

  preStatus: {
    color: '#31FF7B',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },

  preBackground: {
    flex: 1,
    padding: 22,
    justifyContent: 'center',
    overflow: 'hidden',
  },

  preScanLight: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 95,
    backgroundColor: 'rgba(255,255,255,0.06)',
    zIndex: 1,
  },

  preHeaderCard: {
    backgroundColor: '#0B142C',
    borderWidth: 3,
    borderColor: '#263B70',
    paddingVertical: 18,
    paddingHorizontal: 22,
    alignItems: 'center',
    marginBottom: 18,
    zIndex: 2,
  },

  preTitle: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
  },

  preSubtitle: {
    color: '#AAB3C7',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 8,
    textAlign: 'center',
  },

  preVersusArea: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    zIndex: 2,
  },

  preTeamPanel: {
    flex: 1,
    backgroundColor: '#071B15',
    borderWidth: 3,
    borderColor: '#31FF7B',
    padding: 16,
    shadowColor: '#31FF7B',
    shadowOpacity: 0.35,
    shadowRadius: 18,
  },

  preTeamPanelRival: {
    flex: 1,
    backgroundColor: '#220713',
    borderWidth: 3,
    borderColor: '#FF5D7A',
    padding: 16,
    shadowColor: '#FF5D7A',
    shadowOpacity: 0.35,
    shadowRadius: 18,
  },

  prePanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255,255,255,0.12)',
    paddingBottom: 10,
  },

  prePanelTitle: {
    color: '#31FF7B',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },

  prePanelTitleRival: {
    color: '#FF5D7A',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },

  prePanelStatus: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  prePanelStatusRival: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },

  previewGrid: {
    flexDirection: 'row',
    gap: 10,
  },

  previewPokemonCard: {
    flex: 1,
    minHeight: 220,
    backgroundColor: '#06120F',
    borderWidth: 2,
    borderColor: '#31FF7B',
    padding: 10,
    alignItems: 'center',
  },

  previewPokemonCardRival: {
    backgroundColor: '#16050D',
    borderColor: '#FF5D7A',
  },

  previewCardTop: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  previewSlot: {
    color: '#8F9AB3',
    fontSize: 11,
    fontWeight: '900',
  },

  previewLevel: {
    color: '#31FF7B',
    fontSize: 11,
    fontWeight: '900',
  },

  previewLevelRival: {
    color: '#FF5D7A',
  },

  previewImageBox: {
    width: 92,
    height: 92,
    backgroundColor: '#081221',
    borderWidth: 2,
    borderColor: '#263B70',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  previewImage: {
    width: 82,
    height: 82,
    resizeMode: 'contain',
  },

  previewName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'capitalize',
    textAlign: 'center',
    minHeight: 34,
  },

  previewTypes: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 5,
    minHeight: 22,
  },

  previewTypeBadge: {
    backgroundColor: '#63C7EF',
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
    paddingHorizontal: 6,
    paddingVertical: 3,
    textTransform: 'uppercase',
  },

  previewPowerBar: {
    width: '100%',
    height: 7,
    backgroundColor: '#020613',
    marginTop: 10,
    overflow: 'hidden',
  },

  previewPowerFill: {
    height: '100%',
  },

  preVsBox: {
    width: 108,
    height: 108,
    backgroundColor: '#FFD600',
    borderWidth: 5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FFD600',
    shadowOpacity: 1,
    shadowRadius: 24,
    zIndex: 3,
  },

  preVsText: {
    color: '#030716',
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 1,
  },

  preVsSub: {
    color: '#7F1023',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: -3,
  },

  preFooter: {
    marginTop: 20,
    alignItems: 'center',
    zIndex: 2,
  },

  preTip: {
    color: '#AAB3C7',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
  },

  startBattleButton: {
    backgroundColor: '#FF174D',
    borderWidth: 3,
    borderColor: '#FF6B8A',
    paddingVertical: 16,
    paddingHorizontal: 54,
    shadowColor: '#FF174D',
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },

  startBattleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },

  screen: {
    flex: 1,
    backgroundColor: '#030716',
  },

  center: {
    flex: 1,
    backgroundColor: '#030716',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    color: '#FFD600',
    marginTop: 12,
    fontWeight: '900',
  },

  topBar: {
    height: 42,
    backgroundColor: '#11164A',
    borderBottomWidth: 1,
    borderBottomColor: '#253165',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },

  logo: {
    color: '#FFD600',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 3,
  },

  roundBalls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  ball: {
    width: 17,
    height: 17,
    borderRadius: 20,
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#444',
  },

  ballActive: {
    backgroundColor: '#35FF7B',
    shadowColor: '#35FF7B',
    shadowOpacity: 1,
    shadowRadius: 10,
  },

  ballRivalActive: {
    backgroundColor: '#FF5D7A',
    shadowColor: '#FF5D7A',
    shadowOpacity: 1,
    shadowRadius: 10,
  },

  vs: {
    color: '#FF2F65',
    fontWeight: '900',
    marginHorizontal: 12,
  },

  battling: {
    color: '#FFD600',
    fontWeight: '900',
    letterSpacing: 1,
  },

  main: {
    flex: 1,
    flexDirection: 'row',
  },

  sidebar: {
    width: 280,
    padding: 12,
    gap: 12,
    minHeight: 0,
  },

  centerArea: {
    flex: 1,
    minHeight: 0,
    justifyContent: 'space-between',
  },

  sideCard: {
    backgroundColor: '#0B142C',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#24385F',
    padding: 12,
  },

  cardTitle: {
    color: '#31FF7B',
    fontWeight: '900',
    letterSpacing: 3,
    fontSize: 13,
    marginBottom: 10,
  },

  rivalTitle: {
    color: '#FF5A73',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  icon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },

  name: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    textTransform: 'capitalize',
  },

  level: {
    color: '#AAB3C7',
    fontSize: 12,
    fontWeight: '800',
  },

  types: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 4,
  },

  typeBadge: {
    backgroundColor: '#63C7EF',
    color: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },

  hpTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },

  hpLabel: {
    color: '#C9D2E8',
    fontWeight: '900',
  },

  hpNumber: {
    color: '#33FF7A',
    fontWeight: '900',
  },

  hpBg: {
    height: 12,
    backgroundColor: '#020613',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 6,
  },

  hpFill: {
    height: '100%',
    backgroundColor: '#31D06B',
    borderRadius: 12,
  },

  statsBox: {
    marginTop: 12,
  },

  statsTitle: {
    color: '#FFD600',
    textAlign: 'center',
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 6,
  },

  statLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  statName: {
    width: 34,
    color: '#FF6F87',
    fontSize: 11,
    fontWeight: '900',
  },

  statBg: {
    flex: 1,
    height: 7,
    backgroundColor: '#020613',
    borderRadius: 10,
    overflow: 'hidden',
  },

  statFill: {
    height: '100%',
    borderRadius: 10,
  },

  statValue: {
    width: 38,
    color: '#8F9AB3',
    textAlign: 'right',
    fontSize: 11,
    fontWeight: '900',
  },

  teamBox: {
    flex: 1,
    backgroundColor: '#080E22',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1C2747',
    padding: 12,
  },

  teamTitle: {
    color: '#6F7486',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 12,
  },

  teamLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: '#3A3A3A',
    marginRight: 6,
  },

  activeDot: {
    backgroundColor: '#38FF7A',
  },

  deadDot: {
    backgroundColor: '#555',
  },

  teamName: {
    flex: 1,
    color: '#6E7386',
    fontWeight: '900',
    textTransform: 'capitalize',
  },

  activeName: {
    color: '#FFFFFF',
  },

  fainted: {
    opacity: 0.45,
  },

  teamHp: {
    color: '#6E7386',
    fontWeight: '900',
  },

  arena: {
    flex: 1,
    minHeight: 340,
    backgroundColor: '#111943',
    position: 'relative',
    overflow: 'hidden',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#1C2752',
  },

  star: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    opacity: 0.8,
  },

  mountainA: {
    position: 'absolute',
    width: 360,
    height: 360,
    backgroundColor: '#062814',
    bottom: -120,
    left: 60,
    transform: [{ rotate: '45deg' }],
  },

  mountainB: {
    position: 'absolute',
    width: 430,
    height: 430,
    backgroundColor: '#082E19',
    bottom: -150,
    left: 380,
    transform: [{ rotate: '45deg' }],
  },

  mountainC: {
    position: 'absolute',
    width: 420,
    height: 420,
    backgroundColor: '#09331C',
    bottom: -160,
    right: -80,
    transform: [{ rotate: '45deg' }],
  },

  platformLeft: {
    position: 'absolute',
    left: 115,
    bottom: 120,
    width: 210,
    height: 38,
    backgroundColor: '#2C8018',
    borderRadius: 100,
    transform: [{ scaleX: 1.8 }],
  },

  platformRight: {
  position: 'absolute',
  right: 130,
  bottom: 185,
  width: 205,
  height: 38,
  backgroundColor: '#347E18',
  borderRadius: 100,
  transform: [{ scaleX: 1.7 }],
},

  myPokemonBattle: {
    position: 'absolute',
    left: 130,
    bottom: 115,
  },

  rivalPokemonBattle: {
  position: 'absolute',
  right: 120,
  bottom: 165,
},

  battleImage: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
  },

  glow: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 120,
    backgroundColor: '#FFF36D',
    shadowColor: '#FFF36D',
    shadowOpacity: 1,
    shadowRadius: 35,
  },

  bottomPanel: {
    backgroundColor: '#060A1A',
    borderTopWidth: 1,
    borderColor: '#1B254A',
    minHeight: 150,
  },

  hpBattleRow: {
    flexDirection: 'row',
    paddingHorizontal: 28,
    paddingTop: 10,
    gap: 20,
  },

  hpBattleBox: {
    flex: 1,
  },

  hpBattleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  myHpName: {
    color: '#31FF7B',
    fontWeight: '900',
    textTransform: 'capitalize',
  },

  rivalHpName: {
    color: '#FF5C73',
    fontWeight: '900',
    textTransform: 'capitalize',
  },

  logBox: {
    height: 92,
    marginTop: 8,
    paddingHorizontal: 28,
    paddingVertical: 8,
  },

  logWhite: {
    color: '#E5E7EB',
    fontWeight: '900',
    marginBottom: 5,
    textTransform: 'capitalize',
  },

  logRed: {
    color: '#FF687D',
    fontWeight: '900',
    marginBottom: 5,
    textTransform: 'capitalize',
  },

  logBlue: {
    color: '#67D7FF',
    fontWeight: '900',
    marginBottom: 5,
  },

  logGreen: {
    color: '#31FF7B',
    fontWeight: '900',
    marginBottom: 5,
    textTransform: 'capitalize',
  },

  button: {
    width: 420,
    alignSelf: 'center',
    backgroundColor: '#5a0000',
    borderWidth: 2,
    borderColor: '#777',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    shadowColor: '#FF174D',
    shadowOpacity: 0.65,
    shadowRadius: 20,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 3,
  },

  lostMessage: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 130,
    width: 440,
    backgroundColor: 'rgba(255, 23, 77, 0.96)',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD600',
    zIndex: 99,
  },

  lostTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },

  lostText: {
    color: '#FFE4E8',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 6,
  },

  winMessage: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: 130,
    width: 440,
    backgroundColor: 'rgba(49, 208, 107, 0.96)',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD600',
    zIndex: 99,
  },

  winTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },

  winText: {
    color: '#F0FFF4',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 6,
  },

  finalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.86)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },

  pokedexBox: {
    width: 430,
    minHeight: 500,
    backgroundColor: '#C81E3A',
    borderRadius: 24,
    padding: 18,
    borderWidth: 4,
    borderColor: '#7F1023',
    alignItems: 'center',
    shadowColor: '#FF174D',
    shadowOpacity: 0.9,
    shadowRadius: 28,
  },

  pokedexTop: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  pokedexLight: {
    width: 44,
    height: 44,
    borderRadius: 44,
    backgroundColor: '#6EE7FF',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    marginRight: 14,
  },

  pokedexTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 4,
  },

  finalTitle: {
    color: '#FFD600',
    fontSize: 29,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 6,
  },

  finalScore: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 10,
  },


  rewardStage: {
    width: 320,
    minHeight: 355,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  captureTextBox: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
    zIndex: 5,
  },

  captureTitle: {
    color: '#FFD600',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },

  captureText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 4,
  },

  captureBall: {
    position: 'absolute',
    width: 135,
    height: 135,
    borderRadius: 200,
    overflow: 'hidden',
    borderWidth: 5,
    borderColor: '#111827',
    backgroundColor: '#FFFFFF',
    zIndex: 4,
    shadowColor: '#FFFFFF',
    shadowOpacity: 1,
    shadowRadius: 28,
  },

  ballTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: '#E51D3F',
  },

  ballBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: '#F8FAFC',
  },

  ballLine: {
    position: 'absolute',
    top: '47%',
    left: 0,
    right: 0,
    height: 12,
    backgroundColor: '#111827',
  },

  ballCenterOuter: {
    position: 'absolute',
    top: 40,
    left: 40,
    width: 47,
    height: 47,
    borderRadius: 80,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },

  ballCenterInner: {
    width: 34,
    height: 34,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#CBD5E1',
  },

  captureFlash: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 300,
    backgroundColor: '#FFFFFF',
    zIndex: 6,
    shadowColor: '#FFFFFF',
    shadowOpacity: 1,
    shadowRadius: 40,
  },

  pokemonCard: {
    width: 285,
    height: 380,
    backgroundColor: '#CFEA8A',
    borderRadius: 18,
    padding: 10,
    alignItems: 'center',
    borderWidth: 5,
    borderColor: '#FFD600',
    shadowColor: '#FFD600',
    shadowOpacity: 0.9,
    shadowRadius: 18,
    overflow: 'hidden',
    position: 'relative',
  },

  cardMiniTitle: {
    color: '#7F1023',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
  },

  rewardImage: {
    width: 148,
    height: 148,
    resizeMode: 'contain',
  },

  rewardName: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '900',
    textTransform: 'capitalize',
  },

  rewardTypes: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginTop: 3,
  },

  rewardInfo: {
    color: '#7F1023',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 8,
    textAlign: 'center',
  },

  pokemonCardShine: {
    position: 'absolute',
    top: -70,
    right: 28,
    width: 38,
    height: 520,
    backgroundColor: 'rgba(255,255,255,0.18)',
    transform: [{ rotate: '24deg' }],
  },

  cardTopRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
    zIndex: 2,
  },

  cardBasic: {
    backgroundColor: '#F8FAFC',
    color: '#111827',
    fontSize: 8,
    fontWeight: '900',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },

  cardPokemonName: {
    flex: 1,
    color: '#111827',
    fontSize: 19,
    fontWeight: '900',
    textTransform: 'capitalize',
  },

  cardHp: {
    color: '#FF174D',
    fontSize: 13,
    fontWeight: '900',
  },

  rewardImageBox: {
    width: '100%',
    height: 150,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#94A3B8',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

  cardCaption: {
    width: '95%',
    backgroundColor: '#CBD5E1',
    color: '#111827',
    fontSize: 8,
    fontWeight: '900',
    textAlign: 'center',
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: -1,
    marginBottom: 12,
    overflow: 'hidden',
    zIndex: 2,
  },

  cardAttackArea: {
    width: '100%',
    gap: 12,
    zIndex: 2,
  },

  cardAttackLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  cardAttackIcon: {
    width: 22,
    fontSize: 16,
  },

  cardAttackTextBox: {
    flex: 1,
  },

  cardAttackName: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '900',
  },

  cardAttackDesc: {
    color: '#111827',
    fontSize: 8,
    fontWeight: '700',
  },

  cardAttackValue: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '900',
  },

  cardFooter: {
    width: '100%',
    backgroundColor: '#E5E7EB',
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 2,
  },

  cardFooterText: {
    color: '#111827',
    fontSize: 8,
    fontWeight: '900',
  },

  defeatCard: {
    width: 320,
    backgroundColor: '#0B142C',
    borderRadius: 22,
    padding: 24,
    borderWidth: 2,
    borderColor: '#24385F',
    alignItems: 'center',
  },

  defeatTitle: {
    color: '#FF687D',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },

  defeatText: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 20,
  },

  finalButton: {
    backgroundColor: '#111827',
    borderWidth: 2,
    borderColor: '#FFD600',
    paddingVertical: 11,
    paddingHorizontal: 26,
    borderRadius: 14,
    marginTop: 14,
  },

  finalButtonText: {
    color: '#FFD600',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
