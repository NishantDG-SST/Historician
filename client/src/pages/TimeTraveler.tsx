import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import AudioPlayer from '@/components/AudioPlayer';
import TimelineNavigation from '@/components/TimelineNavigation';
import StoryScenario from '@/components/StoryScenario';
import HistoricalContext from '@/components/HistoricalContext';
import { TimePeriod, Scenario, Choice, HistoricalContextData } from '@/types';
import { defaultTimePeriods, getTimePeriodClass, getDefaultScenario, getDefaultHistoricalContext, getDefaultChoices } from '@/utils/time-periods';
import { audioManager } from '@/lib/audio';
import { apiRequest } from '@/lib/queryClient';
import { generatePeriodMusic, loadPeriodMusic } from '@/lib/musicService';

export default function TimeTraveler() {
  // State
  const [currentPeriodSlug, setCurrentPeriodSlug] = useState<string>('medieval');
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [historicalContext, setHistoricalContext] = useState<HistoricalContextData | null>(null);
  const [showContext, setShowContext] = useState(false);
  const [audioState, setAudioState] = useState({
    isPlaying: false,
    currentTrack: 'Medieval Chamber Music',
    volume: 0.5
  });
  const [historicalImpact, setHistoricalImpact] = useState<string | null>(null);

  // Fetch time periods
  const { data: periods = defaultTimePeriods, isLoading: isLoadingPeriods } = useQuery({
    queryKey: ['/api/periods'],
    queryFn: async () => {
      const res = await fetch('/api/periods');
      if (!res.ok) throw new Error('Failed to fetch time periods');
      return res.json() as Promise<TimePeriod[]>;
    }
  });

  // Get current period
  const currentPeriod = periods.find(p => p.slug === currentPeriodSlug) || periods[0];

  // Load and preload audio for the current period
  useEffect(() => {
    if (currentPeriod) {
      // Use our predefined audio paths instead of API URLs
      const periodSlug = currentPeriod.slug;
      const audioPath = `/audio/${periodSlug}-theme.mp3`;
      audioManager.loadTrack(currentPeriod.name, audioPath);
      
      // Also preload audio for adjacent periods
      const currentIndex = periods.findIndex(p => p.id === currentPeriod.id);
      
      if (currentIndex > 0) {
        const prevPeriod = periods[currentIndex - 1];
        const prevAudioPath = `/audio/${prevPeriod.slug}-theme.mp3`;
        audioManager.loadTrack(prevPeriod.name, prevAudioPath);
      }
      
      if (currentIndex < periods.length - 1) {
        const nextPeriod = periods[currentIndex + 1];
        const nextAudioPath = `/audio/${nextPeriod.slug}-theme.mp3`;
        audioManager.loadTrack(nextPeriod.name, nextAudioPath);
      }
    }
  }, [currentPeriod, periods]);

  // Load initial scenario
  useEffect(() => {
    if (currentPeriod) {
      // For the initial load, immediately show defaults but asynchronously fetch content
      const defaultScenarioData = getDefaultScenario(currentPeriod.id);
      
      // Set default values initially for immediate display
      // Get a fixed image URL based on period
      const getDefaultImageForPeriod = (periodId: number): string => {
        switch (periodId) {
          case 1: return '/images/medieval-1745073049963.jpg';
          case 2: return '/images/renaissance-1745072243570.jpg';
          case 3: return '/images/industrial-1745071865798.jpg';
          case 4: return '/images/renaissance-1745072243570.jpg'; // Modern uses Renaissance image
          case 5: return '/images/industrial-1745072173186.jpg'; // Future uses Industrial image
          default: return '/images/medieval-1745073049963.jpg';
        }
      };
      
      setCurrentScenario({
        id: 1,
        timePeriodId: currentPeriod.id,
        title: defaultScenarioData.title,
        description: defaultScenarioData.description,
        imageUrl: getDefaultImageForPeriod(currentPeriod.id), // Always use a fixed image for each period
        year: defaultScenarioData.year,
        location: defaultScenarioData.location
      });

      // Load default choices initially
      setChoices(getDefaultChoices(currentPeriod.id).map((choice, index) => ({
        id: index + 1,
        scenarioId: 1,
        text: choice.text,
        description: choice.description,
      })));

      // Load default historical context initially
      const contextData = getDefaultHistoricalContext(currentPeriod.id);
      setHistoricalContext({
        title: contextData.title,
        content: contextData.content,
      });

      // Reset historical impact
      setHistoricalImpact(null);
      
      // Now trigger dynamic content generation via API
      generateScenarioContent(currentPeriod.id, currentPeriod.slug);
    }
  }, [currentPeriod]);

  // Generate new content when period changes
  const generateScenarioContent = async (periodId: number, periodSlug: string) => {
    try {
      // Get default scenario data
      const defaultScenarioData = getDefaultScenario(periodId);
      
      // Initialize with a default image URL using our default image function
      const getDefaultImageForPeriod = (id: number): string => {
        switch (id) {
          case 1: return '/images/medieval-1745073049963.jpg';
          case 2: return '/images/renaissance-1745072243570.jpg';
          case 3: return '/images/industrial-1745071865798.jpg';
          case 4: return '/images/renaissance-1745072243570.jpg'; // Modern uses Renaissance image
          case 5: return '/images/industrial-1745072173186.jpg'; // Future uses Industrial image
          default: return '/images/medieval-1745073049963.jpg';
        }
      };
      
      let imageUrl = getDefaultImageForPeriod(periodId);
      
      try {
        // Make API call for image generation
        console.log("Requesting image for scenario:", defaultScenarioData.title);
        const imageResponse = await apiRequest('POST', '/api/deepseek', {
          prompt: `Generate an image for ${defaultScenarioData.title}`,
          type: 'image',
          period: periodSlug
        });
        
        const imageData = await imageResponse.json();
        console.log("Received image data:", imageData);
        
        if (imageData && imageData.imageUrl) {
          // The imageUrl will be relative like "/images/medieval-1234567890.jpg"
          imageUrl = imageData.imageUrl;
          console.log("Using image URL:", imageUrl);
        } else {
          console.warn("No image URL in response, using fallback");
        }
      } catch (imageError) {
        console.warn("Failed to generate image, using fallback:", imageError);
        // Continue with fallback image
      }
      
      // Generate choices using DeepSeek
      // For choices, let's use our predefined defaults for each time period
      // This ensures each period has appropriate choices that work reliably
      console.log(`Setting default choices for ${periodSlug} period`);
      const defaultChoicesForPeriod = getDefaultChoices(periodId).map((choice, index) => ({
        id: index + 1,
        scenarioId: 1,
        text: choice.text,
        description: choice.description,
      }));
      
      // Set the choices immediately so they're always available
      setChoices(defaultChoicesForPeriod);
      
      // Then try to get API-generated choices if available
      try {
        console.log("Generating choices with DeepSeek for scenario:", defaultScenarioData.title);
        const choicesResponse = await apiRequest('POST', '/api/deepseek', {
          prompt: defaultScenarioData.description,
          type: 'choices',
          period: periodSlug
        });
        
        const choicesData = await choicesResponse.json();
        console.log("Generated choices:", choicesData);
        
        if (choicesData.choices && Array.isArray(choicesData.choices) && choicesData.choices.length > 0) {
          // Map the dynamically generated choices to our format
          const newChoices = choicesData.choices.map((choice: any, index: number) => ({
            id: index + 1,
            scenarioId: 1,
            text: choice.text,
            description: choice.description,
          }));
          
          // Only update if we got valid choices
          if (newChoices.length >= 2) {
            setChoices(newChoices);
          } else {
            console.warn("Not enough choices from API, keeping fallback choices");
          }
        }
      } catch (choicesError) {
        console.error("Failed to generate choices:", choicesError);
        // We already set default choices, so no need to do it again
      }
      
      // Generate historical context
      try {
        console.log("Generating historical context with DeepSeek for scenario:", defaultScenarioData.title);
        const contextResponse = await apiRequest('POST', '/api/deepseek', {
          prompt: defaultScenarioData.description,
          type: 'context',
          period: periodSlug
        });
        
        const contextData = await contextResponse.json();
        console.log("Generated context:", contextData);
        
        if (contextData.context) {
          setHistoricalContext({
            title: `Historical Context: ${defaultScenarioData.title}`,
            content: contextData.context
          });
        } else {
          // Fall back to default context
          const defaultContext = getDefaultHistoricalContext(periodId);
          setHistoricalContext({
            title: defaultContext.title,
            content: defaultContext.content
          });
        }
      } catch (contextError) {
        console.error("Failed to generate historical context:", contextError);
        // Fall back to default context
        const defaultContext = getDefaultHistoricalContext(periodId);
        setHistoricalContext({
          title: defaultContext.title,
          content: defaultContext.content
        });
      }
      
      // Update scenario with new data
      setCurrentScenario({
        id: 1,
        timePeriodId: periodId,
        title: defaultScenarioData.title,
        description: defaultScenarioData.description,
        imageUrl: imageUrl, // Use the already handled image URL
        year: defaultScenarioData.year,
        location: defaultScenarioData.location
      });
    } catch (error) {
      console.error('Failed to generate scenario content:', error);
      
      // Use default data as fallback
      const defaultScenarioData = getDefaultScenario(periodId);
      
      // Reuse the same getDefaultImageForPeriod function we defined earlier
      const getDefaultImageForPeriod = (id: number): string => {
        switch (id) {
          case 1: return '/images/medieval-1745073049963.jpg';
          case 2: return '/images/renaissance-1745072243570.jpg';
          case 3: return '/images/industrial-1745071865798.jpg';
          case 4: return '/images/renaissance-1745072243570.jpg'; // Modern uses Renaissance image
          case 5: return '/images/industrial-1745072173186.jpg'; // Future uses Industrial image
          default: return '/images/medieval-1745073049963.jpg';
        }
      };
      
      setCurrentScenario({
        id: 1,
        timePeriodId: periodId,
        title: defaultScenarioData.title,
        description: defaultScenarioData.description,
        imageUrl: getDefaultImageForPeriod(periodId),
        year: defaultScenarioData.year,
        location: defaultScenarioData.location
      });
      
      // Fall back to default choices
      setChoices(getDefaultChoices(periodId).map((choice, index) => ({
        id: index + 1,
        scenarioId: 1,
        text: choice.text,
        description: choice.description,
      })));
      
      // Fall back to default context
      const defaultContext = getDefaultHistoricalContext(periodId);
      setHistoricalContext({
        title: defaultContext.title,
        content: defaultContext.content
      });
    }
  };

  // Initialize music for all periods
  useEffect(() => {
    // Initialize the period music system
    try {
      console.log('Initializing period music system');
      // This will pre-load and prepare audio for all periods
      loadPeriodMusic('medieval', 'Medieval Era');
      loadPeriodMusic('renaissance', 'Renaissance');
      loadPeriodMusic('industrial', 'Industrial Age');
      loadPeriodMusic('modern', 'Modern Era');
      loadPeriodMusic('future', 'Future');
    } catch (error) {
      console.error('Failed to initialize period music:', error);
    }
  }, []);

  // Change period handler
  const handlePeriodChange = async (newPeriodSlug: string) => {
    setCurrentPeriodSlug(newPeriodSlug);
    const newPeriod = periods.find(p => p.slug === newPeriodSlug);
    
    if (newPeriod) {
      try {
        // Try to load and play period-specific music using direct file paths
        console.log(`Loading music for period: ${newPeriodSlug}`);
        
        // Set the direct path to the audio file
        const audioPath = `/audio/${newPeriodSlug}-theme.mp3`;
        console.log(`Got music URL for ${newPeriodSlug}: ${audioPath}`);
        
        // Update audio state with new track info
        const trackName = `${newPeriod.name} Theme`;
        audioManager.loadTrack(trackName, audioPath);
        audioManager.play(trackName);
        
        setAudioState({
          isPlaying: true,
          currentTrack: trackName,
          volume: audioState.volume
        });
      } catch (audioError) {
        console.error(`Failed to load period music for ${newPeriodSlug}:`, audioError);
        
        // Fall back to playing the period name track that was preloaded
        audioManager.play(newPeriod.name);
        setAudioState({
          isPlaying: true,
          currentTrack: newPeriod.name,
          volume: audioState.volume
        });
      }
      
      // Generate new content for the period
      generateScenarioContent(newPeriod.id, newPeriod.slug);
    }
  };

  // Toggle play/pause audio
  const toggleAudio = () => {
    audioManager.togglePlayPause();
    setAudioState(prev => ({
      ...prev,
      isPlaying: audioManager.isPlaying
    }));
  };

  // Show historical context modal
  const handleShowHistoricalContext = () => {
    setShowContext(true);
  };

  // Close historical context modal
  const handleCloseHistoricalContext = () => {
    setShowContext(false);
  };

  // Make a choice
  const handleMakeChoice = (choiceId: number) => {
    const selectedChoice = choices.find(c => c.id === choiceId);
    
    if (selectedChoice) {
      // Update historical impact based on choice
      setHistoricalImpact(`You chose to ${selectedChoice.text.toLowerCase()}. This decision has changed the course of history...`);
      
      // In a production implementation, we would fetch the next scenario based on this choice
      // For now, we'll create a new scenario based on the choice
      
      // Get current period
      const period = periods.find(p => p.slug === currentPeriodSlug);
      if (!period) return;
      
      // Generate a new scenario description based on the choice
      const newScenarioTitle = `Aftermath: ${selectedChoice.text}`;
      let newScenarioDescription = '';
      
      // Create description based on the choice
      switch (selectedChoice.text.toLowerCase().split(' ')[0]) {
        case 'join':
          newScenarioDescription = `You've decided to join the local movement. As you make your way through the crowd, people begin to take notice of your unusual clothing and mannerisms. Despite this, your knowledge of history gives you unique insights that quickly earn the respect of those around you.\n\nA leader emerges and asks for your counsel, recognizing something different about you. What will you share from your knowledge of the future?`;
          break;
        case 'speak':
        case 'talk':
          newScenarioDescription = `You approach the locals and start a conversation. At first, they're suspicious of your strange accent and clothing, but your genuine interest in their lives wins them over. They share stories of their daily struggles and hopes for the future.\n\nAs the conversation deepens, you realize how much your historical knowledge differs from lived experience. What seemed simple in history books is complex and nuanced in reality.`;
          break;
        case 'offer':
        case 'test':
        case 'explore':
        case 'visit':
        case 'attend':
          newScenarioDescription = `Your decision to ${selectedChoice.text.toLowerCase()} reveals new aspects of this historical period you hadn't considered before. The complexity of the social structures and the ingenuity of the people surprise you.\n\nAs you immerse yourself in this experience, you gain a deeper appreciation for how the past connects to your own time. What seemed distant in history books now feels immediate and relevant.`;
          break;
        default:
          newScenarioDescription = `Your choice leads you down an unexpected path. As a time traveler, you're now experiencing history firsthand, not just reading about it in books.\n\nThe consequences of your actions ripple through the community in ways you couldn't have predicted. You realize that even small decisions can have significant historical impacts when you're actually living through events rather than studying them from afar.`;
      }
      
      // Update the scenario with the new details
      if (currentScenario) {
        setCurrentScenario({
          ...currentScenario,
          title: newScenarioTitle,
          description: newScenarioDescription
        });
      }
      
      // Generate new choices based on the previous choice
      const newChoices = [
        {
          id: 1,
          scenarioId: 1,
          text: "Share future knowledge",
          description: "Carefully explain some future developments that might help in the current situation."
        },
        {
          id: 2,
          scenarioId: 1,
          text: "Keep your timeline secret",
          description: "Avoid revealing your time traveler status and instead focus on helping with your general knowledge."
        },
        {
          id: 3,
          scenarioId: 1,
          text: "Document your observations",
          description: "Take mental notes of everything you're experiencing for historical research when you return to your time."
        },
        {
          id: 4,
          scenarioId: 1,
          text: "Try a different approach",
          description: "Change your strategy based on what you've learned about this historical context so far."
        }
      ];
      
      setChoices(newChoices);
    }
  };

  // Determine the class for the current period
  const periodClass = getTimePeriodClass(currentPeriodSlug);

  return (
    <div className="bg-timeNavy text-parchment font-baskerville min-h-screen w-full overflow-x-hidden">
      {/* Audio Player */}
      <AudioPlayer
        isPlaying={audioState.isPlaying}
        currentMusic={audioState.currentTrack}
        onToggleAudio={toggleAudio}
      />

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className={`pt-16 pb-24 period-transition min-h-screen ${periodClass}`} id="main-content">
        {/* Timeline Navigation */}
        <TimelineNavigation
          periods={periods}
          activePeriod={currentPeriodSlug}
          onPeriodChange={handlePeriodChange}
          isLoading={isLoadingPeriods}
        />

        {/* Story Scenario */}
        {currentScenario && (
          <StoryScenario
            scenario={currentScenario}
            choices={choices}
            onShowHistoricalContext={handleShowHistoricalContext}
            onMakeChoice={handleMakeChoice}
            historicalImpact={historicalImpact}
          />
        )}

        {/* Historical Context Modal */}
        {historicalContext && (
          <HistoricalContext
            isOpen={showContext}
            title={historicalContext.title}
            content={historicalContext.content}
            onClose={handleCloseHistoricalContext}
            periodSlug={currentPeriodSlug}
          />
        )}
      </main>
    </div>
  );
}
