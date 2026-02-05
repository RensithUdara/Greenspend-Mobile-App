import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { AppSettings, Budget, generateId, getCurrentMonth } from '@/types';
import { saveSettings, saveBudget, getAllCategories } from '@/services/storage';
import { Colors, Typography, Spacing, BorderRadius, Shadows, CategoryIcons, CategoryColors } from '@/constants/theme';

const CURRENCY_OPTIONS = [
  { symbol: '$', name: 'US Dollar', code: 'USD' },
  { symbol: '€', name: 'Euro', code: 'EUR' },
  { symbol: '£', name: 'British Pound', code: 'GBP' },
  { symbol: '¥', name: 'Japanese Yen', code: 'JPY' },
  { symbol: '₹', name: 'Indian Rupee', code: 'INR' },
  { symbol: 'CA$', name: 'Canadian Dollar', code: 'CAD' },
  { symbol: 'A$', name: 'Australian Dollar', code: 'AUD' },
  { symbol: 'CHF', name: 'Swiss Franc', code: 'CHF' },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedCurrency, setSelectedCurrency] = useState('$');
  const [budgetCategory, setBudgetCategory] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  React.useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const allCategories = await getAllCategories();
    setCategories(allCategories.filter(c => !['Income', 'Salary', 'Investment', 'Gift'].includes(c)));
  };

  const handleContinueFromStep1 = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep(2);
  };

  const handleSkipBudget = async () => {
    try {
      const settings: AppSettings = {
        currencySymbol: selectedCurrency,
        hasCompletedOnboarding: true,
        createdAt: new Date().toISOString(),
      };
      await saveSettings(settings);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const handleComplete = async () => {
    if (!budgetCategory) {
      Alert.alert('Selection Required', 'Please select a category for your first budget');
      return;
    }
    if (!budgetLimit || parseFloat(budgetLimit) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid budget limit');
      return;
    }

    try {
      // Save settings
      const settings: AppSettings = {
        currencySymbol: selectedCurrency,
        hasCompletedOnboarding: true,
        createdAt: new Date().toISOString(),
      };
      await saveSettings(settings);

      // Save first budget
      const budget: Budget = {
        id: generateId(),
        category: budgetCategory,
        limit: parseFloat(budgetLimit),
        month: getCurrentMonth(),
        createdAt: new Date().toISOString(),
      };
      await saveBudget(budget);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to complete setup');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <LinearGradient
            colors={[Colors.deepForestGreen, Colors.emeraldGreen]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerCard}
          >
            <View style={styles.logoContainer}>
              <Ionicons name="leaf" size={48} color={Colors.white} />
            </View>
            <Text style={styles.appTitle}>Welcome to Greenspend</Text>
            <Text style={styles.appSubtitle}>
              Professional expense tracking made simple
            </Text>
          </LinearGradient>

          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
            <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
            <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
          </View>

          {step === 1 ? (
            // Step 1: Currency Selection
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Choose Your Currency</Text>
              <Text style={styles.stepSubtitle}>
                Select the currency symbol you&apos;d like to use throughout the app
              </Text>

              <View style={styles.currencyGrid}>
                {CURRENCY_OPTIONS.map((currency) => (
                  <TouchableOpacity
                    key={currency.code}
                    style={[
                      styles.currencyItem,
                      selectedCurrency === currency.symbol && styles.currencyItemActive,
                    ]}
                    onPress={() => {
                      setSelectedCurrency(currency.symbol);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Text style={styles.currencySymbol}>{currency.symbol}</Text>
                    <Text style={styles.currencyName}>{currency.name}</Text>
                    <Text style={styles.currencyCode}>{currency.code}</Text>
                    {selectedCurrency === currency.symbol && (
                      <View style={styles.checkmarkCircle}>
                        <Ionicons name="checkmark" size={16} color={Colors.white} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleContinueFromStep1}
              >
                <Text style={styles.primaryButtonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color={Colors.white} />
              </TouchableOpacity>
            </View>
          ) : (
            // Step 2: First Budget
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Set Your First Budget</Text>
              <Text style={styles.stepSubtitle}>
                Choose a category and set a monthly spending limit (optional)
              </Text>

              {/* Category Selection */}
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryGrid}>
                {categories.slice(0, 6).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryCard,
                      budgetCategory === cat && styles.categoryCardActive,
                    ]}
                    onPress={() => {
                      setBudgetCategory(cat);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <View style={[styles.categoryIconContainer, { backgroundColor: (CategoryColors[cat] || Colors.slateGrey) + '20' }]}>
                      <Ionicons
                        name={(CategoryIcons[cat] || 'ellipsis-horizontal') as keyof typeof Ionicons.glyphMap}
                        size={24}
                        color={CategoryColors[cat] || Colors.slateGrey}
                      />
                    </View>
                    <Text style={styles.categoryLabel}>{cat}</Text>
                    {budgetCategory === cat && (
                      <View style={styles.checkmarkBadge}>
                        <Ionicons name="checkmark-circle" size={20} color={Colors.income} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Budget Limit Input */}
              <Text style={[styles.label, { marginTop: Spacing.xl }]}>Monthly Limit</Text>
              <View style={styles.limitInputContainer}>
                <Text style={styles.inputCurrencySymbol}>{selectedCurrency}</Text>
                <TextInput
                  style={styles.limitInput}
                  value={budgetLimit}
                  onChangeText={(text) => {
                    const cleaned = text.replace(/[^0-9.]/g, '');
                    setBudgetLimit(cleaned);
                  }}
                  keyboardType="decimal-pad"
                  placeholder="500"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>

              {/* Quick Amounts */}
              <View style={styles.quickAmounts}>
                {[200, 500, 1000, 2000].map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    style={styles.quickAmountButton}
                    onPress={() => {
                      setBudgetLimit(amount.toString());
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Text style={styles.quickAmountText}>{selectedCurrency}{amount}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Action Buttons */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleComplete}
              >
                <Text style={styles.primaryButtonText}>Get Started</Text>
                <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleSkipBudget}
              >
                <Text style={styles.secondaryButtonText}>Skip for now</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Features Preview */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Ionicons name="sparkles" size={20} color={Colors.warning} />
              <Text style={styles.featureText}>AI-powered categorization</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="analytics" size={20} color={Colors.emeraldGreen} />
              <Text style={styles.featureText}>Beautiful insights & charts</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark" size={20} color={Colors.income} />
              <Text style={styles.featureText}>100% private & secure</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing['4xl'],
  },
  headerCard: {
    borderRadius: BorderRadius['2xl'],
    padding: Spacing['2xl'],
    alignItems: 'center',
    marginBottom: Spacing.xl,
    ...Shadows.lg,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  appTitle: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  appSubtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.mintGreen,
    textAlign: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['2xl'],
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.lightGrey,
  },
  stepDotActive: {
    backgroundColor: Colors.emeraldGreen,
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.lightGrey,
    marginHorizontal: Spacing.xs,
  },
  stepLineActive: {
    backgroundColor: Colors.emeraldGreen,
  },
  stepContent: {
    marginBottom: Spacing.xl,
  },
  stepTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  stepSubtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    lineHeight: Typography.lineHeights.normal * Typography.sizes.base,
  },
  currencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  currencyItem: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.borderGrey,
    ...Shadows.sm,
    position: 'relative',
  },
  currencyItemActive: {
    borderColor: Colors.emeraldGreen,
    backgroundColor: Colors.mintGreen + '20',
  },
  currencySymbol: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  currencyName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  currencyCode: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  checkmarkCircle: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.emeraldGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  categoryCard: {
    width: '30%',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.borderGrey,
    position: 'relative',
    ...Shadows.sm,
  },
  categoryCardActive: {
    borderColor: Colors.emeraldGreen,
    backgroundColor: Colors.mintGreen + '20',
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  checkmarkBadge: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
  },
  limitInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  inputCurrencySymbol: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginRight: Spacing.xs,
  },
  limitInput: {
    flex: 1,
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    paddingVertical: Spacing.lg,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  quickAmountButton: {
    flex: 1,
    backgroundColor: Colors.lightGrey,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: Colors.emeraldGreen,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadows.md,
  },
  primaryButtonText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.white,
  },
  secondaryButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  secondaryButtonText: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
  },
  featuresContainer: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  featureText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
});
