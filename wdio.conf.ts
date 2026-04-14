/**
 * MobileMaster — единый конфиг WebdriverIO + @wdio/appium-service.
 *
 * Две платформы в одном файле:
 * - Android — эмулятор/девайс, UiAutomator2, .apk
 * - iPhone (iOS) — симулятор/девайс, XCUITest, .app (симулятор) или .ipa (девайс)
 *
 * Активная платформа: переменная окружения `PLATFORM=android` | `ios`.
 */

import path from "node:path";
import { browser } from "@wdio/globals";
import { startRecordingScreen, stopRecordingAndSave } from "./src/evidence/screen-recording";
import { saveEvidenceScreenshot } from "./src/evidence/screenshots";

const platform = (process.env.PLATFORM ?? "android").toLowerCase();

const androidApp =
  process.env.ANDROID_APP_PATH ??
  path.resolve(process.cwd(), "app", "android", "app.apk");

const iosApp =
  process.env.IOS_APP_PATH ??
  path.resolve(process.cwd(), "app", "ios", "MyApp.app");

/* ========== Android (UIAutomator2 + .apk) ========== */
const androidCapabilities: WebdriverIO.Capabilities = {
  platformName: "Android",
  "appium:automationName": "UiAutomator2",
  "appium:deviceName": process.env.ANDROID_DEVICE_NAME ?? "Android Emulator",
  "appium:app": androidApp,
  "appium:noReset": process.env.APPIUM_NO_RESET !== "false",
  ...(process.env.ANDROID_APP_PACKAGE
    ? { "appium:appPackage": process.env.ANDROID_APP_PACKAGE }
    : {}),
  ...(process.env.ANDROID_APP_ACTIVITY
    ? { "appium:appActivity": process.env.ANDROID_APP_ACTIVITY }
    : {}),
  ...(process.env.ANDROID_PLATFORM_VERSION
    ? { "appium:platformVersion": process.env.ANDROID_PLATFORM_VERSION }
    : {}),
};

/* ========== iPhone / iOS (XCUITest + .app для Simulator или .ipa для устройства) ========== */
const iosCapabilities: WebdriverIO.Capabilities = {
  platformName: "iOS",
  "appium:automationName": "XCUITest",
  "appium:deviceName": process.env.IOS_DEVICE_NAME ?? "iPhone 15",
  "appium:platformVersion": process.env.IOS_PLATFORM_VERSION ?? "17.0",
  "appium:app": iosApp,
  "appium:noReset": process.env.APPIUM_NO_RESET !== "false",
  ...(process.env.IOS_BUNDLE_ID
    ? { "appium:bundleId": process.env.IOS_BUNDLE_ID }
    : {}),
  ...(process.env.IOS_UDID ? { "appium:udid": process.env.IOS_UDID } : {}),
  ...(process.env.IOS_XCODE_ORG_ID
    ? { "appium:xcodeOrgId": process.env.IOS_XCODE_ORG_ID }
    : {}),
  ...(process.env.IOS_XCODE_SIGNING_ID
    ? { "appium:xcodeSigningId": process.env.IOS_XCODE_SIGNING_ID }
    : {}),
};

export const config: WebdriverIO.Config = {
  runner: "local",

  specs: ["./tests/**/*.ts"],

  port: Number(process.env.APPIUM_PORT ?? 4723),
  path: "/",
  protocol: "http",
  hostname: "127.0.0.1",

  maxInstances: 1,

  capabilities: [platform === "ios" ? iosCapabilities : androidCapabilities],

  services: [
    [
      "appium",
      {
        command: "appium",
        args: {
          address: "127.0.0.1",
          port: Number(process.env.APPIUM_PORT ?? 4723),
          relaxedSecurity: true,
          log: path.join("evidence", "appium-server.log"),
        },
        appiumStartTimeout: 90_000,
      },
    ],
  ],

  logLevel: "info",

  framework: "mocha",
  reporters: [["spec", { addConsoleLogs: true }]],

  mochaOpts: {
    ui: "bdd",
    timeout: 120_000,
  },

  onPrepare: async function () {
    const label = platform === "ios" ? "iPhone (iOS)" : "Android";
    console.info(
      `[MobileMaster] runner starting — платформа: ${label} (Appium via @wdio/appium-service)`
    );
  },

  beforeTest: async () => {
    try {
      await startRecordingScreen(browser);
    } catch (err) {
      console.error("[MobileMaster evidence] startRecordingScreen:", err);
    }
  },

  afterTest: async (test) => {
    try {
      await stopRecordingAndSave(browser, test.title ?? "unnamed");
    } catch (err) {
      console.error("[MobileMaster evidence] stopRecordingScreen:", err);
    }
    try {
      await saveEvidenceScreenshot(browser, test.title ?? "unnamed");
    } catch (err) {
      console.error("[MobileMaster evidence] saveScreenshot:", err);
    }
  },
};

export default config;
