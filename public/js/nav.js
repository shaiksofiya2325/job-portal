document.addEventListener('DOMContentLoaded', () => {
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const dashboardLink = document.getElementById('dashboard-link');
    const logoutBtn = document.getElementById('logout-btn');

    // Check user's authentication status
    // --- THIS LINE IS UPDATED ---
    fetch('https://job-portal-7fep.onrender.com/api/auth/me', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include' // ⚠️ IMPORTANT: Send cookies
    })
    .then(res => {
        if (res.ok) {
            // User is logged in
            loginLink.classList.add('nav-hidden');
            registerLink.classList.add('nav-hidden');
            dashboardLink.classList.remove('nav-hidden');
            logoutBtn.classList.remove('nav-hidden');
        } else {
            // User is not logged in
            loginLink.classList.remove('nav-hidden');
            registerLink.classList.remove('nav-hidden');
            dashboardLink.classList.add('nav-hidden');
            logoutBtn.classList.add('nav-hidden');
        }
    })
    .catch(err => {
        console.error('Error checking auth status:', err);
    });

    // Add logout functionality
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // --- THIS LINE IS UPDATED ---
        fetch('https://job-portal-7fep.onrender.com/api/auth/logout', {
            method: 'GET',
            credentials: 'include' // ⚠️ IMPORTANT: Send cookies
        })
        .then(res => {
            if (res.ok) {
                // Logout successful, redirect to homepage
                window.location.href = '/';
            }
        })
        .catch(err => console.error('Logout error:', err));
    });
});