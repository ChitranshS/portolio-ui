import React from 'react';
import { Zap, Sparkles, Briefcase, Gamepad2 } from 'lucide-react';

interface PromptNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const PromptNav: React.FC<PromptNavProps> = ({ activeSection, onSectionChange }) => {
  const navItems = [
    {
      id: 'quick',
      label: 'Quick Prompts',
      icon: <Zap size={20} className="sm:size-4" />,
      tooltip: 'Technical & Professional Prompts'
    },
    {
      id: 'professional',
      label: 'Professional',
      icon: <Briefcase size={20} className="sm:size-4" />,
      tooltip: 'Professional Portfolio & Experience'
    },
    {
      id: 'games',
      label: 'Mini Games',
      icon: <Gamepad2 size={20} className="sm:size-4" />,
      tooltip: 'Play Some Fun Games!'
    },
    {
      id: 'about',
      label: 'About Me',
      icon: <Sparkles size={20} className="sm:size-4" />,
      tooltip: 'Learn More About Me'
    }
  ];

  return (
    <div className="w-full max-w-xl mx-auto mb-6 px-2 sm:px-0">
      <nav className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-1.5 flex justify-between sm:justify-start sm:gap-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`
              flex-1 sm:flex-initial
              flex items-center justify-center sm:justify-start gap-2 
              px-2 sm:px-3 py-2 sm:py-1.5 rounded-md
              transition-all duration-300 ease-out
              group relative hover:scale-105
              ${activeSection === item.id 
                ? 'bg-purple-500/20 text-purple-400 shadow-lg shadow-purple-500/10' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'}
            `}
          >
            {/* Icon with floating animation */}
            <span className={`
              transition-all duration-300
              ${activeSection === item.id ? 'scale-110 animate-bounce' : 'group-hover:scale-110 group-hover:rotate-12'}
            `}>
              {item.icon}
            </span>
            
            {/* Label with slide effect */}
            <span className="text-sm font-medium hidden sm:block transform transition-all duration-300 group-hover:translate-x-1">
              {item.label}
            </span>

            {/* Enhanced Tooltip */}
            <div className="absolute -top-12 sm:-top-10 left-1/2 -translate-x-1/2 
                          opacity-0 group-hover:opacity-100 
                          transition-all duration-300
                          transform scale-95 group-hover:scale-100
                          pointer-events-none z-50">
              <div className="bg-gray-900 text-gray-300 text-[10px] sm:text-xs px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg whitespace-nowrap
                            shadow-lg shadow-purple-500/10 border border-purple-500/20">
                {item.tooltip}
              </div>
              <div className="w-2 h-2 bg-gray-900 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2
                            border-r border-b border-purple-500/20"></div>
            </div>

            {/* Enhanced Active Indicator */}
            {activeSection === item.id && (
              <>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 
                              w-1 h-1 rounded-full bg-purple-400 
                              shadow-lg shadow-purple-500/50
                              animate-ping" />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 
                              w-1 h-1 rounded-full bg-purple-400 
                              shadow-lg shadow-purple-500/50" />
              </>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default PromptNav;