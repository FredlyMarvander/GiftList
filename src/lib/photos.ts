import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

/**
 * Photos are copied into the app's document folder and gifts only remember the
 * file name, because the absolute path changes between app updates on iOS.
 */
export const photosSupported = true;

const photoFolder = () => new Directory(Paths.document, 'gift-photos');

export function photoUri(name: string | null): string | null {
  return name ? new File(photoFolder(), name).uri : null;
}

/** Opens the photo library and returns a temporary URI, or null when cancelled. */
export async function pickPhoto(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });
  return result.canceled ? null : result.assets[0].uri;
}

/** Copies a picked photo into permanent storage and returns its file name. */
export async function savePhoto(temporaryUri: string): Promise<string> {
  const source = new File(temporaryUri);
  const folder = photoFolder();
  folder.create({ intermediates: true, idempotent: true });
  const name = `${Date.now()}${source.extension || '.jpg'}`;
  await source.copy(new File(folder, name));
  return name;
}

export function deletePhoto(name: string | null): void {
  if (!name) return;
  try {
    const file = new File(photoFolder(), name);
    if (file.exists) file.delete();
  } catch (error) {
    console.warn('[giftlist] Could not delete photo.', error);
  }
}
