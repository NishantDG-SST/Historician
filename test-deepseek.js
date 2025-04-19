// Test script for DeepSeek API using OpenAI SDK
import OpenAI from 'openai';
import 'dotenv/config';

async function testDeepSeekAPI() {
  try {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      console.error('DEEPSEEK_API_KEY environment variable is not set');
      return;
    }
    
    console.log(`Using DeepSeek API key with length: ${apiKey.length}`);
    
    // Initialize OpenAI client with DeepSeek base URL
    const openai = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: apiKey
    });
    
    // Test a simple query
    console.log('Sending test request to DeepSeek API...');
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "What is the capital of France?" }
      ],
      temperature: 0.7,
      max_tokens: 100
    });
    
    console.log('DeepSeek API Response:');
    console.log(JSON.stringify(completion, null, 2));
    
    if (completion.choices && completion.choices.length > 0) {
      console.log('\nAnswer: ' + completion.choices[0].message.content);
    }
    
    console.log('\nAPI test completed successfully!');
  } catch (error) {
    console.error('Error testing DeepSeek API:');
    console.error(error);
  }
}

// Run the test
testDeepSeekAPI();