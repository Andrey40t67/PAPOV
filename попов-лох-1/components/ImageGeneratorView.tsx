import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import Spinner from './common/Spinner';
import { ImageIcon } from './common/Icons';

const ImageGeneratorView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const url = await generateImage(prompt);
      setImageUrl(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Ой, кисточки сломались! ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative w-full max-w-2xl">
          <div className="absolute -inset-px bg-gradient-to-r from-sky-500 to-cyan-400 rounded-2xl blur-md opacity-40"></div>
          <div className="relative w-full bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 shadow-2xl">
            <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-sky-400 to-cyan-300 text-transparent bg-clip-text">Генератор Картинок</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Что нарисуем? Например, 'Кот-космонавт на скейтборде в стиле киберпанк'"
                className="w-full h-24 bg-slate-700/50 border border-slate-600 rounded-xl p-4 text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-shadow resize-none"
                disabled={isLoading}
              />
              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-600 text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100" disabled={isLoading || !prompt.trim()}>
                {isLoading ? <Spinner /> : <ImageIcon />}
                <span>{isLoading ? 'Рисую...' : 'Создать шедевр!'}</span>
              </button>
            </form>
            {error && <p className="text-red-400 text-center mt-4 animate-fade-in">{error}</p>}
          </div>
        </div>

        <div className="w-full max-w-2xl aspect-square mt-8 flex justify-center items-center">
          {isLoading && (
            <div className="w-full h-full bg-slate-800/50 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-700 space-y-4">
                <Spinner size="lg"/>
                <p className="text-slate-400">Колдую над шедевром...</p>
            </div>
          )}
          {imageUrl && (
            <div className="w-full h-full rounded-xl overflow-hidden shadow-lg border border-slate-700 animate-fade-in">
              <img src={imageUrl} alt={prompt} className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageGeneratorView;