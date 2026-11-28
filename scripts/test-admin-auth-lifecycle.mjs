import assert from "node:assert/strict";
import { chromium } from "playwright";
import { createServer } from "vite";

const server = await createServer({
  configFile: "./vite.config.ts",
  server: { host: "127.0.0.1", port: 0, strictPort: false },
});

let browser;

try {
  await server.listen();
  const address = server.httpServer.address();
  assert.ok(address && typeof address !== "string");

  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  const base = `http://127.0.0.1:${address.port}/tests/admin/auth/index.html`;
  const openScenario = async (scenario) => {
    await page.goto(`${base}?scenario=${scenario}`, { waitUntil: "networkidle" });
  };

  await openScenario("unauthenticated");
  await page.getByRole("heading", { name: "Admin Sign In" }).waitFor();
  assert.equal(await page.getByTestId("protected-admin").count(), 0);
  assert.equal(await page.getByTestId("auth-status").textContent(), "unauthenticated");
  console.log("PASS: unauthenticated users see Login, not protected Admin");

  await page.getByLabel("Email").fill("admin@example.test");
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("alert").waitFor();
  assert.equal(await page.getByTestId("auth-status").textContent(), "unauthenticated");
  assert.equal(await page.getByTestId("protected-admin").count(), 0);
  console.log("PASS: invalid credentials do not grant access");

  await page.waitForFunction(() => {
    const button = Array.from(document.querySelectorAll("button")).find(
      (item) => item.textContent?.trim() === "Sign in",
    );
    return Boolean(button && !button.disabled);
  });
  await page.getByLabel("Password").fill("correct-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.waitForTimeout(500);
  await page.getByTestId("protected-admin").waitFor();
  assert.equal(await page.getByTestId("identity").textContent(), "admin@example.test");
  assert.equal(await page.getByTestId("auth-status").textContent(), "authenticated");
  console.log("PASS: valid credentials and active admin grant protected access");

  await page.getByTestId("sign-out").click();
  await page.getByRole("heading", { name: "Admin Sign In" }).waitFor();
  assert.equal(await page.getByTestId("protected-admin").count(), 0);
  console.log("PASS: sign-out removes protected access");

  await openScenario("authenticated");
  await page.waitForTimeout(500);
  await page.getByTestId("protected-admin").waitFor();
  assert.equal(await page.getByTestId("identity").textContent(), "admin@example.test");
  console.log("PASS: existing active-admin session is restored");

  await openScenario("loading");
  await page.getByText("Restoring admin session...").waitFor();
  assert.equal(await page.getByTestId("protected-admin").count(), 0);
  await page.getByTestId("protected-admin").waitFor();
  console.log("PASS: protected content remains hidden during session restoration");

  await openScenario("forbidden");
  await page.getByRole("heading", { name: "Access denied" }).waitFor();
  assert.equal(await page.getByTestId("auth-status").textContent(), "forbidden");
  assert.equal(await page.getByTestId("protected-admin").count(), 0);
  await page.getByRole("button", { name: "Sign out" }).click();
  await page.getByRole("heading", { name: "Admin Sign In" }).waitFor();
  console.log("PASS: inactive admin session is denied and can sign out");

  await openScenario("unauthenticated");
  await page.getByRole("heading", { name: "Admin Sign In" }).waitFor();
  await page.getByLabel("Email").fill("admin@example.test");
  await page.waitForFunction(() => {
    const button = Array.from(document.querySelectorAll("button")).find(
      (item) => item.textContent?.trim() === "Sign in",
    );
    return Boolean(button && !button.disabled);
  });
  await page.getByLabel("Password").fill("correct-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.getByRole("heading", { name: "Protected Admin Content" }).waitFor();
  console.log("PASS: active admin can sign in after a fresh authentication");

  await openScenario("authorization-error");
  await page.getByText("Unable to verify administrator access. Please try again later.").waitFor();
  assert.equal(await page.getByTestId("auth-status").textContent(), "error");
  assert.equal(await page.getByTestId("protected-admin").count(), 0);
  console.log("PASS: authorization verification errors fail closed");

  await openScenario("restore-error");
  await page.getByText("Unable to verify administrator access. Please try again later.").waitFor();
  assert.equal(await page.getByTestId("protected-admin").count(), 0);
  console.log("PASS: session restoration errors fail closed");

  await openScenario("subscription-error");
  await page.getByText("Unable to verify administrator access. Please try again later.").waitFor();
  assert.equal(await page.getByTestId("auth-status").textContent(), "error");
  assert.equal(await page.getByTestId("protected-admin").count(), 0);
  console.log("PASS: subscription registration errors fail closed");

  await openScenario("unauthenticated");
  await page.getByRole("heading", { name: "Admin Sign In" }).waitFor();
  await page.getByTestId("emit-session").click();
  await page.getByTestId("protected-admin").waitFor();
  await page.getByTestId("emit-null").click();
  await page.getByRole("heading", { name: "Admin Sign In" }).waitFor();
  console.log("PASS: auth change events update protected access");

  await openScenario("authorization-race");
  await page.getByRole("heading", { name: "Admin Sign In" }).waitFor();
  await page.getByTestId("emit-session").click();
  await page.getByTestId("emit-null").click();
  await page.getByRole("heading", { name: "Admin Sign In" }).waitFor();
  await page.getByTestId("resolve-authorization").click();
  await page.waitForTimeout(100);
  assert.equal(await page.getByTestId("auth-status").textContent(), "unauthenticated");
  assert.equal(await page.getByTestId("protected-admin").count(), 0);
  console.log("PASS: stale authorization response cannot restore access after sign-out");
  assert.deepEqual(errors, [], "Browser runtime errors detected");
  console.log("PASS: no browser runtime errors");
} finally {
  if (browser) await browser.close();
  await server.close();
}
