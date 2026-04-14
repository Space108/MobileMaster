/**
 * MobileMaster — cross-platform selector helper.
 */

import type { Browser } from "webdriverio";

export type WdioSelector = string | ChainableStrategy;

/** Internal: matches webdriverio selector shapes without importing full chain types */
type ChainableStrategy = Record<string, string>;

/**
 * Picks Android or iOS selector based on the active session.
 */
export function platformLocator<T extends WdioSelector>(
  browser: Browser,
  android: T,
  ios: T
): T {
  if (browser.isAndroid) {
    return android;
  }
  if (browser.isIOS) {
    return ios;
  }
  throw new Error(
    "platformLocator: session is neither Android nor iOS (check capabilities)."
  );
}

/**
 * Convenience: returns a tuple you can pass to `$()` / `$$()` as a single strategy object.
 */
export function byAccessibilityId(
  browser: Browser,
  androidId: string,
  iosId: string
): { "appium:accessibilityId": string } {
  const id = platformLocator(browser, androidId, iosId);
  return { "appium:accessibilityId": id };
}
