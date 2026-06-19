import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  listContent: {
  paddingTop: 22,
  paddingBottom: 120,
  paddingHorizontal: 28,
},

  columnWrapper: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },

  itemContainer: {
    paddingHorizontal: 10,
    paddingBottom: 22,
    alignItems: 'center',
  },

  list: {
  flex: 1,
},

  cardAlign: {
    width: 340,
    maxWidth: '100%',
    alignItems: 'center',
  },

  loadingMore: {
    paddingVertical: 26,
    alignItems: 'center',
  },
});
