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
    description: "Technical and soft skills     " ,
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
    description: "Browse my code repositories",
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
}> = ({ msg, index, expanded, onToggle }) => {
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
          "relative w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 group-hover:scale-110",
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
            <ReactMarkdown>{displayContent}</ReactMarkdown>
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
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {new Date().toLocaleTimeString()}
            </span>
            {msg.role === 'assistant' && (
              <div className="flex items-center gap-1">
                <span className="w-1 h-1 bg-[#6c5dd3] rounded-full" />
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">AI Generated</span>
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
  
  const [message, setMessage] = useState('');
  const [expandedMessages, setExpandedMessages] = useState<ExpandedMessages>({});
  const [activeSection, setActiveSection] = useState('quick'); 
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const messageText = message.trim();
    if (!messageText || isLoading) return;
    
    setMessage('');
    
    try {
      if (!currentChat) {
        createNewChat(messageText);
      } else {
        onSendMessage(messageText);
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSubmit(e as any);
    }
  };

  const handleQuickPrompt = async (promptText: string) => {
    try {
      if (!currentChat) {
        createNewChat(promptText);
      } else {
        onSendMessage(promptText);
      }
    } catch (error) {
      console.error('Error in handleQuickPrompt:', error);
    }
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


  const developerInfo = {
    name: "Chitransh Srivastava",
    location: "India",
    skills: ["React", "Node.js", "TypeScript", "Python", "AWS"],
    socialLinks: {
      github: "https://github.com/chitrangcodes",
      linkedin: "https://linkedin.com/in/chitranshgour",
      twitter: "https://twitter.com/chitrangcodes"
    }
  };


  const SkillBadge = ({ skill }: { skill: string }) => (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#6c5dd3] bg-opacity-20 text-[#6c5dd3]">
      {skill}
    </span>
  );

  const FloatingWidget = ({ icon, text, position, delay }: { 
    icon: React.ReactNode; 
    text: string;
    position: string;
    delay: number;
  }) => (
    <div className={`absolute ${position} hidden lg:flex items-center gap-2 p-3 bg-[#1a1c26] rounded-full 
      transform hover:scale-110 transition-all duration-300 cursor-pointer
      animate-float`}
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

  const renderSection = () => {
    switch (activeSection) {
      case 'quick':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {QuickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickPrompt(prompt.prompt)}
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
              onClick={() => handleQuickPrompt("Let's play a word guessing game!")}
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
              onClick={() => handleQuickPrompt("Let's play 20 questions!")}
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
              onClick={() => handleQuickPrompt("Let's play a riddle game!")}
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
              onClick={() => handleQuickPrompt("Tell me about your professional experience and skills")}
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
              onClick={() => handleQuickPrompt("What projects have you worked on?")}
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
              onClick={() => handleQuickPrompt("What are your technical skills and expertise?")}
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
        icon={<Coffee className="h-4 w-4 text-[#6c5dd3]" />} 
        text="Coffee Driven"
        position="left-10 top-20"
        delay={0}
      />
      <FloatingWidget 
        icon={<Heart className="h-4 w-4 text-pink-500" />} 
        text="Loves Open Source"
        position="right-10 top-40"
        delay={0.5}
      />
      <FloatingWidget 
        icon={<Music className="h-4 w-4 text-green-500" />} 
        text="Coding Playlist"
        position="left-20 bottom-20"
        delay={1}
      />
      <FloatingWidget 
        icon={<Code2 className="h-4 w-4 text-yellow-500" />} 
        text="Clean Code"
        position="right-20 bottom-40"
        delay={1.5}
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

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#6c5dd3] rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000" />
      </div>

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
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message ChitsGPT..."
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full p-4 pl-12 pr-12 bg-[#12141c] placeholder-gray-700 rounded-full border border-[#302c59] focus:outline-none focus:ring-0 focus:ring-[#302c59] focus:border-transparent text-md"
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
        <div className="absolute top-8 left-8 hidden lg:block">
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

        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#6c5dd3] rounded-full mix-blend-multiply filter blur-xl opacity-5 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-5 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-5 animate-blob animation-delay-4000" />
      </div>

      <div className="fixed top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#6c5dd3] to-transparent opacity-10 pointer-events-none" />
      <div className="fixed top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500 to-transparent opacity-10 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-pink-500 to-transparent opacity-10 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[#6c5dd3] to-transparent opacity-10 pointer-events-none" />
    </>
  );

  const toggleMessage = (index: number) => {
    setExpandedMessages(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0b0f] animate-fade-in animation-delay-500">
      {currentChat?.messages?.length > 0 && <ChatDecorations />}
      <ScrollArea className="flex-1 px-4 md:px-8 pt-16 [&_.scrollbar-thumb]:bg-transparent [&_.scrollbar-track]:bg-transparent">
        {currentChat?.messages?.length ? (
          <div className="mx-auto max-w-4xl space-y-6">
            {currentChat?.messages?.map((msg, idx) => (
              <ChatMessage
                key={idx}
                msg={msg}
                index={idx}
                expanded={!!expandedMessages[idx]}
                onToggle={() => toggleMessage(idx)}
              />
            ))}
            {isLoading && (
              <div className="py-6">
                <div className="max-w-3xl mx-auto flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-medium text-white">
                    A
                  </div>
                  <div className="flex-1">
                    <div className="h-5 w-5 animate-spin border-2 border-blue-500 border-t-transparent rounded-full" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <EmptyState />
        )}
      </ScrollArea>

      {currentChat?.messages?.length > 0 && (
        <div className="border-t border-[#0a0b0f] p-4 bg-[#0a0b0f] w-full">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Message ChitsGPT..."
                className="w-full p-4 pr-12 bg-[#12141c] rounded-lg border border-[#302c59] focus:outline-none focus:ring-2 focus:ring-[#302c59]"
                onKeyDown={handleKeyDown}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-[#302c59] rounded-lg disabled:opacity-50"
                disabled={!message.trim() || isLoading}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatArea;