import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import { theme } from '../constants/theme';

type WeightDataPoint = {
  weight: number;
  label: string;
};

type Props = {
  data: WeightDataPoint[];
};

const CHART_HEIGHT = 160;
const CHART_PADDING_LEFT = 44;
const CHART_PADDING_RIGHT = 16;
const CHART_PADDING_TOP = 12;
const CHART_PADDING_BOTTOM = 28;

export default function WeightChart({ data }: Props) {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 40 - 32; // section padding + card padding

  if (data.length < 2) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Minimaal 2 check-ins nodig voor de grafiek
        </Text>
      </View>
    );
  }

  const weights = data.map((d) => d.weight);
  const minWeight = Math.floor(Math.min(...weights) - 1);
  const maxWeight = Math.ceil(Math.max(...weights) + 1);
  const weightRange = maxWeight - minWeight || 1;

  const drawWidth = chartWidth - CHART_PADDING_LEFT - CHART_PADDING_RIGHT;
  const drawHeight = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;

  const getX = (index: number) =>
    CHART_PADDING_LEFT + (index / (data.length - 1)) * drawWidth;

  const getY = (weight: number) =>
    CHART_PADDING_TOP + drawHeight - ((weight - minWeight) / weightRange) * drawHeight;

  // Build SVG path
  const pathPoints = data.map((d, i) => `${getX(i)},${getY(d.weight)}`);
  const linePath = `M ${pathPoints.join(' L ')}`;

  // Gradient fill area
  const areaPath = `${linePath} L ${getX(data.length - 1)},${CHART_PADDING_TOP + drawHeight} L ${getX(0)},${CHART_PADDING_TOP + drawHeight} Z`;

  // Y-axis grid lines (4 lines)
  const gridLines = Array.from({ length: 4 }, (_, i) => {
    const weight = minWeight + (weightRange / 3) * i;
    return { y: getY(weight), label: `${weight.toFixed(0)}` };
  });

  // Weight difference
  const firstWeight = data[0].weight;
  const lastWeight = data[data.length - 1].weight;
  const diff = lastWeight - firstWeight;
  const diffText = diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);
  const diffColor = diff <= 0 ? '#34C759' : '#FF9500';

  return (
    <View>
      {/* Header */}
      <View style={styles.chartHeader}>
        <View>
          <Text style={styles.currentWeight}>{lastWeight.toFixed(1)} kg</Text>
          <Text style={styles.weightSubtext}>Huidig gewicht</Text>
        </View>
        <View style={[styles.diffBadge, { backgroundColor: `${diffColor}18` }]}>
          <Text style={[styles.diffText, { color: diffColor }]}>
            {diffText} kg
          </Text>
        </View>
      </View>

      {/* Chart */}
      <Svg width={chartWidth} height={CHART_HEIGHT}>
        {/* Grid lines */}
        {gridLines.map((line, i) => (
          <React.Fragment key={i}>
            <Line
              x1={CHART_PADDING_LEFT}
              y1={line.y}
              x2={chartWidth - CHART_PADDING_RIGHT}
              y2={line.y}
              stroke={theme.colors.border}
              strokeWidth={1}
              strokeDasharray="4,4"
            />
            <SvgText
              x={CHART_PADDING_LEFT - 8}
              y={line.y + 4}
              fontSize={11}
              fill={theme.colors.textTertiary}
              textAnchor="end"
            >
              {line.label}
            </SvgText>
          </React.Fragment>
        ))}

        {/* Area fill */}
        <Path d={areaPath} fill={`${theme.colors.secondary}12`} />

        {/* Line */}
        <Path
          d={linePath}
          fill="none"
          stroke={theme.colors.secondary}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((d, i) => (
          <React.Fragment key={i}>
            <Circle
              cx={getX(i)}
              cy={getY(d.weight)}
              r={4}
              fill="#fff"
              stroke={theme.colors.secondary}
              strokeWidth={2.5}
            />
            {/* X-axis labels (show first, last, and every few) */}
            {(i === 0 || i === data.length - 1 || (data.length <= 6) || (i % Math.ceil(data.length / 5) === 0)) && (
              <SvgText
                x={getX(i)}
                y={CHART_HEIGHT - 4}
                fontSize={10}
                fill={theme.colors.textTertiary}
                textAnchor="middle"
              >
                {d.label}
              </SvgText>
            )}
          </React.Fragment>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  currentWeight: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text,
  },
  weightSubtext: {
    fontSize: 13,
    color: theme.colors.textTertiary,
    marginTop: 2,
  },
  diffBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  diffText: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textTertiary,
    textAlign: 'center',
  },
});
