/* ── Supabase config ──────────────────────────────────────────── */
const SUPABASE_URL      = "https://npighgicwmefjzewzmit.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_WnSKpTKGde0qEa__Hid9ew_JhDBolMu";

// Temporary: replace with your Supabase user ID from
// https://supabase.com/dashboard → Authentication → Users → copy your user's ID
const HARDCODED_USER_ID = "064c04ce-08eb-4e7c-8f98-7163b68891a6";

/* ── DOM refs ─────────────────────────────────────────────────── */
const formView      = document.getElementById("form-view");
const successView   = document.getElementById("success-view");
const companyInput  = document.getElementById("company");
const roleInput     = document.getElementById("role");
const urlDisplay    = document.getElementById("url-display");
const saveBtn       = document.getElementById("save-btn");
const resetBtn      = document.getElementById("reset-btn");
const pageError     = document.getElementById("page-error");
const successCompEl = document.getElementById("success-company");

let currentUrl = "";

/* ── URL normalisation ────────────────────────────────────────── */
function normalizeJobLink(url) {
  if (!url) return url;
  // LinkedIn: always store as /jobs/view/{id}/
  const pathMatch = url.match(/\/jobs\/view\/(\d+)/);
  if (pathMatch) return `https://www.linkedin.com/jobs/view/${pathMatch[1]}/`;
  try {
    const jobId = new URLSearchParams(new URL(url).search).get("currentJobId");
    if (jobId) return `https://www.linkedin.com/jobs/view/${jobId}/`;
  } catch (_) {}
  return url;
}

/* ── Init ─────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", async () => {
  await loadTabInfo();
});

async function loadTabInfo() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.url) {
      showPageError("Couldn't read this page. Try refreshing.");
      return;
    }

    if (!tab.url.startsWith("http://") && !tab.url.startsWith("https://")) {
      showPageError("Navigate to a job posting to save it.");
      return;
    }

    currentUrl = normalizeJobLink(tab.url);

    const url = new URL(tab.url);
    let company = extractCompany(url.hostname);
    let role    = cleanTitle(tab.title || "");

    if (url.hostname.includes("linkedin.com") && url.pathname.includes("/jobs/")) {
      try {
        const [result] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: extractLinkedInJobInfo,
        });
        if (result?.result?.company) company = result.result.company;
        if (result?.result?.role)    role    = result.result.role;
      } catch (_) { /* fall through to domain/title defaults */ }
    }

    companyInput.value = company;
    roleInput.value    = role;

    urlDisplay.textContent = truncate(tab.url, 44);
    urlDisplay.title       = tab.url;

  } catch (err) {
    showPageError("Couldn't read this page. Try refreshing.");
  }
}

