# Chatbot Backend

This is the backend server for the AI chatbot application. It uses Express.js and Socket.IO for real-time communication and OpenAI's GPT-3.5 for generating responses.

## Setup Instructions

1. Install Node.js (version 14 or higher)

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=5000
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
```

4. Replace `your_openai_api_key_here` with your actual OpenAI API key

5. Start the development server:
```bash
npm run dev
```

The server will start on http://localhost:5000

## API Endpoints

The server uses Socket.IO for real-time communication. The following events are available:

### Client to Server
- `message`: Send a text message
- `file`: Send a file attachment

### Server to Client
- `message`: Receive AI response
- `typing`: Typing indicator
- `error`: Error messages

## Environment Variables

- `PORT`: Server port (default: 5000)
- `OPENAI_API_KEY`: Your OpenAI API key
- `NODE_ENV`: Environment mode (development/production)

## Error Handling

The server includes basic error handling for:
- Invalid messages
- Failed API calls
- File processing errors

## Security

- CORS is enabled for the frontend origin
- Rate limiting is recommended for production
- API keys should be kept secure 