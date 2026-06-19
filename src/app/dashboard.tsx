import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function Dashboard() {
  function sair() {
    router.push('/');
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient
        colors={['#16A34A', '#FACC15', '#0F3D91']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.logo}>
          <MaterialCommunityIcons name="soccer" size={34} color="#16A34A" />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.title}>Dashboard Seleção</Text>
          <Text style={styles.subtitle}>Bem-vindo de volta, Campeão!</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={sair}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.content}>
        <DashboardCard
          delay={100}
          title="Títulos"
          value="127"
          description="+12% este mês"
          icon={<MaterialCommunityIcons name="trophy-outline" size={34} color="#FFF" />}
          iconBackground={['#FACC15', '#F97316']}
          background="#FFFBEA"
        />

        <DashboardCard
          delay={250}
          title="Gols"
          value="892"
          description="+12% este mês"
          icon={<Feather name="target" size={34} color="#FFF" />}
          iconBackground={['#22C55E', '#059669']}
          background="#ECFDF5"
        />

        <DashboardCard
          delay={400}
          title="Torcedores"
          value="214M"
          description="+12% este mês"
          icon={<Ionicons name="people-outline" size={34} color="#FFF" />}
          iconBackground={['#60A5FA', '#2563EB']}
          background="#EFF6FF"
        />

        <DashboardCard
          delay={550}
          title="Avaliação"
          value="9.8"
          description="+12% este mês"
          icon={<Ionicons name="star-outline" size={34} color="#FFF" />}
          iconBackground={['#C084FC', '#9333EA']}
          background="#FAF5FF"
        />
      </View>
    </ScrollView>
  );
}

type CardProps = {
  delay: number;
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  iconBackground: string[];
  background: string;
};

function DashboardCard({
  delay,
  title,
  value,
  description,
  icon,
  iconBackground,
  background,
}: CardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(40);
  const scale = useSharedValue(0.96);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 600 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 600 }));
    scale.value = withDelay(delay, withTiming(1, { duration: 600 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: background },
        animatedStyle,
      ]}
    >
      <View style={styles.cardTop}>
        <LinearGradient
          colors={iconBackground}
          style={styles.iconBox}
        >
          {icon}
        </LinearGradient>

        <Feather name="activity" size={30} color="#9CA3AF" />
      </View>

      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{value}</Text>

      <View style={styles.growthBox}>
        <Feather name="trending-up" size={18} color="#16A34A" />
        <Text style={styles.growthText}>{description}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },

  header: {
    paddingTop: 55,
    paddingBottom: 42,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },

  logo: {
    width: 74,
    height: 74,
    borderRadius: 40,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },

  headerText: {
    flex: 1,
    marginLeft: 18,
  },

  title: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '900',
  },

  subtitle: {
    color: '#F9FAFB',
    fontSize: 17,
    marginTop: 4,
  },

  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 15,
  },

  logoutText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },

  content: {
    padding: 24,
    gap: 22,
  },

  card: {
    width: '100%',
    borderRadius: 24,
    padding: 26,
    minHeight: 190,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 7,
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  iconBox: {
    width: 66,
    height: 66,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardTitle: {
    marginTop: 28,
    color: '#374151',
    fontSize: 18,
    fontWeight: '700',
  },

  cardValue: {
    marginTop: 8,
    color: '#111827',
    fontSize: 42,
    fontWeight: '900',
  },

  growthBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
  },

  growthText: {
    color: '#16A34A',
    fontSize: 16,
    fontWeight: '600',
  },
});