import { colors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

interface StatusDonutChartProps {
  approved: number;
  pending: number;
  rejected: number;
}

export default function StatusDonutChart({ approved, pending, rejected }: StatusDonutChartProps) {
  const total = approved + pending + rejected;
  
  if (total === 0) {
    return null;
  }

  // Calculate exact percentages
  const approvedPercentage = (approved / total) * 100;
  const pendingPercentage = (pending / total) * 100;
  const rejectedPercentage = (rejected / total) * 100;

  // SVG circle properties
  const size = 180;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Gap between segments (in degrees)
  const gapDegrees = 8;
  const gapPercentage = (gapDegrees / 360) * 100;
  
  // Total available percentage after gaps (assuming 3 segments with gaps between them)
  const numberOfGaps = [approved, pending, rejected].filter(val => val > 0).length;
  const totalGapPercentage = gapPercentage * numberOfGaps;
  const availablePercentage = 100 - totalGapPercentage;

  // Adjust segment percentages to account for gaps
  const adjustedApprovedPercentage = approved > 0 ? (approvedPercentage / 100) * availablePercentage : 0;
  const adjustedPendingPercentage = pending > 0 ? (pendingPercentage / 100) * availablePercentage : 0;
  const adjustedRejectedPercentage = rejected > 0 ? (rejectedPercentage / 100) * availablePercentage : 0;

  // Calculate stroke dash array for each segment
  const approvedDash = (adjustedApprovedPercentage / 100) * circumference;
  const pendingDash = (adjustedPendingPercentage / 100) * circumference;
  const rejectedDash = (adjustedRejectedPercentage / 100) * circumference;

  // Calculate rotation angles with gaps
  let currentRotation = -90; // Start at top

  const approvedRotation = currentRotation;
  currentRotation += (adjustedApprovedPercentage / 100) * 360 + (approved > 0 ? gapDegrees : 0);

  const pendingRotation = currentRotation;
  currentRotation += (adjustedPendingPercentage / 100) * 360 + (pending > 0 ? gapDegrees : 0);

  const rejectedRotation = currentRotation;

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingVertical: 16,
    },
    chartContainer: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    centerText: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    totalNumber: {
      fontSize: 36,
      fontWeight: 'bold',
      color: colors.text,
    },
    totalLabel: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
      fontWeight: '500',
    },
    legend: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 20,
      flexWrap: 'wrap',
      gap: 20,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    legendColor: {
      width: 14,
      height: 14,
      borderRadius: 3,
    },
    legendText: {
      fontSize: 14,
      color: colors.white,
      fontWeight: '500',
    },
    legendPercentage: {
      fontSize: 13,
      color: colors.textSecondary,
      marginLeft: 2,
      fontWeight: '600',
    },
  });

  // Helper function to format percentage display
  const formatPercentage = (percentage: number) => {
    return Math.round(percentage);
  };

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Svg width={size} height={size}>
          <G rotation={0} origin={`${center}, ${center}`}>
            {/* Background circle - subtle gray */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#E8E8E8"
              strokeWidth={strokeWidth}
              fill="none"
            />
            
            {/* Approved segment */}
            {approved > 0 && (
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={colors.success}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${approvedDash} ${circumference}`}
                strokeDashoffset={0}
                rotation={approvedRotation}
                origin={`${center}, ${center}`}
                strokeLinecap="round"
              />
            )}
            
            {/* Pending segment */}
            {pending > 0 && (
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={colors.warning}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${pendingDash} ${circumference}`}
                strokeDashoffset={0}
                rotation={pendingRotation}
                origin={`${center}, ${center}`}
                strokeLinecap="round"
              />
            )}
            
            {/* Rejected segment */}
            {rejected > 0 && (
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={colors.error}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${rejectedDash} ${circumference}`}
                strokeDashoffset={0}
                rotation={rejectedRotation}
                origin={`${center}, ${center}`}
                strokeLinecap="round"
              />
            )}
          </G>
        </Svg>
        
        <View style={styles.centerText}>
          <Text style={styles.totalNumber}>{total}</Text>
          <Text style={styles.totalLabel}>Total Passes</Text>
        </View>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.success }]} />
          <Text style={styles.legendText}>Approved</Text>
          <Text style={styles.legendPercentage}>{approved}</Text>
        </View>
        
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.warning }]} />
          <Text style={styles.legendText}>Pending</Text>
          <Text style={styles.legendPercentage}>{pending}</Text>
        </View>
        
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: colors.error }]} />
          <Text style={styles.legendText}>Rejected</Text>
          <Text style={styles.legendPercentage}>{rejected}</Text>
        </View>
      </View>
    </View>
  );
}
