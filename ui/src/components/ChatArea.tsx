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
  Cpu,
  GraduationCap,
  Zap,
  Share2,
  Linkedin,
  Twitter,
  FileDown,
  X
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
    icon: <Image size={20} className="text-[#6c5dd3]" />,
    text: "Work Experience",
    description: "Professional background and roles",
    prompt: "Tell me about your work experience"
  },
  {
    icon: <Code size={20} className="text-[#6c5dd3]" />,
    text: "Skills & Expertise",
    description: "Discuss technical and soft skills     ",
    prompt: "Tell me about your skills and expertise"
  },
  {
    icon: <Eye size={20} className="text-[#6c5dd3]" />,
    text: "Technical Projects",
    description: "View my coding projects and implementations",
    prompt: "Tell me about your technical projects"
  },
  {
    icon: <Github size={20} className="text-[#6c5dd3]" />,
    text: "GitHub Portfolio",
    description: "Browse through my code repositories",
    prompt: "Tell me about your GitHub portfolio"
  },
  {
    icon: <GraduationCap size={20} className="text-[#6c5dd3]" />,
    text: "Education",
    description: "Academic background and skills",
    prompt: "Tell me about your education"
  },
  
];

const GamePrompts = [
  {
    icon: <Gamepad2 size={20} className="text-[#6c5dd3]" />,
    text: "Word Guess",
    description: "Challenge me to a word guessing game!",
    prompt: "Let's play a word guessing game!"
  },
  {
    icon: <HelpCircle size={20} className="text-[#6c5dd3]" />,
    text: "20 Questions",
    description: "Think of something, I'll try to guess it!",
    prompt: "Let's play 20 questions!"
  },
  {
    icon: <Puzzle size={20} className="text-[#6c5dd3]" />,
    text: "Riddles",
    description: "Test your wit with some brain teasers!",
    prompt: "Let's play a riddle game!"
  }
];

