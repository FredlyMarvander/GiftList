import * as Haptics from 'expo-haptics';

/** Haptics are a bonus, so a device without them should never surface an error. */
const ignore = () => {};

export const haptics = {
  tap: () => void Haptics.selectionAsync().catch(ignore),
  success: () => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(ignore),
  warning: () => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(ignore),
  error: () => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(ignore),
};
