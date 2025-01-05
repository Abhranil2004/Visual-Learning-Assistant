import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyBumFef7tLGk65Mf4XDI_KzigKjfcgYl8M');

const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB limit for Gemini

function validateImageData(imageData: string): boolean {
  // Check if the image data is a valid base64 string
  if (!imageData.startsWith('data:image/')) {
    return false;
  }

  // Check image size
  const base64Data = imageData.split(',')[1];
  const sizeInBytes = (base64Data.length * 3) / 4;
  return sizeInBytes <= MAX_IMAGE_SIZE;
}

export async function analyzeImage(imageData: string) {
  try {
    if (!imageData) {
      throw new Error('No image data provided');
    }

    if (!validateImageData(imageData)) {
      throw new Error('Invalid image data or image too large (max 4MB)');
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = "You are a helpful teaching assistant. Please analyze this image of a problem and provide a clear, step-by-step solution. If it's a math problem, explain each step thoroughly. If it's a science question, explain the concepts involved. Make the explanation easy to understand for students.";
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageData.split(',')[1],
          mimeType: 'image/jpeg'
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error('No response from AI');
    }

    return text;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error analyzing image:', error.message);
      throw error;
    }
    console.error('Unexpected error:', error);
    throw new Error('An unexpected error occurred. Please try again.');
  }
}