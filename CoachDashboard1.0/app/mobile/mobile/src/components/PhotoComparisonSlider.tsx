import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  PanResponder,
  Text,
} from 'react-native';
import { theme } from '../constants/theme';

type Props = {
  beforeUri: string;
  afterUri: string;
  beforeLabel?: string;
  afterLabel?: string;
};

const SCREEN_WIDTH = Dimensions.get('window').width - 40; // 20px padding each side
const IMAGE_HEIGHT = SCREEN_WIDTH * (4 / 3);

export default function PhotoComparisonSlider({
  beforeUri,
  afterUri,
  beforeLabel = 'Voor',
  afterLabel = 'Na',
}: Props) {
  const [sliderPosition, setSliderPosition] = useState(SCREEN_WIDTH / 2);
  const positionRef = useRef(SCREEN_WIDTH / 2);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newPos = Math.max(20, Math.min(SCREEN_WIDTH - 20, positionRef.current + gestureState.dx));
        setSliderPosition(newPos);
      },
      onPanResponderRelease: () => {
        positionRef.current = sliderPosition;
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      {/* After image (full width, behind) */}
      <Image source={{ uri: afterUri }} style={styles.fullImage} resizeMode="cover" />

      {/* Before image (clipped to slider position) */}
      <View style={[styles.beforeContainer, { width: sliderPosition }]}>
        <Image
          source={{ uri: beforeUri }}
          style={[styles.fullImage, { width: SCREEN_WIDTH }]}
          resizeMode="cover"
        />
      </View>

      {/* Slider handle */}
      <View
        style={[styles.sliderLine, { left: sliderPosition - 1 }]}
        {...panResponder.panHandlers}
      >
        <View style={styles.sliderHandle}>
          <View style={styles.sliderArrows}>
            <Text style={styles.arrowText}>◄ ►</Text>
          </View>
        </View>
      </View>

      {/* Labels */}
      <View style={styles.labels}>
        <View style={styles.label}>
          <Text style={styles.labelText}>{beforeLabel}</Text>
        </View>
        <View style={[styles.label, styles.labelRight]}>
          <Text style={styles.labelText}>{afterLabel}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  beforeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: IMAGE_HEIGHT,
    overflow: 'hidden',
  },
  sliderLine: {
    position: 'absolute',
    top: 0,
    width: 3,
    height: IMAGE_HEIGHT,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  sliderHandle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  sliderArrows: {
    flexDirection: 'row',
  },
  arrowText: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '700',
  },
  labels: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  labelRight: {},
  labelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
