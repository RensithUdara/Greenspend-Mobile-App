import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';
import { CategoryBreakdown, formatCurrency } from '@/types';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

interface PieChartProps {
  data: CategoryBreakdown[];
  size?: number;
}

const { width } = Dimensions.get('window');

export const PieChart: React.FC<PieChartProps> = ({
  data,
  size = width * 0.55,
}) => {
  const radius = size / 2;
  const innerRadius = radius * 0.6;
  const centerX = radius;
  const centerY = radius;

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  // Calculate pie segments
  const createPieSegments = () => {
    if (data.length === 0) return null;

    let startAngle = -90; // Start from top
    const segments: React.ReactNode[] = [];

    data.forEach((item, index) => {
      const percentage = item.amount / total;
      const angle = percentage * 360;

      if (angle > 0) {
        const endAngle = startAngle + angle;

        // Convert angles to radians
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        // Calculate arc points for outer radius
        const x1 = centerX + radius * Math.cos(startRad);
        const y1 = centerY + radius * Math.sin(startRad);
        const x2 = centerX + radius * Math.cos(endRad);
        const y2 = centerY + radius * Math.sin(endRad);

        // Calculate arc points for inner radius
        const x3 = centerX + innerRadius * Math.cos(endRad);
        const y3 = centerY + innerRadius * Math.sin(endRad);
        const x4 = centerX + innerRadius * Math.cos(startRad);
        const y4 = centerY + innerRadius * Math.sin(startRad);

        const largeArcFlag = angle > 180 ? 1 : 0;

        // Create donut segment path
        const d = [
          `M ${x1} ${y1}`,
          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
          `L ${x3} ${y3}`,
          `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
          'Z',
        ].join(' ');

        segments.push(
          <Path key={index} d={d} fill={item.color} />
        );

        startAngle = endAngle;
      }
    });

    return segments;
  };

  if (data.length === 0 || total === 0) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <Circle
            cx={centerX}
            cy={centerY}
            r={radius - 2}
            fill="none"
            stroke={Colors.lightGrey}
            strokeWidth={innerRadius * 0.8}
          />
        </Svg>
        <View style={styles.centerContent}>
          <Text style={styles.noDataText}>No Data</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <G>{createPieSegments()}</G>
        </Svg>
        <View style={styles.centerContent}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{formatCurrency(total)}</Text>
        </View>
      </View>

      <View style={styles.legend}>
        {data.slice(0, 6).map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendText} numberOfLines={1}>
              {item.category} ({Math.round(item.percentage)}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  totalAmount: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  noDataText: {
    fontSize: Typography.sizes.base,
    color: Colors.textMuted,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.lightGrey + '60',
    borderRadius: BorderRadius.sm,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.xs,
  },
  legendText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    maxWidth: 120,
  },
});
