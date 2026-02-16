import { loadMap, saveMap, deleteMap } from "../../../src/persistence/index.js";

export default async function handler(req, res) {
  const { id } = req.query;
  const format = typeof req.query?.format === "string" ? req.query.format : "";

  function escapeCsv(value) {
    const text = value == null ? "" : String(value);
    if (text.includes("\"") || text.includes(",") || text.includes("\n")) {
      return `"${text.replace(/"/g, "\"\"")}"`;
    }
    return text;
  }

  function buildCsv(map) {
    const stages = [...map.stages].sort((a, b) => a.order - b.order);
    const rows = [...map.rows].sort((a, b) => a.order - b.order);

    const header = ["Row", "Row Type", ...stages.map((stage) => stage.name)];
    const lookup = new Map(
      map.cells.map((cell) => [`${cell.stage_id}:${cell.row_id}`, cell.content])
    );

    const lines = [header.map(escapeCsv).join(",")];
    rows.forEach((row) => {
      const values = [row.name, row.type];
      stages.forEach((stage) => {
        const key = `${stage.id}:${row.id}`;
        values.push(lookup.get(key) || "");
      });
      lines.push(values.map(escapeCsv).join(","));
    });

    return lines.join("\n");
  }

  if (req.method === "GET") {
    try {
      const map = await loadMap(id);
      if (format === "csv") {
        const csv = buildCsv(map);
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="product-map-${map.id}.csv"`
        );
        res.status(200).send(csv);
        return;
      }
      res.status(200).json(map);
    } catch (error) {
      res.status(404).json({
        error: error.message || "Map not found.",
        detail: error.stack || String(error)
      });
    }
    return;
  }

  if (req.method === "PUT") {
    try {
      const map = req.body;
      if (!map || map.id !== id) {
        res.status(400).json({ error: "Map ID mismatch." });
        return;
      }

      await saveMap(map);
      res.status(200).json(map);
    } catch (error) {
      res.status(500).json({
        error: error.message || "Failed to save map.",
        detail: error.stack || String(error)
      });
    }
    return;
  }

  if (req.method === "DELETE") {
    try {
      await deleteMap(id);
      res.status(200).json({ ok: true });
    } catch (error) {
      res.status(500).json({
        error: error.message || "Failed to delete map.",
        detail: error.stack || String(error)
      });
    }
    return;
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  res.status(405).json({ error: "Method not allowed." });
}
