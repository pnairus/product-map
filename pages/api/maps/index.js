import { createMap, addStage, addRow, addCell } from "../../../src/domain/index.js";
import { saveMap, listMaps } from "../../../src/persistence/index.js";
import { getTemplate } from "../../../src/application/template-store.js";

const DEFAULT_STAGES = [
  "Realize Need",
  "Search Options",
  "Compare Options",
  "Decide",
  "Use"
];
const DEFAULT_ROWS = [
  { name: "User Goal", type: "goal" },
  { name: "Jobs to be Done", type: "job" },
  { name: "Pain Points", type: "pain" },
  { name: "Opportunities", type: "opportunity" },
  { name: "Solutions", type: "solution" }
];
const DEFAULT_CELL_PLACEHOLDER = "Add insight";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const maps = await listMaps();
      res.status(200).json(maps);
    } catch (error) {
      res.status(500).json({
        error: error.message || "Failed to list maps.",
        detail: error.stack || String(error)
      });
    }
    return;
  }

  if (req.method === "POST") {
    try {
      const name = typeof req.body?.name === "string" ? req.body.name.trim() : "";
      if (!name) {
        res.status(400).json({ error: "Map name is required." });
        return;
      }

      const map = createMap(name);
      const templateId = typeof req.body?.templateId === "string" ? req.body.templateId : "default";
      const template = templateId ? await getTemplate(templateId) : null;
      const stages = template?.stages?.length ? template.stages : DEFAULT_STAGES;
      const rows = template?.rows?.length ? template.rows : DEFAULT_ROWS;

      const stageRefs = stages.map((stageName) => addStage(map, stageName));
      const rowRefs = rows.map((row) => addRow(map, row.name, row.type));

      if (template?.cells?.length) {
        const stageByName = new Map(
          stageRefs.map((stage) => [stage.name.toLowerCase(), stage])
        );
        const rowByName = new Map(
          rowRefs.map((row) => [row.name.toLowerCase(), row])
        );
        template.cells.forEach((cell) => {
          const stage = stageByName.get(cell.stage.toLowerCase());
          const row = rowByName.get(cell.row.toLowerCase());
          if (stage && row && cell.content) {
            addCell(map, stage.id, row.id, cell.content);
          }
        });
      }

      const cellKey = (stageId, rowId) => `${stageId}:${rowId}`;
      const existing = new Set(
        map.cells.map((cell) => cellKey(cell.stage_id, cell.row_id))
      );
      stageRefs.forEach((stage) => {
        rowRefs.forEach((row) => {
          const key = cellKey(stage.id, row.id);
          if (!existing.has(key)) {
            addCell(map, stage.id, row.id, DEFAULT_CELL_PLACEHOLDER);
            existing.add(key);
          }
        });
      });

      await saveMap(map);
      res.status(201).json(map);
    } catch (error) {
      res.status(500).json({
        error: error.message || "Failed to create map.",
        detail: error.stack || String(error)
      });
    }
    return;
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).json({ error: "Method not allowed." });
}
