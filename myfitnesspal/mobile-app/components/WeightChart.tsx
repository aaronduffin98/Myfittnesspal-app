import { useState } from "react";
import { View } from "react-native";
import Svg, { Circle, Line, Polyline } from "react-native-svg";
import { AppText } from "@/components/AppText";
import { colors } from "@/lib/constants";

interface WeightChartProps {
  /** Weights in kg, oldest first. */
  points: { loggedDate: string; weightKg: number }[];
  height?: number;
}

const PADDING = 8;

/** A simple line chart of weigh-ins, scaled to the lowest and highest values. */
export function WeightChart({ points, height = 140 }: WeightChartProps) {
  const [width, setWidth] = useState(0);

  if (points.length < 2) {
    return (
      <View className="items-center justify-center" style={{ height }}>
        <AppText className="text-gray-400 text-sm text-center">
          Log at least two weigh-ins to see your trend.
        </AppText>
      </View>
    );
  }

  const weights = points.map((p) => p.weightKg);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  // Keep a flat line in the middle rather than dividing by zero.
  const range = max - min || 1;

  const innerW = Math.max(width - PADDING * 2, 1);
  const innerH = height - PADDING * 2;
  const coords = points.map((p, i) => ({
    x: PADDING + (i / (points.length - 1)) * innerW,
    y: PADDING + (1 - (p.weightKg - min) / range) * innerH,
  }));
  const last = coords[coords.length - 1];

  return (
    <View>
      <View className="flex-row justify-between mb-1">
        <AppText className="text-gray-400 text-xs">{max.toFixed(1)} kg</AppText>
      </View>
      <View style={{ height }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 && (
          <Svg width={width} height={height}>
            <Line
              x1={PADDING}
              x2={width - PADDING}
              y1={height - PADDING}
              y2={height - PADDING}
              stroke={colors["track-gray"]}
              strokeWidth={1}
            />
            <Polyline
              points={coords.map((c) => `${c.x},${c.y}`).join(" ")}
              fill="none"
              stroke={colors.primary}
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <Circle cx={last.x} cy={last.y} r={4} fill={colors.primary} />
          </Svg>
        )}
      </View>
      <View className="flex-row justify-between mt-1">
        <AppText className="text-gray-400 text-xs">{min.toFixed(1)} kg</AppText>
        <AppText className="text-gray-400 text-xs">
          {points.length} weigh-ins
        </AppText>
      </View>
    </View>
  );
}
