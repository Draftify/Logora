"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Bot, RefreshCw, Send, Sparkles } from "lucide-react";
import { sendAgentMessageAction } from "@/app/actions/dashboard";
import type { AgentMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Summarize my queue",
  "What should I look out for?",
  "Explain my recent analyses",
];

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1 py-1">
      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce" />
    </span>
  );
}

export function AgentChat() {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const history = messages.slice(-20);
    const userMessage: AgentMessage = { role: "user", content: trimmed };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    const result = await sendAgentMessageAction(trimmed, history);

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: result.reply ?? result.error ?? "Something went wrong.",
      },
    ]);
    setSending(false);

    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void send(input);
  }

  return (
    <div className="glass rounded-3xl p-6 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-fuchsia-500 to-violet-600 text-white shadow-lg shadow-fuchsia-950/50">
            <Bot className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0a0e1a]" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-white">Agent</h2>
            <p className="mt-0.5 text-sm text-zinc-400">
              Ask questions about your pipeline and analyses
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-400">
          <Sparkles className="h-3.5 w-3.5 text-violet-300" />
          DeepSeek
        </span>
      </div>

      <div
        ref={scrollRef}
        className="mt-6 flex max-h-[28rem] min-h-[18rem] flex-col gap-3 overflow-y-auto pr-1"
      >
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-zinc-500 ring-1 ring-white/10">
              <Bot className="h-7 w-7" />
            </span>
            <div>
              <p className="text-sm font-medium text-zinc-200">
                How can I help you today?
              </p>
              <p className="mt-1 max-w-sm text-sm text-zinc-500">
                Try one of these, or ask anything about your event pipeline.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => void send(suggestion)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-white"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isUser = message.role === "user";

            return (
              <div
                key={`${message.role}-${index}`}
                className={cn(
                  "flex animate-fade-up",
                  isUser ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    isUser
                      ? "rounded-br-sm bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-950/40"
                      : "rounded-bl-sm border border-white/8 bg-white/[0.04] text-zinc-200",
                  )}
                >
                  {message.content}
                </div>
              </div>
            );
          })
        )}

        {sending ? (
          <div className="flex justify-start animate-fade-in">
            <div className="rounded-2xl rounded-bl-sm border border-white/8 bg-white/[0.04] px-4 py-2.5">
              <TypingDots />
            </div>
          </div>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="mt-4">
        <div className="flex items-end gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-2 transition-colors focus-within:border-violet-400/40">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void send(input);
              }
            }}
            rows={1}
            placeholder="Message the agent…"
            className="max-h-32 min-h-[2.5rem] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={sending || input.trim().length === 0}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-950/40 transition-all hover:from-indigo-400 hover:to-violet-500 disabled:opacity-40"
            aria-label="Send message"
          >
            {sending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
