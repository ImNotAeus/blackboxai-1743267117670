// Global variables
const locationTrackingIntervals = {};

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

        // DOM Elements and app initialization
        const sosButton = document.getElementById('sosButton');
        const contactsList = document.getElementById('contactsList');
        const addContactBtn = document.getElementById('addContactBtn');
        const locationStatus = document.getElementById('locationStatus');
        const locationText = document.getElementById('locationText');

        // [Rest of the implementation...]
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

        // [All other functions...]
        function renderContacts() {
            contactsList.innerHTML = '';
            emergencyContacts.forEach((contact, index) => {
                const contactItem = document.createElement('div');
                contactItem.className = 'flex justify-between items-center p-2 border-b';
                contactItem.innerHTML = `
                    <div>
                        <strong class="text-gray-800">${contact.name}</strong>
                        <div class="text-gray-600">${contact.number}</div>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="editContact(${index})" class="text-blue-500 hover:text-blue-700">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteContact(${index})" class="text-red-500 hover:text-red-700">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                contactsList.appendChild(contactItem);
            });
        }

        function setupEventListeners() {
            sosButton.addEventListener('click', showEmergencyTypeSelection);
            addContactBtn.addEventListener('click', addNewContact);
            
            document.querySelectorAll('.emergency-type').forEach(button => {
                button.addEventListener('click', function() {
                    const emergencyType = this.dataset.type;
                    triggerEmergency(emergencyType);
                });
            });
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

        // Show emergency type selection
        function showEmergencyTypeSelection() {
            document.getElementById('emergencyTypeSelection').classList.remove('hidden');
            sosButton.classList.add('hidden');
        }

        // Get user emergency profile
        function getUserEmergencyProfile() {
            return {
                name: localStorage.getItem('userName') || 'Unknown',
                bloodType: localStorage.getItem('bloodType') || 'Unknown',
                allergies: localStorage.getItem('allergies') || 'None',
                medications: localStorage.getItem('medications') || 'None'
            };
        }

        // Start continuous location tracking
        function startLocationTracking(initialData) {
            const trackingInterval = setInterval(async () => {
                try {
                    const location = await getLocation();
                    await fetch('/api/alert/update', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            emergencyId: initialData.timestamp,
                            location: {
                                latitude: location.latitude,
                                longitude: location.longitude
                            },
                            timestamp: new Date().toISOString()
                        })
                    });
                } catch (error) {
                    console.error('Location update failed:', error);
                }
            }, 5000); // Update every 5 seconds

            // Store interval ID for cleanup
            locationTrackingIntervals[initialData.timestamp] = trackingInterval;
        }

        // Store alert for offline mode
        async function storeOfflineAlert(emergencyData) {
            try {
                localStorage.setItem(`emergency_${emergencyData.timestamp}`, JSON.stringify(emergencyData));
                console.log('Alert stored offline:', emergencyData);
            } catch (error) {
                console.error('Failed to store offline alert:', error);
            }
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

        // Global contact functions
        window.editContact = function(index) {
            const contact = emergencyContacts[index];
            const newName = prompt('Edit name:', contact.name);
            if (!newName) return;
            
            const newNumber = prompt('Edit number:', contact.number);
            if (!newNumber) return;
            
            emergencyContacts[index] = { name: newName, number: newNumber };
            renderContacts();
        };

        window.deleteContact = function(index) {
            if (confirm('Delete this contact?')) {
                emergencyContacts.splice(index, 1);
                renderContacts();
            }
        };

        // Initialize the app
        init();

    } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('accessToken');
        window.location.href = '/login.html';
    }
});