import { Capacitor } from '@capacitor/core';

export const isNativeApp = Capacitor.isNativePlatform();

const THEME_COLORS = {
  light: '#ffffff',
  dark: '#080c14',
};

const backHandlers = [];

/**
 * Registers a handler for the Android hardware/gesture back button.
 * Handlers are executed in Last-In-First-Out order (stack).
 * If a handler returns true, event handling stops.
 */
export function registerBackHandler(handler) {
  backHandlers.push(handler);
  return () => {
    const idx = backHandlers.lastIndexOf(handler);
    if (idx !== -1) {
      backHandlers.splice(idx, 1);
    }
  };
}

let backListenerRegistered = false;

/**
 * Initializes the native hardware Back Button listener.
 */
export async function initBackButton(onDefaultBack) {
  if (!isNativeApp || backListenerRegistered) return;
  backListenerRegistered = true;

  try {
    const { App } = await import('@capacitor/app');
    App.addListener('backButton', ({ canGoBack }) => {
      for (let i = backHandlers.length - 1; i >= 0; i--) {
        try {
          const handled = backHandlers[i]();
          if (handled) return;
        } catch {
          // ignore error
        }
      }

      if (onDefaultBack) {
        onDefaultBack();
      } else if (canGoBack) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });
  } catch (err) {
    console.warn('[NativeApp] Erro ao configurar BackButton:', err);
  }
}

/**
 * Hides the native splash screen smoothly after React is mounted.
 */
export async function hideSplashScreen() {
  if (!isNativeApp) return;
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await SplashScreen.hide();
  } catch (e) {
    console.warn('[NativeApp] Erro ao ocultar SplashScreen:', e);
  }
}

/**
 * Syncs the Android status bar color and icon style with light/dark theme.
 */
export async function applyStatusBarTheme(isDark = true) {
  if (!isNativeApp) return;
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light });
    await StatusBar.setBackgroundColor({
      color: isDark ? THEME_COLORS.dark : THEME_COLORS.light,
    });
  } catch (e) {
    console.warn('[NativeApp] Erro ao ajustar StatusBar:', e);
  }
}

/**
 * Configures the soft keyboard and adapts UI dynamically.
 */
export async function configureKeyboard() {
  if (!isNativeApp) return;
  try {
    const { Keyboard, KeyboardResize } = await import('@capacitor/keyboard');
    await Keyboard.setResizeMode({ mode: KeyboardResize.Body });

    Keyboard.addListener('keyboardWillShow', () => {
      document.body.classList.add('keyboard-open');
    });
    Keyboard.addListener('keyboardDidShow', () => {
      document.body.classList.add('keyboard-open');
    });
    Keyboard.addListener('keyboardWillHide', () => {
      document.body.classList.remove('keyboard-open');
    });
    Keyboard.addListener('keyboardDidHide', () => {
      document.body.classList.remove('keyboard-open');
    });
  } catch (e) {
    console.warn('[NativeApp] Erro ao configurar Keyboard:', e);
  }
}

/**
 * Subtle tap feedback for buttons, tabs, and toggles.
 */
export function triggerHaptic(style = 'light') {
  if (!isNativeApp) return;
  import('@capacitor/haptics')
    .then(({ Haptics, ImpactStyle }) => {
      const map = {
        light: ImpactStyle.Light,
        medium: ImpactStyle.Medium,
        heavy: ImpactStyle.Heavy,
      };
      return Haptics.impact({ style: map[style] || ImpactStyle.Light });
    })
    .catch(() => {});
}

/**
 * Notification haptic for save successes, warnings, and errors.
 */
export function triggerNotificationHaptic(type = 'success') {
  if (!isNativeApp) return;
  import('@capacitor/haptics')
    .then(({ Haptics, NotificationType }) => {
      const map = {
        success: NotificationType.Success,
        warning: NotificationType.Warning,
        error: NotificationType.Error,
      };
      return Haptics.notification({ type: map[type] || NotificationType.Success });
    })
    .catch(() => {});
}

/**
 * General native app initializer.
 */
export async function initNativeApp() {
  if (!isNativeApp) return;
  console.log('[NativeApp] Inicializando ambiente Android Nativo (Capacitor)');
  await configureKeyboard();
  await initBackButton();
  await applyStatusBarTheme(true);
  // Splash hide after small delay to ensure initial layout painted
  setTimeout(hideSplashScreen, 300);
}
