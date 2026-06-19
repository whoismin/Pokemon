import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    width: 330,
    aspectRatio: 63 / 88,
    borderRadius: 18,
    padding: 7,
    borderWidth: 5,
    borderColor: '#FACC15',
    overflow: 'hidden',
    backgroundColor: '#9DD75B',
  },

  holoShadow: {
    shadowColor: '#FACC15',
    shadowOpacity: 0.9,
    shadowRadius: 16,
    elevation: 16,
  },

  holoRainbow: {
    position: 'absolute',
    top: -80,
    left: -80,
    width: 500,
    height: 500,
    backgroundColor: 'rgba(255,255,255,0.13)',
    transform: [{ rotate: '-25deg' }],
  },

  holoLineOne: {
    position: 'absolute',
    top: -40,
    left: 30,
    width: 36,
    height: 620,
    backgroundColor: 'rgba(255,255,255,0.26)',
    transform: [{ rotate: '28deg' }],
  },

  holoLineTwo: {
    position: 'absolute',
    top: -60,
    right: 30,
    width: 20,
    height: 620,
    backgroundColor: 'rgba(255,255,255,0.18)',
    transform: [{ rotate: '28deg' }],
  },

  inner: {
    flex: 1,
    borderRadius: 12,
    padding: 7,
    backgroundColor: 'rgba(255, 244, 180, 0.42)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
  },

  header: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  stage: {
    backgroundColor: '#E5E7EB',
    color: '#111827',
    fontSize: 8,
    fontWeight: '900',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },

  name: {
    flex: 1,
    color: '#111827',
    fontSize: 20,
    fontWeight: '900',
    textTransform: 'capitalize',
  },

  hp: {
    color: '#FF174D',
    fontSize: 16,
    fontWeight: '900',
  },

  typeCircle: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FEF3C7',
  },

  typeIcon: {
    fontSize: 13,
  },

  artFrame: {
    height: 180,
    backgroundColor: '#F8FAFC',
    borderWidth: 3,
    borderColor: '#9CA3AF',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    overflow: 'hidden',
  },

  image: {
    width: 165,
    height: 165,
  },

  infoStrip: {
    height: 18,
    marginHorizontal: 5,
    marginTop: -3,
    backgroundColor: '#D1D5DB',
    borderWidth: 1,
    borderColor: '#9CA3AF',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoText: {
    color: '#111827',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'capitalize',
  },

  attacks: {
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },

  attackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 45,
  },

  energy: {
    width: 42,
    fontSize: 16,
  },

  attackText: {
    flex: 1,
  },

  attackName: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '900',
    textTransform: 'capitalize',
  },

  attackDesc: {
    color: '#111827',
    fontSize: 10,
    marginTop: 1,
  },

  damage: {
    color: '#111827',
    fontSize: 19,
    fontWeight: '900',
    marginLeft: 6,
  },

  statusBar: {
    height: 23,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#9CA3AF',
    paddingHorizontal: 6,
  },

  statusText: {
    color: '#111827',
    fontSize: 8,
    fontWeight: '800',
  },

  footer: {
    height: 22,
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  collection: {
    color: '#111827',
    fontSize: 10,
    fontWeight: '900',
  },

  rarity: {
    color: '#B45309',
    fontSize: 13,
    fontWeight: '900',
  },

  backCard: {
    width: 330,
    aspectRatio: 63 / 88,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 5,
    borderColor: '#FACC15',
    backgroundColor: '#111827',
  },

  backImage: {
    width: '100%',
    height: '100%',
  },
});