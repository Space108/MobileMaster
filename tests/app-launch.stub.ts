/**
 * Заглушка: проверка, что нативное приложение поднято в сессии Appium.
 */

import { browser, expect } from "@wdio/globals";

describe("MobileMaster — запуск приложения", () => {
  it("приложение открыто (сессия активна, есть рабочая область экрана)", async () => {
    expect(browser.sessionId).toBeDefined();

    const rect = await browser.getWindowRect();
    expect(rect.width).toBeGreaterThan(0);
    expect(rect.height).toBeGreaterThan(0);
  });
});
