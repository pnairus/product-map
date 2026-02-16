import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_DIR = path.join(__dirname, "..", "..", "data", "templates");

export async function listTemplates() {
  const entries = await fs.readdir(TEMPLATE_DIR, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".json"));
  const templates = await Promise.all(
    files.map(async (entry) => {
      const raw = await fs.readFile(path.join(TEMPLATE_DIR, entry.name), "utf8");
      return JSON.parse(raw);
    })
  );

  return templates.map((template) => ({
    id: template.id,
    name: template.name,
    description: template.description,
    stages: template.stages,
    rows: template.rows,
    cells: template.cells
  }));
}

export async function getTemplate(templateId) {
  const templates = await listTemplates();
  return templates.find((template) => template.id === templateId) || null;
}

export default { listTemplates, getTemplate };
