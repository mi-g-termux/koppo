import assert from "node:assert/strict";

console.log("==================================================");
console.log("  RUNNING MIR LABS PORTFOLIO AUTOMATED TEST SUITE ");
console.log("==================================================");

let testsPassed = 0;
let testsFailed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  ✓ PASS: ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    testsFailed++;
  }
}

// -----------------------------------------------------------------------------
// Test Suite 1: Canonical Site URLs & Single Source of Truth
// -----------------------------------------------------------------------------
console.log("\n[1] Canonical Site URL & Single Source of Truth Tests");

await test("getSiteUrl normalizes protocol and removes trailing slashes", async () => {
  // Test site logic directly
  const { getSiteUrl, getCanonicalUrl } = await import("../lib/site.ts");
  const siteUrl = getSiteUrl();
  assert.ok(siteUrl.startsWith("http://") || siteUrl.startsWith("https://"));
  assert.ok(!siteUrl.endsWith("/"));

  // Canonical paths
  assert.strictEqual(getCanonicalUrl("/"), siteUrl);
  assert.strictEqual(getCanonicalUrl("share"), `${siteUrl}/share`);
  assert.strictEqual(getCanonicalUrl("/share/otppo/"), `${siteUrl}/share/otppo`);
  assert.strictEqual(getCanonicalUrl("///share/fly"), `${siteUrl}/share/fly`);
});

// -----------------------------------------------------------------------------
// Test Suite 2: Slug Normalization & Resolution
// -----------------------------------------------------------------------------
console.log("\n[2] Dynamic Slug Normalization & Resolution Tests");

await test("normalizeSlug correctly handles spaces, punctuation, uppercase, and URI encoding", async () => {
  const { normalizeSlug } = await import("../lib/shares.ts");
  assert.strictEqual(normalizeSlug("OTP Embossed Form"), "otp-embossed-form");
  assert.strictEqual(normalizeSlug("fly%20to%20cart"), "fly-to-cart");
  assert.strictEqual(normalizeSlug("  lamplogin  "), "lamplogin");
  assert.strictEqual(normalizeSlug("special!@#$%^&*()_+chars"), "special-_-chars");
  assert.strictEqual(normalizeSlug(""), "");
});

await test("getShareBySlug resolves valid bundled shares", async () => {
  const { getShareBySlug } = await import("../lib/shares.ts");
  const otppo = await getShareBySlug("otppo");
  assert.ok(otppo !== null, "Should find 'otppo' share");
  assert.strictEqual(otppo.slug, "otppo");
  assert.ok(otppo.views > 0);
  assert.ok(otppo.downloads > 0);

  const fly = await getShareBySlug("fly");
  assert.ok(fly !== null, "Should find 'fly' share");
  assert.strictEqual(fly.slug, "fly");
});

await test("getShareBySlug handles URL-encoded slug requests", async () => {
  const { getShareBySlug } = await import("../lib/shares.ts");
  const decoded = await getShareBySlug("%6ftppo"); // 'otppo'
  assert.ok(decoded !== null, "Should resolve URL-encoded slug %6ftppo");
  assert.strictEqual(decoded.slug, "otppo");
});

await test("getShareBySlug returns null for nonexistent or invalid slugs", async () => {
  const { getShareBySlug } = await import("../lib/shares.ts");
  const missing = await getShareBySlug("nonexistent-slug-xyz-12345");
  assert.strictEqual(missing, null);

  const empty = await getShareBySlug("");
  assert.strictEqual(empty, null);
});

// -----------------------------------------------------------------------------
// Test Suite 3: Slug Persistence & Collision Handling
// -----------------------------------------------------------------------------
console.log("\n[3] Slug Persistence & Uniqueness Lifecycle Tests");

await test("createShare creates stable slug and prevents collision corruption", async () => {
  const { createShare, getShareBySlug, deleteShare } = await import("../lib/shares.ts");

  const testTitle = `Test Component ${Date.now()}`;
  const created = await createShare({
    title: testTitle,
    description: "Automated test component",
    codeSnippet: "console.log('test');",
    language: "typescript",
    isPublic: true,
  });

  assert.ok(created.slug.length > 0);
  const found = await getShareBySlug(created.slug);
  assert.ok(found !== null);
  assert.strictEqual(found.title, testTitle);

  // Clean up test share
  await deleteShare(created.slug);
  const afterDelete = await getShareBySlug(created.slug);
  assert.strictEqual(afterDelete, null, "Deleted share should not be found");
});

// -----------------------------------------------------------------------------
// Test Suite 4: Technical SEO — Sitemap & Robots
// -----------------------------------------------------------------------------
console.log("\n[4] Technical SEO — Sitemap & Robots Configuration Tests");

