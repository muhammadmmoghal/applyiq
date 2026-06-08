/* ── Config ───────────────────────────────────────────────────── */
const SUPABASE_URL      = "https://npighgicwmefjzewzmit.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_WnSKpTKGde0qEa__Hid9ew_JhDBolMu";
// Supabase JS SDK v2 localStorage key (project-specific)
const SB_STORAGE_KEY    = "sb-npighgicwmefjzewzmit-auth-token";

const SESSION_KEYS = [
  "applyiq_access_token", "applyiq_user_id",      "applyiq_user_email",
  "applyiq_expires_at",   "applyiq_refresh_token", "applyiq_domain",
  "applyiq_synced_at",
];

/* ── DOM refs ─────────────────────────────────────────────────── */
const authDot       = document.getElementById("auth-dot");
const authLabel     = document.getElementById("auth-label");
const connectBtn    = document.getElementById("connect-btn");
const disconnectBtn = document.getElementById("disconnect-btn");
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

/* ── Storage helpers ──────────────────────────────────────────── */
function storageGet(keys) {
  return new Promise(r => chrome.storage.local.get(keys, r));
}

async function storeSession(session, domain) {
  const data = {
    applyiq_access_token: session.access_token,
    applyiq_user_id:      session.user_id,
    applyiq_user_email:   session.email,
    applyiq_expires_at:   session.expires_at,
    applyiq_domain:       domain,
    applyiq_synced_at:    Math.floor(Date.now() / 1000),
  };
  if (session.refresh_token) data.applyiq_refresh_token = session.refresh_token;
  await chrome.storage.local.set(data);
}

async function clearSession() {
  await chrome.storage.local.remove(SESSION_KEYS);
}

// Silently refreshes an expired access token using the stored refresh token.
// Stores the new session and returns it, or null if refresh fails.
async function refreshStoredSession() {
  const { applyiq_refresh_token: refreshToken, applyiq_domain: domain }
    = await storageGet(["applyiq_refresh_token", "applyiq_domain"]);
  if (!refreshToken) return null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
      {
        method:  "POST",
        headers: { apikey: SUPABASE_ANON_KEY, "Content-Type": "application/json" },
        body:    JSON.stringify({ refresh_token: refreshToken }),
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.access_token || !data.user?.id) return null;
    const refreshed = {
      access_token:  data.access_token,
      refresh_token: data.refresh_token || refreshToken,
      user_id:       data.user.id,
      email:         data.user.email || "",
      expires_at:    data.expires_at  || 0,
    };
    await storeSession(refreshed, domain);
    return {
      accessToken: refreshed.access_token,
      userId:      refreshed.user_id,
      email:       refreshed.email,
      domain,
      syncedAt:    Math.floor(Date.now() / 1000),
    };
  } catch { return null; }
}

// Returns the valid stored session, or null if absent/unrecoverable.
// Silently refreshes via refresh_token if the access token is near expiry.
async function getStoredSession() {
  const d = await storageGet(SESSION_KEYS);
  const {
    applyiq_access_token: accessToken,
    applyiq_user_id:      userId,
    applyiq_expires_at:   expiresAt,
    applyiq_user_email:   email,
    applyiq_domain:       domain,
    applyiq_synced_at:    syncedAt,
  } = d;
  if (!accessToken || !userId) return null;
  if (expiresAt && Math.floor(Date.now() / 1000) > expiresAt - 60) {
    return await refreshStoredSession();
  }
  return { accessToken, userId, email, domain, syncedAt };
}

/* ── Tab inspection ───────────────────────────────────────────── */
function getOrigin(url) {
  try { return new URL(url).origin; } catch { return null; }
}

