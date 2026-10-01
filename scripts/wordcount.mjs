// Word counts per page (English), for the simplification pass.
// Usage: pnpm build && pnpm start -p 3146   (in another terminal)
//        node scripts/wordcount.mjs          (BASE_URL defaults to http://localhost:3146)
// Prints a Markdown table:
//   visible = words in <main> a visitor can read without opening anything (innerText)
//   total   = every word in <main>, including closed disclosures, FAQ answers, tooltips' text nodes
//   chrome  = visible words outside <main> (header, app bar, footer)
import { chromium } from "playwright"

const BASE = process.env.BASE_URL ?? "http://localhost:3146"
const KEY = "bazarius-demo-v1"

async function measure(page) {
  return page.evaluate(() => {
    const main = document.querySelector("main")
    const words = (s) => (s.match(/[\p{L}\p{N}][\p{L}\p{N}'’.,-]*/gu) ?? []).length
    const all = []
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.parentElement?.closest("script,style,svg") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
    })
    while (walker.nextNode()) all.push(walker.currentNode.nodeValue)
    const visible = words(main.innerText)
    const total = words(all.join(" "))
    const chrome = words(document.body.innerText) - visible
    return { visible, total, chrome }
  })
}

const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "en-CA", timezoneId: "America/Toronto" })
const page = await context.newPage()
const rows = []

async function run(name, path) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" })
  await page.waitForTimeout(700)
  rows.push({ name, ...(await measure(page)) })
}

async function wallet(account) {
  await page.evaluate(
    ([key, account]) => {
      const s = JSON.parse(localStorage.getItem(key))
      s.wallet = { status: "connected", account, lastError: null }
      localStorage.setItem(key, JSON.stringify(s))
    },
    [KEY, account]
  )
}

for (const [name, path] of [
  ["Home", "/en"],
  ["How it works", "/en/how-it-works"],
  ["Credits", "/en/credits"],
  ["404", "/en/this-page-does-not-exist"],
]) await run(name, path)

await run("App: scan", "/en/app")
await run("App: grower gate (disconnected)", "/en/app/farm")
await wallet("shopper")
await run("App: stand shelf", "/en/app/stand/trois-erables")
await run("App: receipts", "/en/app/receipts")
await wallet("farmer")
await run("App: farm dashboard", "/en/app/farm")
await run("App: close the day", "/en/app/farm/count")

await browser.close()

const sum = (k) => rows.reduce((s, r) => s + r[k], 0)
console.log("| Page | Visible in main | Total in main (incl. collapsed) | Chrome (header, app bar, footer) |")
console.log("|-|-:|-:|-:|")
for (const r of rows) console.log(`| ${r.name} | ${r.visible} | ${r.total} | ${r.chrome} |`)
console.log(`| **Total** | **${sum("visible")}** | **${sum("total")}** | **${sum("chrome")}** |`)
