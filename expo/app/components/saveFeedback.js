import { Platform, ToastAndroid, Vibration } from 'react-native';

// A short system confirmation after a save, so a closing sheet is not the only sign it worked.
// Android shows a toast and a light tick; iOS and web already confirm by closing the sheet.
export function confirmSaved(message = 'Saved') {
  if (Platform.OS !== 'android') return;
  try {
    ToastAndroid.show(message, ToastAndroid.SHORT);
    Vibration.vibrate(12);
  } catch {
    // Feedback is a nicety; a missing native module must never fail the save.
  }
}
