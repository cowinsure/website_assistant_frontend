import React from 'react';
import Assistant from './components/Assistant';

const App: React.FC = () => {
  return (
    <main className="relative w-screen h-screen bg-gray-900 text-white font-sans overflow-hidden">
      <div className="absolute inset-0 bg-grid-gray-700/[0.4] [mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)]"></div>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 h-full flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 text-transparent bg-clip-text mb-4">
          AI Web Assistant Demo
        </h1>
        <p className="max-w-2xl text-lg sm:text-xl text-gray-300">
          This page demonstrates a modular AI assistant. Click the icon in the bottom-right corner to start a conversation. You can integrate this component into any existing website.
        </p>
      </div>
      <Assistant />
    </main>
  );
};

export default App;
