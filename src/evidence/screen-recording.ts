/**
 * MobileMaster — AI Evidence (screen recording).
 */

import fs from "node:fs/promises";
import path from "node:path";
import type { Browser } from "webdriverio";

/** Видео-доказательства: каталог `evidence/recordings` */
export const EVIDENCE_DIR = path.join(process.cwd(), "evidence", "recordings");

function sanitizeFilePart(name: string): string {
  return name.replace(/[^\w.-]+/g, "_").slice(0, 120);
}

/**
 * Starts Appium screen recording for the current session (Android / iOS).
 * Call before each test from WDIO hooks.
 */
export async function startRecordingScreen(
  browser: Browser
): Promise<void> {
  const opts =
    browser.isAndroid === true
      ? {
          timeLimit: 600,
          videoSize: "720x1280",
          bitRate: 4_000_000,
        }
      : {
          timeLimit: 600,
          videoQuality: "medium",
          videoFps: 10,
        };

  await browser.startRecordingScreen(opts);
}

/**
 * Останавливает запись и сохраняет видео в `evidence/recordings`
 * (через `saveRecordingScreen` WebdriverIO / Appium).
 */
export async function stopRecordingAndSave(
  browser: Browser,
  testTitle: string
): Promise<string | null> {
  await fs.mkdir(EVIDENCE_DIR, { recursive: true });
  const fileName = `${sanitizeFilePart(testTitle)}_${Date.now()}.mp4`;
  const outPath = path.join(EVIDENCE_DIR, fileName);
  const sidecarPath = `${outPath}.meta.txt`;

  try {
    await browser.saveRecordingScreen(outPath);
  } catch {
    const b64 = await browser.stopRecordingScreen();
    if (!b64 || typeof b64 !== "string") {
      return null;
    }
    await fs.writeFile(outPath, Buffer.from(b64, "base64"));
  }

  await fs.writeFile(
    sidecarPath,
    `Test: ${testTitle}\nSaved: ${new Date().toISOString()}\n`,
    "utf8"
  );

  return outPath;
}
