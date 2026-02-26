import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import { theme } from '../../constants/theme';

export type DataPoint = {
  value: number;
  label: string;
};

export type LineSeries = {
  data: DataPoint[];
  color: string;
  label?: string;
};

type LineChartProps = {
  series: LineSeries[];
  height?: number;
  yDomain?: [number, number];
  showAreaFill?: boolean;
  showLegend?: boolean;
  gridLineCount?: number;
  formatYLabel?: (v: number) => string;
  /** If true, render minimal (no axes, no labels, no dots) for sparklines */
  minimal?: boolean;
};

const PADDING_LEFT = 44;
const PADDING_RIGHT = 16;
const PADDING_TOP = 12;
const PADDING_BOTTOM = 28;
const MINIMAL_PADDING = 4;

function LineChartInner({
  series,
  height = 160,
  yDomain,
  showAreaFill = true,
  showLegend = false,
  gridLineCount = 4,
  formatYLabel,
  minimal = false,
}: LineChartProps) {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 40 - 32; // section padding + card padding

  // Flatten all values to compute Y range
  const allValues = series.flatMap((s) => s.data.map((d) => d.value));
  if (allValues.length === 0) return null;

  const padLeft = minimal ? MINIMAL_PADDING : PADDING_LEFT;
  const padRight = minimal ? MINIMAL_PADDING : PADDING_RIGHT;
  const padTop = minimal ? MINIMAL_PADDING : PADDING_TOP;
  const padBottom = minimal ? MINIMAL_PADDING : PADDING_BOTTOM;

  const minVal = yDomain ? yDomain[0] : Math.floor(Math.min(...allValues) - 1);
  const maxVal = yDomain ? yDomain[1] : Math.ceil(Math.max(...allValues) + 1);
  const valRange = maxVal - minVal || 1;

  const drawWidth = chartWidth - padLeft - padRight;
  const drawHeight = height - padTop - padBottom;

  // Use the longest series for X-axis sizing
  const maxLen = Math.max(...series.map((s) => s.data.length));

  const getX = (index: number) =>
    padLeft + (maxLen > 1 ? (index / (maxLen - 1)) * drawWidth : drawWidth / 2);

  const getY = (value: number) =>
    padTop + drawHeight - ((value - minVal) / valRange) * drawHeight;

  // Grid lines
  const gridLines = minimal
    ? []
    : Array.from({ length: gridLineCount }, (_, i) => {
        const val = minVal + (valRange / (gridLineCount - 1)) * i;
        return { y: getY(val), label: formatYLabel ? formatYLabel(val) : val.toFixed(0) };
      });

  // X-axis labels from first series with data
  const primarySeries = series.find((s) => s.data.length > 0) || series[0];
  const xLabels = primarySeries?.data || [];

  return (
    <View>
      <Svg width={chartWidth} height={height}>
        {/* Grid lines */}
        {gridLines.map((line, i) => (
          <React.Fragment key={`grid-${i}`}>
            <Line
              x1={padLeft}
              y1={line.y}
              x2={chartWidth - padRight}
              y2={line.y}
              stroke={theme.colors.border}
              strokeWidth={1}
              strokeDasharray="4,4"
            />
            <SvgText
              x={padLeft - 8}
              y={line.y + 4}
              fontSize={11}
              fill={theme.colors.textTertiary}
              textAnchor="end"
            >
              {line.label}
            </SvgText>
          </React.Fragment>
        ))}

        {/* Render each series */}
        {series.map((s, si) => {
          if (s.data.length < 2) return null;

          const pathPoints = s.data.map((d, i) => `${getX(i)},${getY(d.value)}`);
          const linePath = `M ${pathPoints.join(' L ')}`;

          return (
            <React.Fragment key={`series-${si}`}>
              {/* Area fill (only for single series or first series when enabled) */}
              {showAreaFill && si === 0 && series.length === 1 && (
                <Path
                  d={`${linePath} L ${getX(s.data.length - 1)},${padTop + drawHeight} L ${getX(0)},${padTop + drawHeight} Z`}
                  fill={`${s.color}12`}
                />
              )}

              {/* Line */}
              <Path
                d={linePath}
                fill="none"
                stroke={s.color}
                strokeWidth={minimal ? 1.5 : 2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {!minimal &&
                s.data.map((d, i) => (
                  <Circle
                    key={`dot-${si}-${i}`}
                    cx={getX(i)}
                    cy={getY(d.value)}
                    r={3}
                    fill="#fff"
                    stroke={s.color}
                    strokeWidth={2}
                  />
                ))}
            </React.Fragment>
          );
        })}

        {/* X-axis labels */}
        {!minimal &&
          xLabels.map((d, i) => {
            const show =
              i === 0 ||
              i === xLabels.length - 1 ||
              xLabels.length <= 6 ||
              i % Math.ceil(xLabels.length / 5) === 0;
            if (!show) return null;
            return (
              <SvgText
                key={`xlabel-${i}`}
                x={getX(i)}
                y={height - 4}
                fontSize={10}
                fill={theme.colors.textTertiary}
                textAnchor="middle"
              >
                {d.label}
              </SvgText>
            );
          })}
      </Svg>

      {/* Legend */}
      {showLegend && series.length > 1 && (
        <View style={styles.legend}>
          {series.map((s, i) =>
            s.label ? (
              <View key={i} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: s.color }]} />
                <Text style={styles.legendText}>{s.label}</Text>
              </View>
            ) : null,
          )}
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

export default React.memo(LineChartInner);
