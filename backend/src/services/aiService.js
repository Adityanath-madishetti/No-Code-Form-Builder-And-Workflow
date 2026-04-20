import { Groq } from "groq-sdk";
import { ActionStreamSchema } from "../utils/aiForm.schema.js";
import { z } from "zod";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
Phase 1: Architecture & Dynamic Prompting
    [ ] 1. Create the Component Registry (src/registry/components.ts)
        Create a central object mapping component types (e.g., SingleLineInput, Radio) 
        to a brief description and their specific Zod schema definition.
    [ ] 2. Build the Schema-to-Prompt Helper (src/utils/schemaPromptBuilder.ts)
        Write a utility function: generateBuilderPrompt(activeComponents: string[]).
        Have it dynamically stringify the base ADD_PAGE and ADD_SKIP_LOGIC rules, plus 
        only the ADD_COMPONENT rules for the activeComponents passed into it. 
        (You can use zod-to-json-schema to automate translating Zod types to prompt strings 
        if you want zero hardcoding).
Phase 2: The Backend Orchestration (src/services/aiService.js)
    [ ] 3. Implement Pass 1: The Router (Fast Model)
        Prompt: Give the AI the user's request and the list of keys/descriptions from your 
        Component Registry. Ask it to return only a JSON array of strings (the required 
        component types).
        Model: Use a fast/cheap model (e.g., Llama 3 8b or Gemini Flash).
    [ ] 4. Implement Pass 2: The Builder (Heavy Model)
        Prompt: Pass the array from Pass 1 into generateBuilderPrompt(). Feed this 
        laser-focused system instruction + the user's original request to the AI.
        Model: Use the heavy reasoning model (e.g., Llama 3 70b or Gemini Pro).
        Validation: Run the output through your existing ActionStreamSchema.parse() and keep 
        your self-healing retry loop.
Phase 3: The Frontend UX (AIGenerateButton.tsx)
    [ ] 5. Upgrade the Loading State
        Change the isGenerating boolean to a state machine: 
        type GenerationState = 'idle' | 'analyzing' | 'building' | 'done'.
        (Optional) Use Server-Sent Events (SSE) or simple sequential HTTP requests to update 
        the UI text from "Analyzing request..." to "Drafting structure and logic..." so the 
        user isn't staring at a frozen spinner.
 */

export async function generateFormDraft(prompt, maxRetries = 2) {
  const systemInstruction = `
    You are an expert Form Architect. Respond ONLY with valid JSON representing a chronological action stream.
    
    CRITICAL RULES:
    1. Output operations in EXACT chronological order: ADD_PAGE -> ADD_COMPONENT -> ADD_SKIP_LOGIC.
    2. Invent logical IDs (e.g., 'page_1', 'field_email', 'opt_1') for all 'tempId' and 'id' fields.
    3. DO NOT invent properties. Strictly follow the operation shapes below.
    
    REQUIRED OPERATION SHAPES:
    
    1. ADD_PAGE:
       { "action": "ADD_PAGE", "tempId": "page_1", "title": "Page Title" }
       
    2. ADD_COMPONENT (SingleLineInput):
       { 
         "action": "ADD_COMPONENT", 
         "componentType": "SingleLineInput", 
         "tempId": "field_1", 
         "targetPageId": "page_1", 
         "label": "Full Name",
         "props": { "type": "text|email|number", "questionText": "What is your name?" },
         "validation": { "required": true }
       }
       
    3. ADD_COMPONENT (Radio):
       { 
         "action": "ADD_COMPONENT", 
         "componentType": "Radio", 
         "tempId": "field_2", 
         "targetPageId": "page_1", 
         "label": "Role",
         "props": { "questionText": "Select role", "layout": "vertical", "options": [{"id": "opt_1", "value": "Frontend"}] },
         "validation": { "required": true }
       }
       
    4. ADD_SKIP_LOGIC (MUST BE FLAT, DO NOT NEST CONDITIONS):
       {
         "action": "ADD_SKIP_LOGIC",
         "sourceFieldId": "field_2",
         "operator": "equals" | "not_equals" | "greater_than" | "less_than",
         "value": "Frontend",
         "targetPageId": "page_2"
       }

    Output the final JSON object containing: { "formName": "...", "operations": [...] }
  `;

  const messages = [
    { role: "system", content: systemInstruction },
    { role: "user", content: prompt },
  ];

  let lastRawJsonString = "";

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: messages,
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        response_format: { type: "json_object" },
      });
      lastRawJsonString = chatCompletion.choices[0].message.content;
      const parsedJson = JSON.parse(lastRawJsonString);
      // console.log(parsedJson);
      const validatedData = ActionStreamSchema.parse(parsedJson);
      // console.log(validatedData);
      return validatedData;
    } catch (error) {
      if (
        error.name === "ZodError" ||
        (error.issues && Array.isArray(error.issues))
      ) {
        console.warn(`[Attempt ${attempt + 1}] AI Schema Breach. Retrying...`);

        if (attempt === maxRetries) {
          throw new Error(
            "AI failed to generate a valid schema after multiple attempts.",
          );
        }

        const errorDetails = error.issues?.length
          ? error.issues
              .map((e) => `Path '${e.path.join(".")}': ${e.message}`)
              .join(", ")
          : JSON.stringify(error.format ? error.format() : error.message);

        messages.push({ role: "assistant", content: lastRawJsonString });
        messages.push({
          role: "user",
          content: `Your previous response failed validation. Please fix these errors and return ONLY valid JSON: ${errorDetails}`,
        });
      } else {
        throw error;
      }
    }
  }
}

// exports.generateFormDraft = async (prompt) => {
//   const systemInstruction = `
//     You are an expert Form Architect for a No-Code Form Builder.
//     Output ONLY valid JSON matching this schema... [Paste the same JSON structure from the Groq example above]
//   `;

//   const response = await fetch('http://localhost:11434/api/generate', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       model: "llama3.1",
//       prompt: `${systemInstruction}\n\nUser Request: ${prompt}`,
//       stream: false,
//       format: "json" // Ollama's native JSON mode
//     })
//   });

//   const data = await response.json();
//   return JSON.parse(data.response);
// };
