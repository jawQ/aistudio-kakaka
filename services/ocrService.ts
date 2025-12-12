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

    **Image Format Patterns:**
    The text typically follows: "Date(Weekday) [Icons] TimeRange [DurationNumber] [ProjectName] [Icons] [SecondTimeRange] [Duration]..."
    
    **Specific Parsing Rules:**
    1. **Date**: Parse "12.4" or "12.22" as MM.DD. Format output as "YYYY-MM-DD".
    2. **Time Ranges**: 
       - Look for patterns like "9-12", "14-19", "19-24", "13-17".
       - "24" denotes 00:00 of the next day.
       - A single line might contain MULTIPLE time ranges (e.g., "12.8(周一) 13-17 4 19-24 5"). Create SEPARATE objects for each time range found on the date.
    3. **Duration Number**:
       - Often a single number appears immediately after the time range (e.g., the '3' in "9-12 3", or '5' in "14-19 5").
       - **CRITICAL**: This number represents duration in hours. **DO NOT** include this number in the 'workName'.
    4. **Work Name / Project**:
       - Extract text after the time range and duration number.
       - Examples: "十九", "背", "早班", "品牌".
       - Ignore emojis like 🦶, 🍚, 💅, 🗓️, ⏰ unless they look like a specific logo/brand.
       - If NO text exists after the time/duration, use "Live" or "直播" as the default workName.
    5. **Ignore**:
       - Lines containing "休" (Rest day).
       - Headers like "第二周", "12月".
    
    **Example Handling:**
    - Input: "12.4(周四) 🦶 9-12 3 十九 🍚💅"
      Output: { dateStr: "${currentYear}-12-04", startTime: "09:00", endTime: "12:00", workName: "十九" }
    - Input: "12.8(周一) 13-17 4 19-24 5" 
      Output Item 1: { dateStr: "${currentYear}-12-08", startTime: "13:00", endTime: "17:00", workName: "Live" }
      Output Item 2: { dateStr: "${currentYear}-12-08", startTime: "19:00", endTime: "24:00", workName: "Live" }

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
              startTime: { type: Type.STRING, description: "HH:MM (24h)" },
              endTime: { type: Type.STRING, description: "HH:MM (24h)" },
              workName: { type: Type.STRING, description: "Project name" },
              notes: { type: Type.STRING, description: "Original context if needed" },
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