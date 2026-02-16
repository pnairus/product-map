"use client";

import { useState } from "react";

export default function StageHeader({ stage, onRename }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(stage.name);

  function handleSave() {
    const name = draft.trim();
    if (!name) return;
    onRename(stage.id, name);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="space-y-1">
        <input
          className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <div className="flex gap-1">
          <button
            type="button"
            className="rounded bg-slate-900 px-2 py-1 text-xs text-white"
            onClick={handleSave}
          >
            Save
          </button>
          <button
            type="button"
            className="rounded border border-slate-300 px-2 py-1 text-xs"
            onClick={() => {
              setDraft(stage.name);
              setEditing(false);
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="font-medium">{stage.name}</span>
      <button
        type="button"
        className="rounded border border-slate-300 px-2 py-1 text-xs"
        onClick={() => setEditing(true)}
      >
        Rename
      </button>
    </div>
  );
}
