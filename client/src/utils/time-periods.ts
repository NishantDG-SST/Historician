import { TimePeriod } from "../types";

// Default time periods to use while loading from the API
export const defaultTimePeriods: TimePeriod[] = [
  {
    id: 1,
    name: "Medieval Era",
    slug: "medieval",
    startYear: 500,
    endYear: 1500,
    description: "The period between the fall of the Western Roman Empire and the Renaissance.",
    color: "#5D4037",
    icon: "fa-landmark",
    musicUrl: "/api/audio/medieval.mp3"
  },
  {
    id: 2,
    name: "Renaissance",
    slug: "renaissance",
    startYear: 1300,
    endYear: 1700,
    description: "A period of cultural, artistic, political, and economic rebirth following the Middle Ages.",
    color: "#1B5E20",
    icon: "fa-palette",
    musicUrl: "/api/audio/renaissance.mp3"
  },
  {
    id: 3,
    name: "Industrial Age",
    slug: "industrial",
    startYear: 1760,
    endYear: 1900,
    description: "The transition to new manufacturing processes and the growth of factory systems.",
    color: "#424242",
    icon: "fa-industry",
    musicUrl: "/api/audio/industrial.mp3"
  },
  {
    id: 4,
    name: "Modern Era",
    slug: "modern",
    startYear: 1900,
    endYear: 2000,
    description: "The contemporary period characterized by technological advancements and globalization.",
    color: "#0D47A1",
    icon: "fa-car",
    musicUrl: "/api/audio/modern.mp3"
  },
  {
    id: 5,
    name: "Future",
    slug: "future",
    startYear: 2000,
    endYear: 2300,
    description: "A speculative period featuring advanced technology and society.",
    color: "#311B92",
    icon: "fa-rocket",
    musicUrl: "/api/audio/future.mp3"
  }
];

// Get CSS class for each time period
export function getTimePeriodClass(periodSlug: string): string {
  const periodClasses: Record<string, string> = {
    medieval: "medieval-theme",
    renaissance: "renaissance-theme",
    industrial: "industrial-theme",
    modern: "modern-theme",
    future: "future-theme",
  };

  return periodClasses[periodSlug] || "medieval-theme";
}

// Get a sample scenario for each time period (used as fallback)
export function getDefaultScenario(periodId: number): { 
  title: string; 
  description: string; 
  year: number; 
  location: string; 
} {
  const scenarios: Record<number, { title: string; description: string; year: number; location: string }> = {
    1: {
      title: "Medieval England - 1242 AD",
      description: "You find yourself in the bustling marketplace of a medieval town. The air is filled with the scents of spices, livestock, and the chatter of merchants. You're dressed in simple woolen clothes, trying to blend in with the locals.\n\nSuddenly, a commotion breaks out near the town square. A herald is announcing that the local baron is increasing taxes to fund the King's war efforts. The crowd grows restless as many are already struggling to feed their families.",
      year: 1242,
      location: "England"
    },
    2: {
      title: "Renaissance Florence - 1503 AD",
      description: "You emerge in the artistic heart of Renaissance Italy. The city is alive with culture, art, and scientific discovery. You can see the magnificent dome of the Florence Cathedral towering above the skyline.\n\nAs you walk through the bustling streets, you overhear heated discussions about a new painting technique developed by Leonardo da Vinci. A group of apprentices debates whether traditional methods or the new innovations will define the future of art.",
      year: 1503,
      location: "Florence, Italy"
    },
    3: {
      title: "London Industrial Revolution - 1845 AD",
      description: "The smoky air of Industrial London fills your lungs as you materialize in a narrow street lined with factories. The rhythmic sounds of machines and the shouts of foremen create a cacophony around you.\n\nYou notice a group of children, no older than ten, exiting a textile mill after what must have been a 12-hour shift. A well-dressed gentleman is arguing with a factory owner about the new labor reforms being debated in Parliament.",
      year: 1845,
      location: "London, England"
    },
    4: {
      title: "Modern Era - 1962 AD",
      description: "You arrive in the midst of the Cold War. The tension in the air is palpable as you walk past a newsstand with headlines about the Cuban Missile Crisis. People hurry past with worried faces.\n\nA crowd has gathered around a television display in a shop window. President Kennedy is addressing the nation about the Soviet missiles in Cuba. You can feel the mixture of fear and determination in the crowd as they contemplate the possibility of nuclear conflict.",
      year: 1962,
      location: "Washington D.C., United States"
    },
    5: {
      title: "Future - 2157 AD",
      description: "You step into a world barely recognizable. Gleaming towers of unusual materials stretch into the clouds, while vehicles silently glide through the air. People wear clothing that seems to shift colors and adjust to the temperature.\n\nA public announcement system is broadcasting news about the latest Mars colony expansion. Several citizens nearby are engaged in a debate about resource allocation between Earth and the off-world settlements.",
      year: 2157,
      location: "New Shanghai Megalopolis"
    }
  };

  return scenarios[periodId] || scenarios[1];
}

