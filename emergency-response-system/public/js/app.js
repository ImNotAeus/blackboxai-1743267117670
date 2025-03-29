document.addEventListener('DOMContentLoaded', async function() {
    // Authentication check
    const token = localStorage.getItem('accessToken');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    try {
        // Token verification
        const response = await fetch('/api/verify', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            localStorage.removeItem('accessToken');
            window.location.href = '/login.html';
            return;
        }

        const user = await response.json();
        
        // Admin dashboard link
        if (user.role === 'admin') {
            const adminLink = document.createElement('a');
            adminLink.href = '/admin.html';
            adminLink.className = 'text-blue-500 hover:underline ml-4';
            adminLink.textContent = 'Admin Dashboard';
            document.querySelector('nav').appendChild(adminLink);
        }

        // [Rest of the original app functionality would go here]
    // Check authentication
    const token = localStorage.getItem('accessToken');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }
    try {
        // Verify token
        const response = await fetch('/api/verify', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            localStorage.removeItem('accessToken');
            window.location.href = '/login.html';
            return;
        }
        const user = await response.json();
        
        // Show admin link if user is admin
        if (user.role === 'admin') {
            const adminLink = document.createElement('a');
            adminLink.href = '/admin.html';
            adminLink.className = 'text-blue-500 hover:underline ml-4';
            adminLink.textContent = 'Admin Dashboard';
            document.querySelector('nav').appendChild(adminLink);
        }
        // DOM Elements
        const sosButton = document.getElementById('sosButton');
        const contactsList = document.getElementById('contactsList');
    const addContactBtn = document.getElementById('addContactBtn');
    const locationStatus = document.getElementById('locationStatus');
    const locationText = document.getElementById('locationText');
    // Emergency contacts array
    let emergencyContacts = [
        { name: 'Police', number: '911' },
        { name: 'Ambulance', number: '911' },
        { name: 'Fire Department', number: '911' }
    ];
    // Initialize the app
    function init() {
        renderContacts();
        setupEventListeners();
        checkLocationPermission();
    }
    // Render emergency contacts
    function renderContacts() {
        contactsList.innerHTML = '';
        emergencyContacts.forEach((contact, index) => {
            const contactItem = document.createElement('div');
            contactItem.className = 'contact-item';
            contactItem.innerHTML = `
                <div>
                    <strong>${contact.name}</strong>
                    <div class="text-gray-600">${contact.number}</div>
                </div>
                <div class="contact-actions">
                    <button class="text-blue-500 hover:text-blue-700" onclick="editContact(${index})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-500 hover:text-red-700" onclick="deleteContact(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            contactsList.appendChild(contactItem);
        });
    }
    // Set up event listeners
    function setupEventListeners() {
        sosButton.addEventListener('click', triggerEmergency);
        addContactBtn.addEventListener('click', addNewContact);
    }
    // Check location permission
    function checkLocationPermission() {
        if (navigator.geolocation) {
            locationStatus.className = 'w-3 h-3 rounded-full bg-yellow-400 mr-2';
            locationText.textContent = 'Location access needed';
        } else {
            locationStatus.className = 'w-3 h-3 rounded-full bg-red-500 mr-2';
            locationText.textContent = 'Geolocation not supported';
        }
    }
    // Countdown variables
    let countdownTimer;
    let countdownSeconds = 5;
    // Show countdown
    function startCountdown() {
        const countdownElement = document.getElementById('countdown');
        const countdownContainer = document.getElementById('countdownContainer');
        const cancelButton = document.getElementById('cancelButton');
        
        countdownContainer.classList.remove('hidden');
        sosButton.classList.add('hidden');
        flashElement.style.display = 'block';
        
        countdownElement.textContent = countdownSeconds;
        
        // Play initial beep
        countdownBeep.play();
        
        countdownTimer = setInterval(() => {
            countdownSeconds--;
            countdownElement.textContent = countdownSeconds;
            
            // Play beep for each second
            countdownBeep.currentTime = 0;
            countdownBeep.play();
            
            if (countdownSeconds <= 0) {
                clearInterval(countdownTimer);
                emergencySiren.play();
                triggerEmergency();
            }
        }, 1000);
        
        cancelButton.addEventListener('click', () => {
            clearInterval(countdownTimer);
            countdownContainer.classList.add('hidden');
            sosButton.classList.remove('hidden');
            flashElement.style.display = 'none';
            countdownBeep.pause();
            countdownBeep.currentTime = 0;
            emergencySiren.pause();
            emergencySiren.currentTime = 0;
            countdownSeconds = 5;
        });
    }
    // Trigger emergency protocol
    function triggerEmergency() {
        document.getElementById('countdownContainer').classList.add('hidden');
        sosButton.classList.remove('hidden');
        sosButton.classList.add('active');
        flashElement.style.display = 'block';
        emergencySiren.loop = true;
        emergencySiren.play();
        getLocation()
            .then(location => {
                // Send alert to server
                fetch('/api/alert', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        location: {
                            latitude: location.latitude,
                            longitude: location.longitude
                        },
                        contacts: emergencyContacts
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert(`EMERGENCY ALERT SENT!\nYour location: ${location.latitude}, ${location.longitude}`);
                    } else {
                        alert('Failed to send emergency alert. Please try again.');
                    }
                })
                .catch(error => {
                    console.error('Error sending alert:', error);
                    alert('Failed to send emergency alert. Please try again.');
                });
            })
            .catch(error => {
                console.error('Error getting location:', error);
                alert('EMERGENCY ALERT SENT!\nCould not get precise location');
            });
    }
    // Get current location
    function getLocation() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                position => {
                    locationStatus.className = 'w-3 h-3 rounded-full bg-green-500 mr-2';
                    locationText.textContent = 'Location available';
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                error => {
                    locationStatus.className = 'w-3 h-3 rounded-full bg-red-500 mr-2';
                    locationText.textContent = 'Location blocked';
                    reject(error);
                }
            );
        });
    }
    // Add new contact
    function addNewContact() {
        const name = prompt('Enter contact name:');
        if (!name) return;
        
        const number = prompt('Enter phone number:');
        if (!number) return;
        emergencyContacts.push({ name, number });
        renderContacts();
    }
    // Edit contact
    window.editContact = function(index) {
        const contact = emergencyContacts[index];
        const newName = prompt('Edit name:', contact.name);
        if (!newName) return;
        
        const newNumber = prompt('Edit number:', contact.number);
        if (!newNumber) return;
        emergencyContacts[index] = { name: newName, number: newNumber };
        renderContacts();
    };
    // Delete contact
    window.deleteContact = function(index) {
        if (confirm('Delete this contact?')) {
            emergencyContacts.splice(index, 1);
            renderContacts();
        }
    };
    // Initialize the app
    init();
});
        // This is just the authentication wrapper structure

    } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('accessToken');
        window.location.href = '/login.html';
    }
});