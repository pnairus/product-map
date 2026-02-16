import {
  createMap,
  createPersona,
  addStage,
  addRow,
  addCell
} from "../domain/index.js";
import { generateMapStructure } from "./llm-client.js";

function stripJson(input) {
  const trimmed = input.trim();
  if (trimmed.startsWith("```")) {
    return trimmed.replace(/^```[a-z]*\n?/i, "").replace(/```$/, "").trim();
  }
  return trimmed;
}

function parseJsonOrThrow(content) {
  const cleaned = stripJson(content);
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    throw new Error("Failed to parse LLM JSON output.");
  }
}

function ensureDefaultRows(structureRows = []) {
  const defaultRows = [
    { name: "User Goal", type: "goal" },
    { name: "Jobs to be Done", type: "job" },
    { name: "Pain Points", type: "pain" },
    { name: "Opportunities", type: "opportunity" },
    { name: "Solutions", type: "solution" }
  ];

  const byName = new Map(
    structureRows.map((row, index) => [
      row.name?.toLowerCase() || String(index),
      row
    ])
  );

  return defaultRows.map((row, index) => {
    const existing = byName.get(row.name.toLowerCase());
    return {
      name: existing?.name || row.name,
      type: existing?.type || row.type,
      order: existing?.order || index + 1
    };
  });
}

export async function generateMapFromText(inputText) {
  const content = await generateMapStructure(inputText);
  const structure = parseJsonOrThrow(content);

  const mapName = structure?.name || "Generated Map";
  const map = createMap(mapName);

  if (structure?.description) {
    map.description = structure.description;
  }

  if (structure?.persona?.name) {
    map.persona = createPersona(structure.persona.name, {
      description: structure.persona.description,
      goals: structure.persona.goals,
      frustrations: structure.persona.frustrations
    });
  }

  const stages = Array.isArray(structure?.stages) ? structure.stages : [];
  const rows = ensureDefaultRows(
    Array.isArray(structure?.rows) ? structure.rows : []
  );

  const stageByName = new Map();
  stages
    .slice()
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .forEach((stage, index) => {
      const created = addStage(map, stage.name || `Stage ${index + 1}`);
      stageByName.set(stage.name?.toLowerCase(), created);
    });

  const rowByName = new Map();
  rows
    .slice()
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .forEach((row, index) => {
      const created = addRow(map, row.name || `Row ${index + 1}`, row.type || "custom");
      rowByName.set(row.name?.toLowerCase(), created);
    });

  const cells = Array.isArray(structure?.cells) ? structure.cells : [];
  cells.forEach((cell) => {
    const stage = stageByName.get(cell.stage_name?.toLowerCase());
    const row = rowByName.get(cell.row_name?.toLowerCase());
    if (!stage || !row || !cell.content) {
      return;
    }
    addCell(map, stage.id, row.id, String(cell.content));
  });

  return map;
}

export default { generateMapFromText };