// Injects into the given tab and reads the Supabase session from localStorage.
//
// Returns { keyExists: boolean|null, session: object|null }
//   keyExists = true  → page loaded, our Supabase key present (ApplyIQ app)
//   keyExists = false → page loaded, key absent (SDK removed it → signed out)
//   keyExists = null  → page still loading; SDK may not have initialised yet
//   session   = {...} → valid session object (only when keyExists=true)
//
// Supabase SDK v2 calls localStorage.removeItem() on signOut(), so a fully
// loaded page with no key is a reliable sign-out signal. A page that is still
// loading is not — the key may appear once the SDK initialises.
async function readSessionFromTab(tabId) {
  const [result] = await chrome.scripting.executeScript({
    target: { tabId },
    func: (key) => {
      try {
        // Page is still bootstrapping — SDK may not have written the key yet.
        if (document.readyState === "loading") return { keyExists: null, session: null };
        const raw = localStorage.getItem(key);
        if (raw === null) return { keyExists: false, session: null };
        const s = JSON.parse(raw);
        if (!s?.access_token || !s?.user?.id) return { keyExists: true, session: null };
        return {
          keyExists: true,
          session: {
            access_token:  s.access_token,
            refresh_token: s.refresh_token || null,
            user_id:       s.user.id,
            email:         s.user.email || "",
            expires_at:    s.expires_at  || 0,
          },
        };
      } catch { return { keyExists: null, session: null }; }
    },
    args: [SB_STORAGE_KEY],
  });
  return result?.result ?? { keyExists: null, session: null };
}

/* ── Auth UI ──────────────────────────────────────────────────── */
function setAuthUI(state, label) {
  // state: "checking" | "ok" | "disconnected"
  authDot.className = "auth-dot auth-dot--" + (
    state === "ok"   ? "ok"      :
    state === "checking" ? "unknown" : "error"
  );
  authLabel.textContent = label;

  const isOk = state === "ok";
  connectBtn.textContent = isOk ? "Reconnect" : "Connect";
  connectBtn.disabled    = false;
  disconnectBtn.classList.toggle("hidden", !isOk);
  saveBtn.disabled       = !isOk;
}

/* ── Auto-sync on popup open ──────────────────────────────────── */
// Primary source of truth is chrome.storage.local.
// Only syncs from the active tab when it is confirmed to be the ApplyIQ app
// (active origin matches the previously stored domain). All other cases fall
// back to stored session so the extension keeps working with the tab closed.
async function autoSyncOnOpen() {
  setAuthUI("checking", "Checking…");
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const activeOrigin = tab?.url?.startsWith("http") ? getOrigin(tab.url) : null;
    const { applyiq_domain: storedDomain, applyiq_user_id: prevUserId }
      = await storageGet(["applyiq_domain", "applyiq_user_id"]);

    const onApplyIQTab = !!(tab?.id && activeOrigin && storedDomain
                            && activeOrigin === storedDomain);

    if (onApplyIQTab) {
      // Active tab IS the known ApplyIQ app — sync from it to catch
      // sign-outs and account switches immediately.
      const { keyExists, session } = await readSessionFromTab(tab.id);
      if (keyExists === true && session) {
        // Confirmed signed in — update stored session (handles account switches).
        await storeSession(session, activeOrigin);
        setAuthUI("ok", `Connected as ${session.email || session.user_id}`);
        return;
      }
      if (keyExists === true && !session) {
        // Key present but empty/invalid → confirmed sign-out.
        await clearSession();
        setAuthUI("disconnected", "Signed out — open ApplyIQ to reconnect");
        return;
      }
      if (keyExists === false) {
        // Page fully loaded, key absent → Supabase SDK removed it on sign-out.
        await clearSession();
        setAuthUI("disconnected", "Signed out — open ApplyIQ to reconnect");
        return;
      }
      // keyExists === null: page is still loading, SDK not yet initialised —
      // fall through to stored session rather than incorrectly clearing it.
    }

    // ApplyIQ tab is not active (or not yet loaded) — trust stored session.
    // getStoredSession() will silently refresh the token if it is near expiry.
    await showStoredSession();
  } catch {
    await showStoredSession();
  }
}

async function showStoredSession() {
  const session = await getStoredSession();
  if (!session) {
    setAuthUI("disconnected", "Not connected — open ApplyIQ, then click Connect");
    return;
  }
  const minsAgo   = session.syncedAt
    ? Math.round((Date.now() / 1000 - session.syncedAt) / 60) : null;
  const staleHint = minsAgo !== null && minsAgo > 30
    ? ` · synced ${minsAgo}m ago` : "";
  setAuthUI("ok", `Connected as ${session.email || session.userId}${staleHint}`);
}

