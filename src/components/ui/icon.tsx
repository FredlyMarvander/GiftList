import Svg, { Circle, Ellipse, Line, Path, Polygon, Polyline, Rect } from 'react-native-svg';

import { iconNodes, type IconName, type IconNode } from '@/components/ui/icon-data';
import { type ColorToken } from '@/constants/theme';
import { useTheme } from '@/providers/theme-provider';

type IconProps = {
  name: IconName;
  size?: number;
  color?: ColorToken;
  strokeWidth?: number;
};

/** Decorative line icon; give the surrounding control an accessibility label instead. */
export function Icon({ name, size = 22, color = 'text', strokeWidth = 2 }: IconProps) {
  const { colors } = useTheme();
  const nodes: readonly IconNode[] = iconNodes[name];
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={colors[color]}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden>
      {nodes.map((node, index) => {
        switch (node[0]) {
          case 'path':
            return <Path key={index} {...node[1]} />;
          case 'circle':
            return <Circle key={index} {...node[1]} />;
          case 'rect':
            return <Rect key={index} {...node[1]} />;
          case 'line':
            return <Line key={index} {...node[1]} />;
          case 'polyline':
            return <Polyline key={index} {...node[1]} />;
          case 'polygon':
            return <Polygon key={index} {...node[1]} />;
          case 'ellipse':
            return <Ellipse key={index} {...node[1]} />;
        }
      })}
    </Svg>
  );
}
