import { useEffect, useState } from 'react';

import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import { router } from 'expo-router';

import { getPokemon } from '../integration/pokemonintegration';
import { Pokemon } from '../@types/pokemon';
import { useAuth } from '../context/AuthContext';

import List from '../component/list';

const LIMIT = 12;

export default function Pokedex() {
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState('');

  const { signOut } = useAuth();

  async function sair() {
    await signOut();
    router.replace('/(auth)');
  }

  async function loadData() {
    try {
      setLoading(true);
      setError('');

      const data = await getPokemon(LIMIT, 0);

      const pokemonsOrdenados = [...data].sort(
        (a, b) => Number(a.index) - Number(b.index)
      );

      setPokemons(pokemonsOrdenados);
      setOffset(LIMIT);
    } catch (err) {
      console.error('Erro ao carregar os pokemons:', err);
      setError('Não foi possível carregar os Pokémons.');
    } finally {
      setLoading(false);
    }
  }

  async function loadMorePokemons() {
    if (loadingMore || loading) return;

    try {
      setLoadingMore(true);

      const data = await getPokemon(LIMIT, offset);

      const pokemonsOrdenados = [...data].sort(
        (a, b) => Number(a.index) - Number(b.index)
      );

      setPokemons(pokemonAtual => [
        ...pokemonAtual,
        ...pokemonsOrdenados,
      ]);

      setOffset(valorAtual => valorAtual + LIMIT);
    } catch (err) {
      console.error('Erro ao carregar mais pokemons:', err);
    } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FFD600" />
        <Text style={styles.message}>Carregando Pokédex...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Erro</Text>
        <Text style={styles.message}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.logo}>⚡ POKÉDEX</Text>
        <Text style={styles.status}>BANCO DE DADOS ONLINE</Text>
      </View>

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Pokédex</Text>
          <Text style={styles.subtitle}>
            {pokemons.length} Pokémon encontrados
          </Text>
        </View>

        <View style={styles.counterBox}>
          <Text style={styles.counterNumber}>{pokemons.length}</Text>
          <Text style={styles.counterLabel}>registrados</Text>
        </View>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => router.push('/(app)/team')}
        >
          <Text style={styles.menuText}>MEU TIME</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButtonBattle}
          onPress={() => router.push('/(app)/battle')}
        >
          <Text style={styles.menuTextDark}>BATALHAR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuButtonOutline}
          onPress={() => router.push('/(app)/perfil')}
        >
          <Text style={styles.menuTextOutline}>PERFIL</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButtonExit} onPress={sair}>
          <Text style={styles.menuTextExit}>SAIR</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dexPanel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>★ CARTAS DA POKÉDEX</Text>
          <Text style={styles.panelSubtitle}>Role para descobrir mais</Text>
        </View>

        <List
          pokemons={pokemons}
          onLoadMore={loadMorePokemons}
          loadingMore={loadingMore}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030716',
  },

  topBar: {
    height: 48,
    backgroundColor: '#10164A',
    borderBottomWidth: 3,
    borderBottomColor: '#26346C',
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    letterSpacing: 3,
  },

  header: {
    margin: 20,
    marginBottom: 18,
    backgroundColor: '#0B142C',
    borderWidth: 3,
    borderColor: '#263B70',
    borderRadius: 0,
    padding: 26,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },

  subtitle: {
    fontSize: 15,
    color: '#AAB3C7',
    marginTop: 8,
    fontWeight: '800',
  },

  counterBox: {
    backgroundColor: '#060A1A',
    borderWidth: 3,
    borderColor: '#FFD600',
    borderRadius: 0,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },

  counterNumber: {
    color: '#31FF7B',
    fontSize: 32,
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
    marginHorizontal: 20,
    marginBottom: 18,
  },

  menuButton: {
    flex: 1,
    backgroundColor: '#FF174D',
    borderWidth: 3,
    borderColor: '#FF6B8A',
    paddingVertical: 16,
    borderRadius: 0,
    alignItems: 'center',
  },

  menuButtonBattle: {
    flex: 1,
    backgroundColor: '#FFD600',
    borderWidth: 3,
    borderColor: '#FFF36D',
    paddingVertical: 16,
    borderRadius: 0,
    alignItems: 'center',
  },

  menuButtonOutline: {
    flex: 1,
    backgroundColor: '#060A1A',
    borderWidth: 3,
    borderColor: '#31D06B',
    paddingVertical: 16,
    borderRadius: 0,
    alignItems: 'center',
  },

  menuButtonExit: {
    flex: 1,
    backgroundColor: '#060A1A',
    borderWidth: 3,
    borderColor: '#FF174D',
    paddingVertical: 16,
    borderRadius: 0,
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

  menuTextOutline: {
    color: '#31FF7B',
    fontWeight: '900',
    letterSpacing: 1,
  },

  menuTextExit: {
    color: '#FF4D6D',
    fontWeight: '900',
    letterSpacing: 1,
  },

  dexPanel: {
  flex: 1,
  marginHorizontal: 20,
  marginBottom: 20,
  backgroundColor: '#070B1B',
  borderWidth: 3,
  borderColor: '#263B70',
  borderRadius: 0,
  overflow: 'hidden',
},

  panelHeader: {
  paddingHorizontal: 24,
  paddingTop: 18,
  paddingBottom: 16,
  borderBottomWidth: 3,
  borderBottomColor: '#182447',
},

  panelTitle: {
    color: '#FFD600',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },

  panelSubtitle: {
    color: '#AAB3C7',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },

  center: {
    flex: 1,
    backgroundColor: '#030716',
    justifyContent: 'center',
    alignItems: 'center',
  },

  message: {
    marginTop: 12,
    color: '#AAB3C7',
    fontWeight: '900',
  },

  errorTitle: {
    fontSize: 28,
    color: '#EF4444',
    fontWeight: '900',
  },
});