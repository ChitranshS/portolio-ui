import React from 'react';
import { Search } from 'lucide-react';

const DevelopersSection = () => {
  return (
    <div className="bg-[#13131a] rounded-3xl p-5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Developers</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Developers"
            className="bg-[#ff36f7] bg-opacity-20 text-white placeholder-white placeholder-opacity-70 px-4 py-2 rounded-xl pr-10 focus:outline-none focus:ring-2 focus:ring-[#ff36f7] focus:ring-opacity-50 text-sm"
          />
          <Search className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-white opacity-70" />
        </div>
      </div>

      <div className="space-y-4">
        <DevCard
          icon="🚀"
          iconBg="bg-blue-500"
          name="Astronautics"
          role="Three.js Developer"
          description="WebGL and 3D Graphics Expert"
        />
        <DevCard
          icon="⚡"
          iconBg="bg-purple-500"
          name="Cyber Pazilliad"
          role="Full-stack Developer"
          description="Building scalable web applications"
        />
      </div>
    </div>
  );
}

interface DevCardProps {
  icon: string;
  iconBg: string;
  name: string;
  role: string;
  description: string;
}

const DevCard = ({ icon, iconBg, name, role, description }: DevCardProps) => {
  return (
    <div className="bg-[#1a1a23] rounded-xl p-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-3">
          <div className={`w-10 h-10 ${iconBg} rounded-full flex items-center justify-center text-white`}>
            {icon}
          </div>
          <div>
            <h4 className="font-medium text-white">{name}</h4>
            <p className="text-sm text-gray-400">{role}</p>
          </div>
        </div>
        <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#2a2a33] transition-colors">
          <span className="text-gray-400">↗</span>
        </button>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-sm text-gray-400 flex-1">{description}</p>
        <button className="w-8 h-8 bg-[#00ff9d] bg-opacity-20 rounded-full flex items-center justify-center">
          <span className="text-[#00ff9d] text-xl">→</span>
        </button>
      </div>
    </div>
  );
};

export default DevelopersSection;