// Local Android build settings that `expo prebuild` must keep across a clean run.
// - Release builds may talk plain HTTP to a Floppy server in the home network.
// - The launch screen uses the Floppy mascot on the icon's indigo instead of the
//   template's white placeholder.
const fs = require('fs');
const path = require('path');
const {
  AndroidConfig,
  withAndroidColors,
  withAndroidManifest,
  withAndroidStyles,
  withDangerousMod,
} = require('expo/config-plugins');

const SPLASH_BACKGROUND = '#1e1b4b';

function withCleartextTraffic(config) {
  return withAndroidManifest(config, mod => {
    const app = AndroidConfig.Manifest.getMainApplicationOrThrow(mod.modResults);
    app.$['android:usesCleartextTraffic'] = 'true';
    return mod;
  });
}

function withSplashColors(config) {
  return withAndroidColors(config, mod => {
    mod.modResults = AndroidConfig.Colors.assignColorValue(mod.modResults, {
      name: 'splashscreen_background',
      value: SPLASH_BACKGROUND,
    });
    return mod;
  });
}

function withSplashTheme(config) {
  return withAndroidStyles(config, mod => {
    const setItem = (style, name, value) => {
      mod.modResults = AndroidConfig.Styles.assignStylesValue(mod.modResults, {
        add: true,
        parent: { name: style },
        name,
        value,
      });
    };
    setItem('Theme.App.SplashScreen', 'android:windowBackground', '@drawable/splashscreen');
    // Android 12+ draws its own launch screen from these two attributes.
    setItem('Theme.App.SplashScreen', 'android:windowSplashScreenBackground', '@color/splashscreen_background');
    setItem('Theme.App.SplashScreen', 'android:windowSplashScreenAnimatedIcon', '@mipmap/ic_launcher_foreground');
    return mod;
  });
}

function withSplashDrawable(config) {
  return withDangerousMod(config, [
    'android',
    mod => {
      const drawable = path.join(mod.modRequest.platformProjectRoot, 'app/src/main/res/drawable/splashscreen.xml');
      fs.writeFileSync(drawable, [
        '<?xml version="1.0" encoding="utf-8"?>',
        '<layer-list xmlns:android="http://schemas.android.com/apk/res/android">',
        '  <item android:drawable="@color/splashscreen_background" />',
        '  <item android:width="200dp" android:height="200dp" android:gravity="center" android:drawable="@drawable/splashscreen_logo" />',
        '</layer-list>',
        '',
      ].join('\n'));
      const source = path.join(mod.modRequest.projectRoot, 'assets/splash-icon.png');
      // One large bitmap, scaled down to 200dp by the layer list, instead of the
      // template's per-density placeholders.
      const res = path.join(mod.modRequest.platformProjectRoot, 'app/src/main/res');
      for (const density of ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi']) {
        fs.rmSync(path.join(res, `drawable-${density}/splashscreen_logo.png`), { force: true });
      }
      fs.mkdirSync(path.join(res, 'drawable-nodpi'), { recursive: true });
      fs.copyFileSync(source, path.join(res, 'drawable-nodpi/splashscreen_logo.png'));
      return mod;
    },
  ]);
}

module.exports = function withAndroidLocalBuild(config) {
  return withSplashDrawable(withSplashTheme(withSplashColors(withCleartextTraffic(config))));
};
