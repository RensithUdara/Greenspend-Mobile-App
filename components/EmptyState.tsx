import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle, Rect, Line, Text as SvgText } from 'react-native-svg';
import { Colors, Typography, Spacing } from '@/constants/theme';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  illustrationType?: 'transaction' | 'budget' | 'analytics' | 'generic';
  style?: ViewStyle;
}

const TransactionIllustration = () => (
  <Svg width="200" height="150" viewBox="0 0 200 150">
    {/* Receipt Paper */}
    <Rect
      x="50"
      y="20"
      width="100"
      height="120"
      rx="8"
      fill={Colors.white}
      stroke={Colors.emeraldGreen}
      strokeWidth="2"
      strokeDasharray="4 4"
    />

    {/* Receipt Lines */}
    <Line x1="65" y1="40" x2="135" y2="40" stroke={Colors.lightGrey} strokeWidth="3" strokeLinecap="round" />
    <Line x1="65" y1="55" x2="110" y2="55" stroke={Colors.lightGrey} strokeWidth="2" strokeLinecap="round" />
    <Line x1="65" y1="75" x2="125" y2="75" stroke={Colors.lightGrey} strokeWidth="2" strokeLinecap="round" />
    <Line x1="65" y1="90" x2="105" y2="90" stroke={Colors.lightGrey} strokeWidth="2" strokeLinecap="round" />

    {/* Dollar Sign */}
    <Circle cx="100" cy="110" r="15" fill={Colors.mintGreen} opacity="0.3" />
    <SvgText x="93" y="118" fontSize="20" fontWeight="bold" fill={Colors.emeraldGreen}>$</SvgText>

    {/* Plus Icon */}
    <Circle cx="170" cy="130" r="20" fill={Colors.emeraldGreen} />
    <Line x1="170" y1="120" x2="170" y2="140" stroke={Colors.white} strokeWidth="3" strokeLinecap="round" />
    <Line x1="160" y1="130" x2="180" y2="130" stroke={Colors.white} strokeWidth="3" strokeLinecap="round" />
  </Svg>
);

const BudgetIllustration = () => (
  <Svg width="200" height="150" viewBox="0 0 200 150">
    {/* Gauge Background */}
    <Circle cx="100" cy="100" r="50" fill="none" stroke={Colors.lightGrey} strokeWidth="12" opacity="0.3" />

    {/* Gauge Progress Arc */}
    <Path
      d="M 50 100 A 50 50 0 0 1 150 100"
      fill="none"
      stroke={Colors.mintGreen}
      strokeWidth="12"
      strokeLinecap="round"
    />

    {/* Center Circle */}
    <Circle cx="100" cy="100" r="35" fill={Colors.white} stroke={Colors.emeraldGreen} strokeWidth="2" />

    {/* Dollar Sign */}
    <SvgText x="90" y="110" fontSize="24" fontWeight="bold" fill={Colors.emeraldGreen}>0</SvgText>

    {/* Target Icon */}
    <Circle cx="170" cy="40" r="18" fill={Colors.warning} opacity="0.2" />
    <Circle cx="170" cy="40" r="12" fill="none" stroke={Colors.warning} strokeWidth="2" />
    <Circle cx="170" cy="40" r="6" fill="none" stroke={Colors.warning} strokeWidth="2" />
    <Circle cx="170" cy="40" r="2" fill={Colors.warning} />
  </Svg>
);

const AnalyticsIllustration = () => (
  <Svg width="200" height="150" viewBox="0 0 200 150">
    {/* Chart Base Line */}
    <Line x1="30" y1="120" x2="170" y2="120" stroke={Colors.lightGrey} strokeWidth="2" />

    {/* Bars */}
    <Rect x="40" y="90" width="20" height="30" rx="4" fill={Colors.mintGreen} opacity="0.5" />
    <Rect x="70" y="70" width="20" height="50" rx="4" fill={Colors.emeraldGreen} opacity="0.6" />
    <Rect x="100" y="50" width="20" height="70" rx="4" fill={Colors.emeraldGreen} />
    <Rect x="130" y="80" width="20" height="40" rx="4" fill={Colors.mintGreen} opacity="0.7" />

    {/* Trend Line */}
    <Path
      d="M 50 95 Q 80 75 110 55 T 140 85"
      fill="none"
      stroke={Colors.income}
      strokeWidth="3"
      strokeLinecap="round"
      strokeDasharray="5 3"
    />

    {/* Data Points */}
    <Circle cx="50" cy="95" r="4" fill={Colors.income} />
    <Circle cx="80" cy="75" r="4" fill={Colors.income} />
    <Circle cx="110" cy="55" r="4" fill={Colors.income} />
    <Circle cx="140" cy="85" r="4" fill={Colors.income} />

    {/* Chart Icon */}
    <Circle cx="170" cy="30" r="18" fill={Colors.emeraldGreen} opacity="0.2" />
    <Path
      d="M 163 35 L 170 28 L 177 35"
      fill="none"
      stroke={Colors.emeraldGreen}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line x1="170" y1="28" x2="170" y2="38" stroke={Colors.emeraldGreen} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const GenericIllustration = ({ icon }: { icon: keyof typeof Ionicons.glyphMap }) => (
  <View style={styles.genericIconContainer}>
    <View style={styles.genericIconCircle}>
      <Ionicons name={icon} size={64} color={Colors.emeraldGreen} opacity={0.3} />
    </View>
  </View>
);

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  illustrationType = 'generic',
  style,
}) => {
  const renderIllustration = () => {
    switch (illustrationType) {
      case 'transaction':
        return <TransactionIllustration />;
      case 'budget':
        return <BudgetIllustration />;
      case 'analytics':
        return <AnalyticsIllustration />;
      case 'generic':
      default:
        return icon ? <GenericIllustration icon={icon} /> : null;
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.illustrationContainer}>
        {renderIllustration()}
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['4xl'],
    paddingHorizontal: Spacing.xl,
  },
  illustrationContainer: {
    marginBottom: Spacing.xl,
  },
  genericIconContainer: {
    width: 200,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genericIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.mintGreen + '20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.emeraldGreen + '20',
    borderStyle: 'dashed',
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
    maxWidth: 280,
  },
});
