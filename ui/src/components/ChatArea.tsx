"use client";
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Image, 
  Code, 
  Eye, 
  Lightbulb, 
  Search,
  ChevronDown,
  ChevronUp,
  Github,
  Sparkles,
  Coffee,
  Heart,
  Music,
  Code2,
  Gamepad2,
  HelpCircle,
  Puzzle,
  Briefcase,
  Cpu
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Chat } from '../types';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import DevelopersSection from './DeveloperSection';
import PromptNav from './PromptNav';
import ChatInput from './ChatInput';
const words = `Ask me anything about Chitransh's professional background and projects`
interface ChatAreaProps {
  currentChat: Chat | null;
  onSendMessage: (message: string) => void;
  createNewChat: (initialMessage?: string) => void;
  isLoading?: boolean;
}
interface ExpandedMessages {
  [key: number]: boolean;
}
const MESSAGE_THRESHOLD = 300;
const QuickPrompts = [
  { 
    icon: <Image size={20} />, 
    text: "Work Experience", 
    description: "Professional background and roles" ,
    prompt: "Tell me about your work experience"
  },
  { 
    icon: <Code size={20} />, 
    text: "Skills & Expertise", 
    description: "Discuss technical and soft skills     " ,
    prompt: "Tell me about your skills and expertise"
  },
  { 
    icon: <Eye size={20} />, 
    text: "Technical Projects", 
    description: "View my coding projects and implementations" ,
    prompt: "Tell me about your technical projects"
  },
  { 
    icon: <Lightbulb size={20} />, 
    text: "GitHub Portfolio", 
    description: "Browse through my code repositories",
    prompt: "Tell me about your GitHub portfolio"
  },
  { 
    icon: <Lightbulb size={20} />, 
    text: "Education", 
    description: "Academic background and skills" ,
    prompt: "Tell me about your education"
  },
];

