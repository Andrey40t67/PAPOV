import React from 'react';
import { Tool } from '../types';
import { APP_NAME } from '../constants';
import { ChatIcon, ImageIcon, ResearchIcon } from './common/Icons';

interface HeaderProps {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
}

const NavButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        group flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-500
        ${isActive
          ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
          : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
        }
      `}
    >
      {icon}
      <span className="ml-3 hidden md:inline">{label}</span>
    </button>
  );
};

const Header: React.FC<HeaderProps> = ({ activeTool, setActiveTool }) => {
  const tools = [
    { name: Tool.Chat, icon: <ChatIcon /> },
    { name: Tool.Image, icon: <ImageIcon /> },
    { name: Tool.Research, icon: <ResearchIcon /> },
  ];

  return (
    <header className="bg-slate-800/70 backdrop-blur-lg p-4 md:p-6 flex md:flex-col justify-between items-center md:items-start md:w-64 border-b md:border-b-0 md:border-r border-slate-700/50">
      <div className="flex items-center mb-0 md:mb-10">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
          <div className="relative w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center font-bold text-xl shadow-md">
            <span className="bg-gradient-to-r from-sky-400 to-cyan-300 text-transparent bg-clip-text">P</span>
          </div>
        </div>
        <h1 className="text-2xl font-bold ml-4 hidden md:inline bg-gradient-to-r from-sky-400 to-cyan-300 text-transparent bg-clip-text">{APP_NAME}</h1>
      </div>
      <nav className="flex md:flex-col w-full md:w-auto space-x-2 md:space-x-0 md:space-y-3">
        {tools.map((tool) => (
          <NavButton
            key={tool.name}
            label={tool.name}
            icon={tool.icon}
            isActive={activeTool === tool.name}
            onClick={() => setActiveTool(tool.name)}
          />
        ))}
      </nav>
      <style>{`
        @keyframes tilt {
          0%, 50%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(1deg); }
          75% { transform: rotate(-1deg); }
        }
        .animate-tilt { animation: tilt 10s infinite linear; }
      `}</style>
    </header>
  );
};

export default Header;