// Verification script for DeepSeek API using OpenAI SDK
import OpenAI from 'openai';
import 'dotenv/config';

async function verifyDeepSeekAPI() {
  try {
    // Get the API key from environment variables
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
    console.log('Sending verification request to DeepSeek API...');
    
    try {
      const completion = await openai.chat.completions.create({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "What is the capital of France?" }
        ],
        temperature: 0.7,
        max_tokens: 50
      });
      
      console.log('DeepSeek API Response:');
      console.log(JSON.stringify(completion, null, 2));
      
      if (completion.choices && completion.choices.length > 0) {
        console.log('\nAnswer: ' + completion.choices[0].message.content);
        console.log('\nAPI verification completed successfully! API key is valid and has sufficient credits.');
        return true;
      }
    } catch (error) {
      console.error('Error during DeepSeek API verification:');
      
      if (error.status === 402) {
        console.error('API Key is valid but has insufficient balance (credits).');
      } else if (error.status === 401) {
        console.error('API Key is invalid or unauthorized.');
      } else {
        console.error(error);
      }
      
      return false;
    }
  } catch (error) {
    console.error('Error in verification process:');
    console.error(error);
    return false;
  }
}

// Run the verification
verifyDeepSeekAPI().then(result => {
  if (!result) {
    console.log("\nVerification failed. Please check API key and account balance.");
  }
  
  // Exit process after verification
  process.exit(result ? 0 : 1);
});