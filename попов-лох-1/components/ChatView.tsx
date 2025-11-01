import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ResearchData, ResearchMode, ChatSession } from '../types';
import { generateChatResponse, generateImage, conductResearch } from '../services/geminiService';
import { SendIcon, DownloadIcon, RegenerateIcon } from './common/Icons';
import Spinner from './common/Spinner';
import { PERSONALITY_PROMPTS } from '../constants';
import EmptyChatPlaceholder from './EmptyChatPlaceholder';

interface ChatViewProps {
  session: ChatSession;
  onUpdateMessages: (sessionId: string, messages: ChatMessage[]) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ session, onUpdateMessages }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(session.messages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const systemInstruction = PERSONALITY_PROMPTS[session.personality];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `papovloh-art-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const updateMessages = (newMessages: ChatMessage[]) => {
    setMessages(newMessages);
    onUpdateMessages(session.id, newMessages);
  };
  
  const executeGeneration = async (prompt: string, baseMessages: ChatMessage[]) => {
    setIsLoading(true);
    setError(null);

    const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', content: prompt };
    const messagesWithPrompt = [...baseMessages, userMessage];
    
    const loadingMessageId = `model-loading-${Date.now()}`;
    updateMessages([...messagesWithPrompt, { id: loadingMessageId, role: 'model', content: '', isLoading: true }]);

    const history = baseMessages
        .map(msg => ({
            role: msg.role,
            parts: [{ text: typeof msg.content === 'string' ? msg.content : '[объект]' }]
        }));

    try {
      const response = await generateChatResponse(history, prompt, systemInstruction);
      
      let finalMessages = [...messagesWithPrompt];

      const functionCalls = response.functionCalls;

      if (functionCalls && functionCalls.length > 0) {
        for (const fc of functionCalls) {
          if (fc.name === 'generate_image') {
            const { prompt: imagePrompt } = fc.args;
            try {
              const imageUrl = await generateImage(imagePrompt as string);
              const imageMessage: ChatMessage = { id: `model-${Date.now()}`, role: 'model', content: { imageUrl } };
              finalMessages.push(imageMessage);
            } catch (toolError) {
              const errorMessage = toolError instanceof Error ? toolError.message : 'An unknown error occurred.';
              setError(`Ой, кисточки сломались! ${errorMessage}`);
              finalMessages.push({ id: `model-error-${Date.now()}`, role: 'model', content: `Ой, кисточки сломались! Кажется, что-то пошло не так.` });
            }
          } else if (fc.name === 'conduct_research') {
            const { query, mode } = fc.args;
            try {
              const researchResponse = await conductResearch(query as string, mode as ResearchMode);
              const groundingChunks = researchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
              const sources = groundingChunks ? groundingChunks
                .map((chunk: any) => ({
                  uri: chunk.web?.uri,
                  title: chunk.web?.title,
                }))
                .filter((source: any) => source.uri && source.title) : [];
              
              const researchData: ResearchData = {
                text: researchResponse.text,
                sources
              };
              const researchMessage: ChatMessage = { id: `model-${Date.now()}`, role: 'model', content: { researchData } };
              finalMessages.push(researchMessage);
            } catch (toolError) {
              const errorMessage = toolError instanceof Error ? toolError.message : 'An unknown error occurred.';
              setError(`Ой, интернет в школе отключили! ${errorMessage}`);
              finalMessages.push({ id: `model-error-${Date.now()}`, role: 'model', content: `Ой, интернет в школе отключили! Кажется, что-то пошло не так.` });
            }
          }
        }
      } else {
        const modelMessage: ChatMessage = { id: `model-${Date.now()}`, role: 'model', content: response.text };
        finalMessages.push(modelMessage);
      }
      updateMessages(finalMessages);

    } catch (err) {
       updateMessages(messagesWithPrompt);
       const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
       setError(`Ой, что-то пошло не так! ${errorMessage}`);
       updateMessages([...messagesWithPrompt, { id: `model-error-${Date.now()}`, role: 'model', content: `Ой, что-то пошло не так!` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async (modelMessageId: string) => {
    if (isLoading) return;

    const modelMessageIndex = messages.findIndex(msg => msg.id === modelMessageId);
    if (modelMessageIndex <= 0 || messages[modelMessageIndex - 1].role !== 'user') {
        console.error("Cannot regenerate this message. Preceding message is not from the user.");
        return;
    }
    
    const userPromptMessage = messages[modelMessageIndex - 1];
    const promptToRegenerate = userPromptMessage.content;

    if (typeof promptToRegenerate !== 'string') {
        setError("Перегенерация для этого типа сообщения пока не поддерживается.");
        setTimeout(() => setError(null), 3000);
        return;
    }

    const historyToPreserve = messages.slice(0, modelMessageIndex - 1);
    await executeGeneration(promptToRegenerate, historyToPreserve);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const currentInput = input;
    setInput('');
    await executeGeneration(currentInput, messages);
  };

  const handlePromptClick = async (prompt: string) => {
    await executeGeneration(prompt, messages);
  };


  const renderMessageContent = (msg: ChatMessage) => {
    if (msg.isLoading) {
        return <Spinner />;
    }
    const { content } = msg;
    if (typeof content === 'string') {
        return <p className="whitespace-pre-wrap leading-relaxed">{content}</p>;
    }
    if ('imageUrl' in content) {
        return (
            <div className="group relative">
                <div className="rounded-xl overflow-hidden border border-slate-700 mt-2">
                    <img src={content.imageUrl} alt="Generated image" className="w-full h-auto max-w-sm" />
                </div>
                 <button 
                    onClick={() => handleDownload(content.imageUrl)}
                    className="absolute top-4 right-4 p-2 bg-slate-900/60 backdrop-blur-sm rounded-full text-slate-200 hover:bg-sky-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label="Download image"
                >
                    <DownloadIcon />
                </button>
            </div>
        );
    }
    if ('researchData' in content) {
        const { text, sources } = content.researchData;
        return (
            <div>
                <div className="prose prose-invert prose-p:text-slate-300 prose-headings:text-slate-100 max-w-none whitespace-pre-wrap leading-relaxed">{text}</div>
                {sources.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                        <h4 className="text-sm font-semibold mb-2 text-slate-400">Источники (где я подсмотрел):</h4>
                        <ul className="space-y-1">
                            {sources.map((source, index) => (
                                <li key={index} className="truncate">
                                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 transition-colors text-xs underline decoration-sky-400/50 hover:decoration-sky-300">
                                        {source.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    }
    return null;
  };
  
  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto px-4">
      <div className="flex-1 overflow-y-auto pt-8 pr-4 -mr-4">
        {messages.length === 0 && !isLoading ? (
          <EmptyChatPlaceholder onPromptClick={handlePromptClick} />
        ) : (
            <div className="space-y-6 pb-6">
                {messages.map((msg) => (
                <div key={msg.id} className={`flex items-start gap-4 animate-fade-in-slide-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'model' && (
                        <div className="relative group w-8 h-8 flex-shrink-0 mt-1.5">
                            <div className="relative w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center font-bold text-sm shadow-md border border-slate-700">
                                <span className="bg-gradient-to-r from-sky-400 to-cyan-300 text-transparent bg-clip-text">P</span>
                            </div>
                        </div>
                    )}
                    <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-xl px-5 py-3 rounded-2xl shadow-md ${msg.role === 'user' ? 'bg-sky-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
                        {renderMessageContent(msg)}
                        </div>
                        {msg.role === 'model' && !msg.isLoading && (
                            <div className="pt-2">
                                <button
                                onClick={() => handleRegenerate(msg.id)}
                                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isLoading}
                                title="Перегенерировать ответ"
                                >
                                <RegenerateIcon />
                                <span>Перегенерировать</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="py-4 bg-slate-900 sticky bottom-0">
        {error && <p className="text-red-400/80 text-sm mb-2 text-center animate-fade-in">{error}</p>}
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Спроси что-нибудь или попроси нарисовать..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-4 pr-14 text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all duration-300 shadow-sm"
            disabled={isLoading}
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 disabled:bg-slate-600 transition-colors transform hover:scale-110 disabled:scale-100" disabled={isLoading || !input.trim()}>
            <SendIcon />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatView;