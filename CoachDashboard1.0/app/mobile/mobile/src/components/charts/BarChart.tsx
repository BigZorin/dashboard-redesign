import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import { theme } from '../../constants/theme';

export type BarValue = {
  value: number;
  color: string;
  label?: string;
};

export type BarGroup = {
  label: string;
  values: BarValue[];
};

type BarChartProps = {
  groups: BarGroup[];
  height?: number;
  maxValue?: number;
  showLegend?: boolean;
  barRadius?: number;
  gridLineCount?: number;
};

const PADDING_LEFT = 44;
const PADDING_RIGHT = 16;
const PADDING_TOP = 12;
const PADDING_BOTTOM = 28;

function BarChartInner({
  groups,
  height = 140,
  maxValue = 10,
  showLegend = false,
  barRadius = 4,
  gridLineCount = 3,
}: BarChartProps) {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 40 - 32;

  if (groups.length === 0) return null;

  const drawWidth = chartWidth - PADDING_LEFT - PADDING_RIGHT;
  const drawHeight = height - PADDING_TOP - PADDING_BOTTOM;

  const barsPerGroup = groups[0].values.length;
  const groupWidth = drawWidth / groups.length;
  const barGap = 3;
  const totalBarWidth = groupWidth - 12; // padding between groups
  const singleBarWidth = (totalBarWidth - barGap * (barsPerGroup - 1)) / barsPerGroup;

  const getBarHeight = (value: number) =>
    Math.max((value / maxValue) * drawHeight, 2);

  // Grid lines
  const gridLines = Array.from({ length: gridLineCount }, (_, i) => {
    const val = (maxValue / (gridLineCount - 1)) * i;
    return {
      y: PADDING_TOP + drawHeight - (val / maxValue) * drawHeight,
      label: val.toFixed(0),
    };
  });

  // Collect legend items from first group
  const legendItems = groups[0].values
    .filter((v) => v.label)
    .map((v) => ({ label: v.label!, color: v.color }));

  return (
    <View>
      <Svg width={chartWidth} height={height}>
        {/* Grid lines */}
        {gridLines.map((line, i) => (
          <React.Fragment key={`grid-${i}`}>
            <Line
              x1={PADDING_LEFT}
              y1={line.y}
              x2={chartWidth - PADDING_RIGHT}
              y2={line.y}
              stroke={theme.colors.border}
              strokeWidth={1}
              strokeDasharray="4,4"
            />
            <SvgText
              x={PADDING_LEFT - 8}
              y={line.y + 4}
              fontSize={11}
              fill={theme.colors.textTertiary}
              textAnchor="end"
            >
              {line.label}
            </SvgText>
          </React.Fragment>
        ))}

        {/* Bars */}
        {groups.map((group, gi) => {
          const groupX = PADDING_LEFT + gi * groupWidth + 6; // 6px group padding

          return (
            <React.Fragment key={`group-${gi}`}>
              {group.values.map((v, vi) => {
                const barH = getBarHeight(v.value);
                const barX = groupX + vi * (singleBarWidth + barGap);
                const barY = PADDING_TOP + drawHeight - barH;

                return (
                  <Rect
                    key={`bar-${gi}-${vi}`}
                    x={barX}
                    y={barY}
                    width={singleBarWidth}
                    height={barH}
                    rx={barRadius}
                    ry={barRadius}
                    fill={v.value > 0 ? v.color : `${v.color}30`}
                  />
                );
              })}

              {/* X-axis label */}
              <SvgText
                x={groupX + totalBarWidth / 2}
                y={height - 4}
                fontSize={10}
                fill={theme.colors.textTertiary}
                textAnchor="middle"
              >
                {group.label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>

      {/* Legend */}
      {showLegend && legendItems.length > 0 && (
        <View style={styles.legend}>
          {legendItems.map((item, i) => (
            <View key={i} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>{item.label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});

export default React.memo(BarChartInner);