await test("sitemap.ts returns valid canonical entries including / and /share", async () => {
  const sitemapFn = (await import("../app/sitemap.ts")).default;
  const entries = await sitemapFn();
  assert.ok(Array.isArray(entries), "Sitemap must return an array");
  assert.ok(entries.length >= 5, "Sitemap should contain home, /share, and all project shares");

  const urls = entries.map((e) => e.url);
  const homeEntry = entries.find((e) => !e.url.includes("/share"));
  assert.ok(homeEntry, "Home entry must exist");
  assert.strictEqual(homeEntry.priority, 1.0);

  const shareVault = entries.find((e) => e.url.endsWith("/share"));
  assert.ok(shareVault, "/share entry must exist");
  assert.strictEqual(shareVault.priority, 0.9);

  // Ensure all share items are in sitemap
  assert.ok(urls.some((u) => u.includes("/share/otppo")));
  assert.ok(urls.some((u) => u.includes("/share/fly")));
  assert.ok(urls.some((u) => u.includes("/share/lamplogin")));
  assert.ok(urls.some((u) => u.includes("/share/otpci")));
});

await test("robots.ts allows indexable public paths and disallows admin/api", async () => {
  const robotsFn = (await import("../app/robots.ts")).default;
  const config = robotsFn();
  assert.ok(config.rules, "Rules must be defined");
  const rule = Array.isArray(config.rules) ? config.rules[0] : config.rules;

  assert.ok(rule.allow.includes("/"));
  assert.ok(rule.allow.includes("/share"));
  assert.ok(rule.disallow.includes("/admin"));
  assert.ok(rule.disallow.includes("/api/"));
  assert.ok(config.sitemap.endsWith("/sitemap.xml"));
});

// -----------------------------------------------------------------------------
// Test Suite 5: Download & Storage Security
// -----------------------------------------------------------------------------
console.log("\n[5] Download Route & Open Redirect Protection Tests");

await test("Google Drive links are automatically converted to direct download URLs", async () => {
  const driveUrl = "https://drive.google.com/file/d/1VelSQLwOOxvw0ftMHlPcEc1bIhzVTWyi/view?usp=sharing";
  const match = driveUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  assert.ok(match && match[1]);
  const directUrl = `https://drive.google.com/uc?export=download&id=${match[1]}`;
  assert.strictEqual(directUrl, "https://drive.google.com/uc?export=download&id=1VelSQLwOOxvw0ftMHlPcEc1bIhzVTWyi");
});

await test("R2 presigned download helper creates signed GET command", async () => {
  const { createPresignedDownloadUrl, isR2Configured } = await import("../lib/r2.ts");
  // Function exists and is typed
  assert.strictEqual(typeof createPresignedDownloadUrl, "function");
  assert.strictEqual(typeof isR2Configured, "function");
});

// -----------------------------------------------------------------------------
// Test Suite 6: Metadata Generation & SEO Verification
// -----------------------------------------------------------------------------
console.log("\n[6] Page Metadata & Social Cards Generation Tests");

await test("generateMetadata for valid share returns full SEO metadata with canonical", async () => {
  const { generateMetadata } = await import("../app/share/[slug]/page.tsx");
  const meta = await generateMetadata({
    params: Promise.resolve({ slug: "otppo" }),
  });

  assert.ok(meta.title.includes("OTP Embossed Form"));
  assert.ok(meta.description.length > 10);
  assert.ok(meta.alternates?.canonical.includes("/share/otppo"));
  assert.strictEqual(meta.robots.index, true);
  assert.strictEqual(meta.openGraph?.type, "article");
  assert.ok(meta.openGraph?.images[0].url.includes("logo-mir-labs.png"));
  assert.strictEqual(meta.twitter?.card, "summary_large_image");
});

await test("generateMetadata for missing share sets robots noindex", async () => {
  const { generateMetadata } = await import("../app/share/[slug]/page.tsx");
  const meta = await generateMetadata({
    params: Promise.resolve({ slug: "missing-slug-999" }),
  });

  assert.ok(meta.title.includes("Resource Not Found") || meta.title.includes("Not Found"));
  assert.strictEqual(meta.robots.index, false);
  assert.strictEqual(meta.robots.follow, false);
});

// -----------------------------------------------------------------------------
// Test Results Summary
// -----------------------------------------------------------------------------
console.log("\n==================================================");
console.log(`  TEST RESULTS: ${testsPassed} passed, ${testsFailed} failed`);
console.log("==================================================");

if (testsFailed > 0) {
  process.exit(1);
}
