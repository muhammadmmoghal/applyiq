(function () {
  "use strict";


  const SUPABASE_URL      = "https://npighgicwmefjzewzmit.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_WnSKpTKGde0qEa__Hid9ew_JhDBolMu";
  /* ── Auth ───────────────────────────────────────────────────── */
  async function getStoredSession() {
    const d = await new Promise(r => chrome.storage.local.get(
      ["applyiq_access_token", "applyiq_user_id", "applyiq_expires_at", "applyiq_refresh_token"],
      r
    ));
    const {
      applyiq_access_token:  accessToken,
      applyiq_user_id:       userId,
      applyiq_expires_at:    expiresAt,
      applyiq_refresh_token: refreshToken,
    } = d;
    if (!accessToken || !userId) return null;
    const now = Math.floor(Date.now() / 1000);
    if (expiresAt && now > expiresAt - 60) {
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
        await new Promise(r => chrome.storage.local.set({
          applyiq_access_token:  data.access_token,
          applyiq_user_id:       data.user.id,
          applyiq_user_email:    data.user.email || "",
          applyiq_expires_at:    data.expires_at  || 0,
          applyiq_refresh_token: data.refresh_token || refreshToken,
          applyiq_synced_at:     Math.floor(Date.now() / 1000),
        }, r));
        return { accessToken: data.access_token, userId: data.user.id };
      } catch { return null; }
    }
    return { accessToken, userId };
  }

  /* ── Toast ──────────────────────────────────────────────────── */
  function showToast(msg, isError = false) {
    const prev = document.getElementById("applyiq-toast");
    if (prev) prev.remove();

    const el = document.createElement("div");
    el.id = "applyiq-toast";
    Object.assign(el.style, {
      position:      "fixed",
      bottom:        "28px",
      right:         "28px",
      zIndex:        "2147483647",
      padding:       "10px 16px",
      borderRadius:  "10px",
      fontSize:      "13px",
      fontWeight:    "600",
      fontFamily:    "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      color:         "#fff",
      background:    isError ? "#dc2626" : "#2563eb",
      boxShadow:     "0 4px 20px rgba(0,0,0,0.22)",
      opacity:       "0",
      transform:     "translateY(10px)",
      transition:    "opacity 0.2s ease, transform 0.2s ease",
      pointerEvents: "none",
      lineHeight:    "1.4",
      maxWidth:      "320px",
    });
    el.textContent = msg;
    document.body.appendChild(el);

    requestAnimationFrame(() => {
      el.style.opacity   = "1";
      el.style.transform = "translateY(0)";
    });
    setTimeout(() => {
      el.style.opacity   = "0";
      el.style.transform = "translateY(10px)";
      setTimeout(() => el.remove(), 300);
    }, 2500);
  }

  /* ── URL helpers ────────────────────────────────────────────── */
  // Strip query/hash and any /apply suffix; keep the stable numeric job path.
  // Handles both /jobs/ID and /job-search/ID URL shapes.
  function normalizeHandshakeJobLink(url) {
    return url.replace(/[?#].*$/, "").replace(/\/apply\/?$/, "").replace(/\/$/, "");
  }

  function jobIdFromUrl(url) {
    const m = url.match(/\/(?:jobs|job-search)\/(\d+)/);
    return m ? m[1] : null;
  }

  /* ── Save (Interested) ──────────────────────────────────────── */
  async function saveJob({ company, role, jobLink, status, companyLogoUrl = null }) {
    const session = await getStoredSession();
    if (!session) { showToast("Reconnect ApplyIQ — click the extension icon.", true); return; }
    const { accessToken, userId } = session;
    const authHeaders = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${accessToken}` };
    const encodedLink = encodeURIComponent(jobLink);
    const today       = new Date().toISOString().split("T")[0];

    try {
      const chk = await fetch(
        `${SUPABASE_URL}/rest/v1/applications` +
        `?user_id=eq.${userId}&job_link=eq.${encodedLink}&select=id&limit=1`,
        { headers: authHeaders }
      );
      if (!chk.ok) throw new Error(`Check failed: ${chk.status}`);
      const existing = await chk.json();

      if (existing.length > 0) {
        const upd = await fetch(
          `${SUPABASE_URL}/rest/v1/applications` +
          `?user_id=eq.${userId}&job_link=eq.${encodedLink}`,
          {
            method:  "PATCH",
            headers: { ...authHeaders, "Content-Type": "application/json", Prefer: "return=minimal" },
            body: JSON.stringify({ company, role, status, date_applied: today, ...(companyLogoUrl ? { company_logo_url: companyLogoUrl } : {}) }),
          }
        );
        if (upd.ok) {
          showToast("Already saved in ApplyIQ");
        } else {
          const msg = await upd.text();
          console.error(`[ApplyIQ Handshake] save - update error ${upd.status}: ${msg}`);
          showToast("Something went wrong. Try again.", true);
        }
      } else {
        const ins = await fetch(`${SUPABASE_URL}/rest/v1/applications`, {
          method:  "POST",
          headers: { ...authHeaders, "Content-Type": "application/json", Prefer: "return=minimal" },
          body: JSON.stringify({
            user_id: userId, company, role, job_link: jobLink, status, date_applied: today,
            company_logo_url: companyLogoUrl ?? null,
          }),
        });
        if (ins.ok) {
          showToast("Saved to ApplyIQ");
        } else {
          const msg = await ins.text();
          console.error(`[ApplyIQ Handshake] save - insert error ${ins.status}: ${msg}`);
          showToast("Something went wrong. Try again.", true);
        }
      }
    } catch (err) {
      console.error(`[ApplyIQ Handshake] save - error: ${err.message}`);
      showToast("Something went wrong. Try again.", true);
    }
  }

  /* ── Apply (upsert as In Progress) ─────────────────────────── */
  async function applyJob({ company, role, jobLink, companyLogoUrl = null }) {
    const session = await getStoredSession();
    if (!session) { showToast("Reconnect ApplyIQ — click the extension icon.", true); return; }
    const { accessToken, userId } = session;
    const authHeaders = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${accessToken}` };
    const jobId        = jobIdFromUrl(jobLink);
    const companyLower = (company || "").toLowerCase();
    const roleLower    = (role    || "").toLowerCase();
    const today        = new Date().toISOString().split("T")[0];


    try {
      const listRes = await fetch(
        `${SUPABASE_URL}/rest/v1/applications?user_id=eq.${userId}&select=id,company,role,job_link,status`,
        { headers: authHeaders }
      );
      if (!listRes.ok) throw new Error(`List failed: ${listRes.status}`);
      const rows = await listRes.json();


      // Priority matching — same three-tier system as LinkedIn
      let match       = jobId ? rows.find(r => (r.job_link || "").includes(jobId)) : null;
      let matchReason = match ? `jobId "${jobId}" in job_link` : null;

      if (!match) {
        match = rows.find(r => normalizeHandshakeJobLink(r.job_link || "") === jobLink);
        if (match) matchReason = `normalized job_link matched`;
      }

      if (!match && companyLower && roleLower) {
        match = rows.find(r =>
          (r.company || "").toLowerCase() === companyLower &&
          (r.role    || "").toLowerCase() === roleLower
        );
        if (match) matchReason = `company + role matched`;
      }

      if (match) {
        const prevStatus = match.status;
        const upd = await fetch(
          `${SUPABASE_URL}/rest/v1/applications?id=eq.${match.id}`,
          {
            method:  "PATCH",
            headers: { ...authHeaders, "Content-Type": "application/json", Prefer: "return=minimal" },
            body: JSON.stringify({ status: "In Progress", date_applied: today, ...(companyLogoUrl ? { company_logo_url: companyLogoUrl } : {}) }),
          }
        );
        if (upd.ok) {
          const toast = prevStatus === "In Progress" ? "Already saved in ApplyIQ" : "Updated to In Progress";
          showToast(toast);
        } else {
          const msg = await upd.text();
          console.error(`[ApplyIQ Handshake] apply - update error ${upd.status}: ${msg}`);
          showToast("Something went wrong. Try again.", true);
        }
      } else {
        const ins = await fetch(`${SUPABASE_URL}/rest/v1/applications`, {
          method:  "POST",
          headers: { ...authHeaders, "Content-Type": "application/json", Prefer: "return=minimal" },
          body: JSON.stringify({
            user_id: userId, company, role, job_link: jobLink,
            status: "In Progress", date_applied: today,
            company_logo_url: companyLogoUrl ?? null,
          }),
        });
        if (ins.ok) {
          showToast("Saved to ApplyIQ");
        } else {
          const msg = await ins.text();
          console.error(`[ApplyIQ Handshake] apply - insert error ${ins.status}: ${msg}`);
          showToast("Something went wrong. Try again.", true);
        }
      }
    } catch (err) {
      console.error(`[ApplyIQ Handshake] apply - error: ${err.message}`);
      showToast("Something went wrong. Try again.", true);
    }
  }

  /* ── Delete (unsave / unfavorite) ───────────────────────────── */
  async function deleteJob({ jobLink: rawLink, company, role }) {
    const session = await getStoredSession();
    if (!session) { showToast("Reconnect ApplyIQ — click the extension icon.", true); return; }
    const { accessToken, userId } = session;
    const authHeaders = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${accessToken}` };
    const jobLink      = normalizeHandshakeJobLink(rawLink);
    const jobId        = jobIdFromUrl(rawLink);
    const companyLower = (company || "").toLowerCase();
    const roleLower    = (role    || "").toLowerCase();


    try {
      const listRes = await fetch(
        `${SUPABASE_URL}/rest/v1/applications?user_id=eq.${userId}&select=id,company,role,job_link,status`,
        { headers: authHeaders }
      );
      if (!listRes.ok) throw new Error(`List failed: ${listRes.status}`);
      const rows = await listRes.json();

      rows.forEach(r =>
      );

      // Priority matching
      let match       = jobId ? rows.find(r => (r.job_link || "").includes(jobId)) : null;
      let matchReason = match ? `jobId "${jobId}" in job_link` : null;

      if (!match) {
        match = rows.find(r => normalizeHandshakeJobLink(r.job_link || "") === jobLink);
        if (match) matchReason = `normalized job_link matched "${jobLink}"`;
      }

      if (!match && companyLower && roleLower) {
        match = rows.find(r =>
          (r.company || "").toLowerCase() === companyLower &&
          (r.role    || "").toLowerCase() === roleLower
        );
        if (match) matchReason = `company "${company}" + role "${role}" matched`;
      }

      if (!match) {
        showToast("Removed from ApplyIQ");
        return;
      }


      const delRes = await fetch(
        `${SUPABASE_URL}/rest/v1/applications?id=eq.${match.id}`,
        {
          method:  "DELETE",
          headers: { ...authHeaders, Prefer: "return=representation" },
        }
      );

      if (delRes.ok) {
        const deleted = await delRes.json();
        if (deleted.length > 0) {
          showToast("Removed from ApplyIQ");
        } else {
          showToast("Removed from ApplyIQ");
        }
      } else {
        const msg = await delRes.text();
        console.error(`[ApplyIQ Handshake] unsave - delete error ${delRes.status}: ${msg}`);
        showToast("Something went wrong. Try again.", true);
      }
    } catch (err) {
      console.error(`[ApplyIQ Handshake] unsave - network error: ${err.message}`);
      showToast("Something went wrong. Try again.", true);
    }
  }

  /* ── Extraction helpers ─────────────────────────────────────── */
  const HANDSHAKE_NOISE = new Set([
    // UI buttons
    "apply", "apply now", "apply externally", "apply on site",
    "save", "saved", "unsave", "favorite", "unfavorite", "share",
    // Job types (with and without hyphens — Handshake renders both)
    "full-time", "full time", "part-time", "part time",
    "internship", "co-op", "coop", "contract", "temporary", "temp",
    // Work modes
    "remote", "hybrid", "on-site", "on site", "in person", "in-person",
    // Common Handshake industry/category tags that are NOT company names
    "manufacturing", "technology", "healthcare", "finance", "financial services",
    "education", "retail", "consulting", "engineering", "software", "services",
    "government", "nonprofit", "non-profit", "banking", "insurance",
    "real estate", "transportation", "logistics", "media", "marketing",
    "advertising", "legal", "accounting", "construction", "agriculture",
    "hospitality", "science", "research", "business", "operations",
  ]);

  function isNoiseLine(text) {
    if (!text || text.length < 2 || text.length > 200) return true;
    const lower = text.toLowerCase();
    if (HANDSHAKE_NOISE.has(lower)) return true;
    if (/^\d+\s*(day|week|month|hour|minute|applicant)/i.test(text)) return true;
    // "City, ST" two-letter state code only — avoids filtering "Company, Inc."
    if (/^[A-Za-z\s\-]+,\s*[A-Z]{2}$/.test(text.trim())) return true;
    return false;
  }

  function extractRole() {
    const el =
      document.querySelector('[data-testid="job-title"]') ||
      document.querySelector("main h1")                   ||
      document.querySelector("h1");
    const txt = el?.textContent?.trim();
    if (txt && txt.length > 1) {
      return txt;
    }
    return null;
  }

  // Walk UP from the H1 to find the tightest ancestor that contains text
  // beyond just the role itself, then extract all rendered lines from it.
  // Uses innerText (not textContent) so we get browser-visible line breaks.
  function extractCompany(role) {
    const h1 = document.querySelector("main h1") || document.querySelector("h1");
    if (!h1) {
      return null;
    }

    const roleLower = (role || "").toLowerCase().trim();

    // Walk up from H1; stop at the first ancestor whose rendered text has
    // 2–20 non-role lines (tight header section, not the whole page).
    let headerEl = null;
    let node = h1.parentElement;
    for (let depth = 0; depth < 7 && node && node !== document.body; depth++) {
      const lines = (node.innerText || "")
        .split(/[\n\r]+/)
        .map(l => l.trim())
        .filter(l => l.length > 1 && l.toLowerCase() !== roleLower);
      if (lines.length >= 1 && lines.length <= 20) {
        headerEl = node;
        break;
      }
      node = node.parentElement;
    }

    if (!headerEl) {
      // Fallback: just use H1's direct parent
      headerEl = h1.parentElement;
    }

    // All rendered lines in the header section
    const allLines = (headerEl.innerText || "")
      .split(/[\n\r]+/)
      .map(l => l.trim())
      .filter(l => l.length > 1);


    // Filter: remove role, noise, locations
    const filtered = allLines.filter(txt => {
      if (txt.toLowerCase() === roleLower) return false;
      if (isNoiseLine(txt)) return false;
      return true;
    });


    const company = filtered[0] || null;
    return company;
  }

  /* ── Logo extraction ────────────────────────────────────────── */

  // Walk up from the job title H1 until we find an <img> that looks like a
  // company logo (roughly square, not an icon, not a banner photo).
  function extractLogoHandshake() {
    const h1 = document.querySelector("main h1") || document.querySelector("h1");
    if (!h1) {
      return null;
    }
    let node = h1.parentElement;
    for (let i = 0; i < 7 && node && node !== document.body; i++) {
      for (const img of node.querySelectorAll("img")) {
        const url = img.currentSrc || img.src;
        if (!url || url.startsWith("data:") || url.startsWith("blob:")) continue;
        const r = img.getBoundingClientRect();
        if (r.width < 28 || r.height < 28 || r.width > 180 || r.height > 180) continue;
        const ratio = r.width / r.height;
        if (ratio < 0.4 || ratio > 2.5) continue;
        return url;
      }
      node = node.parentElement;
    }
    return null;
  }

  // Extract a logo from a left-list job card element.
  function extractLogoFromCard(card) {
    for (const img of card.querySelectorAll("img")) {
      const url = img.currentSrc || img.src;
      if (!url || url.startsWith("data:") || url.startsWith("blob:")) continue;
      const r = img.getBoundingClientRect();
      if (r.width < 24 || r.height < 24 || r.width > 150 || r.height > 150) continue;
      const ratio = r.width / r.height;
      if (ratio < 0.4 || ratio > 2.5) continue;
      return url;
    }
    return null;
  }

  /* ── DOM extraction (entry point) ──────────────────────────── */
  function extractJobInfo() {
    const role           = extractRole()         || "Job Opening";
    const company        = extractCompany(role)  || "Unknown Company";
    const jobLink        = normalizeHandshakeJobLink(location.href);
    const companyLogoUrl = extractLogoHandshake();


    return { role, company, jobLink, companyLogoUrl };
  }

  /* ── Left-list card helpers ─────────────────────────────────── */

  // Walk up from the clicked element and return the FIRST (tightest) ancestor
  // that contains a job-link anchor as a descendant.
  // No tag/role requirement — Handshake uses <div> cards, not <li>.
  // Depth cap of 6 prevents matching large page sections that include the right panel.
  function findJobCard(el) {
    // Only treat an anchor as a "card" if it links to a DIFFERENT job than the
    // current page. This prevents the Apply button on a detail page from
    // falsely matching the detail panel's own job-link breadcrumb/header,
    // which would swallow the click before the detail-page apply logic runs.
    const pageJobId = jobIdFromUrl(location.href);

    let node = el.parentElement;
    for (let i = 0; i < 6 && node && node !== document.body; i++) {
      if (node.tagName === "A") {
        const href = node.getAttribute("href") || "";
        if (/\/(job-search|jobs)\/\d/.test(href)) {
          const cardJobId = jobIdFromUrl(href);
          if (cardJobId && cardJobId !== pageJobId) {
            return { card: node.parentElement || node, anchor: node };
          }
        }
      }
      const anchor = node.querySelector('a[href*="/job-search/"], a[href*="/jobs/"]');
      if (anchor) {
        const cardJobId = jobIdFromUrl(anchor.href);
        if (cardJobId && cardJobId !== pageJobId) {
          return { card: node, anchor };
        }
      }
      node = node.parentElement;
    }
    return null;
  }

  // Extract job info from a left-list card using innerText line splitting.
  // Returns { role, company, jobLink }.
  function extractFromCard(card, anchor) {
    const jobLink = normalizeHandshakeJobLink(anchor.href);

    const allLines = (card.innerText || "")
      .split(/[\n\r]+/)
      .map(l => l.trim())
      .filter(l => l.length > 1);


    // Filter noise; Handshake cards show company FIRST, role SECOND
    const valid = allLines.filter(l => !isNoiseLine(l));


    const company = valid[0] || "Unknown Company";
    const role    = valid[1] || "Job Opening";


    const companyLogoUrl = extractLogoFromCard(card);

    return { role, company, jobLink, companyLogoUrl };
  }

  /* ── Button classification ──────────────────────────────────── */
  function classifyButton(el) {
    const label   = (el.getAttribute("aria-label") || "").toLowerCase();
    const text    = el.textContent.replace(/\s+/g, " ").trim().toLowerCase();
    const pressed = el.getAttribute("aria-pressed");

    // ── Unsave / Unfavorite — must check before save ───────────
    const isUnsave =
      text === "saved"               ||
      text === "unsave"              ||
      text === "unfavorite"          ||
      label.includes("unsave")       ||
      label.includes("unfavorite")   ||
      label.startsWith("remove")     ||
      (pressed === "true" &&
        (label.includes("save") || label.includes("favorite") ||
         text.includes("save")  || text.includes("favorite")));

    if (isUnsave) return "unsave";

    // ── Save / Favorite ────────────────────────────────────────
    const isSave =
      text === "save"              ||
      text === "save job"          ||
      text === "favorite"          ||
      label.includes("save job")   ||
      (label.includes("save")     && pressed !== "true") ||
      (label.includes("favorite") && pressed !== "true");

    if (isSave) return "save";

    // ── Apply ──────────────────────────────────────────────────
    const isApply =
      text === "apply"            ||
      text === "apply now"        ||
      text === "apply on site"    ||
      text === "apply externally" ||
      text.startsWith("apply ")   ||
      label.includes("apply");

    if (isApply) return "apply";

    return null;
  }

  /* ── Main click listener (capture phase) ────────────────────── */
  document.addEventListener("click", async (e) => {
    // Include [role="button"] divs — Handshake uses these in React components
    const el = e.target.closest('button, [role="button"], a');
    if (!el) return;

    const elText    = el.textContent.replace(/\s+/g, " ").trim().slice(0, 80);
    const elLabel   = el.getAttribute("aria-label") || "";
    const elPressed = el.getAttribute("aria-pressed") || "";

    // Log every intercepted click so we can see what's happening

    // ── Left-list card bookmark ──────────────────────────────────
    // Check BEFORE the path guard so bookmarks work on any Handshake page,
    // including the search list (/job-search without a numeric ID).
    const cardResult = findJobCard(el);
    if (cardResult) {
      const action = classifyButton(el);
      // Only handle save/unsave for list cards — Apply lives in the detail panel
      if (action === "save" || action === "unsave") {
        const { role, company, jobLink, companyLogoUrl } = extractFromCard(cardResult.card, cardResult.anchor);
        if (!jobLink) {
          return;
        }
        if (action === "unsave") {
          await deleteJob({ jobLink, company, role });
        } else {
          await saveJob({ company, role, jobLink, status: "Interested", companyLogoUrl });
        }
      }
      return;
    }

    // ── Detail-page buttons ──────────────────────────────────────
    // Guard: only act on job detail pages (/jobs/ID or /job-search/ID)
    const isJobPage = /\/(jobs|job-search)\/\d/.test(location.pathname);
    if (!isJobPage) {
      return;
    }

    const action = classifyButton(el);
    if (!action) return;

    const { role, company, jobLink, companyLogoUrl } = extractJobInfo();

    if (action === "unsave") {
      await deleteJob({ jobLink, company, role });
      return;
    }

    if (action === "apply") {

      const externalAnchor = e.target.closest("a[href]");
      const isExternal     = externalAnchor &&
        !externalAnchor.href.includes("joinhandshake.com");

      if (isExternal) {
        e.preventDefault();
        await applyJob({ company, role, jobLink, companyLogoUrl });
        if (externalAnchor.target === "_blank") {
          window.open(externalAnchor.href, "_blank");
        } else {
          window.location.href = externalAnchor.href;
        }
      } else {
        applyJob({ company, role, jobLink, companyLogoUrl });
      }
      return;
    }

    // "save" action → Interested
    await saveJob({ company, role, jobLink, status: "Interested", companyLogoUrl });
  }, true);

  /* ── SPA navigation awareness ───────────────────────────────── */
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
    }
  }).observe(document.documentElement, { subtree: true, childList: true });
})();
