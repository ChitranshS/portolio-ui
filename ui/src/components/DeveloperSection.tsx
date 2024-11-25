import React, { useState } from 'react';
import { Github, Linkedin, Mail } from 'lucide-react';
import { HoverBorderGradient } from './ui/hover-border-gradient';
import { BackgroundGradient } from './ui/background-gradient';
import { TextGenerateEffect } from './ui/text-generate-effect';
import { SpotlightBackground } from './ui/spotlight-background';

const DevelopersSection = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <SpotlightBackground>
      <div className="p-6 w-full">
        <div className="flex flex-col items-center space-y-4">
          {/* Profile Image */}
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#6c5dd3] shadow-lg transform transition-transform duration-300 hover:scale-105">
            <img
              src="face.webp"
              alt="Chitransh"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://github.com/identicons/chitransh.png';
              }}
            />
          </div>

          {/* Name and Title */}
          <div className="text-center">
            <TextGenerateEffect words="Chitransh Srivastava" className="text-2xl font-bold text-white mb-1" />
            <p className="text-[#6c5dd3] text-lg font-semibold">Full Stack Developer & AI Enthusiast</p>
          </div>

          {/* Social Links */}
          <div className="flex space-x-4">
            <a href="https://github.com/chitranshs" target="_blank" rel="noopener noreferrer" 
               className="p-2 rounded-full bg-[#302c59] hover:bg-[#6c5dd3] transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110">
              <Github className="w-5 h-5 text-white" />
            </a>
            <a href="https://linkedin.com/in/chitransh-srivastava-ai" target="_blank" rel="noopener noreferrer"
               className="p-2 rounded-full bg-[#302c59] hover:bg-[#6c5dd3] transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110">
              <Linkedin className="w-5 h-5 text-white" />
            </a>
            <a href="mailto:chitransh0210@gmail.com" target="_blank" rel="noopener noreferrer"
               className="p-2 rounded-full bg-[#302c59] hover:bg-[#6c5dd3] transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110">
              <Mail className="w-5 h-5 text-white" />
            </a>
          </div>

          {/* Bio */}
          <div className="text-gray-300 text-sm text-center mt-4 max-w-md">
            Passionate about building innovative solutions with cutting-edge technology.
            Specialized in full-stack development and AI applications.
          </div>
        </div>
      </div>
    </SpotlightBackground>
  );
};

export default DevelopersSection;