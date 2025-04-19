import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { deepSeekRequestSchema } from "@shared/schema";
import fetch from "node-fetch";
import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';
import { createClient } from 'pexels';
import { getLocalPeriodImage } from './local-images';
import { generatePeriodMusic, getDefaultAudioPath, getAvailableAudio } from './music-service';

// Define the images directory path
const IMAGES_DIR = path.join(process.cwd(), 'client', 'public', 'images');

// Ensure the images directory exists
try {
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
    console.log(`Created images directory at ${IMAGES_DIR}`);
  }
} catch (err) {
  console.error(`Error creating images directory: ${err}`);
}

// Function to provide default historical context when API fails
function defaultHistoricalContext() {
  return `
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
  `;
}

// Function to provide default choices when API fails
function getDefaultChoices(period: string) {
  // Default choices based on time period
  if (period === 'medieval') {
    return [
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
    ];
  } else if (period === 'renaissance') {
    return [
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
    ];
  } else if (period === 'industrial') {
    return [
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
    ];
  } else if (period === 'modern') {
    return [
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
    ];
  } else if (period === 'future') {
    return [
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
    ];
  } else {
    // Default fallback choices for any period
    return [
      {
        text: "Explore the surroundings",
        description: "Take time to observe and understand this historical period before making any decisions."
      },
      {
        text: "Talk to locals",
        description: "Learn from the people of this time to gain authentic insights into their daily lives and challenges."
      },
      {
        text: "Visit important locations",
        description: "Seek out historically significant sites to witness pivotal moments and developments firsthand."
      },
      {
        text: "Document your observations",
        description: "Record what you're experiencing to preserve knowledge of this time period for future reference."
      }
    ];
  }
}

// Note: Image directory is already set up at the top of the file

// Function to fetch data from DeepSeek text generation API using OpenAI SDK
async function fetchTextFromDeepSeek(prompt: string, temperature: number = 0.7): Promise<any> {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      console.warn('DEEPSEEK_API_KEY is not set, using fallback content');
      throw new Error('DEEPSEEK_API_KEY is not set');
    }

    console.log(`Using DeepSeek API key with length: ${apiKey.length}`);

    // Initialize OpenAI client with DeepSeek base URL
    const openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: apiKey
    });

    try {
      // Using DeepSeek API with OpenAI SDK
      const completion = await openai.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a historian and a storyteller, providing accurate historical information and engaging narratives." },
          { role: "user", content: prompt }
        ],
        temperature: temperature,
        max_tokens: 1000
      });

      return completion;
    } catch (apiError: any) {
      if (apiError.status === 402) {
        console.warn("DeepSeek API account has insufficient balance, using fallback content");
        throw new Error("Insufficient balance for DeepSeek API");
      } else {
        console.error("Error calling DeepSeek API:", apiError);
        throw apiError;
      }
    }
  } catch (error) {
    console.error("Error fetching from DeepSeek:", error);
    throw new Error("Failed to fetch from DeepSeek API");
  }
}

