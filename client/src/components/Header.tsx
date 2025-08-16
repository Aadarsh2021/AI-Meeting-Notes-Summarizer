import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">🤖</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Meeting Summarizer</h1>
              <p className="text-sm text-gray-600">Transform your meetings into actionable insights</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
            <span>Powered by Groq AI</span>
            <span>•</span>
            <span>Fast & Accurate</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
