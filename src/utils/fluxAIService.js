import { generatePrompt } from './Prompt';

const API_URL = 'http://localhost:3001/api';

export const generateAIImage = async (testResults, categoryScores) => {
  try {
    const prompt = generatePrompt(testResults, categoryScores);
    console.log('Sending request to:', `${API_URL}/generate-image`);
    console.log('Prompt:', prompt);
    const response = await fetch(`${API_URL}/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error("Detailed error:", error);
    throw error;
  }
};

export { generatePrompt };