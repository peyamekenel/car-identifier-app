# Car Identifier App

A React Native mobile application that allows users to take or select a photo of a car, send it to the Google Gemini API, and display the vehicle's make, model, and approximate production year.

## Features

- Camera integration for taking photos
- Image picker for selecting photos from gallery
- Integration with Google Gemini Vision API (gemini-2.0-flash model)
- Clean and minimal UI
- Loading spinner while waiting for API response
- Error handling for various scenarios

## Prerequisites

- Node.js (v14 or newer)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device (for testing)

## Installation

1. Clone this repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
# or
yarn install
```

4. Create a `.env` file in the root directory with your Gemini API key:

```
GEMINI_API_KEY=your_api_key_here
```

## Running the App

1. Start the development server:

```bash
npx expo start
```

2. Scan the QR code with the Expo Go app on your mobile device, or run on an emulator.

## Project Structure

- `App.js` - Main application component
- `src/screens/CameraScreen.js` - Camera screen with photo capture and processing
- `src/utils/api.js` - API utility for Gemini Vision API integration

## How It Works

1. The app allows users to take a photo using the device camera or select an image from the gallery.
2. The selected image is converted to base64 format.
3. The base64 image is sent to the Google Gemini Vision API (gemini-2.0-flash model).
4. The API analyzes the image and returns information about the vehicle.
5. The app displays the make, model, and year of the vehicle.

## Dependencies

- expo-camera - For camera functionality
- expo-image-picker - For selecting images from gallery
- expo-file-system - For file operations including base64 conversion
- axios - For API requests
- react-native-dotenv - For environment variables