// Get default historical context for a scenario
export function getDefaultHistoricalContext(periodId: number): { title: string; content: string } {
  const contexts: Record<number, { title: string; content: string }> = {
    // Medieval Period
    1: {
      title: "Feudal Taxation in Medieval England",
      content: `
        <p><strong>Taxation in Medieval Society (1066-1300)</strong></p>
        <p>After the Norman Conquest of 1066, England developed one of the most sophisticated tax systems in medieval Europe. The feudal structure created multiple forms of taxation:</p>
        
        <ul class="list-disc pl-5 my-3">
          <li><strong>Tallage:</strong> Arbitrary taxes imposed by lords on their tenants and on towns</li>
          <li><strong>Scutage:</strong> "Shield money" paid by knights to avoid military service</li>
          <li><strong>Customs Duties:</strong> Taxes on imported and exported goods</li>
          <li><strong>Aids:</strong> Special payments required on particular occasions (knighting the lord's son, marriage of his daughter)</li>
        </ul>
        
        <p>The collection of taxes often created tension between peasants and nobility. Tax rebellions were not uncommon, with the most famous being the Peasants' Revolt of 1381 (occurring much later than your current scenario).</p>
        
        <p>King Henry III (ruling in 1242) frequently requested special taxes to fund wars against France and to maintain English territories in Gascony. These taxes were particularly burdensome because many nobles questioned the value of these continental campaigns.</p>
        
        <div class="mt-4 p-3 bg-medieval-primary/20 rounded-md">
          <p class="text-sm"><strong>Historical Note:</strong> Your choices in this scenario could foreshadow elements of the Barons' War (1264-1267) when English nobles rose against Henry III, challenging royal authority over taxation and other grievances.</p>
        </div>
      `
    },
    // Renaissance Period
    2: {
      title: "Art and Innovation in Renaissance Florence",
      content: `
        <p><strong>The Renaissance in Florence (1400-1550)</strong></p>
        <p>Florence in the early 16th century was at the heart of the Renaissance, a period of remarkable cultural and intellectual transformation that spread throughout Europe:</p>
        
        <ul class="list-disc pl-5 my-3">
          <li><strong>Humanism:</strong> A renewed focus on classical learning and human potential</li>
          <li><strong>Patronage:</strong> Wealthy families like the Medici funded artists and scholars</li>
          <li><strong>Artistic Innovation:</strong> Development of perspective, realism, and new techniques</li>
          <li><strong>Scientific Inquiry:</strong> Growing interest in observation and experimentation</li>
        </ul>
        
        <p>Leonardo da Vinci represented the ideal "Renaissance man" - accomplished in multiple fields including painting, anatomy, engineering, and mathematics. His workshop would have been filled with experiments, sketches, and unfinished masterpieces.</p>
        
        <p>Meanwhile, Niccolò Machiavelli was writing "The Prince" (published 1532), developing revolutionary ideas about political power and leadership that would influence centuries of political thought.</p>
        
        <div class="mt-4 p-3 bg-renaissance-primary/20 rounded-md">
          <p class="text-sm"><strong>Historical Note:</strong> The artistic and intellectual advancements you witness in Florence would spread throughout Europe, fundamentally changing how humans understood themselves and their world.</p>
        </div>
      `
    },
    // Industrial Period
    3: {
      title: "The Industrial Revolution in England",
      content: `
        <p><strong>Industrial Transformation (1760-1850)</strong></p>
        <p>The Industrial Revolution marked one of the most significant transitions in human history, beginning in Britain before spreading globally:</p>
        
        <ul class="list-disc pl-5 my-3">
          <li><strong>Mechanization:</strong> Machines powered by water and steam replaced human labor</li>
          <li><strong>Urbanization:</strong> Rapid growth of cities as workers migrated from rural areas</li>
          <li><strong>Social Change:</strong> Emergence of a working class with new challenges and identities</li>
          <li><strong>Economic Revolution:</strong> Shift from agricultural to manufacturing economy</li>
        </ul>
        
        <p>By 1845, London had become the world's largest city, with about 2.4 million inhabitants. Factory conditions were often dangerous, with long hours, child labor, and few safety regulations. The Factory Acts of the 1830s and 1840s began to address these issues, limiting children's working hours and setting minimal safety standards.</p>
        
        <p>Meanwhile, technological innovations like the power loom and steam engine were transforming not just how goods were produced, but the fundamental structure of society itself.</p>
        
        <div class="mt-4 p-3 bg-industrial-primary/20 rounded-md">
          <p class="text-sm"><strong>Historical Note:</strong> The changes you witness during this period would establish patterns of work, production, and urban life that continue to shape the modern world.</p>
        </div>
      `
    },
    // Modern Period
    4: {
      title: "The Cold War and Cuban Missile Crisis",
      content: `
        <p><strong>The Cuban Missile Crisis (October 1962)</strong></p>
        <p>You have arrived during one of the most dangerous moments in human history, when the United States and Soviet Union came perilously close to nuclear war:</p>
        
        <ul class="list-disc pl-5 my-3">
          <li><strong>Nuclear Standoff:</strong> Soviet missiles placed in Cuba, just 90 miles from U.S. shores</li>
          <li><strong>Diplomatic Crisis:</strong> Thirteen days of intense negotiation and military preparation</li>
          <li><strong>Media Coverage:</strong> Live television bringing global crisis into American homes</li>
          <li><strong>Public Fear:</strong> Widespread preparation for possible nuclear attack</li>
        </ul>
        
        <p>President Kennedy's administration discovered Soviet nuclear missiles in Cuba on October 16, 1962. After considering a military strike, Kennedy chose a naval quarantine of Cuba while negotiating with Soviet leader Nikita Khrushchev through both public and back channels.</p>
        
        <p>For ordinary Americans, the crisis brought the abstract concept of nuclear war into shocking clarity. Many prepared fallout shelters or made evacuation plans, while children practiced "duck and cover" drills in schools.</p>
        
        <div class="mt-4 p-3 bg-modern-primary/20 rounded-md">
          <p class="text-sm"><strong>Historical Note:</strong> The peaceful resolution of this crisis would lead to important arms control agreements, while the experience of coming so close to nuclear war would shape international relations for decades.</p>
        </div>
      `
    },
    // Future Period
    5: {
      title: "The Post-Earth Expansion Era",
      content: `
        <p><strong>Humanity Among the Stars (2150-2200)</strong></p>
        <p>By the mid-22nd century, humanity has established itself as a multi-planetary species with significant societal transformations:</p>
        
        <ul class="list-disc pl-5 my-3">
          <li><strong>Off-World Colonies:</strong> Permanent settlements on Mars, the Moon, and orbital habitats</li>
          <li><strong>Biological Enhancement:</strong> Genetic modifications and neural interfaces commonplace</li>
          <li><strong>Climate Restoration:</strong> Earth's environment stabilized after prior century's damage</li>
          <li><strong>Digital Integration:</strong> Physical and virtual realities seamlessly blended</li>
        </ul>
        
        <p>The Mars Colony Expansion of 2157 represents humanity's most ambitious off-world project yet, with over 500,000 permanent residents. Political tensions exist between Earth-based governance structures and the increasingly independent colonial administrations that desire autonomy.</p>
        
        <p>Meanwhile, Earth itself has undergone remarkable transformation, with megacities featuring vertical agriculture, climate-controlled environments, and restored natural spaces following the Climate Restoration Projects of the 2120s.</p>
        
        <div class="mt-4 p-3 bg-future-primary/20 rounded-md">
          <p class="text-sm"><strong>Historical Note:</strong> You are witnessing a pivotal moment in human expansion, as the species begins to truly diversify beyond its birthplace and confronts fundamental questions about identity, governance, and purpose.</p>
        </div>
      `
    }
  };

  // Always return a historical context, using the correct one if available
  if (contexts[periodId]) {
    return contexts[periodId];
  } else {
    // If we don't have a specific context, create a generic one for the period
    const period = defaultTimePeriods.find(p => p.id === periodId);
    if (period) {
      return {
        title: `Historical Context: ${period.name}`,
        content: `<p>This is the ${period.name}, spanning approximately from ${period.startYear} to ${period.endYear} AD. ${period.description}</p>`
      };
    }
    // Last resort fallback
    return {
      title: "Historical Context",
      content: "<p>Historical information for this period will be available soon.</p>"
    };
  }
}

