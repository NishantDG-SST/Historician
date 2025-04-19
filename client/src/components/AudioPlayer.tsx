import React from 'react';

interface AudioPlayerProps {
  isPlaying: boolean;
  currentMusic: string;
  onToggleAudio: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ isPlaying, currentMusic, onToggleAudio }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex items-center bg-timeNavy/80 backdrop-blur p-2 rounded-lg shadow-lg border border-brass/30 space-x-3">
      <div className="audio-visualizer">
        {Array.from({ length: 5 }).map((_, index) => (
          <div 
            key={index} 
            className={`audio-bar ${isPlaying ? 'animate-audio-wave' : 'h-1'}`}
            style={{ 
              animationDelay: `${index * 0.2}s`,
              height: isPlaying ? undefined : '4px'
            }}
          ></div>
        ))}
      </div>
      <button 
        className="text-brass hover:text-white transition-colors p-2"
        onClick={onToggleAudio}
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
      >
        <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
      </button>
      <div className="text-sm text-parchment">
        <span>{currentMusic}</span>
      </div>
    </div>
  );
};

export default AudioPlayer;
