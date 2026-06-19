import { View, Text, Image } from 'react-native';
import FlipCard from 'react-native-flip-card';

import { Pokemon } from '../../@types/pokemon';
import { styles } from './style';

type Props = {
  pokemon: Pokemon;
};

const coresTipo: Record<string, string> = {
  fire: '#F36B2A',
  water: '#4BA3F2',
  grass: '#9DD75B',
  electric: '#FDD835',
  psychic: '#F472B6',
  fighting: '#C2410C',
  poison: '#A855F7',
  ground: '#D6A85A',
  rock: '#A16207',
  ghost: '#7C3AED',
  dragon: '#6366F1',
  dark: '#374151',
  steel: '#94A3B8',
  fairy: '#FDA4AF',
  ice: '#67E8F9',
  bug: '#A3E635',
  normal: '#A3A3A3',
};

const iconesTipo: Record<string, string> = {
  fire: '🔥',
  water: '💧',
  grass: '🌿',
  electric: '⚡',
  psychic: '🔮',
  fighting: '🥊',
  poison: '☠️',
  ground: '⛰️',
  rock: '🪨',
  ghost: '👻',
  dragon: '🐉',
  dark: '🌑',
  steel: '⚙️',
  fairy: '✨',
  ice: '❄️',
  bug: '🐛',
  normal: '⭐',
};

export default function PokemonStyle({ pokemon }: Props) {
  const tipo = pokemon.tipos?.[0]?.toLowerCase() || 'normal';
  const cor = coresTipo[tipo] || coresTipo.normal;
  const icone = iconesTipo[tipo] || '⭐';

  const hp = pokemon.poderes.reduce(
    (total, poder) => total + poder.forca,
    0
  );

  const raridade =
    hp >= 430 ? 'Lendário' : hp >= 300 ? 'Raro' : 'Comum';

  const ataques = pokemon.poderes.slice(0, 2);

  return (
    <FlipCard
      clickable
      friction={8}
      perspective={1000}
      flipHorizontal
      flipVertical={false}
    >
      <View
        style={[
          styles.card,
          { backgroundColor: cor },
          raridade !== 'Comum' && styles.holoShadow,
        ]}
      >
        {raridade !== 'Comum' && (
          <>
            <View style={styles.holoRainbow} />
            <View style={styles.holoLineOne} />
            <View style={styles.holoLineTwo} />
          </>
        )}

        <View style={styles.inner}>
          <View style={styles.header}>
            <Text style={styles.stage}>BÁSICO</Text>

            <Text style={styles.name} numberOfLines={1}>
              {pokemon.nome}
            </Text>

            <Text style={styles.hp}>HP {hp}</Text>

            <View style={styles.typeCircle}>
              <Text style={styles.typeIcon}>{icone}</Text>
            </View>
          </View>

          <View style={styles.artFrame}>
            <Image
              source={{ uri: pokemon.imagem }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>

          <View style={styles.infoStrip}>
            <Text style={styles.infoText} numberOfLines={1}>
              Nº {pokemon.index} • Pokémon {pokemon.tipos.join(' / ')}
            </Text>
          </View>

          <View style={styles.attacks}>
            {ataques.map((poder, index) => (
              <View key={poder.nome} style={styles.attackRow}>
                <Text style={styles.energy}>
                  {icone}{index === 1 ? ' ⭐' : ''}
                </Text>

                <View style={styles.attackText}>
                  <Text style={styles.attackName} numberOfLines={1}>
                    {poder.nome}
                  </Text>

                  <Text style={styles.attackDesc} numberOfLines={1}>
                    Causa dano ao oponente.
                  </Text>
                </View>

                <Text style={styles.damage}>{poder.forca}</Text>
              </View>
            ))}
          </View>

          <View style={styles.statusBar}>
            <Text style={styles.statusText}>Fraqueza 🔥 x2</Text>
            <Text style={styles.statusText}>Resist.</Text>
            <Text style={styles.statusText}>Recuo ⭐⭐</Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.collection}>{pokemon.index}/165 ★</Text>

            <Text style={styles.rarity}>
              ⭐ {raridade}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.backCard}>
        <Image
          source={{
            uri: 'https://images.pokemontcg.io/cardback.png',
          }}
          style={styles.backImage}
          resizeMode="cover"
        />
      </View>
    </FlipCard>
  );
}