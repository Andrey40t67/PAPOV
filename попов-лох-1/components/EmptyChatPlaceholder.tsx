import React from 'react';
import { CodeIcon, ImageIcon, BulbIcon, BrainCircuitIcon } from './common/Icons';

interface EmptyChatPlaceholderProps {
  onPromptClick: (prompt: string) => void;
}

const suggestions = [
  {
    icon: <BulbIcon />,
    title: "Придумай идею",
    prompt: "Придумай, как сделать, чтобы домашка по математике делалась сама",
  },
  {
    icon: <ImageIcon />,
    title: "Нарисуй что-нибудь",
    prompt: "Нарисуй, как Ольга Алексеевна (моя математичка) пытается съесть свой учебник",
  },
  {
    icon: <BrainCircuitIcon />,
    title: "Объясни сложное",
    prompt: "Объясни, почему небо голубое, но чтобы даже мой кот понял",
  },
  {
    icon: <CodeIcon />,
    title: "Напиши код",
    prompt: "Напиши код для взлома школьного вайфая, чтобы в контру на перемене рубиться",
  },
];

const EmptyChatPlaceholder: React.FC<EmptyChatPlaceholderProps> = ({ onPromptClick }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-4 animate-fade-in">
      <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center font-bold text-4xl shadow-lg border-2 border-slate-700 mb-6">
        <span className="bg-gradient-to-r from-sky-400 to-cyan-300 text-transparent bg-clip-text">P</span>
      </div>
      <h2 className="text-2xl font-bold text-slate-200">Чем сегодня займёмся?</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 w-full max-w-2xl">
        {suggestions.map((s, i) => (
          <button 
            key={i}
            onClick={() => onPromptClick(s.prompt)}
            className="bg-slate-800 p-4 rounded-lg text-left hover:bg-slate-700/50 transition-colors duration-200 border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-sky-500 text-white"
            style={{ animationDelay: `${i * 100}ms` }}
            aria-label={`Задать вопрос: ${s.prompt}`}
          >
            <div className="flex items-center gap-3">
              <div className="text-sky-400">{s.icon}</div>
              <p className="font-semibold text-slate-300">{s.title}</p>
            </div>
            <p className="text-sm text-slate-400 mt-1">{s.prompt}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmptyChatPlaceholder;