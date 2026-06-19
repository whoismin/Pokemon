import { FlatList, View, ActivityIndicator, useWindowDimensions } from 'react-native';

import { Pokemon } from '../../@types/pokemon';
import PokemonStyle from '../PokemonStyle';
import { styles } from './style';

type Props = {
  pokemons: Pokemon[];
  onLoadMore: () => void;
  loadingMore: boolean;
};

export default function List({ pokemons, onLoadMore, loadingMore }: Props) {
  const { width } = useWindowDimensions();

  const numColumns = width >= 1400 ? 4 : width >= 1000 ? 3 : width >= 700 ? 2 : 1;

  return (
    <FlatList
  style={styles.list}
  key={numColumns}
  data={pokemons}
  keyExtractor={(item) => item.index}
  numColumns={numColumns}
  columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
  contentContainerStyle={styles.listContent}
  onEndReached={onLoadMore}
  onEndReachedThreshold={0.35}
  showsVerticalScrollIndicator
  ListFooterComponent={
    loadingMore ? (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color="#FFD600" />
      </View>
    ) : null
  }
  renderItem={({ item }) => (
    <View style={[styles.itemContainer, { width: `${100 / numColumns}%` }]}>
      <View style={styles.cardAlign}>
        <PokemonStyle pokemon={item} />
      </View>
    </View>
  )}
/>
  );
}
