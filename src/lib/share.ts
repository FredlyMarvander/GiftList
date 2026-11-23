import { Share } from 'react-native';

export type ShareResult = 'shared' | 'copied' | 'failed';

export async function shareText(message: string): Promise<ShareResult> {
  try {
    await Share.share({ message });
    return 'shared';
  } catch {
    return 'failed';
  }
}
