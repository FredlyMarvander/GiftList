/** Photos need the native file system, so the web build falls back to the category artwork. */
export const photosSupported = false;

export function photoUri(_name: string | null): string | null {
  return null;
}

export async function pickPhoto(): Promise<string | null> {
  return null;
}

export async function savePhoto(_temporaryUri: string): Promise<string> {
  throw new Error('Photos are not supported on web.');
}

export function deletePhoto(_name: string | null): void {}
