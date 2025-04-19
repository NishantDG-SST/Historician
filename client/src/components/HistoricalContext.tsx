import React from 'react';

interface HistoricalContextProps {
  isOpen: boolean;
  title: string;
  content: string;
  onClose: () => void;
  periodSlug: string;
}

const HistoricalContext: React.FC<HistoricalContextProps> = ({
  isOpen,
  title,
  content,
  onClose,
  periodSlug
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="bg-parchment text-timeNavy p-6 max-w-2xl rounded-lg shadow-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-cinzel text-2xl">{title}</h3>
          <button className="text-timeNavy hover:text-medieval-accent" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div 
          className="prose text-timeNavy max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
        
        <button 
          className={`mt-4 bg-${periodSlug}-primary hover:bg-${periodSlug}-accent text-parchment px-4 py-2 rounded transition-colors`}
          onClick={onClose}
        >
          Return to Story
        </button>
      </div>
    </div>
  );
};

export default HistoricalContext;
