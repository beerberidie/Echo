# Echo Voice Recording App

Echo is a voice recording application that allows users to record, transcribe, summarize, and share voice recordings. This application includes both a frontend built with React and TypeScript, and a backend built with Node.js, Express, and MongoDB.

## Key Features

- **JSON-based File Storage**: Securely store audio recordings with proper user isolation
- **Speech-to-Text Integration**: Automatic transcription of voice recordings
- **Email Sharing**: Share recordings via email with customizable content

## Features

- Record, pause, and resume voice recordings
- Automatic transcription of recordings
- Generate summaries and meeting notes from recordings
- Share recordings via email or other methods
- User authentication and account management
- Settings management including theme preferences and email presets

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB (v4 or higher)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/echo-voice-recording-app.git
cd echo-voice-recording-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Install MongoDB

For Windows users, you can run the provided script:

```bash
install-mongodb.bat
```

For other operating systems, download and install MongoDB from [MongoDB Download Center](https://www.mongodb.com/try/download/community).

### 4. Set up environment variables

The application uses environment variables for configuration. The default values are set in the `.env` file, but you should modify them for your environment:

#### Backend Environment Variables (server/.env)

```
# Server Configuration
PORT=5000
MONGODB_URI=mongodb://localhost:27017/echo_app
JWT_SECRET=your_jwt_secret_key_change_in_production
NODE_ENV=development

# Speech-to-Text API Configuration
SPEECH_TO_TEXT_API_URL=http://localhost:5002/transcribe
SPEECH_TO_TEXT_MODEL=base
SPEECH_TO_TEXT_LANGUAGE=english

# SMTP Configuration for Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=echo@example.com
```

**Important Notes:**
- For Gmail, you'll need to use an App Password instead of your regular password
- To get an App Password, enable 2-Step Verification in your Google Account, then generate an App Password for "Mail" application

## Running the Application

### 1. Start the backend server

```bash
start-echo-server.bat
```

This will start the backend server at http://localhost:5000.

### 2. Start the frontend development server

```bash
start-echo-app.bat
```

This will start the frontend development server at http://localhost:5004 and open the application in your default browser.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user profile

### Recordings

- `GET /api/recordings` - Get all recordings for the authenticated user
- `GET /api/recordings/:id` - Get a specific recording
- `POST /api/recordings` - Create a new recording
- `PUT /api/recordings/:id` - Update a recording
- `DELETE /api/recordings/:id` - Delete a recording
- `DELETE /api/recordings` - Delete all recordings for the authenticated user

### Settings

- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings
- `POST /api/settings/email-presets` - Add an email preset
- `DELETE /api/settings/email-presets/:id` - Remove an email preset

## Project Structure

```
echo-voice-recording-app/
├── server/                  # Backend code
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # API controllers
│   │   ├── middleware/      # Middleware functions
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   └── index.ts         # Server entry point
│   ├── .env                 # Backend environment variables
│   ├── package.json         # Backend dependencies
│   └── tsconfig.json        # TypeScript configuration for backend
├── src/                     # Frontend code
│   ├── components/          # React components
│   ├── context/             # React context providers
│   ├── services/            # API services
│   ├── types/               # TypeScript type definitions
│   ├── App.tsx              # Main App component
│   └── main.tsx             # Frontend entry point
├── .env                     # Frontend environment variables
├── package.json             # Frontend dependencies
├── start-echo-app.bat       # Script to start the frontend
├── start-echo-server.bat    # Script to start the backend
└── install-mongodb.bat      # Script to guide MongoDB installation
```

## Key Features Guide

### JSON-based File Storage

The application uses a JSON-based file storage system for audio recordings:

- Audio files are stored in the `server/storage/recordings/{userId}` directory
- Each recording has a unique filename generated using UUID
- File metadata (name, size, format) is stored in the MongoDB database
- Files are automatically cleaned up when recordings are deleted

### Speech-to-Text Integration

The application integrates with a speech-to-text service:

- When a recording is saved, transcription is automatically triggered
- Transcription status is tracked (pending, processing, completed, failed)
- Users can retry failed transcriptions
- The transcription service communicates with the external API at the configured URL

### Email Sharing

The application includes email sharing capabilities:

- Users can share recordings via email with customizable content
- Email sharing respects the share preferences (audio, summary, meeting notes)
- SMTP configuration is required in the server's .env file
- Email templates include proper formatting and attachments

## Testing the Application

1. Start both the backend and frontend servers
2. Register a new account or use the demo mode
3. Record a voice message using the microphone button
4. Save the recording
5. View the transcription status and wait for it to complete
6. Try sharing the recording via email (requires SMTP configuration)
7. Explore other features like summarization and meeting notes

## License

This project is licensed under the MIT License - see the LICENSE file for details.
