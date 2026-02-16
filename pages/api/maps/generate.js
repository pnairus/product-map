import { generateMapFromText } from "../../../src/application/map-generator.js";
import { saveMap } from "../../../src/persistence/index.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  try {
    const inputText = typeof req.body?.text === "string" ? req.body.text : "";
    const map = await generateMapFromText(inputText);
    await saveMap(map);
    res.status(201).json(map);
  } catch (error) {
    res.status(500).json({
      error: error.message || "Failed to generate map.",
      detail: error.stack || String(error)
    });
  }
}
