document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const errorMessage = document.getElementById('error-message');

    // Handle Login
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMessage.textContent = '';
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                // --- UPDATED URL and added credentials ---
                const res = await fetch('https://job-portal-7fep.onrender.com/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                    credentials: 'include' // ⚠️ IMPORTANT: Send cookies
                });

                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || 'Login failed');
                }
                
                // Login successful
                window.location.href = '/dashboard.html';
            } catch (err) {
                errorMessage.textContent = err.message;
            }
        });
    }

    // Handle Registration
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            errorMessage.textContent = '';
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const role = document.querySelector('input[name="role"]:checked').value;

            try {
                // --- UPDATED URL and added credentials ---
                const res = await fetch('https://job-portal-7fep.onrender.com/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password, role }),
                    credentials: 'include' // ⚠️ IMPORTANT: Send cookies
                });

                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.message || 'Registration failed');
                }
                
                // Registration successful, log them in and redirect
                window.location.href = '/dashboard.html';
            } catch (err) {
                errorMessage.textContent = err.message;
            }
        });
    }
});