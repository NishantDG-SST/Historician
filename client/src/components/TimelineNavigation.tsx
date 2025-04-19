import React from 'react';
import { TimePeriod } from '@/types';

interface TimelineNavigationProps {
  periods: TimePeriod[];
  activePeriod: string;
  onPeriodChange: (periodSlug: string) => void;
  isLoading: boolean;
}

const TimelineNavigation: React.FC<TimelineNavigationProps> = ({
  periods,
  activePeriod,
  onPeriodChange,
  isLoading
}) => {
  if (isLoading) {
    return (
      <nav className="fixed bottom-0 w-full bg-timeNavy/95 backdrop-blur border-t border-brass/30 py-2 px-4 z-40">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center overflow-x-auto pb-2 no-scrollbar">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="timeline-era relative flex flex-col items-center px-3 py-1 opacity-50">
                <div className="h-10 w-10 rounded-full border border-brass/50 flex items-center justify-center mb-1 animate-pulse bg-timeNavy/50">
                </div>
                <span className="text-xs whitespace-nowrap animate-pulse bg-timeNavy/50 w-16 h-4 rounded"></span>
              </div>
            ))}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-0 w-full bg-timeNavy/95 backdrop-blur border-t border-brass/30 py-2 px-4 z-40">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center overflow-x-auto pb-2 no-scrollbar">
          {periods.map((period) => (
            <div
              key={period.id}
              className={`timeline-era relative flex flex-col items-center px-3 py-1 cursor-pointer hover:text-brass transition-colors ${
                period.slug === activePeriod ? 'active text-brass' : 'opacity-70'
              }`}
              onClick={() => onPeriodChange(period.slug)}
            >
              <div className="h-10 w-10 rounded-full border border-brass/50 flex items-center justify-center mb-1">
                <i className={`fas ${period.icon}`}></i>
              </div>
              <span className="text-xs whitespace-nowrap">{period.name}</span>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default TimelineNavigation;
