import { ChatSession } from '../types';

const SESSIONS_KEY = 'papovloh_chat_sessions';

export const saveChatSessions = (sessions: ChatSession[]): void => {
  try {
    const data = JSON.stringify(sessions);
    localStorage.setItem(SESSIONS_KEY, data);
  } catch (error) {
    console.error("Failed to save chat sessions to localStorage:", error);
  }
};

export const loadChatSessions = (): ChatSession[] => {
  try {
    const data = localStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to load chat sessions from localStorage:", error);
    return [];
  }
};
