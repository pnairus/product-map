import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { validateMap } from "../domain/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "..", "data", "maps");

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function mapFilePath(mapId) {
  if (!mapId || typeof mapId !== "string") {
    throw new Error("Map ID must be a non-empty string.");
  }
  return path.join(DATA_DIR, `${mapId}.json`);
}

async function saveMap(map) {
  validateMap(map);
  await ensureDataDir();
  const filePath = mapFilePath(map.id);
  const payload = JSON.stringify(map, null, 2);
  await fs.writeFile(filePath, payload, "utf8");
  return filePath;
}

async function loadMap(mapId) {
  const filePath = mapFilePath(mapId);
  const raw = await fs.readFile(filePath, "utf8");
  const map = JSON.parse(raw);
  validateMap(map);
  return map;
}

async function listMaps() {
  await ensureDataDir();
  const entries = await fs.readdir(DATA_DIR, { withFileTypes: true });
  const jsonFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name);

  const maps = await Promise.all(
    jsonFiles.map(async (filename) => {
      const raw = await fs.readFile(path.join(DATA_DIR, filename), "utf8");
      const map = JSON.parse(raw);
      validateMap(map);
      return {
        id: map.id,
        name: map.name,
        created_at: map.created_at,
        updated_at: map.updated_at
      };
    })
  );

  return maps;
}

async function deleteMap(mapId) {
  const filePath = mapFilePath(mapId);
  await fs.unlink(filePath);
}

const persistence = {
  saveMap,
  loadMap,
  listMaps,
  deleteMap
};

export { saveMap, loadMap, listMaps, deleteMap };
export default persistence;
