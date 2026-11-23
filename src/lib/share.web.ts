export type ShareResult = 'shared' | 'copied' | 'failed';

/** Desktop browsers often have no share sheet, so fall back to the clipboard. */
export async function shareText(message: string): Promise<ShareResult> {
  try {
    if (navigator.share) {
      await navigator.share({ text: message });
      return 'shared';
    }
    await navigator.clipboard.writeText(message);
    return 'copied';
  } catch (error) {
    // Closing the share sheet is not a failure.
    return error instanceof DOMException && error.name === 'AbortError' ? 'shared' : 'failed';
  }
}
