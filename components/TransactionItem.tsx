import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction, formatDate } from '@/types';
import { useCurrency } from '@/hooks/useCurrency';
import { Colors, Typography, Spacing, BorderRadius, CategoryIcons, CategoryColors } from '@/constants/theme';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onPress,
}) => {
  const { formatCurrency } = useCurrency();
  const isIncome = transaction.type === 'income';
  const iconName = (CategoryIcons[transaction.category] || 'ellipsis-horizontal') as keyof typeof Ionicons.glyphMap;
  const iconColor = CategoryColors[transaction.category] || Colors.slateGrey;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={iconName} size={20} color={iconColor} />
      </View>

      <View style={styles.details}>
        <Text style={styles.note} numberOfLines={1}>
          {transaction.note || transaction.category}
        </Text>
        <Text style={styles.category}>{transaction.category}</Text>
      </View>

      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.amount,
            isIncome ? styles.incomeAmount : styles.expenseAmount,
          ]}
        >
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
        </Text>
        <Text style={styles.date}>{formatDate(transaction.date)}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrey,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  note: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  category: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    marginBottom: 2,
  },
  incomeAmount: {
    color: Colors.income,
  },
  expenseAmount: {
    color: Colors.textPrimary,
  },
  date: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
});
