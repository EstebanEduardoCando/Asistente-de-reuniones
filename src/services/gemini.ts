import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY_STORAGE_KEY = 'gemini_api_key';

export const getApiKey = () => localStorage.getItem(API_KEY_STORAGE_KEY);
export const setApiKey = (key: string) => localStorage.setItem(API_KEY_STORAGE_KEY, key);

export async function generateMinutes(notes: string, images: { blob: Blob, mimeType: string }[]): Promise<{ minutes: string, tags: string[] }> {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('API Key not found. Please configure it in Settings.');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    const prompt = `
    You are an expert Meeting Secretary. 
    Analyze the following meeting notes and attached visual context (images/slides/whiteboards).
    
    Generate a formal Meeting Minutes document (Acta de Reunión) in Markdown format AND a list of relevant tags.
    
    Return the result strictly as a JSON object with the following structure:
    {
      "minutes": "# Meeting Minutes\n\n...",
      "tags": ["tag1", "tag2", "tag3"]
    }

    Structure for "minutes":
    1. **Summary**: Brief executive summary.
    2. **Key Decisions**: Bullet points of decisions made.
    3. **Action Items**: Checklist of tasks (Who, What, When).
    4. **Visual References**: If images were provided, explain what they show and how they relate to the decisions.
    
    Meeting Notes:
    ${notes}
  `;

    const imageParts = await Promise.all(images.map(async (img) => {
        return {
            inlineData: {
                data: await blobToBase64(img.blob),
                mimeType: img.mimeType
            }
        };
    }));

    const result = await model.generateContent([prompt, ...imageParts]);
    const text = result.response.text();

    // Clean up potential markdown code blocks if the model wraps the JSON
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
        return JSON.parse(cleanText) as { minutes: string, tags: string[] };
    } catch (e) {
        console.error("Failed to parse JSON response:", text);
        // Fallback if JSON parsing fails
        return { minutes: text, tags: [] };
    }
}

function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
