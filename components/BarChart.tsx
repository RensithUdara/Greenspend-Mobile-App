import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { formatCurrency } from '@/types';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

interface BarChartData {
  label: string;
  income: number;
  expenses: number;
}

interface BarChartProps {
  data: BarChartData[];
  height?: number;
}

const { width } = Dimensions.get('window');

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 200,
}) => {
  const chartWidth = width - Spacing['2xl'] * 2;
  const barGroupWidth = (chartWidth - Spacing.lg * 2) / Math.max(data.length, 1);
  const barWidth = Math.min(barGroupWidth * 0.35, 24);
  const gapWidth = 4;

  // Find max value for scaling
  const maxValue = Math.max(
    ...data.map(d => Math.max(d.income, d.expenses)),
    100
  );

  const getBarHeight = (value: number) => {
    return (value / maxValue) * (height - 40);
  };

  if (data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.noDataText}>No data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.income }]} />
          <Text style={styles.legendText}>Monthly Income</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.expense }]} />
          <Text style={styles.legendText}>Expenses</Text>
        </View>
      </View>

      <View style={[styles.container, { height }]}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          <Text style={styles.axisLabel}>{formatCurrency(maxValue)}</Text>
          <Text style={styles.axisLabel}>{formatCurrency(maxValue / 2)}</Text>
          <Text style={styles.axisLabel}>$0</Text>
        </View>

        {/* Bars */}
        <View style={styles.barsContainer}>
          {/* Grid lines */}
          <View style={styles.gridLines}>
            <View style={styles.gridLine} />
            <View style={styles.gridLine} />
            <View style={styles.gridLine} />
          </View>

          {/* Bar groups */}
          <View style={styles.barGroups}>
            {data.map((item, index) => (
              <View key={index} style={[styles.barGroup, { width: barGroupWidth }]}>
                <View style={styles.bars}>
                  {/* Income bar */}
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          width: barWidth,
                          height: Math.max(getBarHeight(item.income), 4),
                          backgroundColor: Colors.income,
                        },
                      ]}
                    />
                  </View>
                  {/* Gap between bars */}
                  <View style={{ width: gapWidth }} />
                  {/* Expenses bar */}
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          width: barWidth,
                          height: Math.max(getBarHeight(item.expenses), 4),
                          backgroundColor: Colors.expense,
                        },
                      ]}
                    />
                  </View>
                </View>
                <Text style={styles.barLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.xl,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginRight: Spacing.xs,
  },
  legendText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  container: {
    flexDirection: 'row',
    width: '100%',
  },
  noDataText: {
    fontSize: Typography.sizes.base,
    color: Colors.textMuted,
    textAlign: 'center',
    flex: 1,
    textAlignVertical: 'center',
  },
  yAxis: {
    width: 50,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: Spacing.sm,
    paddingBottom: 24,
  },
  axisLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  barsContainer: {
    flex: 1,
    position: 'relative',
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 24,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: Colors.lightGrey,
  },
  barGroups: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 24,
  },
  barGroup: {
    alignItems: 'center',
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  barWrapper: {
    justifyContent: 'flex-end',
  },
  bar: {
    borderTopLeftRadius: BorderRadius.sm,
    borderTopRightRadius: BorderRadius.sm,
  },
  barLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
    position: 'absolute',
    bottom: 0,
  },
});
