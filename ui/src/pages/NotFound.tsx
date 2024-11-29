import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold bg-gradient-to-r from-[#6c5dd3] to-purple-400 text-transparent bg-clip-text">404</h1>
        <div className="mt-4">
          <h2 className="text-3xl font-semibold text-white mb-3">Page Not Found</h2>
          <p className="text-gray-400 mb-8">
            The page you're looking for seems to have vanished into the digital void.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-[#6c5dd3] text-white rounded-lg hover:bg-[#5a4eb8] transition-all duration-200 
                     focus:outline-none focus:ring-2 focus:ring-[#6c5dd3] focus:ring-offset-2 focus:ring-offset-[#0F0F0F]
                     flex items-center justify-center gap-2 mx-auto"
          >
            <Home size={20} />
            Return Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;