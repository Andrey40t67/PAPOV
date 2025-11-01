export enum Personality {
    Classic = 'Классика',
    Super = 'SUPER',
    Hardcore = 'Жесткий',
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface ResearchData {
    text: string;
    sources: GroundingSource[];
}

export type MessageContent = string | { imageUrl: string } | { researchData: ResearchData };

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: MessageContent;
  isLoading?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: number;
  messages: ChatMessage[];
  personality: Personality;
}

export enum ResearchMode {
    Quick = 'Быстрый',
    Deep = 'Глубокий',
    // FIX: Add missing 'Staling' research mode used in ResearchView.tsx.
    Staling = 'Год думать',
}

// FIX: Add Tool enum for Header component.
export enum Tool {
    Chat = 'Chat',
    Image = 'Image',
    Research = 'Research',
}
