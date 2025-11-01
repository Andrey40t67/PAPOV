import React from 'react';
import { Personality } from '../types';

interface OnboardingProps {
  onStartChat: () => void;
  show: boolean;
}

const personalitiesInfo = [
  {
    name: Personality.Classic,
    emoji: '😎',
    description: 'Весёлый и немного глупый шестиклассник, который на самом деле гений.',
    color: 'border-sky-500/50'
  },
  {
    name: Personality.Super,
    emoji: '🧠',
    description: 'Прокачанная версия, которая не скрывает свой интеллект, но всё ещё шутит про Марь Иванну.',
     color: 'border-emerald-500/50'
  },
  {
    name: Personality.Hardcore,
    emoji: '🔥',
    description: 'Максимально дерзкий и токсичный геймер, которого ты оторвал от катки.',
     color: 'border-red-500/50'
  },
];

const Onboarding: React.FC<OnboardingProps> = ({ onStartChat, show }) => {
  if (!show) return null;

  return (
    <div className="flex items-center justify-center h-full animate-fade-in p-4">
      <div className="w-full max-w-3xl bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 shadow-2xl">
        <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-400 to-cyan-300 text-transparent bg-clip-text">Добро пожаловать в попов лох AI!</h1>
            <p className="mt-3 text-slate-300 max-w-xl mx-auto">
                Это не просто очередной AI. Это PapovLoh, ученик 6 «А» класса. Выбери его настроение в шапке и начни диалог.
            </p>
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {personalitiesInfo.map(p => (
                <div key={p.name} className={`bg-slate-800 p-6 rounded-xl border-t-4 ${p.color}`}>
                    <div className="text-4xl">{p.emoji}</div>
                    <h3 className="mt-4 font-bold text-lg text-slate-100">{p.name}</h3>
                    <p className="mt-1 text-sm text-slate-400">{p.description}</p>
                </div>
            ))}
        </div>

        <div className="mt-8 text-center">
            <button 
                onClick={onStartChat}
                className="bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-sky-500/20"
            >
                Начать диалог
            </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;