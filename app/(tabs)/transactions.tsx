import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Transaction, formatDate, getCurrentMonth, getMonthName } from '@/types';
import { getTransactions } from '@/services/storage';
import { TransactionItem } from '@/components/TransactionItem';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const allTransactions = await getTransactions();
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Get unique months from transactions
  const months = [...new Set(
    transactions.map(t => t.date.substring(0, 7))
  )].sort().reverse();

  // Filter transactions by selected month and category
  const filteredTransactions = transactions.filter(t => {
    const matchesMonth = t.date.startsWith(selectedMonth);
    const matchesCategory = !filterCategory || t.category === filterCategory;
    return matchesMonth && matchesCategory;
  });

  // Get unique categories from filtered transactions
  const categories = [...new Set(
    transactions
      .filter(t => t.date.startsWith(selectedMonth))
      .map(t => t.category)
  )];

  // Group transactions by date
  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const dateKey = transaction.date.split('T')[0];
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

  const sections = Object.entries(groupedTransactions)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({
      date,
      data: items,
    }));

  const renderDateSection = ({ item }: { item: { date: string; data: Transaction[] } }) => (
    <View style={styles.dateSection}>
      <Text style={styles.dateHeader}>{formatDate(item.date)}</Text>
      {item.data.map(transaction => (
        <TransactionItem
          key={transaction.id}
          transaction={transaction}
          onPress={() => router.push({
            pathname: '/add-transaction',
            params: { id: transaction.id },
          })}
        />
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transactions</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-transaction')}
        >
          <Ionicons name="add" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Month Selector */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={months.length > 0 ? months : [getCurrentMonth()]}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.monthsList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.monthButton,
                selectedMonth === item && styles.monthButtonActive,
              ]}
              onPress={() => setSelectedMonth(item)}
            >
              <Text
                style={[
                  styles.monthButtonText,
                  selectedMonth === item && styles.monthButtonTextActive,
                ]}
              >
                {getMonthName(item)}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Category Filter */}
        {categories.length > 0 && (
          <FlatList
            horizontal
            data={['All', ...categories]}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
            renderItem={({ item }) => {
              const isActive = item === 'All' ? !filterCategory : filterCategory === item;
              return (
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    isActive && styles.categoryButtonActive,
                  ]}
                  onPress={() => setFilterCategory(item === 'All' ? null : item)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      isActive && styles.categoryButtonTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>

      {/* Transactions List */}
      <FlatList
        data={sections}
        keyExtractor={(item) => item.date}
        renderItem={renderDateSection}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.emeraldGreen}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No transactions</Text>
            <Text style={styles.emptySubtext}>
              {filterCategory
                ? `No ${filterCategory} transactions this month`
                : 'No transactions for this period'}
            </Text>
          </View>
        }
      />
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.emeraldGreen,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  filtersContainer: {
    backgroundColor: Colors.white,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrey,
  },
  monthsList: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  monthButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.lightGrey,
    marginRight: Spacing.sm,
  },
  monthButtonActive: {
    backgroundColor: Colors.emeraldGreen,
  },
  monthButtonText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
  },
  monthButtonTextActive: {
    color: Colors.white,
  },
  categoriesList: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
  },
  categoryButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderGrey,
  },
  categoryButtonActive: {
    backgroundColor: Colors.mintGreen,
    borderColor: Colors.emeraldGreen,
  },
  categoryButtonText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  categoryButtonTextActive: {
    color: Colors.deepForestGreen,
    fontWeight: Typography.weights.medium,
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  dateSection: {
    marginBottom: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.md,
  },
  dateHeader: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
  },
  emptyText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
