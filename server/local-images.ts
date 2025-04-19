import * as fs from 'fs';
import * as path from 'path';

// Function to get a random image from the client/public/images folder based on period
export async function getLocalPeriodImage(period: string): Promise<string> {
  try {
    // Simply return a fixed image for each period
    switch (period) {
      case 'medieval':
        return '/images/medieval-1745073049963.jpg';
      case 'renaissance':
        return '/images/renaissance-1745072243570.jpg';
      case 'industrial':
        return '/images/industrial-1745071865798.jpg';
      case 'modern':
        // For modern, use a renaissance image as fallback
        return '/images/renaissance-1745072243570.jpg';
      case 'future':
        // For future, use an industrial image as fallback
        return '/images/industrial-1745072173186.jpg';
      default:
        // Default to a medieval image for any other period
        return '/images/medieval-1745073049963.jpg';
    }
  } catch (error) {
    console.error(`Error getting local image for period ${period}:`, error);
    // Last resort fallback
    return '/images/medieval-1745073049963.jpg';
  }
}