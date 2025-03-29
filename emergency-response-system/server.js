const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const twilio = require('twilio');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 8000;
const CONTACTS_FILE = path.join(__dirname, 'contacts.json');

/* 
// Twilio Configuration (uncomment and fill in your credentials)
process.env.TWILIO_ACCOUNT_SID = 'your_account_sid';
process.env.TWILIO_AUTH_TOKEN = 'your_auth_token'; 
process.env.TWILIO_PHONE_NUMBER = '+1234567890';
*/

// Load or initialize contacts
let emergencyContacts = [];
try {
  emergencyContacts = JSON.parse(fs.readFileSync(CONTACTS_FILE));
} catch (err) {
  emergencyContacts = [
    { name: 'Police', number: '911' },
    { name: 'Ambulance', number: '911' },
    { name: 'Fire Department', number: '911' }
  ];
  fs.writeFileSync(CONTACTS_FILE, JSON.stringify(emergencyContacts));
}

// User Management Routes
app.get('/api/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  res.json(users.map(u => ({...u, password: undefined})));
});

app.post('/api/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.sendStatus(403);
  
  const { username, password, email, role } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: users.length + 1,
    username,
    password: hashedPassword,
    role: role || 'user',
    email
  };

  users.push(newUser);
  fs.writeFileSync(USERS_FILE, JSON.stringify(users));
  res.status(201).json({...newUser, password: undefined});
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Emergency alert endpoint
app.post('/api/alert', async (req, res) => {
    const { location, contacts } = req.body;
    
    try {
        // Send SMS alerts if Twilio is configured
        if (process.env.TWILIO_ACCOUNT_SID) {
            const client = twilio(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.TWILIO_AUTH_TOKEN
            );
            
            await Promise.all(contacts.map(contact => {
                return client.messages.create({
                    body: `EMERGENCY ALERT! User needs help at: ${location.latitude},${location.longitude}`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: contact.number
                });
            }));
        }
        
        // Log emergency to file
        const logEntry = {
            timestamp: new Date().toISOString(),
            location,
            contacts
        };
        fs.appendFileSync('emergencies.log', JSON.stringify(logEntry) + '\n');
        
        console.log('Emergency Alert Processed:');
        console.log('Location:', location);
        console.log('Contacts to notify:', contacts);
    
        res.status(200).json({ 
            success: true,
            message: 'Emergency alert processed'
        });
    } catch (error) {
        console.error('Error processing alert:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process emergency alert'
        });
    }
});

// Serve the frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access the app at http://localhost:${PORT}`);
});