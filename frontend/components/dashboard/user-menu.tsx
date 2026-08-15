"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { ModelSelector } from "./model-selector";

interface UserMenuProps {
  email: string;
}

function Avatar({ email, className }: { email: string; className?: string }) {
  const initial = email.trim().charAt(0).toUpperCase() || "U";

  return (
    <span
      className={`flex items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-violet-600 text-sm font-semibold text-white shadow-sm ${className ?? ""}`}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}

function SignOutRow() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
    >
      <LogOut className="h-4 w-4" />
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}

export function UserMenu({ email }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="rounded-full transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
      >
        <Avatar email={email} className="h-9 w-9" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-zinc-200 bg-white p-3 shadow-lg"
        >
          <div className="flex items-center gap-3 border-b border-zinc-100 px-1 pb-3">
            <Avatar email={email} className="h-10 w-10" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-900">
                {email}
              </p>
              <p className="text-xs text-zinc-500">Settings</p>
            </div>
          </div>

          <div className="px-1 py-3">
            <ModelSelector />
          </div>

          <div className="border-t border-zinc-100 px-1 pt-2">
            <form action={logoutAction}>
              <SignOutRow />
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
