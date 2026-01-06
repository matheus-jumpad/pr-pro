
import { GoogleGenAI, Type } from "@google/genai";
import { PullRequest, AIValidationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const validatePullRequest = async (pr: PullRequest, projectName: string): Promise<AIValidationResult> => {
  try {
    // Collect patches but limit them to avoid hitting token limits
    const patches = pr.files?.map(f => `File: ${f.filename}\nPatch:\n${f.patch || 'No patch available'}`).join('\n\n').slice(0, 15000);
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Perform a technical code review for this Pull Request:
      Project: ${projectName}
      Title: ${pr.title}
      Description: ${pr.description}
      Stats: ${pr.filesChanged} files, +${pr.additions}, -${pr.deletions}
      
      CODE DIFFS:
      ${patches}
      
      Analyze for:
      1. Technical bugs, memory leaks, or logical flaws.
      2. Security vulnerabilities (SQLi, XSS, insecure dependencies).
      3. Compliance with description.
      4. Code quality and maintainability.
      
      Be strict but helpful.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Validation score from 0-100" },
            summary: { type: Type.STRING, description: "Detailed summary of findings" },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific improvements" },
            criticalIssues: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Major blockers found in code" },
            lgtm: { type: Type.BOOLEAN, description: "Ready to merge?" }
          },
          required: ["score", "summary", "suggestions", "criticalIssues", "lgtm"]
        }
      }
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("AI Validation Error:", error);
    return {
      score: 0,
      summary: "Technical error during AI code analysis.",
      suggestions: [],
      criticalIssues: ["Failed to parse code diffs"],
      lgtm: false
    };
  }
};
