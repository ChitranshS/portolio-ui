import React, { useState, useRef, useEffect } from 'react';
import { User, FileDown, Github, Twitter, Linkedin } from 'lucide-react';

interface ProfileDropdownProps {}

const ProfileDropdown: React.FC<ProfileDropdownProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { icon: <FileDown size={18} />, label: 'Download Resume', url: 'https://drive.google.com/file/d/1OOjEX-3X99t_DODpSYxprugRsCZDRNqx/view?usp=sharing' },
    { icon: <Github size={18} />, label: 'Github', url: 'https://github.com/ChitranshS' },
    { icon: <Linkedin size={18} />, label: 'LinkedIn', url: 'https://www.linkedin.com/in/chitransh-srivastava-ai/' },
    { icon: <Twitter size={18} />, label: 'Twitter', url: 'https://twitter.com/ChitranshS' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-[#282c3a] rounded-full transition-colors"
      >
        <User size={24} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-[#12141c] rounded-lg shadow-lg py-2 z-50 text-gray-400">
          {menuItems.map((item, index) => (
            <a
              href={item.url}
              key={index}
              className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-[#6c5dd3] hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;