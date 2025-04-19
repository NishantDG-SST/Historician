import {
  User,
  InsertUser,
  TimePeriod,
  InsertTimePeriod,
  Scenario,
  InsertScenario,
  Choice,
  InsertChoice,
  PlayerJourney,
  InsertPlayerJourney,
} from "@shared/schema";

// Storage interface with all CRUD methods
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Time Periods
  getAllTimePeriods(): Promise<TimePeriod[]>;
  getTimePeriodBySlug(slug: string): Promise<TimePeriod | undefined>;
  createTimePeriod(timePeriod: InsertTimePeriod): Promise<TimePeriod>;

  // Scenarios
  getScenariosByTimePeriodId(timePeriodId: number): Promise<Scenario[]>;
  getScenarioById(id: number): Promise<Scenario | undefined>;
  createScenario(scenario: InsertScenario): Promise<Scenario>;

  // Choices
  getChoicesByScenarioId(scenarioId: number): Promise<Choice[]>;
  getChoiceById(id: number): Promise<Choice | undefined>;
  createChoice(choice: InsertChoice): Promise<Choice>;

  // Player Journeys
  getPlayerJourneysByUserId(userId: number): Promise<PlayerJourney[]>;
  createPlayerJourney(journey: InsertPlayerJourney): Promise<PlayerJourney>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private timePeriods: Map<number, TimePeriod>;
  private scenarios: Map<number, Scenario>;
  private choices: Map<number, Choice>;
  private playerJourneys: Map<number, PlayerJourney>;
  private currentIds: {
    user: number;
    timePeriod: number;
    scenario: number;
    choice: number;
    playerJourney: number;
  };

  constructor() {
    this.users = new Map();
    this.timePeriods = new Map();
    this.scenarios = new Map();
    this.choices = new Map();
    this.playerJourneys = new Map();
    this.currentIds = {
      user: 1,
      timePeriod: 1,
      scenario: 1,
      choice: 1,
      playerJourney: 1,
    };

    // Initialize with sample time periods data
    this.initializeTimePeriods();
  }

  private initializeTimePeriods() {
    const periods: InsertTimePeriod[] = [
      {
        name: "Medieval Era",
        slug: "medieval",
        startYear: 500,
        endYear: 1500,
        description: "The period between the fall of the Western Roman Empire and the Renaissance.",
        color: "#5D4037",
        icon: "fa-landmark",
        musicUrl: "/api/audio/medieval.mp3",
      },
      {
        name: "Renaissance",
        slug: "renaissance",
        startYear: 1300,
        endYear: 1700,
        description: "A period of cultural, artistic, political, and economic rebirth following the Middle Ages.",
        color: "#1B5E20",
        icon: "fa-palette",
        musicUrl: "/api/audio/renaissance.mp3",
      },
      {
        name: "Industrial Age",
        slug: "industrial",
        startYear: 1760,
        endYear: 1900,
        description: "The transition to new manufacturing processes and the growth of factory systems.",
        color: "#424242",
        icon: "fa-industry",
        musicUrl: "/api/audio/industrial.mp3",
      },
      {
        name: "Modern Era",
        slug: "modern",
        startYear: 1900,
        endYear: 2000,
        description: "The contemporary period characterized by technological advancements and globalization.",
        color: "#0D47A1",
        icon: "fa-car",
        musicUrl: "/api/audio/modern.mp3",
      },
      {
        name: "Future",
        slug: "future",
        startYear: 2000,
        endYear: 2300,
        description: "A speculative period featuring advanced technology and society.",
        color: "#311B92",
        icon: "fa-rocket",
        musicUrl: "/api/audio/future.mp3",
      },
    ];

    periods.forEach((period) => {
      this.createTimePeriod(period);
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.user++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Time Periods
  async getAllTimePeriods(): Promise<TimePeriod[]> {
    return Array.from(this.timePeriods.values());
  }

  async getTimePeriodBySlug(slug: string): Promise<TimePeriod | undefined> {
    return Array.from(this.timePeriods.values()).find(
      (period) => period.slug === slug,
    );
  }

  async createTimePeriod(insertTimePeriod: InsertTimePeriod): Promise<TimePeriod> {
    const id = this.currentIds.timePeriod++;
    // Ensure musicUrl is properly typed as string | null
    const timePeriod: TimePeriod = { 
      ...insertTimePeriod, 
      id, 
      musicUrl: insertTimePeriod.musicUrl || null 
    };
    this.timePeriods.set(id, timePeriod);
    return timePeriod;
  }

  // Scenarios
  async getScenariosByTimePeriodId(timePeriodId: number): Promise<Scenario[]> {
    return Array.from(this.scenarios.values()).filter(
      (scenario) => scenario.timePeriodId === timePeriodId,
    );
  }

  async getScenarioById(id: number): Promise<Scenario | undefined> {
    return this.scenarios.get(id);
  }

  async createScenario(insertScenario: InsertScenario): Promise<Scenario> {
    const id = this.currentIds.scenario++;
    // Fix null/undefined type issues for all optional fields
    const scenario: Scenario = {
      ...insertScenario,
      id,
      imageUrl: insertScenario.imageUrl || null,
      historicalContext: insertScenario.historicalContext || null,
      year: insertScenario.year || null,
      location: insertScenario.location || null
    };
    this.scenarios.set(id, scenario);
    return scenario;
  }

  // Choices
  async getChoicesByScenarioId(scenarioId: number): Promise<Choice[]> {
    return Array.from(this.choices.values()).filter(
      (choice) => choice.scenarioId === scenarioId,
    );
  }

  async getChoiceById(id: number): Promise<Choice | undefined> {
    return this.choices.get(id);
  }

  async createChoice(insertChoice: InsertChoice): Promise<Choice> {
    const id = this.currentIds.choice++;
    // Fix null/undefined type issues for all optional fields
    const choice: Choice = { 
      ...insertChoice, 
      id,
      description: insertChoice.description || null,
      outcome: insertChoice.outcome || null,
      nextScenarioId: insertChoice.nextScenarioId || null,
      historicalImpact: insertChoice.historicalImpact || null
    };
    this.choices.set(id, choice);
    return choice;
  }

  // Player Journeys
  async getPlayerJourneysByUserId(userId: number): Promise<PlayerJourney[]> {
    return Array.from(this.playerJourneys.values()).filter(
      (journey) => journey.userId === userId,
    );
  }

  async createPlayerJourney(insertJourney: InsertPlayerJourney): Promise<PlayerJourney> {
    const id = this.currentIds.playerJourney++;
    const journey: PlayerJourney = { ...insertJourney, id };
    this.playerJourneys.set(id, journey);
    return journey;
  }
}

export const storage = new MemStorage();