const ProfessionalPrompts = [
  {
    icon: <Briefcase size={20} className="text-[#6c5dd3]" />,
    text: "Experience",
    description: "Learn about my professional journey and expertise",
    prompt: "Tell me about your professional experience and skills"
  },
  {
    icon: <Code2 size={20} className="text-[#6c5dd3]" />,
    text: "Projects",
    description: "Explore my portfolio of projects and achievements",
    prompt: "What projects have you worked on?"
  },
  {
    icon: <Cpu size={20} className="text-[#6c5dd3]" />,
    text: "Skills",
    description: "Discover my technical skills and areas of expertise",
    prompt: "What are your technical skills and expertise?"
  }
  
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

            {msg.role === 'assistant' && (
              <div className="flex items-center gap-1">
                <span className="opacity-40 group-hover:opacity-100 transition-opacity duration-300">Chitransh</span>
              </div>
            )}
            {msg.role === 'user' && (
              <div className="flex items-center gap-1">
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
  const [isChatMode, setIsChatMode] = useState(false);
  const [showHoverNotification, setShowHoverNotification] = useState(false);
  const [showChatNotification, setShowChatNotification] = useState(false);
  const [showUpdateNotification, setShowUpdateNotification] = useState(true);
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

  useEffect(() => {
    if (!isChatMode) {
      // Show hover notification after 1 second
      const hoverTimer = setTimeout(() => {
        setShowHoverNotification(true);
      }, 1000);

      // Show chat notification after 3 seconds
      const chatTimer = setTimeout(() => {
        setShowChatNotification(true);
      }, 3000);

      return () => {
        clearTimeout(hoverTimer);
        clearTimeout(chatTimer);
      };
    }
  }, [isChatMode]);

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
    <div className={`absolute ${position} hidden lg:flex items-center gap-3 p-3.5 bg-[#1a1c26]/90 backdrop-blur-lg 
      border border-[#6c5dd3]/20 shadow-xl hover:shadow-[#6c5dd3]/20 hover:border-[#6c5dd3]/40
      rounded-full transform hover:scale-105 transition-all duration-300 cursor-pointer group
      animate-float opacity-40 group-hover:opacity-100
    `}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
        {icon}
      </div>
      <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{text}</span>
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

  const EmptyState = () => (
    <div className="relative h-full flex flex-col items-center justify-center p-4 md:p-10 overflow-hidden">
      {/* Particle Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#6c5dd3] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000" />
      </div>

      {/* Floating Cards - Only show when chat mode is off */}
      {!isChatMode && (
        <>
          {/* Update Notification */}
          {showUpdateNotification && (
            <div className="absolute top-4 transform -translate-x-1/2 z-50 animate-slideIn">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 rounded-full border border-emerald-400/50 shadow-lg shadow-emerald-500/20 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-white" />
                <span className="text-xs text-white font-medium">New: Fixed chat history and message threading!</span>
                <button onClick={() => setShowUpdateNotification(false)} className="text-white hover:text-gray-300 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Hover Notification */}
          {showHoverNotification && (
            <div className="absolute top-14 transform -translate-x-1/2 z-50 animate-slideIn">
              <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 rounded-full border border-violet-400/50 shadow-lg shadow-violet-500/20 flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-white" />
                <span className="text-xs text-white font-medium">Hover over the cards to explore more about me!</span>
                <button onClick={() => setShowHoverNotification(false)} className="text-white hover:text-gray-300 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
          {showChatNotification && (
            <div className="absolute top-24 transform -translate-x-1/2 z-50 animate-slideIn">
              <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 rounded-full border border-violet-400/50 shadow-lg shadow-violet-500/20 flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-white" />
                <span className="text-xs text-white font-medium">Try out the chat mode!</span>
                <button onClick={() => setShowChatNotification(false)} className="text-white hover:text-gray-300 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Profile Card */}
          <div
            className=" opacity-100 w-[280px] absolute top-[15%] left-[15%] transform transition-all duration-500 hover:scale-110 group md:block"
            style={{
              animation: `float 7s ease-in-out infinite 0s`,
            }}
          >
            <div className="bg-[#1a1c26]/90 backdrop-blur-lg p-4 rounded-xl border border-[#6c5dd3]/20 shadow-xl hover:shadow-[#6c5dd3]/20 hover:border-[#6c5dd3]/40 transition-all duration-300 max-w-[280px] opacity-100 group-hover:opacity-100 group-hover:blur-none">
              <div className="flex items-center justify-center mb-4">
                <div className="w-20 h-20 rounded-full border-2 border-[#6c5dd3] p-1">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-[#6c5dd3] to-[#302c59] overflow-hidden">
                    <img
                      src="face.webp"
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
              <div className="text-center mb-3">
                <h3 className="text-sm font-semibold text-white mb-1">Chitransh Srivastava</h3>
                <div className="flex flex-wrap gap-1 justify-center">
                  <span className="text-[10px] bg-[#6c5dd3]/20 text-[#6c5dd3] px-2 py-0.5 rounded-full">Full Stack Dev</span>
                  <span className="text-[10px] bg-[#6c5dd3]/20 text-[#6c5dd3] px-2 py-0.5 rounded-full">AI Engineer</span>
                </div>
              </div>
              <div className="space-y-2 text-center">
                <div className="text-[10px] text-gray-400">
                  🌍 Remote
                </div>
                <div className="text-[10px] text-gray-400">
                  💼 Open to opportunities
                </div>
                <div className="text-[10px] text-gray-400">
                  🎯 Building the future with code
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Card */}
          <div
            className="absolute top-[5%] right-[25%] transform transition-all duration-500 hover:scale-110 group hidden lg:block"
            style={{
              animation: `float 7s ease-in-out infinite 0.2s`,
            }}
          >
            <div className="bg-[#1a1c26]/90 backdrop-blur-lg p-4 rounded-xl border border-[#6c5dd3]/20 shadow-xl hover:shadow-[#6c5dd3]/20 hover:border-[#6c5dd3]/40 transition-all duration-300 max-w-[220px] opacity-100 group-hover:opacity-100 group-hover:blur-none">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <Share2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Connect With Me</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Social</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <a href="https://github.com/ChitranshS" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <Github className="h-4 w-4" />
                  <span className="text-xs">Github</span>
                </a>
                <a href="https://www.linkedin.com/in/chitransh-srivastava-ai/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="h-4 w-4" />
                  <span className="text-xs">LinkedIn</span>
                </a>
                <a href="https://twitter.com/ChitranshS" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <Twitter className="h-4 w-4" />
                  <span className="text-xs">Twitter</span>
                </a>
                <a href="https://drive.google.com/file/d/1OOjEX-3X99t_DODpSYxprugRsCZDRNqx/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  <FileDown className="h-4 w-4" />
                  <span className="text-xs">Resume</span>
                </a>
              </div>
            </div>
          </div>

          {/* AI Card */}
          <div
            className="absolute top-[15%] right-[15%] transform transition-all duration-500 hover:scale-110 group hidden lg:block"
            style={{
              animation: `float 7s ease-in-out infinite 0.4s`,
            }}
          >
            <div className="bg-[#1a1c26]/90 backdrop-blur-lg p-4 rounded-xl border border-[#6c5dd3]/20 shadow-xl hover:shadow-[#6c5dd3]/20 hover:border-[#6c5dd3]/40 transition-all duration-300 max-w-[220px] opacity-30 blur-[1px] group-hover:opacity-100 group-hover:blur-none">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                  <Cpu className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">AI & ML Skills</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">PyTorch</span>
                    <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">TensorFlow</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-2">Building intelligent systems and exploring AI frontiers.</p>
              <div className="flex flex-wrap gap-1">
                <div className="text-[10px] flex items-center gap-1 text-gray-500">
                  <span>ML:</span>
                  <span className="text-purple-400">▓▓▓▓▓▓▓░░░</span>
                </div>
                <div className="text-[10px] flex items-center gap-1 text-gray-500">
                  <span>AI:</span>
                  <span className="text-purple-400">▓▓▓▓▓▓▓▓░░</span>
                </div>
              </div>
            </div>
          </div>

          {/* Full Stack Card */}
          <div
            className="absolute bottom-[15%] right-[15%] transform transition-all duration-500 hover:scale-110 group hidden lg:block"
            style={{
              animation: `float 7s ease-in-out infinite 0.6s`,
            }}
          >
            <div className="bg-[#1a1c26]/90 backdrop-blur-lg p-4 rounded-xl border border-[#6c5dd3]/20 shadow-xl hover:shadow-[#6c5dd3]/20 hover:border-[#6c5dd3]/40 transition-all duration-300 max-w-[220px] opacity-30 blur-[1px] group-hover:opacity-100 group-hover:blur-none">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                  <Code2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Full Stack Dev</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">React</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Node.js</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Python</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-2">Creating seamless experiences from frontend to backend.</p>
              <div className="space-y-1">
                <div className="text-[10px] flex items-center gap-1 text-gray-500">
                  <span>Frontend:</span>
                  <span className="text-emerald-400">▓▓▓▓▓▓▓▓░░</span>
                </div>
                <div className="text-[10px] flex items-center gap-1 text-gray-500">
                  <span>Backend:</span>
                  <span className="text-emerald-400">▓▓▓▓▓▓▓░░░</span>
                </div>
              </div>
            </div>
          </div>

          {/* Projects Card */}
          <div
            className="absolute bottom-[15%] left-[15%] transform transition-all duration-500 hover:scale-110 group md:block"
            style={{
              animation: `float 7s ease-in-out infinite 0.8s`,
            }}
          >
            <div className="bg-[#1a1c26]/90 backdrop-blur-lg p-4 rounded-xl border border-[#6c5dd3]/20 shadow-xl hover:shadow-[#6c5dd3]/20 hover:border-[#6c5dd3]/40 transition-all duration-300 max-w-[240px] opacity-30 blur-[1px] group-hover:opacity-100 group-hover:blur-none">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <Code2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Projects</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">React</span>
                    <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">AI/ML</span>
                    <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Cloud</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <a 
                    href="https://chat-ui-242842293866.asia-south1.run.app/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-green-400 hover:text-green-300 transition-colors"
                  >
                    ChitsGPT
                  </a>
                  <p className="text-[10px] text-gray-400">Smart Resume Assistant</p>
                </div>
                <div>
                  <a 
                    href="https://clip-surf.vercel.app/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-green-400 hover:text-green-300 transition-colors"
                  >
                    ClipSurf
                  </a>
                  <p className="text-[10px] text-gray-400">Video Content Discovery Engine</p>
                </div>
                <div>
                  <a 
                    href="https://github.com/ChitranshS/SummaView-Youtube-Extension/tree/main" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-green-400 hover:text-green-300 transition-colors"
                  >
                    SummaView
                  </a>
                  <p className="text-[10px] text-gray-400">AI-Web Extension for YouTube</p>
                </div>
              </div>
            </div>
          </div>

          {/* Experience Card */}
          <div
            className="absolute top-[50%] right-[20%] transform transition-all duration-500 hover:scale-110 group hidden lg:block"
            style={{
              animation: `float 7s ease-in-out infinite 1s`,
            }}
          >
            <div className="bg-[#1a1c26]/90 backdrop-blur-lg p-4 rounded-xl border border-[#6c5dd3]/20 shadow-xl hover:shadow-[#6c5dd3]/20 hover:border-[#6c5dd3]/40 transition-all duration-300 max-w-[240px] opacity-30 blur-[1px] group-hover:opacity-100 group-hover:blur-none">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Experience</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">ML/AI</span>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">Cloud</span>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">LLMs</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <h4 className="text-xs font-semibold text-indigo-400">GoMarble.ai</h4>
                  <p className="text-[10px] text-gray-400">Data Science Intern • May '24 - Nov '24</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-indigo-400">L&T Defence</h4>
                  <p className="text-[10px] text-gray-400">ML Intern • Feb '24 - Aug '24</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tech Stack Card */}
          <div
            className="absolute top-[50%] right-[5%] transform transition-all duration-500 hover:scale-110 group hidden lg:block"
            style={{
              animation: `float 7s ease-in-out infinite 1.2s`,
            }}
          >
            <div className="bg-[#1a1c26]/90 backdrop-blur-lg p-4 rounded-xl border border-[#6c5dd3]/20 shadow-xl hover:shadow-[#6c5dd3]/20 hover:border-[#6c5dd3]/40 transition-all duration-300 max-w-[240px] opacity-30 blur-[1px] group-hover:opacity-100 group-hover:blur-none">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                  <Code2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Tech Stack</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="text-[10px] bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full">Core</span>
                    <span className="text-[10px] bg-teal-500/20 text-teal-400 px-2 py-0.5 rounded-full">Tools</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <h4 className="text-xs font-semibold text-teal-400 mb-1">Languages</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <div className="h-1 w-full bg-gray-700/30 rounded-full overflow-hidden">
                        <div className="h-full w-[95%] bg-gradient-to-r from-teal-400 to-teal-600 rounded-full"></div>
                      </div>
                      <span className="text-[10px] text-gray-400">Python</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-1 w-full bg-gray-700/30 rounded-full overflow-hidden">
                        <div className="h-full w-[90%] bg-gradient-to-r from-teal-400 to-teal-600 rounded-full"></div>
                      </div>
                      <span className="text-[10px] text-gray-400">TypeScript</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-1 w-full bg-gray-700/30 rounded-full overflow-hidden">
                        <div className="h-full w-[85%] bg-gradient-to-r from-teal-400 to-teal-600 rounded-full"></div>
                      </div>
                      <span className="text-[10px] text-gray-400">Go</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-teal-400 mb-1">Tools</h4>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1">
                      <div className="h-1 w-full bg-gray-700/30 rounded-full overflow-hidden">
                        <div className="h-full w-[95%] bg-gradient-to-r from-teal-400 to-teal-600 rounded-full"></div>
                      </div>
                      <span className="text-[10px] text-gray-400">React</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-1 w-full bg-gray-700/30 rounded-full overflow-hidden">
                        <div className="h-full w-[90%] bg-gradient-to-r from-teal-400 to-teal-600 rounded-full"></div>
                      </div>
                      <span className="text-[10px] text-gray-400">AWS</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-1 w-full bg-gray-700/30 rounded-full overflow-hidden">
                        <div className="h-full w-[85%] bg-gradient-to-r from-teal-400 to-teal-600 rounded-full"></div>
                      </div>
                      <span className="text-[10px] text-gray-400">Docker</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Education Card */}
          <div
            className="absolute top-[50%] left-[5%] transform transition-all duration-500 hover:scale-110 group hidden lg:block"
            style={{
              animation: `float 7s ease-in-out infinite 1.4s`,
            }}
          >
            <div className="bg-[#1a1c26]/90 backdrop-blur-lg p-4 rounded-xl border border-[#6c5dd3]/20 shadow-xl hover:shadow-[#6c5dd3]/20 hover:border-[#6c5dd3]/40 transition-all duration-300 max-w-[220px] opacity-30 blur-[1px] group-hover:opacity-100 group-hover:blur-none">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Education</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">B.Tech</span>
                    <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">AI&ML</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <h4 className="text-xs font-semibold text-orange-400">MSRIT Bengaluru</h4>
                  <p className="text-[10px] text-gray-400">2021 - 2025 • CGPA: 8.32</p>
                </div>
              </div>
            </div>
          </div>

          {/* Fun Facts Card */}
          <div
            className="absolute top-[5%] left-[20%] transform transition-all duration-500 hover:scale-110 group hidden lg:block"
            style={{
              animation: `float 7s ease-in-out infinite 1.6s`,
            }}
          >
            <div className="bg-[#1a1c26]/90 backdrop-blur-lg p-4 rounded-xl border border-[#6c5dd3]/20 shadow-xl hover:shadow-[#6c5dd3]/20 hover:border-[#6c5dd3]/40 transition-all duration-300 max-w-[220px] opacity-30 blur-[1px] group-hover:opacity-100 group-hover:blur-none">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Fun Facts</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">Random</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-[10px] text-gray-400">
                  <ul className="space-y-1">
                    <li>• Can solve Rubik's cube in under 30s</li>
                    <li>• Favorite IDE Theme: Tokyo Night</li>
                    <li>• Loves stargazing 🌟</li>
                    <li>• Prefers Linux over Windows 😉</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Current Status Card */}
          <div
            className="absolute top-[10%] left-[5%] transform transition-all duration-500 hover:scale-110 group hidden lg:block"
            style={{
              animation: `float 7s ease-in-out infinite 1.8s`,
            }}
          >
            <div className="bg-[#1a1c26]/90 backdrop-blur-lg p-4 rounded-xl border border-[#6c5dd3]/20 shadow-xl hover:shadow-[#6c5dd3]/20 hover:border-[#6c5dd3]/40 transition-all duration-300 max-w-[220px] opacity-30 blur-[1px] group-hover:opacity-100 group-hover:blur-none">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Current Status</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Active</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-[10px] text-gray-400">
                  <p className="mb-1">• Working on: Portfolio Website</p>
                  <p className="mb-1">• Learning: Rust Programming</p>
                  <p>• Energy Level: 85% ⚡</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="relative z-10">
        <div className="mb-12">
          <Logo />
          <h3 className="text-md text-gray-500 mt-6 text-center">
            <TextGenerateEffect words={words} className="text-sm text-gray-500" />
          </h3>
        </div>
        <div className="w-full max-w-4xl px-4">
          <div className="w-full max-w-xs sm:max-w-sm relative mb-5 mx-auto block">
            <button
              onClick={() => setIsChatMode(!isChatMode)}
              className={`w-full bg-gray-900 p-4 rounded-full text-sm flex items-center justify-between transition-all duration-300 
    ${isChatMode
                  ? 'text-gray-300 scale-90 bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg'
                  : 'text-gray-400 hover:bg-gray-800 border-2 border-[#6c5dd3] hover:border-[#6c5dd3] hover:bg-gradient-to-r hover:from-violet-600/10 hover:to-indigo-600/10'}`}
            >
              <span className={`transition-transform duration-300 font-semibold
    ${isChatMode ? 'scale-110 text-white' : ''}`}>
                Chat Mode
              </span>

              {/* Toggle Switch */}
              <div className={`w-10 h-5 rounded-full relative transition-all duration-300 
    ${isChatMode ? 'bg-white bg-opacity-10 scale-110' : 'bg-gray-600 bg-opacity-30'}`}>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-all duration-300 shadow-md 
      ${isChatMode
                    ? 'translate-x-5 bg-white'
                    : 'translate-x-0 bg-gray-400'}`}
                />
              </div>
            </button>
          </div>

          {isChatMode && (
            <>
              <div className="relative mb-16 max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                <BackgroundGradient className="rounded-full w-full">
                  <ChatInput
                    onSendMessage={(messageText) => {
                      if (!currentChat) {
                        createNewChat(messageText);
                      } else {
                        onSendMessage(messageText);
                      }
                    }}
                    isLoading={isLoading}
                    className="w-full"
                  />
                </BackgroundGradient>
              </div>
              <PromptNav {...{ onSectionChange: setActiveSection, activeSection }} />
              {renderSection()}
            </>
          )}
        </div>
      </div>
    </div>
  );

  const ChatDecorations = () => (
    <>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-12 hidden lg:block">
          <div className="bg-[#1a0c26] p-3 rounded-full flex items-center gap-2 animate-float">
            <Code2 className="h-4 w-4 text-[#6c5dd3]" />
            <span className="text-xs text-gray-400">Coding in progress...</span>
          </div>
        </div>

        <div className="absolute top-16 right-8 hidden lg:block">
          <div className="bg-[#1a0c26] p-3 rounded-full flex items-center gap-2 animate-float animation-delay-500">
            <Coffee className="h-4 w-4 text-yellow-500" />
            <span className="text-xs text-gray-400">Coffee level: 100%</span>
          </div>
        </div>

        <div className="absolute bottom-24 left-8 hidden lg:block">
          <div className="bg-[#1a0c26] p-3 rounded-full flex items-center gap-2 animate-float animation-delay-1000">
            <Music className="h-4 w-4 text-green-500" />
            <span className="text-xs text-gray-400">Lofi beats playing</span>
          </div>
        </div>

        <div className="absolute bottom-32 right-8 hidden lg:block">
          <div className="bg-[#1a0c26] p-3 rounded-full flex items-center gap-2 animate-float animation-delay-1500">
            <Heart className="h-4 w-4 text-pink-500" />
            <span className="text-xs text-gray-400">Built with ❤️</span>
          </div>
        </div>
      </div>

    </>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'quick':
        return (
          <div className="w-full">
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
                    <div className="relative flex items-center justify-center mb-6">
                      <div className="p-3 rounded-lg bg-[#6c5dd3] bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                        {prompt.icon}
                      </div>
                      <Sparkles className="absolute right-0 h-5 w-5 text-[#6c5dd3] opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300" />
                    </div>
                    <span className="font-medium text-lg block mb-2">{prompt.text}</span>
                    <span className="text-sm text-gray-400 block leading-relaxed">{prompt.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      case 'games':
        return (
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
              {GamePrompts.map((prompt, idx) => (
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
                    <div className="relative flex items-center justify-center mb-6">
                      <div className="p-3 rounded-lg bg-[#6c5dd3] bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                        {prompt.icon}
                      </div>
                      <Sparkles className="absolute right-0 h-5 w-5 text-[#6c5dd3] opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300" />
                    </div>
                    <span className="font-medium text-lg block mb-2">{prompt.text}</span>
                    <span className="text-sm text-gray-400 block leading-relaxed">{prompt.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 md:gap-x-4 sm:gap-x-8 lg:grid-cols-8 lg:gap-x-32 animate-fadeIn">
              <div className="col-start-1 col-end-2" />
              <div className="col-start-2 col-end-8">
                <DevelopersSection />
              </div>
              <div className='col-start-8 col-end-9' />
            </div>
          </div>
        );
      case 'professional':
        return (
          <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
              {ProfessionalPrompts.map((prompt, idx) => (
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
                    <div className="relative flex items-center justify-center mb-6">
                      <div className="p-3 rounded-lg bg-[#6c5dd3] bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                        {prompt.icon}
                      </div>
                      <Sparkles className="absolute right-0 h-5 w-5 text-[#6c5dd3] opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300" />
                    </div>
                    <span className="font-medium text-lg block mb-2">{prompt.text}</span>
                    <span className="text-sm text-gray-400 block leading-relaxed">{prompt.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-transparent animate-fade-in animation-delay-500">
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
          100% {
            transform: translateY(0px);
          }
        }
      `}</style>
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
        <div className="border-t border-[#1a0c26] p-5 bg-[#0a0a0a] backdrop-blur-sm w-full">
          <div className="max-w-2xl mx-auto">
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