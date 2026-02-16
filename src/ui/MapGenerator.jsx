"use client";

import { useState } from "react";

const PLACEHOLDER =
  "Paste your product idea, user journey, JTBD, or research notes.\n\nExample:\nUser wants to book a business hotel. They search options, compare hotels, and book. Pain points include too many options and unclear pricing.";

export default function MapGenerator({ onGenerated }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/maps/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Failed to generate map.");
      }

      const map = await response.json();
      setText("");
      if (onGenerated) {
        onGenerated(map);
      }
    } catch (err) {
      setError(err.message || "Failed to generate map.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded border border-slate-200 p-6">
      <h2 className="text-lg font-medium">Generate Map from Text</h2>
      <p className="mt-1 text-sm text-slate-600">
        Paste your notes and generate a structured map instantly.
      </p>
      <textarea
        className="mt-4 w-full rounded border border-slate-300 p-3 text-sm"
        rows={6}
        placeholder={PLACEHOLDER}
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Map"}
        </button>
        {error ? <span className="text-sm text-red-600">{error}</span> : null}
      </div>
    </section>
  );
}
