import { Type } from "@google/genai";

export interface PlantData {
  name: string;
  scientificName: string;
  description: string;
  care: {
    light: string;
    water: string;
    soil: string;
    humidity: string;
    temperature: string;
    toxicity: string;
  };
  quickTips: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
}

// Define the schema for Gemini JSON output
export const PLANT_DATA_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "Common name of the plant in Hebrew" },
    scientificName: { type: Type.STRING, description: "Scientific name of the plant (Latin)" },
    description: { type: Type.STRING, description: "A brief description of the plant's appearance and origin in Hebrew" },
    care: {
      type: Type.OBJECT,
      properties: {
        light: { type: Type.STRING, description: "Light requirements in Hebrew (e.g., 'אור מלא', 'צל חלקי')" },
        water: { type: Type.STRING, description: "Watering schedule and needs in Hebrew" },
        soil: { type: Type.STRING, description: "Soil type recommendations in Hebrew" },
        humidity: { type: Type.STRING, description: "Humidity preferences in Hebrew" },
        temperature: { type: Type.STRING, description: "Ideal temperature range in Hebrew (Celsius)" },
        toxicity: { type: Type.STRING, description: "Toxicity info for pets/humans in Hebrew" },
      },
      required: ["light", "water", "soil", "humidity", "temperature", "toxicity"],
    },
    quickTips: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 3-5 quick actionable tips for success in Hebrew",
    },
  },
  required: ["name", "scientificName", "description", "care", "quickTips"],
};