// Injected into the LinkedIn tab via chrome.scripting.executeScript —
// must be fully self-contained (no references to outer scope).
function extractLinkedInJobInfo() {
  /* ── Helpers ────────────────────────────────────────────────── */
  const SKIP_LINES = [
    "linkedin", "show more", "show less", "see more", "see all", "see all jobs",
    "save", "saved", "unsave", "follow", "connect", "message",
    "apply", "easy apply", "apply now", "applied",
    "promoted", "verified", "promoted by hirer",
    "responses managed off linkedin",
    "be an early applicant", "actively recruiting",
    "remote", "hybrid", "on-site", "on site",
    "full-time", "part-time", "contract", "internship", "temporary",
    "viewed", "unknown company",
  ];

  function isCardLineGood(line) {
    if (!line || line.length < 2 || line.length > 120) return false;
    const lower = line.toLowerCase();
    if (SKIP_LINES.includes(lower)) return false;
    if (line.includes("·")) return false;
    if (/^\d+\s+(connection|school|alumni|people)/i.test(line)) return false;
    if (/^\d+\s+(day|week|month|hour|minute)/i.test(line)) return false;
    if (/^\d[\d,+\-]*\s*employees?/i.test(line)) return false;
    if (/^[A-Z][a-zA-Z\s\-]+,\s*[A-Z]{2}/i.test(line)) return false;
    if (/^(united states|canada|united kingdom|australia|india|germany|france)$/i.test(line)) return false;
    return true;
  }

  function cleanText(raw) {
    if (!raw) return null;
    const seg = raw
      .split(/[\n\r·•|]/)[0]
      .replace(/[\d,.]+[KMBkmb]?\s*followers?/gi, "")
      .replace(/\s+/g, " ")
      .trim();
    return seg || null;
  }

  function isGoodCompany(text) {
    if (!text || text.length < 2 || text.length > 100) return false;
    if (SKIP_LINES.includes(text.toLowerCase())) return false;
    if (/^[A-Z][a-zA-Z\s\-]+,\s*[A-Z]{2}/i.test(text)) return false;
    if (/^(united states|canada|united kingdom|australia|india|germany|france|remote|hybrid)$/i.test(text)) return false;
    return true;
  }

  /* ── Tier 1: selected job card (currentJobId → aria → style) ── */
  function findSelectedCard() {
    const jobId = new URLSearchParams(location.search).get("currentJobId");
    if (jobId) {
      const anchor =
        document.querySelector(`[data-job-id="${jobId}"]`)            ||
        document.querySelector(`[data-occludable-job-id="${jobId}"]`) ||
        document.querySelector(`a[href*="/jobs/view/${jobId}"]`)      ||
        document.querySelector(`a[href*="currentJobId=${jobId}"]`);
      if (anchor) {
        const card = anchor.closest("li") || anchor.parentElement;
        if (card && card.innerText.trim().length > 10) return card;
      }
    }
    const sel = document.querySelector('[aria-selected="true"]');
    if (sel) {
      let node = sel;
      for (let i = 0; i < 6; i++) {
        if (node.innerText && node.innerText.trim().split("\n").filter(Boolean).length >= 2)
          return node;
        node = node.parentElement;
        if (!node) break;
      }
    }
    const lis = document.querySelectorAll("li[data-occludable-job-id], li[data-job-id]");
    for (const li of lis) {
      const bg = getComputedStyle(li).backgroundColor;
      if (bg && !/rgba?\(0,\s*0,\s*0,\s*0\)|^transparent$/.test(bg)) return li;
    }
    return null;
  }

  let cardRole = null, cardCompany = null;
  const card = findSelectedCard();
  if (card) {
    const rawLines = (card.innerText || "").split("\n");
    console.log(`[ApplyIQ popup] selected card raw lines: ${JSON.stringify(rawLines.slice(0, 12))}`);
    const allLines = rawLines
      .map(l => l.replace(/[\d,.]+[KMBkmb]?\s*followers?/gi, "").replace(/\s+/g, " ").trim())
      .filter(l => l.length > 1)
      .filter((l, i, arr) => i === 0 || l !== arr[i - 1]);
    // Role = first line (no noise filter — titles like "X Intern - Onsite in Dallas, TX" are valid)
    cardRole    = allLines[0] || null;
    // Company = first subsequent line that passes the noise filter
    cardCompany = allLines.slice(1).find(isCardLineGood) || null;
    console.log(`[ApplyIQ popup] selected card role: "${cardRole}" company: "${cardCompany}"`);
  } else {
    console.log("[ApplyIQ popup] no selected card found");
  }

  /* ── Right panel: viewport-position-based detection ─────────── */
  const isSearchPage = location.pathname.includes("/jobs/search") ||
                       new URLSearchParams(location.search).has("currentJobId");
  const minX = isSearchPage ? window.innerWidth * 0.38 : 0;

  // Role: topmost visible heading in right area
  const headings = [...document.querySelectorAll('h1, h2, h3, [role="heading"]')]
    .filter(el => {
      const r = el.getBoundingClientRect();
      const t = el.textContent.trim();
      return r.width > 0 && r.height > 0 && r.left >= minX && t.length > 3;
    })
    .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);

  const titleEl   = headings[0] || null;
  const panelRole = titleEl?.textContent?.trim() || null;
  console.log(`[ApplyIQ popup] right panel role: "${panelRole}"`);

  function isValidRole(r) {
    if (!r || r.length < 2) return false;
    return !/match|profile|help|recommend|people you can|reach out/i.test(r);
  }
  const role = (isValidRole(cardRole)    ? cardRole    : null) ||
               (isValidRole(panelRole)   ? panelRole   : null) ||
               cardRole || null;
  console.log(`[ApplyIQ popup] role chosen: "${role}"`);

  // Company: topmost visible /company/ link in right area
  let company = cardCompany || null;
  if (!company) {
    const compLinks = [...document.querySelectorAll('a[href*="/company/"]')]
      .filter(a => {
        const r = a.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.left >= minX;
      })
      .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);

    console.log(`[ApplyIQ popup] right panel /company/ links: ${compLinks.length}`);
    for (const a of compLinks) {
      const txt = cleanText(a.textContent);
      console.log(`[ApplyIQ popup] /company/ link: "${txt}" | good: ${isGoodCompany(txt)}`);
      if (isGoodCompany(txt)) {
        company = txt;
        console.log(`[ApplyIQ popup] company SELECTED from /company/ link: "${company}"`);
        break;
      }
    }
  }

  // Fallback: leaf text elements directly above the title
  if (!company && titleEl) {
    const titleRect = titleEl.getBoundingClientRect();
    const aboveEls  = [...document.querySelectorAll("span, a, strong")]
      .filter(el => {
        if (el.children.length > 0) return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.left >= minX &&
               r.bottom <= titleRect.top + 4 && r.bottom > titleRect.top - 80 &&
               el.textContent.trim().length > 1;
      })
      .sort((a, b) => {
        const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
        return (titleRect.top - ra.bottom) - (titleRect.top - rb.bottom);
      });
    for (const el of aboveEls) {
      const txt = cleanText(el.textContent);
      if (isGoodCompany(txt)) {
        company = txt;
        console.log(`[ApplyIQ popup] company SELECTED from above title: "${company}"`);
        break;
      }
    }
  }

  console.log(`[ApplyIQ popup] FINAL: company="${company}" role="${role}"`);
  return { role, company: company ?? null };
}