/* ── Connect / Reconnect ──────────────────────────────────────── */
connectBtn.addEventListener("click", async () => {
  connectBtn.disabled    = true;
  connectBtn.textContent = "Syncing…";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error("no active tab");

    const { keyExists, session } = await readSessionFromTab(tab.id);
    const origin = getOrigin(tab.url);

    if (!keyExists) {
      setAuthUI("disconnected", "Not on ApplyIQ — open your dashboard first");
      return;
    }
    if (!session) {
      await clearSession();
      setAuthUI("disconnected", "Not signed in — sign in to ApplyIQ first");
      return;
    }

    await storeSession(session, origin);
    setAuthUI("ok", `Connected as ${session.email || session.user_id}`);

  } catch {
    setAuthUI("disconnected", "Sync failed — open ApplyIQ and try again");
  } finally {
    connectBtn.disabled = false;
  }
});

/* ── Disconnect ───────────────────────────────────────────────── */
disconnectBtn.addEventListener("click", async () => {
  await clearSession();
  setAuthUI("disconnected", "Disconnected");
});

/* ── URL normalisation ────────────────────────────────────────── */
function normalizeJobLink(url) {
  if (!url) return url;
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
  await autoSyncOnOpen();
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

  } catch {
    showPageError("Couldn't read this page. Try refreshing.");
  }
}

// Injected into the LinkedIn tab — must be fully self-contained.
function extractLinkedInJobInfo() {
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
    const allLines = (card.innerText || "").split("\n")
      .map(l => l.replace(/[\d,.]+[KMBkmb]?\s*followers?/gi, "").replace(/\s+/g, " ").trim())
      .filter(l => l.length > 1)
      .filter((l, i, arr) => i === 0 || l !== arr[i - 1]);
    cardRole    = allLines[0] || null;
    cardCompany = allLines.slice(1).find(isCardLineGood) || null;
  }

  const isSearchPage = location.pathname.includes("/jobs/search") ||
                       new URLSearchParams(location.search).has("currentJobId");
  const minX = isSearchPage ? window.innerWidth * 0.38 : 0;

  const headings = [...document.querySelectorAll('h1, h2, h3, [role="heading"]')]
    .filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.left >= minX && el.textContent.trim().length > 3;
    })
    .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);

  const titleEl   = headings[0] || null;
  const panelRole = titleEl?.textContent?.trim() || null;

  function isValidRole(r) {
    if (!r || r.length < 2) return false;
    return !/match|profile|help|recommend|people you can|reach out/i.test(r);
  }
  const role = (isValidRole(cardRole)  ? cardRole  : null) ||
               (isValidRole(panelRole) ? panelRole : null) ||
               cardRole || null;

  let company = cardCompany || null;
  if (!company) {
    const compLinks = [...document.querySelectorAll('a[href*="/company/"]')]
      .filter(a => { const r = a.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.left >= minX; })
      .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
    for (const a of compLinks) {
      const txt = cleanText(a.textContent);
      if (isGoodCompany(txt)) { company = txt; break; }
    }
  }

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
      if (isGoodCompany(txt)) { company = txt; break; }
    }
  }

  return { role, company: company ?? null };
}

/* ── Save → Supabase ──────────────────────────────────────────── */
saveBtn.addEventListener("click", async () => {
  if (!currentUrl) return;

  const session = await getStoredSession();
  if (!session) {
    showSaveError("Not connected to ApplyIQ. Click Reconnect above.");
    return;
  }

  const company = companyInput.value.trim() || "Unknown Company";
  const role    = roleInput.value.trim()    || "Job Opening";

  setSaving(true);
  pageError.classList.add("hidden");

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/applications`, {
      method: "POST",
      headers: {
        "apikey":        SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${session.accessToken}`,
        "Content-Type":  "application/json",
        "Prefer":        "return=minimal",
      },
      body: JSON.stringify({
        user_id:      session.userId,
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
      } catch { /* not JSON */ }
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

function showPageError(msg) {
  pageError.textContent = msg;
  pageError.classList.remove("hidden");
  saveBtn.disabled      = true;
  companyInput.disabled = true;
  roleInput.disabled    = true;
}

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

function extractCompany(hostname) {
  const clean = hostname.replace(/^www\./, "");
  const parts = clean.split(".");
  const root  = parts.length >= 2 ? parts[parts.length - 2] : parts[0];
  return capitalize(root);
}

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
