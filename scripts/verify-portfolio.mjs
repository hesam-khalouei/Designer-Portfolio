import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { chromium } from "playwright";

// Uses the already-running preview; this script never starts a development server.
// Set PREVIEW_URL and CHROMIUM_PATH if your local environment uses other values.
const executablePath =
  process.env.CHROMIUM_PATH || (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined);
const browser = await chromium.launch({ executablePath, args: ["--no-sandbox"] });
const base = process.env.PREVIEW_URL || "http://localhost:3000";
const labels = { en: "English", fa: "فارسی", ar: "العربية" };
const errors = [];

try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(base, { waitUntil: "networkidle" });
  const language = async (lang) => {
    await page.locator("header").getByRole("button", { name: labels[lang], exact: true }).click();
    await page.waitForFunction((lang) => document.documentElement.lang === lang, lang);
    assert.equal(await page.locator("html").getAttribute("dir"), lang === "en" ? "ltr" : "rtl");
  };
  const checkLayout = async (label) => {
    const overflow = await page.evaluate(() => ({
      page: document.documentElement.scrollWidth > innerWidth,
      elements: [...document.querySelectorAll("h1,h2,h3,a,button")]
        .filter((element) => {
          const bounds = element.getBoundingClientRect();
          return bounds.width && (bounds.left < -2 || bounds.right > innerWidth + 2);
        })
        .map((element) => element.textContent.slice(0, 50)),
    }));
    assert.equal(overflow.page, false, `${label}: horizontal overflow`);
    assert.deepEqual(overflow.elements, [], `${label}: content outside viewport`);
  };
  for (const width of [1440, 1280, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const lang of Object.keys(labels)) {
      await language(lang);
      await page.evaluate(() => document.fonts.ready);
      await checkLayout(`${width}px ${lang}`);
      assert.ok((await page.locator(".hero-intro").innerText()).length > 200);
      assert.ok(
        (await page.locator('meta[name="description"]').getAttribute("content")).length > 200,
      );
      console.log(`PASS home layout, full summary and metadata: ${width}px ${lang}`);
    }
  }
  await language("en");
  const menu = page.getByRole("button", { name: "Open navigation", exact: true });
  await menu.click();
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.getElementById("mobile-nav"));
  assert.equal(await menu.evaluate((element) => element === document.activeElement), true);
  await menu.click();
  await page.locator("#mobile-nav").getByRole("link", { name: "Services", exact: true }).click();
  await page.waitForFunction(() => !document.getElementById("mobile-nav"));
  await page.getByRole("button", { name: "Switch to dark theme", exact: true }).click();
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
  await language("fa");
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(await page.locator("html").getAttribute("lang"), "fa");
  await language("en");
  await page.getByRole("button", { name: "Switch to light theme", exact: true }).click();
  await page.getByRole("button", { name: "More selected projects", exact: false }).click();
  const urls = await page
    .locator(".project-card, .additional-projects a")
    .evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute("href")));
  assert.equal(new Set(urls).size, 13);
  for (const lang of Object.keys(labels)) {
    await language(lang);
    for (const url of urls) {
      await page.goto(`${base}/${url}`);
      await page.waitForSelector(".case-study");
      assert.equal(await page.locator(".case-section").count(), 10);
      assert.equal(await page.locator(".case-section-visual").count(), 3);
      await checkLayout(`Case study ${url} ${lang}`);
    }
  }
  for (const [lang, title, direction] of [
    ["en", "Admin Panel", "ltr"],
    ["fa", "\u067E\u0646\u0644 \u0645\u062F\u06CC\u0631\u06CC\u062A", "rtl"],
    ["ar", "\u0644\u0648\u062D\u0629 \u0627\u0644\u0625\u062F\u0627\u0631\u0629", "rtl"],
  ]) {
    await page.evaluate(([lang]) => localStorage.setItem("ahk-language", lang), [lang]);
    await page.evaluate(() => localStorage.setItem("ahk-theme", "dark"));
    await page.reload({ waitUntil: "networkidle" });
    await page.goto(`${base}/#/admin`, { waitUntil: "networkidle" });
    assert.equal((await page.locator("#admin-title").textContent()).trim(), title);
    assert.equal(await page.locator("html").getAttribute("lang"), lang);
    assert.equal(await page.locator("html").getAttribute("dir"), direction);
    assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
    assert.equal(await page.locator(".hero-intro").count(), 0);
    assert.equal(await page.locator("header.header").count(), 0);
    assert.equal(await page.locator('a[href="#/"]').count(), 1);
  }
  await page.locator('a[href="#/"]').click();
  await page.waitForSelector(".hero-intro");
  assert.equal(await page.locator("html").getAttribute("lang"), "ar");
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
  await page.goto(`${base}/#/work/invalid-id`, { waitUntil: "networkidle" });
  await page.waitForSelector(".hero-intro");
  await page.goto(`${base}/#/unknown`, { waitUntil: "networkidle" });
  await page.waitForSelector(".hero-intro");
  console.log("PASS Admin route isolation, en/fa/ar localization, preference persistence, public return, and fallback routes");
  await language("en");
  await page.getByRole("button", { name: "Switch to light theme", exact: true }).click();
  await page.goto(`${base}/#/work/postex`);
  await page.waitForSelector(".case-contributions");
  await page.locator(".skip-link").focus();
  await page.keyboard.press("Enter");
  assert.equal(new URL(page.url()).hash, "#/work/postex");
  assert.equal(
    await page.locator("#main").evaluate((element) => element === document.activeElement),
    true,
  );
  assert.ok((await page.locator(".case-contributions").innerText()).includes("approximately 20%"));
  await page.getByRole("link", { name: "Back to selected work", exact: true }).click();
  await page.waitForSelector(".hero-intro");
  await page.waitForFunction(() => location.hash === "#work");
  await page.waitForFunction(() => {
    const section = document.getElementById("work");
    if (!section) return false;
    const bounds = section.getBoundingClientRect();
    return scrollY > 0 && bounds.top < innerHeight && bounds.bottom > 0;
  });
  assert.equal(await page.locator("#work").count(), 1);

  await page.goBack();
  await page.waitForFunction(() => location.hash === "#/work/postex");
  await page.waitForSelector(".case-study");

  await page.goForward();
  await page.waitForFunction(() => location.hash === "#work");
  await page.waitForFunction(() => {
    const section = document.getElementById("work");
    return section && scrollY > 0 &&
      section.getBoundingClientRect().bottom > 0;
  });
  await page.waitForSelector(".hero-intro");
  assert.equal(
    await page.locator(".contact-email").getAttribute("href"),
    "mailto:hesam.khalouei8@gmail.com",
  );
  assert.equal(await page.locator('a[href=""]').count(), 0);
  assert.deepEqual(errors, []);
  console.log(
    "PASS mobile menu and Escape focus, preference persistence, all 39 localized case studies, documented metrics, email, and runtime errors",
  );
} finally {
  await browser.close();
}
