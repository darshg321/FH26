import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addAdmin,
  fetchAdmins,
  fetchInterest2027,
  removeAdmin,
} from "../../tools/firebase";
import {
  signInWithGoogle,
  signOutOfGoogle,
  subscribeToAuth,
} from "../../tools/auth";
import MinecraftNumbers from "../../components/MinecraftNumbers";
import { BOOTSTRAP_ADMINS } from "../../data/bootstrapAdmins";

/**
 * The 2027 interest list.
 *
 * Access is decided by firestore.rules, not by this page: every read here needs
 * a signed-in Google account whose lowercased email has a document in /admins.
 * The UI below only reflects that answer — a non-admin who bypasses the screens
 * still gets nothing back from Firestore.
 */

const COLUMNS = [
  { key: "fullName", label: "Full name" },
  { key: "email", label: "Email" },
  { key: "grade", label: "Grade" },
  { key: "school", label: "School" },
  { key: "submittedAt", label: "Submitted" },
];

/** serverTimestamp() reads back as a Firestore Timestamp, and as null until it lands. */
const toDate = (value) => {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate();
  if (typeof value.seconds === "number") return new Date(value.seconds * 1000);

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDate = (value) => {
  const date = toDate(value);
  if (!date) return "";

  return date.toLocaleString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const cellText = (row, key) =>
  key === "submittedAt" ? formatDate(row[key]) : String(row[key] ?? "");

/** Quote everything, and defuse leading =/+/-/@ so Excel treats them as text. */
const csvCell = (value) => {
  const text = String(value ?? "");
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;

  return `"${safe.replaceAll('"', '""')}"`;
};

const toCsv = (rows) =>
  [
    COLUMNS.map((c) => csvCell(c.label)).join(","),
    ...rows.map((row) =>
      COLUMNS.map((c) => csvCell(cellText(row, c.key))).join(","),
    ),
  ].join("\r\n");

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

/** Firebase error codes that mean something a person can act on. */
const describeError = (err) => {
  switch (err?.code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Sign-in was cancelled.";
    case "auth/popup-blocked":
      return "Your browser blocked the sign-in popup. Allow popups for this site and try again.";
    case "auth/operation-not-allowed":
      return "Google sign-in isn't enabled for this Firebase project yet (Authentication > Sign-in method).";
    case "auth/unauthorized-domain":
      return "This domain isn't in the Firebase Auth authorized domains list.";
    case "permission-denied":
      return "Firestore refused that: your account is not on the admin list, or the rules haven't been deployed.";
    default:
      return err?.message || "Something went wrong.";
  }
};

function Shell({ children }) {
  return (
    <div className="w-screen min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6">
        {children}
      </div>
    </div>
  );
}

function SignInScreen({ onSignIn, busy, error }) {
  return (
    <Shell>
      <h1 className="text-2xl font-bold mb-1">Admin</h1>
      <p className="text-sm text-white/60 mb-5">
        FraserHacks <MinecraftNumbers>2027</MinecraftNumbers> interest list.
        Sign in with an approved Google account.
      </p>

      <button
        type="button"
        onClick={onSignIn}
        disabled={busy}
        className="w-full px-4 py-3 rounded-lg bg-white text-black font-bold hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {busy ? "Opening Google..." : "Sign in with Google"}
      </button>

      {error && <div className="mt-4 text-sm text-red-300">{error}</div>}
    </Shell>
  );
}

function DeniedScreen({ email, onSignOut, detail }) {
  return (
    <Shell>
      <h1 className="text-2xl font-bold mb-1">Not an admin</h1>
      <p className="text-sm text-white/60 mb-2">
        <span className="text-white/90">{email}</span> isn't on the admin list,
        so Firestore won't return the signups.
      </p>
      <p className="text-xs text-white/40 mb-5">{detail}</p>

      <button
        type="button"
        onClick={onSignOut}
        className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 font-bold hover:bg-white/10"
      >
        Sign out and try another account
      </button>
    </Shell>
  );
}

function AdminList({ admins, currentEmail, onAdd, onRemove, busy }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState("");

  // Bootstrap admins come from firestore.rules, so they can't be removed here.
  const entries = [
    ...BOOTSTRAP_ADMINS.map((e) => ({ email: e, fromRules: true })),
    ...admins.filter((a) => !BOOTSTRAP_ADMINS.includes(a.email)),
  ];

  const submit = async (e) => {
    e.preventDefault();

    const value = email.trim().toLowerCase();
    if (!isEmail(value)) {
      setError("Enter a valid email address.");
      return;
    }
    if (entries.some((a) => a.email === value)) {
      setError("That account is already an admin.");
      return;
    }

    setError("");
    const failure = await onAdd(value);
    if (failure) setError(failure);
    else setEmail("");
  };

  return (
    <section className="mt-8 rounded-2xl border border-white/10 p-4 md:p-5">
      <h2 className="text-lg font-bold">Admins</h2>
      <p className="text-sm text-white/50 mt-1 mb-4">
        Google accounts allowed to read this list. Enforced by the Firestore
        rules, so removing someone here revokes their access immediately.
      </p>

      <ul className="mb-4 divide-y divide-white/5">
        {entries.map((admin) => (
          <li
            key={admin.email}
            className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm"
          >
            <span className="break-all">
              {admin.email}
              {admin.email === currentEmail && (
                <span className="ml-2 text-xs text-white/40">(you)</span>
              )}
            </span>

            {admin.fromRules ? (
              <span className="text-xs text-white/40">
                in firestore.rules
              </span>
            ) : confirming === admin.email ? (
              <span className="flex items-center gap-2">
                <span className="text-xs text-amber-300">
                  {admin.email === currentEmail
                    ? "This locks you out. Sure?"
                    : "Remove?"}
                </span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={async () => {
                    await onRemove(admin.email);
                    setConfirming("");
                  }}
                  className="px-2 py-1 rounded-md text-xs font-bold bg-red-600 hover:bg-red-500 disabled:opacity-50"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming("")}
                  className="px-2 py-1 rounded-md text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10"
                >
                  Cancel
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setConfirming(admin.email)}
                className="px-2 py-1 rounded-md text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10"
              >
                Remove
              </button>
            )}
          </li>
        ))}

        {entries.length === 0 && (
          <li className="py-2 text-sm text-white/40">No admins found.</li>
        )}
      </ul>

      <form onSubmit={submit} className="flex flex-wrap gap-2">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@gmail.com"
          className="min-w-0 flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
        />
        <button
          type="submit"
          disabled={busy}
          className="px-3 py-2 rounded-lg text-sm font-bold bg-white text-black hover:bg-white/90 disabled:opacity-50"
        >
          Add admin
        </button>
      </form>

      {error && <div className="mt-3 text-sm text-red-300">{error}</div>}
    </section>
  );
}

