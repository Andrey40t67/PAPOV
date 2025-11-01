import { GoogleGenAI, GenerateContentResponse, FunctionDeclaration, Type } from "@google/genai";
import { ResearchMode } from "../types";

const getGenAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY environment variable not set");
  }
  return new GoogleGenAI({ apiKey });
};

const toolDeclarations: { functionDeclarations: FunctionDeclaration[] }[] = [
    {
        functionDeclarations: [
            {
                name: "generate_image",
                description: "Создает изображение по описанию пользователя. Используй, когда пользователь просит нарисовать, создать или сгенерировать картинку.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        prompt: {
                            type: Type.STRING,
                            description: "Подробное описание изображения для генерации."
                        }
                    },
                    required: ["prompt"]
                }
            },
            {
                name: "conduct_research",
                description: "Проводит исследование по теме с помощью Google Поиска. Используй, когда пользователь задает вопрос, требующий актуальной информации из интернета.",
                parameters: {
                    type: Type.OBJECT,
                    properties: {
                        query: {
                            type: Type.STRING,
                            description: "Поисковый запрос или вопрос."
                        },
                        mode: {
                            type: Type.STRING,
                            description: `Глубина исследования. Используй '${ResearchMode.Quick}' для простых вопросов и '${ResearchMode.Deep}' для сложных тем.`,
                            enum: [ResearchMode.Quick, ResearchMode.Deep]
                        }
                    },
                    required: ["query", "mode"]
                }
            }
        ]
    }
];


export const generateChatResponse = async (history: { role: string, parts: { text: string }[] }[], newMessage: string, systemInstruction: string): Promise<GenerateContentResponse> => {
  const ai = getGenAI();
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction,
      tools: toolDeclarations,
    },
    history,
  });
  const response = await chat.sendMessage({ message: newMessage });
  return response;
};

export const generateImage = async (prompt: string): Promise<string> => {
  const ai = getGenAI();
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: '1:1',
    },
  });

  if (response.generatedImages && response.generatedImages.length > 0) {
    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64ImageBytes}`;
  }
  throw new Error("Image generation failed or returned no images.");
};


export const conductResearch = async (query: string, mode: ResearchMode): Promise<GenerateContentResponse> => {
    const ai = getGenAI();
    const model = mode === ResearchMode.Deep ? 'gemini-2.5-pro' : 'gemini-2.5-flash';

    const response = await ai.models.generateContent({
        model: model,
        contents: `Проведи исследование по теме: "${query}". Ответ должен быть в стиле Попова лоха.`,
        config: {
            // Примечание: системная инструкция здесь не передается динамически, 
            // так как исследование - это отдельный вызов. Для полной консистентности 
            // его тоже можно было бы пробрасывать.
            tools: [{ googleSearch: {} }],
        },
    });
    return response;
};