import React, { useState, useEffect } from 'react';
import ChatView from './components/ChatView';
import ChatHistorySidebar from './components/ChatHistorySidebar';
import { APP_NAME } from './constants';
import { Personality, ChatSession, ChatMessage } from './types';
import { loadChatSessions, saveChatSessions } from './services/localStorageService';
import { MenuIcon } from './components/common/Icons';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [personality, setPersonality] = useState<Personality>(Personality.Classic);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const loadedSessions = loadChatSessions();
    if (loadedSessions.length > 0) {
      setSessions(loadedSessions);
      setActiveSessionId(loadedSessions[0].id);
    } else {
      // Auto-create the first chat on initial load if none exist
      const newSession: ChatSession = {
        id: `chat-${Date.now()}`,
        title: 'Новый диалог',
        timestamp: Date.now(),
        messages: [],
        personality: Personality.Classic,
      };
      setSessions([newSession]);
      setActiveSessionId(newSession.id);
    }
  }, []);

  useEffect(() => {
    saveChatSessions(sessions);
  }, [sessions]);

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: `chat-${Date.now()}`,
      title: 'Новый диалог',
      timestamp: Date.now(),
      messages: [],
      personality: personality,
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newSession.id);
    setIsSidebarOpen(false);
  };
  
  const handleSelectChat = (id: string) => {
    setActiveSessionId(id);
    const selectedSession = sessions.find(s => s.id === id);
    if (selectedSession) {
      setPersonality(selectedSession.personality);
    }
    setIsSidebarOpen(false);
  };

  const handleDeleteChat = (id: string) => {
    const updatedSessions = sessions.filter(s => s.id !== id);
    setSessions(updatedSessions);
    if (activeSessionId === id) {
      setActiveSessionId(updatedSessions.length > 0 ? updatedSessions[0].id : null);
    }
  };

  const handleUpdateChat = (sessionId: string, newMessages: ChatMessage[]) => {
    setSessions(prevSessions =>
      prevSessions.map(session => {
        if (session.id === sessionId) {
          // Автоматически генерируем заголовок из первого сообщения пользователя
          const needsTitle = session.title === 'Новый диалог' && newMessages.length > 0 && typeof newMessages[0].content === 'string';
          const newTitle = needsTitle
            ? (newMessages[0].content as string).substring(0, 30) + '...'
            : session.title;
          
          return { ...session, messages: newMessages, title: newTitle };
        }
        return session;
      })
    );
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);

  return (
    <div className="flex h-screen font-sans bg-slate-900 text-slate-200 overflow-hidden">
      <div className={`
        fixed md:static inset-y-0 left-0 z-30
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <ChatHistorySidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onDeleteChat={handleDeleteChat}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>

      {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-20 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
      )}
      
      <div className="flex flex-col flex-1 overflow-hidden">
         <header className="flex items-center justify-between p-3 border-b border-slate-800/50 shrink-0 backdrop-blur-sm bg-slate-900/70 z-10 sticky top-0">
            <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 -ml-1 rounded-md text-slate-300 hover:bg-slate-700/50 md:hidden"
                  aria-label="Открыть меню"
                >
                  <MenuIcon />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center font-bold text-lg shadow-md border border-slate-700">
                        <span className="bg-gradient-to-r from-sky-400 to-cyan-300 text-transparent bg-clip-text">P</span>
                    </div>
                    <h1 className="text-lg font-bold text-slate-200 hidden sm:block">{APP_NAME}</h1>
                </div>
            </div>
            <div className="flex items-center bg-slate-900/50 border border-slate-700 rounded-full p-1 space-x-1">
              {(Object.values(Personality)).map((p) => (
                <button
                  key={p}
                  onClick={() => setPersonality(p)}
                  className={`px-3 py-1 text-xs md:text-sm font-medium rounded-full transition-colors duration-300 whitespace-nowrap ${
                    personality === p ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-700/50'
                  }`}
                  title={`Начать новый чат в режиме "${p}"`}
                >
                  {p}
                </button>
              ))}
            </div>
        </header>
        <main className="flex-1 min-h-0">
          {activeSession ? (
            <ChatView
              key={activeSession.id}
              session={activeSession}
              onUpdateMessages={handleUpdateChat}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500">
                <p>Создание нового диалога...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;