// Get default choices for a scenario
export function getDefaultChoices(periodId: number): { text: string; description: string }[] {
  const choices: Record<number, { text: string; description: string }[]> = {
    // Medieval Period
    1: [
      {
        text: "Join the protestors",
        description: "Stand with the villagers in protest against the unjust taxation. Your actions could spark a rebellion against the baron's authority."
      },
      {
        text: "Speak with local merchants",
        description: "Gather information from shopkeepers about alternative tax systems used in neighboring regions. Knowledge is power."
      },
      {
        text: "Offer your services to the baron",
        description: "Your knowledge of the future might help the baron implement fairer taxation while still supporting the war effort."
      },
      {
        text: "Continue exploring the town",
        description: "Avoid the confrontation for now and gather more information about this time period before making any decisions."
      }
    ],
    // Renaissance Period
    2: [
      {
        text: "Visit the artist's workshop",
        description: "Learn about Renaissance techniques and perhaps contribute your own ideas to the flourishing art movement."
      },
      {
        text: "Attend the Medici gathering",
        description: "Network with powerful patrons of the arts and sciences who are shaping the intellectual landscape of Europe."
      },
      {
        text: "Explore the university",
        description: "Discover how classical texts are being rediscovered and changing how people understand the world around them."
      },
      {
        text: "Join merchant traders",
        description: "Experience the economic revolution that's funding the Renaissance while connecting Europe to global trade routes."
      }
    ],
    // Industrial Period
    3: [
      {
        text: "Work in the factory",
        description: "Experience firsthand the harsh conditions of early industrial labor and the birth of the working class."
      },
      {
        text: "Attend a scientific lecture",
        description: "Learn about the technological innovations driving the Industrial Revolution and changing society forever."
      },
      {
        text: "Join a labor movement",
        description: "Participate in the early organization of workers fighting for better conditions and fair treatment."
      },
      {
        text: "Invest in a new venture",
        description: "Become part of the entrepreneurial spirit of the age by backing a promising new industrial enterprise."
      }
    ],
    // Modern Period
    4: [
      {
        text: "Attend a peace rally",
        description: "Join activists protesting against conflict and advocating for international cooperation in a divided world."
      },
      {
        text: "Visit a research laboratory",
        description: "Witness breakthroughs in science and technology that are dramatically accelerating human progress."
      },
      {
        text: "Explore global cultures",
        description: "Experience how transportation and communication advances are creating unprecedented cultural exchange."
      },
      {
        text: "Enter the digital world",
        description: "Participate in the early days of the information revolution that will transform every aspect of human life."
      }
    ],
    // Future Period
    5: [
      {
        text: "Test new biotechnology",
        description: "Experience the latest advancements in human enhancement and medical technology extending lifespans."
      },
      {
        text: "Join space exploration",
        description: "Participate in humanity's expansion beyond Earth and the colonization of other worlds."
      },
      {
        text: "Enter the metaverse",
        description: "Explore the fully immersive digital realms where the boundaries between physical and virtual reality blur."
      },
      {
        text: "Study climate restoration",
        description: "Learn about the technologies and social changes that helped humanity address environmental challenges."
      }
    ]
  };

  // Always return some choices, if not found use medieval as default
  return choices[periodId] || choices[1];
}
