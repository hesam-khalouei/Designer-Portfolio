import assert from "node:assert/strict";
import { chromium } from "playwright";
import { createServer } from "vite";

const server = await createServer({
  configFile: "./vite.config.ts",
  server: {
    host: "127.0.0.1",
    port: 0,
    strictPort: false,
  },
});

let browser;

try {
  await server.listen();

  const address = server.httpServer.address();
  assert.ok(address && typeof address !== "string");

  const base = `http://127.0.0.1:${address.port}`;
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();
  const errors = [];
  const consoleErrors = [];
  const failedRequests = [];
  const badResponses = [];

  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("requestfailed", (request) => {
    failedRequests.push({
      url: request.url(),
      error: request.failure()?.errorText,
    });
  });
  page.on("response", (response) => {
    if (response.status() >= 400) {
      badResponses.push({
        url: response.url(),
        status: response.status(),
      });
    }
  });

  const response = await page.goto(
    `${base}/tests/admin/design-system/index.html`,
    { waitUntil: "networkidle" }
  );

  assert.equal(response?.status(), 200);
  await page.getByTestId("admin-fixture").waitFor();

  assert.equal(
    await page.getByRole("heading", { name: "Design System Fixture" }).count(),
    1
  );
  assert.equal(await page.getByTestId("card").count(), 1);
  assert.equal(await page.getByText("Active").count(), 1);

  assert.equal(await page.getByTestId("card").getAttribute("role"), "group");
  assert.equal(await page.getByTestId("card").getAttribute("aria-label"), "Fixture card");
  assert.equal(await page.getByTestId("badge").getAttribute("title"), "Badge native title");
  assert.equal(await page.getByTestId("enabled-button").getAttribute("title"), "Button native title");
  assert.equal(await page.getByRole("textbox", { name: "Project name" }).getAttribute("name"), "projectName");
  assert.equal(await page.getByRole("textbox", { name: "Project name" }).getAttribute("autocomplete"), "off");
  assert.equal(await page.getByRole("heading", { name: "Design System Fixture" }).evaluate((element) => element.tagName), "H2");

  const enabled = page.getByTestId("enabled-button");
  const disabled = page.getByTestId("disabled-button");

  assert.equal(await enabled.isEnabled(), true);
  assert.equal(await disabled.isDisabled(), true);

  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });

  await page.keyboard.press("Tab");
  assert.equal(await enabled.evaluate((element) => element === document.activeElement), true);

  const focusStyle = await enabled.evaluate((element) => {
    const style = getComputedStyle(element);
    return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth };
  });

  assert.equal(focusStyle.outlineStyle, "solid");
  assert.equal(focusStyle.outlineWidth, "2px");

  await page.keyboard.press("Tab");
  assert.equal(await page.evaluate(() => document.activeElement?.id === "fixture-input"), true);

  await enabled.click();
  assert.equal(await page.locator("#button-result").textContent(), "Clicked");

  const input = page.getByRole("textbox", { name: "Project name" });

  assert.equal(await input.getAttribute("aria-invalid"), "true");
  assert.ok((await input.getAttribute("aria-describedby")).includes("fixture-input-hint"));
  assert.ok((await input.getAttribute("aria-describedby")).includes("fixture-input-error"));

  assert.equal(await page.getByText("Enter a project name.").count(), 1);
  assert.equal(await page.getByText("This field has an example error.").count(), 1);

  const token = await page.locator(".admin-app").evaluate(
    (element) => getComputedStyle(element).getPropertyValue("--admin-bg").trim()
  );
  assert.ok(token.length > 0, "Admin CSS tokens were not loaded");

  const app = page.locator(".admin-app");

  assert.equal(
    await app.evaluate((element) => getComputedStyle(element).colorScheme),
    "light"
  );
  assert.equal(
    await app.evaluate((element) => getComputedStyle(element).getPropertyValue("--admin-bg").trim()),
    "#f3f4f6"
  );

  await page.evaluate(() => {
    document.documentElement.dataset.theme = "dark";
  });

  assert.equal(
    await app.evaluate((element) => getComputedStyle(element).colorScheme),
    "dark"
  );
  assert.equal(
    await app.evaluate((element) => getComputedStyle(element).getPropertyValue("--admin-bg").trim()),
    "#171b21"
  );

  await page.evaluate(() => {
    document.documentElement.dir = "rtl";
  });

  assert.equal(
    await app.evaluate((element) => getComputedStyle(element).direction),
    "rtl"
  );

  const rtlFont = await app.evaluate(
    (element) => getComputedStyle(element).fontFamily
  );
  assert.ok(rtlFont.includes("Vazirmatn"), "RTL font rule was not applied");

  assert.deepEqual(errors, [], "Browser runtime errors detected");
  assert.deepEqual(consoleErrors, [], "Browser console errors detected");
  assert.deepEqual(failedRequests, [], "Failed network requests detected");
  assert.deepEqual(badResponses, [], "HTTP error responses detected");

  console.log("PASS: five Admin primitives rendered");
  console.log("PASS: native attributes and semantic heading");
  console.log("PASS: Button interaction and disabled state");
  console.log("PASS: keyboard tab order and visible focus indicator");
  console.log("PASS: Input label, hint, error and ARIA");
  console.log("PASS: Admin CSS tokens loaded");
  console.log("PASS: Light/Dark theme and RTL direction");
  console.log("PASS: no browser runtime errors");
  console.log("PASS: no console errors, failed requests or HTTP errors");
} finally {
  if (browser) await browser.close();
  await server.close();
}

