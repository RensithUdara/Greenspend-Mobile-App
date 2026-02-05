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
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { CategoryBreakdown, getCurrentMonth, getMonthName } from '@/types';
import { getTransactions, getMonthlyStats } from '@/services/storage';
import { PieChart } from '@/components/PieChart';
import { BarChart } from '@/components/BarChart';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { useCurrency } from '@/hooks/useCurrency';
import { Colors, Typography, Spacing, BorderRadius, CategoryColors } from '@/constants/theme';

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { formatCurrency, refreshCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState<'breakdown' | 'trend'>('breakdown');
  const [categoryData, setCategoryData] = useState<CategoryBreakdown[]>([]);
  const [trendData, setTrendData] = useState<{ label: string; income: number; expenses: number }[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);

  const loadData = async () => {
    try {
      const currentMonth = getCurrentMonth();
      const transactions = await getTransactions();

      // Calculate category breakdown for current month
      const monthTransactions = transactions.filter(t =>
        t.date.startsWith(currentMonth) && t.type === 'expense'
      );

      const categoryTotals: Record<string, number> = {};
      monthTransactions.forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

      const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
      setTotalExpenses(total);

      const breakdown: CategoryBreakdown[] = Object.entries(categoryTotals)
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: total > 0 ? (amount / total) * 100 : 0,
          color: CategoryColors[category] || Colors.slateGrey,
        }))
        .sort((a, b) => b.amount - a.amount);

      setCategoryData(breakdown);

      // Calculate income for current month
      const monthIncome = transactions
        .filter(t => t.date.startsWith(currentMonth) && t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      setTotalIncome(monthIncome);

      // Calculate trend data for last 6 months
      const months: string[] = [];
      const date = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(date.getFullYear(), date.getMonth() - i, 1);
        months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
      }

      const trendDataArray = await Promise.all(
        months.map(async (month) => {
          const stats = await getMonthlyStats(month);
          const monthDate = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]) - 1);
          return {
            label: monthDate.toLocaleDateString('en-US', { month: 'short' }),
            income: stats.income,
            expenses: stats.expenses,
          };
        })
      );

      setTrendData(trendDataArray);
    } catch (error) {
      console.error('Error loading analytics:', error);
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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSubtitle}>{getMonthName(getCurrentMonth())}</Text>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'breakdown' && styles.tabActive]}
          onPress={() => setActiveTab('breakdown')}
        >
          <Text style={[styles.tabText, activeTab === 'breakdown' && styles.tabTextActive]}>
            Spending Breakdown
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'trend' && styles.tabActive]}
          onPress={() => setActiveTab('trend')}
        >
          <Text style={[styles.tabText, activeTab === 'trend' && styles.tabTextActive]}>
            Income vs. Expense Trend
          </Text>
        </TouchableOpacity>
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
        {activeTab === 'breakdown' ? (
          <>
            {/* Summary Cards */}
            <View style={styles.summaryRow}>
              <Card style={styles.summaryCard}>
                <Ionicons name="arrow-up-circle" size={24} color={Colors.income} />
                <Text style={styles.summaryLabel}>Income</Text>
                <Text style={[styles.summaryAmount, { color: Colors.income }]}>
                  {formatCurrency(totalIncome)}
                </Text>
              </Card>
              <Card style={styles.summaryCard}>
                <Ionicons name="arrow-down-circle" size={24} color={Colors.expense} />
                <Text style={styles.summaryLabel}>Expenses</Text>
                <Text style={[styles.summaryAmount, { color: Colors.expense }]}>
                  {formatCurrency(totalExpenses)}
                </Text>
              </Card>
            </View>

            {categoryData.length > 0 ? (
              <>
                {/* Pie Chart */}
                <Card style={styles.chartCard}>
                  <Text style={styles.chartTitle}>Spending Breakdown</Text>
                  <PieChart data={categoryData} />
                </Card>

                {/* Category List */}
                <Card style={styles.listCard}>
                  <Text style={styles.chartTitle}>Category Details</Text>
                  {categoryData.map((item, index) => (
                    <View key={item.category} style={styles.categoryRow}>
                      <View style={styles.categoryInfo}>
                        <View
                          style={[styles.categoryDot, { backgroundColor: item.color }]}
                        />
                        <Text style={styles.categoryName}>{item.category}</Text>
                      </View>
                      <View style={styles.categoryValues}>
                        <Text style={styles.categoryAmount}>
                          {formatCurrency(item.amount)}
                        </Text>
                        <Text style={styles.categoryPercentage}>
                          {item.percentage.toFixed(1)}%
                        </Text>
                      </View>
                    </View>
                  ))}
                </Card>
              </>
            ) : (
              <EmptyState
                illustrationType="analytics"
                title="No spending data yet"
                description="Start adding expenses to see detailed analytics and spending patterns"
              />
            )}
          </>
        ) : (
          <>
            {trendData.some(d => d.income > 0 || d.expenses > 0) ? (
              <>
                {/* Bar Chart */}
                <Card style={styles.chartCard}>
                  <Text style={styles.chartTitle}>Income vs. Expense Trend</Text>
                  <Text style={styles.chartSubtitle}>Last 6 months</Text>
                  <View style={styles.barChartContainer}>
                    <BarChart data={trendData} height={220} />
                  </View>
                </Card>

                {/* Monthly Comparison */}
                <Card style={styles.listCard}>
                  <Text style={styles.chartTitle}>Monthly Summary</Text>
                  {[...trendData].reverse().map((item, index) => {
                    const balance = item.income - item.expenses;
                    return (
                      <View key={item.label} style={styles.monthRow}>
                        <Text style={styles.monthLabel}>{item.label}</Text>
                        <View style={styles.monthValues}>
                          <View style={styles.monthValueItem}>
                            <Ionicons name="arrow-up" size={14} color={Colors.income} />
                            <Text style={styles.monthIncome}>
                              {formatCurrency(item.income)}
                            </Text>
                          </View>
                          <View style={styles.monthValueItem}>
                            <Ionicons name="arrow-down" size={14} color={Colors.expense} />
                            <Text style={styles.monthExpense}>
                              {formatCurrency(item.expenses)}
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.monthBalance,
                              { color: balance >= 0 ? Colors.income : Colors.expense },
                            ]}
                          >
                            {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </Card>
              </>
            ) : (
              <EmptyState
                illustrationType="analytics"
                title="No trend data yet"
                description="Track your income and expenses over time to see your financial trends"
              />
            )}
          </>
        )}
      </ScrollView>
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
  headerSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrey,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.xs,
  },
  tabActive: {
    backgroundColor: Colors.mintGreen,
  },
  tabText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.deepForestGreen,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing['4xl'],
  },
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  summaryLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  summaryAmount: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    marginTop: Spacing.xs,
  },
  chartCard: {
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    alignSelf: 'flex-start',
    marginBottom: Spacing.md,
  },
  chartSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    alignSelf: 'flex-start',
    marginBottom: Spacing.lg,
    marginTop: -Spacing.sm,
  },
  barChartContainer: {
    width: '100%',
    marginTop: Spacing.md,
  },
  listCard: {
    marginBottom: Spacing.lg,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrey,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  categoryName: {
    fontSize: Typography.sizes.base,
    color: Colors.textPrimary,
  },
  categoryValues: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  categoryPercentage: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrey,
  },
  monthLabel: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    width: 50,
  },
  monthValues: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: Spacing.lg,
  },
  monthValueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  monthIncome: {
    fontSize: Typography.sizes.sm,
    color: Colors.income,
  },
  monthExpense: {
    fontSize: Typography.sizes.sm,
    color: Colors.expense,
  },
  monthBalance: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    width: 80,
    textAlign: 'right',
  },
});
