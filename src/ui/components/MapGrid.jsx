"use client";

import StageHeader from "./StageHeader.jsx";
import RowHeader from "./RowHeader.jsx";

export default function MapGrid({
  map,
  cellLookup,
  editingCellKey,
  draftText,
  onCellClick,
  onDraftChange,
  onCommitEdit,
  onCancelEdit,
  onRenameStage,
  onRenameRow
}) {
  const stages = [...map.stages].sort((a, b) => a.order - b.order);
  const rows = [...map.rows].sort((a, b) => a.order - b.order);

  if (!stages.length || !rows.length) {
    return (
      <div className="rounded border border-dashed border-slate-300 p-6 text-sm text-slate-600">
        Add stages and rows to populate the grid.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded border border-slate-200">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50">
            <th className="border border-slate-200 px-3 py-2 text-left">Row</th>
            {stages.map((stage) => (
              <th
                key={stage.id}
                className="border border-slate-200 px-3 py-2 text-left"
              >
                <StageHeader stage={stage} onRename={onRenameStage} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="border border-slate-200 px-3 py-2 font-medium">
                <RowHeader row={row} onRename={onRenameRow} />
              </td>
              {stages.map((stage) => {
                const cellKey = `${stage.id}:${row.id}`;
                const cell = cellLookup.get(cellKey);
                const isEditing = editingCellKey === cellKey;
                return (
                  <td
                    key={cellKey}
                    className={`border border-slate-200 px-3 py-2 align-top ${
                      isEditing ? "bg-slate-100" : "hover:bg-slate-50"
                    }`}
                  >
                    {isEditing ? (
                      <textarea
                        className="w-full rounded border border-slate-300 p-2 text-sm"
                        rows={4}
                        value={draftText}
                        autoFocus
                        onChange={(event) => onDraftChange(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Escape") {
                            event.preventDefault();
                            onCancelEdit();
                          }
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault();
                            onCommitEdit(draftText);
                          }
                        }}
                        onBlur={() => onCommitEdit(draftText)}
                      />
                    ) : (
                      <button
                        type="button"
                        className="w-full text-left"
                        onClick={() => onCellClick(stage.id, row.id)}
                      >
                        {cell?.content || (
                          <span className="text-xs text-slate-400">Click to edit</span>
                        )}
                      </button>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
