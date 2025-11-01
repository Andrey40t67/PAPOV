import React from 'react';
import { ChatSession, Personality } from '../types';
import { PlusIcon, TrashIcon, ChatIcon, CloseIcon } from './common/Icons';

interface ChatHistorySidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onClose: () => void;
}

const PersonalityBadge: React.FC<{ personality: Personality }> = ({ personality }) => {
    const baseClass = "text-xs font-semibold px-2 py-0.5 rounded-full";
    const colors: Record<Personality, string> = {
        [Personality.Classic]: "bg-sky-500/20 text-sky-300",
        [Personality.Super]: "bg-emerald-500/20 text-emerald-300",
        [Personality.Hardcore]: "bg-red-500/20 text-red-300",
    }
    return <span className={`${baseClass} ${colors[personality]}`}>{personality}</span>
}


const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  sessions,
  activeSessionId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onClose,
}) => {
  return (
    <aside className="w-64 bg-slate-900/70 backdrop-blur-sm border-r border-slate-800/50 flex flex-col shrink-0 h-full">
      <div className="p-4 border-b border-slate-800/50 flex items-center gap-2">
        <button
          onClick={onNewChat}
          className="flex-grow flex items-center justify-center gap-2 bg-slate-800 hover:bg-sky-600 text-slate-200 font-semibold py-2.5 px-4 rounded-lg transition-colors duration-300 transform hover:scale-105"
        >
          <PlusIcon />
          <span>Новый диалог</span>
        </button>
        <button
          onClick={onClose}
          className="p-2.5 rounded-lg text-slate-400 hover:bg-slate-700/50 md:hidden"
          aria-label="Закрыть меню"
        >
          <CloseIcon />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSelectChat(session.id)}
            className={`group flex items-center justify-between w-full p-3 text-left text-sm rounded-lg cursor-pointer transition-colors duration-200 ${
              activeSessionId === session.id
                ? 'bg-sky-500/20 text-white'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <div className="flex-1 overflow-hidden">
                <p className="truncate font-medium">{session.title}</p>
                <div className="flex items-center gap-2 mt-1.5">
                    <PersonalityBadge personality={session.personality} />
                </div>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Точно удалить чат "${session.title}"?`)) {
                    onDeleteChat(session.id);
                }
              }}
              className="ml-2 p-1.5 rounded-md text-slate-500 hover:bg-red-500/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Delete chat"
            >
              <TrashIcon />
            </button>
          </div>
        ))}
        {sessions.length === 0 && (
            <div className="text-center text-slate-500 px-4 py-8">
                <ChatIcon />
                <p className="mt-2 text-sm">Тут пока пусто. <br/> Начни новый диалог!</p>
            </div>
        )}
      </nav>
    </aside>
  );
};

export default ChatHistorySidebar;