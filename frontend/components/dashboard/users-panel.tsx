"use client";

import { useEffect, useState, type FormEvent } from "react";
import { RefreshCw, Trash2, UserPlus, Users } from "lucide-react";
import {
  addUserAction,
  listUsersAction,
  removeUserAction,
} from "@/app/actions/dashboard";
import type { UserRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

function Avatar({ email, className }: { email: string; className?: string }) {
  const initial = email.trim().charAt(0).toUpperCase() || "U";

  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-sm font-semibold text-white",
        className,
      )}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}

export function UsersPanel({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formBusy, setFormBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  async function load() {
    const data = await listUsersAction();
    setUsers(data);
  }

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await listUsersAction();
        if (active) setUsers(data);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  async function handleAddUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormBusy(true);
    setFormError(null);
    setFormSuccess(null);

    const result = await addUserAction(email.trim(), password);

    if (result.ok) {
      setEmail("");
      setPassword("");
      setFormSuccess("User added successfully.");
      await load();
    } else {
      setFormError(result.error ?? "Failed to add user.");
    }

    setFormBusy(false);
  }

  async function handleRemove(id: string) {
    if (
      !window.confirm("Remove this user? Their sessions will be invalidated.")
    ) {
      return;
    }

    setBusyId(id);
    const result = await removeUserAction(id);

    if (result.ok) {
      await load();
    } else {
      window.alert(result.error ?? "Failed to remove user.");
    }

    setBusyId(null);
  }

  return (
    <div className="glass rounded-3xl p-6 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-950/50">
            <Users className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-white">Users</h2>
            <p className="mt-0.5 text-sm text-zinc-400">
              Manage workspace members
            </p>
          </div>
        </div>

        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300">
          {users.length} {users.length === 1 ? "member" : "members"}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Add user */}
        <form
          onSubmit={handleAddUser}
          className="rounded-2xl border border-white/8 bg-white/[0.02] p-5"
        >
          <p className="flex items-center gap-2 text-sm font-semibold text-zinc-200">
            <UserPlus className="h-4 w-4 text-sky-300" />
            Add member
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Create an account for a new workspace member.
          </p>

          <div className="mt-4 space-y-3">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
              required
              className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-zinc-100 placeholder:text-zinc-500 transition-colors focus:border-sky-400/40 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password (min 8 characters)"
              minLength={8}
              required
              className="h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-zinc-100 placeholder:text-zinc-500 transition-colors focus:border-sky-400/40 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
            />
          </div>

          {formError ? (
            <p className="mt-3 text-xs text-rose-300">{formError}</p>
          ) : null}
          {formSuccess ? (
            <p className="mt-3 text-xs text-emerald-300">{formSuccess}</p>
          ) : null}

          <button
            type="submit"
            disabled={formBusy}
            className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-sky-500 to-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-sky-950/40 transition-all hover:from-sky-400 hover:to-indigo-500 disabled:opacity-50"
          >
            {formBusy ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            {formBusy ? "Adding…" : "Add member"}
          </button>
        </form>

        {/* Member list */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="skeleton h-16 rounded-2xl"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="flex h-full min-h-40 items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-zinc-500">
              No members yet.
            </div>
          ) : (
            <ul className="space-y-3">
              {users.map((user) => {
                const isCurrent = user.id === currentUserId;

                return (
                  <li
                    key={user.id}
                    className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.02] p-3.5 transition-colors hover:border-white/15"
                  >
                    <Avatar email={user.email} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-100">
                        {user.email}
                      </p>
                      <p className="text-xs text-zinc-500">
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {isCurrent ? (
                      <span className="rounded-full bg-indigo-500/15 px-2.5 py-1 text-xs font-medium text-indigo-300 ring-1 ring-inset ring-indigo-400/20">
                        You
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void handleRemove(user.id)}
                        disabled={busyId === user.id}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-rose-400/25 px-2.5 text-xs font-medium text-rose-300 transition-colors hover:bg-rose-500/10 disabled:opacity-50"
                      >
                        {busyId === user.id ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2
                            className="
h-3.5 w-3.5"
                          />
                        )}
                        Remove
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
