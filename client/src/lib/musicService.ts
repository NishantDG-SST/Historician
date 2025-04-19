import { audioManager } from './audio';

/**
 * Simple mapping of periods to their respective audio files
 * Using direct paths to the static audio files
 */
const periodAudioPaths: Record<string, string> = {
  medieval: '/audio/medieval-theme.mp3',
  renaissance: '/audio/renaissance-theme.mp3',
  industrial: '/audio/industrial-theme.mp3',
  modern: '/audio/modern-theme.mp3',
  future: '/audio/future-theme.mp3'
};

/**
 * Get the appropriate music file for a given period
 */
export async function generatePeriodMusic(period: string): Promise<string> {
  // Simply return the path to the audio file for this period
  const audioPath = periodAudioPaths[period] || periodAudioPaths.medieval;
  console.log(`Using audio for ${period}: ${audioPath}`);
  return audioPath;
}

/**
 * Initialize audio for all periods
 */
export function initializePeriodMusic(): void {
  // Pre-load default tracks for all periods
  Object.entries(periodAudioPaths).forEach(([period, audioPath]) => {
    audioManager.loadTrack(period, audioPath);
    console.log(`Loaded audio track for ${period}: ${audioPath}`);
  });
}

/**
 * Load music for a specific period
 */
export function loadPeriodMusic(period: string, periodName: string): void {
  const audioPath = periodAudioPaths[period] || periodAudioPaths.medieval;
  console.log(`Loading music for ${period}: ${audioPath}`);
  audioManager.loadTrack(periodName, audioPath);
}