/* ── Save → Supabase ──────────────────────────────────────────── */
saveBtn.addEventListener("click", async () => {
  if (!currentUrl) return;

  const company = companyInput.value.trim() || "Unknown Company";
  const role    = roleInput.value.trim()    || "Job Opening";

  setSaving(true);
  pageError.classList.add("hidden");

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/applications`, {
      method: "POST",
      headers: {
        "apikey":        SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type":  "application/json",
        "Prefer":        "return=minimal",
      },
      body: JSON.stringify({
        user_id:      HARDCODED_USER_ID,
        company,
        role,
        job_link:     currentUrl,
        status:       "Interested",
        date_applied: todayISO(),
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      let reason = `Error ${response.status}`;
      try {
        const parsed = JSON.parse(body);
        reason = parsed.message || parsed.error || reason;
      } catch { /* not JSON, use status */ }
      throw new Error(reason);
    }

    showSuccess(company);

  } catch (err) {
    showSaveError(err.message || "Failed to save. Check your connection.");
  }
});

/* ── Reset (save another) ─────────────────────────────────────── */
resetBtn.addEventListener("click", () => {
  successView.classList.add("hidden");
  formView.classList.remove("hidden");
  pageError.classList.add("hidden");
  setSaving(false);
  loadTabInfo();
});

/* ── UI helpers ───────────────────────────────────────────────── */
function setSaving(on) {
  saveBtn.disabled = on;
  saveBtn.innerHTML = on
    ? "Saving…"
    : `<svg width="14" height="14" viewBox="0 0 14 14" fill="none">
         <path d="M2 7.5l3 3 7-7" stroke="white" stroke-width="1.8"
               stroke-linecap="round" stroke-linejoin="round"/>
       </svg>
       Save to ApplyIQ`;
}

// Fatal page error — disables form entirely (bad URL, chrome:// page, etc.)
function showPageError(msg) {
  pageError.textContent = msg;
  pageError.classList.remove("hidden");
  saveBtn.disabled      = true;
  companyInput.disabled = true;
  roleInput.disabled    = true;
}

// Recoverable save error — keeps form open so user can retry
function showSaveError(msg) {
  pageError.textContent = `Save failed: ${msg}`;
  pageError.classList.remove("hidden");
  setSaving(false);
}

function showSuccess(company) {
  formView.classList.add("hidden");
  successCompEl.textContent = company;
  successView.classList.remove("hidden");
}

/* ── Extraction helpers ───────────────────────────────────────── */

// jobs.stripe.com → Stripe
function extractCompany(hostname) {
  const clean = hostname.replace(/^www\./, "");
  const parts = clean.split(".");
  const root  = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
  return capitalize(root);
}

// "Senior Engineer | Stripe Careers" → "Senior Engineer"
function cleanTitle(title) {
  return title
    .replace(/\s*[|\-–—]\s*(.*careers|.*jobs|.*hiring|.*greenhouse|.*lever|.*workday|.*linkedin|.*indeed).*$/i, "")
    .replace(/\s*[|\-–—]\s*\S+$/i, "")
    .trim() || title;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function truncate(str, max) {
  return str.length > max ? str.slice(0, max) + "…" : str;
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}
