// Visual check of every page and key flow with Playwright.
// Usage: pnpm build && pnpm start -p 3146   (in another terminal)
//        pnpm screenshots                   (BASE_URL defaults to http://localhost:3146)
// Output: docs/screenshots/<locale>-<width>-<theme>-<name>.png
// ONLY=<substring> limits the run to matching variants (e.g. ONLY=en-390-light).
import { mkdir } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const BASE = process.env.BASE_URL ?? "http://localhost:3146"
const OUT = fileURLToPath(new URL("../docs/screenshots/", import.meta.url))
const ONLY = process.env.ONLY

const viewports = { 390: { width: 390, height: 844 }, 1440: { width: 1440, height: 900 } }
const variants = []
for (const w of [390, 1440]) for (const theme of ["light", "dark"]) variants.push({ locale: "en", w, theme })
for (const w of [390, 1440]) variants.push({ locale: "fr", w, theme: "light" })

const isMobile = (v) => v.w < 768
const KEY = "bazarius-demo-v1"

async function newPage(browser, v) {
  const context = await browser.newContext({
    viewport: viewports[v.w],
    colorScheme: v.theme,
    locale: v.locale === "fr" ? "fr-CA" : "en-CA",
    timezoneId: "America/Toronto",
    reducedMotion: "no-preference",
  })
  await context.addInitScript((t) => {
    try {
      window.localStorage.setItem("theme", t)
    } catch {}
  }, v.theme)
  const page = await context.newPage()
  page.on("pageerror", (e) => console.log("  pageerror:", e.message))
  return { context, page }
}

const shot = async (page, v, name, fullPage = false) => {
  await page.waitForTimeout(450)
  // Chromium doesn't advance animations of off-screen elements; a full-page
  // capture would catch them at their first frame. Finish one-shot
  // animations there (the home hero loop stays live, it's on screen).
  const animations = fullPage && !name.includes("home") ? "disabled" : "allow"
  await page.screenshot({ path: `${OUT}${v.locale}-${v.w}-${v.theme}-${name}.png`, fullPage, animations })
  console.log("  ✓", `${v.locale}-${v.w}-${v.theme}-${name}`)
}

const go = async (page, v, path) => {
  await page.goto(`${BASE}/${v.locale}${path}`, { waitUntil: "networkidle" })
  await page.waitForTimeout(300)
}

const T = {
  en: {
    confirm: "Confirm",
    reject: "Reject",
    pay: /^Pay \d/,
    connectToPay: "Connect your wallet to pay",
    receipt: "Paid. Take your basket",
    items: /items?/,
    controls: "Demo controls",
  },
  fr: {
    confirm: "Confirmer",
    reject: "Refuser",
    pay: /^Payer \d/,
    connectToPay: "Connectez votre portefeuille pour payer",
    receipt: "Payé. Servez-vous",
    items: /articles?/,
    controls: "Réglages de la démo",
  },
}

async function setState(page, fn) {
  await page.evaluate(
    ([key, src]) => {
      const s = JSON.parse(localStorage.getItem(key))
      new Function("s", src)(s)
      localStorage.setItem(key, JSON.stringify(s))
    },
    [KEY, fn]
  )
  await page.reload({ waitUntil: "networkidle" })
  await page.waitForTimeout(300)
}

/** Open the checkout (desktop: already in the aside; phones: via the basket bar). */
async function openCheckout(page, v) {
  if (!isMobile(v)) return page.getByRole("complementary").first()
  await page.getByRole("button", { name: T[v.locale].items }).last().click()
  const sheet = page.getByRole("dialog").last()
  await sheet.waitFor()
  return sheet
}

async function confirmPrompt(page, v, name) {
  const d = page.getByRole("dialog", { name })
  await d.waitFor()
  await d.getByRole("button", { name: T[v.locale].confirm, exact: true }).click()
}

async function toggleControl(page, v, label) {
  await page.getByRole("button", { name: T[v.locale].controls }).click()
  await page.getByLabel(label).click()
  await page.keyboard.press("Escape")
  await page.waitForTimeout(200)
}

