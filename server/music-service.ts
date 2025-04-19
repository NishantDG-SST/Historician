import * as fs from 'fs';
import * as path from 'path';

// Constants
const AUDIO_DIR = path.join(process.cwd(), 'client', 'public', 'audio');

// Ensure audio directory exists
function ensureAudioDirExists(): void {
  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
    console.log(`Created audio directory at ${AUDIO_DIR}`);
  }
}

/**
 * Get the appropriate audio file for a time period
 * Now simply returns the path to the corresponding theme file
 */
export async function generatePeriodMusic(period: string): Promise<string> {
  ensureAudioDirExists();
  const audioPath = getDefaultAudioPath(period);
  console.log(`Using audio file for ${period}: ${audioPath}`);
  return audioPath;
}

/**
 * Get the default audio path for a time period
 */
export function getDefaultAudioPath(period: string): string {
  // Define the mapping of periods to default audio files
  const defaultAudioMap: Record<string, string> = {
    medieval: '/audio/medieval-theme.mp3',
    renaissance: '/audio/renaissance-theme.mp3',
    industrial: '/audio/industrial-theme.mp3',
    modern: '/audio/modern-theme.mp3',
    future: '/audio/future-theme.mp3'
  };
  
  return defaultAudioMap[period] || '/audio/medieval-theme.mp3';
}

/**
 * Get list of all available audio for a period
 */
export function getAvailableAudio(period?: string): string[] {
  ensureAudioDirExists();
  
  const files = fs.readdirSync(AUDIO_DIR);
  
  if (period) {
    return files.filter(file => file.startsWith(period) && file.endsWith('.mp3'))
                .map(file => `/audio/${file}`);
  }
  
  return files.filter(file => file.endsWith('.mp3'))
              .map(file => `/audio/${file}`);
}