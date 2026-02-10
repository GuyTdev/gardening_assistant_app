import { GoogleGenAI, Chat, Type } from "@google/genai";
import { PLANT_DATA_SCHEMA, PlantData } from "../types";

// Initialize the Gemini client
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-3-pro-preview";

export const analyzePlantImage = async (base64Image: string): Promise<PlantData> => {
  const ai = getAiClient();
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: "זהה את הצמח בתמונה וספק הוראות טיפול מפורטות. החזר את המידע בפורמט JSON תקין התואם לסכמה. כל הטקסט חייב להיות בעברית.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: PLANT_DATA_SCHEMA,
        systemInstruction: "אתה בוטנאי מומחה הדובר עברית. נתח את הצמח בתמונה בצורה מדויקת. ספק פרטי טיפול מועילים, מעודדים ומדויקים בשפה העברית.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as PlantData;
  } catch (error) {
    console.error("Error analyzing plant:", error);
    throw error;
  }
};

export const createChatSession = (): Chat => {
  const ai = getAiClient();
  return ai.chats.create({
    model: MODEL_NAME,
    config: {
      systemInstruction: "אתה עוזר גינון ידידותי וידען בשם 'צמח-לי'. אתה עוזר למשתמשים לזהות צמחים, לפתור בעיות ולתת עצות גינון. ענה תמיד בעברית. שמור על תשובות תמציתיות אך מועילות.",
    },
  });
};