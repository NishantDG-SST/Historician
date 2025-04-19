import { Howl } from 'howler';

interface AudioTrack {
  name: string;
  howl: Howl | null;
  url: string;
}

class AudioManager {
  private tracks: Map<string, AudioTrack>;
  private currentTrack: string | null;
  private _isPlaying: boolean;
  private _volume: number;
  private debugMode: boolean;

  constructor() {
    this.tracks = new Map();
    this.currentTrack = null;
    this._isPlaying = false;
    this._volume = 0.5;
    this.debugMode = true; // Enable debug output
  }

  loadTrack(trackName: string, url: string): void {
    if (this.debugMode) {
      console.log(`AudioManager: Loading track "${trackName}" from ${url}`);
    }

    // If we already have this track but with a different URL, update it
    if (this.tracks.has(trackName)) {
      const existingTrack = this.tracks.get(trackName);
      if (existingTrack && existingTrack.url !== url) {
        if (this.debugMode) {
          console.log(`AudioManager: Updating track "${trackName}" with new URL: ${url}`);
        }
        
        // First unload the existing Howl
        if (existingTrack.howl) {
          existingTrack.howl.unload();
        }
        
        // Now create a new one
        const updatedTrack: AudioTrack = {
          name: trackName,
          url: url,
          howl: this.createHowl(url)
        };
        
        this.tracks.set(trackName, updatedTrack);
      }
      return;
    }

    // Create a new track
    const track: AudioTrack = {
      name: trackName,
      url: url,
      howl: this.createHowl(url)
    };

    this.tracks.set(trackName, track);
  }

  // Helper method to create a Howl instance with consistent settings
  private createHowl(url: string): Howl {
    return new Howl({
      src: [url],
      html5: true,
      loop: true,
      volume: this._volume,
      preload: true,
      format: ['mp3'],
      onload: () => {
        if (this.debugMode) {
          console.log(`AudioManager: Successfully loaded audio from ${url}`);
        }
      },
      onplay: () => {
        this._isPlaying = true;
        if (this.debugMode) {
          console.log(`AudioManager: Now playing ${url}`);
        }
      },
      onpause: () => {
        this._isPlaying = false;
        if (this.debugMode) {
          console.log(`AudioManager: Paused ${url}`);
        }
      },
      onstop: () => {
        this._isPlaying = false;
      },
      onend: () => {
        this._isPlaying = false;
      },
      onloaderror: (id, err) => {
        console.error(`AudioManager: Error loading ${url}:`, err);
      },
      onplayerror: (id, err) => {
        console.error(`AudioManager: Error playing ${url}:`, err);
        
        // Try to recover by recreating the Howl instance
        if (this.tracks.has(this.currentTrack!)) {
          const track = this.tracks.get(this.currentTrack!);
          if (track) {
            if (track.howl) {
              track.howl.unload();
            }
            track.howl = this.createHowl(track.url);
            setTimeout(() => {
              if (track.howl) {
                track.howl.play();
              }
            }, 1000);
          }
        }
      }
    });
  }

  play(trackName: string): void {
    // If we're already playing this track, do nothing
    if (this.currentTrack === trackName && this._isPlaying) {
      return;
    }

    // Stop the current track if there is one
    this.stop();

    const track = this.tracks.get(trackName);
    if (track && track.howl) {
      track.howl.play();
      this.currentTrack = trackName;
      this._isPlaying = true;
    }
  }

  pause(): void {
    if (this.currentTrack && this.tracks.has(this.currentTrack)) {
      const track = this.tracks.get(this.currentTrack);
      if (track && track.howl) {
        track.howl.pause();
        this._isPlaying = false;
      }
    }
  }

  resume(): void {
    if (this.currentTrack && this.tracks.has(this.currentTrack)) {
      const track = this.tracks.get(this.currentTrack);
      if (track && track.howl) {
        track.howl.play();
        this._isPlaying = true;
      }
    }
  }

  stop(): void {
    if (this.currentTrack && this.tracks.has(this.currentTrack)) {
      const track = this.tracks.get(this.currentTrack);
      if (track && track.howl) {
        track.howl.stop();
        this._isPlaying = false;
      }
    }
  }

  togglePlayPause(): void {
    if (this._isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  setVolume(volume: number): void {
    this._volume = Math.max(0, Math.min(1, volume));
    
    // Update volume for all tracks
    this.tracks.forEach(track => {
      if (track.howl) {
        track.howl.volume(this._volume);
      }
    });
  }

  get isPlaying(): boolean {
    return this._isPlaying;
  }

  get currentTrackName(): string | null {
    return this.currentTrack;
  }

  get volume(): number {
    return this._volume;
  }
}

// Singleton instance
export const audioManager = new AudioManager();
