import { GoogleGenAI, Type } from "@google/genai";
import { ItineraryItem, Place } from "../types";

const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

// Helper to check if API key is present (mocking behavior if not)
const hasKey = !!apiKey;

export const transcribeAudio = async (base64Data: string, mimeType: string): Promise<string> => {
  if (!hasKey) return "Mock: Search for Kyoto";

  try {
    const cleanBase64 = base64Data.split(',')[1] || base64Data;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType
            }
          },
          {
            text: "Transcribe this audio. Return only the text spoken, no extra commentary."
          }
        ]
      }
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Transcription Error:", error);
    return "";
  }
};

export const analyzeImage = async (base64Data: string, mimeType: string): Promise<string> => {
  if (!hasKey) return "Mock analysis: This looks like a beautiful travel destination with historic architecture.";

  try {
    // Strip data url prefix if present
    const cleanBase64 = base64Data.split(',')[1] || base64Data;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType
            }
          },
          {
            text: "Analyze this image. Identify any landmarks, food, or cultural elements. Provide a detailed but concise description suitable for a traveler looking for information. If it's a menu, summarize the cuisine. If it's a building, identify the architectural style."
          }
        ]
      }
    });
    return response.text || "Could not analyze image.";
  } catch (error) {
    console.error("Gemini Image Analysis Error:", error);
    return "Sorry, I couldn't analyze that image at the moment.";
  }
};

export const generateAIItinerary = async (
  location: string,
  interests: string[],
  days: number = 1
): Promise<ItineraryItem[]> => {
  if (!hasKey) {
    console.warn("No API Key found. Returning mock itinerary.");
    return mockItinerary(location);
  }

  const prompt = `Generate a detailed 1-day travel itinerary for ${location}. 
  The user is interested in: ${interests.join(", ")}.
  Focus on finding hidden gems and local culture.
  Return a JSON array of activities separated by 'Morning', 'Afternoon', and 'Evening'.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              time: { type: Type.STRING, description: "Time of activity e.g. 9:00 AM" },
              period: { type: Type.STRING, enum: ["Morning", "Afternoon", "Evening"] },
              activity: { type: Type.STRING, description: "Name of the activity or place" },
              description: { type: Type.STRING, description: "Brief description of what to do there" },
            },
            required: ["time", "period", "activity", "description"],
          },
        },
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return data.map((item: any, index: number) => ({
        id: `gen-${index}`,
        ...item,
      }));
    }
    return mockItinerary(location);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return mockItinerary(location);
  }
};

export const discoverPlaces = async (
  query: string
): Promise<Place[]> => {
    // If no API key or empty query, return empty array to let component handle fallback/mock
    if (!query) return [];

    if (!hasKey) {
        // Simple mock fallback if no key
        return [
            {
                id: 'mock-1',
                title: `Mock Place for ${query}`,
                description: `This is a simulated result for "${query}" because no API key was provided.`,
                image: 'https://picsum.photos/500/300?grayscale',
                tags: ['Mock', 'Demo'],
                rating: 4.5,
                reviews: 100,
                cost: '$$',
                bestTime: 'Anytime',
                coordinates: { lat: 0, lng: 0 },
                hiddenGemReason: 'Simulated data'
            }
        ];
    }

    const prompt = `Recommend 5 distinct travel destinations, restaurants, spots, or hidden gems based on this search query: "${query}".
    Return a JSON array where each item has the following structure:
    - title (string)
    - description (string)
    - tags (array of strings, max 3)
    - rating (number 1.0-5.0)
    - reviews (number integer)
    - cost (string e.g. "$", "Free")
    - bestTime (string)
    - hiddenGemReason (string, optional)
    - coordinates (object with lat and lng numbers)
    `;

     try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              rating: { type: Type.NUMBER },
              reviews: { type: Type.INTEGER },
              cost: { type: Type.STRING },
              bestTime: { type: Type.STRING },
              hiddenGemReason: { type: Type.STRING },
              coordinates: { 
                  type: Type.OBJECT, 
                  properties: { 
                      lat: { type: Type.NUMBER }, 
                      lng: { type: Type.NUMBER } 
                    } 
                }
            },
            required: ["title", "description", "tags", "rating", "cost"],
          },
        },
      },
    });

     if (response.text) {
      const data = JSON.parse(response.text);
      // Map and add random images since text API doesn't return images
      return data.map((item: any, index: number) => ({
          ...item,
          id: `ai-${Date.now()}-${index}`,
          image: `https://picsum.photos/500/300?random=${index + Math.floor(Math.random() * 100)}`
      }));
    }
    return [];

  } catch (e) {
      console.error("Discover Places Error:", e);
      return [];
  }
}

// Fallback mock data
const mockItinerary = (loc: string): ItineraryItem[] => [
  { id: "1", time: "09:00 AM", period: "Morning", activity: `Local Coffee at ${loc} Square`, description: "Start with locally sourced brew." },
  { id: "2", time: "11:00 AM", period: "Morning", activity: "Hidden Alley Art Walk", description: "Discover street art by local residents." },
  { id: "3", time: "01:00 PM", period: "Afternoon", activity: "Lunch at Grandma's Kitchen", description: "Authentic regional cuisine." },
  { id: "4", time: "03:00 PM", period: "Afternoon", activity: "Old Library Visit", description: "A quiet, architectural marvel rarely visited." },
  { id: "5", time: "07:00 PM", period: "Evening", activity: "Sunset at the Peak", description: "Best view of the city." },
];