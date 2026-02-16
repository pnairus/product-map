import {
  createMap,
  addStage,
  addRow,
  addCell
} from "../src/domain/index.js";
import {
  saveMap,
  loadMap,
  listMaps,
  deleteMap
} from "../src/persistence/index.js";

async function run() {
  const map = createMap("Corporate Travel");

  const stage = addStage(map, "Discover Need");
  const rowGoal = addRow(map, "User Goal", "goal");
  const rowPain = addRow(map, "Pain Points", "pain");

  addCell(map, stage.id, rowGoal.id, "Understand travel requirements.");
  addCell(map, stage.id, rowPain.id, "Policies are hard to find.");

  await saveMap(map);

  const loadedMap = await loadMap(map.id);
  console.log("Loaded map:", loadedMap.name);

  const maps = await listMaps();
  console.log("Maps:", maps);

  await deleteMap(map.id);
  console.log("Persistence working");
}

run().catch((error) => {
  console.error("Persistence example failed:", error.message);
  process.exit(1);
});
