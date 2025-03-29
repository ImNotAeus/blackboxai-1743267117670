document.addEventListener('DOMContentLoaded', async function() {
    // Check admin authentication
    const token = localStorage.getItem('accessToken');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    try {
        // Verify admin privileges
        const response = await fetch('/api/verify', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            localStorage.removeItem('accessToken');
            window.location.href = '/login.html';
            return;
        }

        const user = await response.json();
        if (user.role !== 'admin') {
            window.location.href = '/';
            return;
        }

        // DOM Elements
        const usersTableBody = document.getElementById('usersTableBody');
        const logoutBtn = document.getElementById('logoutBtn');

        // Load users
        async function loadUsers() {
            const response = await fetch('/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const users = await response.json();
            renderUsers(users);
        }

        // Render users table
        function renderUsers(users) {
            usersTableBody.innerHTML = '';
            users.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap">${user.id}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${user.username}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${user.email}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${user.role}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <button class="text-blue-500 hover:text-blue-700 mr-2">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="text-red-500 hover:text-red-700">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                usersTableBody.appendChild(row);
            });
        }

        // Logout handler
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('accessToken');
            window.location.href = '/login.html';
        });

        // Initial load
        loadUsers();

    } catch (error) {
        console.error('Admin error:', error);
        localStorage.removeItem('accessToken');
        window.location.href = '/login.html';
    }
});