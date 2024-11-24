import React from 'react';

const AnimatedBackground = () => {
  return (
    <div className="fixed opacity-50 inset-0" style={{ zIndex: -1 }}>
      {/* Base background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0b0f] via-[#141729] to-[#0a0b0f]" />
      
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Purple blob */}
        <div 
          className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] animate-blob"
          style={{
            background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
            filter: 'blur(60px)',
            transformOrigin: 'center'
          }}
        />
        
        {/* Blue blob */}
        <div 
          className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[70%] animate-blob animation-delay-2000"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
            filter: 'blur(60px)',
            transformOrigin: 'center'
          }}
        />
        
        {/* Accent blob */}
        <div 
          className="absolute top-[30%] left-[20%] w-[50%] h-[50%] animate-blob animation-delay-4000"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, rgba(0, 0, 0, 0) 70%)',
            filter: 'blur(60px)',
            transformOrigin: 'center'
          }}
        />
      </div>
      
      {/* Grid overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