export default function Admin() {
  const [user, setUser] = useState(undefined); // undefined while auth resolves
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState("");

  const [access, setAccess] = useState("pending"); // pending | granted | denied
  const [deniedDetail, setDeniedDetail] = useState("");
  const [rows, setRows] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: "submittedAt", direction: "desc" });

  useEffect(() => subscribeToAuth(setUser), []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [signups, adminDocs] = await Promise.all([
        fetchInterest2027(),
        fetchAdmins(),
      ]);

      setRows(signups);
      setAdmins(adminDocs);
      setAccess("granted");
    } catch (err) {
      if (err?.code === "permission-denied") {
        setAccess("denied");
        setDeniedDetail(describeError(err));
      } else {
        setError(describeError(err));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setAccess("pending");
      setRows([]);
      setAdmins([]);
      return;
    }

    load();
  }, [user, load]);

  const handleSignIn = async () => {
    setSigningIn(true);
    setAuthError("");

    try {
      await signInWithGoogle();
    } catch (err) {
      setAuthError(describeError(err));
    } finally {
      setSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await signOutOfGoogle();
    setAccess("pending");
    setRows([]);
    setAdmins([]);
  };

  const handleAddAdmin = async (email) => {
    setBusy(true);

    try {
      await addAdmin(email, user?.email ?? null);
      setAdmins(await fetchAdmins());
      return "";
    } catch (err) {
      return describeError(err);
    } finally {
      setBusy(false);
    }
  };

  const handleRemoveAdmin = async (email) => {
    setBusy(true);
    setError("");

    try {
      await removeAdmin(email);
      setAdmins(await fetchAdmins());
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  };

  const visibleRows = useMemo(() => {
    const needle = query.trim().toLowerCase();

    const filtered = needle
      ? rows.filter((row) =>
          COLUMNS.some((c) => cellText(row, c.key).toLowerCase().includes(needle)),
        )
      : rows;

    const { key, direction } = sort;
    const factor = direction === "asc" ? 1 : -1;

    return [...filtered].sort((a, b) => {
      if (key === "submittedAt") {
        const at = toDate(a[key])?.getTime() ?? 0;
        const bt = toDate(b[key])?.getTime() ?? 0;
        return (at - bt) * factor;
      }

      if (key === "grade") {
        const an = Number(a[key]);
        const bn = Number(b[key]);
        if (!Number.isNaN(an) && !Number.isNaN(bn)) return (an - bn) * factor;
      }

      return cellText(a, key).localeCompare(cellText(b, key)) * factor;
    });
  }, [rows, query, sort]);

  const toggleSort = (key) =>
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: key === "submittedAt" ? "desc" : "asc" },
    );

  const exportCsv = () => {
    // BOM so Excel opens the file as UTF-8.
    const blob = new Blob(["﻿", toCsv(visibleRows)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `fraserhacks-2027-interest-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  if (user === undefined) {
    return (
      <Shell>
        <div className="text-sm text-white/60">Checking sign-in...</div>
      </Shell>
    );
  }

  if (user === null) {
    return (
      <SignInScreen
        onSignIn={handleSignIn}
        busy={signingIn}
        error={authError}
      />
    );
  }

  if (access === "denied") {
    return (
      <DeniedScreen
        email={user.email}
        detail={deniedDetail}
        onSignOut={handleSignOut}
      />
    );
  }

  if (access === "pending") {
    return (
      <Shell>
        <div className="text-sm text-white/60">Checking access...</div>
      </Shell>
    );
  }

  return (
    <div className="w-screen min-h-screen bg-neutral-950 text-white p-4 md:p-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              FraserHacks <MinecraftNumbers>2027</MinecraftNumbers> interest
            </h1>
            <p className="text-sm text-white/60 mt-1">
              <MinecraftNumbers>{String(visibleRows.length)}</MinecraftNumbers>{" "}
              {visibleRows.length === 1 ? "signup" : "signups"}
              {query.trim() && (
                <>
                  {" "}
                  of <MinecraftNumbers>{String(rows.length)}</MinecraftNumbers>
                </>
              )}
              <span className="text-white/30"> · {user.email}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="px-3 py-2 rounded-lg text-sm font-bold bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
            <button
              type="button"
              onClick={exportCsv}
              disabled={visibleRows.length === 0}
              className="px-3 py-2 rounded-lg text-sm font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="px-3 py-2 rounded-lg text-sm font-bold bg-white/5 border border-white/10 hover:bg-white/10"
            >
              Sign out
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead className="bg-white/5">
              <tr>
                {COLUMNS.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={
                      sort.key === column.key
                        ? sort.direction === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                    className="border-b border-white/10 p-0 text-left font-bold"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(column.key)}
                      className="w-full px-4 py-3 text-left hover:bg-white/5"
                    >
                      {column.label}
                      <span className="ml-1 text-white/40">
                        {sort.key === column.key
                          ? sort.direction === "asc"
                            ? "▲"
                            : "▼"
                          : ""}
                      </span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.id} className="odd:bg-white/[0.02] hover:bg-white/5">
                  {COLUMNS.map((column) => (
                    <td
                      key={column.key}
                      className="border-b border-white/5 px-4 py-3 align-top break-words"
                    >
                      <MinecraftNumbers>
                        {cellText(row, column.key)}
                      </MinecraftNumbers>
                    </td>
                  ))}
                </tr>
              ))}

              {!loading && visibleRows.length === 0 && (
                <tr>
                  <td
                    colSpan={COLUMNS.length}
                    className="px-4 py-10 text-center text-white/50"
                  >
                    {rows.length === 0
                      ? "No signups yet."
                      : "Nothing matches that search."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <AdminList
          admins={admins}
          currentEmail={user.email?.toLowerCase()}
          onAdd={handleAddAdmin}
          onRemove={handleRemoveAdmin}
          busy={busy}
        />
      </div>
    </div>
  );
}
