/**
 * MobileMaster — пример e2e (замените селекторы под своё приложение).
 */

import { expect } from "@wdio/globals";
import { platformLocator } from "../src/helpers/cross-platform-locators";
import { verifyWithApiMaster } from "../src/integration/api-master";

describe("MobileMaster smoke", () => {
  it("открывает приложение (пример)", async () => {
    expect(browser).toBeDefined();
    const selector = platformLocator(browser, "~android_acc_id", "~ios_acc_id");
    if (await $(selector).isExisting()) {
      await expect($(selector)).toBeDisplayed();
    }
  });

  it("пример вызова ApiMaster после действия в UI", async () => {
    if (!process.env.API_MASTER_BASE_URL) {
      return;
    }
    const result = await verifyWithApiMaster<{ ok?: boolean }>({
      path: "/health",
      method: "GET",
    });
    expect(result).toBeDefined();
  });
});
