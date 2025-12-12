import { GoogleGenAI, Type } from "@google/genai";

export interface OCRSessionData {
  dateStr: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  workName: string;
  notes: string;
}

const fileToGenerativePart = async (file: File) => {
  return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64String = result.split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeScheduleImage = async (file: File): Promise<OCRSessionData[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const currentYear = new Date().getFullYear();

  // Optimized prompt for the specific user format provided
  const prompt = `
    Analyze this schedule image (screenshot from a notes app) and extract valid working shifts for the year ${currentYear}.

    **Image Format Patterns to Look For:**
    The text usually follows this pattern:
    "Date(Weekday) [Optional Icons] StartTime-EndTime [Duration] [ProjectName] [Optional Icons/Notes]"
    
    Examples from the image:
    - "12.4(周四) 🦶 9-12 3 十九 🍚💅" -> Date: 12.4, Time: 09:00-12:00, Project: 十九
    - "12.5(周五) 14-19 5" -> Date: 12.5, Time: 14:00-19:00, Project: 直播 (Default)
    - "12.3(周三)休" -> IGNORE (Rest day)

    **Rules:**
    1. **Date**: Parse "12.4" as December 4th. Format as "YYYY-MM-DD".
    2. **Time**: Parse ranges like "9-12" (09:00-12:00), "14-19" (14:00-19:00), "19-24" (19:00-24:00).
       - Note: "24" means midnight/next day 00:00.
    3. **Ignore**:
       - Lines containing "休" (Rest/Off).
       - Random icons/emojis like 🦶, 🍚, 💅, 🗓️, ⏰ unless they look like a project name.
       - Isolated numbers that represent duration (e.g., the "3" in "9-12 3") should NOT be part of the project name.
    4. **Project Name**: Extract the text after the time and duration.
       - Common names: "十九", "背", "早班".
       - If no text exists after time/duration, use "直播" as default.
    5. **Multi-shift**: A single date might have multiple lines or entries.

    Return a JSON array.
  `;

  try {
    const imagePart = await fileToGenerativePart(file);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [imagePart, { text: prompt }],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              dateStr: { type: Type.STRING, description: "YYYY-MM-DD" },
              startTime: { type: Type.STRING, description: "HH:MM in 24h format" },
              endTime: { type: Type.STRING, description: "HH:MM in 24h format" },
              workName: { type: Type.STRING, description: "Cleaned project name without emojis" },
              notes: { type: Type.STRING, description: "Original raw text line for reference" },
            },
            required: ["dateStr", "startTime", "endTime"],
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as OCRSessionData[];
    }
    return [];
  } catch (error) {
    console.error("OCR Analysis failed:", error);
    throw error;
  }
};