import { useId, type ReactNode } from 'react';
import Svg, { Circle, Defs, Ellipse, G, Line, LinearGradient, Path, Polygon, Rect, Stop } from 'react-native-svg';

import { CATEGORIES, type CategoryId } from '@/constants/options';

/**
 * Vector artwork for every category, drawn on a 100 x 100 grid. The perfume and
 * cutlery tiles recreate the mockup; the rest follow the same glossy style.
 */

type Gradient = { from: string; to: string; mid?: string; direction?: 'down' | 'across' | 'diagonal' };
type Gradients = Record<string, Gradient>;
type Art = { tile: [string, string]; paints: Gradients; draw: (paint: (name: string) => string) => ReactNode };

const directions = {
  down: { x1: '0', y1: '0', x2: '0', y2: '1' },
  across: { x1: '0', y1: '0', x2: '1', y2: '0' },
  diagonal: { x1: '0', y1: '0', x2: '1', y2: '1' },
};

function Flower({ x, y, size, petal, core }: { x: number; y: number; size: number; petal: string; core: string }) {
  return (
    <G>
      {[0, 1, 2, 3, 4].map((index) => {
        const angle = (index / 5) * Math.PI * 2 - Math.PI / 2;
        return (
          <Circle
            key={index}
            cx={x + Math.cos(angle) * size * 0.62}
            cy={y + Math.sin(angle) * size * 0.62}
            r={size * 0.56}
            fill={petal}
          />
        );
      })}
      <Circle cx={x} cy={y} r={size * 0.42} fill={core} />
    </G>
  );
}

const sparkle = (x: number, y: number, s: number) =>
  `M${x} ${y - s} C${x + s * 0.15} ${y - s * 0.15} ${x + s * 0.15} ${y - s * 0.15} ${x + s} ${y} C${x + s * 0.15} ${y + s * 0.15} ${x + s * 0.15} ${y + s * 0.15} ${x} ${y + s} C${x - s * 0.15} ${y + s * 0.15} ${x - s * 0.15} ${y + s * 0.15} ${x - s} ${y} C${x - s * 0.15} ${y - s * 0.15} ${x - s * 0.15} ${y - s * 0.15} ${x} ${y - s} Z`;

const TICKET =
  'M24 33 h52 a4 4 0 0 1 4 4 v7 a6 6 0 0 0 0 12 v7 a4 4 0 0 1 -4 4 h-52 a4 4 0 0 1 -4 -4 v-7 a6 6 0 0 0 0 -12 v-7 a4 4 0 0 1 4 -4 Z';

const giftBoxPaints: Gradients = {
  box: { from: '#F9B6CD', to: '#EC88AD' },
  lid: { from: '#FCCBDB', to: '#F29FBD' },
  bow: { from: '#EA7CA3', to: '#D4547F' },
};

function drawGiftBox(paint: (name: string) => string) {
  return (
    <>
      <Path d="M50 37 C38 38 26 33 28 24 C30 15 44 18 50 37 Z" fill="none" stroke={paint('bow')} strokeWidth={5} strokeLinejoin="round" />
      <Path d="M50 37 C62 38 74 33 72 24 C70 15 56 18 50 37 Z" fill="none" stroke={paint('bow')} strokeWidth={5} strokeLinejoin="round" />
      <Rect x={24} y={46} width={52} height={40} rx={5} fill={paint('box')} />
      <Rect x={20} y={36} width={60} height={16} rx={4.5} fill={paint('lid')} />
      <Rect x={44} y={36} width={12} height={50} fill="#FFFFFF" opacity={0.92} />
      <Rect x={44} y={52} width={12} height={3} fill="#E9A5C0" opacity={0.6} />
      <Rect x={44.5} y={31.5} width={11} height={8} rx={3.5} fill={paint('bow')} />
      <Rect x={28} y={56} width={5} height={22} rx={2.5} fill="#FFFFFF" opacity={0.3} />
    </>
  );
}

