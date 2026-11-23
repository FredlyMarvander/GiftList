import { Image } from 'expo-image';
import { useState } from 'react';

import { GiftIllustration } from '@/components/gift/gift-illustration';
import { photoUri } from '@/lib/photos';
import type { Gift } from '@/types/gift';

type GiftArtProps = {
  gift: Pick<Gift, 'photo' | 'category' | 'name'>;
  size: number;
  /** A photo that was picked but not saved yet. */
  previewUri?: string | null;
};

/** The user's own photo when there is one, otherwise the category artwork. */
export function GiftArt({ gift, size, previewUri }: GiftArtProps) {
  const uri = previewUri ?? photoUri(gift.photo);
  const [brokenUri, setBrokenUri] = useState<string | null>(null);

  if (!uri || uri === brokenUri) return <GiftIllustration category={gift.category} size={size} />;
  return (
    <Image
      source={{ uri }}
      contentFit="cover"
      transition={150}
      onError={() => setBrokenUri(uri)}
      accessibilityLabel={`Photo of ${gift.name}`}
      style={{ width: size, height: size, borderRadius: size * 0.23 }}
    />
  );
}