async function marketing(page, v) {
  for (const [name, path] of [
    ["home", ""],
    ["how-it-works", "/how-it-works"],
    ["credits", "/credits"],
    ["pricing", "/pricing"],
    ["404", "/this-page-does-not-exist"],
  ]) {
    await go(page, v, path)
    await page.waitForTimeout(500)
    await shot(page, v, `page-${name}`, true)
  }
  if (isMobile(v)) {
    await go(page, v, "")
    await page.getByRole("button", { name: "Open menu" }).click()
    await page.getByRole("dialog").waitFor()
    await shot(page, v, "page-mobile-menu")
  }
}

async function flow1(page, v) {
  // Scan screen
  await go(page, v, "/app")
  await page.getByText("Ferme des Trois Érables").first().waitFor()
  await shot(page, v, "flow1-01-scan", true)
  await page.getByRole("button", { name: /Ferme des Trois Érables/ }).click()
  await page.waitForTimeout(500)
  await shot(page, v, "flow1-02-scanning")
  await page.waitForURL(/\/app\/stand\/trois-erables/)
  await page.getByRole("heading", { level: 1, name: "Ferme des Trois Érables" }).waitFor()
  await page.waitForTimeout(400)
  await shot(page, v, "flow1-03-shelf", true)

  // Fill the basket: 2 tomatoes, 1 dozen eggs
  await page.getByRole("button", { name: "Add Heirloom tomatoes to basket" }).click()
  await page.getByRole("button", { name: "Add one more Heirloom tomatoes" }).click()
  await page.getByRole("button", { name: "Add Free-range eggs to basket" }).click()
  await shot(page, v, "flow1-04-basket")

  // Connect first (rejected once), then pay
  let box = await openCheckout(page, v)
  if (isMobile(v)) await shot(page, v, "flow1-05-checkout-sheet")
  await box.getByRole("button", { name: T.en.connectToPay }).click()
  const signIn = page.getByRole("dialog", { name: "Sign in to Bazarius" })
  await signIn.waitFor()
  await shot(page, v, "flow1-06-connect-prompt")
  await signIn.getByRole("button", { name: "Reject" }).click()
  await page.getByText("You declined the sign-in").first().waitFor()
  await shot(page, v, "flow1-07-connect-rejected")
  await box.getByRole("button", { name: T.en.connectToPay }).click()
  await confirmPrompt(page, v, "Sign in to Bazarius")
  const payDialog = page.getByRole("dialog", { name: /^Pay / })
  await payDialog.waitFor({ timeout: 10000 })
  await shot(page, v, "flow1-08-pay-prompt")
  await payDialog.getByRole("button", { name: "Reject" }).click()
  await page.getByText("You declined in the wallet").first().waitFor()
  await shot(page, v, "flow1-09-pay-rejected")
  await box.getByRole("button", { name: T.en.pay }).click()
  await confirmPrompt(page, v, /^Pay /)
  await page.getByText("Waiting for the network…").first().waitFor()
  await shot(page, v, "flow1-10-pending")
  await page.getByText(T.en.receipt).first().waitFor({ timeout: 15000 })
  await page.waitForTimeout(700)
  await shot(page, v, "flow1-11-paid")
  if (!isMobile(v)) await shot(page, v, "flow1-11-paid-full", true)
  if (isMobile(v)) {
    await page.keyboard.press("Escape")
    await page.waitForTimeout(300)
    await page.getByRole("heading", { name: "Meanwhile at the farm" }).scrollIntoViewIfNeeded()
    await shot(page, v, "flow1-12-farm-rail")
  }

  // Failure: another shopper takes the last garlic braid first
  await go(page, v, "/app/stand/trois-erables")
  await page.getByRole("button", { name: "Add Garlic braid to basket" }).click()
  await toggleControl(page, v, "Another shopper buys first")
  box = await openCheckout(page, v)
  await box.getByRole("button", { name: T.en.pay }).click()
  await confirmPrompt(page, v, /^Pay /)
  await page.getByText("Someone just bought the last of it").first().waitFor({ timeout: 15000 })
  await page.waitForTimeout(400)
  await shot(page, v, "flow1-13-failed-stock")
  if (isMobile(v)) await page.keyboard.press("Escape")

  // Insufficient funds, caught before signing
  await setState(page, "s.balances.shopper = 420")
  await page.getByRole("button", { name: "Add Maple syrup to basket" }).click()
  box = await openCheckout(page, v)
  await box.getByText("Your wallet has").waitFor()
  await shot(page, v, "flow1-14-insufficient-funds")
  await box.getByRole("button", { name: /Get 25\.00 test tUSDC/ }).click()
  await confirmPrompt(page, v, "Get test tUSDC")
  await page.getByText("Added 25.00 tUSDC to your wallet.").waitFor({ timeout: 15000 })
  await page.waitForTimeout(400)
  await shot(page, v, "flow1-15-topped-up")
  if (isMobile(v)) await page.keyboard.press("Escape")
}

