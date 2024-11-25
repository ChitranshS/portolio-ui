import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";

interface LogoSectionProps {
  words: string;
}

const Logo = () => (
  <div className="mb-4 flex flex-col items-center">
    <Avatar className="w-16 h-16 mb-4 flex items-center justify-center">
      <AvatarImage src="/logo.jpg" className="w-full h-full animate-rotate" />
      <AvatarFallback>CG</AvatarFallback>
    </Avatar>
    <span className="text-3xl font-bold">ChitsGPT</span>
  </div>
);

const LogoSection: React.FC<LogoSectionProps> = ({ words }) => {
  return (
    <div className="mb-12">
      <Logo />
      <h3 className="text-md text-gray-500 mt-6 text-center">
        <TextGenerateEffect words={words} className="text-sm text-gray-500" />
      </h3>
    </div>
  );
};

export default LogoSection;
