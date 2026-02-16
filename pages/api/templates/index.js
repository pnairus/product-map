import { listTemplates } from "../../../src/application/template-store.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  try {
    const templates = await listTemplates();
    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({
      error: error.message || "Failed to load templates.",
      detail: error.stack || String(error)
    });
  }
}