async function flow2(page, v) {
  await go(page, v, "/app/receipts")
  await page.getByRole("heading", { name: "Stamp cards", exact: true }).waitFor()
  await shot(page, v, "flow2-01-receipts", true)
  await page.getByRole("button", { name: /Ferme des Trois Érables/ }).first().click()
  await page.getByRole("button", { name: "Check against the stand ledger" }).click()
  await page.getByText("Matches the stand's ledger").waitFor()
  await shot(page, v, "flow2-02-receipt-verified", true)
  await page.getByLabel("Transaction hash").fill("0x1234")
  await page.getByRole("button", { name: "Check", exact: true }).click()
  await page.getByText("Not a transaction hash").waitFor()
  await page.getByLabel("Transaction hash").fill(`0x${"ab".repeat(32)}`)
  await page.getByRole("button", { name: "Check", exact: true }).click()
  await page.getByText("Not found on any stand ledger").waitFor()
  await page.getByLabel("Transaction hash").scrollIntoViewIfNeeded()
  await shot(page, v, "flow2-03-verify-not-found")

  // Redeem the stamp-card reward on the next basket
  await go(page, v, "/app/stand/trois-erables")
  await page.getByRole("button", { name: "Add Sweet corn to basket" }).click()
  const box = await openCheckout(page, v)
  await box.getByText("Use my 3.00 tUSDC reward").waitFor()
  await shot(page, v, "flow2-04-reward-in-basket")
  await box.getByRole("button", { name: T.en.pay }).click()
  await confirmPrompt(page, v, /^Pay /)
  await page.getByText(T.en.receipt).first().waitFor({ timeout: 15000 })
  await page.waitForTimeout(600)
  await shot(page, v, "flow2-05-reward-redeemed")
  if (isMobile(v)) await page.keyboard.press("Escape")
}

async function flow3(page, v) {
  await go(page, v, "/app/farm")
  await page.getByText("This wallet doesn't own a stand.").waitFor()
  await shot(page, v, "flow3-01-not-owner")
  await page.getByRole("button", { name: "Switch to Élise's farm wallet" }).click()
  await page.getByRole("heading", { level: 1, name: "Today at the stand" }).waitFor()
  await page.waitForTimeout(400)
  await shot(page, v, "flow3-02-dashboard", true)
  await page.getByRole("button", { name: "Restock" }).first().click()
  await page.getByLabel("Price of Sweet corn in tUSDC").fill("6.5")
  await page.getByLabel("Evening markdown for Heirloom tomatoes").selectOption("20")
  await page.getByLabel("Price of Maple syrup in tUSDC").fill("0")
  await page.getByText("Enter a price above 0").waitFor()
  await page.getByLabel("Price of Maple syrup in tUSDC").scrollIntoViewIfNeeded()
  await shot(page, v, "flow3-03-validation")
  await page.getByLabel("Price of Maple syrup in tUSDC").fill("12.00")
  await page.getByText("3 unpublished changes").scrollIntoViewIfNeeded()
  await shot(page, v, "flow3-04-draft")
  await toggleControl(page, v, "Fail the next transaction")
  await page.getByRole("button", { name: "Publish to the stand" }).click()
  await page.getByRole("dialog", { name: "Update the shelf" }).waitFor()
  await shot(page, v, "flow3-05-publish-prompt")
  await confirmPrompt(page, v, "Update the shelf")
  await page.getByText("The update didn't go through").waitFor({ timeout: 15000 })
  await page.getByText("The update didn't go through").scrollIntoViewIfNeeded()
  await shot(page, v, "flow3-06-publish-failed")
  await page.getByRole("button", { name: "Try again" }).click()
  await confirmPrompt(page, v, "Update the shelf")
  await page.getByText("Shelf updated. The stand shows").waitFor({ timeout: 15000 })
  await page.getByText("Shelf updated. The stand shows").scrollIntoViewIfNeeded()
  await shot(page, v, "flow3-07-published")

  // Evening: jump the stand clock and look at the shelf
  await page.getByRole("button", { name: T.en.controls }).click()
  await page.getByRole("dialog").waitFor()
  await shot(page, v, "app-demo-controls")
  await page.getByRole("button", { name: "Jump to 17:30" }).click()
  await page.keyboard.press("Escape")
  await go(page, v, "/app/stand/trois-erables")
  await page.getByText("Evening markdown on").waitFor()
  await shot(page, v, "flow3-08-evening-markdown", !isMobile(v))
}