const ChatMessage: React.FC<{ 
  msg: any; 
  index: number;
  expanded: boolean;
  onToggle: () => void;
  isFirstAssistantMessage?: boolean;
}> = ({ msg, index, expanded, onToggle, isFirstAssistantMessage }) => {
  const content = msg.content || '';
  const isLongMessage = content.length > MESSAGE_THRESHOLD;
  const displayContent = expanded ? content : content.slice(0, MESSAGE_THRESHOLD);
  
  return (
    <div 
      className={cn(
        "p-6 rounded-lg group transform transition-all duration-300 hover:scale-[1.01]",
        msg.role === 'assistant' && "bg-[#12141c]",
        "animate-slideIn"
      )}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="max-w-3xl mx-auto flex gap-4">
        <div className={cn(
          "relative w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
          msg.role === 'assistant' ? "bg-[#6c5dd3] text-white" : "bg-[#282c3a] text-white"
        )}>
          <div className={cn(
            "absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            msg.role === 'assistant' ? "bg-[#6c5dd3]" : "bg-[#282c3a]",
            "animate-ping"
          )} />
          {msg.role === 'user' ? 'U' : 'C'}
        </div>
        <div className="flex-1">
          <div className="prose prose-invert max-w-none">
            {content ? (
              <ReactMarkdown>{displayContent}</ReactMarkdown>
            ) : (msg.role === 'assistant' && isFirstAssistantMessage) && (
              <div className="text-gray-500">
                <div className="bg-[#1a1c26] rounded-lg p-2 mb-2 animate-fade-in">
                  <p>The first message may take a moment due to cold start. Thank you for your patience!</p>
                </div>
              </div>
            )}
            {(msg as StreamMessage).isStreaming && (
              <div className="flex items-center gap-1 mt-2">
                <span className="w-2 h-2 bg-[#6c5dd3] rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-[#6c5dd3] rounded-full animate-bounce animation-delay-200" />
                <span className="w-2 h-2 bg-[#6c5dd3] rounded-full animate-bounce animation-delay-400" />
              </div>
            )}
          </div>
          {isLongMessage && (
            <button
              onClick={onToggle}
              className="flex items-center gap-2 mt-4 text-sm text-gray-400 hover:text-gray-300 transition-colors group/btn"
            >
              {expanded ? (
                <>
                  <ChevronUp size={16} className="transform group-hover/btn:-translate-y-0.5 transition-transform" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown size={16} className="transform group-hover/btn:translate-y-0.5 transition-transform" />
                  Show More
                </>
              )}
            </button>
          )}
          
          {/* Timestamp and interaction indicators */}
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <span className="opacity-40 group-hover:opacity-100 transition-opacity duration-300">
              {new Date().toLocaleTimeString()}
            </span>
            {msg.role === 'assistant' && (
              <div className="flex items-center gap-1">
                <span className="w-1 h-1 bg-[#6c5dd3] rounded-full" />
                <span className="opacity-40 group-hover:opacity-100 transition-opacity duration-300">Chitransh</span>
              </div>
            )}
             {msg.role === 'user' && (
              <div className="flex items-center gap-1">
                <span className="w-1 h-1 bg-[#6c5dd3] rounded-full" />
                <span className="opacity-40 group-hover:opacity-100 transition-opacity duration-300">You</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


const ChatArea: React.FC<ChatAreaProps> = ({
  currentChat,
  onSendMessage,
  createNewChat,
  isLoading = false
}) => {
  
  const [expandedMessages, setExpandedMessages] = useState<ExpandedMessages>({});
  const [activeSection, setActiveSection] = useState('quick'); 
  const [showColdStartHint, setShowColdStartHint] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  useEffect(() => {
    if (isLoading) {
      setShowColdStartHint(true);
      const timer = setTimeout(() => setShowColdStartHint(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const toggleMessage = (index: number) => {
    setExpandedMessages(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const Logo = () => (
    <div className="mb-4 flex flex-col items-center">
      <Avatar className="w-16 h-16 mb-4 flex items-center justify-center">
        <AvatarImage src="/logo.jpg" className="w-full h-full animate-rotate" />
        <AvatarFallback>CG</AvatarFallback>
      </Avatar>
      <span className="text-3xl font-bold">ChitsGPT</span>
    </div>
  );

  const FloatingWidget = ({ icon, text, position, delay }: { 
    icon: React.ReactNode; 
    text: string;
    position: string;
    delay: number;
  }) => (
    <div className={`absolute ${position} hidden lg:flex items-center gap-2 p-3 bg-[#1a1c26] opacity-60 rounded-full 
      transform hover:scale-110 hover:opacity-100 transition-all duration-300 cursor-pointer
      animate-float
    `}
      style={{ animationDelay: `${delay}s` }}
    >
      {icon}
      <span className="text-sm text-gray-400">{text}</span>
    </div>
  );

  const funFacts = [
    "Drinks ☕️ while coding",
    "Loves 🎮 gaming breaks",
    "Listens to 🎵 lofi",
    "Night 🌙 coder",
    "Bug hunter 🐛"
  ];

  const positionHistory = {
    positions: [],
    maxSize: 6,
  
    add: (position) => {
      if (positionHistory.positions.length >= positionHistory.maxSize) {
        positionHistory.positions.shift();
      }
      positionHistory.positions.push(position);
    }
  };
  
  const getRandomPosition = () => {
    // Helper function to generate random even number between 1 and 10
    const getRandomSmallEven = () => {
      const evens = [2, 4, 6, 8, 10];
      return evens[Math.floor(Math.random() * evens.length)];
    };
  
    // Helper function to generate random number divisible by 20 (less than 100)
    const getRandomDivisibleByTwenty = () => {
      const values = [20, 40, 60, 80];
      return values[Math.floor(Math.random() * values.length)];
    };
  
    // Helper function to get random value following our rules
    const getRandomValue = () => {
      // 20% chance for small even numbers, 80% chance for numbers divisible by 20
      return Math.random() < 0.2 
        ? getRandomSmallEven()
        : getRandomDivisibleByTwenty();
    };
  
    let side = Math.random() > 0.5 ? 'left' : 'right';
    let vertical = Math.random() > 0.5 ? 'top' : 'bottom';
    
    let x, y;
    do {
      x = getRandomValue();
      y = getRandomValue();
    } while (vertical === 'top' && y === 60 && side === 'right' && x === 80); // Avoid forbidden combination
  
    const newPosition = { x, y };
    positionHistory.add(newPosition);
    
    return `${side}-${newPosition.x} ${vertical}-${newPosition.y}`;
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'quick':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {QuickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (!currentChat) {
                    createNewChat(prompt.prompt);
                  } else {
                    onSendMessage(prompt.prompt);
                  }
                }}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1a1c26] to-[#12141c] p-1 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#6c5dd3]/20"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#6c5dd3] to-[#302c59] opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
                <div className="relative rounded-lg bg-[#12141c] p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 rounded-lg bg-[#6c5dd3] bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300">
                      {prompt.icon}
                    </div>
                    <Sparkles className="h-5 w-5 text-[#6c5dd3] opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300" />
                  </div>
                  <span className="font-medium text-lg block mb-2">{prompt.text}</span>
                  <span className="text-sm text-gray-400 block leading-relaxed">{prompt.description}</span>
                </div>
              </button>
            ))}
          </div>
        );
      case 'games':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            <button
              onClick={() => {
                if (!currentChat) {
                  createNewChat("Let's play a word guessing game!");
                } else {
                  onSendMessage("Let's play a word guessing game!");
                }
              }}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1a1c26] to-[#12141c] p-1 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#6c5dd3]/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#6c5dd3] to-[#302c59] opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
              <div className="relative rounded-lg bg-[#12141c] p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 rounded-lg bg-[#6c5dd3] bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300">
                    <Gamepad2 className="h-5 w-5 text-[#6c5dd3]" />
                  </div>
                  <Sparkles className="h-5 w-5 text-[#6c5dd3] opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300" />
                </div>
                <span className="font-medium text-lg block mb-2">Word Guess</span>
                <span className="text-sm text-gray-400 block leading-relaxed">Challenge me to a word guessing game!</span>
              </div>
            </button>

            <button
              onClick={() => {
                if (!currentChat) {
                  createNewChat("Let's play 20 questions!");
                } else {
                  onSendMessage("Let's play 20 questions!");
                }
              }}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1a1c26] to-[#12141c] p-1 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#6c5dd3]/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#6c5dd3] to-[#302c59] opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
              <div className="relative rounded-lg bg-[#12141c] p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 rounded-lg bg-[#6c5dd3] bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300">
                    <HelpCircle className="h-5 w-5 text-[#6c5dd3]" />
                  </div>
                  <Sparkles className="h-5 w-5 text-[#6c5dd3] opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300" />
                </div>
                <span className="font-medium text-lg block mb-2">20 Questions</span>
                <span className="text-sm text-gray-400 block leading-relaxed">Think of something, I'll try to guess it!</span>
              </div>
            </button>

            <button
              onClick={() => {
                if (!currentChat) {
                  createNewChat("Let's play a riddle game!");
                } else {
                  onSendMessage("Let's play a riddle game!");
                }
              }}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1a1c26] to-[#12141c] p-1 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#6c5dd3]/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#6c5dd3] to-[#302c59] opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
              <div className="relative rounded-lg bg-[#12141c] p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 rounded-lg bg-[#6c5dd3] bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300">
                    <Puzzle className="h-5 w-5 text-[#6c5dd3]" />
                  </div>
                  <Sparkles className="h-5 w-5 text-[#6c5dd3] opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300" />
                </div>
                <span className="font-medium text-lg block mb-2">Riddles</span>
                <span className="text-sm text-gray-400 block leading-relaxed">Test your wit with some brain teasers!</span>
              </div>
            </button>
          </div>
        );
      case 'about':
        return (
          <div className="animate-slideIn">
            <DevelopersSection />
          </div>
        );
      case 'professional':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            <button
              onClick={() => {
                if (!currentChat) {
                  createNewChat("Tell me about your professional experience and skills");
                } else {
                  onSendMessage("Tell me about your professional experience and skills");
                }
              }}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1a1c26] to-[#12141c] p-1 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#6c5dd3]/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#6c5dd3] to-[#302c59] opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
              <div className="relative rounded-lg bg-[#12141c] p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 rounded-lg bg-[#6c5dd3] bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300">
                    <Briefcase className="h-5 w-5 text-[#6c5dd3]" />
                  </div>
                  <Sparkles className="h-5 w-5 text-[#6c5dd3] opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300" />
                </div>
                <span className="font-medium text-lg block mb-2">Experience</span>
                <span className="text-sm text-gray-400 block leading-relaxed">Learn about my professional journey and expertise</span>
              </div>
            </button>

            <button
              onClick={() => {
                if (!currentChat) {
                  createNewChat("What projects have you worked on?");
                } else {
                  onSendMessage("What projects have you worked on?");
                }
              }}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1a1c26] to-[#12141c] p-1 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#6c5dd3]/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#6c5dd3] to-[#302c59] opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
              <div className="relative rounded-lg bg-[#12141c] p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 rounded-lg bg-[#6c5dd3] bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300">
                    <Code2 className="h-5 w-5 text-[#6c5dd3]" />
                  </div>
                  <Sparkles className="h-5 w-5 text-[#6c5dd3] opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300" />
                </div>
                <span className="font-medium text-lg block mb-2">Projects</span>
                <span className="text-sm text-gray-400 block leading-relaxed">Explore my portfolio of projects and achievements</span>
              </div>
            </button>

            <button
              onClick={() => {
                if (!currentChat) {
                  createNewChat("What are your technical skills and expertise?");
                } else {
                  onSendMessage("What are your technical skills and expertise?");
                }
              }}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1a1c26] to-[#12141c] p-1 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#6c5dd3]/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#6c5dd3] to-[#302c59] opacity-0 transition-opacity duration-300 group-hover:opacity-20" />
              <div className="relative rounded-lg bg-[#12141c] p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 rounded-lg bg-[#6c5dd3] bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300">
                    <Cpu className="h-5 w-5 text-[#6c5dd3]" />
                  </div>
                  <Sparkles className="h-5 w-5 text-[#6c5dd3] opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300" />
                </div>
                <span className="font-medium text-lg block mb-2">Skills</span>
                <span className="text-sm text-gray-400 block leading-relaxed">Discover my technical skills and areas of expertise</span>
              </div>
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const EmptyState = () => (
    <div className="relative h-full flex flex-col items-center justify-center p-4 md:p-10">
      <FloatingWidget 
        icon={<Coffee className="h-4 w-4 text-amber-500" />} 
        text="Coffee Driven"
        position="bottom-20 left-40"
        delay={0}
      />
      <FloatingWidget 
        icon={<Heart className="h-4 w-4 text-pink-500" />} 
        text="Loves Open Source"
        position={getRandomPosition()}
        delay={0.3}
      />
      <FloatingWidget 
        icon={<Cpu className="h-4 w-4 text-purple-500" />} 
        text="AI Enthusiast"
        position={getRandomPosition()}
        delay={0.6}
      />
      <FloatingWidget 
        icon={<Puzzle className="h-4 w-4 text-blue-500" />} 
        text="Algorithm Lover"
        position={getRandomPosition()}
        delay={0.9}
      />
      <FloatingWidget 
        icon={<Code2 className="h-4 w-4 text-emerald-500" />} 
        text="Clean Code"
        position={getRandomPosition()}
        delay={1.2}
      />
      <FloatingWidget 
        icon={<Briefcase className="h-4 w-4 text-indigo-500" />} 
        text="Full Stack Dev"
        position={getRandomPosition()}
        delay={1.5}
      />
      <FloatingWidget 
        icon={<HelpCircle className="h-4 w-4 text-orange-500" />} 
        text="Problem Solver"
        position={getRandomPosition()}
        delay={1.8}
      />
      <FloatingWidget 
        icon={<Music className="h-4 w-4 text-green-500" />} 
        text="Coding Playlist"
        position={getRandomPosition()}
        delay={2.1}
      />
      <FloatingWidget 
        icon={<Gamepad2 className="h-4 w-4 text-red-500" />} 
        text="Gaming Enthusiast"
        position={getRandomPosition()}
        delay={2.4}
      />

      <div className="absolute left-4 top-1/2 hidden lg:block">
        <div className="bg-[#1a1c26] p-4 rounded-xl">
          <div className="text-sm text-gray-400 mb-2">Fun Facts</div>
          <div className="space-y-2">
            {funFacts.map((fact, idx) => (
              <div 
                key={idx}
                className="text-sm p-2 rounded bg-[#12141c] hover:bg-[#6c5dd3] hover:bg-opacity-20 
                  transition-all duration-300 cursor-pointer"
              >
                {fact}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#6c5dd3] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000" />
      </div> */}

      <div className="relative z-10">
  <div className="mb-12">
    <Logo />
    <h3 className="text-md text-gray-500 mt-6 text-center">
      <TextGenerateEffect words={words} className="text-sm text-gray-500" />
    </h3>
  </div>
  <div className="w-full max-w-4xl px-4">
    <div className="relative mb-16">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
      <BackgroundGradient className="rounded-full">
        <ChatInput 
          onSendMessage={(messageText) => {
            if (!currentChat) {
              createNewChat(messageText);
            } else {
              onSendMessage(messageText);
            }
          }}
          isLoading={isLoading}
        />
      </BackgroundGradient>
    </div>
    <PromptNav {...{ onSectionChange: setActiveSection, activeSection }} />
    <div className="transition-all duration-300 ease-in-out">
      {renderSection()}
    </div>
  </div>
      </div>
    </div>
  );

  const ChatDecorations = () => (
    <>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-12 hidden lg:block">
          <div className="bg-[#1a1c26] p-3 rounded-full flex items-center gap-2 animate-float">
            <Code2 className="h-4 w-4 text-[#6c5dd3]" />
            <span className="text-xs text-gray-400">Coding in progress...</span>
          </div>
        </div>

        <div className="absolute top-16 right-8 hidden lg:block">
          <div className="bg-[#1a1c26] p-3 rounded-full flex items-center gap-2 animate-float animation-delay-500">
            <Coffee className="h-4 w-4 text-yellow-500" />
            <span className="text-xs text-gray-400">Coffee level: 100%</span>
          </div>
        </div>

        <div className="absolute bottom-24 left-8 hidden lg:block">
          <div className="bg-[#1a1c26] p-3 rounded-full flex items-center gap-2 animate-float animation-delay-1000">
            <Music className="h-4 w-4 text-green-500" />
            <span className="text-xs text-gray-400">Lofi beats playing</span>
          </div>
        </div>

        <div className="absolute bottom-32 right-8 hidden lg:block">
          <div className="bg-[#1a1c26] p-3 rounded-full flex items-center gap-2 animate-float animation-delay-1500">
            <Heart className="h-4 w-4 text-pink-500" />
            <span className="text-xs text-gray-400">Built with ❤️</span>
          </div>
        </div>

        {/* <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#6c5dd3] rounded-full mix-blend-multiply filter blur-xl opacity-5 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-5 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-5 animate-blob animation-delay-4000" /> */}
      </div>

      {/* <div className="fixed top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#6c5dd3] to-transparent opacity-10 pointer-events-none" />
      <div className="fixed top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500 to-transparent opacity-10 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-pink-500 to-transparent opacity-10 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[#6c5dd3] to-transparent opacity-10 pointer-events-none" /> */}
    </>
  );

  return (
    <div className="flex flex-col h-screen bg-transparent animate-fade-in animation-delay-500">
      {currentChat?.messages?.length > 0 && <ChatDecorations />}
      <ScrollArea className="flex-1 px-4 md:px-8 pt-16 [&_.scrollbar-thumb]:bg-transparent [&_.scrollbar-track]:bg-transparent">
        {currentChat?.messages?.length ? (
          <div className="mx-auto max-w-4xl space-y-6">
            {currentChat?.messages?.map((msg, idx) => {
              const firstAssistantIndex = currentChat.messages.findIndex(m => m.role === 'assistant');
              const isFirstAssistantMessage = idx === firstAssistantIndex;
              
              return (
                <ChatMessage
                  key={idx}
                  msg={msg}
                  index={idx}
                  expanded={!!expandedMessages[idx]}
                  onToggle={() => toggleMessage(idx)}
                  isFirstAssistantMessage={isFirstAssistantMessage}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <EmptyState />
        )}
      </ScrollArea>

      {currentChat?.messages?.length > 0 && (
        <div className="border-t border-[#1a1c26] p-5 bg-[#0a0a0a] backdrop-blur-sm w-full">
          <div className="max-w-4xl mx-auto">
            <ChatInput 
              onSendMessage={(messageText) => {
                if (!currentChat) {
                  createNewChat(messageText);
                } else {
                  onSendMessage(messageText);
                }
              }}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatArea;