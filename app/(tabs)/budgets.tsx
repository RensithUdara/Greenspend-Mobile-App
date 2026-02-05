import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Budget, generateId, getCurrentMonth, getMonthName } from '@/types';
import { getBudgetsForMonth, getTransactionsForMonth, saveBudget, deleteBudget, getAllCategories } from '@/services/storage';
import { BudgetGauge } from '@/components/BudgetGauge';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { useCurrency } from '@/hooks/useCurrency';
import { Colors, Typography, Spacing, BorderRadius, Shadows, CategoryIcons, CategoryColors } from '@/constants/theme';

export default function BudgetsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currencySymbol, refreshCurrency } = useCurrency();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [spending, setSpending] = useState<Record<string, number>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const currentMonth = getCurrentMonth();

  const loadData = async () => {
    try {
      const [monthBudgets, monthTransactions, allCategories] = await Promise.all([
        getBudgetsForMonth(currentMonth),
        getTransactionsForMonth(currentMonth),
        getAllCategories(),
      ]);

      setBudgets(monthBudgets);
      setCategories(allCategories.filter(c => !['Income', 'Salary', 'Investment', 'Gift'].includes(c)));

      // Calculate spending by category
      const categorySpending: Record<string, number> = {};
      monthTransactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
          categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
        });
      setSpending(categorySpending);
    } catch (error) {
      console.error('Error loading budgets:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
      refreshCurrency();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAddBudget = async () => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a category');
      return;
    }
    if (!budgetLimit || parseFloat(budgetLimit) <= 0) {
      Alert.alert('Error', 'Please enter a valid budget limit');
      return;
    }

    try {
      const budget: Budget = {
        id: generateId(),
        category: selectedCategory,
        limit: parseFloat(budgetLimit),
        month: currentMonth,
        createdAt: new Date().toISOString(),
      };

      await saveBudget(budget);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowAddModal(false);
      setSelectedCategory('');
      setBudgetLimit('');
      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to save budget');
    }
  };

  const handleDeleteBudget = (budget: Budget) => {
    Alert.alert(
      'Delete Budget',
      `Are you sure you want to delete the ${budget.category} budget?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBudget(budget.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete budget');
            }
          },
        },
      ]
    );
  };

  // Get categories that don't have budgets yet
  const availableCategories = categories.filter(
    cat => !budgets.some(b => b.category === cat)
  );

  // Sort budgets by percentage (highest first)
  const sortedBudgets = [...budgets].sort((a, b) => {
    const aPercentage = spending[a.category] ? (spending[a.category] / a.limit) * 100 : 0;
    const bPercentage = spending[b.category] ? (spending[b.category] / b.limit) * 100 : 0;
    return bPercentage - aPercentage;
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Budgets</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.emeraldGreen}
          />
        }
      >
        {/* Month Header */}
        <Text style={styles.monthTitle}>Monthly Budgets</Text>
        <Text style={styles.monthSubtitle}>{getMonthName(currentMonth)}</Text>

        {/* Budget List */}
        {sortedBudgets.length > 0 ? (
          sortedBudgets.map(budget => (
            <TouchableOpacity
              key={budget.id}
              onLongPress={() => handleDeleteBudget(budget)}
              activeOpacity={0.9}
            >
              <BudgetGauge
                category={budget.category}
                spent={spending[budget.category] || 0}
                limit={budget.limit}
              />
            </TouchableOpacity>
          ))
        ) : (
          <EmptyState
            illustrationType="budget"
            title="Take control of your spending"
            description="Set monthly budgets for different categories to stay on track with your financial goals"
          />
        )}

        {/* Add Budget Button */}
        <Button
          title="Set New Budget"
          onPress={() => setShowAddModal(true)}
          style={styles.addButton}
        />

        {/* Tip */}
        <View style={styles.tipCard}>
          <Ionicons name="bulb" size={20} color={Colors.warning} />
          <Text style={styles.tipText}>
            Long press on a budget to delete it
          </Text>
        </View>
      </ScrollView>

      {/* Add Budget Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setShowAddModal(false);
                setSelectedCategory('');
                setBudgetLimit('');
              }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Set Budget</Text>
            <TouchableOpacity onPress={handleAddBudget}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Category Selection */}
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryGrid}>
              {availableCategories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryItem,
                    selectedCategory === cat && styles.categoryItemActive,
                  ]}
                  onPress={() => {
                    setSelectedCategory(cat);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: (CategoryColors[cat] || Colors.slateGrey) + '15' }]}>
                    <Ionicons
                      name={(CategoryIcons[cat] || 'ellipsis-horizontal') as keyof typeof Ionicons.glyphMap}
                      size={20}
                      color={CategoryColors[cat] || Colors.slateGrey}
                    />
                  </View>
                  <Text style={styles.categoryItemText}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {availableCategories.length === 0 && (
              <View style={styles.allSetContainer}>
                <Ionicons name="checkmark-circle" size={48} color={Colors.income} />
                <Text style={styles.allSetText}>All budgets are set!</Text>
              </View>
            )}

            {/* Budget Limit Input */}
            <Text style={[styles.label, { marginTop: Spacing.xl }]}>Monthly Limit</Text>
            <View style={styles.limitInputContainer}>
              <Text style={styles.currencySymbol}>{currencySymbol}</Text>
              <TextInput
                style={styles.limitInput}
                value={budgetLimit}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9.]/g, '');
                  setBudgetLimit(cleaned);
                }}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            {/* Quick Amount Buttons */}
            <View style={styles.quickAmounts}>
              {[100, 200, 500, 1000].map(amount => (
                <TouchableOpacity
                  key={amount}
                  style={styles.quickAmountButton}
                  onPress={() => {
                    setBudgetLimit(amount.toString());
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={styles.quickAmountText}>{currencySymbol}{amount}</Text>
                </TouchableOpacity>
              ))}
            </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrey,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing['4xl'],
  },
  monthTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  monthSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  addButton: {
    marginTop: Spacing.lg,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning + '15',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  tipText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    flex: 1,
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
  saveText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.emeraldGreen,
  },
  modalContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  categoryItemActive: {
    borderColor: Colors.emeraldGreen,
    backgroundColor: Colors.mintGreen + '30',
  },
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.xs,
  },
  categoryItemText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textPrimary,
  },
  allSetContainer: {
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
  },
  allSetText: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  limitInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
    paddingHorizontal: Spacing.lg,
    ...Shadows.sm,
  },
  currencySymbol: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.semibold,
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
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    gap: Spacing.sm,
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
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
  },
});
