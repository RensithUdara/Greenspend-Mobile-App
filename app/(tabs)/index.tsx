import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/Card';
import { TransactionItem } from '@/components/TransactionItem';
import { EmptyState } from '@/components/EmptyState';
import { Transaction, getCurrentMonth } from '@/types';
import { getTransactions, getMonthlyStats } from '@/services/storage';
import { useCurrency } from '@/hooks/useCurrency';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { formatCurrency, refreshCurrency } = useCurrency();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyStats, setMonthlyStats] = useState({
    income: 0,
    expenses: 0,
    balance: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const currentMonth = getCurrentMonth();
      const [allTransactions, stats] = await Promise.all([
        getTransactions(),
        getMonthlyStats(currentMonth),
      ]);
      setTransactions(allTransactions);
      setMonthlyStats({
        income: stats.income,
        expenses: stats.expenses,
        balance: stats.balance,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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

  const recentTransactions = transactions.slice(0, 5);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={styles.appName}>Greenspend</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Ionicons name="person-circle" size={40} color={Colors.emeraldGreen} />
          </TouchableOpacity>
        </View>

        {/* Financial Overview Card */}
        <LinearGradient
          colors={[Colors.deepForestGreen, Colors.emeraldGreen]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.overviewCard}
        >
          <Text style={styles.overviewTitle}>Financial Overview</Text>

          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Total Balance:</Text>
            <Text style={styles.balanceAmount}>
              {formatCurrency(monthlyStats.balance)}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Monthly Income:</Text>
              <Text style={[styles.statAmount, styles.incomeText]}>
                +{formatCurrency(monthlyStats.income)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Monthly Expenses:</Text>
              <Text style={[styles.statAmount, styles.expenseText]}>
                -{formatCurrency(monthlyStats.expenses)}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Entry */}
        <Card style={styles.quickEntryCard}>
          <Text style={styles.sectionTitle}>Quick Entry</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/add-transaction')}
            activeOpacity={0.8}
          >
            <View style={styles.addButtonInner}>
              <Ionicons name="add" size={32} color={Colors.white} />
            </View>
            <Text style={styles.addButtonText}>Add Transaction</Text>
          </TouchableOpacity>
        </Card>

        {/* Recent Activity */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <Card style={styles.transactionsCard}>
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction, index) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onPress={() => router.push({
                    pathname: '/add-transaction',
                    params: { id: transaction.id },
                  })}
                />
              ))
            ) : (
              <EmptyState
                illustrationType="transaction"
                title="Your financial journey starts here"
                description="Add your first transaction using the button above or scan a receipt with AI"
              />
            )}
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  greeting: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
  },
  appName: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.deepForestGreen,
  },
  profileButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overviewCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadows.lg,
  },
  overviewTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.white,
    marginBottom: Spacing.lg,
  },
  balanceContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  balanceLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.mintGreen,
    marginBottom: Spacing.xs,
  },
  balanceAmount: {
    fontSize: Typography.sizes['4xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.white,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.mintGreen,
    marginBottom: 4,
  },
  statAmount: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
  },
  incomeText: {
    color: '#7DD3A0',
  },
  expenseText: {
    color: '#FCA5A5',
  },
  quickEntryCard: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  addButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  addButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.emeraldGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    ...Shadows.md,
  },
  addButtonText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
  },
  recentSection: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  seeAllText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.emeraldGreen,
  },
  transactionsCard: {
    paddingVertical: Spacing.sm,
  },
});
