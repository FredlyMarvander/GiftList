import { createContext, use, useCallback, useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { haptics } from '@/lib/haptics';

const COLORS = ['#695DDF', '#E89FBF', '#F5B942', '#48C79C', '#F27FA6', '#7CC4FF'];
const DURATION = 2300;

/** Spread out with fixed arithmetic instead of randomness so renders stay pure. */
const PIECES = Array.from({ length: 34 }, (_, index) => ({
  left: ((index * 61) % 100) / 100,
  drift: ((index * 37) % 80) - 40,
  delay: (index * 47) % 420,
  turns: 1 + ((index * 13) % 3),
  size: 7 + ((index * 5) % 6),
  round: index % 3 === 0,
  color: COLORS[index % COLORS.length],
}));

function Piece({ piece, width, height }: { piece: (typeof PIECES)[number]; width: number; height: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.set(withDelay(piece.delay, withTiming(1, { duration: DURATION - 500, easing: Easing.in(Easing.quad) })));
  }, [piece.delay, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const value = progress.get();
    return {
      opacity: value === 0 ? 0 : Math.min(1, (1 - value) * 4),
      transform: [
        { translateX: value * piece.drift },
        { translateY: -20 + value * height * 0.85 },
        { rotate: `${value * piece.turns * 360}deg` },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          left: piece.left * width,
          width: piece.size,
          height: piece.round ? piece.size : piece.size * 1.6,
          borderRadius: piece.round ? piece.size / 2 : 2,
          backgroundColor: piece.color,
        },
        animatedStyle,
      ]}
    />
  );
}

const CelebrationContext = createContext<(() => void) | null>(null);

/** Confetti for finishing a gift. Skipped when the phone asks for reduced motion. */
export function CelebrationProvider({ children }: { children: ReactNode }) {
  const { width, height } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const [run, setRun] = useState(0);
  const [visible, setVisible] = useState(false);

  const celebrate = useCallback(() => {
    haptics.success();
    if (reduceMotion) return;
    setRun((value) => value + 1);
    setVisible(true);
  }, [reduceMotion]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), DURATION + 100);
    return () => clearTimeout(timer);
  }, [visible, run]);

  return (
    <CelebrationContext value={celebrate}>
      {children}
      {visible ? (
        <View key={run} pointerEvents="none" aria-hidden style={StyleSheet.absoluteFill}>
          {PIECES.map((piece, index) => (
            <Piece key={index} piece={piece} width={width} height={height} />
          ))}
        </View>
      ) : null}
    </CelebrationContext>
  );
}

export function useCelebrate() {
  const celebrate = use(CelebrationContext);
  if (!celebrate) throw new Error('useCelebrate must be used inside CelebrationProvider');
  return celebrate;
}

const styles = StyleSheet.create({ piece: { position: 'absolute', top: 0 } });
