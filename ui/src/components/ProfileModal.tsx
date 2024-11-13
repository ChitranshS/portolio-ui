import React from 'react';
import { X, Github, Linkedin, FileText, Mail } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const socialLinks = [
    {
      icon: <Github size={24} />,
      label: 'GitHub',
      url: 'https://github.com/yourusername'
    },
    {
      icon: <Linkedin size={24} />,
      label: 'LinkedIn',
      url: 'https://linkedin.com/in/yourusername'
    },
    {
      icon: <Mail size={24} />,
      label: 'Email',
      url: 'mailto:your.email@example.com'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {socialLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 bg-gray-700 hover:bg-gray-600 rounded-lg"
            >
              {link.icon}
              <span>{link.label}</span>
            </a>
          ))}

          <button
            onClick={() => window.open('/path-to-your-resume.pdf')}
            className="w-full flex items-center gap-4 p-4 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            <FileText size={24} />
            <span>Download Resume</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;