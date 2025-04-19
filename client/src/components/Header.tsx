import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full px-4 py-3 flex justify-between items-center border-b border-brass/30 bg-timeNavy/95 fixed top-0 z-40 backdrop-blur">
      <div className="flex items-center space-x-2">
        <i className="fas fa-hourglass-half text-brass text-xl animate-pulse"></i>
        <h1 className="font-cinzel text-xl md:text-2xl font-bold text-brass">HISTORICAL TIME TRAVELER</h1>
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-parchment hover:text-brass transition-colors" title="Information">
          <i className="fas fa-circle-info"></i>
        </button>
        <button className="text-parchment hover:text-brass transition-colors" title="Settings">
          <i className="fas fa-gear"></i>
        </button>
        <button className="text-parchment hover:text-brass transition-colors" title="Profile">
          <i className="fas fa-user"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;
