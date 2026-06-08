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

  /* ── Save ───────────────────────────────────────────────────── */
  async function saveJob({ company, role, jobLink, status, companyLogoUrl = null }) {
    const session = await getStoredSession();
    if (!session) { showToast("Reconnect ApplyIQ — click the extension icon.", true); return; }
    const { accessToken, userId } = session;
    const authHeaders = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${accessToken}` };
    const encodedLink = encodeURIComponent(jobLink);
    const today       = new Date().toISOString().split("T")[0];

    try {
      // ── Check whether this job already exists in Supabase ──────
      console.log(`[ApplyIQ] checking existing job: ${jobLink}`);
      const chk = await fetch(
        `${SUPABASE_URL}/rest/v1/applications` +
        `?user_id=eq.${userId}&job_link=eq.${encodedLink}&select=id&limit=1`,
        { headers: authHeaders }
      );

      if (!chk.ok) throw new Error(`Check failed: ${chk.status}`);
      const existing = await chk.json();
      console.log(`[ApplyIQ] existing job found: ${existing.length > 0}`);

      if (existing.length > 0) {
        // ── UPDATE existing row ───────────────────────────────────
        console.log(`[ApplyIQ] updating existing job…`);
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
          console.log(`[ApplyIQ] updated existing job: ${company} — ${status}`);
          showToast("Already saved in ApplyIQ");
        } else {
          const msg = await upd.text();
          console.error(`[ApplyIQ] Supabase update error ${upd.status}: ${msg}`);
          showToast("Something went wrong. Try again.", true);
        }
      } else {
        // ── INSERT new row ────────────────────────────────────────
        console.log(`[ApplyIQ] inserting new job…`);
        const ins = await fetch(`${SUPABASE_URL}/rest/v1/applications`, {
          method:  "POST",
          headers: { ...authHeaders, "Content-Type": "application/json", Prefer: "return=minimal" },
          body: JSON.stringify({
            user_id: userId, company, role, job_link: jobLink, status, date_applied: today,
            company_logo_url: companyLogoUrl ?? null,
          }),
        });
        if (ins.ok) {
          console.log(`[ApplyIQ] inserted new job: ${company} — ${status}`);
          showToast("Saved to ApplyIQ");
        } else {
          const msg = await ins.text();
          console.error(`[ApplyIQ] Supabase insert error ${ins.status}: ${msg}`);
          showToast("Something went wrong. Try again.", true);
        }
      }
    } catch (err) {
      console.error(`[ApplyIQ] Supabase error: ${err.message}`);
      showToast("Something went wrong. Try again.", true);
    }
  }

  /* ── Apply (upsert as In Progress) ─────────────────────────── */
  async function applyJob({ company, role, jobLink, companyLogoUrl = null }) {
    const session = await getStoredSession();
    if (!session) { showToast("Reconnect ApplyIQ — click the extension icon.", true); return; }
    const { accessToken, userId } = session;
    const authHeaders = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${accessToken}` };
    const jobIdMatch   = jobLink.match(/\/jobs\/view\/(\d+)/);
    const jobId        = jobIdMatch ? jobIdMatch[1] : null;
    const companyLower = (company || "").toLowerCase();
    const roleLower    = (role    || "").toLowerCase();
    const today        = new Date().toISOString().split("T")[0];

    console.log(`[ApplyIQ] apply - checking for existing row, jobLink: ${jobLink}`);

    try {
      // Fetch all rows — exact-match on job_link fails when URL formats differ
      const listRes = await fetch(
        `${SUPABASE_URL}/rest/v1/applications?user_id=eq.${userId}&select=id,company,role,job_link,status`,
        { headers: authHeaders }
      );
      if (!listRes.ok) throw new Error(`List failed: ${listRes.status}`);
      const rows = await listRes.json();

      console.log(`[ApplyIQ] apply - existing row found: ${rows.length > 0} (${rows.length} total rows)`);

      // Same priority matching as deleteJob
      let match       = jobId ? rows.find(r => (r.job_link || "").includes(jobId)) : null;
      let matchReason = match ? `jobId "${jobId}" in job_link` : null;

      if (!match) {
        match = rows.find(r => normalizeLinkedInJobLink(r.job_link || "") === jobLink);
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
        console.log(`[ApplyIQ] apply - existingRow: true, previous status: "${prevStatus}" (${matchReason}): id=${match.id}`);
        // Update only status — keep company, role, job_link as stored
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
          console.log(`[ApplyIQ] apply - updated existing job to In Progress: id=${match.id} | toast: "${toast}"`);
          showToast(toast);
        } else {
          const msg = await upd.text();
          console.error(`[ApplyIQ] apply - Supabase update error ${upd.status}: ${msg}`);
          showToast("Something went wrong. Try again.", true);
        }
      } else {
        console.log(`[ApplyIQ] apply - existingRow: false, inserting new In Progress job`);
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
          console.log(`[ApplyIQ] apply - existingRow: false, inserted new In Progress job: ${company} | toast: "Saved to ApplyIQ"`);
          showToast("Saved to ApplyIQ");
        } else {
          const msg = await ins.text();
          console.error(`[ApplyIQ] apply - Supabase insert error ${ins.status}: ${msg}`);
          showToast("Something went wrong. Try again.", true);
        }
      }
    } catch (err) {
      console.error(`[ApplyIQ] apply - Supabase error: ${err.message}`);
      showToast("Something went wrong. Try again.", true);
    }
  }

  /* ── Delete (unsave) ───────────────────────────────────────── */
  async function deleteJob({ jobLink: rawLink, company, role }) {
    const session = await getStoredSession();
    if (!session) { showToast("Reconnect ApplyIQ — click the extension icon.", true); return; }
    const { accessToken, userId } = session;
    const authHeaders = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${accessToken}` };
    const jobLink      = normalizeLinkedInJobLink(rawLink);
    const jobIdMatch   = rawLink.match(/\/jobs\/view\/(\d+)/) ||
                         rawLink.match(/[?&]currentJobId=(\d+)/);
    const jobId        = jobIdMatch ? jobIdMatch[1] : null;
    const companyLower = (company || "").toLowerCase();
    const roleLower    = (role    || "").toLowerCase();

    console.log(`[ApplyIQ] unsave - raw URL: ${rawLink}`);
    console.log(`[ApplyIQ] unsave - normalized URL: ${jobLink}`);
    console.log(`[ApplyIQ] unsave - jobId: ${jobId}`);
    console.log(`[ApplyIQ] unsave - extracted company: "${company}"`);
    console.log(`[ApplyIQ] unsave - extracted role: "${role}"`);

    try {
      // ── Fetch all rows for this user ──────────────────────────────────────
      const listRes = await fetch(
        `${SUPABASE_URL}/rest/v1/applications?user_id=eq.${userId}&select=id,company,role,job_link,status`,
        { headers: authHeaders }
      );
      if (!listRes.ok) throw new Error(`List failed: ${listRes.status}`);
      const rows = await listRes.json();

      console.log(`[ApplyIQ] fetched rows (${rows.length}):`);
      rows.forEach(r =>
        console.log(`  id=${r.id} company="${r.company}" role="${r.role}" job_link="${r.job_link}" status="${r.status}"`)
      );

      // ── Match by priority ─────────────────────────────────────────────────
      // a) job_link contains the LinkedIn jobId
      let match       = jobId ? rows.find(r => (r.job_link || "").includes(jobId)) : null;
      let matchReason = match ? `jobId "${jobId}" found in stored job_link` : null;

      // b) normalized stored job_link equals normalized current job_link
      if (!match) {
        match = rows.find(r => normalizeLinkedInJobLink(r.job_link || "") === jobLink);
        if (match) matchReason = `normalized job_link matched "${jobLink}"`;
      }

      // c) company AND role both match
      if (!match && companyLower && roleLower) {
        match = rows.find(r =>
          (r.company || "").toLowerCase() === companyLower &&
          (r.role    || "").toLowerCase() === roleLower
        );
        if (match) matchReason = `company "${company}" + role "${role}" matched`;
      }

      if (!match) {
        console.log(`[ApplyIQ] no matching row — jobId=${jobId} company="${company}" role="${role}"`);
        showToast("Removed from ApplyIQ");
        return;
      }

      console.log(`[ApplyIQ] matched row (${matchReason}): id=${match.id} job_link="${match.job_link}"`);

      // ── Delete by primary key ─────────────────────────────────────────────
      const delRes = await fetch(
        `${SUPABASE_URL}/rest/v1/applications?id=eq.${match.id}`,
        {
          method:  "DELETE",
          headers: { ...authHeaders, Prefer: "return=representation" },
        }
      );

      if (delRes.ok) {
        const deleted = await delRes.json();
        console.log(`[ApplyIQ] delete response rows: ${deleted.length}`);
        console.log(`[ApplyIQ] final result: ${deleted.length > 0 ? "REMOVED" : "NOT FOUND"}`);
        if (deleted.length > 0) {
          showToast("Removed from ApplyIQ");
        } else {
          console.log(`[ApplyIQ] delete returned 0 rows — id=${match.id}`);
          showToast("Removed from ApplyIQ");
        }
      } else {
        const msg = await delRes.text();
        console.error(`[ApplyIQ] delete error ${delRes.status}: ${msg}`);
        showToast("Something went wrong. Try again.", true);
      }
    } catch (err) {
      console.error(`[ApplyIQ] delete network error: ${err.message}`);
      showToast("Something went wrong. Try again.", true);
    }
  }

  /* ── Company name helpers ───────────────────────────────────── */
  const COMPANY_NOISE = new Set([
    "linkedin",
    "show more", "show less", "see more", "see all", "see all jobs",
    "save", "saved", "unsave",
    "follow", "connect", "message",
    "apply", "easy apply", "apply now", "applied",
    "promoted", "verified",
    "responses managed off linkedin",
    "be an early applicant", "actively recruiting",
    "remote", "hybrid", "on-site", "on site",
    "full-time", "part-time", "contract", "internship", "temporary",
  ]);

  const LOCATION_OR_META_RE =
    /^[A-Z][a-zA-Z\s\-]+,\s*[A-Z]{2,}$|^\d[\d,\+\-]* employees$|^(united states|canada|united kingdom|australia|india|germany|france|remote|hybrid)$/i;

  function isGoodCompany(text) {
    if (!text || text.length < 2 || text.length > 100) return false;
    if (COMPANY_NOISE.has(text.toLowerCase())) return false;
    if (LOCATION_OR_META_RE.test(text.trim())) return false;
    return true;
  }

  // Take first segment before LinkedIn's bullet/newline separators,
  // strip follower counts ("23,898 followers", "10K followers", etc.),
  // and collapse whitespace.
  function cleanText(raw) {
    if (!raw) return null;
    const seg = raw
      .split(/[\n\r·•|]/)[0]
      .replace(/[\d,.]+[KMBkmb]?\s*followers?/gi, "")
      .replace(/\bschool alumni\b.*/gi, "")
      .replace(/\s+/g, " ")
      .trim();
    return seg || null;
  }

  function companyFromPageTitle() {
    // "(5) Senior Engineer at Prometric | LinkedIn" → "Prometric"
    const title = document.title.replace(/^\(\d+\)\s*/, "");
    const m = title.match(/\bat\s+(.+?)(?:\s*[|–—\-]\s*LinkedIn)?\s*$/i);
    if (!m) return null;
    return m[1].replace(/\s*[|–—\-]\s*LinkedIn\s*$/i, "").trim() || null;
  }

  /* ── Logo helpers ────────────────────────────────────────────── */

  // Returns the best available URL from an img element,
  // checking currentSrc and LinkedIn lazy-load attributes before src.
  function imgUrl(img) {
    const url = img.currentSrc ||
      img.getAttribute("data-delayed-src") ||
      img.getAttribute("data-ghost-url") ||
      img.src;
    if (!url || url.startsWith("data:") || url.startsWith("blob:")) return null;
    return url;
  }

  function isLogoCandidate(img, minX) {
    const url = imgUrl(img);
    if (!url) return false;
    const r = img.getBoundingClientRect();
    if (r.width < 28 || r.height < 28)   return false; // too small — icon/avatar
    if (r.width > 180 || r.height > 180) return false; // too large — banner/header photo
    if (r.left < (minX || 0))            return false;
    const ratio = r.width / r.height;
    return ratio >= 0.4 && ratio <= 2.5;               // roughly square
  }

  function extractLogoLinkedIn() {
    const isSearchPage = location.pathname.includes("/jobs/search") ||
                         new URLSearchParams(location.search).has("currentJobId");
    const minX = isSearchPage ? window.innerWidth * 0.38 : 0;

    // Fast path: known LinkedIn class patterns for the detail-panel company logo
    const knownSelectors = [
      ".jobs-unified-top-card__company-logo img",
      ".job-details-jobs-unified-top-card__company-logo img",
      '[class*="top-card"][class*="company"] img',
      '[class*="company-logo"] img',
    ];
    for (const sel of knownSelectors) {
      try {
        const img = document.querySelector(sel);
        if (img) {
          const url = imgUrl(img);
          if (url) {
            console.log(`[ApplyIQ] logo source: selector "${sel}": ${url.slice(0, 80)}`);
            return url;
          }
        }
      } catch (_) {}
    }

    // Walk up from each /company/ link (topmost in right panel) looking for a logo img
    const compLinks = [...document.querySelectorAll('a[href*="/company/"]')]
      .filter(a => {
        const r = a.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.left >= minX;
      })
      .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);

    for (const a of compLinks) {
      let node = a.parentElement;
      for (let i = 0; i < 4 && node; i++) {
        for (const img of node.querySelectorAll("img")) {
          if (isLogoCandidate(img, minX)) {
            const url = imgUrl(img);
            if (url) {
              console.log(`[ApplyIQ] logo source: near /company/ link: ${url.slice(0, 80)}`);
              return url;
            }
          }
        }
        node = node.parentElement;
      }
    }

    // Last resort: topmost square-ish img in the right panel
    const imgs = [...document.querySelectorAll("img")]
      .filter(img => isLogoCandidate(img, minX))
      .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
    if (imgs[0]) {
      const url = imgUrl(imgs[0]);
      if (url) {
        console.log(`[ApplyIQ] logo source: viewport scan: ${url.slice(0, 80)}`);
        return url;
      }
    }

    console.log("[ApplyIQ] logo: not found (null)");
    return null;
  }

  /* ── Selected-card helpers ───────────────────────────────────── */

  // Find the job card currently selected in the left panel.
  // Prioritises the currentJobId URL param (most reliable on search pages),
  // then aria-selected, then background-colour difference.
  function findSelectedCard() {
    // 1. currentJobId in URL → find card by data attribute or link href
    const jobId = new URLSearchParams(location.search).get("currentJobId");
    if (jobId) {
      const anchor =
        document.querySelector(`[data-job-id="${jobId}"]`)            ||
        document.querySelector(`[data-occludable-job-id="${jobId}"]`) ||
        document.querySelector(`a[href*="/jobs/view/${jobId}"]`)      ||
        document.querySelector(`a[href*="currentJobId=${jobId}"]`);
      if (anchor) {
        const card = anchor.closest("li") || anchor.parentElement;
        if (card && card.innerText.trim().length > 10) {
          console.log(`[ApplyIQ] card found via jobId=${jobId}`);
          return card;
        }
      }
    }

    // 2. aria-selected="true" — walk up until we find a node with ≥2 text lines
    const sel = document.querySelector('[aria-selected="true"]');
    if (sel) {
      let node = sel;
      for (let i = 0; i < 6; i++) {
        if (node.innerText && node.innerText.trim().split("\n").filter(Boolean).length >= 2) {
          console.log(`[ApplyIQ] card found via aria-selected (walked ${i} levels)`);
          return node;
        }
        node = node.parentElement;
        if (!node) break;
      }
    }

    // 3. li with a job data attribute whose background is non-transparent
    const lis = document.querySelectorAll("li[data-occludable-job-id], li[data-job-id]");
    for (const li of lis) {
      const bg = getComputedStyle(li).backgroundColor;
      if (bg && !/rgba?\(0,\s*0,\s*0,\s*0\)|^transparent$/.test(bg)) {
        console.log(`[ApplyIQ] card found via background style: ${bg}`);
        return li;
      }
    }

    console.log("[ApplyIQ] no selected card found");
    return null;
  }

  function isCardLineGood(line) {
    if (!line || line.length < 2 || line.length > 120) return false;
    const lower = line.toLowerCase();
    const SKIP = [
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
    if (SKIP.includes(lower)) return false;
    if (line.includes("·")) return false;
    if (/^\d+\s+(connection|school|alumni|people)/i.test(line)) return false;
    if (/^\d+\s+(day|week|month|hour|minute)/i.test(line)) return false;
    if (/^\d[\d,+\-]*\s*employees?/i.test(line)) return false;
    if (/^[A-Z][a-zA-Z\s\-]+,\s*[A-Z]{2}/i.test(line)) return false;
    if (/^(united states|canada|united kingdom|australia|india|germany|france)$/i.test(line)) return false;
    return true;
  }

  function extractLinkedInFromSelectedCard() {
    const card = findSelectedCard();
    if (!card) return null;

    const rawLines = (card.innerText || "").split("\n");
    console.log(`[ApplyIQ] selected card raw lines: ${JSON.stringify(rawLines.slice(0, 12))}`);

    // Strip followers/whitespace but do NOT apply isCardLineGood here —
    // role titles like "BI Developer Intern - Onsite in Dallas, TX" would be
    // incorrectly rejected by the location regex.
    const allLines = rawLines
      .map(l =>
        l.replace(/[\d,.]+[KMBkmb]?\s*followers?/gi, "")
         .replace(/\s+/g, " ")
         .trim()
      )
      .filter(l => l.length > 1)
      .filter((l, i, arr) => i === 0 || l !== arr[i - 1]); // dedup adjacent sr-only duplicates

    // Role = first non-empty line (no filtering — it's always the job title)
    const role = allLines[0] || null;

    // Company = first subsequent line that passes the noise filter
    const company = allLines.slice(1).find(isCardLineGood) || null;

    console.log(`[ApplyIQ] selected card role: "${role}"`);
    console.log(`[ApplyIQ] selected card company: "${company}"`);

    return { role, company };
  }

  /* ── DOM extraction ─────────────────────────────────────────── */
  function extractJobInfo() {
    console.log("[ApplyIQ] === extractJobInfo START ===");

    // ── Tier 1: selected job card (left panel) ─────────────────
    const cardResult = extractLinkedInFromSelectedCard();
    let company = cardResult?.company || null;

    // On search pages the right panel occupies the right ~60% of the viewport.
    // Use that boundary to avoid picking up left-panel elements.
    const isSearchPage = location.pathname.includes("/jobs/search") ||
                         new URLSearchParams(location.search).has("currentJobId");
    const minX = isSearchPage ? window.innerWidth * 0.38 : 0;

    // ── Right panel role: first visible heading in the right area ─
    const headings = [...document.querySelectorAll('h1, h2, h3, [role="heading"]')]
      .filter(el => {
        const r = el.getBoundingClientRect();
        const t = el.textContent.trim();
        return r.width > 0 && r.height > 0 && r.left >= minX && t.length > 3;
      })
      .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);

    const titleEl   = headings[0] || null;
    const panelRole = titleEl?.textContent?.trim() || null;
    console.log(`[ApplyIQ] right panel role: "${panelRole}"`);

    // Card role is primary; right panel heading is fallback only.
    // Reject any role that is UI copy rather than an actual job title.
    function isValidRole(r) {
      if (!r || r.length < 2) return false;
      return !/match|profile|help|recommend|people you can|reach out/i.test(r);
    }
    const role = (isValidRole(cardResult?.role) ? cardResult.role  : null) ||
                 (isValidRole(panelRole)         ? panelRole        : null) ||
                 cardResult?.role || "Job Opening";
    console.log(`[ApplyIQ] role chosen: "${role}"`);

    // ── Right panel company: topmost visible /company/ link in right area ─
    if (!company) {
      const compLinks = [...document.querySelectorAll('a[href*="/company/"]')]
        .filter(a => {
          const r = a.getBoundingClientRect();
          return r.width > 0 && r.height > 0 && r.left >= minX;
        })
        .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);

      console.log(`[ApplyIQ] right panel /company/ links found: ${compLinks.length}`);
      for (const a of compLinks) {
        const txt = cleanText(a.textContent);
        console.log(`[ApplyIQ] /company/ link: "${txt}" left=${Math.round(a.getBoundingClientRect().left)} | good: ${isGoodCompany(txt)}`);
        if (isGoodCompany(txt)) {
          company = txt;
          console.log(`[ApplyIQ] company SELECTED from /company/ link: "${company}"`);
          break;
        }
      }
    }

    // ── Fallback: text elements directly above the title ────────
    if (!company && titleEl) {
      const titleRect = titleEl.getBoundingClientRect();
      const aboveEls  = [...document.querySelectorAll("span, a, strong")]
        .filter(el => {
          if (el.children.length > 0) return false;
          const r = el.getBoundingClientRect();
          const t = el.textContent.trim();
          return r.width > 0 && r.left >= minX &&
                 r.bottom <= titleRect.top + 4 &&
                 r.bottom >  titleRect.top - 80 &&
                 t.length > 1;
        })
        .sort((a, b) => {
          const ra = a.getBoundingClientRect();
          const rb = b.getBoundingClientRect();
          return (titleRect.top - ra.bottom) - (titleRect.top - rb.bottom);
        });

      for (const el of aboveEls) {
        const txt = cleanText(el.textContent);
        if (isGoodCompany(txt)) {
          company = txt;
          console.log(`[ApplyIQ] company SELECTED from above title: "${company}"`);
          break;
        }
      }
    }

    if (!company) {
      console.log("[ApplyIQ] company: NOT FOUND → 'Unknown Company'");
      company = "Unknown Company";
    }

    console.log(`[ApplyIQ] FINAL: company="${company}" role="${role}"`);
    const companyLogoUrl = extractLogoLinkedIn();
    console.log(`[ApplyIQ] logo: "${companyLogoUrl ? companyLogoUrl.slice(0, 80) : "null"}"`);
    return buildResult(role, company, companyLogoUrl);
  }

  // Always returns https://www.linkedin.com/jobs/view/{id}/ regardless of
  // whether the URL is a search page (?currentJobId=...) or a direct job page.
  function normalizeLinkedInJobLink(url) {
    const pathMatch = url.match(/\/jobs\/view\/(\d+)/);
    if (pathMatch) return `https://www.linkedin.com/jobs/view/${pathMatch[1]}/`;
    try {
      const jobId = new URLSearchParams(new URL(url).search).get("currentJobId");
      if (jobId) return `https://www.linkedin.com/jobs/view/${jobId}/`;
    } catch (_) {}
    return url.replace(/[?#].*$/, "").replace(/\/?$/, "/");
  }

  function buildResult(role, company, companyLogoUrl) {
    return { role, company, companyLogoUrl, jobLink: normalizeLinkedInJobLink(location.href) };
  }

  /* ── Button classification ──────────────────────────────────── */
  function getBtnText(btn) {
    // LinkedIn buttons wrap text in .artdeco-button__text; fall back to full text
    return (
      btn.querySelector(".artdeco-button__text")?.textContent ||
      btn.textContent
    ).replace(/\s+/g, " ").trim().toLowerCase();
  }

  function classifyButton(btn) {
    const label   = (btn.getAttribute("aria-label") || "").toLowerCase();
    const text    = getBtnText(btn);
    const classes = (btn.className || "").toLowerCase();

    // Unsave check must come first — the save-button class is present in both states
    const unsaveHit =
      label.startsWith("unsave") ||
      text === "saved"           ||
      text === "unsave";

    if (unsaveHit) return "unsave";

    const saveHit =
      classes.includes("jobs-save-button") ||
      label.includes("save job")           ||
      text === "save";

    if (saveHit) return "save";

    const applyHit =
      classes.includes("jobs-apply-button") ||
      label.includes("apply")              ||
      text === "apply"                     ||
      text === "easy apply"                ||
      text.startsWith("apply");

    if (applyHit) return "apply";

    return null;
  }

  /* ── Main click listener (capture phase) ────────────────────── */
  document.addEventListener("click", async (e) => {
    // Handle both <button> and <a> elements (apply links may be anchors)
    const btn = e.target.closest("button");
    const anc = btn ? null : e.target.closest("a");
    const el  = btn || anc;
    if (!el) return;

    // Only react on LinkedIn job pages
    if (!location.pathname.startsWith("/jobs/")) return;

    const action = classifyButton(el);
    if (!action) return;

    const { role, company, jobLink, companyLogoUrl } = extractJobInfo();

    if (action === "unsave") {
      await deleteJob({ jobLink, company, role });
      return;
    }

    if (action === "apply") {
      console.log(`[ApplyIQ] apply click detected`);
      console.log(`[ApplyIQ] apply - extracted company: "${company}"`);
      console.log(`[ApplyIQ] apply - extracted role: "${role}"`);
      console.log(`[ApplyIQ] apply - normalized job_link: "${jobLink}"`);

      // Check whether the click target has an external href ancestor.
      // LinkedIn's "Easy Apply" stays on-page (modal); external apply goes off-site.
      const externalAnchor = e.target.closest("a[href]");
      const isExternal     = externalAnchor &&
        !externalAnchor.href.startsWith("https://www.linkedin.com");

      if (isExternal) {
        // Briefly block navigation, await the Supabase write, then resume
        e.preventDefault();
        await applyJob({ company, role, jobLink, companyLogoUrl });
        console.log(`[ApplyIQ] apply - save complete, navigation continued to: ${externalAnchor.href}`);
        if (externalAnchor.target === "_blank") {
          window.open(externalAnchor.href, "_blank");
        } else {
          window.location.href = externalAnchor.href;
        }
      } else {
        // Easy Apply (modal) or LinkedIn-internal link — fire-and-forget so
        // LinkedIn's own handlers open the modal unimpeded
        applyJob({ company, role, jobLink, companyLogoUrl });
        console.log(`[ApplyIQ] apply - save triggered (fire-and-forget), navigation not blocked`);
      }
      return;
    }

    // "save" action
    await saveJob({ company, role, jobLink, status: "Interested", companyLogoUrl });
  }, true);

  /* ── SPA URL-change awareness ───────────────────────────────── */
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
    }
  }).observe(document.documentElement, { subtree: true, childList: true });
})();
