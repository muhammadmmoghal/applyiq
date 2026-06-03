"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Navbar from "@/app/components/Navbar";
import { supabase, type Application, type Status } from "@/lib/supabase";
import { useAuth } from "@/app/context/AuthContext";
import FadeUp from "@/app/components/FadeUp";

/* ── Constants ──────────────────────────────────────────────────── */

const STATUS_STYLES: Record<Status, { badge: string; dot: string }> = {
  Interested:    { badge: "bg-violet-500/[0.12] text-violet-300 ring-1 ring-violet-500/[0.25]", dot: "bg-violet-400" },
  "In Progress": { badge: "bg-sky-500/[0.12] text-sky-300 ring-1 ring-sky-500/[0.25]",         dot: "bg-sky-400"    },
  Applied:       { badge: "bg-blue-500/[0.12] text-blue-300 ring-1 ring-blue-500/[0.25]",       dot: "bg-blue-400"   },
  Interview:     { badge: "bg-amber-500/[0.12] text-amber-300 ring-1 ring-amber-500/[0.25]",    dot: "bg-amber-400"  },
  Offer:         { badge: "bg-emerald-500/[0.12] text-emerald-300 ring-1 ring-emerald-500/[0.25]", dot: "bg-emerald-400" },
  Rejected:      { badge: "bg-red-500/[0.12] text-red-300 ring-1 ring-red-500/[0.25]",          dot: "bg-red-400"    },
};

const FILTER_OPTIONS = ["All", "Interested", "In Progress", "Applied", "Interview", "Offer", "Rejected"] as const;
type FilterOption = (typeof FILTER_OPTIONS)[number];

type SortOption = "newest" | "oldest" | "az" | "status";
const STATUS_ORDER: Record<Status, number> = {
  Interested: 0, "In Progress": 1, Applied: 2, Interview: 3, Offer: 4, Rejected: 5,
};

type FormData = {
  company: string; role: string; date_applied: string; status: Status;
  job_link: string; follow_up_date: string; notes: string;
};
const EMPTY_FORM: FormData = {
  company: "", role: "", date_applied: "", status: "Applied",
  job_link: "", follow_up_date: "", notes: "",
};

function formatDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

