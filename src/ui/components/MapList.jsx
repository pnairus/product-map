"use client";

import { useEffect, useState } from "react";

export default function MapList({ selectedMapId, onSelectMap, refreshToken }) {
  const [maps, setMaps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newName, setNewName] = useState("");
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("default");

  async function fetchMaps() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/maps");
      if (!response.ok) {
        throw new Error("Failed to load maps.");
      }
      const data = await response.json();
      setMaps(data);
    } catch (err) {
      setError(err.message || "Failed to load maps.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMaps();
  }, [refreshToken]);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const response = await fetch("/api/templates");
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        setTemplates(data);
        if (data.some((template) => template.id === "default")) {
          setSelectedTemplate("default");
        } else if (data.length) {
          setSelectedTemplate(data[0].id);
        }
      } catch (err) {
        // silently ignore template load errors for MVP
      }
    }

    fetchTemplates();
  }, []);

  async function handleCreate() {
    const name = newName.trim();
    if (!name) {
      setError("Enter a map name to create.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/maps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, templateId: selectedTemplate })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Failed to create map.");
      }

      const created = await response.json();
      setNewName("");
      await fetchMaps();
      onSelectMap(created.id);
    } catch (err) {
      setError(err.message || "Failed to create map.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(mapId) {
    const confirmed = window.confirm("Delete this map? This cannot be undone.");
    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/maps/${mapId}`, { method: "DELETE" });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Failed to delete map.");
      }
      if (selectedMapId === mapId) {
        onSelectMap(null);
      }
      await fetchMaps();
    } catch (err) {
      setError(err.message || "Failed to delete map.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded border border-slate-200 p-4">
      <h2 className="text-lg font-medium">Maps</h2>
      <div className="mt-4 space-y-2">
        <input
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          placeholder="New map name"
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
        />
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-500">
            Template
          </label>
          <select
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            value={selectedTemplate}
            onChange={(event) => setSelectedTemplate(event.target.value)}
          >
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
          {templates.length ? (
            <p className="text-xs text-slate-500">
              {templates.find((t) => t.id === selectedTemplate)?.description}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          className="w-full rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white"
          onClick={handleCreate}
          disabled={loading}
        >
          Create Map
        </button>
        <button
          type="button"
          className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
          onClick={fetchMaps}
          disabled={loading}
        >
          Refresh List
        </button>
      </div>

      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      {loading ? <p className="mt-3 text-sm text-slate-500">Loading...</p> : null}

      <ul className="mt-4 space-y-2">
        {maps.map((map) => {
          const selected = map.id === selectedMapId;
          return (
            <li key={map.id}>
              <div
                className={`flex items-center justify-between gap-2 rounded border px-3 py-2 text-left text-sm ${
                  selected
                    ? "border-slate-900 bg-slate-100"
                    : "border-slate-200 hover:border-slate-400"
                }`}
              >
                <button
                  type="button"
                  className="flex-1 text-left"
                  onClick={() => onSelectMap(map.id)}
                >
                  <div className="font-medium">{map.name}</div>
                </button>
                <button
                  type="button"
                  className="rounded border border-slate-300 px-2 py-1 text-xs"
                  onClick={() => handleDelete(map.id)}
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
