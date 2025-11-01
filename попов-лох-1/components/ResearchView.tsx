
import React, { useState } from 'react';
import { ResearchMode, GroundingSource } from '../types';
// FIX: Import 'conductResearch' which is the correct exported function name from geminiService.
import { conductResearch } from '../services/geminiService';
import Spinner from './common/Spinner';
import { ResearchIcon, WarningIcon } from './common/Icons';

const ResearchView: React.FC = () => {
  const [mode, setMode] = useState<ResearchMode>(ResearchMode.Quick);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  
  const handleModeChange = (newMode: ResearchMode) => {
    setMode(newMode);
    setResult(null);
    setError(null);
    setSources([]);
    setPrompt('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setSources([]);

    try {
      // FIX: Call 'conductResearch' instead of the non-existent 'generateResearch'.
      const response = await conductResearch(prompt, mode);
      setResult(response.text);
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (groundingChunks) {
        const extractedSources = groundingChunks
            .map((chunk: any) => ({
                uri: chunk.web?.uri,
                title: chunk.web?.title,
            }))
            .filter((source: any) => source.uri && source.title);
        setSources(extractedSources);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Ой, интернет в школе отключили! ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const researchModes = Object.values(ResearchMode);

  const renderContent = () => {
    if (mode === ResearchMode.Staling) {
        return (
            <div className="w-full max-w-3xl bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-amber-500/50 shadow-2xl text-center animate-fade-in">
               <div className="flex justify-center mb-4">
                  <WarningIcon />
               </div>
               <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 text-transparent bg-clip-text">Э-э-э, тормози!</h3>
               <p className="mt-4 text-slate-300 max-w-md mx-auto">Ты чего, с ума сошел? Год думать? У меня контра через 5 минут начинается! Давай лучше что-нибудь побыстрее спроси, а то Марь Иванна спалит.</p>
            </div>
        )
    }

    return (
        <>
            <div className="w-full max-w-3xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Что будем исследовать? (Например, 'Почему коты мурлыкают?')"
                    className="w-full h-28 bg-slate-800/80 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-shadow resize-none"
                    disabled={isLoading}
                />

                <button type="submit" className="w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-600 text-white font-bold py-3 px-4 rounded-xl transition-colors transform hover:scale-105" disabled={isLoading || !prompt.trim()}>
                    {isLoading ? <Spinner /> : <ResearchIcon />}
                    <span>{isLoading ? 'Думаю...' : 'Начать исследование'}</span>
                </button>
                </form>
            </div>

            {error && <p className="text-red-400 text-center mt-4 animate-fade-in">{error}</p>}

            {(isLoading || result) && (
                <div className="w-full max-w-3xl mt-8 bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-slate-700 animate-fade-in">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center space-y-4 text-slate-400">
                            <Spinner size="lg" />
                            <p>{mode === ResearchMode.Deep ? "Это надолго... как контрольная по математике." : "Ищу в своей шпаргалке..."}</p>
                        </div>
                    ) : result && (
                        <div>
                            <div className="prose prose-invert prose-p:text-slate-300 prose-headings:text-slate-100 max-w-none whitespace-pre-wrap leading-relaxed">{result}</div>
                            {sources.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-slate-700">
                                    <h4 className="text-lg font-semibold mb-3 text-slate-200">Источники (где я подсмотрел):</h4>
                                    <ul className="space-y-2">
                                        {sources.map((source, index) => (
                                            <li key={index} className="truncate">
                                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 transition-colors text-sm underline decoration-sky-400/50 hover:decoration-sky-300">
                                                    {source.title}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </>
    )
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex justify-center mb-8">
        <div className="bg-slate-800/80 backdrop-blur-sm p-1.5 rounded-xl flex space-x-2 border border-slate-700">
          {researchModes.map(m => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${mode === m ? 'bg-sky-600 text-white' : 'text-slate-400 hover:bg-slate-700/60'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center">
        {renderContent()}
      </div>
    </div>
  );
};

export default ResearchView;