/* ── Page ───────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const { user, loading: authLoading, signInWithGoogle } = useAuth();

  // data
  const [apps, setApps]       = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  // filter + sort
  const [filter, setFilter] = useState<FilterOption>("All");
  const [sort, setSort]     = useState<SortOption>("newest");

  // add form
  const [form, setForm]           = useState<FormData>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // edit modal
  const [editingApp, setEditingApp]     = useState<Application | null>(null);
  const [editForm, setEditForm]         = useState<FormData>(EMPTY_FORM);
  const [editError, setEditError]       = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  // delete
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId]           = useState<string | null>(null);

  /* ── Fetch ──────────────────────────────────────────────────── */

  const fetchApps = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    const { data, error: dbError } = await supabase
      .from("applications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (dbError) {
      setError("Failed to load applications. Please check your connection.");
    } else {
      setApps((data ?? []) as Application[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchApps(); }, [fetchApps]);

  /* ── Derived ────────────────────────────────────────────────── */

  const stats = useMemo(() => {
    const total      = apps.length;
    const interviews = apps.filter((a) => a.status === "Interview").length;
    const offers     = apps.filter((a) => a.status === "Offer").length;
    const responseRate = total > 0 ? Math.round(((interviews + offers) / total) * 100) : 0;
    return { total, interviews, offers, responseRate };
  }, [apps]);

  const sorted = useMemo(() => {
    const list = filter === "All" ? apps : apps.filter((a) => a.status === filter);
    switch (sort) {
      case "oldest":
        return [...list].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case "az":
        return [...list].sort((a, b) => a.company.localeCompare(b.company));
      case "status":
        return [...list].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
      case "newest":
      default:
        return [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  }, [apps, filter, sort]);

  /* ── Add ────────────────────────────────────────────────────── */

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company.trim() || !form.role.trim() || !form.date_applied) {
      setFormError("All fields are required.");
      return;
    }
    if (!user) return;
    setFormError("");
    setSubmitting(true);
    const { error: insertError } = await supabase.from("applications").insert({
      user_id:        user.id,
      company:        form.company.trim(),
      role:           form.role.trim(),
      date_applied:   form.date_applied,
      status:         form.status,
      job_link:       form.job_link.trim()  || null,
      follow_up_date: form.follow_up_date   || null,
      notes:          form.notes.trim()     || null,
    });
    setSubmitting(false);
    if (insertError) { setFormError("Failed to add application. Please try again."); return; }
    setForm(EMPTY_FORM);
    await fetchApps();
  }

  function field(key: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (formError) setFormError("");
  }

  /* ── Edit ───────────────────────────────────────────────────── */

  function openEdit(app: Application) {
    setEditingApp(app);
    setEditForm({
      company: app.company, role: app.role, date_applied: app.date_applied, status: app.status,
      job_link:       app.job_link       ?? "",
      follow_up_date: app.follow_up_date ?? "",
      notes:          app.notes          ?? "",
    });
    setEditError("");
  }

  function closeEdit() {
    setEditingApp(null);
    setEditForm(EMPTY_FORM);
    setEditError("");
  }

  function editField(key: keyof FormData, value: string) {
    setEditForm((f) => ({ ...f, [key]: value }));
    if (editError) setEditError("");
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingApp) return;
    if (!editForm.company.trim() || !editForm.role.trim() || !editForm.date_applied) {
      setEditError("All fields are required.");
      return;
    }
    if (!user) return;
    setEditError("");
    setEditSubmitting(true);
    const { error: updateError } = await supabase
      .from("applications")
      .update({
        company:        editForm.company.trim(),
        role:           editForm.role.trim(),
        date_applied:   editForm.date_applied,
        status:         editForm.status,
        job_link:       editForm.job_link.trim()  || null,
        follow_up_date: editForm.follow_up_date   || null,
        notes:          editForm.notes.trim()     || null,
      })
      .eq("id", editingApp.id)
      .eq("user_id", user.id);
    setEditSubmitting(false);
    if (updateError) { setEditError("Failed to save changes. Please try again."); return; }
    closeEdit();
    await fetchApps();
  }

  /* ── Delete ─────────────────────────────────────────────────── */

  async function handleDelete(id: string) {
    if (!user) return;
    setDeletingId(id);
    const { error: deleteError } = await supabase
      .from("applications")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    setDeletingId(null);
    setConfirmDeleteId(null);
    if (deleteError) {
      console.error("Supabase delete failed for id:", id, deleteError.message);
      return;
    }
    await fetchApps();
  }

  /* ── Render ─────────────────────────────────────────────────── */

  if (!authLoading && !user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0b1a35] to-blue-950 pt-20 flex items-center justify-center px-4">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl ring-1 ring-white/[0.07] border border-slate-700/40 shadow-2xl shadow-black/40 p-10 w-full max-w-sm text-center">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
            <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/40">
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none" className="text-white">
                <rect x="3" y="3" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="1.8" />
                <circle cx="13" cy="11" r="3.5" stroke="currentColor" strokeWidth="1.8" />
                <path d="M6 22c0-3.5 3.1-6 7-6s7 2.5 7 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <h2 className="relative text-lg font-bold text-white mb-2">Sign in to access your dashboard</h2>
            <p className="relative text-sm text-slate-400 mb-7 leading-relaxed">
              Track your applications, monitor progress, and land more offers.
            </p>
            <button
              onClick={() => signInWithGoogle()}
              className="relative w-full inline-flex items-center justify-center gap-2.5
                         bg-white hover:bg-blue-50 border border-white/20 hover:border-blue-200
                         text-slate-700 hover:text-blue-700
                         px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                         shadow-sm hover:shadow-md"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      {/* ── Edit modal ───────────────────────────────────────────── */}
      {editingApp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeEdit(); }}
        >
          <div className="bg-[#0b1525] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60
                          w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            {/* Modal header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/[0.07]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-sm shadow-blue-500/30">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M9.5 1.5l3 3L4 13H1v-3L9.5 1.5z" stroke="white" strokeWidth="1.6"
                          strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-white">Edit Application</h2>
              </div>
              <button
                onClick={closeEdit}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4" noValidate>
              <FormField label="Company">
                <input type="text" placeholder="e.g. Google" value={editForm.company}
                  onChange={(e) => editField("company", e.target.value)} disabled={editSubmitting}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-slate-200
                             placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                             focus:border-blue-500/50 transition-all disabled:opacity-50" />
              </FormField>
              <FormField label="Role">
                <input type="text" placeholder="e.g. Software Engineer" value={editForm.role}
                  onChange={(e) => editField("role", e.target.value)} disabled={editSubmitting}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-slate-200
                             placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                             focus:border-blue-500/50 transition-all disabled:opacity-50" />
              </FormField>
              <FormField label="Date Applied">
                <input type="date" value={editForm.date_applied}
                  onChange={(e) => editField("date_applied", e.target.value)} disabled={editSubmitting}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-slate-300
                             focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
                             transition-all disabled:opacity-50 [color-scheme:dark]" />
              </FormField>
              <FormField label="Status">
                <select value={editForm.status} onChange={(e) => editField("status", e.target.value)}
                  disabled={editSubmitting}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-slate-300
                             appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
                             transition-all disabled:opacity-50 [color-scheme:dark]">
                  <option value="Interested">Interested</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </FormField>
              <FormField label="Job Link (optional)">
                <input type="url" placeholder="https://company.com/jobs/..." value={editForm.job_link}
                  onChange={(e) => editField("job_link", e.target.value)} disabled={editSubmitting}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-slate-200
                             placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                             focus:border-blue-500/50 transition-all disabled:opacity-50" />
              </FormField>
              <FormField label="Follow-Up Date (optional)">
                <input type="date" value={editForm.follow_up_date}
                  onChange={(e) => editField("follow_up_date", e.target.value)} disabled={editSubmitting}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-slate-300
                             focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
                             transition-all disabled:opacity-50 [color-scheme:dark]" />
              </FormField>
              <FormField label="Notes (optional)">
                <textarea placeholder="Interview prep, contacts, next steps…" value={editForm.notes}
                  onChange={(e) => editField("notes", e.target.value)} disabled={editSubmitting} rows={3}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-slate-200
                             placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                             focus:border-blue-500/50 transition-all disabled:opacity-50 resize-none" />
              </FormField>

              {editError && <p className="text-xs text-red-400 font-medium">{editError}</p>}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={closeEdit} disabled={editSubmitting}
                  className="flex-1 border border-white/[0.10] text-slate-400 hover:border-white/[0.18] hover:text-slate-200 hover:bg-white/[0.04]
                             py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={editSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed
                             text-white py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                             shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30
                             flex items-center justify-center gap-2">
                  {editSubmitting && (
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  )}
                  {editSubmitting ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#050b1a] pt-20 relative">

        {/* Ambient glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]
                        bg-blue-700/[0.06] rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px]
                        bg-violet-700/[0.04] rounded-full blur-[80px] pointer-events-none" />

        {/* Premium header band */}
        <div className="relative bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border-b border-slate-800/60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <FadeUp>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 bg-blue-500/15 border border-blue-400/20 text-blue-300 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block animate-pulse" />
                  Dashboard
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Applications Dashboard</h1>
              <p className="text-slate-400 mt-1 text-sm">
                Track and manage all your job applications in one place.
              </p>
            </FadeUp>
          </div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pb-12 pt-8">

          {/* ── Stats row ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <FadeUp delay={0}>
              <StatCard label="Total Applications" value={stats.total} accent="blue"
                icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="3" y="2" width="14" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>} />
            </FadeUp>
            <FadeUp delay={75}>
              <StatCard label="Response Rate" value={`${stats.responseRate}%`} accent="emerald"
                icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 15l4-5 4 3 4-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M14 7h3v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>} />
            </FadeUp>
            <FadeUp delay={150}>
              <StatCard label="Interviews" value={stats.interviews} accent="amber"
                icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M3.5 17c0-3.5 2.9-6 6.5-6s6.5 2.5 6.5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>} />
            </FadeUp>
            <FadeUp delay={225}>
              <StatCard label="Offers" value={stats.offers} accent="violet"
                icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10.5l4 4 8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>} />
            </FadeUp>
          </div>

          {/* ── Main grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Table column */}
            <FadeUp className="lg:col-span-2 flex flex-col gap-4">

              {/* Filter tabs + sort */}
              <div className="flex items-center gap-2 flex-wrap">
                {FILTER_OPTIONS.map((opt) => (
                  <button key={opt} onClick={() => setFilter(opt)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      filter === opt
                        ? "bg-blue-500/[0.12] border border-blue-500/[0.25] text-blue-400"
                        : "bg-white/[0.04] border border-white/[0.07] text-slate-500 hover:border-white/[0.14] hover:text-slate-300"
                    }`}>
                    {opt}
                  </button>
                ))}
                <div className="ml-auto flex items-center gap-3">
                  {!loading && (
                    <span className="text-xs text-slate-600 font-medium">
                      {sorted.length} result{sorted.length !== 1 ? "s" : ""}
                    </span>
                  )}
                  <div className="relative">
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as SortOption)}
                      className="appearance-none text-xs bg-white/[0.04] border border-white/[0.07] rounded-lg pl-3 pr-7 py-1.5
                                 text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40
                                 focus:border-blue-500/40 cursor-pointer hover:border-white/[0.14] transition-colors [color-scheme:dark]"
                    >
                      <option value="newest">Newest first</option>
                      <option value="oldest">Oldest first</option>
                      <option value="az">Company A–Z</option>
                      <option value="status">Status</option>
                    </select>
                    <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500"
                         width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Table card */}
              <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.07] overflow-hidden
                              transition-shadow duration-300 hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4)]">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                        <th className="text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider px-5 py-3.5">Company</th>
                        <th className="text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider px-5 py-3.5">Role</th>
                        <th className="text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider px-5 py-3.5 hidden sm:table-cell">Date Applied</th>
                        <th className="text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider px-5 py-3.5 hidden md:table-cell">Follow-Up</th>
                        <th className="text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider px-5 py-3.5">Status</th>
                        <th className="text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider px-5 py-3.5 w-36">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="py-16">
                            <div className="flex flex-col items-center gap-3">
                              <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-400 rounded-full animate-spin" />
                              <span className="text-sm text-slate-600">Loading applications…</span>
                            </div>
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td colSpan={6} className="py-16">
                            <div className="flex flex-col items-center gap-3">
                              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-red-500/50">
                                <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2" />
                                <path d="M16 10v7M16 21v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                              <span className="text-sm text-red-400">{error}</span>
                              <button onClick={fetchApps} className="text-xs text-blue-400 hover:text-blue-300 hover:underline font-medium transition-colors">Try again</button>
                            </div>
                          </td>
                        </tr>
                      ) : apps.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-20">
                            <div className="flex flex-col items-center gap-4">
                              <div className="w-16 h-16 bg-blue-500/[0.10] rounded-2xl flex items-center justify-center">
                                <svg width="30" height="30" viewBox="0 0 32 32" fill="none" className="text-blue-400">
                                  <rect x="5" y="4" width="22" height="24" rx="3" stroke="currentColor" strokeWidth="2" />
                                  <path d="M10 12h12M10 17h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                  <path d="M16 22v4M13.5 24.5l2.5 2.5 2.5-2.5" stroke="currentColor" strokeWidth="1.8"
                                        strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                              <div className="text-center">
                                <p className="text-sm font-semibold text-slate-300 mb-1">No applications yet</p>
                                <p className="text-xs text-slate-600 max-w-[240px] leading-relaxed">
                                  Start by adding your first application to track your progress.
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : sorted.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-16">
                            <div className="flex flex-col items-center gap-2">
                              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-slate-700">
                                <rect x="5" y="4" width="22" height="24" rx="3" stroke="currentColor" strokeWidth="2" />
                                <path d="M10 12h12M10 17h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                              <span className="text-sm text-slate-600">No applications match this filter.</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        sorted.map((app) => (
                          <tr key={app.id} className="hover:bg-white/[0.03] transition-colors duration-150 group">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2.5">
                                <CompanyLogo url={app.company_logo_url} name={app.company} />
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-sm font-semibold text-slate-200">{app.company}</span>
                                  {app.job_link && (
                                    <a href={app.job_link} target="_blank" rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                                      View Posting
                                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                        <path d="M2 8L8 2M8 2H5M8 2v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                    </a>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-400 max-w-[160px] truncate">{app.role}</td>
                            <td className="px-5 py-4 text-sm text-slate-500 hidden sm:table-cell whitespace-nowrap">
                              {formatDate(app.date_applied)}
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-500 hidden md:table-cell whitespace-nowrap">
                              {app.follow_up_date
                                ? formatDate(app.follow_up_date)
                                : <span className="text-slate-700">—</span>}
                            </td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[app.status].badge}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_STYLES[app.status].dot}`} />
                                {app.status}
                              </span>
                            </td>
                            {/* Actions */}
                            <td className="px-4 py-4">
                              {confirmDeleteId === app.id ? (
                                <div className="flex items-center gap-2 justify-end">
                                  <span className="text-xs text-slate-500 whitespace-nowrap font-medium">Delete?</span>
                                  <button
                                    onClick={() => handleDelete(app.id)}
                                    disabled={deletingId === app.id}
                                    className="text-xs font-semibold text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors"
                                  >
                                    {deletingId === app.id ? (
                                      <span className="w-3.5 h-3.5 border-2 border-red-500/40 border-t-red-400 rounded-full animate-spin inline-block" />
                                    ) : "Yes"}
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="text-xs font-semibold text-slate-600 hover:text-slate-400 transition-colors"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => openEdit(app)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                               text-blue-400 bg-blue-500/[0.08] hover:bg-blue-500/[0.15] border border-blue-500/[0.15]
                                               hover:border-blue-500/[0.30] transition-colors"
                                  >
                                    <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                                      <path d="M9.5 1.5l3 3L4 13H1v-3L9.5 1.5z" stroke="currentColor" strokeWidth="1.6"
                                            strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteId(app.id)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                                               text-red-400 bg-red-500/[0.08] hover:bg-red-500/[0.15] border border-red-500/[0.15]
                                               hover:border-red-500/[0.30] transition-colors"
                                  >
                                    <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                                      <path d="M2 3.5h10M5.5 3.5V2.5h3v1M11.5 3.5l-.8 8a1 1 0 01-1 .9H4.3a1 1 0 01-1-.9l-.8-8"
                                            stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Delete
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </FadeUp>

            {/* Add Application form */}
            <FadeUp delay={100}>
              <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.07] p-6 sticky top-24
                              transition-shadow duration-300 hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4)]">
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-sm shadow-blue-500/30">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 2v10M2 7h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h2 className="text-base font-bold text-white">Add Application</h2>
                </div>

                <form onSubmit={handleAdd} className="space-y-4" noValidate>
                  <FormField label="Company">
                    <input type="text" placeholder="e.g. Google" value={form.company}
                      onChange={(e) => field("company", e.target.value)} disabled={submitting}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-slate-200
                                 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                                 focus:border-blue-500/50 transition-all disabled:opacity-50" />
                  </FormField>
                  <FormField label="Role">
                    <input type="text" placeholder="e.g. Software Engineer" value={form.role}
                      onChange={(e) => field("role", e.target.value)} disabled={submitting}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-slate-200
                                 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                                 focus:border-blue-500/50 transition-all disabled:opacity-50" />
                  </FormField>
                  <FormField label="Date Applied">
                    <input type="date" value={form.date_applied}
                      onChange={(e) => field("date_applied", e.target.value)} disabled={submitting}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-slate-300
                                 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
                                 transition-all disabled:opacity-50 [color-scheme:dark]" />
                  </FormField>
                  <FormField label="Status">
                    <select value={form.status} onChange={(e) => field("status", e.target.value)}
                      disabled={submitting}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-slate-300
                                 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
                                 transition-all appearance-none disabled:opacity-50 [color-scheme:dark]">
                      <option value="Interested">Interested</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Applied">Applied</option>
                      <option value="Interview">Interview</option>
                      <option value="Offer">Offer</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </FormField>
                  <FormField label="Job Link (optional)">
                    <input type="url" placeholder="https://company.com/jobs/..." value={form.job_link}
                      onChange={(e) => field("job_link", e.target.value)} disabled={submitting}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-slate-200
                                 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                                 focus:border-blue-500/50 transition-all disabled:opacity-50" />
                  </FormField>
                  <FormField label="Follow-Up Date (optional)">
                    <input type="date" value={form.follow_up_date}
                      onChange={(e) => field("follow_up_date", e.target.value)} disabled={submitting}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-slate-300
                                 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
                                 transition-all disabled:opacity-50 [color-scheme:dark]" />
                  </FormField>
                  <FormField label="Notes (optional)">
                    <textarea placeholder="Interview prep, contacts, next steps…" value={form.notes}
                      onChange={(e) => field("notes", e.target.value)} disabled={submitting} rows={3}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-slate-200
                                 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                                 focus:border-blue-500/50 transition-all disabled:opacity-50 resize-none" />
                  </FormField>

                  {formError && <p className="text-xs text-red-400 font-medium">{formError}</p>}

                  <button type="submit" disabled={submitting}
                    className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-60
                               disabled:cursor-not-allowed text-white py-2.5 rounded-xl text-sm font-semibold
                               transition-all duration-200 shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30
                               mt-1 flex items-center justify-center gap-2">
                    {submitting && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                    {submitting ? "Adding…" : "Add Application"}
                  </button>
                </form>

                {/* Status legend */}
                <div className="mt-6 pt-5 border-t border-white/[0.06]">
                  <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-3">
                    Status Legend
                  </p>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-3">
                    {(Object.keys(STATUS_STYLES) as Status[]).map((s) => (
                      <div key={s} className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${STATUS_STYLES[s].dot}`} />
                        <span className="text-xs text-slate-500 font-medium">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeUp>

          </div>
        </div>
      </div>
    </>
  );
}

/* ── Sub-components ─────────────────────────────────────────────── */

const ACCENT_CLASSES = {
  blue: {
    card:    "border border-blue-500/[0.18] bg-blue-500/[0.07]",
    glow:    "hover:shadow-[0_8px_32px_-8px_rgba(59,130,246,0.25)]",
    iconBg:  "bg-blue-500/[0.15]",
    iconColor: "text-blue-400",
  },
  emerald: {
    card:    "border border-emerald-500/[0.18] bg-emerald-500/[0.07]",
    glow:    "hover:shadow-[0_8px_32px_-8px_rgba(16,185,129,0.25)]",
    iconBg:  "bg-emerald-500/[0.15]",
    iconColor: "text-emerald-400",
  },
  amber: {
    card:    "border border-amber-500/[0.18] bg-amber-500/[0.07]",
    glow:    "hover:shadow-[0_8px_32px_-8px_rgba(245,158,11,0.25)]",
    iconBg:  "bg-amber-500/[0.15]",
    iconColor: "text-amber-400",
  },
  violet: {
    card:    "border border-violet-500/[0.18] bg-violet-500/[0.07]",
    glow:    "hover:shadow-[0_8px_32px_-8px_rgba(139,92,246,0.25)]",
    iconBg:  "bg-violet-500/[0.15]",
    iconColor: "text-violet-400",
  },
};

function StatCard({ label, value, accent, icon }: {
  label: string; value: string | number;
  accent: keyof typeof ACCENT_CLASSES; icon: React.ReactNode;
}) {
  const c = ACCENT_CLASSES[accent];
  return (
    <div className={`rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 cursor-default ${c.card} ${c.glow}`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${c.iconBg} ${c.iconColor}`}>{icon}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs font-medium mt-0.5 text-slate-500">{label}</div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1.5 tracking-wide">{label}</label>
      {children}
    </div>
  );
}

const LOGO_FALLBACK_COLORS = [
  "bg-blue-500/[0.15] text-blue-400",
  "bg-violet-500/[0.15] text-violet-400",
  "bg-emerald-500/[0.15] text-emerald-400",
  "bg-amber-500/[0.15] text-amber-400",
  "bg-rose-500/[0.15] text-rose-400",
  "bg-sky-500/[0.15] text-sky-400",
];

function CompanyLogo({ url, name }: { url: string | null; name: string }) {
  const initial    = (name.trim()[0] ?? "?").toUpperCase();
  const colorClass = LOGO_FALLBACK_COLORS[name.charCodeAt(0) % LOGO_FALLBACK_COLORS.length];
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className="w-8 h-8 rounded-lg object-contain border border-white/[0.08] bg-white/[0.04] flex-shrink-0"
        onError={(e) => { e.currentTarget.style.display = "none"; }}
      />
    );
  }
  return (
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${colorClass}`}>
      {initial}
    </div>
  );
}
