import { generateFormDraft } from "../services/aiService.js";

export const generateForm = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res
        .status(400)
        .json({ error: "A valid prompt string is required." });
    }
    const generatedDraft = await generateFormDraft(prompt);
    return res.status(200).json(generatedDraft);
  } catch (error) {
    next(error);
  }
};
