import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { clearAllData, getSettings, saveSettings } from '@/services/storage';
import { Card } from '@/components/Card';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  danger?: boolean;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  iconColor = Colors.emeraldGreen,
  title,
  subtitle,
  onPress,
  rightElement,
  danger,
}) => (
  <TouchableOpacity
    style={styles.settingItem}
    onPress={onPress}
    disabled={!onPress && !rightElement}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <View style={[styles.settingIcon, { backgroundColor: iconColor + '15' }]}>
      <Ionicons name={icon} size={20} color={iconColor} />
    </View>
    <View style={styles.settingContent}>
      <Text style={[styles.settingTitle, danger && { color: Colors.expense }]}>
        {title}
      </Text>
      {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
    </View>
    {rightElement || (
      onPress && <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
    )}
  </TouchableOpacity>
);

const CURRENCY_OPTIONS = [
  { symbol: '$', code: 'USD', name: 'US Dollar' },
  { symbol: '€', code: 'EUR', name: 'Euro' },
  { symbol: '£', code: 'GBP', name: 'British Pound' },
  { symbol: '¥', code: 'JPY', name: 'Japanese Yen' },
  { symbol: '₹', code: 'INR', name: 'Indian Rupee' },
  { symbol: 'C$', code: 'CAD', name: 'Canadian Dollar' },
  { symbol: 'A$', code: 'AUD', name: 'Australian Dollar' },
  { symbol: 'CHF', code: 'CHF', name: 'Swiss Franc' },
  { symbol: '¥', code: 'CNY', name: 'Chinese Yuan' },
  { symbol: 'kr', code: 'SEK', name: 'Swedish Krona' },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
    }, [])
  );

  const loadSettings = async () => {
    try {
      const settings = await getSettings();
      setCurrencySymbol(settings.currencySymbol);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleCurrencyChange = async (symbol: string) => {
    try {
      setCurrencySymbol(symbol);
      const settings = await getSettings();
      await saveSettings({ ...settings, currencySymbol: symbol });
      setShowCurrencyModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert('Error', 'Failed to update currency');
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your transactions, budgets, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Success', 'All data has been cleared. Please restart the app.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const toggleHaptic = (value: boolean) => {
    setHapticEnabled(value);
    if (value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color={Colors.white} />
            </View>
          </View>
          <Text style={styles.profileName}>Greenspend User</Text>
          <Text style={styles.profileEmail}>Budget tracking made simple</Text>
        </Card>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <Card style={styles.settingsCard}>
            <SettingItem
              icon="information-circle"
              title="About Greenspend"
              subtitle="Version 1.0.0"
            />
            <SettingItem
              icon="sparkles"
              iconColor="#F59E0B"
              title="Powered by Newell AI"
              subtitle="Smart category suggestions"
            />
          </Card>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <Card style={styles.settingsCard}>
            <SettingItem
              icon="cash"
              iconColor={Colors.emeraldGreen}
              title="Currency"
              subtitle={`Currently using ${currencySymbol}`}
              onPress={() => setShowCurrencyModal(true)}
            />
            <SettingItem
              icon="hand-left"
              title="Haptic Feedback"
              subtitle="Vibration on actions"
              rightElement={
                <Switch
                  value={hapticEnabled}
                  onValueChange={toggleHaptic}
                  trackColor={{ false: Colors.lightGrey, true: Colors.mintGreen }}
                  thumbColor={hapticEnabled ? Colors.emeraldGreen : Colors.slateGrey}
                />
              }
            />
            <SettingItem
              icon="moon"
              title="Dark Mode"
              subtitle="Coming soon"
              rightElement={
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>Soon</Text>
                </View>
              }
            />
          </Card>
        </View>

        {/* Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          <Card style={styles.settingsCard}>
            <SettingItem
              icon="shield-checkmark"
              iconColor={Colors.income}
              title="Privacy"
              subtitle="All data stored locally on device"
            />
            <SettingItem
              icon="cloud-offline"
              iconColor={Colors.slateGrey}
              title="Offline Mode"
              subtitle="Works without internet"
            />
            <SettingItem
              icon="trash"
              iconColor={Colors.expense}
              title="Clear All Data"
              subtitle="Delete all transactions and budgets"
              onPress={handleClearData}
              danger
            />
          </Card>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: Colors.emeraldGreen + '15' }]}>
                <Ionicons name="analytics" size={24} color={Colors.emeraldGreen} />
              </View>
              <Text style={styles.featureTitle}>Analytics</Text>
              <Text style={styles.featureDesc}>Track spending patterns</Text>
            </View>
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: Colors.warning + '15' }]}>
                <Ionicons name="notifications" size={24} color={Colors.warning} />
              </View>
              <Text style={styles.featureTitle}>Alerts</Text>
              <Text style={styles.featureDesc}>Budget notifications</Text>
            </View>
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: '#8B5CF6' + '15' }]}>
                <Ionicons name="sparkles" size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.featureTitle}>AI Powered</Text>
              <Text style={styles.featureDesc}>Smart categorization</Text>
            </View>
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: Colors.expense + '15' }]}>
                <Ionicons name="lock-closed" size={24} color={Colors.expense} />
              </View>
              <Text style={styles.featureTitle}>Private</Text>
              <Text style={styles.featureDesc}>Local storage only</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with 💚 for better finances</Text>
          <Text style={styles.versionText}>Greenspend v1.0.0</Text>
        </View>
      </ScrollView>

      {/* Currency Selection Modal */}
      <Modal
        visible={showCurrencyModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Currency</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {CURRENCY_OPTIONS.map((currency) => (
              <TouchableOpacity
                key={currency.code}
                style={[
                  styles.currencyOption,
                  currencySymbol === currency.symbol && styles.currencyOptionActive,
                ]}
                onPress={() => handleCurrencyChange(currency.symbol)}
              >
                <View style={styles.currencyInfo}>
                  <Text style={styles.currencySymbol}>{currency.symbol}</Text>
                  <View>
                    <Text style={styles.currencyName}>{currency.name}</Text>
                    <Text style={styles.currencyCode}>{currency.code}</Text>
                  </View>
                </View>
                {currencySymbol === currency.symbol && (
                  <Ionicons name="checkmark-circle" size={24} color={Colors.emeraldGreen} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrey,
  },
  headerTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing['4xl'],
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
    marginBottom: Spacing.lg,
  },
  avatarContainer: {
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.emeraldGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  profileEmail: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrey,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
  },
  settingSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  comingSoonBadge: {
    backgroundColor: Colors.lightGrey,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  comingSoonText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    color: Colors.textMuted,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  featureCard: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  featureTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingTop: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGrey,
  },
  footerText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  versionText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrey,
  },
  modalTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  cancelText: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
  },
  modalContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  currencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: Colors.borderGrey,
    ...Shadows.sm,
  },
  currencyOptionActive: {
    borderColor: Colors.emeraldGreen,
    backgroundColor: Colors.mintGreen + '20',
  },
  currencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  currencySymbol: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.emeraldGreen,
    width: 40,
    textAlign: 'center',
  },
  currencyName: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
  },
  currencyCode: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
