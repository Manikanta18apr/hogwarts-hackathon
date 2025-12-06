import { GoogleGenAI, Type } from "@google/genai";
import { ItineraryItem, Place } from "../types";

const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

// Helper to check if API key is present (mocking behavior if not)
const hasKey = !!apiKey;

// Helper to generate mock popular times for fallback
const generateMockPopularTimes = (): { hour: number; crowdPercentage: number }[] => {
    const times = [];
    for (let h = 8; h <= 22; h++) { // From 8 AM to 10 PM
        let crowd = 0;
        if (h >= 12 && h < 14) { // Lunch peak
            crowd = Math.floor(Math.random() * (90 - 60 + 1)) + 60;
        } else if (h >= 18 && h < 21) { // Evening peak
            crowd = Math.floor(Math.random() * (85 - 50 + 1)) + 50;
        } else if (h >= 10 && h < 12 || h >= 14 && h < 18) { // Mid-day/afternoon
            crowd = Math.floor(Math.random() * (50 - 20 + 1)) + 20;
        } else { // Early morning/late evening
            crowd = Math.floor(Math.random() * (20 - 5 + 1)) + 5;
        }
        times.push({ hour: h, crowdPercentage: crowd });
    }
    return times;
};


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

export const optimizeRoute = async (places: Place[]): Promise<ItineraryItem[]> => {
  if (!hasKey || places.length === 0) return [];

  const placeNames = places.map(p => p.title).join(", ");
  
  const prompt = `I have a list of places to visit: ${placeNames}.
  Please optimize the route to visit these places in the most logical geographic order starting at 9:00 AM.
  Use the Google Maps tool to calculate real travel times between them.
  
  OUTPUT FORMAT:
  Return a raw JSON array (no markdown) where each object represents a stop:
  - time: estimated arrival time (e.g. "09:00 AM")
  - activity: exact name of the place
  - travelTime: string description of travel from previous spot (e.g. "15 min drive") or "Start" for the first one.
  - description: A very short 1-sentence reason why this stop fits here.
  - mapUrl: The Google Maps URI from the tool.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    let jsonString = response.text || "";
    jsonString = jsonString.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      const parsed = JSON.parse(jsonString);
      // Merge AI data with our original place data (images, etc)
      return parsed.map((item: any, index: number) => {
        const originalPlace = places.find(p => p.title.includes(item.activity) || item.activity.includes(p.title));
        return {
          id: `opt-${index}`,
          time: item.time,
          period: parseInt(item.time) >= 12 && parseInt(item.time) < 17 ? 'Afternoon' : parseInt(item.time) >= 17 ? 'Evening' : 'Morning',
          activity: item.activity,
          description: item.description,
          travelTime: item.travelTime,
          mapUrl: item.mapUrl,
          image: originalPlace?.image,
          placeId: originalPlace?.id,
          rating: originalPlace?.rating,
          coordinates: originalPlace?.coordinates // Pass coordinates for map
        };
      });
    } catch (e) {
      console.error("JSON Parse Error during optimization", e);
      return [];
    }
  } catch (error) {
    console.error("Route Optimization Error:", error);
    return [];
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

  const prompt = `Create a 1-day travel itinerary for ${location} based on these interests: ${interests.join(", ")}.
  Use the Google Maps tool to find real, specific places and events.
  
  OUTPUT FORMAT:
  You must output ONLY a valid JSON array. Do not include markdown formatting like \`\`\`json.
  Each object in the array must have:
  - time: string (e.g. "09:00 AM")
  - period: "Morning", "Afternoon", or "Evening"
  - activity: string (name of the place or event)
  - description: string (brief description)
  - mapUrl: string (The Google Maps URI from the tool, if available. If not, leave empty.)
  `;

  try {
    // Using tools disables responseSchema, so we must rely on text parsing.
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    let jsonString = response.text || "";
    // Clean up markdown code blocks if the model adds them
    jsonString = jsonString.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
      const data = JSON.parse(jsonString);
      return data.map((item: any, index: number) => ({
        id: `gen-${index}`,
        ...item,
        // Fallback for mapUrl if model didn't provide one but gave a name
        mapUrl: item.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.activity + " " + location)}`
      }));
    } catch (parseError) {
      console.error("Failed to parse itinerary JSON:", parseError);
      console.log("Raw response:", jsonString);
      return mockItinerary(location);
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    return mockItinerary(location);
  }
};

export const discoverPlaces = async (
  query: string,
  userLatLng?: { latitude: number; longitude: number } // Added optional user location
): Promise<{ places: Place[], groundingSources: any[], errorMessage: string | null }> => { // Changed return type to include errorMessage
    if (!query) return { places: [], groundingSources: [], errorMessage: null };

    if (!hasKey) {
        return {
            places: [
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
                    hiddenGemReason: 'Simulated data',
                    popularTimes: generateMockPopularTimes() // Mock popular times
                }
            ],
            groundingSources: [],
            errorMessage: "API Key not configured. Using mock data. Please set process.env.API_KEY."
        };
    }

    // Step 1: Use Maps Grounding to get raw text and grounding chunks
    const firstPrompt = `Find 5 distinct and interesting travel destinations, restaurants, spots, or hidden gems based on this search query: "${query}".
    Provide a brief description for each.
    Also, for each place, try to infer and include its typical popular times throughout the day, representing crowd levels as a percentage (0-100) for each hour from 8 AM to 10 PM (22:00).
    `;

    try {
        const firstResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: firstPrompt,
            config: {
                tools: [{ googleMaps: {} }],
                // Optionally add user's current location for more relevant results
                toolConfig: userLatLng ? { retrievalConfig: { latLng: userLatLng } } : undefined,
            },
        });

        const rawTextFromMapsGrounding = firstResponse.text || "";
        const groundingChunks = firstResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

        // Step 2: Parse the raw text into structured JSON using a separate AI call
        const secondPrompt = `Given the following text, extract details for up to 5 places into a JSON array.
        For each place, include:
        - title (string)
        - description (string)
        - tags (array of strings, max 3) - infer from description or query if not explicit
        - rating (number 1.0-5.0) - infer if not explicit (default to 4.0 if no hint)
        - reviews (number integer) - infer if not explicit (default to 50 if no hint)
        - cost (string e.g. "$", "Free") - infer if not explicit (default to '$$')
        - bestTime (string) - infer if not explicit (default to 'Daytime')
        - hiddenGemReason (string, optional)
        - coordinates (object with lat and lng numbers) - crucial, extract if possible, otherwise provide placeholder { lat: 0, lng: 0 }
        - popularTimes (array of objects, each with 'hour' (number 0-23) and 'crowdPercentage' (number 0-100)). Provide a realistic 8 AM to 10 PM (22:00) schedule, even if estimated.
        
        Text to parse:
        ${rawTextFromMapsGrounding}
        `;

        const secondResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: secondPrompt,
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
                                },
                                required: ["lat", "lng"]
                            },
                            popularTimes: { // Added popularTimes to schema
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        hour: { type: Type.INTEGER },
                                        crowdPercentage: { type: Type.INTEGER }
                                    },
                                    required: ["hour", "crowdPercentage"]
                                }
                            }
                        },
                        required: ["title", "description", "tags", "rating", "reviews", "cost", "bestTime", "coordinates"],
                    },
                },
            },
        });

        let jsonString = secondResponse.text?.trim() || "";
        // Defensive cleanup: remove markdown code block fences if present
        jsonString = jsonString.replace(/```json/g, "").replace(/```/g, "").trim();

        try {
            const data = JSON.parse(jsonString);
            // Validate that data is an array before mapping
            if (!Array.isArray(data)) {
                console.error("Gemini response for structured places was not an array:", data);
                return { places: [], groundingSources: groundingChunks, errorMessage: "Unexpected API response format." };
            }
            const places: Place[] = data.map((item: any, index: number) => ({
                ...item,
                id: `ai-${Date.now()}-${index}`,
                image: `https://picsum.photos/500/300?random=${index + Math.floor(Math.random() * 100)}`,
                // Provide default coordinates if somehow missing, though schema should prevent this
                coordinates: item.coordinates || { lat: 0, lng: 0 },
                // Fallback for popularTimes if AI did not provide it or it's malformed
                popularTimes: Array.isArray(item.popularTimes) && item.popularTimes.every((pt: any) => typeof pt.hour === 'number' && typeof pt.crowdPercentage === 'number')
                                ? item.popularTimes
                                : generateMockPopularTimes()
            }));
            return { places, groundingSources: groundingChunks, errorMessage: null };
        } catch (parseError) {
            console.error("JSON Parse Error during second step discoverPlaces:", parseError);
            console.error("Raw JSON string from second step:", jsonString); // Log raw string for debugging
            return { places: [], groundingSources: groundingChunks, errorMessage: "Could not parse AI's response into valid place data." };
        }

    } catch (e: any) { // Catch all errors, including API errors
        console.error("Discover Places API Error (two-step process):", e);
        let userMessage = "An unknown error occurred while fetching places.";
        if (e.message && e.message.includes("RESOURCE_EXHAUSTED")) {
            userMessage = "API Quota Exceeded. Please check your Google Cloud Project for billing and usage. For more details: https://ai.google.dev/gemini-api/docs/rate-limits";
        } else if (e.message && e.message.includes("API_KEY_INVALID")) {
            userMessage = "Invalid API Key. Please ensure your API key is correct and properly configured.";
        } else if (e.message) {
            userMessage = `API Error: ${e.message}`;
        }
        return { places: [], groundingSources: [], errorMessage: userMessage };
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