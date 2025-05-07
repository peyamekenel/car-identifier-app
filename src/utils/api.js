import axios from 'axios';
import { GEMINI_API_KEY } from '@env';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export const identifyVehicle = async (base64Image) => {
  try {
    if (!base64Image || base64Image.trim() === '') {
      throw new Error('Invalid image data: Image is empty or undefined');
    }
    
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: "You are a vehicle recognition expert. Please identify the make, model, approximate production year, license plate (if visible), color, and vehicle type of the car in this image. For vehicle type, categorize as: Sedan, Hatchback, SUV, Truck, Van, Coupe, Convertible, Wagon, or Other. Only return the following format:\n\nMake: [Brand]\nModel: [Model]\nYear: [Estimated Year or Range]\nColor: [Main color of the vehicle]\nVehicle Type: [Sedan/Hatchback/SUV/Truck/Van/Coupe/Convertible/Wagon/Other]\nLicense Plate: [License plate number if visible, otherwise 'Not visible']"
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }
        ]
      }
    );

    if (!response.data || !response.data.candidates || 
        !response.data.candidates[0] || 
        !response.data.candidates[0].content || 
        !response.data.candidates[0].content.parts || 
        !response.data.candidates[0].content.parts[0] || 
        !response.data.candidates[0].content.parts[0].text) {
      throw new Error('Invalid API response: Missing expected data structure');
    }

    const result = response.data.candidates[0].content.parts[0].text;
    return result;
  } catch (error) {
    console.error('Error identifying vehicle:', error);
    
    if (error.response) {
      if (error.response.status === 400) {
        throw new Error('Invalid request to Gemini API: The image may be too large or in an unsupported format');
      } else if (error.response.status === 401) {
        throw new Error('Authentication error: Invalid API key');
      } else if (error.response.status === 429) {
        throw new Error('Rate limit exceeded: Too many requests to Gemini API');
      } else {
        throw new Error(`API error: ${error.response.status} - ${error.response.data?.error?.message || 'Unknown error'}`);
      }
    } else if (error.request) {
      throw new Error('Network error: No response from Gemini API. Check your internet connection');
    } else {
      throw error;
    }
  }
};
