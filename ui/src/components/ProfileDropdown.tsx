import React, { useState, useRef, useEffect } from 'react';
import { User,FileDown, Github, Info, Twitter, Linkedin } from 'lucide-react';

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
    { icon: <FileDown size={18} />, label: 'Download Resume' },
    { icon: <Github size={18} />, label: 'Github' },
    { icon: <Linkedin size={18} />, label: 'LinkedIn' },
    { icon: <Twitter size={18} />, label: 'Twitter' },
    { icon: <Info size={18} />, label: 'Info' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-[#2A2A2A] rounded-full transition-colors"
      >
        <User size={24} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-[#2A2A2A] rounded-lg shadow-lg py-2 z-50">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-[#3A3A3A] transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;