const API_URL = '/api'
  ? 'http://1.226.83.12:3000/api' 
  : 'http://localhost:3001/api';

  export const generateAIImage = async (testResults) => {
    try {
      const prompt = generatePrompt(testResults);
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error("Detailed error:", error);
    throw error;
  }
};

const generatePrompt = (results) => {
  // 프롬프트 생성 로직...
  return `Cybernetic implant system with L-shaped main module and 4 unique parts. MACHINE BUTCHER Corp branding. Retro futuristic style. ${results.someProperty}`;
};

export { generatePrompt };