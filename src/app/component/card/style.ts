import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    width: 340,
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  label: {
    color: '#8B8EA8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginTop: 10,
  },

  input: {
    height: 52,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    color: '#F9FAFB',
    fontSize: 15,
    marginBottom: 14,
  },

  button: {
    height: 56,
    backgroundColor: '#FF174D',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#FF174D',
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 2,
  },

  register: {
    color: '#8B8EA8',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 13,
  },

  registerRed: {
    color: '#FF174D',
    fontWeight: '900',
  },
});