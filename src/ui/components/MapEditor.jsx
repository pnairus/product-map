"use client";

import { useEffect, useMemo, useState } from "react";
import MapGrid from "./MapGrid.jsx";

const ROW_TYPES = [
  "goal",
  "job",
  "action",
  "pain",
  "opportunity",
  "solution",
  "emotion",
  "touchpoint",
  "metric",
  "custom"
];

function buildCellKey(stageId, rowId) {
  return `${stageId}:${rowId}`;
}

function findCell(map, stageId, rowId) {
  return map.cells.find(
    (cell) => cell.stage_id === stageId && cell.row_id === rowId
  );
}

function createCell(stageId, rowId, content) {
  const timestamp = new Date().toISOString();
  return {
    id: globalThis.crypto?.randomUUID?.() || `cell-${Date.now()}`,
    stage_id: stageId,
    row_id: rowId,
    content,
    created_at: timestamp,
    updated_at: timestamp
  };
}

function createId(prefix) {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function MapEditor({ mapId }) {
  const [map, setMap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [draftText, setDraftText] = useState("");
  const [newStageName, setNewStageName] = useState("");
  const [newRowName, setNewRowName] = useState("");
  const [newRowType, setNewRowType] = useState("goal");

  useEffect(() => {
    if (!mapId) {
      setMap(null);
      return;
    }

    async function fetchMap() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/maps/${mapId}`);
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || "Failed to load map.");
        }
        const data = await response.json();
        setMap(data);
      } catch (err) {
        setError(err.message || "Failed to load map.");
      } finally {
        setLoading(false);
      }
    }

    fetchMap();
  }, [mapId]);

  const cellLookup = useMemo(() => {
    if (!map) return new Map();
    const lookup = new Map();
    map.cells.forEach((cell) => {
      lookup.set(buildCellKey(cell.stage_id, cell.row_id), cell);
    });
    return lookup;
  }, [map]);

  async function handleSaveMap() {
    if (!map) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/maps/${map.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(map)
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Failed to save map.");
      }

      const data = await response.json();
      setMap(data);
    } catch (err) {
      setError(err.message || "Failed to save map.");
    } finally {
      setSaving(false);
    }
  }

  async function handleExportCsv() {
    if (!map) return;
    setExporting(true);
    setError("");
    try {
      const response = await fetch(`/api/maps/${map.id}?format=csv`);
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Failed to export map.");
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `product-map-${map.id}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Failed to export map.");
    } finally {
      setExporting(false);
    }
  }

  function handleStartEdit(stageId, rowId) {
    if (!map) return;
    const cell = findCell(map, stageId, rowId);
    setEditing({
      stageId,
      rowId,
      content: cell?.content || ""
    });
    setDraftText(cell?.content || "");
  }

  function handleCancelEdit() {
    setEditing(null);
    setDraftText("");
  }

  function handleSaveCell(newContent) {
    if (!map || !editing) return;
    setMap((prev) => {
      if (!prev) return prev;
      const updatedAt = new Date().toISOString();
      const cells = [...prev.cells];
      const existingIndex = cells.findIndex(
        (cell) =>
          cell.stage_id === editing.stageId && cell.row_id === editing.rowId
      );

      if (existingIndex >= 0) {
        cells[existingIndex] = {
          ...cells[existingIndex],
          content: newContent,
          updated_at: updatedAt
        };
      } else {
        cells.push(createCell(editing.stageId, editing.rowId, newContent));
      }

      return {
        ...prev,
        cells,
        updated_at: updatedAt
      };
    });
    setEditing(null);
    setDraftText("");
  }

  function handleAddStage() {
    const name = newStageName.trim();
    if (!name || !map) return;
    setMap((prev) => {
      if (!prev) return prev;
      const nextOrder =
        prev.stages.reduce((max, stage) => Math.max(max, stage.order || 0), 0) +
        1;
      const updatedAt = new Date().toISOString();
      return {
        ...prev,
        stages: [
          ...prev.stages,
          {
            id: createId("stage"),
            name,
            order: nextOrder
          }
        ],
        updated_at: updatedAt
      };
    });
    setNewStageName("");
  }

  function handleAddRow() {
    const name = newRowName.trim();
    if (!name || !map) return;
    setMap((prev) => {
      if (!prev) return prev;
      const nextOrder =
        prev.rows.reduce((max, row) => Math.max(max, row.order || 0), 0) + 1;
      const updatedAt = new Date().toISOString();
      return {
        ...prev,
        rows: [
          ...prev.rows,
          {
            id: createId("row"),
            name,
            type: newRowType,
            order: nextOrder
          }
        ],
        updated_at: updatedAt
      };
    });
    setNewRowName("");
  }

  function handleRenameStage(stageId, name) {
    const trimmed = name.trim();
    if (!trimmed || !map) return;
    setMap((prev) => {
      if (!prev) return prev;
      const updatedAt = new Date().toISOString();
      return {
        ...prev,
        stages: prev.stages.map((stage) =>
          stage.id === stageId ? { ...stage, name: trimmed } : stage
        ),
        updated_at: updatedAt
      };
    });
  }

  function handleRenameRow(rowId, name) {
    const trimmed = name.trim();
    if (!trimmed || !map) return;
    setMap((prev) => {
      if (!prev) return prev;
      const updatedAt = new Date().toISOString();
      return {
        ...prev,
        rows: prev.rows.map((row) =>
          row.id === rowId ? { ...row, name: trimmed } : row
        ),
        updated_at: updatedAt
      };
    });
  }

  if (!mapId) {
    return (
      <section className="rounded border border-slate-200 p-6">
        <p className="text-sm text-slate-600">Select a map to begin editing.</p>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="rounded border border-slate-200 p-6">
        <p className="text-sm text-slate-600">Loading map...</p>
      </section>
    );
  }

  if (!map) {
    return (
      <section className="rounded border border-slate-200 p-6">
        <p className="text-sm text-slate-600">Map not available.</p>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </section>
    );
  }

  const editingCellKey = editing
    ? buildCellKey(editing.stageId, editing.rowId)
    : null;

  return (
    <section className="space-y-4 rounded border border-slate-200 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{map.name}</h2>
          <p className="text-xs text-slate-500">Map ID: {map.id}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded border border-slate-300 px-4 py-2 text-sm font-medium"
            onClick={handleExportCsv}
            disabled={exporting}
          >
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
          <button
            type="button"
            className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            onClick={handleSaveMap}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Map"}
          </button>
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded border border-slate-200 p-3">
          <p className="text-xs font-medium text-slate-500">Add Stage</p>
          <div className="mt-2 flex gap-2">
            <input
              className="flex-1 rounded border border-slate-300 px-2 py-1 text-sm"
              placeholder="Stage name"
              value={newStageName}
              onChange={(event) => setNewStageName(event.target.value)}
            />
            <button
              type="button"
              className="rounded bg-slate-900 px-3 py-1 text-sm text-white"
              onClick={handleAddStage}
            >
              Add
            </button>
          </div>
        </div>
        <div className="rounded border border-slate-200 p-3">
          <p className="text-xs font-medium text-slate-500">Add Row</p>
          <div className="mt-2 grid grid-cols-[1fr_auto_auto] gap-2">
            <input
              className="rounded border border-slate-300 px-2 py-1 text-sm"
              placeholder="Row name"
              value={newRowName}
              onChange={(event) => setNewRowName(event.target.value)}
            />
            <select
              className="rounded border border-slate-300 px-2 py-1 text-sm"
              value={newRowType}
              onChange={(event) => setNewRowType(event.target.value)}
            >
              {ROW_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="rounded bg-slate-900 px-3 py-1 text-sm text-white"
              onClick={handleAddRow}
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <MapGrid
        map={map}
        cellLookup={cellLookup}
        editingCellKey={editingCellKey}
        draftText={draftText}
        onCellClick={handleStartEdit}
        onDraftChange={setDraftText}
        onCommitEdit={handleSaveCell}
        onCancelEdit={handleCancelEdit}
        onRenameStage={handleRenameStage}
        onRenameRow={handleRenameRow}
      />
    </section>
  );
}
