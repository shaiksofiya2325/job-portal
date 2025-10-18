document.addEventListener('DOMContentLoaded', () => {
    const profileContainer = document.getElementById('profile-container');
    
    // Get user ID from the URL (e.g., /profile.html?id=123)
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');

    if (!userId) {
        profileContainer.innerHTML = '<h1>Error: No profile ID specified.</h1>';
        return;
    }

    // Fetch the public profile data
    const fetchProfile = async () => {
        try {
            const res = await fetch(`/api/users/${userId}/profile`);
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Could not load profile.');
            }
            
            const user = await res.json();
            renderProfile(user);

        } catch (err) {
            profileContainer.innerHTML = `<h1>Error: ${err.message}</h1>`;
        }
    };

    // Render the profile data to the page
    const renderProfile = (user) => {
        
        const skillsHTML = user.skills.length > 0
            ? user.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')
            : '<p>No skills listed.</p>';

        profileContainer.innerHTML = `
            <div class="profile-header">
                <h1>${user.name}</h1>
                <p><strong>Contact:</strong> ${user.contact || 'Not provided'}</p>
                <p><strong>Email:</strong> ${user.email}</p>
            </div>

            <div class="profile-section">
                <h3>About</h3>
                <p>${user.bio.replace(/\n/g, '<br>')}</p>
            </div>

            <div class="profile-section">
                <h3>Skills</h3>
                <div class="skills-container">
                    ${skillsHTML}
                </div>
            </div>

            `;
    };

    fetchProfile();
});