const ART: Record<CategoryId, Art> = {
  beauty: {
    tile: ['#E7F0FC', '#D0DDF8'],
    paints: {
      cap: { from: '#2B2650', mid: '#6C6494', to: '#211D42', direction: 'across' },
      glass: { from: '#FCD9E5', to: '#E8809F', direction: 'diagonal' },
    },
    draw: (paint) => (
      <>
        <Ellipse cx={66} cy={80} rx={25} ry={6.5} fill="#8CA3EE" opacity={0.42} />
        <Rect x={40} y={17} width={21} height={20} rx={4} fill={paint('cap')} />
        <Rect x={43} y={36} width={15} height={5} fill="#2B2650" />
        <Rect x={26} y={40} width={49} height={44} rx={10} fill="#DCE3FA" stroke="#6B76B5" strokeWidth={2} />
        <Rect x={29.5} y={43.5} width={42} height={37} rx={7} fill={paint('glass')} />
        <Rect x={34} y={47} width={7.5} height={30} rx={3.75} fill="#FFFFFF" opacity={0.5} />
        <Ellipse cx={50} cy={60} rx={8} ry={3.6} fill="#FFFFFF" opacity={0.85} />
      </>
    ),
  },
  dining: {
    tile: ['#FEF8EE', '#FBEAD4'],
    paints: { metal: { from: '#F9B851', to: '#DC7320' } },
    draw: (paint) => (
      <>
        <Ellipse cx={51} cy={87} rx={26} ry={3.5} fill="#E9C79C" opacity={0.5} />
        <Path
          d="M29 20 v20 a9 9 0 0 0 6 8.5 V80 a4 4 0 0 0 8 0 V48.5 a9 9 0 0 0 6 -8.5 V20 a2.6 2.6 0 0 0 -5.2 0 V36 h-2.2 V20 a2.6 2.6 0 0 0 -5.2 0 V36 h-2.2 V20 a2.6 2.6 0 0 0 -5.2 0 Z"
          fill={paint('metal')}
          stroke="#C8661B"
          strokeWidth={1.4}
        />
        <Path
          d="M68 18 c-8 3 -12 14 -12 26 c0 6 3 8 6 8 h2 V80 a4 4 0 0 0 8 0 V21 c0 -2.5 -2 -3.8 -4 -3 Z"
          fill={paint('metal')}
          stroke="#C8661B"
          strokeWidth={1.4}
        />
        <Path d="M37 52 V78 M66.5 25 C62 30 60.5 37 60.5 44" stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" opacity={0.5} fill="none" />
      </>
    ),
  },
  fashion: {
    tile: ['#FFF0F6', '#FBD9E7'],
    paints: {
      body: { from: '#F59ABB', to: '#D34F86' },
      flap: { from: '#FBBBD2', to: '#E9739F' },
      gold: { from: '#FFE3A0', to: '#E5A63B' },
    },
    draw: (paint) => (
      <>
        <Ellipse cx={50} cy={86} rx={30} ry={4} fill="#DE8FB0" opacity={0.35} />
        <Path d="M36 46 V36 a14 14 0 0 1 28 0 V46" stroke="#B5446E" strokeWidth={5} fill="none" strokeLinecap="round" />
        <Path d="M27 42 h46 l5.5 36 a6 6 0 0 1 -6 6.6 H27.5 a6 6 0 0 1 -6 -6.6 Z" fill={paint('body')} />
        <Path d="M27 42 h46 l2.2 14 c-10 10 -40 10 -50.4 0 Z" fill={paint('flap')} />
        <Circle cx={50} cy={63} r={5.5} fill={paint('gold')} stroke="#C98A24" strokeWidth={1.2} />
        <Path d="M29 62 l-1.6 14" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" opacity={0.4} />
      </>
    ),
  },
  tech: {
    tile: ['#F0ECFF', '#DDD5FA'],
    paints: {
      band: { from: '#7D6EF0', to: '#4A3DB8', direction: 'across' },
      cup: { from: '#9F91FF', to: '#5B4BD6' },
    },
    draw: (paint) => (
      <>
        <Ellipse cx={50} cy={86} rx={30} ry={4} fill="#9C8FE0" opacity={0.35} />
        <Path d="M24 60 V52 a26 26 0 0 1 52 0 V60" stroke={paint('band')} strokeWidth={7.5} fill="none" strokeLinecap="round" />
        <Path d="M27.5 46 a23 23 0 0 1 14 -17" stroke="#FFFFFF" strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.5} />
        <Rect x={28} y={54} width={8.5} height={27} rx={4} fill="#2E2A70" />
        <Rect x={63.5} y={54} width={8.5} height={27} rx={4} fill="#2E2A70" />
        <Rect x={16} y={51} width={17} height={33} rx={8} fill={paint('cup')} />
        <Rect x={67} y={51} width={17} height={33} rx={8} fill={paint('cup')} />
        <Rect x={19.5} y={56} width={3.5} height={17} rx={1.75} fill="#FFFFFF" opacity={0.45} />
        <Rect x={70.5} y={56} width={3.5} height={17} rx={1.75} fill="#FFFFFF" opacity={0.45} />
      </>
    ),
  },
  experience: {
    tile: ['#E9F9F2', '#CDEEDF'],
    paints: {
      back: { from: '#FFD98A', to: '#F3AE4A', direction: 'across' },
      front: { from: '#48C79C', to: '#1F9270', direction: 'diagonal' },
    },
    draw: (paint) => (
      <>
        <Ellipse cx={50} cy={84} rx={28} ry={4} fill="#7CC7A9" opacity={0.4} />
        <G transform="translate(2 -12) rotate(-16 50 50)">
          <Path d={TICKET} fill={paint('back')} />
          <Line x1={62} y1={37} x2={62} y2={63} stroke="#FFFFFF" strokeWidth={1.8} strokeDasharray="3 3" opacity={0.7} />
        </G>
        <G transform="translate(-1 6) rotate(7 50 50)">
          <Path d={TICKET} fill={paint('front')} />
          <Line x1={62} y1={37} x2={62} y2={63} stroke="#FFFFFF" strokeWidth={1.8} strokeDasharray="3 3" opacity={0.85} />
          <Polygon
            points="42,41 44.23,46.93 50.56,47.22 45.61,51.17 47.29,57.28 42,53.8 36.71,57.28 38.39,51.17 33.44,47.22 39.77,46.93"
            fill="#FFFFFF"
          />
          <Line x1={67} y1={46} x2={74} y2={46} stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" opacity={0.8} />
          <Line x1={67} y1={54} x2={72} y2={54} stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" opacity={0.8} />
        </G>
      </>
    ),
  },
  flowers: {
    tile: ['#FFF1F3', '#FCDCE3'],
    paints: { wrap: { from: '#FFE6D2', to: '#F3B690' }, fold: { from: '#FFF3E8', to: '#F9CFB0' } },
    draw: (paint) => (
      <>
        <Ellipse cx={50} cy={89} rx={18} ry={3} fill="#E3A9A0" opacity={0.4} />
        <Ellipse cx={27} cy={42} rx={6} ry={12} fill="#7CBF8B" transform="rotate(-40 27 42)" />
        <Ellipse cx={73} cy={42} rx={6} ry={12} fill="#6BB27C" transform="rotate(40 73 42)" />
        <Ellipse cx={50} cy={22} rx={5} ry={10} fill="#7CBF8B" />
        <Flower x={35} y={33} size={10} petal="#F58FB2" core="#FFE08A" />
        <Flower x={65} y={33} size={10} petal="#F3B0D2" core="#FFE08A" />
        <Flower x={50} y={27} size={10} petal="#EE6C98" core="#FFE9A8" />
        <Flower x={42} y={45} size={9.5} petal="#FFC1D3" core="#FFD066" />
        <Flower x={59} y={45} size={9.5} petal="#F27FA6" core="#FFE9A8" />
        <Path d="M50 88 L27 49 C36 57 64 57 73 49 Z" fill={paint('wrap')} />
        <Path d="M50 88 L27 49 C34 54 42 56 50 56 Z" fill={paint('fold')} />
        <Path d="M50 71 c-7 -6 -13 -4 -12 1 c1 4 8 3 12 -1 c4 4 11 5 12 1 c1 -5 -5 -7 -12 -1 Z" fill="#DD5C88" />
        <Circle cx={50} cy={71.5} r={2.8} fill="#C2426F" />
      </>
    ),
  },
  jewelry: {
    tile: ['#EEF9FD', '#D3ECF7'],
    paints: { gold: { from: '#FFE7A6', mid: '#F5C04D', to: '#D6912A', direction: 'diagonal' }, gem: { from: '#F2FDFF', to: '#79CDF2' } },
    draw: (paint) => (
      <>
        <Ellipse cx={50} cy={88} rx={22} ry={3.5} fill="#8FC3DA" opacity={0.4} />
        <Circle cx={50} cy={63} r={20} stroke={paint('gold')} strokeWidth={7} fill="none" />
        <Path d="M36 54 a16.5 16.5 0 0 0 -1.5 14" stroke="#FFFFFF" strokeWidth={2.2} strokeLinecap="round" fill="none" opacity={0.75} />
        <Path d="M41 44 L59 44 L55 50 L45 50 Z" fill="#D6912A" />
        <Polygon points="39,18 61,18 70,28 50,47 30,28" fill={paint('gem')} stroke="#57AEDB" strokeWidth={1.4} strokeLinejoin="round" />
        <Path d="M30 28 H70 M39 18 L43 28 L50 47 L57 28 L61 18 M43 28 L50 18 L57 28" stroke="#57AEDB" strokeWidth={1.1} fill="none" strokeLinejoin="round" opacity={0.7} />
        <Path d={sparkle(78, 22, 6)} fill="#FFFFFF" />
        <Path d={sparkle(23, 45, 4.5)} fill="#FFFFFF" />
      </>
    ),
  },
  books: {
    tile: ['#FBF4E9', '#F3E3CB'],
    paints: { cover: { from: '#7FB1F7', to: '#3D70CE', direction: 'diagonal' }, back: { from: '#F6A77F', to: '#DE7247' } },
    draw: (paint) => (
      <>
        <Ellipse cx={51} cy={88} rx={30} ry={3.5} fill="#CDB28A" opacity={0.45} />
        <G transform="rotate(7 60 50)">
          <Rect x={40} y={22} width={38} height={62} rx={4} fill={paint('back')} />
        </G>
        <Path d="M28 78 h44 v7 H31 a3.5 3.5 0 0 1 -3 -7 Z" fill="#FFF9EE" stroke="#E2D2B4" strokeWidth={1.2} />
        <Rect x={25} y={17} width={47} height={64} rx={5} fill={paint('cover')} />
        <Path d="M30 17 h4 v64 h-4 a5 5 0 0 1 -5 -5 V22 a5 5 0 0 1 5 -5 Z" fill="#2C58AF" />
        <Rect x={41} y={29} width={24} height={17} rx={3} fill="#FFFFFF" opacity={0.92} />
        <Line x1={45} y1={35} x2={61} y2={35} stroke="#3D70CE" strokeWidth={2} strokeLinecap="round" />
        <Line x1={45} y1={40.5} x2={56} y2={40.5} stroke="#9DBDF0" strokeWidth={2} strokeLinecap="round" />
        <Path d="M57 81 V66 l4.5 3.6 l4.5 -3.6 V81 Z" fill="#F0658B" />
      </>
    ),
  },
  home: {
    tile: ['#F2F8EC', '#DCEBD0'],
    paints: { pot: { from: '#EFB08A', to: '#C66F46' }, leaf: { from: '#8FD08A', to: '#3F9A5A' }, leafAlt: { from: '#A8DD9B', to: '#58AE62' } },
    draw: (paint) => (
      <>
        <Ellipse cx={50} cy={88} rx={24} ry={3.5} fill="#A7BE93" opacity={0.5} />
        <Path d="M48 56 C33 52 24 41 23 27 C38 29 47 40 49 56 Z" fill={paint('leafAlt')} />
        <Path d="M52 56 C67 52 76 41 77 27 C62 29 53 40 51 56 Z" fill={paint('leafAlt')} />
        <Path d="M50 57 C40 42 42 24 50 13 C58 24 60 42 50 57 Z" fill={paint('leaf')} />
        <Path d="M50 54 V26 M46 48 C40 44 34 38 30 33 M54 48 C60 44 66 38 70 33" stroke="#FFFFFF" strokeWidth={1.3} fill="none" opacity={0.5} strokeLinecap="round" />
        <Path d="M34 60 h32 l-4 23 a4 4 0 0 1 -4 3.4 H42 a4 4 0 0 1 -4 -3.4 Z" fill={paint('pot')} />
        <Rect x={30.5} y={54} width={39} height={9} rx={3.5} fill="#DE9066" />
        <Path d="M40 68 l1.4 12" stroke="#FFFFFF" strokeWidth={2.6} strokeLinecap="round" opacity={0.4} />
      </>
    ),
  },
  hobby: {
    tile: ['#F4EEFF', '#E2D6FB'],
    paints: { body: { from: '#B7A2FF', to: '#6A50DA' } },
    draw: (paint) => (
      <>
        <Ellipse cx={50} cy={83} rx={32} ry={4} fill="#9D86E4" opacity={0.35} />
        <Path
          d="M33 33 h34 c12 0 18 10 20.5 25 c1.8 12 -2 19.5 -9.5 19.5 c-6.5 0 -9.5 -6.5 -13.5 -12.5 H35.5 c-4 6 -7 12.5 -13.5 12.5 c-7.5 0 -11.3 -7.5 -9.5 -19.5 C15 43 21 33 33 33 Z"
          fill={paint('body')}
        />
        <Path d="M24 40 c2 -2 5 -3 9 -3 h12" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" fill="none" opacity={0.5} />
        <Rect x={28.5} y={43} width={6} height={18} rx={2} fill="#FFFFFF" />
        <Rect x={22.5} y={49} width={18} height={6} rx={2} fill="#FFFFFF" />
        <Circle cx={68.5} cy={44.5} r={3.6} fill="#FFD36B" />
        <Circle cx={76} cy={52} r={3.6} fill="#FF87A8" />
        <Circle cx={68.5} cy={59.5} r={3.6} fill="#7CE3B8" />
        <Circle cx={61} cy={52} r={3.6} fill="#8ACBFF" />
      </>
    ),
  },
  sweets: {
    tile: ['#FFF4EC', '#FBDDCB'],
    paints: { sponge: { from: '#FFE0B0', to: '#F0A961' }, candle: { from: '#A99BFF', to: '#6C5CE0' } },
    draw: (paint) => (
      <>
        <Ellipse cx={50} cy={83} rx={35} ry={5} fill="#E7C6B4" />
        <Rect x={22} y={50} width={56} height={32} rx={6} fill={paint('sponge')} />
        <Rect x={22} y={69} width={56} height={4} fill="#F58FB2" opacity={0.8} />
        <Path
          d="M22 56 a6 6 0 0 1 6 -6 h44 a6 6 0 0 1 6 6 v5 c0 5 -7 5 -7 0 c0 -3 -5 -3 -5 0 c0 7 -8 7 -8 0 c0 -3 -5 -3 -5 0 c0 5 -7 5 -7 0 c0 -3 -5 -3 -5 0 c0 7 -8 7 -8 0 c0 -3 -5 -3 -5 0 c0 5 -6 5 -6 0 Z"
          fill="#FFFFFF"
        />
        <Rect x={34.5} y={34} width={5} height={17} rx={2} fill={paint('candle')} />
        <Rect x={47.5} y={29} width={5} height={22} rx={2} fill="#F27FA6" />
        <Rect x={60.5} y={34} width={5} height={17} rx={2} fill={paint('candle')} />
        <Path d="M37 22 c3.4 4 3.4 9 0 9.6 c-3.4 -0.6 -3.4 -5.6 0 -9.6 Z" fill="#FFB938" />
        <Path d="M50 16 c3.6 4.4 3.6 10 0 10.6 c-3.6 -0.6 -3.6 -6.2 0 -10.6 Z" fill="#FFB938" />
        <Path d="M63 22 c3.4 4 3.4 9 0 9.6 c-3.4 -0.6 -3.4 -5.6 0 -9.6 Z" fill="#FFB938" />
      </>
    ),
  },
  other: { tile: ['#FFF3F7', '#FBDCE7'], paints: giftBoxPaints, draw: drawGiftBox },
};

