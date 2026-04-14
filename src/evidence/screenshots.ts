/**
 * MobileMaster — скриншоты для отчётов / evidence.
 */

import fs from "node:fs/promises";
import path from "node:path";
import type { Browser } from "webdriverio";

/** Скриншоты: каталог `evidence/screenshots` */
export const SCREENSHOTS_DIR = path.join(
  process.cwd(),
  "evidence",
  "screenshots"
);

/**
 * Сохраняет PNG в `evidence/screenshots`.
 */
export async function saveEvidenceScreenshot(
  browser: Browser,
  basename: string
): Promise<string> {
  await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });
  const safe = basename.replace(/[^\w.-]+/g, "_").slice(0, 80);
  const filePath = path.join(SCREENSHOTS_DIR, `${safe}_${Date.now()}.png`);
  await browser.saveScreenshot(filePath);
  return filePath;
}
