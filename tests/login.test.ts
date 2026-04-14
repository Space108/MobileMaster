/**
 * Шаблон: сессия открывает приложение; на экране есть кнопка «Войти».
 * Текст кнопки можно переопределить: E2E_LOGIN_BUTTON_TEXT
 */

import { $, browser, expect } from "@wdio/globals";
import { platformLocator } from "../src/helpers/cross-platform-locators";

describe("Login (шаблон)", () => {
  it("приложение открывается и на экране есть кнопка «Войти»", async () => {
    const label = process.env.E2E_LOGIN_BUTTON_TEXT ?? "Войти";

    const androidSel = `android=new UiSelector().text("${label}")`;
    const iosSel = `-ios predicate string:label == "${label}" OR name == "${label}"`;

    const sel = platformLocator(browser, androidSel, iosSel);
    const loginButton = $(sel);

    await loginButton.waitForDisplayed({ timeout: 120_000 });
    await expect(loginButton).toBeDisplayed();
  });
});