function GradientDefs({ paints, prefix }: { paints: Gradients; prefix: string }) {
  return Object.entries(paints).map(([name, { from, mid, to, direction = 'down' }]) => {
    const stops = mid ? [from, mid, to] : [from, to];
    return (
      <LinearGradient key={name} id={prefix + name} {...directions[direction]}>
        {stops.map((color, index) => (
          <Stop key={index} offset={index / (stops.length - 1)} stopColor={color} />
        ))}
      </LinearGradient>
    );
  });
}

/** Gradient ids share one namespace on web, so every instance gets its own prefix. */
function usePrefix(): string {
  return `art${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
}

type GiftIllustrationProps = { category: CategoryId; size: number };

export function GiftIllustration({ category, size }: GiftIllustrationProps) {
  const prefix = usePrefix();
  const art = ART[category];
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel={`${CATEGORIES[category].label} gift`}>
      <Defs>
        <LinearGradient id={`${prefix}tile`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={art.tile[0]} />
          <Stop offset="1" stopColor={art.tile[1]} />
        </LinearGradient>
        <GradientDefs paints={art.paints} prefix={prefix} />
      </Defs>
      <Rect width={100} height={100} rx={23} fill={`url(#${prefix}tile)`} />
      {art.draw((name) => `url(#${prefix}${name})`)}
    </Svg>
  );
}

/** The gift box from the logo, without a background tile. */
export function GiftBox({ size }: { size: number }) {
  const prefix = usePrefix();
  return (
    <Svg width={size} height={size} viewBox="14 12 72 78" aria-hidden>
      <Defs>
        <GradientDefs paints={giftBoxPaints} prefix={prefix} />
      </Defs>
      {drawGiftBox((name) => `url(#${prefix}${name})`)}
    </Svg>
  );
}

export function HeartArt({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <Path
        d="M50 88 C30 72 6 54 6 33 C6 18 17 10 28 10 C38 10 46 16 50 24 C54 16 62 10 72 10 C83 10 94 18 94 33 C94 54 70 72 50 88 Z"
        fill={color}
      />
    </Svg>
  );
}