// Function to search for historical images from locally saved files
async function searchHistoricalImage(prompt: string, period: string): Promise<{imageUrl: string}> {
  console.log(`Finding a local image for period: ${period}`);
  
  try {
    // Look for existing images in the images directory that match the period
    if (!fs.existsSync(IMAGES_DIR)) {
      fs.mkdirSync(IMAGES_DIR, { recursive: true });
    }

    // Use our local-images module to get an appropriate image for the period
    const localImageUrl = await getLocalPeriodImage(period);
    console.log(`Using local image for ${period}: ${localImageUrl}`);
    return { imageUrl: localImageUrl };
    
    // The Pexels API code below is kept but not reached, since we're using local images
    // Get Pexels API key
    const pexelsApiKey = process.env.PEXELS_API_KEY;
    
    if (!pexelsApiKey) {
      console.error("Pexels API key not found, using fallback image");
      return { imageUrl: await getLocalPeriodImage(period) };
    }
    
    // Create a descriptive search query based on the period and prompt
    let searchQuery = '';
    
    // Formulate different search queries based on the time period to get better results
    switch(period) {
      case 'medieval':
        searchQuery = `medieval castle historical architecture stone ancient`;
        break;
      case 'renaissance':
        searchQuery = `renaissance art painting museum historical architecture`;
        break;
      case 'industrial':
        searchQuery = `industrial revolution factory steam vintage historical`;
        break;
      case 'modern':
        searchQuery = `1960s vintage retro historical photograph`;
        break;
      case 'future':
        searchQuery = `futuristic cityscape technology scifi modern architectural`;
        break;
      default:
        searchQuery = `historical ${period} photography documentary`;
    }
    
    // Create a unique filename to store the image
    const timestamp = Date.now();
    const uniqueFilename = `${period}-${timestamp}.jpg`;
    const imagePath = path.join(IMAGES_DIR, uniqueFilename);
    
    // Try to get an image from Pexels API using the client library
    try {
      console.log(`Using Pexels client API for query: ${searchQuery}`);
      
      // Initialize the Pexels client
      const pexelsClient = createClient(pexelsApiKey);
      
      // Search for images
      console.log(`Sending request to Pexels API with query: ${searchQuery}`);
      const searchResults = await pexelsClient.photos.search({ 
        query: searchQuery,
        per_page: 10,
        orientation: 'landscape'
      });
      
      console.log(`Pexels API search complete`);
      
      // Check if we got valid search results
      if (!searchResults || !('photos' in searchResults) || !searchResults.photos || searchResults.photos.length === 0) {
        console.log(`No photos found in Pexels results`);
        throw new Error('No photos found in Pexels results');
      }
      
      console.log(`Pexels API found ${searchResults.total_results} total results`);
      console.log(`Response contains ${searchResults.photos.length} photos`);
      
      // Filter for valid images
      const validImages = searchResults.photos.filter((photo: any) => 
        photo.src && 
        (photo.src.large || photo.src.medium || photo.src.original)
      );
      
      console.log(`Found ${validImages.length} valid images with URLs`);
      
      if (validImages.length > 0) {
        // Choose a random image from the results to add variety
        const randomIndex = Math.floor(Math.random() * validImages.length);
        const selectedImage = validImages[randomIndex];
        
        // Get the best image URL available
        const imageUrl = selectedImage.src.large || 
                       selectedImage.src.medium || 
                       selectedImage.src.original || '';
        
        if (!imageUrl) {
          throw new Error('No valid image URL found in Pexels result');
        }
        
        console.log(`Selected Pexels image ID ${selectedImage.id} for ${period}`);
        console.log(`Image URL: ${imageUrl.substring(0, 50)}...`);
        
        try {
          // Download the image
          console.log(`Downloading image from ${imageUrl.substring(0, 30)}...`);
          const imageResponse = await fetch(imageUrl);
          
          console.log(`Image download response status: ${imageResponse.status}`);
          
          if (!imageResponse.ok) {
            throw new Error(`Failed to download image: ${imageResponse.status}`);
          }
          
          // Save the image to the file system
          const arrayBuffer = await imageResponse.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          fs.writeFileSync(imagePath, buffer);
          
          // Make sure the file was created
          if (!fs.existsSync(imagePath)) {
            throw new Error(`Failed to write image file to ${imagePath}`);
          }
          
          const stats = fs.statSync(imagePath);
          console.log(`Image saved to ${imagePath}, size: ${stats.size} bytes`);
          
          // Return the URL to the locally saved image
          console.log(`Successfully saved image for ${period} from Pexels`);
          return { imageUrl: `/images/${uniqueFilename}` };
        } catch (downloadError) {
          console.error("Error downloading or saving image from Pexels:", downloadError);
          throw downloadError;
        }
      } else {
        throw new Error('No valid images found in Pexels results');
      }
    } catch (pexelsError: unknown) {
      console.error("Error using Pexels for image search:", pexelsError);
      // Use our local image fallback
      const errorMessage = pexelsError instanceof Error ? pexelsError.message : String(pexelsError);
      console.log(`Using local image fallback for ${period} due to Pexels API error: ${errorMessage}`);
      return { imageUrl: await getLocalPeriodImage(period) };
    }
  } catch (error) {
    console.error("Error searching for historical image:", error);
    // Use our local image fallback
    try {
      const fallbackImage = await getLocalPeriodImage(period);
      return { imageUrl: fallbackImage };
    } catch (fallbackError) {
      console.error("Even fallback image retrieval failed:", fallbackError);
      // Last resort - use a known good medieval image
      return { imageUrl: '/images/medieval-1745073049963.jpg' };
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static files from the images directory
  app.use('/images', express.static(IMAGES_DIR));
  
  // Time periods API
  app.get("/api/periods", async (req, res) => {
    try {
      const periods = await storage.getAllTimePeriods();
      res.json(periods);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve time periods" });
    }
  });

  app.get("/api/periods/:slug", async (req, res) => {
    try {
      const period = await storage.getTimePeriodBySlug(req.params.slug);
      if (!period) {
        return res.status(404).json({ message: "Time period not found" });
      }
      res.json(period);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve time period" });
    }
  });

  // Scenarios API
  app.get("/api/periods/:periodId/scenarios", async (req, res) => {
    try {
      const periodId = parseInt(req.params.periodId, 10);
      if (isNaN(periodId)) {
        return res.status(400).json({ message: "Invalid period ID" });
      }

      const scenarios = await storage.getScenariosByTimePeriodId(periodId);
      res.json(scenarios);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve scenarios" });
    }
  });

  app.get("/api/scenarios/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid scenario ID" });
      }

      const scenario = await storage.getScenarioById(id);
      if (!scenario) {
        return res.status(404).json({ message: "Scenario not found" });
      }

      res.json(scenario);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve scenario" });
    }
  });

  // Choices API
  app.get("/api/scenarios/:scenarioId/choices", async (req, res) => {
    try {
      const scenarioId = parseInt(req.params.scenarioId, 10);
      if (isNaN(scenarioId)) {
        return res.status(400).json({ message: "Invalid scenario ID" });
      }

      const choices = await storage.getChoicesByScenarioId(scenarioId);
      res.json(choices);
    } catch (error) {
      res.status(500).json({ message: "Failed to retrieve choices" });
    }
  });

  // DeepSeek API integration for generating content
  app.post("/api/deepseek", async (req, res) => {
    try {
      const validatedRequest = deepSeekRequestSchema.parse(req.body);
      const { prompt, type, period } = validatedRequest;

      if (type === "image") {
        // Get a local image from our saved images directory based on period
        const localImageUrl = await getLocalPeriodImage(period);
        console.log(`Using local image for ${period}: ${localImageUrl}`);
        res.json({ imageUrl: localImageUrl });
      } else if (type === "choices") {
        // Generate choices for a scenario
        const choicesPrompt = `
You are a historical consultant for an interactive time travel simulation set in the ${period} period.
Generate 4 historically plausible choices for the following scenario:

"${prompt}"

Format each choice as a brief action (1-6 words) followed by a description explaining the potential consequences (30-40 words).
Return ONLY a JSON array of objects with "text" and "description" fields for each choice.
Ensure choices are historically accurate and represent different approaches to the situation.
        `;
        
        try {
          const choicesResponse = await fetchTextFromDeepSeek(choicesPrompt, 0.8);
          
          // Extract the JSON array from the response
          // DeepSeek API via OpenAI SDK returns a different format
          if (choicesResponse.choices && choicesResponse.choices.length > 0) {
            let choicesText = choicesResponse.choices[0].message.content;
            console.log("Successfully received choices response with length:", choicesText.length);
            
            // If the response includes markdown code blocks, extract the JSON
            try {
              let processedText = choicesText;
              
              // Try to extract JSON from markdown code blocks if present
              if (processedText.includes('```json')) {
                processedText = processedText.split('```json')[1].split('```')[0].trim();
              } else if (processedText.includes('```')) {
                processedText = processedText.split('```')[1].split('```')[0].trim();
              }
              
              console.log("Processed choices text:", processedText.substring(0, 100) + "...");
              
              // Attempt to parse the JSON
              const generatedChoices = JSON.parse(processedText);
              
              // Validate that we have an array with the expected format
              if (Array.isArray(generatedChoices) && generatedChoices.length > 0 && 
                  generatedChoices[0].text && generatedChoices[0].description) {
                console.log("Successfully parsed choices array with", generatedChoices.length, "items");
                res.json({ choices: generatedChoices });
                return;
              } else {
                throw new Error("Parsed JSON is not in the expected format");
              }
            } catch (parseError: unknown) {
              const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
              console.error("Error processing choices from DeepSeek:", errorMessage);
              
              // Attempt to find and extract json content even if there are no code blocks
              try {
                // Look for array-like content with square brackets - use standard regex without the 's' flag for ES2018 compatibility
                const matchPattern = /\[\s*\{[\s\S]*?\}\s*\]/;
                const match = choicesText.match(matchPattern);
                if (match) {
                  const jsonContent = match[0];
                  console.log("Extracted potential JSON content:", jsonContent.substring(0, 100) + "...");
                  const extractedChoices = JSON.parse(jsonContent);
                  
                  if (Array.isArray(extractedChoices) && extractedChoices.length > 0 && 
                      extractedChoices[0].text && extractedChoices[0].description) {
                    console.log("Successfully extracted choices from raw text");
                    res.json({ choices: extractedChoices });
                    return;
                  }
                }
              } catch (extractError: unknown) {
                const errorMessage = extractError instanceof Error ? extractError.message : String(extractError);
                console.error("Failed to extract JSON from response:", errorMessage);
              }
              
              // If all else fails, use default choices
              console.log("Using fallback choices due to parsing errors");
              const defaultChoices = getDefaultChoices(period);
              res.json({ choices: defaultChoices });
            }
          } else {
            // Fallback to default choices if we can't extract from the AI response
            console.log("Using fallback choices due to empty response");
            const defaultChoices = getDefaultChoices(period);
            res.json({ choices: defaultChoices });
          }
        } catch (error) {
          console.error("Error parsing choices from DeepSeek:", error);
          // Fallback to default choices
          const defaultChoices = getDefaultChoices(period);
          res.json({ choices: defaultChoices });
        }
      } else if (type === "context") {
        // Generate historical context
        const contextPrompt = `
You are a professor of history specializing in the ${period} period. 
Create a detailed, educational historical context for this scenario:

"${prompt}"

Format your response as HTML with:
1. A strong title
2. 2-3 paragraphs of historical background 
3. A bullet list of 3-4 key historical facts
4. A concluding note about potential historical impact

Use appropriate HTML tags (<p>, <strong>, <ul>, <li>, etc.) for formatting.
Include historically accurate dates, figures, and events.
Keep the content educational but engaging for a general audience.
        `;
        
        try {
          const contextResponse = await fetchTextFromDeepSeek(contextPrompt, 0.7);
          
          if (contextResponse.choices && contextResponse.choices.length > 0) {
            try {
              const historicalContext = contextResponse.choices[0].message.content;
              console.log("Successfully generated historical context:", historicalContext.substring(0, 100) + "...");
              res.json({ context: historicalContext });
            } catch (parseError) {
              console.error("Error parsing history context from DeepSeek:", parseError);
              // Fallback to default context if we can't parse the response
              const defaultContext = defaultHistoricalContext();
              console.log("Using fallback context due to parsing error");
              res.json({ context: defaultContext });
            }
          } else {
            // Fallback to default context
            const defaultContext = defaultHistoricalContext();
            console.log("Using fallback context due to empty response");
            res.json({ context: defaultContext });
          }
        } catch (error) {
          console.error("Error generating historical context from DeepSeek:", error);
          // Fallback to default context
          const defaultContext = defaultHistoricalContext();
          res.json({ context: defaultContext });
        }
      } else {
        res.status(400).json({ message: "Invalid request type" });
      }
    } catch (error) {
      console.error("Error in DeepSeek API endpoint:", error);
      res.status(500).json({ message: "Failed to generate content" });
    }
  });

  // Direct image generation endpoint
  app.get("/api/deepseek/image/:period", async (req, res) => {
    try {
      const period = req.params.period;
      const prompt = `Historical scene from the ${period} period`;
      
      // Get a local image for this period
      const localImageUrl = await getLocalPeriodImage(period);
      console.log(`Using local image for ${period}: ${localImageUrl}`);
      res.json({ imageUrl: localImageUrl });
    } catch (error) {
      console.error("Error generating period image:", error);
      // Use our fallback image system
      try {
        const fallbackImage = await getLocalPeriodImage(req.params.period);
        res.json({ imageUrl: fallbackImage });
      } catch (fallbackError) {
        console.error("Even fallback image retrieval failed:", fallbackError);
        // Last resort - use a known good medieval image
        res.json({ imageUrl: '/images/medieval-1745073049963.jpg' });
      }
    }
  });

  // Serve static images
  app.get("/api/images/:file", (req, res) => {
    const imagePath = path.join(IMAGES_DIR, req.params.file);
    if (fs.existsSync(imagePath)) {
      res.sendFile(imagePath);
    } else {
      res.status(404).json({ message: "Image not found" });
    }
  });
  
  // Set up audio directory for static serving
  const AUDIO_DIR = path.join(process.cwd(), 'client', 'public', 'audio');
  
  // Ensure the audio directory exists
  try {
    if (!fs.existsSync(AUDIO_DIR)) {
      fs.mkdirSync(AUDIO_DIR, { recursive: true });
      console.log(`Created audio directory at ${AUDIO_DIR}`);
    }
  } catch (err) {
    console.error(`Error creating audio directory: ${err}`);
  }
  
  // Serve static audio files
  app.use('/audio', express.static(AUDIO_DIR));
  
  // Audio file endpoint - serves the appropriate static file
  app.get("/api/audio/:file", async (req, res) => {
    try {
      const filename = req.params.file;
      
      // Extract period from filename (format: period.mp3 or period-theme.mp3)
      let period = 'medieval'; // Default period
      if (filename.includes('.')) {
        period = filename.split('.')[0];
      }
      if (filename.includes('-')) {
        period = filename.split('-')[0];
      }
      
      console.log(`Audio requested for period: ${period}`);
      
      // Get the path to the audio file
      const audioUrl = getDefaultAudioPath(period);
      
      // Return info about the audio file
      return res.status(200).json({ 
        message: "Audio file available", 
        audioUrl: audioUrl,
        period: period
      });
    } catch (error) {
      console.error("Error in audio endpoint:", error);
      res.status(500).json({ message: "Failed to provide audio" });
    }
  });
  
  // New endpoint to list available music for each period
  app.get("/api/audio-library/:period?", (req, res) => {
    try {
      const period = req.params.period;
      const availableAudio = getAvailableAudio(period);
      
      res.json({
        period: period || 'all',
        availableAudio: availableAudio
      });
    } catch (error) {
      console.error("Error getting audio library:", error);
      res.status(500).json({ message: "Failed to retrieve audio library" });
    }
  });
  
  // Get default music for a specific period
  app.post("/api/generate-music", async (req, res) => {
    try {
      const { period } = req.body;
      
      if (!period) {
        return res.status(400).json({ message: "Period is required" });
      }
      
      console.log(`Requesting music for period: ${period}`);
      
      // Get the default audio path for this period
      const audioUrl = getDefaultAudioPath(period);
      
      res.json({
        audioUrl: audioUrl,
        period: period,
        status: "default",
        message: "Using default period audio"
      });
    } catch (error) {
      console.error("Error providing music:", error);
      
      // Return fallback audio path
      const defaultPath = getDefaultAudioPath('medieval');
      
      res.status(200).json({
        audioUrl: defaultPath,
        status: "fallback",
        message: "Using medieval music as fallback"
      });
    }
  });
  
  // Test endpoint for Pexels API credentials using client library
  app.get("/api/pexels-test", async (req, res) => {
    try {
      // Log request to help with debugging
      console.log("Received request to test Pexels API");
      
      const pexelsApiKey = process.env.PEXELS_API_KEY;
      
      // Check if API key exists
      if (!pexelsApiKey) {
        console.error("Pexels API key not found");
        return res.status(400).json({ 
          message: "Pexels API key not found", 
          success: false 
        });
      }
      
      console.log("Testing Pexels API with key length:", pexelsApiKey.length);
      
      try {
        // Initialize the Pexels client
        const pexelsClient = createClient(pexelsApiKey);
        
        // Test query
        const testQuery = "medieval castle";
        console.log("Sending test request to Pexels API for query:", testQuery);
        
        // Search for images using the client
        const searchResults = await pexelsClient.photos.search({ 
          query: testQuery,
          per_page: 1 
        });
  
        console.log("Received response from Pexels API");
        
        if (searchResults && 'photos' in searchResults && searchResults.photos && searchResults.photos.length > 0) {
          const testImage = searchResults.photos[0];
          console.log("Pexels API test successful, found", searchResults.total_results || 0, "results");
          
          // Return detailed information about the test
          return res.status(200).json({ 
            message: "Pexels API working correctly", 
            success: true,
            apiWorking: true,
            totalResults: searchResults.total_results || 0,
            photosCount: searchResults.photos.length,
            testImage: {
              id: testImage.id,
              width: testImage.width,
              height: testImage.height,
              photographer: testImage.photographer,
              url: testImage.url,
              // Include a sample of available image sources
              sampleSrc: {
                medium: testImage.src.medium,
                small: testImage.src.small
              }
            }
          });
        } else {
          return res.status(500).json({ 
            message: "No photos returned from Pexels API", 
            success: false 
          });
        }
      } catch (apiError) {
        console.error("Error testing Pexels API:", apiError);
        return res.status(500).json({ 
          message: "Pexels API test failed", 
          success: false,
          error: String(apiError)
        });
      }
    } catch (error) {
      console.error("Error checking Pexels API:", error);
      return res.status(500).json({ 
        message: "Server error testing Pexels API", 
        success: false,
        error: String(error)
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
