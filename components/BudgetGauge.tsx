import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAlertLevel, AlertLevel } from '@/types';
import { useCurrency } from '@/hooks/useCurrency';
import { Colors, Typography, Spacing, BorderRadius, CategoryIcons, CategoryColors, Shadows } from '@/constants/theme';

interface BudgetGaugeProps {
  category: string;
  spent: number;
  limit: number;
  onPress?: () => void;
}

const getGaugeColor = (percentage: number): string => {
  if (percentage >= 100) return Colors.gaugeRed;
  if (percentage >= 90) return Colors.gaugeOrange;
  if (percentage >= 80) return Colors.gaugeYellow;
  return Colors.gaugeGreen;
};

const getAlertMessage = (level: AlertLevel, percentage: number): string | null => {
  switch (level) {
    case 'exceeded':
      return `Over budget by ${Math.round(percentage - 100)}%!`;
    case 'danger':
      return `Near Limit: ${Math.round(percentage)}% used. Be careful!`;
    case 'warning':
      return `Approaching Limit: ${Math.round(percentage)}% used`;
    default:
      return null;
  }
};

const getAlertIcon = (level: AlertLevel): keyof typeof Ionicons.glyphMap => {
  switch (level) {
    case 'exceeded':
      return 'alert-circle';
    case 'danger':
      return 'alert-circle';
    case 'warning':
      return 'warning';
    default:
      return 'checkmark-circle';
  }
};

const getAlertIconColor = (level: AlertLevel): string => {
  switch (level) {
    case 'exceeded':
      return Colors.gaugeRed;
    case 'danger':
      return Colors.gaugeOrange;
    case 'warning':
      return Colors.gaugeYellow;
    default:
      return Colors.gaugeGreen;
  }
};

export const BudgetGauge: React.FC<BudgetGaugeProps> = ({
  category,
  spent,
  limit,
}) => {
  const { formatCurrency } = useCurrency();
  const percentage = limit > 0 ? (spent / limit) * 100 : 0;
  const gaugeColor = getGaugeColor(percentage);
  const alertLevel = getAlertLevel(percentage);
  const alertMessage = getAlertMessage(alertLevel, percentage);
  const iconName = (CategoryIcons[category] || 'ellipsis-horizontal') as keyof typeof Ionicons.glyphMap;
  const iconColor = CategoryColors[category] || Colors.slateGrey;

  return (
    <View style={[
      styles.container,
      alertLevel !== 'safe' && styles.alertContainer,
      alertLevel === 'exceeded' && styles.exceededContainer,
    ]}>
      <View style={styles.header}>
        <View style={styles.categoryInfo}>
          <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
            <Ionicons name={iconName} size={18} color={iconColor} />
          </View>
          <Text style={styles.categoryName}>{category}</Text>
        </View>
        <View style={styles.statusIcon}>
          <Ionicons
            name={getAlertIcon(alertLevel)}
            size={22}
            color={getAlertIconColor(alertLevel)}
          />
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View
            style={[
              styles.progressBar,
              {
                width: `${Math.min(percentage, 100)}%`,
                backgroundColor: gaugeColor,
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.amountText}>
          <Text style={styles.spentAmount}>{formatCurrency(spent)}</Text>
          <Text style={styles.limitAmount}> / {formatCurrency(limit)}</Text>
        </Text>
      </View>

      {alertMessage && (
        <View style={[styles.alertBadge, { backgroundColor: `${getAlertIconColor(alertLevel)}15` }]}>
          <Ionicons
            name={alertLevel === 'warning' ? 'warning' : 'alert-circle'}
            size={14}
            color={getAlertIconColor(alertLevel)}
          />
          <Text style={[styles.alertText, { color: getAlertIconColor(alertLevel) }]}>
            {alertMessage}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.cardBackground,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Shadows.md,
  },
  alertContainer: {
    borderWidth: 1,
    borderColor: Colors.gaugeYellow + '40',
  },
  exceededContainer: {
    borderColor: Colors.gaugeRed + '40',
    backgroundColor: Colors.gaugeRed + '05',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  categoryName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  statusIcon: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    marginBottom: Spacing.sm,
  },
  progressBackground: {
    height: 8,
    backgroundColor: Colors.lightGrey,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountText: {
    fontSize: Typography.sizes.base,
  },
  spentAmount: {
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  limitAmount: {
    color: Colors.textMuted,
  },
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  alertText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
});
