# Emergency Response System

## Features
- 5-second countdown with cancel option
- Visual and audio emergency alerts
- Location tracking
- Contact management
- Server-side processing

## Setup
1. Install dependencies: `npm install`
2. For SMS alerts:
   - Get Twilio credentials
   - Uncomment config in server.js
   - Add your credentials
3. Add sound files to public/sounds/
   - beep.mp3 - countdown beep sound
   - siren.mp3 - emergency siren sound

## Running
- Start server: `node server.js`
- Access at: http://localhost:8000

## Testing
1. Click SOS button
2. Verify countdown works
3. Test cancel button
4. Verify emergency alert flow