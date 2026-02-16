import {
  createMap,
  createPersona,
  addStage,
  addRow,
  addCell,
  updateCell,
  validateMap
} from "../src/domain/index.js";

const map = createMap("Corporate Travel Booking");
map.description = "MVP map for a corporate travel booking journey.";
map.persona = createPersona("Corporate Traveler", {
  description: "Frequent business traveler who books trips independently.",
  goals: "Book trips quickly and stay within policy.",
  frustrations: "Too many steps and unclear approvals."
});

const stages = [
  addStage(map, "Discover Need"),
  addStage(map, "Search Options"),
  addStage(map, "Book Trip")
];

const rows = [
  addRow(map, "User Goal", "goal"),
  addRow(map, "Jobs to be Done", "job"),
  addRow(map, "Pain Points", "pain"),
  addRow(map, "Opportunities", "opportunity"),
  addRow(map, "Solutions", "solution")
];

const cells = [];

cells.push(addCell(map, stages[0].id, rows[0].id, "Understand travel requirements."));
cells.push(addCell(map, stages[0].id, rows[1].id, "Clarify budget and dates."));
cells.push(addCell(map, stages[0].id, rows[2].id, "Policies are hard to find."));
cells.push(addCell(map, stages[0].id, rows[3].id, "Surface policy info early."));

cells.push(addCell(map, stages[1].id, rows[0].id, "Compare options quickly."));
cells.push(addCell(map, stages[1].id, rows[1].id, "Filter by policy compliant fares."));
cells.push(addCell(map, stages[1].id, rows[2].id, "Too many options to evaluate."));
cells.push(addCell(map, stages[1].id, rows[3].id, "Provide smart recommendations."));

cells.push(addCell(map, stages[2].id, rows[0].id, "Confirm booking and approvals."));
cells.push(addCell(map, stages[2].id, rows[1].id, "Complete booking workflow."));
cells.push(addCell(map, stages[2].id, rows[4].id, "One-click policy-approved checkout."));

updateCell(map, cells[2].id, "Policy details are buried in a separate system.");

validateMap(map);

console.log(JSON.stringify(map, null, 2));
