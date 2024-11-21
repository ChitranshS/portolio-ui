import React from 'react';
import { Search, Code2 } from 'lucide-react';

const ProfileSection = () => {
  return (
    <div className="space-y-6">
      <div className="bg-[#13131a] rounded-3xl p-8">
        <div className="flex items-center gap-6 mb-6">
          <img
            src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=200&q=80"
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover ring-4 ring-purple-600/20"
          />
          <div>
            <h2 className="text-2xl font-bold mb-1">Massbory</h2>
            <p className="text-gray-400">Creating Digital Solutions through Code</p>
          </div>
        </div>
        <p className="text-gray-300 leading-relaxed">
          Full-stack developer specializing in modern web technologies and scalable applications. 
          Passionate about creating intuitive user experiences and robust backend systems.
        </p>
      </div>
      
      <div className="flex gap-4">
        <button className="px-6 py-3 bg-[#13131a] rounded-xl hover:bg-[#1a1a23] transition-colors flex items-center gap-2 group">
          <Code2 className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
          <span>Projects</span>
        </button>
        <button className="px-6 py-3 bg-[#13131a] rounded-xl hover:bg-[#1a1a23] transition-colors flex items-center gap-2">
          <Search className="w-5 h-5 text-gray-400" />
          <span>Search</span>
        </button>
      </div>
    </div>
  );
}

export default ProfileSection;