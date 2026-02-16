import { randomUUID } from "crypto";
import Ajv from "ajv";
import schema from "../../docs/schemas/map-schema.json" assert { type: "json" };

const ROW_TYPES = new Set([
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
]);

function nowIso() {
  return new Date().toISOString();
}

function createMap(name) {
  if (!name || typeof name !== "string") {
    throw new Error("Map name must be a non-empty string.");
  }

  const timestamp = nowIso();

  const map = {
    id: randomUUID(),
    name,
    stages: [],
    rows: [],
    cells: [],
    created_at: timestamp,
    updated_at: timestamp
  };

  validateMap(map);
  return map;
}

function createPersona(name, options = {}) {
  if (!name || typeof name !== "string") {
    throw new Error("Persona name must be a non-empty string.");
  }

  const timestamp = nowIso();

  return {
    id: randomUUID(),
    name,
    description: options.description,
    goals: options.goals,
    frustrations: options.frustrations,
    created_at: timestamp,
    updated_at: timestamp
  };
}

function addStage(map, stageName) {
  assertMap(map);
  if (!stageName || typeof stageName !== "string") {
    throw new Error("Stage name must be a non-empty string.");
  }

  const stage = {
    id: randomUUID(),
    name: stageName,
    order: map.stages.length + 1
  };

  map.stages.push(stage);
  map.updated_at = nowIso();

  validateMap(map);
  return stage;
}

function addRow(map, rowName, rowType) {
  assertMap(map);
  if (!rowName || typeof rowName !== "string") {
    throw new Error("Row name must be a non-empty string.");
  }
  if (!ROW_TYPES.has(rowType)) {
    throw new Error(`Row type must be one of: ${Array.from(ROW_TYPES).join(", ")}.`);
  }

  const row = {
    id: randomUUID(),
    name: rowName,
    type: rowType,
    order: map.rows.length + 1
  };

  map.rows.push(row);
  map.updated_at = nowIso();

  validateMap(map);
  return row;
}

function addCell(map, stageId, rowId, content) {
  assertMap(map);
  if (!content || typeof content !== "string") {
    throw new Error("Cell content must be a non-empty string.");
  }

  if (!map.stages.some((stage) => stage.id === stageId)) {
    throw new Error("Stage ID does not exist on this map.");
  }

  if (!map.rows.some((row) => row.id === rowId)) {
    throw new Error("Row ID does not exist on this map.");
  }

  const timestamp = nowIso();
  const cell = {
    id: randomUUID(),
    stage_id: stageId,
    row_id: rowId,
    content,
    created_at: timestamp,
    updated_at: timestamp
  };

  map.cells.push(cell);
  map.updated_at = timestamp;

  validateMap(map);
  return cell;
}

function updateCell(map, cellId, content) {
  assertMap(map);
  if (!content || typeof content !== "string") {
    throw new Error("Cell content must be a non-empty string.");
  }

  const cell = map.cells.find((entry) => entry.id === cellId);
  if (!cell) {
    throw new Error("Cell ID does not exist on this map.");
  }

  cell.content = content;
  cell.updated_at = nowIso();
  map.updated_at = cell.updated_at;

  validateMap(map);
  return cell;
}

function assertMap(map) {
  if (!map || typeof map !== "object") {
    throw new Error("Map must be an object.");
  }
  if (!Array.isArray(map.stages) || !Array.isArray(map.rows) || !Array.isArray(map.cells)) {
    throw new Error("Map is missing required collections.");
  }
}

let validateMapFn;
function getValidateMapFn() {
  if (validateMapFn) {
    return validateMapFn;
  }

  const ajv = new Ajv({ allErrors: true });
  ajv.addSchema(schema, "product-map");
  const compiled = ajv.getSchema("product-map#/definitions/Map");
  if (!compiled) {
    throw new Error("Schema reference for Map not found.");
  }
  validateMapFn = compiled;
  return validateMapFn;
}

function validateMap(map) {
  const validate = getValidateMapFn();
  const valid = validate(map);
  if (!valid) {
    const ajv = validate.ajv;
    const message =
      ajv && typeof ajv.errorsText === "function"
        ? ajv.errorsText(validate.errors, { separator: "; " })
        : "Schema validation failed.";
    throw new Error(`Map schema validation failed: ${message}`);
  }
  return true;
}

const domain = {
  createMap,
  createPersona,
  addStage,
  addRow,
  addCell,
  updateCell,
  validateMap
};

export {
  createMap,
  createPersona,
  addStage,
  addRow,
  addCell,
  updateCell,
  validateMap
};

export default domain;
