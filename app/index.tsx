import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getSettings } from '@/services/storage';
import { Colors, Typography } from '@/constants/theme';

export default function Index() {
  const [isReady, setIsReady] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const settings = await getSettings();
      setHasCompletedOnboarding(settings.hasCompletedOnboarding);
    } catch (error) {
      console.error('Error checking onboarding:', error);
      // Default to not completed on error
      setHasCompletedOnboarding(false);
    } finally {
      setIsReady(true);
    }
  };

  // Show loading state while checking
  if (!isReady) {
    return (
      <View style={styles.container}>
        <Ionicons name="leaf" size={64} color={Colors.emeraldGreen} />
        <Text style={styles.appName}>Greenspend</Text>
        <ActivityIndicator
          size="large"
          color={Colors.emeraldGreen}
          style={styles.loader}
        />
      </View>
    );
  }

  // Redirect based on onboarding status
  if (hasCompletedOnboarding) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/onboarding" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.deepForestGreen,
    marginTop: 16,
  },
  loader: {
    marginTop: 24,
  },
});