async function flow4(page, v) {
  await go(page, v, "/app/farm/count")
  await page.getByRole("heading", { level: 1, name: "Close the day" }).waitFor()
  await shot(page, v, "flow4-01-count", true)
  const tomatoes = page.getByLabel("Counted Heirloom tomatoes")
  const expected = Number(await tomatoes.inputValue())
  await tomatoes.fill(String(Math.max(0, expected - 2)))
  await page.getByLabel("Counted Maple syrup").fill("6")
  await page.waitForTimeout(200)
  await shot(page, v, "flow4-02-variance", true)
  await page.getByRole("button", { name: "Record the count" }).click()
  await confirmPrompt(page, v, "Record the shelf count")
  await page.getByText("Count recorded.").waitFor({ timeout: 15000 })
  await page.getByRole("button", { name: /^Withdraw / }).click()
  await confirmPrompt(page, v, "Withdraw takings")
  await page.getByText("is in your farm wallet").waitFor({ timeout: 15000 })
  await page.waitForTimeout(500)
  await shot(page, v, "flow4-03-recorded-withdrawn", true)
  await go(page, v, "/app/farm")
  await page.getByRole("heading", { level: 1 }).waitFor()
  await shot(page, v, "flow4-04-dashboard-after", true)
}

async function frenchFlow(page, v) {
  await go(page, v, "")
  await page.waitForTimeout(500)
  await shot(page, v, "page-home", true)
  await go(page, v, "/app/stand/trois-erables")
  await page.getByRole("heading", { level: 1 }).waitFor()
  await page.getByRole("button", { name: "Ajouter Tomates ancestrales au panier" }).click()
  await page.getByRole("button", { name: "Ajouter Œufs de plein air au panier" }).click()
  await shot(page, v, "flow1-04-basket", true)
  const box = await openCheckout(page, v)
  await box.getByRole("button", { name: T.fr.connectToPay }).click()
  await confirmPrompt(page, v, "Se connecter à Bazarius")
  const payDialog = page.getByRole("dialog", { name: /^Payer / })
  await payDialog.waitFor({ timeout: 10000 })
  await shot(page, v, "flow1-08-pay-prompt")
  await payDialog.getByRole("button", { name: T.fr.confirm, exact: true }).click()
  await page.getByText(T.fr.receipt).first().waitFor({ timeout: 15000 })
  await page.waitForTimeout(700)
  await shot(page, v, "flow1-11-paid", !isMobile(v))
  if (isMobile(v)) await page.keyboard.press("Escape")
  await go(page, v, "/app/farm")
  await page.getByRole("button", { name: "Passer au portefeuille de la ferme d'Élise" }).click()
  await page.getByRole("heading", { level: 1 }).waitFor()
  await page.waitForTimeout(400)
  await shot(page, v, "flow3-02-dashboard", true)
}

const browser = await chromium.launch()
await mkdir(OUT, { recursive: true })
for (const v of variants) {
  const tag = `${v.locale}-${v.w}-${v.theme}`
  if (ONLY && !tag.includes(ONLY)) continue
  console.log(tag)
  const { context, page } = await newPage(browser, v)
  try {
    if (v.locale === "fr") await frenchFlow(page, v)
    else {
      await marketing(page, v)
      await flow1(page, v)
      await flow2(page, v)
      await flow3(page, v)
      await flow4(page, v)
    }
  } catch (e) {
    console.error("  ✗", tag, e.message)
    await page.screenshot({ path: `${OUT}_error-${tag}.png` }).catch(() => {})
    process.exitCode = 1
  }
  await context.close()
}
await browser.close()
