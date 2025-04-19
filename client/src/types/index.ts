export interface TimePeriod {
  id: number;
  name: string;
  slug: string;
  startYear: number;
  endYear: number;
  description: string;
  color: string;
  icon: string;
  musicUrl: string;
}

export interface Scenario {
  id: number;
  timePeriodId: number;
  title: string;
  description: string;
  imageUrl?: string;
  historicalContext?: string;
  year?: number;
  location?: string;
}

export interface Choice {
  id: number;
  scenarioId: number;
  text: string;
  description?: string;
  outcome?: string;
  nextScenarioId?: number;
  historicalImpact?: string;
}

export interface HistoricalContextData {
  title: string;
  content: string;
}

export interface DeepSeekResponse {
  choices?: Choice[];
  imageUrl?: string;
  context?: string;
}

export interface AudioState {
  isPlaying: boolean;
  currentTrack: string;
  volume: number;
}
