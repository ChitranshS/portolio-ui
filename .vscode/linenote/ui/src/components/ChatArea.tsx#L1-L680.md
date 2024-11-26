``` import React, { useState } from 'react';

const EnhancedUI = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [activeCard, setActiveCard] = useState(null);

  const cards = [
    {
      title: 'Dynamic Interactions',
      description: 'Responsive animations and smooth transitions',
      icon: '⚡'
    },
    {
      title: 'Visual Effects',
      description: 'Modern gradient and blur aesthetics',
      icon: '✨'
    },
    {
      title: 'Performance',
      description: 'Optimized rendering and animations',
      icon: '🚀'
    }
  ];

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-900 to-black">
      {/* Background effects */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-black opacity-50" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 opacity-20 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 opacity-20 blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Main container */}
        <div className="relative p-8 rounded-2xl bg-black bg-opacity-40 backdrop-blur-xl border border-white border-opacity-10">
          {/* Toggle button */}
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="w-full p-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium 
                     hover:from-purple-500 hover:to-blue-500 transform hover:scale-[1.02] 
                     transition-all duration-300 ease-out"
          >
            {isVisible ? 'Hide' : 'Show'} Content
          </button>

          {/* Cards container */}
          <div className={`mt-8 space-y-4 transition-all duration-500 ease-out
                          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {cards.map((card, index) => (
              <div
                key={index}
                onMouseEnter={() => setActiveCard(index)}
                onMouseLeave={() => setActiveCard(null)}
                className={`p-6 rounded-xl border transition-all duration-300 ease-out
                           ${activeCard === index 
                             ? 'bg-gradient-to-br from-purple-900 to-blue-900 border-purple-400 scale-[1.02]' 
                             : 'bg-gray-900 bg-opacity-50 border-white border-opacity-5 hover:border-opacity-20'}`}
                style={{
                  transitionDelay: `${index * 50}ms`
                }}
              >
                <div className="flex items-center gap-4">
                  {/* Icon container */}
                  <div className={`flex items-center justify-center w-12 h-12 rounded-xl 
                                 bg-gradient-to-br from-purple-500 to-blue-500
                                 transition-transform duration-300 text-xl
                                 ${activeCard === index ? 'scale-110' : ''}`}>
                    {card.icon}
                  </div>

                  {/* Text content */}
                  <div>
                    <h3 className={`text-xl font-bold transition-colors duration-300
                                  ${activeCard === index ? 'text-purple-300' : 'text-white'}`}>
                      {card.title}
                    </h3>
                    <p className="text-gray-400">{card.description}</p>
                  </div>
                </div>

                {/* Card content */}
                <div className={`mt-4 p-4 rounded-lg border transition-all duration-300
                                ${activeCard === index 
                                  ? 'bg-black bg-opacity-50 border-purple-500 border-opacity-30' 
                                  : 'bg-black bg-opacity-20 border-white border-opacity-5'}`}>
                  <p className="text-gray-300">
                    Interactive elements with smooth transitions and modern design patterns.
                    Optimized for performance and visual appeal.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedUI; ```